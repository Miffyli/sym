import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    title: {
        text: 'Probability Of Achieving TTK at 0m'
    },
    xAxis: {
        title: {
            text: 'TTK (ms)'
        },
        crosshair: true,
        min: 0,
        labels: {
            format: '{text}ms'
        }
    },
    yAxis: {
        title: {
            text: 'Probability To Achieve TTK (%)'
        },
        min: 0,
        max: 100,
        labels: {
            format: '{text}%'
        }
    },
    tooltip: {
        shared: true,
        headerFormat: '<b>{point.key}</b> milliseconds<br>',
        valueSuffix: '%'
    },
    plotOptions: {
        series: {
            marker: {
                enabled: true
            }
        }
    }
};

let chart;
const element = $("#mw2ProbabilityChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2ProbabilityChart", chartOptions);
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
    const rangeMeters = $('#mw2ProbabilityRangeSlider').val();
    const data = getProbabilityChartData(rangeMeters);
    const maxTTK = getMaxTTK(data);
    const chartLength = Math.max(250, Math.ceil(maxTTK * 1.1 / 250) * 250);

    chart.colorCounter = chart.series.length;
    chart.symbolCounter = chart.series.length;
    chart.update({
        title: {
            text: 'Probability Of Achieving TTK at ' + rangeMeters.toString() + 'm'
        },
        xAxis: {
            max: chartLength != 0 ? chartLength : chart.xAxis[0].max
        },
        series: data
    }, true, true);
}

//Get data if gun is loaded, otherwise return empty set titled "loading"
function getProbabilityChartData(rangeMeters) {
    return SelectedGuns.selectedGuns.map((gun) => {
        const index = gun.weaponObject.indexForRange(rangeMeters);
        const data = gun.weaponObject.probabilitiesOfTtks()[index][1];
        if (data.length == 0) {
            //chart doesn't update if you push an empty array
            data.push([-1, 1]);
        }
        return {
            name: gun.name,
            data: data
        };
    });
}

function getMaxTTK(probabilityChartData) {
    return probabilityChartData.reduce((maxTTK, series) => {
        const finalTTK = series.data[series.data.length - 1][0];
        return Math.max(maxTTK, finalTTK);
    }, 0);
}