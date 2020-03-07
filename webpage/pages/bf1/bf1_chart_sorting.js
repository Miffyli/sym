

function getWeaponsSubcat(weaponName){
    return weaponSubCats["_" + weaponName.replace(/ |\/|-/g,"")];
}

function initializeSorts(){
    $("#sortRPM").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortNumbers("lblRPMValue", compareRPMs)
    });

    $("#sortName").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortLetters("lblWeaponNameValue", compareNames)
    });

    $("#sortBulletSpeed").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortNumbers("lblSpeedValue", compareBulletSpeeds)
    });

    $("#sortMagSize").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortNumbers("lblMag", compareMagSizes)
    });

    $("#sortMaxDamage").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortNumbers("maxDamageText", compareMaxDamages)
    });

    $("#sortInitVertRecoil").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortNumbers("recoilInitUpValue", compareInitVertRecoil)
    });

    $("#sortVertRecoil").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortNumbers("recoilUpValue", compareVertRecoil)
    });

    $("#sortHorRecoil").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortNumbers("recoilHorValue", compareHorRecoil)
    });

    $("#sortDeployTime").click(function(){
        $("#actionMenu").menu("collapse");
        bfvChartSortNumbers("lblDeployTime", compareDeployTimes)
    });
}

function bfvChartSortNumbers(valueClassName, sortFunction){
    $.each($(".classTable"), function(index, classTable){
        var weaponRows = []
        $.each($(classTable).children("tbody").children("tr"), function(index, weaponRow){
            var weaponObj = {value: parseFloat($(weaponRow).find("." + valueClassName).text()),
                             row: $(weaponRow).detach()}
            weaponRows.push(weaponObj)
        })
        weaponRows.sort(sortFunction)
        $.each(weaponRows, function(index, detachedRow){
            $(classTable).append(detachedRow.row)
        })
    })
}

function bfvChartSortLetters(valueClassName, sortFunction){
    $.each($(".classTable"), function(index, classTable){
        var weaponRows = []
        $.each($(classTable).children("tbody").children("tr"), function(index, weaponRow){
            var weaponObj = {value: $(weaponRow).find("." + valueClassName).text(),
                             row: $(weaponRow).detach()}
            weaponRows.push(weaponObj)
        })
        weaponRows.sort(sortFunction)
        $.each(weaponRows, function(index, detachedRow){
            $(classTable).append(detachedRow.row)
        })
    })
}



function compareRPMs(a, b){
    if (a.value > b.value){
        return -1;
    }
    if (b.value > a.value){
        return 1;
    }
    return 0;
}

function compareNames(a, b){
    if (a.value < b.value){
        return -1;
    }
    if (b.value < a.value){
        return 1;
    }
    return 0;
}


function compareBulletSpeeds(a, b){
    if (a.value > b.value){
        return -1;
    }
    if (b.value > a.value){
        return 1;
    }
    return 0;
}


function compareMagSizes(a, b){
    if (a.value > b.value){
        return -1;
    }
    if (b.value > a.value){
        return 1;
    }
    return 0;
}


function compareMaxDamages(a, b){
    if (a.value > b.value){
        return -1;
    }
    if (b.value > a.value){
        return 1;
    }
    return 0;
}

function compareInitVertRecoil(a, b){
    if (a.value < b.value){
        return -1;
    }
    if (b.value < a.value){
        return 1;
    }
    return 0;
}

function compareVertRecoil(a, b){
    if (a.value < b.value){
        return -1;
    }
    if (b.value < a.value){
        return 1;
    }
    return 0;
}

function compareHorRecoil(a, b){
    if (a.value < b.value){
        return -1;
    }
    if (b.value < a.value){
        return 1;
    }
    return 0;
}

function compareDeployTimes(a, b){
    if (a.value < b.value){
        return -1;
    }
    if (b.value < a.value){
        return 1;
    }
    return 0;
}

$( function() {
    $.widget( "custom.combobox", {
        _create: function() {
            this.wrapper = $( "<span>" )
            .addClass( "custom-combobox" )
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
            .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
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
            .addClass( "custom-combobox-toggle ui-corner-right" )
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
                    };
                });
                if (!valid) {
                    // remove invalid value, as it didn't match anything
                    $(this).val("");
                    select.val("");
                    input.data("autocomplete").term = "";
                    return false;
                };
            };
        }
    });
} );
