import Config from "./Config";
import Core from "../core/Core";
import EventType from "./EventType";

let baseUrl = Config.baseUrl;

/**
 * api地址
 */
export class Api {
    /**首页 */
    static index: apiData = { name: 'index', url: baseUrl + '/index/' }
    /**首页 场次列表 */
    static roomList: apiData = { name: 'roomList', url: baseUrl + '/room/list/' }
    /** 场次详情  */
    static roomInfo: apiData = { name: 'roomInfo', url: baseUrl + '/room/info' }
    /**游戏开始 */
    static gameStart: apiData = { name: 'gameStart', url: baseUrl + '/user/game/start/' }
    /**游戏结束 */
    static gameEnd: apiData = { name: 'gameEnd', url: baseUrl + '/user/game/end/' }
    /**领取奖励 */
    static gameReward:apiData = {name:'gameReward', url:baseUrl + '/user/game/accept'}

    /**用户登陆  */
    static login: apiData = { name: 'login', url: baseUrl + '/weiXin/accessToken' }
    /** 用户信息 */
    static userInfo: apiData = { name: 'userInfo', url: baseUrl + '/user/info' }
    /**分享好友用户信息 */
    static userInfoBase: apiData = { name: 'userInfo', url: baseUrl + '/user/info/base' }
    /**发现首页 */
    static find: apiData = { name: 'find', url: baseUrl + '/article/' }
    /**发现列表 */
    static findList: apiData = { name: 'findList', url: baseUrl + '/article/list' }
    /**发现详情 */
    static articleInfo: apiData = { name: 'articleInfo', url: baseUrl + '/article/info' }
    /**用户消息 */
    static messageList: apiData = { name: 'messageList', url: baseUrl + '/user/mes/index' }
    /**用户消息详情 */
    static newsInfo: apiData = { name: 'newsInfo', url: baseUrl + '/user/mes/info' }
    /**用户地址列表 */
    static addressList: apiData = { name: 'addressList', url: baseUrl + '/user/address' }
    /**用户添加收货地址 */
    static addressAdd: apiData = { name: 'addressAdd', url: baseUrl + '/user/address/add' }
    /**地址编辑 */
    static addressUpdate: apiData = { name: 'addressUpdate', url: baseUrl + '/user/address/update' }
    /**删除地址 */
    static addressDel: apiData = { name: 'addressDel', url: baseUrl + '/user/address/del' }
    /**用户收藏文章 */
    static articleFav: apiData = { name: 'articleFav', url: baseUrl + '/user/collect/article' }
    /**用户收藏列表 */
    static favList: apiData = { name: 'favList', url: baseUrl + '/user/collectList/article' }
    /**用户收藏场次列表 */
    static favRoomList: apiData = { name: 'favRoomList', url: baseUrl + '/user/collectList/room' }
    //用户收藏场次
    static roomFav: apiData = { name: 'roomFav', url: baseUrl + '/user/collect/room' }
    /**用户分享 */
    static articleShare: apiData = { name: 'articleShare', url: baseUrl + '/user/share/article' }
    /**我的签到 */
   static signList: apiData = { name: 'signList', url: baseUrl + '/signature/list' }
   /**用户分享场次 */
   static roomShare:apiData={name:'roomShare',url:baseUrl+ '/user/share/room'}
    /**签到 */
    static signature: apiData = { name: 'signature', url: baseUrl + '/user/signature' }
    /**充值首页 */
    static recharge: apiData = { name: 'recharge', url: baseUrl + '/recharge/' }
    /**充值记录 */
    static rechargeRecord: apiData = { name: 'rechargeRecord', url: baseUrl + '/user/rechargeList' }
    /**奖品柜 */
    static awardsBox: apiData = { name: 'awardsBox', url: baseUrl + '/user/goods' }
    /**用户奖品下单 */
    static goodsOrder: apiData = { name: 'goodsOrder', url: baseUrl + '/user/order/create' }
    /**订单详情 */
    static OrderInfo: apiData = { name: 'OrderInfo', url: baseUrl + '/user/order/info' }
    /**我的订单 */
    static OrderList: apiData = { name: 'OrderList', url: baseUrl + '/user/order' }
    /**充值 */
    static userPay: apiData = { name: 'userPay', url: baseUrl + '/user/pay' }
    /**jsdk调用 */
    static wxJsdk: apiData = { name: 'wxJsdk', url: baseUrl + '/weiXin/jsdk?redirect_uri=' + encodeURIComponent(window.location.href)}
    /**分享调用 */
    static codeShare: apiData = { name: 'codeShare', url: baseUrl + '/code/en'}
    /**全屏广播*/
    static hitMes: apiData = { name: 'hitMes', url: baseUrl + '/hitMes'}
    //用户推广
    static userPromote: apiData = { name: 'userPromote', url: baseUrl + '/user/promote'}
    //获取手机验证码
    static register: apiData = { name: 'register', url: baseUrl + '/user/phone/code'}
    //图形验证码
    static codePic: apiData = { name: 'codePic', url: baseUrl + '/code/img/'}
    //手机登录
    static phoneLogin: apiData = { name: 'phoneLogin', url: baseUrl + '/user/phone'}
    //推荐送豪礼
    static promoteGift: apiData = { name: 'promoteGift', url: baseUrl + '/user/promoteGift'}
    //领取奖励
    static userPromoteGift: apiData = { name: 'userPromoteGift', url: baseUrl + '/user/promoteGift/getGift'}
    //活跃度
    static userPromoteList: apiData = { name: 'userPromoteList', url: baseUrl + '/user/promoteGift/list'}
    //用户-结束游戏-领取奖品
    static gameAgain: apiData = { name: 'gameAgain', url: baseUrl + '/user/game/again'}
}

/**
 * 网络通讯层 => 从服务器获取需要的数据都用这个接口
 */
export class Net {
    /**
     * 获取数据
     * @param name 方法名称
     * @param d  要带入的数据
     */
    static async getData(api: apiData, d?: any) {
        if (!api) return null;
        let parameter = '';
        if (d) {
            for (let i in d) {
                parameter += '/' + i + '-' + d[i];
            }
        }
        console.log('%c ==> ' + api.name, 'color:rgba(255, 0, 0, .8);font-weight:700;background-color:rgba(0,0,0, 0.1)', api.url , d);
        let data = await Core.utils.ajax({ url: api.url + parameter, dataType: 'json' });
        if (!data) {
            console.error(api.name + ' 没有数据返回!')
            return null;
        }
        if (data['code']) {//code不为零算异常处理
            Core.eventManager.event(EventType.error, {
                data: data,
                api: api.name
            });
            return null;
        }
        console.log('%c <== ' + api.name, 'color:rgba(27, 144, 4, 1);font-weight:700;background-color:rgba(0,0,0, 0.1)', data['mes']);
        return data['mes'];
    }
}