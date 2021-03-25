/**
 * 事件
 */
export default {
    //====================== 系统事件
    /** 系统onUpdate事件 */
    update: 'update',
    /**ajax错误监听 */
    error: 'error',

    //====================== 界面事件
    /**更新底部导航状态 */
    updateBottomNav: 'updateBottomNav',
    /** 对body和html设置overflow:hidden 禁用滚动 */
    viewScroll: 'viewScroll',
    /** 重新获取gameinner里面的用户信息 */
    updateGameInnerUser:'updateGameInnerUser',
    /** 设置游戏inner界面显示状态 */
    gameInnerState:'gameInnerState',
}