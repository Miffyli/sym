import * as SelectedGuns from "./selectedGuns.js";
import * as HoverStats from "./hoverStats.js";
import * as DamageSoldier from "./damageSoldier.js";
import * as Gunsmith from "./gunsmith.js";
import * as Charts from "./chartsManager.js";
import * as Viewport from "./viewport.js";
import * as WeaponSelect from "./weaponSelect.js";

const newWeaponText = "[New Weapon]";
export const maxWeaponCount = 7;
const $addNewTab = $(".mw2-weapon-tabs__add-new");
const $cloneButton = $("#mw2-clone-gun-button");
const $deleteButton = $("#mw2-delete-gun-button");
initializeWeaponTabClick();
initializeNewWeaponTabClick();
initializeAddNewTab();
initializeDeleteGunButton();
initializeCloneGunButton();

function initializeAddNewTab(){
    $addNewTab.click(function() {
        Viewport.scrollToElement($(".mw2-gunsmith__top"));
        const $newWeaponTab = $(".mw2-weapon-tabs__new-weapon");
        if ($newWeaponTab.length > 0){
            $newWeaponTab.effect("highlight").click();
            return;
        }
        const newTab = $("<div>", { class: "mw2-weapon-tabs__tab mw2-weapon-tabs__new-weapon", text: newWeaponText });
        newTab.insertBefore(this);
        newTab.click();
    });
}

function initializeNewWeaponTabClick() {
    $(".mw2-weapon-tabs").on("click", ".mw2-weapon-tabs__new-weapon", function() {
        Viewport.scrollToElement($(".mw2-gunsmith__top"));
        const $element = $(this);
        $(".mw2-weapon-tabs__tab").removeClass("mw2-weapon-tabs__tab--selected");
        $element.addClass("mw2-weapon-tabs__tab--selected");
        updateTabManipulationAvailability();
        Gunsmith.newWeaponState();
        SelectedGuns.selectGunByIndex(-1);
        WeaponSelect.updateGunSelectValue();
        $(".enabledElement").addClass("disabledElement").removeClass("enabledElement");
    });
}

function initializeWeaponTabClick() {
    $(".mw2-weapon-tabs").on("click", ".mw2-weapon-tabs__weapon", function() {
        const $element = $(this);
        if ($element.hasClass("mw2-weapon-tabs__tab--selected")) {
            Viewport.scrollToElement($(".mw2-gunsmith__top"));
            return;
        }
        $(".mw2-weapon-tabs__tab").removeClass("mw2-weapon-tabs__tab--selected");
        $element.addClass("mw2-weapon-tabs__tab--selected");
        updateTabManipulationAvailability();
        SelectedGuns.selectGunByName($element.text());
        WeaponSelect.updateGunSelectValue();
        HoverStats.clearHoverStats();
        DamageSoldier.clearAndReset();
        Gunsmith.populateGunsmith();
        Gunsmith.loadCurrentWeapon();
    });
}

function initializeCloneGunButton(){
    $cloneButton.click(function() {
        if ($cloneButton.hasClass("disabledButton")) {
            return;
        }
        const { gunId, selectedAttachments, altFire } = SelectedGuns.getCurrentGun().weaponObject;
        $addNewTab.click();
        SelectedGuns.addGunToSelectedGuns(gunId, selectedAttachments, altFire);
        WeaponSelect.updateGunSelectValue();
        HoverStats.clearHoverStats();
        Gunsmith.populateGunsmith();
        Gunsmith.loadCurrentWeapon();
        Charts.updateAllCharts();
    })
}

function initializeDeleteGunButton(){
    $deleteButton.click(function() {
        if ($deleteButton.hasClass("disabledButton")) {
            return;
        }
        const $selectedTab = $(".mw2-weapon-tabs__tab--selected");
        if (!$selectedTab.hasClass("mw2-weapon-tabs__new-weapon")) {
            SelectedGuns.selectedGuns.splice(SelectedGuns.selectedGunIndex, 1);
            Charts.updateAllCharts();
        }
        const selectPreviousTab = $selectedTab.next().hasClass("mw2-weapon-tabs__add-new");
        const selectedTabAfterDelete = selectPreviousTab ? $selectedTab.prev() : $selectedTab.next();
        $selectedTab.remove();
        $(selectedTabAfterDelete).click();
    })
}

export function updateCurrentTab() {
    const $currentTab = $(".mw2-weapon-tabs__tab--selected");
    $currentTab.removeClass("mw2-weapon-tabs__new-weapon");
    $currentTab.addClass("mw2-weapon-tabs__weapon");
    $currentTab.text(SelectedGuns.getCurrentGun().name);
    updateTabManipulationAvailability();
}

function updateTabManipulationAvailability() {
    const $selectedTab = $(".mw2-weapon-tabs__tab--selected");
    const $newWeaponTab = $(".mw2-weapon-tabs__new-weapon");
    const newWeaponTabSelected = $selectedTab.hasClass("mw2-weapon-tabs__new-weapon");
    const hideNewTab = SelectedGuns.selectedGuns.length + $newWeaponTab.length >= maxWeaponCount || SelectedGuns.selectedGuns.length < 1;
    $addNewTab.toggle(!hideNewTab);
    const preventCopy = newWeaponTabSelected || SelectedGuns.selectedGuns.length >= maxWeaponCount;
    $cloneButton.toggleClass("disabledButton", preventCopy);
    const allowDelete = SelectedGuns.selectedGuns.length > 1 || (SelectedGuns.selectedGuns.length > 0 && newWeaponTabSelected);
    $deleteButton.toggleClass("disabledButton", !allowDelete);
}