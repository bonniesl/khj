import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import Slider from "../component/Slider";
import EventType from "../../common/EventType";
import Config from "../../common/Config";
import { Net, Api } from "../../common/Net";
import Data from "../../common/Data";
import UserData from "../../common/UserData";
import Utils from "../../core/Utils";
import Login from '../component/Login';
import signDialog from '../../logic/component/signDialog';
import personInfo from '../component/personInfo';
import ErrorMap from "../../common/ErrorMap";

export default class IndexLogic extends ViewBase {

    /**轮播图组件*/
    private slide: Slider;
    private themeId;
    private loading = true;
    private userInfo: any;
    private linkHref: any;
    private currentPage = 0;//开始数据条数
    private pageSize = 11;//每页显示条数
    private isOver = false;//是否加载完

    onCreate() {
        if (!this.data) return;
        this.setBanner();
        this.setBrand();

    }

    /**
     * 设置banner数据
     */
    private setBanner() {
        let banner: any[] = this.data['bannerList'],
            html = '';
        for (let x = 0, l = banner.length; x < l; x++) {
            if (!banner[x]['src']) continue;
            html += `<em><a href="${banner[x]['link']}" lazy="${Config.imgBase + banner[x]['src']}"></a></em>`
        }
        this.template = Core.utils.replaceData('banner', this.template, html);
    }

    /**
     * 设置品牌
     */
    private setBrand() {
        let brandList: any[] = this.data['themeList'],
            html = '';

        for (let x = 0, l = brandList.length; x < l; x++) {
            html += `<a href="javascript:void(0)" data-id="${brandList[x]['id']}"><img class="lazy" data-src="${Config.imgBase + brandList[x]['src']}" alt=""><em>${brandList[x]['title']}</em></a> `
        }

        this.template = Core.utils.replaceData('itemList', this.template, html);
    }


    async onEnable() {
        this.slide = new Slider('#banner');
        this.setLazyLoad();
        //更新底部导航状态
        Core.eventManager.event(EventType.updateBottomNav, { type: 'index' });

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

        this.linkHref = encodeURIComponent(location.origin + location.pathname + '?page=index');
        //登录弹窗
        $("body").on("loginEvent", async () => {

            //获取用户信息
            this.userInfo = await Net.getData(Api.userInfo);
            let coninn = isNaN(parseInt(this.userInfo['coin'])) ? 0 : parseInt(this.userInfo['coin']);
            let coin: any = coninn / 100;
            let coins: any = parseInt(coin);
            $(".rechargeBtn em").text(coins);

            //签到
            let sign = new signDialog();

            this.shareL();

        })

        //充值按钮绑定 
        this.userInfo = await Net.getData(Api.userInfo);
        if (this.userInfo) {
            let coninn = isNaN(parseInt(this.userInfo['coin'])) ? 0 : parseInt(this.userInfo['coin']);
            let coin: any = coninn / 100;
            let coins: any = parseInt(coin);
            $(".rechargeBtn em").text(coins);
            //签到
            let sign = new signDialog();
        }
        this.node.on('click', '.rechargeBtn', async () => {
            if (!this.userInfo) {
                let lcsz = _czc || [];
                lcsz.push(["_trackEvent","首页充值","点击登录"]);
                $(".loginDialog").show();
                return;
            }
            Core.viewManager.openView(ViewConfig.recharge);
        });

        //免费领口红 
       
        $(".receiveFixed").click(function () {
            if (!self.userInfo) {
                let lcsz = _czc || [];
                lcsz.push(["_trackEvent","免费领口红","点击登录"]);
                $(".loginDialog").show();
                return;
            }
            Core.viewManager.openView(ViewConfig.recommend);
        })

        if (isWeixin) {
            $(".buoyFixed").show();
        } else {
            $(".buoyFixed").hide();
        }

        $(".buoyFixed").click(function(){
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","领取大礼包","微信公众号"]);
        })

        //免费领取口红入口
        let storage = window.localStorage;
        if(storage.getItem('receiveW')=="1"){
            $(".receiveFixed").hide();
        }
        

        /**品牌点击 */
        let $this = this;
        let roomList;
        let timer = 0;
        roomList = await Net.getData(Api.roomList, { themeId: 0, page: self.currentPage });
        this.setRoomList(roomList['list']);
        let loadIndex = document.querySelector('.refreshText'),
        _container = document.getElementById('roomList');

        // window.onscroll =async function() {
        //     if(self.getScrollTop()+self.getClientHeight()==self.getScrollHeight()){
        //         loadIndex.innerHTML='加载中...';
        //         self.currentPage += 1;  

        //         roomList = await Net.getData(Api.roomList, { themeId: 0, page: self.currentPage });
        //         self.setRoomList(roomList['list']);
        //     }
                
        // };
        
        $(".item-box a").forEach(function (item, index) {
            $(item).click(async () => {
                $("#roomList").hide();
                $(item).addClass("cur").siblings().removeClass("cur");
                $this.themeId = $(item).data("id");
                //设置房间列表
                roomList = await Net.getData(Api.roomList, { themeId: $this.themeId, page: 0 });
                if ($this.loading) {
                    $(".tabLoading").show();
                    $this.loading = false;
                    timer = setTimeout(() => {
                        $(".tabLoading").hide();
                        $("#roomList").show();
                    }, 500);
                } else {
                    clearTimeout(timer);
                    $("#roomList").show();
                }

                $this.setRoomList(roomList['list']);


            })
        })


        /**阻止苹果浏览器的默认行为 */
        $(".shareDialog").on("touchmove", function () {
            event.preventDefault();
        });
        //分享
        $("#banner em").eq(0).find("a").click(function () {
            $(this).attr("href", "javascript:;");
            if (!self.userInfo) {
                let lcsz = _czc || [];
                lcsz.push(["_trackEvent","首页广告","点击登录"]);
                $(".loginDialog").show();
                return;
            }
            if (isWeixin) {
                $(".shareDialog").show();
                return;
            }
            $(".broswerDialog").show();
            $("body,html").css({ "overflow": "hidden" });
        })
        $(".shareDialog").click(function () {
            $(".shareDialog").hide();
            $("body,html").css({ "overflow": "auto" });
        })

        this.shareL();

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

        //关闭浏览器分享
        $(".broswerDialog .close").click(function () {
            $(".broswerDialog").hide();
        })

        this.setLazyLoad();
    }

    /**
     * 分享
     */
    private shareL() {
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;
        $.ajax({
            type: 'get',
            dataType: 'json',
            url: Api.codeShare['url'] + '?redirect_uri=' + this.linkHref,
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
                                $(".shareDialog").hide();
                            }
                        });
                        wx.onMenuShareAppMessage({
                            title: '我正在口红姬薅羊毛，来晚哭一年', // 分享标题
                            desc: '每天送出万支大牌正品口红，小姐姐不容错过', // 分享描述
                            link: data['mes']['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: 'http://s-h5.52kouhong.com/upload/2018/ci/TOM_FORD.jpg', // 分享图标
                            success: function () {
                                // 设置成功
                                $(".shareDialog").hide();
                            }
                        });
                    })
                } else {
                    $("#shareTxt-copy").val(data['mes']['url']);
                }
            }

        });
    }


    /**
     * 设置房间列表 
     * @param list 
     */
    private setRoomList(list: any[]) {
        let html = '';
        //时间区间
        let today: any = new Date();
        let todayDate:any=today.getFullYear() + '/' + today.getMonth()+1 + '/' + today.getDate();
        for (let x = 0, l = list.length; x < l; x++) {
            let low_coin: any = list[x]['low_coin'] / 100;
            let activity = '';
            let startDate: any = '';
            let endDate: any = '';
            let startTime:any='';
            let endTime:any='';
            if (list[x]['activity']) {
                activity = list[x]['activity'];
                startDate = +new Date(activity['startDate'].replace(/-/g, "/"));
                endDate =+new Date(activity['endDate'].replace(/-/g, "/")); 
               for(let z=0;z<activity['timeInterval'].length;z++){
                    startTime=+new Date(todayDate+ ' '+ activity['timeInterval'][z]['start']);
                    endTime=+new Date(todayDate+ ' '+ activity['timeInterval'][z]['end']);
               }

          
            }
            if (!list[x]['src']) continue;
            html += `<li>
                <a href="javascript:void(0);" class="room-info" data-id="${list[x]['id']}">
                    <img class="lazy"  data-src="${list[x]['activity'] && ((today > startDate) && (today < endDate)) && ((today>startTime) && (today<endTime)) ? Config.imgBase + activity['banner'] : Config.imgBase + list[x]['src']}" alt="">
                </a>
                <div class="item-msg">
                    <div class="left">
                        <h3 class="font-clip">${list[x]['activity'] && ((today > startDate) && (today < endDate)) && ((today>startTime) && (today<endTime)) ? activity['title'] : list[x]['title']}</h3>
                        <span class="flex">
                            <em class="price f26">魅力币：${parseInt(low_coin)} </em>
                            <del class="f22">${list[x]['short_desc']}</del>
                        </span>
                    </div>
                    <div class="right">
                        <a href="javascript:void(0);" class="btn_red need-btn f26 room-info" data-id="${list[x]['id']}" >我要这支</a>
                    </div>
                </div>
                <i class="absolute game-status f20 font-clip">
                    ${list[x]['player']}人游戏中
                </i>
            </li>`;
        }
        $('#roomList').html(html);
        //打开场次详情
        $('#roomList').on('click', '.room-info', function () {
            location.href = '#gameInner?id=' + $(this).data('id');
        });

        this.setLazyLoad();
    }


    // // 获取当前滚动条的位置 
    // private getScrollTop() { 
	//     var scrollTop = 0; 
	//     if (document.documentElement && document.documentElement.scrollTop) { 
	//     	scrollTop = document.documentElement.scrollTop; 
	//     } else if (document.body) { 
	//     	scrollTop = document.body.scrollTop; 
	//     } 
	//     return scrollTop; 
    // } 
    // // 获取当前可视范围的高度 
    // private getClientHeight() { 
	//     var clientHeight = 0; 
	//     if (document.body.clientHeight && document.documentElement.clientHeight) { 
	//     	clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight); 
	//     } 
	//     else { 
	//     	clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight); 
	//     } 
	//     return clientHeight; 
    // }
    // // 获取文档完整的高度 
    // private getScrollHeight() { 
    // 	return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight); 
    // }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#index").append(html);
        setTimeout(() => {
            $("#toast").remove();
        }, 600);
    }


    /**
     * 设置懒加载 
     */
    private setLazyLoad() {
        lazyload($(".lazy"));
    }

    onClick(e: MouseEvent) {

    }

    onUpdate() {
        // console.log(this.node)
    }

    onRemove() {
        console.log('删除首页');
        this.slide.clearTime();
        this.slide = null;
        $(".loginDialog").hide();
    }


}