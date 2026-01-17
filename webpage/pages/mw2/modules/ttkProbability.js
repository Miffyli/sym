import * as pseudoRandom from "./ttkProbability/pseudoRandom.js";
import * as ChartManager from "./chartsManager.js";
import * as SelectedGuns from "./selectedGuns.js";
import * as Health from "./healthSelect.js";

let mw2SelectedProbLocation = "";
let viewWeightAsPercentage = false;

const sampleSize = 10000;
const maxShots = 150;

//Generate static arrays of probabilities to reduce computation during monte-carlo iteration
const seededRandom = pseudoRandom.seededRandom("Sym.gg");
const locationHitsProbabilities = Array.from({length: sampleSize}, () => createRandomFilledArray(maxShots));
const missedShotsProbabilities = Array.from({length: sampleSize}, () => createRandomFilledArray(maxShots));

const locationIds = [
    "Miss",
    "Head",
    "Neck",
    "TorsoUpper",
    "TorsoLower",
    "RightArmUpper",
    "LeftArmUpper",
    "RightArmLower",
    "LeftArmLower",
    "RightLegUpper",
    "LeftLegUpper",
    "RightLegLower",
    "LeftLegLower"
]

export let locationWeights = {
    "Head": 5,
    "Neck": 7,
    "TorsoUpper": 28,
    "TorsoLower": 20,
    "RightArmUpper": 8,
    "LeftArmUpper": 8,
    "RightArmLower": 2,
    "LeftArmLower": 2,
    "RightLegUpper": 7,
    "LeftLegUpper": 7,
    "RightLegLower": 3,
    "LeftLegLower": 3
}
let missChance = 0;

let missedShotsCache = generateMissedShotCache(missChance);
let locationHitsCache = generateHitsCache(locationWeights);
let shotsCache = generateShotsCache();

const $probabilityRangeSlider = $("#mw2ProbabilityRangeSlider");
createProbabilitiesSoldier();
initializeProbabilityControls();

function setMissChance(chance) {
    chance = Math.min(chance, 0.75);
    chance = Math.max(chance, 0);
    missChance = chance;
    missedShotsCache = generateMissedShotCache(missChance);
    shotsCache = generateShotsCache();
}

function setLocationWeights(newLocationWeights) {
    for (const location of Object.keys(locationWeights)) {
        locationWeights[location] = newLocationWeights[location];
    }
    locationHitsCache = generateHitsCache(locationWeights);
    shotsCache = generateShotsCache();
}

function createRandomFilledArray(size) {
    const typedArray = new Float32Array(size);
    for (let i = 0; i < typedArray.length; i++) {
        typedArray[i] = seededRandom();
    }
    return typedArray;
}

function generateMissedShotCache(missChance) {
    return missedShotsProbabilities.map(randomArray => randomArray.map(x => (x < missChance)));
}

//this is the heaviest function
function generateHitsCache(weights) {
    const hitProbabilities = probabilitesFromWeighting(weights);
    const sorted = Object.entries(hitProbabilities).sort((a, b) => b[1] - a[1]); //test most likely first to reduce iteration
    sorted.reduce((prev, curr, i, arr) => {
        arr[i][1] += prev;
        return arr[i][1];
    }, 0);
    return locationHitsProbabilities.map(randomArray => randomArray.map(x => selectLocation(x, sorted)));
}

function probabilitesFromWeighting(weights) {
    const totalWeight = Object.values(weights).reduce((prev, curr) => prev + curr, 0);
    const probabilites = {};
    for (const [key, value] of Object.entries(weights)) {
        probabilites[key] = value / totalWeight;
    }
    return probabilites;
}

function selectLocation(randomValue, sortedProbabilities) {
    const loc = sortedProbabilities.find(([key, value]) => value > randomValue);
    return locationIds.findIndex(x => x == loc[0]);
}

function generateShotsCache() {
    return locationHitsCache.map((hitsArray, arrayIndex) => hitsArray.map((value, index) => {
        return missedShotsCache[arrayIndex][index] ? 0 : value;
    }));
}

export function getShotCountProbabilities(hitboxDamageMap) {
    const btks = getBtks(hitboxDamageMap);
    const denom = btks.length;
    const counts = {};
    for (const btk of btks) {
        counts[btk] ??= 0;
        counts[btk]++;
    }
    for (const key of Object.keys(counts)) {
        counts[key] /= denom;
    }
    return Object.entries(counts);
}

function getBtks(hitboxDamageMap) {
    return shotsCache.map(shotsArray => findBtk(shotsArray, hitboxDamageMap)).filter(x => x!==undefined);
}

function findBtk(hitLocArray, hitboxDamageMap) {
    let hp = Health.totalHealth;
    for (let i = 0; i < hitLocArray.length; i++) {
        const locId = hitLocArray[i];
        if (locId == 0) {
            continue; //miss
        }
        const damage = hitboxDamageMap[locationIds[locId]];
        hp -= damage;
        if (hp <= 0) {
            return i + 1;
        }
    }
}

export function updateSliderMax() {
    const currentRange = $probabilityRangeSlider.val();
    const maxRange = Math.max(10, Math.ceil(SelectedGuns.getFarthestRangeOfSelectedGuns() * 1.25 / 10) * 10);
    $(".mw2-probablitiesMaxRangeLabel").text(maxRange + "m+");
    $probabilityRangeSlider.attr("max", maxRange);
    if (currentRange > maxRange) {
        $probabilityRangeSlider.trigger("input");
    }
}

function handleGuyProbClick(locationId){
    mw2SelectedProbLocation = locationId
    $('.mw2-probabilitiesGuy text').attr("filter", "url(#solid)")
    $('.mw2-probabilitiesGuy .mw2-dmgLabel-' + mw2SelectedProbLocation).attr("filter", "url(#solidGreen)")
    const str = mw2SelectedProbLocation.replace(/([A-Z])/g, " $1")
    $(".mw2-probLocationLabel").text(str.charAt(0).toUpperCase() + str.slice(1))
    $("#mw2-probability-weight-input").val(locationWeights[mw2SelectedProbLocation]).removeClass('disabledInput')
}

function loadWeightingLabels() {
    const weighting = locationWeights;
    const weightSum = Object.values(weighting).reduce((a, b) => a + b);
    Object.keys(weighting).forEach((key) => {
        if(viewWeightAsPercentage){
            $(".mw2-probabilitiesGuy .mw2-dmgLabel-" + key).text(roundToDecimal(weighting[key]/weightSum * 100, 0) +"%")
        } else {
            $(".mw2-probabilitiesGuy .mw2-dmgLabel-" + key).text(weighting[key])
        }
    })
}

function createProbabilitiesSoldier() {
    $(".mw2-locational-damage-guy .mw2-guy").clone().prependTo(".mw2-probabilitiesGuy");
    $('.mw2-probabilitiesGuy path').each(function (index, element) {
        const $element = $(element);
        $element.removeClass("mw2-bodyPart--selected");
        const newId = $element.attr("id").replace("mw2", "mw2-prob");
        $element.attr("id", newId);
    })
}

function initializeProbabilityControls() {
    $probabilityRangeSlider.on('input', (function () {
        const maxRange = $probabilityRangeSlider.attr("max");
        const range = Math.min(parseInt($probabilityRangeSlider.val()), maxRange);
        const suffix = range == maxRange ? "m+" : "m";
        $(".mw2-probabilityRangeValue").text(range + suffix);
        ChartManager.updateProbabilityCharts();
    }));

    $(".mw2-probabilitiesGuy path").on("click", function() {
        handleGuyProbClick($(this).attr("id").replace("mw2-prob-",""));
    })

    $(".mw2-probabilitiesGuy text").on("click", function() {
        handleGuyProbClick($(this).attr("class").replace("mw2-dmgLabel-",""));
    })
    
    loadWeightingLabels();

    $("#mw2-probability-weight-input").on("change", function () {
        const newVal = parseInt($(this).val());
        const locationChances = locationWeights;
        locationChances[mw2SelectedProbLocation.replace("Left","Right")] = newVal
        locationChances[mw2SelectedProbLocation.replace("Right","Left")] = newVal
        setLocationWeights(locationChances);
        loadWeightingLabels();
        ChartManager.updateProbabilityCharts();
    });

    $(".mw2ProbViewSwitch").click(function(){
        $(".mw2ProbViewSwitch .mw2-toggle-switch__switch").toggleClass("mw2-toggle-switch__switch--active")
        viewWeightAsPercentage = $(".mw2ProbViewSwitch .mw2-toggle-switch__switch").hasClass("mw2-toggle-switch__switch--active")
        loadWeightingLabels()
    });

    $("#mw2ProbabilityMissInput").on("change", function () {
        let value = parseFloat($(this).val());
        value = isNaN(value) ? 0 : value;
        value = Math.max(value, 0);
        value = Math.min(value, 75);
        $(this).val(value);
        setMissChance(value / 100);
        ChartManager.updateProbabilityCharts();
    });
}