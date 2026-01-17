import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    title: {
        text: 'Average Downs-Per-Magazine',
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
            text: 'Downs'
        },
        min: 0,
        labels: {
            format: '{text} downs'
        },
    },
    tooltip: {
        shared: true,
        headerFormat: '<b>{point.key}</b> meters<br>',
        valueSuffix: 'downs'
    }
};

let chart;
const element = $("#mw2AverageDownsPerMagChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2AverageDownsPerMagChart", chartOptions);
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
    const data = getAverageDownsPerMagData();
    const chartLength = ChartUtils.getDamageBasedChartLength();
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
        series: data
    }, true, true); //, isAverageDownsPerMagChartShown, true);
}

function getAverageDownsPerMagData() {
    return SelectedGuns.selectedGuns.map((gun) => {
        const graphPoints = createGraphPoints(gun.weaponObject);
        return {
            name: gun.name,
            data: graphPoints
        };
    });
}

function createGraphPoints(weaponObject) {
    const data = weaponObject.probabilitiesOfBtks().map(([range, probs]) => {
        return [range, averageDownsPerMag(probs, weaponObject)]
    });
    return ChartUtils.createPointsFromRangeProfile(data);
}

function averageDownsPerMag(probabilityToKillInShots, weaponObject) {
    const stats = weaponObject.stats;
    let btk = averageBTK(probabilityToKillInShots);
    if (stats.fireType == "BURSTFIRE") {
        btk = Math.ceil(btk / stats.burstCount) * stats.burstCount;
    }
    const downs = (stats.isAkimbo ? 2 : 1) * stats.magazineSize / btk;
    return roundToDecimal(downs, 2);
}

function averageBTK(probabilityToKillInShots) {
    return probabilityToKillInShots.reduce((previousValue, [btk, prob]) => {
        return previousValue + btk * prob / 100;
    }, 0);
}