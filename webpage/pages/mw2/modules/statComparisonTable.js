import { mw2StatFormat } from "./localization.js";
import * as StatsObjects from "./statsObject.js";
import * as SelectedGuns from "./selectedGuns.js";

const mw2BetterColor = [50, 205, 50]; //#32CD32
const mw2WorseColor = [255, 99, 71]; //#FF6347
const mw2NeutralColor = [218,212,98]; //"#dad462"

const mw2StatsTableEntries = [
    "rateOfFire",
    "preFireDelay",
    "muzzleVelocity",
    "displayBurstDelay",
    "pelletCount",
    "spacer",
    "magazineSize",
    "reloadTime",
    "reloadAddTime",
    "reloadEmptyTime",
    "reloadEmptyAddTime",
    "rechamberTime",
    "spacer",
    "aimDownSightTime",
    "aimOutTime",
    "fov",
    "spacer",
    "dropTime",
    "raiseTime",
    "sprintToFire",
    "tacSprintToFire",
    "spacer",
    "meleeDamage",
    "meleeHitsToKill",
    "meleeLungeDistanceInches",
    "spacer",
    "tacSprintDuration",
    "spacer",
    "viewCenterSpeed",
    "gunCenterSpeed",
    "viewKickPitchMultiplier",
    "viewKickYawMultiplier",
    "gunKickPitchMultiplier",
    "gunKickYawMultiplier",
    "spacer",
    "crouchViewKickMultiplier",
    "crouchGunKickMultiplier",
    "proneViewKickMultiplier",
    "proneGunKickMultiplier",
    "spacer",
    "initialRecoilEndCount",
    "initialGunKickMultiplier",
    "initialViewKickMultiplier",
    "spacer",
    "sustainedRecoilStartCount",
    "sustainedGunKickMultiplier",
    "sustainedViewKickMultiplier",
    "spacer",
    "adsSpread",
    "hipfireStandMoveMax",
];

export function init() {
    initialzeComparisonStatsControls();
}

export function updateHeaders(){
    const emptyCells = "<th>-</th>".repeat(Math.max(0, 5 - SelectedGuns.selectedGuns.length))
    $(".mw2-stat-comparison-table__table > thead").empty().append(`<tr><th><img src="./pages/mw2/img/symWatermark.png"></th>${SelectedGuns.selectedGuns.map(gun => `<th>${gun.name}</th>`).join("")}${emptyCells}<th><img class="mw2-stat-comparison-table__reset" src="./pages/mw2/img/refresh.png" title="Restore deleted rows"/></th></tr>`);
}

export function update(isRefresh) {
    const emptyDashCells = "<td>-</td>".repeat(Math.max(0, 5 - SelectedGuns.selectedGuns.length))
    const emptyCells = "<td>&nbsp;</td>".repeat(Math.max(0, 5 - SelectedGuns.selectedGuns.length))
    const remakeTable = isRefresh || $(".mw2-stat-comparison-table__table > tbody tr").length == 0;
    const currentTableEntries = $(".mw2-stat-comparison-table__table > tbody tr").map(function() {return $(this).data("stat") ?? "spacer";}).toArray();
    updateHeaders();
    const currentGunStats = SelectedGuns.selectedGuns.map(x => StatsObjects.createUIWeaponStatsObj(x.weaponObject));
    const spacerRow = `<tr><td>&nbsp;</td>${"<td>&nbsp;</td>".repeat(currentGunStats.length)}${emptyCells}<td><img class="mw2-stat-comparison-table__delete-row" src="pages/mw2/img/trash.png" title="Delete Row"></td></tr>`;
    const arrayToIterate = remakeTable ? mw2StatsTableEntries : currentTableEntries;
    const htmlToInsert = arrayToIterate.map(stat => {
        if (stat == "spacer") {
            return spacerRow;
        }
        return generateComparisonTableRow(stat, currentGunStats, emptyDashCells);
    }).join("");
    $(".mw2-stat-comparison-table__table > tbody").html(htmlToInsert);

}

function generateComparisonTableRow(stat, currentGunStats, emptyCells){
    const [decimal, unit, friendly, betterDirection] = mw2StatFormat[stat];
    const rowValues = currentGunStats.map(gun => gun.getStat(stat));
    const uniqueValues = [...new Set(rowValues)].sort((a, b) => a - b);
    if (betterDirection > 0) {
        uniqueValues.reverse();
    }
    const rowData = rowValues.map(value => {
        const formattedText = (stat === 'muzzleVelocity' &&  value < 0) ? `∞${unit}` : `${roundToDecimal(value, decimal)}${unit}`;
        if (uniqueValues.length > 1) {
            const rankingRatio = uniqueValues.indexOf(value) / (uniqueValues.length - 1);
            const color = (betterDirection == 0) ? "#dad462" : interpolateRGB(rankingRatio, mw2BetterColor, mw2NeutralColor, mw2WorseColor);
            return `<td style="color:${color}">${formattedText}</td>`;
        }
        return `<td>${formattedText}</td>`;
    }).join("");
    return `<tr data-stat="${stat}"><td>${friendly}</td>${rowData}${emptyCells}<td><img class="mw2-stat-comparison-table__delete-row" src="pages/mw2/img/trash.png" title="Delete Row"></td></tr>`;
}

function interpolateRGB(ratio, ...rgbs) {
    if (ratio == 0) {
        return `rgb(${rgbs[0].join(", ")})`;
    }
    const sectionSize = 1 / (rgbs.length - 1);
    const index = Math.ceil(ratio / sectionSize) - 1;
    const rgb1 = rgbs[index];
    const rgb2 = rgbs[index + 1];
    const sectionRatio = (ratio - (index * sectionSize)) / sectionSize;
    return `rgb(${rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * sectionRatio).join(", ")})`;
}

function initialzeComparisonStatsControls(){
    $(".mw2-stat-comparison-table__table").on("click", ".mw2-stat-comparison-table__delete-row", function() {
        $(this).parent().parent().remove()
    })

    $(".mw2-stat-comparison-table__table").on("click", ".mw2-stat-comparison-table__reset", function() {
        update(true)
    })
}