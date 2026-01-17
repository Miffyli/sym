import * as SelectedGuns from "./selectedGuns.js";
import * as Draw from "./viewportSimulations/drawing.js";
import { MW2Data } from "../data/mw2_data.js";

export function init() {
    initializeAimingControls();
}

function initializeAimingControls() {
    const rateLimitedDraw = rateLimitFunction(Draw.mw2Draw, 50);
    $(".mw2FovSwitch").click(function(){
        $(".mw2FovSwitch .mw2-toggle-switch__switch").toggleClass("mw2-toggle-switch__switch--active")
        const useAffectedFov = $(".mw2FovSwitch .mw2-toggle-switch__switch").hasClass("mw2-toggle-switch__switch--active")
        Draw.setUseAffectedFov(useAffectedFov);
        rateLimitedDraw(SelectedGuns.getCurrentGun().weaponObject)
    })

    $('#mw2ADSRangeSlider').on('input', (function(){
        const adsTargetDistanceMeters = $(this).val();
        Draw.setAdsTargetDistance(adsTargetDistanceMeters);
        $(".mw2-distanceAdsValue").text($(this).val() + "m");
        rateLimitedDraw(SelectedGuns.getCurrentGun().weaponObject);
    }))

    $('#mw2ADSZoomSlider').on('input', (function(){
        const adsRenderZoom = $(this).val();
        Draw.setAdsRenderZoom(adsRenderZoom);
        $(".mw2-adsZoomValue").text($(this).val() + "x");
        rateLimitedDraw(SelectedGuns.getCurrentGun().weaponObject);
    }))

    $('#mw2FovSlider').on('input', (function(){
        const fov = $(this).val();
        Draw.setFoV(fov);
        $(".mw2-fovValue").text($(this).val() + "°");
        rateLimitedDraw(SelectedGuns.getCurrentGun().weaponObject);
    }))

    $('#mw2HipRangeSlider').on('input', (function(){
        const hipTargetDistanceMeters = $(this).val();
        Draw.setHipTargetDistance(hipTargetDistanceMeters);
        $(".mw2-distanceHipfireValue").text($(this).val() + "m");
        rateLimitedDraw(SelectedGuns.getCurrentGun().weaponObject);
    }))
}

function rateLimitFunction(fn, ms) {
    let timer = 0
    return function(...args) {
      clearTimeout(timer)
      timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
}

export function update() {
    Draw.mw2Draw(SelectedGuns.getCurrentGun().weaponObject);
}

export function updateOpticName() {
    const opticValue = $("#mw2-optic").val();
    const { gunId } = SelectedGuns.getCurrentGun().weaponObject;
    const opticName = (opticValue == "none") ? "Default Optic" : MW2Data[gunId].SelectableAttachments[opticValue].LocalizedName;
    $(".mw2-currentOptic").text(opticName + " - " + $("#mw2-fov").text());
}