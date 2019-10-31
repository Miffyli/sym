

function getAPEXWeaponsSubcat(weapon_name){
    return apex_weaponSubCats["_" + weapon_name.replace(/ |\/|-/g,"")];
}

function initializeSorts(){
    $("#sortRPM").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareRPMs);
        apex_printWeapons();
    });

    $("#sortName").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareNames);
        apex_printWeapons();
    });

    $("#sortBulletSpeed").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareBulletSpeeds);
        apex_printWeapons();
    });

    $("#sortMagSize").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareMagSizes);
        apex_printWeapons();
    });

    $("#sortMaxDamage").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareMaxDamages);
        apex_printWeapons();
    });

    $("#sortInitVertRecoil").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareInitVertRecoil);
        apex_printWeapons();
    });

    $("#sortVertRecoil").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareVertRecoil);
        apex_printWeapons();
    });

    $("#sortHorRecoil").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareHorRecoil);
        apex_printWeapons();
    });

    $("#sortDeployTime").click(function(){
        $("#actionMenu").menu("collapse");
        APEXWeaponData.sort(compareDeployTimes);
        apex_printWeapons();
    });
}

function compareRPMs(a, b){
    if (a['WeaponData']['effective_fire_rate'] > b['WeaponData']['effective_fire_rate']){
        return -1;
    }
    if (b['WeaponData']['effective_fire_rate'] > a['WeaponData']['effective_fire_rate']){
        return 1;
    }
    return 0;
}

function compareNames(a, b){
    if (a.printname < b.printname){
        return -1;
    }
    if (b.printname < a.printname){
        return 1;
    }
    return 0;
}


function compareBulletSpeeds(a, b){
    if (a['WeaponData']['projectile_launch_speed'] > b['WeaponData']['projectile_launch_speed']){
        return -1;
    }
    if (b['WeaponData']['projectile_launch_speed'] > a['WeaponData']['projectile_launch_speed']){
        return 1;
    }
    return 0;
}


function compareMagSizes(a, b){
    if (a['WeaponData']['ammo_clip_size'] > b['WeaponData']['ammo_clip_size']){
        return -1;
    }
    if (b['WeaponData']['ammo_clip_size'] > a['WeaponData']['ammo_clip_size']){
        return 1;
    }
    return 0;
}


function compareMaxDamages(a, b){
    if (a['WeaponData']['damage_array'][0] > b['WeaponData']['damage_array'][0]){
        return -1;
    }
    if (b['WeaponData']['damage_array'][0] > a['WeaponData']['damage_array'][0]){
        return 1;
    }
    return 0;
}

function compareInitVertRecoil(a, b){
    if (a['WeaponData'].viewkick_pattern_data_y_avg < b['WeaponData'].viewkick_pattern_data_y_avg){
        return -1;
    }
    if (b['WeaponData'].viewkick_pattern_data_y_avg < a['WeaponData'].viewkick_pattern_data_y_avg){
        return 1;
    }
    return 0;
}

function compareVertRecoil(a, b){
    if (a['WeaponData'].viewkick_pattern_data_sizey < b['WeaponData'].viewkick_pattern_data_sizey){
        return -1;
    }
    if (b['WeaponData'].viewkick_pattern_data_sizey < a['WeaponData'].viewkick_pattern_data_sizey){
        return 1;
    }
    return 0;
}

function compareHorRecoil(a, b){
    if (a['WeaponData'].viewkick_pattern_data_x_avg < b['WeaponData'].viewkick_pattern_data_x_avg){
        return -1;
    }
    if (b['WeaponData'].viewkick_pattern_data_x_avg < a['WeaponData'].viewkick_pattern_data_x_avg){
        return 1;
    }
    return 0;
}

function compareDeployTimes(a, b){
    if (a['WeaponData'].deploy_time < b['WeaponData'].deploy_time){
        return -1;
    }
    if (b['WeaponData'].deploy_time < a['WeaponData'].deploy_time){
        return 1;
    }
    return 0;
}


$( function() {
    $.widget( "custom.combobox", {
        _create: function() {
            this.wrapper = $( "<span>" )
            .addClass( "apex_custom-combobox" )
            .insertAfter( this.element );

            this.element.hide();
            this._createAutocomplete();
            this._createShowAllButton();
        },

        _createAutocomplete: function() {
            var selected = this.element.children( ":selected" ),
            value = selected.val() ? selected.text() : "";

            this.input = $( "<input>" )
            .appendTo( this.wrapper )
            .val( value )
            .attr( "title", "" )
            .addClass( "apex_custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
            .autocomplete({
                delay: 0,
                minLength: 0,
                source: $.proxy( this, "_source" )
            })
            .tooltip({
                classes: {
                    "ui-tooltip": "ui-state-highlight"
                }
            });

            this._on( this.input, {
                autocompleteselect: function( event, ui ) {
                    ui.item.option.selected = true;
                    this._trigger( "select", event, {
                        item: ui.item.option
                    });
                },

                autocompletechange: "_removeIfInvalid"
            });
        },

        _createShowAllButton: function() {
            var input = this.input,
            wasOpen = false;

            $( "<a>" )
            .attr( "tabIndex", -1 )
            .attr( "title", "Show All Items" )
            .tooltip()
            .appendTo( this.wrapper )
            .button({
                icons: {
                    primary: "ui-icon-triangle-1-s"
                },
                text: false
            })
            .removeClass( "ui-corner-all" )
            .addClass( "apex_custom-combobox-toggle ui-corner-right" )
            .on( "mousedown", function() {
                wasOpen = input.autocomplete( "widget" ).is( ":visible" );
            })
            .on( "click", function() {
                input.trigger( "focus" );

                // Close if already visible
                if ( wasOpen ) {
                    return;
                }

                // Pass empty string as value to search for, displaying all results
                input.autocomplete( "search", "" );
            });
        },

        _source: function( request, response ) {
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
            response( this.element.children( "option" ).map(function() {
                var text = $( this ).text();
                if ( this.value && ( !request.term || matcher.test(text) ) )
                return {
                    label: text,
                    value: text,
                    option: this
                };
            }) );
        },

        _removeIfInvalid: function( event, ui ) {

            // Selected an item, nothing to do
            if ( ui.item ) {
                return;
            }

            // Search for a match (case-insensitive)
            var value = this.input.val(),
            valueLowerCase = value.toLowerCase(),
            valid = false;
            this.element.children( "option" ).each(function() {
                if ( $( this ).text().toLowerCase() === valueLowerCase ) {
                    this.selected = valid = true;
                    return false;
                }
            });

            // Found a match, nothing to do
            if ( valid ) {
                return;
            }

            // Remove invalid value
            this.input
            .val( "" )
            .attr( "title", value + " didn't match any item" )
            .tooltip( "open" );
            this.element.val( "" );
            this._delay(function() {
                this.input.tooltip( "close" ).attr( "title", "" );
            }, 2500 );
            this.input.autocomplete( "instance" ).term = "";
        },

        _destroy: function() {
            this.wrapper.remove();
            this.element.show();
        },

        refresh: function () {
            selected = this.element.children(":selected");
            this.input.val(selected.text());
        },

        select: function (event, ui) {
            ui.item.option.selected = true;
            self._trigger("selected", event, {
                item: ui.item.option
            });
            select.trigger("change");
        },

        change: function (event, ui) {
            if (!ui.item) {
                var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
                    valid = false;
                select.children("option").each(function () {
                    if ($(this).text().match(matcher)) {
                        this.selected = valid = true;
                        return false;
                    }
                });
                if (!valid) {
                    // remove invalid value, as it didn't match anything
                    $(this).val("");
                    select.val("");
                    input.data("autocomplete").term = "";
                    return false;
                }
            }
        }
    });
} );
