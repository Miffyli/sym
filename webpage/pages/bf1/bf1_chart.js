
var bf1WeaponClassTitles = ["","Medic","Assault","Support","Scout", "Miscellaneous", "", "", "Sidearms"];
var firestormWeapons = []//["Gewehr 43","M1A1 Carbine","Sturmgewehr 1-5","StG 44","MP40","De Lisle Commando","STEN","Suomi KP/-31","M1928A1","LS/26","FG-42","Bren Gun","MG42","VGO","M97","12g Automatic","Lee-Enfield No4 Mk1","Kar98k","ZH-29","Boys AT Rifle","P38 Pistol","P08 Pistol","M1911","Liberator","Mk VI Revoler"];
var customizations = new Object();
var addVariantCounter = 0;

function BF1initializeChartPage() {
    bf1PrintWeapons();

    $("#actionMenu").menu({
        position: {my: "left bottom", at: "left top"}
    });

    // Weapon select buttons
    $("#showHideCheckboxes input").checkboxradio(
        {icon:false}
    );
    $("#showHideCheckboxes input").change(function(){
        this.blur();
        bf1ShowHideClasses();
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

function bf1PrintWeapons(){
    var statsHtml = "";

    statsHtml += bf1PrintWeaponClass(2);
    statsHtml += bf1PrintWeaponClass(1);
    statsHtml += bf1PrintWeaponClass(3);
    statsHtml += bf1PrintWeaponClass(4);
    statsHtml += bf1PrintWeaponClass(8);
    statsHtml += bf1PrintWeaponClass(5);

    $("#pageBody").html(statsHtml);
    bf1ShowHideClasses();

    $(".custButton").checkboxradio(
        {icon:false}
    );

    $(".variantButton").button();

    $(".variantButton").click(function(){
        addVariantCounter++;
        var thisRow = $(this).parentsUntil("tbody", "tr");
        var wearponName = $(thisRow).find(".lblWeaponName").text();

        var newWeaponStats = BF1WeaponData.find(function(element){
            return element.WeapAttachmentKey == wearponName;
        });

        var newWeaponRow = bf1PrintWeapon(newWeaponStats);
        var newWeaponRowObj = $(newWeaponRow).insertAfter(thisRow);
        $(newWeaponRowObj).find(".custButton").checkboxradio(
            {icon:false}
        );
        initializeCustomizationsRow(newWeaponRowObj);

        $(newWeaponRowObj).effect("highlight");
    });

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

function bf1PrintWeaponClass(weaponClass){
    var classImgFileName = (weaponClass == 5) ? "KitIconRiflemanLarge.png" : "KitIcon" + bf1WeaponClassTitles[weaponClass] + "Large.png";

    var rtnStr = "";
    rtnStr += "<div id='" + bf1WeaponClassTitles[weaponClass] + "Section'>" +
              "<div class='classHeader'><img src='./pages/bf1/img/" + classImgFileName + "'>" + bf1WeaponClassTitles[weaponClass] + "</div>";
    rtnStr += "<table class='table classTable'><tbody class='sortableTable'>";

    $.each(BF1WeaponData, function( key, value ) {
        if (value.Class == weaponClass){
            rtnStr += bf1PrintWeapon(value);
        }
    });

    rtnStr += "</tbody></table></div>";
    return rtnStr;
}

function bf1PrintWeapon(weaponStats){
    var firestormIcon = (firestormWeapons.includes(weaponStats.WeapShowName) ? "<img src='./pages/bfv/img/firestorm.png' " + firestormTooltip + ">" : "");
    var reloadData = bf1CreateReloadGraphic(weaponStats.ReloadEmpty, weaponStats.ReloadLeft, weaponStats.MagSize, weaponStats.Ammo);
    var standRecoilData = bf1CreateRecoilGraphic(weaponStats.ADSRecoilLeft, weaponStats.ADSRecoilRight, weaponStats.ADSRecoilUp, weaponStats.FirstShotRecoilMul, weaponStats.ADSRecoilDec);
    var spreadTableGraphic = bf1CreateSpreadTableGraphic(weaponStats.ADSStandBaseMin,weaponStats.ADSCrouchBaseMin,weaponStats.ADSProneBaseMin,
                                                      weaponStats.ADSStandMoveMin,weaponStats.ADSCrouchMoveMin,weaponStats.ADSProneMoveMin,
                                                      weaponStats.HIPStandBaseMin,weaponStats.HIPCrouchBaseMin,weaponStats.HIPProneBaseMin,
                                                      weaponStats.HIPStandMoveMin,weaponStats.HIPCrouchMoveMin,weaponStats.HIPProneMoveMin,
                                                      weaponStats.ADSStandBaseSpreadInc, weaponStats.HIPStandBaseSpreadInc);
    var spreadIncDecTableGraphic = bf1CreateSpreadIncDecTableGraphic(weaponStats.ADSStandBaseSpreadInc, weaponStats.HIPStandBaseSpreadInc,
                                                                  weaponStats.ADSStandBaseSpreadDec, weaponStats.HIPStandBaseSpreadDec,
                                                                  weaponStats.FirstShotADSSpreadMul, weaponStats.FirstShotHIPSpreadMul);
    var rtnStr = "<tr class='" + weaponStats.WeapShowName.replace(/ |\//g,"") + " sub_" + getWeaponsSubcat(weaponStats.WeapShowName) +"'>" +
                     "<td class='firstColumn'>" +
                         "<div class='lblWeaponName'>" +
                            "<span class='lblWeaponNameValue'>" + weaponStats.WeapShowName + "</span>" + firestormIcon +
                         "</div>" +
                         "<div>" +
                             "<img class='weaponImg' src='./pages/bf1/img/weapons/" + bf1GetWeaponImageFilename(weaponStats.WeapShowName.replace("/","")) + ".png' onerror='showBlank(this);'>" +
                         "</div>" +
                         "<div style='line-height: 20px;'>" +
                             "<span class='lblMagText'>" +
                                "<span class='lblMag'>" + weaponStats.MagSize + "</span>" +
                                "<span class='lblSuffixText'> x " + bf1FormatAmmoType(weaponStats.Ammo) + "</span>" +
                             "</span>" +
                             "<span class='lblRPM'>" +
                                 "<span class='lblRPMValue' " + rpmTooltip + ">" + weaponStats.BRoF + "</span>" +
                                 "<span class='lblSuffixText'> rpm</span>" +
                             "</span>" +
                         "</div>" +
                     "</td>" +

              "<td class='secondColumn'>" +
                  "<div class='damageChartContainer' " + damageTooltip + ">" + bf1createDamageChart(weaponStats.Damages, weaponStats.Dmg_distances, weaponStats.ShotsPerShell, weaponStats.Class) + "</div>" +
              "</td>" +

              "<td>" +
              //"<div class='underMagSection'>" +
              "<td>" +
                  "<div class='reloadDataAndMagCount'>" + bf1CreateBulletSpeedGraphic(weaponStats.InitialSpeed, weaponStats.Drag) + reloadData  + "</div>" +
                  "<div class='deployTimeBox' " + deployTooltip + "><span class='ui-icon ui-icon-transferthick-e-w'></span><br><span class='lblDeployTime'>" + weaponStats.DeployTime + "<span class='lblSuffixText'> s</span></span></div>" +
              "</td><td>" +
                  "<div class='recoilGraphicBox' " + recoilTooltip + ">" + standRecoilData + "</div>" +
              "</td><td>" +
                  "<div>" +
                      "<div class='spreadLabels' " + adsTooltip + ">" +
                          bf1CreateSpreadLabels(weaponStats.ADSStandMoveMin, weaponStats.ADSStandBaseMin) +
                      "</div>" +
                      "<div class='spreadCircles' " + adsTooltip + ">" + bf1CreateSpreadGraphic(weaponStats.ADSStandBaseMin, weaponStats.ADSStandMoveMin) + "</div>" +
                  "</div>" +
              "</td><td>" +
                  "<div class='hipSpreadContainer' " + hipfireTooltip + ">" + bf1CreateHipSpreadGraphic(weaponStats.HIPStandMoveMin, weaponStats.HorDispersion, weaponStats.VerDispersion) + "</div>" +
            //  "</td><td>" +
                //  "<div class='deployTimeBox' " + deployTooltip + "><span class='ui-icon ui-icon-transferthick-e-w'></span><br><span class='lblDeployTime'>" + weaponStats.DeployTime + "<span class='lblSuffixText'> s</span></span></div>" +
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

function bf1GetWeaponImageFilename(weaponName){
    var weaponFilename = "";
    if (weaponName == "C96"){
        weaponFilename = "Mauser C96";
    } else if (weaponName == "C93"){
        weaponFilename = "Borchard C93";
    } else {
        weaponFilename =  weaponName.replace("Backbored", "").replace("Cavalry", "").replace("Hunter", "").replace("Storm", "").replace("Trench", "").replace("Factory", "").replace("Defensive", "").replace("Sweeper", "").replace("Experimental", "").replace("Optical", "").replace("Slug", "").replace("Hunter", "").replace("Marksman", "").replace("Sniper", "").replace("Telescopic", "").replace("Low Weight", "").replace("Suppressive", "").replace("Infantry", "").replace("Silenced", "").replace("Patrol", "").replace("Carbine", "").trim();
    }
    return weaponFilename;
}

function bf1CreateBulletSpeedGraphic(initialSpeed, drag){
    return "<div class='bulletSpeedContainer'>" +
             "<span class='pr-3 lblSpeed' " + bulletSpeedTooltip + ">" +
               "<img src='./pages/bfv/img/speed.png'>" +
               "<span class='lblSpeedValue'>" + initialSpeed + "</span>" +
               "<span class='lblSuffixText'> m/s</span>" +
               "<br>" +
               "<span class='ui-icon ui-icon-arrowthick-1-w'></span>" +
               "<span class='lblDragCoe' " + bulletSpeedTooltip +">" + drag.toString().substring(1) + "</span>" +
             "</span>" +
           "</div>"
}

function bf1CreateReloadGraphic(reloadEmpty, reloadLeft, magSize, ammoType){
    var reloadData = "<div>" +
                         "<div class='sectionReload' " + reloadTooltip + ">";
    if (reloadEmpty != "N/A"){
        if(reloadEmpty == reloadLeft){
            //reloadData = "<div class='lblReloadLeft'>" + reloadLeft +"<span class='lblSuffixText'> s</span></div>";

            reloadData += "<div class='lblReloadLeft'>" +
                              "<img src='./pages/bfv/img/reload.png' class='imgReload'>" +
                              "<span>" + reloadLeft.toFixed(2) + "</span>" +
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

function bf1FormatAmmoType(ammo){
    var newAmmo = ammo.replace("fillertext", " ")
    return newAmmo;
}

function bf1CreateRecoilGraphic(recoilLeft, recoilRight, recoilInitialUp, recoilFirstShot, recoilDec){

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

function bf1CreateSpreadLabels(ADSStandMoveMin, ADSStandBaseMin){
    var rtnStr = "";
    if (ADSStandMoveMin > 0){
        rtnStr = "<div class='speadMoveLabel'>" + roundToThree(ADSStandMoveMin) + "°</div>" +
                 "<div class='speadBaseLabel'>" + roundToThree(ADSStandBaseMin) + "°</div>";
    }
    return rtnStr;
}

function bf1CreateSpreadGraphic(ADSBase, ADSMove){
    var spreadGraphic = "";

    var adsBaseCircle = "";
    if(ADSBase >= 0.05){
        adsBaseCircle = "<circle cx='0' cy='215' r='" + (ADSBase * 200).toString() + "' class='spreadBaseCicle'></circle>";
    } else {
        adsBaseCircle = "<circle cx='0' cy='215' r='4' stroke-width='2' style='fill: none; stroke: #C8C63A; fill: #C8C63A;'></circle>";
    }

    spreadGraphic = "<svg viewBox='0 0 215 215' style='width: 80px;'>" +
                    "<circle cx='0' cy='215' class='spreadMoveCicleBG' r='214'></circle>" +
                    "<circle cx='0' cy='215' r='" + (ADSMove * 200).toString() + "' class='spreadMoveCicle'></circle>" +
                    adsBaseCircle +
                    "</svg>";
    return spreadGraphic;
}

function bf1CreateHipSpreadGraphic(HIPSpread, HorDispersion, VerDispersion){
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
        if (HorDispersion == VerDispersion){
            spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;'>" +
                            "<circle cx='50' cy='50' r='" + (HorDispersion * 10).toString() + "' class='hipSpreadLine'></circle>" +
                            "<text x='10' y='23' class='hipSpreadValue'>" + roundToThree(HorDispersion) + "°</text>" +
                            "</svg>";
        } else {
            spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;'>" +
                            "<ellipse cx='50' cy='50' rx='" + (HorDispersion * 10).toString() + "' ry='" + (VerDispersion * 10).toString() + "' class='hipSpreadLine'/>" +
                            "<text x='10' y='23' class='hipSpreadValue'>" + roundToThree(HorDispersion) + "° / " + roundToThree(VerDispersion) + "°</text>" +
                            "</svg>";
        }
    }
    return spreadGraphic;
}

function bf1CreateSpreadTableGraphic(ADSStand, ADSCrouch, ADSProne, ADSStandMove, ADSCrouchMove, ADSProneMove,
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

function bf1CreateSpreadIncDecTableGraphic(ADSInc, HIPInc, ADSDec, HIPDec, ADSFirst, HIPFirst){
    var tableGraphic = "<table class='spreadIncDecTable'>" +
                           "<tr>" + "<td></td><td>ADS</td><td>HIP</td>" + "</tr>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/increaseFirst.png'></td><td>" + roundToThree(ADSInc * ADSFirst) + "°</td><td>" + roundToThree(HIPInc * HIPFirst) + "°</td>" + "</tr>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/increase.png'></td><td>" + roundToThree(ADSInc) + "°</td><td>" + roundToThree(HIPInc) + "°</td>" + "</tr>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/decrease.png'></td><td>" + roundToThree(ADSDec) + "°</td><td>" + roundToThree(HIPDec) + "°</td>" + "</tr>" +
                       "</table>"
return tableGraphic;
}

function bf1createDamageChart(damageArr, distanceArr, numOfPellets, weaponClass){
    var damageChart;
    if (damageArr[0] > 50 ){
        //if(distanceArr.indexOf(200) == -1){
        if(distanceArr[distanceArr.length -1] > 150 || weaponClass == 4){
            damageChart = bf1CreateDamageChart100Max200Dist(damageArr, distanceArr);
        } else {
            damageChart = bf1CreateDamageChart100Max(damageArr, distanceArr);
        }
    } else {
        damageChart = bf1CreateDamageChart50Max(damageArr, distanceArr, numOfPellets)
    }
    return damageChart;
}

function bf1CreateDamageChart50Max(damageArr, distanceArr, numOfPellets){
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
    if(damageArr[0] > 40){
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (138 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (116 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    }

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

               "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
               pelletsLabel +
           "</svg>"
}

function bf1CreateDamageChart100Max(damageArr, distanceArr){
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

    if (minDamage > 115){
        var oneHitKillText = "<text x='85' y='60' class='chartMinMaxLabel'>1 Hit Kill at all ranges</text>";
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
           "</svg>"
}

function bf1CreateDamageChart100Max200Dist(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (120 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 120 - damageArr[i];
        var distanceCoord = 2 * distanceArr[i]/2;
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "300," + (120 - damageArr[damageArr.length - 1]).toString();

    var maxDamage = roundToDecimal(damageArr[0], "1");
    var minDamage = roundToDecimal(damageArr[damageArr.length - 1], "1");

    var maxDamageText = "";
    maxDamageText = "<text x='3' y='" + (113 - (maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (114 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='185' y='" + (114 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
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

               "<text x='51' y='119' class='chartLabel200Dist'>50m</text>" +
               "<text x='101' y='119' class='chartLabel200Dist'>100m</text>" +
               "<text x='151' y='119' class='chartLabel200Dist'>150m</text>" +
               "<text x='201' y='119' class='chartLabel200Dist'>200m</text>" +
               "<text x='251' y='119' class='chartLabel200Dist'>250m</text>" +

               "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
           "</svg>";
}


function bf1ShowHideClasses(){
    if ($("#showSidearmsCheck").is(":checked")){
        $("#SidearmsSection").show(0);
    } else {
        $("#SidearmsSection").hide(0);
    }
    if ($("#showAssaultCheck").is(":checked")){
        $("#AssaultSection").show(0);
    } else {
        $("#AssaultSection").hide(0);
    }
    if ($("#showMedicCheck").is(":checked")){
        $("#MedicSection").show(0);
    } else {
        $("#MedicSection").hide(0);
    }
    if ($("#showSupportCheck").is(":checked")){
        $("#SupportSection").show(0);
    } else {
        $("#SupportSection").hide(0);
    }
    if ($("#showReconCheck").is(":checked")){
        $("#ScoutSection").show(0);
    } else {
        $("#ScoutSection").hide(0);
    }
    if ($("#showOthersCheck").is(":checked")){
        $("#MiscellaneousSection").show(0);
    } else {
        $("#MiscellaneousSection").hide(0);
    }

}
