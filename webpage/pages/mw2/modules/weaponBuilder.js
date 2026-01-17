import { MW2Data } from "../data/mw2_data.js"
import * as TTKProbability from "./ttkProbability.js";
import * as Health from "./healthSelect.js";

export class Gun {
    #chargeAmount = 1;
    #gunId;
    #gun;
    #altFire;
    #altFireAvailable; //set when modifiers compiled
    #selectedAttachmentIdArray;
    #conflictingAttachments;
    #fullAttachmentIdArray;
    #constantStats;

    constructor(gunId, attachmentIdArray, altFire = false) {
        this.#gunId = gunId;
        this.#gun = MW2Data[this.#gunId];
        this.#selectedAttachmentIdArray = attachmentIdArray.filter(attachmentId => attachmentId in this.#gun.SelectableAttachments).sort();
        this.#conflictingAttachments = getAttachmentsThatConflicts(this.#gun, this.#selectedAttachmentIdArray);
        this.#fullAttachmentIdArray = addDefaultAttachments(this.#gun, this.#selectedAttachmentIdArray, this.#conflictingAttachments);
        this.#constantStats = this.#compileConstantStats(altFire);
        this.#altFire = altFire && this.#altFireAvailable;

        function getAttachmentsThatConflicts(gun, selectedAttachmentIdArray) {
            const conflictsFromSelectedAttachments = selectedAttachmentIdArray.flatMap(attachmentID => gun.SelectableAttachments[attachmentID].attachmentConflicts);
            const alsoEquippedAttachments = selectedAttachmentIdArray.map(attachmentID => gun.SelectableAttachments[attachmentID].alsoEquips).filter(x => x);
            const conflictsFromAlsoEquips = alsoEquippedAttachments.flatMap(obj => Object.values(obj).map(attachment => attachment.attachmentConflicts));
            return conflictsFromSelectedAttachments.concat(conflictsFromAlsoEquips).filter(n => n);
        }

        function addDefaultAttachments(gun, selectedAttachmentIdArray, conflictingAttachments) {
            const alsoEquippedAttachments = selectedAttachmentIdArray.map(attachmentID => gun.SelectableAttachments[attachmentID].alsoEquips).filter(x => x);
            const alsoEquippedAttachmentIds = alsoEquippedAttachments.flatMap(obj => Object.keys(obj));
            const activeIds = selectedAttachmentIdArray.concat(alsoEquippedAttachmentIds);
            const defaultAttachments = Object.entries(gun.DefaultAttachments ?? {});
            const knownConflictsFiltered = defaultAttachments.filter(([key, value]) => !conflictingAttachments.includes(key));
            const defaultConflictFiltered = knownConflictsFiltered.filter(([key, value]) => (value.attachmentConflicts?.findIndex(conflict => activeIds.includes(conflict)) ?? -1) == -1);
            return defaultConflictFiltered.map(([key, value]) => key).concat(selectedAttachmentIdArray);
        }
    }

    createBaseGun() {
        return new Gun(this.gunId, [], this.altFire);
    }

    get hasAltFire() {
        return this.#altFireAvailable;
    }

    switchFireMode() {
        return new Gun(this.gunId, this.selectedAttachments, !this.altFire);
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

    get selectedAttachments() {
        return this.#selectedAttachmentIdArray.slice();
    }

    get conflictingAttachments() {
        return this.#conflictingAttachments.filter(attachmentId => attachmentId in this.#gun.SelectableAttachments);
    }

    get altFire() {
        return this.#altFire;
    }

    get stats() {
        return { ...this.#constantStats, ...this.#compileVariableStats() };
    }

    get rangeBreakpoints() {
        return this.stats.weaponDamage.map(([range, damage]) => range);
    }

    indexForRange(rangeMeters) {
        const weaponDamage = this.stats.weaponDamage;
        const firstIndexExceedingRange = weaponDamage.findIndex(([range, damage]) => range > rangeMeters);
        return (firstIndexExceedingRange == -1) ? weaponDamage.length - 1 : firstIndexExceedingRange - 1;
    }

    //[[StartRange1, Damage1], ...]
    locDamages(location) {
        const stats = this.stats;
        const { weaponDamage } = stats;
        return weaponDamage.map(([range, baseDamage]) => {
            return [range, damageToLocation(baseDamage, location, stats)];
        });
    }

    //[[StartRange1, BTK1], ...]
    locBTKs(location) {
        return this.locDamages(location).map(([range, damage]) => {
            if (damage <= 0) {
                return [range, -1];
            }
            return [range, Math.ceil(Health.totalHealth / damage)];
        });
    }

    //[[StartRange1, TTK1], ...]
    locTtks(location) {
        return this.locBTKs(location).map(([range, btk]) => {
            return [range, this.ttkFromShotCount(btk)];
        });
    }

    //[[StartRange1, locDamageMap1], ...]
    locDamageMaps() {
        const stats = this.stats;
        const { weaponDamage, hitboxMultipliers } = stats;
        const entries = Object.entries(hitboxMultipliers);
        return weaponDamage.map(([range, baseDamage]) => {
            const newEntries = entries.map(([location, multiplier]) => {
                return [location, damageToLocation(baseDamage, location, stats)]
            });
            return [range, Object.fromEntries(newEntries)];
        });
    }

    locDamageMapAtRange(rangeMeters) {
        const stats = this.stats;
        const { weaponDamage, hitboxMultipliers } = stats;
        const entries = Object.entries(hitboxMultipliers);
        const activeDamageIndex = this.indexForRange(rangeMeters);
        const baseDamage = weaponDamage[activeDamageIndex][1];
        const newEntries = entries.map(([location, multiplier]) => {
            return [location, damageToLocation(baseDamage, location, stats)]
        });
        return Object.fromEntries(newEntries);
    }

    //[[StartRange1, [[btk, probability], ...]], ...]
    probabilitiesOfBtks() {
        return this.locDamageMaps().map(([range, hitboxDamageMap]) => {
            const shotCountProbs = TTKProbability.getShotCountProbabilities(hitboxDamageMap);
            const datapoints = shotCountProbs.map(([btk, prob]) => {
                return [btk, roundToDecimal(prob * 100, 2)];
            });
            return [range, datapoints.filter(x => x[1] >= 0.01)];
        });
    }

    //[[StartRange1, [[ttk, probability], ...]], ...]
    probabilitiesOfTtks() {
        return this.probabilitiesOfBtks().map(([range, btkProbs]) => { 
            const ttkProbs = btkProbs.map(([btk, prob]) => {
                return [this.ttkFromShotCount(btk), prob];
            });
            return [range, ttkProbs];
        });
    }

    get bulletDrop() {
        const ballistics = this.stats.ballistics;
        if (!ballistics.SimulateTrajectoryBool) {
            return Array.from({length: 501}, (x, index) => [index, 0]);
        }
        const { DropFactor, InitialAngle, BulletDisplacementTable } = ballistics;
        return BulletDisplacementTable.map((displacement, index) => {
            const x = Math.cos(InitialAngle * Math.PI / 180) * displacement;
            const y = Math.sin(InitialAngle * Math.PI / 180) * displacement - DropFactor * index ** 2;
            return [x, y];
        });
    }

    get bulletVelocity() {
        const { ballistics, muzzleVelocity } = this.stats;
        if (!ballistics.SimulateTrajectoryBool) {
            return Array.from({length: 501}, (x, index) => [index, 0]);
        }
        const distanceTraveled = ballistics.BulletDisplacementTable;
        return distanceTraveled.map((displacement, index) => {
            const velocity = index == 0 ? muzzleVelocity : (displacement - distanceTraveled[index - 1]) / 0.012;
            return [roundToDecimal(displacement, 1), roundToDecimal(velocity, 1)];
        });
    }

    //private functions have poor compatibility, but private fields storing anonymous functions work
    #compileConstantStats = function(alt = false) {
        const baseLocalizedName = this.#gun.BaseWeaponName;
        const allAttachments = Object.assign({}, this.#gun.DefaultAttachments, this.#gun.SelectableAttachments);
        const selectedAttachmentIds = this.#selectedAttachmentIdArray;
        const activeAttachmentIds = this.#fullAttachmentIdArray;
        const weaponBaseStats = this.#gun.Stats;
        const stateTimers = compileStateTimers(this.#gunId, this.#gun);
        const modifiers = compileModifiers(this.#gunId, this.#gun);
        this.#altFireAvailable = modifiers.hasAltFire;
        const baseStatReturn = {};
        baseStatReturn.perks = {
            gungHo: hasSpecialtyMod("specialty_sprintfire"),
            quick: hasSpecialtyMod("specialty_quick")
        };
        baseStatReturn.minWzDamage = overrideMod("MinimumWzDamage");
        baseStatReturn.maxWzDamage = overrideMod("MaximumWzDamage");
        baseStatReturn.wzBtkShift = overrideMod("WzBtkShift")
        baseStatReturn.weaponClass = overrideMod("WeaponClass");
        baseStatReturn.fireType = overrideMod("FireType");
        baseStatReturn.isAkimbo = overrideMod("Akimbo");
        baseStatReturn.movementSpeedHipForward = function () {
            const base = overrideMod("MovementSpeedHipForward");
            const movementSpeedHipForwardMultiplier = addMod("MovementSpeedHipForwardMultiplier");
            const bonus = totalMod("MovementSpeedHipForwardBonus");
            const final = (base * movementSpeedHipForwardMultiplier) + bonus;
            return 0.0254 * final;
        }();
        baseStatReturn.movementSpeedHipStrafe = function () {
            const base = overrideMod("MovementSpeedHipStrafe");
            const movementSpeedHipStrafeMultiplier = addMod("MovementSpeedHipStrafeMultiplier");
            const bonus = totalMod("MovementSpeedHipStrafeBonus");
            const final = (base * movementSpeedHipStrafeMultiplier) + bonus;
            return 0.0254 * final;
        }();
        baseStatReturn.movementSpeedHipBackpedal = function () {
            const base = overrideMod("MovementSpeedHipBackpedal");
            const movementSpeedHipStrafeMultiplier = addMod("MovementSpeedHipStrafeMultiplier");
            const bonus = totalMod("MovementSpeedHipStrafeBonus");
            const final = (base * movementSpeedHipStrafeMultiplier) + bonus;
            return 0.0254 * final;
        }();
        baseStatReturn.movementSpeedSprint = function () {
            const base = overrideMod("MovementSpeedSprint");
            const movementSpeedSprintMultiplier = addMod("MovementSpeedSprintMultiplier");
            const bonus = totalMod("MovementSpeedSprintBonus");
            const final = (base * movementSpeedSprintMultiplier) + bonus;
            return 0.0254 * final;
        }();
        baseStatReturn.movementSpeedTacticalSprint = function () {
            const base = overrideMod("MovementSpeedTacticalSprint");
            const movementSpeedTacticalSprintMultiplier = addMod("MovementSpeedTacticalSprintMultiplier");
            const bonus = totalMod("MovementSpeedTacticalSprintBonus");
            const final = (base * movementSpeedTacticalSprintMultiplier) + bonus;
            return 0.0254 * final;
        }();
        baseStatReturn.movementSpeedADSForward = function () {
            const base = overrideMod("ADSMovementSpeedForward");
            const movementSpeedADSMultiplier = addMod("ADSMovementSpeedMultiplier");
            const bonus = totalMod("ADSMovementSpeedBonus");
            const final = (base * movementSpeedADSMultiplier) + bonus;
            return 0.0254 * final;
        }();
        baseStatReturn.movementSpeedADSStrafe = function () {
            const base = overrideMod("ADSMovementSpeedStrafe");
            const movementSpeedADSMultiplier = addMod("ADSMovementSpeedMultiplier");
            const bonus = totalMod("ADSMovementSpeedBonus");
            const final = (base * movementSpeedADSMultiplier) + bonus;
            return 0.0254 * final;
        }();
        baseStatReturn.movementSpeedADSBackpedal = function () {
            const base = overrideMod("ADSMovementSpeedBackpedal");
            const movementSpeedADSMultiplier = addMod("ADSMovementSpeedMultiplier");
            const bonus = totalMod("ADSMovementSpeedBonus");
            const final = (base * movementSpeedADSMultiplier) + bonus;
            return 0.0254 * final;
        }();
        baseStatReturn.fireDelay = function () {
            const baseFireDelay = baseStatReturn.isAkimbo ? overrideMod("AkimboFireDelay") : overrideMod("FireDelay");
            return Math.round(baseFireDelay * addMod("FireDelayMultiplier"));
        }();
        baseStatReturn.burstDelay = function () {
            const finalBurstDelay = baseStatReturn.fireType != "BURSTFIRE" ? 0 : overrideMod("BurstDelay") * addMod("BurstDelayMultiplier");
            return Math.round(finalBurstDelay);
        }();
        baseStatReturn.burstCount = overrideMod("BurstCount");
        baseStatReturn.displayBurstDelay = function () {
            if (baseStatReturn.burstCount == 1) {
                return 0;
            }
            return baseStatReturn.burstDelay;
        }();
        baseStatReturn.pelletCount = baseStatReturn.weaponClass == "SPREAD" ? overrideMod("PelletCount") : 1;
        baseStatReturn.effectivePelletCount = function () {
            const nativePelletCount = baseStatReturn.pelletCount;
            const maxDamagingPelletCount = overrideMod("MaxDamagingPelletCount");
            return maxDamagingPelletCount == 0 ? nativePelletCount : Math.min(maxDamagingPelletCount, nativePelletCount);
        }();
        baseStatReturn.shotgunDamageCap = overrideMod("ShotgunDamageCap");
        baseStatReturn.openBoltDelay = stateTimers.OpenBoltDelay;
        baseStatReturn.chargeType = overrideMod("ChargeType");
        baseStatReturn.baseChargeTime = (baseStatReturn.chargeType == "NONE") ? 0 : Math.round(overrideMod("ChargeTime") * 1000);
        baseStatReturn.chargeCooldown = (baseStatReturn.chargeType == "NONE") ? 0 : Math.round(overrideMod("ChargeCooldown") * 1000);
        baseStatReturn.chargeDamageMultiplier = overrideMod("ChargeDamageMultiplier");
        baseStatReturn.rechamberTime = weaponBaseStats.MustRechamber ? stateTimers.RechamberTime : 0;
        baseStatReturn.aimDownSightTime = Math.round((overrideMod("ADSViewInTime", false, 1000) / addMod("ADSSpeedMultiplier")) + (totalMod("ADSInFlatPenalty") * 1000));
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
        baseStatReturn.baseDamageProfile = JSON.parse(JSON.stringify(overrideMod("Damage"))); //[[Range1Start, Damage1], [R2S, D2], ...]
        baseStatReturn.wzDamageProfile = function() {
            const basiliskHack = baseLocalizedName == "Basilisk" ? true: false;
            const damageProfile = overrideMod("WzDamage", basiliskHack);
            return JSON.parse(JSON.stringify(damageProfile));
        }();
        baseStatReturn.damageTerminateAtRange = overrideMod("DamageTerminateAtRange");
        baseStatReturn.wzDamageTerminateAtRange = namedOverrideMod("WzDamageTerminateAtRange", "DamageTerminateAtRange");
        baseStatReturn.isLinearDamage = baseStatReturn.baseDamageProfile.length >= 3 && baseStatReturn.baseDamageProfile[baseStatReturn.baseDamageProfile.length - 2][1] == 0;
        baseStatReturn.baseHitboxMultipliers = function () {
            const multipliers = { ...overrideMod("DamageMultipliers") };
            const multiplierMultis = multiplyDeepMod("DamageMultiplierMultipliers");
            for (const [key, value] of Object.entries(multiplierMultis)) {
                multipliers[key] *= value;
            }
            return multipliers;
        }();
        baseStatReturn.wzHitboxMultipliers = function() {
            const multipliers = { ...namedOverrideMod("WzDamageMultipliers", "DamageMultipliers") };
            const multiplierMultis = multiplyDeepMod("DamageMultiplierMultipliers");
            for (const [key, value] of Object.entries(multiplierMultis)) {
                multipliers[key] *= value;
            }
            return multipliers;
        }();
        baseStatReturn.scopeMagnification = overrideMod("ScopeMagnification") || 1;
        baseStatReturn.idleSway = function() {
            const IdleSwayGunSizeScale = Math.max(addMod("IdleSwayGunSizeScale"), 0);
            const IdleSwayViewSizeScale = Math.max(addMod("IdleSwayViewSizeScale"), 0);
            const sway = { ...overrideMod("MacroIdleSway") };
            sway.Pitch *= IdleSwayGunSizeScale;
            sway.Yaw *= IdleSwayGunSizeScale;
            sway.ViewPitch *= IdleSwayViewSizeScale;
            sway.ViewYaw *= IdleSwayViewSizeScale;
            return sway;
        }();
        baseStatReturn.idleJitter = function() {
            const IdleSwayGunSizeScale = Math.max(addMod("IdleSwayGunSizeScale"), 0);
            const IdleSwayViewSizeScale = Math.max(addMod("IdleSwayViewSizeScale"), 0);
            const sway = { ...overrideMod("MicroIdleSway") };
            sway.Pitch *= IdleSwayGunSizeScale;
            sway.Yaw *= IdleSwayGunSizeScale;
            sway.ViewPitch *= IdleSwayViewSizeScale;
            sway.ViewYaw *= IdleSwayViewSizeScale;
            return sway;
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
                min: overrideMod("HipfireStandingMin") * hipfireMultiplier * addMod("HipfireStandingMinMultiplier"),
                moveMax: overrideMod("HipfireStandingMoveMax") * hipfireMultiplier * addMod("HipfireStandingMoveMaxMultiplier"),
                max: overrideMod("HipfireStandingMax") * hipfireMultiplier * addMod("HipfireStandingMaxMultiplier"),
                heightMultiplier: addMod("HipfireHeightMultiplier"),
                widthMultiplier: addMod("HipfireWidthMultiplier") 
            }
        }();
        baseStatReturn.aimOutTime = overrideMod("ADSViewOutTime", false, 1000) + (totalMod("ADSOutFlatPenalty") * 1000);
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
        baseStatReturn.isIncendary = overrideMod("Incendiary");
        baseStatReturn.usesHyperburst = overrideMod("HyperBurstEnabled");
        baseStatReturn.hyperBurstFireDelayMultiplier = overrideMod("HyperBurstFireDelayMultiplier");
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

        function namedOverrideMod(baseName, overrideName) {
            const overrideValue = modifiers?.overrides[overrideName]?.[1];
            return overrideValue ?? (weaponBaseStats[baseName] ?? false);
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

        function compileStateTimers(gunId, gun) {
            const alsoEquippedAttachments = selectedAttachmentIds.map(attachmentID => gun.SelectableAttachments[attachmentID].alsoEquips).filter(x => x);
            const alsoEquippedAttachmentIds = alsoEquippedAttachments.flatMap(obj => Object.keys(obj));
            const allActiveIds = activeAttachmentIds.concat(alsoEquippedAttachmentIds);
            const type = alt ? "AlternateFireModeAnimationOverrides" : "PrimaryFireModeAnimationOverrides";
            const stateTimers = Object.assign({}, gun.StateTimers);
            const activeOverrides = (gun?.AttachmentAnimationPackages ?? []).filter(packageIsActive);
            return activeOverrides.reduce((acc, animPackage) => Object.assign(acc, animPackage[type]), stateTimers);
    
            function packageIsActive(animationPackage) {
                return animationPackage.ListOfAttachmentMatchings.reduce((isActive, listOfMatchingAttachments) => {
                    return isActive && (listOfMatchingAttachments.filter(attachmentId => allActiveIds.includes(attachmentId))).length > 0;
                }, true);
            }
        }

        //returns object containing properties 'overrides' and 'scalars' which are objects with keys correlating to stats
        //.overrides values are 2 member array, [0] being lowest priority and [1] being highest
        //.scalars values are arrays of all scalar values
        function compileModifiers(gunId) {
            const overrides = {}; // { OverridenStat1: [[value1, priority1], [v2, p2], ...], OS2: [], ... }
            const scalars = {}; // { ScalarStat1: [value1, v2, ...], SS2: [], ...}
            const others = {}; // { ScalarStat1: [value1, v2, ...], SS2: [], ...}
            const specialties = new Set();
            let hasAltFire = false;
            for (const [attachmentId, attachment] of Object.entries(allAttachments)) {
                if (!activeAttachmentIds.includes(attachmentId)) {
                    continue;
                }
                if (attachment.alsoEquips) {
                    for (const alsoEquipped of Object.values(attachment.alsoEquips)) {
                        const attachmentType = alsoEquipped.AttachmentType;
                        if (attachmentType == "ATTACHMENT_UNDERBARREL") {
                            hasAltFire = true;
                        }
                        if (alt || attachmentType != "ATTACHMENT_UNDERBARREL") {
                            addAttachmentStats(alsoEquipped);
                        }
                    }
                }
                const attachmentType = attachment.AttachmentType;
                if (attachmentType == "ATTACHMENT_UNDERBARREL") {
                    hasAltFire = true;
                }
                if (alt || attachmentType != "ATTACHMENT_UNDERBARREL") {
                    addAttachmentStats(attachment, Object.keys(attachment.comboOverrides ?? {}).filter(overrideTrigger => activeAttachmentIds.includes(overrideTrigger))[0]);
                }
            }
    
            const minMaxOverrides = {};
            for (const [key, value] of Object.entries(overrides)) {
                value.sort((a, b) => {
                    return a[1] - b[1];
                });
                minMaxOverrides[key] = [value[0][0], value[value.length - 1][0]];
            }
    
            return { overrides: minMaxOverrides, scalars: scalars, specialties: specialties, others: others, hasAltFire: hasAltFire };
    
            function addAttachmentStats(originalAttachment, comboOverrideKey) {
                const attachment = originalAttachment?.comboOverrides?.[comboOverrideKey] ?? originalAttachment;
                const overrideStats = attachment?.OverrideStats ?? {};
                for (const [overrideName, overrideValue] of Object.entries(overrideStats)) {
                    overrides[overrideName] ??= [];
                    overrides[overrideName].push([overrideValue, attachment.Priority]);
                }
                const scalarStats = attachment?.ScalarStats ?? {};
                for (const [scalarName, scalarValue] of Object.entries(scalarStats)) {
                    scalars[scalarName] ??= [];
                    scalars[scalarName].push(scalarValue);
                }
                const otherStats = attachment?.OtherStats ?? {};
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

    #compileVariableStats = function() {
        const constantStats = this.#constantStats;
        const statReturn = {};
        statReturn.meleeHitsToKill = function () {
            let htk = Math.ceil(Health.totalHealth / constantStats.meleeDamage);
            return constantStats.canMeleeCrit ? Math.min(htk, constantStats.meleeHitsToCrit) : htk;
        }();
        statReturn.effectiveChargeTime = Math.round(constantStats.baseChargeTime * ((constantStats.chargeType == "CHARGEANDRELEASE") ? this.#chargeAmount : 1));
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
        statReturn.effectiveChargeDamageMultiplier = (constantStats.chargeType != "CHARGEANDRELEASE") ? 1 : this.#chargeAmount * (constantStats.chargeDamageMultiplier - 1) + 1;
        statReturn.hitboxMultipliers = function () {
            if (Health.maxArmor <= 0) { //hack
                return constantStats.baseHitboxMultipliers;
            }
            return constantStats.wzHitboxMultipliers;
        }();
        statReturn.weaponDamage = function () {
            //Returns array in format of [[StartRange1, Damage1], ...]
            let damage = constantStats.wzDamageProfile;
            let damageTerminateAtRange = constantStats.wzDamageTerminateAtRange;
            if (Health.maxArmor <= 0) { //hack
                damage = constantStats.baseDamageProfile;
                damageTerminateAtRange = constantStats.damageTerminateAtRange;
            }
            const damageRangeMultiplier = constantStats.damageRangeMultiplier;
            damageTerminateAtRange = damageTerminateAtRange * damageRangeMultiplier;
            damage = JSON.parse(JSON.stringify(damage));
            if (damageTerminateAtRange > 0) {
                damage = damage.filter(([startRange, thisDamage]) => {
                    return startRange < damageTerminateAtRange;
                });
                damage.push([damageTerminateAtRange, 0]);
            }
            const baseDamageMultiplier = constantStats.baseDamageMultiplier;
            const isLinear = constantStats.isLinearDamage;

            damage.forEach(([range, damageValue], index) => {
                damage[index] = [range * damageRangeMultiplier * 0.0254, Math.round(damageValue * baseDamageMultiplier)];
            });

            if (isLinear) {
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

            return damage.filter(([range, damageValue], index, array) => {
                if (index == 0) {
                    return true;
                }
                const previousEntry = array[index - 1];
                const previousDamage = previousEntry[1];
                return damageValue != previousDamage;
            });
        }();
        return statReturn;
    }

    aimAtTarget(rangeMeters) {
        const constantStats = this.#constantStats;
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

    movementSpeed(ads = false) {
        const constantStats = this.#constantStats;
        const { movementSpeedHipForward, movementSpeedHipStrafe, movementSpeedHipBackpedal, movementSpeedSprint, movementSpeedTacticalSprint, movementSpeedADSForward, movementSpeedADSStrafe, movementSpeedADSBackpedal } = constantStats;
        return {
            "forward": ads ? movementSpeedADSForward : movementSpeedHipForward,
            "strafe": ads ? movementSpeedADSStrafe : movementSpeedHipStrafe,
            "backpedal": ads ? movementSpeedADSBackpedal : movementSpeedHipBackpedal,
            "sprint": ads ? 0 : movementSpeedSprint,
            "tacsprint": ads ? 0 : movementSpeedTacticalSprint
        };
    }
    
    ttkFromShotCount(shotCount) {
        if (shotCount <= 0) {
            return -1;
        }
        const { isAkimbo, fireDelay, openBoltDelay, burstDelay, burstCount, rechamberTime, effectiveChargeTime, chargeCooldown, fireType, usesHyperburst, magazineSize, reloadEmptyTime } = this.stats;
        let ttk = 0;

        const triggerPulls = isAkimbo ? Math.ceil(shotCount / 2) : shotCount;

        const fireDelays = usesHyperburst ? triggerPulls - 2 : triggerPulls - 1;
        const reloads = Math.ceil(triggerPulls / magazineSize) - 1;
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
                const burstDelays = Math.ceil(triggerPulls / burstCount) - 1;
                ttk += burstDelays * burstDelay;
                ttk += burstDelays * openBoltDelay;
                break;
            case "DOUBLEBARREL":
                const rechamberTimes = Math.ceil(triggerPulls / 2) - 1;
                ttk += rechamberTimes * rechamberTime
                break;
            default:
                break;
        }
        return ttk;
    }
}

function damageToLocation(baseDamage, location, stats) {
    const { hitboxMultipliers, effectiveChargeDamageMultiplier, minWzDamage, maxWzDamage, wzBtkShift, effectivePelletCount, shotgunDamageCap } = stats;
    const multiplier = hitboxMultipliers[location];
    const normalDamage = Math.trunc(Math.fround(baseDamage * multiplier));
    if (normalDamage <= 0) {
        return normalDamage;
    }
    const chargedDamage = normalDamage * effectiveChargeDamageMultiplier;
    const clampedDamage = wzClampDamage(chargedDamage, minWzDamage, maxWzDamage);
    const shiftedDamage = wzShiftBTK(clampedDamage, wzBtkShift, Health.totalHealth);
    const shotgunDamage = spreadDamage(shiftedDamage, effectivePelletCount, shotgunDamageCap);
    return Math.min(shotgunDamage, 299);
}

function wzClampDamage(baseDamage, minWzDamage, maxWzDamage) {
    if (Health.maxArmor <= 0) { //hack
        return baseDamage;
    }
    let damage = baseDamage;
    if (minWzDamage > 0) {
        damage = Math.max(damage, minWzDamage);
    }
    if (maxWzDamage > 0) {
        damage = Math.min(damage, maxWzDamage);
    }
    return damage;
}

function wzShiftBTK(originalDamage, btkShift, maxHp) {
    if (Health.maxArmor <= 0) { //hack
        return originalDamage;
    }
    if (btkShift == 0) {
        return originalDamage;
    }
    const currentBTK = Math.ceil(maxHp / originalDamage);
    return Math.ceil(maxHp / (currentBTK + btkShift));
}

function spreadDamage(damage, pelletCount, damageCap) {
    if (pelletCount <= 1) {
        return damage;
    }
    let totalShotgunDamage = damage * pelletCount;
    if (damageCap > 0) {
        totalShotgunDamage = Math.min(totalShotgunDamage, damageCap);
    }
    return totalShotgunDamage;
}