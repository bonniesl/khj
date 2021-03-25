import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import Utils from "../../core/Utils";
import { Net, Api } from "../../common/Net";
import ViewConfig from "../../common/ViewConfig";
import Config from "../../common/Config";
import Slider from "../component/Slider";
import UserData from "../../common/UserData";
import EventType from "../../common/EventType";
import Cdialog from "../component/Cdialog";
import ErrorMap from "../../common/ErrorMap";
import AudioRes from "../../common/AudioRes";
import Login from '../component/Login';


/**
 * 场次详情
 */
export default class GameInner extends ViewBase {

    /**轮播图组件*/
    private slide: Slider;
    private favId: Number;  //1.收藏, 2.取消
    private favNum: Number;
    private cdialog: Cdialog;  //弹窗
    private personInfo;
    /**是否已经请求游戏 */
    private sendGame: boolean = false;

    /** 房间id */
    private roomId: any = Utils.getValueByUrl('id');
    /**用户数据 */
    private roomData: any;

    onCreate() {
        Core.viewManager.closeView(ViewConfig.recharge);
    }

    async onEnable() {
        this.sendGame = false;
        Core.viewManager.closeView(ViewConfig.recharge);
        Core.eventManager.on(EventType.error, this, this.onError);
        $('#goBack').on('click', () => {
            if (Core.preView) {
                // history.pushState(null, null, '#' + Core.preView.name);
                // Core.viewManager.openView(Core.preView);
                window.history.go(-1);
            } else {
                location.href = '#';
            }
        });

        //登录弹窗
        let self = this;
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;
        let login = new Login();
        $("body").on("loginEvent", async () => {
            //获取用户信息 
            await this.getUserData();
            self.roomData;
        })

        this.personInfo = await Net.getData(Api.userInfo);
        //设置游戏inner界面显示状态
        Core.eventManager.on(EventType.gameInnerState, this, this.onGameInnerState);
        this.onGameInnerState(true);


        //获取场次id
        // let roomId = this.dataSource;
        let roomId = Utils.getValueByUrl('id');
        let roomInfo = await Net.getData(Api.roomInfo, { id: roomId });//获取房间详情
        this.setItemList(roomInfo['goodsList']);
        this.setBanner(roomInfo['bannerList']);

        Core.eventManager.on(EventType.updateGameInnerUser, this, this.getUserData);//更新用户信息


        if (this.personInfo) {
            await this.getUserData();
        }


        // 游戏开始
        $('#gameStartBtn').on('click', async () => {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","开始随机闯关","随机闯关"]);

            Utils.playSound(AudioRes.hit);
            // Core.viewManager.openView(ViewConfig.gameElude);

            // return;
            if (this.sendGame) return;
            this.sendGame = true;

            let userInfo = this.roomData;
            if (!userInfo) {
                $(".loginDialog").show();
            }

            let gameList = roomInfo['gameList'];
            if (!gameList.length) {
                alert('游戏列表丢失!');
                return;
            }

            //获取游戏对象
            let gameObj = gameList[Math.floor(Math.random() * gameList.length)];

            //打开游戏界面
            let name = 'game';
            switch (gameObj['id']) {
                case '1': name = 'game'; break;
                case '2': name = 'gameElude'; break;
                case '3': name = 'gameNumber'; break;
            }

            if (name != 'game') {//此类的游戏在游戏中才算正式开始
                Core.viewManager.openView(ViewConfig[name], {
                    gid: gameObj['id'],//游戏id
                    apiKey: userInfo['gameInfo']['apiKey'],
                    sign: userInfo['gameInfo']['sign'],//签名
                    roomId: roomId,//场次id
                    goodsId: userInfo['gameInfo']['goodsId'],//道具id， 目前是 15， 直通第三关道具
                    sn: null,
                    coin: null,
                    progress: parseInt(userInfo['ticketInfo']['num']) > 0 ? 3 : 1,//进度默认为1
                    costCoin: parseInt(roomInfo['low_coin']),//消耗的金币
                });
                this.sendGame = false;
                return;

            }

            let data = await Net.getData(Api.gameStart, {
                gid: gameObj['id'],
                roomId: roomId,
                sign: userInfo['gameInfo']['sign'],
                apiKey: userInfo['gameInfo']['apiKey']
            });
            UserData.preset = data['reStatus'];

            this.sendGame = false;

            Core.viewManager.openView(ViewConfig[name], {
                gid: gameObj['id'],//游戏id
                apiKey: userInfo['gameInfo']['apiKey'],
                sign: userInfo['gameInfo']['sign'],//签名
                roomId: roomId,//场次id
                goodsId: userInfo['gameInfo']['goodsId'],//道具id， 目前是 15， 直通第三关道具
                sn: data['sn'],
                coin: data['coin'],
                progress: parseInt(userInfo['ticketInfo']['num']) > 0 ? 3 : 1,//进度默认为1
                costCoin: parseInt(roomInfo['low_coin']),//消耗的金币
            });


        })

        //判断当前用户是否收藏该场次
        this.favNum = await Net.getData(Api.roomFav, { id: roomId, action: 3 });
        if (this.favNum && this.favNum['collect'] == 1) {
            $("#fav").addClass("shareCur");
        }

        //微信分享
        if (isWeixin) {
            await Utils.ajax({
                url: '/src/jweixin-1.0.0.js',
                dataType: 'script'
            });
            let wxJsdk = await Net.getData(Api.wxJsdk);
            wx.config({
                //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: wxJsdk['appId'], // 必填，公众号的唯一标识
                timestamp: wxJsdk['timestamp'], // 必填，生成签名的时间戳
                nonceStr: wxJsdk['nonceStr'], // 必填，生成签名的随机串
                signature: wxJsdk['signature'],// 必填，签名
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表
            })
        }

        let linkHref = encodeURIComponent(location.origin + location.pathname + '?page=gameInner&id=' + Utils.getValueByUrl('id'));

        $.ajax({
            type: 'get',
            dataType: 'json',
            url: Api.codeShare['url'] + '?redirect_uri=' + linkHref,
            xhrFields: {
                withCredentials: true
            },
            success: (data) => {
                if (isWeixin) {
                    wx.ready(function () {
                        wx.onMenuShareTimeline({
                            title: roomInfo['title'], // 分享标题
                            desc: roomInfo['depict'], // 分享描述
                            link: data['mes']['url'],//wxJsdk['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: Config.imgBase + roomInfo['bannerList'][0]['src'], // 分享图标
                            success: function () {
                                // 设置成功
                                $(".shareDialog").hide();
                            }
                        })
                        wx.onMenuShareAppMessage({
                            title: roomInfo['title'], // 分享标题
                            desc: roomInfo['depict'], // 分享描述
                            link: data['mes']['url'],//wxJsdk['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: Config.imgBase + roomInfo['bannerList'][0]['src'], // 分享图标
                            success: function () {
                                // 设置成功
                                $(".shareDialog").hide();
                            }
                        })
                    })
                } else {
                    $("#shareTxt-copy").val(data['mes']['url']);
                }

            }

        });

        //复制链接
        document.querySelector('#broswerCopyBtn').addEventListener('click', doCopy, false);

        function doCopy() {
            var el = document.querySelector('#shareTxt-copy');

            const range = document.createRange();
            range.selectNode(el);

            const selection = window.getSelection();
            if (selection.rangeCount > 0) selection.removeAllRanges();
            selection.addRange(range);

            try {
                var rs = document.execCommand('copy');
                selection.removeAllRanges();

                rs && self.errorDialog('复制成功');
                $(".broswerDialog").hide();
            } catch (error) {
                console.log('复制失败')
            }
        }


        //用户分享文章
        $("#shareA").click(async () => {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","发现页分享","分享"]);
            if (!this.roomData) {
                $(".loginDialog").show();
                return;
            }
            if (isWeixin) {
                $(".shareDialog").show();
                return;
            }
            $(".broswerDialog").show();
            let roomShare = await Net.getData(Api.roomShare, { id: roomId });
        })
        //关闭分享
        $(".shareDialog").click(function () {
            $(".shareDialog").hide();
            $("#shareA").removeClass("shareCur");
        })

        //关闭浏览器分享
        $(".broswerDialog .close").click(function () {
            $(".broswerDialog").hide();
        })

        //充值按钮绑定
        this.node.on('click', '#rechargeBtn', () => {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","发现页充值","充值"]);
            if (!self.roomData) {
                $(".loginDialog").show();
                return;
            }
            Core.viewManager.openView(ViewConfig.recharge);
            // window.history.pushState(null, '', '#recharge');

        });

        //显示
        if (isWeixin) {
            $(".txtFav1").show();
        } else {
            $(".txtFav1").hide();
        }

        //余额不足弹窗关闭
        $("#creditDialog .close").click(function () {
            $("#creditDialog").hide();
            Core.viewManager.closeView(ViewConfig.recharge);
        })

        //邀请好友   
        $(".inviteBtn").click(function () {
            if (isWeixin) {
                $(".shareDialog").show();
                $("#creditDialog").hide();
                return;
            }
            $(".broswerDialog").show();
            $("#creditDialog").hide();
        })

        //场次修改
        $(".innerGnameBox").html(roomInfo['content']);


        //试玩按钮
        $(".innerGnameBox").on('click', '.tryBtn', (e: Event) => {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","发现试玩","试玩"]);
            Utils.playSound(AudioRes.hit);
            let index = $(e.currentTarget).parents('.swiper-slide').data('swiper-slide-index');
            let name = 'game';
            switch (index) {
                case 1:
                    name = 'gameNumber';
                    break;
                case 0:
                    name = 'gameElude';
                    break;
            }
            Core.viewManager.openView(ViewConfig[name]);

        })

        await Utils.ajax({
            url: '/src/swiper.min.3.1.js',
            dataType: 'script'
        });

        let swiper = new Swiper('.gameC-banner', {
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev',
            loop: true,
            autoplay: 5000
        });

        $(".game-Tab li").click(function () {
            let index = $(this).index();
            $(this).addClass("cur").siblings().removeClass("cur");
            $(".game-Tabcon .wrapCon").eq(index).show().siblings().hide();

        })

    }

    private async getUserData() {
        return new Promise(async (resolve) => {
            let data = await Net.getData(Api.userInfo, {
                roomId: Utils.getValueByUrl('id'),
                game: 1
            });//获取用户信息
            this.roomData = data;
            $('#gameStartBtn').text(parseInt(data['ticketInfo']['num']) > 0 ? '直通挑战第3关' : '开始随机闯关');
            resolve(data);
        })
    }

    /**
     * 设置banner
     */
    private setBanner(list: any[]) {
        let html = '';
        for (let x = 0, l = list.length; x < l; x++) {
            if (!list[x]['src']) continue;
            html += `<img class="lazy" data-src="${Config.imgBase + list[x]['src']}" />`
        }
        //$('#banner').html(Core.utils.replaceData('banner', $('#banner').html(), html));
        lazyload($(".lazy"));
        // this.slide = new Slider('#banner');

    }

    /**
     * 添加色号展示
     */
    private setItemList(list: any[]) {
        let html: string = '';
        for (let x = 0, l = list.length; x < l; x++) {
            html += `<li class="item">
            <img class="lazy" data-src="${Config.imgBase + list[x]['src']}" alt="">
            <p>${list[x]['title']}</p>
        </li>`
        }
        $('#contBox').html(html);
        lazyload($(".lazy"));
    }

    /**
    * 点赞
    */
    async favVote() {
        let fav = this.node.find("#fav");
        fav.hasClass("shareCur") ? fav.removeClass("shareCur") : fav.addClass("shareCur");
        if (fav.hasClass("shareCur")) {
            this.favId = 1;
        } else {
            this.favId = 2;
        }

        let roomFav = await Net.getData(Api.roomFav, { id: Utils.getValueByUrl('id'), action: this.favId });
    }

    /**
     * 错误弹窗显示
     * @param data  错误提示信息
     */

    private onError(data: any) {

        if($(".loginDialog").css("display")=="block"){
            return;
        }

        if (data['data']['code'] == ErrorMap._6004) {
            return;
        }
        if (data['data']['code'] == ErrorMap._6012) {
            this.sendGame = false;
            return;
        }


        if (data['data']['code'] != ErrorMap._6005) {
            alert(data['data']['mes']);
            return;
        }

        if (data['data']['code'] == ErrorMap._6005) {
            $("#creditDialog").show();
            $(".reBtn").click(function () {
                let lcsz = _czc || [];
                lcsz.push(["_trackEvent","果断充值","点击充值"]);
                Core.viewManager.openView(ViewConfig.recharge);
            })
            return;
        }
    }

    /**
     * 设置游戏inner界面显示状态
     */
    private onGameInnerState(state) {
        this.node.css('display', state ? 'block' : 'none');
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#gameInner").append(html);
        setTimeout(() => {
            $("#toast").remove();
        }, 600);
    }

    onClick(e: Event) {
        switch (e.target['className']) {
            case 'icon shareFavico': {//点赞
                let lcsz = _czc || [];
                lcsz.push(["_trackEvent","发现页点赞","点赞"]);
                if (!this.roomData) {
                    $(".loginDialog").show();
                    return;
                }
                this.favVote();
            }
                break
        }
    }

    onRemove() {
        $('#gameStartBtn').off();
        $(".loginDialog").hide();
        // this.slide.clearTime();
        this.slide = null;
        Core.eventManager.off(EventType.error, this.onError);
        Core.eventManager.off(EventType.updateGameInnerUser, this.getUserData);
        Core.eventManager.event(EventType.viewScroll, false);
    }
}   