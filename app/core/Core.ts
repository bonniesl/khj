import ViewManager from "./ViewManager";
import EventDispatcher from "./EventDispatcher";
import Utils from "./Utils";
import Route from "./Route";

export default class Core {
    /**主场景 */
    static root: ZeptoCollection;
    /**当前打开界面 */
    static currentView:viewConfig;
    /**上一个关闭的界面 */
    static preView:viewConfig;
    /** 界面管理 */
    static viewManager = ViewManager;
    /**事件管理 */
    static eventManager = EventDispatcher;
    /**工具类 */
    static utils = Utils;
    /** 路由 */
    static route = Route;
}