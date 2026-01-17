import * as ChartUtils from "./chartUtils.js";
import * as SelectedGuns from "../selectedGuns.js";

const chartOptions = {
    chart: {
        type: 'bar',
        plotBackgroundImage: './pages/mw2/img/symWatermark.png',
    },
    xAxis: {
        title: {
            text: null,
        },
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Speed',
        },
        labels: {
            overflow: 'justify',
            format: '{text}m/s',
        },
    },
    tooltip: {
        valueSuffix: ' m/s',
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true,
                format: '{y} m/s',
                style: {
                    fontSize: '10px',
                },
                allowOverlap: true,
            },
            borderWidth: 0,
        },
    },
    series: [],
};

let chart;
const element = $("#mw2MovementChart")[0];
const observer = new IntersectionObserver(update, ChartUtils.observerOptions);

export function init() {
    chart = Highcharts.chart("mw2MovementChart", chartOptions);
    initializeMovementToggles();
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
    const isADS = $('.mw2MovementSwitch .mw2-toggle-switch__switch').hasClass('mw2-toggle-switch__switch--active');
    const series = getChartMovementSpeedSeries(isADS);

    chart.colorCounter = chart.series.length;
    chart.symbolCounter = chart.series.length;
    chart.update({
        title: {
            text: (isADS ? 'ADS Movement Speeds' : 'Non-ADS Movement Speeds')
        },
        xAxis: {
            categories: getMovementChartLabels(isADS),
        },
        series: series
    }, true, true);
}

function getChartMovementSpeedSeries(isADS){
    const selectedMoves =  $(".mw2-movement-chart-toggles__toggle--selected").map(function(){ return this.id }).toArray();
    const series = SelectedGuns.selectedGuns.map((gun) => {
        const data = []
        const movementSpeed = gun.weaponObject.movementSpeed(isADS);

        if (!isADS && selectedMoves.includes("mw2TacSprintToggle")){
            data.push(roundToDecimal(movementSpeed.tacsprint, 2));
        }
        if (!isADS && selectedMoves.includes("mw2SprintToggle")){
            data.push(roundToDecimal(movementSpeed.sprint, 2));
        }
        if (selectedMoves.includes("mw2ForwardToggle")){
            data.push(roundToDecimal(movementSpeed.forward, 2));
        }
        if (selectedMoves.includes("mw2BackpedalToggle")){
            data.push(roundToDecimal(movementSpeed.backpedal, 2));
        }
        if (selectedMoves.includes("mw2StrafeToggle")){
            data.push(roundToDecimal(movementSpeed.strafe, 2));
        }

        return {
            name: gun.name,
            data: data
        }
    });
    return series;
}

function getMovementChartLabels(isADS){
    var movementLabels = [];
    const selectedMovements =  $(".mw2-movement-chart-toggles__toggle--selected").map(function(){ return this.id }).toArray();

    if (selectedMovements.includes("mw2TacSprintToggle") && !isADS) {
        movementLabels.push("Tac Sprint");
    }
    if (selectedMovements.includes("mw2SprintToggle") && !isADS) {
        movementLabels.push("Sprint");
    }
    if (selectedMovements.includes("mw2ForwardToggle")) {
        movementLabels.push("Forward");
    }
    if (selectedMovements.includes("mw2BackpedalToggle")) {
        movementLabels.push("Backpedal");
    }
    if (selectedMovements.includes("mw2StrafeToggle")) {
        movementLabels.push("Strafe");
    }

    return movementLabels
}

function initializeMovementToggles() {
    $(".mw2-movement-chart-toggles__toggle").on("click", function() {
        $(this).toggleClass("mw2-movement-chart-toggles__toggle--selected");
        markForUpdate();
    });

    $(".mw2MovementSwitch").click(function(){
        $(".mw2MovementSwitch .mw2-toggle-switch__switch").toggleClass("mw2-toggle-switch__switch--active");
        markForUpdate();
        const isADS = $(".mw2MovementSwitch .mw2-toggle-switch__switch").hasClass("mw2-toggle-switch__switch--active");
        const sprintToggles = $(".mw2-movement-chart-toggles tr:nth-child(1), .mw2-movement-chart-toggles tr:nth-child(2)");
        sprintToggles.toggleClass("mw2-hidden", isADS);
    });
}