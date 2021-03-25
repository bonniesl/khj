import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import ViewConfig from "../../common/ViewConfig";
import Utils from "../../core/Utils";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import Login from '../component/Login';
let baseUrl = Config.baseUrl;

/**
 * 新闻内容页
 */
export default class NewsContent extends ViewBase {

 private favId: Number;  //1.收藏, 2.取消
 private favNum: Number;
 private userInfo;

 async  onEnable() {

        this.setLazyLoad();

        //更新底部导航状态
        Core.eventManager.event(EventType.updateBottomNav, { hide: true });

        $('#goBack').on('click', () => {          
            Core.viewManager.openView(ViewConfig.find);
            window.history.pushState(null, '', '#find');//临时用，后期优化
        });

        //登录弹窗
        let self =this;
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;
        let login = new Login();
       

        
        //获取文章id
        this.userInfo=await Net.getData(Api.userInfo);
        let articleId = Utils.getValueByUrl('id');
        let articleInfo = await Net.getData(Api.articleInfo,{id:articleId});
        this.setArticleInfo(articleInfo);
        this.setShopList(articleInfo['advLits']);
        
         //判断当前用户是否收藏该文章
         this.favNum = await Net.getData(Api.articleFav,{id:articleId,action:3});
         if(this.favNum && this.favNum['collect']==1){
            $("#fav").addClass("shareCur");
         }

        //微信
        if (isWeixin) {
            await Utils.ajax({
                url: '/src/jweixin-1.0.0.js',
                dataType:'script'
            });
            //微信分享
            let wxJsdk = await Net.getData(Api.wxJsdk);  
             wx.config({
                //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: wxJsdk['appId'], // 必填，公众号的唯一标识
                timestamp:wxJsdk['timestamp'], // 必填，生成签名的时间戳
                nonceStr:wxJsdk['nonceStr'], // 必填，生成签名的随机串
                signature: wxJsdk['signature'],// 必填，签名
                jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage'] // 必填，需要使用的JS接口列表
            })
        }

        let href=window.location.href;
        let linkHref=encodeURIComponent(location.origin + location.pathname + '?page=newsContent&id='+Utils.getValueByUrl('id')); 
        $("body").on("loginEvent", async () => {
            //获取用户信息
            let userInfo=await Net.getData(Api.userInfo);  
            $.ajax({
                type:'get',
                dataType: 'json',
                url: Api.codeShare['url'] +'?redirect_uri='+ linkHref,
                xhrFields: {
                    withCredentials: true
                },
                success: (data) => {
                    if (isWeixin) {
                        wx.ready(function () {   
                            wx.onMenuShareTimeline({ 
                                title: articleInfo['title'], // 分享标题
                                desc: articleInfo['desc'], // 分享描述
                                link: data['mes']['url'],//wxJsdk['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                                imgUrl: Config.imgBase+articleInfo['src'], // 分享图标
                                success: function () {
                                    // 设置成功
                                    $(".shareDialog").hide();
                                }
                            });
                            wx.onMenuShareAppMessage({ 
                                title: articleInfo['title'], // 分享标题
                                desc: articleInfo['desc'], // 分享描述
                                link: data['mes']['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                                imgUrl: Config.imgBase+articleInfo['src'], // 分享图标
                                success: function () {
                                    // 设置成功
                                    $(".shareDialog").hide();
                                }
                            });
                        })
                    }else{
                        console.log(data['mes']['url'])
                        $(".shareTxt-copy").val(data['mes']['url']);
                    }
                   
                }
    
            });
        })

        $.ajax({
            type:'get',
            dataType: 'json',
            url: Api.codeShare['url'] +'?redirect_uri='+ linkHref,
            xhrFields: {
                withCredentials: true
            },
            success: (data) => {
                if (isWeixin) {
                    wx.ready(function () {   
                        wx.onMenuShareTimeline({ 
                            title: articleInfo['title'], // 分享标题
                            desc: articleInfo['desc'], // 分享描述
                            link: data['mes']['url'],//wxJsdk['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: Config.imgBase+articleInfo['src'], // 分享图标
                            success: function () {
                                // 设置成功
                                $(".shareDialog").hide();
                            }
                        });
                        wx.onMenuShareAppMessage({ 
                            title: articleInfo['title'], // 分享标题
                            desc: articleInfo['desc'], // 分享描述
                            link: data['mes']['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: Config.imgBase+articleInfo['src'], // 分享图标
                            success: function () {
                                // 设置成功
                                $(".shareDialog").hide();
                            }
                        });
                    })
                }else{
                    console.log(data['mes']['url'])
                    $(".shareTxt-copy").val(data['mes']['url']);
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
         $("#shareA").click(async() =>{
             let lcsz = _czc || [];
             lcsz.push(["_trackEvent","分享文章","点击分享文章"]);
            let userInfo=await Net.getData(Api.userInfo);   
            if(!userInfo){
                $(".loginDialog").show();
                 return;
            } 
            if(isWeixin){
                $(".shareDialog").show();
                return;
            }
            $(".broswerDialog").show();

            let share = this.node.find("#shareA");
           // share.addClass("shareCur");
            let articleShare = await Net.getData(Api.articleShare,{id:articleId});
         })

         //关闭分享
         $(".shareDialog").click(function(){
            $(".shareDialog").hide();      
         })  

         //关闭浏览器分享
         $(".broswerDialog .close").click(function(){
            $(".broswerDialog").hide();  
         })
         
         //文章里的img的父集
         $("#newsC").find("img").parent().css({'text-indent': '0'});

        this.setLazyLoad();
        
    }

    async onClick(e: Event) {
        switch (e.target['className']) {
            case 'icon collect':{//点赞
                let userInfo=await Net.getData(Api.userInfo); 
                    if(!userInfo){
                        $(".loginDialog").show();
                         return;
                    }
                    this.favVote();
                }
                break
        }
    }

    /**
     * 点赞
     */
    async favVote(){    
        let fav = this.node.find("#fav");
        fav.hasClass("shareCur") ? fav.removeClass("shareCur") : fav.addClass("shareCur");  
        if(fav.hasClass("shareCur")){
            this.favId=1;
        }else{
            this.favId=2;
        }
       let articleFav = await Net.getData(Api.articleFav,{id:Utils.getValueByUrl('id'),action:this.favId}); 
    //    fav.find("span").text(articleFav['count']);
    }

    
    /**
     * 文章列表
     */
    private setArticleInfo(articleInfo: any[]){
        let html='';
        let num=`${articleInfo['advCount']}`;
        
        $(".newsT").text(articleInfo['title'])
         
        //文章详情
        html +=` <div class="content">${articleInfo['content']}</div>`  

        $("#num").text(num);
        $('#newsC').html(html);
         
    }

    /**
     * 文章商品
     * @param advCount
     */
    private setShopList(advCount: any[]){
        let html ='';
        for(let x=0;x<advCount.length;x++){
            html+=`<li>
                    <a href="javascript:void(0);">
                        <img class="lazy" src="" alt="" data-src="${Config.imgBase + advCount[x]['src']}">
                    </a>
                    <div class="right relative">
                        <h3>${advCount[x]['title']}</h3>
                        <em class="price absolute">市场参考价格：￥${advCount[x]['short_title']}</em>
                        <a href="${advCount[x]['link']}" class="btn_red get-btn absolute">${advCount[x]['button_title']}</a>
                    </div>
                </li>`
        }
        
        $("#shopList").html(html);   

        if(!advCount.length){
            return
        }

        //打开文章商品弹窗(弹出禁止底部body滚动)
        let newsDialog = $(".newsdialCon");
        let num = $("#num");
        
        $("#shopMore").click(function(){
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","商品列表","点击商品"]);
            $(".newsDialog .mask").addClass('fadeIn');
            newsDialog.addClass("fadeInUp");
            newsDialog.show();
            $(".newsDialog .mask").show();
            $("body,html").css({"overflow":"hidden" });
        })

        /**阻止苹果浏览器的默认行为 */
        $(".newsDialog .mask").on("touchmove",function(){ 
        　　　　event.preventDefault(); 
        }); 
        $(".newsdialCon").on("touchmove",function(){ 
        　　　//　event.preventDefault(); 
        }); 

        $("#toggle").click(function(){
            $(".newsDialog .mask").removeClass('fadeIn');
            newsDialog.removeClass("fadeInUp");
            $(".newsDialog .mask").hide();
            newsDialog.hide();
            $("body,html").css({"overflow":"inherit" });           
        })
        
       
    }

        /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#newsContent").append(html);
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



    onRemove() {
        Core.eventManager.event(EventType.viewScroll, false);
        $(".loginDialog").hide();
        $('#goBack').off();   
    }
}