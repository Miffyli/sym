// noinspection SpellCheckingInspection
const BURST_PATTERN_DATA = './pages/apex/recoil_patterns/default_recoil_pattern_data.json';
const columnNames = {"x": "X", "y": "TotalY"};
let BlastPatternData = [];
let figure;
// noinspection SpellCheckingInspection
let img_scale = 0;
let scale_dist = ["20", "25", "30", "35", "40", "45", "50", "10", "15"];
let scale_height = [5.301750881, 4.240855681, 3.533799815, 3.028843865, 2.650166041, 2.355659067, 2.120064786, 10.61489335, 7.070965863];
const template_figure = {"hoverinfo": "none",
    "hovertemplate": "",
    "legendgroup": -1,
    // "marker": {"size": 6, "color": "rgb(200, 0, 200)"},
    "meta": columnNames,
    "mode": "markers",
    "name": "Alternator_Points",
    "showlegend": false,
    "stackgroup": null,
    "type": "scatter",
    "visible": "legendonly",
    "x": [],
    "xsrc": "weapon_name_x",
    "y": [],
    "error_x": {
        "meta": {
            "columnNames": {
                "array": "Size"
            }
        },
        "type": "data",
        "visible": true,
        "arraysrc": "elementofprgress:3:bbf2e4",
        "array": [],
        "symmetric": true,
        "thickness": 1
    },
    "error_y": {
        "meta": {
            "columnNames": {
                "array": "Size"
            }
        },
        "type": "data",
        "visible": true,
        "arraysrc": "elementofprgress:3:bbf2e4",
        "array": [],
        "symmetric": true,
        "thickness": 1
    },
    "ysrc": "weapon_name_y"
};

function apex_initializeRecoilPage() {

    // Weapon select buttons
    let apex_showHideRecoilTargetCheckboxes_input = $("#apex_showHideRecoilTargetCheckboxes input");
    apex_showHideRecoilTargetCheckboxes_input.checkboxradio(
        {icon:false}
    );
    apex_showHideRecoilTargetCheckboxes_input.change(function(){
        apex_updateRecoilChartImage();
    });

    figure = get_figure();
    window.PLOTLYENV={'BASE_URL': 'https://plot.ly'};

    const gd = document.getElementById('recoil_graph');
    // noinspection JSUnusedLocalSymbols
    const resizeDebounce = null;

    // noinspection JSUnusedLocalSymbols
    // function resizePlot() {
    //     const bb = gd.getBoundingClientRect();
    //     // noinspection JSUnresolvedVariable,JSUnresolvedFunction,ES6ModulesDependencies,ES6ModulesDependencies,JSIgnoredPromiseFromCall
    //     Plotly.relayout(gd, {
    //         data: figure.data,
    //         width: bb.width,
    //         height: bb.height
    //     });
    // }


    // noinspection JSUnresolvedVariable,JSUnresolvedFunction,SpellCheckingInspection,ES6ModulesDependencies,ES6ModulesDependencies
    Plotly.plot(gd,  {
        data: figure.data,
        layout: figure.layout,
        frames: figure.frames,
        config: {"showLink": true, "linkText": "Export to plot.ly", "mapboxAccessToken": "pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiY2lxMnVvdm5iMDA4dnhsbTQ5aHJzcGs0MyJ9.X9o_rzNLNesDxdra4neC_A"}
    });

    gd.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    replaceData();
    addNewCopyOfData();
    $.getJSON(BURST_PATTERN_DATA).done(addShotgunBurstPattern).fail(function (jqxhr, textStatus, error) {
        console.log('Loading Shotgun blast pattern data failed: ' + textStatus + ' , ' + error)
    });
}

function replaceData(){
    let weaponsWithViewKick = APEXWeaponData.filter(
        weapon_viewkick => weapon_viewkick["WeaponData"]["viewkick_pattern"] !== undefined
    ).map(
        weapon_viewkick => weapon_viewkick["WeaponData"]
    );
    weaponsWithViewKick.sort(function(a, b) {
        let nameA = a['custom_name_short'].toUpperCase(); // ignore upper and lowercase
        let nameB = b['custom_name_short'].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });
    let x_values;
    let y_values;
    let size_values;
    let error_x_values;
    let error_y_values;
    let bullet_count;
    let viewkickdataXYS;
    for (let i = 0; i < weaponsWithViewKick.length; i++) {
        viewkickdataXYS = weaponsWithViewKick[i]['viewkick_pattern_data'];
        bullet_count = Object.keys(viewkickdataXYS).length - 2;
        x_values = [0.0];
        y_values = [0.0];
        size_values = [0.0];
        error_x_values = ["0.0"];
        error_y_values = ["0.0"];
        let total_y = 0.0;
        let total_x = 0.0;
        figure.data[i].error_x = {};
        figure.data[i].error_y = {};
        figure.data[i].error_y.meta = template_figure.error_y.meta;
        figure.data[i].error_y.type = template_figure.error_y.type;
        figure.data[i].error_y.visible = template_figure.error_y.visible;
        figure.data[i].error_y.arraysrc = template_figure.error_y.arraysrc;
        figure.data[i].error_y.array = template_figure.error_y.array;
        figure.data[i].error_y.symmetric = template_figure.error_y.symmetric;
        figure.data[i].error_y.thickness = template_figure.error_y.thickness;
        figure.data[i].error_x.meta = template_figure.error_x.meta;
        figure.data[i].error_x.type = template_figure.error_x.type;
        figure.data[i].error_x.visible = template_figure.error_x.visible;
        figure.data[i].error_x.arraysrc = template_figure.error_x.arraysrc;
        figure.data[i].error_x.array = template_figure.error_x.array;
        figure.data[i].error_x.symmetric = template_figure.error_x.symmetric;
        figure.data[i].error_x.thickness = template_figure.error_x.thickness;
        for (let j = 0; j < bullet_count; j++) {
            const data_points = viewkickdataXYS['bullet_' + j].split(" ");

            total_x += parseFloat(data_points[0]) * -1;
            total_y += parseFloat(data_points[1]) * -1;
            x_values.push(total_x);
            y_values.push(total_y);
            size_values.push(data_points[2]);
            error_x_values.push(data_points[2]);
            error_y_values.push(data_points[3].toString());
        }
        figure.data[i].x = x_values;
        figure.data[i].y = y_values;
        figure.data[i].marker.size = size_values;
        figure.data[i].marker.color = size_values;
        figure.data[i].size = size_values;
        figure.data[i]['marker']['sizeref'] = 0.00625;
        figure.data[i].error_x['array'] = error_x_values;
        figure.data[i].error_y['array'] = error_y_values;
        figure.data[i].name = weaponsWithViewKick[i]['custom_name_short'];
    }


}
function addNewCopyOfData() {
    // const gd = document.getElementById('recoil_graph');
    const figure_count = figure.data.length;
    for (let i = 0; i < figure_count; i++) {
        // console.log("I ", i, " name: ", figure.data[i].name);
        const data_index = figure.data.length;
        const mod = figure.data[i];
        const line_color = mod.line.color;
        const new_data = {};
        for (const [key, value] of Object.entries(template_figure)) {
            new_data[key] = value;
        }
        new_data.marker = {};
        new_data.marker["size"] = 6;
        new_data.marker["color"] = line_color;
        new_data.marker['sizeref'] = 0.01;
        new_data.name = mod.name+" Trace";
        new_data.x = mod.x;
        new_data.y = mod.y;
        new_data.xsrc = new_data.name+"_x";
        new_data.ysrc = new_data.name+"_y";
        // new_data.meta = figure.data[i].meta;
        new_data.mode = "markers";
        // new_data.marker = figure.data[i].marker;
        // new_data.marker.color = line_color;
        new_data.hoverinfo = "none";
        new_data.hovertemplate = "";
        new_data.legendgroup = i;
        new_data.line = {};
        figure.data[i].legendgroup = i;
        figure.data[data_index] = new_data;
    }
}

function addShotgunBurstPattern( data ) {
    BlastPatternData = data.data;

    const gd = document.getElementById('recoil_graph');
    const figure_count = figure.data.length;
    for (let i = 0; i < BlastPatternData.length; i++) {
        let new_data_count_id = figure_count + i;
        figure.data[new_data_count_id] = {};
        for (const [key, value] of Object.entries(BlastPatternData[i])) {
            figure.data[new_data_count_id][key] = value;
        }
        if (BlastPatternData[i]['name'].includes("Charge Rifle")) {
            figure.data[new_data_count_id]['legendgroup'] = 666;
        }
        figure.data[new_data_count_id]['name'] = BlastPatternData[i]['name'];
        figure.data[new_data_count_id]['marker'] = BlastPatternData[i]['marker'];

    }

    let bb = gd.getBoundingClientRect();
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction,ES6ModulesDependencies,ES6ModulesDependencies,JSIgnoredPromiseFromCall
    Plotly.relayout(gd, {
        data: figure.data,
        width: bb.width,
        height: bb.height
    });
}

// function getRndInteger(min, max) {
//     return (Math.floor(Math.random() * (max - min + 1) ) + min) / 5;
// }

function calculate_img_scale(){
    img_scale = img_scale + 1;
    if (img_scale >= 9) {
        img_scale = 0;
    }
    return (scale_height[img_scale] / 10.0)/2;
}


function apex_updateRecoilChartImage(){
    const graphDiv = document.getElementById('recoil_graph');
    let img_size = calculate_img_scale();
    let update = {
        images: [
            {
                "x": 0.50333, "y": 0, "layer": "below", "sizex": img_size, "sizey": img_size,
                "xanchor": "center",
                "yanchor": "bottom"
            }

        ],
        annotations: [
            {
            "x": -1.3,
            "y": 4,
            "ax": -154,
            "ay": -303,
            "text": "Dist:"+ scale_dist[img_scale] +"m<br>"
        }
        ],
    };
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction,ES6ModulesDependencies,ES6ModulesDependencies,JSIgnoredPromiseFromCall
    Plotly.relayout(graphDiv, update);
}
