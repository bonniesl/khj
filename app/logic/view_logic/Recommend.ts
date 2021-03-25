import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import AwardsBox from "./AwardsBox";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import UserData from "../../common/UserData";
import Utils from "../../core/Utils";

export default class Recommend extends ViewBase {


    private userInfo:any;

  async  onEnable() {

        // 关闭自己单独定义类名
        this.node.on('click', '.closeSelf', async() => {
            Core.viewManager.closeView(ViewConfig.recommend);
            $("#root").find("#creditDialog").hide();
            $("#root").find("#creditDialogs").hide();
            if (Core.currentView['name'] != 'gameInner')//如果是游戏界面就直接退出游戏
                Core.eventManager.event(EventType.updateBottomNav, { hide: false });// if(Core.currentView.name != 'personal')

                this.userInfo = await Net.getData(Api.userInfo);
                let coninn = isNaN(parseInt(this.userInfo['coin'])) ? 0 : parseInt(this.userInfo['coin']);
                let coin: any = coninn / 100;
                let coins: any = parseInt(coin);
                $(".rechargeBtn em").text(coins);  
        });

        //推荐豪礼
        let self =this;
        this.userInfo = await Net.getData(Api.userInfo);
        let ua = navigator.userAgent.toLowerCase();
        let isWeixin = ua.indexOf('micromessenger') != -1;
       
        let promoteGift = await Net.getData(Api.promoteGift);
        let today:any = +new Date();
        let registerTime = this.userInfo['c_time'] < '2019-01-21 20:00:00' ? '2019-01-21 20:00:00' : this.userInfo['c_time'];
        let oldTime:any = +new Date(registerTime.replace(/-/g, "/"));
        this.giftReceive(promoteGift);

        //倒计时
       this.dateReduce(); 
        setInterval(function(){
            self.dateReduce();
       }, 1000);
 

        //领取奖励
        $(".reagainBtn").click(async(e)=>{
            Core.eventManager.on(EventType.error, this, this.onError);
            let goodsId= $(e.currentTarget).data("id");
            if($(e.currentTarget).data("id")=="29" && (today-oldTime)/(1000*60*60*24)<=15){
                Core.viewManager.openView(ViewConfig.recommendTips);
                return;
            }
            let userPromoteGift=await Net.getData(Api.userPromoteGift,{goodsId:goodsId});
            if(userPromoteGift){ 
                this.errorDialog('领取成功');   
                let promoteGift = await Net.getData(Api.promoteGift);
                this.giftReceive(promoteGift);
                $(e.currentTarget).addClass('recDisabled');
            } 

        })

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
                    $("#shareTxt-copy").val(data['mes']['url']);
                }
               
            }

        });

        $(".inviteBtn").click(function(){
            let lcsz = _czc || [];
            lcsz.push(["_trackEvent","邀请领奖","朋友圈"]);
            if(isWeixin){
                $(".shareDialog").show();
                return;
            }
            $(".broswerDialog").show();
        })

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

         //关闭分享
         $(".shareDialog").click(function(){
            $(".shareDialog").hide();      
         })  

         //关闭浏览器分享
         $(".broswerDialog .close").click(function(){
            $(".broswerDialog").hide();  
         })


        Core.eventManager.event(EventType.viewScroll, true);
    }

    /**
     * 错误弹窗显示
     * @param data  错误提示信息
     */

    private onError(data: any) {
        switch (data['api']) {
            case Api.userPromoteGift.name:
                this.errorDialog(data['data']['mes']);
                break;
        }
    }

    private async giftReceive(promoteGift:any){
        let html='';
        let storage = window.localStorage;
        let num:Number;
        let coinS=['30魅力币','70魅力币','120魅力币','MAC口红']; //奖励
        let perNum = [3,10,20,40];//满足人数
        // let perNum = [1,2,3,4];
        let goosid:any[]=['26','27','28','29'];//领取奖励ID
        let fixedShow =false;

        //时间区间15天内
        let today:any = +new Date();
        let registerTime = this.userInfo['c_time'] < '2019-01-21 20:00:00' ? '2019-01-21 20:00:00' : this.userInfo['c_time'];
        let oldTime:any = +new Date(registerTime.replace(/-/g, "/"));
        for(let x=0;x<coinS.length;x++){
            html+=`<li class="${promoteGift['count']>=perNum[x] ? 'complete' : '' }" >
                    <p class="${x<3 ? 'reico' : 'reprize'} "></p>
                    <div class="info">
                        <p class="money">${coinS[x]}</p>
                    </div>
                    <p class="per">成功推荐<span>${promoteGift['count']}</span>位好友 <em style="display:${promoteGift['count']>=perNum[x] ? 'none' : 'inline' }">,还需推荐<span>${perNum[x]-promoteGift['count']}</span>位好友</em></p>
                    <div data-id="${goosid[x]}" class="reagainBtn ${(promoteGift['goods_id'].indexOf(goosid[x])>-1) || (today-oldTime)/(1000*60*60*24)>15  ? 'recDisabled' : 'recbtn' }" style="display:${promoteGift['count']>=perNum[x] ? 'block' : 'none' }" >`
                    if(promoteGift['goods_id'].indexOf(goosid[x])>-1){
                        html+= `已领取</div></li>`;
                    }else if((today-oldTime)/(1000*60*60*24)>15){
                        html+= `已超时</div></li>`;
                    }else{
                        html+= `领取</div></li>`;
                    } 
         
            if((today-oldTime)/(1000*60*60*24)<=15)  {
                fixedShow=true;
            }else{
                if(promoteGift['count']>=perNum[x] && (promoteGift['goods_id'].indexOf(goosid[x])==-1)){
                    fixedShow=false;
                } 
            }                
        } 

        if(fixedShow==false){
            storage.setItem('receiveW','1');
        }

        $("#recommendList").html(html);
    }
    
    private dateReduce(){
        let today:any = new Date();
        let registerTime = this.userInfo['c_time'] < '2019-01-21 20:00:00' ? '2019-01-21 20:00:00' : this.userInfo['c_time'];
        let date = new Date(registerTime.replace(/-/g, "/"));
        let intDiff:any =this.DateAdd("d ", 15, date);
        let t= intDiff.getTime()- today.getTime();
    
        let day:any=0,
                hour:any=0,
                minute:any=0,
                second:any=0;//时间默认值        
            if(t> 0){
                day = Math.floor(t/1000/60/60/24);
                hour = Math.floor(t/1000/60/60%24);
                minute = Math.floor(t/1000/60%60);
                second = Math.floor(t/1000%60);
            }
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            $(".timeTotal span").html(day+"天"+ hour + '时' + minute + '分' + second + '秒');
        t--;
        if(t== 0){
            clearInterval()
        }
    }

    /**倒计时 */
    private  DateAdd(interval, number, date) {
        switch (interval) {
            case "y ": {
                date.setFullYear(date.getFullYear() + number);
                return date;
                break;
            }
            case "q ": {
                date.setMonth(date.getMonth() + number * 3);
                return date;
                break;
            }
            case "m ": {
                date.setMonth(date.getMonth() + number);
                return date;
                break;
            }
            case "w ": {
                date.setDate(date.getDate() + number * 7);
                return date;
                break;
            }
            case "d ": {
                date.setDate(date.getDate() + number);
                return date;
                break;
            }
            case "h ": {
                date.setHours(date.getHours() + number);
                return date;
                break;
            }
            case "m ": {
                date.setMinutes(date.getMinutes() + number);
                return date;
                break;
            }
            case "s ": {
                date.setSeconds(date.getSeconds() + number);
                return date;
                break;
            }
            default: {
                date.setDate(date.getDate() + number);
                return date;
                break;
            }
        }
    }
    

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#recommend").append(html);
        setTimeout(() => {
            $("#toast").remove();
        }, 600);
    }

    onClick(e) {
        console.log(e)
    }

    onRemove() {
        Core.eventManager.event(EventType.viewScroll, false);
        Core.eventManager.off(EventType.error, this.onError);
    }
}   