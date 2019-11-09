let oHandler0;
let oHandler1;// this will be assign in on ready below
let oHandler2;
let oHandler3;
let oHandler4;
let oHandler0x;
let oHandler1x;// this will be assign in on ready below
let oHandler2x;
let oHandler3x;
let oHandler4x;
let apex_weaponClassTitles = ["AssaultRifle","SMG","Shotgun","LMG","Sniper","Special","Pistol"];
const apex_attachments = {};
let active_weapon_attachments = {};
const optic_customizations = {};
let apex_addVariantCounter = 0;

// TODO: MOAR Tooltips
// const apex_weapon_tooltip = "title = ";
const apex_rpmTooltip = "title = 'Rounds/Minute'";
const apex_burstTooltip = "title = 'Rounds Per Burst'";
const apex_chargeUpTooltip = "title = 'Charge Up Time'";
const apex_sustainedDischargeTooltip = "title = 'Sustained Discharge Duration - Time till primary attack'";
const apex_sustainedPulseTooltip = "title = 'Discharge Pulse Frequency of damage'";
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
const apex_vert_recoil_tooltip = "title = 'Avg Vertical Recoil'";
const apex_avgRecoilVariationTooltip = "title = 'Avg Recoil Variation'";
const apex_horz_recoil_tooltip = "title = 'Min / Max Horz Recoil'";
const apex_avg_horz_recoil_tooltip = "title = 'Avg Horz Recoil'";
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
        const formatted_name = formatWeaponName(weapon['WeaponData']['printname']);
        weapon['WeaponData']['printname'] = formatted_name.replace(" -", "");
        if(apex_attachments[formatted_name] === undefined){
            apex_attachments[formatted_name] = [];
        }
        for (i = 0; i <  weapon['WeaponData']["attachment_list"].length; i++) {
            if( weapon['WeaponData']['Mods'][ weapon['WeaponData']["attachment_list"][i]] !== undefined) {

                apex_attachments[formatted_name][i] =  weapon['WeaponData']['Mods'][ weapon['WeaponData']["attachment_list"][i]];
                apex_attachments[formatted_name][i].attachName = [ weapon['WeaponData']["attachment_list"][i]];
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
    let apex_showHideCheckboxes_input = $("#apex_showHideCheckboxes input");
    apex_showHideCheckboxes_input.checkboxradio(
        {icon:false}
    );
    apex_showHideCheckboxes_input.change(function(){
        this.blur();
        apex_showHideClasses();
    });

    let apex_showHideSubCats_input = $("#apex_showHideSubCats input");
    apex_showHideSubCats_input.checkboxradio(
        {icon: false}
    );
    apex_showHideSubCats_input.change(function(){
        this.blur();
        apex_showHideSubCats();
    });

    $("#shortcutCombobox").combobox({
        select: function () {
            $("." + apex_weapon_name_dict[this.value])[0].scrollIntoView({
                behavior: 'smooth'
            });
        }
    })
}

function apex_onAttachmentChange(data){

    const weapon_variant_id = data.value.split('_X_')[0];
    const weapon_string_name = data.value.split('_X_')[1];
    const weapon_string_attachment = data.value.split('_X_')[3];
    const weapon_string_slot = data.value.split('_X_')[2];
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
    apex_updateWeapon(active_weapon_attachments, weapon_variant_id, weapon_string_name);

}

function apex_initializeAttachmentOnChange(){
    let weapon_key_string = "";
    $.each(APEXWeaponData, function(key, weapon) {
        weapon_key_string = "#0_"+ weapon['WeaponData']['printname']+"_barrel_stabilizers";
        oHandler0 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
        weapon_key_string = "#0_"+ weapon['WeaponData']['printname']+"_extend_mags";
        oHandler1 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
        weapon_key_string = "#0_"+ weapon['WeaponData']['printname']+"_optics";
        oHandler2 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
        weapon_key_string = "#0_"+ weapon['WeaponData']['printname']+"_stocks";
        oHandler3 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
        weapon_key_string = "#0_"+ weapon['WeaponData']['printname']+"_hopups";
        oHandler4 = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
    });

}
function apex_initializeVariantAttachmentOnChange(weapon_name){
    let variant_count = document.getElementsByClassName(weapon_name).length;
    variant_count = variant_count - 1;
    let weapon_key_string = "";
    $.each(APEXWeaponData, function(key, weapon) {
        weapon_key_string = "#"+variant_count+"_"+ weapon['WeaponData']['printname']+"_barrel_stabilizers";
        oHandler0x = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
        weapon_key_string = "#"+variant_count+"_"+ weapon['WeaponData']['printname']+"_extend_mags";
        oHandler1x = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
        weapon_key_string = "#"+variant_count+"_"+ weapon['WeaponData']['printname']+"_optics";
        oHandler2x = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
        weapon_key_string = "#"+variant_count+"_"+ weapon['WeaponData']['printname']+"_stocks";
        oHandler3x = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
        weapon_key_string = "#"+variant_count+"_"+ weapon['WeaponData']['printname']+"_hopups";
        oHandler4x = $(weapon_key_string).msDropdown({
            on:{create:function() {},
                change: function(data) {apex_onAttachmentChange(data);
                }}
        }).data("dd");
    });
    variant_count = 0;
}

function apex_printWeapons(){

    let statsHtml = "";
    // statsHtml += "<div><ab><img class='attachment_box' src='./pages/apex/icons/attachment_box.png' alt=''></ab></div>";

    statsHtml += apex_printWeaponClass(0);
    statsHtml += apex_printWeaponClass(1);
    statsHtml += apex_printWeaponClass(2);
    statsHtml += apex_printWeaponClass(3);
    statsHtml += apex_printWeaponClass(4);
    statsHtml += apex_printWeaponClass(5);
    statsHtml += apex_printWeaponClass(6);

    $("#pageBody").html(statsHtml);
    apex_showHideClasses();

    $(".customButton").checkboxradio(
        {icon:false}
    );

    let apex_variantButton = $(".variantButton");
    apex_variantButton.button();

    apex_variantButton.click(function(){
        apex_addVariantCounter++;
        const thisRow = $(this).parentsUntil("tbody", "tr");
        const weaponName = $(thisRow).find(".apex_lblNameValue").text();

        const newWeaponStats = APEXWeaponData.find(function (element) {
            return element["WeaponData"]['custom_name'] === weaponName;
        });

        const newWeaponRow = apex_printWeapon(newWeaponStats['WeaponData']);
        const newWeaponRowObj = $(newWeaponRow).insertAfter(thisRow);

        $(newWeaponRowObj).effect("highlight");
        apex_initializeVariantAttachmentOnChange(newWeaponStats['WeaponData']['printname']);
        // apex_showHideStats();
    });

    $(document).tooltip({track: true});

    apex_initializeCustomizations();
    initializeSorts();

    $(".sortableTable").sortable({
        opacity: 0.7,
        placeholder: "ui-state-highlight",
        handle: ".sortDragIcon"
    });

    apex_showHideSubCats();
    apex_initializeAttachmentOnChange();
}

function apex_printWeaponClass(weaponClass){
    let rtnStr = "";
    rtnStr += "<div id='" + apex_weaponClassTitles[weaponClass] + "Section'>" +
        "<div class='apex_classHeader'><img src='./pages/apex/icons/rui/weapon_icons/classes/" + apex_weaponClassTitles[weaponClass] + ".png' alt=''>" + apex_weaponClassTitles[weaponClass] + "</div>";
    rtnStr += "<table class='table apex_classTable'><tbody class='sortableTable'>";

    $.each(APEXWeaponData, function( key, value ) {
        if (parseInt(value['WeaponData']['weapon_class']) === weaponClass && value['WeaponData']['weapon_type_flags'] === "WPT_PRIMARY"){
            rtnStr += apex_printWeapon(value['WeaponData']);
        }
    });
    rtnStr += "</tbody></table></div>";
    return rtnStr;
}

function apex_printWeapon(weaponStats) {
    const reloadData = apex_createReloadGraphic(Number(weaponStats['reloadempty_time']).toFixed(2), Number(weaponStats['reload_time']).toFixed(2));
    const standRecoilData = apex_createNewRecoilGraphic(weaponStats['viewkick_pattern_data_y_avg'], weaponStats['viewkick_pattern_data_x_avg'], weaponStats['viewkick_pattern_data_x_min'], weaponStats['viewkick_pattern_data_x_max'], weaponStats['viewkick_pattern_data_sizex_avg'], weaponStats['viewkick_pattern_data_sizey_avg'], weaponStats['viewkick_pitch_base'], weaponStats['viewkick_pitch_random'], weaponStats['viewkick_yaw_base'], weaponStats['viewkick_yaw_random']);
    const apex_spreadTableGraphic = apex_createSpreadTableGraphic(weaponStats['spread_stand_ads'], weaponStats['spread_stand_hip'], weaponStats['spread_stand_hip_run'], weaponStats['spread_stand_hip_sprint'], weaponStats['spread_crouch_ads'], weaponStats['spread_crouch_hip'], weaponStats['spread_air_ads'], weaponStats['spread_air_hip'], weaponStats['spread_kick_on_fire_stand_ads'], weaponStats['spread_kick_on_fire_stand_hip'], weaponStats['spread_kick_on_fire_crouch_ads'], weaponStats['spread_kick_on_fire_crouch_hip'], weaponStats['spread_kick_on_fire_air_ads'], weaponStats['spread_kick_on_fire_air_hip'], weaponStats['spread_decay_delay'], weaponStats['spread_moving_decay_rate'], weaponStats['spread_decay_rate'], weaponStats['spread_moving_increase_rate']);
    const attachmentGraphic = (weaponStats['menu_category'] === 8) ? "" : apex_printAttachments([formatWeaponName(weaponStats['printname'])], weaponStats['ammo_pool_type']);
    const addVariantGraphic = (weaponStats['menu_category'] === 8 || apex_addVariantCounter !== 0) ? "" : "<button class='variantButton btn btn-outline-light btn-sm' " + apex_variantTooltip + ">+</button>";
    const charge_string = apex_createChargeSpinUpLabels(weaponStats);
    return "<tr class='" + weaponStats['printname'] + " sub_" + getAPEXWeaponsSubcat(weaponStats['printname']) + "'>" +
        "<td class='apex_firstColumn'>" +
        "<div class='apex_lblWeaponName'>" +
        "<span class='apex_lblNameValue' title='" + weaponStats["custom_desc_long"].toString().replace("\\u0027", "\"").replace("\\u0027", "\"") + "'>" + formatWeaponName(weaponStats['custom_name']) + "</span>" +
        "</div>" +
        "<div>" +
        "<img class='apex_weaponImg' src='./pages/apex/icons/" + weaponStats["hud_icon"] + ".png' alt=''>" +
        "</div>" +
        "<div style='line-height:20px;'>" +
        "<span class='apex_lblMagText'>" +
        "<span class='apex_lblMag'>" + weaponStats["ammo_clip_size"] + "</span>" +
        "<span class='apex_lblSuffixText'>x" + "<img src='./pages/apex/icons/ammo/" + weaponStats['ammo_pool_type'] + ".png' alt='' height='20' width='19'>" + "</span>" +
        "</span>" +
        "<span class='apex_lblBurstCount' " + apex_burstTooltip + ">" + apex_createBurstLabels(weaponStats['burst_fire_count']) + "<br></span>" +
        "<span><br></span>" +
        "<span class='apex_lblRPM'>" +
        "<span class='apex_lblRPMValue' " + apex_rpmTooltip + ">" + apex_createFireRateLabels(weaponStats) + "</span>" +
        "<span class='apex_lblSuffixText'>rpm</span>" +
        "</span>" +
        "</div>" +
        "<div class='apex_lblChargeValue'>" + charge_string +
        "</div>" +
        "</td>" +
        "<td class='apex_secondColumn'>" +
        "<div class='apex_damageChartContainer' " + apex_damageTooltip + ">" + apex_createDamageChart(weaponStats, weaponStats['printname'], weaponStats['damage_array'], weaponStats['damage_distance_array_m'], weaponStats['projectiles_per_shot'], weaponStats['damage_headshot_scale'], weaponStats['damage_leg_scale'], weaponStats['allow_headshots'], weaponStats['headshot_distance_m']) + "</div>" +
        "<div class='apex_headShotDamageDistanceContainer' " + apex_damageModsHSTooltip + ">" + "<span class='apex_lblSuffixText'>" + "<img src='./pages/apex/icons/rui/misc/hs_skull_M.png' alt=''>x</span><span class='apex_lblHS_Multi'>" + weaponStats['damage_headshot_scale'] + "</span> - " + weaponStats['headshot_distance_m']+ "m </div>" +
        "<div class='apex_legShotDamageDistanceContainer' " + apex_damageModsLSTooltip + ">" + "<span class='apex_lblSuffixText'>" + "<img src='./pages/apex/icons/rui/misc/octanes_real_legs.png' alt=''> x</span><span class='apex_lblLS_Multi'>" + weaponStats['damage_leg_scale'] + "</span></div>" +
        "</td>" +
        "<td>" +
        "<td>" +
        "<div class='apex_reloadDataAndMagCount'>" + apex_createBulletSpeedGraphic(Math.round(weaponStats['projectile_launch_speed_m']), weaponStats['projectile_drag_coefficient']) + reloadData + "</div>" +
        "</td><td>" +
        // "<div class='apex_recoilGraphBox' " + apex_recoilTooltip + ">" + standRecoilData + "</div><div class='apex_deployTimeBox'" + apex_deployTooltip + "><br><span class='apex_lblDeployTime'>" + weaponStats['deployfirst_time'] + "<span class='apex_lblSuffixText'> s</span><img class='apex_wpnSwitchImg' src='./pages/apex/icons/weapon_switch_small.png' alt=''><span class='apex_lblDeployTime'>" + weaponStats['deploy_time'] + "<span class='apex_lblSuffixText'>s</span><br><br><br><span class='apex_lblDeployTime_2'>" + formatWeaponValue(weaponStats['raise_time']) + "<span class='apex_lblSuffixText'> s</span></span></span><span class='apex_lblDeployTime_4'>" + weaponStats['holster_time'] + "<span class='apex_lblSuffixText'>s</span></span></span></div>" +
        "<div class='apex_recoilGraphBox'>" + standRecoilData + "</div><div class='apex_deployTimeBox'><br><span class='apex_lblDeployTime'" + apex_deploy_1st_Tooltip + ">" + Number(weaponStats['deployfirst_time']).toFixed(2) + "<span class='apex_lblSuffixText'> s</span><img class='apex_wpnSwitchImg'" + apex_deployTooltip + " src='./pages/apex/icons/weapon_switch_small.png' alt=''><span class='apex_lblDeployTime'" + apex_deploy_Deploy_Tooltip + ">" + Number(weaponStats['deploy_time']).toFixed(2) + "<span class='apex_lblSuffixText'>s</span><br><br><br><span class='apex_lblDeployTime_2'" + apex_deploy_Raise_Tooltip + ">" + formatWeaponValue(Number(weaponStats['raise_time']).toFixed(2)) + "<span class='apex_lblSuffixText'> s</span></span></span><span class='apex_lblDeployTime_4'" + apex_deploy_Holster_Tooltip + ">" + Number(weaponStats['holster_time']).toFixed(2) + "<span class='apex_lblSuffixText'>s</span></span></span></div>" +
        "</td><td>" +
        "<div class='apex_hipSpreadContainer' " + apex_hipfireTooltip + ">" + apex_createHipSpreadGraphic(weaponStats['spread_stand_hip_run'], weaponStats['spread_air_hip'], weaponStats['spread_air_ads'], weaponStats['spread_stand_ads'], weaponStats['weapon_class'], weaponStats) + "</div>" +
        "<div>" +
        "<div class='apex_spreadLabels' " + apex_adsTooltip + ">" +
        apex_createSpreadLabels(weaponStats['ads_move_speed_scale'], weaponStats['zoom_time_in'], weaponStats['zoom_time_out'], weaponStats['zoom_fov']) +
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
}

function remove_attachment(attachments, mod_to_remove) {
    let attachments_slots = attachments;
    $.each(attachments_slots, function(slot_id, attachment) {
        if (attachment === mod_to_remove){
            attachments_slots[slot_id] = "";
        }
    });
    return attachments_slots;

}

function apex_updateDoubleTapHopUp(selectedAttachments, weapon) {
    let mod = {};
    const BOLT_MOD_BASE = "shotgun_bolt_";
    const DOUBLE_TAP_SUFFIX = "_double_tap";
    const levels = ["l1", "l2", "l3"];
    let current_bolt_string = "";
    let has_dt_bolt = false;
    let has_double_tap = selectedAttachments['slot4'] === "hopup_double_tap";

    if (has_double_tap) {
        $.each(levels, function(index, level) {
            let boltModBase = BOLT_MOD_BASE + level;
            let boltModDT = boltModBase + DOUBLE_TAP_SUFFIX;

            selectedAttachments = remove_attachment(selectedAttachments, boltModDT);

            if (selectedAttachments['slot0'] === boltModBase) {
                selectedAttachments['slot0'] = boltModDT;
                has_dt_bolt = true;
                current_bolt_string = boltModBase;
            }
        });
    } else {
        $.each(levels, function(index, level) {
            let boltModBase = BOLT_MOD_BASE + level;
            let boltModDT = boltModBase + DOUBLE_TAP_SUFFIX;

            if (selectedAttachments['slot0'] === boltModDT) {
                selectedAttachments = remove_attachment(selectedAttachments, boltModDT);
                selectedAttachments['slot0'] = boltModBase;
                current_bolt_string = boltModBase;
                has_dt_bolt = false;
            }

        });
    }
    for (const [key, value] of Object.entries(selectedAttachments)) {
        if (value !== "" && value !== undefined) {
            if (key === "slot0"){
                for (const [mod_key, mod_value] of Object.entries(weapon['WeaponData']['Mods'][value])) {
                    mod[mod_key] = mod_value;
                }
                if (current_bolt_string !== ""){
                    selectedAttachments["slot0"] = current_bolt_string;
                }
            } else if (key === "slot1") {
                for (const [mod_key, mod_value] of Object.entries(weapon['WeaponData']['Mods'][value])) {
                    mod[mod_key] = mod_value;
                }
            } else if (key === "slot2") {
                for (const [mod_key, mod_value] of Object.entries(weapon['WeaponData']['Mods'][value])) {
                    mod[mod_key] = mod_value;
                }
            } else if (key === "slot3") {
                for (const [mod_key, mod_value] of Object.entries(weapon['WeaponData']['Mods'][value])) {
                    mod[mod_key] = mod_value;
                }
            } else if (key === "slot4") {
                if (value === 'hopup_double_tap' && !has_dt_bolt) {
                    for (const [mod_key, mod_value] of Object.entries(weapon['WeaponData']['Mods']["altfire_double_tap"])) {
                        mod[mod_key] = mod_value;
                    }
                }
            } else if (key === "slot5") {
                for (const [mod_key, mod_value] of Object.entries(weapon['WeaponData']['Mods'][value])) {
                    mod[mod_key] = mod_value;
                }
            }
        }

    }
    return mod;
}


function apex_updateWeapon(selectedAttachments, weapon_variant_id, weapon_string_name) {
    //TODO: If creating a variant with attachments already equipped
    weapon_variant_id = parseInt(weapon_variant_id);
    let variant_array_len =  document.getElementsByClassName(weapon_string_name).length ;
    if (variant_array_len === 1 || weapon_variant_id <= 0) {
        weapon_variant_id = 0;
    } else {
        weapon_variant_id = variant_array_len - weapon_variant_id;
    }
    for (let i = 0; i < APEXWeaponData.length; i++) {
        let APEXWeaponData_Mod = null;
        let weapon_data = null;
        let double_tap_mod_name = null;
        let mod = null;
        APEXWeaponData_Mod = jQuery.extend(true, [], APEXWeaponData);
        mod = {};
        if (selectedAttachments[APEXWeaponData_Mod[i]['WeaponData']['printname']] !== undefined) {
            for (const [, value] of Object.entries(selectedAttachments[APEXWeaponData_Mod[i]['WeaponData']['printname']])) {
                if (value !== "" && value !== undefined) {
                    if (value === 'hopup_highcal_rounds') {
                        for (const [mod_key, mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods']['altfire_highcal'])) {
                            mod[mod_key] = mod_value;
                        }
                    } else if (value === 'hopup_selectfire') {
                        for (const [mod_key, mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods']['altfire'])) {
                            mod[mod_key] = mod_value;
                        }
                    } else if (value === 'hopup_double_tap' && !APEXWeaponData_Mod[i]['WeaponData']['printname'].includes("WPN_SHOTGUN"))  {
                        double_tap_mod_name = "altfire_double_tap";
                        for (const [mod_key, mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods'][double_tap_mod_name])) {
                            mod[mod_key] = mod_value;
                        }
                    } else {
                        for (const [mod_key, mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods'][value])) {
                            mod[mod_key] = mod_value;
                        }
                    }
                }
            }
            // Override double tap effective fire rate if also using a shotgun bolt.
            if(APEXWeaponData_Mod[i]['WeaponData']['custom_name'].includes("EVA-8 Auto")){
                mod = apex_updateDoubleTapHopUp(selectedAttachments[APEXWeaponData_Mod[i]['WeaponData']['printname']], APEXWeaponData_Mod[i]);
            }
            if(APEXWeaponData_Mod[i]['WeaponData']['custom_name'].includes("G7 Scout")){
                mod = apex_updateDoubleTapHopUp(selectedAttachments[APEXWeaponData_Mod[i]['WeaponData']['printname']], APEXWeaponData_Mod[i]);
            }

            weapon_data = APEXWeaponData_Mod[i]['WeaponData'];
            let weaponStats = weapon_data;
            for (const [key, value] of Object.entries(mod)) {
                if (!key.includes("effective_fire_rate")) {
                    if (!key.includes("viewkick_pattern_data")) {
                        if (value.toString().includes("++")) {
                            const additive = value.replace("++", "");
                            weaponStats[key] = (parseInt(weaponStats[key]) + parseInt(additive));

                        } else if (value.toString().includes("*")) {
                            const multi = value.replace("*", "");
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
            const weaponRow = document.getElementsByClassName(weaponStats['printname'])[(weapon_variant_id)];
            // TODO: Real Recoil - This is just a quick Temp recoil calculation until the values are more ironed out.
            let temp_pitchBase =  Number(parseFloat(weaponStats['viewkick_pattern_data_sizey_avg']) * parseFloat(weaponStats['viewkick_pitch_base'])).toFixed(3);
            let temp_pitchRandAvg =  Number(Math.abs(parseFloat(weaponStats['viewkick_pattern_data_y_avg'])) * parseFloat(weaponStats['viewkick_pitch_random'])).toFixed(3);
            let temp_YawRandAvg =  Number(parseFloat(weaponStats['viewkick_pattern_data_x_avg']) * parseFloat(weaponStats['viewkick_yaw_random'])).toFixed(3);
            let temp_YawBaseMin =  Number(Math.abs(parseFloat(weaponStats['viewkick_pattern_data_x_min'])) * parseFloat(weaponStats['viewkick_yaw_base'])).toFixed(3);
            let temp_YawBaseMax =  Number(parseFloat(weaponStats['viewkick_pattern_data_x_max']) * parseFloat(weaponStats['viewkick_yaw_base'])).toFixed(3);
            if (weaponStats['viewkick_pattern'] !== undefined) {
                if (parseFloat(weaponStats['viewkick_pitch_base']) < 0.0) {
                    $(weaponRow).find(".apex_recoilGraphBox").html(apex_createNonPatternRecoilGraphic(temp_pitchRandAvg, temp_YawRandAvg, temp_YawBaseMin, temp_YawBaseMax, weaponStats['viewkick_pattern_data_sizex_avg'], temp_pitchBase, temp_pitchBase, temp_pitchRandAvg, temp_YawBaseMin, temp_YawRandAvg));
                    // $(weaponRow).find(".apex_recoilGraphBox").html(apex_createNonPatternRecoilGraphic(weaponStats['viewkick_pattern_data_y_avg'], weaponStats['viewkick_pattern_data_x_avg'], weaponStats['viewkick_pattern_data_x_min'], weaponStats['viewkick_pattern_data_x_max'], weaponStats['viewkick_pattern_data_sizex_avg'], weaponStats['viewkick_pattern_data_sizey_avg'], parseFloat(weaponStats['viewkick_pitch_base']), parseFloat(weaponStats['viewkick_pitch_random']), parseFloat(weaponStats['viewkick_yaw_base']), parseFloat(weaponStats['viewkick_yaw_random'])));
                } else {
                    $(weaponRow).find(".apex_recoilGraphBox").html(apex_createNewRecoilGraphic(temp_pitchRandAvg, temp_YawRandAvg, temp_YawBaseMin, temp_YawBaseMax, weaponStats['viewkick_pattern_data_sizex_avg'], temp_pitchBase, temp_pitchBase, temp_pitchRandAvg, temp_YawBaseMin, temp_YawRandAvg));
                    // $(weaponRow).find(".apex_recoilGraphBox").html(apex_createNewRecoilGraphic(weaponStats['viewkick_pattern_data_y_avg'], weaponStats['viewkick_pattern_data_x_avg'], weaponStats['viewkick_pattern_data_x_min'], weaponStats['viewkick_pattern_data_x_max'], weaponStats['viewkick_pattern_data_sizex_avg'], weaponStats['viewkick_pattern_data_sizey_avg'], parseFloat(weaponStats['viewkick_pitch_base']), parseFloat(weaponStats['viewkick_pitch_random']), parseFloat(weaponStats['viewkick_yaw_base']), parseFloat(weaponStats['viewkick_yaw_random'])));
                }
            } else {
                $(weaponRow).find(".apex_recoilGraphBox").html(apex_createNewRecoilGraphic(weaponStats['viewkick_pattern_data_y_avg'], weaponStats['viewkick_pattern_data_x_avg'], weaponStats['viewkick_pattern_data_x_min'], weaponStats['viewkick_pattern_data_x_max'], weaponStats['viewkick_pattern_data_sizex_avg'], weaponStats['viewkick_pattern_data_sizey_avg'], weaponStats['viewkick_pitch_base'], weaponStats['viewkick_pitch_random'], weaponStats['viewkick_yaw_base'], weaponStats['viewkick_yaw_random']));
            }
            const charge_string = apex_createChargeSpinUpLabels(weaponStats);
            $(weaponRow).find(".apex_lblRPMValue").text( apex_createFireRateLabels(weaponStats));
            $(weaponRow).find(".apex_lblBurstCount").html(apex_createBurstLabels(weaponStats['burst_fire_count'])  + "<br></span>");
            $(weaponRow).find(".apex_lblChargeValue").html(charge_string);
            $(weaponRow).find(".apex_lblSpeedValue").text(weaponStats['projectile_launch_speed_m']);
            $(weaponRow).find(".apex_damageChartContainer").html(apex_createDamageChart(weaponStats, weaponStats['printname'], weaponStats['damage_array'], weaponStats['damage_distance_array_m'], weaponStats['projectiles_per_shot'], weaponStats['damage_headshot_scale'], weaponStats['damage_leg_scale'], weaponStats['allow_headshots'], weaponStats['headshot_distance_m']));
            $(weaponRow).find(".apex_headShotDamageDistanceContainer").html("<span class='apex_lblSuffixText'>" + "<img src='./pages/apex/icons/rui/misc/hs_skull_M.png' alt=''>x</span>" + weaponStats['damage_headshot_scale'] + " - " + weaponStats['headshot_distance_m']+ "m");
            $(weaponRow).find(".apex_legShotDamageDistanceContainer").html("<span class='apex_lblSuffixText'>" + "<img src='./pages/apex/icons/rui/misc/octanes_real_legs.png' alt=''> x</span>" + weaponStats['damage_leg_scale']+"");
            $(weaponRow).find(".apex_reloadDataAndMagCount").html(apex_createBulletSpeedGraphic(Math.round(weaponStats['projectile_launch_speed_m']), weaponStats['projectile_drag_coefficient']) + apex_createReloadGraphic(Number(weaponStats['reloadempty_time']).toFixed(2), Number(weaponStats['reload_time']).toFixed(2)));
            $(weaponRow).find(".apex_spreadLabels").html(apex_createSpreadLabels(weaponStats['ads_move_speed_scale'], weaponStats['zoom_time_in'], weaponStats['zoom_time_out'], weaponStats['zoom_fov']));
            $(weaponRow).find(".apex_hipSpreadContainer").html(apex_createHipSpreadGraphic(weaponStats['spread_stand_hip_run'], weaponStats['spread_air_hip'], weaponStats['spread_air_ads'], weaponStats['spread_stand_ads'], weaponStats['weapon_class'], weaponStats));
            $(weaponRow).find(".apex_lblDeployTime").html(Number(weaponStats['deployfirst_time']).toFixed(2) + "<span class='apex_lblSuffixText'>s</span><img class='apex_wpnSwitchImg'" + apex_deployTooltip + " src='./pages/apex/icons/weapon_switch_small.png' alt=''><span class='apex_lblDeployTime'" + apex_deploy_Deploy_Tooltip + ">" + Number(weaponStats['deploy_time']).toFixed(2) + "<span class='apex_lblSuffixText'>s</span><br><br><br><span class='apex_lblDeployTime_2'" + apex_deploy_Raise_Tooltip + ">" + formatWeaponValue(Number(weaponStats['raise_time']).toFixed(2)) + "<span class='apex_lblSuffixText'> s</span></span></span><span class='apex_lblDeployTime_4'" + apex_deploy_Holster_Tooltip + "'>" + Number(weaponStats['holster_time']).toFixed(2) + "<span class='apex_lblSuffixText'>s</span></span>");
            $(weaponRow).find(".apex_spreadTable").html(apex_createSpreadTableGraphic(weaponStats['spread_stand_ads'], weaponStats['spread_stand_hip'], weaponStats['spread_stand_hip_run'], weaponStats['spread_stand_hip_sprint'], weaponStats['spread_crouch_ads'], weaponStats['spread_crouch_hip'], weaponStats['spread_air_ads'], weaponStats['spread_air_hip'], weaponStats['spread_kick_on_fire_stand_ads'], weaponStats['spread_kick_on_fire_stand_hip'], weaponStats['spread_kick_on_fire_crouch_ads'], weaponStats['spread_kick_on_fire_crouch_hip'], weaponStats['spread_kick_on_fire_air_ads'], weaponStats['spread_kick_on_fire_air_hip'], weaponStats['spread_decay_delay'], weaponStats['spread_moving_decay_rate'], weaponStats['spread_decay_rate'], weaponStats['spread_moving_increase_rate']));
            $(weaponRow).find(".apex_lblMag").text(weaponStats['ammo_clip_size']);
            APEXWeaponData_Mod = jQuery.extend(true, [], APEXWeaponData_orig);
        }
    }
}

function apex_printAttachments(weaponName, weapon_ammo) {
    let custom_string = "";
    let custom_string_0 = "";
    let custom_string_1 = "";
    // let custom_string_2 = "";
    let custom_string_3 = "";
    let custom_string_4 = "";
    let slot0 = 0;
    let slot1 = 0;
    let slot2 = 0;
    let slot3 = 0;
    let slot4 = 0;
    custom_string += "<aa class='aa'>";
    let variant_count = document.getElementsByClassName(weaponName).length;
    // variant_count = variant_count - 1;
    if (variant_count === -1) {
        variant_count = 0;
    }

    let barrel_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\"" + variant_count +"_"+ weaponName + "_barrel_stabilizers\" id=\"" + variant_count +"_"+ weaponName + "_barrel_stabilizers\">";
    let mag_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\"" + variant_count +"_"+ weaponName + "_extend_mags\" id=\"" + variant_count +"_"+ weaponName + "_extend_mags\">";
    let optic_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\"" + variant_count +"_"+ weaponName + "_optics\" id=\"" + variant_count +"_"+ weaponName + "_optics\">";
    let stock_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\"" + variant_count +"_"+ weaponName + "_stocks\" id=\"" + variant_count +"_"+ weaponName + "_stocks\">";
    let hopup_option_string = "<table2 width=\"60%\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\" class=\"tbl_attachment\"><tr2><td2 width=\"24%\" valign=\"top\"><select style=\"width:60px\"  name=\"" + variant_count +"_"+ weaponName + "_hopups\" id=\"" + variant_count +"_"+ weaponName + "_hopups\">";
    for (let i = 0; i < apex_attachments[weaponName].length; i++) {
        if (apex_attachments[weaponName][i].attachName[0] !== undefined) {

            if(slot0 < 1) {
                if (apex_attachments[weaponName][i].attachName[0].includes("barrel")) {
                    slot0 += 1;
                    const barrel_slot_name = "_barrel_stabilizer_l0";
                    barrel_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot0_X_"+barrel_slot_name+" data-image=\"./pages/apex/icons/slots/barrel_slot.png\"></option>";
                    // custom_string_0 += "<ab><img id='"+ variant_count +"_"+ weaponName+"_slot0' src='./pages/apex/icons/slots/barrel_slot.png' alt=''></ab>";
                }
                if (apex_attachments[weaponName][i].attachName[0].includes("bolt")) {
                    slot0 += 1;
                    const bolt_slot_name = "_shotgun_bolt_l0";
                    barrel_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot0_X_"+bolt_slot_name+" data-image=\"./pages/apex/icons/slots/shotgun_slot.png\"></option>";
                    // custom_string_0 += "<asb><img id='"+ variant_count +"_"+ weaponName+"_slot0' src='./pages/apex/icons/slots/shotgun_slot.png' alt=''></asb>";
                }
            }
            if (apex_attachments[weaponName][i].attachName[0].includes("barrel")) {
                barrel_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot0_X_"+apex_attachments[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/barrel/slot_half_"+apex_attachments[weaponName][i].attachName[0]+".png\"></option>";
            }
            if (apex_attachments[weaponName][i].attachName[0].includes("bolt")) {
                barrel_option_string += "<option value=" + weaponName + "_X_slot0_X_" + apex_attachments[weaponName][i].attachName[0] + " data-image=\"./pages/apex/icons/slots/bolts/slot_half_" + apex_attachments[weaponName][i].attachName[0] + ".png\"></option>";
            }


            if(slot1 < 1) {
                if (apex_attachments[weaponName][i].attachName[0].includes("mag")) {
                    slot1 += 1;
                    const mag_slot_name = weapon_ammo + "_mag";
                    mag_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot1_X_"+mag_slot_name+" data-image=\"./pages/apex/icons/slots/"+weapon_ammo+"_slot.png\"></option>";
                    // custom_string_1 += "<am><img id='"+ variant_count +"_"+ weaponName+"_slot1' src='./pages/apex/icons/slots/"+weapon_ammo+"_slot.png' alt=''></am>";
                }
            }
            if (apex_attachments[weaponName][i].attachName[0].includes("mag")) {
                mag_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot1_X_"+apex_attachments[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/mags/slot_half_"+apex_attachments[weaponName][i].attachName[0]+".png\"></option>";
                slot1 += 1;
            }

            if(slot2 < 1) {
                for (let j = 0; j < optic_customizations[weaponName].length; j++) {


                    if (optic_customizations[weaponName][j].attachName[0].includes("optic")) {
                        slot2 += 1;
                        if (slot2 === 1) {
                            // custom_string_2 += "<ao><img id='"+ variant_count +"_"+ weaponName+"_slot2' src='./pages/apex/icons/slots/optic_slot.png' alt=''></ao>";
                            const iron_sights = "optics_iron_sight";
                            optic_option_string += "<option value=" + variant_count +"_X_"+ weaponName + "_X_slot2_X_" + iron_sights + " data-image=\"./pages/apex/icons/slots/optic_slot.png\"></option>";
                        }
                    }
                    if (slot2 !== 1) {
                        if (optic_customizations[weaponName][j].attachName[0].includes("optic")) {
                            const optic_name = optic_customizations[weaponName][j]['attachName'][0];
                            optic_option_string += "<option value=" + variant_count +"_X_"+ weaponName + "_X_slot2_X_" +optic_name+ " data-image=\"./pages/apex/icons/slots/optics/slot_half_" + optic_name + ".png\"></option>";
                            slot2 += 1;
                        }
                    }
                }
            }

            if(slot3 < 1) {
                if (apex_attachments[weaponName][i].attachName[0].includes("stock_tactical")) {
                    slot3 += 1;
                    const stock_sniper_name = "stock_sniper_l0";
                    stock_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot3_X_"+stock_sniper_name+" data-image=\"./pages/apex/icons/slots/tactical_stock_slot.png\"></option>";
                    // custom_string_3 += "<ats><img id='"+ variant_count +"_"+ weaponName+"_slot3' src='./pages/apex/icons/slots/tactical_stock_slot.png' alt=''></ats>";

                }
                if (apex_attachments[weaponName][i].attachName[0].includes("stock_sniper")) {
                    slot3 += 1;
                    // custom_string_3 += "<ass><img id='"+ variant_count +"_"+ weaponName+"_slot3' src='./pages/apex/icons/slots/stock_sniper_slot.png' alt=''></ass>";
                    const stock_tactical_name = "stock_tactical_l0";
                    stock_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot3_X_"+stock_tactical_name+" data-image=\"./pages/apex/icons/slots/stock_sniper_slot.png\"></option>";
                }
            }
            if (apex_attachments[weaponName][i].attachName[0].includes("stock_tactical")) {
                stock_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot3_X_"+apex_attachments[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/stocks/slot_half_"+apex_attachments[weaponName][i].attachName[0]+".png\"></option>";
                slot3 += 1;
            }
            if (apex_attachments[weaponName][i].attachName[0].includes("stock_sniper")) {
                stock_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot3_X_"+apex_attachments[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/stocks/slot_half_"+apex_attachments[weaponName][i].attachName[0]+".png\"></option>";
                slot3 += 1;
            }

            if(slot4 < 1) {
                if (apex_attachments[weaponName][i].attachName[0].includes("hopup")) {
                    slot4 += 1;
                    const hopup_name = "hopup_empty_slot";
                    hopup_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot4_X_"+hopup_name+" data-image=\"./pages/apex/icons/slots/hopup_headshot_dmg_slot.png\"></option>";
                }
            }
            if (apex_attachments[weaponName][i].attachName[0].includes("hopup")) {
                hopup_option_string += "<option value="+ variant_count +"_X_"+ weaponName+"_X_slot4_X_"+apex_attachments[weaponName][i].attachName[0]+" data-image=\"./pages/apex/icons/slots/hopups/slot_half_"+apex_attachments[weaponName][i].attachName[0]+".png\"></option>";
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
        const slot_0_name = "_slot0";
        custom_string_0 += "<option value="+ variant_count +"_"+ weaponName+"_"+slot_0_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        custom_string += custom_string_0;
    } else {
        custom_string += barrel_option_string;
    }
    if(slot1 === 0) {
        const slot_1_name = "_slot1";
        custom_string_0 += "<option value="+ variant_count +"_"+ weaponName+"_"+slot_1_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        // custom_string_1 += "<img id='"+ variant_count +"_"+ weaponName+"_slot1' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
        custom_string += custom_string_1;
    } else {
        custom_string += mag_option_string;
    }
    // if(slot1 === 0)
    //     custom_string_1 += "<img id='"+ variant_count +"_"+ weaponName+"_slot1' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
    if(slot2 === 0) {
        const slot_2_name = "_slot2";
        custom_string_0 += "<option value="+ variant_count +"_"+ weaponName+"_"+slot_2_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        // custom_string_2 += "<img id='"+ variant_count +"_"+ weaponName+"_slot2' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
        custom_string += custom_string_0;
    } else {
        custom_string += optic_option_string;
    }
    // if(slot2 === 0)
    //     custom_string_2 += "<img id='"+ variant_count +"_"+ weaponName+"_slot2' src='./pages/apex/icons/slots/optic_slot.png' alt=''>";
    if(slot3 === 0) {
        // const slot_3_name = "_slot3";
        // custom_string_0 += "<option value="+ variant_count +"_"+ weaponName+"_"+slot_3_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        // custom_string_3 += "<img id='"+ variant_count +"_"+ weaponName+"_slot3' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
        custom_string += custom_string_3;
    } else {
        custom_string += stock_option_string;
    }
    // if(slot3 === 0)
    //     custom_string_3 += "<img id='"+ variant_count +"_"+ weaponName+"_slot3' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
    if(slot4 === 0) {
// custom_string_0 += "<option value="+ variant_count +"_"+ weaponName+"_"+slot_4_name+" data-image=\"./pages/apex/icons/slots/attachment_slot_blank.png\"></option>";
        custom_string_4 += "<img id='"+ variant_count +"_"+ weaponName+"_slot4' src='./pages/apex/icons/slots/attachment_slot_blank.png' alt=''>";
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
    let reloadData = "<div>" +
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
    if (wpnName.includes("#")){
        return wpnName.replace("#", "");
    } else {
        return wpnName
    }
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
    const viewkick_yaw_base_max = Math.abs(viewkick_yaw_base / 2.0);
    const viewkick_yaw_base_min = viewkick_yaw_base_max * -1;
    viewkick_pitch_base = Math.abs(viewkick_pitch_base);
    let recoilUpLength;
    let recoilUpTextY;
    let recoilInitUpTextY;
    let recoilHorLength1;
    let recoilHorLength2;
    let point5inc;
    let oneIncrease;
    let onePoint5Increase;
    let apex_recoilGraphic;
    if (viewkick_pitch_base <= 1.76) {
        recoilUpLength = (90 - ((viewkick_pitch_base + 0.5) * 30))+ 6;
        recoilUpTextY = (71 - ((viewkick_pitch_base + 0.5) * 30))+ 6;
        recoilInitUpTextY = (86 - ((viewkick_pitch_base + 0.5) * 30))+ 6;
        recoilHorLength1 = (60 - (viewkick_yaw_base_max * 30)) + 4;
        recoilHorLength2 = (60 + (Math.abs(viewkick_yaw_base_min) * 30)) + 4;
        point5inc = ((viewkick_pitch_base + 0.5) > .5) ? "<line x1='55' y1='75' x2='65' y2='75' style='stroke:white; stroke-width:1'></line>" : "";
        oneIncrease = ((viewkick_pitch_base + 0.5) > 1.0) ? "<line x1='55' y1='60' x2='65' y2='60' style='stroke:white; stroke-width:1'></line>" : "";
        onePoint5Increase = ((viewkick_pitch_base + 0.5) > 1.5) ? "<line x1='55' y1='45' x2='65' y2='45' style='stroke:white; stroke-width:1'></line>" : "";

        apex_recoilGraphic = "<svg viewbox='0 0 130 100' style='width:100px;height:111px'>" +
            point5inc + oneIncrease + onePoint5Increase +
            "<line x1='" + recoilHorLength1 + "' y1='90' x2='" + recoilHorLength2 + "' y2='90' style='stroke:white;stroke-width:2'></line>" + // Left - Right
            "<line x1='64' y1='90' x2='64' y2='" + recoilUpLength.toString() + "' style='stroke:white;stroke-width:2'></line>" + // Up - Down
            "<text " + apex_horz_recoil_tooltip + "x='" + (recoilHorLength1 - 4).toString() + "' y='95' text-anchor='end' class='recoilValue'>" + viewkick_yaw_base_max + "°</text>" +
            "<text " + apex_horz_recoil_tooltip + "x='" + (recoilHorLength2 + 4).toString() + "' y='95' class='recoilValue'>" + Math.abs(viewkick_yaw_base_min) + "°</text>" +
            "<text " + apex_avgRecoilVariationTooltip + "x='68' y='" + recoilUpTextY + "' text-anchor='start' class='recoilValue'>" + (viewkick_pitch_random >= 0 ? "-/+" : "") + viewkick_pitch_random + "°</text>" +
            "<text " + apex_vert_recoil_tooltip + "x='64' y='" + recoilInitUpTextY + "' text-anchor='middle' class='recoilValue'>" + viewkick_pitch_base + "°</text>" +
            "<text " + apex_avg_horz_recoil_tooltip + "x='64' y='111' text-anchor='middle' class='recoilValue'>" + viewkick_yaw_random + "°</text>" +
            "</svg>";
    } else {
        viewkick_pitch_base = Math.abs(viewkick_pitch_base);
        recoilUpLength = (90 - (viewkick_pitch_base * 12));
        recoilUpTextY = (71 - (viewkick_pitch_base * 12));
        recoilInitUpTextY = (86 - (viewkick_pitch_base * 12));
        recoilHorLength1 = (60 - (viewkick_yaw_base_max * 30)) + 4;
        recoilHorLength2 = (60 + (Math.abs(viewkick_yaw_base_min) * 30)) + 4;
        point5inc = ((viewkick_pitch_base) > .5) ? "<line x1='55' y1='75' x2='65' y2='75' style='stroke:white;stroke-width:1'></line>" : "";
        oneIncrease = ((viewkick_pitch_base) > 1.0) ? "<line x1='55' y1='60' x2='65' y2='60' style='stroke:white;stroke-width:1'></line>" : "";
        onePoint5Increase = ((viewkick_pitch_base) > 1.5) ? "<line x1='55' y1='45' x2='65' y2='45' style='stroke:white;stroke-width:1'></line>" : "";
        apex_recoilGraphic =  "<svg viewbox='0 0 130 100' style='width:100px;height:111px'>" +
            point5inc + oneIncrease + onePoint5Increase +
            "<line x1='" + recoilHorLength1 + "' y1='90' x2='" + recoilHorLength2 + "' y2='90' style='stroke:white;stroke-width:2'></line>" + // Left - Right
            "<line x1='64' y1='90' x2='64' y2='" + (recoilUpLength+ 8).toString() + "' style='stroke:white;stroke-width:2'></line>" + // Up - Down
            "<text " + apex_horz_recoil_tooltip + "x='" + (recoilHorLength1 - 8).toString() + "' y='95' text-anchor='end' class='recoilValue'>" + viewkick_yaw_base_max + "°</text>" +
            "<text " + apex_horz_recoil_tooltip + "x='" + (recoilHorLength2 + 8).toString() + "' y='95' class='recoilValue'>" + Math.abs(viewkick_yaw_base_min) + "°</text>" +
            "<text " + apex_avgRecoilVariationTooltip + "x='68' y='" + (recoilUpTextY + 8) + "' text-anchor='start' class='recoilValue'>" + (viewkick_pitch_random >= 0 ? "-/+" : "") + viewkick_pitch_random + "°</text>" +
            "<text " + apex_vert_recoil_tooltip + "x='64' y='" + (recoilInitUpTextY + 8) + "' text-anchor='middle' class='recoilValue'>" + viewkick_pitch_base + "°</text>" +
            "<text " + apex_avg_horz_recoil_tooltip + "x='64' y='111' text-anchor='middle' class='recoilValue'>" + viewkick_yaw_random + "°</text>" +
            "</svg>";
    }
    return apex_recoilGraphic;

}

function apex_createNewRecoilGraphic(viewkick_pattern_data_y_avg, viewkick_pattern_data_x_avg, viewkick_pattern_data_x_min,
                                     viewkick_pattern_data_x_max, viewkick_pattern_data_sizex_avg, viewkick_pattern_data_sizey_avg,
                                     viewkick_pitch_base, viewkick_pitch_random, viewkick_yaw_base, viewkick_yaw_random){
    let apex_recoilGraphic;
    if(viewkick_pattern_data_y_avg !== undefined) {
        // noinspection JSSuspiciousNameCombination
        const abs_viewkick_pattern_data_y_avg = Math.abs(viewkick_pattern_data_y_avg);
        const recoilUpLength = (90 - ((parseFloat(viewkick_pattern_data_sizey_avg) + 0.5) * 30));
        const recoilUpTextY = (71 - ((parseFloat(viewkick_pattern_data_sizey_avg) + 0.5) * 30));
        const recoilInitUpTextY = (86 - ((parseFloat(viewkick_pattern_data_sizey_avg) + 0.5) * 30));
        const recoilHorLength1 = (60 - (viewkick_pattern_data_x_max * 30)) + 4;
        const recoilHorLength2 = (60 + (Math.abs(viewkick_pattern_data_x_min) * 30)) + 4;
        const point5inc = ((viewkick_pattern_data_sizey_avg + 0.5) > .5) ? "<line x1='55' y1='75' x2='65' y2='75' style='stroke:white;stroke-width:1'></line>" : "";
        const oneIncrease = ((viewkick_pattern_data_sizey_avg + 0.5) > 1.0) ? "<line x1='55' y1='60' x2='65' y2='60' style='stroke:white;stroke-width:1'></line>" : "";
        const onePoint5Increase = ((viewkick_pattern_data_sizey_avg + 0.5) > 1.5) ? "<line x1='55' y1='45' x2='65' y2='45' style='stroke:white;stroke-width:1'></line>" : "";
        if (viewkick_pattern_data_sizey_avg <= 2) {
            apex_recoilGraphic = "<svg viewbox='0 0 130 100' style='width:100px;height:111px'>" +
                point5inc + oneIncrease + onePoint5Increase +
                "<line x1='" + recoilHorLength1 + "' y1='90' x2='" + recoilHorLength2 + "' y2='90' style='stroke:white; stroke-width:2'></line>" + // Left - Right
                "<line x1='64' y1='90' x2='64' y2='" + recoilUpLength + "' style='stroke:white;stroke-width:2'></line>" + // Up - Down
                "<text " + apex_horz_recoil_tooltip + "x='" + (recoilHorLength1 - 4).toString() + "' y='95' text-anchor='end' class='recoilValue'>" + parseFloat(viewkick_pattern_data_x_max).toFixed(3) + "°</text>" +
                "<text " + apex_horz_recoil_tooltip + "x='" + (recoilHorLength2 + 4).toString() + "' y='95' class='recoilValue'>" + Math.abs(viewkick_pattern_data_x_min).toFixed(3) + "°</text>" +
                "<text " + apex_avgRecoilVariationTooltip + "x='68' y='" + recoilUpTextY + "' text-anchor='start' class='recoilValue'>" + (abs_viewkick_pattern_data_y_avg >= 0 ? "-/+" : "") + abs_viewkick_pattern_data_y_avg + "°</text>" +
                "<text " + apex_vert_recoil_tooltip + "x='64' y='" + recoilInitUpTextY + "' text-anchor='middle' class='recoilValue'>" + viewkick_pattern_data_sizey_avg + "°</text>" +
                "<text " + apex_avg_horz_recoil_tooltip + "x='64' y='111' text-anchor='middle' class='recoilValue'>" + viewkick_pattern_data_x_avg + "°</text>" +
                "</svg>";
        } else {
            apex_recoilGraphic = "<svg viewbox='0 0 120 100' style='width:100px;height:111px'>" +
                "<line x1='54' y1='90' x2='74' y2='90' style='stroke:#555;stroke-width:2'></line>" +
                "<line x1='64' y1='90' x2='64' y2='80' style='stroke:#555;stroke-width:2'></line>" +
                "<text " + apex_horz_recoil_tooltip + "x='48' y='95' text-anchor='end' class='recoilValue'>" + parseFloat(viewkick_pattern_data_x_max).toFixed(3) + "°</text>" +
                "<text " + apex_horz_recoil_tooltip + "x='78' y='95' class='recoilValue'>" + Math.abs(viewkick_pattern_data_x_min).toFixed(3) + "°</text>" +
                "<text " + apex_avgRecoilVariationTooltip + "x='68' y='64' text-anchor='start' class='recoilValue'>" + (abs_viewkick_pattern_data_y_avg >= 0 ? "-/+" : "") + abs_viewkick_pattern_data_y_avg + "°</text>" +
                "<text " + apex_vert_recoil_tooltip + "x='64' y='76' text-anchor='middle' class='recoilValue'>" + viewkick_pattern_data_sizey_avg + "°</text>" +
                "<text " + apex_avg_horz_recoil_tooltip + "x='64' y='111' text-anchor='middle' class='recoilValue'>" + viewkick_pattern_data_x_avg + "°</text>" +
                "</svg>";
        }
        return apex_recoilGraphic;
    } else {
        apex_recoilGraphic = apex_createNonPatternRecoilGraphic(viewkick_pattern_data_y_avg, viewkick_pattern_data_x_avg, viewkick_pattern_data_x_min,
            viewkick_pattern_data_x_max, viewkick_pattern_data_sizex_avg, viewkick_pattern_data_sizey_avg,
            viewkick_pitch_base, viewkick_pitch_random, viewkick_yaw_base, viewkick_yaw_random);
        return apex_recoilGraphic;

    }
}

function apex_createSpreadLabels(ads_move_speed_scale, zoom_time_in, zoom_time_out, zoom_fov){
    return "<div class='apex_spreadMoveLabel' "+ apex_ads_move_fov_Tooltip +"><span class='apex_lblSuffixText'>x</span>" + ads_move_speed_scale + "|" + zoom_fov + "°</div>" +
        "<div class='apex_spreadBaseLabel'"+ apex_ads_zoom_Tooltip +">" + zoom_time_in + "<span class='apex_lblSuffixText'>s</span>|" + zoom_time_out + "<span class='apex_lblSuffixText'>s </span></div>";
}

// TODO: Add new shotgun pellet size representation
function apex_createShotgunBlastGraphic(weaponStats) {
    let charge_time;
    if (weaponStats['charge_time'] === undefined) {
        charge_time = -1
    } else {
        charge_time = parseFloat(weaponStats['charge_time']);
    }
    let shotgunGraphic;
    const horz_01_data = weaponStats['blast_pattern_data_x'];
    const vert_01_data = weaponStats['blast_pattern_data_y'];
    const blastPatternCount = weaponStats['blast_pattern_data_x'].length;
    shotgunGraphic = "<svg viewBox='0 0 100 100' style='width:100px;height:100px;'>" +"";
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
        shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (2).toString() + "' class='apex_shotgunHipPoint'></circle>" +"";
    }
    if (weaponStats['blast_pattern_ads_scale'] !== undefined) {
        const ads_horz_01_data = weaponStats['blast_pattern_data_x_ads'];
        const ads_vert_01_data = weaponStats['blast_pattern_data_y_ads'];
        for (let i = 0; i < blastPatternCount; i++){
            let horz_data = 0;
            let vert_data = 0;
            horz_data = (50 + ads_horz_01_data[i]);
            vert_data = (50 + (ads_vert_01_data[i] * -1));
            shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (2).toString() + "' class='apex_shotgunADSPoint'></circle>" +"";
        }
    } else if (charge_time > 0.0){
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

//Second Shotgun Graph - More Accurate but doesn't looks as good.
// Think we might live with one that looks better on the chart and redirect to recoil pattern page where they can be
// graphed and shown properly
// noinspection JSUnusedGlobalSymbols
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
    shotgunGraphic = "<svg viewBox='0 0 100 100' style='width:100px;height:100px;'>" +""; //viewBox='15 15 70 70'
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
        shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (1).toString() + "' class='apex_shotgunHipPoint'></circle>" +"";
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
        shotgunGraphic += "<circle cx='" + horz_data + "' cy='" + vert_data + "' r='" + (1).toString() + "' class='apex_shotgunADSPoint'></circle>" +"";
    }
    shotgunGraphic += "</svg>";
    return shotgunGraphic;
}

<!--suppress HtmlUnknownAttribute -->
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
            spreadGraphic = "<svg viewBox='0 0 100 100' style='width:100px;'>" +

                "<circle cx='50' cy='50' r='" + (StandADS).toString() + "' class='apex_hipSpreadLine1'></circle>" +
                "<circle cx='50' cy='50' r='" + (AirSpread).toString() + "' class='apex_hipSpreadLine2'></circle>" +
                "<line x1='50' y1='" + (lineOffset + 50) + "' x2='50' y2='" + (lineOffset + 65) + "' class='apex_hipSpreadLine01'></line>" +
                "<line x1='50' y1='" + (50 - lineOffset) + "' x2='50' y2='" + (35 - lineOffset) + "' class='apex_hipSpreadLine01'></line>" +

                "<line y1='50' x1='" + (lineOffset + 50) + "' y2='50' x2='" + (lineOffset + 65) + "' class='apex_hipSpreadLine01'></line>" +
                "<line y1='50' x1='" + (50 - lineOffset) + "' y2='50' x2='" + (35 - lineOffset) + "' class='apex_hipSpreadLine01'></line>" +

                "<text x='3' y='99' class='apex_standADSSpreadValue'>" + spread_stand_ads.toFixed(2) + "°</text>" +
                "<text x='32' y='99' class='apex_spreadValueSeparator'>|</text>" +
                "<text x='36.5' y='99' class='apex_standHipSpreadValue'>" + Number(HIPSpread).toFixed(2) + "°</text>" +
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
    spread_kick_on_fire_air_ads  = variable_array[12];
    spread_kick_on_fire_air_hip  = variable_array[13];
    spread_decay_delay  = variable_array[14];
    spread_moving_decay_rate  = variable_array[15];
    spread_decay_rate  = variable_array[16];
    spread_moving_increase_rate  = variable_array[17];

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

function apex_createBurstLabels(burst_fire_count) {
    if(burst_fire_count === undefined || parseFloat(burst_fire_count) < 1) {
        return "";
    } else {
        return "<span class='apex_lblSuffixText'>x</span>" + burst_fire_count;
    }

}

function apex_createChargeSpinUpLabels(weaponStats){
    if (weaponStats['charge_time'] !== undefined && parseFloat(weaponStats['charge_time']) > 0.0){
        return "<span "+ apex_chargeUpTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-n\"></span>" + weaponStats['charge_time'] + "<span class='apex_lblSuffixText'>s</span></span>" +
            "<span "+ apex_chargeCooldownDelayTooltip +"><span class=\"ui-icon ui-icon-transferthick-e-w\"></span><span>" + weaponStats['charge_cooldown_delay'] + "</span><span class='apex_lblSuffixText'>s</span></span>" +
            "<span "+ apex_chargeCooldownTimeTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-s\"></span><span>" + weaponStats['charge_cooldown_time'] +"</span><span class='apex_lblSuffixText'>s</span></span>";
    } else if (weaponStats['fire_rate_max_time_speedup'] !== undefined && parseFloat(weaponStats['fire_rate_max_time_speedup']) > 0.0){
        return "<span class='apex_lblSpinUpValue'><span "+ apex_chargeSpinUpTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-n\"></span>" + weaponStats['fire_rate_max_time_speedup'] + "<span class='apex_lblSuffixText'>s</span></span>" +
            "<span "+ apex_chargeSpinUpCooldownTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-s\"></span><span>" + weaponStats['fire_rate_max_time_cooldown'] +"</span><span class='apex_lblSuffixText'>s</span></span></span>";
    } else if (weaponStats['sustained_discharge_duration'] !== undefined) {
        // beam duration and pulse frequency for the charge rifle
        return "<span "+ apex_sustainedDischargeTooltip +"><span><img class='apex_sustainedPulseValue' src='./pages/apex/icons/beam_multi.png' alt='' height='12px' width='15px'></span>" + weaponStats['sustained_discharge_duration'] + "<span class='apex_lblSuffixText'>s</span></span>" +
            "<span "+ apex_sustainedPulseTooltip +"><span><img class='apex_sustainedPulseValue' src='./pages/apex/icons/pulse_s.png' alt='' height='12px' width='15px'></span>" + weaponStats['sustained_discharge_pulse_frequency'] + "<span class='apex_lblSuffixText'>s</span></span>" +
            "<span "+ apex_chargeCooldownDelayTooltip +"><span class=\"ui-icon ui-icon-transferthick-e-w\"></span><span>" + weaponStats['charge_cooldown_delay'] + "</span><span class='apex_lblSuffixText'>s</span></span>" +
            "<span "+ apex_chargeCooldownTimeTooltip +"><span class=\"ui-icon ui-icon-arrowthick-1-s\"></span><span>" + weaponStats['charge_cooldown_time'] +"</span><span class='apex_lblSuffixText'>s</span></span>";
    } else {
        return "<span class='apex_lblChargeValue_Hidden'><span><span class=\"ui-icon ui-icon-arrowthick-1-n\"></span><span class='apex_lblSuffixText'></span>s</span>" +
            "<span><span class=\"ui-icon ui-icon-transferthick-e-w\"></span><span>1.25</span><span class='apex_lblSuffixText'></span>s</span>" +
            "<span><span class=\"ui-icon ui-icon-arrowthick-1-s\"></span><span>1.5</span><span class='apex_lblSuffixText'>s</span></span></span>";
    }
}

function apex_createFireRateLabels(weaponStats) {
    if(weaponStats['fire_rate_max'] === undefined) {
        return ""+weaponStats['effective_fire_rate'] +"";
    } else {
        const max_effective_rof = parseFloat(weaponStats['fire_rate_max']) * 60;
        const min_effective_rof = parseFloat(weaponStats['fire_rate']) * 60;
        return ""+ min_effective_rof +" - " + max_effective_rof +"";
    }
}

const clamp = (min, max) => (value) =>
    value < min ? min : value > max ? max : value;

function apex_createDamageChart(weaponStats, printname, damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    if (printname.includes("WPN_CHARGE_RIFLE")) {
        return apex_createChargeRifleDamageChart(weaponStats, damageArr, distanceArr, numOfPellets,  hs_multi, ls_multi, allow_hs, max_hs_distance);
    }
    if (printname.includes("WPN_SNIPER")) {
        return apex_createKraberDamageChart(weaponStats, damageArr, distanceArr, numOfPellets,  hs_multi, ls_multi, allow_hs, max_hs_distance);
    }
    if (printname.includes("WPN_WINGMAN")) {
        return apex_createNewDamageChart150Max(weaponStats, damageArr, distanceArr, numOfPellets,  hs_multi, ls_multi, allow_hs, max_hs_distance)
    }
    let damageChart;
    if ((max_hs_distance) > 700 ){
        damageChart = apex_createSniperRifleDamageChart(weaponStats, damageArr, distanceArr, numOfPellets,  hs_multi, ls_multi, allow_hs, max_hs_distance);
    } else {
        if ((damageArr[0] * hs_multi) > 50 ){
            damageChart = apex_createNewDamageChart100Max(weaponStats, damageArr, distanceArr, numOfPellets,  hs_multi, ls_multi, allow_hs, max_hs_distance);
        } else {
            damageChart = apex_createNewDamageChart50Max(weaponStats, damageArr, distanceArr, numOfPellets,  hs_multi, ls_multi, allow_hs, max_hs_distance)
        }
    }
    return damageChart;
}

function apex_createSniperRifleDamageChart(weaponStats, damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    let i;
    let damageLineCoords;
    let hs_damageLineCoords = "";
    let ls_damageLineCords = "";
    let hs_maxDamageText = "";
    let hs_minDamageText = "";
    let ls_maxDamageText = "";
    let ls_minDamageText = "";
    let chart_dist = 800;
    let chart_scale = 200/chart_dist;

    //New Standard
    let max_Damage = Math.round(damageArr[0]);
    let mid_Damage = Math.round(damageArr[1]);
    let min_Damage = Math.round(damageArr[2]);
    damageLineCoords = "0," + (100 - (0.666666 * max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (0.666666 * max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.666666 * max_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.666666 * mid_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.666666 * mid_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.666666 * min_Damage)).toString() + " ";
    damageLineCoords += (distanceArr[2]+100).toString()+"," + (100 - (0.666666 * min_Damage)).toString()+ " ";
    damageLineCoords += (200).toString()+"," + (100 - (0.666666 * min_Damage)).toString();


    // let maxDamageText = "<text x='"+(chart_scale*distanceArr[0])+"' y='" + ((95 - mid_Damage)).toString() + "' class='apex_chartMinMaxLabel'>" + mid_Damage + "</text>";
    let maxDamageText = "<text x='"+(chart_scale*distanceArr[0])+"' y='" + ((95 - (0.666666 * mid_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + mid_Damage + "</text>";
    let minDamageText = "<text x='"+(25 + (chart_scale*distanceArr[2]))+"' y='" + ((95 - (0.666666 * min_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + min_Damage + "</text>";


    //Limb Damage
    if(ls_multi !== 1.0) {
        let ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        let ls_midDamage = Math.round(damageArr[1] * ls_multi);
        let ls_minDamage = Math.round(damageArr[2] * ls_multi);
        ls_damageLineCords = "0," + (100 - (0.666666 * ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (0.666666 * ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.666666 * ls_maxDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.666666 * ls_midDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.666666 * ls_midDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.666666 * ls_minDamage)).toString() + " ";
        ls_damageLineCords += (distanceArr[2]+100).toString()+"," + (100 - (0.666666 * ls_minDamage)).toString()+ " ";
        ls_damageLineCords += (200).toString()+"," + (100 - (0.666666 * ls_minDamage)).toString();

        ls_maxDamageText = "<text x='15' y='" + ((111 - (0.666666 * ls_midDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        // ls_minDamageText = "<text x='"+(chart_scale*distanceArr[1])+"' y='" + ((90 - ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        ls_minDamageText = "<text x='185' y='" + ((111 - (0.666666 * ls_midDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
    }

    // Headshot Damage - Some weapons have very short max HS range.
    if (allow_hs && hs_multi > 1.0) {
        let hs_damageArr = [];
        let hs_distanceArr = [];
        let hs_short = false;

        for (i = 0; i < damageArr.length; i++) {
            if (distanceArr[i] < max_hs_distance) {

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i] * hs_multi));

            } else if (hs_short) {
                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i]));
            } else {
                hs_distanceArr.push(max_hs_distance);
                hs_damageArr.push((damageArr[i-1] * hs_multi));

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push(damageArr[i]);
                hs_short = true;
            }
        }
        if (hs_damageArr.length < 4) {
            hs_distanceArr.push(max_hs_distance);
            hs_damageArr.push((damageArr[2] * hs_multi))
        }
        let hs_Dmg0 = Math.round(hs_damageArr[0]);
        let hs_Dmg1 = Math.round(hs_damageArr[1]);
        let hs_Dmg2 = Math.round(hs_damageArr[2]);
        let hs_Dmg3 = Math.round(hs_damageArr[3]);
        hs_damageLineCoords = "0," + (100 - (0.666666 * hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[0]).toString() + "," + (100 - (0.666666 * hs_Dmg0)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (0.666666 * hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (0.666666 * hs_Dmg1)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (0.666666 * hs_Dmg1)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (0.666666 * hs_Dmg2)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.666666 * hs_Dmg2)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.666666 * hs_Dmg3)).toString() + " ";
        if ( hs_Dmg2 >= hs_Dmg3){
            hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.666666 * damageArr[2])).toString() + " ";
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (0.666666 * damageArr[2])).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (0.666666 * damageArr[2])).toString();
        } else {
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (0.666666 * hs_Dmg3)).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (0.666666 * hs_Dmg3)).toString();
        }
        if (hs_Dmg0 > 130){
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[1]) + "' y='" + ((115 - (0.666666 * hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        } else {
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[1]) + "' y='" + ((95 - (0.666666 * hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        }
        if (hs_Dmg1 > 130){
            hs_minDamageText = "<text x='" + ((chart_scale * hs_distanceArr[3])- 10) + "' y='" + ((115 - (0.666666 * hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        } else {
            hs_minDamageText = "<text x='" + (chart_scale * hs_distanceArr[3]- 10) + "' y='" + ((95 - (0.666666 * hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        }
    }

    //Shotgun pellets
    let pelletsLabel = "";
    if (numOfPellets > 1){
        pelletsLabel = "<text x='135' y='98' class='apex_chartMinMaxLabel'>" + numOfPellets + "pellets</text>";
    }

    //svg dynamic string
    let svg_str = "";
    let dist_array = ["100m", "200m", "300m", "400m", "500m", "600m", "700m", "800m", "900m", "1000m"];
    svg_str += "<svg viewbox='0 0 200 100' class='apex_damageChart_test'>" +"";
    svg_str += "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' ></rect>" +"";
    let thick_spacing =(200/(max_hs_distance+50))*100;
    let x_thin = thick_spacing/2;
    svg_str += "<line x1='"+(x_thin)+"' y1='0' x2='"+(x_thin)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    // svg_str += "<line x1='"+(x_thin * 2)+"' y1='0' x2='"+(x_thin * 2)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    // svg_str += "<line x1='"+(x_thin * 3)+"' y1='0' x2='"+(x_thin * 3)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    // svg_str += "<line x1='"+(x_thin * 4)+"' y1='0' x2='"+(x_thin * 4)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    let chart_gap = 0;
    let chart_line_count = (max_hs_distance+50)/100;
    while (chart_gap < chart_line_count) {
        let x_val = thick_spacing * (chart_gap+1);

        svg_str += "<line x1='"+x_val+"' y1='0' x2='"+x_val+"' y2='100' class='apex_gridLineFat'></line>" +"";
        svg_str += "<line x1='"+(x_thin + x_val)+"' y1='0' x2='"+(x_thin + x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        // svg_str += "<line x1='"+((x_thin * 2)+x_val)+"' y1='0' x2='"+((x_thin * 2)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        // svg_str += "<line x1='"+((x_thin * 3)+x_val)+"' y1='0' x2='"+((x_thin * 3)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        // svg_str += "<line x1='"+((x_thin * 4)+x_val)+"' y1='0' x2='"+((x_thin * 4)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<text x='"+(x_val + 2)+"' y='99' class='apex_chartLabel'>"+dist_array[chart_gap]+"</text>" +"";
        chart_gap += 1;
    }

    svg_str += "<line x1='0' y1='66' x2='200' y2='66' style='stroke:rgb(175,175,175);stroke-width:.5'></line>" +"";
    svg_str += "<line x1='0' y1='33' x2='200' y2='33' style='stroke:rgb(175,175,175);stroke-width:.25'></line>" +"";
    svg_str += "<text x='0' y='74' class='apex_chartLabel'>50</text>" +"";
    svg_str += "<text x='0' y='41' class='apex_chartLabel'>100</text>" +"";
    svg_str += "<text x='0' y='8' class='apex_chartLabel'>150</text>" +"";

    svg_str += "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCords + "'></polyline>" + ls_maxDamageText + ls_minDamageText + "";
    svg_str += "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'></polyline>" + hs_maxDamageText + hs_minDamageText +"";
    svg_str += "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'></polyline>" + maxDamageText + minDamageText + "";
    svg_str += pelletsLabel +"</svg>";

    return svg_str
}

function apex_createKraberDamageChart(weaponStats, damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    let i;
    let damageLineCoords;
    let hs_damageLineCoords = "";
    let ls_damageLineCords = "";
    let hs_maxDamageText = "";
    let hs_minDamageText = "";
    let ls_maxDamageText = "";
    let ls_minDamageText = "";
    let chart_dist = 800;
    let chart_scale = 200/chart_dist;

    //New Standard
    let max_Damage = Math.round(damageArr[0]);
    let mid_Damage = Math.round(damageArr[1]);
    let min_Damage = Math.round(damageArr[2]);
    damageLineCoords = "0," + (100 - (0.333333 * max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (0.333333 * max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.333333 * max_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.333333 * mid_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.333333 * mid_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.333333 * min_Damage)).toString() + " ";
    damageLineCoords += (distanceArr[2]+100).toString()+"," + (100 - (0.333333 * min_Damage)).toString()+ " ";
    damageLineCoords += (200).toString()+"," + (100 - (0.333333 * min_Damage)).toString();


    // let maxDamageText = "<text x='"+(chart_scale*distanceArr[0])+"' y='" + ((95 - mid_Damage)).toString() + "' class='apex_chartMinMaxLabel'>" + mid_Damage + "</text>";
    let maxDamageText = "<text x='"+(chart_scale*distanceArr[0])+"' y='" + ((95 - (0.333333 * mid_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + mid_Damage + "</text>";
    let minDamageText = "<text x='"+(25 + (chart_scale*distanceArr[2]))+"' y='" + ((95 - (0.333333 * min_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + min_Damage + "</text>";


    //Limb Damage
    if(ls_multi !== 1.0) {
        let ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        let ls_midDamage = Math.round(damageArr[1] * ls_multi);
        let ls_minDamage = Math.round(damageArr[2] * ls_multi);
        ls_damageLineCords = "0," + (100 - (0.333333 * ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (0.333333 * ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.333333 * ls_maxDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.333333 * ls_midDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.333333 * ls_midDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.333333 * ls_minDamage)).toString() + " ";
        ls_damageLineCords += (distanceArr[2]+100).toString()+"," + (100 - (0.333333 * ls_minDamage)).toString()+ " ";
        ls_damageLineCords += (200).toString()+"," + (100 - (0.333333 * ls_minDamage)).toString();

        ls_maxDamageText = "<text x='15' y='" + ((115 - (0.333333 * ls_midDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        // ls_minDamageText = "<text x='"+(chart_scale*distanceArr[1])+"' y='" + ((90 - ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        ls_minDamageText = "<text x='175' y='" + ((115 - (0.333333 * ls_midDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
    }

    // Headshot Damage - Some weapons have very short max HS range.
    if (allow_hs && hs_multi > 1.0) {
        let hs_damageArr = [];
        let hs_distanceArr = [];
        let hs_short = false;

        for (i = 0; i < damageArr.length; i++) {
            if (distanceArr[i] < max_hs_distance) {

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i] * hs_multi));

            } else if (hs_short) {
                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i]));
            } else {
                hs_distanceArr.push(max_hs_distance);
                hs_damageArr.push((damageArr[i-1] * hs_multi));

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push(damageArr[i]);
                hs_short = true;
            }
        }
        if (hs_damageArr.length < 4) {
            hs_distanceArr.push(max_hs_distance);
            hs_damageArr.push((damageArr[2] * hs_multi))
        }
        let hs_Dmg0 = Math.round(hs_damageArr[0]);
        let hs_Dmg1 = Math.round(hs_damageArr[1]);
        let hs_Dmg2 = Math.round(hs_damageArr[2]);
        let hs_Dmg3 = Math.round(hs_damageArr[3]);
        hs_damageLineCoords = "0," + (100 - (0.333333 * hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[0]).toString() + "," + (100 - (0.333333 * hs_Dmg0)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (0.333333 * hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (0.333333 * hs_Dmg1)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (0.333333 * hs_Dmg1)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (0.333333 * hs_Dmg2)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.333333 * hs_Dmg2)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.333333 * hs_Dmg3)).toString() + " ";
        if ( hs_Dmg2 >= hs_Dmg3){
            hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.333333 * damageArr[2])).toString() + " ";
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (0.333333 * damageArr[2])).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (0.333333 * damageArr[2])).toString();
        } else {
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (0.333333 * hs_Dmg3)).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (0.333333 * hs_Dmg3)).toString();
        }
        if (hs_Dmg0 > 140){
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[1]) + "' y='" + ((115 - (0.333333 * hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        } else {
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[1]) + "' y='" + ((95 - (0.333333 * hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        }
        if (hs_Dmg1 > 140){
            hs_minDamageText = "<text x='" + ((chart_scale * max_hs_distance)- 25) + "' y='" + ((115 - (0.333333 * hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        } else {
            hs_minDamageText = "<text x='" + (chart_scale * max_hs_distance- 20) + "' y='" + ((95 - (0.333333 * hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        }
    }

    //Shotgun pellets
    let pelletsLabel = "";
    if (numOfPellets > 1){
        pelletsLabel = "<text x='135' y='98' class='apex_chartMinMaxLabel'>" + numOfPellets + "pellets</text>";
    }

    //svg dynamic string
    let svg_str = "";
    let dist_array = ["100m", "200m", "300m", "400m", "500m", "600m", "700m", "800m", "900m", "1000m"];
    svg_str += "<svg viewbox='0 0 200 100' class='apex_damageChart_test'>" +"";
    svg_str += "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' ></rect>" +"";
    let thick_spacing =(200/(max_hs_distance+50))*100;
    let x_thin = thick_spacing/2;
    svg_str += "<line x1='"+(x_thin)+"' y1='0' x2='"+(x_thin)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    // svg_str += "<line x1='"+(x_thin * 2)+"' y1='0' x2='"+(x_thin * 2)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    // svg_str += "<line x1='"+(x_thin * 3)+"' y1='0' x2='"+(x_thin * 3)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    // svg_str += "<line x1='"+(x_thin * 4)+"' y1='0' x2='"+(x_thin * 4)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    let chart_gap = 0;
    let chart_line_count = (max_hs_distance+50)/100;
    while (chart_gap < chart_line_count) {
        let x_val = thick_spacing * (chart_gap+1);

        svg_str += "<line x1='"+x_val+"' y1='0' x2='"+x_val+"' y2='100' class='apex_gridLineFat'></line>" +"";
        svg_str += "<line x1='"+(x_thin + x_val)+"' y1='0' x2='"+(x_thin + x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        // svg_str += "<line x1='"+((x_thin * 2)+x_val)+"' y1='0' x2='"+((x_thin * 2)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        // svg_str += "<line x1='"+((x_thin * 3)+x_val)+"' y1='0' x2='"+((x_thin * 3)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        // svg_str += "<line x1='"+((x_thin * 4)+x_val)+"' y1='0' x2='"+((x_thin * 4)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<text x='"+(x_val + 2)+"' y='99' class='apex_chartLabel'>"+dist_array[chart_gap]+"</text>" +"";
        chart_gap += 1;
    }

    svg_str += "<line x1='0' y1='66' x2='200' y2='66' style='stroke:rgb(175,175,175);stroke-width:.5'></line>" +"";
    svg_str += "<line x1='0' y1='33' x2='200' y2='33' style='stroke:rgb(175,175,175);stroke-width:.25'></line>" +"";
    svg_str += "<text x='0' y='74' class='apex_chartLabel'>100</text>" +"";
    svg_str += "<text x='0' y='41' class='apex_chartLabel'>200</text>" +"";
    svg_str += "<text x='0' y='8' class='apex_chartLabel'>300</text>" +"";

    svg_str += "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCords + "'></polyline>" + ls_maxDamageText + ls_minDamageText + "";
    svg_str += "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'></polyline>" + hs_maxDamageText + hs_minDamageText +"";
    svg_str += "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'></polyline>" + maxDamageText + minDamageText + "";
    svg_str += pelletsLabel +"</svg>";

    return svg_str
}

function apex_createChargeRifleDamageChart(weaponStats, damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    let i;
    let beam_multi = 0.067;
    let damageLineCoords;
    let hs_damageLineCoords = "";
    let ls_beam_damageLineCords = "";
    let hs_maxDamageText = "";
    let hs_minDamageText = "";
    let ls_maxDamageText = "";
    let ls_minDamageText = "";
    let chart_dist = distanceArr[2]+100;
    let chart_scale = 200/chart_dist;

    //New Standard
    let max_Damage = Math.round(damageArr[0]);
    let mid_Damage = Math.round(damageArr[1]);
    let min_Damage = Math.round(damageArr[2]);
    damageLineCoords = "0," + (100 - max_Damage).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[0]).toString() + "," + (100 - max_Damage).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - max_Damage).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - mid_Damage).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - mid_Damage).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - min_Damage).toString() + " ";
    damageLineCoords += (distanceArr[2]+100).toString()+"," + (100 - min_Damage).toString();


    let maxDamageText = "<text x='"+(chart_scale*distanceArr[0])+"' y='" + ((111 - mid_Damage)).toString() + "' class='apex_chartMinMaxLabel'>" + mid_Damage + "</text>";
    let minDamageText = "<text x='"+(chart_scale*distanceArr[2])+"' y='" + ((95 - min_Damage)).toString() + "' class='apex_chartMinMaxLabel'>" + min_Damage + "</text>";


    //Limb Damage
    if(beam_multi !== 1.0) {
        let ls_beam_maxDamage = Math.round(damageArr[0] * beam_multi);
        let ls_beam_midDamage = Math.round(damageArr[1] * beam_multi);
        let ls_beam_minDamage = Math.round(damageArr[2] * beam_multi);
        ls_beam_damageLineCords = "0," + (95 - ls_beam_maxDamage).toString() + " ";
        ls_beam_damageLineCords += (chart_scale*distanceArr[0]).toString() + "," + (95 - ls_beam_maxDamage).toString() + " ";
        ls_beam_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (95 - ls_beam_maxDamage).toString() + " ";

        ls_beam_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (95 - ls_beam_midDamage).toString() + " ";
        ls_beam_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (95 - ls_beam_midDamage).toString() + " ";

        ls_beam_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (95 - ls_beam_minDamage).toString() + " ";
        ls_beam_damageLineCords += (distanceArr[2]+100).toString()+"," + (95 - ls_beam_minDamage).toString();

        ls_maxDamageText = "<text x='15' y='" + ((90 - ls_beam_midDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_beam_maxDamage + "</text>";
        ls_minDamageText = "<text x='190' y='94' class='apex_ls_chartMinMaxLabel'>" + ls_beam_minDamage + "</text>";
    }

    // Headshot Damage - Some weapons have very short max HS range.
    if (allow_hs && hs_multi > 1.0) {
        let hs_damageArr = [];
        let hs_distanceArr = [];
        let hs_short = false;

        for (i = 0; i < damageArr.length; i++) {
            if (distanceArr[i] < max_hs_distance) {

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i] * hs_multi));

            } else if (hs_short) {
                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i]));
            } else {
                hs_distanceArr.push(max_hs_distance);
                hs_damageArr.push((damageArr[i-1]));

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push(damageArr[i]);
                hs_short = true;
            }
        }
        let hs_Dmg0 = Math.round(hs_damageArr[0]);
        let hs_Dmg1 = Math.round(hs_damageArr[1]);
        let hs_Dmg2 = Math.round(hs_damageArr[2]);
        let hs_Dmg3 = Math.round(hs_damageArr[3]);
        hs_damageLineCoords = "0," + (100 - hs_Dmg0).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[0]).toString() + "," + (100 - hs_Dmg0).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - hs_Dmg0).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - hs_Dmg1).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - hs_Dmg1).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - hs_Dmg2).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - hs_Dmg2).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - hs_Dmg3).toString() + " ";
        hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - hs_Dmg3).toString();

        hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[1]) + "' y='" + ((95 - hs_Dmg0)).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        hs_minDamageText = "<text x='" + ((chart_scale * max_hs_distance)-20) + "' y='" + ((95 - hs_Dmg1)).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
    }

    //svg dynamic string
    let svg_str = "";
    let dist_array = ["100m", "200m", "300m", "400m", "500m", "600m", "700m", "800m", "900m", "1000m"];
    svg_str += "<svg viewbox='0 0 200 100' class='apex_damageChart_test'>" +"";
    svg_str += "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' ></rect>" +"";
    let thick_spacing =(200/(distanceArr[2]+100))*100;
    let x_thin = thick_spacing/5;
    svg_str += "<line x1='"+(x_thin)+"' y1='0' x2='"+(x_thin)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 2)+"' y1='0' x2='"+(x_thin * 2)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 3)+"' y1='0' x2='"+(x_thin * 3)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 4)+"' y1='0' x2='"+(x_thin * 4)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    let chart_gap = 0;
    let chart_line_count = distanceArr[2]/100;
    while (chart_gap < chart_line_count) {
        let x_val = thick_spacing * (chart_gap+1);

        svg_str += "<line x1='"+x_val+"' y1='0' x2='"+x_val+"' y2='100' class='apex_gridLineFat'></line>" +"";
        svg_str += "<line x1='"+(x_thin + x_val)+"' y1='0' x2='"+(x_thin + x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 2)+x_val)+"' y1='0' x2='"+((x_thin * 2)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 3)+x_val)+"' y1='0' x2='"+((x_thin * 3)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 4)+x_val)+"' y1='0' x2='"+((x_thin * 4)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<text x='"+(x_val + 2)+"' y='99' class='apex_chartLabel'>"+dist_array[chart_gap]+"</text>" +"";
        chart_gap += 1;
    }

    svg_str += "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175);stroke-width:.5'></line>" +"";
    svg_str += "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175);stroke-width:.5'></line>";
    svg_str += "<text x='0' y='58' class='apex_chartLabel'>50</text>";
    svg_str +="<text x='0' y='8' class='apex_chartLabel'>100</text>";

    svg_str += "<polyline class='apex_min_chartDamageLine' points='" + ls_beam_damageLineCords + "'></polyline>" + ls_maxDamageText + ls_minDamageText +"";
    svg_str += "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'></polyline>" + hs_maxDamageText + hs_minDamageText +"";
    svg_str += "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'></polyline>" + maxDamageText + minDamageText + "</svg>";

    return svg_str
}

function apex_createNewDamageChart150Max(weaponStats, damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    let i;
    let damageLineCoords;
    let hs_damageLineCoords = "";
    let ls_damageLineCords = "";
    let hs_maxDamageText = "";
    let hs_minDamageText = "";
    let ls_maxDamageText = "";
    let ls_minDamageText = "";
    let chart_dist = 300;
    let chart_scale = 200/chart_dist;

    //New Standard
    let max_Damage = Math.round(damageArr[0]);
    let mid_Damage = Math.round(damageArr[1]);
    let min_Damage = Math.round(damageArr[2]);
    damageLineCoords = "0," + (100 - (0.666666 * max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (0.666666 * max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.666666 * max_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.666666 * mid_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.666666 * mid_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.666666 * min_Damage)).toString() + " ";
    damageLineCoords += (distanceArr[2]+100).toString()+"," + (100 - (0.625  * min_Damage)).toString()+ " ";
    damageLineCoords += (200).toString()+"," + (100 - (0.625  * min_Damage)).toString();

    let maxDamageText = "<text x='"+(chart_scale*distanceArr[1])+"' y='" + ((95 - (0.666666 * mid_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + mid_Damage + "</text>";
    let minDamageText = "<text x='"+(chart_scale*distanceArr[2]+50)+"' y='" + ((95 - (0.666666 * min_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + min_Damage + "</text>";

    //Limb Damage
    if(ls_multi !== 1.0) {
        let ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        let ls_midDamage = Math.round(damageArr[1] * ls_multi);
        let ls_minDamage = Math.round(damageArr[2] * ls_multi);
        ls_damageLineCords = "0," + (100 - (0.666666 * ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (0.666666 * ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.666666 * ls_maxDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (0.666666 * ls_midDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.666666 * ls_midDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (0.666666 * ls_minDamage)).toString() + " ";
        ls_damageLineCords += (distanceArr[2]+100).toString()+"," + (100 - (0.666666 * ls_minDamage)).toString()+ " ";
        ls_damageLineCords += (200).toString()+"," + (100 - (0.666666 * ls_minDamage)).toString();

        ls_maxDamageText = "<text x='15' y='" + ((111 - (0.666666 * ls_minDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        ls_minDamageText = "<text x='185' y='" + ((111 - (0.666666 * ls_minDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
    }

    // Headshot Damage - Some weapons have very short max HS range.
    if (allow_hs && hs_multi > 1.0) {
        let hs_damageArr = [];
        let hs_distanceArr = [];
        let hs_short = false;

        for (i = 0; i < damageArr.length; i++) {
            if (distanceArr[i] < max_hs_distance) {

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i] * hs_multi));

            } else if (hs_short) {
                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i]));
            } else {
                hs_distanceArr.push(max_hs_distance);
                hs_damageArr.push((damageArr[i-1] * hs_multi));

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push(damageArr[i]);
                hs_short = true;
            }
        }
        if (hs_damageArr.length < 4) {
            hs_distanceArr.push(max_hs_distance);
            hs_damageArr.push((damageArr[2] * hs_multi))
        }
        let hs_Dmg0 = Math.round(hs_damageArr[0]);
        let hs_Dmg1 = Math.round(hs_damageArr[1]);
        let hs_Dmg2 = Math.round(hs_damageArr[2]);
        let hs_Dmg3 = Math.round(hs_damageArr[3]);
        hs_damageLineCoords = "0," + (100 - (0.666666 * hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[0]).toString() + "," + (100 - (0.666666 * hs_Dmg0)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (0.666666 * hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (0.666666 * hs_Dmg1)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (0.666666 * hs_Dmg1)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (0.666666 * hs_Dmg2)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.666666 * hs_Dmg2)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.666666 * hs_Dmg3)).toString() + " ";

        if ( hs_Dmg2 >= hs_Dmg3){
            hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (0.666666 * damageArr[2])).toString() + " ";
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (0.666666 * damageArr[2])).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (0.666666 * damageArr[2])).toString();
        } else {
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (0.666666 * hs_Dmg3)).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (0.666666 * hs_Dmg3)).toString();
        }
        if (hs_Dmg0 > 140){
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[1]) + "' y='" + ((115 - (0.666666 * hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        } else {
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[1]) + "' y='" + ((95 - (0.666666 * hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        }
        if (hs_Dmg1 > 140){
            hs_minDamageText = "<text x='" + ((chart_scale * max_hs_distance)-10) + "' y='" + ((115 - (0.666666 * hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        } else {
            hs_minDamageText = "<text x='" + ((chart_scale * max_hs_distance)-10) + "' y='" + ((95 - (0.666666 * hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        }
    }

    //Shotgun pellets
    let pelletsLabel = "";
    if (numOfPellets > 1){
        pelletsLabel = "<text x='135' y='98' class='apex_chartMinMaxLabel'>" + numOfPellets + "pellets</text>";
    }

    //svg dynamic string
    let svg_str = "";
    let dist_array = ["50m", "100m", "150m", "200m", "250m", "300m", "350m"];
    svg_str += "<svg viewbox='0 0 200 100' class='apex_damageChart_test'>" +"";
    svg_str += "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' ></rect>" +"";
    let thick_spacing;
    let chart_line_count;
    if (max_hs_distance > distanceArr[2]) {
        if (chart_dist === 150) {
            thick_spacing = (200/(100+50))*50;
            chart_line_count = 150 / 50;
        } else {
            thick_spacing = (200 / (max_hs_distance + 50)) * 50;
            chart_line_count = max_hs_distance / 50;
        }
    } else {
        thick_spacing = (200/(100+50))*50;
        chart_line_count = 150/50;
    }
    let x_thin = thick_spacing/5;
    svg_str += "<line x1='"+(x_thin)+"' y1='0' x2='"+(x_thin)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 2)+"' y1='0' x2='"+(x_thin * 2)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 3)+"' y1='0' x2='"+(x_thin * 3)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 4)+"' y1='0' x2='"+(x_thin * 4)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    let chart_gap = 0;

    while (chart_gap < chart_line_count) {
        let x_val = thick_spacing * (chart_gap+1);

        svg_str += "<line x1='"+x_val+"' y1='0' x2='"+x_val+"' y2='100' class='apex_gridLineFat'></line>" +"";
        svg_str += "<line x1='"+(x_thin + x_val)+"' y1='0' x2='"+(x_thin + x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 2)+x_val)+"' y1='0' x2='"+((x_thin * 2)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 3)+x_val)+"' y1='0' x2='"+((x_thin * 3)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 4)+x_val)+"' y1='0' x2='"+((x_thin * 4)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<text x='"+(x_val + 2)+"' y='99' class='apex_chartLabel'>"+dist_array[chart_gap]+"</text>" +"";
        chart_gap += 1;
    }

    svg_str += "<line x1='0' y1='66' x2='200' y2='66' style='stroke:rgb(175,175,175);stroke-width:.5'></line>" +"";
    svg_str += "<line x1='0' y1='33' x2='200' y2='33' style='stroke:rgb(175,175,175);stroke-width:.25'></line>" +"";
    svg_str += "<text x='0' y='74' class='apex_chartLabel'>50</text>" +"";
    svg_str += "<text x='0' y='41' class='apex_chartLabel'>100</text>" +"";
    svg_str += "<text x='0' y='8' class='apex_chartLabel'>150</text>" +"";

    svg_str += "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCords + "'></polyline>" + ls_maxDamageText + ls_minDamageText + "";
    svg_str += "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'></polyline>" + hs_maxDamageText + hs_minDamageText +"";
    svg_str += "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'></polyline>" + maxDamageText + minDamageText + "";
    svg_str += pelletsLabel +"</svg>";

    return svg_str
}

function apex_createNewDamageChart100Max(weaponStats, damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    let i;
    let damageLineCoords;
    let hs_damageLineCoords = "";
    let ls_damageLineCords = "";
    let hs_maxDamageText = "";
    let hs_minDamageText = "";
    let ls_maxDamageText = "";
    let ls_minDamageText = "";
    let chart_dist;
    if (max_hs_distance > distanceArr[2]){
        chart_dist = max_hs_distance+50;
    } else {
        if (distanceArr[2] < 100){
            chart_dist = 150;
        } else {
            chart_dist = distanceArr[2]+50;
        }
    }
    if(chart_dist < 150) {
        chart_dist = 150;
    }
    let chart_scale = 200/chart_dist;

    //New Standard
    let max_Damage = Math.round(damageArr[0]);
    let mid_Damage = Math.round(damageArr[1]);
    let min_Damage = Math.round(damageArr[2]);
    damageLineCoords = "0," + (100 - (max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (max_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (mid_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (mid_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (min_Damage)).toString() + " ";
    damageLineCoords += (distanceArr[2]+100).toString()+"," + (100 - (min_Damage)).toString()+ " ";
    damageLineCoords += (200).toString()+"," + (100 - (min_Damage)).toString();

    let maxDamageText = "<text x='"+(chart_scale*distanceArr[0])+"' y='" + ((95 - (mid_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + mid_Damage + "</text>";
    let minDamageText = "<text x='"+(chart_scale*distanceArr[2])+"' y='" + ((95 - (min_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + min_Damage + "</text>";


    //Limb Damage
    if(ls_multi !== 1.0) {
        let ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        let ls_midDamage = Math.round(damageArr[1] * ls_multi);
        let ls_minDamage = Math.round(damageArr[2] * ls_multi);
        ls_damageLineCords = "0," + (100 - (ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (ls_maxDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (ls_midDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (ls_midDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (ls_minDamage)).toString() + " ";
        ls_damageLineCords += (distanceArr[2]+100).toString()+"," + (100 - (ls_minDamage)).toString()+ " ";
        ls_damageLineCords += (200).toString()+"," + (100 - (ls_minDamage)).toString();

        ls_maxDamageText = "<text x='15' y='" + ((111 - (ls_midDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        ls_minDamageText = "<text x='185' y='" + ((111 - (ls_minDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
    }

    // Headshot Damage - Some weapons have very short max HS range.
    if (allow_hs && hs_multi > 1.0) {
        let hs_damageArr = [];
        let hs_distanceArr = [];
        let hs_short = false;

        for (i = 0; i < damageArr.length; i++) {
            if (distanceArr[i] < max_hs_distance) {

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i] * hs_multi));

            } else if (hs_short) {
                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i]));
            } else {
                hs_distanceArr.push(max_hs_distance);
                hs_damageArr.push((damageArr[i-1] * hs_multi));

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push(damageArr[i]);
                hs_short = true;
            }
        }
        if (hs_damageArr.length < 4) {
            hs_distanceArr.push(max_hs_distance);
            hs_damageArr.push((damageArr[2] * hs_multi))
        }
        let hs_Dmg0 = Math.round(hs_damageArr[0]);
        let hs_Dmg1 = Math.round(hs_damageArr[1]);
        let hs_Dmg2 = Math.round(hs_damageArr[2]);
        let hs_Dmg3 = Math.round(hs_damageArr[3]);
        hs_damageLineCoords = "0," + (100 - (hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[0]).toString() + "," + (100 - (hs_Dmg0)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (hs_Dmg1)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (hs_Dmg1)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (hs_Dmg2)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (hs_Dmg2)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (hs_Dmg3)).toString() + " ";

        if ( hs_Dmg2 >= hs_Dmg3){
            hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (1 * damageArr[2])).toString() + " ";
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (1 * damageArr[2])).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (1 * damageArr[2])).toString();
        } else {
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (hs_Dmg3)).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (hs_Dmg3)).toString();
        }
        if (hs_Dmg0 > 85){
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[0]) + "' y='" + ((115 - (hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        } else {
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[0]) + "' y='" + ((95 - (hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        }
        if (hs_Dmg1 > 85){
            hs_minDamageText = "<text x='" + ((chart_scale * max_hs_distance)-16) + "' y='" + ((115 - (hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        } else {
            hs_minDamageText = "<text x='" + ((chart_scale * max_hs_distance)-16) + "' y='" + ((95 - (hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        }
    }

    //Shotgun pellets
    let pelletsLabel = "";
    if (numOfPellets > 1){
        pelletsLabel = "<text x='135' y='98' class='apex_chartMinMaxLabel'>" + numOfPellets + "pellets</text>";
    }

    //svg dynamic string
    let svg_str = "";
    let dist_array = ["50m", "100m", "150m", "200m", "250m", "300m", "350m"];
    svg_str += "<svg viewbox='0 0 200 100' class='apex_damageChart_test'>" +"";
    svg_str += "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' ></rect>" +"";
    let thick_spacing;
    let chart_line_count;
    if (max_hs_distance > distanceArr[2]) {
        if (chart_dist === 150) {
            thick_spacing = (200/(100+50))*50;
            chart_line_count = 150 / 50;
        } else {
            thick_spacing = (200 / (max_hs_distance + 50)) * 50;
            chart_line_count = max_hs_distance / 50;
        }
    } else {
        thick_spacing = (200/(100+50))*50;
        chart_line_count = 150/50;
    }
    let x_thin = thick_spacing/5;
    svg_str += "<line x1='"+(x_thin)+"' y1='0' x2='"+(x_thin)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 2)+"' y1='0' x2='"+(x_thin * 2)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 3)+"' y1='0' x2='"+(x_thin * 3)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 4)+"' y1='0' x2='"+(x_thin * 4)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    let chart_gap = 0;

    while (chart_gap < chart_line_count) {
        let x_val = thick_spacing * (chart_gap+1);

        svg_str += "<line x1='"+x_val+"' y1='0' x2='"+x_val+"' y2='100' class='apex_gridLineFat'></line>" +"";
        svg_str += "<line x1='"+(x_thin + x_val)+"' y1='0' x2='"+(x_thin + x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 2)+x_val)+"' y1='0' x2='"+((x_thin * 2)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 3)+x_val)+"' y1='0' x2='"+((x_thin * 3)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 4)+x_val)+"' y1='0' x2='"+((x_thin * 4)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<text x='"+(x_val + 2)+"' y='99' class='apex_chartLabel'>"+dist_array[chart_gap]+"</text>" +"";
        chart_gap += 1;
    }

    svg_str += "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175);stroke-width:.5'></line>" +"";
    svg_str += "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175);stroke-width:.5'></line>";
    svg_str += "<text x='0' y='58' class='apex_chartLabel'>50</text>";
    svg_str +="<text x='0' y='8' class='apex_chartLabel'>100</text>";

    svg_str += "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCords + "'></polyline>" + ls_maxDamageText + ls_minDamageText + "";
    svg_str += "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'></polyline>" + hs_maxDamageText + hs_minDamageText +"";
    svg_str += "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'></polyline>" + maxDamageText + minDamageText + "";
    svg_str += pelletsLabel +"</svg>";

    return svg_str
}

function apex_createNewDamageChart50Max(weaponStats, damageArr, distanceArr, numOfPellets, hs_multi, ls_multi, allow_hs, max_hs_distance){
    let i;
    let damageLineCoords;
    let hs_damageLineCoords = "";
    let ls_damageLineCords = "";
    let hs_maxDamageText = "";
    let hs_minDamageText = "";
    let ls_maxDamageText = "";
    let ls_minDamageText = "";
    let chart_dist;
    if (max_hs_distance > distanceArr[2]){
        chart_dist = max_hs_distance+50;
    } else {
        if (distanceArr[2] < 100){
            chart_dist = 150;
        } else {
            chart_dist = distanceArr[2]+50;
        }
    }
    if(chart_dist < 150) {
        chart_dist = 150;
    }
    let chart_scale = 200/chart_dist;

    //New Standard
    let max_Damage = Math.round(damageArr[0]);
    let mid_Damage = Math.round(damageArr[1]);
    let min_Damage = Math.round(damageArr[2]);
    damageLineCoords = "0," + (100 - (2 * max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (2 * max_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (2 * max_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (2 * mid_Damage)).toString() + " ";
    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (2 * mid_Damage)).toString() + " ";

    damageLineCoords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (2 * min_Damage)).toString() + " ";
    damageLineCoords += (distanceArr[2]+100).toString()+"," + (100 - (2 * min_Damage)).toString()+ " ";
    damageLineCoords += (200).toString()+"," + (100 - (2 * min_Damage)).toString();

    let maxDamageText = "<text x='"+(chart_scale*distanceArr[0])+"' y='" + ((95 - (2 * mid_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + mid_Damage + "</text>";
    let minDamageText = "<text x='"+(chart_scale*distanceArr[2])+"' y='" + ((95 - (2 * min_Damage))).toString() + "' class='apex_chartMinMaxLabel'>" + min_Damage + "</text>";


    //Limb Damage
    if(ls_multi !== 1.0) {
        let ls_maxDamage = Math.round(damageArr[0] * ls_multi);
        let ls_midDamage = Math.round(damageArr[1] * ls_multi);
        let ls_minDamage = Math.round(damageArr[2] * ls_multi);
        ls_damageLineCords = "0," + (100 - (2 * ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[0]).toString() + "," + (100 - (2 * ls_maxDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (2 * ls_maxDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[1]).toString() + "," + (100 - (2 * ls_midDamage)).toString() + " ";
        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (2 * ls_midDamage)).toString() + " ";

        ls_damageLineCords += (chart_scale*distanceArr[2]).toString() + "," + (100 - (2 * ls_minDamage)).toString() + " ";
        ls_damageLineCords += (distanceArr[2]+100).toString()+"," + (100 - (2 * ls_minDamage)).toString()+ " ";
        ls_damageLineCords += (200).toString()+"," + (100 - (2 * ls_minDamage)).toString();

        ls_maxDamageText = "<text x='15' y='" + ((111 - (2 * ls_midDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_maxDamage + "</text>";
        // ls_minDamageText = "<text x='"+(chart_scale*distanceArr[1])+"' y='" + ((90 - ls_minDamage)).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
        ls_minDamageText = "<text x='185' y='" + ((111 - (2 * ls_minDamage))).toString() + "' class='apex_ls_chartMinMaxLabel'>" + ls_minDamage + "</text>";
    }

    // Headshot Damage - Some weapons have very short max HS range.
    if (allow_hs && hs_multi > 1.0) {
        let hs_damageArr = [];
        let hs_distanceArr = [];
        let hs_short = false;

        for (i = 0; i < damageArr.length; i++) {
            if (distanceArr[i] < max_hs_distance) {

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i] * hs_multi));

            } else if (hs_short) {
                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push((damageArr[i]));
            } else {
                hs_distanceArr.push(max_hs_distance);
                hs_damageArr.push((damageArr[i-1] * hs_multi));

                hs_distanceArr.push(distanceArr[i]);
                hs_damageArr.push(damageArr[i]);
                hs_short = true;
            }
        }
        if (hs_damageArr.length < 4) {
            hs_distanceArr.push(max_hs_distance);
            hs_damageArr.push((damageArr[2] * hs_multi))
        }
        let hs_Dmg0 = Math.round(hs_damageArr[0]);
        let hs_Dmg1 = Math.round(hs_damageArr[1]);
        let hs_Dmg2 = Math.round(hs_damageArr[2]);
        let hs_Dmg3 = Math.round(hs_damageArr[3]);
        hs_damageLineCoords = "0," + (100 - (2 * hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[0]).toString() + "," + (100 - (2 * hs_Dmg0)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (2 * hs_Dmg0)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[1]).toString() + "," + (100 - (2 * hs_Dmg1)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (2 * hs_Dmg1)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[2]).toString() + "," + (100 - (2 * hs_Dmg2)).toString() + " ";
        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (2 * hs_Dmg2)).toString() + " ";

        hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (2 * hs_Dmg3)).toString() + " ";

        if ( hs_Dmg2 >= hs_Dmg3){
            hs_damageLineCoords += (chart_scale * hs_distanceArr[3]).toString() + "," + (100 - (2 * damageArr[2])).toString() + " ";
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (2 * damageArr[2])).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (2 * damageArr[2])).toString();
        } else {
            hs_damageLineCoords += (hs_distanceArr[3] + 100).toString() + "," + (100 - (2 * hs_Dmg3)).toString()+ " ";
            hs_damageLineCoords += (200).toString() + "," + (100 - (2 * hs_Dmg3)).toString();
        }
        if (hs_Dmg0 > 40){
            hs_maxDamageText = "<text x='" + (chart_scale * hs_distanceArr[0]) + "' y='" + ((115 - (2 * hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        } else {
            hs_maxDamageText = "<text x='15' y='" + ((95 - (2 * hs_Dmg0))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg0 + "</text>";
        }
        if (hs_Dmg1 > 40){
            hs_minDamageText = "<text x='" + ((chart_scale * max_hs_distance)-16) + "' y='" + ((115 - (2 * hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        } else {
            hs_minDamageText = "<text x='" + ((chart_scale * max_hs_distance)-16) + "' y='" + ((95 - (2 * hs_Dmg1))).toString() + "' class='apex_hs_chartMinMaxLabel'>" + hs_Dmg1 + "</text>";
        }
    }

    //Shotgun pellets
    let pelletsLabel = "";
    if (numOfPellets > 1){
        pelletsLabel = "<text x='135' y='98' class='apex_chartMinMaxLabel'>" + numOfPellets + "pellets</text>";
    }

    //svg dynamic string
    let svg_str = "";
    let dist_array = ["50m", "100m", "150m", "200m", "250m", "300m", "350m"];
    svg_str += "<svg viewbox='0 0 200 100' class='apex_damageChart_test'>" +"";
    svg_str += "<rect width='200' height='100' style='stroke:rgb(0,0,100);stroke-width:0' fill='rgb(25,25,25)' ></rect>" +"";
    let thick_spacing;
    let chart_line_count;
    if (max_hs_distance > distanceArr[2]) {
        if (chart_dist === 150) {
            thick_spacing = (200/(100+50))*50;
            chart_line_count = 150 / 50;
        } else {
            thick_spacing = (200 / (max_hs_distance + 50)) * 50;
            chart_line_count = max_hs_distance / 50;
        }
    } else {
        // thick_spacing =(200/(distanceArr[2]+50))*50;
        thick_spacing = (200/(100+50))*50;
        chart_line_count = 150/50;
    }
    let x_thin = thick_spacing/5;
    svg_str += "<line x1='"+(x_thin)+"' y1='0' x2='"+(x_thin)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 2)+"' y1='0' x2='"+(x_thin * 2)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 3)+"' y1='0' x2='"+(x_thin * 3)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    svg_str += "<line x1='"+(x_thin * 4)+"' y1='0' x2='"+(x_thin * 4)+"' y2='100' class='apex_gridLineThin'></line>" +"";
    let chart_gap = 0;

    while (chart_gap < chart_line_count) {
        let x_val = thick_spacing * (chart_gap+1);

        svg_str += "<line x1='"+x_val+"' y1='0' x2='"+x_val+"' y2='100' class='apex_gridLineFat'></line>" +"";
        svg_str += "<line x1='"+(x_thin + x_val)+"' y1='0' x2='"+(x_thin + x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 2)+x_val)+"' y1='0' x2='"+((x_thin * 2)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 3)+x_val)+"' y1='0' x2='"+((x_thin * 3)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<line x1='"+((x_thin * 4)+x_val)+"' y1='0' x2='"+((x_thin * 4)+x_val)+"' y2='100' class='apex_gridLineThin'></line>" +"";
        svg_str += "<text x='"+(x_val + 2)+"' y='99' class='apex_chartLabel'>"+dist_array[chart_gap]+"</text>" +"";
        chart_gap += 1;
    }

    svg_str += "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175);stroke-width:.5'></line>" +"";
    svg_str += "<line x1='0' y1='50' x2='200' y2='50' style='stroke:rgb(175,175,175);stroke-width:.5'></line>";
    svg_str += "<text x='0' y='58' class='apex_chartLabel'>25</text>";
    // svg_str += "<line x1='0' y1='33' x2='200' y2='33' style='stroke:rgb(175,175,175);stroke-width:.25'></line>";
    // svg_str += "<text x='0' y='41' class='apex_chartLabel'>33</text>";
    svg_str +="<text x='0' y='8' class='apex_chartLabel'>50</text>";

    svg_str += "<polyline class='apex_ls_chartDamageLine' points='" + ls_damageLineCords + "'></polyline>" + ls_maxDamageText + ls_minDamageText + "";
    svg_str += "<polyline class='apex_hs_chartDamageLine' points='" + hs_damageLineCoords + "'></polyline>" + hs_maxDamageText + hs_minDamageText +"";
    svg_str += "<polyline class='apex_chartDamageLine' points='" + damageLineCoords + "'></polyline>" + maxDamageText + minDamageText + "";
    svg_str += pelletsLabel +"</svg>";

    return svg_str
}

function apex_showHideClasses(){
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

const apex_weaponSubCats = {};


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

apex_weaponSubCats._WPN_MASTIFF = "undefined";
apex_weaponSubCats._WPN_LSTAR = "undefined";
apex_weaponSubCats._WPN_SNIPER = "undefined";

