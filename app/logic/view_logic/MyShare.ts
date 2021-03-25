import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import Config from "../../common/Config";
import Utils from "../../core/Utils";
import { Net, Api } from "../../common/Net";

export default class MyShare extends ViewBase {

    private qrode;  //二维码
    private picImg;  //二维码src

    async  onEnable() {
        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.personal);
        })

        //邀请好友
        let self =this;
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;
        $(".shareDialog").on("touchmove", function () {
            event.preventDefault();
        });

        $(".Invite").click(function () {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","我的邀请","点击邀请"]);
            if(isWeixin){
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
                timestamp:wxJsdk['timestamp'], // 必填，生成签名的时间戳
                nonceStr:wxJsdk['nonceStr'], // 必填，生成签名的随机串
                signature: wxJsdk['signature'],// 必填，签名
                jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage'] // 必填，需要使用的JS接口列表
            })
        }
      
        let href = window.location.href;
        let linkHref = encodeURIComponent(location.origin + location.pathname + '?page=index');
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
                $("#broswerDialog").hide();
            } catch (error) {
                console.log('复制失败')
            }
        }

         //关闭浏览器分享
         $(".broswerDialog .close").click(function(){
            $(".broswerDialog").hide();  
         })

        //生成海报图片
       
        let $this = this;
        let htmlSize = parseFloat( window.document.documentElement.style['font-size']);
        setInterval(function(){
            let H = $("#shareImg").height();
            let qH = H-htmlSize*6.1;
            $("#qrcode").css("top",qH+'px');
        },1000)
        
        await Utils.ajax({
            url: '/src/qrcode.min.js',
            dataType:'script'
        });
        $(".Poster").click(function () {
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","我的分享邀请","点击生成海报图片"]);
            $.ajax({
                type:'get',
                dataType: 'json',
                url: Api.codeShare['url'] +'?redirect_uri='+ linkHref,
                xhrFields: {
                    withCredentials: true
                },
                success: (data) => {

                    //二维码
                    $this.qrode = new QRCode(document.getElementById("qrcode"), {
                            text: data['mes']['url'],
                            width: htmlSize*3.1,
                            height: htmlSize*3.1,
                            colorDark : "#000000",
                            colorLight : "#ffffff"
                    }); 
                    var image = new Image();  
                    var picImage = $this.qrode['_oDrawing']['_elImage'];
                    var mycans=$('canvas')[0].toDataURL("image/png");
                    image.src=mycans;
                    image.onload = function () {         
                        $this.picImg=image.src; 
                        Utils.mergeImage({
                            width: 750,
                            hieght: 1219,
                            images: [
                                { src: '/res/other/getPrize.jpg' },
                                { src: $this.picImg, width: 310, height: 310, x: 221, y: 610 }
                            ]
                        }).then((d) => {
                            $('#shareImg').show();
                            $('#shareImg').find('.picc')[0].src = d
                        });
                          
                    }
                }
            });
            // $('#shareImg').show();
        })
        $(".share-img .icon").click(function(){
            $('#shareImg').hide();
        })
        

        //邀请收益
        let userPromote = await Net.getData(Api.userPromote);
        
        //注册
        let regCount = userPromote['reg']['count'];
        let regCoin:any =parseInt(userPromote['reg']['coin']) / 100;
        let regCoinInt:any = parseInt(regCoin);
        $("#mycoin1 .red").text(regCoinInt);
        $("#mycoin1 .money2 em").text(regCount);

        //签到
        let signCount = userPromote['sign']['count'];
        let NotSign:any = regCount-signCount;
        let signCoin:any = parseInt(userPromote['sign']['coin']) / 100;
        let signCoinInt:any = parseInt(signCoin);

        $("#mycoin2 .red").eq(0).text(signCoinInt);
        $("#mycoin2 .txt1 i").eq(0).text(signCount);
        $("#mycoin2 .txt2 i").eq(0).text(NotSign);

        //玩
        let playCount = userPromote['play']['count'];
        let NotPlay:any = regCount-playCount;
        let playCoin:any = parseInt(userPromote['play']['coin']) / 100;
        let playCoinInt:any = parseInt(playCoin);

        $("#mycoin3 .red").eq(0).text(playCoinInt);
        $("#mycoin3 .txt1 i").eq(0).text(playCount);
        $("#mycoin3 .txt2 i").eq(0).text(NotPlay);

    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#myShare").append(html);
        setTimeout(() => {
            $("#toast").remove();
        }, 600);
    }

    onClick(e) {
        console.log(e)
    }
}   