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

export function init(element) {
    let { width, height } = getScreenSize();
    let margin = 20;
    setElementSize(element, width - margin, height - margin);
}