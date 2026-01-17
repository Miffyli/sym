import * as SelectedGuns from "./selectedGuns.js";

const gunDelimeter = "~"
const currentVersion = 1;
initializeCopyGunShare();

export function parseUrlCode(urlCode) {
    const version = urlCode.charAt(0);
    switch (version) {
        case "1":
            let arrayOfGuns = urlCode.substring(1).split(gunDelimeter).map(code => {
                const split = code.match(/.{1,3}/g);
                const gunId = parseInt(split[0], 36).toString();
                split.shift();
                const attachmentIds = split.map(radix36Attachment => {
                    return parseInt(radix36Attachment, 36).toString();
                }).sort();
                return {
                    gunId: gunId,
                    attachmentIds: attachmentIds
                };
            })
            return arrayOfGuns;
    }
}

function createGunShareCode(gun) {
    const { gunId, selectedAttachments } = gun.weaponObject;
    return [gunId, ...selectedAttachments].map(id => `00${parseInt(id).toString(36)}`.slice(-3)).join("");
}

export function createComparisonShareCode(gunArray) {
    return `${currentVersion}${gunArray.map(createGunShareCode).join(gunDelimeter)}`;
}

export function createGunShareURL(gun) {
    const gunCode = createGunShareCode(gun);
    return `${window.location.origin}${window.location.pathname}?mw2-loadout=${currentVersion}${gunCode}`;
}

export function updateSharingUrls(){
    const loadoutURL = createGunShareURL(SelectedGuns.getCurrentGun());

    $("#mw2-loadout-url-box__url-preview").val(loadoutURL);
    $(".mw2-loadout-url-box").css("visibility", "visible");
    $(".mw2-loadout-url-box__copy-confirmation").css("visibility", "hidden");

    const fullComparison = createComparisonShareCode(SelectedGuns.selectedGuns);

    history.replaceState(null, null, `${window.location.pathname}?mw2-loadout=${fullComparison}`);
}

function initializeCopyGunShare(){
    $("#mw2-loadout-url-box__copy-button").click(function() {
        const $previewBox = $("#mw2-loadout-url-box__url-preview");
        $previewBox.select();
        document.execCommand("copy");
        $previewBox.blur();
        $(".mw2-loadout-url-box__copy-confirmation").css("visibility", "visible")
    })
}