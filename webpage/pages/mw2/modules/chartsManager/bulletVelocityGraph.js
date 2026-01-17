import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    title: {
        text: 'Bullet Speed',
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
            text: 'Speed (m/s)',
        },
        labels: {
            format: '{text} m/s',
        },
    },
    tooltip: {
        headerFormat: '{point.key} meters<br>',
        valueSuffix: 'm/s',
    },
    series: [],
};

let chart;
const element = $("#mw2BulletSpeedChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2BulletSpeedChart", chartOptions);
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
    const data = getBulletSpeedData();

    chart.colorCounter = chart.series.length;
    chart.symbolCounter = chart.series.length;
    chart.update({
        xAxis: {
            max: maxDistance
        },
        series: data
    }, true, true);//, isBVChartShown, true);
}
    
function getBulletSpeedData(){
    const bulletSpeedData = []
    SelectedGuns.selectedGuns.forEach((gun) => {
        bulletSpeedData.push({
            "name": gun.name,
            "data": gun.weaponObject.bulletVelocity
        });
    });
    return bulletSpeedData
}