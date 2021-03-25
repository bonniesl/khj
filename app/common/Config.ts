/**
 * 总配置
 */
export default class Config {
    /**数据域名 */
    // static baseUrl:string = 'http://api-h5.786g.com';
    // static baseUrl:string = hostUrl['apiH5Url'];
    static get baseUrl(): string {
        return location.hostname == "www.52kouhong.com" ? hostUrl['apiH5Url'] : 'http://api-h5.786g.com';
    };
    /**图片域名 */
    // static imgBase:string = 'http://s-h5.786g.com/'
    // static imgBase:string = hostUrl['staticUrl'];
    static get imgBase(): string {
        return location.hostname == "www.52kouhong.com" ? hostUrl['staticUrl'] : 'http://s-h5.786g.com/';
    };
    /** 版本号 */
    static version: number = 20190117113;
}