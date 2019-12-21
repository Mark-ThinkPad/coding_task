$(function () {
    let context = null,
        inputData = [],
        size = 0,
        audioInput = null,
        recorder = null,
        dataArray;

    $('#start').click(function () {
        context = new (window.AudioContext || window.webkitAudioContext)();
        // 清空数据
        inputData = [];
        // 录音节点
        recorder = context.createScriptProcessor(4096, 1, 1);
        recorder.onaudioprocess = function(e) {
            // getChannelData返回Float32Array类型的pcm数据
            let data = e.inputBuffer.getChannelData(0);
            inputData.push(new Float32Array(data));
            size += data.length;
        };
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then((stream) => {
            audioInput = context.createMediaStreamSource(stream);
        }).catch((err) => {
            console.log('error');
        }).then(function() {
            audioInput.connect(recorder);
            recorder.connect(context.destination);
        });
    });

    $('#end').click(function () {
        recorder.disconnect();
    });

    $('#play').click(function () {
        recorder.disconnect();
        if (size !== 0) {
            let data = combineDataView(DataView, inputData);
            inputSampleRate = context.sampleRate;
            context.decodeAudioData(encodeWAV().buffer, function(buffer) {
                // decodeAudioData，是支持promise，三参数的知识兼容老的
                playSound(buffer);
            }, function() {
                console.log('error');
            });
            console.log(data.buffer);
            // 生成并下载文件
            let aTag = document.createElement('a');
            let blob = getWAVBlob();
            aTag.download = 'record_pcm.wav';
            aTag.href = URL.createObjectURL(blob);
            aTag.click();
            URL.revokeObjectURL(blob);
        }
    });

    let inputSampleRate = 0;   // 输入采样率
    let outputSampleBits = 16;  // 输出采样数位

    // 数据简单处理
    function decompress() {
        // 合并
        let data = new Float32Array(size);
        let offset = 0; // 偏移量计算
        // 将二维数据，转成一维数据
        for (let i = 0; i < inputData.length; i++) {
            data.set(inputData[i], offset);
            offset += inputData[i].length;
        }
        return data;
    }

    // pcm编码
    function encodePCM() {
        let bytes = decompress(),
            sampleBits = outputSampleBits,
            offset = 0,
            dataLength = bytes.length * (sampleBits / 8),
            buffer = new ArrayBuffer(dataLength),
            data = new DataView(buffer);
        // 写入采样数据
        if (sampleBits === 8) {
            for (let i = 0; i < bytes.length; i++, offset++) {
                // 范围[-1, 1]
                let s = Math.max(-1, Math.min(1, bytes[i]));
                // 8位采样位划分成2^8=256份，它的范围是0-255; 16位的划分的是2^16=65536份，范围是-32768到32767
                // 因为我们收集的数据范围在[-1,1]，那么你想转换成16位的话，只需要对负数*32768,对正数*32767,即可得到范围在[-32768,32767]的数据。
                // 对于8位的话，负数*128，正数*127，然后整体向上平移128(+128)，即可得到[0,255]范围的数据。
                let val = s < 0 ? s * 128 : s * 127;
                val = parseInt(val + 128);
                data.setInt8(offset, val, true);
            }
        } else {
            for (let i = 0; i < bytes.length; i++, offset += 2) {
                let s = Math.max(-1, Math.min(1, bytes[i]));
                // 16位直接乘就行了
                data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        }
        return data;
    }

    function encodeWAV() {
        let sampleRate = inputSampleRate;
        let sampleBits = outputSampleBits;
        let bytes = encodePCM();
        let buffer = new ArrayBuffer(44 + bytes.byteLength);
        let data = new DataView(buffer);
        let channelCount = 1;   // 单声道
        let offset = 0;
        // 资源交换文件标识符
        writeString(data, offset, 'RIFF'); offset += 4;
        // 下个地址开始到文件尾总字节数,即文件大小-8
        data.setUint32(offset, 36 + bytes.byteLength, true); offset += 4;
        // WAV文件标志
        writeString(data, offset, 'WAVE'); offset += 4;
        // 波形格式标志
        writeString(data, offset, 'fmt '); offset += 4;
        // 过滤字节,一般为 0x10 = 16
        data.setUint32(offset, 16, true); offset += 4;
        // 格式类别 (PCM形式采样数据)
        data.setUint16(offset, 1, true); offset += 2;
        // 通道数
        data.setUint16(offset, channelCount, true); offset += 2;
        // 采样率,每秒样本数,表示每个通道的播放速度
        data.setUint32(offset, sampleRate, true); offset += 4;
        // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
        data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4;
        // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
        data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
        // 每样本数据位数
        data.setUint16(offset, sampleBits, true); offset += 2;
        // 数据标识符
        writeString(data, offset, 'data'); offset += 4;
        // 采样数据总数,即数据总大小-44
        data.setUint32(offset, bytes.byteLength, true); offset += 4;

        // 给wav头增加pcm体
        for (let i = 0; i < bytes.byteLength; ++i) {
            data.setUint8(offset, bytes.getUint8(i, true), true);
            offset++;
        }
        return data;
    }

    function getWAVBlob() {
        return new Blob([ encodeWAV() ], { type: 'audio/wav' });
    }

    function playSound(buffer) {
        let source = context.createBufferSource();
        // 设置数据
        source.buffer = buffer;
        // connect到扬声器
        source.connect(context.destination);
        source.start();
    }

    function writeString(data, offset, str) {
        for (let i = 0; i < str.length; i++) {
            data.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    function combineDataView(resultConstructor, ...arrays) {
        let totalLength = 0,
            offset = 0;
        // 统计长度
        for (let arr of arrays) {
            totalLength += arr.length || arr.byteLength;
        }
        // 创建新的存放变量
        let buffer = new ArrayBuffer(totalLength),
            result = new resultConstructor(buffer);
        // 设置数据
        for (let arr of arrays) {
            // dataview合并
            for (let i = 0, len = arr.byteLength; i < len; ++i) {
                result.setInt8(offset, arr.getInt8(i));
                offset += 1;
            }
        }
        return result;
    }
});