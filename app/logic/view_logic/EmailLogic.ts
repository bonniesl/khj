import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import ViewConfig from "../../common/ViewConfig";
import Config from "../../common/Config";
import { Net, Api } from "../../common/Net";


export default class EmailLogic extends ViewBase{


    async  onEnable(){
        $('#goBack').on('click', ()=>{
            Core.viewManager.openView(ViewConfig.personal);
            window.history.pushState(null, '', '#personal'); //临时用，后期优化
        });

        //用户消息
        let messageList = await Net.getData(Api.messageList);
        this.setMessList(messageList['list'] || []);
    }

    /**
     * 用户消息列表
     */
    private setMessList(list: any[]){
        let html='';
        if(list.length==0){
           let html1=`<div class="pageNull">
                    <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                    <p class="txt">您暂时没有收到任何消息哦</p>
                </div>`
            $("#emailList").html(html1);
            return;
        }
        for(let x=0;x<list.length;x++){
            let typeTxt= list[x]['type']==0 ? '系统' : '客服';
            let itemClass = list[x]['type']==0 ? '' : 'type_custom_service';    
            html+=`<li data-id="${list[x]['id']}">
                    <i class="icon type type_sys ${itemClass}" ><span>${typeTxt}</span></i>
                    <div class="header">
                        <span class='title'>${list[x]['c_time']}</span>
                        <span class='time'>${list[x]['flag']==1 ? '已读' : '未读'}</span>
                    </div>
                    <div class="content">
                        <p class='sub_title'>${list[x]['title']}</p>
                        <p class='detail'>
                            <span  class='detail_btn'>查看</span>
                            <i class='icon arrow'></i>
                        </p>
                    </div>
                </li>`;
        }
        $("#emailList").html(html);

        //查看消息详情
        $('#emailList').on('click','li',function(){
            Core.viewManager.openView(ViewConfig.newsInfo,{
                id:$(this).data('id')
            })
        })
    }

}