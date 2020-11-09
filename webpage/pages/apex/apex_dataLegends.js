$( function() {
    $( "#tabs" ).tabs();
} );

const abilities_dict = {
    'bloodhound': ["Gun Shield ", "Dome Of Protection", "Defensive Bombardment"],
    'gibraltar': ["Gun Shield ", "Dome Of Protection", "Defensive Bombardment"]
}
const legends_ability_names_dict = {
    "bloodhound": ["Tracker", "Eye Of The Allfather", "Beast Of The Hunt"],
    "gibraltar": ["Gun Shield", "Dome Of Protection", "Defensive Bombardment"],
    "lifeline": ["Combat Revive", "D.O.C Heal Drone", "Care Package"],
    "pathfinder": ["Insider Knowledge", "Grappling Hook", "Zipline Gun"],
    "wraith": ["Voices From The Void", "Into The Void", "Dimensional Rift"],
    "bangalore": ["Double Time", "Smoke Launcher", "Rolling Thunder"],
    "caustic": ["Nox Vision", "Nox Gas Trap", "Nox Gas Grenade"],// #PAS_GAS_GEAR
    "mirage": ["Now You See Me...", "Psyche Out", "Life Of The Party"],
    "octane": ["Swift Mend", "Stim", "Launch Pad"],
    "wattson": ["Spark Of Genius", "Perimeter Security", "Interception Pylon"], //#PAS_WATTSON_CIRCLE_REFUND
    "crypto": ["Neurolink", "Surveillance Drone", "Drone EMP"],
    "revenant": ["Stalker", "Silence", "Death Totem"],
    "loba": ["Eye For Quality", "Burglar's Best Friend", "Black Market Boutique"],
    "rampart": ["Modded Loader", "Amped Cover", "Emplaced Minigun 'Sheila'"], //# mp_weapon_cover_wall , mp_weapon_mounted_turret_placeable
    "horizon": ["Spacewalk", "Gravity Lift", "Black Hole"],
    "dummie": ["PAS_DUMMIE", "mp_ability_item_spawner", "mp_ability_panic_button"]
}
const legends_ability_dict = {
    "bloodhound": ["PAS_TRACKING_VISION", "mp_ability_area_sonar_scan", "mp_ability_hunt_mode"],
    "gibraltar": ["PAS_ADS_SHIELD", "mp_weapon_bunker_bubble", "mp_weapon_defensive_bombardment_weapon"],
    "lifeline": ["PAS_MEDIC", "mp_weapon_deployable_medic", "mp_ability_care_package"],
    "pathfinder": ["PAS_PATHFINDER", "mp_ability_grapple", "mp_weapon_zipline"],
    "wraith": ["PAS_VOICES", "mp_ability_phase_walk", "mp_weapon_phase_tunnel"],
    "bangalore": ["PAS_ADRENALINE", "mp_weapon_grenade_bangalore", "mp_weapon_grenade_creeping_bombardment"],
    "caustic": ["PAS_GAS_PROTECTION", "mp_weapon_dirty_bomb", "mp_weapon_grenade_gas"],// #PAS_GAS_GEAR
    "mirage": ["PAS_MIRAGE", "mp_ability_holopilot", "mp_ability_mirage_ultimate"],
    "octane": ["PAS_OCTANE", "mp_ability_heal", "mp_weapon_jump_pad"],
    "wattson": ["PAS_BATTERY_POWERED", "mp_weapon_tesla_trap", "mp_weapon_trophy_defense_system"], //#PAS_WATTSON_CIRCLE_REFUND
    "crypto": ["PAS_CRYPTO", "mp_ability_crypto_drone", "mp_ability_crypto_drone_emp"],
    "revenant": ["PAS_DEATHSTALKER", "mp_ability_silence", "mp_ability_revenant_death_totem"],
    "loba": ["PAS_LOBA_EYE_FOR_QUALITY", "mp_ability_translocation", "mp_ability_black_market"],
    "rampart": ["PAS_GUNNER", "mp_weapon_deployable_cover", "mp_weapon_mounted_turret_weapon"], //# mp_weapon_cover_wall , mp_weapon_mounted_turret_placeable
    "horizon": ["PAS_SPACEWALK", "mp_ability_space_elevator_tac", "mp_weapon_black_hole"],
    "dummie": ["PAS_DUMMIE", "mp_ability_item_spawner", "mp_ability_panic_button"]
}
// # "rui/hud/tactical_icons/tactical_bloodhound"
function apex_updateLegendAbilities(legend) {
    let legend_abilities = legends_ability_names_dict[legend];
    let abilities_list = $('.apex_ability-ulist');
    let abilities_desc = $(".apex_ability-details");

    let ult_data = APEXWeaponData.find(item => item['WeaponData'].filename === legends_ability_dict[legend][2]+'.txt')
    let tact_data = APEXWeaponData.find(item => item['WeaponData'].filename === legends_ability_dict[legend][1]+'.txt');
    // let passive_data = APEXWeaponData.find(item => item['WeaponData'].filename === legends_ability_dict[legend][1]+'.txt');

    $(abilities_list).find("#ability-passive").text(legends_ability_names_dict[legend][0]);
    $(abilities_list).find("#ability-passive").siblings()[0].src = "./pages/apex/icons/rui/hud/passive_icons/passive_"+legend+".png";
    $(abilities_desc).find("#ability-passive-desc").text(legends_ability_names_dict[legend][0]);

    $(abilities_list).find("#ability-tactical").text(tact_data['WeaponData']['custom_name_short']);
    $(abilities_list).find("#ability-tactical").siblings()[0].src = "./pages/apex/icons/rui/hud/tactical_icons/tactical_"+legend+".png";
    $(abilities_desc).find("#ability-tactical-desc").text(tact_data['WeaponData']['custom_desc_long']);

    $(abilities_list).find("#ability-ultimate").text(ult_data['WeaponData']['custom_name_short']);
    $(abilities_list).find("#ability-ultimate").siblings()[0].src = "./pages/apex/icons/rui/hud/ultimate_icons/ultimate_"+legend+".png";
    $(abilities_desc).find("#ability-ultimate-desc").text(ult_data['WeaponData']['custom_desc_long']);

    // console.log(legend);

}

function apex_printLegendProfile(legendName){
    let rtnStr = "";
    rtnStr += "<div id='" + legendName + "_profile'>" +
      "<div class='apex_profileImg'><img src='https://media.contentapi.ea.com/content/dam/apex-legends/common/legends/apex-section-bg-legends-" +legendName+"-xl.jpg' alt=''></div>";
    rtnStr += "</div>";
    return rtnStr;
}

function apex_updateProfileImage(legendName){
    const profileImageElement = document.getElementsByClassName('apex_Legend_Profile');
    let profileHTML_string = apex_printLegendProfile(legendName);
    $(profileImageElement).find(".apex_profileImg").html(profileHTML_string);
    apex_updateLegendAbilities(legendName)

}

function apex_initializeLegendsPage() {
    $( function() {
        $( "#tabs" ).tabs();
    } );
/////////////////////
    let apex_showHideLegendCheckboxes_Row1_input = $("#apex_showHideLegendCheckboxes_Row1 input");
    apex_showHideLegendCheckboxes_Row1_input.checkboxradio({icon:false});
    let apex_showHideLegendCheckboxes_Row2_input = $("#apex_showHideLegendCheckboxes_Row2 input");
    apex_showHideLegendCheckboxes_Row2_input.checkboxradio({icon:false});
    let apex_showHideLegendCheckboxes_Row3_input = $("#apex_showHideLegendCheckboxes_Row3 input");
    apex_showHideLegendCheckboxes_Row3_input.checkboxradio({icon:false});

    function switch_off_legend_select(){
        apex_showHideLegendCheckboxes_Row1_input.prop('checked', false).change();
        apex_showHideLegendCheckboxes_Row2_input.prop('checked', false).change();
        apex_showHideLegendCheckboxes_Row3_input.prop('checked', false).change();
    }

    ///////////////
    let apex_showBloodhound_input = $("#showBloodhound");
    apex_showBloodhound_input.checkboxradio({icon:false});
    apex_showBloodhound_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
        // apex_show_legend_switch(0);
    });
    ///////////////
    let apex_showGibraltar_input = $("#showGibraltar");
    apex_showGibraltar_input.checkboxradio({icon:false});
    apex_showGibraltar_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
        // apex_show_legend_switch(1);
    });

    ///////////////
    let apex_showLifeLine_input = $("#showLifeLine");
    apex_showLifeLine_input.checkboxradio({icon:false});
    apex_showLifeLine_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showPathfinder_input = $("#showPathfinder");
    apex_showPathfinder_input.checkboxradio({icon:false});
    apex_showPathfinder_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();

    });

    ///////////////
    let apex_showWraith_input = $("#showWraith");
    apex_showWraith_input.checkboxradio({icon:false});
    apex_showWraith_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showBangalore_input = $("#showBangalore");
    apex_showBangalore_input.checkboxradio({icon:false});
    apex_showBangalore_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showCaustic_input = $("#showCaustic");
    apex_showCaustic_input.checkboxradio({icon:false});
    apex_showCaustic_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showMirage_input = $("#showMirage");
    apex_showMirage_input.checkboxradio({icon:false});
    apex_showMirage_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showOctane_input = $("#showOctane");
    apex_showOctane_input.checkboxradio({icon:false});
    apex_showOctane_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showWattson_input = $("#showWattson");
    apex_showWattson_input.checkboxradio({icon:false});
    apex_showWattson_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showCrypto_input = $("#showCrypto");
    apex_showCrypto_input.checkboxradio({icon:false});
    apex_showCrypto_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showRevenant_input = $("#showRevenant");
    apex_showRevenant_input.checkboxradio({icon:false});
    apex_showRevenant_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showLoba_input = $("#showLoba");
    apex_showLoba_input.checkboxradio({icon:false});
    apex_showLoba_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showRampart_input = $("#showRampart");
    apex_showRampart_input.checkboxradio({icon:false});
    apex_showRampart_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    ///////////////
    let apex_showHorizon_input = $("#showHorizon");
    apex_showHorizon_input.checkboxradio({icon:false});
    apex_showHorizon_input.click(function(){
        switch_off_legend_select();
        $(this).prop('checked', true).change();
        apex_showHideLegends();
    });

    let profileHTML = "";
    profileHTML += apex_printLegendProfile("pathfinder");
    $(".apex_Legend_Profile").html(profileHTML);
    console.log("TEST");
}

// show/hide  the actual content
function apex_showHideLegends() {
    if ($("#showBloodhound").is(":checked")) {
        apex_updateProfileImage("bloodhound");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }

    if ($("#showGibraltar").is(":checked")) {
        apex_updateProfileImage("gibraltar");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showLifeLine").is(":checked")) {
        apex_updateProfileImage("lifeline");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showPathfinder").is(":checked")) {
        apex_updateProfileImage("pathfinder");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showWraith").is(":checked")) {
        apex_updateProfileImage("wraith");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showBangalore").is(":checked")) {
        apex_updateProfileImage("bangalore");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showCaustic").is(":checked")) {
        apex_updateProfileImage("caustic");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showMirage").is(":checked")) {
        apex_updateProfileImage("mirage");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showOctane").is(":checked")) {
        apex_updateProfileImage("octane");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showWattson").is(":checked")) {
        apex_updateProfileImage("wattson");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showCrypto").is(":checked")) {
        apex_updateProfileImage("crypto");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }

    if ($("#showRevenant").is(":checked")) {
        apex_updateProfileImage("revenant");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }

    if ($("#showLoba").is(":checked")) {
        apex_updateProfileImage("loba");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }

    if ($("#showRampart").is(":checked")) {
        apex_updateProfileImage("rampart");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }

    if ($("#showHorizon").is(":checked")) {
        apex_updateProfileImage("horizon");
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }

}
