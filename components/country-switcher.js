export class CountrySwitcher extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
                /* Slider Container */
                .slider-container {
                    width: 100%;
                    max-width: 500px;
                    margin: 50px auto;
                    position: relative;
                }

                /* Slider Track */
                .slider {
                    height: 6px;
                    background: #ddd; /* 灰色背景增加对比度 */
                    position: absolute;
                    top: 50px;
                    left: 0;
                    z-index: 1;
                    width: 100%;
                    border-radius: 3px; /* 圆角处理，增加柔和感 */
                }

                /* Slider Button */
                .slider-button {
                    background: #007bff; /* 主题蓝色 */
                    height: 4px;
                    width: 14px;
                    position: absolute;
                    transition: left 0.3s ease;
                    z-index: 2;
                    border: 2px solid #fff; /* 白色边框增加按钮清晰度 */
                }

                /* Country Buttons Container */
                .country-buttons {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    z-index: 3;
                    margin-top: 20px;
                    border-radius: 5px;
                }

                /* Country Buttons */
                .country-buttons button {
                    padding: 10px 15px;
                    cursor: pointer;
                    border: 1px solid #007bff; /* 边框采用主题蓝色 */
                    background-color: white;
                    color: #007bff; /* 文字颜色采用主题蓝色 */
                    border-radius: 5px;
                    transition: background-color 0.3s ease, transform 0.3s ease;
                }

                /* Active Button */
                .country-buttons button.active {
                    background-color: #1e90ff;
                    color: white;
                    border-color: #1e90ff;
                }

                /* Disabled Button */
                .country-buttons button.disabled {
                    background-color: #555;
                    color: #999;
                    cursor: not-allowed;
                }

                /* Hover Effect */
                .country-buttons button:hover:not(.disabled) {
                    background-color: #007bff; /* 鼠标悬停时，按钮变为主题蓝色 */
                    color: white; /* 文字颜色变为白色 */
                    transform: translateY(-2px); /* 轻微上移，增加动感 */
                }


            </style>
            <div class="slider-container">
                <div class="slider">
                    <div class="slider-button" id="slider"></div>
                </div>
                <div class="country-buttons" id="buttons-container"></div>
            </div>
        `;

        this.callbacks = {};
        this.countries = [];
        this.slider = this.shadowRoot.getElementById('slider');
        this.buttonsContainer = this.shadowRoot.getElementById('buttons-container');
    }

    // 动态设置国家和对应的回调
    setCountries(countryList) {
        this.countries = countryList;
        this.renderButtons();
        this.updateButtonStates();
    }

    getCurrentCountry() {
        const activeButton = this.shadowRoot.querySelector('.country-buttons button.active');
        return activeButton?.innerText;
    }

    renderButtons() {
        this.buttonsContainer.innerHTML = ''; // 清空之前的按钮
        this.slider.style.width = `${100 / this.countries.length}%`; // 动态设置滑块宽度

        this.countries.forEach((country, index) => {
            const button = document.createElement('button');
            button.innerText = country.name;
            button.addEventListener('click', () => this.handleClick(country.name));
            this.buttonsContainer.appendChild(button);
            this.callbacks[country.name] = country.callback || null;
        });

        this.buttons = this.shadowRoot.querySelectorAll('.country-buttons button');
        this.switchCountry(this.countries[0].name); // 默认选择第一个国家
    }

    handleClick(countryName) {
        if (this.callbacks[countryName]) {
            this.switchCountry(countryName);
        }
    }

    switchCountry(countryName) {
        // 移除所有按钮的 active 状态
        this.buttons.forEach(button => button.classList.remove('active'));

        const countryIndex = this.countries.findIndex(c => c.name === countryName);

        // 动态设置滑块的位置
        this.slider.style.left = `${countryIndex * 100 / this.countries.length}%`;

        this.buttons[countryIndex].classList.add('active');
        this.callbacks[countryName]?.(); // 执行对应回调函数
    }

    // 更新按钮的禁用状态
    updateButtonStates() {
        this.buttons.forEach((button, index) => {
            if (!this.callbacks[this.countries[index].name]) {
                button.classList.add('disabled');
            } else {
                button.classList.remove('disabled');
            }
        });
    }
}


function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last > delay) {
            fn.apply(this, args);
            last = now;
        }
    };
}