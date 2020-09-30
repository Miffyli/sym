const customizationHopupStrings = {};
const customizationOpticStrings = {};
const customizationAttachmentStrings = {};
// Weapon HopUps
customizationHopupStrings.hopup_double_tap = "hopup_double_tap";
customizationHopupStrings.hopup_energy_choke = "hopup_energy_choke";
customizationHopupStrings.hopup_headshot_dmg = "hopup_headshot_dmg";
customizationHopupStrings.hopup_highcal_rounds = "hopup_highcal_rounds";
customizationHopupStrings.hopup_selectfire = "hopup_selectfire";
customizationHopupStrings.hopup_shield_breaker = "hopup_shield_breaker";
customizationHopupStrings.hopup_turbocharger = "hopup_turbocharger";
customizationHopupStrings.hopup_unshielded_dmg = "hopup_unshielded_dmg";
customizationHopupStrings.hopup_multiplexer = "hopup_multiplexer";
customizationAttachmentStrings.stock_sniper_l1 = "stock_sniper_l1";
customizationAttachmentStrings.stock_sniper_l2 = "stock_sniper_l2";
customizationAttachmentStrings.stock_sniper_l3 = "stock_sniper_l3";
customizationAttachmentStrings.stock_sniper_l4 = "stock_sniper_l4";
customizationAttachmentStrings.stock_tactical_l1 = "stock_tactical_l1";
customizationAttachmentStrings.stock_tactical_l2 = "stock_tactical_l2";
customizationAttachmentStrings.stock_tactical_l3 = "stock_tactical_l3";
customizationAttachmentStrings.stock_tactical_l4 = "stock_tactical_l4";
customizationAttachmentStrings.shotgun_bolt_l1 = "shotgun_bolt_l1";
customizationAttachmentStrings.shotgun_bolt_l2 = "shotgun_bolt_l2";
customizationAttachmentStrings.shotgun_bolt_l3 = "shotgun_bolt_l3";
customizationAttachmentStrings.shotgun_bolt_l4 = "shotgun_bolt_l4";
customizationAttachmentStrings.bullets_mag_l1 = "bullets_mag_l1";
customizationAttachmentStrings.bullets_mag_l2 = "bullets_mag_l2";
customizationAttachmentStrings.bullets_mag_l3 = "bullets_mag_l3";
customizationAttachmentStrings.bullets_mag_l4 = "bullets_mag_l4";
customizationAttachmentStrings.energy_mag_l1 = "energy_mag_l1";
customizationAttachmentStrings.energy_mag_l2 = "energy_mag_l2";
customizationAttachmentStrings.energy_mag_l3 = "energy_mag_l3";
customizationAttachmentStrings.energy_mag_l4 = "energy_mag_l4";
customizationAttachmentStrings.highcal_mag_l1 = "highcal_mag_l1";
customizationAttachmentStrings.highcal_mag_l2 = "highcal_mag_l2";
customizationAttachmentStrings.highcal_mag_l3 = "highcal_mag_l3";
customizationAttachmentStrings.highcal_mag_l4 = "highcal_mag_l4";
customizationAttachmentStrings.sniper_mag_l1 = "sniper_mag_l1";
customizationAttachmentStrings.sniper_mag_l2 = "sniper_mag_l2";
customizationAttachmentStrings.sniper_mag_l3 = "sniper_mag_l3";
customizationAttachmentStrings.sniper_mag_l4 = "sniper_mag_l4";
customizationAttachmentStrings.barrel_stabilizer_l1 = "barrel_stabilizer_l1";
customizationAttachmentStrings.barrel_stabilizer_l2 = "barrel_stabilizer_l2";
customizationAttachmentStrings.barrel_stabilizer_l3 = "barrel_stabilizer_l3";
customizationAttachmentStrings.barrel_stabilizer_l4_flash_hider = "barrel_stabilizer_l4_flash_hider";

// Weapon Optics
customizationOpticStrings.optic_cq_hcog_bruiser = "optic_cq_hcog_bruiser";
customizationOpticStrings.optic_cq_hcog_classic = "optic_cq_hcog_classic";
customizationOpticStrings.optic_cq_holosight = "optic_cq_holosight";
customizationOpticStrings.optic_cq_holosight_variable = "optic_cq_holosight_variable";
customizationOpticStrings.optic_cq_threat = "optic_cq_threat";
customizationOpticStrings.optic_ranged_aog_variable = "optic_ranged_aog_variable";
customizationOpticStrings.optic_ranged_hcog = "optic_ranged_hcog";
customizationOpticStrings.optic_sniper = "optic_sniper";
customizationOpticStrings.optic_sniper_threat = "optic_sniper_threat";
customizationOpticStrings.optic_sniper_variable = "optic_sniper_variable";

function apex_initializeCustomizations(){
    // noinspection JSJQueryEfficiency
    $(".apex_customButtonsApex").change(function(){
        if ($(this).is(":checked") || $(this).siblings(".apex_customButtonsApex").is(":checked")) {
            if ($(this).hasClass("custRow1")){
                const thisCol = $(this).hasClass("custCol1") ? ".custCol1" : ".custCol2";
                $(this).parent().next().children(thisCol).checkboxradio("enable");
            } else {
                $(this).parent().next().children(".apex_customButtonsApex").checkboxradio("enable");
            }

        }
    });

    // noinspection JSJQueryEfficiency
    $(".apex_customButtonsApex").click(function(){
        if ($(this).hasClass("custRow1")){
            $(this).parent().nextAll().children(".apex_customButtonsApex").prop("checked", false).change();
        }

        const thisId = $(this).attr("id");
        if ($(this).siblings("label[for='" + thisId +"']").hasClass("ui-state-active")){
            $(this).prop("checked", false).change();
        } else {

        }
        this.blur();
        let selectedAttachments = $(this).parentsUntil(".tbody", "tr").find("td.firstColumn > .apex_lblWeaponName").text();
        $(this).parent().parent().find(".apex_customButtonsApex").each(function(){
            if($(this).is(":checked")){
                selectedAttachments += $(this).next("label").data("shortname");
            }
        });

        apex_updateWeapon(selectedAttachments);
    });

    $(".apex_customButtons > div:not(:first-child) .apex_customButtonsApex").checkboxradio("disable");
}

function apex_initializeCustomizationsRow(tableRow){
    $(tableRow).find(".apex_customButtonsApex").change(function(){
        if ($(this).is(":checked") || $(this).siblings(".apex_customButtonsApex").is(":checked")) {
            if ($(this).hasClass("custRow1")){
                const thisCol = $(this).hasClass("custCol1") ? ".custCol1" : ".custCol2";
                $(this).parent().next().children(thisCol).checkboxradio("enable");
            } else {
                $(this).parent().next().children(".apex_customButtonsApex").checkboxradio("enable");
            }

        }
    });

    $(tableRow).find(".apex_customButtonsApex").click(function(){
        if ($(this).hasClass("custRow1")){
            $(this).parent().nextAll().children(".apex_customButtonsApex").prop("checked", false).change();
            $(this).parent().nextAll().children(".apex_customButtonsApex").checkboxradio("disable");
        }

        const thisId = $(this).attr("id");
        if ($(this).siblings("label[for='" + thisId +"']").hasClass("ui-state-active")){
            $(this).prop("checked", false).change();
            $(this).parent().nextAll().children(".apex_customButtonsApex").prop("checked", false).change();
            $(this).parent().nextAll().children(".apex_customButtonsApex").checkboxradio("disable");
        } else {

        }
        this.blur();
        let selectedAttachments = $(this).parentsUntil(".tbody", "tr").find("td.firstColumn > .apex_lblWeaponName").text();
        $(this).parent().parent().find(".apex_customButtonsApex").each(function(){
            if($(this).is(":checked")){
                //selectedAttachments += $(this).next("label").text();
                selectedAttachments += $(this).next("label").data("shortname");
            }
        });

        apex_updateWeapon(selectedAttachments);
    });

    $(tableRow).find(".apex_customButtons > div:not(:first-child) .apex_customButtonsApex").checkboxradio("disable");
}
