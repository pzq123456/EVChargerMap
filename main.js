import * as L from './src/leaflet/Leaflet.js';

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// add marker
var marker = L.marker([51.5, -0.09]).addTo(map);
marker.bindPopup("<b>Hello world!</b><br>I am a popup.");

// get current viewCenter and zoom level
console.log(map.getCenter());
console.log(map.getZoom());
// get the latlngBounds of the current view
console.log(map.getBounds());
