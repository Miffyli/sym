var gravityTooltip = "Gravity"
var bf3WeaponClassTitles = ["","Assault","Engineer","Support","Recon","Sidearms","PDWs","Shotguns", "Gadgets"];
var firestormWeapons = []//["Gewehr 43","M1A1 Carbine","Sturmgewehr 1-5","StG 44","MP40","De Lisle Commando","STEN","Suomi KP/-31","M1928A1","LS/26","FG-42","Bren Gun","MG42","VGO","M97","12g Automatic","Lee-Enfield No4 Mk1","Kar98k","ZH-29","Boys AT Rifle","P38 Pistol","P08 Pistol","M1911","Liberator","Mk VI Revoler"];
var customizations = new Object();
var addVariantCounter = 0;

function BF3initializeChartPage() {
    bf3PrintWeapons();

    $("#actionMenu").menu({
        position: {my: "left bottom", at: "left top"}
    });

    // Weapon select buttons
    $("#showHideCheckboxes input").checkboxradio(
        {icon:false}
    );
    $("#showHideCheckboxes input").change(function(){
        this.blur();
        bf3ShowHideClasses();
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

function bf3PrintWeapons(){
    var statsHtml = "";

    statsHtml += bf3PrintWeaponClass(1);
    statsHtml += bf3PrintWeaponClass(2);
    statsHtml += bf3PrintWeaponClass(3);
    statsHtml += bf3PrintWeaponClass(4);
    statsHtml += bf3PrintWeaponClass(6);
    statsHtml += bf3PrintWeaponClass(7);
    statsHtml += bf3PrintWeaponClass(5);
	statsHtml += bf3PrintWeaponClass(8);

    $("#pageBody").html(statsHtml);
    bf3ShowHideClasses();
/*
    $(".custButton").checkboxradio(
        {icon:false}
    );

    $(".variantButton").button();

    $(".variantButton").click(function(){
        addVariantCounter++;
        var thisRow = $(this).parentsUntil("tbody", "tr");
        var wearponName = $(thisRow).find(".lblWeaponName").text();

        var newWeaponStats = bf3WeaponData.find(function(element){
            return element.WeapAttachmentKey == wearponName;
        });

        var newWeaponRow = bf3PrintWeapon(newWeaponStats);
        var newWeaponRowObj = $(newWeaponRow).insertAfter(thisRow);
        $(newWeaponRowObj).find(".custButton").checkboxradio(
            {icon:false}
        );
        initializeCustomizationsRow(newWeaponRowObj);

        $(newWeaponRowObj).effect("highlight");
    });
*/
    $(document).tooltip({track: true});

    initializeCustomizations();
    initializeSorts();

    $(".sortableTable").sortable({
       opacity: 0.7,
       placeholder: "ui-state-highlight",
       handle: ".sortDragIcon"
    });

    showHideSubCats();
    bfvChartSortLetters("lblWeaponNameValue", compareNames)
}

function bf3PrintWeaponClass(weaponClass){
    var classImgFileName = (weaponClass == 5) ? "Sidearms.png" : bf3WeaponClassTitles[weaponClass] + ".png";

    var rtnStr = "";
    rtnStr += "<div id='" + bf3WeaponClassTitles[weaponClass] + "Section'>" +
              "<div class='classHeader'><img src='./pages/bf3/img/" + classImgFileName + "'>" + bf3WeaponClassTitles[weaponClass] + "</div>";
    rtnStr += "<table class='table classTable'><tbody class='sortableTable'>";

    $.each(BF3WeaponData, function( key, value ) {
        if (value.Class == weaponClass && value.Attachments == "none-none"){
            rtnStr += bf3PrintWeapon(value);
        }
    });

    rtnStr += "</tbody></table></div>";
    return rtnStr;
}

function bf3PrintWeapon(weaponStats){
    var firestormIcon = (firestormWeapons.includes(weaponStats.WeapShowName) ? "<img src='./pages/bfv/img/firestorm.png' " + firestormTooltip + ">" : "");
    var reloadData = bf3CreateReloadGraphic(weaponStats.ReloadEmpty, weaponStats.ReloadLeft, weaponStats.MagSize, weaponStats.Ammo);
    var standRecoilData = bf3CreateRecoilGraphic(weaponStats.ADSRecoilLeft, weaponStats.ADSRecoilRight, weaponStats.ADSRecoilUp, weaponStats.FirstShotRecoilMul, weaponStats.ADSRecoilDec);
    var spreadTableGraphic = bf3CreateSpreadTableGraphic(weaponStats.ADSStandBaseMin,weaponStats.ADSCrouchBaseMin,weaponStats.ADSProneBaseMin,
                                                      weaponStats.ADSStandMoveMin,weaponStats.ADSCrouchMoveMin,weaponStats.ADSProneMoveMin,
                                                      weaponStats.HIPStandBaseMin,weaponStats.HIPCrouchBaseMin,weaponStats.HIPProneBaseMin,
                                                      weaponStats.HIPStandMoveMin,weaponStats.HIPCrouchMoveMin,weaponStats.HIPProneMoveMin,
                                                      weaponStats.ADSStandBaseSpreadInc, weaponStats.HIPStandBaseSpreadInc);
    var spreadIncDecTableGraphic = bf3CreateSpreadIncDecTableGraphic(weaponStats.SpreadInc, weaponStats.SpreadDec);
    var rtnStr = "<tr class='" + weaponStats.WeapShowName.replace(/ |\//g,"") + " sub_" + getWeaponsSubcat(weaponStats.WeapShowName) +"'>" +
                     "<td class='firstColumn'>" +
                         "<div class='lblWeaponName'>" +
                            "<span class='lblWeaponNameValue'>" + weaponStats.WeapShowName + "</span>" + firestormIcon +
                         "</div>" +
                         "<div class='weaponImgContainer'>" +
                             "<img class='weaponImg' src='./pages/bf3/img/weapons/" + bf3GetWeaponImageFilename(weaponStats.WeapShowName.replace("/","")) + ".png' onerror='showBlank(this);'>" +
                         "</div>" +
                         "<div style='line-height: 20px;'>" +
                             "<span class='lblMagText'>" +
                                "<span class='lblMag'>" + weaponStats.MagSize + "</span>" +
                                "<span class='lblSuffixText'> x " + bf3FormatAmmoType(weaponStats.Ammo) + "</span>" +
                             "</span>" +
                             bf3CreateRPMGrpahic(weaponStats.RoF) +
                         "</div>" +
                     "</td>" +

              "<td class='secondColumn'>" +
                  "<div class='damageChartContainer' " + damageTooltip + ">" + bf3createDamageChart([[weaponStats['SDmg'], weaponStats['SDmg']], [weaponStats['DOStart'], weaponStats['DOEnd']], weaponStats.Pellets, weaponStats.Ammo) + "</div>" +
              "</td>" +

              "<td>" +
              //"<div class='underMagSection'>" +
              "<td>" +
                  "<div class='reloadDataAndMagCount'>" + bf3CreateBulletSpeedGraphic(weaponStats.InitialSpeed, weaponStats.Drag) + reloadData  + "</div>" +
                  "<div class='deployTimeBox' " + gravityTooltip + "><span class='ui-icon  ui-icon-arrowthick-1-s'></span><span class='lblDeployTime'>" + weaponStats.Gravity + "<span class='lblSuffixText'> m/s²</span></span></div>" +
              "</td><td>" +
                  "<div class='recoilGraphicBox' " + recoilTooltip + ">" + standRecoilData + "</div>" +
              "</td><td>" +
                  "<div>" +
                      "<div class='spreadLabels' " + adsTooltip + ">" +
                          bf3CreateSpreadLabels(weaponStats.ADSStandMoveMin, weaponStats.ADSStandBaseMin) +
                      "</div>" +
                      "<div class='spreadCircles' " + adsTooltip + ">" + bf3CreateSpreadGraphic(weaponStats.ADSStandBaseMin, weaponStats.ADSStandMoveMin) + "</div>" +
                  "</div>" +
              "</td><td>" +
                  "<div class='hipSpreadContainer' " + hipfireTooltip + ">" + bf3CreateHipSpreadGraphic(weaponStats.HIPStandMoveMin, weaponStats.HorDispersion) + "</div>" +
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

function bf3GetWeaponImageFilename(weaponName){
    var weaponFilename = "";

    weaponFilename =  weaponName.replace("Slug", "").replace("Buckshot", "").replace("Flechette", "").replace("Frag", "").replace("SMOKE", "").replace("LVG", "").replace("BUCK", "").replace("BA", "").replace("HE", "").replace("SCAN", "");

    return weaponFilename.trim();
}

function bf3CreateRPMGrpahic(RoF){
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

function bf3CreateBulletSpeedGraphic(initialSpeed, drag){
    return "<div class='bulletSpeedContainer'>" +
             "<span class='pr-3 lblSpeed' " + bulletSpeedTooltip + ">" +
               "<img src='./pages/bfv/img/speed.png'>" +
               "<span class='lblSpeedValue'>" + initialSpeed + "</span>" +
               "<span class='lblSuffixText'> m/s</span>" +
             "</span>" +
           "</div>"
}

function bf3CreateReloadGraphic(reloadEmpty, reloadLeft, magSize, ammoType){
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

function bf3FormatAmmoType(ammo){
    var newAmmo = ammo.replace("Slug", "").replace("_Semi", "").replace("_SMG", "");
    
    return newAmmo;
}

function bf3CreateRecoilGraphic(recoilLeft, recoilRight, recoilInitialUp, recoilFirstShot, recoilDec){

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
                                "<text x='" + (recoilHorLenth1 - 4).toString() + "' y='95' text-anchor='end' class='recoilValue recoilHorValue'>" + roundToThree(recoilLeft) + "°</text>" +
                                "<text x='" + (recoilHorLenth2 + 4).toString() + "' y='95' class='recoilValue'>" + roundToThree(Math.abs(recoilRight)) + "°</text>" +
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

function bf3CreateSpreadLabels(ADSStandMoveMin, ADSStandBaseMin){
    var rtnStr = "";
    if (ADSStandMoveMin > 0){
        rtnStr = "<div class='speadMoveLabel'>" + roundToThree(ADSStandMoveMin) + "°</div>" +
                 "<div class='speadBaseLabel'>" + roundToThree(ADSStandBaseMin) + "°</div>";
    }
    return rtnStr;
}

function bf3CreateSpreadGraphic(ADSBase, ADSMove){
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

function bf3CreateHipSpreadGraphic(HIPSpread, HorDispersion){
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

function bf3CreateSpreadTableGraphic(ADSStand, ADSCrouch, ADSProne, ADSStandMove, ADSCrouchMove, ADSProneMove,
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

function bf3CreateSpreadIncDecTableGraphic(spreadIncrease, spreadDecrease){
    var tableGraphic = "<table class='spreadIncDecTable'>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/increase.png'></td><td>" + roundToThree(spreadIncrease) + "°</td>" + "</tr>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/decrease.png'></td><td>" + roundToThree(spreadDecrease) + "°</td>" + "</tr>" +
                       "</table>"
return tableGraphic;
}

function bf3createDamageChart(damageArr, distanceArr, numOfPellets, ammoType){
    var damageChart;
    if (damageArr[0] > 50 || damageArr[0] == 0){ // damage == 0 is for LVG becuase it has splash damage > 50.
        damageChart = bf3CreateDamageChart100Max(damageArr, distanceArr, ammoType);
    } else {
        damageChart = bf3CreateDamageChart50Max(damageArr, distanceArr, numOfPellets, ammoType)
    }
    return damageChart;
}

var fragLabels = "<text x='51' class='chartSplashLabel' y='9'>1m</text>" +
                 "<text x='101' class='chartSplashLabel' y='9'>2m</text>" +
                 "<text x='151' class='chartSplashLabel' y='9'>3m</text>" +
                 "<text x='201' class='chartSplashLabel' y='9'>4m</text>" +
                 "<text x='251' class='chartSplashLabel' y='9'>5m</text>";

function bf3CreateDamageChart50Max(damageArr, distanceArr, numOfPellets, ammoType){
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
    if(ammoType == "12g Frag"){
        fragSplash = "<polyline class='chartSplashDamageLine' style='stroke: orange;' points='0,70 100,70 125,120'></polyline>" +
                     fragLabels +
                     "<text y='66' class='chartMinMaxSplashLabel' x='103'>25 (Splash Damage)</text>";
        if (maxDamage == 20){
            maxDamageText = "<text x='" + (distanceArr[1] - 0) + "' y='" + (124 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
        }
    }
	
	var scanRadius = "";
    if(ammoType == "Scan Bolt"){
        scanRadius = "<polyline class='chartScanRadiusLine' style='stroke: #C5CED2;' points='20,0 20,150'></polyline>" +
                     "<text y='46' class='chartScanRadiusLabel' x='27'>10m Scan Radius</text>";
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
			   scanRadius +
			   "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
               pelletsLabel +
           "</svg>"
}

function bf3CreateDamageChart100Max(damageArr, distanceArr, ammoType){
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


function bf3ShowHideClasses(){
    if ($("#showAssaultCheck").is(":checked")){
        $("#AssaultSection").show(0);
    } else {
        $("#AssaultSection").hide(0);
    }
    if ($("#showEngineerCheck").is(":checked")){
        $("#EngineerSection").show(0);
    } else {
        $("#EngineerSection").hide(0);
    }
    if ($("#showSupportCheck").is(":checked")){
        $("#SupportSection").show(0);
    } else {
        $("#SupportSection").hide(0);
    }
    if ($("#showReconCheck").is(":checked")){
        $("#ReconSection").show(0);
    } else {
        $("#ReconSection").hide(0);
    }
	if ($("#showPDWsCheck").is(":checked")){
        $("#PDWsSection").show(0);
    } else {
        $("#PDWsSection").hide(0);
    }
	if ($("#showShotgunsCheck").is(":checked")){
        $("#ShotgunsSection").show(0);
    } else {
        $("#ShotgunsSection").hide(0);
    }
	if ($("#showSidearmsCheck").is(":checked")){
        $("#SidearmsSection").show(0);
    } else {
        $("#SidearmsSection").hide(0);
    }
    if ($("#showGadgetsCheck").is(":checked")){
        $("#GadgetsSection").show(0);
    } else {
        $("#GadgetsSection").hide(0);
    }

}
