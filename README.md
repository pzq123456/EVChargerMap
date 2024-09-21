# EVChargerMap

## 充电桩空间分布地图
1. 充电桩点状空间分布
2. 指标空间单元分布，最好可以分级呈现（国家、省级、市），点开查看细节
3. 政策坐在城市层级（次要）
4. 数据筛选分类（功率、交流电）

## 数据结构
1. 充电站 ：市，省/州，国家，充电枪数目，充电接口类型

```js
charger: GeoJSON

lat : ,
lon : ,

properties
{
    id: 1,
    power : ,
    attribute : ,
    name : 
}

```

## 需要保留的字段
ID,
City,
State,
Station Name,
Latitude,
Longitude,

https://observablehq.com
## 底图
- https://github.com/CartoDB/basemap-styles
## plugin
- https://github.com/joker-x/Leaflet.geoCSV
- https://github.com/Leaflet/Leaflet.markercluster/tree/master
- https://github.com/robertleeplummerjr/Leaflet.glify
- https://blog.sumbera.com/2014/06/08/leaflet-webgl-many-points-rendering/
## References
- https://www.cnblogs.com/wangsongbai/p/13444667.html