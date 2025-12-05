const createMasterItemsMap = (masterItemsArr) => {
    const map = new Map();
    for (const masterItem of masterItemsArr) {
        map.set(masterItem.itemId, {
            generalCategory: masterItem.generalCategory.toLowerCase() || "other",
            detailedCategory: masterItem.detailedCategory.toLowerCase() || "other",
        });
    }

    return map;
}

module.exports = {createMasterItemsMap};