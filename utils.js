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

export function initDom(element) {
    let { width, height } = getScreenSize();
    let margin = 20;
    setElementSize(element, width - margin, height - margin);
}

export function getBaseMap(baseMapInfos){
    let baseMaps = {};
    for(let item of baseMapInfos){
        baseMaps[item.name] = L.tileLayer(item.url+item.style+'/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: item.attribution
        });
    }
    return baseMaps;
}

function randomPoint(center, radius){
    let x0 = center[0];
    let y0 = center[1];
    let rd = Math.random() * radius;
    let theta = Math.random() * 2 * Math.PI;
    let x = x0 + rd * Math.cos(theta);
    let y = y0 + rd * Math.sin(theta);
    return [x, y];
}

function randomPointsWithProperties(center, radius, num){
    let points = [];
    for(let i=0; i<num; i++){
        let point = randomPoint(center, radius);
        
        point.push({
            "lat": point[0],
            "lng": point[1],
            "value": Math.random() * 100
        });

        points.push(point);
    }

    return points;
}
