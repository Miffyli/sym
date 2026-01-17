import { MW2Data } from "../data/mw2_data.js";
import * as WeaponBuilder from "./weaponBuilder.js";
import * as TabsManager from "./tabsManager.js";

const mw2GunTemplate = {
    "name" : "none",
    baseWeaponObject: {},
    weaponObject: {}
}

// All weapon data
export const selectedGuns = []
export let selectedGunIndex = -1

// store the index of the selected gun to accomodate quick access
export function selectGunByName(selectedGunName){
    for(var i = 0; i < selectedGuns.length; i++){
        if (selectedGunName === selectedGuns[i].name){
            selectedGunIndex = i;
        }
    }
}

export function selectGunByIndex(index) {
    selectedGunIndex = index;
}

export function getCurrentGun() {
    return selectedGuns[selectedGunIndex];
}

export function getFarthestRangeOfSelectedGuns() {
    let farthest = 0;
    selectedGuns.forEach((gun) => {
        const rangeBreakpoints = gun.weaponObject.rangeBreakpoints
        farthest = Math.max(farthest, rangeBreakpoints[rangeBreakpoints.length - 1]);
    });
    return farthest;
}

export function addGunToSelectedGuns(gunID, attachmentIDs, altFire = false) {
    if (!MW2Data[gunID]) {
        return; //invalid gun
    }
    const UIName = findAvailableName(gunID);

    let gun = JSON.parse(JSON.stringify(mw2GunTemplate));
    gun.name = UIName;
    gun.weaponObject = new WeaponBuilder.Gun(gunID, attachmentIDs, altFire);
    gun.baseWeaponObject = gun.weaponObject.createBaseGun();

    if(selectedGunIndex < 0){
        selectedGunIndex = selectedGuns.length;
        selectedGuns.push(gun);
    } else {
        selectedGuns[selectedGunIndex] = gun;
    }
    TabsManager.updateCurrentTab();
}

function findAvailableName(gunID) {
    const gunName = MW2Data[gunID].BaseWeaponName;
    const usedNames = selectedGuns.map(gun => gun.name);

    let potentialName = gunName;
    let i = 2;

    while (usedNames.includes(potentialName)) {
        potentialName = gunName + " [" + i + "]";
        i++;
    }

    return potentialName;
}