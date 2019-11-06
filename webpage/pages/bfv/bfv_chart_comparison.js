

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
