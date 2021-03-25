import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import Utils from "../../core/Utils";
import { Net, Api } from "../../common/Net";
import Config from "../../common/Config";



export default class NewsInfo extends ViewBase {


   async  onEnable(){

        $('#goBack').on('click', ()=>{
            Core.viewManager.openView(ViewConfig.email);
            window.history.pushState(null, '', '#email'); 
        })

        //获取消息id
        let newsInfoId = this.dataSource['id'];
        let messageList = await Net.getData(Api.messageList);
        let newsInfo = await Net.getData(Api.newsInfo,{id:newsInfoId});
        this.newsInfo(messageList['list']); 
    }

    /**
     * 消息详情
     */
    private newsInfo(list: any[]){
        let html='';
        for(let x=0;x<list.length;x++){
            if(list[x]['id']==this.dataSource['id']){
                        html = `<div class="newst">
                            <p class="t">${list[x]['title']}</p>
                            <p class="time">${list[x]['c_time']}</p>
                            <p class="from">${list[x]['type']==0 ? '系统' : '客服'}</p>
                        </div>
                        <div class="newsc">
                           <p> ${list[x]['mes']}</p>
                        </div>`;
            }
            $("#newsInfos").html(html);
            
        }
       
    }

    onClick(e) {
        console.log(e)
    }
}   