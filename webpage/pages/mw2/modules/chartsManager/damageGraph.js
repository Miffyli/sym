import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    title: {
        text: 'Damage',
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
            text: 'Damage (per shot)',
        },
        min: 0,
    },
    tooltip: {
        shared: true,
        headerFormat: '{point.key} meters<br>',
        valueSuffix: 'dmg',
    },
    series: [],
};

let chart;
const element = $("#mw2DamageChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2DamageChart", chartOptions);
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
    const data = getDamageChartData(hitLocation);
    const maxY = ChartUtils.getYMaxOfData(data);
    const chartHeight = Math.ceil(maxY * 1.07 / 50) * 50;

    chart.colorCounter = chart.series.length;
    chart.symbolCounter = chart.series.length;
    chart.update({
        title: {
            text: 'Damage - ' + formattedHitLocation
        },
        xAxis: {
            max: damageRangeChartLength
        },
        yAxis: {
            max: chartHeight
        },
        series: data
    }, true, true);//!isBTKShown, true);
}

function getDamageChartData(hitLocation) {
    return SelectedGuns.selectedGuns.map((gun) => {
        const graphPoints = ChartUtils.createPointsFromRangeProfile(gun.weaponObject.locDamages(hitLocation));
        return {
            name: gun.name,
            data: graphPoints
        }
    });
}