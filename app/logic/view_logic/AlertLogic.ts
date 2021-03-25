import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";


export default class AlertLogic extends ViewBase {

    onEnable(){
        // Core.viewManager.closeView(Core.preView);
    }

    onClick(e) {
        console.log(e)
    }
}   