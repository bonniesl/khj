/**
 * 基类
 */
export default class Base {

    /**单例 */
    static instance:Base;

    constructor() {
        Base.instance = this;
        this.onAwake();
    }

    /**
     * 构造
     */
    onAwake() {

    }

    /**
     * 销毁
     */
    onDestroy() { }
}