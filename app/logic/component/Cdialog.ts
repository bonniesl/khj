import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import Utils from "../../core/Utils";
import { Net, Api } from "../../common/Net";
import ViewConfig from "../../common/ViewConfig";
import Config from "../../common/Config";
import Slider from "../component/Slider";
import UserData from "../../common/UserData";
import EventType from "../../common/EventType";
import ErrorMap from "../../common/ErrorMap";

/**
 * 通用弹窗
 */
export default class Cdialog {
    /** 容器 */
     private box: ZeptoCollection;

     private title: string;     //标题
     private cssTip: any;       //内容样式
     private cssPadding: any;   //内容样式
     private cssLine:any;       //内容样式
     private content: string;   //内容
     private buttons : object   //标题
     private closeShow: boolean //关闭按钮
     private close: any //关闭按钮

     constructor(id: string,config: object) {
        this.box = $(id);
        if (config) {
            for (const key in config) {
                if (config.hasOwnProperty(key)) {
                    this[key] = config[key];
                    
                }
            }
        }
        this.creatDialog();
     }

     private creatDialog() {
        let html = `<div class="orderDialog">
                             <div class="dialogCon">
                                <div class="close" style="display:${this.closeShow==true ? 'block' : 'none'}"></div>
                                 <p class="tit">${this.title}</p>
                                 <p class="tips" style="text-align:${this.cssTip};padding:${this.cssPadding};line-height:${this.cssLine}">${this.content}</p>
                                 <div class='btnsT'>`
                        
        let index = 0;
        for(let key in this.buttons){
            var butHtml = "<div class='btns btns"+index+"'>"+ key +"</div>";
            html += butHtml;
            this.box.on('click', '.btns'+ index,this.buttons[key]);
            index++;
        } 
        html+=` </div></div>
                    </div>`;
        this.box.html(html);

        
    

        this.box.on('click', '.close',function(){
            Core.viewManager.closeView(ViewConfig.recharge);
            $(".orderDialog").hide();
           
        });
       
     }
     
}