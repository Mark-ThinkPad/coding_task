$(function () {
    // 判空函数
    function isEmpty(input_id, button_id) {
        let input = $(input_id).val();
        if (input !== '') {
            $(button_id).attr('disabled', false);
        } else {
            $(button_id).attr('disabled', true);
        }
    }
    // 1. 文件类型校验
    // 2. 文件内容读取为字符串 FileReader.readAsText()
    // 3. 字符串进行压缩处理(赫夫曼编码)
    // 4. 压缩后的字符串可以被解压还原
    let txt = document.getElementById('file');
    let str = '';
    txt.onchange = function () {
        let file = txt.files[0];
        if ( /\.(txt)$/.test(file.name) ) {
            let reader = new FileReader();
            reader.readAsText(file)
            reader.addEventListener("load", function () {
                // alert(this.result);
                str = this.result;
            });
        } else {
            alert('只支持txt文档!');
            txt.value = '';
        }
    };
    // 输入判空
    $('#words').bind('input propertychange', function () {
        isEmpty('#words', '#compress_words');
    });
    // 回车触发按钮
    $('#words').keydown(function (e) {
        if (e.keyCode === 13) {
            $('#compress_words').click();
        }
    });

    // 算法实现部分
    // 哈夫曼树节点
    class Node {
        constructor(parent, lchild, rchild, count, alpha, code) {
            // 二叉树关系
            this.parent = parent;
            this.lchild = lchild;
            this.rchild = rchild;
            // 符号个数
            this.count = count;
            // 符号
            this.alpha = alpha;
            // 编码(数组)
            this.code = code;
        }
    }
    // 存放文件中各个字符，及其出现次数
    class Ascll {
        constructor(alpha, count) {
            // 符号
            this.alpha = alpha;
            // 符号个数
            this.count = count;
        }
    }
    function select(HT, i, s1, s2) {
        let j = 0;
        let s = 0; // 记录当前找到的最小权值的结点的下标
        for (j = 1; j <= i; j++) {
            // 找最小
            if (HT[j].parent === 0) {
                // 第一个找到的点
                if (s === 0) {
                   s = j;
                }
                if (HT[j].count < HT[s].count) {
                    s = j;
                }
            }
        }
        s1 = s;
        s = 0;
        // 找次小
        for (j = 1; j <= i; j++) {
            // 仅比上面一个多了j !== s1, 应为不能是最小
            if ((HT[j].parent === 0) && (j !== s1)) {
                if (s === 0) {
                    s = j;
                }
                if (HT[j].count < HT[s].count) {
                    s = j;
                }
            }
        }
        s2 = s;
        return {s1:s1, s2:s2}
    }
    // 创建的哈夫曼树是以一维数组建立, 同时起始地址是1
    function createHuffmanTree(HT, ascll) {
        let i = 0;
        let s1 = 0;
        let s2 = 0;
        let leafNum = 0;
        let j = 0;
        // 初始化叶节点, 256个ascll字符
        for (i = 0; i < 256; i++) {
            // 只使用出现的过的字符 ascll[i].count > 0
            if (ascll[i].count > 0) {
                HT[++j].count = ascll[i].count;
                HT[j].alpha = ascll[i].alpha;
                HT[j].parent = HT[j].lchild = HT[j].rchild=0;
            }
        }
        // [叶子] [叶子] [叶子] [叶子] ···[内部] [根]
        leafNum = j;
        let nodeNum = 2 * leafNum - 1; // 节点个数
        // 初始化内部节点
        for(i = leafNum + 1; i <= nodeNum; i++)
        {
            HT[i].count = 0;
            HT[i].code = [];
            HT[i].code[0] = 0;
            HT[i].parent = HT[i].lchild = HT[i].rchild = 0;
        }
        // 给内部节点找孩子
        for(i = leafNum + 1; i <= nodeNum; i++)
        {
            res = select(HT, i - 1, s1, s2); // 找到当前最小和次小的树根
            s1 = res.s1;
            s2 = res.s2;
            HT[s1].parent = i;
            HT[s2].parent = i;
            HT[i].lchild = s2;
            HT[i].rchild = s1;
            HT[i].count = HT[s1].count + HT[s2].count;
        }
        return {leafNum: leafNum, HT: HT}
    }
    // 哈弗曼编码
    function HuffmanCoding(hTable, HT, leafNum) {
        let i = 0, j = 0, m = 0, c = 0, f = 0, start = 0;
        let cd = Array(512);
        m = 512;
        cd[m-1] = 0;
    }
});