import L from './src/leaflet/LeafletWithGlobals.js';
// import { MarkerClusterGroup } from './src/markercluster/index.js';

import { init } from './utils.js';
import { baseMapInfos } from './baseMaps.js';

init(document.getElementById('map'));
// console.log(L.Util)

let map = L.map('map',{
    // renderer: L.canvas(),
}).setView([51.505, -0.09], 13);

let baseMaps = getBaseMap(baseMapInfos);
let layerControl = L.control.layers(baseMaps).addTo(map);
baseMaps["OSM"].addTo(map);

// let rmakers = getRandomMarkers([51.5, -0.09], 0.5, 10); // 10000 markers 就会卡死
// // // use markerClusterGroup to handle large amount of markers
// let markerClusterGroup = L.markerClusterGroup();
// markerClusterGroup.addLayers(rmakers);
// map.addLayer(markerClusterGroup);


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

L.CanvasLayer = L.Layer.extend({
    // 在添加图层到地图时调用
    onAdd: function (map) {
      this._map = map;
  
      // 创建 Canvas 元素
      this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer');
      var size = this._map.getSize();
      this._canvas.width = size.x;
      this._canvas.height = size.y;
  
      // 获取 Canvas 渲染上下文
      this._ctx = this._canvas.getContext('2d');
  
      // 把 Canvas 元素添加到地图的 overlayPane
      var overlayPane = this._map.getPane('overlayPane');
      overlayPane.appendChild(this._canvas);
  
      // 监听地图的视图变化事件（缩放、平移）
      this._map.on('moveend', this._resetCanvas, this);
  
      // 绘制初始图形
      this._resetCanvas();
    },
  
    // 在移除图层时调用
    onRemove: function (map) {
      // 移除 Canvas 元素
      L.DomUtil.remove(this._canvas);
      this._map.off('moveend', this._resetCanvas, this);
    },
  
    // 重绘 Canvas，当地图平移或缩放时调用
    _resetCanvas: function () {
      var topLeft = this._map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(this._canvas, topLeft);
  
      // 重置 Canvas 尺寸
      var size = this._map.getSize();
      this._canvas.width = size.x;
      this._canvas.height = size.y;
  
      // 清空当前的 Canvas
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  
      // 调用自定义的绘制逻辑
      this._drawCanvas();
    },
  
    // 在 Canvas 上绘制自定义内容
    _drawCanvas: function () {
      var bounds = this._map.getBounds();
      var zoom = this._map.getZoom();
  
      // 示例：绘制一组数据点
      var dataPoints = this._getDataPoints();
      for (var i = 0; i < dataPoints.length; i++) {
        var latLng = dataPoints[i];
        var point = this._map.latLngToContainerPoint(latLng);
  
        // 绘制点
        this._ctx.beginPath();
        this._ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
        this._ctx.fillStyle = 'rgba(255,0,0,0.8)';
        this._ctx.fill();
      }
    },
  
    // 模拟获取一组数据点
    _getDataPoints: function () {
        // get random points
        let points = randomPoints([51.5, -0.09], 0.5, 10); // canvas 绘制 100000 个点也不会卡死
        return points.map((point) => {
            return L.latLng(point[0], point[1]);
        });
    }
  });
  
  
// 创建并添加自定义 Canvas 图层
var canvasLayer = new L.CanvasLayer();
map.addLayer(canvasLayer);

// var point = map.latLngToContainerPoint(L.latLng(51.505, -0.09));
// ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
// ctx.fillStyle = 'rgba(255,0,0,0.8)';
// ctx.fill();

// 监听地图的 moveend 事件，重绘 Canvas

map.on('moveend', function() {
    requestAnimationFrame(function() {
        canvasLayer._resetCanvas();
    });
});
  