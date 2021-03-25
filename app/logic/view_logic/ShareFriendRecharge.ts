import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import AwardsBox from "./AwardsBox";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import UserData from "../../common/UserData";
import Utils from "../../core/Utils";
import Login from '../component/Login';


export default class ShareFriendRecharge extends ViewBase {

    private amount;     //金额
    private userInfoTo;
    private myUserINfo;
    private paymType;   //支付类型

    async  onEnable() {
        this.setLazyLoad();

        $('#goBack').on('click', () => {
            window.location.href = '#'
        })


        //登录
        $("body").on("loginEvent", async () => {
            //获取用户信息
            this.myUserINfo = await Net.getData(Api.userInfo, { firstRecharge: 1 });

            this.userInfoTo = await Net.getData(Api.userInfoBase, {
                uid: Utils.getValueByUrl('to_uid'),
                firstRecharge: 1
            });

            this.userInfo(this.userInfoTo);
            if (this.userInfoTo['uid'] == this.myUserINfo['uid']) {
                location.href = location.origin + location.pathname + '?page=recharge';
                return;
            }
            //充值首页列表
            let recharge = await Net.getData(Api.recharge);
            this.setRecharge(recharge['rechargeList']);
        })


        //     this.userInfoTo= await Net.getData(Api.userInfoBase,{
        //         uid:Utils.getValueByUrl('to_uid'),
        //         firstRecharge:1   
        //    });
        //    this.userInfo(this.userInfoTo);
        // if(this.userInfoTo['uid']==this.myUserINfo['uid']){
        //     location.href=location.origin + location.pathname + '?page=recharge';
        //     return;
        // }

        //充值首页列表
        // let recharge = await Net.getData(Api.recharge);
        // this.setRecharge(recharge['rechargeList']);

        //充值Banner
        // this.setBanner(recharge['bannerList']);

        //选中充值
        let self = this;
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;
        $("#friendRecharges").on("click", "li", function () {
            $(this).addClass("cur").siblings().removeClass('cur');
            self.amount = $(this).data('price');
        })

        //选中充值 微信
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
                jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表
            })
        }
        $("#helpRecharge").click(async (e) => {
            let txt = this.amount.toFixed(2);
            let to_uid: any;
            if (Utils.getValueByUrl('to_uid')) {
                to_uid = Utils.getValueByUrl('to_uid');
            } else {
                to_uid = this.myUserINfo['uid'];
            }
            if (isWeixin) {
                $(".rechargeDialog").hide();
                let userPay = await Net.getData(Api.userPay, {
                    amount: this.amount,
                    toUid: to_uid,
                    type: 42
                })
                //微信充值
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
                return;
            }
            $(".rechargeDialog").show();
            $(".price .total").text(txt);
        })

        //选择支付类型
        $(".payList li").click(function () {
            let selIco = $(this).find(".selIco");
            let nextSel = $(this).siblings('li').find(".selIco");
            if (selIco.hasClass("cur")) {
                selIco.removeClass("cur");
            } else {
                if (nextSel.hasClass("cur")) {
                    nextSel.removeClass("cur");
                }
                selIco.addClass("cur");
            }
            if (isWeixin) {
                self.paymType = 42;
                return;
            }
            self.paymType = $(this).data("type");
        })


        //支付
        $(".payBtn-action").click(async (e) => {
            let to_uid: any;
            if (Utils.getValueByUrl('to_uid')) {
                to_uid = Utils.getValueByUrl('to_uid');
            } else {
                to_uid = this.myUserINfo['uid'];
            }
            let userPay = await Net.getData(Api.userPay, {
                amount: this.amount,
                toUid: to_uid,
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
                    let form = $("<form action='https://mapi.alipay.com/gateway.do' method='get'></form>");
                    let formInput = '';
                    for (let key in userPay) {
                        formInput += `<input type="hidden" value="${userPay[key]}" name="${key}"  />`;
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

        // 当前用户信息
        this.myUserINfo = await Net.getData(Api.userInfo, { firstRecharge: 1 });

        //用户分享信息
        if (!this.myUserINfo) {
            $(".loginDialog").show();
            $(".closeLogin").hide();
            $(".loginDialog .mask").css("background", "#fff");
            return;
        }else{
            $("body").triggerHandler('loginEvent');
        }

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
     * 用户信息
     */
    private userInfo(userInfo: any) {

        let html = ` <div class="advanter"><img src="${userInfo['avatar']}" alt=""></div>
                    <div class="talkTip">
                        即将为<${userInfo['nick_name']}>充值，请选择充值金额
                    </div>`
        $(".rechargeBanner .top").html(html)
    }


    /**
     * 充值列表
     * @param rechargeList 
     */

    private setRecharge(rechargeList: any) {
        let html = '';
        for (let x = 0; x < rechargeList.length; x++) {
            let goodList = rechargeList[x]['goodsList'];
            if (this.userInfoTo['firstRecharge'] == 1) {
                for (let y = 0; y < goodList.length; y++) {
                    if (goodList[y]['attribute_id'] == 151) {
                        let total: any = (rechargeList[x]['money_coin'] / 100) + ((rechargeList[x]['money_coin'] / 100) * (goodList[y]['goods_company'] / 100) * goodList[y]['num']);
                        html += `<li class="item firstCZ" data-price="${rechargeList[x]['amount'] / 100}">
                                <a href="javascript:void(0)">
                                <p class="price">
                                    <span class="mon"><em>¥</em>${rechargeList[x]['amount'] / 100}</span>
                                    <span class="num">${goodList[y]['title']}</span>
                                </p>
                                <p class="txtTo">共${parseInt(total)}魅力币</p>
                            </a></li>`
                    }
                }
            } else {
                for (let y = 0; y < goodList.length; y++) {
                    if (goodList[y]['attribute_id'] == 153) {
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