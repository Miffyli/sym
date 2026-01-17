const wzIsMobile = /Mobi/.test(navigator.userAgent);

// For weapon select dropdown
const wzInitialOption = "<option class='wzInitialOption' style='display: none'>-- Select --</option>"

const wzNoneOption = "<option value='none'>---- None ----</option>"

const maxWeaponCount = 7;
const wzNewWeaponText = "[New Weapon]"
const wzUrlDelimeter = "~"

const wzBetterColor = [50, 205, 50]; //#32CD32
const wzWorseColor = [255, 99, 71]; //#FF6347
const wzNeutralColor = [218,212,98]; //"#dad462"

const wzChartOptions = {
    common: {
        title: {
            style: {
                fontWeight: 'bold'
            }
        },
        subtitle: {
            text: 'Click weapon labels below to hide weapons from chart',
            style: {
                fontStyle: 'italic'
            }
        },
        chart: {
            plotBackgroundImage: './pages/warzone/img/symWatermark.png',
            zoomType: wzIsMobile ? undefined : 'xy',
            panning: !wzIsMobile,
            panKey: wzIsMobile ? undefined : 'shift',
            animation: true
        },
        colors: ["#ff9000", "#A9D852", "#7c40ff", "#03a9f4", "#d60024", "#F8F8FF", "#FF1493", "#66CDAA",  "#008080", "#A0522D", "#ffd700"],
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                },
                animation: 500,
                turboThreshold: 1,
            }
        },
        credits: {
            text: 'Sym.gg',
            href: 'https://sym.gg'
        },
        accessibility: {
            enabled: false,
        }
    },
    elementTargets: {
        wzTTKChart: {
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
            series: [],
        },
        wzDamageChart: {
            title: {
                text: 'Damage',
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
                //minorTickInterval: 50
            },
            yAxis: {
                title: {
                    text: 'Damage (per shot)',
                },
                min: 0,
            },
            tooltip: {
                shared: true,
                headerFormat: '{point.key} meters<br>',
                valueSuffix: 'dmg',
            },
            series: [],
        },
        wzBTKChart: {
            title: {
                text: 'Bullets-To-Kill (BTK)',
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
                //minorTickInterval: 50
            },
            yAxis: {
                title: {
                    text: 'Bullets',
                },
                min: 0,
                //max: damageYMax,
                //minRange: 100,
                //minorTickInterval: 10
            },
            tooltip: {
                shared: true,
                headerFormat: '{point.key} meters<br>',
                valueSuffix: ' bullets',
            },
            series: [],
        },
        wzMovementChart: {
            chart: {
                type: 'bar',
                plotBackgroundImage: './pages/warzone/img/symWatermark.png',
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
        },
        wzBulletSpeedChart: {
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
        },
        wzBulletDropChart: {
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
        },
        wzProbabilityChart: {
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
        },
        wzMeanDistributionTTKChart: {
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
        },
        wzAverageDownsPerMagChart: {
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
        }
    },
}

const wzCatLocalization = {
    "frontpiece" : "Barrel",
    "cable" : "Cable",
    "backpiece" : "Stock",
    "arms" : "Arms",
    "magazine" : "Magazine",
    "bolt" : "Bolt",
    "muzzle" : "Muzzle",
    "reargrip": "Rear Grip",
    "extra": "Laser",
    "extrapstl": "Laser",
    "optic" : "Optic",
    "gunperk" : "Perk",
    "gunperk2" : "Perk 2",
    "undermount" : "Underbarrel",
    "unique": "?",
    "ammunition": "Ammunition",
    "trigger": "Trigger Action",
    "pump": "Pump",
    "pumpgrip": "Pump Grip",
    "guard": "Guard",
    "boltaction": "Bolt Assembly",
}

const wzCatList = {
    "iw8" : [
        ["Assault Rifles" , "Assault Rifles"],
        ["Handguns" , "Pistols"],
        ["Launchers" , "Rocket Launchers"],
        ["LMGs" , "Machine Guns"],
        ["Shotguns" , "Shotgun"],
        ["SMGs" , "Submachine Gun"],
        ["Marksman Rifles" , "Marksman Rifles"],
        ["Sniper Rifles" , "Sniper Rifle"]
    ],
    "t9" : [
        ["Assault Rifles" , "Assault Rifles"],
        ["Handguns" , "Pistols"],
        ["Launchers" , "Rocket Launchers"],
        ["LMGs" , "Machine Guns"],
        ["Shotguns" , "Shotgun"],
        ["SMGs" , "Submachine Gun"],
        ["Tactical Rifles" , "Tactical Rifles"],
        ["Sniper Rifles" , "Sniper Rifle"]
    ],
    "s4" : [
        ["Assault Rifles" , "Assault Rifles"],
        ["Handguns" , "Pistols"],
        ["Launchers" , "Rocket Launchers"],
        ["LMGs" , "Machine Guns"],
        ["Shotguns" , "Shotgun"],
        ["SMGs" , "Submachine Gun"],
        ["Marksman Rifles" , "Marksman Rifles"],
        ["Sniper Rifles" , "Sniper Rifle"]
    ]
}

const wzGameAbbreviations = {
    "iw8": "MW",
    "t9": "BOCW",
    "s4": "VG"
}

// [Number of decimal points, suffix, friendly name, better direction]
// 1 = higher is better, 0 = neutral, -1 = lower is better
const wzStatFormat = {
    rateOfFire : [0, "rpm", "Fire Rate", 1],
    preFireDelay : [2, "ms", "Pre-Fire Delay", -1],
    muzzleVelocity : [0, "m/s", "Muzzle Velocity", 1],
    burstDelay : [0, "ms", "Burst Delay", -1],
    pelletCount : [0,"", "Pellet Count", 1],
    magazineSize : [0, "", "Ammo Count", 1],
    reloadTime : [2, "s", "Reload Time", -1],
    reloadAddTime : [2, "s", "Reload Add Time", -1],
    reloadEmptyTime : [2, "s", "Empty Reload Time", -1],
    reloadEmptyAddTime : [2, "s", "Empty Reload Add Time", -1],
    rechamberTime : [0, "ms", "Rechamber Time", -1],
    tacSprint : [2, "m/s", "Tactical Sprint", 1],
    sprint : [2, "m/s", "Sprint", 1],
    forward : [2, "m/s", "Forward", 1],
    backpedal : [2, "m/s", "Backpedal", 1],
    strafe : [2, "m/s", "Strafe", 1],
    aimDownSightTime : [0, "ms", "ADS Time", -1],
    aimOutTime : [0, "ms", "Time To Exit ADS", -1],
    fov : [0, "°", "Field of View (FoV)", 0],
    dropTime : [0, "ms", "Drop Time", -1],
    raiseTime : [0, "ms", "Raise Time", -1],
    sprintToFire : [0, "ms", "Sprint to Fire", -1],
    tacSprintToFire : [0, "ms", "Tactical Sprint to Fire", -1],
    meleeDamage : [0, "", "Melee Damage", 1],
    meleeHitsToKill : [0, "", "Melee Hits to Kill", -1],
    meleeLungeDistanceInches : [1, '″', "Melee Lunge Distance", 1],
    tacSprintDuration : [2, "s", "Sprint Duration", 1],
    ADSForward : [2, "m/s", "ADS Forward", 1],
    ADSBackpedal : [2, "m/s", "ADS Backpedal", 1],
    ADSStrafe : [2, "m/s", "ADS Strafe", 1],
    viewKickPitchMultiplier : [2, "x", "View Kick Ver Mul", -1],
    viewKickYawMultiplier : [2, "x", "View Kick Hor Mul", -1],
    gunKickPitchMultiplier : [2, "x", "Gun Kick Ver Mul", -1],
    gunKickYawMultiplier : [2, "x", "Gun Kick Hor Mul", -1],
    crouchGunKickMultiplier : [2, "x", "Crouch Gun Kick Mul", -1],
    proneGunKickMultiplier : [2, "x", "Prone Gun Kick Mul", -1],
    crouchViewKickMultiplier : [2, "x", "Crouch View Kick Mul", -1],
    proneViewKickMultiplier : [2, "x", "Prone View Kick Mul", -1],
    initialRecoilEndCount : [0, "", "Ends After Shot #", 0],
    initialGunKickMultiplier : [2, "x", "Initial Gun Kick Mul", -1],
    initialViewKickMultiplier : [2, "x", "Initial View Kick Mul", -1],
    sustainedRecoilStartCount : [0, "", "Begins On Shot #", 0],
    sustainedGunKickMultiplier : [2, "x", "Sustained Gun Kick Mul", -1],
    sustainedViewKickMultiplier : [2, "x", "Sustained View Kick Mul", -1],
    adsSpread : [4, "°", "ADS Spread", -1],
    hipfireStandMoveMax : [4, "°", "Strafing Hipfire Spread", -1],
    damageRangeMultiplier : [2, "x", "Damage Range Mul", 1],
    baseMoveSpeedMultiplier : [2, "x", "Non-ADS Move Speed", 1],
    adsMoveSpeedMultiplier : [2, "x", "ADS Move Speed", 1],
    strafeSpeedMultiplier : [2, "x", "Strafe Speed", 1],
    backpedalSpeedMultiplier : [2, "x", "Backpedal Speed", 1],
    sprintSpeedMultiplier : [2, "x", "Base Sprint Speed", 1],
    firingMoveSpeedMultiplier : [2, "x", "Hipfiring Move Speed", 1],
    adsFiringMoveSpeedMultiplier : [2, "x", "ADS Firing Move Speed", 1],
    tacticalSprintSpeedMultiplier : [2, "x", "Tac Sprint Speed" , 1],
    viewCenterSpeed : [0, "", "View Centerspeed", 1],
    gunCenterSpeed : [0, "", "Gun Centerspeed", 1],
};

const wzStatsTableEntries = [
    "rateOfFire",
    "preFireDelay",
    "muzzleVelocity",
    "burstDelay",
    "pelletCount",
    "spacer",
    "magazineSize",
    "reloadTime",
    "reloadAddTime",
    "reloadEmptyTime",
    "reloadEmptyAddTime",
    "rechamberTime",
    "spacer",
    "aimDownSightTime",
    "aimOutTime",
    "fov",
    "spacer",
    "dropTime",
    "raiseTime",
    "sprintToFire",
    "tacSprintToFire",
    "spacer",
    "meleeDamage",
    "meleeHitsToKill",
    "meleeLungeDistanceInches",
    "spacer",
    "tacSprintDuration",
    "spacer",
    "viewCenterSpeed",
    "gunCenterSpeed",
    "viewKickPitchMultiplier",
    "viewKickYawMultiplier",
    "gunKickPitchMultiplier",
    "gunKickYawMultiplier",
    "spacer",
    "crouchViewKickMultiplier",
    "crouchGunKickMultiplier",
    "proneViewKickMultiplier",
    "proneGunKickMultiplier",
    "spacer",
    "initialRecoilEndCount",
    "initialGunKickMultiplier",
    "initialViewKickMultiplier",
    "spacer",
    "sustainedRecoilStartCount",
    "sustainedGunKickMultiplier",
    "sustainedViewKickMultiplier",
    "spacer",
    "adsSpread",
    "hipfireStandMoveMax",
];

const wzHoverStatsEntries = [
    "rateOfFire",
    "preFireDelay",
    "muzzleVelocity",
    "burstDelay",
    "pelletCount",
    "magazineSize",
    "reloadTime",
    "reloadAddTime",
    "reloadEmptyTime",
    "reloadEmptyAddTime",
    "rechamberTime",
    "aimDownSightTime",
    "aimOutTime",
    "fov",
    "dropTime",
    "raiseTime",
    "sprintToFire",
    "tacSprintToFire",
    "meleeDamage",
    "meleeHitsToKill",
    "meleeLungeDistanceInches",
    "tacSprintDuration",
    "viewCenterSpeed",
    "gunCenterSpeed",
    "viewKickPitchMultiplier",
    "viewKickYawMultiplier",
    "gunKickPitchMultiplier",
    "gunKickYawMultiplier",
    "initialRecoilEndCount",
    "initialGunKickMultiplier",
    "initialViewKickMultiplier",
    "sustainedRecoilStartCount",
    "sustainedGunKickMultiplier",
    "sustainedViewKickMultiplier",
    "adsSpread",
    "hipfireStandMoveMax",
    "damageRangeMultiplier",
    "baseMoveSpeedMultiplier",
    "adsMoveSpeedMultiplier",
    "strafeSpeedMultiplier",
    "backpedalSpeedMultiplier",
    "sprintSpeedMultiplier",
    "tacticalSprintSpeedMultiplier",
    "firingMoveSpeedMultiplier",
    "adsFiringMoveSpeedMultiplier",
    "crouchViewKickMultiplier",
    "crouchGunKickMultiplier",
    "proneViewKickMultiplier",
    "proneGunKickMultiplier",
];

const wzUserGameplaySettings = {
    includeOBDinTTK: false,
    includeBVinTTK: false,
    fov: 80,
    useAffectedFov: false,
    adsTargetDistanceMeters: 30,
    hipTargetDistanceMeters: 10,
    targetLateralSpeed: 0,
    adsRenderZoom: 1
}

//Chance to miss calculation is limited by the number of factorials available
const bigIntFactorialArray = createBigIntFactorialArray(150);

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