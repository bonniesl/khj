import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";

/**
 * 积分兑详情
 */

export default class IntegralDetail extends ViewBase {

    onEnable(){
        // Core.viewManager.closeView(Core.preView);
        $('#goBack').on('click', ()=>{
            Core.viewManager.openView(ViewConfig.integral);
        });

    }

    onClick(e) {
        console.log(e)
    }

    onRemove(){
        $('#goBack').off();
    }
} 