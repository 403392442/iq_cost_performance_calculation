const { GOOGLE_SHEET_PERFORMANCE_TABLE_COLUMN_NAME_ARRAY } = require('../utils/constants');

const cleanUnfinishedPOData = (poData) => {
    const tempSet = new Set();
    for (const poNumber of poData.flat()) {
        tempSet.add(poNumber.trim());
    }
    return [...tempSet];
}

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

        costMap.set(type, {
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

        typeSet.add(type);
    }
    return [costMap, typeSet];
}

const cleanPerformanceData = (techPerformanceData, qcPerformanceData) => {
    const techPerformanceMap = new Map();
    const qcPerformanceMap = new Map();

    for (let i = 0; i < techPerformanceData.length; i++) {
        const techGoal = techPerformanceData[i];
        const qcGoal = qcPerformanceData[i];
        /**
         * TODO
         * get the column names from the axios returned data
         * now the program is using the static data in the constants.js
         */
        const type = GOOGLE_SHEET_PERFORMANCE_TABLE_COLUMN_NAME_ARRAY[i];

        if (!techGoal || !qcGoal) {
            console.error(`tech performance or qc performance table has empty field in ${type} column`);
        }

        techPerformanceMap.set(type, techGoal || 1);
        qcPerformanceMap.set(type, qcGoal || 1);
    }

    return [techPerformanceMap, qcPerformanceMap];
}


module.exports = {
    cleanUnfinishedPOData,
    cleanProcessCostData,
    cleanPerformanceData,
}