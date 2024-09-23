// import L from './src/leaflet/LeafletWithGlobals.js';

import { initDom } from './utils.js';
import { baseMapInfos } from './baseMaps.js';
import { initCanvasLayer } from './canvaslayer.js';

initDom(document.getElementById('map')); // set the map size to the screen size
// 设置为米国

let map = L.map('map').setView([37.8, -96], 4);

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
canvasLayer.addTo(map);
layerControl.addOverlay(canvasLayer, 'Canvas Layer');

// let rpoints = randomPointsWithProperties([51.5, -0.09], 0.1, 100);
// console.log(rpoints);
// canvasLayer.setData(rpoints, (d) => [d[0], d[1]]);
// canvasLayer.appendData(rpoints, (d) => [d[0], d[1]]);

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
                // 每次解析完一块数据后的回调
                // console.log("解析完一块数据:", results.data);
                // console.log("解析进度:", parser.progress); // 这是解析进度
                // console.log("解析是否完成:", results.data[0].Latitude); // 这是是否解析完成
                // let points = results.data.map(d => [d.Latitude, d.Longitude, d]);
                canvasLayer.appendData(results.data, (d) => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
            },
            // complete: function(results) {
            //     console.log("所有数据已处理:", results.data); // 这是全部数据处理完之后的回调
            // }
        });
    })
    .catch(error => {
        console.error('获取或解析 CSV 文件出错:', error);
    });

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


