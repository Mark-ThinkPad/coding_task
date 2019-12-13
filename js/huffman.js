$(function () {
    // 算法实现部分
    // 定义哈夫曼树节点 HuffmanTreeNode
    class HuffmanTreeNode {
        constructor(weight, char) {
            // 左子树
            this.l = null;
            // 右子树
            this.r = null;
            // 字符的度量值，也就是字符在文本中出现的频次
            this.weight = weight || 0;
            // 字符
            this.char = char || '';
        }
    }
    // 定义一个最小堆对象
    // 主要用于在创建哈夫曼树过程中获取度量值weight（字符出现的频次）最小的节点
    class heapMin {
        constructor() {
            this.set = [];
        }
        // 调整堆使其满足最小堆性质
        adjust(index) {
            let len = this.set.length;
            let l = index * 2 + 1;
            let r = index * 2 + 2;
            let min = index;
            let node = null;

            if (l <= len -1 && this.set[min].weight > this.set[l].weight) {
                min = l;
            }

            if (r <= len -1 && this.set[min].weight > this.set[r].weight) {
                min = r;
            }

            if (min !== index) {
                node = this.set[index];
                this.set[index] = this.set[min];
                this.set[min] = node;
                this.adjust(min);
            }
        }
        // 插入一个元素
        push(node) {
            this.set.push(node);
            for (let i = Math.floor(this.set.length / 2); i >= 0; i--) {
                this.adjust(i);
            }
        }
        // 移除最小元素
        pop() {
            let node;
            node = this.set.shift();
            this.adjust(0);
            return node
        }
        // 获取当前堆大小
        size() {
            return this.set.length
        }
        // 堆是否为空
        empty() {
            return this.set.length === 0
        }
    }
    // 定义哈夫曼编码对象：HuffmanCode
    class HuffmanCode {
        constructor() {
            // 当前的编码表
            this.codeTable = [];
            // 当前的哈夫曼树
            this.huffmanTree = null;
        }
        // 统计字符出现的频次，生成字符频次最小堆
        // str：要进行编码的字符串
        // 返回值 返回一个字符串出现频次的最小堆
        static calcHeap(str) {
            let heap = new heapMin();
            let set = [];

            for (let i = str.length - 1; i >= 0; i--) {
                if (set[str[i]]) {
                    set[str[i]].num++;
                } else {
                    set[str[i]] = {num:1,char:str[i]};
                }
            }

            Object.values(set).forEach((value) => {
                heap.push(new HuffmanTreeNode(value.num, value.char))
            });

            return heap
        }
        // 创建哈夫曼树
        // str：要进行哈夫曼编码的字符串
        // 返回值：哈夫曼编码树
        createHuffmanTree(str) {
            let heap = HuffmanCode.calcHeap(str);

            while(heap.size() > 1) {
                let min1 = heap.pop();
                let min2 = heap.pop();
                let parent = new HuffmanTreeNode(min1.weight + min2.weight, '');

                if (min1.weight < min2.weight) {
                    parent.l = min1;
                    parent.r = min2;
                } else {
                    parent.l = min2;
                    parent.r = min1;
                }

                heap.push(parent);
            }

            this.huffmanTree = heap.pop();
        }
        // 递归哈夫曼树，生成编码表
        // node：当前要递归的结点
        // arr：编码表
        // code：编码字符串
        static traverseTree(node, arr, code) {
            if (node.l !== null && node.r !== null) {
                HuffmanCode.traverseTree(node.l, arr, code + '0');
                HuffmanCode.traverseTree(node.r, arr, code + '1');
            }
            arr[node.char] = code;
        }
        // 哈夫曼编码
        encode(str) {
            this.createHuffmanTree(str);
            let res = [];

            HuffmanCode.traverseTree(this.huffmanTree, this.codeTable, '');

            for (let i = str.length - 1; i >= 0; i--) {
                res.push(this.codeTable[str[i]])
            }

            return res.reverse().join('')
        }
        // 哈夫曼解码
        decode(str) {
            if (this.huffmanTree === null) {
                console.error('Please create HuffmanTree!');
            }

            let node = this.huffmanTree;
            let res = [];

            for (let len = str.length, i=0; i < len; i++) {
                if (str[i] === '0') {
                    node = node.l;
                } else {
                    node = node.r;
                }

                if (node.l === null && node.r === null) {
                    res.push(node.char);
                    node = this.huffmanTree;
                }
            }

            return res.join('')
        }
    }
    // 测试数据
    // let huffmanCode = new HuffmanCode();
    // let compress = huffmanCode.encode('我是大白兔欢迎你我是我是力量哈哈');
    // console.log(compress);
    // let decompress = huffmanCode.decode('11100100001011100101010010100111001110011011011011011');
    // console.log(decompress);

    // UI操作部分
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
    // 3. 字符串进行赫夫曼编码
    // 4. 编码后的字符串可以被解码
    let txt = document.getElementById('file');
    let str = '';
    txt.onchange = function () {
        let file = txt.files[0];
        if ( /\.(txt)$/.test(file.name) ) {
            let reader = new FileReader();
            reader.readAsText(file);
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
        isEmpty('#words', '#encode_words');
    });
    // 回车触发按钮
    $('#words').keydown(function (e) {
        if (e.keyCode === 13) {
            $('#encode_words').click();
        }
    });
});