import { MW2Data } from "../data/mw2_data.js";
import NameConflictHandler from "./nameConflictManager.js"
import * as HoverStats from "./hoverStats.js";
import * as DamageSoldier from "./damageSoldier.js";
import * as Gunsmith from "./gunsmith.js";
import * as SelectedGuns from "./selectedGuns.js";
import * as Charts from "./chartsManager.js";
import * as ShareCodes from "./shareCodes.js";
import * as WeaponBuilder from "./weaponBuilder.js";

// For weapon select dropdown
const mw2InitialOption = "<option class='mw2InitialOption' style='display: none' value='none'>-- Select --</option>";
const mw2GameAbbreviations = {
    iw9: "MW2"
}
const mw2NameConflictHandler = new NameConflictHandler(MW2Data);

const gameTitles = $('#mw2-game-select option').map((i, option) => {
    if (option.value !== "all") {
        return option.value;
    }
}).toArray();

const weaponCategories = $('#mw2-cat-select option').map((i, option) => {
    if (option.value !== "all") {
        return option.value;
    }
}).toArray();

const $gameSelect = $('#mw2-game-select');
const $categorySelect = $('#mw2-cat-select');
const $gunSelect = $('#mw2-gun-select');
addGunsToDropdown();
initializeGunCategoryDropdown();
initializeGameDropdownHandler();
initializeGunSelectDropdown();


export function updateGunSelectValue() {
    if (SelectedGuns.selectedGunIndex < 0) {
        $gunSelect.val("none");
        return;
    }
    const gunId = SelectedGuns.getCurrentGun().weaponObject.gunId;
    if (!isCurrentGunAvailable()) {
        $categorySelect.val("all").change();
    }
    $gunSelect.val(gunId);
}

function isCurrentGunAvailable() {
    if (SelectedGuns.selectedGunIndex < 0) {
        return false;
    }
    const gunId = SelectedGuns.getCurrentGun().weaponObject.gunId;
    const optionAvailable = $gunSelect.find(`option[value="${gunId}"]`).length > 0;
    return optionAvailable;
}

function initializeGunCategoryDropdown() {
    $categorySelect.on('change', function() {
        $gunSelect.html(mw2InitialOption);
        addGunsToDropdown();
        if (isCurrentGunAvailable()) {
            const gunId = SelectedGuns.getCurrentGun().weaponObject.gunId;
            $gunSelect.val(gunId);
        }
    })
}

function initializeGameDropdownHandler() {
    $gameSelect.on('change',  function() {
        $gunSelect.html(mw2InitialOption);
        addGunsToDropdown();
        if (isCurrentGunAvailable()) {
            const gunId = SelectedGuns.getCurrentGun().weaponObject.gunId;
            $gunSelect.val(gunId);
        }
    });
}

function addGunsToDropdown() {
    const res = prepareGunList()
      .sort((a, b) => a.BaseWeaponName.localeCompare(b.BaseWeaponName))
      .map(({ gunID, BaseWeaponName }) => new Option(BaseWeaponName, gunID));

    $gunSelect.append(res);
}

function initializeGunSelectDropdown() {
    $gunSelect.on('change', function() {
        const gunId = $gunSelect.val();
        if (gunId == "none") {
            return;
        }
        HoverStats.clearHoverStats();
        DamageSoldier.clearAndReset();
        SelectedGuns.addGunToSelectedGuns(gunId, []);
        Gunsmith.populateGunsmith();
        Gunsmith.loadCurrentWeapon();
        Charts.updateAllCharts();
    });
}

function prepareGunList() {
    const selectedGames = $gameSelect.val() === 'all' ? gameTitles : [$gameSelect.val()];
    const selectedCategories = $categorySelect.val() === 'all' ? weaponCategories : [$categorySelect.val()];
    const gunArray = []

    for (const [gunID, gun] of Object.entries(MW2Data)) {
        const { SourceGame, UIWeaponCategory, BaseWeaponName } = gun;
        const nameConflicts = mw2NameConflictHandler.filter(BaseWeaponName, selectedCategories, selectedGames);
        if (selectedCategories.includes(UIWeaponCategory) && selectedGames.includes(SourceGame)) {
            const newLocalizedName = nameConflicts.length ? `${BaseWeaponName} (${mw2GameAbbreviations[SourceGame]})` : BaseWeaponName;
            gunArray.push({ gunID, SourceGame, UIWeaponCategory, BaseWeaponName: newLocalizedName });
        }
    }

    return gunArray;
}