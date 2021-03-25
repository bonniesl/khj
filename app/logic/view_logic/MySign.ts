import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";



export default class MySign extends ViewBase {

    async  onEnable() {

        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.personal);
        })

        //我的签到
        let sign = await Net.getData(Api.signature);
        //按照Id倒序排序
        let signOrder = sign['list'].sort(function (a, b) {
            return a.id - b.id;
        });
        this.getSignList(signOrder, sign['dayList']);

        //点击签到
        let $this=this;
        $(".sinBtn").click(async () => {
            let sign = await Net.getData(Api.signature, { action: 1 });
            
            let goodInfo = sign['goodsInfo'];
            //签到成功操作
            if (sign) {
                let html = ` <div class="mask"></div>
                            <div class="signSucess">
                                    <p class="tips">恭喜您</p>
                                    <div class="monGet">
                                    <span class="${goodInfo['title'].indexOf('积分') >-1 ? 'icon1' : 'icon'}"></span>
                                    <span class="num">${goodInfo['title']}</span>
                                </div>
                                <div class="okayBtn">确定</div>
                            </div>`
                $('#signDialog').html(html);
                $('#signDialog').find(".mask").show();
                $('#signDialog').find(".signSucess").addClass("slideInDown");  
               
                               
            }
        })

        //签到成功关闭
        $("#signDialog").on("click", '.okayBtn', async () => {
            $('#signDialog').find(".mask").hide();
            $('#signDialog').find(".signSucess").remove();
            $('.sinBtn').hide();
            $(".sign-action .txt").html("已签到");
            let sign =  await Net.getData(Api.signature);
            //按照Id倒序排序
            let signOrder = sign['list'].sort(function (a, b) {
                return a.id - b.id;
            });
            this.getSignList(signOrder, sign['dayList']);
        })

    }

    /**
     * 我的签到
     */
    private getSignList(list: any, dayList: any[]) {
        let html = '';
        let num;
        if (dayList.length>0 && dayList[0]['num']) {
            num = parseInt(dayList[0]['num']);
        }
        for (let x = 0; x < list.length; x++) {
            html += `<li class="days-small ${num > 0 ? 'days-disable' : ''}" data-id="${list[x]['id']}">
                        <div class="t">第${x + 1}天</div>
                        <div class="${num > 0 ? 'complete' : ''}"></div>    
                        <p class="${list[x]['title'].indexOf('积分') >-1 ? 'jfico' : 'signicon'}"></p>
                        <p class="money">${list[x]['title']}</p>
                    </li>`
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
        if (dayList.length == 0) { $('.sinBtn').show();$(".sign-action .txt").html("未签到"); return; }
        for (let x = 0; x < dayList.length; x++) {
            let time = Date.parse(dayList[x]['c_date']);
            if (time == nowTime) {
               
                $('.sinBtn').hide();
                $(".sign-action .txt").html("已签到");
                break;
            } else {
                $('.sinBtn').show();
                $(".sign-action .txt").html("未签到");

            }
        }
    }


    onClick(e) {
        console.log(e)
    }
}   