import { MW2Data } from "../data/mw2_data.js";
import * as SelectedGuns from "./selectedGuns.js";
import * as QuickStats from "./quickStats.js";
import * as StatComparisonTable from "./statComparisonTable.js";
import * as DamageSoldier from "./damageSoldier.js";
import * as ViewportSimulations from "./viewportSimulations.js";
import * as ShareCodes from "./shareCodes.js";
import * as TTKProbability from "./ttkProbability.js";
import * as HoverStats from "./hoverStats.js";
import * as WeaponBuilder from "./weaponBuilder.js";
import * as Charts from "./chartsManager.js";
import * as RecommendedBuilds from "./recommendedBuilds.js";
import * as MobileDetection from "./mobileDetection.js";

const attachmentCategories = {
    "frontpiece" : "Barrel",
    "cable" : "Cable",
    "backpiece" : "Stock",
    "arms" : "Arms",
    "magazine" : "Magazine",
    "loader" : "Loader",
    "bolt" : "Bolt",
    "muzzle" : "Muzzle",
    "reargrip": "Rear Grip",
    "extra": "Laser",
    "extrapstl": "Laser",
    "optic" : "Optic",
    "gunperk" : "Ammunition",
    "gunperk2" : "Perk 2",
    "undermount" : "Underbarrel",
    "unique": "?",
    "ammunition": "Ammunition",
    "trigger": "Trigger Action",
    "pump": "Pump",
    "pumpgrip": "Pump Grip",
    "guard": "Guard",
    "rail": "Rail",
    "comb": "Comb",
    "lever": "Lever"
};

const noneOption = "<option value='none'>---- None ----</option>";

export function init() {
    initializeRenameButton();
    initializeRenameGunInput();
    initializeAttachmentSelects();
    attachmentSelect2Setup();
    initializeAltFireSwitch();
}

export function populateGunsmith(){
    $(".disabledElement").addClass("enabledElement").removeClass("disabledElement");
    $(".mw2-build-details").css("visibility", "visible");
    loadWeaponImage();
    populateAttachmentDropdowns();
    RecommendedBuilds.populateRecommendedBuildDropdown();
}

function loadWeaponImage() {
    const gunId = SelectedGuns.getCurrentGun().weaponObject.gunId;
    const $image = $("#mw2-weapon-img");
    $image.on("error", function() {
        $image.off("error");
        $image.attr("src", `./pages/mw2/img/weaponNoImage.png`);
    });
    $image.attr("src", `./pages/mw2/img/weapon/${gunId}.png`);
}

function populateAttachmentDropdowns(){
    const $attachmentSelects = $(".mw2-attachment-selector select");
    $attachmentSelects.html(noneOption);

    const gunId = SelectedGuns.getCurrentGun().weaponObject.gunId;
    const selectableAttachments = MW2Data[gunId].SelectableAttachments ?? {};

    const attachmentOptions = {};
    for (const [attachmentId, attachment] of Object.entries(selectableAttachments)) {
        const { Slot, LocalizedName } = attachment;
        const selectId = `#mw2-${Slot}`;
        attachmentOptions[selectId] ??= [new Option(`--- ${attachmentCategories[Slot]} ---`, "none")];
        attachmentOptions[selectId].push(new Option(LocalizedName, attachmentId));
    }

    Object.entries(attachmentOptions).forEach(([selectId, options]) => {
        $(selectId).html(options);
    })

    // hide dropdowns that are used as spacers
    $attachmentSelects.each(function(index, element) {
        const $element = $(element);
        if ($element.find("option").length <= 1){
            MobileDetection.isMobile ? $element.hide() : $element.next(".select2-container").hide();
        } else {
            MobileDetection.isMobile ? $element.show() : $element.next(".select2-container").show();
        }
    });
}

export function loadCurrentWeapon(){
    updateAttachmentSelectors();
    disableConflictingAttachments();
    updateEquippedCount();
    disabledAttachmentsIfMaxed();
    updateAltFireSelector();
    RecommendedBuilds.selectMatchingBuild();
    ShareCodes.updateSharingUrls();
    QuickStats.loadQuickStatsIntoTable();
    DamageSoldier.updateSelector();
    StatComparisonTable.update(false);
    ViewportSimulations.updateOpticName();
    ViewportSimulations.update();
    TTKProbability.updateSliderMax();
}

function updateAttachmentSelectors() {
    const $attachmentSelects = $('.mw2-attachment-selector select');
    $attachmentSelects.val("none");
    $(".mw2-attachment--equipped").removeClass("mw2-attachment--equipped");
    const attachmentIds = SelectedGuns.getCurrentGun().weaponObject.selectedAttachments;
    attachmentIds.forEach(attachment => {
        const $select = $attachmentSelects.find(`option[value="${attachment}"]`).parent();
        $select.val(attachment);
        $select.addClass("mw2-attachment--equipped");
        $select.siblings("span").addClass("mw2-attachment--equipped");
    })
    $attachmentSelects.trigger("change.select2"); //tell select2 to update gun labels
}

function disableConflictingAttachments() {
    $('.mw2-attachment-selector select > option').removeAttr('disabled');
    const conflictList = SelectedGuns.getCurrentGun().weaponObject.conflictingAttachments;
    conflictList.forEach((conflictingID) => {
        $('.mw2-attachment-selector option[value="' + conflictingID + '"]').attr('disabled', 'disabled');
    });
}

function updateEquippedCount(){
    const $attachmentSelects = $('.mw2-attachment-selector select');
    const weaponObject = SelectedGuns.getCurrentGun().weaponObject;
    const gunId = weaponObject.gunId
    const maxAttachments = MW2Data[gunId].MaxAttachments;
    const equippedCount = weaponObject.selectedAttachments.length;
    let populatedSlots = 0;
    $attachmentSelects.each(function(index, element) {
        if ($(element).find("option").length > 1){
            populatedSlots++;
        }
    });
    const realMax = Math.min(maxAttachments, populatedSlots);

    const $equippedcount = $(".mw2-equipped-count");
    const $dots = $(".mw2-equipped-count__dots > div");
    if (realMax > 0) {
        $("#mw2-equipped-count__label").text("Equipped " + equippedCount + "/" + realMax);
        $equippedcount.css("visibility", "visible");
        $dots.css("visibility", "hidden").removeClass("mw2-equipped-count__dots--equipped");
        $dots.slice(0, equippedCount).addClass("mw2-equipped-count__dots--equipped");
        $dots.slice(0, realMax).css("visibility", "visible");
    } else {
        $equippedcount.css("visibility", "hidden");
        $dots.css("visibility", "hidden");
    }
}

function disabledAttachmentsIfMaxed() {
    const $attachmentSelects = $('.mw2-attachment-selector select');
    const weaponObject = SelectedGuns.getCurrentGun().weaponObject;
    const gunId = weaponObject.gunId
    const maxAttachments = MW2Data[gunId].MaxAttachments;
    const equippedCount = weaponObject.selectedAttachments.length;
    $attachmentSelects.removeAttr("disabled").removeClass("mw2-disabled-select");
    if (equippedCount >= maxAttachments){
        $attachmentSelects.each(function(index, element) {
            const $element = $(element);
            if ($element.val() == "none") {
                $element.attr("disabled", "disabled").addClass("mw2-disabled-select");
            }
        })
    }
}

export function findAttachmentSelectorValues(ignoreSlot = false) {
    const $attachmentSelects = $('.mw2-attachment-selector select');
    const selectedAttachments = [];
    $attachmentSelects.each(function (index, element) {
        const $element = $(element);
        const attachmentSlot = $element.attr("name");
        const attachmentId = $element.val();
        if (attachmentId !== "none" && attachmentSlot != ignoreSlot) {
            selectedAttachments.push(attachmentId);
        }
    });
    return selectedAttachments;
}

function initializeAttachmentSelects() {
    // Attachment Select Handler
    $('.mw2-attachment-selector select').on('change', function () {
        if (MobileDetection.isMobile) {
            const hoveredAttachmentID = $(this).val();
            const hoveredSlot = $(this).attr("id");
            const name = $(this).find("option:selected").text();
            HoverStats.writeHoverStats(SelectedGuns.getCurrentGun(), name, hoveredSlot, hoveredAttachmentID);
        }
        const selectedAttachments = findAttachmentSelectorValues();

        //Create weapon object including selected attachments
        const currentGun = SelectedGuns.getCurrentGun().weaponObject;
        SelectedGuns.getCurrentGun().weaponObject = new WeaponBuilder.Gun(currentGun.gunId, selectedAttachments, currentGun.altFire);
        loadCurrentWeapon();
        Charts.updateAllCharts();
    });
}

function attachmentSelect2Setup() {
    const $attachmentSelects = $('.mw2-attachment-selector select');
    if (MobileDetection.isMobile) {
        return;
    }
    $attachmentSelects.select2({
        width: '175px',
        minimumResultsForSearch: -1,
        dropdownParent: $('.mw2-gunsmith')
    })

    $attachmentSelects.each(function(index, element) {
        const $element = $(element);
        $element.next(".select2-container").hide();
    });
    
    $(document).on("mouseover", ".select2-results__option", function() {
        const $element = $(this);
        const idArray = $element.attr("id").split("-")
        const hoveredAttachmentID = idArray[5];
        const hoveredSlot = "mw2-" + idArray[2];
        const name = $element.text();
        HoverStats.writeHoverStats(SelectedGuns.getCurrentGun(), name, hoveredSlot, hoveredAttachmentID);
    })
}

export function newWeaponState() {
    $('#mw2-weapon-img').attr("src", "./pages/mw2/img/weaponSelect.png");
    $(".mw2-attachment-selector select").hide();
    $(".mw2-attachment-selector .select2-container").hide();
    $(".mw2-equipped-count").css("visibility", "hidden");
    $(".mw2-equipped-count__dots > div").css("visibility", "hidden");
    $(".mw2-build-details").css("visibility", "hidden");
    $(".mw2-loadout-url-box").css("visibility", "hidden");
    $(".mw2-alt-fire-switch").parent().parent().parent().parent().hide();
    const $buildSelect = $('#mw2-build-select');
    $buildSelect.attr("disabled", "disabled").addClass("mw2-disabled-select");
}

function initializeRenameButton() {
    $(".mw2-build-details__rename img").click(function() {
        $("#mw2-gun-name-input").attr("placeholder", SelectedGuns.getCurrentGun().name).val("");
        $(".mw2-build-details__rename-modal").toggleClass("mw2-build-details__rename-modal--show");
        $(".mw2-build-details__rename-modal--show #mw2-gun-name-input").focus();
    });
    $(".mw2-build-details__rename").click(function(event) {
        event.stopPropagation();
    });
    $("body").click(function(){
        $(".mw2-build-details__rename-modal").removeClass("mw2-build-details__rename-modal--show")
    });  
}

function initializeRenameGunInput() {
    $("#mw2-gun-name-input").on("change", function() {
        const newName = $(this).val();
        const usedNames = SelectedGuns.selectedGuns.map((gun) => {
            return gun.name;
        });
        //prevent duplicate and blank names
        if (!usedNames.includes(newName) && newName != "") {
            SelectedGuns.getCurrentGun().name = newName;
            $(".mw2-weapon-tabs__tab").eq(SelectedGuns.selectedGunIndex).text(newName);
            $(".mw2-build-details__name").text(newName);
            Charts.updateAllCharts();
        }
        StatComparisonTable.updateHeaders();
        $(".mw2-build-details__rename-modal").removeClass("mw2-build-details__rename-modal--show")
    });
}

let warned = false;
function initializeAltFireSwitch() {
    $(".mw2-alt-fire-switch").click(function() {
        if (!warned) {
            alert("Alternate fire modes may be buggy. Explosives are not supported. Please report any other bugs you find on Discord!");
            warned = true;
        }
        changeFireMode();
    })
}

function changeFireMode() {
    const currentGun = SelectedGuns.getCurrentGun();
    currentGun.weaponObject = currentGun.weaponObject.switchFireMode();
    currentGun.baseWeaponObject = currentGun.weaponObject.createBaseGun();
    loadCurrentWeapon();
    Charts.updateAllCharts();
}

function updateAltFireSelector() {
    const $container = $(".mw2-alt-fire-switch").parent().parent().parent().parent();
    const weapon = SelectedGuns.getCurrentGun().weaponObject;
    const altFireAvailable = weapon.hasAltFire;
    $container.toggle(altFireAvailable);
    const usingAltFire = weapon.altFire;
    $(".mw2-alt-fire-switch .mw2-toggle-switch__switch").toggleClass("mw2-toggle-switch__switch--active", usingAltFire);
}