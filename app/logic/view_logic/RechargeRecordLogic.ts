import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import EventType from "../../common/EventType";

/**
 * 充值记录
 */

export default class RechargeRecordLogic extends ViewBase {


   async onEnable(){

        this.node.css({ zIndex: 1001 });

        //绑定只关闭自己界面事件
        this.node.on('click', '.closeSelf', () => {
            Core.viewManager.closeView(ViewConfig.rechargeRecord);
            if (Core.currentView['name'] != 'gameInner')//如果是游戏界面就直接退出游戏
            Core.eventManager.event(EventType.updateBottomNav, { hide: false });// if(Core.currentView.name != 'personal')
        });


        //充值记录
        let rechargeRecord = await Net.getData(Api.rechargeRecord);
        let html='';
        if(rechargeRecord.length==0){
            let html1=`<div class="pageNull">
                    <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                    <p class="txt">您暂无充值记录哦</p>
                </div>`
            $(".recRcodList").append(html1);
        } 
        for(let x=0;x<rechargeRecord.length;x++){
            let amount: any = rechargeRecord[x]['amount'] / 100;
            console.log(rechargeRecord[x]['avatar'])
            html+=`<li class="item"><a href="javascript:void(0);">
                        <img src="${rechargeRecord[x]['avatar']}" alt="">
                        <div class="wordInfo">
                            <div class="namebox">
                                <div class="name font-clip">${rechargeRecord[x]['nick_name']}</div>
                                <div class="tip">${rechargeRecord[x]['from_uid'] == rechargeRecord[x]['to_uid'] ? '自己充值' : 'TA为你充值'}</div>
                            </div>
                            <div class="timebox">
                                <div class="time">${rechargeRecord[x]['n_time']}</div>
                                <div class="tip">${parseInt(amount)}魅力币</div>
                            </div>
                        </div></a></li>`
        }
        $("#recRbox").html(html);

        Core.eventManager.event(EventType.viewScroll, true);
    }

    onClick(e) {
        console.log(e)
    }
    onRemove() {
        Core.eventManager.event(EventType.viewScroll, false);
    }
} 