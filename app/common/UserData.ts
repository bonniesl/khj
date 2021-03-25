/**
 * 用户信息
 */
export default class UserData {
    /**用户id */
    static uid:number ;
    /** 用户金币 */
    static coin:number;
    /** 用户积分 */
    static point:number;
    /**充值积分 */
    static moneyCoin:number;
    /** 服务器下发的用户数据 */
    static data:any;
    /** 预置结果 1 可以赢 2必须输 */
    static preset:any = 2;
    /**用户头像 */
    static avatar:string;
    /**用户名称 */
    static userName:string = '';
    /**用户是否首冲 */
    static firstRecharge:number;
}