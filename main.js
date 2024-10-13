// import L from './src/leaflet/LeafletWithGlobals.js';
import { initGeoJsonLayer } from "./geojsonlayer.js";
import { initDom } from './utils.js';
import { baseMapInfos } from './baseMaps.js';
import { initCanvasLayer } from './canvaslayer.js';
import { getBaseMap } from './utils.js';

// components
import {CountrySwitcher} from "./components/country-switcher.js";

// 注册 Web Component
customElements.define('country-switcher', CountrySwitcher);
const switcher = document.querySelector('country-switcher');

function cn(){
    // 切换视角 leaflet 动画效果

    map.flyTo([35, 105], 4, {
        duration: 2,
        easeLinearity: 0.5,
        animate: true
    });

    // map.setView([35, 105], 4);
    // 获取 CSV 和 GeoJSON 数据并进行处理
    Promise.all([
        fetch('data/cn/count.csv')
            .then(response => response.text())
            .then(csvData => new Promise((resolve, reject) => {
                Papa.parse(csvData, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    worker: true,
                    complete: (results) => resolve(results.data),
                    error: (error) => reject(error)
                });
            })),
        fetch('data/GEOJSON/cn_province.geojson')
            .then(response => response.json())
    ])
    .then(([csvData, geoJsonData]) => {
        // 将 CSV 数据合并进 GeoJSON 数据
        const updatedGeoJson = addColumn2GeoJson(geoJsonData, csvData);
        // console.log(updatedGeoJson);
        // 更新或渲染 GeoJSON 图层
        geoJsonLayer.updateData(updatedGeoJson);
        geoJsonLayer.updateInfoUpdate(cn_infoUpdate);
    })
    .catch(error => {
        console.error('获取数据或处理出错:', error);
    });
}

function us(){
    // 切换视角
    map.flyTo([37.8, -96], 4, {
        duration: 2,
        easeLinearity: 0.5,
        animate: true
    });

    Promise.allSettled([
        fetch('data/us_states.json').then(response => response.json()),
        fetch('data/USApoints.csv').then(response => response.text())
    ])
    .then(results => {
        // 处理结果
        const geoJsonResult = results[0];
        const csvResult = results[1];
    
        if (geoJsonResult.status === 'fulfilled') {
            geoJsonLayer.updateData(geoJsonResult.value);
        } else {
            console.error('获取 GeoJSON 数据失败:', geoJsonResult.reason);
        }
    
        if (csvResult.status === 'fulfilled') {
            Papa.parse(csvResult.value, {
                header: true, // 如果 CSV 有表头，设置为 true
                dynamicTyping: true, // 自动将数字和布尔值转换为对应类型
                skipEmptyLines: true, // 跳过空行
                worker: true, // 使用 Web Worker 处理 CSV
    
                chunk: function(results, parser) {
                    canvasLayer.appendData(results.data, (d) => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
                },
            });
        } else {
            console.error('获取 CSV 数据失败:', csvResult.reason);
        }
    })
    .catch(error => {
        console.error('总体请求出错:', error);
    });
}

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



const infoUpdate = function (props, data) {
    const contents = props ? `<b>${props.name}</b><br />${props.count} charging stations` : 'Hover over a state';
    this._div.innerHTML = `<h4>US EV Charging Stations</h4>${contents}`;
}

const cn_infoUpdate = function (props, data) {
    const contents = props ? `<b>${props.pr_name}</b><br />${props.count} charging stations` : 'Hover over a state';
    this._div.innerHTML = `<h4>US EV Charging Stations</h4>${contents}`;
}

const geoJsonLayer = L.geoJsonLayer(infoUpdate);
const canvasLayer = L.canvasLayer(customPopupRenderer);
layerControl.addOverlay(geoJsonLayer, 'State Station Count');
layerControl.addOverlay(canvasLayer, 'Charging Stations');

layerControl.expand();
geoJsonLayer.addTo(map);
canvasLayer.addTo(map);

switcher.setCountries([
    {
        name: 'USA',
        callback: us
    },
    {
        name: 'China',
        callback: cn
    },
    {
        name: 'Europe',
        // callback: () => { alert('切换到欧洲'); }
    },
]);

// 简单的前缀匹配或字符匹配算法
function cn_match(feature, data, minMatchLength = 2) {
    // console.log(feature, data);
    const target = feature.pr_name;
    let matchedIndex = -1;

    // 遍历数据列表
    for (let i = 0; i < data.length; i++) {
        const state = data[i].State;
        // console.log(data[i]);

        // 1. 前缀匹配
        if (state.startsWith(target.slice(0, minMatchLength))) {
            matchedIndex = i;
            break; // 找到前缀匹配，直接返回
        }

        // 2. 字符匹配
        let matchCount = 0;
        for (let j = 0; j < state.length; j++) {
            if (target.includes(state[j])) {
                matchCount++;
            }
            if (matchCount >= minMatchLength) {
                matchedIndex = i;
                break; // 一旦达到最小匹配字符数，退出遍历
            }
        }
        if (matchedIndex !== -1) break; // 如果已经找到匹配的，退出主循环
    }

    return data[matchedIndex].count;
}

function addColumn2GeoJson(geoJson, data, match_fn = cn_match, columnName = "count") {
    let updatedGeoJson = JSON.parse(JSON.stringify(geoJson));
    updatedGeoJson.features.forEach((feature, index) => {
        const matchedValue = match_fn(feature.properties, data);
        feature.properties[columnName] = matchedValue;
    });
    return updatedGeoJson;
}
