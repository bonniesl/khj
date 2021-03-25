/**
 * 新增地址
 */
import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import ViewConfig from "../../common/ViewConfig";
import { Net, Api } from "../../common/Net";
import Picker from "../component/CityPicker";
import Utils from "../../core/Utils";


export default class AddressLogic extends ViewBase {

    /**地址组件*/
    cityPicke: Picker;
    private orderId;

    onAwake() {
        Core.eventManager.on(EventType.error, this, this.onError);
    }

    async onEnable() {

         //奖品柜列表id
         this.orderId=[];
         this.orderId=this.dataSource ? this.dataSource.orderlistId : [];
       
        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.addresses,{
                orderlistId:this.orderId
            });
        })

        await Utils.ajax({
            url:'/src/address.js',
            dataType:'script'
        });
        await Utils.ajax({
            url: '/src/picker.min.js',
            dataType:'script'
        });

        this.cityPicke = new Picker();
        

        /**
         * 保存
         */
        $('#saveAddr').on('click', async () => {
            let parmar = {
                name: '',
                phone: '',
                province: '',
                city: '',
                area: '',
                address: '',
                flag: ''
            }

            parmar.name = $("#addressName").val();
            parmar.phone = $("#addressPhone").val();
            parmar.province = $("#addressLocation").data('province');
            parmar.city = $("#addressLocation").data('city');
            parmar.area = $("#addressLocation").data('area');
            parmar.address = $("#addressArea").val();
            parmar.flag = $('#switch').prop('checked') == true ? '1' : '2';
            let addressAdd = await Net.getData(Api.addressAdd, parmar);

           

            //信息正确跳转
            if (addressAdd) {
                Core.viewManager.openView(ViewConfig.addresses, {
                    cityValue: $("#addressLocation").val(),
                    orderlistId:this.orderId
                });
            }
        })

        //地址弹窗
        let picker = this.cityPicke;
        $("#addressSel").click(function () {
            document.activeElement['blur']();
            $("input[readonly='readonly']").blur();
            picker.show();
        })

    }

    /**
     * 错误弹窗显示
     * @param data  错误提示信息
     */

    private onError(data: any) {
        switch (data['api']) {
            case Api.addressAdd.name:
                this.errorDialog(data['data']['mes']);
                this.errorTip();
                break;
        }
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#address").append(html);
    }

    /**
     * 错误提示弹窗隐藏
     */
    private errorTip() {
        setTimeout(() => {
            $("#toast").remove();
        }, 1000);
    }

}