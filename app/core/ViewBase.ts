import Base from "./Base";
import Core from "./Core";
import EventType from "../common/EventType";
export default class ViewBase extends Base implements viewBase {

    /**
     * 生命周期
     * 名称 异步模板 添加到场景
     */

    /**模板名称名称 (要是独一的，防止id冲突) */
    name: any;

    /** 是否播放动画 */
    animation: boolean = true;
    /** 是否播放关闭时的过度动画 */
    isCloseAnimation: boolean = false;

    /** 是否已经添加到场景 */
    isAdd: boolean = false;

    /**是否缓存界面数据 */
    storage: boolean = false;

    /**数据=>服务端来的数据 */
    data: any;

    /**打开界面时带入的数据 */
    dataSource: any;

    /**模板数据 */
    private _template: string;
    get template() {
        return this._template;
    }
    set template(d: any) {
        // this._template = d.replace(/\<div/, `<div id=${this.name} `);///^\<div/
        this._template = d;
    }

    /** 当前节点 */
    node: ZeptoCollection;

    onAwake() {
        // console.log(222)
    }

    /**
     * 已经获取到模板，未添加到场景 可在这里进行数据添加
     */
    onCreate(data?: any) {

    }

    /**
     * 添加到场景
     * @param float 是否浮动，加入 absolute 浮在上层
     */
    add(parent: ZeptoCollection, float: boolean = false) {
        this.onCreate();
        // console.log(this._template);
        parent.append(`<div id=${this.name} class="view ${float ? 'absolute' : ''} full-window">${this._template}</div>`);
        ; (parent[0] as HTMLDivElement).scrollTop = 0;//默认滚到最上面，后期根据需求优化
        this.isAdd = true;
        // this.node = parent.querySelector(`#${this.name}`);
        this.node = $(`#${this.name}`);
        if (this.node) {
            this.node.on('click', (e) => {
                e.stopPropagation();
                this.onClick(e);
            });//绑定点击事件

            //给a标签添加单独事件
            // this.node.on('click', 'a', (e) => {

            // }); 
        }
        
        this.onEnable();
        Core.eventManager.on(EventType.update, this, this.onUpdate);
    }

    /**
     * 打开界面时的动画
     */
    openAnimation() {
        this.node.css({ opacity: 0, transform: 'translateX(1.5rem)' });
        this.node.animate({
            opacity: 1,
            transform: 'translateX(0)'
        }, 400, 'ease-out', () => {
            this.node.css({
                transform: null
            })
        });
    }
    /**
     * 打开界面时的动画
     */
    closeAnimation() {
        // this.node.css({ opacity: 0, transform: 'translateX(1.5rem)' });

        this.node.animate({
            opacity: 0,
            transform: 'translateX(1.5rem)'
        }, 200, 'ease-out', () => {
            this.remove();
        });
    }



    /**
     * 点击事件
     */
    onClick(e: any) {
    }

    /**
     * 已经添加到场景
     */
    onEnable() {

    }


    /**
     * 每帧执行一次
     */
    onUpdate() {

    }


    /**
     * 场景删除
     */
    remove() {
        this.isAdd = false;
        this.node.off();
        this.node.remove();
        if (this.node) this.node.off('click');//绑定点击事件
        Core.eventManager.off(EventType.update, this.onUpdate);
        this.onRemove();

    }

    /**
     * 从场景移除
     */
    onRemove() {

    }
}