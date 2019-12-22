# <多媒体计算机技术> 专选课作业

## 开发环境

- 系统环境: `Arch Linux / Windows 7`
- 浏览器版本: `Google Chrome 79` 
- MATLAB版本:

![MATLAB-version](https://zhouganqing.top/media/images/2019/Snipaste_2019-12-22_18-54-07.png)

## 实现方案

- Huffman编码 和 PCM 的GUI使用Web实现 (HTML + CSS), 算法使用 `JavaScript` 实现, 文件分别是 `huffman.js` 和 `pcm.js`
- LPC 使用`MATLAB`实现, GUI采用 `App Designer` 编写, 所有文件在 `/LPC/` 文件夹中

## 运行方式

- Huffman编码及解码

```
用浏览器打开 `huffman.html` (推荐使用chromium内核的浏览器确保兼容性)
```

- PCM脉冲编码调制
```
用浏览器打开 `pcm.html` (推荐使用chromium内核的浏览器确保兼容性)
```

生成的音频文件信息截图:

![pcm0](https://zhouganqing.top/media/images/2019/Snipaste_2019-12-21_17-05-10.png)

![pcm1](https://zhouganqing.top/media/images/2019/Snipaste_2019-12-21_17-05-39.png)

- LPC线性预测编码

```
在MATLAB中运行 /LPC/ 文件夹中的 Lpc.m 文件, 录音完毕后播放对比原录音音频record.wav和经过LPC编码后的encode.wav
```

![](https://zhouganqing.top/media/images/2019/Snipaste_2019-12-22_19-00-57.png)

![](https://zhouganqing.top/media/images/2019/Snipaste_2019-12-22_18-58-44.png)
