import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import Utils from "../../core/Utils";
import Config from "../../common/Config";
import UserData from "../../common/UserData";
import ErrorMap from "../../common/ErrorMap";
import { Api, Net } from "../../common/Net";
import Cdialog from "../component/Cdialog";
import ViewConfig from "../../common/ViewConfig";

/**
 * 数字游戏
 */
export default class GameNumberLogic extends ViewBase {

    isCloseAnimation: boolean = true;

    /** 当前 游戏进度 */
    private progress: number;
    /** 游戏开始 */
    private gameStart: boolean = false;
    /** 触摸 */
    private touch: boolean = false;
    /** 生成的道具列表 */
    private itemList: { node: ZeptoCollection, x: number, y: number, speed: number }[] = [];
    /** 道具id */
    private itemId: number = 0;
    /** 生成道具间隔 */
    private interval: number = 0;
    /** 关卡生成道具间隔 */
    private progressInterval: number;
    /** 速度 */
    private speed: number = 0;
    /** 口红速度 */
    private lipstickSpeed: number = 2;
    /** 口红节点 */
    private lipstickNode: { node: ZeptoCollection, x: number, y: number };
    /** 口红方向 */
    private rotate: number = 0;
    /** 游戏结束数据 */
    private endDate: any;
    /** 是否通关 */
    private pass: number = 0;
    /**选择的口红数据 */
    private rewadObj: any;
    /** 倒计时定时器 */
    private countDown: any;
    /**当前数字 */
    private currentNum: number = 0;
    /**输入的数字 */
    private inputNum: string = '';
    /** 输错判定 */
    private errorLen: number = 0;
    /** 倒计时动画定时器 */
    private countDownTween: any;
    private arr: any[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    onAwake() {

    }

    async  onEnable() {
        Core.eventManager.on(EventType.error, this, this.onError);
        Core.eventManager.event(EventType.viewScroll, true);
        Core.eventManager.event(EventType.gameInnerState, false);

        $(".prizePlay").hide();

        //绑定选择色号事件
        this.node.on('click', '#chooseColorBtn', () => {
            this.setWinViewState(false);
            if (!this.endDate) {
                console.error('丢失结束接口的数据!');
                return;
            }
            this.openRewards(this.endDate['list'], this.endDate['gameCode']);//打开领奖界面
        });

        //关闭自己单独定义类名
        this.node.on('click', '.closeSelf', () => {
            Core.viewManager.closeView(ViewConfig.gameNumber);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
        });

        //绑定去其它场次按钮跳转，目前和关闭当前游戏 功能一样
        this.node.on('click', '#goOther', () => {
            window.location.href = '#';
        });

        //分享按钮功能 => 生成分享图片
        this.node.on('click', '#shareBtn', () => {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","数字游戏分享","数字分享海报"]);
            this.onShareImage();
        });

        //打开礼品盒
        this.node.on('click', '#rewardBoxBtn', () => {
            Core.viewManager.openView(ViewConfig.awardsBox);
            Core.viewManager.closeView(ViewConfig.gameNumber);
        });

        //分享
        this.node.on('click', '#shareBtn2', () => {
            $("#shareDialogGame").show();
            Net.getData(Api.roomShare, { id: this.dataSource['roomId'] });
        })
        //关闭分享
        this.node.on('click', '#shareDialogGame', () => {
            $("#shareDialogGame").hide();
        });

        //键盘点击事件
        $('#keyboards').on('touchstart', 'i', (e: Event) => {
            this.onTouch(e.currentTarget['className'].match(/\d/)[0]);
            $(e.currentTarget).css('opacity', '0.4');
        })
        $('#keyboards').on('touchend', 'i', function () {
            $(this).css('opacity', '1');
        })

        //游戏开始
        $('#startBtn').on('click', () => {
            $('#gameDesc').addClass('hide');
            this.start();
        })


        //微信分享
        let self = this;
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;
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

        let href = window.location.href;
        let linkHref = encodeURIComponent(location.origin + location.pathname + '?page=index');

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
                            title: '我正在口红姬薅羊毛，来晚哭一年', // 分享标题
                            desc: '每天送出万支大牌正品口红，小姐姐不容错过', // 分享描述
                            link: data['mes']['url'],//wxJsdk['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: 'http://s-h5.52kouhong.com/upload/2018/ci/TOM_FORD.jpg', // 分享图标
                            success: function () {
                                // 设置成功
                                $(".shareDialogs").hide();
                            }
                        });
                        wx.onMenuShareAppMessage({
                            title: '我正在口红姬薅羊毛，来晚哭一年', // 分享标题
                            desc: '每天送出万支大牌正品口红，小姐姐不容错过', // 分享描述
                            link: data['mes']['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: 'http://s-h5.52kouhong.com/upload/2018/ci/TOM_FORD.jpg', // 分享图标
                            success: function () {
                                // 设置成功
                                $(".shareDialogs").hide();
                            }
                        });
                    })
                } else {

                    $("#shareTxt-copy1").val(data['mes']['url']);
                    console.log(data['mes']['url'], $("#shareTxt-copy").val(data['mes']['url']));
                }

            }
        });

        //复制链接
        document.querySelector('#broswerCopyBtn1').addEventListener('click', doCopy, false);

        function doCopy() {
            var el = document.querySelector('#shareTxt-copy1');

            const range = document.createRange();
            range.selectNode(el);

            const selection = window.getSelection();
            if (selection.rangeCount > 0) selection.removeAllRanges();
            selection.addRange(range);

            try {
                var rs = document.execCommand('copy');
                selection.removeAllRanges();

                rs && self.errorDialog('复制成功');
                $("#broswerDialog1").hide();
            } catch (error) {
                console.log('复制失败')
            }
        }

        //关闭浏览器分享
        $(".broswerDialog .close").click(function () {
            $(".broswerDialog").hide();
        })

        $(".shareDialogs").click(function () {
            $(".shareDialogs").hide();
        })

        //余额不足弹窗关闭
        $("#creditDialogs .close").click(function () {
            $("#creditDialogs").hide();
            Core.viewManager.closeView(ViewConfig.recharge);
        })

        //邀请好友   
        $(".inviteBtn").click(function () {
            if (isWeixin) {
                $(".shareDialogs").show();
                $("#creditDialogs").hide();
                return;
            }
            $("#creditDialogs").hide();
            $(".broswerDialog").show();
        })

    }

    /**
   * 点击事件
   * @param d 
   */
    async onClick(d: Event) {
        switch (d.target['id']) {
            case 'replay'://重玩
                this.replay();
                break;
        }
    }

    /**
     * 游戏开始
     */
    private async start() {

        if (this.dataSource && !this.dataSource['sn']) {//游戏中才算游戏开始
            //发起游戏开始请求
            let data = await Net.getData(Api.gameStart, {
                gid: this.dataSource['gid'],
                roomId: this.dataSource['roomId'],
                sign: this.dataSource['sign'],
                apiKey: this.dataSource['apiKey']
            });

            if (!data) {
                console.error('数据异常');
                return;
            }

            this.dataSource['sn'] = data['sn'];
            this.dataSource['coin'] = data['coin'];

            UserData.preset = data['reStatus'];
        }

        this.gameStart = true;
        this.init();
    }

    private init() {
        this.pass = 0;
        this.createCountDown(1500);
        this.setProgress(1);
        this.touch = true;
        this.errorLen
        this.inputNum = '';
        this.currentNum = 1;
        $('#numberBox').html(`<div id=num_${this.currentNum}></div>`);
    }

    /**
     * 游戏结束
     */
    private async over() {
        this.gameStart = false;
        this.touch = false;
        this.itemId = 0;

        if (this.countDownTween) this.countDownTween.stop();

        if (!this.dataSource) {//试玩逻辑
            let loseView = $('#loseView');
            loseView.find('h6').text('');
            loseView.find('p').text('试玩结束');
            loseView.show();
            loseView.find('#replay').html('确定');
            return;
        } else {
            $('#loseView').find('h6').text('闯关失败');
            $('#loseView').find('#replay').html('再玩一次');
        }

        let data = await Net.getData(Api.gameEnd, {
            roomId: this.dataSource['roomId'],
            sn: this.dataSource['sn'],
            step: this.progress,
            status: this.pass ? 1 : 2,
        });
        this.endDate = data;
        if (!data) {
            console.error('数据异常');
            if (confirm('数据错误，请联系客服')) {

            }
            Core.viewManager.closeView(ViewConfig.gameNumber);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
            return;
        }
        if (this.pass) {
            this.setWinViewState(true);
        } else {
            this.setOverViewState(true, data['list'][0]);
            $('#loseView').find('em').css('display', 'none');
            if (parseInt(data['coin']) < 10 && parseInt(data['give_coin'])) {
                $('#loseView').find('em').css('display', 'inline-block');
            }
        }
    }

    /**
     * 键盘事件
     * @param num 
     */
    private onTouch(num) {
        this.inputNum += num;
        let old = $('#num_' + this.currentNum);
        old.html(this.inputNum);
        old.css('z-index', 10);
        if (parseInt(this.inputNum) == this.currentNum) {
            old.animate({ transform: `translate3d(-300px,0,0)`, opacity: 0.1 }, 1000, null, () => {
                old.remove();
            });
            this.inputNum = '';
            this.currentNum++;
            this.pass = 0;
            $('#numberBox').append(`<div id=num_${this.currentNum}></div>`);
            this.errorLen = 0;
            switch (this.progress) {
                case 1:
                    this.createCountDown(2000);
                    break;
                case 2:
                    this.createCountDown(1500);
                    break;
                case 3:
                    this.createCountDown(UserData.preset == 2 ? 2000 : 300);
                    break;
            }

            if (this.currentNum == 100) {
                this.setProgress(2);
            } else if (this.currentNum == 200) {
                this.setProgress(3);
            }

            if (this.currentNum == 300) {//通关
                if (UserData.preset == 2) {//
                    this.gameStart = false;
                    this.init();
                    alert('数据非法，请勿使用任何作弊手段。违者追究法律责任!!!');
                    Core.viewManager.closeView(ViewConfig.gameNumber);
                    Core.eventManager.event(EventType.updateBottomNav, { hide: true });
                    return;
                }
                this.pass = 1;
                this.over();
                $('.progress-box').find('div').eq(3).addClass('cur').siblings().removeClass('cur');
            }

        } else {
            this.errorLen++;
            if (this.errorLen == (this.currentNum + '').length) {
                this.over();
            }
        }

    }

    /**
     * 设置关卡
     * @param num 进度
     */
    private setProgress(num: number) {
        this.progress = num;

        if (num < 3) {

            $('#keyboards').html(`<i class="key_1"></i><i class="key_2"></i><i class="key_3"></i><i class="key_4"></i><i class="key_5"></i><i class="key_6"></i><i class="key_7"></i><i class="key_8"></i><i class="key_9"></i><i class="key_0"></i>`);
        } else {
            if (!this.dataSource) {//试玩结束
                this.over();
                return;
            }
            this.arr.sort((a, b) => {
                return Math.random() - 0.5;
            });
            let html = '';
            for (let x = 0; x < this.arr.length; x++) {
                html += `<i class="key_${this.arr[x]}"></i>`;
            }
            $('#keyboards').html(html);
        }
        $('.progress-box').find('div').eq(this.progress - 1).addClass('cur').siblings().removeClass('cur');
    }

    /**
    * 重玩
    */
    private async replay() {

        if (this.dataSource) {
            let userInfo = await Net.getData(Api.userInfo, {
                roomId: this.dataSource['roomId'],
                game: 1
            });//获取用户信息

            //发起游戏开始请求
            let data = await Net.getData(Api.gameStart, {
                gid: this.dataSource['gid'],
                roomId: this.dataSource['roomId'],
                sign: userInfo['gameInfo']['sign'],
                apiKey: userInfo['gameInfo']['apiKey']
            });

            if (!data) {
                console.error('数据异常');
                return;
            }

            UserData.preset = data['reStatus'];

            this.dataSource = {
                gid: this.dataSource['gid'],//游戏id
                apiKey: userInfo['gameInfo']['apiKey'],
                sign: userInfo['gameInfo']['sign'],//签名
                roomId: this.dataSource['roomId'],//场次id
                goodsId: userInfo['gameInfo']['goodsId'],//道具id， 目前是 15， 直通第三关道具
                sn: data['sn'],//订单号
                coin: data['coin'],//剩余积分
                costCoin: this.dataSource['costCoin'],//消耗的金币
            }

            this.start();
            this.setOverViewState(false);
        } else {
            Core.viewManager.closeView(ViewConfig.gameNumber);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
        }

    }

    /**
     * 创建游戏倒计时进度条
     */
    private createCountDown(time: number) {
        let self = this;
        let coords = { width: 4.38 };
        let countDown = $('#countDown');
        if (this.countDownTween) this.countDownTween.stop();
        this.countDownTween = new TWEEN.Tween(coords).to({ width: 0.6 }, time)
            .onUpdate(() => {
                countDown.css('width', coords.width + 'rem');
            })
            .start().onComplete(() => {
                self.over();
            });
    }

    /**
     * 打开领取奖励界面
     * @param list 奖励列表 
     * @param gameCode 游戏 code
     */
    private openRewards(list: any[], gameCode: any) {
        let rewards = $('#rewards');
        let getReward = $('#getReward'),
            itemList = rewards.find('#itemList'),
            self = this;

        itemList.html('');

        //生成商品列表
        let html: any = '';
        for (let x = 0, l = list.length; x < l; x++) {
            html += `<li data-id=${list[x]['id']}>
            <img class="lazy" src="${Config.imgBase + list[x]['src']}" alt="">
            <h3 class="font-clip">${list[x]['title']}</h3>
        </li>`;
        }
        itemList.html(html);

        rewards.show();
        rewards.css({
            opacity: 0,
            // transform: 'translate3d(0,-1rem,0)'
        });
        rewards.animate({
            opacity: 1,
            // transform: 'translate3d(0,0,0)'
        }, 300, null, () => {
            // rewards.css({
            //     transform: 'none'
            // })
        });

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
            await Net.getData(Api.gameReward, {
                gameCode: gameCode,
                id: list[index]['id']
            });

            //设置成功领取口红弹窗信息
            getReward.find('img')[0].src = Config.imgBase + list[index]['src'];
            getReward.find('.name').html(list[index]['title']);

            self.rewadObj = list[index];


            $('#chooseLpstick').addClass('fadeIn');
            getReward.show();
        });


        //分享功能
        let $this = this;
        getReward.on('click', 'button', function () {
            $this.onShareImage();
            console.log('分享功能');
        });
    }

    /**
     * 关闭领取奖励界面
     */
    private closeRewards() {
        $('#rewards').off();
    }

    /**
    * 设置成功通关界面显示状态
    * @param state true显示 false 隐藏
    */
    private setWinViewState(state: boolean) {
        let view = $('#winView');
        if (state) {
            view.show();
        } else {
            view.hide();
        }
    }

    /**
    * 设置结束界面显示状态 => 失败
    * @param state 状态
    * @param list 结束返回数据
    */
    private setOverViewState(state: boolean, list?: any): void {
        let loseView = $('#loseView');

        if (!list && state) {
            alert('服务器没有返回数据');
            Core.viewManager.closeView(ViewConfig.gameNumber);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
            return;
        }
        if (state) {
            // console.error(list);
            // loseView.find('.getCoin').text(`获得${list['value']}魅力币`);//再玩0次，
            loseView.find('p').text(list['title']);//再玩0次，
            loseView.show();
        } else {
            loseView.hide();
        }
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#gameNumber").append(html);
        setTimeout(() => {
            $("#toast").remove();
        }, 600);
    }


    /**
    * 错误弹窗显示
    * @param data  错误提示信息
    */
    private onError(data: any) {

        if (data['data']['code'] == ErrorMap._6004) {
            return;
        }

        if (data['data']['code'] != ErrorMap._6005) {
            alert(data['data']['mes']);
            return;
        }


        if (data['data']['code'] == ErrorMap._6005) {
            Core.viewManager.closeView(ViewConfig.gameNumber);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
            return;
        }
    }

    /**
     * 生成分享图片功能
     */
    private onShareImage() {
        //合图片功能

        Utils.mergeImage({
            width: 750,
            hieght: 1220,
            images: [
                { src: '/res/other/poster-bg.jpg' },
                { src: Config.imgBase + this.rewadObj['src'], width: 240, height: 240, x: 250, y: 540 },
                { src: UserData.avatar, width: 90, height: 90, x: 330, y: 260 },
                { src: '/res/other/customer.jpg', width: 190, height: 190, x: 292, y: 928 }
            ],
            texts: [
                {
                    string: UserData.userName,
                    color: '#000',
                    fontSize: 24,
                    x: 375 - UserData.userName.length * 24 / 2,
                    y: 390
                },
                {
                    string: '在口红姬游戏挑战中获得',
                    color: '#EC4A57',
                    fontSize: 30,
                    x: 375 - 11 * 30 / 2,
                    y: 450
                },
                {
                    string: this.rewadObj['title'],
                    color: '#EC4A57',
                    fontSize: 30,
                    x: 375 - this.rewadObj['title'].length * 30 / 2,
                    y: 490
                }
            ]
        }).then((d) => {
            $('#shareImg').show();
            $('#shareImg').find('img')[0].src = d
        });
    }

    onRemove() {
        this.gameStart = false;
        this.touch = false;
        this.itemId = 0;
        if (this.countDownTween) this.countDownTween.stop();
        Core.eventManager.event(EventType.viewScroll, false);
        Core.eventManager.event(EventType.updateGameInnerUser);//更新用户信息
        this.node.off();
        Core.eventManager.event(EventType.gameInnerState, true);
        Core.eventManager.off(EventType.error, this.onError);
    }
}