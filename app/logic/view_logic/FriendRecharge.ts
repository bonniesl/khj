import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import AwardsBox from "./AwardsBox";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import UserData from "../../common/UserData";
import Utils from "../../core/Utils";


export default class FriendRecharge extends ViewBase {

    async  onEnable() {

        this.setLazyLoad();


         //绑定只关闭自己界面事件
         this.node.on('click', '.closeSelf', () => {
            Core.viewManager.closeView(ViewConfig.friendRecharge);
        });

        //用户信息
        let userInfo = await Net.getData(Api.userInfo);

        //充值首页列表
        let recharge = await Net.getData(Api.recharge);
        this.setRecharge(recharge['rechargeList']);

        //充值Banner
       // this.setBanner(recharge['bannerList']);

        //选中充值
        $("#friendRecharges").on("click", "li", function () {
            $(this).addClass("cur").siblings().removeClass('cur');
        })

         //微信分享
         await Utils.ajax({
            url: '/src/jweixin-1.0.0.js',
            dataType:'script'
        });
         let wxJsdk = await Net.getData(Api.wxJsdk);  
         let linkHref=encodeURIComponent(location.origin + location.pathname + '?page=shareFriendRecharge&to_uid='+userInfo['uid']);         
         wx.config({
             //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
             appId: wxJsdk['appId'], // 必填，公众号的唯一标识
             timestamp:wxJsdk['timestamp'], // 必填，生成签名的时间戳
             nonceStr:wxJsdk['nonceStr'], // 必填，生成签名的随机串
             signature: wxJsdk['signature'],// 必填，签名
             jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage'] // 必填，需要使用的JS接口列表
         })

         $.ajax({
            type:'get',
            dataType: 'json',
            url: Api.codeShare['url'] +'?redirect_uri='+ linkHref,
            xhrFields: {
                withCredentials: true
            },
            success: (data) => {
                wx.ready(function () {   
                    wx.onMenuShareTimeline({ 
                        title: '小哥哥，我要这只口红，给我买！', // 分享标题
                        desc: '点唇以红，口脂凝香，口红之于女人的意义，不仅仅是恋人用来证明“我爱你”，更是女人的灵魂，最有魅力的彩妆，做精致的女人，即使天塌下来，还有口红呢！', // 分享描述
                        link: data['mes']['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: 'http://s-h5.52kouhong.com/upload/2018/ci/share1.jpg', // 分享图标
                        success: function () {
                            // 设置成功
                            $(".shareDialog").hide();
                        }
                    });
                    wx.onMenuShareAppMessage({ 
                       title: '小哥哥，我要这只口红，给我买！', // 分享标题
                        desc: '点唇以红，口脂凝香，口红之于女人的意义，不仅仅是恋人用来证明“我爱你”，更是女人的灵魂，最有魅力的彩妆，做精致的女人，即使天塌下来，还有口红呢！', // 分享描述
                        link: data['mes']['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: 'http://s-h5.52kouhong.com/upload/2018/ci/share1.jpg', // 分享图标
                        success: function () {
                            // 设置成功
                            $(".shareDialog").hide();
                        }
                    });
                })
            }
        });
         

         /**阻止苹果浏览器的默认行为 */
        $(".shareDialog").on("touchmove",function(){ 
        　　　　event.preventDefault(); 
        }); 


        /**发起代充 */
        $(".okRechargeBtn").click(function(){   
            $("body,html").css({"overflow":"hidden" }); 
            $(".shareDialog").show();
        })

        //关闭分享
        $(".shareDialog").click(function(){
            $("body,html").css({"overflow":"auto" });        
            $(".shareDialog").hide();      
         })  


        this.setLazyLoad();

    }

    /**
     * 充值广告
     * @param bannerList 
     */
    // private setBanner(bannerList: any) {
    //     if (bannerList.length<=0) return; 
    //     let html = `<img class="lazy" data-src="${Config.imgBase + bannerList[0]['src']}" >`;
    //     $("#friendBanner").html(html)
    // }

    /**
     * 充值列表
     * @param rechargeList 
     */
    private setRecharge(rechargeList: any) {
        let html = '';     
        for (let x = 0; x < rechargeList.length; x++) {
            let goodList = rechargeList[x]['goodsList']; 
            if(UserData.firstRecharge == 1){
                for (let y = 0; y <goodList.length; y++) { 
                    if (goodList[y]['attribute_id'] == 151) {
                        let total: any = (rechargeList[x]['money_coin'] / 100) + ((rechargeList[x]['money_coin'] / 100) * (goodList[y]['goods_company'] /100) * goodList[y]['num']);
                        html+=`<li class="item firstCZ" data-price="${rechargeList[x]['amount'] / 100}">
                                <a href="javascript:void(0)">
                                <p class="price">
                                    <span class="mon"><em>¥</em>${rechargeList[x]['amount'] / 100}</span>
                                    <span class="num">${goodList[y]['title']}</span>
                                </p>
                                <p class="txtTo">共${parseInt(total)}魅力币</p>
                            </a></li>`
                    }
                }
            }else{
                for (let y = 0; y <goodList.length; y++) { 
                    if (goodList[y]['attribute_id'] == 153) {
                        html+=`<li class="item hzCz" data-price="${rechargeList[x]['amount'] / 100}">
                                <a href="javascript:void(0)">
                                <p class="price">
                                    <span class="mon"><em>¥</em>${rechargeList[x]['amount'] / 100}</span>
                                    <span class="num">${goodList[y]['title']}</span>
                                </p>
                                <p class="txtTo">共${parseInt(rechargeList[x]['money_coin']) / 100 + ((goodList[y]['goods_company'] / 100) * goodList[y]['num'])}魅力币</p>
                            </a></li>`
                    }
                }

            }
        }
        $("#friendRecharges").html(html)      
    }

    /**
     * 设置懒加载 
     */
    private setLazyLoad() {
        lazyload($(".lazy"));
    }

    onClick(e) {
        console.log(e)
    }
}   