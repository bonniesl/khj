import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import Utils from "../../core/Utils";
import Cdialog from "../component/Cdialog";

export default class OrderSubmit extends ViewBase {

    private orderId;  //商品柜id
    private orderList = {};
    private orderNum; //订单号
    private cdialog: Cdialog;  //弹窗

    onAwake() {
        Core.eventManager.on(EventType.error, this, this.onError);
    }

    async onEnable() {

        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.awardsBox);
        });
        //精品柜列表
        let $this = this;
        let awardsBox = await Net.getData(Api.awardsBox);
        this.awardsGood(awardsBox);

        //地址传参
        this.orderList = this.dataSource;
       // console.log(this.orderList)
        //地址信息
        let addressList = await Net.getData(Api.addressList);
        await Utils.ajax({
            url: '/src/address.js',
            dataType: 'script'
        });
        let html = '';
        if(addressList.length==0){
            html += `<p class="locaNull">请新建收货地址确保商品顺利到达</p>`
            $("#orderAddress .info").html(html);
        }
       
        if (this.orderList.hasOwnProperty("cityAssress")) {
            //地址信息(点击地址选择时的信息)
            html += `<div class="name">${this.orderList['name']}<span>${this.orderList['phone']}</span></div>
                    <div class="address" data-id="${this.orderList['id']}"> <span style="display:${this.orderList['flag'] == 1 ? 'inline' : 'none'}">默认</span> ${this.orderList['cityAssress'] + this.orderList['address']}</div>`
            $("#orderAddress .info").html(html);
        } else {
            //地址信息(刚进入页面时显示默认地址)
            let province_cn: Array<string> = [], //省份
                    city_cn: Array<string> = [],      //市区
                    area_cn: Array<string> = [];      //县
            for (let x = 0; x < addressList.length; x++) {
                /**城市拼接遍历 */
                city.forEach(function (item, index) {
                    if (item['id'] == addressList[x]['province']) {
                        province_cn.push(item['name']);
                        if (item.hasOwnProperty('child')) {
                            item['child'].forEach(function (item1, index1) {
                                if (item1['id'] == addressList[x]['city']) {
                                    city_cn.push(item1['name']);
                                    if (item1.hasOwnProperty('child')) {
                                        item1['child'].forEach(function (item2, index2) {
                                            if (item2['id'] == addressList[x]['area']) {
                                                area_cn.push(item2['name']);
                                            }
                                        })
                                    }else{
                                        area_cn.push('');
                                    }
                                }
    
                            });
    
                        }
                    }
    
                })

                if (addressList[x]['flag']==1) {
                    html += `<div class="name">${addressList[x]['name']}<span>${addressList[x]['phone']}</span></div>
                         <div class="address" data-id="${addressList[x]['id']}" data-province='${addressList[x]['province']}' data-city='${addressList[x]['city']}' data-area='${addressList[x]['area']}'><span>默认</span>${province_cn[x] + '' + city_cn[x] + '' + area_cn[x] +addressList[x]['address']}</div>`
                    $("#orderAddress .info").html(html);
                }else{
                    let html1=`<div class="name">${addressList[0]['name']}<span>${addressList[0]['phone']}</span></div>
                                <div class="address" data-id="${addressList[0]['id']}" data-province='${addressList[0]['province']}' data-city='${addressList[0]['city']}' data-area='${addressList[0]['area']}'>${province_cn[0] + '' + city_cn[0] + '' + area_cn[0] +addressList[0]['address']}</div>`;
                    $("#orderAddress .info").html(html1);
                }
            }
        }


        //地址选择     
        $("#orderAddress").click(function () {
            Core.viewManager.openView(ViewConfig.addresses, {
                orderlistId: $this.orderId['orderlistId']
            });
        })


        //订单列表渲染
        let html1 = '';
        if (this.orderList.hasOwnProperty("cityAssress")) {
            for (let x = 0; x < awardsBox.length; x++) {
                // this.orderId['orderlistId'].indexOf(parseInt(awardsBox[x]['id']))!=-1
                if (this.orderId['orderlistId'].indexOf(parseInt(awardsBox[x]['id']))!=-1) {
                    html1 += `<li class="item" data-id="${awardsBox[x]['id']}">
                                <div class="imgbox">
                                    <img src="${Config.imgBase + awardsBox[x]['src']}">
                                </div>
                                <div class="infoword">
                                    <p>${awardsBox[x]['title']}</p>
                                </div>
                            </li>`
                }
            }
            $("#orderList").html(html1);
        }

         //提交订单 
         let isclick = true;
         $(".orderbtn").click(async () => {
            if (isclick) {
                let goodsOrder = await Net.getData(Api.goodsOrder, {
                    idList: $this.orderId['orderlistId'].join(","),
                    addressId: $(".address").data('id')
                })
                 //信息正确跳转
                 if (goodsOrder) {
                    $this.orderNum=goodsOrder['sn'];
                    $("#orderDialog").show();
                    new Cdialog("#orderDialog",{
                        title:'订单提交成功',
                        content:'订单提交成功，请耐心等待发货',
                        cssTip:'center',
                        cssPadding:'0.3rem 0 0',
                        cssLine:'1',
                        buttons:{
                            '确定':function(){
                                location.href ='#orderDetail?orderNum=' + $this.orderNum;
                            }
                        }
                    })
                }
                isclick = false;
            }else {
                $this.errorDialog('您点击过快，过会儿再来哦~')
                setTimeout(() => {
                    $("#toast").remove();
                }, 600);
            }
            setTimeout(function () {
                isclick = true;
            }, 3000) //3s后可再次点击
            
         })

    }

    /**
     * 订单列表
     */
    private awardsGood(awardsBox: any) {
        this.orderId = this.dataSource;
        let html = ''
        for (let x = 0; x < awardsBox.length; x++) {
            if (this.orderId['orderlistId'].indexOf(parseInt(awardsBox[x]['id']))!=-1) {
                html += `<li class="item" data-id="${awardsBox[x]['id']}">
                            <div class="imgbox">
                                <img src="${Config.imgBase + awardsBox[x]['src']}">
                            </div>
                            <div class="infoword">
                                <p>${awardsBox[x]['title']}</p>
                            </div>
                        </li>`
            }
        }
        $("#orderList").html(html);
    }

    /**
    * 错误弹窗显示
    * @param data  错误提示信息
    */
    private onError(data: any) {
        switch (data['api']) {
            case Api.goodsOrder.name:{
                $("#orderDialog").show();
                new Cdialog(
                    "#orderDialog",
                        {
                            title:'订单提交失败',
                            content:data['data']['mes'],
                            cssTip:'center',
                            cssPadding:'0.3rem 0 0',
                            cssLine:'1',
                            buttons:{
                                '再逛逛':function(){
                                    Core.viewManager.openView(ViewConfig.awardsBox);
                                }
                            }
                        });
                }
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
        $("#orderSubmit").append(html);
    }

    onClick(e) {
        console.log(e)
    }
} 