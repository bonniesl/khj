import Core from "./core/Core";
import EventType from "./common/EventType";
import Error from "./logic/error/Error";
import Data from "./common/Data";
import ViewConfig from "./common/ViewConfig";
import Utils from "./core/Utils";
import { Net, Api } from "./common/Net";
import UserData from "./common/UserData";
import Config from "./common/Config";
import Marquee from './logic/component/marquee';
import Login from './logic/component/Login';
import signDialog from './logic/component/signDialog';
import personInfo from './logic/component/personInfo';

let baseUrl = Config.baseUrl;
let htmlNum = 0;
let hitMes;
let favId: Number;  //1.收藏, 2.取消
let userInfo:any;


/**
 * 入口
 */
class Main {
    constructor() {
        this.init();
        window['core'] = Core;

        //更新底部导航状态
        Core.eventManager.on(EventType.updateBottomNav, this, this.bottomNavEvent);
        //设置禁用滚动
        Core.eventManager.on(EventType.viewScroll, this, this.setScorllStop);

        // Utils.playSound('/res/other/audio/plunderfail.mp3');   
    }


    /**微信url处理 */
    private GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
        if (r != null) return unescape(r[2]); return null;
    }

    /**
     * 初始化
     */
    private async init() {
        /**微信url处理 */
        let getString = this.GetQueryString('page');
        let linkHref = window.location.href;
        if (getString) {
            window.location.href = location.origin + location.pathname + '#' + getString + location.search;
        }

        new Error();//开启错误信息处理
        Core.root = $('#root');//设置主场景

        Core.route.init();
        this.update();

        let self = this;

         //登录
        let login = new Login();
        $("body").on("loginEvent", async () => {
            //用户信息映射 值转换

        })

        //判断微信登录
        var ua = navigator.userAgent.toLowerCase();
        var isWeixin = ua.indexOf('micromessenger') != -1;

        if (isWeixin) {
            let userInfo = await Net.getData(Api.userInfo);
            if (!userInfo) {
                var url = location.hash; //获取url中"?"符后的字串  
                var len = url.indexOf("?");
                len = len != -1 ? len + 1 : len;
                location.href = baseUrl + '/weiXin/accessToken/?sl=123&' + url.substr(len) + '&redirect_uri=' + encodeURIComponent(linkHref);
            }
            UserData.data = userInfo;
            UserData.coin = isNaN(parseInt(userInfo['coin'])) ? 0 : parseInt(userInfo['coin']);
            UserData.point = parseInt(userInfo['point']);
            UserData.moneyCoin = parseInt(userInfo['money_coin']);
            UserData.avatar = userInfo['avatar'];
            UserData.userName = userInfo['nick_name'];
            UserData.firstRecharge = userInfo['firstRecharge'];
            $("#bottomNav a").click(async(e)=>{
                let href = $(e.currentTarget).data("href");
                $(e.currentTarget).attr("href",href);
            })

            return true;
        }

        $("#bottomNav a").click(async(e)=>{
            let href = $(e.currentTarget).data("href");
            let lcsz = _czc || [];
            console.log(href);
            if(href.indexOf("personal")!=-1){
                let userInfo = await Net.getData(Api.userInfo);
                if(!userInfo){
                    lcsz.push(["_trackEvent","我的","点击登录"]);
                    $(".loginDialog").show();
                    return;
                }
            }
            if(href.indexOf("find")!=-1){
                lcsz.push(["_trackEvent","发现页","点击发现"]);
            }
            location.href=location.pathname+href;
        })

        userInfo = await Net.getData(Api.userInfo);
        if(userInfo){
            UserData.coin = isNaN(parseInt(userInfo['coin'])) ? 0 : parseInt(userInfo['coin']);
            UserData.point = parseInt(userInfo['point']);
            UserData.moneyCoin = parseInt(userInfo['money_coin']);
            UserData.avatar = userInfo['avatar'];
            UserData.userName = userInfo['nick_name'];
            UserData.firstRecharge = userInfo['firstRecharge'];
        }

        //全屏播报
        let marquee = new Marquee();
        marquee.addTimer();

    }



    /**
     *
     * @param time requestAnimationFrame 自带的时间戳
     * @param elapsed 间隔值
     */
    private update(time = 0, elapsed = 0) {// TODO 这个设计有点问题，后期需要加到一个核心代码里

        // if(elapsed > 1000 / 60){
        //     Core.eventManager.event(EventType.update);
        //     TWEEN.update(time);
        //     elapsed = 0;
        // }

        // //每帧执行一次
        // requestAnimationFrame((_time) => {
        //     this.update(_time, elapsed + _time - time);
        // });

        Core.eventManager.event(EventType.update);
        //每帧执行一次
        requestAnimationFrame((time) => {
            this.update();
            TWEEN.update(time);
        });

    }

    /**
     * 设置底部导航事件
     */
    private async bottomNavEvent(data: any) {

        let bottomNav = $('#bottomNav');
        if (data['hide']) {
            bottomNav.css({
                bottom: '-1000px'
            })
            return;
        } else {
            bottomNav.css({
                bottom: '0'
            })
        }

        if (data['type']) bottomNav.find('a').removeClass('cur');

        switch (data['type']) {
            case 'index':
                bottomNav.find('.index').addClass('cur');
                break;
            case 'find':
                bottomNav.find('.find').addClass('cur');
                break;
            case 'personal':{
                    bottomNav.find('.personal').addClass('cur');
                }
                break;
        }
    }

    /**
     * 对body和html设置overflow:hidden 禁用滚动
     */
    private setScorllStop(state: boolean) {
        if (state) {
            $('body,html').addClass('hidden');
        } else {
            $('body,html').removeClass('hidden');
        }

    }
}

new Main();