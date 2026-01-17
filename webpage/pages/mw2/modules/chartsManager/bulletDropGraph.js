import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    title: {
        text: 'Bullet Drop',
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
    },
    yAxis: {
        title: {
            text: 'Height (m)',
        },
        labels: {
            format: '{text}m',
        },
    },
    tooltip: {
        headerFormat: '{point.key} meters<br>',
        valueSuffix: 'm',
    },
    series: [],
};

let chart;
const element = $("#mw2BulletDropChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2BulletDropChart", chartOptions);
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
    const maxDistance = parseInt($("#mw2-ballistics-chart-max-distance").val());
    const data = getChartDropData();

    chart.colorCounter = chart.series.length;
    chart.symbolCounter = chart.series.length;
    chart.update({
        xAxis: {
            max: maxDistance
        },
        series: data
    }, true, true); //, !isBVChartShown, true);
}

function getChartDropData(){
    const bulletDropData = []
    SelectedGuns.selectedGuns.forEach((gun) => {
        bulletDropData.push({
            "name": gun.name,
            "data": gun.weaponObject.bulletDrop
        });
    });
    return bulletDropData
}