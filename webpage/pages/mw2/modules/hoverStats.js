import { mw2StatFormat } from "./localization.js";;
import * as StatsObjects from "./statsObject.js";
import * as WeaponBuilder from "./weaponBuilder.js";
import * as Gunsmith from "./gunsmith.js";

const mw2HoverStatsEntries = [
    "rateOfFire",
    "preFireDelay",
    "muzzleVelocity",
    "displayBurstDelay",
    "pelletCount",
    "magazineSize",
    "reloadTime",
    "reloadAddTime",
    "reloadEmptyTime",
    "reloadEmptyAddTime",
    "rechamberTime",
    "aimDownSightTime",
    "aimOutTime",
    "fov",
    "dropTime",
    "raiseTime",
    "sprintToFire",
    "tacSprintToFire",
    "meleeDamage",
    "meleeHitsToKill",
    "meleeLungeDistanceInches",
    "tacSprintDuration",
    "viewCenterSpeed",
    "gunCenterSpeed",
    "viewKickPitchMultiplier",
    "viewKickYawMultiplier",
    "gunKickPitchMultiplier",
    "gunKickYawMultiplier",
    "initialRecoilEndCount",
    "initialGunKickMultiplier",
    "initialViewKickMultiplier",
    "sustainedRecoilStartCount",
    "sustainedGunKickMultiplier",
    "sustainedViewKickMultiplier",
    "adsSpread",
    "hipfireStandMin",
    "hipfireStandMoveMax",
    "hipfireStandMax",
    "damageRangeMultiplier",
    "movementSpeedHipForward",
    "movementSpeedHipStrafe",
    "movementSpeedTacticalSprint",
    "movementSpeedADSStrafe",
    "crouchViewKickMultiplier",
    "crouchGunKickMultiplier",
    "proneViewKickMultiplier",
    "proneGunKickMultiplier",
    "idleSwayWidth",
    "idleSwayHeight",
    "gunBobWidth",
    "gunBobHeight"
];

export function writeHoverStats(currentGun, name, hoveredSlot, hoveredAttachmentID) {
    const selectedAttachments = Gunsmith.findAttachmentSelectorValues(hoveredSlot)
    selectedAttachments.push(hoveredAttachmentID);
    const resultingGun = new WeaponBuilder.Gun(currentGun.weaponObject.gunId, selectedAttachments, currentGun.weaponObject.altFire);
    const resultingGunUIStats = StatsObjects.createUIWeaponStatsObj(resultingGun);
    const currentGunUIStats = StatsObjects.createUIWeaponStatsObj(currentGun.weaponObject);

    $(".mw2-attachment-details-box table thead").html(`<tr><th colspan="2">${name}</th></tr>`);

    const htmlToInsert = mw2HoverStatsEntries.map(stat => {
        if (resultingGunUIStats.getStat(stat) != currentGunUIStats.getStat(stat)) {
            return generateHoverStatTableRow(stat, resultingGunUIStats.getStat(stat), currentGunUIStats);
        }
    }).join("") + writeQualitativeHoverData(currentGunUIStats.qualitative, resultingGunUIStats.qualitative);
    $('.mw2-attachment-details-box table tbody').html(htmlToInsert);
}

export function clearHoverStats() {
    $("#mw2-hovered-attachment-name").text("");
    $('.mw2-attachment-details-box table *').empty();
}

function generateHoverStatTableRow(stat, value, currentGunUIStats) {
    const [decimal, unit, friendlyName, betterDirection] = mw2StatFormat[stat];
    const difference = roundToDecimal((value - currentGunUIStats.getStat(stat)), decimal);
    let differenceText = (difference > 0) ? "+" + difference : difference;
    let colorClass = "mw2-yellowText"
    if (betterDirection != 0) {
        colorClass = Math.sign(difference) == betterDirection ? "mw2-greenText" : "mw2-redText";
    }
    if (stat === "muzzleVelocity" && value < 0) {
        colorClass = "mw2-greenText"
        differenceText = "∞"
    }
    return "<tr><td>" + friendlyName + "</td><td class='" + colorClass + " '>" + differenceText + unit + "</td>";
}

function writeQualitativeHoverData(qualitativeOld, qualitativeNew) {
    let returnString = "";
    //damage
    var colorClass
    var damage = "Same"
    if (qualitativeNew.baseDamageMultiplier > qualitativeOld.baseDamageMultiplier) {
        damage = "Increased"
    }
    if (qualitativeNew.baseDamageMultiplier < qualitativeOld.baseDamageMultiplier) {
        damage = "Decreased"
    }
    if (qualitativeNew.bodyBTKShiftCount < qualitativeOld.bodyBTKShiftCount) {
        damage = "Increased"
    }
    if (qualitativeNew.bodyBTKShiftCount > qualitativeOld.bodyBTKShiftCount) {
        damage = "Decreased"
    }
    if (damage != "Same") {
        colorClass = (damage == "Increased") ? "mw2-greenText" : "mw2-redText";
        returnString += "<tr><td>Damage</td><td class='" + colorClass + " '>" + damage + "</td>";
    }
    //damage profile
    if (JSON.stringify(qualitativeOld.baseDamageProfile) != JSON.stringify(qualitativeNew.baseDamageProfile)) {
        returnString += "<tr><td>Damage Profile</td><td class=' '>Changed</td>";
    }
    //hitbox profile
    if (JSON.stringify(qualitativeOld.hitboxMultipliers) != JSON.stringify(qualitativeNew.hitboxMultipliers)) {
        returnString += "<tr><td>Hitbox Profile</td><td class=' '>Changed</td>";
    }
    return returnString;
}