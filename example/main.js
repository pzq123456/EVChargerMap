import { initGeoJsonLayer } from "../geojsonlayer.js";
const map = L.map('map',{
    renderer: L.canvas()
}).setView([37.8, -96], 4);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const mybreaks = [0, 1010, 2005, 3000, 3995, 4990, 5985, 6980, 7976, 8971, 9966, 10961, 11956, 12951, 13946, 14941, 15937]

const mycolors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b', '#003d19', '#003617', '#003015', '#002b13', '#002611', '#00200f', '#001b0d', '#00160b']

const infoUpdate = function (props) {
    const contents = props ? `<b>${props.name}</b><br />${props.count} charging stations` : 'Hover over a state';
    this._div.innerHTML = `<h4>US EV Charging Stations</h4>${contents}`;
}

initGeoJsonLayer();
const geoJsonLayer = L.geoJsonLayer(statesData, mybreaks, mycolors, infoUpdate);
geoJsonLayer.addTo(map);