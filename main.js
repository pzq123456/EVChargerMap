// import L from './src/leaflet/LeafletWithGlobals.js';

import { initDom } from './utils.js';
import { baseMapInfos } from './baseMaps.js';
import { initCanvasLayer } from './canvaslayer.js';

initDom(document.getElementById('map')); // set the map size to the screen size

let map = L.map('map',{
    // renderer: L.canvas(),
}).setView([51.505, -0.09], 13);

let baseMaps = getBaseMap(baseMapInfos);
let layerControl = L.control.layers(baseMaps).addTo(map);
baseMaps["OSM"].addTo(map);

initCanvasLayer();
function popupRenderer(info){
    return `<div>
        <h3>Info</h3>
        <p>Latitude: ${info[0]}</p>
        <p>Longitude: ${info[1]}</p>
        <p>Value: ${info[2].value}</p>
    </div>`;
}
function customPopupRenderer(info){
    return `<div>
        <h3>Info</h3>
        <p>Latitude: ${info[0]}</p>
        <p>Longitude: ${info[1]}</p>
        <p>Value: ${info[2].value}</p>
    </div>`;
}

const canvasLayer = L.canvasLayer(customPopupRenderer);
// add to the layerControl
layerControl.addOverlay(canvasLayer, "Canvas Layer");
map.addLayer(canvasLayer);

let rpoints = randomPointsWithProperties([51.5, -0.09], 0.1, 1000);
console.log(rpoints);
canvasLayer.setData(rpoints, (d) => [d[0], d[1]]);

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

function randomPointsWithProperties(center, radius, num){
    let points = [];
    for(let i=0; i<num; i++){
        let point = randomPoint(center, radius);
        
        point.push({
            "lat": point[0],
            "lng": point[1],
            "value": Math.random() * 100
        });

        points.push(point);
    }

    return points;
}

function randomPoints(center, radius, num){
    let points = [];
    for(let i=0; i<num; i++){
        points.push(randomPoint(center, radius));
    }
    return points;
}


// get current viewCenter and zoom level
// console.log(map.getCenter());
// console.log(map.getZoom());
// get the latlngBounds of the current view
// console.log(map.getBounds());

