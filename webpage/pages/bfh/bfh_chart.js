var gravityTooltip = "Gravity"
var bfhWeaponClassTitles = ["","Operator","Mechanic","Enforcer","Professional","Shotguns","","", "Sidearms", ];
var firestormWeapons = [];
var customizations = new Object();
var addVariantCounter = 0;

function BFHinitializeChartPage() {
    bfhPrintWeapons();

    $("#actionMenu").menu({
        position: {my: "left bottom", at: "left top"}
    });

    // Weapon select buttons
    $("#showHideCheckboxes input").checkboxradio(
        {icon:false}
    );
    $("#showHideCheckboxes input").change(function(){
        this.blur();
        bfhShowHideClasses();
    });

    $("#showHideSubCats input").checkboxradio(
        {icon: false}
    );
    $("#showHideSubCats input").change(function(){
        this.blur();
        showHideSubCats();
    });

    $("#shortcutCombobox").combobox({
        select: function (event, ui) {
            $("." + this.value.replace(/ |\//g,""))[0].scrollIntoView({
              behavior: 'smooth'
            });
        }
    });
}

function showBlank(obj){
    obj.onerror=null;
    obj.src="./pages/bfv/img/blankWeapon.png";
}

function bfhPrintWeapons(){
    var statsHtml = "";

    statsHtml += bfhPrintWeaponClass(1);
    statsHtml += bfhPrintWeaponClass(2);
    statsHtml += bfhPrintWeaponClass(3);
    statsHtml += bfhPrintWeaponClass(4);
    statsHtml += bfhPrintWeaponClass("sh");
	statsHtml += bfhPrintWeaponClass(8);

    $("#pageBody").html(statsHtml);
    //bfhShowHideClasses();

    $(document).tooltip({track: true});

    initializeSorts();

    $(".sortableTable").sortable({
       opacity: 0.7,
       placeholder: "ui-state-highlight",
       handle: ".sortDragIcon"
    });

    showHideSubCats();
    bfvChartSortLetters("lblWeaponNameValue", compareNames)
}

function bfhPrintWeaponClass(weaponClass){
    var titleIndex = weaponClass == "sh" ? 5 : weaponClass;
    var classImgFileName = bfhWeaponClassTitles[titleIndex] + ".png";

    var rtnStr = "";
    rtnStr += "<div id='" + bfhWeaponClassTitles[titleIndex] + "Section'>" +
              "<div class='classHeader'><img src='./pages/bfh/img/" + classImgFileName + "'>" + bfhWeaponClassTitles[titleIndex] + "</div>";
    rtnStr += "<table class='table classTable'><tbody class='sortableTable'>";

    $.each(BFHWeaponData, function( key, value ) {
        if (value.Class == weaponClass && value.attachments == "none-none-none"){
            rtnStr += bfhPrintWeapon(value);
        }
    });

    rtnStr += "</tbody></table></div>";
    return rtnStr;
}

function bfhPrintWeapon(weaponStats){
    var firestormIcon = (firestormWeapons.includes(weaponStats.WeapShowName) ? "<img src='./pages/bfv/img/firestorm.png' " + firestormTooltip + ">" : "");
    var reloadData = bfhCreateReloadGraphic(weaponStats.ReloadEmpty, weaponStats.ReloadLeft, weaponStats.MagSize, weaponStats.AmmoName);
    var standRecoilData = bfhCreateRecoilGraphic(weaponStats.ADSRecoilLeft, weaponStats.ADSRecoilRight, weaponStats.ADSRecoilUp, weaponStats.FirstShotRecoilMul, weaponStats.ADSRecoilDec);
    var spreadTableGraphic = bfhCreateSpreadTableGraphic(weaponStats.ADSStandBaseMin,weaponStats.ADSCrouchBaseMin,weaponStats.ADSProneBaseMin,
                                                      weaponStats.ADSStandMoveMin,weaponStats.ADSCrouchMoveMin,weaponStats.ADSProneMoveMin,
                                                      weaponStats.HIPStandBaseMin,weaponStats.HIPCrouchBaseMin,weaponStats.HIPProneBaseMin,
                                                      weaponStats.HIPStandMoveMin,weaponStats.HIPCrouchMoveMin,weaponStats.HIPProneMoveMin,
                                                      weaponStats.ADSStandBaseSpreadInc, weaponStats.HIPStandBaseSpreadInc);
    var spreadIncDecTableGraphic = bfhCreateSpreadIncDecTableGraphic(weaponStats.ADSStandBaseSpreadInc, weaponStats.ADSStandBaseSpreadDec);
    weaponStats.WeapShowName = weaponStats.WeapShowName.toString(); //handle weapon names that are numbers, i.e 1886
    var rtnStr = "<tr class='" + weaponStats.WeapShowName.replace(/ |\//g,"") + " sub_" + getWeaponsSubcat(weaponStats.WeapShowName) +"'>" +
                     "<td class='firstColumn'>" +
                         "<div class='lblWeaponName'>" +
                            "<span class='lblWeaponNameValue'>" + weaponStats.WeapShowName + "</span>" + firestormIcon +
                         "</div>" +
                         "<div class='weaponImgContainer'>" +
                             "<img class='weaponImg' src='./pages/bfh/img/weapons/" + bfhGetWeaponImageFilename(weaponStats.WeapShowName.replace("/","")) + ".png' onerror='showBlank(this);'>" +
                         "</div>" +
                         "<div style='line-height: 20px;'>" +
                             "<span class='lblMagText'>" +
                                "<span class='lblMag'>" + weaponStats.MagSize + "</span>" +
                                "<span class='lblSuffixText'> x " + bfhFormatAmmoType(weaponStats.AmmoName) + "</span>" +
                             "</span>" +
                             bfhCreateRPMGrpahic(weaponStats.RoF) +
                         "</div>" +
                     "</td>" +

              "<td class='secondColumn'>" +
                  "<div class='damageChartContainer' " + damageTooltip + ">" + bfhcreateDamageChart([weaponStats['SDmg'], weaponStats['EDmg']], [weaponStats['DOStart'], weaponStats['DOEnd']], weaponStats.Pellets, weaponStats.AmmoName) + "</div>" +
              "</td>" +

              "<td>" +
              //"<div class='underMagSection'>" +
              "<td>" +
                  "<div class='reloadDataAndMagCount'>" + bfhCreateBulletSpeedGraphic(weaponStats.InitialSpeed, weaponStats.Drag) + reloadData  + "</div>" +
                  "<div class='deployTimeBox' " + gravityTooltip + "><span class='ui-icon  ui-icon-arrowthick-1-s'></span><span class='lblDeployTime'>" + weaponStats.BDrop + "<span class='lblSuffixText'> m/s²</span></span></div>" +
              "</td><td>" +
                  "<div class='recoilGraphicBox' " + recoilTooltip + ">" + standRecoilData + "</div>" +
              "</td><td>" +
                  "<div>" +
                      "<div class='spreadLabels' " + adsTooltip + ">" +
                          bfhCreateSpreadLabels(weaponStats.ADSStandMoveMin, weaponStats.ADSStandBaseMin) +
                      "</div>" +
                      "<div class='spreadCircles' " + adsTooltip + ">" + bfhCreateSpreadGraphic(weaponStats.ADSStandBaseMin, weaponStats.ADSStandMoveMin) + "</div>" +
                  "</div>" +
              "</td><td>" +
                  "<div class='hipSpreadContainer' " + hipfireTooltip + ">" + bfhCreateHipSpreadGraphic(weaponStats.HIPStandMoveMin, weaponStats.HorDispersion) + "</div>" +
            //  "</td><td>" +
                  
              "</td><td>" +
                  spreadTableGraphic +
              "</td><td>" +
                  spreadIncDecTableGraphic +
              "</td><td>" +
                  "<div>" +
                      "<img class='sortDragIcon' src='./pages/bfv/img/sortDrag.png' " + dragTooltip + ">" +
                  "</div>" +
               "</td>" +
              //"<div>DeployTime   : " + weaponStats.DeployTime + "</div>" +
              "</tr>";
        return rtnStr;
}

function bfhGetWeaponImageFilename(weaponName){
    var weaponFilename = "";

    weaponFilename =  weaponName.replace("(Slug)", "").replace("(Buckshot)", "").replace("(Flechette)", "").replace("(Buckshot Semi)", "");

    return weaponFilename.trim();
}

function bfhCreateRPMGrpahic(RoF){
    var rpmGrpahic = "";
    if (RoF > 0){
        rpmGrpahic = "<span class='lblRPM'>" +
                         "<span class='lblRPMValue' " + rpmTooltip + ">" + RoF + "</span>" +
                         "<span class='lblSuffixText'> rpm</span>" +
                     "</span>";
    } else {
        rpmGrpahic = "<span class='lblRPMSingle'>" +
                         "<span class='lblRPMValue' " + rpmTooltip + ">Single-Fire</span>" +
                     "</span>";        
    }
    return rpmGrpahic;
}

function bfhCreateBulletSpeedGraphic(initialSpeed, drag){
    return "<div class='bulletSpeedContainer'>" +
             "<span class='pr-3 lblSpeed' " + bulletSpeedTooltip + ">" +
               "<img src='./pages/bfv/img/speed.png'>" +
               "<span class='lblSpeedValue'>" + initialSpeed + "</span>" +
               "<span class='lblSuffixText'> m/s</span>" +
             "</span>" +
           "</div>"
}

function bfhCreateReloadGraphic(reloadEmpty, reloadLeft, magSize, ammoType){
    var reloadData = "<div>" +
                         "<div class='sectionReload' " + reloadTooltip + ">";
    if (reloadEmpty != "N/A"){
        if(reloadLeft == 0){
            //reloadData = "<div class='lblReloadLeft'>" + reloadLeft +"<span class='lblSuffixText'> s</span></div>";

            reloadData += "<div class='lblReloadLeft'>" +
                              "<img src='./pages/bfv/img/reload.png' class='imgReload'>" +
                              "<span>" + reloadEmpty.toFixed(2) + "</span>" +
                              "<span class='lblSuffixText'> s</span>" +
                          "</div>" +
                      "</div>";
        } else {
            reloadData += "<div class='lblReloadLeft'>" +
                              "<img src='./pages/bfv/img/reload.png' class='imgReload'>" +
                              "<span>" + reloadLeft.toFixed(2) + "</span>" +
                              "<span class='lblSuffixText'> s</span>" +
                          "</div>" +
                          "<div class='lblReloadEmpty'>" + reloadEmpty.toFixed(2) +
                              "<span class='lblSuffixText'> s</span>" +
                          "</div>" +
                       "</div>";
        }
    } else {
        reloadData += "</div " + magTooltip + ">";
    }
    return reloadData +  "</div>";
}

function bfhFormatAmmoType(ammo){
    var newAmmo = ammo.replace("Slug", "").replace("_Semi", "").replace("_SMG", "");
    
    return newAmmo;
}

function bfhCreateRecoilGraphic(recoilLeft, recoilRight, recoilInitialUp, recoilFirstShot, recoilDec){

    if (recoilInitialUp <= 2){
        var recoilUpLength = (90 - (recoilInitialUp * 30));
        var recoilUpTextY = (71 - (recoilInitialUp * 30));
        var recoilInitUpTextY = (86 - (recoilInitialUp * 30));
        var recoilHorLenth1 = (60 - (recoilLeft * 30));
        var recoilHorLenth2 = (60 + (Math.abs(recoilRight) * 30));
        var point5inc = (recoilInitialUp > .5) ? "<line x1='55' y1='75' x2='65' y2='75' style='stroke:white; stroke-width:1'/>" : "";
        var oneinc = (recoilInitialUp > 1.0) ? "<line x1='55' y1='60' x2='65' y2='60' style='stroke:white; stroke-width:1'/>" : "";
        var onepoint5inc = (recoilInitialUp > 1.5) ? "<line x1='55' y1='45' x2='65' y2='45' style='stroke:white; stroke-width:1'/>" : "";

        var recoilGraphic = "<svg viewbox='0 0 120 100' style='width: 100px;'>" +
                                point5inc + oneinc + onepoint5inc +
                                "<line x1='" + recoilHorLenth1 + "' y1='90' x2='" + recoilHorLenth2 + "' y2='90' style='stroke:white; stroke-width:2'/>" + // Left - Right
                                "<line x1='60' y1='90' x2='60' y2='" + recoilUpLength + "' style='stroke:white; stroke-width:2'/>" + // Up - Down
                                "<text x='" + (recoilHorLenth1 - 4).toString() + "' y='100' text-anchor='end' class='recoilValue recoilHorValue'>" + roundToThree(recoilLeft) + "°</text>" +
                                "<text x='" + (recoilHorLenth2 + 4).toString() + "' y='100' class='recoilValue'>" + roundToThree(recoilRight) + "°</text>" +
                                "<text x='60' y='" + recoilInitUpTextY + "' text-anchor='middle' class='recoilValue recoilInitUpValue'>" + roundToThree(recoilInitialUp) + "°</text>" +
                            "</svg>";
    } else {
        var recoilGraphic = "<svg viewbox='0 0 120 100' style='width: 100px;'>" +
                                "<line x1='50' y1='90' x2='70' y2='90' style='stroke:#555; stroke-width:2'/>" +
                                "<line x1='60' y1='90' x2='60' y2='80' style='stroke:#555; stroke-width:2'/>" +
                                "<text x='44' y='95' text-anchor='end' class='recoilValue recoilHorValue'>" + roundToThree(recoilLeft) + "°</text>" +
                                "<text x='74' y='95' class='recoilValue'>" + roundToThree(Math.abs(recoilRight)) + "°</text>" +
                                "<text x='60' y='76' text-anchor='middle' class='recoilValue recoilInitUpValue'>" + roundToThree(recoilInitialUp) + "°</text>" +
                            "</svg>";
    }

    recoilGraphic += "<div>" + 
                         "<div class='recoilFirstShot'>" + 
                             "<div class='recoilFirstShotLabel'>1st</div>" + 
                             "<div>" + ((recoilFirstShot.toString().split(".").length) > 1 ? recoilFirstShot : recoilFirstShot + ".0") + " x</div>" + 
                         "</div>" +
                         "<div class='recoilDec'><img src='./img/decrease.png'> " + roundToDecimal(recoilDec, 1) + "</div>" +
                     "</div>";

    return recoilGraphic;
}

function bfhCreateSpreadLabels(ADSStandMoveMin, ADSStandBaseMin){
    var rtnStr = "";
    if (ADSStandMoveMin > 0){
        rtnStr = "<div class='speadMoveLabel'>" + roundToThree(ADSStandMoveMin) + "°</div>" +
                 "<div class='speadBaseLabel'>" + roundToThree(ADSStandBaseMin) + "°</div>";
    }
    return rtnStr;
}

function bfhCreateSpreadGraphic(ADSBase, ADSMove){
    var spreadGraphic = "";

    var adsBaseCircle = "";
    if(ADSBase >= 0.05){
        adsBaseCircle = "<circle cx='0' cy='215' r='" + (ADSBase * 133).toString() + "' class='spreadBaseCicle'></circle>";
    } else {
        adsBaseCircle = "<circle cx='0' cy='215' r='4' stroke-width='2' style='fill: none; stroke: #C8C63A; fill: #C8C63A;'></circle>";
    }

    spreadGraphic = "<svg viewBox='0 0 215 215' style='width: 80px;'>" +
                    "<circle cx='0' cy='215' class='spreadMoveCicleBG' r='214'></circle>" +
                    "<circle cx='0' cy='215' r='" + (ADSMove * 133).toString() + "' class='spreadMoveCicle'></circle>" +
                    adsBaseCircle +
                    "</svg>";
    return spreadGraphic;
}

function bfhCreateHipSpreadGraphic(HIPSpread, HorDispersion){
    var lineOffset = HIPSpread * 2;
    var spreadGraphic = "";

    if (HorDispersion == 0 || HorDispersion == .5) { //Villa Perosa hordispersion = .5
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;'>" +
                        "<line x1='50' y1='" + (lineOffset + 52) + "' x2='50' y2='" + (lineOffset + 65) + "' class='hipSpreadLine'></line>" +
                        "<line x1='50' y1='" + (48 - lineOffset) + "' x2='50' y2='" + (35 - lineOffset) + "' class='hipSpreadLine'></line>" +

                        "<line y1='50' x1='" + (lineOffset + 52) + "' y2='50' x2='" + (lineOffset + 65) + "' class='hipSpreadLine'></line>" +
                        "<line y1='50' x1='" + (48 - lineOffset) + "' y2='50' x2='" + (35 - lineOffset) + "' class='hipSpreadLine'></line>" +

                        "<text x='10' y='91' class='hipSpreadValue'>" + roundToThree(HIPSpread) + "°</text>" +
                        "</svg>";
    } else {
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;'>" +
                        "<circle cx='50' cy='50' r='" + (HorDispersion * 10).toString() + "' class='hipSpreadLine'></circle>" +
                        "<text x='7' y='20' class='hipSpreadValue'>" + roundToThree(HorDispersion) + "°</text>" +
                        "</svg>";
    }
    return spreadGraphic;
}

function bfhCreateSpreadTableGraphic(ADSStand, ADSCrouch, ADSProne, ADSStandMove, ADSCrouchMove, ADSProneMove,
                                  HIPStand, HIPCrouch, HIPProne, HIPStandMove, HIPCrouchMove, HIPProneMove,
                                  ADSIncrease, HIPIncrease){
    var tableGraphic = "<table class='spreadTable'>" +
                           "<tr>" + "<td></td><td>ADS</td><td>HIP</td>" + "</tr>" +
                           "<tr>" + "<td rowspan='3'><img src='./img/standing.png'></td><td>" + roundToThree(ADSStand) + "°</td><td>" + roundToThree(HIPStand) + "°</td>" +
                           "<tr>" + "<td>" + roundToThree(ADSCrouch) + "°</td><td>" + roundToThree(HIPCrouch) + "°</td>" + "</tr>" +
                           "<tr>" + "<td>" + roundToThree(ADSProne) + "°</td><td>" + roundToThree(HIPProne) + "°</td>" + "</tr>" +
                           "<tr>" + "<td rowspan='3'><img src='./img/moving.png'></td><td>" + roundToThree(ADSStandMove) + "°</td><td>" + roundToThree(HIPStandMove) + "°</td>" +
                           "<tr>" + "<td>" + roundToThree(ADSCrouchMove) + "°</td><td>" + roundToThree(HIPCrouchMove) + "°</td>" + "</tr>" +
                           "<tr>" + "<td>" + roundToThree(ADSProneMove) + "°</td><td>" + roundToThree(HIPProneMove) + "°</td>" + "</tr>" +

                       "</table>"
    return tableGraphic;
}

function bfhCreateSpreadIncDecTableGraphic(spreadIncrease, spreadDecrease){
    var tableGraphic = "<table class='spreadIncDecTable'>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/increase.png'></td><td>" + roundToThree(spreadIncrease) + "°</td>" + "</tr>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/decrease.png'></td><td>" + roundToThree(spreadDecrease) + "°</td>" + "</tr>" +
                       "</table>"
return tableGraphic;
}

function bfhcreateDamageChart(damageArr, distanceArr, numOfPellets, ammoType){
    var damageChart;
    if (damageArr[0] > 50 || damageArr[0] == 0){ // damage == 0 is for LVG becuase it has splash damage > 50.
        damageChart = bfhCreateDamageChart100Max(damageArr, distanceArr, ammoType);
    } else {
        damageChart = bfhCreateDamageChart50Max(damageArr, distanceArr, numOfPellets, ammoType)
    }
    return damageChart;
}

var fragLabels = "<text x='51' class='chartSplashLabel' y='9'>1m</text>" +
                 "<text x='101' class='chartSplashLabel' y='9'>2m</text>" +
                 "<text x='151' class='chartSplashLabel' y='9'>3m</text>" +
                 "<text x='201' class='chartSplashLabel' y='9'>4m</text>" +
                 "<text x='251' class='chartSplashLabel' y='9'>5m</text>";

function bfhCreateDamageChart50Max(damageArr, distanceArr, numOfPellets, ammoType){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (120 - (2 * damageArr[0])) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 120 - (2 * damageArr[i]);
        var distanceCoord = 2 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "300," + (120 - (2 * damageArr[damageArr.length - 1])).toString();

    var maxDamage = roundToDecimal(damageArr[0], "1");
    var minDamage = roundToDecimal(damageArr[damageArr.length - 1], "1");

    var maxDamageText = "";
    maxDamageText = "<text x='" + (distanceArr[1] - 20) + "' y='" + (116 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 150){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (114 - (2 * minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='225' y='" + (111 - (2 * minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    }

    var pelletsLabel = "";
    if (numOfPellets > 1){
        pelletsLabel = "<text x='230' y='85' class='chartMinMaxLabel'>" + numOfPellets + " pellets</text>";
    }

    var fragSplash = "";
    if(ammoType == "12gFrag"){
        fragSplash = "<polyline class='chartSplashDamageLine' style='stroke: orange;' points='0,70 100,70 125,120'></polyline>" +
                     fragLabels +
                     "<text y='66' class='chartMinMaxSplashLabel' x='103'>25 (Splash Damage)</text>";
        if (maxDamage == 20){
            maxDamageText = "<text x='" + (distanceArr[1] - 0) + "' y='" + (124 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
        }
        minDamageText = "<text x='" + ((distanceArr[distanceArr.length - 1] * 2) - 15) + "' y='" + (134 - (2 * minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    }
	
	if (maxDamage == minDamage){
        minDamageText = "<text x='2000' y='" + (114 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";//This is a hackjob fix but it hides duplicate damage values
    }

    return "<svg viewbox='0 0 300 120' class='damageChart'>" +
               "<rect width='300' height='120' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

               "<line x1='10' y1='0' x2='10' y2='120' class='gridLineThin'/>" +
               "<line x1='20' y1='0' x2='20' y2='120' class='gridLineThin'/>" +
               "<line x1='30' y1='0' x2='30' y2='120' class='gridLineThin'/>" +
               "<line x1='40' y1='0' x2='40' y2='120' class='gridLineThin'/>" +
               "<line x1='60' y1='0' x2='60' y2='120' class='gridLineThin'/>" +
               "<line x1='70' y1='0' x2='70' y2='120' class='gridLineThin'/>" +
               "<line x1='80' y1='0' x2='80' y2='120' class='gridLineThin'/>" +
               "<line x1='90' y1='0' x2='90' y2='120' class='gridLineThin'/>" +
               "<line x1='110' y1='0' x2='110' y2='120' class='gridLineThin'/>" +
               "<line x1='120' y1='0' x2='120' y2='120' class='gridLineThin'/>" +
               "<line x1='130' y1='0' x2='130' y2='120' class='gridLineThin'/>" +
               "<line x1='140' y1='0' x2='140' y2='120' class='gridLineThin'/>" +
               "<line x1='160' y1='0' x2='160' y2='120' class='gridLineThin'/>" +
               "<line x1='170' y1='0' x2='170' y2='120' class='gridLineThin'/>" +
               "<line x1='180' y1='0' x2='180' y2='120' class='gridLineThin'/>" +
               "<line x1='190' y1='0' x2='190' y2='120' class='gridLineThin'/>" +
               "<line x1='210' y1='0' x2='210' y2='120' class='gridLineThin'/>" +
               "<line x1='220' y1='0' x2='220' y2='120' class='gridLineThin'/>" +
               "<line x1='230' y1='0' x2='230' y2='120' class='gridLineThin'/>" +
               "<line x1='240' y1='0' x2='240' y2='120' class='gridLineThin'/>" +
               "<line x1='260' y1='0' x2='260' y2='120' class='gridLineThin'/>" +
               "<line x1='270' y1='0' x2='270' y2='120' class='gridLineThin'/>" +
               "<line x1='280' y1='0' x2='280' y2='120' class='gridLineThin'/>" +
               "<line x1='290' y1='0' x2='290' y2='120' class='gridLineThin'/>" +

               "<line x1='50' y1='0' x2='50' y2='120' class='gridLineFat'/>" +
               "<line x1='100' y1='0' x2='100' y2='120' class='gridLineFat'/>" +
               "<line x1='150' y1='0' x2='150' y2='120' class='gridLineFat'/>" +
               "<line x1='200' y1='0' x2='200' y2='120' class='gridLineFat'/>" +
               "<line x1='250' y1='0' x2='250' y2='120' class='gridLineFat'/>" +

               "<line x1='0' y1='70' x2='300' y2='70' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
               "<text x='0' y='78' class='chartLabel'>25</text>" +
               "<line x1='0' y1='53' x2='300' y2='53' style='stroke:rgb(175,175,175); stroke-width:.25'/>" +
               "<text x='0' y='61' class='chartLabel'>33</text>" +
               "<line x1='0' y1='20' x2='300' y2='20' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
               "<text x='0' y='28' class='chartLabel'>50</text>" +

               "<text x='51' y='119' class='chartLabel'>25m</text>" +
               "<text x='101' y='119' class='chartLabel'>50m</text>" +
               "<text x='151' y='119' class='chartLabel'>75m</text>" +
               "<text x='201' y='119' class='chartLabel'>100m</text>" +
               "<text x='251' y='119' class='chartLabel'>125m</text>" +

               fragSplash +
			   "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
               pelletsLabel +
           "</svg>"
}

function bfhCreateDamageChart100Max(damageArr, distanceArr, ammoType){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (120 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 120 - damageArr[i];
        var distanceCoord = 2 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "300," + (120 - damageArr[damageArr.length - 1]).toString();

    var maxDamage = roundToDecimal(damageArr[0], "1");
    var minDamage = roundToDecimal(damageArr[damageArr.length - 1], "1");


    var maxDamageText = "";
    if(damageArr[0] > 80){
        maxDamageText = "<text x='" + (distanceArr[1] + 15) + "' y='" + (131 - (maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (116 - (maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    }

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 150){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (114 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='175' y='" + (114 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    }
	
	if (maxDamage == minDamage){
        minDamageText = "<text x='2000' y='" + (114 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";//This is a hackjob fix but it hides duplicate damage values
    }
    
    if (minDamage > 115){
        var oneHitKillText = "<text x='63' y='40' class='chartMinMaxLabel'>1 Hit Impact Kill at All Ranges</text>";
    }

    
    var fragSplash = "";
    var noImpactDamageText = "";
    if (maxDamage == 0){
        maxDamageText = "";
        noImpactDamageText = "<text x='15' y='72' class='chartMinMaxLabel'>No Impact Damage</text>"
        damageLineCoords = "x1='10' y1='0' x2='10' y2='120'";
        
        fragSplash = "<polyline class='chartSplashDamageLine' style='stroke: orange;' points='0,11 75,11 250,120'></polyline>" +
            fragLabels + "<text class='chartMinMaxSplashLabel' x='103' y='23'>112 (Splash Damage)</text>";
    }

    if(ammoType == "HE Bolt"){
        fragSplash = "<polyline class='chartSplashDamageLine' style='stroke: orange;' points='0,67 15,67 100,120'></polyline>" +
                     fragLabels +
                     "<text y='72' class='chartMinMaxSplashLabel' x='30'>56 (Splash Damage)</text>";
    } else if(ammoType == "40mm HE"){
        fragSplash = "<polyline class='chartSplashDamageLine' style='stroke: orange;' points='0,67 105,67 250,120'></polyline>" +
                     fragLabels +
                     "<text y='63' class='chartMinMaxSplashLabel' x='115'>56 (Splash Damage)</text>";
    }
	
	var smokeRadius = "";
    if(ammoType == "40mm Smoke"){
        smokeRadius = "<polyline class='smokeRadiusLine' style='stroke: #C5CED2;' points='14,0 14,150'></polyline>" +
                      "<text y='46' class='smokeRadiusLabel' x='27'>7m Smoke Radius</text>";
    }
	
    return "<svg viewbox='0 0 300 120' class='damageChart'>" +
               "<rect width='300' height='120' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

               "<line x1='10' y1='0' x2='10' y2='120' class='gridLineThin'/>" +
               "<line x1='20' y1='0' x2='20' y2='120' class='gridLineThin'/>" +
               "<line x1='30' y1='0' x2='30' y2='120' class='gridLineThin'/>" +
               "<line x1='40' y1='0' x2='40' y2='120' class='gridLineThin'/>" +
               "<line x1='60' y1='0' x2='60' y2='120' class='gridLineThin'/>" +
               "<line x1='70' y1='0' x2='70' y2='120' class='gridLineThin'/>" +
               "<line x1='80' y1='0' x2='80' y2='120' class='gridLineThin'/>" +
               "<line x1='90' y1='0' x2='90' y2='120' class='gridLineThin'/>" +
               "<line x1='110' y1='0' x2='110' y2='120' class='gridLineThin'/>" +
               "<line x1='120' y1='0' x2='120' y2='120' class='gridLineThin'/>" +
               "<line x1='130' y1='0' x2='130' y2='120' class='gridLineThin'/>" +
               "<line x1='140' y1='0' x2='140' y2='120' class='gridLineThin'/>" +
               "<line x1='160' y1='0' x2='160' y2='120' class='gridLineThin'/>" +
               "<line x1='170' y1='0' x2='170' y2='120' class='gridLineThin'/>" +
               "<line x1='180' y1='0' x2='180' y2='120' class='gridLineThin'/>" +
               "<line x1='190' y1='0' x2='190' y2='120' class='gridLineThin'/>" +
               "<line x1='210' y1='0' x2='210' y2='120' class='gridLineThin'/>" +
               "<line x1='220' y1='0' x2='220' y2='120' class='gridLineThin'/>" +
               "<line x1='230' y1='0' x2='230' y2='120' class='gridLineThin'/>" +
               "<line x1='240' y1='0' x2='240' y2='120' class='gridLineThin'/>" +
               "<line x1='260' y1='0' x2='260' y2='120' class='gridLineThin'/>" +
               "<line x1='270' y1='0' x2='270' y2='120' class='gridLineThin'/>" +
               "<line x1='280' y1='0' x2='280' y2='120' class='gridLineThin'/>" +
               "<line x1='290' y1='0' x2='290' y2='120' class='gridLineThin'/>" +

               "<line x1='50' y1='0' x2='50' y2='120' class='gridLineFat'/>" +
               "<line x1='100' y1='0' x2='100' y2='120' class='gridLineFat'/>" +
               "<line x1='150' y1='0' x2='150' y2='120' class='gridLineFat'/>" +
               "<line x1='200' y1='0' x2='200' y2='120' class='gridLineFat'/>" +
               "<line x1='250' y1='0' x2='250' y2='120' class='gridLineFat'/>" +

               "<line x1='0' y1='20' x2='300' y2='20' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
               "<text x='0' y='28' class='chartLabel'>100</text>" +
               "<line x1='0' y1='70' x2='300' y2='70' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
               "<text x='0' y='78' class='chartLabel'>50</text>" +
               
               "<text x='51' y='119' class='chartLabel'>25m</text>" +
               "<text x='101' y='119' class='chartLabel'>50m</text>" +
               "<text x='151' y='119' class='chartLabel'>75m</text>" +
               "<text x='201' y='119' class='chartLabel'>100m</text>" +
               "<text x='251' y='119' class='chartLabel'>125m</text>" +
			   
			   "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
               oneHitKillText +
               fragSplash +
               smokeRadius +
			   noImpactDamageText +
           "</svg>"
}

function bfhShowHideClasses(){
    if ($("#showOperatorCheck").is(":checked")){
        $("#OperatorSection").show(0);
    } else {
        $("#OperatorSection").hide(0);
    }
    if ($("#showMechanicCheck").is(":checked")){
        $("#MechanicSection").show(0);
    } else {
        $("#MechanicSection").hide(0);
    }
    if ($("#showEnforcerCheck").is(":checked")){
        $("#EnforcerSection").show(0);
    } else {
        $("#EnforcerSection").hide(0);
    }
    if ($("#showProfessionalCheck").is(":checked")){
        $("#ProfessionalSection").show(0);
    } else {
        $("#ProfessionalSection").hide(0);
    }
	if ($("#showAllKitCheck").is(":checked")){
        $("#AllKitSection").show(0);
    } else {
        $("#AllKitSection").hide(0);
    }
}
