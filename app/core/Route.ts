import ViewConfig from "../common/ViewConfig";
import Core from "./Core";


/**
 * 路由
 */

export default class Route {

    public static loginCheckHook: any;
    private static oldUrl: string;
    private static newUrl: string;
    private static currl:string;

    static init(): void {
        this.listen();

        if ("onhashchange" in window) {
            $(window).on('hashchange', (e) => {
                console.log(e)
                this.oldUrl = e['oldURL'];
                this.newUrl = e['newURL'];
                this.listen();
            })
        } else {
            alert("浏览器版本过低，请换个浏览器!");
        }

    }

    /**
     * 监听地址栏变化
     */
    static listen(): void {
        let hash: any = location.hash;
        // let checkT = this.loginCheckHook();
        // let self=this;
        // if(hash==''){
        //     location.href='#';
        // }
        // checkT.then((res) =>{
        //     if ( !res) {
        //         // window.event.returnValue=false;
        //         // location.href = this.oldUrl;
        //         location.replace(this.oldUrl);
        //         return ;
        //     }
        //     if(self.currl==hash){
        //         return;
        //     }
        //     self.currl=hash;
        //     this.dispatcher(hash.match(/[^#]\w+/));
        // })

        this.dispatcher(hash.match(/[^#]\w+/));

    }

    /**
     * 解析地址 打开对应的界面
     * @param src 
     */
    static dispatcher(src: any): void {
        if (!src) src = ['index'];

        

        // switch (src[0]) {
        //     default:
        //         console.error('界面不存在，现在还未做处理')
        //         return;
        // }

        if (!ViewConfig[src[0]]) {
            console.error('模板不存在，现在还未做处理')
            return;
        }
        // if (Core.preView) Core.preView.remove();
        // Core.preView = ViewConfig[src[0]];
        Core.viewManager.openView(ViewConfig[src[0]]);
        this.listenFloatViewState();
    }

    /**
     * 监听一些弹窗是否打开 在切换界面的时候进行关闭
     * @description 每次打开界面的时候都去检测是否有浮层在，如果有就关闭所有界面
     */
    private static listenFloatViewState() {
        let list = Core.viewManager.views;
        for (let x = 0; x < list.length; x++) {
            if (list[x][0].isAdd && !ViewConfig[list[x][1]].closePre) {
                Core.viewManager.closeView(ViewConfig[list[x][1]]);
                x--;
            }
        }
    }
}