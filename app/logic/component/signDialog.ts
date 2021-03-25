import { Net, Api } from "../../common/Net";
import ViewConfig from "../../common/ViewConfig";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import ErrorMap from "../../common/ErrorMap";

export default class signDialog {

    constructor() {
        this.init();
    }

    private async init() {
        let self = this;
        Core.eventManager.on(EventType.error, this, this.onError);
        let sign = await Net.getData(Api.signature);
        //按照Id倒序排序
        let signOrder = sign['list'].sort(function (a, b) {
            return a.id - b.id;
        });
        this.getSignList(signOrder, sign['dayList']);

        $(".sinBtn").click(function(){
            self.signEvent();
        })
    
        //签到成功关闭
        $('#signDialog').on("click",'.okayBtn',function(){
            self.closeSign();
        })
    }

    /**
     * 签到弹窗显示
     */
    private setSignDialog() {
        $('#signDialog').find(".mask").show();
        $('#signDialog').find(".signCon").addClass('slideInDown');
    }

    /**
     * 我的签到
     * @param list 
     * @param dayList 已经签到列表
     */
    private getSignList(list: any, dayList: any[]) {
        let html = '';
        let num;
        if(dayList.length>0 && dayList[0]['num']){
            num =parseInt(dayList[0]['num']);
        }
        for (let x = 0; x < list.length; x++) {
            html += `<li class="days-small ${num>0 ? 'days-disable' : ''}" data-id="${list[x]['id']}">
                        <div class="t">第${x + 1}天</div>  
                        <div class="${num>0  ? 'complete' : ''}"></div>                      
                        <p class="${list[x]['title'].indexOf('积分') >-1 ? 'jfico' : 'signicon'}"></p>
                        <p class="money">${list[x]['title']}</p>
                    </li>`;
            num--;
        }

        $("#mySignDays").html(html);
        $("#mySignDays").children("li").eq(2).addClass("days-big");
        $("#mySignDays").children("li").eq(6).addClass("days-big");


        //判断当天是否有签到
        let myDate = new Date();
        let year = myDate.getFullYear();
        let month = (myDate.getMonth() + 1).toString().replace(/^(\d)$/, "0$1");
        let date = myDate.getDate().toString().replace(/^(\d)$/, "0$1");
        let nowTime = Date.parse(year + '-' + month + '-' + date);
        if (dayList.length == 0) { this.setSignDialog(); return; }
        for (let x = 0; x < dayList.length; x++) {
            let time = Date.parse(dayList[x]['c_date']);
            if (time == nowTime) {
                $('#signDialog').find(".mask").hide();
                $(".signCon").remove();
                break;
            } else {
                this.setSignDialog();

            }
        }
    }

    /**
     * 点击签到
     */
    private async signEvent(){
        let sign = await Net.getData(Api.signature, { action: 1 });
        let goodInfo = sign['goodsInfo'];
        //签到成功操作
        if (sign) {
            $('#signDialog').find(".signCon").remove();
            let html = ` <div class="mask"></div>
                        <div class="signSucess">
                                <p class="tips">恭喜您</p>
                                <div class="monGet">
                                <span class="${goodInfo['title'].indexOf('积分') >-1 ? 'icon1' : 'icon'}"></span>
                                <span class="num">${goodInfo['title']}</span>
                            </div>
                            <div class="okayBtn">确定</div>
                        </div>`
            $('#signDialog').append(html);
            $('#signDialog').find(".mask").show();
            $('#signDialog').find(".signSucess").addClass("slideInDown");
                
        }
    }

    /**
     * 签到成功关闭
     */

     private async closeSign(){
        $('#signDialog').find(".mask").hide();
        $('#signDialog').find(".signSucess").remove();
        let userInfo = await Net.getData(Api.userInfo);
        let coninn = isNaN(parseInt(userInfo['coin'])) ? 0 : parseInt(userInfo['coin']);
        let coin: any = coninn / 100;
        let coins: any = parseInt(coin);
        $(".rechargeBtn em").text(coins);  
     }

         /**
    * 错误弹窗显示
    * @param data  错误提示信息
    */

    private onError(data: any) {
        
        if (data['data']['code'] == ErrorMap._6004) {
            return;
        }

        switch (data['api']) {
            case Api.signature.name:
                this.errorDialog(data['data']['mes']);
                this.errorTip();
                break;
        }
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast"  style="bottom:20%;">
                    ${txt}
                 </div>`
        $("#index").append(html);
        $('#signDialog').find(".mask").hide();
        $(".signCon").remove();
    }

    /**
     * 错误提示弹窗隐藏
     */
    private errorTip() {
        setTimeout(() => {
            $("#toast").remove();
        }, 1000);
    }



}