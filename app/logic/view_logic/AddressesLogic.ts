/**
 * 收货地址列表
 */
import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import { Net, Api } from "../../common/Net";
import Utils from "../../core/Utils";


export default class AddressesLogic extends ViewBase {


    private orderId = [];

    async  onEnable() {

        //列表id
        let $this = this;
        $this.orderId = this.dataSource ? this.dataSource.orderlistId : [];

        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.personal, {
                orderlistId: $this.orderId
            });
        })

        //添加地址
        $('#addAddressBtn').on('click', () => {
            Core.viewManager.openView(ViewConfig.address, {
                orderlistId: $this.orderId
            });
        })

        let addressList = await Net.getData(Api.addressList);
        await Utils.ajax({
            url: '/src/address.js',
            dataType: 'script'
        });
        await Utils.ajax({
            url: '/src/picker.min.js',
            dataType: 'script'
        });
        this.getAddressList(addressList)

        //地址选择      
        $("#addressList").on("click", ".content", function () {
            if($this.orderId.length==0){
                return;
            }
            Core.viewManager.openView(ViewConfig.orderSubmit, {
                orderlistId: $this.orderId,
                id: $(this).parent().parent().data('id'),
                name: $(this).parent().find(".name").text(),
                phone: $(this).parent().find(".phone").text(),
                province: $(this).parent().find(".addressL").data('province'),
                city: $(this).parent().find(".addressL").data('city'),
                area: $(this).parent().find(".addressL").data('area'),
                cityAssress: $(this).parent().find(".addressL").text(),
                address: $(this).parent().find(".addressM").text(),
                flag: $(this).parent().find(".type").data('flag')
            });

        })

        //地址编辑..
        $("#addressList").on('click', '.right', function () {
            Core.viewManager.openView(ViewConfig.updateAddress, {
                orderlistId: $this.orderId,
                id: $(this).parent().parent().data('id'),
                name: $(this).parent().find(".name").text(),
                phone: $(this).parent().find(".phone").text(),
                province: $(this).parent().find(".addressL").data('province'),
                city: $(this).parent().find(".addressL").data('city'),
                area: $(this).parent().find(".addressL").data('area'),
                cityAssress: $(this).parent().find(".addressL").text(),
                address: $(this).parent().find(".addressM").text(),
                flag: $(this).parent().find(".type").data('flag')
            });

        })

    }

    /**
     *  用户地址列表
     */
    private getAddressList(addressList: any) {
        let html = '';
        if(addressList.length==0){
            let html1=`<div class="pageNull">
                     <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                     <p class="txt">您暂无收货地址，请去添加地址哦</p>
                 </div>`
             $("#addressList").html(html1);
             return;
         }
        for (let x = 0; x < addressList.length; x++) {

            let flag = addressList[x]['flag'] == 1 ? 'show' : 'none';

            let province_cn: Array<string> = [], //省份
                city_cn: Array<string> = [],      //市区
                area_cn: Array<string> = [];      //县

            /**城市拼接遍历 */
            city.forEach(function (item, index) {
                if (item['id'] == addressList[x]['province']) {
                    province_cn = item['name'];
                    if (item.hasOwnProperty('child')) {
                        item['child'].forEach(function (item1, index1) {
                            if (item1['id'] == addressList[x]['city']) {
                                city_cn = item1['name'];
                                if (item1.hasOwnProperty('child')) {
                                    item1['child'].forEach(function (item2, index2) {
                                        if (item2['id'] == addressList[x]['area']) {
                                            area_cn = item2['name'];

                                        }
                                    })
                                }
                            }

                        });

                    }
                }

            })

            html += `<li data-id="${addressList[x]['id']}">
                    <div class="wrapper">
                        <div class="left">
                            <i class="icon addr_icon"></i>
                        </div>
                        <div class="content">
                            <p class="info">
                                <span class="name">${addressList[x]['name']}</span>
                                <span class="phone">${addressList[x]['phone']}</span>
                            </p>
                            <p class="detail">
                                 <span class='type' style="display:${flag}" data-flag="${addressList[x]['flag']}">默认</span>
                                 <span class="addressL" data-province='${addressList[x]['province']}' data-city='${addressList[x]['city']}' data-area='${addressList[x]['area']}'>${province_cn + '' + city_cn + '' + area_cn}</span>
                                 <span class="addressM">${addressList[x]['address']}</span>
                            </p>
                        </div>
                        <div class="right">
                            <span>编辑</span>
                        </div>
                    </div>
                </li>`
        }
        $("#addressList").html(html);

    }

}