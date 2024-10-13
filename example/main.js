import {CountrySwitcher} from "../components/country-switcher.js";
// 注册 Web Component
customElements.define('country-switcher', CountrySwitcher);

const switcher = document.querySelector('country-switcher');

switcher.setChinaCallback(() => {
    alert('用户点击了中国');
});

switcher.setUSCallback(() => {
    alert('用户点击了美国');
});

switcher.setEUCallback(() => {
    alert('用户点击了欧洲');
});
