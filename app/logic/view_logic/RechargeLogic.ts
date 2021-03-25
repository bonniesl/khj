import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import AwardsBox from "./AwardsBox";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import UserData from "../../common/UserData";
import Utils from "../../core/Utils";


export default class RechargeLogic extends ViewBase {

    //  isCloseAnimation: boolean = true;

    private amount;     //金额
    private userInfoMy;
    private paymType;   //支付类型

    async onEnable() {

        this.setLazyLoad();

        this.node.off();

        // 关闭自己单独定义类名
        this.node.on('click', '.closeSelf', () => {
            console.log(Core.currentView)
            Core.viewManager.closeView(ViewConfig.recharge);
            $("#root").find("#creditDialog").hide();
            $("#root").find("#creditDialogs").hide();
            // window.history.pushState(null, '', '#recharge');
            if (Core.currentView['name'] != 'gameInner')//如果是游戏界面就直接退出游戏
                Core.eventManager.event(EventType.updateBottomNav, { hide: false });// if(Core.currentView.name != 'personal')
            // $("body,html").css({"overflow":"auto" });    
        });


        //充值记录
        this.node.on('click', '#recordBtn', () => {
            Core.viewManager.openView(ViewConfig.rechargeRecord);
        })

        //当前魅力币
        this.userInfoMy = await Net.getData(Api.userInfo, { firstRecharge: 1 });
        let coninn = isNaN(parseInt(this.userInfoMy['coin'])) ? 0 : parseInt(this.userInfoMy['coin']);
        let coin: any = coninn / 100;
        let coins: any = parseInt(coin);
        $(".wordList dd").eq(0).find("span").text(coins);


        //充值首页列表
        let recharge = await Net.getData(Api.recharge);
        this.setRecharge(recharge['rechargeList'], recharge['goodsList']);

        //充值Banner
        this.setBanner(recharge['bannerList']);

        //好友代充跳转
        this.node.on('click', '#rechargeLink', () => {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","他人代充","分享充值"]);
            if(isWeixin){
                $(".shareDialog").show();
                return;
            }
            $(".broswerDialog").show();
            $("body,html").css({ "overflow": "hidden" });
        });

        /**阻止苹果浏览器的默认行为 */
        $(".shareDialog").on("touchmove", function () {
            event.preventDefault();
        });


        //关闭分享
        $(".shareDialog").click(function () {
            $("body,html").css({ "overflow": "auto" });
            $(".shareDialog").hide();
        })

        //支付金钱
        let self = this;
        //判断微信登录
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
                jsApiList: ['chooseWXPay', 'onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表
            })
        }

         //微信分享
         let linkHref = encodeURIComponent(location.origin + location.pathname + '?page=shareFriendRecharge&to_uid=' + this.userInfoMy['uid']);
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
                 }else{
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

         //关闭浏览器分享
         $(".broswerDialog .close").click(function(){
            $(".broswerDialog").hide();  
         })
       
        $("#rechargeList li").click(async (e) => {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","充值弹窗","点击选中充值"]);
            $(e.currentTarget).addClass("cur").siblings().removeClass("cur");
            this.amount = $(e.currentTarget).data("price");
            let txt = self.amount.toFixed(2);
            if(isWeixin){ 
                $(".rechargeDialog").hide();
                let userPay = await Net.getData(Api.userPay, {
                    amount: this.amount,
                    toUid: this.userInfoMy['uid'],
                    type: 42
                })
                wx.chooseWXPay({
                    timestamp: userPay['timestamp'], // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                    nonceStr: userPay['nonceStr'], // 支付签名随机串，不长于 32 位
                    package: userPay['package'], // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                    signType: userPay['signType'], // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                    paySign: userPay['sign'], // 支付签名
                    success: function (res) {
                        // 支付成功后的回调函数
                        location.href="#rechargeSuccess"
                        // Core.viewManager.openView(ViewConfig.rechargeSuccess);
                    },
                    cancel: function (res) {
                        // 取消支付后的回调函数
                        Core.viewManager.openView(ViewConfig.recharge);
                    }
                });
                return;
            }
            $(".rechargeDialog").show();
            $(".price .total").text(txt);
        })

        //选择支付类型
        if(isWeixin){ 
            self.paymType=42;
            return;
        }else{
            self.paymType=44;
        }

        //支付
        $(".payBtn-action").click(async (e) => {
            let userPay = await Net.getData(Api.userPay, {
                amount: this.amount,
                toUid: this.userInfoMy['uid'],
                type: this.paymType
            })
            
      
            switch (this.paymType) {
                case 42: {
                    //微信jsdk支付
                    wx.chooseWXPay({
                        timestamp: userPay['timestamp'], // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                        nonceStr: userPay['nonceStr'], // 支付签名随机串，不长于 32 位
                        package: userPay['package'], // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                        signType: userPay['signType'], // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                        paySign: userPay['sign'], // 支付签名
                        success: function (res) {
                            // 支付成功后的回调函数
                            Core.viewManager.openView(ViewConfig.rechargeSuccess);
                        },
                        cancel: function (res) {
                            // 取消支付后的回调函数
                            Core.viewManager.openView(ViewConfig.recharge);
                        }
                    });
                }
                    break;
                case 44: {
                     //支付宝h5支付
                    let form =$("<form action='https://mapi.alipay.com/gateway.do' method='get'></form>");
                    let formInput='';
                    for (let key  in userPay) {
                        formInput+= `<input type="hidden" value="${userPay[key]}" name="${key}"  />`;
                    }
                    form.append(formInput);
                    $(document.body).append(form);
                    form.submit();
                    form.remove();
                }
                    break;
                case 45: {
                    //微信H5支付
                    console.log(3333333333333)
 
                }
                    break;
            }
        })

        $(".close").click(function () {
            $(".rechargeDialog").hide();
        })
 

        this.setLazyLoad();

        Core.eventManager.event(EventType.viewScroll, true);
    }

    /**
     * 充值广告
     * @param bannerList 
     */
    private setBanner(bannerList: any) {
        if (bannerList.length <= 0) return;
        let html = `<img class="lazy" src="${Config.imgBase + bannerList[0]['src']}" >`;
        $("#rechargeBanner .banerL").html(html);
    }


    /**
     * 充值列表
     * @param rechargeList 
     */
    private setRecharge(rechargeList: any, goodsList: any) {
        let html = '';
        for (let x = 0; x < rechargeList.length; x++) {
            let goodList = rechargeList[x]['goodsList'];
            if (this.userInfoMy['firstRecharge'] == 1) {
                for (let y = 0; y < goodList.length; y++) {
                    if (goodList[y]['attribute_id'] == 152) {
                        html += `<li class="item firstCZ " data-price="${rechargeList[x]['amount'] / 100}">
                                <a href="javascript:void(0)">
                                    <p class="price">
                                        <span class="mon"><em>¥</em>${rechargeList[x]['amount'] / 100}</span>
                                        <span class="num">${goodList[y]['title']}</span>
                                    </p>
                                   <p class="txtTo">共${parseInt(rechargeList[x]['money_coin']) / 100 + goodList[y]['goods_company'] / 100 * goodList[y]['num']}魅力币</p>
                            </a></li>`
                    }
                }
            } else {
                for (let y = 0; y < goodList.length; y++) {
                    if (goodList[y]['attribute_id'] == 154) {
                        html += `<li class="item hzCz" data-price="${rechargeList[x]['amount'] / 100}">
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
        $("#rechargeList").html(html);
    }

    private payWx(options) {
        switch (options.platform) {

        }
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#recharge").append(html);
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

    onClick(e) {
        // console.log(e)
    }

    onRemove() {
        Core.eventManager.event(EventType.viewScroll, false);

    }
} 