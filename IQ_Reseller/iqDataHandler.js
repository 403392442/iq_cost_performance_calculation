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
            poid,
            serialnumber,
        } = item;
        if (!location || !inventorycomments) { continue; }

        // Get category
        const {generalCategory, detailedCategory} = masterItemsMap.get(itemid) || {generalCategory: "other", detailedCategory: "other"};
        const category = categorySet.has(generalCategory.toLowerCase()) ? generalCategory :
            categorySet.has(detailedCategory.toLowerCase()) ? detailedCategory : "other";

        // Calculate the tech performance
        calculateTestingQCAmounts(
            category, inventorycomments, techPerformanceResult, qcPerformanceResult, techInitSummary,
            qcInitSummary, dailyWorkedOnUnits, processCostsMap, inventoryid, location, condition,
            poid, serialnumber, itemid
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

    // const techEscapedKeyword = "TESTING DONE".replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // const techRegex = new RegExp(
    //     techEscapedKeyword +
    //     '\\s*-?\\s*' +
    //     '([A-Za-z0-9]+)' +
    //     '\\s*:\\s*' +
    //     '([^\\n]+)',
    //     'gi'
    // );
    //
    // // Match all TESTING DONE entries
    // const testingMatches = inventoryComments.match(techRegex);
    // if (testingMatches) {
    //     for (const match of testingMatches) {
    //         const techName = match[1].trim();
    //         const date = new Date(match[2].trim());
    //
    //         if (isSameDay(date, today)) {
    //             if (!techPerformanceResult.has(techName)) { techPerformanceResult.set(techName, techInitSummary); }
    //
    //             const techDailyData = {...techPerformanceResult.get(techName)}
    //             techDailyData[category] += 1;
    //             techPerformanceResult.set(techName, techDailyData);
    //
    //             const [, , processCost] = calculateFinalCost(category, inventoryComments, processCostsMap, location);
    //             dailyWorkedOnUnits[inventoryId] = {
    //                 inventoryId,
    //                 PO,
    //                 serialNumber,
    //                 itemId,
    //                 condition,
    //                 processCost,
    //                 location,
    //                 category,
    //                 inventoryComments,
    //                 progress: "",
    //                 isFinalCost: false
    //             }
    //
    //         }
    //     }
    // }
    //
    //
    // const qcEscapedKeyword = "TESTING DONE".replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // const qcRegex = new RegExp(
    //     qcEscapedKeyword +
    //     '\\s*-?\\s*' +
    //     '([A-Za-z0-9]+)' +
    //     '\\s*:\\s*' +
    //     '([^\\n]+)',
    //     'gi'
    // );
    //
    // // Match all QC DONE entries
    // const qcMatches = inventoryComments.match(qcRegex);
    // if (qcMatches) {
    //     for (const match of qcMatches) {
    //         const techName = match[1];
    //         const date = new Date(match[2]);
    //
    //         if (isSameDay(date, today)) {
    //             if (!qcPerformanceResult.has(techName)) { qcPerformanceResult.set(techName, qcInitSummary); }
    //
    //             const qcDailyData = {...qcPerformanceResult.get(techName)};
    //             qcDailyData[category] += 1;
    //             qcPerformanceResult.set(techName, qcDailyData);
    //
    //             // calculate process cost
    //             const [isDecal, isRepair, processCost] = calculateFinalCost(category, inventoryComments, processCostsMap, location);
    //             dailyWorkedOnUnits[inventoryId] = {
    //                 inventoryId,
    //                 PO,
    //                 serialNumber,
    //                 itemId,
    //                 condition,
    //                 processCost,
    //                 location,
    //                 category,
    //                 inventoryComments,
    //                 progress: `Receiving => Testing => ${isRepair ? "Repair =>" : ''} QC => ${isDecal ? "Decal =>" : ''} Cleaning`,
    //                 isFinalCost: true
    //             }
    //         }
    //     }
    // }

    const testingEvents = extractEvents(inventoryComments, "TESTING DONE");

    for (const ev of testingEvents) {
        const { techName, date } = ev;

        if (isSameDay(date, today)) {
            if (!techPerformanceResult.has(techName)) {
                techPerformanceResult.set(techName, { ...techInitSummary });
            }

            const techDailyData = { ...techPerformanceResult.get(techName) };
            techDailyData[category] += 1;
            techPerformanceResult.set(techName, techDailyData);

            const [, , processCost] = calculateFinalCost(
                category,
                inventoryComments,
                processCostsMap,
                location
            );

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
            };
        }
    }

// QC DONE
    const qcEvents = extractEvents(inventoryComments, "QC DONE");

    for (const ev of qcEvents) {
        const {techName, date} = ev;

        if (isSameDay(date, today)) {
            if (!qcPerformanceResult.has(techName)) {
                qcPerformanceResult.set(techName, {...qcInitSummary});
            }

            const qcDailyData = {...qcPerformanceResult.get(techName)};
            qcDailyData[category] += 1;
            qcPerformanceResult.set(techName, qcDailyData);

            const [isDecal, isRepair, processCost] = calculateFinalCost(
                category,
                inventoryComments,
                processCostsMap,
                location
            );

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
                progress: `Receiving => Testing => ${isRepair ? "Repair => " : ""} QC => ${
                    isDecal ? "Decal => " : ""
                } Cleaning`,
                isFinalCost: true
            };
        }
    }
}

const extractEvents = (comments = "", keyword) => {
    const res = [];
    if (!comments || !keyword) return res;

    let searchIndex = 0;

    while (searchIndex < comments.length) {
        const keywordIndex = comments.indexOf(keyword, searchIndex);

        // if no more keyword, stop the loop
        if (keywordIndex === -1) break;

        // pointer just after the keyword
        let ptr = keywordIndex + keyword.length;

        // skip spaces/tabs
        while (ptr < comments.length && (comments[ptr] === " " || comments[ptr] === "\t")) {
            ptr++;
        }

        // optional "-" then spaces
        if (comments[ptr] === "-") {
            ptr++;
            while (ptr < comments.length && (comments[ptr] === " " || comments[ptr] === "\t")) {
                ptr++;
            }
        }

        // find colon after tech
        const colonIndex = comments.indexOf(":", ptr);
        if (colonIndex === -1) {
            // no colon => invalid pattern, move on to avoid infinite loop
            searchIndex = keywordIndex + keyword.length;
            continue;
        }

        const techName = comments.slice(ptr, colonIndex).trim();

        // find end of line
        let lineEnd = comments.indexOf("\n", colonIndex + 1);
        if (lineEnd === -1) lineEnd = comments.length;

        let rawDate = comments.slice(colonIndex + 1, lineEnd).trim();

        // trim after GMT ... ) so Date can parse reliably
        const gmtIndex = rawDate.indexOf("GMT");
        if (gmtIndex !== -1) {
            const closeParenIndex = rawDate.indexOf(")", gmtIndex);
            if (closeParenIndex !== -1) {
                rawDate = rawDate.slice(0, closeParenIndex + 1);
            }
        }

        const dateObj = new Date(rawDate);

        res.push({
            keyword,
            techName,
            date: dateObj,
            rawDate,
        });

        // IMPORTANT: move searchIndex forward so we don't re-find the same keyword
        // advancing to lineEnd is usually safest:
        searchIndex = lineEnd;
    }

    return res;
};

const calculateFinalCost = (category, inventoryComments, processCostsMap, location) => {
    if (location.trim() === "RTV") {return [false, false, 0];}

    // calculate cost
    const processCostsObj = processCostsMap.get(category.toLowerCase());
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