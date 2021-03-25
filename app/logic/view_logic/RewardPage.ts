import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import Config from "../../common/Config";
import Utils from "../../core/Utils";
import { Net, Api } from "../../common/Net";
import Cdialog from "../component/Cdialog";
import EventType from "../../common/EventType";

export default class RewardPage extends ViewBase {

    private cdialog: Cdialog;  //弹窗

    onAwake() {
        Core.eventManager.on(EventType.error, this, this.onError);
    }

    async onEnable() {

        this.node.on('click', '.closeSelf', () => {
            Core.viewManager.openView(ViewConfig.personal);
            Core.viewManager.closeView(ViewConfig.rewardPage);
            window.history.pushState(null, '', '#personal');
            if (Core.currentView['name'] != 'gameInner')//如果是游戏界面就直接退出游戏
                Core.eventManager.event(EventType.updateBottomNav, { hide: false });// if(Core.currentView.name != 'personal') 
        });

     

        let gameCode = Utils.getValueByUrl('gameCode');
        let gameAgain = await Net.getData(Api.gameAgain, {
            gameCode: gameCode
        });
        this.rewardsList(gameAgain['list']);

        Core.eventManager.event(EventType.viewScroll, true);
    }

    private rewardsList(list: any) {
        let rewards = $('#rewards');
        let getReward = $('#getReward');
        let self = this;
        let html: any = '';
        for (let x = 0, l = list.length; x < l; x++) {
            html += `<li data-id=${list[x]['id']}>
                    <img class="lazy" src="${Config.imgBase + list[x]['src']}" alt="">
                    <h3 class="font-clip">${list[x]['title']}</h3>
                </li>`;
        }
        $('#itemList').html(html);

        let chooseLipstick = $('#chooseLipstick'),
            index: number;
        chooseLipstick.find('img')[0].src = '';
        //点击单个口红
        rewards.on('click', 'li', function () {
            index = $(this).index();
            //设置选种口红纹理
            chooseLipstick.find('img')[0].src = Config.imgBase + list[index]['src'];
            chooseLipstick.find('.font-clip').text(list[index]['title']);
            // chooseLipstick.find('.coin').text('有问题');
            $(this).addClass('cur').siblings().removeClass('cur');
            chooseLipstick.addClass('fadeIn');
        });

        //确认领取
        rewards.on('click', 'button', async function () {
            //领取选择口红
            let gameReward = await Net.getData(Api.gameReward, {
                gameCode: Utils.getValueByUrl('gameCode'),
                id: list[index]['id']
            });
            if (gameReward) {
                $("#orderDialog").show();
                new Cdialog("#orderDialog", {
                    title: '领取成功',
                    content: '请您去奖品柜查看哦~',
                    cssTip: 'center',
                    cssPadding: '0.3rem 0 0',
                    cssLine: '1',
                    buttons: {
                        '确定': function () {
                            Core.viewManager.openView(ViewConfig.awardsBox);
                        }
                    }
                })
            }

        });

    }

    /**
    * 错误弹窗显示
    * @param data  错误提示信息
    */
    private onError(data: any) {
        switch (data['api']) {
            case Api.gameReward.name: {
                $("#orderDialog").show();
                new Cdialog(
                    "#orderDialog",
                    {
                        title: '领取失败',
                        content: data['data']['mes'],
                        cssTip: 'center',
                        cssPadding: '0.3rem 0 0',
                        cssLine: '1',
                        buttons: {
                            '再逛逛': function () {
                                location.href="#"
                            }
                        }
                    });
            }
                break;
        }
    }
    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                ${txt}
             </div>`
        $("#rewardPage").append(html);
    }


    onRemove() {
        Core.eventManager.event(EventType.viewScroll, false);
    }

    onClick(e) {
        console.log(e)
    }
}   