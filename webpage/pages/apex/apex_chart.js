

// http://eaassets-a.akamaihd.net/dice-commerce/Casablanca/Update_Notes/20190321-01/Apex_V_Chapter_3_Trial_By_Fire_Update_21032019_FINAL.pdf
let oHandler0;
let oHandler1;// this will be assign in on ready below
let oHandler2;
let oHandler3;
let oHandler4;
let oHandler5;
let apex_weaponClassTitles = ["AssaultRifle","SMG","Shotgun","LMG","Sniper","Special","Pistol"];
var customizations = {};
let active_weapon_attachments = {};
const optic_customizations = {};
var addVariantCounter = 0;

// TODO: MOAR Tooltips
// const apex_weapon_tooltip = "title = ";
const apex_rpmTooltip = "title = 'Rounds/Minute'";
const apex_burstTooltip = "title = 'Rounds Per Burst'";
const apex_chargeTooltip = "title = 'Charge: Up Time - Cooldown Delay - Cooldown Time'";
const apex_chargeUpTooltip = "title = 'Charge Up Time'";
const apex_chargeCooldownDelayTooltip = "title = 'Charge Cooldown Delay'";
const apex_chargeCooldownTimeTooltip = "title = 'Charge Cooldown Time'";
const apex_chargeSpinUpTooltip = "title = 'Charge Spin Up Time'";
const apex_chargeSpinUpCooldownTooltip = "title = 'Charge Spin Up Cooldown Time'";
const apex_bulletSpeedTooltip = "title = 'Bullet Speed and Drag Coefficient'";
const apex_damageTooltip = "title = 'Leg/Normal/Headshot Damage'";
const apex_damageModsHSTooltip = "title = 'Headshot Multi - Max Headshot Distance'";
const apex_damageModsLSTooltip = "title = 'Limb Shot Multi'";
const apex_magTooltip = "title = 'Ammo Capacity'";
const apex_reloadTooltip = "title = 'Reload Time (Tactical/Empty)'";
const apex_VrecoilTooltip = "title = 'Avg Vertical Recoil'";
const apex_avgRecoilVariationTooltip = "title = 'Avg Recoil Variation'";
const apex_HrecoilTooltip = "title = 'Min / Max Horz Recoil'";
const apex_AvgHrecoilTooltip = "title = 'Avg Horz Recoil'";
const apex_adsTooltip = "title = 'ADS Movement Multi - FOV - Zoom in/out Time'";
const apex_ads_move_fov_Tooltip = "title = 'ADS Movement Multi | ADS FOV'";
const apex_ads_zoom_Tooltip = "title = 'ADS Zoom In/Out Time'";
const apex_hipfireTooltip = "title = 'Standing ADS - Hipfire - Air Spread'";
const apex_deployTooltip = "title = '1st Deploy - Deploy Time - Raise Time - Holster Time'";
const apex_deploy_1st_Tooltip = "title = '1st Deploy Time'";
const apex_deploy_Deploy_Tooltip = "title = 'Deploy Time'";
const apex_deploy_Raise_Tooltip = "title = 'Raise Time'";
const apex_deploy_Holster_Tooltip = "title = 'Holster Time'";
const apex_variantTooltip = "title = 'Add Variant'";
const apex_bulletSpeed01Tooltip = "title = 'ADS/HIP Stand Spread'";
const apex_bulletSpeed02Tooltip = "title = 'Run Hip Spread'";
const apex_bulletSpeed03Tooltip = "title = 'Sprint Hip Spread'";
const apex_bulletSpeed04Tooltip = "title = 'ADS/HIP Crouch Spread'";
const apex_bulletSpeed05Tooltip = "title = 'ADS/HIP Air Spread'";
const apex_bulletSpeed06Tooltip = "title = 'ADS/HIP Stand Spread Increase on Fire'";
const apex_bulletSpeed07Tooltip = "title = 'ADS/HIP Crouch Spread Increase on Fire'";
const apex_bulletSpeed08Tooltip = "title = 'ADS/HIP Air Spread Increase on Fire'";
const apex_bulletSpeed09Tooltip = "title = 'Spread Decrease Delay - Rate'";
const apex_bulletSpeed10Tooltip = "title = 'Moving Spread Increase/Decrease Rate'";


function apex_initializeChartPage() {
    active_weapon_attachments = {};
    // Create attachments array for each main weapon
    $.each(APEXWeaponData, function(key, weapon) {
        let i;
        let attachment_list = [];
        let optic_list = [];
        for (const [key] of Object.entries( weapon['WeaponData']['Mods'])) {
            if(customizationHopupStrings[key] !== undefined) {
                attachment_list.push(key);
            }
            if(customizationAttachmentStrings[key] !== undefined) {
                attachment_list.push(key);
            }
            if(customizationOpticStrings[key] !== undefined) {
                optic_list.push(key);
            }
        }
         weapon['WeaponData']["attachment_list"] = attachment_list;
         weapon['WeaponData']["optic_list"] = optic_list;
        var formatted_name = formatWeaponName( weapon['WeaponData']['printname']);
         weapon['WeaponData']['printname'] = formatted_name.replace(" -", "");
        if(customizations[formatted_name] === undefined){
            customizations[formatted_name] = [];
        }
        for (i = 0; i <  weapon['WeaponData']["attachment_list"].length; i++) {
            if( weapon['WeaponData']['Mods'][ weapon['WeaponData']["attachment_list"][i]] !== undefined) {

                customizations[formatted_name][i] =  weapon['WeaponData']['Mods'][ weapon['WeaponData']["attachment_list"][i]];
                customizations[formatted_name][i].attachName = [ weapon['WeaponData']["attachment_list"][i]];
            }
        }
        if(optic_customizations[formatted_name] === undefined){
            optic_customizations[formatted_name] = [];
        }
        for (i = 0; i <  weapon['WeaponData']["optic_list"].length; i++) {
            if( weapon['WeaponData']['Mods'][ weapon['WeaponData']["optic_list"][i]] !== undefined) {

                optic_customizations[formatted_name][i] =  weapon['WeaponData']['Mods'][ weapon['WeaponData']["optic_list"][i]];
                optic_customizations[formatted_name][i].attachName = [ weapon['WeaponData']["optic_list"][i]];
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

    $("#apex_showHideStats input").checkboxradio(
        {icon: false}
    );
    $("#apex_showHideStats input").change(function(){
        this.blur();
        apex_showHideStats();
    });

    $("#apex_showHideSubCats input").checkboxradio(
        {icon: false}
    );
    $("#apex_showHideSubCats input").change(function(){
        this.blur();
        apex_showHideSubCats();
    });

    $("#shortcutCombobox").combobox({
        select: function (event, ui) {
            $("." + apex_weapon_name_dict[this.value])[0].scrollIntoView({
              behavior: 'smooth'
            });
        }
    })
}

function apex_onAttachmentChange(data, ui){

    var weapon_string_name = data.value .split('_X_')[0];
    var weapon_string_attachment = data.value .split('_X_')[2];
    var weapon_string_slot =  data.value .split('_X_')[1];
    const reset_attachments = ["_shotgun_bolt_l0",
        "_barrel_stabilizer_l0",
        "special_mag",
        "highcal_mag",
        "bullet_mag",
        "optics_iron_sight",
        "shotgun_mag",
        "stock_sniper_l0",
        "stock_tactical_l0",
        "hopup_empty_slot"];
    if(active_weapon_attachments[weapon_string_name] === undefined) {
        active_weapon_attachments[weapon_string_name] = [];
        active_weapon_attachments[weapon_string_name] = {
            slot0: "",
            slot1: "",
            slot2: "",
            slot3: "",
            slot4: "",
            slot5: ""
        };
    }
    if(reset_attachments.includes(weapon_string_attachment)) {
        active_weapon_attachments[weapon_string_name][weapon_string_slot] = "";
    } else {
        active_weapon_attachments[weapon_string_name][weapon_string_slot] = weapon_string_attachment;
    }
    apex_updateWeapon(active_weapon_attachments, ui);

}

function apex_initializeAttachmentOnChange(){
    var weapon_key_string = "";
    $.each(APEXWeaponData, function(key, weapon) {
        weapon_key_string = "#"+ weapon['WeaponData']['printname']+"_barrel_stabilizers";
        oHandler0 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data, ui) {apex_onAttachmentChange(data, ui);
                }}
        }).data("dd");
        weapon_key_string = "#"+ weapon['WeaponData']['printname']+"_extend_mags";
        oHandler1 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data, ui) {apex_onAttachmentChange(data, ui);
                }}
        }).data("dd");
        weapon_key_string = "#"+ weapon['WeaponData']['printname']+"_optics";
        oHandler2 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data, ui) {apex_onAttachmentChange(data, ui);
                }}
        }).data("dd");
        weapon_key_string = "#"+ weapon['WeaponData']['printname']+"_stocks";
        oHandler3 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data, ui) {apex_onAttachmentChange(data, ui);
                }}
        }).data("dd");
        weapon_key_string = "#"+ weapon['WeaponData']['printname']+"_hopups";
        oHandler4 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data, ui) {apex_onAttachmentChange(data, ui);
                }}
        }).data("dd");
    });

}

function apex_printWeapons(){

    var statsHtml = "";
    // statsHtml += "<div><ab><img class='attachment_box' src='./pages/apex/icons/attachment_box.png' alt=''></ab></div>";

    statsHtml += apex_printWeaponClass(0);
    statsHtml += apex_printWeaponClass(1);
    statsHtml += apex_printWeaponClass(2);
    statsHtml += apex_printWeaponClass(3);
    statsHtml += apex_printWeaponClass(4);
    statsHtml += apex_printWeaponClass(5);
    statsHtml += apex_printWeaponClass(6);

    $("#pageBody").html(statsHtml);
    showHideClasses();

    $(".customButton").checkboxradio(
        {icon:false}
    );

    $(".variantButton").button();

    $(".variantButton").click(function(){
        addVariantCounter++;
        var thisRow = $(this).parentsUntil("tbody", "tr");
        var weaponName = $(thisRow).find(".lblWeaponName").text();

        var newWeaponStats = APEXWeaponData.find(function(element){
            return element["WeapAttachmentKey"] === weaponName;
        });

        var newWeaponRow = apex_printWeapon(newWeaponStats);
        var newWeaponRowObj = $(newWeaponRow).insertAfter(thisRow);
        $(newWeaponRowObj).find(".customButton").checkboxradio(
            {icon:false}
        );
        apex_initializeCustomizationsRow(newWeaponRowObj);

        $(newWeaponRowObj).effect("highlight");
        apex_showHideStats();
    });

    $(document).tooltip({track: true});

    apex_initializeCustomizations();
    initializeSorts();

    $(".sortableTable").sortable({
       opacity: 0.7,
       placeholder: "ui-state-highlight",
       handle: ".sortDragIcon"
    });

    // apex_showHideStats();
    apex_showHideSubCats();
    apex_initializeAttachmentOnChange();
    //cleanUpStuff();
}

function apex_printWeaponClass(weaponClass){
    var rtnStr = "";
    rtnStr += "<div id='" + apex_weaponClassTitles[weaponClass] + "Section'>" +
              "<div class='apex_classHeader'><img src='./pages/apex/icons/rui/weapon_icons/classes/" + apex_weaponClassTitles[weaponClass] + ".png' alt=''>" + apex_weaponClassTitles[weaponClass] + "</div>";
    rtnStr += "<table class='table apex_classTable'><tbody class='sortableTable'>";

    $.each(APEXWeaponData, function( key, value ) {
        if (parseInt(value.WeaponData.weapon_class) === weaponClass && value.WeaponData.weapon_type_flags === "WPT_PRIMARY"){
            rtnStr += apex_printWeapon(value.WeaponData, key);
        }
    });
    rtnStr += "</tbody></table></div>";
    return rtnStr;
}

function apex_printWeapon(weaponStats, key) {
    var reloadData = apex_createReloadGraphic(weaponStats.reloadempty_time, weaponStats.reload_time);
    var standRecoilData = apex_createNewRecoilGraphic(weaponStats.viewkick_pattern_data_y_avg, weaponStats.viewkick_pattern_data_x_avg, weaponStats.viewkick_pattern_data_x_min, weaponStats.viewkick_pattern_data_x_max, weaponStats.viewkick_pattern_data_sizex_avg, weaponStats.viewkick_pattern_data_sizey_avg, weaponStats.viewkick_pitch_base, weaponStats.viewkick_pitch_random, weaponStats.viewkick_yaw_base, weaponStats.viewkick_yaw_random);
    var apex_spreadTableGraphic = apex_createSpreadTableGraphic(weaponStats.spread_stand_ads, weaponStats.spread_stand_hip, weaponStats.spread_stand_hip_run, weaponStats.spread_stand_hip_sprint, weaponStats.spread_crouch_ads, weaponStats.spread_crouch_hip, weaponStats.spread_air_ads, weaponStats.spread_air_hip, weaponStats.spread_kick_on_fire_stand_ads, weaponStats.spread_kick_on_fire_stand_hip, weaponStats.spread_kick_on_fire_crouch_ads, weaponStats.spread_kick_on_fire_crouch_hip, weaponStats.spread_kick_on_fire_air_ads, weaponStats.spread_kick_on_fire_air_hip, weaponStats.spread_decay_delay, weaponStats.spread_moving_decay_rate, weaponStats.spread_decay_rate, weaponStats.spread_moving_increase_rate);
    var attachmentGraphic = (weaponStats.menu_category === 8) ? "" : apex_printAttachments([formatWeaponName(weaponStats.printname)], weaponStats.ammo_pool_type);
    var addVariantGraphic = (weaponStats.menu_category === 8 || addVariantCounter !== 0) ? "" : "<button class='variantButton btn btn-outline-light btn-sm' " + apex_variantTooltip + ">+</button>";
    var charge_string = apex_createChargeSpinUpLabels(weaponStats);
    var rtnStr = "<tr class='" + weaponStats.printname.replace(/ |\//g,"") + " sub_" + getAPEXWeaponsSubcat(weaponStats.printname) +"'>" +
        "<td class='apex_firstColumn'>" +
        "<div class='apex_lblWeaponName'>" +
        "<span class='apex_lblNameValue' title='"+weaponStats["custom_desc_long"].toString().replace("\\u0027", "\"").replace("\\u0027", "\"")+"'>" + formatWeaponName(weaponStats.custom_name) + "</span>" +
        "</div>" +
        "<div>" +
        "<img class='apex_weaponImg' src='./pages/apex/icons/"+ weaponStats["hud_icon"] + ".png' alt=''>" +
        "</div>" +
        "<div style='line-height: 20px;'>" +
        "<span class='apex_lblMagText'>" +
        "<span class='apex_lblMag'>" + weaponStats["ammo_clip_size"] + "</span>" +
        "<span class='apex_lblSuffixText'> x" + "<img src='./pages/apex/icons/ammo/"+ weaponStats.ammo_pool_type +".png' alt='' height='20' width='19';'>" + "</span>" +
        "</span>" +
        "<span class='apex_lblBurstCount' "+ apex_burstTooltip +">"+ apex_createBurstLabels(weaponStats.burst_fire_count, weaponStats.burst_fire_delay)  + "<br></span>" +
        "<span><br></span>" +
        "<span class='apex_lblRPM'>" +
        "<span class='apex_lblRPMValue' " + apex_rpmTooltip + ">" + apex_createFireRateLabels(weaponStats) + "</span>" +
        "<span class='apex_lblSuffixText'> rpm</span>" +
        "</span>" +
        "</div>" +
        "<div class='apex_lblChargeValue'>"+ charge_string +
        "</div>" +
        "</td>" +
        "<td class='apex_secondColumn'>" +
        "<div class='apex_damageChartContainer' " + apex_damageTooltip + ">" + apex_createDamageChart(weaponStats.printname, weaponStats.damage_array, weaponStats.damage_distance_array_m, weaponStats.projectiles_per_shot, weaponStats.damage_headshot_scale, weaponStats.damage_leg_scale, weaponStats.allow_headshots, weaponStats.headshot_distance ) + "</div>" +
        "<div class='apex_headShotDamageDistanceContainer' " + apex_damageModsHSTooltip + ">" + "<span class='apex_lblSuffixText'> " + "<img src='./pages/apex/icons/rui/misc/hs_skull_M.png' alt=''>x</span>" + weaponStats.damage_headshot_scale + " - " + weaponStats.headshot_distance_m + "m </div>" +
        "<div class='apex_legShotDamageDistanceContainer' " + apex_damageModsLSTooltip + ">" + "<span class='apex_lblSuffixText'> " + "<img src='./pages/apex/icons/rui/misc/octanes_real_legs.png' alt=''> x</span>" + weaponStats.damage_leg_scale + "</div>" +
        "</td>" +
        "<td>" +
        "<td>" +
        "<div class='apex_reloadDataAndMagCount'>" + apex_createBulletSpeedGraphic(Math.round(weaponStats['projectile_launch_speed_m']), weaponStats.projectile_drag_coefficient) + reloadData  + "</div>" +
        "</td><td>" +
        // "<div class='apex_recoilGraphBox' " + apex_recoilTooltip + ">" + standRecoilData + "</div><div class='apex_deployTimeBox'" + apex_deployTooltip + "><br><span class='apex_lblDeployTime'>" + weaponStats.deployfirst_time + "<span class='apex_lblSuffixText'> s</span><img class='apex_wpnSwitchImg' src='./pages/apex/icons/weapon_switch_small.png' alt=''><span class='apex_lblDeployTime'>" + weaponStats.deploy_time + "<span class='apex_lblSuffixText'>s</span><br><br><br><span class='apex_lblDeployTime_2'>" + formatWeaponValue(weaponStats.raise_time) + "<span class='apex_lblSuffixText'> s</span></span></span><span class='apex_lblDeployTime_4'>" + weaponStats.holster_time + "<span class='apex_lblSuffixText'>s</span></span></span></div>" +
        "<div class='apex_recoilGraphBox'>" + standRecoilData + "</div><div class='apex_deployTimeBox'><br><span class='apex_lblDeployTime'" + apex_deploy_1st_Tooltip + ">" + weaponStats.deployfirst_time + "<span class='apex_lblSuffixText'> s</span><img class='apex_wpnSwitchImg'" + apex_deployTooltip + " src='./pages/apex/icons/weapon_switch_small.png' alt=''><span class='apex_lblDeployTime'" + apex_deploy_Deploy_Tooltip + ">" + weaponStats.deploy_time + "<span class='apex_lblSuffixText'>s</span><br><br><br><span class='apex_lblDeployTime_2'" + apex_deploy_Raise_Tooltip + ">" + formatWeaponValue(weaponStats.raise_time) + "<span class='apex_lblSuffixText'> s</span></span></span><span class='apex_lblDeployTime_4'" + apex_deploy_Holster_Tooltip + ">" + weaponStats.holster_time + "<span class='apex_lblSuffixText'>s</span></span></span></div>" +
        "</td><td>" +
        "<div class='apex_hipSpreadContainer' " + apex_hipfireTooltip + ">" + apex_createHipSpreadGraphic(weaponStats.spread_stand_hip_run, weaponStats.spread_air_hip, weaponStats.spread_air_ads, weaponStats.spread_stand_ads, weaponStats['weapon_class'], weaponStats) + "</div>" +
        "<div>" +
        "<div class='apex_spreadLabels' " + apex_adsTooltip + ">" +
        apex_createSpreadLabels(weaponStats.ads_move_speed_scale, weaponStats.zoom_time_in, weaponStats.zoom_time_out, weaponStats.zoom_fov) +
        "</div>" +
        "</div>" +
        "</td><td>" +
        apex_spreadTableGraphic +
        "</td><td>" +
        "<div class='apex_customButtonsApex'>" + attachmentGraphic + "</div>" +
        "</td><td>" +
        "<div class='apex_afterCustomButtons'>" +
        "<div>" +
        "<img class='apex_sortDragIcon' src='./pages/bfv/img/sortDrag.png' alt='' " + dragTooltip + ">" +
        "</div>" +
        "<div>" + addVariantGraphic + "</div>" +
        "</div>" +
        "</div>" +
        "</td>" +
        "</tr>";
    return rtnStr;
}

function apex_updateWeapon(selectedAttachments, selectedCustomButton) {
    var print_name;
    for (let i = 0; i < APEXWeaponData.length; i++) {
        let weapon_mod = null;
        let weapon_data = null;
        let mod = null;
        weapon_mod = jQuery.extend(true, [], APEXWeaponData);
        mod = {};
        if (selectedAttachments[weapon_mod[i].WeaponData.printname] !== undefined) {
            for (const [key, value] of Object.entries(selectedAttachments[weapon_mod[i].WeaponData.printname])) {
                if (value !== "" && value !== undefined) {
                    if (value === 'hopup_highcal_rounds') {
                        for (const [mod_key, mod_value] of Object.entries(weapon_mod[i].WeaponData.Mods['altfire_highcal'])) {
                            mod[mod_key] = mod_value;
                        }
                    } else if (value === 'hopup_selectfire') {
                        for (const [mod_key, mod_value] of Object.entries(weapon_mod[i].WeaponData.Mods['altfire'])) {
                            mod[mod_key] = mod_value;
                        }
                    } else if (value === 'hopup_double_tap') {
                        for (const [mod_key, mod_value] of Object.entries(weapon_mod[i].WeaponData.Mods['altfire_double_tap'])) {
                            mod[mod_key] = mod_value;
                        }
                    } else {
                        for (const [mod_key, mod_value] of Object.entries(weapon_mod[i].WeaponData.Mods[value])) {
                            mod[mod_key] = mod_value;
                        }
                    }
                }
            }
            print_name = weapon_mod[i].WeaponData.printname;
            weapon_data = weapon_mod[i].WeaponData;

            const weaponStats = weapon_data;
            for (const [key, value] of Object.entries(mod)) {
                if (!key.includes("effective_fire_rate")) {
                        if (!key.includes("viewkick_pattern_data")) {
                            if (value.toString().includes("++")) {
                                var additive = value.replace("++", "");
                                weaponStats[key] = (parseInt(weaponStats[key]) + parseInt(additive));

                            } else if (value.includes("*")) {
                                var multi = value.replace("*", "");
                                weaponStats[key] = (weaponStats[key] * multi).toFixed(3);
                            } else {
                                weaponStats[key] = value
                            }
                        } else {
                            if (key.includes("viewkick_pattern_data_")) {
                                weaponStats[key] = value
                            }
                        }
                } else {
                    weaponStats[key] = value
                }
            }

            weaponStats['damage_array']
            const weaponRow = document.getElementsByClassName(weaponStats.printname);
            if (parseFloat(weaponStats['viewkick_pitch_base']) < 0.0) {
                $(weaponRow).find(".apex_recoilGraphBox").html(apex_createNonPatternRecoilGraphic(weaponStats.viewkick_pattern_data_y_avg, weaponStats.viewkick_pattern_data_x_avg, weaponStats.viewkick_pattern_data_x_min, weaponStats.viewkick_pattern_data_x_max, weaponStats.viewkick_pattern_data_sizex_avg, weaponStats.viewkick_pattern_data_sizey_avg, parseFloat(weaponStats.viewkick_pitch_base), parseFloat(weaponStats.viewkick_pitch_random), parseFloat(weaponStats.viewkick_yaw_base), parseFloat(weaponStats.viewkick_yaw_random)));
            } else {
                $(weaponRow).find(".apex_recoilGraphBox").html(apex_createNewRecoilGraphic(weaponStats.viewkick_pattern_data_y_avg, weaponStats.viewkick_pattern_data_x_avg, weaponStats.viewkick_pattern_data_x_min, weaponStats.viewkick_pattern_data_x_max, weaponStats.viewkick_pattern_data_sizex_avg, weaponStats.viewkick_pattern_data_sizey_avg, parseFloat(weaponStats.viewkick_pitch_base), parseFloat(weaponStats.viewkick_pitch_random), parseFloat(weaponStats.viewkick_yaw_base), parseFloat(weaponStats.viewkick_yaw_random)));
            }
            var charge_string = apex_createChargeSpinUpLabels(weaponStats);
            $(weaponRow).find(".apex_lblRPMValue").text( apex_createFireRateLabels(weaponStats));

            $(weaponRow).find(".apex_lblBurstCount").html(apex_createBurstLabels(weaponStats.burst_fire_count, weaponStats.burst_fire_delay)  + "<br></span>");
            $(weaponRow).find(".apex_lblChargeValue").html(charge_string);
            $(weaponRow).find(".apex_lblSpeedValue").text(weaponStats['projectile_launch_speed_m']);
            $(weaponRow).find(".apex_damageChartContainer").html(apex_createDamageChart(weaponStats.printname, weaponStats.damage_array, weaponStats.damage_distance_array_m, weaponStats.projectiles_per_shot, weaponStats.damage_headshot_scale, weaponStats.damage_leg_scale, weaponStats.allow_headshots, weaponStats.headshot_distance));
            // "<div class='apex_damageChartContainer' " + apex_damageTooltip + ">" + apex_createDamageChart(weaponStats.printname, weaponStats.damage_array, weaponStats.damage_distance_array_m, weaponStats.projectiles_per_shot, weaponStats.damage_headshot_scale, weaponStats.damage_leg_scale, weaponStats.allow_headshots, weaponStats.headshot_distance ) + "</div>" +

            $(weaponRow).find(".apex_headShotDamageDistanceContainer").html("<span class='apex_lblSuffixText'> " + "<img src='./pages/apex/icons/rui/misc/hs_skull_M.png' alt=''>x</span>" + weaponStats.damage_headshot_scale + " - " + weaponStats.headshot_distance_m + "m");
            $(weaponRow).find(".apex_legShotDamageDistanceContainer").html("<span class='apex_lblSuffixText'> " + "<img src='./pages/apex/icons/rui/misc/octanes_real_legs.png' alt=''> x</span>" + weaponStats.damage_leg_scale+"");

            $(weaponRow).find(".apex_reloadDataAndMagCount").html(apex_createBulletSpeedGraphic(Math.round(weaponStats['projectile_launch_speed_m']), weaponStats.projectile_drag_coefficient) + apex_createReloadGraphic(weaponStats.reloadempty_time, weaponStats.reload_time, weaponStats.ammo_clip_size, weaponStats.Mods.survival_finite_ammo.ammo_stockpile_max));
            $(weaponRow).find(".apex_spreadLabels").html(apex_createSpreadLabels(weaponStats.ads_move_speed_scale, weaponStats.zoom_time_in, weaponStats.zoom_time_out, weaponStats.zoom_fov));
            $(weaponRow).find(".apex_hipSpreadContainer").html(apex_createHipSpreadGraphic(weaponStats.spread_stand_hip_run, weaponStats.spread_air_hip, weaponStats.spread_air_ads, weaponStats.spread_stand_ads, weaponStats['weapon_class'], weaponStats));
            $(weaponRow).find(".apex_lblDeployTime").html(weaponStats.deployfirst_time + "<span class='apex_lblSuffixText'> s</span><img class='apex_wpnSwitchImg'" + apex_deployTooltip + " src='./pages/apex/icons/weapon_switch_small.png' alt=''><span class='apex_lblDeployTime'" + apex_deploy_Deploy_Tooltip + ">" + weaponStats.deploy_time + "<span class='apex_lblSuffixText'>s</span><br><br><br><span class='apex_lblDeployTime_2'" + apex_deploy_Raise_Tooltip + ">" + formatWeaponValue(weaponStats.raise_time) + "<span class='apex_lblSuffixText'> s</span></span></span><span class='apex_lblDeployTime_4'" + apex_deploy_Holster_Tooltip + "'>" + weaponStats.holster_time + "<span class='apex_lblSuffixText'>s</span></span>");
            $(weaponRow).find(".apex_spreadTable").html(apex_createSpreadTableGraphic(weaponStats.spread_stand_ads, weaponStats.spread_stand_hip, weaponStats.spread_stand_hip_run, weaponStats.spread_stand_hip_sprint, weaponStats.spread_crouch_ads, weaponStats.spread_crouch_hip, weaponStats.spread_air_ads, weaponStats.spread_air_hip, weaponStats.spread_kick_on_fire_stand_ads, weaponStats.spread_kick_on_fire_stand_hip, weaponStats.spread_kick_on_fire_crouch_ads, weaponStats.spread_kick_on_fire_crouch_hip, weaponStats.spread_kick_on_fire_air_ads, weaponStats.spread_kick_on_fire_air_hip, weaponStats.spread_decay_delay, weaponStats.spread_moving_decay_rate, weaponStats.spread_decay_rate, weaponStats.spread_moving_increase_rate));

            // "<span class='lblMag'>" + weaponStats.ammo_clip_size + "</span>" +
            $(weaponRow).find(".apex_lblMag").text(weaponStats.ammo_clip_size);
            weapon_mod = jQuery.extend(true, [], APEXWeaponData_orig);
        }
    }
}

function apex_printAttachments(weaponName, weapon_ammo) {
    var custom_string = "";
    var custom_string_0 = "";
    var custom_string_1 = "";
    var custom_string_2 = "";
    var custom_string_3 = "";
    var custom_string_4 = "";
    var slot0 = 0;
    var slot1 = 0;
    var slot2 = 0;
    var slot3 = 0;
    var slot4 = 0;
    custom_string += "<aa class='aa'>";

    var barrel_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\""+weaponName+"_barrel_stabilizers\" id=\""+weaponName+"_barrel_stabilizers\">";
    var mag_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\""+weaponName+"_extend_mags\" id=\""+weaponName+"_extend_mags\">";
    var optic_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\""+weaponName+"_optics\" id=\""+weaponName+"_optics\">";
    var stock_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\""+weaponName+"_stocks\" id=\""+weaponName+"_stocks\">";
    var hopup_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\""+weaponName+"_hopups\" id=\""+weaponName+"_hopups\">";
    for (var i = 0; i < customizations[weaponName].length; i++) {
        if (customizations[weaponName][i].attachName[0] !== undefined) {

            if(slot0 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("barrel")) {
                    slot0 += 1;
                    var barrel_slot_name = "_barrel_stabilizer_l0";
                    barrel_option_string += "<option value="+weaponName+"_X_slot0_X_"+barrel_slot_name+" data-image=\"./pages/apex/icons/slots/barrel_slot.png\"></option>";
                    // custom_string_0 += "<ab><img id='"+weaponName+"_slot0' src='./pages/apex/icons/slots/barrel_slot.png' alt=''></ab>";
                }
                if (customizations[weaponName][i].attachName[0].includes("bolt")) {
                    slot0 += 1;
                    var bolt_slot_name = "_shotgun_bolt_l0";
                    barrel_option_string += "<option value="+weaponName+"_X_slot0_X_"+bolt_slot_name+" data-image=\"./pages/apex/icons/slots/shotgun_slot.png\"></option>";
                    // custom_string_0 += "<asb><img id='"+weaponName+"_slot0' src='./pages/apex/icons/slots/shotgun_slot.png' alt=''></asb>";
                }
            }
            if (customizations[weaponName][i].attachName[0].includes("barrel")) {
                barrel_option_string += "<option value="+weaponName+"_X_slot0_X_"+customizations[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/barrel/slot_half_"+customizations[weaponName][i].attachName[0]+".png\"></option>";
            }
            if (customizations[weaponName][i].attachName[0].includes("bolt")) {
                barrel_option_string += "<option value=" + weaponName + "_X_slot0_X_" + customizations[weaponName][i].attachName[0] + " data-image=\"./pages/apex/icons/slots/bolts/slot_half_" + customizations[weaponName][i].attachName[0] + ".png\"></option>";
            }


            if(slot1 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("mag")) {
                    slot1 += 1;
                    var mag_slot_name = weapon_ammo+"_mag";
                    mag_option_string += "<option value="+weaponName+"_X_slot1_X_"+mag_slot_name+" data-image=\"./pages/apex/icons/slots/"+weapon_ammo+"_slot.png\"></option>";
                    // custom_string_1 += "<am><img id='"+weaponName+"_slot1' src='./pages/apex/icons/slots/"+weapon_ammo+"_slot.png' alt=''></am>";
                }
            }
            if (customizations[weaponName][i].attachName[0].includes("mag")) {
                mag_option_string += "<option value="+weaponName+"_X_slot1_X_"+customizations[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/mags/slot_half_"+customizations[weaponName][i].attachName[0]+".png\"></option>";
                slot1 += 1;
            }

            if(slot2 < 1) {
                for (var j = 0; j < optic_customizations[weaponName].length; j++) {


                    if (optic_customizations[weaponName][j].attachName[0].includes("optic")) {
                        slot2 += 1;
                        if (slot2 === 1) {
                            // custom_string_2 += "<ao><img id='"+weaponName+"_slot2' src='./pages/apex/icons/slots/optic_slot.png' alt=''></ao>";
                            var ironsights = "optics_iron_sight";
                            optic_option_string += "<option value=" + weaponName + "_X_slot2_X_" + ironsights + " data-image=\"./pages/apex/icons/slots/optic_slot.png\"></option>";
                        }
                    }
                    if (slot2 !== 1) {
                        if (optic_customizations[weaponName][j].attachName[0].includes("optic")) {
                            var  opticname = optic_customizations[weaponName][j]['attachName'][0];
                            // console.log(weaponName + "_X_" +opticname);
                            optic_option_string += "<option value=" + weaponName + "_X_slot2_X_" +opticname+ " data-image=\"./pages/apex/icons/slots/optics/slot_half_" + opticname + ".png\"></option>";
                            slot2 += 1;
                        }
                    }
                }
            }

            if(slot3 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("stock_tactical")) {
                    slot3 += 1;
                    var stock_sniper_name = "stock_sniper_l0";
                    stock_option_string += "<option value="+weaponName+"_X_slot3_X_"+stock_sniper_name+" data-image=\"./pages/apex/icons/slots/tactical_stock_slot.png\"></option>";
                    // custom_string_3 += "<ats><img id='"+weaponName+"_slot3' src='./pages/apex/icons/slots/tactical_stock_slot.png' alt=''></ats>";

                }
                if (customizations[weaponName][i].attachName[0].includes("stock_sniper")) {
                    slot3 += 1;
                    // custom_string_3 += "<ass><img id='"+weaponName+"_slot3' src='./pages/apex/icons/slots/stock_sniper_slot.png' alt=''></ass>";
                    var stock_tactical_name = "stock_tactical_l0";
                    stock_option_string += "<option value="+weaponName+"_X_slot3_X_"+stock_tactical_name+" data-image=\"./pages/apex/icons/slots/stock_sniper_slot.png\"></option>";
                }
            }
            if (customizations[weaponName][i].attachName[0].includes("stock_tactical")) {
                stock_option_string += "<option value="+weaponName+"_X_slot3_X_"+customizations[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/stocks/slot_half_"+customizations[weaponName][i].attachName[0]+".png\"></option>";
                slot3 += 1;
            }
            if (customizations[weaponName][i].attachName[0].includes("stock_sniper")) {
                stock_option_string += "<option value="+weaponName+"_X_slot3_X_"+customizations[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/stocks/slot_half_"+customizations[weaponName][i].attachName[0]+".png\"></option>";
                slot3 += 1;
            }

            if(slot4 < 1) {
                if (customizations[weaponName][i].attachName[0].includes("hopup")) {
                    slot4 += 1;
                    var hopup_name = "hopup_empty_slot";
                    hopup_option_string += "<option value="+weaponName+"_X_slot4_X_"+hopup_name+" data-image=\"./pages/apex/icons/slots/hopup_headshot_dmg_slot.png\"></option>";
                }
            }
            if (customizations[weaponName][i].attachName[0].includes("hopup")) {
                hopup_option_string += "<option value="+weaponName+"_X_slot4_X_"+customizations[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/hopups/slot_half_"+customizations[weaponName][i].attachName[0]+".png\"></option>";
                slot4 += 1;
            }

        }

    }
    barrel_option_string += "</select></td2></tr2></table2>";
    mag_option_string += "</select></td2></tr2></table2>";
    stock_option_string += "</select></td2></tr2></table2>";
    optic_option_string += "</select></td2></tr2></table2>";
    hopup_option_string += "</select></td2></tr2></table2>";
    if(slot0 === 0) {
        var slot_0_name = "_slot0";
        custom_string_0 += "<option value="+weaponName+"_"+slot_0_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        custom_string += custom_string_0;
    } else {
        custom_string += barrel_option_string;
    }
    if(slot1 === 0) {
        var slot_1_name = "_slot1";
        custom_string_0 += "<option value="+weaponName+"_"+slot_1_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        // custom_string_1 += "<img id='"+weaponName+"_slot1' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
        custom_string += custom_string_1;
    } else {
        custom_string += mag_option_string;
    }
    // if(slot1 === 0)
    //     custom_string_1 += "<img id='"+weaponName+"_slot1' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
    if(slot2 === 0) {
        var slot_2_name = "_slot2";
        custom_string_0 += "<option value="+weaponName+"_"+slot_2_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        // custom_string_2 += "<img id='"+weaponName+"_slot2' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
        custom_string += custom_string_2;
    } else {
        custom_string += optic_option_string;
    }
    // if(slot2 === 0)
    //     custom_string_2 += "<img id='"+weaponName+"_slot2' src='./pages/apex/icons/slots/optic_slot.png' alt=''>";
    if(slot3 === 0) {
        var slot_3_name = "_slot3";
        custom_string_0 += "<option value="+weaponName+"_"+slot_3_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        // custom_string_3 += "<img id='"+weaponName+"_slot3' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
        custom_string += custom_string_3;
    } else {
        custom_string += stock_option_string;
    }
    // if(slot3 === 0)
    //     custom_string_3 += "<img id='"+weaponName+"_slot3' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
    if(slot4 === 0) {
        var slot_4_name = "_slot4";
        custom_string_0 += "<option value="+weaponName+"_"+slot_4_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        custom_string_4 += "<img id='"+weaponName+"_slot4' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
        custom_string += custom_string_4;
    } else {
        custom_string += hopup_option_string;
    }
    custom_string += "</aa>";
    return custom_string;
}

function apex_createBulletSpeedGraphic(initialSpeed, drag){
    if (initialSpeed < 99999) {
        return `<div class='apex_bulletSpeedContainer'><span class='apex_pr-3 lblSpeed' ${apex_bulletSpeedTooltip}><img src='./pages/bfv/img/speed.png' alt=''><span class='apex_lblSpeedValue'>${initialSpeed}</span><span class='apex_lblSuffixText'> m/s</span><br><span class='ui-icon ui-icon-arrowthick-1-w'></span><span class='apex_lblDragCoe' ${apex_bulletSpeedTooltip}>${drag.toString().substring(1)}</span></span></div>`
    } else {
        return `<div class='apex_bulletSpeedContainer'><span class='apex_pr-3 lblSpeed' ${apex_bulletSpeedTooltip}><img src='./pages/bfv/img/speed.png' alt=''><span class='apex_lblSpeedHitScanValue'>∞</span><span class='apex_lblSuffixText'> m/s</span><br><span class='ui-icon ui-icon-arrowthick-1-w'></span><span class='apex_lblDragCoe' ${apex_bulletSpeedTooltip}>0.0</span></span></div>`
    }
}

function apex_createReloadGraphic(reloadEmpty, reloadLeft){
    var reloadData = "<div>" +
                         "<div class='apex_sectionReload' " + apex_reloadTooltip + ">";
    if (reloadEmpty !== "N/A"){
        if(reloadEmpty === reloadLeft){

            reloadData += `<div class='apex_lblReloadLeft'><img src='./pages/bfv/img/reload.png' alt='' class='apex_imgReload'><span>${reloadLeft}</span><span class='apex_lblSuffixText'> s</span></div></div>`;
        } else {
            reloadData += `<div class='apex_lblReloadLeft'><img src='./pages/bfv/img/reload.png' alt='' class='apex_imgReload'><span>${reloadLeft}</span><span class='apex_lblSuffixText'> s</span></div><div class='apex_lblReloadEmpty'>${reloadEmpty}<span class='apex_lblSuffixText'> s</span></div></div>`;
        }
    } else {
        reloadData += "</div " + apex_magTooltip + ">";
    }
    return reloadData +  "</div>";
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
    if(wpn_value === undefined || isNaN(wpn_value)) {
        wpn_value = "X";
    }
    return wpn_value
}

function apex_createNonPatternRecoilGraphic(viewkick_pattern_data_y_avg, viewkick_pattern_data_x_avg, viewkick_pattern_data_x_min,
                                            viewkick_pattern_data_x_max, viewkick_pattern_data_sizex_avg, viewkick_pattern_data_sizey_avg,
                                            viewkick_pitch_base, viewkick_pitch_random, viewkick_yaw_base, viewkick_yaw_random){
    var viewkick_yaw_base_max = Math.abs(viewkick_yaw_base / 2.0);
    var viewkick_yaw_base_min = viewkick_yaw_base_max * -1;
    viewkick_pitch_base = Math.abs(viewkick_pitch_base);
    var recoilUpLength;
    var recoilUpTextY;
    var recoilInitUpTextY;
    var recoilHorLength1;
    var recoilHorLength2;
    var point5inc;
    var oneinc;
    var onepoint5inc;
    var apex_recoilGraphic;
    if (viewkick_pitch_base <= 1.76) {
        recoilUpLength = (90 - ((viewkick_pitch_base + 0.5) * 30))+ 6;
        recoilUpTextY = (71 - ((viewkick_pitch_base + 0.5) * 30))+ 6;
        recoilInitUpTextY = (86 - ((viewkick_pitch_base + 0.5) * 30))+ 6;
        recoilHorLength1 = (60 - (viewkick_yaw_base_max * 30)) + 4;
        recoilHorLength2 = (60 + (Math.abs(viewkick_yaw_base_min) * 30)) + 4;
        point5inc = ((viewkick_pitch_base + 0.5) > .5) ? "<line x1='55' y1='75' x2='65' y2='75' style='stroke:white; stroke-width:1'/>" : "";
        oneinc = ((viewkick_pitch_base + 0.5) > 1.0) ? "<line x1='55' y1='60' x2='65' y2='60' style='stroke:white; stroke-width:1'/>" : "";
        onepoint5inc = ((viewkick_pitch_base + 0.5) > 1.5) ? "<line x1='55' y1='45' x2='65' y2='45' style='stroke:white; stroke-width:1'/>" : "";

        apex_recoilGraphic = "<svg viewbox='0 0 130 100' style='width: 100px;height: 111px'>" +
            point5inc + oneinc + onepoint5inc +
            "<line x1='" + recoilHorLength1 + "' y1='90' x2='" + recoilHorLength2 + "' y2='90' style='stroke:white; stroke-width:2'/>" + // Left - Right
            "<line x1='64' y1='90' x2='64' y2='" + recoilUpLength + "' style='stroke:white; stroke-width:2'/>" + // Up - Down
            "<text " + apex_HrecoilTooltip + "x='" + (recoilHorLength1 - 4).toString() + "' y='95' text-anchor='end' class='recoilValue'>" + viewkick_yaw_base_max + "°</text>" +
            "<text " + apex_HrecoilTooltip + "x='" + (recoilHorLength2 + 4).toString() + "' y='95' class='recoilValue'>" + Math.abs(viewkick_yaw_base_min) + "°</text>" +
            "<text " + apex_avgRecoilVariationTooltip + "x='68' y='" + recoilUpTextY + "' text-anchor='start' class='recoilValue'>" + (viewkick_pitch_random >= 0 ? "-/+" : "") + viewkick_pitch_random + "°</text>" +
            "<text " + apex_VrecoilTooltip + "x='64' y='" + recoilInitUpTextY + "' text-anchor='middle' class='recoilValue'>" + viewkick_pitch_base + "°</text>" +
            "<text " + apex_AvgHrecoilTooltip + "x='64' y='111' text-anchor='middle' class='recoilValue'>" + viewkick_yaw_random + "°</text>" +
            "</svg>";
    } else {
        viewkick_pitch_base = Math.abs(viewkick_pitch_base);
        recoilUpLength = (90 - (viewkick_pitch_base * 12));
        recoilUpTextY = (71 - (viewkick_pitch_base * 12));
        recoilInitUpTextY = (86 - (viewkick_pitch_base * 12));
        recoilHorLength1 = (60 - (viewkick_yaw_base_max * 30)) + 4;
        recoilHorLength2 = (60 + (Math.abs(viewkick_yaw_base_min) * 30)) + 4;
        point5inc = ((viewkick_pitch_base) > .5) ? "<line x1='55' y1='75' x2='65' y2='75' style='stroke:white; stroke-width:1'/>" : "";
        oneinc = ((viewkick_pitch_base) > 1.0) ? "<line x1='55' y1='60' x2='65' y2='60' style='stroke:white; stroke-width:1'/>" : "";
        onepoint5inc = ((viewkick_pitch_base) > 1.5) ? "<line x1='55' y1='45' x2='65' y2='45' style='stroke:white; stroke-width:1'/>" : "";
        apex_recoilGraphic =  "<svg viewbox='0 0 130 100' style='width: 100px;height: 111px'>" +
            point5inc + oneinc + onepoint5inc +
            "<line x1='" + recoilHorLength1 + "' y1='90' x2='" + recoilHorLength2 + "' y2='90' style='stroke:white; stroke-width:2'/>" + // Left - Right
            "<line x1='64' y1='90' x2='64' y2='" + (recoilUpLength+ 8) + "' style='stroke:white; stroke-width:2'/>" + // Up - Down
            "<text " + apex_HrecoilTooltip + "x='" + (recoilHorLength1 - 8).toString() + "' y='95' text-anchor='end' class='recoilValue'>" + viewkick_yaw_base_max + "°</text>" +
            "<text " + apex_HrecoilTooltip + "x='" + (recoilHorLength2 + 8).toString() + "' y='95' class='recoilValue'>" + Math.abs(viewkick_yaw_base_min) + "°</text>" +
            "<text " + apex_avgRecoilVariationTooltip + "x='68' y='" + (recoilUpTextY + 8) + "' text-anchor='start' class='recoilValue'>" + (viewkick_pitch_random >= 0 ? "-/+" : "") + viewkick_pitch_random + "°</text>" +
            "<text " + apex_VrecoilTooltip + "x='64' y='" + (recoilInitUpTextY + 8) + "' text-anchor='middle' class='recoilValue'>" + viewkick_pitch_base + "°</text>" +
            "<text " + apex_AvgHrecoilTooltip + "x='64' y='111' text-anchor='middle' class='recoilValue'>" + viewkick_yaw_random + "°</text>" +
            "</svg>";
    }
    return apex_recoilGraphic;

}

function apex_createNewRecoilGraphic(viewkick_pattern_data_y_avg, viewkick_pattern_data_x_avg, viewkick_pattern_data_x_min,
                                     viewkick_pattern_data_x_max, viewkick_pattern_data_sizex_avg, viewkick_pattern_data_sizey_avg,
                                     viewkick_pitch_base, viewkick_pitch_random, viewkick_yaw_base, viewkick_yaw_random){
    if(viewkick_pattern_data_y_avg !== undefined) {
        viewkick_pattern_data_y_avg = Math.abs(viewkick_pattern_data_y_avg);
        if (viewkick_pattern_data_sizey_avg <= 2) {
            var recoilUpLength = (90 - ((viewkick_pattern_data_sizey_avg + 0.5) * 30));
            var recoilUpTextY = (71 - ((viewkick_pattern_data_sizey_avg + 0.5) * 30));
            var recoilInitUpTextY = (86 - ((viewkick_pattern_data_sizey_avg + 0.5) * 30));
            var recoilHorLength1 = (60 - (viewkick_pattern_data_x_max * 30)) + 4;
            var recoilHorLength2 = (60 + (Math.abs(viewkick_pattern_data_x_min) * 30)) + 4;
            var point5inc = ((viewkick_pattern_data_sizey_avg + 0.5) > .5) ? "<line x1='55' y1='75' x2='65' y2='75' style='stroke:white; stroke-width:1'/>" : "";
            var oneinc = ((viewkick_pattern_data_sizey_avg + 0.5) > 1.0) ? "<line x1='55' y1='60' x2='65' y2='60' style='stroke:white; stroke-width:1'/>" : "";
            var onepoint5inc = ((viewkick_pattern_data_sizey_avg + 0.5) > 1.5) ? "<line x1='55' y1='45' x2='65' y2='45' style='stroke:white; stroke-width:1'/>" : "";

            var apex_recoilGraphic = "<svg viewbox='0 0 130 100' style='width: 100px;height: 111px'>" +
                point5inc + oneinc + onepoint5inc +
                "<line x1='" + recoilHorLength1 + "' y1='90' x2='" + recoilHorLength2 + "' y2='90' style='stroke:white; stroke-width:2'/>" + // Left - Right
                "<line x1='64' y1='90' x2='64' y2='" + recoilUpLength + "' style='stroke:white; stroke-width:2'/>" + // Up - Down
                "<text " + apex_HrecoilTooltip + "x='" + (recoilHorLength1 - 4).toString() + "' y='95' text-anchor='end' class='recoilValue'>" + viewkick_pattern_data_x_max + "°</text>" +
                "<text " + apex_HrecoilTooltip + "x='" + (recoilHorLength2 + 4).toString() + "' y='95' class='recoilValue'>" + Math.abs(viewkick_pattern_data_x_min) + "°</text>" +
                "<text " + apex_avgRecoilVariationTooltip + "x='68' y='" + recoilUpTextY + "' text-anchor='start' class='recoilValue'>" + (viewkick_pattern_data_y_avg >= 0 ? "-/+" : "") + viewkick_pattern_data_y_avg + "°</text>" +
                "<text " + apex_VrecoilTooltip + "x='64' y='" + recoilInitUpTextY + "' text-anchor='middle' class='recoilValue'>" + viewkick_pattern_data_sizey_avg + "°</text>" +
                "<text " + apex_AvgHrecoilTooltip + "x='64' y='111' text-anchor='middle' class='recoilValue'>" + viewkick_pattern_data_x_avg + "°</text>" +
                "</svg>";
        } else {
            var apex_recoilGraphic = "<svg viewbox='0 0 120 100' style='width: 100px;height: 111px'>" +
                "<line x1='54' y1='90' x2='74' y2='90' style='stroke:#555; stroke-width:2'/>" +
                "<line x1='64' y1='90' x2='64' y2='80' style='stroke:#555; stroke-width:2'/>" +
                "<text " + apex_HrecoilTooltip + "x='48' y='95' text-anchor='end' class='recoilValue'>" + viewkick_pattern_data_x_max + "°</text>" +
                "<text " + apex_HrecoilTooltip + "x='78' y='95' class='recoilValue'>" + Math.abs(viewkick_pattern_data_x_min) + "°</text>" +
                "<text " + apex_avgRecoilVariationTooltip + "x='68' y='64' text-anchor='start' class='recoilValue'>" + (viewkick_pattern_data_y_avg >= 0 ? "-/+" : "") + viewkick_pattern_data_y_avg + "°</text>" +
                "<text " + apex_VrecoilTooltip + "x='64' y='76' text-anchor='middle' class='recoilValue'>" + viewkick_pattern_data_sizey_avg + "°</text>" +
                "<text " + apex_AvgHrecoilTooltip + "x='64' y='111' text-anchor='middle' class='recoilValue'>" + viewkick_pattern_data_x_avg + "°</text>" +
                "</svg>";
        }
        return apex_recoilGraphic;
    } else {
        apex_recoilGraphic = apex_createNonPatternRecoilGraphic(viewkick_pattern_data_y_avg, viewkick_pattern_data_x_avg, viewkick_pattern_data_x_min,
            viewkick_pattern_data_x_max, viewkick_pattern_data_sizex_avg, viewkick_pattern_data_sizey_avg,
            viewkick_pitch_base, viewkick_pitch_random, viewkick_yaw_base, viewkick_yaw_random)
        return apex_recoilGraphic;

    }
}

function apex_createSpreadLabels(ads_move_speed_scale, zoom_time_in, zoom_time_out, zoom_fov){
    return "<div class='apex_spreadMoveLabel' "+ apex_ads_move_fov_Tooltip +"><span class='apex_lblSuffixText'>x</span>" + ads_move_speed_scale + "  |  " + zoom_fov + "°</div>" +
                 "<div class='apex_spreadBaseLabel'"+ apex_ads_zoom_Tooltip +">" + zoom_time_in + "<span class='apex_lblSuffixText'>s </span> | " + zoom_time_out + "<span class='apex_lblSuffixText'>s </span></div>";
}

function apex_createADSZoom(ads_move_speed_scale, zoom_time_in, zoom_time_out, zoom_fov) {
    return "";
    // rtnStr += "span class='apex_lblDeployTime'>" + weaponStats.deployfirst_time + "<span class='apex_lblSuffixText'> s</span><img class='apex_wpnSwitchImg' src='./pages/apex/icons/weapon_switch_small.png' alt=''><span class='apex_lblDeployTime'>" + weaponStats.deploy_time + "<span class='apex_lblSuffixText'>s</span><br><br><br><span class='apex_lblDeployTime_2'>" + formatWeaponValue(weaponStats.raise_time) + "<span class='apex_lblSuffixText'> s</span></span></span><span class='apex_lblDeployTime_4'>" + weaponStats.holster_time + "<span class='apex_lblSuffixText'>s</span></span></span>"

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

function apex_createShotgunBlastGraphic(weaponStats) {
    let shotgunGraphic = "";
    const horz_01_data = weaponStats['blast_pattern_data_x'];
    const vert_01_data = weaponStats['blast_pattern_data_y'];
    const blastPatternCount = weaponStats['blast_pattern_data_x'].length;
    shotgunGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;height: 100px;'>" +"";
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((30)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
    // shotgunGraphic += "<circle cx='50' cy='50' r='" + ((25)) + "' class='apex_shotgunSpreadLine2'></circle>" +"";
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((20)) + "' class='apex_shotgunSpreadLine2'></circle>" +"";
    // shotgunGraphic += "<circle cx='50' cy='50' r='" + ((15)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((10)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
    // shotgunGraphic += "<circle cx='50' cy='50' r='" + ((5)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
    for (let i = 0; i < blastPatternCount; i++){
        let horz_data = 0;
        let vert_data = 0;
        horz_data = (50+horz_01_data[i]);
        vert_data = (50 + (vert_01_data[i] * -1));
        shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (2).toString() + "' class='apex_shotgunHipPoint'></circle>" +" ";
        // console.log(weaponStats['printname'] + " Hip Scale" +defaultScale+ " X:" + horz_01_data[i] + " Y:" + vert_01_data[i] + " | X:" + (horz_01_data[i] * defaultScale) + " Y:" + (vert_01_data[i] * defaultScale));
    }
    if (weaponStats['blast_pattern_ads_scale'] !== undefined) {
        const ads_horz_01_data = weaponStats['blast_pattern_data_x_ads'];
        const ads_vert_01_data = weaponStats['blast_pattern_data_y_ads'];
        for (let i = 0; i < blastPatternCount; i++){
            let horz_data = 0;
            let vert_data = 0;
            horz_data = (50 + ads_horz_01_data[i]);
            vert_data = (50 + (ads_vert_01_data[i] * -1));
            shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (2).toString() + "' class='apex_shotgunADSPoint'></circle>" +" ";
            // console.log(weaponStats['printname'] + " ADS Scale" +ads_scale+ " X:" + horz_01_data[i] + " Y:" + vert_01_data[i] + " | X:" + (horz_01_data[i] * ads_scale) + " Y:" + (vert_01_data[i] * ads_scale));
        }
    } else if (parseFloat(weaponStats['charge_time']) > 0.0){
        const choke_horz_01_data = weaponStats['blast_pattern_data_x_choke_frac_1'];
        const choke_vert_01_data = weaponStats['blast_pattern_data_y_choke_frac_1'];
        const choke_horz_02_data = weaponStats['blast_pattern_data_x_choke_frac_2'];
        const choke_vert_02_data = weaponStats['blast_pattern_data_y_choke_frac_2'];
        const choke_horz_03_data = weaponStats['blast_pattern_data_x_choke_frac_3'];
        const choke_vert_03_data = weaponStats['blast_pattern_data_y_choke_frac_3'];
        const choke_horz_04_data = weaponStats['blast_pattern_data_x_choke_frac_4'];
        const choke_vert_04_data = weaponStats['blast_pattern_data_y_choke_frac_4'];
        for (let i = 0; i < blastPatternCount; i++){
            shotgunGraphic += "<circle cx='" + (50 + choke_horz_01_data[i]) + "' cy='" + (50 + (choke_vert_01_data[i] * -1)) + "' r='" + (2).toString() + "' class='apex_shotgunFrac1Point'></circle>" +" ";
        }
        for (let i = 0; i < blastPatternCount; i++){
            shotgunGraphic += "<circle cx='" + (50 + choke_horz_02_data[i]) + "' cy='" + (50 + (choke_vert_02_data[i] * -1)) + "' r='" + (2).toString() + "' class='apex_shotgunFrac2Point'></circle>" +" ";
        }
        for (let i = 0; i < blastPatternCount; i++){
            shotgunGraphic += "<circle cx='" + (50 + choke_horz_03_data[i]) + "' cy='" + (50 + (choke_vert_03_data[i] * -1)) + "' r='" + (2).toString() + "' class='apex_shotgunFrac3Point'></circle>" +" ";
        }
        for (let i = 0; i < blastPatternCount; i++){
            shotgunGraphic += "<circle cx='" + (50 + choke_horz_04_data[i]) + "' cy='" + (50 + (choke_vert_04_data[i] * -1)) + "' r='" + (2).toString() + "' class='apex_shotgunFrac4Point'></circle>" +" ";
        }
    }
    shotgunGraphic += "</svg>";
    return shotgunGraphic;
}

// function apex_createShotgunBlastGraphicx(weaponStats) {
//     let shotgunGraphic = "";
//     const defaultScale = weaponStats['blast_pattern_default_scale'];
//     let ads_scale;
//     if (weaponStats['blast_pattern_ads_scale'] !== undefined) {
//         ads_scale = weaponStats['blast_pattern_ads_scale'];
//     } else if (parseFloat(weaponStats['charge_time']) > 0.0){
//         ads_scale = 1.0;
//     } else {
//         ads_scale = defaultScale;
//     }
//     const horz_01_data = weaponStats['blast_pattern_data_x'];
//     const vert_01_data = weaponStats['blast_pattern_data_y'];
//     const blastPatternCount = weaponStats['blast_pattern_data_x'].length;
//     shotgunGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;height: 100px;'>" +"";
//     shotgunGraphic += "<circle cx='50' cy='50' r='" + ((30)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
//     // shotgunGraphic += "<circle cx='50' cy='50' r='" + ((25)) + "' class='apex_shotgunSpreadLine2'></circle>" +"";
//     shotgunGraphic += "<circle cx='50' cy='50' r='" + ((20)) + "' class='apex_shotgunSpreadLine2'></circle>" +"";
//     // shotgunGraphic += "<circle cx='50' cy='50' r='" + ((15)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
//     shotgunGraphic += "<circle cx='50' cy='50' r='" + ((10)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
//     // shotgunGraphic += "<circle cx='50' cy='50' r='" + ((5)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
//     for (let i = 0; i < blastPatternCount; i++){
//         let horz_data = 0;
//         let vert_data = 0;
//         horz_data = (50+(horz_01_data[i] * defaultScale));
//         vert_data = (50 + ((vert_01_data[i]* defaultScale) * -1));
//         shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (2).toString() + "' class='apex_shotgunHipPoint'></circle>" +" ";
//         // console.log(weaponStats['printname'] + " Hip Scale" +defaultScale+ " X:" + horz_01_data[i] + " Y:" + vert_01_data[i] + " | X:" + (horz_01_data[i] * defaultScale) + " Y:" + (vert_01_data[i] * defaultScale));
//     }
//     for (let i = 0; i < blastPatternCount; i++){
//         let horz_data = 0;
//         let vert_data = 0;
//         horz_data = (50+(horz_01_data[i] * ads_scale));
//         vert_data = (50 + ((vert_01_data[i]* ads_scale) * -1));
//         shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (2).toString() + "' class='apex_shotgunADSPoint'></circle>" +" ";
//         // console.log(weaponStats['printname'] + " ADS Scale" +ads_scale+ " X:" + horz_01_data[i] + " Y:" + vert_01_data[i] + " | X:" + (horz_01_data[i] * ads_scale) + " Y:" + (vert_01_data[i] * ads_scale));
//     }
//     shotgunGraphic += "</svg>";
//     return shotgunGraphic;
// }

//Second Shotgun Graph - More Accurate but doesn't looks as good.
// Think we might live with one that looks better on the chart and redirect to recoil pattern page where they can be
// graphed and shown properly
function apex_createShotgunBlastGraphic2(weaponStats) {
    let shotgunGraphic;
    const defaultScale = weaponStats['blast_pattern_default_scale'];
    let ads_scale;
    if (weaponStats['blast_pattern_ads_scale'] !== undefined) {
        ads_scale = weaponStats['blast_pattern_ads_scale'];
    } else if (parseFloat(weaponStats['charge_time']) > 0.0){
        ads_scale = 1.0;
    } else {
        ads_scale = defaultScale;
    }
    const horz_01_data = weaponStats['blast_pattern_data_x'];
    const vert_01_data = weaponStats['blast_pattern_data_y'];
    const blastPatternCount = weaponStats['blast_pattern_data_x'].length;
    shotgunGraphic = "<svg viewBox='0 0 100 100' style='width: 100px;height: 100px;'>" +""; //viewBox='15 15 70 70'
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((30)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((25)) + "' class='apex_shotgunSpreadLine2'></circle>" +"";
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((20)) + "' class='apex_shotgunSpreadLine2'></circle>" +"";
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((15)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((10)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
    shotgunGraphic += "<circle cx='50' cy='50' r='" + ((5)) + "' class='apex_shotgunSpreadLine'></circle>" +"";
    shotgunGraphic += "<circle cx='" + (-50).toString() + "' cy='" + (50).toString() + "' r='" + (0).toString() + "' class='apex_shotgunBlankPoint'></circle>" +" ";
    shotgunGraphic += "<circle cx='" + (-50).toString() + "' cy='" + (-50).toString() + "' r='" + (0).toString() + "' class='apex_shotgunBlankPoint'></circle>" +" ";
    shotgunGraphic += "<circle cx='" + (50).toString() + "' cy='" + (50).toString() + "' r='" + (0).toString() + "' class='apex_shotgunBlankPoint'></circle>" +" ";
    shotgunGraphic += "<circle cx='" + (50).toString() + "' cy='" + (-50).toString() + "' r='" + (0).toString() + "' class='apex_shotgunBlankPoint'></circle>" +" ";
    for (let i = 0; i < blastPatternCount; i++){
        let horz_data = 0;
        let vert_data = 0;
        if (horz_01_data[i] !== 0 && vert_01_data[i] !== 0) {
            horz_data = (horz_01_data[i] * -0.333333) + (50 + (horz_01_data[i] * defaultScale));
        } else {
            horz_data = (50 + (horz_01_data[i] * defaultScale));
        }
        if (horz_01_data[i] !== 0 && vert_01_data[i] !== 0) {
            vert_data = (vert_01_data[i] * 0.333333) + (50 + ((vert_01_data[i] * defaultScale)* -1));
        } else {
            vert_data = (50 + ((vert_01_data[i] * defaultScale)* -1));
        }
        shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (1).toString() + "' class='apex_shotgunHipPoint'></circle>" +" ";
        console.log(weaponStats['printname'] + " Hip Scale" +defaultScale+ " X:" + horz_01_data[i] + " Y:" + vert_01_data[i] + " | X:" + (horz_01_data[i] * defaultScale) + " Y:" + (vert_01_data[i] * defaultScale));
    }
    for (let i = 0; i < blastPatternCount; i++){
        let horz_data = 0;
        let vert_data = 0;
        if (horz_01_data[i] !== 0 && vert_01_data[i] !== 0) {
            horz_data = (horz_01_data[i] * -0.333333) + (50 + (horz_01_data[i] * ads_scale));
        } else {
            horz_data = (50 + (horz_01_data[i] * ads_scale));
        }
        if (horz_01_data[i] !== 0 && vert_01_data[i] !== 0) {
            vert_data = (vert_01_data[i] * 0.333333) + (50 + ((vert_01_data[i] * ads_scale)* -1));
        } else {
            vert_data = (50 + ((vert_01_data[i] * ads_scale)* -1));
        }
        shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (1).toString() + "' class='apex_shotgunADSPoint'></circle>" +" ";
        console.log(weaponStats['printname'] + " ADS Scale" +ads_scale+ " X:" + horz_01_data[i] + " Y:" + vert_01_data[i] + " | X:" + (horz_01_data[i] * ads_scale) + " Y:" + (vert_01_data[i] * ads_scale));
    }
    shotgunGraphic += "</svg>";
    return shotgunGraphic;
}

function apex_createHipSpreadGraphic(HIPSpread, spreadStandHipRun, spread_air_ads, spread_stand_ads, weaponClass, weaponStats){
    let spreadGraphic;
    let StandADS;
    if( weaponClass === "2") {
        spreadGraphic = apex_createShotgunBlastGraphic(weaponStats)
    } else if(weaponStats['blast_pattern'] !== undefined) {
        spreadGraphic = apex_createShotgunBlastGraphic(weaponStats)
    } else {
        const lineOffset = HIPSpread * 4;
        spreadGraphic = "";
        const AirSpread = (spread_air_ads * 4) + 1.5;
        if (spread_stand_ads <= 0.00) {
            StandADS = 0.001;
        } else {
            StandADS = (spread_stand_ads * 4) + 1.5;
        }

        if (HIPSpread > 0) {
            spreadGraphic = "<!--suppress HtmlUnknownAttribute --><svg viewBox='0 0 100 100' style='width:100px;'>" +

                "<circle cx='50' cy='50' r='" + (StandADS).toString() + "' class='apex_hipSpreadLine1'></circle>" +
                "<circle cx='50' cy='50' r='" + (AirSpread).toString() + "' class='apex_hipSpreadLine2'></circle>" +
                "<line x1='50' y1='" + (lineOffset + 50) + "' x2='50' y2='" + (lineOffset + 65) + "' class='apex_hipSpreadLine01'></line>" +
                "<line x1='50' y1='" + (50 - lineOffset) + "' x2='50' y2='" + (35 - lineOffset) + "' class='apex_hipSpreadLine01'></line>" +

                "<line y1='50' x1='" + (lineOffset + 50) + "' y2='50' x2='" + (lineOffset + 65) + "' class='apex_hipSpreadLine01'></line>" +
                "<line y1='50' x1='" + (50 - lineOffset) + "' y2='50' x2='" + (35 - lineOffset) + "' class='apex_hipSpreadLine01'></line>" +

                "<text x='3' y='99' class='apex_standADSSpreadValue'>" + spread_stand_ads.toFixed(2) + "°</text>" +
                "<text x='32' y='99' class='apex_spreadValueSeparator'>|</text>" +
                "<text x='36.5' y='99' class='apex_standHipSpreadValue'>" + HIPSpread.toFixed(2) + "°</text>" +
                "<text x='65.5' y='99' class='apex_spreadValueSeparator'>|</text>" +
                "<text x='70' y='99' class='apex_airHipSpreadValue'>" + spread_air_ads.toFixed(2) + "°</text>" +
                "</svg>";
        } else {
            spreadGraphic = "<!--suppress HtmlUnknownAttribute --><svg viewBox='0 0 100 100' style='width:75px;'>" +
                "<circle cx='50' cy='50' r='" + (spreadStandHipRun * 10).toString() + "' class='apex_hipSpreadLine'></circle>" +
                "<text x='5' y='23' class='apex_standHipSpreadValue'>" + spreadStandHipRun + "°</text>" +
                "</svg>";
        }
    }
    return spreadGraphic;
}


function apex_createSpreadTableGraphic(spread_stand_ads, spread_stand_hip, spread_stand_hip_run, spread_stand_hip_sprint,
                                       spread_crouch_ads, spread_crouch_hip, spread_air_ads, spread_air_hip, spread_kick_on_fire_stand_ads,
                                       spread_kick_on_fire_stand_hip, spread_kick_on_fire_crouch_ads, spread_kick_on_fire_crouch_hip,
                                       spread_kick_on_fire_air_ads, spread_kick_on_fire_air_hip, spread_decay_delay, spread_moving_decay_rate,
                                       spread_decay_rate, spread_moving_increase_rate){
    // This is the dumbest ever. Just want floats but normal ways were not working. to investigate
    let variable_array = [spread_stand_ads, spread_stand_hip, spread_stand_hip_run, spread_stand_hip_sprint,
        spread_crouch_ads, spread_crouch_hip, spread_air_ads, spread_air_hip, spread_kick_on_fire_stand_ads,
        spread_kick_on_fire_stand_hip, spread_kick_on_fire_crouch_ads, spread_kick_on_fire_crouch_hip,
        spread_kick_on_fire_air_ads, spread_kick_on_fire_air_hip, spread_decay_delay, spread_moving_decay_rate,
        spread_decay_rate, spread_moving_increase_rate];
    for (let i = 0; i < variable_array.length; i++){
        if (variable_array[i] === undefined){
            variable_array[i] = 0.0
        }
        if ( Number.isInteger(variable_array[i])){
            variable_array[i] = parseFloat(variable_array[i]).toFixed(1);
        }
    }
    spread_stand_ads  = variable_array[0];
    spread_stand_hip  = variable_array[1];
    spread_stand_hip_run  = variable_array[2];
    spread_stand_hip_sprint  = variable_array[3];
    spread_crouch_ads  = variable_array[4];
    spread_crouch_hip  = variable_array[5];
    spread_air_ads  = variable_array[6];
    spread_air_hip  = variable_array[7];
    spread_kick_on_fire_stand_ads  = variable_array[8];
    spread_kick_on_fire_stand_hip  = variable_array[9];
    spread_kick_on_fire_crouch_ads  = variable_array[10];
    spread_kick_on_fire_crouch_hip  = variable_array[11];
    spread_kick_on_fire_air_ads  = variable_array[11];
    spread_kick_on_fire_air_hip  = variable_array[12];
    spread_decay_delay  = variable_array[13];
    spread_moving_decay_rate  = variable_array[14];
    spread_decay_rate  = variable_array[15];
    spread_moving_increase_rate  = variable_array[16];

    return "<table class='apex_spreadTable'>" +
        "<tr>" + "<td></td><td>ADS</td><td>HIP</td>" + "</tr>" +
        "<tr " + apex_bulletSpeed01Tooltip + ">" + "<td rowspan='2'><img src='./img/standing.png' alt=''></td><td class='apex_spreadTableStandADSValue'>" + spread_stand_ads + "</td><td>" + spread_stand_hip + "</td>" +
        "<tr " + apex_bulletSpeed04Tooltip + ">" + "<td>" + spread_crouch_ads + "</td><td>" + spread_crouch_hip + "</td>" + "</tr>" +
        "<tr " + apex_bulletSpeed05Tooltip + ">" + "<td rowspan='3'><img src='./img/moving.png' alt=''></td><td class='apex_spreadTableAirHipValue'>" + spread_air_ads + "</td><td>" + spread_air_hip + "</td>" +
        "<tr>" + "<td>&nbsp-&nbsp</td><td class='apex_spreadTableStandHipValue' "+ apex_bulletSpeed02Tooltip+">" + spread_stand_hip_run + "</td>" + "</tr>" +
        "<tr>" + "<td>&nbsp-&nbsp</td><td class='apex_spreadTableLabels' " + apex_bulletSpeed03Tooltip+">" + spread_stand_hip_sprint + "</td>" + "</tr>" +
        "<tr>" + "<td class='apex_scaleIncreaseCell'><img src='./img/increase.png' alt=''></td><td class='apex_spreadTableLabels' " + apex_bulletSpeed10Tooltip + ">" + spread_moving_increase_rate + "</td><td class='apex_spreadTableLabels' " + apex_bulletSpeed10Tooltip + ">" + spread_moving_decay_rate + "</td>" + "</tr>" +
        "<tr " + apex_bulletSpeed06Tooltip + ">" + "<td class='scaleIncreaseCell' rowspan='3'><img src='./img/increase_x3.png' alt=''></td><td>" + spread_kick_on_fire_stand_ads + "</td><td>" + spread_kick_on_fire_stand_hip + "</td>" + "</tr>" +
        "<tr " + apex_bulletSpeed07Tooltip + ">" + "<td>" + spread_kick_on_fire_crouch_ads + "</td><td>" + spread_kick_on_fire_crouch_hip + "</td>" + "</tr>" +
        "<tr " + apex_bulletSpeed08Tooltip + ">" + "<td>" + spread_kick_on_fire_air_ads + "</td><td>" + spread_kick_on_fire_air_hip + "</td>" + "</tr>" +
        "<tr>" + "<td class='apex_scaleDecreaseCell'><img src='./img/decrease.png' alt=''></td><td class='apex_spreadTableLabels' " + apex_bulletSpeed09Tooltip + ">" + spread_decay_delay + "</td><td class='apex_spreadTableLabels' " + apex_bulletSpeed09Tooltip + ">" + spread_decay_rate + "</td>" + "</tr>" +
        "</table>";
}

function apex_createBurstLabels(burst_fire_count, burst_fire_delay) {
    if(burst_fire_count === undefined || parseFloat(burst_fire_count) < 1) {
        return "";
    } else {
        return "<span class='apex_lblSuffixText'>x</span>" + burst_fire_count;
    }

}

function apex_createChargeSpinUpLabels(weaponStats){
    if (weaponStats['charge_time'] !== undefined && parseFloat(weaponStats['charge_time']) > 0.0){
        return "<span "+ apex_chargeUpTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-n\"></span>" + weaponStats['charge_time'] + "<span class='apex_lblSuffixText'> s</span></span>" +
            "<span "+ apex_chargeCooldownDelayTooltip +"><span class=\"ui-icon ui-icon-transferthick-e-w\"></span><span>" + weaponStats['charge_cooldown_delay'] + "</span><span class='apex_lblSuffixText'> s</span></span>" +
            "<span "+ apex_chargeCooldownTimeTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-s\"></span><span>" + weaponStats['charge_cooldown_time'] +"</span><span class='apex_lblSuffixText'> s</span></span>";
    } else if (weaponStats['fire_rate_max_time_speedup'] !== undefined && parseFloat(weaponStats['fire_rate_max_time_speedup']) > 0.0){
        return "<span "+ apex_chargeSpinUpTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-n\"></span>" + weaponStats['fire_rate_max_time_speedup'] + "<span class='apex_lblSuffixText'> s</span></span>" +
            "<span "+ apex_chargeSpinUpCooldownTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-s\"></span><span>" + weaponStats['fire_rate_max_time_cooldown'] +"</span><span class='apex_lblSuffixText'> s</span></span>";
    } else {
        return " ";
    }
}

function apex_createFireRateLabels(weaponStats) {
    if(weaponStats['fire_rate_max'] === undefined) {
        return ""+weaponStats['effective_fire_rate'] +"";
    } else {
        var max_effective_rof = parseFloat(weaponStats['fire_rate_max']) * 60;
        var min_effective_rof = parseFloat(weaponStats['fire_rate']) * 60;
        return ""+ min_effective_rof +" - " + max_effective_rof +"";
    }
}


// TODO: Actually make the damage charts make sense. At  the moment a lot of stuff is just hard set to make work with what exists.
function apex_createDamageChart(printname, damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    max_hs_distance = (max_hs_distance / 39.3701);
    var damageChart;
    if((damageArr[0] * hs_multi) > 200) {
        damageChart = apex_createDamageChart300Max(damageArr, distanceArr, hs_multi, ls_multi, allow_hs, max_hs_distance);
    } else if((damageArr[0] * hs_multi) > 100) {
        damageChart = apex_createDamageChart150Max(damageArr, distanceArr, hs_multi, ls_multi, allow_hs, max_hs_distance);
    } else {
        if ((damageArr[0] * hs_multi) > 50 ){
            if(distanceArr.indexOf(200) === -1){
                damageChart = apex_createDamageChart100Max(damageArr, distanceArr, hs_multi, ls_multi, allow_hs, max_hs_distance);
            } else {
                damageChart = apex_createDamageChart100Max200Dist(damageArr, distanceArr, hs_multi, ls_multi, allow_hs, max_hs_distance);
            }
        } else {
            damageChart = apex_createDamageChart50Max(damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance)
        }
    }
    return damageChart;
}

function apex_createDamageChart50Max(damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    var damageLineCoords = "";
    var hs_damageLineCoords = "";
    var ls_damageLineCoords = "";
    var hs_maxDamageText = "";
    var hs_minDamageText = "";
    var ls_maxDamageText = "";
    var ls_minDamageText = "";

    //Standard Damage
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
    if(damageArr[0] > 80){
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (118 - (2 * maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (96 - (2 * maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    }
    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (2 * minDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='183' y='" + (96 - (2 * minDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    }
    var pelletsLabel = "";
    if (numOfPellets > 1){
        pelletsLabel = "<text x='135' y='65' class='apex_chartMinMaxLabel'>" + numOfPellets + " pellets</text>";
    }

    //Limb Damage
    if(ls_multi !== 1) {
        ls_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (100 - (2 * (damageArr[0] * ls_multi))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            var ls_damageCoord = 100 - (2 * (damageArr[i] * ls_multi));
            var ls_distanceCoord = 2 * distanceArr[i];
            ls_damageLineCoords += ls_distanceCoord.toString() + "," + ls_damageCoord.toString() + " ";
        }
        ls_damageLineCoords += "200," + (100 - (2 * (damageArr[damageArr.length - 1] * ls_multi))).toString();

        var ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        var ls_minDamage = Math.round(damageArr[damageArr.length - 1] * ls_multi);

        var ls_maxDamageText = "";
        if (damageArr[0] > 40) {
            ls_maxDamageText = "<text x='" + (distanceArr[1] - 20 )+ "' y='" + (136 - (2 * ls_maxDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        } else {
            ls_maxDamageText = "<text x='" + (distanceArr[1] - 20)  + "' y='" + (114 - (2 * ls_maxDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        }

        var ls_minDamageText = "";
        if (distanceArr[distanceArr.length - 1] < 100) {
            ls_minDamageText = "<text x='" + ((distanceArr[distanceArr.length - 1] * 2) - 20) + "' y='" + (114 - (2 * ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        } else {
            ls_minDamageText = "<text x='163' y='" + (114 - (2 * ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        }
    }

    //Headshot Damage - Some weapons have very short max HS range.
    if(allow_hs && hs_multi > 1.0) {
        var damage_reduced = false;
        var max_hs_damage_x = distanceArr[1];
        hs_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (100 - (2 * (damageArr[0] * hs_multi))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            if(distanceArr[i] > max_hs_distance) {
                if (!damage_reduced){
                    var hs_damageCoord = 100 - (2 * (damageArr[i] * hs_multi));
                    var hs_distanceCoord = 2 * max_hs_distance;
                    hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
                    var hs_damageCoord = 100 - (2 * damageArr[0]);
                    var hs_distanceCoord = 2 * max_hs_distance;
                    hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
                    damage_reduced = true;
                }
                var hs_damageCoord = 100 - (2 * damageArr[i]);
                var hs_distanceCoord = 2 * max_hs_distance;
                hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
            } else {
                var hs_damageCoord = 100 - (2 * (damageArr[i] * hs_multi));
                var hs_distanceCoord = 2 * distanceArr[i];
                hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
            }
        }
        if (max_hs_distance < 100){
            if (!damage_reduced){
                var hs_damageCoord = 100 - (2 * (damageArr[damageArr.length - 1] * hs_multi));
                var hs_distanceCoord = 2 * max_hs_distance;
                hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
                var hs_damageCoord = 100 - (2 * damageArr[damageArr.length - 1]);
                var hs_distanceCoord = 2 * max_hs_distance;
                hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
                damage_reduced = true;
            }
            max_hs_damage_x = (2 * max_hs_distance) + 5;
            hs_damageLineCoords += "200," + (100 - (2 * damageArr[damageArr.length - 1])).toString();
            var hs_minDamage = "";
            hs_minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (2 * hs_minDamage)).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_minDamage + "</text>";
        } else {
            hs_damageLineCoords += "200," + (100 - (2 * (damageArr[damageArr.length - 1] * hs_multi))).toString();
            var hs_minDamage = Math.round(damageArr[damageArr.length - 1] * hs_multi);
            hs_minDamageText = "<text x='183' y='" + (96 - (2 * hs_minDamage)).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_minDamage + "</text>";
        }
        var hs_maxDamage = Math.round(damageArr[0] * hs_multi);

        if ((damageArr[0] * hs_multi) > 40) {
            hs_maxDamageText = "<text x='" + max_hs_damage_x + "' y='" + (118 - (2 * hs_maxDamage)).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_maxDamage + "</text>";
        } else {
            hs_maxDamageText = "<text x='" + max_hs_damage_x + "' y='" + (96 - (2 * hs_maxDamage)).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_maxDamage + "</text>";
        }
    }

    return "<svg viewbox='0 0 200 100' class='apex_damageChart'>" +
        "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

        "<line x1='10' y1='0' x2='10' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='20' y1='0' x2='20' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='30' y1='0' x2='30' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='40' y1='0' x2='40' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='60' y1='0' x2='60' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='70' y1='0' x2='70' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='80' y1='0' x2='80' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='90' y1='0' x2='90' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='110' y1='0' x2='110' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='120' y1='0' x2='120' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='130' y1='0' x2='130' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='140' y1='0' x2='140' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='160' y1='0' x2='160' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='170' y1='0' x2='170' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='180' y1='0' x2='180' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='190' y1='0' x2='190' y2='100' class='apex_gridLineThin'/>" +

        "<line x1='50' y1='0' x2='50' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='100' y1='0' x2='100' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='150' y1='0' x2='150' y2='100' class='apex_gridLineFat'/>" +

        "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='58' class='apex_chartLabel'>25</text>" +
        "<line x1='0' y1='33' x2='200' y2='33' style='stroke:rgb(175,175,175); stroke-width:.25'/>" +
        "<text x='0' y='41' class='apex_chartLabel'>33</text>" +
        "<text x='0' y='8' class='apex_chartLabel'>50</text>" +

        "<text x='51' y='99' class='apex_chartLabel'>25m</text>" +
        "<text x='101' y='99' class='apex_chartLabel'>50m</text>" +
        "<text x='151' y='99' class='apex_chartLabel'>75m</text>" +

        "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'/>" +
        maxDamageText +
        minDamageText +
        pelletsLabel +
        "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'/>" +
        hs_maxDamageText +
        hs_minDamageText +
        "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCoords + "'/>" +
        ls_maxDamageText +
        ls_minDamageText +
        "</svg>"
}

function apex_createDamageChart100Max(damageArr, distanceArr, hs_multi, ls_multi, allow_hs, max_hs_distance){
    var damageLineCoords = "";
    var hs_damageLineCoords = "";
    var ls_damageLineCoords = "";
    var hs_maxDamageText = "";
    var hs_minDamageText = "";
    var ls_maxDamageText = "";
    var ls_minDamageText = "";

    //Standard Damage
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
    if(damageArr[0] > 40){
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (118 - (maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='40' y='" + (95 - (maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    }
    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (minDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='113' y='" + (95 - (minDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    }

    //Limb Damage
    if(ls_multi !== 1) {
        ls_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (100 - ((damageArr[0] * ls_multi))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            var ls_damageCoord = 100 - (damageArr[i] * ls_multi);
            var ls_distanceCoord = 2 * distanceArr[i];
            ls_damageLineCoords += ls_distanceCoord.toString() + "," + ls_damageCoord.toString() + " ";
        }
        ls_damageLineCoords += "200," + (100 - (damageArr[damageArr.length - 1] * ls_multi)).toString();

        var ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        var ls_minDamage = Math.round(damageArr[damageArr.length - 1] * ls_multi);

        var ls_maxDamageText = "";
        if (damageArr[0] > 40) {
            ls_maxDamageText = "<text x='" + (distanceArr[1] - 20 )+ "' y='" + (114 - (ls_maxDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        } else {
            ls_maxDamageText = "<text x='23' y='" + (144 - (2 * ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        }

        var ls_minDamageText = "";
        if (distanceArr[distanceArr.length - 1] < 100) {
            ls_minDamageText = "<text x='" + ((distanceArr[distanceArr.length - 1] * 2) - 20) + "' y='" + (114 - (ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>G" + ls_minDamage + "</text>";
        } else {
            ls_minDamageText = "<text x='63' y='" + (144 - (2 * ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        }
    }

    //Headshot Damage - Some weapons have very short max HS range.
    if(allow_hs && hs_multi > 1.0) {
        var damage_reduced = false;
        var max_hs_damage_x = distanceArr[1];
        hs_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (100 - ((damageArr[0] * hs_multi))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            if(distanceArr[i] > max_hs_distance) {
                if (!damage_reduced){
                    var hs_damageCoord = 100 - (damageArr[i] * hs_multi);
                    var hs_distanceCoord = 2 * max_hs_distance;
                    hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
                    var hs_damageCoord = 100 - damageArr[0];
                    var hs_distanceCoord = 2 * max_hs_distance;
                    hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
                    damage_reduced = true;
                }
                var hs_damageCoord = 100 - damageArr[i];
                var hs_distanceCoord = 2 * max_hs_distance;
                hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
            } else {
                var hs_damageCoord = 100 - (damageArr[i] * hs_multi);
                var hs_distanceCoord = 2 * distanceArr[i];
                hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
            }
        }
        if (max_hs_distance > 300){
            max_hs_damage_x = (2 * max_hs_distance) + 5;
            hs_damageLineCoords += "200," + (100 - damageArr[damageArr.length - 1]).toString();
            var hs_minDamage = Math.round(damageArr[damageArr.length - 1] * hs_multi);
            hs_minDamageText = "<text x='125' y='" + (96 - hs_minDamage).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_minDamage + "</text>";
        } else {
            hs_damageLineCoords += "200," + (100 - (damageArr[damageArr.length - 1] * hs_multi)).toString();
            var hs_minDamage = Math.round(damageArr[damageArr.length - 1] * hs_multi);
            hs_minDamageText = "<text x='199' y='" + (118 - hs_minDamage).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_minDamage + "</text>";
        }
        var hs_maxDamage = Math.round(damageArr[0] * hs_multi);

        if ((damageArr[0] * hs_multi) > 70) {
            hs_maxDamageText = "<text x='" + max_hs_damage_x + "' y='" + (118 - hs_maxDamage).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_maxDamage + "</text>";
        } else {
            hs_maxDamageText = "<text x='85' y='" + (96 - hs_maxDamage).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_maxDamage + "</text>";
        }
    }

    return "<svg viewbox='0 0 200 100' class='apex_damageChart'>" +
        "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

        "<line x1='10' y1='0' x2='10' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='20' y1='0' x2='20' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='30' y1='0' x2='30' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='40' y1='0' x2='40' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='60' y1='0' x2='60' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='70' y1='0' x2='70' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='80' y1='0' x2='80' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='90' y1='0' x2='90' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='110' y1='0' x2='110' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='120' y1='0' x2='120' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='130' y1='0' x2='130' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='140' y1='0' x2='140' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='160' y1='0' x2='160' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='170' y1='0' x2='170' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='180' y1='0' x2='180' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='190' y1='0' x2='190' y2='100' class='apex_gridLineThin'/>" +

        "<line x1='50' y1='0' x2='50' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='100' y1='0' x2='100' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='150' y1='0' x2='150' y2='100' class='apex_gridLineFat'/>" +

        "<text x='0' y='8' class='apex_chartLabel'>100</text>" +
        "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='58' class='apex_chartLabel'>50</text>" +

        "<text x='51' y='99' class='apex_chartLabel'>25m</text>" +
        "<text x='101' y='99' class='apex_chartLabel'>50m</text>" +
        "<text x='151' y='99' class='apex_chartLabel'>75m</text>" +

        "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'/>" +
        maxDamageText +
        minDamageText +
        "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'/>" +
        hs_maxDamageText +
        hs_minDamageText +
        "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCoords + "'/>" +
        ls_maxDamageText +
        ls_minDamageText +
        "</svg>"
}

function apex_createDamageChart150Max(damageArr, distanceArr, hs_multi, ls_multi, allow_hs, max_hs_distance){
    var damageLineCoords = "";
    var hs_damageLineCoords = "";
    var ls_damageLineCoords = "";
    var hs_maxDamageText = "";
    var hs_minDamageText = "";
    var ls_maxDamageText = "";
    var ls_minDamageText = "";

    //Standard Damage
    damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (1.333333 * (100 - damageArr[0])) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = (1.333333 * (100 - damageArr[0]));
        var distanceCoord = 1.5 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (1.333333 * (100 - damageArr[damageArr.length - 1])).toString();
    var maxDamage = Math.round(damageArr[0]);
    var minDamage = Math.round(damageArr[damageArr.length - 1]);
    var maxDamageText = "";
    if(damageArr[0] > 80){
        maxDamageText = "<text x='40' y='" + (-1*(1.333333 * (100 - damageArr[0]))).toString() + "' class='apex_chartMinMaxLabel'>d" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='125' y='56' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    }
    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='48' y='56' class='apex_chartMinMaxLabel'>b" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='48' y='56' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    }

    //Limb Damage
    if(ls_multi !== 1) {
        ls_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (-1*(-1.333333 * (100 - (damageArr[0] * ls_multi)))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            var ls_damageCoord = -1*(-1.333333 * (100 - (damageArr[i] * ls_multi)));
            var ls_distanceCoord = 1.5 * distanceArr[i];
            ls_damageLineCoords += ls_distanceCoord.toString() + "," + ls_damageCoord.toString() + " ";
        }
        ls_damageLineCoords += "200," + (0.5 + (1.5 * (damageArr[damageArr.length - 1] * ls_multi))).toString();

        var ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        var ls_minDamage = Math.round(damageArr[damageArr.length - 1] * ls_multi);

        var ls_maxDamageText = "";
        if (damageArr[0] > 40) {
            ls_maxDamageText = "<text x='25' y='" + (12 - (-1.333333 *(100 -  ls_maxDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        } else {
            ls_maxDamageText = "<text x='25' y='" + (1 - (-1.333333 *(100 - ls_maxDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>B" + ls_maxDamage + "</text>";
        }

        var ls_minDamageText = "";
        if (distanceArr[distanceArr.length - 1] < 100) {
            ls_minDamageText = "<text x='" + (-1*(-1.333333 * (100 - (damageArr[0] * ls_multi)))).toString() + "' y='" + (114 - (-1.333333 * (100 - ls_minDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>X" + ls_minDamage + "</text>";
        } else {
            ls_minDamageText = "<text x='75' y='" + (12 - (-1.333333 *(100 -  ls_maxDamage))).toString()  + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        }
    }

    //Headshot Damage - Some weapons have very short max HS range.
    if(allow_hs && hs_multi > 1.0) {
        var damage_reduced = false;
        var max_hs_damage_x = distanceArr[1];
        hs_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (-1.333333 * (100 - (damageArr[0] * hs_multi))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            var hs_damageCoord = -1.333333 * (100 - (damageArr[i] * hs_multi));
            var hs_distanceCoord = 1.5 * distanceArr[i];
            hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
        }
        if (max_hs_distance < 100){
            max_hs_damage_x = (0.5 * max_hs_distance) + 5;
            hs_damageLineCoords += "200," + (-1.333333 * (100 - damageArr[damageArr.length - 1])).toString();
            var hs_minDamage = "";
            hs_minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 1) + "' y='" + (96 - (-1.333333 * (100 -  hs_minDamage))).toString() + "' class='apex_hs_chartMinMaxLabel'>D" + hs_minDamage + "</text>";
        } else {
            hs_damageLineCoords += "200," + (-1.333333 * (100 - (damageArr[damageArr.length - 1] * hs_multi))).toString();
            var hs_minDamage = Math.round(damageArr[damageArr.length - 1] * hs_multi);
            hs_minDamageText = "<text x='175' y='20' class='apex_hs_chartMinMaxLabel'>" + hs_minDamage + "</text>";
        }
        var hs_maxDamage = Math.round(damageArr[0] * hs_multi);

        if ((damageArr[0] * hs_multi) > 40) {
            hs_maxDamageText = "<text x='75' y='20' class='apex_hs_chartMinMaxLabel'>" + hs_maxDamage + "</text>";
        } else {
            hs_maxDamageText = "<text x='100' y='90' class='apex_hs_chartMinMaxLabel'>A" + hs_maxDamage + "</text>";
        }
    }
    return "<svg viewbox='0 0 200 100' class='apex_damageChart'>" +
        "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

        "<line x1='10' y1='0' x2='10' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='20' y1='0' x2='20' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='30' y1='0' x2='30' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='40' y1='0' x2='40' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='60' y1='0' x2='60' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='70' y1='0' x2='70' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='80' y1='0' x2='80' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='90' y1='0' x2='90' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='110' y1='0' x2='110' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='120' y1='0' x2='120' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='130' y1='0' x2='130' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='140' y1='0' x2='140' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='160' y1='0' x2='160' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='170' y1='0' x2='170' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='180' y1='0' x2='180' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='190' y1='0' x2='190' y2='100' class='apex_gridLineThin'/>" +

        "<line x1='50' y1='0' x2='50' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='100' y1='0' x2='100' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='150' y1='0' x2='150' y2='100' class='apex_gridLineFat'/>" +

        "<text x='0' y='8' class='apex_chartLabel'>150</text>" +
        "<line x1='0' y1='33.333333' x2='200' y2='33.333333' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='41' class='apex_chartLabel'>100</text>" +
        "<line x1='0' y1='66.666666' x2='200' y2='66.666666' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='74' class='apex_chartLabel'>50</text>" +
        "<line x1='0' y1='100' x2='200' y2='100' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='108' class='apex_chartLabel'>50</text>" +
        "<line x1='0' y1='133.333333' x2='200' y2='133.333333' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='141' class='apex_chartLabel'>25</text>" +

        "<text x='51' y='99' class='apex_chartLabel'>25m</text>" +
        "<text x='101' y='99' class='apex_chartLabel'>50m</text>" +
        "<text x='151' y='99' class='apex_chartLabel'>75m</text>" +

        "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'/>" +
        maxDamageText +
        minDamageText +
        "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'/>" +
        hs_maxDamageText +
        hs_minDamageText +
        "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCoords + "'/>" +
        ls_maxDamageText +
        ls_minDamageText +
        "</svg>"
}


function apex_createDamageChart300Max(damageArr, distanceArr, hs_multi, ls_multi, allow_hs, max_hs_distance){
    var damageLineCoords = "";
    var hs_damageLineCoords = "";
    var ls_damageLineCoords = "";
    var hs_maxDamageText = "";
    var hs_minDamageText = "";
    var ls_maxDamageText = "";
    var ls_minDamageText = "";

    //Standard Damage
    damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (0.333333 * (300 - damageArr[0])) + " ";
    for (var i = 0; i < damageArr.length; i++){
        var damageCoord = (0.333333 * (300 - damageArr[0]));
        var distanceCoord = 1.5 * distanceArr[i];
        damageLineCoords += distanceCoord.toString() + "," + damageCoord.toString() + " ";
    }
    damageLineCoords += "200," + (0.333333 * (300 - damageArr[damageArr.length - 1])).toString();
    var maxDamage = Math.round(damageArr[0]);
    var minDamage = Math.round(damageArr[damageArr.length - 1]);
    var maxDamageText = "";
    if(damageArr[0] > 80){
        maxDamageText = "<text x='48' y='" + (-1*(1.333333 * (100 - damageArr[0]))).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='125' y='64' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    }
    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='48' y='64' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='100' y='" + (-1*(1.333333 * (100 - damageArr[0]))).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    }

    //Limb Damage
    if(ls_multi !== 1) {
        ls_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (-1*(-1.333333 * (175 - (damageArr[0] * ls_multi)))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            var ls_damageCoord = -1*(-1.333333 * (175 - (damageArr[i] * ls_multi)));
            var ls_distanceCoord = 1.5 * distanceArr[i];
            ls_damageLineCoords += ls_distanceCoord.toString() + "," + ls_damageCoord.toString() + " ";
        }
        ls_damageLineCoords += "200," + (0.5 + (1.5 * (damageArr[damageArr.length - 1] * ls_multi))).toString();

        var ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        var ls_minDamage = Math.round(damageArr[damageArr.length - 1] * ls_multi);

        var ls_maxDamageText = "";
        if (damageArr[0] > 40) {
            ls_maxDamageText = "<text x='25' y='" + (12 - (-1.333333 *(175 -  ls_maxDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        } else {
            ls_maxDamageText = "<text x='25' y='" + (1 - (-1.333333 *(175 - ls_maxDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>B" + ls_maxDamage + "</text>";
        }

        var ls_minDamageText = "";
        if (distanceArr[distanceArr.length - 1] < 100) {
            ls_minDamageText = "<text x='" + (-1*(-1.333333 * (175 - (damageArr[0] * ls_multi)))).toString() + "' y='" + (114 - (-1.333333 * (100 - ls_minDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>X" + ls_minDamage + "</text>";
        } else {
            ls_minDamageText = "<text x='75' y='" + (12 - (-1.333333 *(175 -  ls_maxDamage))).toString()  + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        }
    }

    //Headshot Damage - Some weapons have very short max HS range.
    if(allow_hs && hs_multi > 1.0) {
        var damage_reduced = false;
        var max_hs_damage_x = distanceArr[1];
        hs_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (0.333333 * (300 - (damageArr[0] * hs_multi))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            var hs_damageCoord = 0.333333 * (300 - (damageArr[i] * hs_multi));
            var hs_distanceCoord = 1.5 * distanceArr[i];
            hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
        }
        if (max_hs_distance < 100){
            max_hs_damage_x = (0.5 * max_hs_distance) + 5;
            hs_damageLineCoords += "200," + (-1.333333 * (100 - damageArr[damageArr.length - 1])).toString();
            var hs_minDamage = "";
            hs_minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 1) + "' y='" + (96 - (-1.333333 * (100 -  hs_minDamage))).toString() + "' class='apex_hs_chartMinMaxLabel'>D" + hs_minDamage + "</text>";
        } else {
            hs_damageLineCoords += "200," + (-1.333333 * (100 - (damageArr[damageArr.length - 1] * hs_multi))).toString();
            var hs_minDamage = Math.round(damageArr[damageArr.length - 1] * hs_multi);
            hs_minDamageText = "<text x='175' y='20' class='apex_hs_chartMinMaxLabel'>" + hs_minDamage + "</text>";
        }
        var hs_maxDamage = Math.round(damageArr[0] * hs_multi);

        if ((damageArr[0] * hs_multi) > 40) {
            hs_maxDamageText = "<text x='75' y='20' class='apex_hs_chartMinMaxLabel'>" + hs_maxDamage + "</text>";
        } else {
            hs_maxDamageText = "<text x='100' y='90' class='apex_hs_chartMinMaxLabel'>A" + hs_maxDamage + "</text>";
        }
    }
    return "<svg viewbox='0 0 200 100' class='apex_damageChart'>" +
        "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

        "<line x1='10' y1='0' x2='10' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='20' y1='0' x2='20' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='30' y1='0' x2='30' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='40' y1='0' x2='40' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='60' y1='0' x2='60' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='70' y1='0' x2='70' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='80' y1='0' x2='80' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='90' y1='0' x2='90' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='110' y1='0' x2='110' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='120' y1='0' x2='120' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='130' y1='0' x2='130' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='140' y1='0' x2='140' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='160' y1='0' x2='160' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='170' y1='0' x2='170' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='180' y1='0' x2='180' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='190' y1='0' x2='190' y2='100' class='apex_gridLineThin'/>" +

        "<line x1='50' y1='0' x2='50' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='100' y1='0' x2='100' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='150' y1='0' x2='150' y2='100' class='apex_gridLineFat'/>" +

        "<text x='0' y='8' class='apex_chartLabel'>300</text>" +
        "<line x1='0' y1='33.333333' x2='200' y2='33.333333' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='41' class='apex_chartLabel'>200</text>" +
        "<line x1='0' y1='66.666666' x2='200' y2='66.666666' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='74' class='apex_chartLabel'>100</text>" +
        "<line x1='0' y1='100' x2='200' y2='100' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        // "<text x='0' y='108' class='apex_chartLabel'>50</text>" +
        // "<line x1='0' y1='133.333333' x2='200' y2='133.333333' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        // "<text x='0' y='141' class='apex_chartLabel'>25</text>" +
        //
        // "<text x='51' y='99' class='apex_chartLabel'>25m</text>" +
        // "<text x='101' y='99' class='apex_chartLabel'>50m</text>" +
        // "<text x='151' y='99' class='apex_chartLabel'>75m</text>" +

        "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'/>" +
        maxDamageText +
        minDamageText +
        "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'/>" +
        hs_maxDamageText +
        hs_minDamageText +
        "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCoords + "'/>" +
        ls_maxDamageText +
        ls_minDamageText +
        "</svg>"
}
function apex_createDamageChart100Max200Dist(damageArr, distanceArr){
    var damageLineCoords = "";
    damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," +(50 - (2 * damageArr[0])) + " ";
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
            maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (122 - (maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
        } else {
            maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (118 - (maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
        }
    } else {
        maxDamageText = "<text x='" + distanceArr[1]/2 + "' y='" + (96 - (maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    }

    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (minDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='183' y='" + (96 - (minDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    }

    return "<svg viewbox='0 0 200 100' class='apex_damageChart'>" +
        "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

        "<line x1='10' y1='0' x2='10' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='20' y1='0' x2='20' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='30' y1='0' x2='30' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='40' y1='0' x2='40' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='60' y1='0' x2='60' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='70' y1='0' x2='70' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='80' y1='0' x2='80' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='90' y1='0' x2='90' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='110' y1='0' x2='110' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='120' y1='0' x2='120' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='130' y1='0' x2='130' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='140' y1='0' x2='140' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='160' y1='0' x2='160' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='170' y1='0' x2='170' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='180' y1='0' x2='180' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='190' y1='0' x2='190' y2='100' class='apex_gridLineThin'/>" +

        "<line x1='50' y1='0' x2='50' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='100' y1='0' x2='100' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='150' y1='0' x2='150' y2='100' class='apex_gridLineFat'/>" +

        "<text x='0' y='8' class='apex_chartLabel'>100</text>" +
        "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='58' class='apex_chartLabel'>50</text>" +

        "<text x='51' y='99' class='apex_chartLabel200Dist'>50m</text>" +
        "<text x='101' y='99' class='apex_chartLabel200Dist'>100m</text>" +
        "<text x='151' y='99' class='apex_chartLabel200Dist'>150m</text>" +

        "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'/>" +
        maxDamageText +
        minDamageText +
        "</svg>";
}

function apex_createDamageChart200Max200Dist(damageArr, distanceArr, hs_multi, ls_multi, allow_hs, max_hs_distance){
    var damageLineCoords = "";
    var hs_damageLineCoords = "";
    var ls_damageLineCoords = "";
    var hs_maxDamageText = "";
    var hs_minDamageText = "";
    var ls_maxDamageText = "";
    var ls_minDamageText = "";

    //Standard Damage
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
    if(damageArr[0] > 40){
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (118 - (maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    } else {
        maxDamageText = "<text x='" + distanceArr[1] + "' y='" + (96 - (maxDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + maxDamage + "</text>";
    }
    var minDamageText = "";
    if(distanceArr[distanceArr.length - 1] < 100){
        minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - (minDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    } else {
        minDamageText = "<text x='183' y='" + (96 - (minDamage)).toString() + "' class='apex_chartMinMaxLabel'>" + minDamage + "</text>";
    }

    //Limb Damage
    if(ls_multi !== 1) {
        ls_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (100 - ((damageArr[0] * ls_multi))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            var ls_damageCoord = 100 - (damageArr[i] * ls_multi);
            var ls_distanceCoord = 2 * distanceArr[i];
            ls_damageLineCoords += ls_distanceCoord.toString() + "," + ls_damageCoord.toString() + " ";
        }
        ls_damageLineCoords += "200," + (100 - (damageArr[damageArr.length - 1] * ls_multi)).toString();

        var ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        var ls_minDamage = Math.round(damageArr[damageArr.length - 1] * ls_multi);

        var ls_maxDamageText = "";
        if (damageArr[0] > 40) {
            ls_maxDamageText = "<text x='" + (distanceArr[1] - 20 )+ "' y='" + (136 - (ls_maxDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        } else {
            ls_maxDamageText = "<text x='" + (distanceArr[1] - 20)  + "' y='" + (114 - (ls_maxDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        }

        var ls_minDamageText = "";
        if (distanceArr[distanceArr.length - 1] < 100) {
            ls_minDamageText = "<text x='" + ((distanceArr[distanceArr.length - 1] * 2) - 20) + "' y='" + (114 - (ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        } else {
            ls_minDamageText = "<text x='163' y='" + (114 - (2 * ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        }
    }

    //Headshot Damage - Some weapons have very short max HS range.
    if(allow_hs && hs_multi > 1.0) {
        var damage_reduced = false;
        var max_hs_damage_x = distanceArr[1];
        hs_damageLineCoords = distanceArr[0] === 0.0 ? "" : "0," + (100 - ((damageArr[0] * hs_multi))) + " ";
        for (var i = 0; i < damageArr.length; i++) {
            if(distanceArr[i] > max_hs_distance) {
                if (!damage_reduced){
                    var hs_damageCoord = 100 - (damageArr[i] * hs_multi);
                    var hs_distanceCoord = 2 * max_hs_distance;
                    hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
                    var hs_damageCoord = 0.5 + damageArr[0];
                    var hs_distanceCoord = 2 * max_hs_distance;
                    hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
                    damage_reduced = true;
                }
                var hs_damageCoord = 100 - damageArr[i];
                var hs_distanceCoord = 2 * max_hs_distance;
                hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
            } else {
                var hs_damageCoord = 100 - (damageArr[i] * hs_multi);
                var hs_distanceCoord = 2 * distanceArr[i];
                hs_damageLineCoords += hs_distanceCoord.toString() + "," + hs_damageCoord.toString() + " ";
            }
        }
        if (max_hs_distance < 150){
            max_hs_damage_x = (2 * max_hs_distance) + 5;
            hs_damageLineCoords += "200," + (100 - damageArr[damageArr.length - 1]).toString();
            var hs_minDamage = "";
            hs_minDamageText = "<text x='" + (distanceArr[distanceArr.length - 1] * 2) + "' y='" + (96 - hs_minDamage).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_minDamage + "</text>";
        } else {
            hs_damageLineCoords += "200," + (100 - (damageArr[damageArr.length - 1] * hs_multi)).toString();
            var hs_minDamage = Math.round(damageArr[damageArr.length - 1] * hs_multi);
            hs_minDamageText = "<text x='183' y='" + (118 - hs_minDamage).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_minDamage + "</text>";
        }
        var hs_maxDamage = Math.round(damageArr[0] * hs_multi);

        if ((damageArr[0] * hs_multi) > 40) {
            hs_maxDamageText = "<text x='" + max_hs_damage_x + "' y='" + (118 - hs_maxDamage).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_maxDamage + "</text>";
        } else {
            hs_maxDamageText = "<text x='" + max_hs_damage_x + "' y='" + (96 - hs_maxDamage).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_maxDamage + "</text>";
        }
    }

    return "<svg viewbox='0 0 200 100' class='apex_damageChart'>" +
        "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' />" +

        "<line x1='10' y1='0' x2='10' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='20' y1='0' x2='20' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='30' y1='0' x2='30' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='40' y1='0' x2='40' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='60' y1='0' x2='60' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='70' y1='0' x2='70' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='80' y1='0' x2='80' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='90' y1='0' x2='90' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='110' y1='0' x2='110' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='120' y1='0' x2='120' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='130' y1='0' x2='130' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='140' y1='0' x2='140' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='160' y1='0' x2='160' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='170' y1='0' x2='170' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='180' y1='0' x2='180' y2='100' class='apex_gridLineThin'/>" +
        "<line x1='190' y1='0' x2='190' y2='100' class='apex_gridLineThin'/>" +

        "<line x1='50' y1='0' x2='50' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='100' y1='0' x2='100' y2='100' class='apex_gridLineFat'/>" +
        "<line x1='150' y1='0' x2='150' y2='100' class='apex_gridLineFat'/>" +

        "<text x='0' y='8' class='apex_chartLabel'>150</text>" +
        "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175); stroke-width:.5'/>" +
        "<text x='0' y='58' class='apex_chartLabel'>100</text>" +

        "<text x='51' y='99' class='apex_chartLabel'>50m</text>" +
        "<text x='101' y='99' class='apex_chartLabel'>100m</text>" +
        "<text x='151' y='99' class='apex_chartLabel'>150m</text>" +

        "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'/>" +
        maxDamageText +
        minDamageText +
        "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'/>" +
        hs_maxDamageText +
        hs_minDamageText +
        "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCoords + "'/>" +
        ls_maxDamageText +
        ls_minDamageText +
        "</svg>"
}

function showHideClasses(){
    if ($("#showLightAmmoCheck").is(":checked")){
        $(".sub_bullet").show(0);
    } else {
        $(".sub_bullet").hide(0);
    }
    if ($("#showHeavyAmmoCheck").is(":checked")){
        $(".sub_highcal").show(0);
    } else {
        $(".sub_highcal").hide(0);
    }
    if ($("#showShotgunAmmoCheck").is(":checked")){
        $(".sub_shotgun").show(0);
    } else {
        $(".sub_shotgun").hide(0);
    }
    if ($("#showSpecialAmmoCheck").is(":checked")){
        $(".sub_special").show(0);
    } else {
        $(".sub_special").hide(0);
    }
    if ($("#showSpecialHeavyAmmoCheck").is(":checked")){
        $(".sub_undefined").show(0);
    } else {
        $(".sub_undefined").hide(0);
    }
}
//"Assault Rifle","SMG","Shotgun","LMG","Sniper","Special","Pistol"
function apex_showHideSubCats(){
    if ($("#showARCheck").is(":checked")){
        $("#AssaultRifleSection").show(0);
    } else {
        $("#AssaultRifleSection").hide(0);
    }
    if ($("#showSMGCheck").is(":checked")){
        $("#SMGSection").show(0);
    } else {
        $("#SMGSection").hide(0);
    }
    if ($("#showShotgunCheck").is(":checked")){
        $("#ShotgunSection").show(0);
    } else {
        $("#ShotgunSection").hide(0);
    }
    if ($("#showLMGCheck").is(":checked")){
        $("#LMGSection").show(0);
    } else {
        $("#LMGSection").hide(0);
    }
    if ($("#showSNIPERCheck").is(":checked")){
        $("#SniperSection").show(0);
    } else {
        $("#SniperSection").hide(0);
    }
    if ($("#showSPECIALCheck").is(":checked")){
        $("#SpecialSection").show(0);
    } else {
        $("#SpecialSection").hide(0);
    }
    if ($("#showPISTOLCheck").is(":checked")){
        $("#PistolSection").show(0);
    } else {
        $("#PistolSection").hide(0);
    }
}

// function apex_showHideStats(){
//     if ($("#showROFCheck").is(":checked")){
//         $(".lblRPM").css("visibility","unset");
//     } else {
//         $(".lblRPM").css("visibility","hidden");
//     }
//     if ($("#showSpeedCheck").is(":checked")){
//         $(".lblSpeed").css("visibility","unset");
//     } else {
//         $(".lblSpeed").css("visibility","hidden");
//     }
//     if ($("#showDamageCheck").is(":checked")){
//         $(".damageChartContainer").css("visibility","unset");
//     } else {
//         $(".damageChartContainer").css("visibility","hidden");
//     }
//     if ($("#showReloadCheck").is(":checked")){
//         $(".sectionReload").css("visibility","unset");
//     } else {
//         $(".sectionReload").css("visibility","hidden");
//     }
//     if ($("#showAmmoCheck").is(":checked")){
//         $(".lblMagText").css("visibility","unset");
//     } else {
//         $(".lblMagText").css("visibility","hidden");
//     }
//     if ($("#showAmmoGrahicCheck").is(":checked")){
//         $(".magGraphicBox").css("visibility","unset");
//     } else {
//         $(".magGraphicBox").css("visibility","hidden");
//     }
//     if ($("#showRecoilCheck").is(":checked")){
//         $(".recoilGraphicBox").css("visibility","unset");
//     } else {
//         $(".recoilGraphicBox").css("visibility","hidden");
//     }
//     if ($("#showSpreadCheck").is(":checked")){
//         $(".spreadLabels").css("visibility","unset");
//         $(".spreadCircles").css("visibility","unset");
//     } else {
//         $(".spreadLabels").css("visibility","hidden");
//         $(".spreadCircles").css("visibility","hidden");
//     }
//     if ($("#showHipSpreadCheck").is(":checked")){
//         $(".hipSpreadContainer").css("visibility","unset");
//     } else {
//         $(".hipSpreadContainer").css("visibility","hidden");
//     }
//     if ($("#showDeployCheck").is(":checked")){
//         $(".apex_deployTimeBox").css("visibility","unset");
//     } else {
//         $(".apex_deployTimeBox").css("visibility","hidden");
//     }
//     if ($("#showToolsCheck").is(":checked")){
//         $(".apex_customButtons").css("visibility","unset");
//         $(".apex_afterCustomButtons").css("visibility","unset");
//     } else {
//         $(".apex_customButtons").css("visibility","hidden");
//         $(".apex_afterCustomButtons").css("visibility","hidden");
//     }
// }

var apex_weaponSubCats = new Object();


apex_weaponSubCats._WPN_ENERGY_AR = "special";
apex_weaponSubCats._WPN_HEMLOK = "highcal";
apex_weaponSubCats._WPN_RSPN101 = "bullet";
apex_weaponSubCats._WPN_VINSON = "highcal";
apex_weaponSubCats._WPN_R97 = "bullet";
apex_weaponSubCats._WPN_ALTERNATOR_SMG = "bullet";
apex_weaponSubCats._WPN_PDW = "highcal";

apex_weaponSubCats._WPN_SHOTGUN = "shotgun";
apex_weaponSubCats._WPN_ENERGY_SHOTGUN = "shotgun";
apex_weaponSubCats._WPN_SHOTGUN_PISTOL = "shotgun";

apex_weaponSubCats._WPN_ESAW = "special";
apex_weaponSubCats._WPN_LMG = "highcal";


apex_weaponSubCats._WPN_DOUBLETAKE = "special";
apex_weaponSubCats._WPN_DMR = "highcal";
apex_weaponSubCats._WPN_G2 = "bullet";
apex_weaponSubCats._WPN_CHARGE_RIFLE = "special";

apex_weaponSubCats._WPN_WINGMAN = "highcal";
apex_weaponSubCats._WPN_RE45_AUTOPISTOL = "bullet";
apex_weaponSubCats._WPN_P2011 = "bullet";

// apex_weaponSubCats._WPN_MASTIFF = "special_highcal";
// // apex_weaponSubCats._WPN_LSTAR = "special_highcal";
// // apex_weaponSubCats._WPN_SNIPER = "special_highcal";
apex_weaponSubCats._WPN_MASTIFF = "undefined";
apex_weaponSubCats._WPN_LSTAR = "undefined";
apex_weaponSubCats._WPN_SNIPER = "undefined";

function cleanUpStuff(){
    var speacialRow = $("span:contains('Karabin')").parentsUntil("tbody", "tr");
    //$(speacialRow).find(".recoilGraphicBox").css("visibility","hidden");
    //$(speacialRow).find(".recoilGraphicBox > svg").empty();
    $(speacialRow).find(".variantButton").remove();
    $(speacialRow).find(".apex_customButtons").empty().html("<div class='tbdBox'>Soon</div>");

}