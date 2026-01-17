import * as SelectedGuns from "./selectedGuns.js";

const $rangeSelector = $("#mw2-damageLabelDistance");
createDamageLabelSoldier();
$rangeSelector.change(updateLabels);

export function updateSelector() {
    //Save current selected index
    const selectedDamageRangeIndex = $rangeSelector[0].selectedIndex + 1 || 1;

    //clear list and populate it with new values
    $rangeSelector.empty()
    const rangeBreakpoints = SelectedGuns.getCurrentGun().weaponObject.rangeBreakpoints;
    const damageDistances = createRangeSelectorOptions(rangeBreakpoints);
    $rangeSelector.html(damageDistances);

    //select previously selected range and trigger update
    if ($("#mw2-damageLabelDistance option").length < selectedDamageRangeIndex){
        $("#mw2-damageLabelDistance option:last").prop('selected', true).change();
    } else {
        $("#mw2-damageLabelDistance :nth-child(" + selectedDamageRangeIndex + ")").prop('selected', true).change();
    }
}

function createRangeSelectorOptions(rangeBreakpoints) {
    return rangeBreakpoints.map((range, index, array) => {
        const startDistance = roundToDecimal(range, 1);
        let dropdownText;
        if (index + 1 < array.length) {
            const endDistance = roundToDecimal(array[index + 1], 1);
            dropdownText = `${startDistance}m - ${endDistance}m`;
        } else {
            dropdownText = `${startDistance}m+`;
        }
        return new Option(dropdownText, range);
    });
}

function updateLabels() {
    const range = $rangeSelector.val();
    const damages = SelectedGuns.getCurrentGun().weaponObject.locDamageMapAtRange(range);
    for (const [location, damage] of Object.entries(damages)) {
        $(".mw2-damageLabels .mw2-dmgLabel-" + location).text(damage);
    }
}

export function clearAndReset() {
    $("#mw2-damageLabelDistance option:first").prop('selected', true);
    $(".mw2-damageLabels text").text("");
}

function createDamageLabelSoldier() {
    $(".mw2-locational-damage-guy .mw2-guy").clone().prependTo(".mw2-damageLabels");
    $(".mw2-damageLabels path").removeAttr("id").removeClass("mw2-bodyPart--selected");
}