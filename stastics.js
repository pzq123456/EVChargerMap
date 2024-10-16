export class Stastics {
    constructor() {
        this._max = 0;
        this._min = 0;
        this._average = 0;
        this._data = [];
    }

    clear() {
        this._max = 0;
        this._min = 0;
        this._average = 0;
        this._data = [];
    }

    update() {
        this.dropna();
        this._max = Math.max(...this._data);
        this._min = Math.min(...this._data);
        this._average = this._data.reduce((a, b) => a + b, 0) / this._data.length;
    }

    dropna() {
        this._data = this._data.filter((value) => value !== null && value !== undefined && !isNaN(value));
    }

    append(value, getVal) {
        this._data.push(...value.map(getVal));
        this.update();
    }

    // 根据内置的统计值进行值映射，支持拉伸函数
    mapValue(value, isReverse = false, stretch = 'linear') {
        let mappedValue = (value - this._min) / (this._max - this._min);

        switch (stretch) {
            case 'log': // 对数拉伸
                mappedValue = Math.log10(1 + mappedValue * 9); // 可调整基数
                break;
            case 'exp': // 指数拉伸
                mappedValue = Math.pow(mappedValue, 2); // 可调整指数
                break;
            case 'sqrt': // 平方根拉伸
                mappedValue = Math.sqrt(mappedValue);
                break;
        }

        if (isReverse) {
            return 1 - mappedValue;
        } else {
            return mappedValue;
        }
    }

    mapValue2Color(value, isReverse = false, colors = defaultColors, stretch = 'linear') {
        let index = Math.floor(this.mapValue(value, isReverse, stretch) * (colors.length - 1));
        return colors[index];
    }

    getGrades(num) { // 获取整数分级
        let grades = [];
    
        // 计算出最大最小值差距
        let range = this._max - this._min;
    
        // 确定一个合适的步长，使得每个区间的范围是整数
        let roughStep = range / num;
    
        // 找到最近的 "漂亮的" 步长 (比如10, 50, 100这样的数字)
        let magnitude = Math.pow(10, Math.floor(Math.log10(roughStep))); // 获得步长的数量级
        let niceStep = Math.ceil(roughStep / magnitude) * magnitude; // 找到适合的步长
    
        // 计算新的分级区间
        let niceMin = Math.floor(this._min / niceStep) * niceStep; // 向下取整到最近的漂亮整数
        let niceMax = Math.ceil(this._max / niceStep) * niceStep;  // 向上取整到最近的漂亮整数
    
        // 生成分级
        for (let i = niceMin; i <= niceMax; i += niceStep) {
            grades.push(i);
        }
    
        return grades;
    }

    // // 等距离
    // getGrades(num) {
    //     let grades = [];
    //     let step = (this._max - this._min) / num;
    //     for (let i = 0; i <= num; i++) {
    //         // grades.push(this._min + i * step);
    //         let grade = this._min + i * step;
    //         grades.push(grade.toFixed(2));
    //     }
    //     // grades 保留两位小数

    //     return grades;
    // }
    
    
}


// const defaultColors  = [
//     '#00441b', '#f7fbff', '#deebf7', '#9ecae1', 
//     '#6baed6', '#3182bd', '#08519c', '#08306b'
// ];

const defaultColors = [ // 红色基调的暖色调
    '#67000d', '#f7f4f9', '#fde0dd', '#fcbba1',
    '#fc9272', '#fb6a4a', '#ef3b2c', '#99000d'
];

//   #f7fbff
  
// const defaultColors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b', '#003d19', '#003617', '#003015', '#002b13', '#002611', '#00200f', '#001b0d', '#00160b'];

/**
 * 用于统计点密度的类
 */
export class Grid {
    constructor(
        gridBounds = { x: -180, y: -90, w: 360, h: 180 },
        cellWidth = 1,
        cellHeight = 1) {
        this.gridBounds = gridBounds;  // 整个网格的边界范围
        this.cellWidth = cellWidth;    // 每个单元格的宽度
        this.cellHeight = cellHeight;  // 每个单元格的高度
        this.grid = {};                // 存储稀疏网格信息
    }

    // 插入一组点并进行网格统计
    insertPoints(points) {
        points.forEach(point => {
            let [x, y] = point;
            // 根据点的位置计算所在的网格单元
            let gridX = Math.floor((x - this.gridBounds.x) / this.cellWidth);
            let gridY = Math.floor((y - this.gridBounds.y) / this.cellHeight);
            let key = `${gridX},${gridY}`;  // 网格单元的唯一键值
            
            // 如果该网格单元还没有被初始化，创建它
            if (!this.grid[key]) {
                this.grid[key] = { center: this.getGridCenter(gridX, gridY), count: 0 };
            }
            
            // 增加该网格单元中的点数
            this.grid[key].count += 1;
        });
    }

    // 根据网格坐标获取该单元的中心点
    getGridCenter(gridX, gridY) {
        return {
        x: this.gridBounds.x + gridX * this.cellWidth + this.cellWidth / 2,
        y: this.gridBounds.y + gridY * this.cellHeight + this.cellHeight / 2
        };
    }

    // 获取稀疏网格数据
    getSparseGrid() {
        return this.grid;
    }

    getSparseGridArray(){
        let gridArray = [];
        for (let key in this.grid){
            let arr = [];
            // gridArray.push(this.grid[key]);
            arr.push(this.grid[key].center.x);
            arr.push(this.grid[key].center.y);
            arr.push(this.grid[key].count);
            gridArray.push(arr);
        }
        return gridArray;
    }
}

// // 使用Grid类的示例代码
// let gridBounds = { x: -180, y: -90, w: 360, h: 180 };  // 地图范围的边界
// let cellWidth = 10;   // 每个网格单元的宽度
// let cellHeight = 10;  // 每个网格单元的高度

// // 初始化 Grid 实例
// let grid = new Grid(gridBounds, cellWidth, cellHeight);

// // 假设 pointsInGrid 是我们获取的地理坐标点数据
// let pointsInGrid = [
//   { x: -120, y: -45 },
//   { x: -121, y: -46 },
//   { x: -119, y: -44 },
//   // 继续添加更多点
// ];

// // 插入点并进行网格统计
// grid.insertPoints(pointsInGrid, point => ({ x: point.x, y: point.y }));

// // 获取稀疏网格数据
// let sparseGrid = grid.getSparseGrid();
// console.log(sparseGrid);

  