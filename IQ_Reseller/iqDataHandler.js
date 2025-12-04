const filterRowInventoryData = (rowInventoryData) => {
    return rowInventoryData.filter(inventory => {inventory.inventorycomments})
}

const handleAllItemsData = (allItems, masterItemsMap, processCostsMap, techPerformanceMap, qcPerformanceMap) => {
    console.log("Start Handling Inventories Data");
    const dailyWorkedOnUnits = {};
    const categorySet = new Set(processCostsMap.keys());
    const {techInitSummary, qcInitSummary} = createTechInitSummary(techPerformanceMap);

    const techPerformanceResult = new Map();
    const qcPerformanceResult = new Map();

    for (const item of allItems) {
        const {
            inventorycomments,
            itemid,
            location,
            inventoryid,
            condition,
            PO,
            serialnumber,
        } = item;
        if (!location || !inventorycomments) { continue; }

        // Get category
        const {generalCategory, detailedCategory} = masterItemsMap.get(itemid) || {generalCategory: "Other", detailedCategory: "Other"};
        const category = categorySet.has(generalCategory.toLowerCase()) ? generalCategory :
            categorySet.has(detailedCategory.toLowerCase()) ? detailedCategory : "Other";

        // Calculate the tech performance
        calculateTestingQCAmounts(
            category, inventorycomments, techPerformanceResult, qcPerformanceResult, techInitSummary,
            qcInitSummary, dailyWorkedOnUnits, processCostsMap, inventoryid, location, condition,
            PO, serialnumber, itemid
        );

    }

    // calculate the performance
    for (const testingTechName of techPerformanceResult.keys()) {
        const techTestedObj = techPerformanceResult.get(testingTechName);
        let totalAmount = 0;
        let performance = 0;
        for (const attr of Object.keys(techTestedObj)) {
            if (attr === "Position" || attr === "Name") { continue; }
            performance += techTestedObj[attr] / techPerformanceMap.get(attr);
            totalAmount += techTestedObj[attr];
        }
        techTestedObj["Total Tested"] = totalAmount;
        techTestedObj["Performance"] = performance;
        techPerformanceResult.set(testingTechName, techTestedObj);
    }

    for (const qcTechName of qcPerformanceResult.keys()) {
        const qcQcedObj = qcPerformanceResult.get(qcTechName);
        let totalAmount = 0;
        let performance = 0;
        for (const attr of Object.keys(qcQcedObj)) {
            if (attr === "Position" || attr === "Name") { continue; }
            performance += qcQcedObj[attr] / qcPerformanceMap.get(attr);
            totalAmount += qcQcedObj[attr];
        }
        qcQcedObj["Total QCed"] = totalAmount;
        qcQcedObj["Performance"] = performance;
        qcPerformanceResult.set(qcTechName, qcQcedObj);
    }

    return [
        dailyWorkedOnUnits,
        techPerformanceResult,
        qcPerformanceResult,
    ];
}

const createTechInitSummary = (techPerformanceMap) => {
    // get initial tech summary
    const techInitSummary = {
        'Position': '',
        'Name': '',
    }
    const qcInitSummary = {
        'Position': '',
        'Name': '',
    }
    for (const key of techPerformanceMap.keys()) {
        techInitSummary[key] = 0;
        qcInitSummary[key] = 0;
    }

    return {techInitSummary, qcInitSummary}
}

const isSameDay = (testingDate, today) =>
    testingDate.getFullYear() === today.getFullYear() &&
    testingDate.getMonth() === today.getMonth() &&
    testingDate.getDate() === today.getDate();

const calculateTestingQCAmounts = (
    category,
    inventoryComments,
    techPerformanceResult,
    qcPerformanceResult,
    techInitSummary,
    qcInitSummary,
    dailyWorkedOnUnits,
    processCostsMap,
    inventoryId,
    location,
    condition,
    PO,
    serialNumber,
    itemId,
    ) => {
    const today = new Date();

    // Match all TESTING DONE entries
    const testingMatches = [...inventoryComments.matchAll(/TESTING DONE(?:.*?-)?\s*([A-Z]{1,4}):\s*(.+)/gi)];
    for (const match of testingMatches) {
        const techName = match[1];
        const date = new Date(match[2]);

        if (isSameDay(date, today)) {
            if (!techPerformanceResult.has(techName)) { techPerformanceResult.set(techName, techInitSummary); }

            const techDailyData = {...techPerformanceResult.get(techName)}
            techDailyData[category] += 1;
            techPerformanceResult.set(techName, techDailyData);

            // calculate process cost
            try {
                const [, , processCost] = calculateFinalCost(category, inventoryComments, processCostsMap, location);
                dailyWorkedOnUnits[inventoryId] = {
                    inventoryId,
                    PO,
                    serialNumber,
                    itemId,
                    condition,
                    processCost,
                    location,
                    category,
                    inventoryComments,
                    progress: "",
                    isFinalCost: false
                }
            } catch (e) {
                console.log(inventoryId);
            }

        }
    }

    // Match all QC DONE entries
    const qcMatches = [...inventoryComments.matchAll(/QC DONE(?:.*?-)?\s*([A-Z]{1,4}):\s*(.+)/gi)];
    for (const match of qcMatches) {
        const techName = match[1];
        const date = new Date(match[2]);

        if (isSameDay(date, today)) {
            if (!qcPerformanceResult.has(techName)) { qcPerformanceResult.set(techName, qcInitSummary); }

            const qcDailyData = {...qcPerformanceResult.get(techName)};
            qcDailyData[category] += 1;
            qcPerformanceResult.set(techName, qcDailyData);

            // calculate process cost
            const [isDecal, isRepair, processCost] = calculateFinalCost(category, inventoryComments, processCostsMap, location);
            dailyWorkedOnUnits[inventoryId] = {
                inventoryId,
                PO,
                serialNumber,
                itemId,
                condition,
                processCost,
                location,
                category,
                inventoryComments,
                progress: `Receiving => Testing => ${isRepair ? "Repair =>" : ''} QC => ${isDecal ? "Decal =>" : ''} cleaning`,
                isFinalCost: true
            }
        }
    }
}

const calculateFinalCost = (category, inventoryComments, processCostsMap, location) => {
    if (location === "RTV") {return [false, false, 0];}

    // calculate cost
    const processCostsObj = processCostsMap.get(category);
    const repairCost = processCostsObj.repairCost;
    const decalCost = processCostsObj.decalCost;
    let totalPrice = Object.values(processCostsObj).reduce((acc, price) => acc + price, 0);

    const isDecal = /decal/i.test(inventoryComments)
    const isRepair = /repair/i.test(inventoryComments)

    // calculate the final cost.
    totalPrice = !isRepair ? totalPrice - repairCost : totalPrice;
    totalPrice = !isDecal ? totalPrice - decalCost : totalPrice;
    return [isDecal, isRepair, totalPrice];
}

module.exports = {
    handleAllItemsData,
}