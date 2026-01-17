import * as Charts from "./modules/chartsManager.js";
import * as ShareCodes from "./modules/shareCodes.js";
import * as StatComparisonTable from "./modules/statComparisonTable.js";
import * as SelectedGuns from "./modules/selectedGuns.js";
import * as Health from "./modules/healthSelect.js";
import * as ViewportSimulations from "./modules/viewportSimulations.js";
import * as Gunsmith from "./modules/gunsmith.js";
import * as WeaponSelect from "./modules/weaponSelect.js";
import * as TabsManager from "./modules/tabsManager.js";

// setup stuff and then remove loading text
export function initializeWeaponBuilder() {
    Gunsmith.init();
    Charts.init();
    StatComparisonTable.init();
    Health.init();
    ViewportSimulations.init();

    $(".sym-loading").remove();

    $(".mw2-gunsmith").sortable({
        items: ".mw2-sortable",
        opacity: 0.7,
        placeholder: "ui-state-highlight",
        handle: ".mw2-sortDragIcon",
        forcePlaceholderSize: true
    });

    $(".mw2-stat-comparison-table__table tbody").sortable({});

    $(".mw2-gunsmith").show("fade");
    mw2LoadLoadoutFromURL();
    $('.select2-selection__rendered').hover(function () {
        $(this).removeAttr('title');
    });
    $(document).tooltip({});
}

function mw2LoadLoadoutFromURL(){
    const urlParams = new URLSearchParams(window.location.search)

    if(urlParams.has("mw2-loadout")){
        const build = ShareCodes.parseUrlCode(urlParams.get('mw2-loadout'));
        build.length = Math.min(build.length, TabsManager.maxWeaponCount);
        SelectedGuns.addGunToSelectedGuns(build[0].gunId, build[0].attachmentIds);
        for (let i = 1; i < build.length; i++) {
            $(".mw2-weapon-tabs__add-new").click();
            SelectedGuns.addGunToSelectedGuns(build[i].gunId, build[i].attachmentIds);
        }

        WeaponSelect.updateGunSelectValue();
        Gunsmith.populateGunsmith();
        Gunsmith.loadCurrentWeapon();
        Charts.updateAllCharts();
    }
}