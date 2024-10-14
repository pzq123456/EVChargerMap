// worker.js
self.onmessage = function (e) {
    const { geoJsonData, csvData } = e.data;

    // 调用 addColumn2GeoJson 函数
    let updatedGeoJson = addColumn2GeoJson(geoJsonData, csvData);
    updatedGeoJson = renameGeoJsonField(updatedGeoJson, 'pr_name', 'name');

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
    updatedGeoJson.features = updatedGeoJson.features.filter((feature, index) => {
        const matchedValue = match_fn(feature.properties, data);
        if (matchedValue !== undefined && matchedValue !== null) {
            feature.properties[columnName] = matchedValue;
            return true; // 保留匹配成功的要素
        }
        return false; // 移除匹配失败的要素
    });
    return updatedGeoJson;
}


function renameGeoJsonField(geoJson, oldFieldName, newFieldName) {
    let updatedGeoJson = JSON.parse(JSON.stringify(geoJson));
    updatedGeoJson.features.forEach(feature => {
        if (feature.properties.hasOwnProperty(oldFieldName)) {
            feature.properties[newFieldName] = feature.properties[oldFieldName]; // 复制旧字段值到新字段
            delete feature.properties[oldFieldName]; // 删除旧字段
        }
    });
    return updatedGeoJson;
}
