import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    title: {
        text: 'Bullets-To-Kill (BTK)',
    },
    xAxis: {
        title: {
            text: 'Distance (m)',
        },
        crosshair: true,
        min: 0,
        labels: {
            format: '{text}m',
        },
        //minorTickInterval: 50
    },
    yAxis: {
        title: {
            text: 'Bullets',
        },
        min: 0,
        //max: damageYMax,
        //minRange: 100,
        //minorTickInterval: 10
    },
    tooltip: {
        shared: true,
        headerFormat: '{point.key} meters<br>',
        valueSuffix: ' bullets',
    },
    series: [],
};

let chart;
const element = $("#mw2BTKChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2BTKChart", chartOptions);
}

export function markForUpdate() {
    observer.observe(element);
}

function update(entries) {
    const shouldUpdate = entries.reduce((prev, curr) => {
        return prev || curr.isIntersecting;
    }, false);
    if (!shouldUpdate) {
        return;
    }
    observer.unobserve(element);
    const hitLocation = $(".mw2-bodyPart--selected").attr("id").substring(4);
    const str = hitLocation.replace(/([A-Z])/g, " $1");
    const formattedHitLocation = str.charAt(0).toUpperCase() + str.slice(1);
    const damageRangeChartLength = ChartUtils.getDamageBasedChartLength();
    const data = getBTKChartData(hitLocation);

    chart.colorCounter = chart.series.length;
    chart.symbolCounter = chart.series.length;
    chart.update({
        title: {
            text: 'Bullets-To-Kill (BTK) - ' + formattedHitLocation
        },
        xAxis: {
            max: damageRangeChartLength
        },
        series: data
    }, true, true);
}

function getBTKChartData(hitLocation) {
    return SelectedGuns.selectedGuns.map((gun) => {
        const graphPoints = ChartUtils.createPointsFromRangeProfile(gun.weaponObject.locBTKs(hitLocation)).filter(([range, btk]) => btk >= 0);
        return {
            name: gun.name,
            data: graphPoints
        }
    });
}