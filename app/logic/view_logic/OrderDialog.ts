import ViewBase from "../../core/ViewBase";



export default class OrderDialog extends ViewBase {

    onEnable(){
        // Core.viewManager.closeView(Core.preView);
    }

    onClick(e) {
        console.log(e)
    }
} 