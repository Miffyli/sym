class wzGun {
    static #hp = 300;
    static #maxHp = 300;
    static #bodyLocationChances = {
        "Head": 5,
        "Neck": 7,
        "TorsoUpper": 28,
        "TorsoLower": 20,
        "RightArmUpper": 8,
        "LeftArmUpper": 8,
        "RightArmLower": 2,
        "LeftArmLower": 2,
        "RightLegUpper": 7,
        "LeftLegUpper": 7,
        "RightLegLower": 3,
        "LeftLegLower": 3
    }
    static #missChance = 0;
    //static #probabilityLoadedCallbackFn = wzLoadProbabilityCharts;

    #altFire = false;
    #chargeAmount = 1;

    #gunId;
    #blueprint;
    #selectedAttachmentIdArray;
    #requiredLevel;
    #baseWeaponBaseName;
    #activeWeaponBaseName;
    #baseWeaponBase;
    #activeWeaponBase;
    #conflictingAttachments;
    #fullAttachmentIdArray;

    #primaryConstantStats;
    #altConstantStats;

    #refreshTracker = {};
    #lastBodyLocationChances;
    #lastMissChance;

    #variableStatsCache;
    #rangeBreakpointsCache;
    #hitboxInfosCache = {};
    #rangeSelectorCache = [[0, "0m+"]];
    #graphsCache;
    #probabilityGraphsCache;

    constructor(gunId, attachmentIdArray, blueprint = false, rl = false) {
        this.#gunId = gunId;
        this.#blueprint = (("BluePrints" in WarzoneData[this.#gunId]) && (blueprint in WarzoneData[this.#gunId].BluePrints)) ? blueprint : false;
        this.#baseWeaponBaseName = WarzoneData[this.#gunId].BaseWeapon
        this.#activeWeaponBaseName = WarzoneData[this.#gunId].BluePrints?.[this.#blueprint]?.weaponBase ?? this.#baseWeaponBaseName;
        this.#baseWeaponBase = WarzoneData[this.#gunId].WeaponBases[this.#baseWeaponBaseName];
        this.#activeWeaponBase = WarzoneData[this.#gunId].WeaponBases[this.#activeWeaponBaseName];
        this.#selectedAttachmentIdArray = attachmentIdArray.filter(attachmentId => attachmentId in this.#baseWeaponBase.SelectableAttachments).sort();
        this.#requiredLevel = this.#selectedAttachmentIdArray.reduce((prev, curr) => Math.max(prev, this.#baseWeaponBase.SelectableAttachments[curr].UnlockLevel), 1);
        this.#conflictingAttachments = 
            this.#selectedAttachmentIdArray.flatMap(attachmentID => this.#baseWeaponBase.SelectableAttachments[attachmentID].attachmentConflicts)
            .concat(this.#selectedAttachmentIdArray.flatMap(attachmentID => this.#baseWeaponBase.SelectableAttachments[attachmentID].alsoEquips?.attachmentConflicts))
            .filter(n => n);
        this.#fullAttachmentIdArray = 
            Object.entries(this.#baseWeaponBase.DefaultAttachments)
            .filter(defaultAttachment => !this.#conflictingAttachments.includes(defaultAttachment[0]))
            .filter(defaultAttachment => (defaultAttachment[1].attachmentConflicts?.filter(conflict => this.#selectedAttachmentIdArray.includes(conflict)).length ?? 0) < 1)
            .filter(defaultAttachment => this.#selectedAttachmentIdArray.findIndex(selectedId => this.#baseWeaponBase.SelectableAttachments[selectedId].Slot == defaultAttachment[1].Slot) == -1)
            .map(defaultAttachment => defaultAttachment[0])
            .concat(this.#selectedAttachmentIdArray);
        this.#primaryConstantStats = this.#compileConstantStats();
        this.#altConstantStats = this.#compileConstantStats(true);
    }

    static setHPValues(hp = -1, maxHp = -1) {
        const intHp = parseInt(hp);
        const intMaxHp = parseInt(maxHp);
        wzGun.#hp = intHp != -1 ? intHp : wzGun.#hp;
        wzGun.#maxHp = intMaxHp != -1 ? intMaxHp : wzGun.#maxHp;
    }

    static setMissChance(chance) {
        chance = Math.min(chance, 0.75);
        chance = Math.max(chance, 0);
        wzGun.#missChance = chance;
    }

    static get missChance() {
        return wzGun.#missChance;
    }

    static setBodyLocationChances(bodyLocationChances) {
        for (const location of Object.keys(wzGun.#bodyLocationChances)) {
            wzGun.#bodyLocationChances[location] = bodyLocationChances[location];
        }
    }

    static get bodyLocationChances() {
        return { ...wzGun.#bodyLocationChances };
    }

    setFireMode(altFire) {
        this.#altFire = Boolean(altFire);
    }

    set chargeAmount(chargeAmount) {
        this.#chargeAmount = Math.max(Math.min(chargeAmount, 1), 0);
    }

    get chargeAmount() {
        return this.#chargeAmount;
    }

    get gunId() {
        return this.#gunId;
    }
    get blueprint() {
        return this.#blueprint;
    }
    get selectedAttachments() {
        return this.#selectedAttachmentIdArray.slice();
    }
    get requiredLevel() {
        return this.#requiredLevel;
    }
    get conflictingAttachments() {
        return this.#conflictingAttachments.filter(attachmentId => attachmentId in this.#baseWeaponBase.SelectableAttachments);
    }
    get stats() {
        const baseStats = this.#altFire ? this.#altConstantStats : this.#primaryConstantStats;
        return { ...baseStats, ...this.#getVariableStats() };
    }

    #needToRefresh = function(type) {
        return this.#refreshTracker[type]?.lastHp !== wzGun.#hp || this.#refreshTracker[type]?.lastMaxHp !== wzGun.#maxHp || this.#refreshTracker[type]?.lastChargeAmount !== this.#chargeAmount || this.#refreshTracker[type]?.lastAltFire !== this.#altFire;
    }

    #markRefreshed = function(type) {
        this.#refreshTracker[type] ??= {};
        this.#refreshTracker[type].lastHp = wzGun.#hp;
        this.#refreshTracker[type].lastMaxHp = wzGun.#maxHp;
        this.#refreshTracker[type].lastChargeAmount = this.#chargeAmount;
        this.#refreshTracker[type].lastAltFire = this.#altFire;
    }

    get rangeBreakpoints() {
        if (this.#needToRefresh("hitboxInfos")) {
            this.#generateHitboxInfos(wzGun.#hp, wzGun.#maxHp, this.#altFire);
            this.#markRefreshed("hitboxInfos");
        }
        return this.#rangeBreakpointsCache.slice();
    }
    get hitboxInfos() {
        if (this.#needToRefresh("hitboxInfos")) {
            this.#generateHitboxInfos(wzGun.#hp, wzGun.#maxHp, this.#altFire);
            this.#markRefreshed("hitboxInfos");
        }
        return JSON.parse(JSON.stringify(this.#hitboxInfosCache));
    }
    get rangeSelector() {
        if (this.#needToRefresh("baseUI")) {
            this.#generateBaseUIData(this.#altFire);
            this.#markRefreshed("baseUI");
        }
        return JSON.parse(JSON.stringify(this.#rangeSelectorCache));
    }
    get graphs() {
        if (this.#needToRefresh("baseUI")) {
            this.#generateBaseUIData(this.#altFire);
            this.#markRefreshed("baseUI");
        }
        return JSON.parse(JSON.stringify(this.#graphsCache));
    }

    get probabilityGraphs() {
        const locationChancesString = JSON.stringify(wzGun.#bodyLocationChances);
        if (this.#needToRefresh("probability") || !this.#probabilityGraphsCache || this.#lastMissChance !== wzGun.#missChance || this.#lastBodyLocationChances !== locationChancesString) {
            this.#probabilityGraphsCache = false;
            this.#generateProbabilityData();
            this.#markRefreshed("probability");
            this.#lastMissChance = wzGun.#missChance;
            this.#lastBodyLocationChances = locationChancesString;
        }
        return JSON.parse(JSON.stringify(this.#probabilityGraphsCache));
    }

    indexForRange(rangeInches) {
        const firstIndexExceedingRange = this.rangeBreakpoints.findIndex((value) => {
            return value > rangeInches;
        });
        return firstIndexExceedingRange == -1 ? this.rangeBreakpoints.length - 1 : firstIndexExceedingRange - 1;
    }

    //private functions have poor compatibility, but private fields storing anonymous functions work
    #compileConstantStats = function(alt = false) {
        const allAttachments = Object.assign({}, this.#baseWeaponBase.DefaultAttachments, this.#baseWeaponBase.SelectableAttachments, this.#activeWeaponBase.DefaultAttachments, this.#activeWeaponBase.SelectableAttachments);
        const activeAttachmentIds = this.#fullAttachmentIdArray;
        const activeAttachmentNames = Object.entries(allAttachments).filter(([key, value]) => activeAttachmentIds.includes(key)).map(([key, attachment]) => attachment.name);
        const weaponBaseStats = ("Stats" in this.#activeWeaponBase) ? this.#activeWeaponBase.Stats : this.#baseWeaponBase.Stats;
        const stateTimers = compileStateTimers(this.#activeWeaponBaseName, this.#activeWeaponBase);
        const modifiers = compileModifiers();
        const baseStatReturn = {};
        baseStatReturn.perks = {
            gungHo: hasSpecialtyMod("specialty_sprintfire"),
            quick: hasSpecialtyMod("specialty_quick")
        };
        baseStatReturn.weaponClass = overrideMod("WeaponClass");
        baseStatReturn.fireType = overrideMod("FireType");
        baseStatReturn.isAkimbo = overrideMod("Akimbo");
        baseStatReturn.baseMovementSpeed = overrideMod("MovementSpeed");
        baseStatReturn.baseADSMovementSpeed = overrideMod("ADSMovementSpeed");
        baseStatReturn.fireDelay = function () {
            const baseFireDelay = baseStatReturn.isAkimbo ? overrideMod("AkimboFireDelay") : overrideMod("FireDelay");
            return Math.round(baseFireDelay * addMod("FireDelayMultiplier"));
        }();
        baseStatReturn.burstDelay = function () {
            const finalBurstDelay = baseStatReturn.fireType != "BURSTFIRE" ? 0 : overrideMod("BurstDelay") * addMod("BurstDelayMultiplier");
            return Math.round(finalBurstDelay);
        }();
        baseStatReturn.burstCount = overrideMod("BurstCount");
        baseStatReturn.pelletCount = baseStatReturn.weaponClass == "SPREAD" ? overrideMod("PelletCount") : 1;
        baseStatReturn.effectivePelletCount = function () {
            const nativePelletCount = baseStatReturn.pelletCount;
            const maxDamagingPelletCount = overrideMod("MaxDamagingPelletCount");
            return maxDamagingPelletCount == 0 ? nativePelletCount : Math.min(maxDamagingPelletCount, nativePelletCount);
        }();
        baseStatReturn.openBoltDelay = stateTimers.OpenBoltDelay;
        baseStatReturn.chargeType = overrideMod("ChargeType");
        baseStatReturn.baseChargeTime = (baseStatReturn.chargeType == "NONE") ? 0 : Math.round(overrideMod("ChargeTime") * 1000);
        baseStatReturn.chargeCooldown = (baseStatReturn.chargeType == "NONE") ? 0 : Math.round(overrideMod("ChargeCooldown") * 1000);
        baseStatReturn.chargeDamageMultiplier = overrideMod("ChargeDamageMultiplier");
        baseStatReturn.rechamberTime = weaponBaseStats.MustRechamber ? stateTimers.RechamberTime : 0;
        baseStatReturn.aimDownSightTime = Math.round(overrideMod("ADSViewInTime", false, 1000) / addMod("ADSSpeedMultiplier"));
        baseStatReturn.magazineSize = Math.trunc(overrideMod("MagSize") * addMod("MagazineSizeMultiplier"));
        baseStatReturn.damageRangeMultiplier = addMod("DamageRangeMultiplier");
        baseStatReturn.baseDamageMultiplier = addMod("DamageMultiplier");
        baseStatReturn.ballistics = function () {
            const ballistics = JSON.parse(JSON.stringify(overrideMod("Ballistics")));
            const velocityMultiplier = multiMod("BulletVelocityMultiplier");
            if (!ballistics.SimulateTrajectoryBool) {
                ballistics.MuzzleVelocity = -1;
                return ballistics;
            }
            ballistics.MuzzleVelocity *= velocityMultiplier;
            ballistics.BulletDisplacementTable = ballistics.BulletDisplacementTable.map(x => x * velocityMultiplier);
            return ballistics;
        }();
        baseStatReturn.muzzleVelocity = baseStatReturn.ballistics.MuzzleVelocity;
        baseStatReturn.maxNumberOfDamageRanges = function () {
            const specialNumberOfRanges = overrideMod("SpecialDamageRangeCount");
            if (specialNumberOfRanges != -1) {
                return specialNumberOfRanges;
            }
            const weaponClass = baseStatReturn.weaponClass;
            switch (weaponClass) {
                case "RIFLE":
                case "MG":
                case "PISTOL":
                    return 2;
                case "SMG":
                    return 3;
            }
            return -1;
        }();
        baseStatReturn.baseDamageProfile = JSON.parse(JSON.stringify(overrideMod("Damage"))); //[[Range1Start, Damage1], [R2S, D2], ...]
        baseStatReturn.isLinearDamage = baseStatReturn.baseDamageProfile.length >= 3 && baseStatReturn.baseDamageProfile[baseStatReturn.baseDamageProfile.length - 2][1] == 0;
        baseStatReturn.weaponDamage = function () {
            //Returns array in format of [[StartRange1, Damage1, LastDamageBool], ...]
            // Last damage bool is the last damage range in
            const damage = JSON.parse(JSON.stringify(baseStatReturn.baseDamageProfile));
            const damageRangeMultiplier = baseStatReturn.damageRangeMultiplier;
            const baseDamageMultiplier = baseStatReturn.baseDamageMultiplier;
            const isLinear = baseStatReturn.isLinearDamage;
            const maxNumberOfDamageRanges = baseStatReturn.maxNumberOfDamageRanges;

            if (isLinear && maxNumberOfDamageRanges != -1) {
                if (damage.length > maxNumberOfDamageRanges + 1) {
                    if (maxNumberOfDamageRanges == 1) {
                        damage.length = 1;
                    } else {
                        while (damage.length > maxNumberOfDamageRanges + 1) {
                            damage.splice(damage.length - 3, 1);
                        }
                    }
                }
            }

            const lastDamageIndex = isLinear ? -1 : maxNumberOfDamageRanges - 1;

            damage.forEach((value, index) => {
                const isLastDamage = (index == lastDamageIndex);
                damage[index] = [value[0] * damageRangeMultiplier, Math.round(value[1] * baseDamageMultiplier), isLastDamage];
            });

            if (isLinear && maxNumberOfDamageRanges != 1) {
                const startingDamage = damage[damage.length - 3][1];
                const endingDamage = damage[damage.length - 1][1];
                const damageDiff = startingDamage - endingDamage;
                const startingRange = damage[damage.length - 2][0];
                const endingRange = damage[damage.length - 1][0];
                const rangeDiff = endingRange - startingRange;
                damage.splice(damage.length - 2);
                for (var i = 0; i < damageDiff; i++) {
                    const fraction = i / damageDiff;
                    const range = startingRange + fraction * rangeDiff;
                    damage.push([range, startingDamage - 1 - i, false])
                }
            }

            return damage;
        }();
        baseStatReturn.hitboxMultipliers = function () {
            const multipliers = { ...overrideMod("DamageMultipliers") };
            const multiplierMultis = multiplyDeepMod("DamageMultiplierMultipliers");
            for (const [key, value] of Object.entries(multiplierMultis)) {
                multipliers[key] *= value;
            }
            return multipliers;
        }();
        baseStatReturn.bodyBTKShiftCount = totalMod("BTKShift");
        baseStatReturn.scopeMagnification = overrideMod("ScopeMagnification") || 1;
        baseStatReturn.idleSway = function() {
            const idleSwayMultiplier = Math.max(addMod("IdleSwaySizeMultiplier"), 0);
            return multiplyProperties(overrideMod("MacroIdleSway"), idleSwayMultiplier, "Speed");
        }();
        baseStatReturn.idleJitter = function() {
            const idleSwayMultiplier = Math.max(addMod("IdleSwaySizeMultiplier"), 0);
            return multiplyProperties(overrideMod("MicroIdleSway"), idleSwayMultiplier, "Speed");
        }();
        baseStatReturn.gunBob = function () {
            const base = overrideMod("ADSBob") * addMod("GunBobSizeMultiplier");;
            const pitchmulti = overrideMod("GunbobPitch") * addMod("GunBobPitchMultiplier");
            const yawmulti = overrideMod("GunbobYaw");
            return {
                pitch: base * pitchmulti,
                yaw: base * yawmulti
            };
        }();
        baseStatReturn.viewBob = overrideMod("ADSBob") * overrideMod("ViewBobADS") * addMod("ViewBobADSMultiplier");
        baseStatReturn.sprintToFire = Math.round(stateTimers.SprintOutTime * (addMod("SprintOutTimeMultiplier") + weaponBaseStats.SprintOutTimeMultiplier - 1));
        baseStatReturn.tacSprintToFire = Math.round(stateTimers.SuperSprintOutTime * (addMod("SprintOutTimeMultiplier") + weaponBaseStats.SprintOutTimeMultiplier - 1));
        baseStatReturn.reloadTime = function () {
            const sohBaseReloadTime = stateTimers.ReloadQuickTime ?? stateTimers.ReloadTime;
            const baseReloadTime = hasSpecialtyMod("specialty_fastreload") ? sohBaseReloadTime * 0.85 : stateTimers.ReloadTime;
            return Math.round(baseReloadTime * addMod("ReloadTimeMultiplier"));
        }();
        baseStatReturn.reloadEmptyTime = function () {
            const discard = hasSpecialtyMod("specialty_fastreload_empty");
            const sohBaseReloadTime = stateTimers.ReloadQuickEmptyTime ?? stateTimers.ReloadEmptyTime;
            const baseReloadTime = (hasSpecialtyMod("specialty_fastreload") || discard) ? sohBaseReloadTime * 0.85 : stateTimers.ReloadEmptyTime;
            const finalReloadTime = baseReloadTime * addMod("ReloadTimeMultiplier") * (discard ? 0.8 : 1);
            return isNaN(finalReloadTime) ? baseStatReturn.reloadTime : Math.round(finalReloadTime);
        }();
        baseStatReturn.reloadAddTime = function () {
            const sohBaseReloadTime = stateTimers.ReloadQuickAddTime ?? stateTimers.ReloadAddTime;
            const baseReloadTime = (hasSpecialtyMod("specialty_fastreload") ? sohBaseReloadTime * 0.85 : stateTimers.ReloadAddTime);
            return Math.round(baseReloadTime * addMod("ReloadTimeMultiplier"));
        }();
        baseStatReturn.reloadEmptyAddTime = function () {
            const discard = hasSpecialtyMod("specialty_fastreload_empty");
            const sohBaseReloadTime = stateTimers.ReloadQuickEmptyAddTime ?? stateTimers.ReloadEmptyAddTime;
            const baseReloadTime = (hasSpecialtyMod("specialty_fastreload") || discard) ? sohBaseReloadTime * 0.85 : stateTimers.ReloadEmptyAddTime;
            const finalReloadTime = baseReloadTime * addMod("ReloadTimeMultiplier") * (discard ? 0.8 : 1);
            return isNaN(finalReloadTime) ? baseStatReturn.reloadAddTime : Math.round(finalReloadTime);
        }();
        baseStatReturn.raiseTime = hasSpecialtyMod("specialty_quickswap") ? stateTimers.RaiseQuickTime : stateTimers.RaiseTime;
        baseStatReturn.dropTime = hasSpecialtyMod("specialty_quickswap") ? stateTimers.DropQuickTime : stateTimers.DropTime;
        baseStatReturn.meleeTime = Math.round(stateTimers.MeleeTime * addMod("MeleeTimeMultiplier"));
        baseStatReturn.meleeDamage = overrideMod("MeleeDamage");
        baseStatReturn.meleeLungeDistanceInches = weaponBaseStats.MeleeLungeDistance;
        baseStatReturn.canMeleeCrit = overrideMod("CanCritical");
        baseStatReturn.meleeHitsToCrit = overrideMod("MeleeHitsToCritical");
        baseStatReturn.adsSpread = Math.max(0, overrideMod("ADSSpread", true) * addMod("ADSSpreadMultiplier"));
        baseStatReturn.fov = overrideMod("FoV");
        baseStatReturn.hipfire = function () {
            const hipfireMultiplier = Math.max(addMod("HipfireMultiplier"), 0);
            return {
                min: overrideMod("HipfireStandingMin") * hipfireMultiplier,
                moveMax: overrideMod("HipfireStandingMoveMax") * hipfireMultiplier,
                max: overrideMod("HipfireStandingMax") * hipfireMultiplier,
                heightMultiplier: addMod("HipfireHeightMultiplier"),
                widthMultiplier: addMod("HipfireWidthMultiplier") 
            }
        }();
        baseStatReturn.aimOutTime = overrideMod("ADSViewOutTime", false, 1000);
        baseStatReturn.tacSprintDuration = 2 * weaponBaseStats.SprintDurationMultiplier;
        baseStatReturn.initialRecoilEndCount = overrideMod("InitialRecoilEndCount");
        baseStatReturn.sustainedRecoilStartCount = overrideMod("SustainedRecoilStartCount");
        let hasKickScaling = "InitialRecoilEndCount" in modifiers.overrides;
        baseStatReturn.initialViewKickMultiplier = function () {
            const initialViewKickMultiplier = hasKickScaling ? multiMod("InitialViewKickMultiplier") : weaponBaseStats.InitialViewKickMultiplier;
            return (baseStatReturn.initialRecoilEndCount == 0) ? 1 : initialViewKickMultiplier;
        }();
        baseStatReturn.initialGunKickMultiplier = function () {
            const initialGunKickMultiplier = hasKickScaling ? multiMod("InitialGunKickMultiplier") : weaponBaseStats.InitialGunKickMultiplier;
            return (baseStatReturn.initialRecoilEndCount == 0) ? 1 : initialGunKickMultiplier;
        }();
        baseStatReturn.sustainedViewKickMultiplier = function () {
            const sustainedViewKickMultiplier = hasKickScaling ? multiMod("SustainedViewKickMultiplier") : weaponBaseStats.SustainedViewKickMultiplier;
            return (baseStatReturn.sustainedRecoilStartCount == 100) ? 1 : sustainedViewKickMultiplier;
        }();
        baseStatReturn.sustainedGunKickMultiplier = function () {
            const sustainedGunKickMultiplier = hasKickScaling ? multiMod("SustainedGunKickMultiplier") : weaponBaseStats.SustainedGunKickMultiplier;
            return (baseStatReturn.sustainedRecoilStartCount == 100) ? 1 : sustainedGunKickMultiplier;
        }();
        baseStatReturn.pelletDamageCap = overrideMod("PelletDamageCap");
        baseStatReturn.usesDoubleMultipliers = overrideMod("UsesDoubleMultipliers");
        baseStatReturn.akimboDamageMultiplier = addMod("AkimboDamageMultiplier");
        baseStatReturn.isIncendary = overrideMod("Incendiary");
        baseStatReturn.usesHyperburst = overrideMod("HyperBurstEnabled");
        baseStatReturn.hyperBurstFireDelayMultiplier = overrideMod("HyperBurstFireDelayMultiplier");
        baseStatReturn.baseMoveSpeedMultiplier = addMod("BaseMoveSpeedMultiplier");
        baseStatReturn.adsMoveSpeedMultiplier = addMod("ADSMoveSpeedMultiplier");
        baseStatReturn.strafeSpeedMultiplier = addMod("StrafeSpeedMultiplier");
        baseStatReturn.backpedalSpeedMultiplier = addMod("BackpedalSpeedMultiplier");
        baseStatReturn.sprintSpeedMultiplier = addMod("SprintSpeedMultiplier") + ((baseStatReturn.perks.quick) ? 0.04 : 0);
        baseStatReturn.firingMoveSpeedMultiplier = addMod("FiringMoveSpeedMultiplier");
        baseStatReturn.adsFiringMoveSpeedMultiplier = addMod("ADSFiringMoveSpeedMultiplier");
        baseStatReturn.gunKickYawMultiplier = multiMod("GunKickYawMultiplier");
        baseStatReturn.gunKickPitchMultiplier = multiMod("GunKickPitchMultiplier");
        baseStatReturn.viewKickYawMultiplier = multiMod("ViewKickYawMultiplier");
        baseStatReturn.viewKickPitchMultiplier = multiMod("ViewKickPitchMultiplier");
        baseStatReturn.crouchGunKickMultiplier = multiMod("CrouchGunKickMultiplier") * weaponBaseStats.CrouchGunKickMultiplier;
        baseStatReturn.proneGunKickMultiplier = multiMod("ProneGunKickMultiplier") * weaponBaseStats.ProneGunKickMultiplier;
        baseStatReturn.crouchViewKickMultiplier = multiMod("CrouchViewKickMultiplier") * weaponBaseStats.CrouchViewKickMultiplier;
        baseStatReturn.proneViewKickMultiplier = multiMod("ProneViewKickMultiplier") * weaponBaseStats.ProneViewKickMultiplier;
        baseStatReturn.viewCenterSpeed = multiMod("ViewCenterSpeedMulti") * overrideMod("ViewCenterSpeed");
        baseStatReturn.gunCenterSpeed = multiMod("GunCenterSpeedMulti") * overrideMod("GunCenterSpeed");
        return baseStatReturn;

        function overrideMod(name, reversePriority = false, overrideScalar = 0) {
            const overrideValue = modifiers?.overrides[name]?.[Number(!reversePriority)];
            if (overrideScalar != 0 && overrideValue !== undefined) {
                return overrideScalar * overrideValue;
            }
            return overrideValue ?? (weaponBaseStats[name] ?? false);
        }

        function addMod(modifierName) {
            return (modifiers.scalars[modifierName]?.reduce((prev, curr) => prev + curr) ?? 1) - ((modifiers.scalars[modifierName]?.length ?? 1) - 1);
        }

        function multiMod(modifierName) {
            return (modifiers.scalars[modifierName]?.reduce((prev, curr) => prev * curr)) ?? 1;
        }

        function totalMod(modifierName) {
            return (modifiers.others[modifierName]?.reduce((prev, curr) => prev + curr)) ?? 0;
        }

        function hasSpecialtyMod(specialtyName) {
            return modifiers.specialties.has(specialtyName);
        }

        function multiplyProperties(obj, x, ...excludedProperties) {
            const newobj = { ... obj };
            for (const [key, value] of Object.entries(newobj)) {
                if (excludedProperties?.includes(key)) {
                    continue;
                }
                if (typeof value === 'object') {
                    newobj[key] = multiplyProperties(value, x, ...excludedProperties);
                } else if (!isNaN(parseFloat(value))) {
                    newobj[key] *= x;
                }
            }
            return newobj;
        }

        function multiplyDeepMod(modifierName) {
            const modifier = modifiers.scalars[modifierName]
            return modifier?.reduce(deepMultiply, {}) ?? {};

            function deepMultiply(previous, current) {
                for (const [key, value] of Object.entries(current)) {
                    if (typeof value === 'object') {
                        previous[key] ??= {};
                        previous[key] = deepMultiply(previous[key], value)
                    } else if (!isNaN(parseFloat(value))) {
                        previous[key] ??= 1;
                        previous[key] *= value;
                    }
                }
                return previous;
            }
        }

        function compileStateTimers(weaponBaseName, weaponBase) {
            const type = alt ? "AlternateFireModeAnimationOverrides" : "PrimaryFireModeAnimationOverrides";
            const stateTimers = Object.assign({}, weaponBase.StateTimers);
            const activeOverrides = (weaponBase.AttachmentAnimationPackages ?? []).filter(packageIsActive);
            return activeOverrides.reduce((acc, animPackage) => Object.assign(acc, animPackage[type]), stateTimers);
    
            function packageIsActive(animationPackage) {
                return animationPackage.ListOfAttachmentMatchings.reduce((isActive, listOfMatchingAttachments) => {
                    return isActive && (listOfMatchingAttachments.filter(attachmentId => activeAttachmentNames.includes(attachmentId))).length > 0;
                }, true);
            }
        }

        //returns object containing properties 'overrides' and 'scalars' which are objects with keys correlating to stats
        //.overrides values are 2 member array, [0] being lowest priority and [1] being highest
        //.scalars values are arrays of all scalar values
        function compileModifiers() {
            const overrides = {}; // { OverridenStat1: [[value1, priority1], [v2, p2], ...], OS2: [], ... }
            const scalars = {}; // { ScalarStat1: [value1, v2, ...], SS2: [], ...}
            const others = {}; // { ScalarStat1: [value1, v2, ...], SS2: [], ...}
            const specialties = new Set();
            for (const [attachmentId, attachment] of Object.entries(allAttachments)) {
                if (!activeAttachmentIds.includes(attachmentId)) {
                    continue;
                }
                if (attachment.alsoEquips) {
                    if (alt || attachment.alsoEquips.AttachmentType != "ATTACHMENT_UNDERBARREL") {
                        addAttachmentStats(attachment.alsoEquips);
                    }
                }
                if (alt || attachment.AttachmentType != "ATTACHMENT_UNDERBARREL") {
                    addAttachmentStats(attachment, Object.keys(attachment.comboOverrides ?? {}).filter(overrideTrigger => activeAttachmentNames.includes(overrideTrigger))[0]);
                }
            }
    
            const minMaxOverrides = {};
            for (const [key, value] of Object.entries(overrides)) {
                value.sort((a, b) => {
                    return a[1] - b[1];
                });
                minMaxOverrides[key] = [value[0][0], value[value.length - 1][0]];
            }
    
            return { overrides: minMaxOverrides, scalars: scalars, specialties: specialties, others: others };
    
            function addAttachmentStats(originalAttachment, comboOverrideKey) {
                const attachment = originalAttachment?.comboOverrides?.[comboOverrideKey] ?? originalAttachment;
                const overrideStats = attachment.OverrideStats ?? {};
                for (const [overrideName, overrideValue] of Object.entries(overrideStats)) {
                    overrides[overrideName] ??= [];
                    overrides[overrideName].push([overrideValue, attachment.Priority]);
                }
                const scalarStats = attachment.ScalarStats ?? {};
                for (const [scalarName, scalarValue] of Object.entries(scalarStats)) {
                    scalars[scalarName] ??= [];
                    scalars[scalarName].push(scalarValue);
                }
                const otherStats = attachment.OtherStats ?? {};
                for (const [otherStatName, otherStatValue] of Object.entries(otherStats)) {
                    others[otherStatName] ??= [];
                    others[otherStatName].push(otherStatValue);
                }
                if ("GivesSpecialty" in originalAttachment) {
                    specialties.add(originalAttachment.GivesSpecialty);
                }
            }
        }
    }

    #getVariableStats = function() {
        if (this.#needToRefresh("stats")) {
            this.#variableStatsCache = this.#compileVariableStats(wzGun.#hp, wzGun.#maxHp, this.#altFire, this.#chargeAmount);
            this.#markRefreshed("stats");
        }
        return this.#variableStatsCache;
    };

    #compileVariableStats = function(hp, maxHp, alt = false, chargeAmount = 1) {
        const constantStats = alt ? this.#altConstantStats : this.#primaryConstantStats;
        const statReturn = {};
        statReturn.meleeHitsToKill = function () {
            let htk = Math.ceil(hp / constantStats.meleeDamage);
            return constantStats.canMeleeCrit ? Math.min(htk, constantStats.meleeHitsToCrit) : htk;
        }();

        statReturn.effectiveChargeTime = Math.round(constantStats.baseChargeTime * ((constantStats.chargeType == "CHARGEANDRELEASE") ? chargeAmount : 1));
        statReturn.rateOfFire = function () {
            switch (constantStats.fireType) {
                case "SINGLESHOT":
                    let chargeDelay = statReturn.effectiveChargeTime + constantStats.chargeCooldown;
                    chargeDelay -= (constantStats.chargeCooldown > constantStats.fireDelay) ? constantStats.fireDelay : 0;
                    return 60000 / (constantStats.openBoltDelay + constantStats.fireDelay + constantStats.rechamberTime + chargeDelay);
                case "BURSTFIRE":
                    if (constantStats.burstCount == 1) {
                        return 60000 / (constantStats.openBoltDelay + constantStats.fireDelay + constantStats.burstDelay); //burst gun disguised as semi
                    }
                    return 60000 / constantStats.fireDelay;
                case "FULLAUTO":
                    return 60000 / constantStats.fireDelay;
                case "DOUBLEBARREL":
                    return 60000 / (constantStats.openBoltDelay + constantStats.fireDelay);
            }
            return -1;
        }();
        return statReturn;
    }

    #generateHitboxInfos = function(hp, maxHp, alt = false) {
        const stats = this.stats;

        //empty previously loaded info
        this.#rangeBreakpointsCache = [];
        this.#hitboxInfosCache = {};
        this.#hitboxInfosCache.damage = [];
        this.#hitboxInfosCache.btk = [];
        this.#hitboxInfosCache.ttk = [];

        //create array of [[range, hitboxDamages] ...] for each different range
        const hitboxDamageAndRangeArray = stats.weaponDamage.map(value => [value[0], hitboxDamages(value[0], this.#chargeAmount)]);

        //Discard ranges that don't actually chance our damage
        this.#rangeBreakpointsCache.push(0);
        this.#hitboxInfosCache.damage.push(hitboxDamageAndRangeArray[0][1])
        this.#hitboxInfosCache.btk.push(hitboxBTKs(hitboxDamageAndRangeArray[0][1]));
        this.#hitboxInfosCache.ttk.push(hitboxTTKs(hitboxDamageAndRangeArray[0][1]));
        for (var i = 1; i < hitboxDamageAndRangeArray.length; i++) {
            if (JSON.stringify(hitboxDamageAndRangeArray[i][1]) != JSON.stringify(hitboxDamageAndRangeArray[i - 1][1])) {
                this.#rangeBreakpointsCache.push(hitboxDamageAndRangeArray[i][0]);
                this.#hitboxInfosCache.damage.push(hitboxDamageAndRangeArray[i][1]);
                this.#hitboxInfosCache.btk.push(hitboxBTKs(hitboxDamageAndRangeArray[i][1]));
                this.#hitboxInfosCache.ttk.push(hitboxTTKs(hitboxDamageAndRangeArray[i][1]));
            }
        }

        //Create and extra point on TTK graph to deal with BV option
        this.#hitboxInfosCache.ttk.push(hitboxTTKs(500 / 0.0254));
        return;

        function hitboxDamages(rangeInches, chargeAmount) {
            const { weaponClass, pelletDamageCap, isAkimbo, usesDoubleMultipliers, akimboDamageMultiplier, weaponDamage, hitboxMultipliers, chargeType, chargeDamageMultiplier } = stats;

            let activeDamageIndex = weaponDamage.findIndex(value => rangeInches < value[0]);
            activeDamageIndex = (activeDamageIndex == -1) ? weaponDamage.length - 1 : activeDamageIndex - 1

            const baseDamage = weaponDamage[activeDamageIndex][1];
            const maxDamageRangeIndex = weaponDamage.findIndex(value => value[2] == true);
            const previousDamage = (maxDamageRangeIndex != -1 && activeDamageIndex > maxDamageRangeIndex) ? weaponDamage[maxDamageRangeIndex][1] : baseDamage;
            const damage = { ...hitboxMultipliers };

            for (const [location, multiplier] of Object.entries(damage)) {
                let hitboxDamage = baseDamage;

                if (weaponClass == "SPREAD") {
                    if (pelletDamageCap > 0) {
                        hitboxDamage = Math.min(hitboxDamage, pelletDamageCap);
                    } else {
                        hitboxDamage = Math.trunc(f32(hitboxDamage * multiplier));
                    }
                } else if (usesDoubleMultipliers) {
                    hitboxDamage = Math.trunc(f32(hitboxDamage * multiplier));
                }

                hitboxDamage = Math.trunc(f32(hitboxDamage * multiplier));

                if (isAkimbo) {
                    hitboxDamage = Math.trunc(hitboxDamage * akimboDamageMultiplier);
                }

                hitboxDamage += Math.trunc((previousDamage - baseDamage) * f32(multiplier));

                hitboxDamage = shiftBTK(hitboxDamage, location);

                hitboxDamage *= (chargeType != "CHARGEANDRELEASE") ? 1 : chargeAmount * (chargeDamageMultiplier - 1) + 1;

                if (hitboxDamage >= 300 && location == "Head") {
                    hitboxDamage = maxHp; //iron trials - apparently not titanium
                }

                damage[location] = Math.min(hitboxDamage, maxHp);
            }
            return damage;

            function shiftBTK(damage, location) {
                let btkShift = stats.bodyBTKShiftCount;
                switch (location) {
                    case "Helmet":
                    case "Head":
                    case "Neck":
                        btkShift = 0;
                    case "TorsoUpper":
                    case "TorsoLower":
                        btkShift = ((btkShift > 0) ? Math.ceil(btkShift / 2) : Math.floor(btkShift / 2));
                    default:
                }
                if (btkShift == 0) {
                    return damage;
                }
                const currentBTK = Math.ceil(maxHp / damage);
                const lower = Math.ceil(maxHp / currentBTK);
                const upper = Math.ceil(maxHp / (currentBTK - 1));
                const frac = (damage - lower) / (upper - lower);
                const newLower = Math.ceil(maxHp / (currentBTK + btkShift));
                const newUpper = Math.ceil(maxHp / (currentBTK + btkShift - 1));
                const newDamage = newLower + Math.floor(frac * (newUpper - newLower));
                return newDamage;
            }

            function f32(number){
                return Math.fround(number);
            }
        };

        function hitboxBTKs(hitboxDamages) {
            const btk = { ...hitboxDamages };
            for (const [location, damage] of Object.entries(btk)) {
                btk[location] = Math.ceil(hp / damage);
            }
            return btk;
        };

        function hitboxTTKs(hitboxDamages) {
            const ttks = { ...hitboxDamages };
            const { effectivePelletCount } = stats;
            const timeToReachTarget = 0;
            //const timeToReachTarget = wzUserGameplaySettings.includeBVinTTK ? statFunctions.aimAtTarget(rangeInches * 0.0254).time : 0;

            for (const [location, damage] of Object.entries(ttks)) {
                ttks[location] = ttkFromDamage(hp, damage * effectivePelletCount).ttk + timeToReachTarget;
            }
            return ttks;
        }

        //if multiple damages are passed, it will pass through the array and repeat last value until dead
        function ttkFromDamage(hp, ...damage) {
            if (damage.length == 0) {
                return {
                    ttk: -1,
                    btk: -1
                };
            }
            const { isIncendary, weaponClass, isAkimbo, fireDelay, openBoltDelay, burstDelay, burstCount, rechamberTime, chargeType, effectiveChargeTime, chargeCooldown, fireType, usesHyperburst, hyperBurstFireDelayMultiplier, magazineSize, reloadEmptyTime } = stats;
    
            var currentHealth = hp;
            var timePassed = 0;
            var shotCount = 0;
    
            var queuedTicks = 0;
            const incendiaryTickDamage = ((weaponClass == "SPREAD") ? 5 : 2);
            const ticksToQueue = isIncendary ? ((weaponClass == "SPREAD") ? 1 : 3) : 0;
    
            if (wzUserGameplaySettings.includeOBDinTTK) {
                timePassed += openBoltDelay + effectiveChargeTime;
            }
    
            let cycleDamage = 0;
            var i = 0
            cycleDamage = damage[i];
            i = Math.min(i + 1, damage.length - 1);
            if (isAkimbo) {
                cycleDamage += damage[i];
                i = Math.min(i + 1, damage.length - 1);
            }
    
            ttkLoop: while ((currentHealth -= cycleDamage) > 0) {
                shotCount++;
                let timeOfPreviousShot = timePassed;
    
                queuedTicks = Math.min(queuedTicks + ticksToQueue, 3);
    
                timePassed += fireDelay;
                if (usesHyperburst && shotCount == 1) {
                    timePassed -= fireDelay * (1 - hyperBurstFireDelayMultiplier);
                }
                if (usesHyperburst && shotCount == 2) {
                    timePassed -= fireDelay * hyperBurstFireDelayMultiplier;
                }
    
                switch (fireType) {
                    case "SINGLESHOT":
                        let chargeDelay = effectiveChargeTime + chargeCooldown;
                        chargeDelay -= (chargeCooldown > fireDelay) ? fireDelay : 0;
                        timePassed += openBoltDelay + rechamberTime + chargeDelay;
                        break;
                    case "BURSTFIRE":
                        if (Number.isInteger(shotCount / burstCount)) {
                            timePassed += openBoltDelay + burstDelay;
                        }
                        break;
                    case "DOUBLEBARREL":
                        if (Number.isInteger(shotCount / 2)) {
                            timePassed += rechamberTime;
                        }
                        break;
                }
    
                if (Number.isInteger(shotCount / magazineSize)) {
                    timePassed += reloadEmptyTime;
                }
    
                const ticksToApply = Math.min(queuedTicks, Math.floor((timePassed - timeOfPreviousShot) / 250));
                for (var j = 0; j < ticksToApply; j++) {
                    queuedTicks--;
                    timeOfPreviousShot += 250;
                    if ((currentHealth -= incendiaryTickDamage) <= 0) {
                        timePassed = timeOfPreviousShot;
                        break ttkLoop;
                    }
                }
    
                cycleDamage = damage[i];
                i = Math.min(i + 1, damage.length - 1);
                if (isAkimbo) {
                    cycleDamage += damage[i];
                    i = Math.min(i + 1, damage.length - 1);
                }
                if (cycleDamage <= 0 && i == damage.length - 1) {
                    return {
                        ttk: -1,
                        btk: -1
                    };
                }
            }
            return {
                ttk: Math.round(timePassed),
                btk: shotCount
            };
        }
    }

    #generateBaseUIData = function(alt = false) {
        const constantStats = alt ? this.#altConstantStats : this.#primaryConstantStats;
        this.#rangeSelectorCache = damageDistances(this.rangeBreakpoints);
        this.#graphsCache = {};
        this.#graphsCache.damage = createHitboxInfoGraphPoints(this.hitboxInfos.damage, this.rangeBreakpoints);
        this.#graphsCache.btk = createHitboxInfoGraphPoints(this.hitboxInfos.btk, this.rangeBreakpoints);
        this.#graphsCache.ttk = createHitboxInfoGraphPoints(this.hitboxInfos.ttk, this.rangeBreakpoints);
        this.#graphsCache.bulletDrop = createBulletDropGraphPoints();
        this.#graphsCache.bulletVelocity = createBulletVelocityGraphPoints();
        return;

        function damageDistances(rangeBreakpoints) {
            return rangeBreakpoints.map((range, index) => {
                const dropdownValue = index;
                const startDistance = roundToDecimal(range * 0.0254, 1);
                let dropdownText;
                if (index + 1 < rangeBreakpoints.length) {
                    const endDistance = roundToDecimal(rangeBreakpoints[index + 1] * 0.0254, 1);
                    dropdownText = startDistance + "m - " + endDistance + "m";
                } else {
                    dropdownText = startDistance + "m+";
                }
                return [dropdownValue, dropdownText];
            });
        };

        function createHitboxInfoGraphPoints(hitboxInfo, rangeBreakpoints) {
            const graphObject = {};
            rangeBreakpoints.forEach((range, index) => {
                for (const [key, value] of Object.entries(hitboxInfo[index])) {
                    graphObject[key] ??= [];
                    if (value != -1) {
                        const startX = Math.ceil(range * 0.0254);
                        const endX = Math.ceil(((index + 1 < rangeBreakpoints.length) ? rangeBreakpoints[index + 1] : 19700) * .0254) - 1;
                        const points = createPointsBetween(startX, value, endX, value);
                        graphObject[key].push(...points);
                    }
                }
            })
            return graphObject;
        }

        function createBulletDropGraphPoints() {
            const ballistics = constantStats.ballistics;
            if (!ballistics.SimulateTrajectoryBool) {
                return createPointsBetween(0, 0, 500, 0); //gun is hitscan
            }
            const { DropFactor, InitialAngle, BulletDisplacementTable } = ballistics;
            return BulletDisplacementTable.map((displacement, index) => {
                const x = Math.cos(InitialAngle * Math.PI / 180) * displacement;
                const y = Math.sin(InitialAngle * Math.PI / 180) * displacement - DropFactor * index ** 2;
                return [x, y];
            });
        }

        function createBulletVelocityGraphPoints() {
            const { ballistics, muzzleVelocity } = constantStats;
            if (!ballistics.SimulateTrajectoryBool) {
                return createPointsBetween(0, 0, 500, 0); //gun is hitscan
            }
            const distanceTraveled = ballistics.BulletDisplacementTable;
            return distanceTraveled.map((displacement, index) => {
                const velocity = index == 0 ? muzzleVelocity : (displacement - distanceTraveled[index - 1]) / 0.012;
                return [roundToDecimal(displacement, 1), roundToDecimal(velocity, 1)];
            });
        }

        function createPointsBetween(startX, startY, endX, endY) {
            const arr = [];
            const xdiff = endX - startX;
            const ydiff = endY - startY;
            if (xdiff == 0) {
                return [[startX, startY]]
            }
            for (var i = 0; i <= xdiff; i++) {
                const frac = i / xdiff;
                const newY = frac * ydiff + startY;
                arr.push([startX + i, newY]);
            }
            return arr;
        }
    }

    #generateProbabilityData = function() {
        const stats = this.stats;
        const health = wzGun.#hp;
        const bodyLocationChances = wzGun.#bodyLocationChances;
        const missChance = wzGun.#missChance;
        const rangeBreakpoints = this.rangeBreakpoints;

        let probabilitiesPerRange = new Array(this.rangeBreakpoints.length).fill(false);
        let averageTTKPerRange = new Array(this.rangeBreakpoints.length);
        let averageShotsPerDownPerRange = new Array(this.rangeBreakpoints.length);

        this.hitboxInfos.damage.forEach((hitboxDamage, index) => {
            const copyOfHitboxDamage = { ...hitboxDamage };
            if (!probabilitiesPerRange[index]) {
                if (stats.weaponClass == "SPREAD") {
                    const pelletCount = stats.effectivePelletCount;
                    Object.keys(copyOfHitboxDamage).forEach((key) => {
                        copyOfHitboxDamage[key] *= pelletCount;
                    });
                }
                if (wzProbabilityCache.isCachedChanceToKillInHits(health, bodyLocationChances, copyOfHitboxDamage)) {
                    const shotCountProbabilities = probabilityOfKillingInShotCount(copyOfHitboxDamage);
                    const ttkProbabilities = probabilitiesOfAchievingTTKs(shotCountProbabilities);
                    probabilitiesPerRange[index] = ttkProbabilities;
                    averageTTKPerRange[index] = averageTTK(ttkProbabilities);
                    averageShotsPerDownPerRange[index] = averageDownsPerMag(shotCountProbabilities);
                }
            }
        })

        if (!probabilitiesPerRange.some(element => element === false)) {
            this.#probabilityGraphsCache = {
                probabilitiesPerRange: probabilitiesPerRange,
                ttkMeanDistribution: createTTKMeanDistributionGraphPoints(),
                averageDownsPerMag: createAverageDownsPerMagGraphPoints()
            }
        }
        return;

        //Incorporates misses
        //returns array of probabilities where index in number of shots
        //Last element will have >99% probability
        function probabilityOfKillingInShotCount(hitboxDamages) {
            const killProbabilitesPerHitCount = wzProbabilityCache.getCachedChanceToKillInHits(health, bodyLocationChances, hitboxDamages);
            if (!killProbabilitesPerHitCount) {
                return [0];
            }
            const chanceToHit = 1 - missChance;
            const damageArray = Object.values(hitboxDamages);
            const uniqueDamages = [...new Set(damageArray)]; //create array of unique damage values
            const maxBTK = Math.ceil(health / Math.min(...uniqueDamages));

            const returnArr = [0];

            for (let i = 1; i <= bigIntFactorialArray.length - 1; i++) {
                const probability = getProbabilityOfKillInShots(i);
                returnArr.push(probability);
                if (i >= maxBTK && probability > 99) {
                    break;
                }
            }

            return returnArr;

            function getProbabilityOfKillInShots(shots) {
                let probability = 0;
                for (let i = 1; i <= shots; i++) {
                    const probabilityToKillInThisManyShots = (i > maxBTK) ? 100 : killProbabilitesPerHitCount[i];
                    const probabilityToHitThisManyShots = binomialProbability(shots, i, chanceToHit);
                    probability += probabilityToKillInThisManyShots * probabilityToHitThisManyShots;
                }
                return probability;
            }

            function binomialProbability(trials, successes, probabilityOfSuccess) {
                return Number(bigIntFactorialArray[trials] / bigIntFactorialArray[trials - successes] / bigIntFactorialArray[successes]) * (probabilityOfSuccess ** successes) * ((1 - probabilityOfSuccess) ** (trials - successes));
            }
        }

        function averageDownsPerMag(probabilityToKillInShots) {
            if (!probabilityToKillInShots) {
                return false;
            }
            
            //convert cdf to pdf and find mean distribution
            let averageShotsToKill = probabilityToKillInShots.reduce((previousValue, currentValue, index) => {
                const chance = (index == 0) ? currentValue : currentValue - probabilityToKillInShots[index - 1];
                return previousValue + chance / 100 * index;
            }, 0);

            if (stats.fireType == "BURSTFIRE") {
                averageShotsToKill = Math.ceil(averageShotsToKill / stats.burstCount) * stats.burstCount;
            }
            
            return (stats.isAkimbo ? 2 : 1) * stats.magazineSize / averageShotsToKill;
        }

        //Converts shot count into ttk, and total probabilities into per-shot deltas
        //Sum of probabilities will be or approach 100%
        function probabilitiesOfAchievingTTKs(probabilityToKillInShots) {
            if (probabilityToKillInShots.length == 1) {
                return [[0, 0]];
            }
            //convert BTK to TTK
            //create pdf from deltas of cdfs
            return probabilityToKillInShots.map((probability, index) => {
                const chance = (index == 0) ? probability : probability - probabilityToKillInShots[index - 1];
                if (chance > 0) {
                    const ttk = ttkFromShotCount(index, stats);
                    return [ttk, roundToDecimal(chance, 2)];
                }
            }).filter(element => element !== undefined);

            function ttkFromShotCount(shotCount, stats) {
                if (shotCount <= 0) {
                    return 0;
                }
                const { isAkimbo, fireDelay, openBoltDelay, burstDelay, burstCount, rechamberTime, chargeType, effectiveChargeTime, chargeCooldown, fireType, usesHyperburst, magazineSize, reloadEmptyTime } = stats;
                let ttk = 0;
        
                if (wzUserGameplaySettings.includeOBDinTTK) {
                    ttk += openBoltDelay + effectiveChargeTime;
                }
        
                const shots = isAkimbo ? shotCount / 2 : shotCount;
        
                const fireDelays = usesHyperburst ? shots - 2 : shots - 1;
                const reloads = Math.ceil(shots / magazineSize) - 1;
                ttk += fireDelays * fireDelay + reloads * reloadEmptyTime;
        
                switch (fireType) {
                    case "SINGLESHOT":
                        let chargeDelay = effectiveChargeTime + chargeCooldown;
                        chargeDelay -= (chargeCooldown > fireDelay) ? fireDelay : 0;
                        ttk += fireDelays * openBoltDelay;
                        ttk += fireDelays * rechamberTime;
                        ttk += fireDelays * chargeDelay;
                        break;
                    case "BURSTFIRE":
                        const burstDelays = Math.ceil(shots / burstCount) - 1;
                        ttk += burstDelays * burstDelay;
                        ttk += burstDelays * openBoltDelay;
                        break;
                    case "DOUBLEBARREL":
                        const rechamberTimes = Math.ceil(shots / 2) - 1;
                        ttk += rechamberTimes * rechamberTime
                }
                return ttk;
            }
        }

        function createTTKMeanDistributionGraphPoints() {
            return rangeBreakpoints.flatMap((range, index) => {
                const startY = Math.round(averageTTKPerRange[index]);
                if (startY != -1) {
                    const startX = Math.ceil(range * 0.0254);
                    const endX = Math.ceil(((index + 1 < rangeBreakpoints.length) ? rangeBreakpoints[index + 1] : 19700) * .0254) - 1;
                    return createPointsBetween(startX, startY, endX, startY);
                }
            });
        }

        function createAverageDownsPerMagGraphPoints() {
            return rangeBreakpoints.flatMap((range, index) => {
                const startY = roundToDecimal(averageShotsPerDownPerRange[index], 2);
                if (startY != -1) {
                    const startX = Math.ceil(range * 0.0254);
                    const endX = Math.ceil(((index + 1 < rangeBreakpoints.length) ? rangeBreakpoints[index + 1] : 19700) * .0254) - 1;
                    return createPointsBetween(startX, startY, endX, startY);
                }
            });
        }

        function createPointsBetween(startX, startY, endX, endY) {
            const arr = [];
            const xdiff = endX - startX;
            const ydiff = endY - startY;
            if (xdiff == 0) {
                return [[startX, startY]]
            }
            for (var i = 0; i <= xdiff; i++) {
                const frac = i / xdiff;
                const newY = frac * ydiff + startY;
                arr.push([startX + i, newY]);
            }
            return arr;
        }

        //Calculates average TTK
        function averageTTK(probabilitiesOfTTKs) {
            const averageTTK = probabilitiesOfTTKs.reduce((previousValue, currentValue) => {
                return previousValue + currentValue[0] * currentValue[1] / 100;
            }, 0);
            return averageTTK;
        }
    }

    aimAtTarget(rangeMeters) {
        const constantStats = this.#altFire ? this.#altConstantStats : this.#primaryConstantStats;
        const ballistics = constantStats.ballistics;
        const { SimulateTrajectoryBool, DropFactor, InitialAngle, BulletDisplacementTable } = ballistics;
        if (!SimulateTrajectoryBool) {
            return {
                angle: 0,
                time: 0
            };
        }

        const initial = findYandIndexAtRange(0);
        if (initial.index == -1) {
            return {
                angle: 0,
                time: 12 * BulletDisplacementTable.length
            };
        }

        const adjustmentDirection = -1 * Math.sign(initial.y);
        let zeroedAngle = 0;
        let zeroing

        do {
            zeroedAngle += adjustmentDirection * 0.01;
            zeroing = findYandIndexAtRange(zeroedAngle);
        } while (zeroing.index != -1 && Math.sign(zeroing.y) != adjustmentDirection);

        return {
            angle: zeroedAngle,
            time: 12 * zeroing.index
        };

        function findYandIndexAtRange(additionalAngle) {
            let index = BulletDisplacementTable.findIndex(function (distance) {
                return Math.cos((InitialAngle + additionalAngle) * Math.PI / 180) * distance > rangeMeters;
            });
            let y = 0;
            if (index != -1) {
                y = Math.sin((InitialAngle + additionalAngle) * Math.PI / 180) * BulletDisplacementTable[index] - DropFactor * index ** 2;
                if (index > 0) {
                    const previousY = Math.sin((InitialAngle + additionalAngle) * Math.PI / 180) * BulletDisplacementTable[index - 1] - DropFactor * (index - 1) ** 2;
                    if (Math.abs(previousY) < Math.abs(y)) {
                        index -= 1;
                        y = previousY;
                    }
                }
            }
            return {
                index: index,
                y: y
            }
        }
    }

    movementSpeed(ads = false, firing = false) {
        const constantStats = this.#altFire ? this.#altConstantStats : this.#primaryConstantStats;
        const { baseMoveSpeedMultiplier, adsMoveSpeedMultiplier, strafeSpeedMultiplier, backpedalSpeedMultiplier, sprintSpeedMultiplier, firingMoveSpeedMultiplier, adsFiringMoveSpeedMultiplier } = constantStats;
        const gungHo = (constantStats.perks.gungHo ? 1 : 0);
        const quick = (constantStats.perks.quick ? 1.04 : 1);

        const baseMovementSpeed = (ads ? constantStats.baseADSMovementSpeed : constantStats.baseMovementSpeed);
        const moveSpeedMulti = ads ? adsMoveSpeedMultiplier : baseMoveSpeedMultiplier;
        const firingMoveSpeedMulti = ads ? adsFiringMoveSpeedMultiplier : firingMoveSpeedMultiplier;
        const effectiveFiringMulti = firing ? firingMoveSpeedMulti : 1;
        const forwardSpeed = 0.0254 * baseMovementSpeed * moveSpeedMulti * effectiveFiringMulti;

        const forward = forwardSpeed;
        const strafe = forwardSpeed * strafeSpeedMultiplier * (ads ? 0.8 : 0.7);
        const backpedal = Math.min(forwardSpeed * backpedalSpeedMultiplier * (ads ? 0.88 : 0.77), forward);
        const sprint = forwardSpeed * sprintSpeedMultiplier * 1.31 * (ads ? 0 : 1) * (firing ? gungHo : 1);
        const tacsprint = forwardSpeed * 1.57 * (ads ? 0 : 1) * (firing ? 0 : 1) * quick;

        return {
            "forward": forward,
            "strafe": strafe,
            "backpedal": backpedal,
            "sprint": sprint,
            "tacsprint": tacsprint
        };
    }
}