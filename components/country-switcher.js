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
                    height: 10px;
                    background: #e0e0e0;
                    border-radius: 5px;
                    position: absolute;
                    top: 50px;
                    left: 0;
                    z-index: 1;
                    width: 100%;
                }
                .slider-button {
                    height: 10px;
                    background: #007bff;
                    border-radius: 5px;
                    position: absolute;
                    transition: left 0.3s ease;
                    z-index: 2;
                }
                .country-buttons {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    z-index: 3;
                }
                .country-buttons button {
                    padding: 10px;
                    cursor: pointer;
                    border: none;
                    background-color: #f0f0f0;
                    border-radius: 20px;
                    transition: background-color 0.3s ease, cursor 0.3s ease;
                }
                .country-buttons button.active {
                    background-color: #007bff;
                    color: white;
                }
                .country-buttons button.disabled {
                    background-color: #d3d3d3;
                    color: #a9a9a9;
                    cursor: not-allowed;
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
        const buttonWidth = this.buttons[0].offsetWidth;

        // 动态设置滑块的位置
        this.slider.style.left = `${countryIndex * buttonWidth}px`;

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
