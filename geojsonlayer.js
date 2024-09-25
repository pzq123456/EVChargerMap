export function initGeoJsonLayer() { // 这一步只是 向L注册了一个新的类，但是并没有实例化

    L.GeoJsonLayer = L.Layer.extend({
        initialize: function (data, grades, colors, infoUpdate) {
            this._data = data;
            this._grades = grades;
            this._colors = colors;
            this._infoUpdate = infoUpdate;
        },

        _getColor: function (d) {
            for (let i = 0; i < this._grades.length; i++) {
                if (d <= this._grades[i]) {
                    return this._colors[i];
                }
            }
        },

        _style: function (feature) {
            return {
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7,
                fillColor: this._getColor(feature.properties.count)
            };
        },

        onAdd: function (map) {
            this._map = map;

            this._createInfo(this._infoUpdate);
            this._createLegend();
            this._info.addTo(this._map);


            this._geoJson = L.geoJson(this._data, {
                style: this._style.bind(this),
                onEachFeature: this._onEachFeature.bind(this)
            });

            // set onEachFeature
            this._geoJson.addTo(this._map);
            // console.log(this._info)
            this._legend.addTo(this._map);
        },

        onRemove: function () {
            console.log('remove')
            this._map.removeLayer(this._geoJson);
            this._map.removeControl(this._info);
            this._map.removeControl(this._legend);
        },

        _onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: this._highlightFeature.bind(this),
                mouseout: this._resetHighlight.bind(this),
                click: this._zoomToFeature.bind(this)
            });
        },

        _highlightFeature: function (e) {
            const layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });

            layer.bringToFront();
            // console.log(this._info)
            this._info.update(layer.feature.properties);
        },

        _resetHighlight: function (e) {
            this._geoJson.resetStyle(e.target);
            this._info.update();
        },

        _zoomToFeature: function (e) {
            this._map.fitBounds(e.target.getBounds());
        },

        _createInfo: function (infoUpdate = this._infoUpdate) {
            const info = L.control();

            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            }

            info.update = function (props) {
                this._infoUpdate(props);
            }

            info.update = infoUpdate.bind(info);

            // console.log(info.update)

            this._info = info;
            // info.onAdd = function (map) {
            //     this._div = L.DomUtil.create('div', 'info');
            //     this.update();
            //     return this._div;
            // };

            // info.update = function (props) {
            //     const contents = props ? `<b>${props.name}</b><br />${props.count} charging stations` : 'Hover over a state';
            //     this._div.innerHTML = `<h4>US EV Charging Stations</h4>${contents}`;
            // };
        },

        _createLegend: function () {
            this._legend = L.control({position: 'bottomright'});

            this._legend.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                const labels = [];
                let from, to;

                for (let i = 0; i < this._grades.length; i++) {
                    from = this._grades[i];
                    to = this._grades[i + 1];

                    labels.push(`<i style="background:${this._colors[i]}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
                }

                div.innerHTML = labels.join('<br>');
                return div;
            }.bind(this);
        }

    });

    L.geoJsonLayer = function (data, grades, colors, infoUpdate) {
        return new L.GeoJsonLayer(data, grades, colors, infoUpdate);
    }
}

// // test code
// const map = L.map('map').setView([37.8, -96], 4); // center of US

// const mybreaks = [0, 1010, 2005, 3000, 3995, 4990, 5985, 6980, 7976, 8971, 9966, 10961, 11956, 12951, 13946, 14941, 15937]

// const mycolors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b', '#003d19', '#003617', '#003015', '#002b13', '#002611', '#00200f', '#001b0d', '#00160b']

// const infoUpdate = function (props) {
//     const contents = props ? `<b>${props.name}</b><br />${props.count} charging stations` : 'Hover over a state';
//     this._div.innerHTML = `<h4>US EV Charging Stations</h4>${contents}`;
// }

// initGeoJsonLayer();
// const geoJsonLayer = L.geoJsonLayer(statesData, mybreaks, mycolors, infoUpdate);
// geoJsonLayer.addTo(map);


// const map = L.map('map').setView([37.8, -96], 4); // center of US

// // control that shows state info on hover
// const info = L.control();

// info.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'info');
//     this.update();
//     return this._div;
// };

// info.update = function (props) {
//     const contents = props ? `<b>${props.name}</b><br />${props.count} charging stations` : 'Hover over a state';
//     this._div.innerHTML = `<h4>US EV Charging Stations</h4>${contents}`;
// };

// info.addTo(map);

// const mybreaks = [0, 1010, 2005, 3000, 3995, 4990, 5985, 6980, 7976, 8971, 9966, 10961, 11956, 12951, 13946, 14941, 15937]
// const mycolors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b', '#003d19', '#003617', '#003015', '#002b13', '#002611', '#00200f', '#001b0d', '#00160b']
// // get color depending on population density value
// function getColor(d, breaks = mybreaks, colors = mycolors) {
//     for (let i = 0; i < breaks.length; i++) {
//         if (d <= breaks[i]) {
//             return colors[i];
//         }
//     }
// }

// function style(feature) {
//     return {
//         weight: 2,
//         opacity: 1,
//         color: 'white',
//         dashArray: '3',
//         fillOpacity: 0.7,
//         fillColor: getColor(feature.properties.count)
//     };
// }

// function highlightFeature(e) {
//     const layer = e.target;

//     layer.setStyle({
//         weight: 5,
//         color: '#666',
//         dashArray: '',
//         fillOpacity: 0.7
//     });

//     layer.bringToFront();

//     info.update(layer.feature.properties);
// }

// /* global statesData */
// const geojson = L.geoJson(statesData, {
//     style,
//     onEachFeature
// }).addTo(map);

// function resetHighlight(e) {
//     geojson.resetStyle(e.target);
//     info.update();
// }

// function zoomToFeature(e) {
//     map.fitBounds(e.target.getBounds());
// }

// function onEachFeature(feature, layer) {
//     layer.on({
//         mouseover: highlightFeature,
//         mouseout: resetHighlight,
//         click: zoomToFeature
//     });
// }

// const legend = L.control({position: 'bottomright'});

// legend.onAdd = function (map) {

//     const div = L.DomUtil.create('div', 'info legend');
//     const grades = [0, 2005, 3995, 5985, 7976, 9966, 11956, 13946, 15937];
//     const labels = [];
//     let from, to;

//     for (let i = 0; i < grades.length; i++) {
//         from = grades[i];
//         to = grades[i + 1];

//         labels.push(`<i style="background:${getColor(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
//     }

//     div.innerHTML = labels.join('<br>');
//     return div;
// };

// legend.addTo(map);