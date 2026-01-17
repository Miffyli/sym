const dataDate = '26th October 2023';
const pageDate = '5th October 2023';
const versionString = `Latest updates<br>Page: ${pageDate}<br>Data: ${dataDate}`;

window.openMW2WeaponBuilderPageFromQueryString = function() {
    loadPageWithHeader('./pages/mw2/mw2_wb.html',
        '',
        loadWeaponBuilder,
        versionString
    );
}

function loadWeaponBuilder() {
    import("./mw2_wb.js").then(mod => mod.initializeWeaponBuilder());
}