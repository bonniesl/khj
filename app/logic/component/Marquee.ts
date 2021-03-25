
import { Net, Api } from "../../common/Net";
import ViewConfig from "../../common/ViewConfig";

export default class Marquee 
{
    private intervalId = -1;

    constructor() {
        this.init();
    }

    private async init() {
        let hitMes = await Net.getData(Api.hitMes);
        this.createTemplate(hitMes);

        $(".prizePlay").show();
        this.core();
    }

    // 请求数据并创建dom
    private createTemplate(hitMes){
        let prizeHtml = '';
        let prizeHtml1 = '';
        let html = '';

        for (let x = 0; x < hitMes.length; x++) {
            if (hitMes[x]['type'] == 1) {
                prizeHtml += `<p class="prizemes">${hitMes[x]['mes']}</p>`;
                prizeHtml += `<p class="prizemes">${hitMes[x]['mes']}</p>`;
            }

            prizeHtml1 += `<p class="prizemes">${hitMes[x]['mes']}</p>`;
            prizeHtml1 += `<p class="prizemes">${hitMes[x]['mes']}</p>`;
        }

        if (prizeHtml.length == 0) {
            html = prizeHtml1;
        } else {
            html = prizeHtml;
        }
        
        // $(".prizeList").empty();
        $(".prizeList").html(html);
    }

    // 处理字幕移动
    private core() {
        var timeoutId = -1;
        var intervalId = -1;
        var speed = 10;//初始化速度 也就是字体的整体滚动速度
        var scroll_begin = document.getElementById("scroll_begin");//获取滚动的开头id
        var scroll_div = document.getElementById("scroll_div");//获取整体的开头id
    
        var width = [];
        scroll_begin.querySelectorAll('.prizemes').forEach(function (v, k) {
            width.push(v['offsetWidth']);
        });
    
        var idx = 2;
        function marquee() {
            var len = 0;
            var tmpArr = width.slice(0, idx)
            for (var i in tmpArr) len += Number(tmpArr[i]);
            var paddLeft = $("#scroll_begin").css("padding-left");
            if (scroll_div.scrollLeft + scroll_div.offsetWidth >= len + parseInt(paddLeft)) {
                clearInterval(intervalId);
    
                if (timeoutId > 0) clearTimeout(timeoutId);
                if (idx >= width.length) {
                    var _templateTimerIdx = setTimeout(function() {
                        scroll_div.scrollLeft = 0;
                        $(".prizePlay").hide();
    
                        clearTimeout(_templateTimerIdx);
                    }, 3000);
                    return;
                }
                idx += 2
                timeoutId = setTimeout(function () {
                    intervalId = setInterval(marquee, speed);
                }, 3000)
            } else {
                scroll_div.scrollLeft++;
            }
        }
    
        intervalId = setInterval(marquee, speed);
    }

    public addTimer() {
        let self = this;
        let timeoutId: number = -1;

        this.intervalId = setInterval(function() {
            let d: Date = new Date()
            let h: number = d.getHours();

            // console.log('111', timeoutId);
            if ( $('.prizePlay').css('display') === 'block' ) return ;
            if ( timeoutId > -1 ) return ;

            switch (true) {
                case (h > 0) && (h <= 8): {
                    timeoutId = setTimeout(function(){
                        self.init();
                        clearTimeout(timeoutId);
                        timeoutId = -1;
                    }, 1000 * 60 * 30);
                }
                    break;
                case (h > 8) && (h <= 12): {
                    timeoutId = setTimeout(function(){
                        self.init();
                        clearTimeout(timeoutId);
                        timeoutId = -1;
                    }, 1000 * 60 * 12);
                }
                    break;
                case (h > 12) && (h <= 14): {
                    timeoutId = setTimeout(function(){
                        self.init();
                        clearTimeout(timeoutId);
                        timeoutId = -1;
                    }, 1000 * 60 * 6);
                }
                    break;
                case (h > 14) && (h <= 18): {
                    timeoutId = setTimeout(function(){
                        self.init();
                        clearTimeout(timeoutId);
                        timeoutId = -1;
                    }, 1000 * 60 * 12);
                }
                    break;
                case (h > 18) && (h <= 22): {
                    timeoutId = setTimeout(function(){
                        self.init();

                        clearTimeout(timeoutId);
                        timeoutId = -1;
                    }, 1000 * 60 * 2);
                }
                break;
                case (h > 22) && (h <= 0): {
                    timeoutId = setTimeout(function(){
                        self.init();
                        clearTimeout(timeoutId);
                        timeoutId = -1;
                    }, 1000 * 60 * 12);
                }
                break;
                default: {
                    self.removeTimer();
                }
                    break;
            }      
        }, 1000);
    }

    public removeTimer() {
        clearInterval(this.intervalId);
    }

}