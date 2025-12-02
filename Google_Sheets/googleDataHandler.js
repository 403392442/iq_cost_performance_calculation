const cleanProcessCostData = (table) => {
    const costMap = new Map();
    const typeSet = new Set();

    for (const row of table) {
        const [
            type,
            receivingCost,
            testingCost,
            qcCost,
            decalCost,
            cleaningCost,
            accessoryCost,
            boxCost,
            repairCost,
            shippingCost
        ] = row;

        costMap.set(type.trim(), {
            "receivingCost": parseFloat(receivingCost) || 0,
            "testingCost": parseFloat(testingCost) || 0,
            "qcCost": parseFloat(qcCost) || 0,
            "decalCost": parseFloat(decalCost) || 0,
            "cleaningCost": parseFloat(cleaningCost) || 0,
            "accessoryCost": parseFloat(accessoryCost) || 0,
            "boxCost": parseFloat(boxCost) || 0,
            "repairCost": parseFloat(repairCost) || 0,
            "shippingCost": parseFloat(shippingCost) || 0
        });
        typeSet.add(type.trim());
    }
    return [costMap, typeSet];
}

const cleanPerformanceData = (techPerformanceData, qcPerformanceData, typeSet) => {
    const techPerformanceMap = new Map();
    const qcPerformanceMap = new Map();
    const typeSetDuplication = new Set([...typeSet]);

    if (techPerformanceData[0].length !== qcPerformanceData[0].length) {
        console.log(`The length of tech performance data doesn't equal to the qc performance data.`);
        process.exit(2)
    }

    for (let i = 0; i < techPerformanceData[0].length; i++) {
        techPerformanceMap.set(techPerformanceData[0][i].trim(), parseFloat(techPerformanceData[1][i]));
        qcPerformanceMap.set(qcPerformanceData[0][i].trim(), parseFloat(qcPerformanceData[1][i]));

        typeSet.delete(techPerformanceData[0][i]);
        typeSetDuplication.delete(techPerformanceData[0][i]);
    }

    if (typeSet.size > 0 || typeSetDuplication.size > 0) {
        console.error(`Check the categories in the performance table, make sure the consistency of categories in the performance table and process cost table are the same.`);
        process.exit(2);
    }

    return [techPerformanceMap, qcPerformanceMap];
}


module.exports = {
    cleanProcessCostData,
    cleanPerformanceData,
}