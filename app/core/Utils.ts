/**
 * 工具类
 */
export default class Utils {
    static async ajax(d: ZeptoAjaxSettings) {
        return await new Promise((resolve, reject) => {
            $.ajax({
                type: d.type,
                url: d.url,
                data: d.data,
                dataType: d.dataType,
                contentType: d.contentType,
                xhrFields: {
                    withCredentials: true
                },
                success: (data) => {
                    resolve(data);
                }

            });
        });
    }

    /**
     * 根据孤度计算坐标
     * @param angle 角度
     * @param radius 半径
     * @param center 中心点坐标
     */
    static getPositionByAngle(angle: number, radius: number, center: pos) {
        return {
            x: center.x + radius * Math.cos(angle * Math.PI / 180),
            y: center.y + radius * Math.sin(angle * Math.PI / 180)
        }
    }

    /**
     * 替换{{name}}为需要的数据 =>用于界面数据绑定
     * @param name 要替换的对应的名称
     * @param oldData 要被替换的老数据
     * @param newData 要替换的内数据
     */
    static replaceData(name: string, oldData: string, newData: string) {
        let reg = new RegExp(`{{${name}}}`);
        return oldData.replace(reg, newData)
    }
    /**
     * 获取url里面的参数值
     * @param  key 传进来的参数
     * @param notMust 不是必须的参数 用来判断一些特殊的字段(如是否debug)
     * http://192.168.4.206:8900/bin/index.html?userId=12312&roomId=1234545
     */
    static getValueByUrl(key: string, notMust?: boolean): any {
        let value = location.hash.match(new RegExp("[?=?|?=&]" + key + "=([^&]*)"));
        if (value === null) {
            if (notMust) return null;
           // alert('lose ' + key);
            return null;
        };
        return value[1];
    }


    private static mergeCanvas: any;//此处代码后期可以优化
    /**
     * 合并图片
     */
    static mergeImage(data: mergeImage) {
        var c = document.createElement('canvas'),
            ctx = c.getContext('2d'),
            len = data.images.length;
        c.width = data.width;
        c.height = data.hieght;
        ctx.rect(0, 0, c.width, c.height);
        ctx.fillStyle = '#fff';
        ctx.fill();

        return new Promise((resolve) => {
            function drawing(n) {
                if (n < len) {
                    var img = new Image;
                    img.crossOrigin = 'anonymous'; //解决跨域
                    img.src = data.images[n].src;
                    img.onload = function () {
                        data.images[n].x = data.images[n].x ? data.images[n].x : 0;
                        data.images[n].y = data.images[n].y ? data.images[n].y : 0;
                        data.images[n].width = data.images[n].width ? data.images[n].width : img.width;
                        data.images[n].height = data.images[n].height ? data.images[n].height : img.height;
                        ctx.drawImage(img, data.images[n].x, data.images[n].y, data.images[n].width, data.images[n].height);
                        drawing(n + 1);//递归
                    }
                } else {


                    //添加字
                    if (data.texts) {
                        for (let x = 0, l = data.texts.length; x < l; x++) {
                            ctx.font = (data.texts[x].fontSize ? data.texts[x].fontSize : 24) + "px Microsoft YaHei";
                            ctx.fillStyle = data.texts[x].color;
                            ctx.fillText(data.texts[x].string, data.texts[x].x, data.texts[x].y);
                        }
                    }

                    //保存生成作品图片
                    resolve(c.toDataURL("image/jpeg", data.quality ? data.quality : 1));
                }
            }
            drawing(0);
        })
    }

    private static context: AudioContext;
    private static soundList: any = {};
    /**
     * 播放音效
     * @description 需要优化，加载的时候 需要添加一个队列功能
     */
    static bb;
    static playSound(url: string) {
        // let bb;
        // let self = this;
        // // const URL = 'http://192.168.3.2:2231/res/other/audio/touch2.mp3';
        // const URL = url;
        // if (!self.context) {
        //     let AudioContext = window['AudioContext']
        //         || window['webkitAudioContext']
        //         || window['msAudioContext']
        //         || window['mozAudioContext '];

        //         self.context = new AudioContext();
        // }


        // var source = self.context.createBufferSource();
        // loadDogSound(URL, function (buffer) {
        //     source.buffer = buffer;
        //     source.connect(self.context.destination);
        //     source.start(0);
        // });
        // function loadDogSound(url, call) {
        //     var request = new XMLHttpRequest();
        //     request.open('GET', url, true);
        //     request.responseType = 'arraybuffer';
        //     //下面就是对音频文件的异步解析
        //     request.onload = function () {
        //         self.context.decodeAudioData(request.response, function (buffer) {
        //             call(buffer);
        //         }, null);
        //     }
        //     request.send();

        // }





        if (!this.context) {
            try {
                let AudioContext = window['AudioContext']
                    || window['webkitAudioContext']
                    || window['msAudioContext']
                    || window['mozAudioContext '];
                this.context = new AudioContext();
            }
            catch (e) {
                alert('你的浏览器连个Web-Audio-API 都不支持！！')
            }
        }
        if (!this.context) {
            console.error('播放音效失败!')
            return;
        }

        let context = this.context,
            self = this,
            source = context.createBufferSource();

        function playSound(buffer) {
            // var source = context.createBufferSource();//创建一个音频源 相当于是装音频的容器
            source.buffer = buffer;//  告诉音频源 播放哪一段音频
            source.connect(context.destination);// 连接到输出源

            source.loop = false;
            source.start();//开始播放 
        }

        loadDogSound(url);
        function loadDogSound(url) {
            if (self.soundList[url]) {
                playSound(self.soundList[url]);
                return;
            }
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            //下面就是对音频文件的异步解析
            request.onload = function () {
                context.decodeAudioData(request.response, function (buffer) {
                    self.soundList[url] = buffer;
                    playSound(buffer);
                }, null);
            }

            request.send();

        }

    }

    /**
   * 计算两点的距离 
   * @param start 
   * @param end 
   */
    static getPositionLength(start: pos, end: pos) {
        let s = end.x - start.x,
            e = end.y - start.y;
        return Math.abs(Math.pow((s * s + e * e), 0.5));
    }

    /**
     * 微信
     */
    static  isWx() {
        return /MicroMessenger/i.test(navigator.userAgent);
    }

    /**
     * h5(手机浏览器运行的)
     */
    static isWebAppp(){
        return /AppleWebKit.*Mobile.*/i.test(navigator.userAgent);
    }

}