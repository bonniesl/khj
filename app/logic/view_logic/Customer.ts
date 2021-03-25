import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import Utils from "../../core/Utils";


export default class Customer extends ViewBase {

    async  onEnable() {
        let $this = this;

        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.personal);
        })

        document.querySelector('#copy').addEventListener('click', doCopy, false);

        function doCopy() {
            var el = document.querySelector('#txtClipboard');

            const range = document.createRange();
            range.selectNode(el);

            const selection = window.getSelection();
            if (selection.rangeCount > 0) selection.removeAllRanges();
            selection.addRange(range);

            try {
                var rs = document.execCommand('copy');
                selection.removeAllRanges();

                rs && $this.errorDialog('复制成功');
            } catch (error) {
                console.log('复制失败')
            }

        }

    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#customer").append(html);
        setTimeout(() => {
            $("#toast").remove();
        }, 600);
    }

    onClick(e) {
        console.log(e)
    }
}   