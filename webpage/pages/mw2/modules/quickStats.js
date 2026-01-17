import { mw2StatFormat } from "./localization.js";
import * as StatsObjects from "./statsObject.js";
import * as SelectedGuns from "./selectedGuns.js";

export function loadQuickStatsIntoTable(){
    const gun = SelectedGuns.getCurrentGun();
    const currentGunStats = StatsObjects.createUIWeaponStatsObj(gun.weaponObject);;
    const baseGunStats = StatsObjects.createUIWeaponStatsObj(gun.baseWeaponObject);
    $(".mw2-current-weapon-stats__table td[id]").each(function (index, element) {
        const id = $(this).attr("id");
        const orig = id.endsWith("-orig")
        const stat = orig ? id.slice(4, -5) : id.slice(4);
        const value = orig ? baseGunStats.getStat(stat) : currentGunStats.getStat(stat);
        const [decimal, unit, friendlyName, betterDirection] = mw2StatFormat[stat];
        const formattedText = (stat === 'muzzleVelocity' &&  value < 0) ? `∞ ${unit}` : `${roundToDecimal(value, decimal)} ${unit}`;
        let colorClass = false;
        if (!orig) {
            $(this).removeClass("mw2-redText mw2-greenText mw2-yellowText");
            const difference = value - baseGunStats.getStat(stat);
            if (difference != 0) {
                colorClass = "mw2-yellowText"
                if (betterDirection != 0) {
                    colorClass = Math.sign(difference) == betterDirection ? "mw2-greenText" : "mw2-redText";
                }
                if (stat === "muzzleVelocity" && value < 0) {
                    colorClass = "mw2-greenText"
                }
            }
        }
        $(this).text(formattedText);
        if (colorClass) {
            $(this).addClass(colorClass);
        }
    });
}