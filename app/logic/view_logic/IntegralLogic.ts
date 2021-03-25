import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";



export default class IntegralLogic extends ViewBase {

    onEnable() {
        // Core.viewManager.closeView(Core.preView);

        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.personal);
        })

        $('#integralListBox').on('click', '.integralList', () => {
            Core.viewManager.openView(ViewConfig.integralDetail)
        })

    }

    onClick(e) {
        console.log(e)
    }

    onRemove(){
        $('#goBack').off();
    }
} 