import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import Utils from "../../core/Utils";


export default class MyOrder extends ViewBase {

    private orderNum; //物流号
    async  onEnable() {
        // Core.viewManager.closeView(Core.preView);
        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.personal);
        })

        $('#orderList').on('click', '.infot', function () {
            this.orderNum = $(this).data('sn');
            location.href = '#orderDetail?orderNum=' +  this.orderNum;
            
        })
        $('#orderList').on('click', '.logis-btn', (e) => {
            Core.viewManager.openView(ViewConfig.logistics);
            e.stopPropagation();
        })

        let OrderList = await Net.getData(Api.OrderList);
        let awardsBox = await Net.getData(Api.awardsBox);
        this.setOrderList(OrderList, awardsBox);
    }


    /**
     * 订单列表
     * @param OrderList  订单列表
     * @param awardsBox  奖品柜列表
     */

    private setOrderList(OrderList: any, awardsBox: any) {
       
        let html = '';
        let html1 = '';
        let num = [];

        if(OrderList.length==0){
            let html1=`<div class="pageNull">
                     <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                     <p class="txt">亲，您暂无订单哦</p>
                 </div>`
             $("#orderList").html(html1);
             return;
         }


        for (let x = 0; x < OrderList.length; x++) {
            num.push(x)
            let status = '';
            if(OrderList[x]['status']==1){
                status = '确认收货';
            }else if(OrderList[x]['status']==2){
                status = '待发货';
            }else{
                status = '已发货';
            }
            html += `<li>
                    <div class="top">
                        <p class="time">${OrderList[x]['c_time']}</p>
                        <p class="stat">${status}</p>
                    </div>
                    <div class="con">
                        <div class="list">`
             let goodLists = OrderList[x]['goodLists'];  //订单
            // let goodId = [];
            // for (let y = 0; y < goodLists.length; y++) {           //订单id
            //     goodId.push(parseInt(goodLists[y]['goods_id']));
            // }
            // let orderGoods = goodId.sort(function (a, b) {   //倒序
            //     return b - a;
            // });
         
            for(let y=0;y<goodLists.length;y++){
                html += `<div class="infot" data-sn='${OrderList[x]['sn']}' data-id="${num[x]}">
                                                <div class="pic"><img src="${Config.imgBase + goodLists[y]['src']}" /></div>
                                                <div class="info">
                                                    <p class="t">${goodLists[y]['goods_title']}</p>
                                                </div>
                                            </div>`
            }
            
            html += `</div>
                        <div class="bottom">
                            <span>共计${OrderList[x]['goodLists'].length}件商品</span>
                        </div>
                    </div>
                </li>`
        }
        $("#orderList").html(html);
    }

    onClick(e) {
        console.log(e)
    }
}   