import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";
import Utils from "../../core/Utils";


export default class OrderDetail extends ViewBase {

    async onEnable() {

        let $this = this;

        $('#goBack').on('click', () => {

            Core.viewManager.openView(ViewConfig.myOrder);
            window.history.pushState(null, '', '#myOrder');
        })

        await Utils.ajax({
            url: '/src/address.js',
            dataType: 'script'
        });


        //订单详情
        let awardsBox = await Net.getData(Api.awardsBox);
        let orderNum = Utils.getValueByUrl('orderNum');
        let OrderInfo = await Net.getData(Api.OrderInfo, {
            sn: orderNum
        });
        this.orderList(OrderInfo['addressInfo'], OrderInfo['orderInfo']);
        this.awardsGood(awardsBox, OrderInfo['goodLists'], OrderInfo['logisticsLists'], OrderInfo['orderInfo']);

        /**物流复制 */
        for (let x = 0; x < $(".copy").length; x++) {
            $(".copy")[x].onclick = function () {
                let el = $('.txtClipboard')[x];
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


        /**联系客服 */
        $(".custIcon").click(function () {
            Core.viewManager.openView(ViewConfig.customer);

        })

    }

    /**
     * 地址信息
     * @param OrderInfo 
     */

    private orderList(addressInfo: any, OrderInfo: any) {
        //城市
        let html = ''
        let province_cn: Array<string> = [], //省份
            city_cn: Array<string> = [],      //市区
            area_cn: Array<string> = [];      //县

        /**城市拼接遍历 */
        city.forEach(function (item, index) {
            if (item['id'] == addressInfo['province']) {
                province_cn = item['name'];
                if (item.hasOwnProperty('child')) {
                    item['child'].forEach(function (item1, index1) {
                        if (item1['id'] == addressInfo['city']) {
                            city_cn = item1['name'];
                            if (item1.hasOwnProperty('child')) {
                                item1['child'].forEach(function (item2, index2) {
                                    if (item2['id'] == addressInfo['area']) {
                                        area_cn = item2['name'];
                                    }
                                })
                            }
                        }

                    });

                }
            }
        })
        html += `<div class="info">
                        <div class="name">${addressInfo['name']}<span>${addressInfo['phone']}</span></div>
                        <div class="address">${province_cn + '' + city_cn + '' + area_cn + addressInfo['address']}</div>
                    </div>`;
        $(".orderaddress").append(html);
    }

    /**
     * 订单列表
     */
    private awardsGood(awardsBox: any, goodLists: any, logisticsLists: any, OrderInfo: any) {
        let html = ''
        let goodId = [];

        for (let x = 0; x < goodLists.length; x++) {
            goodId.push(parseInt(goodLists[x]['goods_id']));
        }
        let orderGoods = goodId.sort(function (a, b) {
            return b - a;
        });

        //把同样的user_order_logistics_id整合一起
        let goodArr = {};
        for (let y = 0; y < goodLists.length; y++) {
            let logisticsId = !goodLists[y]['user_order_logistics_id'] ? 0 : goodLists[y]['user_order_logistics_id'];
            if (!goodArr[logisticsId]) {
                goodArr[logisticsId] = [];
            }
            goodArr[logisticsId].push(goodLists[y]);
        }

        if (logisticsLists.length == 0) {
            logisticsLists = [{
                id: 0,
                logistics_sn: "",
                logistics_type: "",
            }];
        }

        for (let z in logisticsLists) {
            let logisticsId = logisticsLists[z]['id'];
            let good = goodArr[logisticsId];
            console.log(logisticsLists[z])
            for (let m in good) {
                html += ` <ul class="comList"><li class="item">
                            <div class="imgbox">
                                <img src="${Config.imgBase + good[m]['src']}" alt="">
                            </div>
                            <div class="infoword">
                                <p>${good[m]['goods_title']}</p>
                            </div>
                        </li></ul>
                        <dl class="distrInformTion"><dd class="tip"  style="display:${OrderInfo['status'] == 2 ? 'none' : 'block'}">
                                物流编号：
                                <span class="num txtClipboard" >${logisticsLists[z]['logistics_sn']}</span>
                                <span class="fz copy" >复制</span>
                            </dd></dl>`
            }

        }

        html += ` <dl class="distrInformTion">
                    <dd class="tip">
                    订单编号：
                    <span id="txt" class="wl">${OrderInfo['sn']}</span>
                </dd>
                <dd class="tip">
                    订单时间：
                    <span class="wl">${OrderInfo['c_time']}</span>  
                </dd></dl>`

        $(".orderBody").append(html);
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#orderDetail").append(html);
        setTimeout(() => {
            $("#toast").remove();
        }, 500);
    }

    onClick(e: Event) {

    }
} 