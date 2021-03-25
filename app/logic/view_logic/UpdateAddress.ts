import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import ViewConfig from "../../common/ViewConfig";
import { Net, Api } from "../../common/Net";
import Picker from "../component/CityPicker";

export default class UpdateAddress extends ViewBase {

    /**地址组件*/
    cityPicke: Picker;
    private orderId;

    onAwake() {
        Core.eventManager.on(EventType.error, this, this.onError);
    }

    async  onEnable() {

        this.cityPicke = new Picker();

        
        //编辑地址传值
        let dataAddress = this.dataSource;
        this.updateVal(dataAddress);

        //奖品柜列表id
        this.orderId=[];
        this.orderId=dataAddress.hasOwnProperty("orderlistId") ? dataAddress.orderlistId : [];

        //返回
        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.addresses,{
                orderlistId:this.orderId
            });
        })
       

         //地址弹窗
        let picker = this.cityPicke;
        $("#addressSel").click(function(){
            document.activeElement['blur']();
            $("input[readonly='readonly']").blur();
            picker.show();     
        })

        //保存
        $("#saveAddr").on('click', async () => {
            let parmar={
                id:dataAddress['id'],
                name:'',
                phone:'',
                province:'',
                city:'',
                area:'',
                address:'',
                flag:''
            }  
            parmar.name =$("#addressName").val();
            parmar.phone=$("#addressPhone").val();
            parmar.province=$("#addressLocation").data('province');
            parmar.city=$("#addressLocation").data('city');
            parmar.area=$("#addressLocation").data('area');
            parmar.address=$("#addressArea").val();
            parmar.flag = $('#switch').prop('checked')==true ? '1' :'2';        
            let addressUpdate = await Net.getData(Api.addressUpdate,parmar);
            //信息正确跳转
            if(addressUpdate){
                Core.viewManager.openView(ViewConfig.addresses,{
                    orderlistId:this.orderId
                });
            }   
        })

        /**
         * 删除地址弹窗
         */
        $("#deleteAdd").on('click',function(){
            $(".sureDialog").show();
        })
        //取消删除
        $(".cancle").on('click',function(){
            $(".sureDialog").hide();
        })
        $(".del").on('click', async () => {
            let addressDel = await Net.getData(Api.addressDel,{id:dataAddress['id']});
            $(".sureDialog").hide();
            Core.viewManager.openView(ViewConfig.addresses);
        })

    }

    /**
     * 编辑地址值
     */
    private updateVal(dataAddress){
        if(dataAddress['flag']==1){
            $("#switch").prop('checked',true);
       }
       //地址修改
       let html=` <div class='cell'>
                       <p class="name"><span>收货人</span></p>
                       <p class='content'><input id="addressName" type="text" placeholder="请使用真实姓名" value="${dataAddress['name']}"></p>
                   </div>
                   <div class='cell'>
                       <p class="name"><span>手机号码</span></p>
                       <p class='content'><input id="addressPhone" type="text" placeholder="请填写" value="${dataAddress['phone']}"></p>
                   </div>
                   <div class='cell' id="addressSel">
                       <p class="name"><span>省市区</span></p>
                       <p class='content'><input id="addressLocation" data-province="${dataAddress['province']}" data-city='${dataAddress['city']}' data-area='${dataAddress['area']}' type="text" placeholder="请填写" value="${dataAddress['cityAssress']}"></p>
                   </div>
                   <div class='cell2'>
                       <p class="content-wrapper">
                           <textarea  id="addressArea" name="" id="" cols="30" rows="4" placeholder="请填写详细地址" value="">${dataAddress['address']}</textarea>
                       </p>
                   </div>  `
       $("#updateAddr").html(html);  
    }

    /**
     * 错误弹窗显示
     * @param data  错误提示信息
     */

    private onError(data: any) {
        switch (data['api']) {
            case Api.addressUpdate.name: 
                this.errorDialog(data['data']['mes']);
                this.errorTip();    
            break;
        }
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any){
        let html=`<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#updateAddress").append(html);
    }

    /**
     * 错误提示弹窗隐藏
     */
    private errorTip(){
        setTimeout(() => {
            $("#toast").remove();
        }, 1000);
    }




    onClick(e) {
        console.log(e)
    }
}   