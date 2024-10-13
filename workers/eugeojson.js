self.onmessage = function (e) {
    const { geoJsonData, csvData } = e.data;

    // 调用 addColumn2GeoJson 函数
    const updatedGeoJson = addColumn2GeoJson(geoJsonData, csvData, eu_match, 'count');

    // 计算完成后，将结果发回主线程
    self.postMessage(updatedGeoJson);
};

function addColumn2GeoJson(geoJson, data, match_fn = eu_match, columnName = 'count') {
    let updatedGeoJson = JSON.parse(JSON.stringify(geoJson));
    updatedGeoJson.features.forEach((feature, index) => {
        const matchedValue = match_fn(feature.properties, data);
        feature.properties[columnName] = matchedValue;
    });
    return updatedGeoJson;
}

function eu_match(feature, data) {
    const matchedRow = data.find(row => row.COUNTRY === feature.NAME);
    return matchedRow ? matchedRow.count : null;
}