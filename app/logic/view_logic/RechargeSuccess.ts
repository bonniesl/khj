import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";



export default class RechargeSuccess extends ViewBase {

    onEnable() {

        $(".goIndex").on('click', () => {
            location.href = '#';
            Core.viewManager.closeView(ViewConfig.recharge);
        })
        
    }

    onClick(e) {
        console.log(e)
    }
} 