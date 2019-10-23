

// http://eaassets-a.akamaihd.net/dice-commerce/Casablanca/Update_Notes/20190321-01/Apex_V_Chapter_3_Trial_By_Fire_Update_21032019_FINAL.pdf

var apex_weaponClassTitles = ["Assault Rifle","SMG","Shotgun","LMG","Sniper","Special","Pistol"];
// var firestormWeapons = ["Gewehr 43","M1A1 Carbine","Sturmgewehr 1-5","StG 44","MP40","De Lisle Commando","STEN","Suomi KP/-31","M1928A1","LS/26","FG-42","Bren Gun","MG42","VGO","M97","12g Automatic","Lee-Enfield No4 Mk1","Kar98k","ZH-29","Boys AT Rifle","P38 Pistol","P08 Pistol","M1911","Liberator","Mk VI Revoler"];
var customizations = {};
var optic_customizations = {};
var addVariantCounter = 0;

// const firestormTooltip = "title = 'Included in Firestorm'";
const apex_weapon_tooltip = "title = ";
const apex_rpmTooltip = "title = 'Rounds/Minute'";
const apex_bulletSpeedTooltip = "title = 'Bullet Speed and Drag Coefficient'";
const apex_damageTooltip = "title = 'Damage'";
const apex_magTooltip = "title = 'Ammo Capacity'";
const apex_reloadTooltip = "title = 'Reload Time (Tactical/Empty)'";
const apex_recoilTooltip = "title = 'Recoil while Standing'";
const apex_adsTooltip = "title = 'ADS(Aim Down Sight) Spread while Standing'";
const apex_hipfireTooltip = "title = 'Hip Fire Spread wile Standing and Moving'";
const apex_deployTooltip = "title = '1st Deploy / Deploy Time \n Raise Time / Holster Time'";
const apex_dragTooltip = "title = 'Manual Sort (Click and Hold to drag)'";
const apex_variantTooltip = "title = 'Add Variant'";
const apex_barrel_attachments = ["barrel_stabilizer_l1", "barrel_stabilizer_l2", "barrel_stabilizer_l3", "barrel_stabilizer_l4_flash_hider"];
const apex_light_mag_attachments = ["bullets_mag_l1", "bullets_mag_l2", "bullets_mag_l3", "bullets_mag_l4"];

function apex_initializeChartPage() {
    // Create attachments array for each main weapon
    $.each(APEXWeaponData, function(key, weapon) {
        let attachment_listx = [];
        let optic_listx = [];
        for (const [key, value] of Object.entries(weapon.WeaponData.Mods)) {
            // console.log("Wep: ", weapon.WeaponData.printname, " Mod: ", key, value);
            if(customizationHopupStrings[key] != undefined) {
                attachment_listx.push(key);
            }
            if(customizationAttachmentStrings[key] != undefined) {
                attachment_listx.push(key);
            }
            if(customizationOpticStrings[key] != undefined) {
                optic_listx.push(key);
            }
        }
        weapon.WeaponData["attachment_listx"] = attachment_listx;
        weapon.WeaponData["optic_listx"] = optic_listx;
        var formatted_name = formatWeaponName(weapon.WeaponData.printname);
        weapon.WeaponData.printname = formatted_name.replace(" -", "");
        if(customizations[formatted_name] === undefined){
            customizations[formatted_name] = [];
            // customizations[weapon.WeaponData.printname] = [{a:"",b:"",c:"",d:"",e:""}, {a:"",b:"",c:"",d:"",e:""}, {a:"",b:"",c:"",d:"",e:""}, {a:"",b:"",c:"",d:"",e:""}];
        }
        for (var i = 0; i < weapon.WeaponData["attachment_listx"].length; i++) {
            if(weapon.WeaponData.Mods[weapon.WeaponData["attachment_listx"][i]] != undefined) {

                customizations[formatted_name][i] = weapon.WeaponData.Mods[weapon.WeaponData["attachment_listx"][i]];
                customizations[formatted_name][i].attachName = [weapon.WeaponData["attachment_listx"][i]];
            }
                // customizations[weapon.WeaponData.printname][apex_light_mag_attachments[i]] = weapon.WeaponData.Mods[apex_light_mag_attachments[i]];
        }
        if(optic_customizations[formatted_name] === undefined){
            optic_customizations[formatted_name] = [];
            // customizations[weapon.WeaponData.printname] = [{a:"",b:"",c:"",d:"",e:""}, {a:"",b:"",c:"",d:"",e:""}, {a:"",b:"",c:"",d:"",e:""}, {a:"",b:"",c:"",d:"",e:""}];
        }
        for (var i = 0; i < weapon.WeaponData["optic_listx"].length; i++) {
            if(weapon.WeaponData.Mods[weapon.WeaponData["optic_listx"][i]] != undefined) {

                optic_customizations[formatted_name][i] = weapon.WeaponData.Mods[weapon.WeaponData["optic_listx"][i]];
                optic_customizations[formatted_name][i].attachName = [weapon.WeaponData["optic_listx"][i]];
            }
        }
    });

    apex_printWeapons();

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

    $("#showHideStats input").checkboxradio(
        {icon: false}
    );
    $("#showHideStats input").change(function(){
        this.blur();
        showHideStats();
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

function apex_printWeapons(){
    if (document.getElementById('imgIcon') === null)
        var src = document.getElementById("mycanvas");
    var img = document.createElement("img");
    img.setAttribute("id", "imgIconId");
    //img.src = "http://dl.dropboxusercontent.com/u/59965750/battlescreen/customPlayerIcon.png";
    img.src='./pages/apex/icons/attachment_box.png';
    src.appendChild(img);
    var statsHtml = "";
    // statsHtml += "<div><ab><img class='attachment_box' src='./pages/apex/icons/attachment_box.png' alt='' onerror='showBlank(this);'></ab></div>";

    statsHtml += apex_printWeaponClass(0);
    statsHtml += apex_printWeaponClass(1);
    statsHtml += apex_printWeaponClass(2);
    statsHtml += apex_printWeaponClass(3);
    statsHtml += apex_printWeaponClass(4);
    statsHtml += apex_printWeaponClass(5);
    statsHtml += apex_printWeaponClass(6);

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

        var newWeaponStats = APEXWeaponData.find(function(element){
            return element.WeapAttachmentKey === wearponName;
        });

        var newWeaponRow = apex_printWeapon(newWeaponStats);
        var newWeaponRowObj = $(newWeaponRow).insertAfter(thisRow);
        $(newWeaponRowObj).find(".custButton").checkboxradio(
            {icon:false}
        );
        apex_initializeCustomizationsRow(newWeaponRowObj);

        $(newWeaponRowObj).effect("highlight");
        showHideStats();
    });

    $(document).tooltip({track: true});

    apex_initializeCustomizations();
    initializeSorts();

    $(".sortableTable").sortable({
       opacity: 0.7,
       placeholder: "ui-state-highlight",
       handle: ".sortDragIcon"
    });

    showHideStats();
    showHideSubCats();
    //cleanUpStuff();
}

function apex_printWeaponClass(weaponClass){
    var rtnStr = "";
    rtnStr += "<div id='" + apex_weaponClassTitles[weaponClass] + "Section'>" +
              "<div class='classHeader'><img src='./pages/apex/icons/rui/weapon_icons/classes/" + apex_weaponClassTitles[weaponClass] + ".png' alt=''>" + apex_weaponClassTitles[weaponClass] + "</div>";
    rtnStr += "<table class='table classTable'><tbody class='sortableTable'>";

    $.each(APEXWeaponData, function( key, value ) {
        if (parseInt(value.WeaponData.weapon_class) === weaponClass && value.WeaponData.weapon_type_flags === "WPT_PRIMARY"){
            rtnStr += apex_printWeapon(value.WeaponData, key);
        }
    });
    rtnStr += "</tbody></table></div>";
    return rtnStr;
}

function apex_printWeapon(weaponStats, key) {
    // const temp_dmg = [];
    // const temp_dmgDist = [];
    // var projectiles_per_shot = (weaponStats.projectiles_per_shot > 1) ? weaponStats.projectiles_per_shot : 1;
    // if (weaponStats.damage_near_value === undefined) {
    //     temp_dmg[0] = parseFloat(weaponStats.MP_BASE.damage_near_value) * projectiles_per_shot;
    //     temp_dmg[1] = parseFloat(weaponStats.MP_BASE.damage_far_value)* projectiles_per_shot;
    //     temp_dmg[2] = parseFloat(weaponStats.MP_BASE.damage_very_far_value)* projectiles_per_shot;
    // } else {
    //     temp_dmg[0] = parseFloat(weaponStats.damage_near_value)* projectiles_per_shot;
    //     temp_dmg[1] = parseFloat(weaponStats.damage_far_value)* projectiles_per_shot;
    //     temp_dmg[2] = parseFloat(weaponStats.damage_very_far_value)* projectiles_per_shot;
    // }
    // if (weaponStats.damage_far_distance === undefined) {
    //     temp_dmgDist[0] = parseFloat(weaponStats.MP_BASE.damage_near_distance_m) / 39.7301;
    //     temp_dmgDist[1] = parseFloat(weaponStats.MP_BASE.damage_far_distance_m) / 39.7301;
    //     temp_dmgDist[2] = parseFloat(weaponStats.MP_BASE.damage_very_far_distance_m) / 39.7301;
    // } else {
    //     temp_dmgDist[0] = parseFloat(weaponStats.damage_near_distance) / 39.7301;
    //     temp_dmgDist[1] = parseFloat(weaponStats.damage_far_distance) / 39.7301;
    //     temp_dmgDist[2] = parseFloat(weaponStats.damage_very_far_distance) / 39.7301;
    // }
    // if (Number.isNaN(temp_dmgDist[1])) {
    //     temp_dmgDist[1] = temp_dmgDist[0]
    // }
    // if (Number.isNaN(temp_dmg[1])) {
    //     temp_dmg[1] = temp_dmg[0]
    // }
    // if (Number.isNaN(temp_dmgDist[2])) {
    //     temp_dmgDist[2] = temp_dmgDist[1]
    // }
    // if (Number.isNaN(temp_dmg[2])) {
    //     temp_dmg[2] = temp_dmg[1]
    // }
    // APEXWeaponData[key].WeaponData["Damages"] = temp_dmg;
    // APEXWeaponData[key].WeaponData["Dmg_distances"] = temp_dmgDist;
    // var firestormIcon = (firestormWeapons.includes(weaponStats.printname) ? "<img src='./pages/apex/img/firestorm.png' " + firestormTooltip + ">" : "");
    //var magCountGraphic = createMagGraphic(weaponStats.ammo_clip_size, weaponStats.Mods.survival_finite_ammo.ammo_stockpile_max.includes("Incendiary") || weaponStats.Mods.survival_finite_ammo.ammo_stockpile_max.includes("_APCR"));
    var reloadData = apex_createReloadGraphic(weaponStats.reloadempty_time, weaponStats.reload_time, weaponStats.ammo_clip_size, weaponStats.Mods.survival_finite_ammo.ammo_stockpile_max);
    var standRecoilData = apex_createRecoilGraphic(weaponStats.viewkick_yaw_base, weaponStats.viewkick_yaw_random, weaponStats.viewkick_pitch_base, weaponStats.viewkick_pitch_random);
    var apex_spreadTableGraphic = apex_createSpreadTableGraphic(weaponStats.spread_stand_ads,weaponStats.spread_crouch_ads,weaponStats.spread_air_ads,
                                                      weaponStats.spread_kick_on_fire_stand_ads,weaponStats.spread_kick_on_fire_crouch_ads,weaponStats.spread_kick_on_fire_air_ads,
                                                      weaponStats.spread_stand_hip,weaponStats.spread_crouch_hip,weaponStats.spread_air_hip,
                                                      weaponStats.spread_stand_hip,weaponStats.spread_stand_hip_run,weaponStats.spread_stand_hip_sprint,formatWeaponValue(weaponStats.spread_kick_on_fire_stand_ads),formatWeaponValue(weaponStats.spread_moving_increase_rate));
    var attachmentGraphic = (weaponStats.menu_category == 8) ? "" : apex_printAttachments([formatWeaponName(weaponStats.printname)], weaponStats.ammo_pool_type);
    var customizationsGraphic = (weaponStats.menu_category == 8) ? "" : apex_printCustomizations([formatWeaponName(weaponStats.printname)]);
    var addVariantGraphic = (weaponStats.menu_category === 8 || addVariantCounter != 0) ? "" : "<button class='variantButton btn btn-outline-light btn-sm' " + apex_variantTooltip + ">+</button>";
    // var muzzleVelocityMeters =
    // return `<tr class='${weaponStats.printname.replace(/ |\//g, "")} sub_${getWeaponsSubcat(weaponStats.printname)}'><td class='firstColumn'><div class='lblWeaponName'><span>${formatWeaponName(weaponStats.printname)}</span></div><div><img class='weaponImg' src='./pages/apex/icons/${weaponStats.hud_icon}.png' onerror='showBlank(this);'></div><div style='line-height: 20px;'><span class='lblMagText'><span class='lblMag'>${weaponStats.ammo_clip_size}</span><span class='apex_lblSuffixText'> x <img src='./pages/apex/icons/ammo/${weaponStats.ammo_pool_type}.png' height="20" width="19" onerror='showBlank(this);'></span></span><span class='lblRPM'><span class='lblRPMValue' ${apex_rpmTooltip}>${weaponStats.fire_rate * 60}</span><span class='apex_lblSuffixText'> rpm</span></span></div></td><td class='secondColumn'><div class='damageChartContainer' ${apex_damageTooltip}>${apex_createDamageChart(temp_dmg, temp_dmgDist, weaponStats.projectiles_per_shot)}</div></td><td><td><div class='apex_reloadDataAndMagCount'>${apex_createBulletSpeedGraphic(Math.round(weaponStats.projectile_launch_speed / 39.3701), weaponStats.projectile_drag_coefficient)}${reloadData}</div></td><td><div class='recoilGraphicBox' ${apex_recoilTooltip}>${standRecoilData}</div><div class='apex_deployTimeBox' ${apex_deployTooltip}><span class='ui-icon ui-icon-transferthick-e-w'></span><br><span class='lblDeployTime'>${weaponStats.deploy_time}<span class='apex_lblSuffixText'> s</span></span></div></td><td><div class='hipSpreadContainer' ${apex_hipfireTooltip}>${apex_createHipSpreadGraphic(weaponStats.spread_stand_hip, weaponStats.viewkick_yaw_random)}</div><div><div class='spreadLabels' ${apex_adsTooltip}>${apex_createSpreadLabels(weaponStats.spread_air_ads, weaponStats.spread_stand_ads)}</div><div class='spreadCircles' ${apex_adsTooltip}>${apex_createSpreadGraphic(weaponStats.spread_stand_ads, weaponStats.spread_air_ads)}</div></div></td><td>${spreadTableGraphic}</td><td><div class='custButtons'>${customizationsGraphic}</div></td><td><div class='afterApexCustButtons'><div><img class='sortDragIcon' src='./pages/apex/img/sortDrag.png' ${apex_dragTooltip}></div><div>${addVariantGraphic}</div></div></td></tr>`;
    // let weapon_rof = 0;
    let weapon_rof = 0;
    if(weaponStats.burst_fire_count > 1) {
        weapon_rof = Math.round(60/(((1 / weaponStats.fire_rate) * (weaponStats.burst_fire_count * 2) + parseFloat(weaponStats.burst_fire_delay)) / (weaponStats.burst_fire_count * 2)))
        // weapon_rof = Math.round(60/(((1/weaponStats.fire_rate) * (weaponStats.burst_fire_count * 2 + weaponStats.burst_fire_delay))/(weaponStats.burst_fire_count * 2)))
    } else if(weaponStats.fire_rate_max > 0) {
        weapon_rof = Math.round(weaponStats.fire_rate * 60) +" - "+ Math.round(weaponStats.fire_rate_max * 60)
    } else {
        weapon_rof = Math.round(weaponStats.fire_rate * 60)
    }
    APEXWeaponData[key].WeaponData["effective_fire_rate"] = weapon_rof;
    var rtnStr = "<tr class='" + weaponStats.printname.replace(/ |\//g,"") + " sub_" + getWeaponsSubcat(weaponStats.printname) +"'>" +
        "<td class='apex_firstColumn'>" +
        "<div class='apex_lblWeaponName'>" +
        "<span class='apex_lblNameValue' title='"+weaponStats.custom_desc_long.toString().replace("\\u0027", "\"").replace("\\u0027", "\"")+"'>" + formatWeaponName(weaponStats.custom_name) + "</span>" +
        "</div>" +
        "<div>" +
        "<img class='apex_weaponImg' src='./pages/apex/icons/"+ weaponStats.hud_icon + ".png' alt='' onerror='showBlank(this);'>" +
        "</div>" +
        "<div style='line-height: 20px;'>" +
        "<span class='apex_lblMagText'>" +
        "<span class='apex_lblMag'>" + weaponStats.ammo_clip_size + "</span>" +
        //<span class='apex_lblSuffixText'> x <img src='./pages/apex/icons/ammo/${weaponStats.ammo_pool_type}.png' height="20" width="19" onerror='showBlank(this);'></span>
        "<span class='apex_lblSuffixText'> x" + "<img src='./pages/apex/icons/ammo/"+ weaponStats.ammo_pool_type +".png' alt='' height='20' width='19' onerror='showBlank(this);'>" + "</span>" +
        "</span>" +
        "<span class='apex_lblRPM'>" +
        "<span class='apex_lblRPMValue' " + apex_rpmTooltip + ">" + weapon_rof + "</span>" +
        "<span class='apex_lblSuffixText'> rpm</span>" +
        "</span>" +
        "</div>" +
        "</td>" +

        "<td class='secondColumn'>" +
        "<div class='apex_damageChartContainer' " + apex_damageTooltip + ">" + apex_createDamageChart(weaponStats.damage_array, weaponStats.damage_distance_array_m, weaponStats.projectiles_per_shot) + "</div>" +
        "</td>" +

        "<td>" +
        //"<div class='underMagSection'>" +
        "<td>" +
        "<div class='apex_reloadDataAndMagCount'>" + apex_createBulletSpeedGraphic(Math.round(weaponStats.projectile_launch_speed / 39.3701), weaponStats.projectile_drag_coefficient) + reloadData  + "</div>" +
        // "</td><td>" +
        // "<div class='recoilGraphicBox' " + apex_recoilTooltip + ">" + standRecoilData + "</div><div class='apex_deployTimeBox' " + deployTooltip + "> <br><span class='lblDeployTime'>" + weaponStats.deployfirst_time + "<span class='apex_lblSuffixText'> s</span><br><span class='lblDeployTime'>" + weaponStats.deployfirst_time + "<span class='apex_lblSuffixText'> s</span>  <img class='wpnSwitchImg' src='./pages/apex/icons/weapon_switch_small.png' alt='' onerror='showBlank(this);'>" + weaponStats.deploy_time + "<span class='apex_lblSuffixText'> s</span><br>"+ weaponStats.deploy_time + "<span class='apex_lblSuffixText'> s</span></span></div>" +
        // "</td><td>" +
        "</td><td>" +
        "<div class='apex_recoilGraphBox' " + apex_recoilTooltip + ">" + standRecoilData + "</div><div class='apex_deployTimeBox'" + apex_deployTooltip + "><br><span class='apex_lblDeployTime'>" + weaponStats.deployfirst_time + "<span class='apex_lblSuffixText'> s</span><img class='apex_wpnSwitchImg' src='./pages/apex/icons/weapon_switch_small.png' alt='' onerror='showBlank(this);'><span class='apex_lblDeployTime'>" + weaponStats.deploy_time + "<span class='apex_lblSuffixText'>s</span><br><br><br><span class='apex_lblDeployTime_2'>" + formatWeaponValue(weaponStats.raise_time) + "<span class='apex_lblSuffixText'> s</span></span></span><span class='apex_lblDeployTime_4'>" + weaponStats.holster_time + "<span class='apex_lblSuffixText'>s</span></span></span></div>" +
        "</td><td>" +
        // "<div>" +
        "<div class='apex_hipSpreadContainer' " + apex_hipfireTooltip + ">" + apex_createHipSpreadGraphic(weaponStats.spread_stand_hip_run, weaponStats.spread_air_hip, weaponStats.spread_air_ads, weaponStats.spread_stand_ads) + "</div>" +
        // "<div>" +
        // "<div class='apex_spreadLabels' " + apex_adsTooltip + ">" +
        // apex_createSpreadLabels(weaponStats.spread_air_ads, weaponStats.spread_stand_ads) +
        // "</div>" +
        // "<div class='apex_spreadCircles' " + apex_adsTooltip + ">" + apex_createSpreadGraphic(weaponStats.spread_stand_ads, weaponStats.spread_air_ads) + "</div>" +
        // "</div>" +
        // "</div>" +
        //  "</td><td>" +
        //  "<div class='apex_deployTimeBox' " + deployTooltip + "><span class='ui-icon ui-icon-transferthick-e-w'></span><br><span class='lblDeployTime'>" + weaponStats.DeployTime + "<span class='apex_lblSuffixText'> s</span></span></div>" +
        "</td><td>" +
        apex_spreadTableGraphic +
        "</td><td>" +
        // "<div class='custButtonsApex'>" +
        // "<img class='slot0' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'>" +
        // "<img class='slot1' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'>" +
        // "<img class='slot2' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'>" +
        // "<img class='slot3' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'>" +
        // "<img class='slot4' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'> </div>" +
        "<div class='apex_custButtonsApex'>" + attachmentGraphic + "</div>" +
        "</td><td>" +
        // "<div class='apex_afterCustButtons'>" +
        // // "<div>" +
        // // "<img class='apex_sortDragIcon' src='./pages/bfv/img/sortDrag.png' alt='' " + dragTooltip + ">" +
        // // "</div>" +
        // // "<div>" + addVariantGraphic + "</div>" +
        // "</div>" +
        //"</div>" +

        //"</div>" +
        //"<div class='magGraphicBox'>" + magCountGraphic + "</div>" +
        "</td>" +
        //"<div>DeployTime   : " + weaponStats.DeployTime + "</div>" +
        "</tr>";
    return rtnStr;
}

function apex_updateWeapon(selectedCustomizations, selectedCustButton){
    // const weaponmod = APEXWeaponData
    let weapondata;
    var modname;
    var mod;
    var print_name;
    for (var i = 0; i < APEXWeaponData.length; i++) {
        if (selectedCustomizations.includes(APEXWeaponData[i].WeaponData.printname)) {
            var modname = selectedCustomizations.replace(APEXWeaponData[i].WeaponData.printname, "");
            var mod = APEXWeaponData[i].WeaponData.Mods[modname];
            print_name = APEXWeaponData[i].WeaponData.printname;
            weapondata = APEXWeaponData[i].WeaponData
        }
    }
            // for (const [key, value] of Object.entries(mod)) {
            //     console.log(key, value);
            //     if(value.includes("*")){
            //         var multi = parseFloat(value.replace("*"));
            //         APEXWeaponData[i].WeaponData[key] = APEXWeaponData[i].WeaponData[key] * multi;
            //     } else {
            //         APEXWeaponData[i].WeaponData[key] = value
            //     }
    //             console.log("APEXWeaponData[i].WeaponData[key]", APEXWeaponData[i].WeaponData[key])
    //         }
    //     }
    //     // return APEXWeaponData[i].WeaponData;
    //
    // }
    const weaponStats = weapondata;
    // const weaponStats = APEXWeaponData.find(function(element){
    //     return element.WeaponData === selectedCustomizations;
    // });
    for (const [key, value] of Object.entries(mod)) {
        console.log(key, value);
        if (value.includes("*")) {
            var multi = value.replace("*", "");
            weaponStats[key] = (weaponStats[key] * multi).toFixed(3);
        } else {
            weaponStats[key] = value
        }
    }
    const weaponRow = $(selectedCustButton).parentsUntil("tbody", "tr");
    $(weaponRow).find(".lblRPMValue").text(weaponStats.burst_fire_delay);
    $(weaponRow).find(".lblSpeedValue").text(weaponStats.projectile_launch_speed);
    // const temp_dmg = [];
    // const temp_dmgDist = [];
    // temp_dmg[0] = weaponStats.damage_near_value;
    // temp_dmgDist[0] = weaponStats.damage_near_distance;
    $(weaponRow).find(".damageChartContainer").html(apex_createDamageChart(weaponStats.damage_array, weaponStats.damage_distance_array_m, weaponStats.projectiles_per_shot));
    //$(weaponRow).find(".magGraphicBox").html(createMagGraphic(weaponStats.ammo_clip_size,weaponStats.Mods.survival_finite_ammo.ammo_stockpile_max.includes("Incendiary")));
    $(weaponRow).find(".apex_reloadDataAndMagCount").html(apex_createReloadGraphic(weaponStats.reload_time, weaponStats.reloadempty_time, weaponStats.ammo_clip_size, weaponStats.Mods.survival_finite_ammo.ammo_stockpile_max));
    $(weaponRow).find(".recoilGraphicBox").html(apex_createRecoilGraphic(weaponStats.viewkick_yaw_base, weaponStats.viewkick_yaw_random, weaponStats.viewkick_pitch_base, weaponStats.viewkick_pitch_random));
    $(weaponRow).find(".spreadLabels").html(apex_createSpreadLabels(weaponStats.spread_air_ads, weaponStats.spread_stand_ads));
    $(weaponRow).find(".spreadCircles").html(apex_createSpreadGraphic(weaponStats.spread_stand_ads, weaponStats.spread_air_ads));
    $(weaponRow).find(".apex_hipSpreadContainer").html(apex_createHipSpreadGraphic(weaponStats.spread_stand_hip, weaponStats.spread_stand_hip_run, weaponStats.spread_air_ads, weaponStats.spread_stand_ads));

    $(weaponRow).find(".lblDeployTime").html(weaponStats.deploy_time + "<span class='apex_lblSuffixText'> s</span>");
// <span class='lblDeployTime'>" + weaponStats.DeployTime + "<span class='apex_lblSuffixText'> s</span></span></div>" +

    // "<span class='lblMag'>" + weaponStats.ammo_clip_size + "</span>" +
    $(weaponRow).find(".lblMag").text(weaponStats.ammo_clip_size);


}

function barrel_over(x){
    // var ab = document.getElementsByClassName('attachment_box');
    var ab = document.getElementById('imgIconId');
    //    deg = rotated ? 0 : 66;
    ab.style.opacity = 100;
    ab.style.visibility = "visible";
    ab.style.position = "absolute";
    ab.style.left = x.x + 'px';
    ab.style.top = x.y + 'px';
    // ab.style.visible = x.x;
    // ab.positionY = x.y;
    console.log("over ", x.x, x.y)

}

function barrel_out(x) {
    var ab = document.getElementById('imgIconId');
    ab.style.visibility = "hidden";
    console.log("out ", x.id)
}

function apex_printAttachments(weaponName, weapon_ammo) {
    var custString = "";
    // var custStringa = "";
    var custString0 = "";
    var custString1 = "";
    var custString2 = "";
    var custString3 = "";
    var custString4 = "";
    var slot0 = 0;
    var slot1 = 0;
    var slot2 = 0;
    var slot3 = 0;
    var slot4 = 0;
    var variantNum = (addVariantCounter === 0) ? "" : addVariantCounter;
    custString += "<aa>";

    // custString0a += "<ab><img class='attachment_box' src='./pages/apex/icons/attachment_box.png' alt='' onerror='showBlank(this);'></ab>";

    for (var i = 0; i < optic_customizations[weaponName].length; i++) {
        if (optic_customizations[weaponName][i].attachName[0] !== undefined) {
            if(slot2 < 1) {
                if (optic_customizations[weaponName][i].attachName[0].includes("optic")) {
                    slot2 += 1;
                    custString2 += "<ao><img id='"+weaponName+"slot2' src='./pages/apex/icons/slots/optic_slot.png' alt='' onerror='showBlank(this);'></ao>";
                }
            }
        }

    }
    for (var i = 0; i < customizations[weaponName].length; i++) {
        if (customizations[weaponName][i].attachName[0] !== undefined) {
            if(slot0 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("barrel")) {
                    slot0 += 1;
                    custString0 += "<ab><img id='"+weaponName+"_slot0' onmouseover='barrel_over(this)' onmouseout='barrel_out(this)' src='./pages/apex/icons/slots/barrel_slot.png' alt='' onerror='showBlank(this);'></ab>";
                }
                if (customizations[weaponName][i].attachName[0].includes("bolt")) {
                    slot0 += 1;
                    custString0 += "<asb><img id='"+weaponName+"_slot0' src='./pages/apex/icons/slots/shotgun_slot.png' alt='' onerror='showBlank(this);'></asb>";
                }
            }
            if(slot1 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("mag")) {
                    slot1 += 1;
                    custString1 += "<am><img id='"+weaponName+"_slot1' src='./pages/apex/icons/slots/"+weapon_ammo+"_slot.png' alt='' onerror='showBlank(this);'></am>";
                }
            }
            if(slot2 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("optic")) {
                    slot2 += 1;
                    custString2 += "<ao><img id='"+weaponName+"_slot2' src='./pages/apex/icons/slots/optic_slot.png' alt='' onerror='showBlank(this);'></ao>";
                }
            }
            if(slot3 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("stock_tactical")) {
                    slot3 += 1;
                    custString3 += "<ats><img id='"+weaponName+"_slot3' src='./pages/apex/icons/slots/tactical_stock_slot.png' alt='' onerror='showBlank(this);'></ats>";
                }
                if (customizations[weaponName][i].attachName[0].includes("stock_sniper")) {
                    slot3 += 1;
                    custString3 += "<ass><img id='"+weaponName+"_slot3' src='./pages/apex/icons/slots/stock_sniper_slot.png' alt='' onerror='showBlank(this);'></ass>";
                }
            }
            if(slot4 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("hopup")) {
                    slot4 += 1;
                    custString4 += "<ah><img id='"+weaponName+"_slot4' src='./pages/apex/icons/slots/hopup_headshot_dmg_slot.png' alt='' onerror='showBlank(this);'></ah>";
                }
            }

        }

    }
    if(slot0 === 0)
        custString0 += "<img id='"+weaponName+"_slot0' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'>";
    if(slot1 === 0)
        custString1 += "<img id='"+weaponName+"_slot1' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'>";
    if(slot2 === 0)
        custString2 += "<img id='"+weaponName+"_slot2' src='./pages/apex/icons/slots/optic_slot.png' alt='' onerror='showBlank(this);'>";
    if(slot3 === 0)
        custString3 += "<img id='"+weaponName+"_slot3' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'>";
    if(slot4 === 0)
        custString4 += "<img id='"+weaponName+"_slot4' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt='' onerror='showBlank(this);'>";

    // custString += custString0a;
    custString += custString0;
    custString += custString1;
    custString += custString2;
    custString += custString3;
    custString += custString4;
    custString += "</aa>";
    return custString;
}

function apex_printCustomizations(weaponName) {
    var custString = "";
    var custStringWhite = "";
    var custStringBlue = "";
    var custStringPurple = "";
    var custStringGold = "";
    var custStringHopup = "";
    custStringWhite += "<div>";
    custStringBlue += "<div>";
    custStringPurple += "<div>";
    custStringGold += "<div>";
    custStringHopup += "<div>";
    var variantNum = (addVariantCounter === 0) ? "" : addVariantCounter;

    for (var i = 0; i < customizations[weaponName].length; i++) {
        var rowClass = "custRow" + i.toString();
        // custString += "<div>";
        if (customizations[weaponName][i].attachName[0] !== undefined) {
            // if(customizations[weaponName][i].attachName[0].includes("barrel") || customizations[weaponName][i].attachName[0].includes("bolt") )
            if (customizations[weaponName][i].attachName[0].includes("_l1")) {
                // Barrel
                custStringWhite += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol1'><label data-shortname='" + customizations[weaponName][i].attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].attachName] + "</label>";
            }
            if (customizations[weaponName][i].attachName[0].includes("_l2")) {
                // Mag // Bolt
                custStringBlue += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol2'><label data-shortname='" + customizations[weaponName][i].attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].attachName] + "</label>";
            }
            // if(customizations[weaponName][i].attachName[0].includes("optic")){
            //     // Optic
            //     custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol3'><label data-shortname='" + customizations[weaponName][i].attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].attachName] + "</label>";
            // }
            if (customizations[weaponName][i].attachName[0].includes("_l3")) {
                // Stock
                custStringPurple += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol3'><label data-shortname='" + customizations[weaponName][i].attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].attachName] + "</label>";
            }
            if (customizations[weaponName][i].attachName[0].includes("_l4")) {
                // t4
                custStringGold += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol4'><label data-shortname='" + customizations[weaponName][i].attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].attachName] + "</label>";
            }
            if (customizations[weaponName][i].attachName[0].includes("hopup")) {
                // Hopup
                custStringHopup += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol5'><label data-shortname='" + customizations[weaponName][i].attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].attachName + i.toString() + "'>" + customizationHopupStrings[customizations[weaponName][i].attachName] + "</label>";
            }
        }
        // custString += "</div>"
    }
    custStringWhite += "</div>"
    custStringBlue += "</div>"
    custStringPurple += "</div>"
    custStringGold += "</div>"
    custStringHopup += "</div>"
    custString += "<div>";
    custString += custStringWhite;
    custString += custStringBlue;
    custString += custStringPurple;
    custString += custStringGold;
    custString += custStringHopup;
    custString += "</div>"
    return custString;
}
        // if(customizations[weaponName][i].a.attachName !== undefined) {
        //     // if(customizations[weaponName][i].a.attachName[0].includes("barrel") || customizations[weaponName][i].a.attachName[0].includes("bolt") )
        //     if (customizations[weaponName][i].a.attachName[0].includes("barrel")) {
        //         // Barrel
        //         custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol1'><label data-shortname='" + customizations[weaponName][i].a.attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].a.attachName] + "</label>";
        //     }
        //     if (customizations[weaponName][i].b.attachName[0].includes("mag") || customizations[weaponName][i].b.attachName[0].includes("bolt")) {
        //         // Mag // Bolt
        //         custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].b.attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol2'><label data-shortname='" + customizations[weaponName][i].b.attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].b.attachName] + "</label>";
        //     }
        //     // if(customizations[weaponName][i].a.attachName[0].includes("optic")){
        //     //     // Optic
        //     //     custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol3'><label data-shortname='" + customizations[weaponName][i].a.attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].a.attachName] + "</label>";
        //     // }
        //     if (customizations[weaponName][i].a.attachName[0].includes("stock")) {
        //         // Stock
        //         custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol4'><label data-shortname='" + customizations[weaponName][i].a.attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].a.attachName] + "</label>";
        //     }
        //     if (customizations[weaponName][i].a.attachName[0].includes("hopup")) {
        //         // Hopup
        //         custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol5'><label data-shortname='" + customizations[weaponName][i].a.attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "'>" + customizationHopupStrings[customizations[weaponName][i].a.attachName] + "</label>";
        //     }
        // } else {
        //     custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol1'><label data-shortname='" + customizations[weaponName][i].a.attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].a.attachName] + "</label>";
        //     custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].b.attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol2'><label data-shortname='" + customizations[weaponName][i].b.attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].b.attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].b.attachName] + "</label>";
        //     custString += "<input id='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol1'><label data-shortname='" + customizations[weaponName][i].a.attachName + "' for='" + addVariantCounter + weaponName + customizations[weaponName][i].a.attachName + i.toString() + "'>" + customizationAttachmentStrings[customizations[weaponName][i].a.attachName] + "</label>";
        // }
    //     custString += "</div>"
    // }

    // return custString;
// }

function apex_createBulletSpeedGraphic(initialSpeed, drag){
    return `<div class='apex_bulletSpeedContainer'><span class='apex_pr-3 lblSpeed' ${apex_bulletSpeedTooltip}><img src='./pages/bfv/img/speed.png' alt=''><span class='apex_lblSpeedValue'>${initialSpeed}</span><span class='apex_lblSuffixText'> m/s</span><br><span class='ui-icon ui-icon-arrowthick-1-w'></span><span class='apex_lblDragCoe' ${apex_bulletSpeedTooltip}>${drag.toString().substring(1)}</span></span></div>`
}

function apex_createReloadGraphic(reloadEmpty, reloadLeft, magSize, ammoType){
    var reloadData = "<div>" +
                         "<div class='apex_sectionReload' " + apex_reloadTooltip + ">";
    if (reloadEmpty !== "N/A"){
        if(reloadEmpty === reloadLeft){
            //reloadData = "<div class='lblReloadLeft'>" + reloadLeft +"<span class='apex_lblSuffixText'> s</span></div>";

            reloadData += `<div class='apex_lblReloadLeft'><img src='./pages/bfv/img/reload.png' alt='' class='apex_imgReload'><span>${reloadLeft}</span><span class='apex_lblSuffixText'> s</span></div></div>`;
        } else {
            reloadData += `<div class='apex_lblReloadLeft'><img src='./pages/bfv/img/reload.png' alt='' class='apex_imgReload'><span>${reloadLeft}</span><span class='apex_lblSuffixText'> s</span></div><div class='apex_lblReloadEmpty'>${reloadEmpty}<span class='apex_lblSuffixText'> s</span></div></div>`;
        }
    } else {
        reloadData += "</div " + apex_magTooltip + ">";
    }
    return reloadData +  "</div>";
}

function apex_formatAmmoType(ammo){
    return ammo.replace("special", "energy").replace("bullet", "light").replace("highcal", "heavy").replace("shotgun", "shotgun");
}

function formatWeaponName(wpnName){
    let newWpnName = wpnName.replace("#", "");
    // let newWpnName = wpnName.replace("#WPN_", "").replace("_", " ");
    // newWpnName = newWpnName.replace("ENERGY AR", "HAVOK").replace("RSPN101", "R-301");
    // newWpnName = newWpnName.replace("VINSON", "FLATLINE").replace("PDW", "PROWLER");
    // newWpnName = newWpnName.replace("ENERGY SHOTGUN", "PEACEKEEPER").replace("SHOTGUN PISTOL", "MOZAMBIQUE");
    // newWpnName = newWpnName.replace("R97", "R-99").replace("SHOTGUN", "EVA-8");
    // newWpnName = newWpnName.replace("LMG", "M600 SPITFIRE").replace("ESAW", "DEVOTION");
    // newWpnName = newWpnName.replace("Rifle", "").replace("LSTAR", "L-STAR");
    // newWpnName = newWpnName.replace("DMR", "LONGBOW").replace("G2", "G7 SCOUT");
    // newWpnName = newWpnName.replace("SNIPER", "KRABER").replace("RE45 AUTOPISTOL", "RE-45");
    // newWpnName = newWpnName.replace("P2011", "P2020");
    return newWpnName;
}

function formatWeaponValue(wpn_value){
    let new_wpn_value = 0.0;
    if(wpn_value === undefined || wpn_value === NaN) {
        wpn_value = "X";
    }
    return wpn_value
}

function apex_createRecoilGraphic(recoilYawBase, recoilYawRandom, recoilPitchBase, recoilPitchRandom){

    if (recoilPitchRandom <= 2){
        var recoilUpLength = (90 - (recoilPitchRandom * 30));
        var recoilUpTextY = (71 - (recoilPitchRandom * 30));
        var recoilInitUpTextY = (86 - (recoilPitchRandom * 30));
        var recoilHorLenth1 = (60 - (recoilYawBase * 30));
        var recoilHorLenth2 = (60 + (Math.abs(recoilYawRandom) * 30));
        var point5inc = (recoilPitchRandom > .5) ? "<line x1='55' y1='75' x2='65' y2='75' style='stroke:white; stroke-width:1'/>" : "";
        var oneinc = (recoilPitchRandom > 1.0) ? "<line x1='55' y1='60' x2='65' y2='60' style='stroke:white; stroke-width:1'/>" : "";
        var onepoint5inc = (recoilPitchRandom > 1.5) ? "<line x1='55' y1='45' x2='65' y2='45' style='stroke:white; stroke-width:1'/>" : "";

        var recoilGraphic = "<svg viewbox='0 0 120 100' style='width: 100px;'>" +
                                point5inc + oneinc + onepoint5inc +
                                "<line x1='" + recoilHorLenth1 + "' y1='90' x2='" + recoilHorLenth2 + "' y2='90' style='stroke:white; stroke-width:2'/>" + // Left - Right
                                "<line x1='60' y1='90' x2='60' y2='" + recoilUpLength + "' style='stroke:white; stroke-width:2'/>" + // Up - Down
                                "<text x='" + (recoilHorLenth1 - 4).toString() + "' y='95' text-anchor='end' class='recoilValue'>" + recoilYawBase + "°</text>" +
                                "<text x='" + (recoilHorLenth2 + 4).toString() + "' y='95' class='recoilValue'>" + Math.abs(recoilYawRandom) + "°</text>" +
                                "<text x='64' y='" + recoilUpTextY + "' text-anchor='start' class='recoilValue'>" + (recoilPitchBase >= 0 ? "+": "") + recoilPitchBase + "°</text>" +
                                "<text x='60' y='" + recoilInitUpTextY + "' text-anchor='middle' class='recoilValue'>" + recoilPitchRandom + "°</text>" +
                            "</svg>";
    } else {
        var recoilGraphic = "<svg viewbox='0 0 120 100' style='width: 100px;'>" +
                                "<line x1='50' y1='90' x2='70' y2='90' style='stroke:#555; stroke-width:2'/>" +
                                "<line x1='60' y1='90' x2='60' y2='80' style='stroke:#555; stroke-width:2'/>" +
                                "<text x='44' y='95' text-anchor='end' class='recoilValue'>" + recoilYawBase + "°</text>" +
                                "<text x='74' y='95' class='recoilValue'>" + Math.abs(recoilYawRandom) + "°</text>" +
                                "<text x='64' y='64' text-anchor='start' class='recoilValue'>" + (recoilPitchBase >= 0 ? "+": "") + recoilPitchBase + "°</text>" +
                                "<text x='60' y='76' text-anchor='middle' class='recoilValue'>" + recoilPitchRandom + "°</text>" +
                            "</svg>";
    }
    return recoilGraphic;
}

function apex_createSpreadLabels(adsSpreadAir, adsSpreadBase){
    var rtnStr = "";
    if (adsSpreadAir > 0){
        rtnStr = "<div class='speadMoveLabel'>" + adsSpreadAir + "°</div>" +
                 "<div class='speadBaseLabel'>" + adsSpreadBase + "°</div>";
    }
    return rtnStr;
}

function apex_createSpreadGraphic(spread_stand_ads, ADSSpreadAir){
    var spreadGraphic = "";
    if (spread_stand_ads < 10.0 && ADSSpreadAir !== 0){//.4
        var adsBaseCircle = "";
        if(spread_stand_ads >= -1){ //0.05
            adsBaseCircle = "<circle cx='0' cy='100' r='" + ((spread_stand_ads * 200) / 10).toString() + "' class='spreadBaseCicle'></circle>";
        } else {
            adsBaseCircle = "<circle cx='0' cy='100' r='4' stroke-width='2' style='stroke: #C8C63A; fill: #C8C63A;'></circle>";
        }

        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 60px;'>" +
                        "<circle cx='0' cy='100' r='" + ((ADSSpreadAir * 200) / 10).toString() + "' class='spreadMoveCicle'></circle>" +
	                    adsBaseCircle +
                        "</svg>";
    } else if (ADSSpreadAir !== 0){
        var standLineOffset = spread_stand_ads;
        // var standLineOffset = spread_stand_ads * 2;
        var moveLineOffset = ADSSpreadAir;
        // var moveLineOffset = ADSSpreadAir * 2;
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 60px;'>" +

                        "<line x1='50' y1='" + (standLineOffset + 52) + "' x2='50' y2='" + (standLineOffset + 126) + "' class='spreadBaseLine'></line>" +
                        "<line x1='50' y1='" + (48 - standLineOffset) + "' x2='50' y2='" + (72 - standLineOffset) + "' class='spreadBaseLine'></line>" +

                        "<line y1='50' x1='" + (standLineOffset + 52) + "' y2='50' x2='" + (standLineOffset + 126) + "' class='spreadBaseLine'></line>" +
                        "<line y1='50' x1='" + (48 - standLineOffset) + "' y2='50' x2='" + (72 - standLineOffset) + "' class='spreadBaseLine'></line>" +

                        "</svg>";
    }
    return spreadGraphic;
}

function apex_createHipSpreadGraphic(HIPSpread, spreadStandHipRun, spread_air_ads, spread_stand_ads){
    var lineOffset = HIPSpread * 4;
    var spreadGraphic = "";
    // if (spread_air_ads >= 10.0){
    //     var AirSpread = (9 * 4) + 1.5;
    // } else {
    //     var AirSpread = (spread_air_ads * 4)+1.5;
    // }
    var AirSpread = (spread_air_ads * 4)+1.5;
    if (spread_stand_ads <= 0.00) {
        var StandADS = 0.001 ;
    } else {
        var StandADS = (spread_stand_ads * 4)+1.5;
    }
    // var StandADS = (spread_stand_ads * 5.333333);

    if (HIPSpread > 0) {
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 75px;'>" +

            "<circle cx='50' cy='50' r='" + (StandADS).toString() + "' class='apex_hipSpreadLine1'></circle>" +
            "<circle cx='50' cy='50' r='" + (AirSpread).toString() + "' class='apex_hipSpreadLine2'></circle>" +
            "<line x1='50' y1='" + (lineOffset + 50) + "' x2='50' y2='" + (lineOffset + 65) + "' class='apex_hipSpreadLine01'></line>" +
            "<line x1='50' y1='" + (50 - lineOffset) + "' x2='50' y2='" + (35 - lineOffset) + "' class='apex_hipSpreadLine01'></line>" +

            "<line y1='50' x1='" + (lineOffset + 50) + "' y2='50' x2='" + (lineOffset + 65) + "' class='apex_hipSpreadLine01'></line>" +
            "<line y1='50' x1='" + (50 - lineOffset) + "' y2='50' x2='" + (35 - lineOffset) + "' class='apex_hipSpreadLine01'></line>" +

            // "<text x='5' y='91' class='hipSpreadValue'>" + HIPSpread + "°" + spread_stand_ads + "°" + spread_air_ads + "°</text>" +
            "<text x='0' y='100' class='apex_hipSpreadValue'>" + spread_stand_ads + "°|" + HIPSpread + "°|" + spread_air_ads + "°</text>" +
            "</svg>";
    } else {
        spreadGraphic = "<svg viewBox='0 0 100 100' style='width: 75px;'>" +
                        "<circle cx='50' cy='50' r='" + (spreadStandHipRun * 10).toString() + "' class='apex_hipSpreadLine'></circle>" +
                        "<text x='5' y='23' class='apex_hipSpreadValue'>" + spreadStandHipRun + "°</text>" +
                        "</svg>";
    }
    return spreadGraphic;
}

function apex_createSpreadTableGraphic(spread_stand_ads, spread_crouch_ads, spread_air_ads, ADSStandMove, ADSCrouchMove, ADSProneMove,
                                  spread_stand_hip, spread_crouch_hip, spread_air_hip, HIPStandMove, spread_stand_hip_run, spread_stand_hip_sprint,
                                  ADSIncrease, spread_moving_increase_rate){
    return "<table class='apex_spreadTable'>" +
        "<tr>" + "<td></td><td>ADS</td><td>HIP</td>" + "</tr>" +
        "<tr>" + "<td rowspan='3'><img src='./img/standing.png' alt=''></td><td>" + roundToTwo(spread_stand_ads) + "</td><td>" + roundToTwo(spread_stand_hip) + "</td>" + //<td rowspan='3'>" + ADSIncrease + "</td>" + "</tr>" +
        "<tr>" + "<td>" + roundToTwo(spread_crouch_ads) + "</td><td>" + roundToTwo(spread_crouch_hip) + "</td>" + "</tr>" +
        "<tr>" + "<td>" + roundToTwo(spread_air_ads) + "</td><td>" + roundToTwo(spread_air_hip) + "</td>" + "</tr>" +
        "<tr>" + "<td rowspan='3'><img src='./img/moving.png' alt=''></td><td>" + roundToTwo(HIPStandMove) + "</td>" +
        // "<tr>" + "<td rowspan='3'><img src='./img/moving.png' alt=''></td><td>" + roundToTwo(HIPStandMove) + "</td>" + //<td rowspan='3'>" + spread_moving_increase_rate + "</td>" + "</tr>" +
        "<tr>" + "<td>" + roundToTwo(spread_stand_hip_run) + "</td>" + "</tr>" +
        "<tr>" + "<td>" + roundToTwo(spread_stand_hip_sprint) + "</td>" + "</tr>" +

        "<tr>" + "<td class='scaleIncreaseCell'><img src='./img/increase.png' alt=''></td><td>" + roundToTwo(ADSIncrease) + "</td><td>" + roundToTwo(spread_moving_increase_rate) + "</td>" + "</tr>" +

        "</table>";
}


function formatDamagesOrDistances(dmgArray) {
    var dmgStr = "";
    for (var i = 0; i < dmgArray.length; i++){
        dmgStr += dmgArray[i].toFixed(1).toString() + " - ";
    }
    return dmgStr;
}

function apex_createDamageChart(damageArr, distanceArr, numOfPellets){
    var damageChart;
    if(damageArr[0] > 100) {
        damageChart = apex_createDamageChart200Max200Dist(damageArr, distanceArr);
    } else {
        if (damageArr[0] > 50 ){
            if(distanceArr.indexOf(200) === -1){
                damageChart = apex_createDamageChart100Max(damageArr, distanceArr);
            } else {
                damageChart = apex_createDamageChart100Max200Dist(damageArr, distanceArr);
            }
        } else {
            damageChart = apex_createDamageChart50Max(damageArr, distanceArr, numOfPellets)
        }
    }
    return damageChart;
}

function apex_createDamageChart50Max(damageArr, distanceArr, numOfPellets){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (100 - (2 * damageArr[0])) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 100 - (2 * damageArr[i]);
        var distanceCoord = 2 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (100 - (2 * damageArr[damageArr.length - 1])).toString();

    var maxDamage = Math.round(damageArr[0]);
    var minDamage = Math.round(damageArr[damageArr.length - 1]);

    var maxDamageText = "";
    if(damageArr[0] > 40){
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (118 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (96 - (2 * maxDamage)).toString() + "' class='chartMinMaxLabel'>" + maxDamage + "</text>";
    }

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (2 * minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='183' y='" + (96 - (2 * minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
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

function apex_createDamageChart100Max(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (100 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 100 - damageArr[i];
        var distanceCoord = 2 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (100 - damageArr[damageArr.length - 1]).toString();

    var maxDamage = Math.round(damageArr[0]);
    var minDamage = Math.round(damageArr[damageArr.length - 1]);

    var maxDamageText = "";
    if(damageArr[0] > 80){
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (118 - (maxDamage)).toString() + "' class='chartMinMaxLabel'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (96 - (maxDamage)).toString() + "' class='chartMinMaxLabel'>" + maxDamage + "</text>";
    }

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='183' y='" + (96 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
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

function apex_createDamageChart100Max200Dist(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (100 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 100 - damageArr[i];
        var distanceCoord = 2 * distanceArr[i]/2;
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (100 - damageArr[damageArr.length - 1]).toString();

    var maxDamage = Math.round(damageArr[0]);
    var minDamage = Math.round(damageArr[damageArr.length - 1]);

    var maxDamageText = "";
    if(damageArr[0] > 80){
        if(damageArr[0] > 100){
            maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (122 - (maxDamage)).toString() + "' class='chartMinMaxLabel'>" + maxDamage + "</text>";
        } else {
            maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (118 - (maxDamage)).toString() + "' class='chartMinMaxLabel'>" + maxDamage + "</text>";
        }
    } else {
        maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (96 - (maxDamage)).toString() + "' class='chartMinMaxLabel'>" + maxDamage + "</text>";
    }

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='183' y='" + (96 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
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

function apex_createDamageChart200Max200Dist(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] == 0.0 ? "" : "0," + (100 -  damageArr[0]) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = 170 - damageArr[i];
        var distanceCoord = (2 * distanceArr[i]/2) - 150;
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (100 - damageArr[damageArr.length - 1]).toString();

    var maxDamage = Math.round(damageArr[0]);
    var minDamage = Math.round(damageArr[damageArr.length - 1]);

    var maxDamageText = "";
    maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (96 - (maxDamage)).toString() + "' class='chartMinMaxLabel'>" + maxDamage + "</text>";
    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='25' y='" + (170 - (minDamage)).toString() + "' class='chartMinMaxLabel'>" + minDamage + "</text>";
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

function showHideStats(){
    if ($("#showROFCheck").is(":checked")){
        $(".lblRPM").css("visibility","unset");
    } else {
        $(".lblRPM").css("visibility","hidden");
    }
    if ($("#showSpeedCheck").is(":checked")){
        $(".lblSpeed").css("visibility","unset");
    } else {
        $(".lblSpeed").css("visibility","hidden");
    }
    if ($("#showDamageCheck").is(":checked")){
        $(".damageChartContainer").css("visibility","unset");
    } else {
        $(".damageChartContainer").css("visibility","hidden");
    }
    if ($("#showReloadCheck").is(":checked")){
        $(".sectionReload").css("visibility","unset");
    } else {
        $(".sectionReload").css("visibility","hidden");
    }
    if ($("#showAmmoCheck").is(":checked")){
        $(".lblMagText").css("visibility","unset");
    } else {
        $(".lblMagText").css("visibility","hidden");
    }
    if ($("#showAmmoGrahicCheck").is(":checked")){
        $(".magGraphicBox").css("visibility","unset");
    } else {
        $(".magGraphicBox").css("visibility","hidden");
    }
    if ($("#showRecoilCheck").is(":checked")){
        $(".recoilGraphicBox").css("visibility","unset");
    } else {
        $(".recoilGraphicBox").css("visibility","hidden");
    }
    if ($("#showSpreadCheck").is(":checked")){
        $(".spreadLabels").css("visibility","unset");
        $(".spreadCircles").css("visibility","unset");
    } else {
        $(".spreadLabels").css("visibility","hidden");
        $(".spreadCircles").css("visibility","hidden");
    }
    if ($("#showHipSpreadCheck").is(":checked")){
        $(".hipSpreadContainer").css("visibility","unset");
    } else {
        $(".hipSpreadContainer").css("visibility","hidden");
    }
    if ($("#showDeployCheck").is(":checked")){
        $(".apex_deployTimeBox").css("visibility","unset");
    } else {
        $(".apex_deployTimeBox").css("visibility","hidden");
    }
    if ($("#showToolsCheck").is(":checked")){
        $(".custButtons").css("visibility","unset");
        $(".afterCustButtons").css("visibility","unset");
    } else {
        $(".custButtons").css("visibility","hidden");
        $(".afterCustButtons").css("visibility","hidden");
    }
}

var weaponSubCats = new Object();

weaponSubCats._HAVOK = "AR";
weaponSubCats.ENERGY_AR = "AR";
weaponSubCats.WPN_ENERGY_AR = "AR";
// weaponSubCats.#WPN_ENERGY_AR = "AR";
weaponSubCats._DEVOTION = "LMG";
weaponSubCats._CHARGERIFLE = "SNIPER";
weaponSubCats._DOUBLETAKE = "SNIPER";
weaponSubCats._WINGMAN = "PISTOL";
weaponSubCats._LONGBOW = "SNIPER";
weaponSubCats._M600SPITFIRE = "LMG";
weaponSubCats._PROWLER = "SMG";
weaponSubCats._FLATLINE = "AR";
weaponSubCats._HEMLOK = "AR";
weaponSubCats._R99 = "SMG";
weaponSubCats._P2020 = "PISTOL";
weaponSubCats._RE45 = "PISTOL";
weaponSubCats._G7SCOUT = "SNIPER";
weaponSubCats._R301 = "AR";
weaponSubCats._ALTERNATOR = "SMG";
weaponSubCats._MOZAMBIQUE = "SHOTGUN";
weaponSubCats._EVA8 = "SHOTGUN";
weaponSubCats._PEACEKEEPER = "SHOTGUN";
weaponSubCats._KRABER = "SNIPER";
weaponSubCats._LSTAR = "LMG";
weaponSubCats._MASTIFF = "SHOTGUN";


function cleanUpStuff(){
    var speacialRow = $("span:contains('Karabin')").parentsUntil("tbody", "tr");
    //$(speacialRow).find(".recoilGraphicBox").css("visibility","hidden");
    //$(speacialRow).find(".recoilGraphicBox > svg").empty();
    $(speacialRow).find(".variantButton").remove();
    $(speacialRow).find(".custButtons").empty().html("<div class='tbdBox'>Soon</div>");

}