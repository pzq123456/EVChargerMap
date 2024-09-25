// import L from './src/leaflet/LeafletWithGlobals.js';
import { initGeoJsonLayer } from "./geojsonlayer.js";
import { initDom } from './utils.js';
import { baseMapInfos } from './baseMaps.js';
import { initCanvasLayer } from './canvaslayer.js';
import { getBaseMap } from './utils.js';

initDom(document.getElementById('map')); // set the map size to the screen size

let map = L.map('map',
    {
        renderer: L.canvas(),
    }
).setView([37.8, -96], 4);

let baseMaps = getBaseMap(baseMapInfos);
let layerControl = L.control.layers(baseMaps).addTo(map);
baseMaps["dark_all"].addTo(map);

initCanvasLayer();
initGeoJsonLayer();

function customPopupRenderer(info){
    // ID,City,State,Station Name,Latitude,Longitude
    return `<div>
        <h3>Info</h3>
        <p>Latitude: ${info.Latitude}</p>
        <p>Longitude: ${info.Longitude}</p>
        <p>City: ${info.City}</p>
        <p>State: ${info.State}</p>
        <p>Station Name: ${info["Station Name"]}</p>
    </div>`;
}

const mybreaks = [0, 1010, 2005, 3000, 3995, 4990, 5985, 6980, 7976, 8971, 9966, 10961, 11956, 12951, 13946, 14941, 15937]

const mycolors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b', '#003d19', '#003617', '#003015', '#002b13', '#002611', '#00200f', '#001b0d', '#00160b']

const infoUpdate = function (props) {
    const contents = props ? `<b>${props.name}</b><br />${props.count} charging stations` : 'Hover over a state';
    this._div.innerHTML = `<h4>US EV Charging Stations</h4>${contents}`;
}

const geoJsonLayer = L.geoJsonLayer(statesData, mybreaks, mycolors, infoUpdate);
const canvasLayer = L.canvasLayer(customPopupRenderer);
layerControl.addOverlay(geoJsonLayer, 'GeoJson Layer');
layerControl.addOverlay(canvasLayer, 'Canvas Layer');

geoJsonLayer.addTo(map);
canvasLayer.addTo(map);



// 获取 CSV 文件并解析为数组
fetch('data/USApoints.csv')
    .then(response => response.text())
    .then(csvData => {
        Papa.parse(csvData, {
            header: true, // 如果 CSV 有表头，设置为 true
            dynamicTyping: true, // 自动将数字和布尔值转换为对应类型
            skipEmptyLines: true, // 跳过空行
            worker: true, // 使用 Web Worker 处理 CSV

            chunk: function(results, parser) {
                canvasLayer.appendData(results.data, (d) => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
            },
        });
    })
    .catch(error => {
        console.error('获取或解析 CSV 文件出错:', error);
});