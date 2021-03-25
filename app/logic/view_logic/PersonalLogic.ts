import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import ViewConfig from "../../common/ViewConfig";
import Config from "../../common/Config";
import { Net, Api } from "../../common/Net";
import Cdialog from "../component/Cdialog";
import Login from '../component/Login';
import personInfo from '../component/personInfo';


export default class PersonalLoogic extends ViewBase {

     /***/
Cdialog: Cdialog;

  async  onEnable() {
    
        // Core.viewManager.closeView(Core.preView);

        //更新底部导航状态
        Core.eventManager.event(EventType.updateBottomNav, { type: 'personal' });

        //返回上一个界面 或是 上一步
        $('#goBack').on('click', () => {
            if (Core.preView) {
                // window.location.href =  '#' + Core.preView.name;
                history.go(-1);
            } else {
                window.location.href = '#index';
            }
           
        });
      
        this.bindClick();

         
        //登录
        let login = new Login();
        $("body").on("loginEvent", async () => {
            //获取用户信息
            let userInfo = new personInfo();      
        })
        
       
        //用户信息
         let userInfo=await Net.getData(Api.userInfo,{userMes:1,userGoods:1});
        if(!userInfo){
            $(".loginDialog").show();
            return;
        }
        this.setUserInfo(userInfo) 
              
         //消息提示
        if (parseInt(userInfo['userMesCount'])>0) {
            $("#email em").show();
        } else {
            $("#email em").hide();
        }

        //奖品柜提示
        if (parseInt(userInfo['userGoodsCount'])>0) {
            $("#awardsBox em").show();
        } else {
            $("#awardsBox em").hide();
        }

        //广告链接
        $(".adBanner").click(function(){
            location.href='/#gameInner?id=6';
        })


        swan.webView.getEnv(function(res) { 
            if(res.smartprogram==true){
                $("#serviceBtn").hide();
            }else{
                $("#serviceBtn").show();
            }
       })
    }

    /**
     * 用户信息
     */
    private setUserInfo(userInfo:any[]){
        let html='';
        let coin: any = userInfo['coin'] / 100;
        let coins: any = parseInt(coin);
        html=`<div class="headport">
                <img src="${userInfo['avatar']}" alt="">
            </div>
            <div class="tit">
                <h3>${userInfo['nick_name']}</h3>
                <p>我的魅力币：${coins}</p>
                <p>我的积分数：${userInfo['point']}</p>
            </div>`
       $("#headportbox").html(html);
    }

    /**
     * 按钮绑定
     */
    private bindClick() {
        let self = this;
        //头像下面按钮绑定
        $('#userBtnList').on('click', 'li', function () {
            self.onClickEvent(this)
        });
        //广告图片下面按钮绑定
        $('#userBtnList2').on('click', 'li', function () {
            self.onClickEvent(this)
        });
        //充值按钮
        $('#rechargeBtn').on('click', function () {
            self.onClickEvent(this)
        })
    }

    /**
     * 所有按钮点击事件
     */
    private onClickEvent(target: HTMLElement) {
        let view: viewConfig;
        switch (target.id) {
            case 'mySign'://我的签到
                view = ViewConfig.mySign;
                break
            case 'rechargeBtn'://充值
                view = ViewConfig.recharge;
                break;
            case 'integralBtn'://积分
                this.errorDialog('暂未开放，敬请期待~');
                this.errorTip();
                break;
            case 'awardsBox'://奖励柜
                view = ViewConfig.awardsBox;
                break;
            case 'email'://邮箱
                view = ViewConfig.email;
                break;
            case 'orderBtn'://订单
                view = ViewConfig.myOrder;
                break;
            case 'collectBtn'://我的收藏
                view = ViewConfig.collect;
                break;
            case 'shareBtn'://我的分享
                view = ViewConfig.myShare;
                // this.errorDialog('暂未开放，敬请期待~');
                // this.errorTip();
                break;
            case 'addressBtn'://地址管理
                view = ViewConfig.addresses;
                break;
            case 'serviceBtn'://联系客服
                view = ViewConfig.customer;
                break;
            default:
                return;
        }
        if (!view) {
            console.error('界面丢失');
            return;
        }
        Core.viewManager.openView(view);
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#personal").append(html);
    }

    /**
     * 错误提示弹窗隐藏
     */
    private errorTip() {
        setTimeout(() => {
            $("#toast").remove();
        }, 800);
    }

    onRemove() {
        $('#userBtnList').off();
        $(".loginDialog").hide();
        $('#goBack').off();
    }

}   