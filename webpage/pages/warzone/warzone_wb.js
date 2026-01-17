// All weapon data
var WarzoneData;

var wzSelectedGuns = []
var wzSelectedGunIndex = -1
let wzCurrentGunStats = {}
let wzGunTemplate = {
    "name" : "none",
    "cat" : "none",
    "game" : "none",
    "gunId": "none",
    baseWeaponObject: {},
    weaponObject: {}
}

var wzSelectedLocation = "TorsoUpper";
var wzSelectedProbLocation = ""
var wzViewWeightAsPercentage = false

const wzCharts = {}
var wzProbabilityChartRedrawTimer = 0

// Precompute conflicts to avoid iterating WarzoneData
const wzNameConflictHandler = {
    nameConflicts: {},
    // Creates object of { [BaseWeaponName]: [gunData1, gunData2] }, where gunData has the same BaseWeaponName
    init(weaponData = WarzoneData) {
        const temp = Object.values(weaponData).reduce((acc, gunData) => {
            const { BaseWeaponName } = gunData;
            acc[BaseWeaponName] = acc[BaseWeaponName] || [];
            acc[BaseWeaponName].push(gunData);
            return acc;
        }, {})

        Object.entries(temp).forEach(([gunName, gunDuplicatesArr]) => {
            if (gunDuplicatesArr.length > 1) {
                this.nameConflicts[gunName] = gunDuplicatesArr;
            }
        })

        return this.nameConflicts;
    },
    filter(weaponName, categories, games) {
        const res = this.nameConflicts[weaponName]?.filter(({ UIWeaponCategory, SourceGame }) => {
            return categories.includes(UIWeaponCategory) && games.includes(SourceGame);
        }) || [];

        return res.length < 2 ? [] : res;
    },
}

function WarzoneLoadWeaponData () {
    loadWarzoneWBStylesheet();
    // Create new script element
    const script = document.createElement('script');
    script.src = './pages/warzone/data/warzone_data.js';
    document.head.appendChild(script);
    script.addEventListener('load', function() {
        warzoneWeaponBuilderInitializePage();
    });
}

// setup stuff and then remove loading text
function warzoneWeaponBuilderInitializePage() {
    wzNameConflictHandler.init(WarzoneData);
    wzInitializeWeaponSelect();
    wzInitializeWeaponTabs();
    wzInitializeWeaponManipulationButtons();
    wzInitializeAttachments();
    wzInitializeCharts();
    wzInitializeGuys();
    wzInitializeTogglesAndOtherControls();

    $(".sym-loading").remove()

    $(".wz-gunsmith").sortable({
        items: ".wz-sortable",
        opacity: 0.7,
        placeholder: "ui-state-highlight",
        handle: ".wz-sortDragIcon",
        forcePlaceholderSize: true
    })

    $(".wz-stat-comparison-table__table tbody").sortable({
    })

    $(".wz-gunsmith").show("fade", wzLoadLoadoutFromURL());

    $('.select2-selection__rendered').hover(function () {
        $(this).removeAttr('title');
    });
    $(document).tooltip({});
}

function wzInitializeGuys() {
    initializeWeaponLabelsGuy();
    initializeProbabilitiesGuy();
    $(".wz-locational-damage-guy text").remove();
    initializeTTKChartGuy();
    return;

    function initializeTTKChartGuy() {
        $(".wz-locational-damage-guy").on("click", "path", function() {
            wzSelectedLocation = $(this).attr("id").substring(3);
            wzUpdateCharts();
            $(".wz-locational-damage-guy path").removeClass("wz-bodyPart--selected").addClass("wz-bodyPart")
            $(this).addClass("wz-bodyPart--selected").removeClass("wz-bodyPart")
            const str = wzSelectedLocation.replace(/([A-Z])/g, " $1")
            $("#wz-selected-damage-location").text(str.charAt(0).toUpperCase() + str.slice(1))
        });
        $("#wz-TorsoUpper").click();
    }

    function initializeWeaponLabelsGuy() {
        $(".wz-locational-damage-guy .wz-guy").clone().prependTo(".wz-damageLabels");
        $(".wz-damageLabels path").removeAttr("id");
        $("#wz-damageLabelDistance").on('change', loadDamageLabels);

        function loadDamageLabels() {
            const damages = wzSelectedGuns[wzSelectedGunIndex].weaponObject.hitboxInfos.damage[$("#wz-damageLabelDistance").val()]
            $.each(Object.keys(damages), function (i, key) {
                $(".wz-damageLabels .wz-dmgLabel-" + key).text(damages[key])
            })
        }
    }

    function initializeProbabilitiesGuy() {
        //copy SVG
        $(".wz-locational-damage-guy .wz-guy").clone().prependTo(".wz-probabilitiesGuy");
        //Rename IDs
        $('.wz-probabilitiesGuy path').each(function () {
            $(this).attr("id", $(this).attr("id").replace("wz", "wz-prob"))
        })

        $(".wz-probabilitiesGuy path").on("click", function() {
            handleGuyProbClick( $(this).attr("id").replace("wz-prob-",""))
        })

        $(".wz-probabilitiesGuy text").on("click", function() {
            handleGuyProbClick( $(this).attr("class").replace("wz-dmgLabel-",""))
        })

        function handleGuyProbClick(locationId){
            wzSelectedProbLocation = locationId
            $('.wz-probabilitiesGuy text').attr("filter", "url(#solid)")
            $('.wz-probabilitiesGuy .wz-dmgLabel-' + wzSelectedProbLocation).attr("filter", "url(#solidGreen)")
            const str = wzSelectedProbLocation.replace(/([A-Z])/g, " $1")
            $(".wz-probLocationLabel").text(str.charAt(0).toUpperCase() + str.slice(1))
            $("#wz-probability-weight-input").val(wzGun.bodyLocationChances[wzSelectedProbLocation]).removeClass('disabledInput')
        }
    }
}

//Handlers for changing category/game/weapons
function wzInitializeWeaponSelect(){
    const gameTitles = $('#wz-game-select option').map((i, option) => {
        if (option.value !== "all") {
            return option.value;
        }
    }).toArray();

    const weaponCategories = $('#wz-cat-select option').map((i, option) => {
        if (option.value !== "all") {
            return option.value;
        }
    }).toArray();

    $('#wz-gun-select').html(wzInitialOption)
    addGunsToDropdown(gameTitles, weaponCategories)
    $('#wz-build-select').html(wzNoneOption)

    // Category dropdown handler
    $('#wz-cat-select').on('change', function() {
        $('#wz-gun-select').empty().html(wzInitialOption)
        const selectedCat = this.value === 'all' ? weaponCategories : [this.value];
        const selectedGame = $('#wz-game-select').val() === 'all' ? gameTitles : [$('#wz-game-select').val()];

        addGunsToDropdown(selectedGame, selectedCat)

        if (selectedCat === "Tactical Rifles"){
            $('#wz-game-select option[value!=t9]').hide().parent().val("t9").change()

        } else {
            $('#wz-game-select option').show()
        }
    })

    // Game dropdown handler
    $('#wz-game-select').on('change',  function() {
        const selectedGame = this.value;
        const selectedCat = $('#wz-cat-select').val() === 'all' ? weaponCategories : [$('#wz-cat-select').val()];
        $('#wz-gun-select').html(wzInitialOption)
        const game = selectedGame === "all" ? gameTitles : [selectedGame];
        addGunsToDropdown(game, selectedCat);

        $('#wz-gun-select').append($("#wz-gun-select option:gt(0)"));

    })

    // Gun dropdown handler
    $('#wz-gun-select').on('change', function() {
        //Clean up UI
        wzClearAttachmentDetails();
        $('#wz-gun-select .wzInitialOption').remove();

        //Add gun
        wzAddGunToSelectedGuns($(this).val(), []);

        //UpdateUI
        if( $(".wz-weapon-tab").length <= maxWeaponCount){
            $("#wz-add-new-tab").show()
            $("#wz-clone-gun-button").removeClass("disabledButton")
        }

        wzInitializeWeaponEditor();
        wzLoadStats()
        wzUpdateCharts()
    });

    // Recommended build handler
    $('#wz-build-select').on('change', function() {
        //Clean up UI
        wzClearAttachmentDetails();
        const value = $(this).val();
        const { gunId } = wzSelectedGuns[wzSelectedGunIndex].weaponObject;
        const attachments = wzParseUrlCode(value)?.[0]?.attachmentIds ?? [];
        wzSelectedGuns[wzSelectedGunIndex].weaponObject = new wzGun(gunId, attachments, wzSelectedGuns[wzSelectedGunIndex].weaponObject.blueprint);
        wzLoadStats();
        wzUpdateCharts();
    });

    // Blueprint handler
    $("#wz-blueprint-select").on("change", function() {
        wzClearAttachmentDetails();
        const blueprint = $(this).val();
        const { gunId } = wzSelectedGuns[wzSelectedGunIndex].weaponObject;
        const attachments = WarzoneData[gunId].BluePrints[blueprint]?.attachments ?? [];
        wzSelectedGuns[wzSelectedGunIndex].weaponObject = new wzGun(gunId, attachments, blueprint);
        wzLoadStats();
        wzUpdateCharts();
    });

    function addGunsToDropdown(games, categories) {
        const res = prepareGunList(games, categories)
          .sort((a, b) => a.BaseWeaponName.localeCompare(b.BaseWeaponName))
          .map(({  gunID, BaseWeaponName }) => new Option(BaseWeaponName, gunID));

        $('#wz-gun-select').append(res);

        return res;

        function prepareGunList(games, categories) {
            const gunArray = []

            for (const [gunID, gun] of Object.entries(WarzoneData)) {
                const { SourceGame, UIWeaponCategory, BaseWeaponName } = gun;
                const nameConflicts = wzNameConflictHandler.filter(BaseWeaponName, categories, games);
                if (categories.includes(UIWeaponCategory) && games.includes(SourceGame)) {
                    const newLocalizedName = nameConflicts.length ? `${BaseWeaponName} (${wzGameAbbreviations[SourceGame]})` : BaseWeaponName;
                    gunArray.push({ gunID, SourceGame, UIWeaponCategory, BaseWeaponName: newLocalizedName });
                }
            }

            return gunArray;
        }
    }
}

//Overwrite or add (-1) gun in wzSelectedGuns
//Optionally specify custom name
//Optionally switch wzSelectedGunIndex
function wzAddGunToSelectedGuns(gunID, attachmentIDs, blueprint = false) {
    if (!WarzoneData[gunID]) {
        return; //invalid gun
    }
    const UIName = findAvailableName(gunID);

    let gun = JSON.parse(JSON.stringify(wzGunTemplate));
    gun.name = UIName;
    gun.gunId = gunID;
    gun.baseWeaponObject = new wzGun(gunID, []);
    gun.weaponObject = new wzGun(gunID, attachmentIDs, blueprint, true);
    gun.cat = $('#wz-cat-select').val()
    gun.game = $('#wz-game-select').val()

    if(wzSelectedGunIndex < 0){
        wzSelectedGuns.push(gun);
    } else {
        wzSelectedGuns[wzSelectedGunIndex] = gun;
    }

    updateWeaponTabs();
    wzSetSelectedGunIndex(UIName);
    return;

    function updateWeaponTabs(){
        $(".wz-weapon-tab").each((index, element)=> {
            if (index < wzSelectedGuns.length && $(element).text() != "+") {
                $(element).text(wzSelectedGuns[index].name);
            }
        });
    }

    function findAvailableName(gunID) {
        const gunName = WarzoneData[gunID].BaseWeaponName;
        const usedNames = $(".wz-weapon-tab").map(function(){ return this.innerText }).toArray();
        usedNames.splice(wzSelectedGunIndex, 1);

        let potentialName = gunName;
        let i = 2;

        while (usedNames.includes(potentialName)) {
            potentialName = gunName + " [" + i + "]";
            i++;
        }

        return potentialName;
    }
}

//Load weapon image and populate attachment dropdowns
function wzInitializeWeaponEditor(){
    const gunId = wzSelectedGuns[wzSelectedGunIndex].weaponObject.gunId;
    const imgName = WarzoneData[gunId].BaseWeapon + ".png"
    $("#wz-weapon-img").attr("src", "./pages/warzone/img/weapon/" + imgName)
    populateAttachmentDropdowns(gunId);
    populateRecommendedBuildDropdown(gunId);
    populateBlueprintsDropdown(gunId);
    return;

    //populate all applicable dropdowns with attachments
    function populateAttachmentDropdowns(gunId, blueprint = "zz-none"){
        //clear previous attachment dropdowns
        $(".wz-attachment-selector select").html(wzNoneOption);
        const selectableAttachments = WarzoneData[gunId].WeaponBases[WarzoneData[gunId].BaseWeapon].SelectableAttachments ?? {};

        const attachmentOptions = {};
        for (const [attachmentId, attachment] of Object.entries(selectableAttachments)) {
            const { Slot, LocalizedName, UnlockLevel } = attachment;
            const selectId = `#wz-${Slot}`;
            attachmentOptions[selectId] ??= [[-1, new Option(`--- ${wzCatLocalization[Slot]} ---`, "none")]];
            attachmentOptions[selectId].push([Math.abs(UnlockLevel) , new Option(LocalizedName, attachmentId)]);
        }

        Object.entries(attachmentOptions).forEach(([selectId, option]) => {
            $(selectId).html(option.sort((a, b) => a[0] - b[0]).map(x => x[1])); // bulk insert for performance. (Detaching before modifying may also increase performance)
        })

        // hide dropdowns that are used as spacers
        $.each($('.wz-attachment-selector select'), function (i, item) {
            if ($(this).find("option").length <= 1){
                wzIsMobile ? $(this).hide() : $(this).next(".select2-container").hide();
            } else {
                wzIsMobile ? $(this).show() : $(this).next(".select2-container").show();
            }
        })
    }

    function populateRecommendedBuildDropdown(gunId) {
        $('#wz-build-select').attr("disabled", "disabled").addClass("wz-disabled-select");
        const builds = (wzAutofillBuilds[gunId]?.builds ?? []).map((build) => {
            return new Option(build.Build_Name, build.Loadout_URL);
        });
        builds.unshift(new Option("--- Recommended Builds ---", "none"));
        $('#wz-build-select').html(builds);
        if (builds.length > 1) { //No recommended builds
            $('#wz-build-select').removeAttr("disabled").removeClass("wz-disabled-select");
        }
    }

    function populateBlueprintsDropdown(gunId) {
        $('#wz-blueprint-select').attr("disabled", "disabled").addClass("wz-disabled-select");
        const blueprints = Object.keys(WarzoneData[gunId]?.BluePrints ?? {}).sort().map(key => {
            return new Option(key, key)
        })
        blueprints.unshift(new Option("--- Blueprints ---", "none"));
        $("#wz-blueprint-select").html(blueprints);
        if (blueprints.length > 1) { //No recommended builds
            $('#wz-blueprint-select').removeAttr("disabled").removeClass("wz-disabled-select");
        }
    }
}

//handlers for selecting and hovering attachments
function wzInitializeAttachments(){
    // Attachment Select Handler
    $('.wz-attachment-selector select').on('change', function () {
        if (wzIsMobile) {
            const hoveredAttachmentID = $(this).val();
            const hoveredSlot = $(this).attr("id");
            const name = $(this).find("option:selected").text();
            writeHoverStats(name, hoveredSlot, hoveredAttachmentID);
        }
        const selectedAttachments = findSelectedAttachments();

        //Create weapon object including selected attachments
        wzSelectedGuns[wzSelectedGunIndex].weaponObject = new wzGun(wzSelectedGuns[wzSelectedGunIndex].weaponObject.gunId, selectedAttachments, wzSelectedGuns[wzSelectedGunIndex].weaponObject.blueprint, true);
        //Load UI
        wzLoadStats();
        wzUpdateCharts();
    })

    //$('.wz-attachment-selector select').hide();
    if (!wzIsMobile) {
        $('.wz-attachment-selector select').select2({
            width: '175px',
            minimumResultsForSearch: -1,
            dropdownParent: $('.wz-gunsmith')
        })

        //start with selects hidden
        $.each($('.wz-attachment-selector select'), function (i, item) {
            $(this).next(".select2-container").hide();
        })
        
        //initialize attachment hover behavior
        $(document).on("mouseover", ".select2-results__option", function() {
            const idArray = $(this).attr("id").split("-")
            const hoveredAttachmentID = idArray[5];
            const hoveredSlot = "wz-" + idArray[2];
            const name = $(this).text();
            writeHoverStats(name, hoveredSlot, hoveredAttachmentID);
        })
    }

    function writeHoverStats(name, hoveredSlot, hoveredAttachmentID) {
        const selectedAttachments = findSelectedAttachments(hoveredSlot)
        selectedAttachments.push(hoveredAttachmentID);
        const resultingGun = new wzGun(wzSelectedGuns[wzSelectedGunIndex].weaponObject.gunId, selectedAttachments, wzSelectedGuns[wzSelectedGunIndex].weaponObject.blueprint);
        const resultingGunUIStats = wzCreateUIWeaponStatsObj(resultingGun);
        const currentGunUIStats = wzCurrentGunStats;

        $(".wz-attachment-details-box table thead").html(`<tr><th colspan="2">${name}</th></tr>`);

        const htmlToInsert = wzHoverStatsEntries.map(stat => {
            if (resultingGunUIStats.getStat(stat) != currentGunUIStats.getStat(stat)) {
                return generateHoverStatTableRow(stat, resultingGunUIStats.getStat(stat));
            }
        }).join("") + writeQualitativeHoverData(currentGunUIStats.qualitative, resultingGunUIStats.qualitative);
        $('.wz-attachment-details-box table tbody').html(htmlToInsert);

        function generateHoverStatTableRow(stat, value) {
            const [decimal, unit, friendlyName, betterDirection] = wzStatFormat[stat];
            const difference = roundToDecimal((value - currentGunUIStats.getStat(stat)), decimal);
            let differenceText = (difference > 0) ? "+" + difference : difference;
            let colorClass = "wz-yellowText"
            if (betterDirection != 0) {
                colorClass = Math.sign(difference) == betterDirection ? "wz-greenText" : "wz-redText";
            }
            if (stat === "muzzleVelocity" && value < 0) {
                colorClass = "wz-greenText"
                differenceText = "∞"
            }
            return "<tr><td>" + friendlyName + "</td><td class='" + colorClass + " '>" + differenceText + unit + "</td>";
        }

        function writeQualitativeHoverData(qualitativeOld, qualitativeNew) {
            let returnString = "";
            //damage
            var colorClass
            var damage = "Same"
            if (qualitativeNew.baseDamageMultiplier > qualitativeOld.baseDamageMultiplier) {
                damage = "Increased"
            }
            if (qualitativeNew.baseDamageMultiplier < qualitativeOld.baseDamageMultiplier) {
                damage = "Decreased"
            }
            if (qualitativeNew.bodyBTKShiftCount < qualitativeOld.bodyBTKShiftCount) {
                damage = "Increased"
            }
            if (qualitativeNew.bodyBTKShiftCount > qualitativeOld.bodyBTKShiftCount) {
                damage = "Decreased"
            }
            if (damage != "Same") {
                colorClass = (damage == "Increased") ? "wz-greenText" : "wz-redText";
                returnString += "<tr><td>Damage</td><td class='" + colorClass + " '>" + damage + "</td>";
            }
            //damage profile
            if (JSON.stringify(qualitativeOld.baseDamageProfile) != JSON.stringify(qualitativeNew.baseDamageProfile)) {
                returnString += "<tr><td>Damage Profile</td><td class=' '>Changed</td>";
            }
            //hitbox profile
            if (JSON.stringify(qualitativeOld.hitboxMultipliers) != JSON.stringify(qualitativeNew.hitboxMultipliers)) {
                returnString += "<tr><td>Hitbox Profile</td><td class=' '>Changed</td>";
            }
            return returnString;
        }
    }

    //Find all currently select attachments
    function findSelectedAttachments(ignoreSlot = false) {
        const selectedAttachments = [];
        $('.wz-attachment-selector select').each(function (index) {
            const attachmentSlot = $(this).attr("name");
            if ($(this).val() !== "none" && attachmentSlot != ignoreSlot) {
                const attachmentId = $(this).val();
                selectedAttachments.push(attachmentId);
            }
        });
        return selectedAttachments;
    }
}

function wzClearAttachmentDetails(){
    //empty hover box
    $("#wz-hovered-attachment-name").text("");
    $('.wz-attachment-details-box table *').empty();
    //reset damage label guy state
    $("#wz-damageLabelDistance option:first").prop('selected', true);
    $(".wz-damageLabels text").text("");
}

// handle clicks of weapon tabs
function wzInitializeWeaponTabs() {
    initializeWeaponTabClick();
    initializeWeaponAddButtton();
    return;

    // handle switching tabs
    function initializeWeaponTabClick(){
        $(".wz-weapon-tabs").on("click", ".wz-weapon-tab", function() {
            //ignore new tab button
            if($(this).attr("id") === "wz-add-new-tab") {
                return;
            }

            //if weapon is already selected, scroll to editor
            if ($(this).hasClass("wz-weapon-tab--selected")) {
                scrollToElement(".wz-weapon-selector", 500);
                return;
            }

            //Clean up
            wzClearAttachmentDetails();
            $(".wz-equipped-count").css("visibility", "hidden");
            $(".wz-equipped-count__dots > div").css("visibility", "hidden");
            $(".wz-build-details").css("visibility", "hidden");
            $(".wz-loadout-url-box").css("visibility", "hidden");
            $("#wz-clone-gun-button").addClass("disabledButton");
            $("#wz-delete-gun-button").addClass("disabledButton");

            $(".wz-weapon-tab").removeClass("wz-weapon-tab--selected");
            $(this).addClass("wz-weapon-tab--selected");

            const gunName = $(this).text()

            if (gunName !== wzNewWeaponText){ // Switch to weapon
                wzSetSelectedGunIndex(gunName);
                const currentGun = wzSelectedGuns[wzSelectedGunIndex];
                $('#wz-cat-select').val(currentGun.cat).change();
                $('#wz-game-select').val(currentGun.game).change();
                $('#wz-gun-select').val(currentGun.gunId);

                wzInitializeWeaponEditor();
                wzLoadStats();

                //enable delete and clone buttons if appropriate
                if ($(".wz-weapon-tab").length <= maxWeaponCount) {
                    $("#wz-clone-gun-button").removeClass("disabledButton");
                }
                if (wzSelectedGuns.length > 1) {
                    $("#wz-delete-gun-button").removeClass("disabledButton");
                }
            } else { // handle empty weapon tab
                $('#wz-build-select').empty().html(wzNoneOption);
                $('#wz-build-select').attr("disabled", "disabled").addClass("wz-disabled-select");
                wzSelectedGunIndex = -1;
                $(".select2-container").hide();
                $(".wz-attachment-selector select").hide();
                //$("#wz-cat-select").val($("#wz-cat-select option:first").val());
                $('#wz-weapon-img').attr("src", "./pages/warzone/img/weaponSelect.png");
                $('.wz-attachment-selector select').children().not(':first-child').remove();
                $(".enabledElement").addClass("disabledElement").removeClass("enabledElement");
                $("#wz-delete-gun-button").removeClass("disabledButton");
                scrollToElement(".wz-weapon-selector", 500);
            }
        });
    }

    // handle new button clicks tab
    function initializeWeaponAddButtton(){
        $("#wz-add-new-tab").click(function() {
            if (!$(".wz-weapon-tab").text().includes(wzNewWeaponText)){
                $(this).clone().removeAttr("id").removeAttr("title").show().text(wzNewWeaponText).insertBefore(this);
                if($(".wz-weapon-tab").length > maxWeaponCount){
                    $(this).hide();
                }
                $("#wz-game-select").change();
                $(".wz-weapon-tab:contains('" + wzNewWeaponText +"')").click();
                return;
            } else {
                $(".wz-weapon-tab:contains('" + wzNewWeaponText +"')").effect("highlight").click();
            }
            scrollToElement(".wz-weapon-selector", 500);
        });
    }

    function scrollToElement(element, speed = 500){
        if (isElementInViewport($(element))) {
            return
        }

        $('html, body').animate({
            scrollTop: $(element).offset().top
        }, speed);
        return;

        function isElementInViewport (el) {
            // Special bonus for those using jQuery
            if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
            }

            const rect = el.getBoundingClientRect();

            return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) //&& /* or $(window).height() */
            //rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
            );
        }
    }
}

//handle delete and clone weapon buttons
function wzInitializeWeaponManipulationButtons() {
    initializeDeleteGunButton();
    initializeCloneGunButton();
    initializeCopyButton();
    initializeRenameGunInput();
    return;

    function initializeDeleteGunButton(){
        $("#wz-delete-gun-button").click(function() {
            $("#wz-add-new-tab").show();
            const $selectedTab = $(".wz-weapon-tab--selected");

            if (wzSelectedGuns.length > 1) {
                //remove gun from wzSelectedGuns
                if(!$selectedTab.text().includes(wzNewWeaponText)){
                    wzSelectedGuns.splice(wzSelectedGunIndex, 1);
                    wzRemoveChart();
                }

                //select new tab
                const selectPreviousTab = $selectedTab.next().hasClass("wz-add-new-tab") || $selectedTab.next().not(":visible") && $selectedTab.prev().length > 0;
                const selectedTabAfterDelete = selectPreviousTab ? $selectedTab.prev() : $selectedTab.next();
                $selectedTab.remove();
                $(selectedTabAfterDelete).click();
            } else if (wzSelectedGunIndex === -1) {
                const $prev = $selectedTab.prev();
                $selectedTab.remove();
                $prev.click();
            }
        })
    }

    function initializeCloneGunButton(){
        $("#wz-clone-gun-button").click(function() {
            if ( $("#wz-add-new-tab").is(":visible")){
                const { gunId, selectedAttachments, blueprint} = wzSelectedGuns[wzSelectedGunIndex].weaponObject;

                //create new tab
                $("#wz-add-new-tab").click();

                //Clean up UI
                $('#wz-gun-select').val(gunId);
                $('#wz-gun-select .wzInitialOption').remove();

                //Add gun
                wzAddGunToSelectedGuns(gunId, selectedAttachments, blueprint);

                //UpdateUI
                if( $(".wz-weapon-tab").length <= maxWeaponCount){
                    $("#wz-add-new-tab").show()
                    $("#wz-clone-gun-button").removeClass("disabledButton");
                }

                wzInitializeWeaponEditor();
                wzLoadStats();
                wzUpdateCharts();
            }
        })
    }

    function initializeCopyButton(){
        $("#wz-loadout-url-box__copy-button").click(function (){
            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($("#wz-loadout-url-box__url-preview").val()).select();
            document.execCommand("copy");
            $temp.remove();
            $(".wz-loadout-url-box__copy-confirmation").css("visibility", "visible")
        })
    }

    function initializeRenameGunInput() {
        $("#wz-gun-name-input").on("change", function () {
            const newName = $(this).val();
            const usedNames = wzSelectedGuns.map((gun) => {
                return gun.name;
            });
            //prevent duplicate and blank names
            if (!usedNames.includes(newName) && newName != "") {
                wzSelectedGuns[wzSelectedGunIndex].name = newName;
                $(".wz-weapon-tab").eq(wzSelectedGunIndex).text(newName);
                wzUpdateCharts();
                wzLoadProbabilityCharts();
            } else {
                $("#wz-gun-name-input").val(wzSelectedGuns[wzSelectedGunIndex].name);
            }
            wzUpdateStatsComparisonTableHeader()
        });
    }
}

// store the index of the selected gun to accomodate quick access
function wzSetSelectedGunIndex(selectedGunName){
    for(var i = 0; i < wzSelectedGuns.length; i++){
        if (selectedGunName === wzSelectedGuns[i].name){
            wzSelectedGunIndex = i;
        }
    }
}

// Load stats of current weapon onto DOM
// Optionally preserve selections such as damage label index, etc
function wzLoadStats(){
    $(".disabledElement").addClass("enabledElement").removeClass("disabledElement");

    //Load attachments into selects
    selectAttachments();
    disableConflictingAttachments();

    //Save UI stats object for hover compare
    wzCurrentGunStats = wzCreateUIWeaponStatsObj(wzSelectedGuns[wzSelectedGunIndex].weaponObject);

    //Load stats into comparison table
    loadQuickStatsIntoTable();
    wzLoadStatComparisonTable(false);

    updateLabelGuySelector();

    const probabiltiesMaxRange = Math.max(10, Math.ceil(wzGetFarthestRangeOfSelectedGuns() * 1.25 / 10) * 10);
    $("#wzProbabilityRangeSlider").attr("max", probabiltiesMaxRange);
    $(".wz-probablitiesMaxRangeLabel").text(probabiltiesMaxRange + "m+");
    $("#wzProbabilityRangeSlider").trigger("input");

    draw(wzSelectedGuns[wzSelectedGunIndex].weaponObject);
    $(".wz-distanceAdsValue").text($("#wzADSRangeSlider").val() + "m")
    $(".wz-adsZoomValue").text($("#wzADSZoomSlider").val() + "x")
    $(".wz-fovValue").text($("#wzFovSlider").val() + "°")
    $(".wz-distanceHipfireValue").text($("#wzHipRangeSlider").val() + "m")

    const opticValue = $("#wz-optic").val();
    const { gunId, requiredLevel } = wzSelectedGuns[wzSelectedGunIndex].weaponObject;
    const opticName = (opticValue == "none") ? "Default Optic" : WarzoneData[gunId].WeaponBases[WarzoneData[gunId].BaseWeapon].SelectableAttachments[opticValue].LocalizedName;
    
    $(".wz-currentOptic").text(opticName + " - " + $("#wz-fov").text())

    updateEquippedCount();
    if ($("#wz-gun-select option:selected").text() != "-- Select --"){
        $("#wz-gun-name-input").val(wzSelectedGuns[wzSelectedGunIndex].name);
    }
    updateLoadoutURL();

    $(".wz-build-details").css("visibility", "visible");
    $("#wz-gunRequiredLevel").text(`Required Level: ${requiredLevel}`);
    selectMatchingBuild();
    selectingMatchingBlueprint();
    return;

    //Update UI to represent attachments
    function selectAttachments() {
        //clear previous attachment dropdowns
        $(".wz-attachment-selector select").val("none");

        const attachmentValues = wzSelectedGuns[wzSelectedGunIndex].weaponObject.selectedAttachments;
        const $selectors = $('.wz-attachment-selector select');

        attachmentValues.forEach(attachment => {
            $selectors.find(`option[value="${attachment}"]`).parent().val(attachment);
        })
        //tell select2 to update gun labels
        $(".wz-attachment-selector select").trigger("change.select2");
    }

    //Disable conflicting attachments
    function disableConflictingAttachments() {
        const conflictList = wzSelectedGuns[wzSelectedGunIndex].weaponObject.conflictingAttachments;
        $('.wz-attachment-selector select > option').removeAttr('disabled');
        conflictList.forEach((conflictingID) => {
            $('.wz-attachment-selector option[value="' + conflictingID + '"]').attr('disabled', 'disabled');
        });
    }

    /*
    TODO: Programmatically add entries to the gun stats table?
    */
    function loadQuickStatsIntoTable(){
        const currentGunStats = wzCurrentGunStats;
        const baseGunStats = wzCreateUIWeaponStatsObj(wzSelectedGuns[wzSelectedGunIndex].baseWeaponObject);
        $(".wz-current-weapon-stats__table td[id]").each(function (index, element) {
            const id = $(this).attr("id");
            const orig = id.endsWith("-orig")
            const stat = orig ? id.slice(3, -5) : id.slice(3);
            const value = orig ? baseGunStats.getStat(stat) : currentGunStats.getStat(stat);
            const [decimal, unit, friendlyName, betterDirection] = wzStatFormat[stat];
            const formattedText = (stat === 'muzzleVelocity' &&  value < 0) ? `∞ ${unit}` : `${roundToDecimal(value, decimal)} ${unit}`;
            let colorClass = false;
            if (!orig) {
                $(this).removeClass("wz-redText wz-greenText wz-yellowText");
                const difference = value - baseGunStats.getStat(stat);
                if (difference != 0) {
                    colorClass = "wz-yellowText"
                    if (betterDirection != 0) {
                        colorClass = Math.sign(difference) == betterDirection ? "wz-greenText" : "wz-redText";
                    }
                    if (stat === "muzzleVelocity" && value < 0) {
                        colorClass = "wz-greenText"
                    }
                }
            }
            $(this).text(formattedText);
            if (colorClass) {
                $(this).addClass(colorClass);
            }
        });
    }
    
    function updateLabelGuySelector() {
        //Save current selected index
        const selectedDamageRangeIndex = $("#wz-damageLabelDistance")[0].selectedIndex + 1 || 1;

        //clear list and populate it with new values
        $("#wz-damageLabelDistance").empty()
        const damageDistances = wzSelectedGuns[wzSelectedGunIndex].weaponObject.rangeSelector;
        damageDistances.forEach(entry => {
            $("#wz-damageLabelDistance").append($('<option>', {
                value: entry[0],
                text: entry[1]
            }))
        });

        //select previously selected range and trigger update
        if ($("#wz-damageLabelDistance option").length < selectedDamageRangeIndex){
            $("#wz-damageLabelDistance option:last").prop('selected', true).change();
        } else {
            $("#wz-damageLabelDistance :nth-child(" + selectedDamageRangeIndex + ")").prop('selected', true).change();
        }
    }

    function updateEquippedCount(){
        const { MaxAttachments } = WarzoneData[wzSelectedGuns[wzSelectedGunIndex].gunId];
        const equippedCount = wzSelectedGuns[wzSelectedGunIndex].weaponObject.selectedAttachments.length;

        //Update dots
        if (MaxAttachments > 0) {
            let populatedSlots = 0;
            $('.wz-attachment-selector select').each(function (index) {
                if ($(this).find("option").length > 1){
                    populatedSlots += 1;
                }
            });
            const realMax = Math.min(MaxAttachments, populatedSlots);
            $(".wz-equipped-count__dots > div").css("visibility", "hidden").removeClass("wz-equipped-count__dots--equipped");
            $(".wz-equipped-count__dots > div").slice(0, realMax).css("visibility", "visible");
            $(".wz-equipped-count__dots > div").slice(0, equippedCount).addClass("wz-equipped-count__dots--equipped");
            $("#wz-equipped-count__label").text("Equipped " + equippedCount + "/" + realMax);
            $(".wz-equipped-count").css("visibility", "visible");
        } else {
            $(".wz-equipped-count").css("visibility", "hidden");
            $(".wz-equipped-count__dots > div").css("visibility", "hidden");
        }

        //Clean up attachment selectors
        $('.wz-attachment-selector select').removeAttr("disabled").removeClass("wz-disabled-select")
        $(".wz-attachment--equipped").removeClass("wz-attachment--equipped");

        //Highlight selected attachments
        $('.wz-attachment-selector select').each(function( index ) {
            const value = $(this).val();
            if(value && value != "none"){
                $(this).addClass("wz-attachment--equipped");
                $(this).siblings("span").addClass("wz-attachment--equipped");
            }
        })

        //Disable attachment dropdowns if at max
        if (equippedCount >= MaxAttachments){
            $('.wz-attachment-selector select').each(function( index ) {
                if($(this).val() == "none"){
                    $(this).attr("disabled", "disabled").addClass("wz-disabled-select")
                }
            })
        }
    }

    function updateLoadoutURL(){
        const { gunId, selectedAttachments } = wzSelectedGuns[wzSelectedGunIndex].weaponObject;
        const encoding = [gunId, ...selectedAttachments].map(id => `0${parseInt(id).toString(36)}`.slice(-2)).join("");
        const loadoutURL = `${window.location.origin}${window.location.pathname}?wz-loadout=41${encoding}`;

        $("#wz-loadout-url-box__url-preview").val(loadoutURL);
        $(".wz-loadout-url-box").css("visibility", "visible");
        $(".wz-loadout-url-box__copy-confirmation").css("visibility", "hidden");

        const fullComparison = "41" + wzSelectedGuns.map(gun => {
            const { gunId, selectedAttachments } = gun.weaponObject;
            return [gunId, ...selectedAttachments].map(id => `0${parseInt(id).toString(36)}`.slice(-2)).join("");
        }).join(wzUrlDelimeter)

        history.replaceState(null, null, `${window.location.pathname}?wz-loadout=${fullComparison}`);
    }

    function selectMatchingBuild() {
        const { gunId, selectedAttachments } = wzSelectedGuns[wzSelectedGunIndex].weaponObject;
        $("#wz-gun-and-build-name").text(WarzoneData[gunId].BaseWeaponName);
        $("#wz-gunOrBuildDescription").text("\xa0");
        const attachmentString = selectedAttachments.toString();
        if (wzAutofillBuilds[gunId]?.builds.length > 0) {
            const matchingBuild = wzAutofillBuilds[gunId].builds.find(build => attachmentString == wzParseUrlCode(build.Loadout_URL)[0].attachmentIds.sort());
            const selectorValue = matchingBuild?.Loadout_URL ?? "none";
            $("#wz-build-select").val(selectorValue);
            if (selectorValue != "none") {
                $("#wz-gun-and-build-name").text(WarzoneData[gunId].BaseWeaponName + " - " + matchingBuild.Build_Name);
                $("#wz-gunOrBuildDescription").text("Author: " + matchingBuild.Creator_Name + " • Updated: " + matchingBuild.Last_Updated);
            }
        }
    }

    function selectingMatchingBlueprint() {
        const { gunId, blueprint, selectedAttachments } = wzSelectedGuns[wzSelectedGunIndex].weaponObject;
        const attachmentString = selectedAttachments.toString();
        const { Codename, UIWeaponCategory, BluePrints } = WarzoneData[gunId];
        const activeBlueprintsAttachments = BluePrints?.[blueprint]?.attachments?.slice()?.sort();
        if (attachmentString == activeBlueprintsAttachments) {
            $("#wz-blueprint-select").val(blueprint);
        } else {
            $("#wz-blueprint-select").val("none");
        }
        const cleanCodenameCategory = UIWeaponCategory.endsWith("s") ? UIWeaponCategory.slice(0, -1) : UIWeaponCategory;
        const uiText = blueprint ? `Active Blueprint: ${blueprint}` : `${cleanCodenameCategory} ${Codename}`;
        $("#wz-gunBluePrint").text(uiText);
    }
}

function wzUpdateStatsComparisonTableHeader(){
    const emptyCells = "<th>-</th>".repeat(Math.max(0, 5 - wzSelectedGuns.length))
    $(".wz-stat-comparison-table__table > thead").empty().append(`<tr><th><img src="./pages/warzone/img/symWatermark.png"></th>${wzSelectedGuns.map(gun => `<th>${gun.name}</th>`).join("")}${emptyCells}<th><img class="wz-stat-comparison-table__reset" src="./pages/warzone/img/refresh.png" title="Restore deleted rows"/></th></tr>`);
}

function wzLoadStatComparisonTable(isRefresh) {
    const emptyDashCells = "<td>-</td>".repeat(Math.max(0, 5 - wzSelectedGuns.length))
    const emptyCells = "<td>&nbsp;</td>".repeat(Math.max(0, 5 - wzSelectedGuns.length))
    const remakeTable = isRefresh || $(".wz-stat-comparison-table__table > tbody tr").length == 0;
    const currentTableEntries = $(".wz-stat-comparison-table__table > tbody tr").map(function() {return $(this).data("stat") ?? "spacer";}).toArray();
    wzUpdateStatsComparisonTableHeader();
    const currentGunStats = wzSelectedGuns.map(x => wzCreateUIWeaponStatsObj(x.weaponObject));
    const spacerRow = `<tr><td>&nbsp;</td>${"<td>&nbsp;</td>".repeat(currentGunStats.length)}${emptyCells}<td><img class="wz-stat-comparison-table__delete-row" src="pages/warzone/img/trash.png" title="Delete Row"></td></tr>`;
    const arrayToIterate = remakeTable ? wzStatsTableEntries : currentTableEntries;
    const htmlToInsert = arrayToIterate.map(stat => {
        if (stat == "spacer") {
            return spacerRow;
        }
        return generateComparisonTableRow(stat, currentGunStats, emptyDashCells);
    }).join("");
    $(".wz-stat-comparison-table__table > tbody").html(htmlToInsert);

    function generateComparisonTableRow(stat, currentGunStats, emptyCells){
        const [decimal, unit, friendly, betterDirection] = wzStatFormat[stat];
        const rowValues = currentGunStats.map(gun => gun.getStat(stat));
        const uniqueValues = [...new Set(rowValues)].sort((a, b) => a - b);
        if (betterDirection > 0) {
            uniqueValues.reverse();
        }
        const rowData = rowValues.map(value => {
            const formattedText = (stat === 'muzzleVelocity' &&  value < 0) ? `∞${unit}` : `${roundToDecimal(value, decimal)}${unit}`;
            if (uniqueValues.length > 1) {
                const rankingRatio = uniqueValues.indexOf(value) / (uniqueValues.length - 1);
                const color = (betterDirection == 0) ? "#dad462" : interpolateRGB(rankingRatio, wzBetterColor, wzNeutralColor, wzWorseColor);
                return `<td style="color:${color}">${formattedText}</td>`;
            }
            return `<td>${formattedText}</td>`;
        }).join("");
        return `<tr data-stat="${stat}"><td>${friendly}</td>${rowData}${emptyCells}<td><img class="wz-stat-comparison-table__delete-row" src="pages/warzone/img/trash.png" title="Delete Row"></td></tr>`;
    }
    
    function interpolateRGB(ratio, ...rgbs) {
        if (ratio == 0) {
            return `rgb(${rgbs[0].join(", ")})`;
        }
        const sectionSize = 1 / (rgbs.length - 1);
        const index = Math.ceil(ratio / sectionSize) - 1;
        const rgb1 = rgbs[index];
        const rgb2 = rgbs[index + 1];
        const sectionRatio = (ratio - (index * sectionSize)) / sectionSize;
        return `rgb(${rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * sectionRatio).join(", ")})`;
    }
}

// create a weapon stats object based on the currently applied gun and attachments
function wzCreateUIWeaponStatsObj(gun){
    const { stats } = gun;
    const movement = gun.movementSpeed(false, false)
    const adsMovement = gun.movementSpeed(true, false)

    return {
        getStat: function(stat) {
            return this[stat] ?? gun.stats[stat];
        },
        reloadTime: stats.reloadTime / 1000,
        reloadAddTime: stats.reloadAddTime / 1000,
        reloadEmptyTime: stats.reloadEmptyTime / 1000,
        reloadEmptyAddTime: stats.reloadEmptyAddTime / 1000,
        hipfireStandMoveMax: stats.hipfire.moveMax,
        tacSprint: movement.tacsprint,
        sprint: movement.sprint,
        forward: movement.forward,
        backpedal: movement.backpedal,
        strafe: movement.strafe,
        ADSForward: adsMovement.forward,
        ADSBackpedal: adsMovement.backpedal,
        ADSStrafe: adsMovement.strafe,
        preFireDelay: stats.openBoltDelay + stats.effectiveChargeTime,
        tacticalSprintSpeedMultiplier: stats.perks.quick ? 1.04 : 1,
        qualitative: {
            baseDamageMultiplier: stats.baseDamageMultiplier,
            bodyBTKShiftCount: stats.bodyBTKShiftCount,
            baseDamageProfile: stats.baseDamageProfile,
            hitboxMultipliers: stats.hitboxMultipliers,
        },
    }
}

function wzLoadLoadoutFromURL(){
    const urlParams = new URLSearchParams(window.location.search)

    if(urlParams.has("wz-loadout")){
        const build = wzParseUrlCode(urlParams.get('wz-loadout'));
        build.length = Math.min(build.length, maxWeaponCount);
        wzAddGunToSelectedGuns(build[0].gunId, build[0].attachmentIds);
        for (let i = 1; i < build.length; i++) {
            $("#wz-add-new-tab").click();
            wzAddGunToSelectedGuns(build[i].gunId, build[i].attachmentIds);
        }

        //Clean up UI
        $('#wz-gun-select').val(wzSelectedGuns[wzSelectedGunIndex].weaponObject.gunId);
        $('#wz-gun-select .wzInitialOption').remove();

        //UpdateUI
        if( $(".wz-weapon-tab").length <= maxWeaponCount){
            $("#wz-add-new-tab").show()
            $("#wz-clone-gun-button").removeClass("disabledButton");
        }

        wzInitializeWeaponEditor();
        wzLoadStats();
        wzUpdateCharts();
    }
}

function wzInitializeTogglesAndOtherControls(){
    initializeMovementToggles();
    initializeChartToggles();
    initializeAimingControls();
    initializeHealthControls();
    initializeProbabilityControls();
    initialzeComparisonStatsControls();
    return;

    function initializeMovementToggles() {
        $(".wz-movement-chart-toggles__toggle").on("click", function() {
            $(this).toggleClass("wz-movement-chart-toggles__toggle--selected")
            wzUpdateMovementChart()
        });

        $(".wzMovementSwitch").click(function(){
            $(".wzMovementSwitch .wz-toggle-switch__switch").toggleClass("wz-toggle-switch__switch--active")
            wzUpdateMovementChart()
    
            if($(".wzMovementSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active")){
                $(".wz-movement-chart-toggles tr:nth-child(1), .wz-movement-chart-toggles tr:nth-child(2)").addClass("wz-hidden")
            } else {
                $(".wz-movement-chart-toggles tr:nth-child(1), .wz-movement-chart-toggles tr:nth-child(2)").removeClass("wz-hidden")
            }
        });

        $(".wzFiringSwitch").click(function(){
            $(".wzFiringSwitch .wz-toggle-switch__switch").toggleClass("wz-toggle-switch__switch--active")
            wzUpdateMovementChart();
        });
    }

    function initializeChartToggles() {
        $("#wz-ballistics-chart-max-distance").change(function(){
            wzUpdateCharts();
        });

        $(".wzBTKSwitch").click(function(){
            $(".wzBTKSwitch .wz-toggle-switch__switch").toggleClass("wz-toggle-switch__switch--active")
            wzShowDamageOrBTKChart()
        });
    
        $(".wzBulletSpeedSwitch").click(function(){
            $(".wzBulletSpeedSwitch .wz-toggle-switch__switch").toggleClass("wz-toggle-switch__switch--active")
            wzShowBulletSpeedOrDropChart()
        });
    
        $(".wzTTKDPMSwitch").click(function(){
            $(".wzTTKDPMSwitch .wz-toggle-switch__switch").toggleClass("wz-toggle-switch__switch--active")
            wzShowAverageTTKorDownsPerMagChart()
        });

        return;

        function wzShowDamageOrBTKChart(redraw = true) {
            if ($(".wzBTKSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active")) {
                $("#wzDamageChart").parent().parent().hide();
                $("#wzBTKChart").parent().parent().show();
                if (redraw) {
                    wzCharts.wzBTKChart.redraw();
                }
            } else {
                $("#wzBTKChart").parent().parent().hide();
                $("#wzDamageChart").parent().parent().show();
                if (redraw) {
                    wzCharts.wzDamageChart.redraw();
                }
            }
        }
        
        function wzShowBulletSpeedOrDropChart(redraw = true) {
            if ($(".wzBulletSpeedSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active")) {
                $("#wzBulletDropChart").parent().parent().hide();
                $("#wzBulletSpeedChart").parent().parent().show();
                if (redraw) {
                    wzCharts.wzBulletSpeedChart.redraw();
                }
            } else {
                $("#wzBulletSpeedChart").parent().parent().hide();
                $("#wzBulletDropChart").parent().parent().show();
                if (redraw) {
                    wzCharts.wzBulletDropChart.redraw();
                }
            }
        }
        
        function wzShowAverageTTKorDownsPerMagChart(redraw = true) {
            if ($(".wzTTKDPMSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active")) {
                $("#wzMeanDistributionTTKChart").parent().parent().hide();
                $("#wzAverageDownsPerMagChart").parent().parent().show();
                if (redraw) {
                    wzCharts.wzAverageDownsPerMagChart.redraw();
                }
            } else {
                $("#wzAverageDownsPerMagChart").parent().parent().hide();
                $("#wzMeanDistributionTTKChart").parent().parent().show();
                if (redraw) {
                    wzCharts.wzMeanDistributionTTKChart.redraw();
                }
            }
        }
    }

    function initializeAimingControls() {
        const rateLimitedDraw = wzRateLimitFunction(draw, 50);
        $(".wzFovSwitch").click(function(){
            $(".wzFovSwitch .wz-toggle-switch__switch").toggleClass("wz-toggle-switch__switch--active")
            wzUserGameplaySettings.useAffectedFov = $(".wzFovSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active")
            rateLimitedDraw()
        })
    
        $('#wzADSRangeSlider').on('input', (function(){
            wzUserGameplaySettings.adsTargetDistanceMeters = $(this).val()
            $(".wz-distanceAdsValue").text($(this).val() + "m")
            rateLimitedDraw()
        }))
    
        $('#wzADSZoomSlider').on('input', (function(){
            wzUserGameplaySettings.adsRenderZoom = $(this).val()
            $(".wz-adsZoomValue").text($(this).val() + "x")
            rateLimitedDraw()
        }))
    
        $('#wzFovSlider').on('input', (function(){
            wzUserGameplaySettings.fov = $(this).val()
            $(".wz-fovValue").text($(this).val() + "°")
            rateLimitedDraw()
        }))
    
        $('#wzHipRangeSlider').on('input', (function(){
            wzUserGameplaySettings.hipTargetDistanceMeters = $(this).val()
            $(".wz-distanceHipfireValue").text($(this).val() + "m")
            rateLimitedDraw()
        }))
    }

    function initializeHealthControls() {
        $(".wz-health-selector-table").on("click", "td", function() {
            if($(this).attr("id") != undefined){
                if($(this).parent().hasClass("wz-hpRow")){
                    if($(this).hasClass("wz-health-selector-table--selected-hp")){
                            $(".wz-health-selector-table tr:not(.wz-hpRow)").addClass("wz-health-selector-table--inactive-hp")
                            $(".wz-health-selector-table tr:not(.wz-hpRow) td").removeClass("wz-health-selector-table--selected-hp")
                    } else {
                        $(".wz-hpRow td").removeClass("wz-health-selector-table--selected-hp")
                        $(this).addClass("wz-health-selector-table--selected-hp")
                    }
                } else {
                    $(".wz-health-selector-table tr:not(.wz-hpRow)").removeClass("wz-health-selector-table--inactive-hp")
                    $(".wz-health-selector-table tr:not(.wz-hpRow) td").removeClass("wz-health-selector-table--selected-hp")
                    $(this).parent().nextAll().addClass("wz-health-selector-table--inactive-hp")
                    $(this).parent().children('td').eq(1).addClass("wz-health-selector-table--selected-hp")
                    $($(this).parent().prevAll()).each(function( index ) {
                        if(!$(this).hasClass("wz-hpRow")){
                            $(this).children('td').eq(1).addClass("wz-health-selector-table--selected-hp")
                        }
                    })
                }

                const gameMode = $(".wz-hpRow .wz-health-selector-table--selected-hp").attr("id");
                const baseHealth = gameModeBaseHealth(gameMode);  
                const plateValue = gameModePlateHealth(gameMode);
                const plateCount =  $(".wz-health-selector-table__plate.wz-health-selector-table--selected-hp").length;
                const hp = baseHealth + plateValue * plateCount;
                const maxHp = baseHealth + plateValue * 3;
                $(".wz-hpRow td:first-child").text(`+${baseHealth} = `);
                $(".wz-health-selector-table__plate-value").text(`+${plateValue} = `);
                $("#wz-hitpoints, .wz-health-selector-table__hp-sum").text(hp);
                wzGun.setHPValues(hp, maxHp);
                wzLoadProbabilityCharts();
                wzUpdateCharts();
                wzLoadStats();
            }
        })

        function gameModeBaseHealth(mode) {
            switch (mode) {
                case "wzIronTrials":
                    return 250;
                case "wzRebirthSupreme":
                    return 200;
                case "wzTitaniumTrials":
                    return 100;
                default:
                    return 150;
            }
        }

        function gameModePlateHealth(mode) {
            switch (mode) {
                case "wzTitaniumTrials":
                    return 100;
                default:
                    return 50;
            }
        }
    }

    function initializeProbabilityControls() {
        wzLoadWeightingLabels();

        $("#wz-probability-weight-input").on("change", function () {
            const newVal = parseInt($(this).val())
            const locationChances = wzGun.bodyLocationChances;
            locationChances[wzSelectedProbLocation.replace("Left","Right")] = newVal
            locationChances[wzSelectedProbLocation.replace("Right","Left")] = newVal
            wzGun.setBodyLocationChances(locationChances);
            wzLoadWeightingLabels()
            wzLoadProbabilityCharts();
        })

        $(".wzProbViewSwitch").click(function(){
            $(".wzProbViewSwitch .wz-toggle-switch__switch").toggleClass("wz-toggle-switch__switch--active")
            wzViewWeightAsPercentage = $(".wzProbViewSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active")
            wzLoadWeightingLabels()
        })

        $('#wzProbabilityRangeSlider').on('input', (function () {
            const maxRange = $(this).attr("max");//Math.ceil(wzGetFarthestRangeOfSelectedGuns());
            const range = Math.min(parseInt($(this).val()), maxRange);
            const suffix = range == maxRange ? "m+" : "m";
            $(".wz-probabilityRangeValue").text(range + suffix);
            wzLoadProbabilityCharts();
        }))
    
        $("#wzProbabilityMissInput").on("change", function () {
            let value = parseFloat($(this).val());
            value = isNaN(value) ? 0 : value;
            value = Math.max(value, 0);
            value = Math.min(value, 75);
            $(this).val(value);
            wzGun.setMissChance(value / 100);
            wzLoadProbabilityCharts();
        })

        function wzLoadWeightingLabels() {
            const weighting = wzGun.bodyLocationChances;
            const weightSum = Object.values(weighting).reduce((a, b) => a + b);
            Object.keys(weighting).forEach((key) => {
                if(wzViewWeightAsPercentage){
                    $(".wz-probabilitiesGuy .wz-dmgLabel-" + key).text(roundToDecimal(weighting[key]/weightSum * 100, 0) +"%")
                } else {
                    $(".wz-probabilitiesGuy .wz-dmgLabel-" + key).text(weighting[key])
                }
            })
        }
    }

    function initialzeComparisonStatsControls(){
        $(".wz-stat-comparison-table__table").on("click", ".wz-stat-comparison-table__delete-row", function() {
            $(this).parent().parent().remove()
        })

        $(".wz-stat-comparison-table__table").on("click", ".wz-stat-comparison-table__reset", function() {
            wzLoadStatComparisonTable(true)
        })
    }
}

function wzInitializeCharts() {
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        },
        ...wzChartOptions.common, // set default options that are shared across all charts here
    });

    Object.entries(wzChartOptions.elementTargets).forEach(([renderToElement, chartOptions]) => {
        wzCharts[renderToElement] = Highcharts.chart(renderToElement, chartOptions);
    });

    $(".wz-chart image").removeAttr("preserveAspectRatio");
}

function wzRemoveChart() {
    Object.values(wzCharts).forEach((chart) => {
        chart.colorCounter -= 1;
        chart.symbolCounter -= 1;
    });
    wzUpdateCharts();
    wzLoadProbabilityCharts();
}

function wzUpdateCharts() {
    const farthestRange = wzGetFarthestRangeOfSelectedGuns();
    const damageRangeChartLength = Math.max(10, Math.ceil(farthestRange * 1.25 / 10) * 10);
    const str = wzSelectedLocation.replace(/([A-Z])/g, " $1");
    const hitLocation = str.charAt(0).toUpperCase() + str.slice(1);
    const isBTKShown = $(".wzBTKSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active");
    const isBVChartShown = $(".wzBulletSpeedSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active")
    const dropDistance = parseInt($("#wz-ballistics-chart-max-distance").val());

    updateTTKChart();
    updateDamageChart();
    updateBTKChart();
    wzUpdateMovementChart();
    updateBulletDropChart();
    updateBulletVelocityChart();
    return;

    function updateTTKChart() {
        const data = getHitboxChartData("ttk", wzSelectedLocation);
        const maxYValue = wzGetYMaxOfData(data)
        const chartHeight = Math.max(250, Math.ceil(maxYValue * 1.1 / 250) * 250);

        wzCharts.wzTTKChart.update({
            title: {
                text: 'Time-To-Kill (TTK) - ' + hitLocation
            },
            xAxis: {
                max: damageRangeChartLength
            },
            yAxis: {
                max: chartHeight
            },
            series: data
        }, true, true);
    }

    function updateDamageChart() {
        const data = getHitboxChartData("damage", wzSelectedLocation);
        const maxY = wzGetYMaxOfData(data);
        const chartHeight = Math.ceil(maxY * 1.07 / 50) * 50;

        wzCharts.wzDamageChart.update({
            title: {
                text: 'Damage - ' + hitLocation
            },
            xAxis: {
                max: damageRangeChartLength
            },
            yAxis: {
                max: chartHeight
            },
            series: data
        }, !isBTKShown, true);
    }

    function updateBTKChart() {
        const data = getHitboxChartData("btk", wzSelectedLocation)

        wzCharts.wzBTKChart.update({
            title: {
                text: 'Bullets-To-Kill (BTK) - ' + hitLocation
            },
            xAxis: {
                max: damageRangeChartLength
            },
            series: data
        }, isBTKShown, true);
    }

    function updateBulletDropChart() {
        const data = getChartDropData();

        wzCharts.wzBulletDropChart.update({
            xAxis: {
                max: dropDistance
            },
            series: data
        }, !isBVChartShown, true);

        return;

        function getChartDropData(){
            const bulletDropData = []
            wzSelectedGuns.forEach((gun) => {
                bulletDropData.push({
                    "name": gun.name,
                    "data": gun.weaponObject.graphs.bulletDrop
                });
            });
            return bulletDropData
        }
    }

    function updateBulletVelocityChart() {
        const data = getBulletSpeedData();
        
        wzCharts.wzBulletSpeedChart.update({
            xAxis: {
                max: dropDistance
            },
            series: data
        }, isBVChartShown, true);

        return;
        
        function getBulletSpeedData(){
            const bulletSpeedData = []
            wzSelectedGuns.forEach((gun) => {
                bulletSpeedData.push({
                    "name": gun.name,
                    "data": gun.weaponObject.graphs.bulletVelocity
                });
            });
            return bulletSpeedData
        }
    }
    
    function getHitboxChartData(graphType, hitLocation) {
        return wzSelectedGuns.map((gun) => ({
            name: gun.name,
            data: gun.weaponObject.graphs[graphType][hitLocation],
        }));
    }
}

// ToDo: Remove this once we have a wzCharts handler
function wzUpdateMovementChart() {
    const isADS = $('.wzMovementSwitch .wz-toggle-switch__switch').hasClass('wz-toggle-switch__switch--active');
    const isFiring = $('.wzFiringSwitch .wz-toggle-switch__switch').hasClass('wz-toggle-switch__switch--active');
    const data = getChartMovementSpeedData(isADS, isFiring);

    wzCharts.wzMovementChart.update({
        title: {
            text: (isADS ? 'ADS Movement Speeds' : 'Non-ADS Movement Speeds') + (isFiring ? ' While Firing' : ' While Not Firing')
        },
        xAxis: {
            categories: getMovementChartLabels(isADS),
        },
        series: data
    }, true, true);
    return;

    function getChartMovementSpeedData(isADS, isFiring){
        const gunMovementObjs = wzSelectedGuns.map((gun) => gun.weaponObject.movementSpeed(isADS, isFiring));
    
        const selectedMoves =  $(".wz-movement-chart-toggles__toggle--selected").map(function(){ return this.id }).toArray()
        const selectedGunNames = wzSelectedGuns.map(gun => gun.name)
    
        const gunMovements = gunMovementObjs.map((gun, i) => {
            const gunMovement = []
    
            if (!isADS && selectedMoves.includes("wzTacSprintToggle")){
                gunMovement.push(roundToDecimal(gunMovementObjs[i].tacsprint, 2))}
            if (!isADS && selectedMoves.includes("wzSprintToggle")){
                gunMovement.push(roundToDecimal(gunMovementObjs[i].sprint, 2))}
            if (selectedMoves.includes("wzForwardToggle")){
                gunMovement.push(roundToDecimal(gunMovementObjs[i].forward, 2))}
            if (selectedMoves.includes("wzBackpedalToggle")){
                gunMovement.push(roundToDecimal(gunMovementObjs[i].backpedal, 2))}
            if (selectedMoves.includes("wzStrafeToggle")){
                gunMovement.push(roundToDecimal(gunMovementObjs[i].strafe, 2))}
    
            return {
                name: selectedGunNames[i],
                data: gunMovement
            }
        });
    
        return gunMovements;
    }

    function getMovementChartLabels(isADS){
        var movementLabels = []
    
        const selectedMoves =  $(".wz-movement-chart-toggles__toggle--selected").map(function(){ return this.id })
    
        if(!isADS){
            $.each(selectedMoves, function (i, item){
                if (item == "wzTacSprintToggle"){
                    movementLabels.push("Tac Sprint")
                } else if (item == "wzSprintToggle"){
                    movementLabels.push("Sprint")
                } else if (item == "wzForwardToggle"){
                    movementLabels.push("Forward")
                } else if (item == "wzBackpedalToggle"){
                    movementLabels.push("Backpedal")
                } else if (item == "wzStrafeToggle"){
                    movementLabels.push("Strafe")
                }
            })
        } else {
            $.each(selectedMoves, function (i, item){
                if (item == "wzForwardToggle"){
                    movementLabels.push("Forward")
                } else if (item == "wzBackpedalToggle"){
                    movementLabels.push("Backpedal")
                } else if (item == "wzStrafeToggle"){
                    movementLabels.push("Strafe")
                }
            })
        }
    
        return movementLabels
    }
}

function wzRateLimitFunction(fn, ms) {
    let timer = 0
    return function(...args) {
      clearTimeout(timer)
      timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
}

//This function is called whenever each individual weapon finishes loading its probability data
//Guns which have not finished loading will be charted as an empty placeholder set named "loading"
//It's also called when health or weighting is changed, to update everything to "loading..." if things are slow
function wzLoadProbabilityCharts() {
    //Prevent extremely rapid redrawing of charts using timeout
    clearTimeout(wzProbabilityChartRedrawTimer);
    wzProbabilityChartRedrawTimer = setTimeout(()=>{
        loadProbabilityChart();
        loadTTKMeanDistributionChart();
        loadAverageDownsPerMagChart();
    }, 20);
    return;

    function loadProbabilityChart() {
        const rangeMeters = $('#wzProbabilityRangeSlider').val();
        const data = getProbabilityChartData(rangeMeters / 0.0254);
        const maxTTK = getMaxTTK(data);
        const chartLength = Math.max(250, Math.ceil(maxTTK * 1.1 / 250) * 250);

        wzCharts.wzProbabilityChart.update({
            title: {
                text: 'Probability Of Achieving TTK at ' + rangeMeters.toString() + 'm'
            },
            xAxis: {
                max: chartLength != 0 ? chartLength : wzCharts.wzProbabilityChart.xAxis[0].max
            },
            series: data
        }, true, true);
        return;

        //Get data if gun is loaded, otherwise return empty set titled "loading"
        function getProbabilityChartData(rangeInches) {
            return wzSelectedGuns.map((gun) => {
                const index = gun.weaponObject.indexForRange(rangeInches);
                const data = gun.weaponObject.probabilityGraphs.probabilitiesPerRange?.[index]?.slice();
                return {
                    name: data ? gun.name : "Loading...",
                    data: data ?? [[0, 0]]
                };
            });
        }

        function getMaxTTK(probabilityChartData) {
            return probabilityChartData.reduce((maxTTK, series) => {
                const finalTTK = series.data[series.data.length - 1][0];
                return Math.max(maxTTK, finalTTK);
            }, 0);
        }
    }

    function loadTTKMeanDistributionChart() {
        const data = getTTKMeanDistributionChartData();
        const farthestRange = wzGetFarthestRangeOfSelectedGuns();
        const chartLength = Math.max(10, Math.ceil(farthestRange * 1.25 / 10) * 10);
        const maxYValue = wzGetYMaxOfData(data)
        const chartHeight = Math.max(250, Math.ceil(maxYValue * 1.1 / 250) * 250);
        const rangeMeters = $('#wzProbabilityRangeSlider').val();
        const isAverageDownsPerMagChartShown = $(".wzTTKDPMSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active");

        wzCharts.wzMeanDistributionTTKChart.update({
            xAxis: {
                max: chartLength,
                plotLines: [{
                    value: rangeMeters,
                    color: "#F0F0F0",
                    width: 2,
                    id: 'range'
                }]
            },
            yAxis: {
                max: chartHeight != 0 ? chartHeight : wzCharts.wzProbabilityChart.yAxis[0].max
            },
            series: data
        }, !isAverageDownsPerMagChartShown, true);
        return;

        function getTTKMeanDistributionChartData() {
            return wzSelectedGuns.map((gun) => {
                const data = gun.weaponObject.probabilityGraphs.ttkMeanDistribution;
                return {
                    name: data ? gun.name : "Loading...",
                    data: data ?? [[0, 0]]
                };
            });
        }
    }

    function loadAverageDownsPerMagChart() {
        const data = getAverageDownsPerMagData();
        const farthestRange = wzGetFarthestRangeOfSelectedGuns();
        const chartLength = Math.max(10, Math.ceil(farthestRange * 1.25 / 10) * 10);
        const rangeMeters = $('#wzProbabilityRangeSlider').val();
        const isAverageDownsPerMagChartShown = $(".wzTTKDPMSwitch .wz-toggle-switch__switch").hasClass("wz-toggle-switch__switch--active");

        wzCharts.wzAverageDownsPerMagChart.update({
            xAxis: {
                max: chartLength,
                plotLines: [{
                    value: rangeMeters,
                    color: "#F0F0F0",
                    width: 2,
                    id: 'range'
                }]
            },
            series: data
        }, isAverageDownsPerMagChartShown, true);
        return;

        function getAverageDownsPerMagData() {
            return wzSelectedGuns.map((gun) => {
                const data = gun.weaponObject.probabilityGraphs.averageDownsPerMag;
                return {
                    name: data ? gun.name : "Loading...",
                    data: data ?? [[0, 0]]
                };
            });
        }
    }
}

function wzGetFarthestRangeOfSelectedGuns() {
    let farthest = 0;
    wzSelectedGuns.forEach((gun) => {
        const rangeBreakpoints = gun.weaponObject.rangeBreakpoints
        farthest = Math.max(farthest, rangeBreakpoints[rangeBreakpoints.length - 1] * 0.0254);
    });
    return farthest;
}

function wzGetYMaxOfData(data) {
    return data.reduce((previous, series) => {
        const yMaxInLine = series.data.reduce((prev, point) => {
            return Math.max(prev, point[1]);
        }, Number.MIN_VALUE);
        return  Math.max(previous, yMaxInLine);
    }, Number.MIN_VALUE);
}

function wzParseUrlCode(urlCode) {
    const version = urlCode.charAt(0);
    switch (version) {
        case "3":
            const splitString = urlCode.split(wzUrlDelimeter)
            const oldGunId = parseInt(splitString[0].substring(2), 36).toString();
            const newGunId = Object.keys(WarzoneData).find(gunId => WarzoneData[gunId].BaseWeapon == oldGunId);
            splitString.shift();
            const oldAttachmentIds = splitString.map(radix36Attachment => {
                return parseInt(radix36Attachment, 36).toString();
            }).sort();
            const newAttachmentIds = oldAttachmentIds.map((attachmentId) => {
                return Object.keys(WarzoneData[newGunId].WeaponBases[oldGunId].SelectableAttachments).find(key => WarzoneData[newGunId].WeaponBases[oldGunId].SelectableAttachments[key].name == attachmentId);
            }).filter(x => x);
            return [{
                gunId: newGunId,
                attachmentIds: newAttachmentIds
            }];
        case "4":
            let test = urlCode.substring(2).split(wzUrlDelimeter).map(code => {
                const split = code.match(/.{1,2}/g);
                const gunId = parseInt(split[0], 36).toString();
                split.shift();
                const attachmentIds = split.map(radix36Attachment => {
                    return parseInt(radix36Attachment, 36).toString();
                }).sort();
                return {
                    gunId: gunId,
                    attachmentIds: attachmentIds
                };
            })
            return test;
    }
}