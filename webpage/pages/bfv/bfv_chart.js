
var weaponClassTitles = ["","Medic","Assault","Support","Recon", "", "", "", "Sidearms"];
var firestormWeapons = []//["Gewehr 43","M1A1 Carbine","Sturmgewehr 1-5","StG 44","MP40","De Lisle Commando","STEN","Suomi KP/-31","M1928A1","LS/26","FG-42","Bren Gun","MG42","VGO","M97","12g Automatic","Lee-Enfield No4 Mk1","Kar98k","ZH-29","Boys AT Rifle","P38 Pistol","P08 Pistol","M1911","Liberator","Mk VI Revoler"];
var customizations = new Object();
var addVariantCounter = 0;

const firestormTooltip = "title = 'Included in Firestorm'";
const rpmTooltip = "title = 'Rounds per Minute'";
const bulletSpeedTooltip = "title = 'Bullet Speed and Drag Coefficient'";
const damageTooltip = "title = 'Damage'";
const magTooltip = "title = 'Ammo Capacity'";
const reloadTooltip = "title = 'Reload Time (Tactical/Empty)'";
const recoilTooltip = "title = 'Recoil while Standing'";
const adsTooltip = "title = 'ADS Spread while Standing'";
const hipfireTooltip = "title = 'Hip Fire Spread while Standing and Moving'";
const deployTooltip = "title = 'Deploy Time'";
const dragTooltip = "title = 'Manual Sort (Click and Hold to drag)'";
const variantTooltip = "title = 'Add Variant'";


function BFVinitializeChartPage() {
    // Create attachments array for each main weapon
    $.each(BFVWeaponData, function(key, weapon) {
        if(customizations[weapon.WeapShowName] == undefined){
            customizations[weapon.WeapShowName] = new Array({a:"",b:""}, {a:"",b:""}, {a:"",b:""}, {a:"",b:""});
        }
        if (weapon.Attachments_short.length > 0){
            var short_attachments = weapon.Attachments_short.split("+")
            for (var i = 0; i < short_attachments.length; i++){
                if ((customizations[weapon.WeapShowName][i].a.localeCompare(short_attachments[i]) != 0) && (customizations[weapon.WeapShowName][i].b.localeCompare(short_attachments[i]) != 0)){
                    if (customizations[weapon.WeapShowName][i].a.length == 0){
                        customizations[weapon.WeapShowName][i].a = short_attachments[i];
                    } else {
                        customizations[weapon.WeapShowName][i].b = short_attachments[i];
                    }
                }
            }
        }
    })

    printWeapons();

    $("#actionMenu").menu({
        position: {my: "left bottom", at: "left top"}
    });

    // Weapon select buttons
    $("#showHideCheckboxes input").checkboxradio(
        {icon:false}
    );
    $("#showHideCheckboxes input").change(function(){
        this.blur();
        showHideClasses();
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

function printWeapons(){
    var statsHtml = "";

    statsHtml += printWeaponClass(2);
    statsHtml += printWeaponClass(1);
    statsHtml += printWeaponClass(3);
    statsHtml += printWeaponClass(4);
    statsHtml += printWeaponClass(8);

    $("#pageBody").html(statsHtml);
    showHideClasses();

    $(".custButton").checkboxradio(
        {icon:false}
    );

    $(".variantButton").button();

    $(".variantButton").click(function(){
        addVariantCounter++;
        var thisRow = $(this).parentsUntil("tbody", "tr");
        var wearponName = $(thisRow).find(".lblWeaponName").text();

        var newWeaponStats = BFVWeaponData.find(function(element){
            return element.WeapAttachmentKey == wearponName;
        });

        var newWeaponRow = printWeapon(newWeaponStats);
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

function printWeaponClass(weaponClass){
    var rtnStr = "";
    rtnStr += "<div id='" + weaponClassTitles[weaponClass] + "Section'>" +
              "<div class='classHeader'><img src='./pages/bfv/img/" + weaponClassTitles[weaponClass] + "-icon.png'>" + weaponClassTitles[weaponClass] + "</div>";
    rtnStr += "<table class='table classTable'><tbody class='sortableTable'>";

    $.each(BFVWeaponData, function( key, value ) {
        if (value.Class == weaponClass && value.Attachments_short == ""){
            rtnStr += printWeapon(value);
        }
    });

    rtnStr += "</tbody></table></div>";
    return rtnStr;
}

function printWeapon(weaponStats){
    var firestormIcon = (firestormWeapons.includes(weaponStats.WeapShowName) ? "<img src='./pages/bfv/img/firestorm.png' " + firestormTooltip + ">" : "");
    var reloadData = createReloadGraphic(weaponStats.ReloadEmpty, weaponStats.ReloadLeft, weaponStats.MagSize, weaponStats.Ammo);
    var standRecoilData = createRecoilGraphic(weaponStats.ADSStandRecoilLeft, weaponStats.ADSStandRecoilRight, weaponStats.ADSStandRecoilUp, weaponStats.ADSStandRecoilInitialUp);
    var spreadTableGraphic = createSpreadTableGraphic(weaponStats.ADSStandBaseMin,weaponStats.ADSCrouchBaseMin,weaponStats.ADSProneBaseMin,
                                                      weaponStats.ADSStandMoveMin,weaponStats.ADSCrouchMoveMin,weaponStats.ADSProneMoveMin,
                                                      weaponStats.HIPStandBaseMin,weaponStats.HIPCrouchBaseMin,weaponStats.HIPProneBaseMin,
                                                      weaponStats.HIPStandMoveMin,weaponStats.HIPCrouchMoveMin,weaponStats.HIPProneMoveMin,
                                                      weaponStats.ADSStandBaseSpreadInc, weaponStats.HIPStandBaseSpreadInc)
    var customizationsGraphic = (weaponStats.Class == 8) ? "" : printCustomizations([weaponStats.WeapShowName]);
    var addVariantGraphic = (weaponStats.Class == 8 || addVariantCounter != 0) ? "" : "<button class='variantButton btn btn-outline-light btn-sm' " + variantTooltip + ">+</button>";
    var rtnStr = "<tr class='" + weaponStats.WeapShowName.replace(/ |\//g,"") + " sub_" + getWeaponsSubcat(weaponStats.WeapShowName) +"'>" +
                     "<td class='firstColumn'>" +
                         "<div class='lblWeaponName'>" +
                            "<span class='lblWeaponNameValue'>" + weaponStats.WeapShowName + "</span>" + firestormIcon +
                         "</div>" +
                         "<div>" +
                             "<img class='weaponImg' src='./pages/bfv/img/" + weaponStats.WeapShowName.replace("/","") + ".png' onerror='showBlank(this);'>" +
                         "</div>" +
                         "<div style='line-height: 20px;'>" +
                             "<span class='lblMagText'>" +
                                "<span class='lblMag'>" + weaponStats.MagSize + "</span>" +
                                "<span class='lblSuffixText'> x " + formatAmmoType(weaponStats.Ammo) + "</span>" +
                             "</span>" +
                             "<span class='lblRPM'>" +
                                 "<span class='lblRPMValue' " + rpmTooltip + ">" + weaponStats.BRoF + "</span>" +
                                 "<span class='lblSuffixText'> rpm</span>" +
                             "</span>" +
                         "</div>" +
                     "</td>" +

              "<td class='secondColumn'>" +
                  "<div class='damageChartContainer' " + damageTooltip + ">" + createDamageChart(weaponStats.Damages, weaponStats.Dmg_distances, weaponStats.ShotsPerShell) + "</div>" +
              "</td>" +

              "<td>" +
              //"<div class='underMagSection'>" +
              "<td>" +
                  "<div class='reloadDataAndMagCount'>" + createBulletSpeedGraphic(weaponStats.InitialSpeed, weaponStats.Drag) + reloadData  + "</div>" +
              "</td><td>" +
                  "<div class='recoilGraphicBox' " + recoilTooltip + ">" + standRecoilData + "</div>" +   "<div class='deployTimeBox' " + deployTooltip + "><span class='ui-icon ui-icon-transferthick-e-w'></span><br><span class='lblDeployTime'>" + weaponStats.DeployTime + "<span class='lblSuffixText'> s</span></span></div>" +
              "</td><td>" +
                 // "<div>" +
                      "<div class='hipSpreadContainer' " + hipfireTooltip + ">" + createHipSpreadGraphic(weaponStats.HIPStandMoveMin, weaponStats.HorDispersion) + "</div>" +
                      "<div>" +
                          "<div class='spreadLabels' " + adsTooltip + ">" +
                             createSpreadLabels(weaponStats.ADSStandMoveMin, weaponStats.ADSStandBaseMin) +
                          "</div>" +
                          "<div class='spreadCircles' " + adsTooltip + ">" + createSpreadGraphic(weaponStats.ADSStandBaseMin, weaponStats.ADSStandMoveMin) + "</div>" +
                      "</div>" +
                 // "</div>" +
            //  "</td><td>" +
                //  "<div class='deployTimeBox' " + deployTooltip + "><span class='ui-icon ui-icon-transferthick-e-w'></span><br><span class='lblDeployTime'>" + weaponStats.DeployTime + "<span class='lblSuffixText'> s</span></span></div>" +
              "</td><td>" +
                  spreadTableGraphic +
              "</td><td>" +
                  "<div class='custButtons'>" + customizationsGraphic + "</div>" +
              "</td><td>" +
                  "<div class='afterCustButtons'>" +
                      "<div>" +
                          "<img class='sortDragIcon' src='./pages/bfv/img/sortDrag.png' " + dragTooltip + ">" +
                      "</div>" +
                      "<div>" + addVariantGraphic + "</div>" +
                  "</div>" +
              //"</div>" +

              //"</div>" +
              //"<div class='magGraphicBox'>" + magCountGraphic + "</div>" +
              "</td>" +
              //"<div>DeployTime   : " + weaponStats.DeployTime + "</div>" +
              "</tr>";
        return rtnStr;
}

function updateWeapon(selectedCustomizations, selectedCustButton){
    var weaponStats = BFVWeaponData.find(function(element){
        return element.WeapAttachmentKey == selectedCustomizations;
    });

    var weaponRow = $(selectedCustButton).parentsUntil("tbody", "tr");
    $(weaponRow).find(".lblRPMValue").text(weaponStats.BRoF);
    $(weaponRow).find(".lblSpeedValue").text(weaponStats.InitialSpeed);
    $(weaponRow).find(".lblMag").text(weaponStats.MagSize);
    $(weaponRow).find(".damageChartContainer").html(createDamageChart(weaponStats.Damages, weaponStats.Dmg_distances, weaponStats.ShotsPerShell))
    $(weaponRow).find(".reloadDataAndMagCount").html(createBulletSpeedGraphic(weaponStats.InitialSpeed, weaponStats.Drag) + createReloadGraphic(weaponStats.ReloadEmpty, weaponStats.ReloadLeft, weaponStats.MagSize, weaponStats.Ammo));
    $(weaponRow).find(".recoilGraphicBox").html(createRecoilGraphic(weaponStats.ADSStandRecoilLeft, weaponStats.ADSStandRecoilRight, weaponStats.ADSStandRecoilUp, weaponStats.ADSStandRecoilInitialUp));
    $(weaponRow).find(".spreadLabels").html(createSpreadLabels(weaponStats.ADSStandMoveMin, weaponStats.ADSStandBaseMin));
    $(weaponRow).find(".spreadCircles").html(createSpreadGraphic(weaponStats.ADSStandBaseMin, weaponStats.ADSStandMoveMin));
    $(weaponRow).find(".hipSpreadContainer").html(createHipSpreadGraphic(weaponStats.HIPStandMoveMin, weaponStats.HorDispersion));
    $(weaponRow).find(".lblDeployTime").html(weaponStats.DeployTime + "<span class='lblSuffixText'> s</span>");
    $(weaponRow).find(".spreadTable").replaceWith(createSpreadTableGraphic(weaponStats.ADSStandBaseMin,weaponStats.ADSCrouchBaseMin,weaponStats.ADSProneBaseMin,
                                                  weaponStats.ADSStandMoveMin,weaponStats.ADSCrouchMoveMin,weaponStats.ADSProneMoveMin,
                                                  weaponStats.HIPStandBaseMin,weaponStats.HIPCrouchBaseMin,weaponStats.HIPProneBaseMin,
                                                  weaponStats.HIPStandMoveMin,weaponStats.HIPCrouchMoveMin,weaponStats.HIPProneMoveMin,
                                                  weaponStats.ADSStandBaseSpreadInc, weaponStats.HIPStandBaseSpreadInc));

}

function printCustomizations(weaponName){
    var custString = "";
    var variantNum = (addVariantCounter == 0) ? "" : addVariantCounter;

    for (var i = 0; i < customizations[weaponName].length; i++){
        var rowClass = "custRow" + i.toString();
        custString +="<div>"
        custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].a + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol1'><label data-shortname='" + customizations[weaponName][i].a + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].a + i.toString() + "'>" + customizationStrings[customizations[weaponName][i].a] + "</label>";
        custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].b + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol2'><label data-shortname='" + customizations[weaponName][i].b + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].b + i.toString() + "'>" + customizationStrings[customizations[weaponName][i].b] + "</label>";
        custString += "</div>"
    }

    custString = BFVSwitchBayoToHeav(custString, weaponName)

    return custString;
}

function createBulletSpeedGraphic(initialSpeed, drag){
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

function createReloadGraphic(reloadEmpty, reloadLeft, magSize, ammoType){
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

function formatAmmoType(ammo){
    var newAmmo = ammo.replace("Carcano65x52mm", "6.5x52mm Carcano").replace("_Semi", "").replace("_SMG", "").replace("_Heavy", "").replace("_Pistol", "").replace("_Bolt", " ").replace("_SLR", " ").replace("Mauser", "Mauser ").replace("303", ".303").replace("792", "7.92").replace("Carbine", "").replace("Heavy", "").replace("Sniper", "").replace("_ShortBarrel", "");
    newAmmo = newAmmo.replace("75", "7.5").replace("351W", ".351 W").replace("35R", ".35 R").replace("_Fast", "").replace("_A5", "").replace("_Drilling", "").replace("_Improved", "").replace("_1897", "").replace("Incendiary", "").replace("LongRange", "").replace("_LowDrag", "").replace("Rifle", "").replace("_Aero", " ").replace("_", " ");
    newAmmo = newAmmo.replace("_Auto", "").replace(" HighROF", "").replace(" M3", "").replace(" MMG", "").replace(" MG", "").replace("_CMP", "").replace(" PzB39", "");
    
    return newAmmo;
}

function createRecoilGraphic(recoilLeft, recoilRight, recoilUp, recoilInitialUp){

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
                                "<text x='64' y='" + recoilUpTextY + "' text-anchor='start' class='recoilValue recoilUpValue'>" + (recoilUp >= 0 ? "+": "") + roundToThree(recoilUp) + "°</text>" +
                                "<text x='60' y='" + recoilInitUpTextY + "' text-anchor='middle' class='recoilValue recoilInitUpValue'>" + roundToThree(recoilInitialUp) + "°</text>" +
                            "</svg>";
    } else {
        var recoilGraphic = "<svg viewbox='0 0 120 100' style='width: 100px;'>" +
                                "<line x1='50' y1='90' x2='70' y2='90' style='stroke:#555; stroke-width:2'/>" +
                                "<line x1='60' y1='90' x2='60' y2='80' style='stroke:#555; stroke-width:2'/>" +
                                "<text x='44' y='95' text-anchor='end' class='recoilValue recoilHorValue'>" + roundToThree(recoilLeft) + "°</text>" +
                                "<text x='74' y='95' class='recoilValue'>" + roundToThree(Math.abs(recoilRight)) + "°</text>" +
                                "<text x='64' y='64' text-anchor='start' class='recoilValue recoilUpValue'>" + (recoilUp >= 0 ? "+": "") + roundToThree(recoilUp) + "°</text>" +
                                "<text x='60' y='76' text-anchor='middle' class='recoilValue recoilInitUpValue'>" + roundToThree(recoilInitialUp) + "°</text>" +
                            "</svg>";
    }
    return recoilGraphic;
}

function createSpreadLabels(ADSStandMoveMin, ADSStandBaseMin){
    var rtnStr = "";
    if (ADSStandMoveMin > 0){
        rtnStr = "<div class='speadMoveLabel'>" + roundToThree(ADSStandMoveMin) + "°</div>" +
                 "<div class='speadBaseLabel'>" + roundToThree(ADSStandBaseMin) + "°</div>";
    }
    return rtnStr;
}

function createSpreadGraphic(ADSBase, ADSMove){
    var spreadGraphic = "";
    if (ADSBase < .4 && ADSMove != 0){
        var adsBaseCircle = "";
        if(ADSBase >= 0.05){
            adsBaseCircle = "<circle cx='0' cy='100' r='" + (ADSBase * 200).toString() + "' class='spreadBaseCicle'></circle>";
        } else {
            adsBaseCircle = "<circle cx='0' cy='100' r='4' stroke-width='2' style='fill: none; stroke: #C8C63A; fill: #C8C63A;'></circle>";
        }

        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 60px;'>" +
                        "<circle cx='0' cy='100' r='" + (ADSMove * 200).toString() + "' class='spreadMoveCicle'></circle>" +
	                    adsBaseCircle +
                        "</svg>";
    } else if (ADSMove != 0){
        var standLineOffset = ADSBase * 2;
        var moveLineOffset = ADSMove * 2;
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 60px;'>" +

                        "<line x1='50' y1='" + (standLineOffset + 52) + "' x2='50' y2='" + (standLineOffset + 65) + "' class='spreadBaseLine'></line>" +
                        "<line x1='50' y1='" + (48 - standLineOffset) + "' x2='50' y2='" + (35 - standLineOffset) + "' class='spreadBaseLine'></line>" +

                        "<line y1='50' x1='" + (standLineOffset + 52) + "' y2='50' x2='" + (standLineOffset + 65) + "' class='spreadBaseLine'></line>" +
                        "<line y1='50' x1='" + (48 - standLineOffset) + "' y2='50' x2='" + (35 - standLineOffset) + "' class='spreadBaseLine'></line>" +

                        "</svg>";
    }
    return spreadGraphic;
}

function createHipSpreadGraphic(HIPSpread, HorDispersion){
    var lineOffset = HIPSpread * 2;
    var spreadGraphic = "";

    if (HIPSpread > 0) {
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 75px;'>" +
                        "<line x1='50' y1='" + (lineOffset + 52) + "' x2='50' y2='" + (lineOffset + 65) + "' class='hipSpreadLine'></line>" +
                        "<line x1='50' y1='" + (48 - lineOffset) + "' x2='50' y2='" + (35 - lineOffset) + "' class='hipSpreadLine'></line>" +

                        "<line y1='50' x1='" + (lineOffset + 52) + "' y2='50' x2='" + (lineOffset + 65) + "' class='hipSpreadLine'></line>" +
                        "<line y1='50' x1='" + (48 - lineOffset) + "' y2='50' x2='" + (35 - lineOffset) + "' class='hipSpreadLine'></line>" +

                        "<text x='5' y='91' class='hipSpreadValue'>" + roundToThree(HIPSpread) + "°</text>" +
                        "</svg>";
    } else {
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 75px;'>" +
                        "<circle cx='50' cy='50' r='" + (HorDispersion * 10).toString() + "' class='hipSpreadLine'></circle>" +
                        "<text x='5' y='23' class='hipSpreadValue'>" + roundToThree(HorDispersion) + "°</text>" +
                        "</svg>";
    }
    return spreadGraphic;
}

function createSpreadTableGraphic(ADSStand, ADSCrouch, ADSProne, ADSStandMove, ADSCrouchMove, ADSProneMove,
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

                           "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/increase.png'></td><td>" + roundToThree(ADSIncrease) + "°</td><td>" + roundToThree(HIPIncrease) + "°</td>" + "</tr>" +

                       "</table>"
    return tableGraphic;
}


function formatDamagesOrDistances(dmgArray) {
    var dmgStr = "";
    for (var i = 0; i < dmgArray.length; i++){
        dmgStr += dmgArray[i].toFixed(1).toString() + " - ";
    }
    return dmgStr;
}

function createDamageChart(damageArr, distanceArr, numOfPellets){
    var damageChart;
    if (damageArr[0] > 50 ){
        if(distanceArr.indexOf(200) == -1 && distanceArr.indexOf(125) == -1){
            damageChart = createDamageChart100Max(damageArr, distanceArr);
        } else {
            damageChart = createDamageChart100Max200Dist(damageArr, distanceArr);
        }
    } else {
        damageChart = createDamageChart50Max(damageArr, distanceArr, numOfPellets)
    }
    return damageChart;
}

function createDamageChart50Max(damageArr, distanceArr, numOfPellets){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (100 - (2 * damageArr[0])) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 100 - (2 * damageArr[i]);
        var distanceCoord = 2 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (100 - (2 * damageArr[damageArr.length - 1])).toString();

    var maxDamage = roundToDecimal(damageArr[0], "1");
    var minDamage = roundToDecimal(damageArr[damageArr.length - 1], "1");

    var maxDamageText = "";
    if(damageArr[0] > 40){
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (118 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (96 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    }

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (94 - (2 * minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='175' y='" + (94 - (2 * minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    }

    var pelletsLabel = "";
    if (numOfPellets > 1){
        pelletsLabel = "<text x='135' y='75' class='chartMinMaxLabel'>" + numOfPellets + " pellets</text>";
    }

    return "<svg viewbox='0 0 200 100' class='damageChart'>" +
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

               "<line x1='50' y1='0' x2='50' y2='100' class='gridLineFat'/>" +
               "<line x1='100' y1='0' x2='100' y2='100' class='gridLineFat'/>" +
               "<line x1='150' y1='0' x2='150' y2='100' class='gridLineFat'/>" +

               "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
               "<text x='0' y='58' class='chartLabel'>25</text>" +
               "<line x1='0' y1='33' x2='200' y2='33' style='stroke:rgb(175,175,175); stroke-width:.25'/>" +
               "<text x='0' y='41' class='chartLabel'>33</text>" +
               "<text x='0' y='8' class='chartLabel'>50</text>" +

               "<text x='51' y='99' class='chartLabel'>25m</text>" +
               "<text x='101' y='99' class='chartLabel'>50m</text>" +
               "<text x='151' y='99' class='chartLabel'>75m</text>" +

               "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
               pelletsLabel +
           "</svg>"
}

function createDamageChart100Max(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (100 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 100 - damageArr[i];
        var distanceCoord = 2 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (100 - damageArr[damageArr.length - 1]).toString();

    var maxDamage = roundToDecimal(damageArr[0], "1");
    var minDamage = roundToDecimal(damageArr[damageArr.length - 1], "1");

    var maxDamageText = "";
    if(damageArr[0] > 80){
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (118 - (maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (96 - (maxDamage)).toString() + "' class='chartMinMaxLabel maxDamageText'>" + maxDamage + "</text>";
    }

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (94 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='175' y='" + (94 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    }

    return "<svg viewbox='0 0 200 100' class='damageChart'>" +
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

               "<line x1='50' y1='0' x2='50' y2='100' class='gridLineFat'/>" +
               "<line x1='100' y1='0' x2='100' y2='100' class='gridLineFat'/>" +
               "<line x1='150' y1='0' x2='150' y2='100' class='gridLineFat'/>" +

               "<text x='0' y='8' class='chartLabel'>100</text>" +
               "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
               "<text x='0' y='58' class='chartLabel'>50</text>" +

               "<text x='51' y='99' class='chartLabel'>25m</text>" +
               "<text x='101' y='99' class='chartLabel'>50m</text>" +
               "<text x='151' y='99' class='chartLabel'>75m</text>" +

               "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
           "</svg>"
}

function createDamageChart100Max200Dist(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (100 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 100 - damageArr[i];
        var distanceCoord = 2 * distanceArr[i]/2;
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (100 - damageArr[damageArr.length - 1]).toString();

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

    return "<svg viewbox='0 0 200 100' class='damageChart'>" +
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

               "<line x1='50' y1='0' x2='50' y2='100' class='gridLineFat'/>" +
               "<line x1='100' y1='0' x2='100' y2='100' class='gridLineFat'/>" +
               "<line x1='150' y1='0' x2='150' y2='100' class='gridLineFat'/>" +

               "<text x='0' y='8' class='chartLabel'>100</text>" +
               "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
               "<text x='0' y='58' class='chartLabel'>50</text>" +

               "<text x='51' y='99' class='chartLabel200Dist'>50m</text>" +
               "<text x='101' y='99' class='chartLabel200Dist'>100m</text>" +
               "<text x='151' y='99' class='chartLabel200Dist'>150m</text>" +

               "<polyline class='chartDamageLine' points='" + damageLineCoords + "'/>" +
               maxDamageText +
               minDamageText +
           "</svg>";
}


function showHideClasses(){
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
        $("#ReconSection").show(0);
    } else {
        $("#ReconSection").hide(0);
    }
}

function showHideSubCats(){
    if ($("#showARCheck").is(":checked")){
        $(".sub_AR").show(0);
    } else {
        $(".sub_AR").hide(0);
    }
    if ($("#showSARCheck").is(":checked")){
        $(".sub_SAR").show(0);
    } else {
        $(".sub_SAR").hide(0);
    }
    if ($("#showSMGCheck").is(":checked")){
        $(".sub_SMG").show(0);
    } else {
        $(".sub_SMG").hide(0);
    }
    if ($("#showBACarbineCheck").is(":checked")){
        $(".sub_BACarbine").show(0);
    } else {
        $(".sub_BACarbine").hide(0);
    }
    if ($("#showShotgunCheck").is(":checked")){
        $(".sub_Shotgun").show(0);
    } else {
        $(".sub_Shotgun").hide(0);
    }
    if ($("#showLMGCheck").is(":checked")){
        $(".sub_LMG").show(0);
    } else {
        $(".sub_LMG").hide(0);
    }
    if ($("#showMMGCheck").is(":checked")){
        $(".sub_MMG").show(0);
    } else {
        $(".sub_MMG").hide(0);
    }
    if ($("#showBACheck").is(":checked")){
        $(".sub_BA").show(0);
    } else {
        $(".sub_BA").hide(0);
    }
    if ($("#showSLRCheck").is(":checked")){
        $(".sub_SLR").show(0);
    } else {
        $(".sub_SLR").hide(0);
    }
    if ($("#showAMCheck").is(":checked")){
        $(".sub_AntiMaterial").show(0);
    } else {
        $(".sub_AntiMaterial").hide(0);
    }
    if ($("#showPCCheck").is(":checked")){
        $(".sub_PistolCarbine").show(0);
    } else {
        $(".sub_PistolCarbine").hide(0);
    }
}



var weaponSubCats = new Object();

weaponSubCats._AGM42 = "SAR";
weaponSubCats._BredaM1935PG = "AR"
weaponSubCats._Gewehr15 = "SAR";
weaponSubCats._M1Garand = "SAR";
weaponSubCats._M1A1Carbine = "SAR";
weaponSubCats._MAS44 = "SAR";
weaponSubCats._Selbstlader1916 = "SAR";
weaponSubCats._TurnerSMLE = "SAR";
weaponSubCats._StG44 = "AR";
weaponSubCats._Gewehr43 = "SAR";
weaponSubCats._M1907SF = "AR";
weaponSubCats._M2Carbine = "AR"
weaponSubCats._Ribeyrolles1918 = "AR";
weaponSubCats._StG44 = "AR";
weaponSubCats._Sturmgewehr15 = "AR";
weaponSubCats._Karabin1938M = "SAR";

weaponSubCats._EMP = "SMG";
weaponSubCats._M1928A1 = "SMG";
weaponSubCats._M3GreaseGun = "SMG";
weaponSubCats._MAB38 = "SMG";
weaponSubCats._MP28 = "SMG";
weaponSubCats._MP34 = "SMG";
weaponSubCats._MP40 = "SMG";
weaponSubCats._NambuType2A = "SMG";
weaponSubCats._STEN = "SMG";
weaponSubCats._SuomiKP31 = "SMG";
weaponSubCats._Zk383 = "SMG";
weaponSubCats._Type100 = "SMG";
weaponSubCats._M28Tromboncino = "BACarbine";
weaponSubCats._CommandoCarbine = "BACarbine";
weaponSubCats._JungleCarbine = "BACarbine";

weaponSubCats._12gAutomatic = "Shotgun";
weaponSubCats._M30Drilling = "Shotgun";
weaponSubCats._M97 = "Shotgun";
weaponSubCats._Model37 = "Shotgun"
weaponSubCats._BARM1918A2 = "LMG";
weaponSubCats._BrenGun = "LMG";
weaponSubCats._FG42 = "LMG";
weaponSubCats._KE7 = "LMG";
weaponSubCats._LewisGun = "LMG";
weaponSubCats._LS26 = "LMG";
weaponSubCats._M1922MMG = "MMG";
weaponSubCats._MadsenMG = "LMG";
weaponSubCats._Type11MG = "LMG";
weaponSubCats._Type97MG = "LMG";
weaponSubCats._MG34 = "MMG";
weaponSubCats._MG42 = "MMG";
weaponSubCats._S2200 = "MMG";
weaponSubCats._VGO = "MMG";
weaponSubCats._M1919A6 = "MMG";

weaponSubCats._BoysATRifle = "AntiMaterial";
weaponSubCats._Panzerbüchse39 = "AntiMaterial";
weaponSubCats._GewehrM9530 = "BA";
weaponSubCats._Kar98k = "BA";
weaponSubCats._KragJorgensen = "BA";
weaponSubCats._LeeEnfieldNo4Mk1 = "BA";
weaponSubCats._RossRifleMkIII = "BA";
weaponSubCats._Type99Arisaka = "BA";
weaponSubCats._Model8 = "SLR";
weaponSubCats._RSC = "SLR";
weaponSubCats._Selbstlader1906 = "SLR";
weaponSubCats._ZH29 = "SLR";
weaponSubCats._P08Carbine = "PistolCarbine";
weaponSubCats._C96TrenchCarbine = "PistolCarbine";


function cleanUpStuff(){
    var speacialRow = $("span:contains('Karabin')").parentsUntil("tbody", "tr");
    //$(speacialRow).find(".recoilGraphicBox").css("visibility","hidden");
    //$(speacialRow).find(".recoilGraphicBox > svg").empty();
    $(speacialRow).find(".variantButton").remove();
    $(speacialRow).find(".custButtons").empty().html("<div class='tbdBox'>Soon</div>");

}
