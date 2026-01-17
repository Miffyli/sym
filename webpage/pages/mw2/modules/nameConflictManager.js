class NameConflictManager {
    constructor(weaponData) {
        const temp = Object.values(weaponData).reduce((acc, gunData) => {
            const { BaseWeaponName } = gunData;
            acc[BaseWeaponName] = acc[BaseWeaponName] || [];
            acc[BaseWeaponName].push(gunData);
            return acc;
        }, {})
        const entries = Object.entries(temp).filter(([gunName, gunDuplicatesArr]) => { return gunDuplicatesArr.length > 1 });
        this.nameConflicts = Object.fromEntries(entries);
    }
    filter(weaponName, categories, games) {
        const res = this.nameConflicts[weaponName]?.filter(({ UIWeaponCategory, SourceGame }) => {
            return categories.includes(UIWeaponCategory) && games.includes(SourceGame);
        }) || [];
        return res.length < 2 ? [] : res;
    }
}

export default NameConflictManager;