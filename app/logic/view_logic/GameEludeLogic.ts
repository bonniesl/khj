import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import ErrorMap from "../../common/ErrorMap";
import Cdialog from "../component/Cdialog";
import { Api, Net } from "../../common/Net";
import ViewConfig from "../../common/ViewConfig";
import Utils from "../../core/Utils";
import UserData from "../../common/UserData";
import Config from "../../common/Config";

/**
 * 躲避游戏
 */
export default class GameEludeLogic extends ViewBase {
    isCloseAnimation: boolean = true;

    /** 当前 游戏进度 */
    private progress: number;
    /** 游戏开始 */
    private gameStart: boolean = false;
    /** 触摸 */
    private touch: boolean = false;
    /** 生成的道具列表 */
    private itemList: { node: ZeptoCollection, x: number, y: number, speed: number }[] = [];
    /** 道具容器节点 */
    private itemBox: ZeptoCollection;
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
    //进度条定时器
    private preesTimeOut: any;

    onAwake() {

    }

    async  onEnable() {
        this.itemBox = $('#itemBox');
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
            Core.viewManager.closeView(ViewConfig.gameElude);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
        });

        //绑定去其它场次按钮跳转，目前和关闭当前游戏 功能一样
        this.node.on('click', '#goOther', () => {
            window.location.href = '#';
        });

        //分享按钮功能 => 生成分享图片
        this.node.on('click', '#shareBtn', () => {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","躲避游戏分享","躲避分享海报"]);
            this.onShareImage();
        });

        //打开礼品盒
        this.node.on('click', '#rewardBoxBtn', () => {
            Core.viewManager.openView(ViewConfig.awardsBox);
            Core.viewManager.closeView(ViewConfig.gameElude);
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

        this.node.on('touchstart', (e: TouchEvent) => {
            this.onTuchStart();
        });

        this.lipstickNode = {
            node: $('#eludeLipstick'),
            x: 0,
            y: 300
        }
        this.setLipstick(this.node.width() / 2 - 30);

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
                console.log(data)
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
                    console.log(data['mes']['url'], $("#shareTxt-copy1").val());
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
                $(".broswerDialog").hide();
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
        this.setProgress(1);
    }

    /**
     * 游戏结束
     */
    private async over() {
        this.gameStart = false;
        this.touch = false;
        this.itemId = 0;

        this.clearCountDown();

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
            Core.viewManager.closeView(ViewConfig.gameElude);
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
            Core.viewManager.closeView(ViewConfig.gameElude);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
        }

    }

    /**
     * 触摸事件
     */
    private onTuchStart() {
        if (!this.gameStart) return;
        this.rotate = !this.rotate ? 180 : 0;
    }


    /**
     * 设置关卡
     * @param num 进度
     */
    private setProgress(num: number) {
        this.progress = num;
        this.touch = false;

        this.clearItem();

        switch (this.progress) {
            case 1:
                this.progressInterval = 60;
                break;
            case 2:
                this.progressInterval = UserData.preset == 2 ? 30 : 45;
                break;
            case 3:
                if (!this.dataSource) {//试玩结束
                    this.over();
                    return;
                }
                if (UserData.preset == 2) {
                    this.progressInterval = 15;
                } else {
                    this.progressInterval = 30;
                }
                break;
        }
        $('.progress-box').find('div').eq(this.progress - 1).addClass('cur').siblings().removeClass('cur');

        //过度动画
        let progressIcon = $('#progressIcon');
        progressIcon.css({
            opacity: '0',
            transform: 'translate3d(0, -1.5rem, 0)'
        });
        progressIcon.removeClass('hide');
        progressIcon.removeClass('icon_1');
        progressIcon.removeClass('icon_2');
        progressIcon.removeClass('icon_3');
        progressIcon.addClass('icon_' + num);

        progressIcon.animate({ opacity: 1, transform: 'translate3d(0, 0, 0)' }, 600, 'ease');

        if (this.preesTimeOut) clearTimeout(this.preesTimeOut);
        this.preesTimeOut = setTimeout(() => {
            progressIcon.animate({ opacity: 0, transform: 'translate3d(0, 1.5rem, 0)' }, 600, 'ease', () => {
                progressIcon.addClass('hide');
                // this.init(); 
                this.createCountDown();
                this.touch = true;
            });
        }, 2000)
    }

    /**
     * 设置口红位置
     */
    private setLipstick(x: number, y?: number) {
        this.lipstickNode.x = x;
        if (x + 45 > this.node.width()) {
            this.rotate = 180;
        } else if (x < 0) {
            this.rotate = 0;
        }
        this.lipstickNode.node.css('transform', `translate3d(${this.lipstickNode.x}px, ${this.lipstickNode.y}px, 0) rotate(${this.rotate}deg)`);
    }

    /**
     * 场景里添加一个道具
     */
    private addItem() {
        this.itemBox.find('.item-content').append(`<i id="item${this.itemId}" class="item-${Math.ceil(Math.random() * 3)} absolute"></i>`);
        this.itemList.push({
            node: this.itemBox.find('#item' + this.itemId),
            x: Math.ceil(Math.random() * (this.node.width() / 90) * 90),
            y: 0,
            speed: this.progress == 3 ? UserData.preset == 2 ? 2 : 4 : 2//这里到时候可能要根据关卡来调速度
        })
        this.itemId++;
    }

    /**
    * 清除界面道具
    */
    private clearItem() {
        this.itemList = [];
        this.itemBox.find('.item-content').empty();
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
            Core.viewManager.closeView(ViewConfig.gameElude);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
            return;
        }
        if (state) {
            // console.error(list);
            // loseView.find('.getCoin').text(`获得${list['value']}魅力币`);//再玩0次，，
            loseView.find('p').text(list['title']);//再玩0次，
            loseView.show();
        } else {
            loseView.hide();
        }
    }

    /**
    * 设置定时器显示
    */
    private updateCountLabel(time: number) {
        $('#countDown').text(time + '');
        $('#countDownBox').css('width', 0.174 * time + 0.8 + 'rem');
    }

    /**
     * 创建定时器
     */
    private createCountDown() {
        let self = this;
        if (!this.gameStart) return;
        this.clearCountDown();
        let time: number = 30;//倒计时
        this.updateCountLabel(time);
        this.countDown = setTimeout(countDown, 1000);
        function countDown() {
            console.log(22);
            time--;
            self.updateCountLabel(time);
            if (time <= 0) {
                self.progress++;
                if (self.progress > 3) {
                    self.progress = 3;
                    if (UserData.preset == 2) {//
                        alert('数据非法，请勿使用任何作弊手段。违者追究法律责任!!!');
                        self.gameStart = false;
                        self.touch = false;
                        self.itemId = 0;

                        self.clearCountDown();
                        Core.viewManager.closeView(ViewConfig.gameElude);
                        Core.eventManager.event(EventType.updateBottomNav, { hide: true });
                        return;
                    }
                    self.pass = 1;
                    self.over();
                    console.log('通关了')
                    time = 0;
                    $('.progress-box').find('div').eq(3).addClass('cur').siblings().removeClass('cur');
                } else {
                    self.pass = 0;
                    self.setProgress(self.progress);
                }

                return;
            }

            self.clearCountDown();
            if (time) self.countDown = setTimeout(countDown, 1000);
        }
    }

    /**
     * 关闭定时器
     */
    private clearCountDown() {
        if (this.countDown) clearTimeout(this.countDown);
    }


    onUpdate() {
        if (!this.gameStart || !this.touch) return;
        this.interval++;
        if (this.interval >= this.progressInterval) {
            this.addItem();
            this.interval = 0;
        }
        for (let x = this.itemList.length - 1; x > -1; x--) {
            this.itemList[x].y += this.itemList[x].speed;
            this.itemList[x].node.css('transform', `translate3d(${this.itemList[x].x}px,${this.itemList[x].y}px,0)`);
            if (this.itemList[x].y > 1000) {
                this.itemList[x].node.remove();
                this.itemList.splice(x, 1);
                x++;
            }

            //碰撞检测
            if (Utils.getPositionLength(
                { x: this.lipstickNode.x + this.lipstickNode.node.width() / 2, y: this.lipstickNode.y + this.lipstickNode.node.width() / 2 },
                { x: this.itemList[x].x + this.itemList[x].node.width() / 2, y: this.itemList[x].y + this.itemList[x].node.width() / 2 }
            ) < this.itemList[x].node.width() / 2 + this.lipstickNode.node.width() / 2) {
                this.over();
            }
        }

        if (this.rotate) {
            this.lipstickNode.x -= this.lipstickSpeed;
        } else {
            this.lipstickNode.x += this.lipstickSpeed;
        }

        this.setLipstick(this.lipstickNode.x)
    }

    /**
    * 错误提示HTML
    */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#gameElude").append(html);
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
            Core.viewManager.closeView(ViewConfig.gameElude);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
            return;
        }
    }

    /**
     * 生成分享图片功能
     */
    private onShareImage() {
        //合图片功能
        if (!UserData.avatar) {
            alert('头像地址丢失，请联系客服!');
        }
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
        this.clearCountDown();
        if (this.preesTimeOut) clearTimeout(this.preesTimeOut);
        clearInterval();
        Core.eventManager.event(EventType.viewScroll, false);
        Core.eventManager.event(EventType.updateGameInnerUser);//更新用户信息
        this.node.off();
        Core.eventManager.event(EventType.gameInnerState, true);
        Core.eventManager.off(EventType.error, this.onError);
    }
}