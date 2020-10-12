function apex_initializeLegendsPage() {

    $(".customButton").checkboxradio(
        {icon:false}
    );

    // let apex_showBlo0dhound_input = $("#showBloodhound input");
    // let apex_showBloodhound_input = $("#showBloodhound");
    // apex_showBloodhound_input.click(function(){
    //     apex_disable_icon_switches(0)
    //     // apex_showHideLegends();
    // });
    // apex_showBloodhound_input.change(function(){
    //     // this.blur();
    //     // apex_showHideLegends();
    // });

    // let apex_showBloodhound_input = $("#showBloodhound input");

    let apex_showBloodhound_input = $("#showBloodhound");
    apex_showBloodhound_input.click(function(){
        apex_disable_icon_switches(0)
        // apex_showHideLegends();
    });
    apex_showBloodhound_input.change(function(){
        // this.blur();
        // apex_showHideLegends();
    });

    let apex_showGibraltar_input = $("#showGibraltar");
    apex_showGibraltar_input.click(function(){
        apex_disable_icon_switches(1)
        // apex_showHideLegends();
    });

    let apex_showLifeLine_input = $("#showLifeLine");
    apex_showLifeLine_input.click(function(){
        apex_disable_icon_switches(2)
        // apex_showHideLegends();
    });

    let apex_showPathfinder_input = $("#showPathfinder");
    apex_showPathfinder_input.click(function(){
        apex_disable_icon_switches(3)
        // apex_showHideLegends();
    });

    let apex_showWraith_input = $("#showWraith");
    apex_showWraith_input.click(function(){
        apex_disable_icon_switches(4)
        // apex_showHideLegends();
    });

    let apex_showBangalore_input = $("#showBangalore");
    apex_showBangalore_input.click(function(){
        apex_disable_icon_switches(5)
        // apex_showHideLegends();
    });

    let apex_showCaustic_input = $("#showCaustic");
    apex_showCaustic_input.click(function(){
        apex_disable_icon_switches(6)
        // apex_showHideLegends();
    });

    let apex_showMirage_input = $("#showMirage");
    apex_showMirage_input.click(function(){
        apex_disable_icon_switches(7)
        // apex_showHideLegends();
    });

    let apex_showOctane_input = $("#showOctane");
    apex_showOctane_input.click(function(){
        apex_disable_icon_switches(8)
        // apex_showHideLegends();
    });

    let apex_showWattson_input = $("#showWattson");
    apex_showWattson_input.click(function(){
        apex_disable_icon_switches(9)
        // apex_showHideLegends();
    });


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

function apex_disable_icon_switches(int){
    switch (true) {
        case (int !== 0):
            $("#showBloodhound").prop("checked", false).change();
            // alert("less than five");
            // break;
        case (int !== 1):
            $("#showGibraltar").prop("checked", false).change();
            // alert("between 5 and 8");
            // break;
        case (int !== 2):
            $("#showLifeLine").prop("checked", false).change();
            // alert("between 9 and 11");
            // break;
        case (int !== 3):
            $("#showPathfinder").prop("checked", false).change();
            // alert("less than five");
            // break;
        case (int !== 5):
            $("#showWraith").prop("checked", false).change();
            // alert("between 5 and 8");
            // break;
        case (int !== 6):
            $("#showBangalore").prop("checked", false).change();
            // alert("between 9 and 11");
            // break;
        case (int !== 7):
            $("#showCaustic").prop("checked", false).change();
            // alert("less than five");
            // break;
        case (int !== 8):
            $("#showMirage").prop("checked", false).change();
            // alert("between 5 and 8");
            // break;
        case (int !== 9):
            $("#showOctane").prop("checked", false).change();
            // alert("between 9 and 11");
            // break;
        case (int !== 10):
            $("#showWattson").prop("checked", false).change();
            // alert("between 5 and 8");
            // break;
        case (int !== 11):
            $("#showCrypto").prop("checked", false).change();
            // alert("between 9 and 11");
            // break;
        default:
            // alert("none");
            break;
    }

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