// 获取国家列表的容器
const countryList = document.getElementById("country-list");

// 从 JSON 文件加载国家数据
fetch('../../data/timezone/eu.json')
    .then(response => response.json())
    .then(data => {
        // 遍历 JSON 文件中的国家数据
        Object.entries(data).forEach(([countryName, countryInfo]) => {
            const { flag, timeZone } = countryInfo;

            // 创建国家信息容器
            const countryInfoDiv = document.createElement("div");
            countryInfoDiv.classList.add("country-info");

            // 创建显示国家信息的文本
            const infoText = document.createElement("div");
            infoText.innerHTML = `
                <strong>${countryName}</strong> ${flag}<br>
            `;

            // 创建显示本地时间的容器
            const timeDisplay = document.createElement("div");
            timeDisplay.classList.add("time");
            timeDisplay.innerText = timeZone ? "Loading local time..." : "Time zone not available";

            // 将文本和时间元素添加到容器中
            countryInfoDiv.appendChild(infoText);
            countryInfoDiv.appendChild(timeDisplay);
            countryList.appendChild(countryInfoDiv);

            // 如果存在时区，定时更新当地时间
            if (timeZone) {
                setInterval(() => {
                    timeDisplay.innerText = getLocalTime(timeZone);
                }, 1000);
            }
        });
    })
    .catch(error => console.error("Error loading country data:", error));

// 获取指定时区的当前时间字符串
function getLocalTime(timeZone) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone,
        hour12: false
    };
    const time = new Intl.DateTimeFormat('en-GB', options).format(new Date());
    const timeZoneOffset = getTimeZoneOffset(timeZone);
    return `${time} ${timeZoneOffset}`;
}

// 计算并显示 UTC 偏移
function getTimeZoneOffset(timeZone) {
    const now = new Date();
    const localTime = now.toLocaleString("en-US", { timeZone });
    const localDate = new Date(localTime);
    const offset = (localDate.getTime() - now.getTime()) / 60000;
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? "+" : "-";
    return `(UTC ${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')})`;
}
