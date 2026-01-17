// create a weapon stats object based on the currently applied gun and attachments
export function createUIWeaponStatsObj(gun){
    const { stats } = gun;
    const { idleSway, hipfire, gunBob } = stats;

    return {
        getStat: function(stat) {
            return this[stat] ?? gun.stats[stat];
        },
        reloadTime: stats.reloadTime / 1000,
        reloadAddTime: stats.reloadAddTime / 1000,
        reloadEmptyTime: stats.reloadEmptyTime / 1000,
        reloadEmptyAddTime: stats.reloadEmptyAddTime / 1000,
        hipfireStandMin: hipfire.min,
        hipfireStandMoveMax: hipfire.moveMax,
        hipfireStandMax: hipfire.max,
        preFireDelay: stats.openBoltDelay + stats.effectiveChargeTime,
        idleSwayWidth: (Math.abs(idleSway.Yaw) + Math.abs(idleSway.ViewYaw)) / 100,
        idleSwayHeight: (Math.abs(idleSway.Pitch) + Math.abs(idleSway.ViewPitch)) / 100,
        gunBobWidth: stats.viewBob + gunBob.yaw,
        gunBobHeight: stats.viewBob + gunBob.pitch,
        qualitative: {
            baseDamageMultiplier: stats.baseDamageMultiplier,
            bodyBTKShiftCount: stats.bodyBTKShiftCount,
            baseDamageProfile: stats.baseDamageProfile,
            hitboxMultipliers: stats.hitboxMultipliers,
        },
    }
}