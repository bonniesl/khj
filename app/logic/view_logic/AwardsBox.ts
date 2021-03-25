import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import EventType from "../../common/EventType";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";

/**
 * 奖励柜逻辑
 */
export default class AwardsBox extends ViewBase {

    private awardsId: any; //订单参数

    async   onEnable() {

        this.setLazyLoad();

        let $this=this;
        let orderId=[];
        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.personal);
        });

        //更新底部导航状态
        Core.eventManager.event(EventType.updateBottomNav, { hide: true });

        //奖品柜
        let awardsBox = await Net.getData(Api.awardsBox);
        this.awardsGood(awardsBox);             

        //勾选按钮
        $(".awardsBox").find(".gou").forEach(function(item){
            $(item).click(function(){
                $(item).hasClass("sel") ?  $(item).removeClass('sel') : $(item).addClass('sel');
            })
        })

        //全选
        $(".aw_bottom .gou").click(() =>{
            this.checkAll();
         })

         //反选
         this.selectAll();

         
         //提交订单 
         $(".aw_bottom .right").click(function(){
            let item = $("#selAwardbox").find(".item");
            if(item.find(".sel").length==0){
                $this.errorDialog('请选择您的奖品');
                $this.errorTip();
                return;
            }
            for(let x=0;x<item.length;x++){
                let itemCheck = $(item[x]).find(".gou");
                if(itemCheck.hasClass("sel")==true){
                    orderId.push($(item[x]).data("id"));
                }
            } 
            Core.viewManager.openView(ViewConfig.orderSubmit,{
                orderlistId: orderId
            });
         })
        
        this.setLazyLoad();
    }

    /**
     * 奖品柜列表
     */
    private awardsGood(awardsBox: any) {
        let html = '';
        if(awardsBox.length==0){
            let html1=`<div class="pageNull">
                     <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                     <p class="txt">您暂未获得任何奖品哦</p>
                 </div>`
                $("#selAwardbox").html(html1);
                $(".aw_bottom").hide();
             return;
         }
        for (let x = 0; x < awardsBox.length; x++) {
            html += `<div class="item" data-id="${awardsBox[x]['id']}">
                    <div class="goubox">
                        <div class="gou icon"></div>
                    </div>
                    <div class="img">
                        <img class="lazy" data-src="${Config.imgBase + awardsBox[x]['src']}" alt="">
                    </div>
                    <div class="word">
                        <h3 class="tit">${awardsBox[x]['title']} </h3>
                    </div>
                </div>`
        }
        $("#selAwardbox").html(html);
    }


    /**
     * 商品全选
     */
    private checkAll() {
        let item = $("#selAwardbox").find(".item");
        for(let x=0;x<item.length;x++){  
            $(".aw_bottom .gou").hasClass("sel") ? $(item[x]).find(".gou").addClass("sel") : $(item[x]).find(".gou").removeClass("sel");
            let len: any =item.find(".sel").length;
            let html=`共选中${len}样礼品`;
            $("#txtNum").html(html);           
        }  
    }

    /**
     * 商品反选
     */
    private selectAll(){
        let item = $("#selAwardbox").find(".item");
        for(let x=0;x<item.length;x++){
            let itemCheck = $(item[x]).find(".gou");
            itemCheck.click(function(){
                if($(this).hasClass("sel")){
                    this.awardsId=$(item[x]).data("id");
                }
                let len: any =item.find(".sel").length;
                if(item.find(".sel").length==item.length){
                    $(".aw_bottom .gou").addClass("sel");
                }else{
                    $(".aw_bottom .gou").removeClass("sel");
                } 
                let html=`共选中${len}样礼品`;
                $("#txtNum").html(html);
            })
        }
    }

    /**
     * 错误提示HTML
     */
    private errorDialog(txt: any) {
        let html = `<div id="toast" class="toast" >
                    ${txt}
                 </div>`
        $("#awardsBox").append(html);
    }

     /**
     * 错误提示弹窗隐藏
     */
    private errorTip() {
        setTimeout(() => {
            $("#toast").remove();
        }, 1000);
    }


    /**
     * 设置懒加载 
     */
    private setLazyLoad() {
        lazyload($(".lazy"));
    }

    onClick(e: Event) {
    }
} 