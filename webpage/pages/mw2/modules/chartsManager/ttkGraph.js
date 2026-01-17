import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    title: {
        text: 'Time-To-Kill (TTK)',
    },
    xAxis: {
        title: {
            text: 'Distance (m)',
        },
        crosshair: true,
        min: 0,
        //max: chartLength,
        labels: {
            format: '{text}m',
        },
        // minorTickInterval: 50
    },
    yAxis: {
        title: {
            text: 'Time (ms)',
        },
        min: 0,
        labels: {
            format: '{text}ms',
        },
        tickInterval: 250
    },
    tooltip: {
        shared: true,
        headerFormat: '<b>{point.key}</b> meters<br>',
        valueSuffix: 'ms',
    },
    series: []
};

let chart;
const element = $("#mw2TTKChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2TTKChart", chartOptions);
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
    const data = getTtkChartData(hitLocation);
    const maxYValue = ChartUtils.getYMaxOfData(data)
    const chartHeight = Math.max(250, Math.ceil(maxYValue * 1.1 / 250) * 250);

    chart.colorCounter = chart.series.length;
    chart.symbolCounter = chart.series.length;
    chart.update({
        title: {
            text: 'Time-To-Kill (TTK) - ' + formattedHitLocation
        },
        xAxis: {
            max: damageRangeChartLength
        },
        yAxis: {
            max: chartHeight
        },
        series: data
    }, true, true);
}

function getTtkChartData(hitLocation) {
    return SelectedGuns.selectedGuns.map((gun) => {
        const graphPoints = ChartUtils.createPointsFromRangeProfile(gun.weaponObject.locTtks(hitLocation)).filter(([range, ttk]) => ttk >= 0);
        return {
            name: gun.name,
            data: graphPoints
        }
    });
}