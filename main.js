// import L from './src/leaflet/LeafletWithGlobals.js';
import { initGeoJsonLayer } from "./geojsonlayer.js";
// import { initDom } from './utils.js';
import { baseMapInfos } from './baseMaps.js';
import { initCanvasLayer } from './canvaslayer.js';
import { getBaseMap } from './utils.js';

// components
import {CountrySwitcher} from "./components/country-switcher.js";

import {interpolateColors} from "./color.js";

initCanvasLayer();
initGeoJsonLayer();
// cache
let cache = {};

const colorsets = [
    ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'], // blue
    ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'], // blue-green
    ['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#006837','#004529'], // green
    ['#f7f4f9','#e7e1ef','#d4b9da','#c994c7','#df65b0','#e7298a','#ce1256','#980043','#67001f'], // red
    ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'], // purple
    ['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704'], // orange
    ['#fff7f3','#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a'], // pink
];

// 注册 Web Component
customElements.define('country-switcher', CountrySwitcher);
const switcher = document.querySelector('country-switcher');

function flayTo(name){
    switch (name) {
        case 'USA':
            map.flyTo([37.8, -96], 4, {
                duration: 2,
                easeLinearity: 0.5,
                animate: true
            });
            break;
        case 'China':
            map.flyTo([35, 105], 4, {
                duration: 2,
                easeLinearity: 0.5,
                animate: true
            });
            break;
        case 'Europe':
            map.flyTo([50, 10], 4, {
                duration: 2,
                easeLinearity: 0.5,
                animate: true
            });
            break;
        case 'global':
            map.flyTo([0, 0], 2, {
                duration: 2,
                easeLinearity: 0.5,
                animate: true
            });
            break;
    }
}

function cn() {
    const animationDuration = 2000; // 动画时长 2 秒（以毫秒为单位）

    // 切换视角 leaflet 动画效果
    map.flyTo([35, 105], 4, {
        duration: animationDuration / 1000, // 传入秒
        easeLinearity: 0.5,
        animate: true
    });

    // 获取 CSV 和 GeoJSON 数据并进行处理
    const dataFetchPromise = Promise.all([
        fetch('data/cn_count.csv')
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
        fetch('data/GeoJSON/cn_province.geojson').then(response => response.json()),
    ])
    .then(([csvData, geoJsonData, gridData]) => {
        // 创建 Worker 实例
        const worker = new Worker('workers/cngeojson.js');

        return new Promise((resolve, reject) => {
            // 向 Worker 发送 GeoJSON 和 CSV 数据
            worker.postMessage({ geoJsonData, csvData });

            // 当 Worker 任务完成时接收数据
            worker.onmessage = function (e) {
                const updatedGeoJson = e.data;
                // 终止 Worker
                worker.terminate();
                
                // 解析成功，返回结果
                resolve(updatedGeoJson);
            };

            // 捕获 Worker 错误
            worker.onerror = function (error) {
                worker.terminate();
                reject(error);
            };
        });

    });

    // 创建一个动画时长的 Promise
    const animationPromise = new Promise(resolve => {
        setTimeout(() => {
            resolve('动画完成');
        }, animationDuration);
    });

    // 使用 Promise.race 来决定何时更新数据
    Promise.all([dataFetchPromise, animationPromise, fetch('data/cn_grid.json').then(response => response.json())])
        .then(([updatedGeoJson, _, gridData]) => {
            // 更新或渲染 GeoJSON 图层，确保动画结束后执行
            geoJsonLayer.updateData(updatedGeoJson);
            canvasLayer.appendGridJSON(gridData);

            if(!cache.cn){
                cache.cn = updatedGeoJson;
            }

            // geoJsonLayer.updateInfoUpdate(cn_infoUpdate);
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
        fetch('data/GeoJSON/us_states.json').then(response => response.json()),
        fetch('data/USApoints.csv').then(response => response.text()),
    ])
    .then(results => {
        // 处理结果
        const geoJsonResult = results[0];
        const csvResult = results[1];
    
        if (geoJsonResult.status === 'fulfilled') {
            geoJsonLayer.updateData(geoJsonResult.value);
            cache.us = geoJsonResult.value;
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

function eu(){
    const animationDuration = 2000; // 动画时长 2 秒（以毫秒为单位）

    map.flyTo([50, 10], 4, {
        duration: animationDuration / 1000, // 传入秒
        easeLinearity: 0.5,
        animate: true
    });

    // 获取 CSV 和 GeoJSON 数据并进行处理
    const dataFetchPromise = Promise.all([
        fetch('data/eu_count.csv')
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
        fetch('data/GeoJSON/europe.geojson')
            .then(response => response.json())
        ])
        .then(([csvData, geoJsonData]) => {
            // 创建 Worker 实例
            const worker = new Worker('workers/eugeojson.js');

            return new Promise((resolve, reject) => {
                // 向 Worker 发送 GeoJSON 和 CSV 数据
                worker.postMessage({ geoJsonData, csvData });

                // 当 Worker 任务完成时接收数据
                worker.onmessage = function (e) {
                    const updatedGeoJson = e.data;
                    // 终止 Worker
                    worker.terminate();
                    
                    // 解析成功，返回结果
                    resolve(updatedGeoJson);
                };

                // 捕获 Worker 错误
                worker.onerror = function (error) {
                    worker.terminate();
                    reject(error);
                };
            });
        });

    // 创建一个动画时长的 Promise
    const animationPromise = new Promise(resolve => {
        setTimeout(() => {
            resolve('动画完成');
        }, animationDuration);
    });

    // 使用 Promise
    Promise.all([dataFetchPromise, animationPromise, fetch('data/eu_grid.json').then(response => response.json())])
        .then(([updatedGeoJson, _, gridData]) => {
            // 更新或渲染 GeoJSON 图层，确保动画结束后执行
            geoJsonLayer.updateData(updatedGeoJson);
            canvasLayer.appendGridJSON(gridData);

            // cache.eu = updatedGeoJson;
            if(!cache.eu){
                cache.eu = updatedGeoJson;
            }
        })
        .catch(error => {
            console.error('获取数据或处理出错:', error);
        });
}

// initDom(document.getElementById('map')); // set the map size to the screen size

let map = L.map('map',
    {
        renderer: L.canvas(),
        attributionControl: false // 禁用归属信息
    }
).setView([37.8, -96], 4);

let baseMaps = getBaseMap(baseMapInfos);
let layerControl = L.control.layers(baseMaps).addTo(map);
baseMaps["dark_all"].addTo(map);

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

const geoJsonLayer = L.geoJsonLayer(infoUpdate);
const canvasLayer = L.canvasLayer(customPopupRenderer);
const C_geoJsonLayer = L.geoJsonLayer(C_infoUpdate);
const D_geoJsonLayer = L.geoJsonLayer(D_infoUpdate);

const C_Colors = interpolateColors("#ebc8d2", "#ff0000", 16);
C_geoJsonLayer.setColors(C_Colors);

const D_Colors = colorsets[1];
D_geoJsonLayer.setColors(D_Colors);

layerControl.addOverlay(geoJsonLayer, 'State Station Count');
layerControl.addOverlay(canvasLayer, 'Charging Stations');
layerControl.addOverlay(C_geoJsonLayer, 'Population Density');
layerControl.addOverlay(D_geoJsonLayer, 'Housing Price Index');

D_geoJsonLayer.addTo(map);
// C_geoJsonLayer.addTo(map);
// geoJsonLayer.addTo(map);

function C_us(){
    flayTo('USA');
    if(cache.c_us){
        C_geoJsonLayer.updateData(cache.c_us, (d) => parseFloat(d.properties.V));
        return;
    }
    fetch('data/GeoJSON/C/C_us_sim.geojson')
        .then(response => response.json())
        .then(geoJsonData => {
            // C_geoJsonLayer.addTo(map);
            C_geoJsonLayer.updateData(geoJsonData, (d) => parseFloat(d.properties.V));
            // C_geoJsonLayer.appendData(geoJsonData, (d) => parseFloat(d.properties.V));
            if(!cache.c_us){
                cache.c_us = geoJsonData;
            }

        })
        .catch(error => {
            console.error('获取数据出错:', error);
        });
}

// C_cn();

function C_cn(){
    flayTo('China');
    if(cache.c_cn){
        C_geoJsonLayer.updateData(cache.c_cn, (d) => parseFloat(d.properties.V));
        return;
    }
    fetch('data/GeoJSON/C/C_cn_sim.geojson')
        .then(response => response.json())
        .then(geoJsonData => {
            // C_geoJsonLayer.addTo(map);
            C_geoJsonLayer.updateData(geoJsonData, (d) => parseFloat(d.properties.V));
            // C_geoJsonLayer.appendData(geoJsonData, (d) => parseFloat(d.properties.V));


            if(!cache.c_cn){
                cache.c_cn = geoJsonData;
            }
        })
        .catch(error => {
            console.error('获取数据出错:', error);
        });
}

// C_eu();

function C_eu(){
    flayTo('Europe');
    if(cache.c_eu){
        C_geoJsonLayer.updateData(cache.c_eu, (d) => parseFloat(d.properties.V));
        return;
    }

    fetch('data/GeoJSON/C/C_eu_sim.geojson')
        .then(response => 
            {
                return response.json();
            }
        )
        .then(geoJsonData => {

            C_geoJsonLayer.updateData(geoJsonData, (d) => parseFloat(d.properties.V));
            // C_geoJsonLayer.appendData(geoJsonData, (d) => parseFloat(d.properties.V));


            if(!cache.c_eu){
                cache.c_eu = geoJsonData;
            }
        })
        .catch(error => {
            console.error('获取数据出错:', error);
        });
}

function C_infoUpdate(props, data) {
    const contents = props ? `<b>${props.NAME_1}-${props.NAME_2}</b><br />${props.V} (density)` : 'Hover over a state';
    this._div.innerHTML = `<h4>population density</h4>${contents}`;
}
// dataprocess\output\D\us.geojson
function D_us(){
    flayTo('USA');
    if(cache.d_us){
        D_geoJsonLayer.updateData(cache.d_us, (d) => parseFloat(d.properties["mean_1500buffer-city"]));
        return;
    }
    fetch('dataprocess/output/D/us.geojson')
        .then(response => response.json())
        .then(geoJsonData => {
            D_geoJsonLayer.updateData(geoJsonData, (d) => parseFloat(d.properties["mean_1500buffer-city"]));
            if(!cache.d_us){
                cache.d_us = geoJsonData;
            }

        })
        .catch(error => {
            console.error('获取数据出错:', error);
        });
}

function D_cn(){
    flayTo('China');
    if(cache.d_cn){
        D_geoJsonLayer.updateData(cache.d_cn, (d) => parseFloat(d.properties["mean_1500buffer-city"]));
        return;
    }
    fetch('dataprocess/output/D/cn.geojson')
        .then(response => response.json())
        .then(geoJsonData => {
            D_geoJsonLayer.updateData(geoJsonData, (d) => parseFloat(d.properties["mean_1500buffer-city"]));
            if(!cache.d_cn){
                cache.d_cn = geoJsonData;
            }

        })
        .catch(error => {
            console.error('获取数据出错:', error);
        });
}

function D_infoUpdate(props, data) {
    const contents = props ? `<b>${props.NAME_1}-${props.NAME_2}</b><br />${props["mean_1500buffer-city"]}` : 'Hover over a state';
    this._div.innerHTML = `<h4>Housing Price Index</h4>${contents}`;
}

switcher.setCountries([
    {
        name: 'USA',

        callback: () => {
            // us();
            // C_us();
            D_us();
        }
    },
    {
        name: 'China',

        callback: () => {
            // cn();
            // C_cn();
            // C_cn
            D_cn();
        }
    },
    {
        name: 'Europe',

        // callback: () => {
        //     // eu();
        //     // C_eu();
        // }
    },
    {
        name: 'global',
        callback: () => {
            map.flyTo([0, 0], 2, {
                duration: 2,
                easeLinearity: 0.5,
                animate: true
            });

            // geoJsonLayer.clear();

            if (cache.cn) {
                geoJsonLayer.appendData(cache.cn);
            }

            if (cache.us) {
                geoJsonLayer.appendData(cache.us);
            }

            if (cache.eu) {
                geoJsonLayer.appendData(cache.eu);
            }

            // C_geoJsonLayer.clear();

            if (cache.c_us) {
                C_geoJsonLayer.appendData(cache.c_us, (d) => parseFloat(d.properties.V));
            }

            if (cache.c_cn) {
                C_geoJsonLayer.appendData(cache.c_cn, (d) => parseFloat(d.properties.V));
            }

            if (cache.c_eu) {
                C_geoJsonLayer.appendData(cache.c_eu, (d) => parseFloat(d.properties.V));
            }

            // D_geoJsonLayer.clear();
            if (cache.d_us) {
                D_geoJsonLayer.appendData(cache.d_us, (d) => parseFloat(d.properties["mean_1500buffer-city"]));
            }

            if (cache.d_cn) {
                D_geoJsonLayer.appendData(cache.d_cn, (d) => parseFloat(d.properties["mean_1500buffer-city"]));
            }



        }
    }
]);

closeLoadingBar();

function closeLoadingBar(){
    document.getElementById("loading-bar").style.display = "none";
}

function openLoadingBar(){
    document.getElementById("loading-bar").style.display = "block";
}