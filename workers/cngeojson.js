// worker.js
self.onmessage = function (e) {
    const { geoJsonData, csvData } = e.data;

    // 调用 addColumn2GeoJson 函数
    const updatedGeoJson = addColumn2GeoJson(geoJsonData, csvData);

    // 计算完成后，将结果发回主线程
    self.postMessage(updatedGeoJson);
};

// 简单的前缀匹配或字符匹配算法
function cn_match(feature, data, minMatchLength = 2) {
    // console.log(feature, data);
    const target = feature.pr_name;
    let matchedIndex = -1;

    // 遍历数据列表
    for (let i = 0; i < data.length; i++) {
        const state = data[i].State;
        // console.log(data[i]);

        // 1. 前缀匹配
        if (state.startsWith(target.slice(0, minMatchLength))) {
            matchedIndex = i;
            break; // 找到前缀匹配，直接返回
        }

        // 2. 字符匹配
        let matchCount = 0;
        for (let j = 0; j < state.length; j++) {
            if (target.includes(state[j])) {
                matchCount++;
            }
            if (matchCount >= minMatchLength) {
                matchedIndex = i;
                break; // 一旦达到最小匹配字符数，退出遍历
            }
        }
        if (matchedIndex !== -1) break; // 如果已经找到匹配的，退出主循环
    }

    return data[matchedIndex].count;
}

function addColumn2GeoJson(geoJson, data, match_fn = cn_match, columnName = "count") {
    let updatedGeoJson = JSON.parse(JSON.stringify(geoJson));
    updatedGeoJson.features.forEach((feature, index) => {
        const matchedValue = match_fn(feature.properties, data);
        feature.properties[columnName] = matchedValue;
    });
    return updatedGeoJson;
}

