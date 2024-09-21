import * as L from './src/leaflet/Leaflet.js';

init(document.getElementById('map'));

let map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// add marker
let marker = L.marker([51.5, -0.09]).addTo(map);
marker.bindPopup("<b>Hello world!</b><br>I am a popup.");

// get current viewCenter and zoom level
console.log(map.getCenter());
console.log(map.getZoom());
// get the latlngBounds of the current view
console.log(map.getBounds());

// 获取屏幕宽高
function getScreenSize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    return { width, height };
}

// 设置某一个元素的宽高
function setElementSize(element, width, height) {
    element.style.width = width + 'px';
    element.style.height = height + 'px';
}

function init(element) {
    let { width, height } = getScreenSize();
    let margin = 20;
    setElementSize(element, width - margin, height - margin);
}
