import * as SelectedGuns from "./selectedGuns.js";
import { MW2Data } from "../data/mw2_data.js";
import { mw2AutofillBuilds } from "./recommendedBuilds/autofill_builds.js";
import * as HoverStats from "./hoverStats.js";
import * as DamageSoldier from "./damageSoldier.js";
import * as ShareCodes from "./shareCodes.js";
import * as WeaponBuilder from "./weaponBuilder.js";
import * as Gunsmith from "./gunsmith.js";
import * as Charts from "./chartsManager.js";

const $buildSelect = $('#mw2-build-select');
$buildSelect.change(loadSelectedBuild);

function loadSelectedBuild() {
    HoverStats.clearHoverStats();
    DamageSoldier.clearAndReset();
    const value = $buildSelect.val();
    const gunId = SelectedGuns.getCurrentGun().weaponObject.gunId;
    const attachments = ShareCodes.parseUrlCode(value)?.[0]?.attachmentIds ?? [];
    SelectedGuns.getCurrentGun().weaponObject = new WeaponBuilder.Gun(gunId, attachments);
    Gunsmith.loadCurrentWeapon();
    Charts.updateAllCharts();
}

export function populateRecommendedBuildDropdown() {
    const gunId = SelectedGuns.getCurrentGun().weaponObject.gunId;
    const builds = (mw2AutofillBuilds[gunId]?.builds ?? []).map((build) => {
        return new Option(build.Build_Name, build.Loadout_URL);
    });
    builds.unshift(new Option("--- Recommended Builds ---", "none"));
    $buildSelect.html(builds);
    if (builds.length > 1) {
        $buildSelect.removeAttr("disabled").removeClass("mw2-disabled-select");
    } else {
        $buildSelect.attr("disabled", "disabled").addClass("mw2-disabled-select");
    }
}

export function selectMatchingBuild() {
    const currentGun = SelectedGuns.getCurrentGun();
    const { gunId, selectedAttachments } = currentGun.weaponObject;
    const uiName = currentGun.name;
    const baseWeaponName = MW2Data[gunId].BaseWeaponName;
    const attachmentString = selectedAttachments.toString();
    $(".mw2-build-details__name").text(uiName);
    $("#mw2-build-details__description").text(baseWeaponName);
    if (mw2AutofillBuilds[gunId]?.builds.length > 0) {
        const matchingBuild = mw2AutofillBuilds[gunId].builds.find(build => attachmentString == ShareCodes.parseUrlCode(build.Loadout_URL)[0].attachmentIds.sort());
        const selectorValue = matchingBuild?.Loadout_URL ?? "none";
        $("#mw2-build-select").val(selectorValue);
        if (selectorValue != "none") {
            $(".mw2-build-details__name").text(uiName + " - " + matchingBuild.Build_Name);
            $("#mw2-build-details__description").text(baseWeaponName + " • Author: " + matchingBuild.Creator_Name + " • Updated: " + matchingBuild.Last_Updated);
        }
    }
}