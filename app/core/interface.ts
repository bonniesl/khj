interface ajaxData {
    src: string;
    /**规定要发送到服务器的数据。 */
    data?: any;
    /**规定请求的类型（GET 或 POST） */
    type: string;
    /**	预期的服务器响应的数据类型。 */
    dataType?: string;
    /** 成功回调 */
    success?: Function;
}

/**
 * 界面配置结构 
 */
interface viewConfig {
    /**界面名称 */
    name: string;
    /**界面类 */
    class: any;
    /** 模板路径 */
    skin: string;
    /** 是否关闭上一个场景 如果不关闭，则加入 absolute属性 */
    closePre: boolean,
    /** 是否浮动 */
    float?: boolean
}

/**
 * 界面类接口
 */
interface viewBase {
    /**是否播放动画 */
    animation: boolean;
    /** 是否播放关闭时的过度动画 */
    isCloseAnimation: boolean;
    /**模板名称 */
    name: string;
    /**是否已经添加 */
    isAdd: boolean;
    /**是否缓存数据=>可以避免每次打开界面都去请求最新的数据，可以根据需求修改 */
    storage: boolean;
    /**数据 => 默认数据主要储存来自服务器的界面数据 */
    data: any;
    /**打开界面时带入的数据 */
    dataSource: any;
    /**模板 */
    template: any;
    /**
     * 添加到场景
     * @param float 是否浮动，加入 absolute 浮在上层
     */
    add(parent: ZeptoCollection, float?: boolean): void;
    /**播放加入到场景动画 */
    openAnimation(): void;
    /**播放移除到场景动画 */
    closeAnimation(): void;
    /**从父级删除 */
    remove(): void;
}

/**
 * 坐标
 */
interface pos {
    x: number,
    y: number
}

/**
 * api接口协议
 */
interface apiData {
    /**方法名称 */
    name: string,
    /**地址 */
    url: string
}

/**
 * 合并图片结构
 */
interface mergeImage {
    /** 画布宽 */
    width: number;
    /** 画布高 */
    hieght: number;
    /**
     * 要合成的图片列表 
     * 
     */
    images: {
        /**图片地址 */
        src: string;
        /**画布位置 */
        x?: number;
        /**画布位置 */
        y?: number;
        /**宽 */
        width?:number
        /**高 */
        height?:number
    }[];
    /**要写的字 */
    texts?: {
        /**内容 */
        string: string;
        /** 字体大小 */
        fontSize?:number;
        /**颜色 */
        color?: string;
        /**坐标x */
        x?: number;
        /**坐标y */
        y?: number;
    }[];
    /**品质 */
    quality?: number;
}

declare var TWEEN: any
declare var lazyload: any
declare var Picker: any
declare var city: any
declare var wx: any
declare var ClipboardJS: any
declare var hostUrl:any;
declare var Swiper:any;
declare var QRCode:any;
declare var _czc:any;
declare var swan:any;
// declare var createMarquee: any;
// declare var window:any;