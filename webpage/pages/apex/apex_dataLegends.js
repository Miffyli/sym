function apex_initializeLegendsPage() {

    $(".customButton").checkboxradio(
        {icon:false}
    );

    // Weapon select buttons
    let apex_showHideLegendCheckboxes_Row1_input = $("#apex_showHideLegendCheckboxes_Row1 input");
    apex_showHideLegendCheckboxes_Row1_input.checkboxradio(
        {icon:false}
    );
    apex_showHideLegendCheckboxes_Row1_input.change(function(){
        this.blur();
        apex_showHideLegends();
    });
    let apex_showHideLegendCheckboxes_Row2_input = $("#apex_showHideLegendCheckboxes_Row2 input");
    apex_showHideLegendCheckboxes_Row2_input.checkboxradio(
        {icon:false}
    );
    apex_showHideLegendCheckboxes_Row2_input.change(function(){
        this.blur();
        apex_showHideLegends();
    });
    let apex_showHideLegendCheckboxes_Row3_input = $("#apex_showHideLegendCheckboxes_Row3 input");
    apex_showHideLegendCheckboxes_Row3_input.checkboxradio(
        {icon:false}
    );
    apex_showHideLegendCheckboxes_Row3_input.change(function(){
        this.blur();
        apex_showHideLegends();
    });

}

function apex_showHideLegends() {
    if ($("#showBloodhound").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }

    if ($("#showGibraltar").is(":checked")) {
        $(".coming_soon").show(0);
    } else {
        $(".coming_soon").hide(0);
    }


    if ($(".showLifeLine").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($(".showPathfinder").is(":checked")) {
        $(".coming_soon").show(0);
    } else {
        $(".coming_soon").hide(0);
    }


    if ($("#showWraith").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showBangalore").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showCaustic").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showMirage").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showOctane").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showWattson").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }


    if ($("#showCrypto").is(":checked")) {
        $("#coming_soon").show(0);
    } else {
        $("#coming_soon").hide(0);
    }

}