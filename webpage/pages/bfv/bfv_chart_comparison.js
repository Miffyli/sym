var customizationStrings = new Object();
customizationStrings.QADS = "Quick Aim";
customizationStrings.ADSM = "Custom Stock";
customizationStrings.MoAD = "Lightened Stock";
customizationStrings.Bayo = "Bayonet";
customizationStrings.QRel = "Quick Reload";
customizationStrings.QDep = "Slings and Swivels";
customizationStrings.QCyc = "Machined Bolt";
customizationStrings.Zero = "Variable Zeroing";
customizationStrings.VRec = "Recoil Buffer";
customizationStrings.ITri = "Trigger Job";
customizationStrings.Hipf = "Enhanced Grips";
customizationStrings.IADS = "Barrel Bedding";
customizationStrings.DMag = "Detachable Magazines";
customizationStrings.Bipo = "Bipod";
customizationStrings.FBul = "High Velocity Bullets";
customizationStrings.Long = "Low Drag Rounds";
customizationStrings.ADSS = "Barrel Bedding";
customizationStrings.HRec = "Ported Barrel";
customizationStrings.Heav = "Heavy Load";
customizationStrings.Pene = "Penetrating Shot";
customizationStrings.ExMa = "Extended Magazine";
customizationStrings.Slug = "Slugs";
customizationStrings.Head = "Solid Slug";
customizationStrings.IBip = "Improved Bipod";
customizationStrings.Flas = "Flashless Propellant";
customizationStrings.IROF = "Light Bolt";
customizationStrings.Ince = "Incendiary Bullets";
customizationStrings.Cool = "Chrome Lining";
customizationStrings.Magd = "Polished Action";
customizationStrings.Chok = "Internal Choke";
customizationStrings.ExBe = "Extended Belt";
customizationStrings.Drum = "Double Drum Magazine";
customizationStrings.Gren = "Improved Grenades"
customizationStrings.APCR = "APCR Bullets";
customizationStrings.QBCy = "Light Bolt";
customizationStrings.BROF = "Trigger Job";


function initializeCustomizations(){
    $(".custButton").change(function(){
        if ($(this).is(":checked") || $(this).siblings(".custButton").is(":checked")) {
            if ($(this).hasClass("custRow1")){
                var thisCol = $(this).hasClass("custCol1") ? ".custCol1" : ".custCol2";
                $(this).parent().next().children(thisCol).checkboxradio("enable");
            } else {
                $(this).parent().next().children(".custButton").checkboxradio("enable");
            }

        }
    });

    $(".custButton").click(function(){
        if ($(this).hasClass("custRow1")){
            $(this).parent().nextAll().children(".custButton").prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").checkboxradio("disable");
        }

        var thisId = $(this).attr("id");
        if ($(this).siblings("label[for='" + thisId +"']").hasClass("ui-state-active")){
            $(this).prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").checkboxradio("disable");
        } else {

        }
        this.blur();
        var selectedCusts = $(this).parentsUntil(".tbody", "tr").find("td.firstColumn > .lblWeaponName").text();
        $(this).parent().parent().find(".custButton").each(function(){
            if($(this).is(":checked")){
                //selectedCusts += $(this).next("label").text();
                selectedCusts += $(this).next("label").data("shortname");
            }
        })

        updateWeapon(selectedCusts, this);
    });

    $(".custButtons > div:not(:first-child) .custButton").checkboxradio("disable");
}

function initializeCustomizationsRow(tableRow){
    $(tableRow).find(".custButton").change(function(){
        if ($(this).is(":checked") || $(this).siblings(".custButton").is(":checked")) {
            if ($(this).hasClass("custRow1")){
                var thisCol = $(this).hasClass("custCol1") ? ".custCol1" : ".custCol2";
                $(this).parent().next().children(thisCol).checkboxradio("enable");
            } else {
                $(this).parent().next().children(".custButton").checkboxradio("enable");
            }

        }
    });

    $(tableRow).find(".custButton").click(function(){
        if ($(this).hasClass("custRow1")){
            $(this).parent().nextAll().children(".custButton").prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").checkboxradio("disable");
        }

        var thisId = $(this).attr("id");
        if ($(this).siblings("label[for='" + thisId +"']").hasClass("ui-state-active")){
            $(this).prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").checkboxradio("disable");
        } else {

        }
        this.blur();
        var selectedCusts = $(this).parentsUntil(".tbody", "tr").find("td.firstColumn > .lblWeaponName").text();
        $(this).parent().parent().find(".custButton").each(function(){
            if($(this).is(":checked")){
                //selectedCusts += $(this).next("label").text();
                selectedCusts += $(this).next("label").data("shortname");
            }
        })

        updateWeapon(selectedCusts, this);
    });

    $(tableRow).find(".custButtons > div:not(:first-child) .custButton").checkboxradio("disable");
}
