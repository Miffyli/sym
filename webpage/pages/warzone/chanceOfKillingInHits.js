const bigFactorialArray = createBigIntFactorialArray(30);

function createBigIntFactorialArray(max) {
    const arr = Array(max + 1);
    arr[0] = 1n;
    arr[1] = 1n;
    let rval = 1n;
    for (var i = 2; i <= max; i++) {
        rval *= BigInt(i);
        arr[i] = rval;
    }
    return arr;
}

onmessage = function (message) {
    const result = probabilityOfKillingInHitCount(message.data.health, message.data.bodyLocationChances, message.data.hitboxDamages);
    postMessage(result);
    close();
}

function probabilityOfKillingInHitCount(health, bodyLocationChances, hitboxDamages) {
    const damageArray = Object.values(hitboxDamages);
    const uniqueDamages = [...new Set(damageArray)]; //create array of unique damage values
    if (Math.min(...uniqueDamages) == 0) {
        return false;
    }
    const maxBTK = Math.ceil(health / Math.min(...uniqueDamages));
    const minBTK = Math.ceil(health / Math.max(...uniqueDamages));
    if (maxBTK > 30) {
        return false;
    }

    //simple function that just find probability of the shot damage based on location
    //if you are doing headshot damage and head is 10% chance, returns 0.1
    function calculateProbabilityOfShotDamage(shotDamage) {
        const totalChance = Object.values(bodyLocationChances).reduce(addReducer);

        let chance = 0;
        Object.keys(hitboxDamages).forEach((key) => {
            if (shotDamage == hitboxDamages[key]) {
                chance += bodyLocationChances[key];
            }
        });
        return chance / totalChance;
    }

    //For each unique damage value, create an array of pairs of damage vs shot count up to btk
    //[damage, 0] ...[damage, btk]
    const hitCounts = uniqueDamages.map(x => {
        const shotCounts = Array.from(Array(maxBTK + 1), (x, i) => i);
        return cartesian([x], shotCounts)
    });

    //cartesian those together to get [[damage1, x], [damage2, y], [damage3, z]]
    const shotCombinations = cartesianGenerator(...hitCounts);

    //We will now calculate the probability of achieving each BTK
    const chancesToKillInHits = new Array(maxBTK + 1).fill(0);;
    for (const shotCombo of shotCombinations) {
        //find total number of shots fired
        const numberOfShots = shotCombo.reduce((previousValue, currentValue) => {
            return previousValue + currentValue[1];
        }, 0);
        //disregard combos that we already know don't have enough shots, or have too many
        if (numberOfShots > maxBTK || numberOfShots < minBTK) {
            continue;
        }
        //find damage and see if it kills. Ignore if it doesn't
        //Over-damage combos are included
        const damage = shotCombo.reduce((previousValue, currentValue) => {
            return previousValue + currentValue[0] * currentValue[1];
        }, 0);
        if (damage < health) {
            continue;
        }

        //mdf = n! / (x1! * x2! * ...) * (p1^(x1) * p2^(x2) * ...)
        let numerator = 100;
        let denominator = 1n;
        shotCombo.forEach((shots) => {
            const damage = shots[0];
            const hitCount = shots[1];
            const chanceOfDamage = calculateProbabilityOfShotDamage(damage);
            numerator *= (chanceOfDamage ** hitCount);
            denominator *= bigFactorialArray[hitCount];
        });
        const mdf = Number(bigFactorialArray[numberOfShots] / denominator) * numerator;
        //cdf is sum of all valid (killing) mdfs
        chancesToKillInHits[numberOfShots] += mdf;
    }
    //max BTK should have a 100% chance of killing or something's wrong.
    //Can probably exclude it for further optimization later

    function cartesian(...a) {
        return [...cartesianGenerator(...a)];
    }

    function* cartesianGenerator(head, ...tail) {
        const remainder = tail.length > 0 ? cartesianGenerator(...tail) : [[]];
        for (let r of remainder) for (let h of head) yield [h, ...r];
    }

    function addReducer(previousValue, currentValue) {
        return previousValue + currentValue;
    }

    return chancesToKillInHits;
}