const columnNames = {"x": "X", "y": "TotalY"};

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

    var gd = document.getElementById('1abf0259-75e8-47b9-96f9-6e32ec35bc8d')
    var resizeDebounce = null;

    function resizePlot() {
        var bb = gd.getBoundingClientRect();
        Plotly.relayout(gd, {
            data: figure.data,
            width: bb.width,
            height: bb.height
        });
    }




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
    replacedata();
    addNewCopyofData();
}

function replacedata(){
    var weaponswithViewkick = APEXWeaponData.filter(
        weapon_viewkick => weapon_viewkick["WeaponData"]["viewkick_pattern"] != undefined
    ).map(
        weapon_viewkick => weapon_viewkick["WeaponData"]
    );
    weaponswithViewkick.sort();
    console.log(weaponswithViewkick);
    for (var i = 0; i < weaponswithViewkick.length; i++) {
        viewkickdataXYS = weaponswithViewkick[i]['viewkick_pattern_data'];
        // Object.keys(weaponswithViewkick[0]['viewkick_pattern_data']).length-3
        bullet_count = Object.keys(viewkickdataXYS).length-2;
        x_vals = [0.0];
        y_vals = [0.0];
        // y_vals2 = [0.0];
        size_vals = [0.0];
        let total_y = 0.0;
        let total_x = 0.0;
        for (var j = 0; j < bullet_count; j++) {
            var data_points = viewkickdataXYS['bullet_'+j].split(" ");

            total_x += parseFloat(data_points[0]* -1);
            total_y += parseFloat(data_points[1]* -1);
            x_vals.push(total_x);
            y_vals.push(total_y);
            size_vals.push(data_points[2]);
        }
        // y_vals.forEach(function(element) {
        //     // element = element * -1;
        //     y_vals2.push(element);
        //     // console.log(element);
        // });
        figure.data[i].x = x_vals;
        figure.data[i].y = y_vals;
        figure.data[i].size = size_vals;
        // figure.data[i].x = x_vals;
        figure.data[i].name = weaponswithViewkick[i]['custom_name'];
        console.log(weaponswithViewkick[i]['custom_name'] + ", X:" + figure.data[i].x + ", Y:" + figure.data[i].y + ", Size: " + figure.data[i].size );

    }
    console.log("DONE");


}
function addNewCopyofData() {
    var gd = document.getElementById('1abf0259-75e8-47b9-96f9-6e32ec35bc8d')
    var figure_count = figure.data.length;
    for (var i = 0; i < figure_count; i++) {
        console.log("I ", i, " name: ", figure.data[i].name);
        var data_index = figure.data.length;
        var mod = figure.data[i];
        var line_color = mod.line.color;
        var new_data = {};
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
    var bb = gd.getBoundingClientRect();
    Plotly.relayout(gd, {
        data: figure.data,
        width: bb.width,
        height: bb.height
    });



}