import L from './src/leaflet/LeafletWithGlobals.js';

import { init } from './utils.js';
import { baseMapInfos } from './baseMaps.js';

import { MarkerClusterGroup } from './src/markercluster/MarkerClusterGroup.js';

init(document.getElementById('map'));

let map = L.map('map',{
    // renderer: L.canvas(),
}).setView([51.505, -0.09], 13);

let baseMaps = getBaseMap(baseMapInfos);
let layerControl = L.control.layers(baseMaps).addTo(map);
baseMaps["OSM"].addTo(map);

// add marker
// let marker = L.marker([51.5, -0.09]).addTo(map);
// marker.bindPopup("<b>Hello world!</b><br>I am a popup.");

let rmakers = getRandomMarkers([51.5, -0.09], 0.5, 100);

// var markers = MarkerClusterGroup();
// markers.addLayer(L.marker(getRandomLatLng(map)));
// ... Add more layers ...
// map.addLayer(markers);

let markers = new MarkerClusterGroup();
markers.addLayers(rmakers);
map.addLayer(markers);

function getBaseMap(baseMapInfos){
    let baseMaps = {};
    for(let item of baseMapInfos){
        baseMaps[item.name] = L.tileLayer(item.url+item.style+'/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: item.attribution
        });
    }
    return baseMaps;
}

function randomPoint(center, radius){
    let x0 = center[0];
    let y0 = center[1];
    let rd = Math.random() * radius;
    let theta = Math.random() * 2 * Math.PI;
    let x = x0 + rd * Math.cos(theta);
    let y = y0 + rd * Math.sin(theta);
    return [x, y];
}

function randomPoints(center, radius, num){
    let points = [];
    for(let i=0; i<num; i++){
        points.push(randomPoint(center, radius));
    }
    return points;
}

function getRandomMarkers(center, radius, num){
    let points = randomPoints(center, radius, num);
    let markers = [];
    for(let point of points){
        markers.push(L.marker(point).bindPopup("<b>"+point+"</b>"));
    }
    return markers;
}
// get current viewCenter and zoom level
// console.log(map.getCenter());
// console.log(map.getZoom());
// get the latlngBounds of the current view
// console.log(map.getBounds());

