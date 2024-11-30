import os
import pandas as pd
import tqdm
import re
import json

DIR = os.path.dirname(__file__)

PATH1 = os.path.join(DIR, 'cnev.csv')
PATH2 = os.path.join(DIR, 'cn.csv')
SAVE_PATH = os.path.join(DIR, 'output')



def clean(path, savepath):
    data = pd.read_csv(path)
    for i in tqdm.tqdm(range(len(data))):
        for j in range(1, len(data.columns)):
            num, unit = get_num_unit(data.iat[i, j])
            if num is not None:
                data.iat[i, j] = unify_unit(num, unit)
    # 将数据中的 . 替换为 None
    # data = data.where(data != '.', None)
    data.to_csv(savepath, index=False)
    print(data.head())



# 字符串处理函数 用于将数字及单位提取出来
def get_num_unit(s):
    # 客车2211辆（来源：2019年北京交通发展年报）
    # 从字符串中提取数字和单位
    # 使用正则表达式 如下模式才会匹配
    # 1. 数字 + 辆 2. 数字 + 万辆

    # 传入为 numpy.float64 类型 该如何处理
    # 将其转为字符串
    s = str(s)

    REGEX = r'(\d+\.?\d*)([万辆辆])'
    res = re.search(REGEX, s)
    if res:
        num, unit = res.groups()
        return float(num), unit
    else:
        return None, None
    
# 统一单位为 万
def unify_unit(num, unit):
    if unit == '万':
        return num
    elif unit == '辆':
        return num / 10000
    else:
        return None
    
def test1(): # test get_num_unit
        # test get_num_unit
    s = ['客车2211辆（来源：2019年北京交通发展年报）', '客车8233辆（来源：2019年北京交通发展年报）', '客车27875辆（来源：2019年北京交通发展年报）', '客车97405辆（来源：2019年北京交通发展年报）', '17.1万辆（ http://www.gev.org.cn/news/1410.html）', '23.38万辆（来源：http://www.gev.org.cn/news/3070.html）', '30.89万辆（http://www.gev.org.cn/news/4562.html）', '.,40.4', '45.4', 
         '天津市', '1.39万辆（来源：http://www.gov.cn/xinwen/2017-01/27/content_5163914.htm）', '3.85万辆（http://www.gov.cn/xinwen/2017-01/27/content_5163914.htm）', '81605辆（来源：https://www.sohu.com/a/237664822_249929）', '117626辆（来源：新华网 http://m.xinhuanet.com/tj/2019-07/05/c_1124713748.htm）', '146775辆（http://www.gev.org.cn/news/4567.html）', '.,20', '22.9']
    
    for i in s:
        num, unit = get_num_unit(i)
        if num is not None:
            print(num, unit, unify_unit(num, unit))
        else:
            # print(i, None, None, None)
            pass
    
def align_and_save_to_json(cnev_path, cn_path, json_path):
    # 读取 CSV 文件
    cnev_df = pd.read_csv(cnev_path)
    cn_df = pd.read_csv(cn_path)

    # 将所有数据转为字符串
    cnev_df = cnev_df.astype(str)
    cn_df = cn_df.astype(str)
    
    # 将 "." 替换为 None
    cnev_df.replace('.', None, inplace=True)
    cn_df.replace('.', None, inplace=True)
    
    # 将 “nan” 替换为 ”null“
    cnev_df.replace('nan', "null", inplace=True)
    cn_df.replace('nan', "null", inplace=True)

    # 初始化结果字典
    data = {}

    # 将 labels 作为元数据标注在数据中
    data['labels'] = {
        'cnev': cnev_df.columns[1:].tolist(),
        'cn': cn_df.columns[1:].tolist()
    }
    
    # 处理 cnev 数据
    for _, row in cnev_df.iterrows():
        city = row['年份']
        data[city] = {
            'cnev': row[1:].tolist()
        }
    
    # 处理 cn 数据
    for _, row in cn_df.iterrows():
        city = row['年份']
        if city in data:
            data[city]['cn'] = row[1:].tolist()
        else:
            data[city] = {
                'cn': row[1:].tolist()
            }
    
    # 保存为 JSON 文件
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)



if __name__ == '__main__':
    # data = pd.read_csv(PATH)
    # print(data.head())
    # SAVE_PATH1 = os.path.join(SAVE_PATH, 'cnev.csv')

    # clean(PATH,SAVE_PATH1)

    align_and_save_to_json(PATH1, PATH2, os.path.join(SAVE_PATH, 'output.json'))

