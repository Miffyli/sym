// noinspection SpellCheckingInspection
const BURST_PATTERN_DATA = './pages/apex/recoil_patterns/default_recoil_pattern_data.json';
const columnNames = {"x": "X", "y": "TotalY"};
let BlastPatternData = [];

// noinspection SpellCheckingInspection
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
    "visible": true,
    "x": [],
    "xsrc": "weapon_name_x",
    "y": [],
    "ysrc": "weapon_name_y"
};

function apex_initializeRecoilPage() {
    window.PLOTLYENV={'BASE_URL': 'https://plot.ly'};

    const gd = document.getElementById('1abf0259-75e8-47b9-96f9-6e32ec35bc8d');
    // noinspection JSUnusedLocalSymbols
    const resizeDebounce = null;

    // noinspection JSUnusedLocalSymbols
    function resizePlot() {
        const bb = gd.getBoundingClientRect();
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        Plotly.relayout(gd, {
            data: figure.data,
            width: bb.width,
            height: bb.height
        });
    }


    // noinspection JSUnresolvedVariable,JSUnresolvedFunction,SpellCheckingInspection
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
    // addShotgunBurstPattern();
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

        // names must be equal
        return 0;
    });
    console.log(weaponsWithViewKick);
    let x_vals;
    let y_vals;
    let size_vals;
    let bullet_count;
    let viewkickdataXYS;
    for (let i = 0; i < weaponsWithViewKick.length; i++) {
        viewkickdataXYS = weaponsWithViewKick[i]['viewkick_pattern_data'];
        // Object.keys(weaponsWithViewKick[0]['viewkick_pattern_data']).length-3
        bullet_count = Object.keys(viewkickdataXYS).length - 2;
        x_vals = [0.0];
        y_vals = [0.0];
        // y_vals2 = [0.0];
        size_vals = [0.0];
        let total_y = 0.0;
        let total_x = 0.0;
        for (let j = 0; j < bullet_count; j++) {
            const data_points = viewkickdataXYS['bullet_' + j].split(" ");

            total_x += parseFloat(data_points[0]) * -1;
            total_y += parseFloat(data_points[1]) * -1;
            x_vals.push(total_x);
            y_vals.push(total_y);
            size_vals.push(data_points[2]);
        }
        figure.data[i].x = x_vals;
        figure.data[i].y = y_vals;
        figure.data[i].size = size_vals;
        // figure.data[i].x = x_vals;
        figure.data[i].name = weaponsWithViewKick[i]['custom_name_short'];
        console.log(weaponsWithViewKick[i]['custom_name_short'] + ", X:" + figure.data[i].x + ", Y:" + figure.data[i].y + ", Size: " + figure.data[i].size);

    }
    console.log("DONE");


}
function addNewCopyOfData() {
    const gd = document.getElementById('1abf0259-75e8-47b9-96f9-6e32ec35bc8d');
    const figure_count = figure.data.length;
    for (let i = 0; i < figure_count; i++) {
        console.log("I ", i, " name: ", figure.data[i].name);
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
    let bb = gd.getBoundingClientRect();
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction
    Plotly.relayout(gd, {
        data: figure.data,
        width: bb.width,
        height: bb.height
    });
}

function addShotgunBurstPattern( data ) {
    BlastPatternData = data.data;
    const gd = document.getElementById('1abf0259-75e8-47b9-96f9-6e32ec35bc8d');
    const figure_count = figure.data.length;
    // const new_data = new Object();
    for (let i = 0; i < BlastPatternData.length; i++) {
        let new_data_count_id = figure_count + i;
        figure.data[new_data_count_id] = {};
        for (const [key, value] of Object.entries(BlastPatternData[i])) {
            figure.data[new_data_count_id][key] = value;
        }
        figure.data[new_data_count_id]['legendgroup'] = figure_count + i;
        figure.data[new_data_count_id]['name'] = BlastPatternData[i]['name'];
        figure.data[new_data_count_id]['marker'] = BlastPatternData[i]['marker'];

    }

    let bb = gd.getBoundingClientRect();
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction
    Plotly.relayout(gd, {
        data: figure.data,
        width: bb.width,
        height: bb.height
    });
}

