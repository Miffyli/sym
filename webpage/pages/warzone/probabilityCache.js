const wzProbabilityCache = probabilityCache();

function probabilityCache() {
    const cachedResults = {};

    return {
        isCachedChanceToKillInHits: isCachedChanceToKillInHits,
        getCachedChanceToKillInHits: getCachedChanceToKillInHits,
        cache: cachedResults
    };

    function isCachedChanceToKillInHits(health, bodyLocationChances, hitboxDamages) {
        const parameters = {
            bodyLocationChances: bodyLocationChances,
            hitboxDamages: hitboxDamages,
            health: health
        };
        const key = JSON.stringify(parameters);
        if (cachedResults[key]) {
            if (cachedResults[key].loaded == true) {
                return true; //return true if we have results
            }
            return false; //return but do nothing if currently loading
        }

        //start loading results
        addItemToCache(key);
        const webWorker = new Worker("./pages/warzone/chanceOfKillingInHits.js");
        webWorker.onmessage = function (message) {
            //save results
            cachedResults[key].probabilites = message.data;
            cachedResults[key].loaded = true;
            wzLoadProbabilityCharts();
        }
        webWorker.postMessage(parameters);
    }

    function addItemToCache(key) {
        //add cache size management if we utilize localstorage
        cachedResults[key] = {};
        cachedResults[key].loaded = false;
    }

    function getCachedChanceToKillInHits(health, bodyLocationChances, hitboxDamages) {
        const parameters = {
            bodyLocationChances: bodyLocationChances,
            hitboxDamages: hitboxDamages,
            health: health
        };
        const key = JSON.stringify(parameters);
        return cachedResults[key].probabilites;
    }
}