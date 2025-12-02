const createMasterItemsMap = (masterItemsArr) => {
    const map = new Map();
    for (const masterItem of masterItemsArr) {
        map.set(masterItem.itemId, {
            generalCategory: masterItem.generalCategory,
            detailedCategory: masterItem.detailedCategory,
        });
    }

    return map;
}

module.exports = {createMasterItemsMap};