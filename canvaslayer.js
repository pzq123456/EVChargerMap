export function initCanvasLayer() {
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
            this._map.on('mousemove', this._onMouseMove, this); // 监听鼠标移动事件

            this._map.on('click', this._onClick, this); // 添加点击事件

            // 保存所有数据点坐标
            this._data = [];

            this._originalData = null;

            this._hoveredPoint = null;

            // 绘制初始图形
            this._resetCanvas();
        },

        _customPopupRenderer(info){
            return `<div>
                <h3>Info</h3>
                <p>Latitude: ${info[0]}</p>
                <p>Longitude: ${info[1]}</p>
            </div>`;
        },

        setData(data, getLatLng = function (d) { return d; }) {
            this._data = data.map(getLatLng);
            this._originalData = data;
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
                    maxHeight: 200, // 最大高度
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
            this._map.off('moveend', this._resetCanvas, this);
            this._map.off('mousemove', this._onMouseMove, this);
        },

        // 重绘 Canvas，当地图平移或缩放时调用
        _resetCanvas: function () {
            var topLeft = this._map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(this._canvas, topLeft);

            // 清空当前的 Canvas
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

            // 调用自定义的绘制逻辑
            this._drawCanvas();
        },

        // 在 Canvas 上绘制自定义内容
        _drawCanvas: function () {

            // 绘制每个数据点
            for (var i = 0; i < this._data.length; i++) {
                var latLng = this._data[i];
                var point = this._map.latLngToContainerPoint(latLng);

                // 默认绘制红色点
                this._ctx.beginPath();
                this._ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
                this._ctx.fillStyle = 'rgba(255,0,0,0.8)';
                this._ctx.fill();
            }

            // 如果有鼠标悬停的点，绘制为蓝色高亮
            if (this._hoveredPoint) {
                this._ctx.beginPath();
                this._ctx.arc(this._hoveredPoint.x, this._hoveredPoint.y, 20, 0, 2 * Math.PI, false);
                this._ctx.fillStyle = 'rgba(0,0,255,0.8)'; // 蓝色高亮
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
            var latLng = this._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
            var point = this._map.latLngToContainerPoint(latLng);
            // console.log(point);

            // 查找最近的数据点
            // var closestPoint = this._findClosestPoint(point);
            // let closestPoint = this._findClosestPoint(point).point;
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
        // return new L.CanvasLayer().extend({
        //     _customPopupRenderer: customPopupRenderer
        // });

        let canvasLayer = new L.CanvasLayer();
        canvasLayer._customPopupRenderer = customPopupRenderer;
        return canvasLayer;
    };
}
