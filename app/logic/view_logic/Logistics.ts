import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";

/**
 * 物流详情
 */
export default class Logistics extends ViewBase {

    onEnable(){
        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.myOrder);
        })
    }

    
}   