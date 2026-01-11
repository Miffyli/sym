var gravityTooltip = "Gravity"
let bf6WeaponClasses = {"assaultrifle":"ASSAULT RIFLE", 
                        "carbine":"CARBINE", 
                        "smg":"SMG", 
                        "mg":"LMG", 
                        "dmr":"DMR", 
                        "boltaction":"SNIPER RIFLE",
                        "secondary":"SECONDARY",
                        "shotgun":"SHOTGUN (WORK IN PROGRESS)"};
var customizations = new Object();
var addVariantCounter = 0;

function BF6initializeChartPage() {
    bf6PrintWeapons();

    $("#actionMenu").menu({
        position: {my: "left bottom", at: "left top"}
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

function bf6PrintWeapons(){
    var statsHtml = "";

   // statsHtml += "<div style='text-align: center;'><img class='imgKey' src='./pages/bf6/img/key.avif'></div>";

    statsHtml += bf6PrintWeaponClass("assaultrifle");
    statsHtml += bf6PrintWeaponClass("carbine");
    statsHtml += bf6PrintWeaponClass("smg");
    statsHtml += bf6PrintWeaponClass("mg");
    statsHtml += bf6PrintWeaponClass("dmr");
    statsHtml += bf6PrintWeaponClass("boltaction");
    statsHtml += bf6PrintWeaponClass("shotgun");
    statsHtml += bf6PrintWeaponClass("secondary");

    statsHtml += "<div class='bf6Notes'>* Currently displaying sweet spot damage only (upper chest and above).</div>";

    $("#pageBody").html(statsHtml);

    $('#shotgunSection table tr').each(function() {
        $(this).find('td:nth-child(4), td:nth-child(6), td:nth-child(7), td:nth-child(8)')
           .html('<div style="width: 60px;"">---</div>');
    });
    $('#shotgunSection table tr td:nth-child(7)').removeAttr('style');
    $('#shotgunSection .lblRPM').html('---');


    $(document).tooltip({track: true});

    initializeSorts();

    $(".sortableTable").sortable({
       opacity: 0.7,
       placeholder: "ui-state-highlight",
       handle: ".sortDragIcon"
    });
}

function bf6PrintWeaponClass(weaponClass){
    var rtnStr = "";
    rtnStr += "<div id='" + weaponClass + "Section'>" +
              "<div class='classHeader'>" + bf6WeaponClasses[weaponClass] + (weaponClass == "boltaction" ? " *" : "") + "</div>" +
              "<table class='table classTable'><tbody class='sortableTable'>";

    $.each(BF6WeaponData, function( key, value ) {
        if (value.class == weaponClass){
            rtnStr += bf6PrintWeapon(value);
        }
    });

    rtnStr += "</tbody></table></div>";
    return rtnStr;
}

function bf6PrintWeapon(weaponStats){
    let reloadData = bf6CreateReloadGraphic(weaponStats.reload.ReloadEmpty, weaponStats.reload.ReloadLeft);
    let standRecoilData = bf6CreateRecoilGraphic(weaponStats.spread.ADSStandRecoilDirection, 
                                                 weaponStats.spread.ADSStandRecoilDirectionVariation, 
                                                 weaponStats.spread.ADSStandRecoilAmount);
    let spreadTableGraphic = bf6CreateSpreadTableGraphic(weaponStats.spread.ADSStandBaseMin,weaponStats.spread.ADSCrouchBaseMin,weaponStats.spread.ADSProneBaseMin,
                                                      weaponStats.spread.ADSStandMoveMin,weaponStats.spread.ADSCrouchMoveMin,weaponStats.spread.ADSProneMoveMin,
                                                      weaponStats.spread.HIPStandBaseMin,weaponStats.spread.HIPCrouchBaseMin,weaponStats.spread.HIPProneBaseMin,
                                                      weaponStats.spread.HIPStandMoveMin,weaponStats.spread.HIPCrouchMoveMin,weaponStats.spread.HIPProneMoveMin);
    let weaponImage = bf6GetWeaponImage(weaponStats.codename);
    let rtnStr = "<tr class='" + weaponStats.displayname.replace(/ |\//g,"") + "'>" +
                     "<td class='firstColumn'>" +
                         "<div class='lblWeaponName'>" +
                            "<span class='lblWeaponNameValue'>" + weaponStats.displayname + "</span>" +
                            bf6CreateRPMGrpahic(weaponStats.rof.RoF) +
                         "</div>" +
                         "<div class='weaponImgContainer'>" +
                              weaponImage +
                         "</div>" +
                         "<div style='line-height: 20px;'>" +
                             "<span class='lblMagText'>" +
                                "<span class='lblMag'>" + weaponStats.mags.MagSize + 
                                    "<span class='lblTimes'>x</span><img class='roundImg' src='./pages/bf6/img/round.png'>" + 
                                "</span>" +
                                //"<span class='lblSuffixText'> x " + bf2042FormatAmmoType(weaponStats.Ammo) + "</span>" +
                             "</span>" +
                         "</div>" +
                     "</td>" +

              "<td class='secondColumn'>" +
                  "<div class='damageChartContainer' " + damageTooltip + ">" + bf6createDamageChart(weaponStats.damage.dmgs, weaponStats.damage.dists, weaponStats.pellets) + "</div>" +
              "</td>" +

              "<td>" +
              "<td>" +
                  "<div class='reloadDataAndMagCount'>" + bf6CreateBulletSpeedGraphic(weaponStats.velocity, weaponStats.Drag) + reloadData  + "</div>" +
              "</td><td>" +
                  "<div class='recoilGraphicBox' " + recoilTooltip + ">" + standRecoilData + "</div>" +
              "</td><td>" +
                  "<div>" +
                      "<div class='spreadLabels' " + adsTooltip + ">" +
                          bf6CreateSpreadLabels(weaponStats.spread.ADSStandMoveMin, weaponStats.spread.ADSStandBaseMin) +
                      "</div>" +
                      "<div class='spreadCircles' " + adsTooltip + ">" + bf6CreateSpreadGraphic(weaponStats.spread.ADSStandBaseMin, weaponStats.spread.ADSStandMoveMin) + "</div>" +
                  "</div>" +
                  "<div class='spreadInc'><img src='./img/increase.png'>" + weaponStats.spread.ADSStandBaseSpreadInc + "°</div>" +
              "</td><td style='vertical-align: top;'>" +
                  "<div class='hipSpreadContainer' " + hipfireTooltip + ">" + bf6CreateHipSpreadGraphic(weaponStats.spread.HIPStandMoveMin, weaponStats.spread.HorDispersion) + "</div>" +
                  "<div class='spreadInc'><img src='./img/increase.png'>" + weaponStats.spread.HIPStandBaseSpreadInc + "°</div>" +
              "</td><td>" +
                  spreadTableGraphic +
              "</td><td>" +
                  "<div>" +
                      "<img class='sortDragIcon' src='./pages/bfv/img/sortDrag.png' " + dragTooltip + ">" +
                  "</div>" +
               "</td>" +
              //"<div>DeployTime   : " + weaponStats.DeployTime + "</div>" +
              "</tr>";
        return rtnStr;
}

function bf6GetWeaponImage(weaponName){
   // var weaponFilename = "";

   // weaponFilename =  weaponName.replace("Slug", "").replace("Buckshot", "").replace("Flechette", "").replace("Frag", "");

   // return weaponFilename.trim();

    let imgTag = "" + 
    "<picture class='weaponImg'>" +
        "<source srcset='./pages/bf6/img/" + weaponName + ".avif' type='image/avif'/>" +
        "<source srcset='./pages/bf6/img/" + weaponName + ".webp' type='image/webp'/>" +
        "<img src='./pages/bf6/img/" + weaponName + ".png' onerror='showBlank(this);' />" +
    "</picture>";

    return imgTag;

//"<img class='weaponImg' src='./pages/bf6/img/" + bf6GetWeaponImageFilename(weaponStats.codename) + ".avif' onerror='showBlank(this);'>" +

}

function bf6CreateRPMGrpahic(RoF){
    return "<span class='lblRPM'>" +
               "<span class='lblRPMValue' " + rpmTooltip + ">" + RoF.toFixed(0) + "</span>" +
               "<span class='lblSuffixText'> rpm</span>" +
           "</span>";  
}

function bf6CreateBulletSpeedGraphic(initialSpeed, drag){
    return "<div class='bulletSpeedContainer'>" +
             "<span class='pr-3 lblSpeed' title='Bullet Speed'>" +
               "<img src='./pages/bfv/img/speed.png'>" +
               "<span class='lblSpeedValue'>" + initialSpeed + "</span>" +
               "<span class='lblSuffixText'> m/s</span>" +
             "</span>" +
           "</div>"
}

function bf6CreateReloadGraphic(reloadEmpty, reloadLeft){
    reloadEmpty = (reloadEmpty == "N/A") ? "" : reloadEmpty.toFixed(2);
    reloadLeft = (reloadLeft == "N/A") ? "" : reloadLeft.toFixed(2);

    let reloadData = "<div>" +
                         "<div class='sectionReload' " + reloadTooltip + ">";
    
    if(reloadEmpty == ""){
        reloadData += "<div class='lblReloadLeft'>" +
                            "<img src='./pages/bfv/img/reload.png' class='imgReload'>" +
                            "<span>" + reloadLeft + "</span>" +
                            "<span class='lblSuffixText'>s</span>" +
                        "</div>" +
                    "</div>";
    } else {
        reloadData += "<div class='lblReloadLeft'>" +
                            "<img src='./pages/bfv/img/reload.png' class='imgReload'>" +
                            "<span>" + reloadLeft + "</span>" +
                            "<span class='lblSuffixText'>s</span>" +
                        "</div>" +
                        "<div class='lblReloadEmpty'>" + reloadEmpty +
                            "<span class='lblSuffixText'>s</span>" +
                        "</div>" +
                    "</div>";
    }
    
    return reloadData +  "</div>";
}

function bf2042FormatAmmoType(ammo){
    var newAmmo = ammo.replace("fillertext", " ")
    
    return newAmmo;
}

function bf6CreateRecoilGraphic(direction, variation, amount){
    let useBigScale = (amount >= 1.0);

    const CX = useBigScale ? 150 : 50;
    const CY = useBigScale ? 150 : 50;
    const R = 50 * amount;
    const START_ANGLE_DEG = 360 + direction - (variation/2);
    const END_ANGLE_DEG = START_ANGLE_DEG + variation; 
    const ANGLE_DIFF = variation; // 24 degrees
    
    // Function to convert degrees to point coordinates (X, Y)
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    const start = polarToCartesian(CX, CY, R, START_ANGLE_DEG);
    const end = polarToCartesian(CX, CY, R, END_ANGLE_DEG);

    // Large Arc Flag: 0 for small angle (<180), 1 for large angle
    const largeArcFlag = ANGLE_DIFF > 180 ? 1 : 0;

    // Define the path string for the slice (Sector)
    const pathData = [
        "M", CX, CY, // Move to the center
        "L", start.x, start.y, // Draw line to the start point
        "A", R, R, 0, largeArcFlag, 1, end.x, end.y, // Draw the arc
        "Z" // Close the path (draw line back to the center)
    ].join(" ");

    let svgRecoil = "";
    if (useBigScale) {  
        let gridlines = "";
        for (let i = 1; i <= 4; i++) {
            gridlines += "<line x1='110' y1='" + (150 - i*10) + "' x2='190' y2='" + (150 - i*10) + "' stroke='#444' stroke-width='2' />";
        }
        for (let i = 1; i <= 9; i++) {
            gridlines += "<line x1='" + (100 +i*10) + "' y1='150' x2='" + (100 +i*10) + "' y2='110' stroke='#444' stroke-width='2' />";
        }
        svgRecoil = "<svg width='100' viewbox='0 0 300 180' xmlns='http://www.w3.org/2000/svg'>" +  
                        gridlines +
                        "<path d='" + pathData + "' fill='#A9D852' stroke='green' stroke-width='3' />" +
                        "<line x1='110' y1='150' x2='190' y2='150' stroke='#888' stroke-width='3' />" +
                        "<line x1='150' y1='150' x2='150' y2='10' stroke='#888' stroke-width='3' />" +
                        "<path d='M 130,150 A 20,20 0 0 1 170,150' fill='none' stroke='#888' stroke-width='3' />" +
                        "<line x1='150' y1='150' x2='150' y2='10' stroke-width='3' transform='rotate(" + direction +  ", 150, 150)' class='symOrange'/>" +
                    "</svg>";
    } else {
        let gridlines = "";
        for (let i = 1; i <= 4; i++) {
            gridlines += "<line x1='10' y1='" + (50 - i*10) + "' x2='90' y2='" + (50 - i*10) + "' stroke='#333' stroke-width='1' />";
        }
        for (let i = 1; i <= 9; i++) {
            gridlines += "<line x1='" + (i*10) + "' y1='50' x2='" + (i*10) + "' y2='10' stroke='#333' stroke-width='1' />";
        }
        svgRecoil = "<svg width='100' viewbox='0 0 100 60' xmlns='http://www.w3.org/2000/svg'>" +  
                        gridlines +
                        "<path d='" + pathData + "' fill='#A9D852' stroke='green' stroke-width='1' />" +
                        "<line x1='50' y1='50' x2='50' y2='10' stroke='#888' stroke-width='1' />" +
                        "<line x1='10' y1='50' x2='90' y2='50' stroke='#888' stroke-width='1' />" +
                        "<path d='M 30,50 A 20,20 0 0 1 70,50' fill='none' stroke='#888' stroke-width='1' />" +
                        "<line x1='50' y1='50' x2='50' y2='10' stroke-width='1' transform='rotate(" + direction +  ", 50, 50)' class='symOrange'/>" +
                    "</svg>";
    }


    return "<div class='bf6RecoilValues'>" + 
                "<div class='symGreen'>&#8593; " + amount.toFixed(2) + "°</div>" +
            "</div>" +
            "<div class='bf6RecoilValues'>" + 
            "<div class='symOrange'><span class='math-sym'>&ang;</span> " + direction + "°</div>" +
                svgRecoil + 
                "<div class='symGreen'>&#8596; " + variation.toFixed(1) + "°</div>" + 
            "</div>";
        
}

function bf6CreateSpreadLabels(ADSStandMoveMin, ADSStandBaseMin){
    var rtnStr = "";
    if (ADSStandMoveMin > 0){
        rtnStr = "<div class='speadMoveLabel'>" + roundToThree(ADSStandMoveMin) + "°</div>" +
                 "<div class='speadBaseLabel'>" + roundToThree(ADSStandBaseMin) + "°</div>";
    }
    return rtnStr;
}

function bf6CreateSpreadGraphic(ADSBase, ADSMove){
    const SPREAD_RADIUS_MUL = 400;
    var spreadGraphic = "<svg viewBox='0 0 215 215' style='width: 80px;'>" +
                    "<circle cx='0' cy='215' class='spreadMoveCicleBG' r='214'></circle>" +
                    "<circle cx='0' cy='215' r='" + (ADSMove * SPREAD_RADIUS_MUL).toString() + "' class='spreadMoveCicle'></circle>" +
                    "<circle cx='0' cy='215' r='" + (ADSBase * SPREAD_RADIUS_MUL).toString() + "' class='spreadBaseCicle'></circle>"; +
                    "</svg>";
    return spreadGraphic;
}

function bf6CreateHipSpreadGraphic(HIPSpread, HorDispersion){
    var lineOffset = HIPSpread * 2;
    var spreadGraphic = "";

   // if (HorDispersion == 0 || HorDispersion == .5) { //Villa Perosa hordispersion = .5
    if (true) {
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;'>" +
                        "<line x1='50' y1='" + (lineOffset + 52) + "' x2='50' y2='" + (lineOffset + 65) + "' class='hipSpreadLine'></line>" +
                        "<line x1='50' y1='" + (48 - lineOffset) + "' x2='50' y2='" + (35 - lineOffset) + "' class='hipSpreadLine'></line>" +

                        "<line y1='50' x1='" + (lineOffset + 52) + "' y2='50' x2='" + (lineOffset + 65) + "' class='hipSpreadLine'></line>" +
                        "<line y1='50' x1='" + (48 - lineOffset) + "' y2='50' x2='" + (35 - lineOffset) + "' class='hipSpreadLine'></line>" +

                        "<text x='10' y='91' class='hipSpreadValue'>" + roundToThree(HIPSpread) + "°</text>" +
                        "</svg>";
    } /* else {
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;'>" +
                        "<circle cx='50' cy='50' r='" + (HorDispersion * 10).toString() + "' class='hipSpreadLine'></circle>" +
                        "<text x='7' y='20' class='hipSpreadValue'>" + roundToThree(HorDispersion) + "°</text>" +
                        "</svg>";
    }*/
    return spreadGraphic;
}

function bf6CreateSpreadTableGraphic(ADSStand, ADSCrouch, ADSProne, ADSStandMove, ADSCrouchMove, ADSProneMove,
                                  HIPStand, HIPCrouch, HIPProne, HIPStandMove, HIPCrouchMove, HIPProneMove){
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

function bf2042CreateSpreadIncDecTableGraphic(spreadIncrease, spreadDecrease){
    var tableGraphic = "<table class='spreadIncDecTable'>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/increase.png'></td><td>" + roundToThree(spreadIncrease) + "°</td>" + "</tr>" +
                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/decrease.png'></td><td>" + roundToThree(spreadDecrease) + "°</td>" + "</tr>" +
                       "</table>"
return tableGraphic;
}

function bf6createDamageChart(damageArr, distanceArr, numOfPellets){
    var damageChart;
    if (damageArr[0] > 50 || damageArr[0] == 0){
        if (damageArr[0] >= 80){
            damageChart = bf6CreateDamageChart100Max200Dist(damageArr, distanceArr);
        } else {
            damageChart = bf6CreateDamageChart100Max(damageArr, distanceArr);
        }
    } else {
        damageChart = bf6CreateDamageChart50Max(damageArr, distanceArr, numOfPellets)
    }
    return damageChart;
}

var fragLabels = "<text x='51' class='chartSplashLabel' y='9'>1m</text>" +
                 "<text x='101' class='chartSplashLabel' y='9'>2m</text>" +
                 "<text x='151' class='chartSplashLabel' y='9'>3m</text>" +
                 "<text x='201' class='chartSplashLabel' y='9'>4m</text>" +
                 "<text x='251' class='chartSplashLabel' y='9'>5m</text>";

function bf6CreateDamageChart50Max(damageArr, distanceArr, numOfPellets){
    var damageLineCoords = "";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 120 - (2 * damageArr[i]);
        var distanceCoord = 2 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";

        // if damage is a step down make add a point directly below previous point
        if(i < damageArr.length - 1 && damageArr[i] != damageArr[i+1]){
            damageCoord = 120 - (2 * damageArr[i]);
            distanceCoord = 2 * distanceArr[i+1];
            damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
        }
    }
    damageLineCoords += "300," + (120 - (2 * damageArr[damageArr.length - 1])).toString();

    var maxDamage = roundToDecimal(damageArr[0], "1");
    var minDamage = roundToDecimal(damageArr[damageArr.length - 1], "1");

    var maxDamageText = "";
    maxDamageText = "<text x='" + (distanceArr[1]) + "' y='" + (116 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";

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

              
			   "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
               pelletsLabel +
           "</svg>"
}

function bf6CreateDamageChart100Max(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (120 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 120 - damageArr[i];
        var distanceCoord = 2 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";

        // if damage is a step down make add a point directly below previous point
        if(i < damageArr.length - 1 && damageArr[i] != damageArr[i+1]){
            damageCoord = 120 - damageArr[i];
            distanceCoord = 2 * distanceArr[i+1];
            damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
        }
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
           "</svg>"
}

function bf6CreateDamageChart100Max200Dist(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (100 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 100 - damageArr[i];
        var distanceCoord = 2 * distanceArr[i]/2;
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "300," + (100 - damageArr[damageArr.length - 1]).toString();
    damageLineCoords = damageLineCoords.replaceAll(",0",",1"); //hackjob fix to extend line to 300 if 200m is not a damage drop point

    var maxDamage = roundToDecimal(damageArr[0], "1");
    var minDamage = roundToDecimal(damageArr[damageArr.length - 1], "1");

    var maxDamageText = "";
    if(damageArr[0] > 80){
	if(damageArr[0] > 100){
            maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (122 - (maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
        } else {
            maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (118 - (maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
        }
    } else {
        maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (96 - (maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    }

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (94 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='175' y='" + (94 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    }

    return "<svg viewbox='0 0 300 100' class='damageChart'>" +
               "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

               "<line x1='10' y1='0' x2='10' y2='100' class='gridLineThin'/>" +
               "<line x1='20' y1='0' x2='20' y2='100' class='gridLineThin'/>" +
               "<line x1='30' y1='0' x2='30' y2='100' class='gridLineThin'/>" +
               "<line x1='40' y1='0' x2='40' y2='100' class='gridLineThin'/>" +
               "<line x1='60' y1='0' x2='60' y2='100' class='gridLineThin'/>" +
               "<line x1='70' y1='0' x2='70' y2='100' class='gridLineThin'/>" +
               "<line x1='80' y1='0' x2='80' y2='100' class='gridLineThin'/>" +
               "<line x1='90' y1='0' x2='90' y2='100' class='gridLineThin'/>" +
               "<line x1='110' y1='0' x2='110' y2='100' class='gridLineThin'/>" +
               "<line x1='120' y1='0' x2='120' y2='100' class='gridLineThin'/>" +
               "<line x1='130' y1='0' x2='130' y2='100' class='gridLineThin'/>" +
               "<line x1='140' y1='0' x2='140' y2='100' class='gridLineThin'/>" +
               "<line x1='160' y1='0' x2='160' y2='100' class='gridLineThin'/>" +
               "<line x1='170' y1='0' x2='170' y2='100' class='gridLineThin'/>" +
               "<line x1='180' y1='0' x2='180' y2='100' class='gridLineThin'/>" +
               "<line x1='190' y1='0' x2='190' y2='100' class='gridLineThin'/>" +
               "<line x1='210' y1='0' x2='210' y2='100' class='gridLineThin'/>" +
               "<line x1='220' y1='0' x2='220' y2='100' class='gridLineThin'/>" +
               "<line x1='230' y1='0' x2='230' y2='100' class='gridLineThin'/>" +
               "<line x1='240' y1='0' x2='240' y2='100' class='gridLineThin'/>" +
               "<line x1='260' y1='0' x2='260' y2='100' class='gridLineThin'/>" +
               "<line x1='270' y1='0' x2='270' y2='100' class='gridLineThin'/>" +
               "<line x1='280' y1='0' x2='280' y2='100' class='gridLineThin'/>" +
               "<line x1='290' y1='0' x2='290' y2='100' class='gridLineThin'/>" +

               "<line x1='50' y1='0' x2='50' y2='100' class='gridLineFat'/>" +
               "<line x1='100' y1='0' x2='100' y2='100' class='gridLineFat'/>" +
               "<line x1='150' y1='0' x2='150' y2='100' class='gridLineFat'/>" +
               "<line x1='200' y1='0' x2='200' y2='100' class='gridLineFat'/>" +
               "<line x1='250' y1='0' x2='250' y2='100' class='gridLineFat'/>" +

               "<text x='0' y='8' class='chartLabel'>100</text>" +
               "<line x1='0' y1='50' x2='300' y2='50' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
               "<text x='0' y='58' class='chartLabel'>50</text>" +

               "<text x='51' y='99' class='chartLabel200Dist'>50m</text>" +
               "<text x='101' y='99' class='chartLabel200Dist'>100m</text>" +
               "<text x='151' y='99' class='chartLabel200Dist'>150m</text>" +
               "<text x='201' y='99' class='chartLabel200Dist'>200m</text>" +
               "<text x='251' y='99' class='chartLabel200Dist'>250m</text>" +

               "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
           "</svg>";
}