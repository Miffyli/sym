import * as Charts from "./chartsManager.js";
import * as DamageSoldier from "./damageSoldier.js";
import * as Gunsmith from "./gunsmith.js";

export let hp = 100;
export let armor = 0;
export let totalHealth = 100;
export let maxArmor = 0;

export function init() {
    initializeGamemodeControls();
    initializeArmorControls();
}

function initializeGamemodeControls() {
    $(".mw2-health-selector-table__gamemode-row td").click(function() {
        const alreadySelected = $(this).hasClass("mw2-health-selector-table__gamemode-row--selected");
        if (alreadySelected) {
            $(".mw2-health-selector-table__plate-row:not(.mw2-health-selector-table__plate-row--unavailable)").addClass("mw2-health-selector-table__plate-row--inactive");
        } else {
            $(".mw2-health-selector-table__gamemode-row--selected").removeClass("mw2-health-selector-table__gamemode-row--selected");
            $(this).addClass("mw2-health-selector-table__gamemode-row--selected");
        }
        $(".mw2-health-selector-table__plate-row--unavailable").removeClass("mw2-health-selector-table__plate-row--unavailable");
        updateCurrentSelections();
        if (maxArmor == 0) {
            $(".mw2-health-selector-table__plate-row").addClass("mw2-health-selector-table__plate-row--unavailable");
        }
    });
}

function initializeArmorControls() {
    $(".mw2-health-selector-table__plate").click(function() {
        const row = $(this).parent();
        if (row.hasClass("mw2-health-selector-table__plate-row--unavailable")) {
            return;
        }
        $(".mw2-health-selector-table__plate-row--inactive").removeClass("mw2-health-selector-table__plate-row--inactive");
        row.nextAll().addClass("mw2-health-selector-table__plate-row--inactive");
        updateCurrentSelections();
    });
}

function updateCurrentSelections() {
    const gameMode = $(".mw2-health-selector-table__gamemode-row--selected").attr("id");
    hp = gameModeBaseHealth(gameMode);  
    const plateValue = gameModePlateHealth(gameMode);
    const plateCount =  $(".mw2-health-selector-table__plate-row:not(.mw2-health-selector-table__plate-row--inactive)").length;
    armor = plateValue * plateCount;
    maxArmor = plateValue * 3;
    totalHealth = hp + armor;
    $(".mw2-health-selector-table__gamemode-row td:first-child").text(`+${hp} = `);
    $(".mw2-health-selector-table__plate-value").text(`+${plateValue} = `);
    $("#mw2-hitpoints, .mw2-health-selector-table__hp-sum").text(totalHealth);
    Gunsmith.loadCurrentWeapon();
    Charts.updateAllCharts();
    DamageSoldier.updateSelector();
}

function gameModeBaseHealth(mode) {
    switch (mode) {
        case "mw2BR":
            return 150;
        case "mw2HC":
            return 30;
        case "mw2T1":
            return 50;
        default:
            return 100;
    }
}

function gameModePlateHealth(mode) {
    switch (mode) {
        case "mw2BR":
            return 50;
        default:
            return 0;
    }
}