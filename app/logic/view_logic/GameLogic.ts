import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import { Net, Api } from "../../common/Net";
import UserData from "../../common/UserData";
import Config from "../../common/Config";
import Utils from "../../core/Utils";
import AudioRes from "../../common/AudioRes";
import ErrorMap from "../../common/ErrorMap";
import Cdialog from "../component/Cdialog";

/**
 * 游戏逻辑
 */
export default class GameLogic extends ViewBase {


    private dial: ZeptoCollection;
    /**转盘正在旋转角度 */
    private angle: number = 0;
    /**转速度 */
    private speed: number = 1;
    /**当前场景要射口红 */
    private currentLipstick: ZeptoCollection;
    /**游戏场景 */
    private gameView: ZeptoCollection;
    /**已经插的飞刀的角度列表 通过角度来判断碰撞 */
    private angles: number[] = [];
    /**射击次数递增 */
    private addNum: number = 0;
    /**随机方向 */
    private randomAngle: number = 1;
    /**游戏是否开始 */
    private start: boolean = false;
    /** 是否可点击 */
    private click: boolean = false;
    /** 是否已经失败 */
    private failed: boolean = false;
    /**三个关卡的口红数 */
    private lipstickNumbers: number[] = [
        8, 10, 13
    ];
    /**当前关卡 */
    private progress: number;
    /**当前 关卡的口红数 */
    private lipsticks: number;
    /** 口红数据 用于播动画 */
    private curLipsticks: number;
    /** 是否通关 */
    private pass: number = 0;
    /** 倒计时定时器 */
    private countDown: any;
    /** 抖动值 */
    private snakeNum: number = 0;
    /** 游戏结束数据 */
    private endDate: any;
    /**播放动画 */
    private playAni: boolean = false;
    /** 射击列表 */
    private shootList: any[] = [];
    /***失败时的角度 */
    private loseAngle: number = 0;
    /**选择的口红数据 */
    private rewadObj: any;
    /** 一个递增的值用来第二关做随机触发的概率引 */
    private gameAddNum: number = 0;
    private gameAddNumRandom: number = 1;

    //进度条定时器
    private preesTimeOut: any;


    isCloseAnimation: boolean = true;

    async  onEnable() {
        Core.eventManager.on(EventType.error, this, this.onError);
        Core.eventManager.event(EventType.viewScroll, true);
        Core.eventManager.event(EventType.gameInnerState, false);
        this.dial = $('#dial');
        this.node.css({ zIndex: 100 });
        this.gameView = $('#gameView');


        this.onStart();

        $(".prizePlay").hide();


        //关闭自己单独定义类名
        this.node.on('click', '.closeSelf', () => {
            Core.viewManager.closeView(ViewConfig.game);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
        });


        //绑定选择色号事件
        this.node.on('click', '#chooseColorBtn', () => {
            this.setWinViewState(false);
            if (!this.endDate) {
                console.error('丢失结束接口的数据!');
                return;
            }
            this.openRewards(this.endDate['list'], this.endDate['gameCode']);//打开领奖界面
        });

        //绑定去其它场次按钮跳转，目前和关闭当前游戏 功能一样
        this.node.on('click', '#goOther', () => {
            window.location.href = '#';
        });

        //分享按钮功能 => 生成分享图片
        this.node.on('click', '#shareBtn', () => {
            //  this.onShareImage()
            //  this.onShareImage();
        });

        //打开礼品盒
        this.node.on('click', '#rewardBoxBtn', () => {
            Core.viewManager.openView(ViewConfig.awardsBox);
            Core.viewManager.closeView(ViewConfig.game);
        });

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
                $("#broswerDialog1").hide();
            } catch (error) {
                console.log('复制失败')
            }
        }

        //关闭浏览器分享
        $(".broswerDialog .close").click(function () {
            $(".broswerDialog").hide();
        })


        //分享
        this.node.on('click', '#shareBtn2', () => {
            $("#shareDialogGame").show();
            Net.getData(Api.roomShare, { id: this.dataSource['roomId'] });
        })
        //关闭分享
        this.node.on('click', '#shareDialogGame', () => {
            $("#shareDialogGame").hide();
        });

        $(".shareDialogs").click(function () {
            $(".shareDialogs").hide();
        })

        // this.node.on('touchmove', '#rewards',function(e){
        //     e.stopPropagation();
        //     e.preventDefault();
        // })
        // this.node.on('touchmove',function(){
        //     return false;
        // })

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

        let images = document.querySelectorAll(".lazy");
        lazyload($(".lazy"));

        this.dial.find('.dial').css({
            transform: `scale(0, 0)`
        });

    }

    /**
     * 游戏开始
     */
    private onStart(): void {
        this.endDate = null;
        this.start = true;
        this.setProgressState();
        if (this.dataSource) {
            this.setProgress(this.dataSource['progress'] ? this.dataSource['progress'] : 1);
        } else {
            this.setProgress(1);
        }

        this.failed = false;
    }

    /**
     * 初始化
     */
    private init() {// 这里代码需要拆分 优化 针对 重玩
        this.angles = [];

        this.dial.find('.lipstick-box').remove();


        this.dial.css({
            transform: `translateY(0)`,// rotate(${this.loseAngle}deg)
            opacity: 1,
        });

        this.dial.find('.dial').css({
            transform: `scale(0, 0)`
        });

        //转盘动画
        let coords = { scale: 0 };
        new TWEEN.Tween(coords).to({ scale: 1 }, 600)
            .easing(TWEEN.Easing.Back.Out)
            .onUpdate(() => {
                this.dial.find('.dial').css({
                    transform: `scale(${coords.scale}, ${coords.scale})`
                });
            })
            .start().onComplete(() => {//初始化逻辑
                this.click = true;
                this.setLipstickNumbers();
                this.createCountDown();

                this.addShootLipstick();
            });


    }

    /**
     * 游戏结束
     */
    private async onOver() {
        if (!this.start) return;
        this.start = false;
        this.click = false;

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
            Core.viewManager.closeView(ViewConfig.game);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
            return;
        }
        if (this.pass) {
            this.setWinViewState(true);
        } else {
            // this.setWinViewState(true);
            this.setOverViewState(true, data['list'][0]);
            $('#loseView').find('em').css('display', 'none');
            if (parseInt(data['coin']) < 10 && parseInt(data['give_coin'])) {
                $('#loseView').find('em').css('display', 'inline-block');
            }
        }


    }

    /**
    * 点击事件
    * @param d 
    */
    async onClick(d: Event) {
        if (this.click && this.start) {
            this.shoot();
        } else {
            switch (d.target['id']) {
                case 'replay'://重玩
                    this.replay();
                    break;
            }
        }
    }

    /**
     * 重玩
     */
    private async replay() {
        this.failed = false;
        this.shootList = [];
        this.dial.find('.lipstick-box').remove();

        this.dial.css({
            opacity: 0,
        });

        this.dial.find('.dial').css({
            transform: `scale(0, 0)`
        });

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
            this.onStart();
            this.setOverViewState(false);
        } else {
            Core.viewManager.closeView(ViewConfig.game);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
        }


    }

    /**
     * 设置开始的头卡
     * @param state 
     */
    private setProgress(progress) {
        this.progress = progress;
        if (progress == 3 && !this.dataSource) {
            this.onOver();
            return;
        }
        this.setProgressView();
        //添加现有可手口红之前清除之前的所有口红
        $('#lipstickOuter').empty();

    }

    /**
     * 设置结束界面显示状态 => 失败
     * @param state 状态
     * @param list 结束返回数据
     */
    private setOverViewState(state: boolean, list?: any): void {
        let loseView = $('#loseView');
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
     * 射击
     * @param angle  
     */
    private shoot(): void {
        if (!this.lipsticks) return;

        let self = this;
        let addNum = this.addNum;
        let node = $('#current-lipstick-' + addNum);
        let h: number = window.innerHeight - (parseFloat(this.dial.css('top').match(/[0-9|\.]+/g)[0]) + parseFloat(node.css('bottom').match(/[0-9|\.]+/g)[0]));
        if (!this.start) return;
        self.setLipstickStatus();

        this.shootList.push([node, 0, h - this.dial.css('height').match(/[0-9|\.]+/g)[0]]);

        // this.currentLipstick = null;
        if (this.start && this.lipsticks) self.addShootLipstick();



    }

    /**
     * 射中抖动效果 => 数值
     */
    private hitSnake() {
        this.snakeNum = 5;
    }

    /**
     * 检测碰撞
     * @param angle 
     */
    private collision(angle: number): boolean {
        let list = this.angles;
        for (let x = list.length - 1; x > -1; x--) {
            if (list[x] + 15 > angle && angle > list[x] - 15) {
                return true;
            }
        }
        return false;
    }

    /**
     * 转盘上面添加一个口红
     */
    private dialAddLipstick(angle: number): void {
        this.angles.push(angle);
        let pos: pos = Core.utils.getPositionByAngle(angle, 2.05, { x: 2.05, y: 2.05 });//left:${pos.x}rem;top:${pos.y}rem;
        let lipstick: string = `<div class="lipstick-box absolute" style="left:${pos.x}rem;top:${pos.y}rem"><i class="lipstick" style="transform:rotate(${angle - 90}deg);"></i></div>`;
        this.dial.append(lipstick);
    }

    /**
     * 获取当前要插入点的转盘的角度
     */
    private getAngle(): number {
        let angle = this.angle - 90;
        angle = (360 - angle) % 360;
        return Math.ceil(angle);
    }

    /**
     * 添加一个可以射的口红
     */
    private addShootLipstick(): void {
        this.addNum++;
        let lipstick: string = `<div id=current-lipstick-${this.addNum} class="lipstick-box absolute shoot-lipstick current-lipstick"><i class="lipstick"></i></div>`;
        $('#lipstickOuter').append(lipstick);
        this.currentLipstick = $('#current-lipstick-' + this.addNum);
        this.currentLipstick.animate({ opacity: 1 }, 300);
    }

    /**
     * 根据关卡进度设置口红数量
     */
    private setLipstickNumbers() {
        if (!this.progress) return;
        let len = this.lipstickNumbers[this.progress - 1],//获取口红数量
            html = '';
        for (let x = 0; x < len; x++) {
            html += '<i></i>'
        }
        $('#shootList').html(html);
        this.lipsticks = len;
        this.curLipsticks = len;
    }

    /**
     * 根据剩余口红数量设置口红数量显示状态
     */
    private setLipstickStatus() {
        this.lipsticks--;
        let len = this.lipstickNumbers[this.progress - 1];
        $('#shootList').find('i').eq(len - this.lipsticks - 1).addClass('shoot');
        if (this.lipsticks <= 0) {
            this.lipsticks = 0;
            this.click = false;
        }
    }

    /**
     * 播放口红掉落动画
     */
    private playDropAnimation() {
        if (this.playAni) return;
        this.playAni = true;
        let coords = { y: 0, alpha: 1 };
        new TWEEN.Tween(coords).to({ y: 1000, alpha: 0 }, 1600)
            .easing(TWEEN.Easing.Back.InOut)
            .onUpdate(() => {
                this.dial.css({
                    transform: `translateY(${coords.y}px) rotate(${this.angle}deg)`,
                    opacity: coords.alpha
                });
            })
            .start().onComplete(() => {
                if (this.start) this.next();
                this.playAni = false;
            });

        if (this.progress == 3) {//已经通关
            Utils.playSound(AudioRes.win2);
            Utils.playSound(AudioRes.win3);
        } else {
            Utils.playSound(AudioRes.win);
        }
    }

    /**
     * 下一关
     */
    private next() {
        if (this.progress == 3) {//已经通关
            if (UserData.preset == 2) {//
                alert('数据非法，请勿使用任何作弊手段。违者追究法律责任!!!');
                Core.viewManager.closeView(ViewConfig.game);
                Core.eventManager.event(EventType.updateBottomNav, { hide: true });
                return;
            }
            this.pass = 1;
            this.onOver();
            // this.start = false;
            // this.click = false;
            console.log('通关');

            return;
        }
        if (!this.start) return;
        this.progress++;
        this.setProgress(this.progress);
        // this.init();
    }

    /**
     * 根据关卡进度打开进度开始界面 => 难度修改
     */
    private setProgressView() {
        if (!this.progress) return;
        let css: string;

        let dial = $('#dial').find('.dial');
        dial.removeClass('dial-icon-1');
        dial.removeClass('dial-icon-2');
        dial.removeClass('dial-icon-3');

        switch (this.progress) {
            case 1:
                this.speed = 3;
                // this.speed = 2;
                css = 'pro_1';
                dial.addClass('dial-icon-1');
                break;
            case 2:
                // this.speed = 2;
                this.speed = 2;
                css = 'pro_2';
                dial.addClass('dial-icon-2');
                break;
            case 3:
                if (UserData.point == 2) {
                    this.speed = 3.5;
                } else {
                    this.speed = 2;
                }
                css = 'pro_3';
                dial.addClass('dial-icon-3');
                break;
        }

        this.setProgressState();


        //过度动画
        let progressView = $('#progressView');
        progressView.find('i')[0].className = css;
        progressView.css({
            opacity: '0',
            display: 'flex',
            transform: 'translate3d(0, -1.5rem, 0)'
        });

        progressView.animate({ opacity: 1, transform: 'translate3d(0, 0, 0)' }, 600, 'ease');
        if (this.preesTimeOut) clearTimeout(this.preesTimeOut);
        this.preesTimeOut = setTimeout(() => {
            progressView.animate({ opacity: 0, transform: 'translate3d(0, 1.5rem, 0)' }, 600, 'ease', () => {
                progressView.css({
                    display: 'hidden'
                });
                this.init();
                // this.click = true;
            });
        }, 2000)
    }

    /**
     * 更新当前已经完成的进度状态显示
     */
    private setProgressState() {
        for (let x = 0; x < 3; x++) {
            if (x <= this.progress - 1) {
                $('#progressBox').find('i').eq(2 - x).removeClass('gray');
            } else {
                $('#progressBox').find('i').eq(2 - x).addClass('gray');
            }
        }
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
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","得奖分享","分享海报"]);
            $this.onShareImage();
            
        });
    }

    /**
     * 关闭领取奖励界面
     */
    private closeRewards() {
        $('#rewards').off();
    }

    onUpdate() {
        if (!this.start || this.playAni) return;

        switch (this.progress) {
            case 2:
                this.gameAddNum++;
                if (this.gameAddNum > 100) {
                    this.gameAddNumRandom = (Math.random() < 0.5 ? 1 : -1);
                    this.gameAddNum = 0;
                }
                this.angle += this.speed * this.gameAddNumRandom;
                break;
            case 3:
                if (UserData.preset == 2) {//必不中逻辑增加难度 
                    this.angle += (this.speed + this.angles.length * 0.4) * this.randomAngle;
                } else {
                    this.angle += (this.speed + this.angles.length * 0.025) * this.randomAngle;
                }
                // this.angle += this.speed;

                break;
            default:
                this.angle += this.speed;
                break;
        }

        // + this.angles.length * 0.2 加速度   * this.randomAngle 随机方向
        if (this.angle > 360) this.angle = 0;
        this.snakeNum--;
        if (this.snakeNum < 0) this.snakeNum = 0;
        if (this.dial) this.dial.css(
            { transform: `rotate(${this.angle}deg) translate3d(${-this.snakeNum}px,${this.snakeNum}px,0)` });


        let list = this.shootList,
            self = this;
        for (let x = 0; x < list.length; x++) {
            list[x][1] += 20;
            if (list[x][1] > list[x][2]) {
                list[x][1] = list[x][2];

                self.loseAngle = this.angle;
                /**
                 * 射的动画效果 后期需要优化
                 * 
                 */
                self.curLipsticks--;
                if (self.curLipsticks <= 0) self.curLipsticks = 0;

                let angle = self.getAngle(),
                    node = list[x][0];

                if (self.collision(angle)) {
                    self.pass = 0;
                    self.click = false;
                    self.failed = true;

                    console.log('碰撞');
                    // node.animate({ transform: 'translate3d(700px,800px,0)' }, 2000, null, function () {
                    //     // alert(1); rotate(1800deg)
                    //     self.onOver();
                    //     node.remove();
                    // });
                    Utils.playSound(AudioRes.failed);
                    let coords = { y: -list[x][2], angle: 0 };
                    new TWEEN.Tween(coords).to({ y: 800, angle: 1800 }, 2000)
                        // .easing(TWEEN.Easing.Back.InOut)
                        .onUpdate(() => {
                            node.css({ transform: `translate3d(${Math.abs(0)}px,${coords.y}px,0) rotate(${coords.angle}deg)` });
                        })
                        .start().onComplete(() => {
                            self.onOver();
                            node.remove();
                        })
                } else {

                    if (self.progress == 3 && UserData.preset == 2 && self.curLipsticks == 1) {//如果第三关 并且不允许赢
                        self.pass = 0;
                        self.onOver();
                        Utils.playSound(AudioRes.failed);
                        node.animate({ transform: 'translate3d(6rem,10rem,0) rotate(1800deg)' }, 1000, null, function () {
                            $(this).remove();
                        });
                    } else {
                        node.remove();
                        self.dialAddLipstick(angle);
                        self.hitSnake();
                        Utils.playSound(AudioRes.hit);
                        if (!self.curLipsticks && !self.failed) {//播放动画
                            console.error('播放动画');
                            if (this.start && !this.playAni) self.playDropAnimation();
                        }
                    }
                }

                self.randomAngle = (Math.random() < 0.5 ? -1 : 1)

                list.splice(x, 1);
                return;

            }
            list[x][0].css({ transform: `translate3d(0,-${list[x][1]}px,0) rotate(0deg)` });

        }
    }


    /**
     * 设置定时器显示
     */
    private updateCountLabel(time: number) {
        $('#countDown').text(time + '');
    }

    /**
     * 创建定时器
     */
    private createCountDown() {
        let self = this;
        if (!this.start) return;
        this.clearCountDown();
        let time: number = 30;//倒计时
        this.updateCountLabel(time);
        this.countDown = setTimeout(countDown, 1000);

        function countDown() {
            time--;
            if (time <= 0) {
                self.pass = 0;
                self.onOver();
                time = 0;
            }
            self.updateCountLabel(time);
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

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#game").append(html);
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
            Core.viewManager.closeView(ViewConfig.game);
            Core.eventManager.event(EventType.updateBottomNav, { hide: true });
            return;
        }
    }

    onRemove() {
        this.start = false;
        this.click = false;
        this.failed = true;
        this.clearCountDown();
        if(this.preesTimeOut)clearTimeout(this.preesTimeOut);
        Core.eventManager.event(EventType.viewScroll, false);
        Core.eventManager.event(EventType.updateGameInnerUser);//更新用户信息
        this.node.off();
        Core.eventManager.event(EventType.gameInnerState, true);
        Core.eventManager.off(EventType.error, this.onError);
    }
}