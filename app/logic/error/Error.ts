import Core from "../../core/Core";
import EventType from "../../common/EventType";

/**
 * 错误处理
 */
export default class Error {
    constructor() {
        Core.eventManager.on(EventType.error, this, this.onError);
    }

    /**
     * 错误信息处理
     */
    private onError(d: any) {
        console.error(d);
    }
}