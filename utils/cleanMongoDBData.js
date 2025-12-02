const createMasterItemsMap = (masterItemsArr) => {
    const map = new Map();
    for (const masterItem of masterItemsArr) {
        map.set(masterItem.itemId, {
            generalCategory: masterItem.generalCategory || "Other",
            detailedCategory: masterItem.detailedCategory || "Other",
        });
    }

    return map;
}

module.exports = {createMasterItemsMap};