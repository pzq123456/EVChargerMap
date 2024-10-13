export class CountrySwitcher extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
            .slider-container {
                width: 100%;
                max-width: 500px;
                margin: 50px auto;
                position: relative;
            }

            .slider {
                height: 6px; /* 减小高度，减少视觉冲击 */
                background: #555; /* 使用中性灰色，低调融入背景 */
                position: absolute;
                top: 50px;
                left: 0;
                z-index: 1;
                width: 100%;
            }

            .slider-button {
                height: 10px;
                width: 10px;
                background: #888; /* 使用柔和的中性灰色 */
                position: absolute;
                transition: left 0.3s ease;
                z-index: 2;
                box-shadow: none; /* 去掉光晕效果，避免过于突出 */
            }

            .country-buttons {
                display: flex;
                justify-content: space-between;
                position: relative;
                z-index: 3;
                margin-top: 20px;
                border-radius: 5px;
            }

            .country-buttons button {
                padding: 10px 15px;
                cursor: pointer;
                border: 1px solid #555;
                background-color: #444;
                color: #ccc;
                border-radius: 5px;
                transition: background-color 0.3s ease, transform 0.3s ease;
            }

            .country-buttons button.active {
                background-color: #1e90ff;
                color: white;
                border-color: #1e90ff;
            }

            .country-buttons button.disabled {
                background-color: #666;
                color: #999;
                cursor: not-allowed;
            }

            .country-buttons button:hover:not(.disabled) {
                background-color: #555;
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