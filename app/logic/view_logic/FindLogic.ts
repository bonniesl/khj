import ViewBase from "../../core/ViewBase";
import Slider from "../component/Slider";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import ViewConfig from "../../common/ViewConfig";
import Config from "../../common/Config";
import { Net, Api } from "../../common/Net";
import UserData from "../../common/UserData";
import Utils from "../../core/Utils";

/**
 * 发现模板
 */
export default class FindLogic extends ViewBase {
    /**轮播图组件 */
    private slide: Slider;
    private userInfo: any;
    private linkHref:any;

    onCreate() {
        this.setBanner();
    }


    /**
     * 发现banner数据
     */
    private setBanner() {
        let banner: any[] = this.data['bannerList'],
            html = '';
        for (let x in banner) {
            if (!banner[x]['src']) return;
            html += `<em><a href="${banner[x]['link']}" lazy="${Config.imgBase + banner[x]['src']}"></a></em>`
        }
        this.template = Core.utils.replaceData('banner', this.template, html);

    }


    async onEnable() {
        this.slide = new Slider('#banner');
        this.setLazyLoad();


        //更新底部导航状态
        Core.eventManager.event(EventType.updateBottomNav, { type: 'find' });

        let self = this;
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;

        this.linkHref = encodeURIComponent(location.origin + location.pathname + '?page=find');

        $("body").on("loginEvent", async () => {
           
            //获取用户信息
            this.userInfo = await Net.getData(Api.userInfo); 
            let coninn = isNaN(parseInt(this.userInfo ['coin'])) ? 0 : parseInt(this.userInfo ['coin']);
            let coin: any = coninn / 100;
            let coins: any = parseInt(coin);
            $(".rechargeBtn em").text(coins);   

            this.shareL();
        })


        //用户信息
        this.userInfo = await Net.getData(Api.userInfo);
        if(this.userInfo){
           let coninn = isNaN(parseInt(this.userInfo['coin'])) ? 0 : parseInt(this.userInfo['coin']);
           let coin: any = coninn / 100;
           let coins: any = parseInt(coin);
           $(".rechargeBtn em").text(coins);
        } 

         //充值按钮绑定
         this.node.on('click', '.rechargeBtn', () => {
            if(!this.userInfo){                     
                $(".loginDialog").show();
                return;
            }
            Core.viewManager.openView(ViewConfig.recharge);
            window.history.pushState(null, '', '#recharge');
        });

       
        //发现列表
        let findList = await Net.getData(Api.findList)
        this.setFindList(findList['list']);

        /**阻止苹果浏览器的默认行为 */
        $(".shareDialog").on("touchmove", function () {
            event.preventDefault();
        });
        //分享
        $("#banner em").eq(0).find("a").click(function () {
            $(this).attr("href","javascript:;");
            if(!self.userInfo){                        
                $(".loginDialog").show();
                return;
            }
            $(".broswerDialog").show();
            $("body,html").css({ "overflow": "hidden" });
        })
        $(".shareDialog").click(function () {
            $(".shareDialog").hide();
            $("body,html").css({ "overflow": "auto" });
        })

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
        $(".broswerDialog .close").click(function(){
            $(".broswerDialog").hide();  
        })


        this.setLazyLoad();
    }
    private shareL(){
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
                }else{
                    $("#shareTxt-copy").val(data['mes']['url']);
                }
            }

        });
    }

    /**
     * 发现列表
     * @param list
     */
    private setFindList(list: any[]) {
        let html = '';
        for (let x = 0; x < list.length; x++) {
            html += `<li data-id="${list[x]['id']}" >
                    <a href="javascript:void(0);">
                         <img class="lazy" src="" data-src="${Config.imgBase + list[x]['src']}" alt="">
                        <h3 class="font-clipLine">${list[x]['title']}</h3>
                        <span class="hot-status f18"><i class="icon"></i><em>${list[x]['browse']}</em></span>
                    </a>
                </li>`
        }
        $('#findList').html(html);

        //打开发现列表详情
        $('#findList').on('click', 'li', function () {
            location.href = '#newsContent?id=' + $(this).data('id');
        })

    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#find").append(html);
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
        // console.log(e.target);
    }

    onUpdate() {
        // console.log(this.node)
    }

    onRemove() {
        $(".loginDialog").hide();
        console.log('find界面关闭');
        this.slide.clearTime();
        this.slide = null;
    }
}