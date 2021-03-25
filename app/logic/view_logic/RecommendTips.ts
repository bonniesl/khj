import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import AwardsBox from "./AwardsBox";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import UserData from "../../common/UserData";
import Utils from "../../core/Utils";

export default class RecommendTips extends ViewBase {

  private page=0;
  private lists=[];
  private userInfo:any;
  private promoteGift:any;
  async  onEnable(){
         // 关闭自己单独定义类名
         this.node.on('click', '.closeSelf', async() => {

            Core.viewManager.closeView(ViewConfig.recommendTips);
            $("#root").find("#creditDialog").hide();
            $("#root").find("#creditDialogs").hide();
            // window.history.pushState(null, '', '#recharge');
            if (Core.currentView['name'] != 'gameInner')//如果是游戏界面就直接退出游戏
                Core.eventManager.event(EventType.updateBottomNav, { hide: false });// if(Core.currentView.name != 'personal')
            // $("body,html").css({"overflow":"auto" });    

            this.promoteGift = await Net.getData(Api.promoteGift);

        });

        //分页
        let self = this;
        this.userInfo = await Net.getData(Api.userInfo);
        let userPromoteList = await Net.getData(Api.userPromoteList,{
            page:this.page
        });
        this.promoteList(userPromoteList['list']);
        this.processValue(userPromoteList['value']);



        //邀请好友帮忙
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;
        //分享
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

        let linkHref=encodeURIComponent(location.origin + location.pathname+'?page=index');   
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
                            link: data['mes']['url'],//wxJsdk['url'], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: 'http://s-h5.52kouhong.com/upload/2018/ci/TOM_FORD.jpg', // 分享图标
                            success: function () {
                                // 设置成功
                                $(".shareDialog").hide();
                            }
                        });
                    })
                }else{
                    $(".shareTxt-copy").val(data['mes']['url']);
                }
               
            }
        });

        $(".recommendTop").on('click','.helpBtn',async(e)=>{
            if(userPromoteList['value']>=1200){
                let userPromoteGift=await Net.getData(Api.userPromoteGift,{goodsId:'29'});
                if(userPromoteGift){ 
                    this.errorDialog('领取成功,前往奖品柜领取哦~');   
                    let promoteGift = await Net.getData(Api.promoteGift);
                    $(e.currentTarget).text("已领取");
                } 
                return;
            }else{
                if(isWeixin){
                    $(".shareDialog").show();
                    return;
                }
                $(".broswerDialog").show();
            }
        })

        let recommendMiddle = document.getElementById("recommendMiddle");
    }

    /**活跃度 */
    private async processValue(value:any){
        let promoteGift = await Net.getData(Api.promoteGift);
        let txt='';
        let html=` <p class="title ${value>=1200 ? 'titRed' : ''}"> ${value>=1200 ? '太棒了，您现在可以领口红了' : '<span>恭喜您已获得兑换口红资格</span>组织好友为你填满活跃度即可兑换哦'}</p>
                    <div class="processTop">
                        <div class="processLine">
                            <div class="processCur" style="width:${value>=1200 ? '100' :(value/1200) * 100 }%;display:${value>0 ? 'block' : 'none'}"></div>
                        </div>
                        <div class="processtxtTip">
                            <p class="begin">开始</p>
                            <div class="middle" style="left:${ value>=1200 ? '90'  :(((value/1200) * 100)-8)}%;display:${value>0 ? 'block' : 'none'}""><span>${value>=1200 ? '1200' : value}</span></div>
                            <p class="end">1200</p>
                        </div> <div class="helpBtn">`
                               if(promoteGift['goods_id'].indexOf('29')>-1){
                                    html+=`已领取</div></div> `;
                               }
                                if(value>=1200){
                                    html+=`立即领取</div></div>`;
                                }else{
                                    html+=`请好友帮忙</div></div>`;
                                }
                        
        $(".recommendTop").html(html);  

    }


    /**记录 */
    private  promoteList(list:any){
        let html='';
        let txt=''
        let valuId=[30,31,32,33];
        
        if(list.length==0){
            let html1=`<p class="null">暂无帮忙记录哦~</p>`
            $(".recommendMiddle").html(html1);
            return;
        }
        for(let x=0;x<list.length;x++){
            if(list[x]['goods_id'].indexOf("30")>-1){
                txt='进行签到';
            }else if(list[x]['goods_id'].indexOf("31")>-1){
                txt='进行充值';
            }else if(list[x]['goods_id'].indexOf("32")>-1){
                txt='发起闯关';
            }else if(list[x]['goods_id'].indexOf("33")>-1){
                txt='为您打开活跃度礼包';
            }
            html+=`<li>
                        <p class="lf">${list[x]['login_name']}${txt}</p>
                        <p class="rl">贡献${list[x]['value']}点活跃度</p>
                    </li>`
        }
        $("#recommendMiddle").html(html);
    }

    
    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#recommendTips").append(html);
        setTimeout(() => {
            $("#toast").remove();
        }, 600);
    }



    onClick(e) {
        console.log(e)
    }
}   