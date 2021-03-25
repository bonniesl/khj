import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import Slider from "../component/Slider";
import EventType from "../../common/EventType";
import Config from "../../common/Config";
import { Net, Api } from "../../common/Net";
import Data from "../../common/Data";
import UserData from "../../common/UserData";


export default class Guide  extends ViewBase {

    /**轮播图组件*/
    private slide: Slider;

    onEnable(){
        this.slide = new Slider('#banner');
        
        this.setLazyLoad();
    }

    /**
     * 设置懒加载 
     */
    private setLazyLoad() {   
        lazyload($(".lazy"));
    }

    onClick(e) {
        console.log(e)
    }
}   