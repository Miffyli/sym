import * as ttkGraph from "./chartsManager/ttkGraph.js";
import * as damageGraph from "./chartsManager/damageGraph.js";
import * as btkGraph from "./chartsManager/btkGraph.js";
import * as bulletDropGraph from "./chartsManager/bulletDropGraph.js";
import * as bulletVelocityGraph from "./chartsManager/bulletVelocityGraph.js";
import * as movementChart from "./chartsManager/movementChart.js";
import * as probabilityGraph from "./chartsManager/probabilityGraph.js";
import * as meanDistributionTTKGraph from "./chartsManager/meanDistributionTTKGraph.js";
import * as averageDownsPerMagGraph from "./chartsManager/averageDownsPerMagGraph.js";
import * as MobileDetection from "./mobileDetection.js";

const highChartsOptions = {
    title: {
        style: {
            fontWeight: 'bold'
        }
    },
    subtitle: {
        text: 'Click weapon labels below to hide weapons from chart',
        style: {
            fontStyle: 'italic'
        }
    },
    chart: {
        plotBackgroundImage: './pages/mw2/img/symWatermark.png',
        zoomType: MobileDetection.isMobile ? undefined : 'xy',
        panning: !MobileDetection.isMobile,
        panKey: MobileDetection.isMobile ? undefined : 'shift',
        animation: true
    },
    colors: ["#ff9000", "#A9D852", "#7c40ff", "#03a9f4", "#d60024", "#F8F8FF", "#FF1493", "#66CDAA",  "#008080", "#A0522D", "#ffd700"],
    plotOptions: {
        series: {
            marker: {
                enabled: false
            },
            animation: 850,
            turboThreshold: 1
        }
    },
    credits: {
        text: 'Sym.gg',
        href: 'https://sym.gg'
    },
    accessibility: {
        enabled: false
    },
    lang: {
        thousandsSep: ','
    }
};

export function init() {
    Highcharts.setOptions(highChartsOptions);
    ttkGraph.init();
    damageGraph.init();
    btkGraph.init();
    bulletDropGraph.init();
    bulletVelocityGraph.init();
    movementChart.init();
    probabilityGraph.init();
    meanDistributionTTKGraph.init();
    averageDownsPerMagGraph.init();
    initializeBallisticDistanceSelect();
    initializeChartDisplayToggles();
    initLocationControls();
}

export function updateAllCharts() {
    updateLocationDependentCharts();
    updateProbabilityCharts();
    movementChart.markForUpdate();
    updateBallisticCharts();
}

export function updateLocationDependentCharts() {
    ttkGraph.markForUpdate();
    btkGraph.markForUpdate();
    damageGraph.markForUpdate();
}

export function updateMovementChart() {
    movementChart.markForUpdate();
}

export function updateProbabilityCharts() {
    probabilityGraph.markForUpdate();
    meanDistributionTTKGraph.markForUpdate();
    averageDownsPerMagGraph.markForUpdate();
}

function updateBallisticCharts() {
    bulletVelocityGraph.markForUpdate();
    bulletDropGraph.markForUpdate();
}

function initializeBallisticDistanceSelect() {
    $("#mw2-ballistics-chart-max-distance").change(updateBallisticCharts);
}

function initializeChartDisplayToggles() {
    const $damageChartContainer = $("#mw2DamageChart").parent().parent();
    const $btkChartContainer = $("#mw2BTKChart").parent().parent();
    $(".mw2BTKSwitch").click(function(){
        $(".mw2BTKSwitch .mw2-toggle-switch__switch").toggleClass("mw2-toggle-switch__switch--active");
        $damageChartContainer.toggle();
        $btkChartContainer.toggle();
        updateLocationDependentCharts();
    });

    const $bulletDropChartContainer = $("#mw2BulletDropChart").parent().parent();
    const $bvChartContainer = $("#mw2BulletSpeedChart").parent().parent();
    $(".mw2BulletSpeedSwitch").click(function(){
        $(".mw2BulletSpeedSwitch .mw2-toggle-switch__switch").toggleClass("mw2-toggle-switch__switch--active");
        $bulletDropChartContainer.toggle();
        $bvChartContainer.toggle();
        updateBallisticCharts();
    });

    const averageTtkChartContainer = $("#mw2MeanDistributionTTKChart").parent().parent();
    const averageDownsPerMagChartContainer = $("#mw2AverageDownsPerMagChart").parent().parent();
    $(".mw2TTKDPMSwitch").click(function(){
        $(".mw2TTKDPMSwitch .mw2-toggle-switch__switch").toggleClass("mw2-toggle-switch__switch--active");
        averageTtkChartContainer.toggle();
        averageDownsPerMagChartContainer.toggle();
        updateProbabilityCharts();
    });
}

function initLocationControls() {
    $(".mw2-locational-damage-guy path").click(function() {
        const $element = $(this);
        const selectedLocation = $element.attr("id").substring(4);
        $(".mw2-bodyPart--selected").removeClass("mw2-bodyPart--selected");
        $element.addClass("mw2-bodyPart--selected");
        const str = selectedLocation.replace(/([A-Z])/g, " $1");
        $("#mw2-selected-damage-location").text(str.charAt(0).toUpperCase() + str.slice(1));
        updateLocationDependentCharts();
    });
}