import { Net, Api } from "../../common/Net";
import ViewConfig from "../../common/ViewConfig";

export default class personInfo {

    constructor() {
        this.init();
    }

    private async init() {
        let userInfo=await Net.getData(Api.userInfo,{userMes:1,userGoods:1});
        this.setUserInfo(userInfo);
    }

     /**
     * 用户信息
     */
    private setUserInfo(userInfo:any[]){
        let html='';
        let coin: any = userInfo['coin'] / 100;
        let coins: any = parseInt(coin);
        html=`<div class="headport">
                <img src="${userInfo['avatar'].indexOf("http")==-1 ? 'http://s-h5.52kouhong.com/upload/2018/ci/avatar.jpg' : userInfo['avatar']}" alt="">
            </div>
            <div class="tit">
                <h3>${userInfo['nick_name']}</h3>
                <p>我的魅力币：${coins}</p>
                <p>我的积分数：${userInfo['point']}</p>
            </div>`
       $("#headportbox").html(html);
    }

}