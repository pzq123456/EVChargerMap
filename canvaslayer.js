export function initCanvasLayer() {

    L.CanvasLayer = L.Layer.extend({
        initialize: function () {
            this._data = [];
            this._originalData = [];
        },
        
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
            this._map.on('mousemove', this._onMouseMove, this); // 监听鼠标移动事件
            this._map.on('zoom', this._onZoom, this); // 监听缩放事件
            this._map.on('click', this._onClick, this); // 添加点击事件

            this._hoveredPoint = null;

            // 绘制初始图形
            this._resetCanvas();
        },

        _onZoom: function () {
            this._resetCanvas();
        },

        _customPopupRenderer(info){
            return `<div>
                ${info.toString()}
            </div>`;
        },

        _resetData(){
            this._data = [];
            this._originalData = [];
        },

        setData(data, getLatLng = function (d) { return d; }) {
            this._data = data.map(getLatLng);
            this._originalData = data;
            this._resetCanvas();
        },

        // 追加数据
        appendData(data, getLatLng = function (d) { return d; }) {
            this._data = this._data.concat(data.map(getLatLng));
            this._originalData = this._originalData.concat(data);
            this._resetCanvas();
        },

        // 点击事件处理函数
        _onClick: function (e) {
            if (this._hoveredPoint) {
                let latLng = this._data[this._hoveredPointIndex];
                // 获取悬停点的经纬度
                let info = this._originalData[this._hoveredPointIndex];

                // 创建并弹出 Popup，显示经纬度信息
                let popup = L.popup({
                    maxWidth: 500, // 最大宽度
                    minWidth: 150, // 最小宽度
                    // maxHeight: 200, // 最大高度
                    autoPan: true, // 自动平移以确保 Popup 完全显示在视口内
                    autoPanPaddingTopLeft: L.point(10, 10), // 设置弹窗上方和左侧的平移边距
                    autoPanPaddingBottomRight: L.point(10, 10), // 设置弹窗下方和右侧的平移边距
                    className: 'custom-popup' // 添加自定义类名
                })
                    .setLatLng(latLng) // 设置 Popup 的经纬度坐标
                    .openOn(this._map);
                
                // 自定义 Popup 的内容
                popup.setContent(this._customPopupRenderer(info));
            }
        },

        // 在移除图层时调用
        onRemove: function (map) {
            // 移除 Canvas 元素
            L.DomUtil.remove(this._canvas);
            
            // 移除事件监听
            this._map.off('mousemove', this._onMouseMove, this);
            this._map.off('zoom', this._onZoom, this);
            this._map.off('click', this._onClick, this);
        },

        // 重绘 Canvas，当地图平移或缩放时调用
        _resetCanvas: function () {
            if(this._map){
                var topLeft = this._map.containerPointToLayerPoint([0, 0]);
                L.DomUtil.setPosition(this._canvas, topLeft);
                // 清空当前的 Canvas
                this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

                // 调用自定义的绘制逻辑
                this._drawCanvas();
            }

        },

        // 在 Canvas 上绘制自定义内容
        _drawCanvas: function () {
            let radius; // 半径随着缩放级别变化
            let zoom = this._map.getZoom();

            // 根据缩放级别动态调整半径
            if (zoom <= 6) {
                radius = 1;
            } else if (zoom <= 10) {
                radius = 2;
            }
            else if (zoom <= 12) {
                radius = 3;
            }
            else if (zoom <= 14) {
                radius = 4;
            }
            else {
                radius = 6;
            }


            // 并行绘制所有数据点
            this._data.forEach((latLng, index) => {
                let point = this._map.latLngToContainerPoint(latLng);

                // 默认绘制红色点
                this._ctx.beginPath();
                this._ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
                // 亮黄色
                this._ctx.fillStyle = "rgba(255, 255, 255)";
                this._ctx.fill();
            });

            // 如果有鼠标悬停的点，绘制为蓝色高亮
            if (this._hoveredPoint) {
                this._ctx.beginPath();
                this._ctx.arc(this._hoveredPoint.x, this._hoveredPoint.y, radius + 5, 0, 2 * Math.PI, false);
                this._ctx.strokeStyle = 'yellow';
                this._ctx.lineWidth = 5;
                // 虚线
                this._ctx.setLineDash([5, 5]);
                this._ctx.stroke();

                // fill style
                this._ctx.fillStyle = 'rgba(0,0,0,0.4)';
                this._ctx.fill();
            }
        },

        // 查找最近的数据点
        _findClosestPoint: function (point) {
            let minDistance = Infinity;
            let closestPoint = null;
            let index = -1;

            for (let i = 0; i < this._data.length; i++) {
                let latLng = this._data[i];
                let candidate = this._map.latLngToContainerPoint(latLng);
                let distance = this._distanceBetweenPoints(point, candidate);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = candidate;
                    index = i;
                }
            }

            return { index, point: closestPoint };
        },

        // 鼠标移动事件处理函数
        _onMouseMove: function (e) {
            // 判断鼠标左键是否按下
            if (e.originalEvent.buttons !== 0) {
                return;
            }
            var latLng = this._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
            var point = this._map.latLngToContainerPoint(latLng);

            let { index, point: closestPoint } = this._findClosestPoint(point);

            // 如果最近的点距离小于 10 像素，高亮显示
            if (closestPoint && this._distanceBetweenPoints(point, closestPoint) < 10) {
                this._hoveredPoint = closestPoint;
                this._hoveredPointIndex = index;
            } else {
                this._hoveredPoint = null;
            }

            // 重绘 Canvas
            this._resetCanvas();
        },

        // 计算两点之间的距离
        _distanceBetweenPoints: function (point1, point2) {
            var dx = point1.x - point2.x;
            var dy = point1.y - point2.y;
            return Math.sqrt(dx * dx + dy * dy);
        },

        
    });

    // set options
    L.canvasLayer = function (customPopupRenderer) {
        let canvasLayer = new L.CanvasLayer();
        canvasLayer._customPopupRenderer = customPopupRenderer;
        return canvasLayer;
    };
}