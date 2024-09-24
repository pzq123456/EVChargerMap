// import L from './src/leaflet/LeafletWithGlobals.js';

import { initDom } from './utils.js';
import { baseMapInfos } from './baseMaps.js';
import { initCanvasLayer } from './canvaslayer.js';
import { getBaseMap } from './utils.js';

initDom(document.getElementById('map')); // set the map size to the screen size

let map = L.map('map').setView([37.8, -96], 4);

let baseMaps = getBaseMap(baseMapInfos);
let layerControl = L.control.layers(baseMaps).addTo(map);
baseMaps["dark_all"].addTo(map);
initCanvasLayer();

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

const canvasLayer = L.canvasLayer(customPopupRenderer);
layerControl.addOverlay(canvasLayer, 'Canvas Layer');
canvasLayer.addTo(map);
console.log(canvasLayer._data);

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