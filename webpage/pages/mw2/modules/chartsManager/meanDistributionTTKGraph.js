import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    title: {
        text: 'Average Time-To-Kill (TTK)',
        style: {
            fontWeight: 'bold'
        }
    },
    xAxis: {
        title: {
            text: 'Distance (m)'
        },
        crosshair: true,
        min: 0,
        labels: {
            format: '{text}m'
        },
        plotLines: [{
            value: 0,
            color: "#F0F0F0",
            width: 2,
            id: 'range'
        }]
    },
    yAxis: {
        title: {
            text: 'Time (ms)'
        },
        min: 0,
        labels: {
            format: '{text}ms'
        },
    },
    tooltip: {
        shared: true,
        headerFormat: '<b>{point.key}</b> meters<br>',
        valueSuffix: 'ms'
    }
};

let chart;
const element = $("#mw2MeanDistributionTTKChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2MeanDistributionTTKChart", chartOptions);
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
    const data = getTTKMeanDistributionChartData();
    const chartLength = ChartUtils.getDamageBasedChartLength();
    const maxYValue = ChartUtils.getYMaxOfData(data)
    const chartHeight = Math.max(250, Math.ceil(maxYValue * 1.1 / 250) * 250);
    const rangeMeters = $('#mw2ProbabilityRangeSlider').val();
    //const isAverageDownsPerMagChartShown = $(".mw2TTKDPMSwitch .mw2-toggle-switch__switch").hasClass("mw2-toggle-switch__switch--active");

    chart.colorCounter = chart.series.length;
    chart.symbolCounter = chart.series.length;
    chart.update({
        xAxis: {
            max: chartLength,
            plotLines: [{
                value: rangeMeters,
                color: "#F0F0F0",
                width: 2,
                id: 'range'
            }]
        },
        yAxis: {
            max: chartHeight != 0 ? chartHeight : chart.yAxis[0].max
        },
        series: data
    }, true, true); //, !isAverageDownsPerMagChartShown, true);
}

function getTTKMeanDistributionChartData() {
    return SelectedGuns.selectedGuns.map((gun) => {
        const graphPoints = createGraphPoints(gun.weaponObject).filter(([range, ttk]) => ttk >= 0);
        return {
            name: gun.name,
            data: graphPoints
        };
    });
}

function createGraphPoints(weaponObject) {
    const data = weaponObject.probabilitiesOfTtks().map(([range, probs]) => {
        return [range, averageTTK(probs)]
    });
    return ChartUtils.createPointsFromRangeProfile(data);
}

function averageTTK(probabilitiesOfTTKs) {
    if (probabilitiesOfTTKs.length == 0) {
        return -1;
    }
    const averageTTK = probabilitiesOfTTKs.reduce((previousValue, [ttk, prob]) => {
        return previousValue + ttk * prob / 100;
    }, 0);
    return Math.round(averageTTK);
}