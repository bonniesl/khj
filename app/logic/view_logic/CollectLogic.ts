import ViewBase from "../../core/ViewBase";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import ViewConfig from "../../common/ViewConfig";
import Config from "../../common/Config";
import { Net, Api } from "../../common/Net";

export default class CollectLogic extends ViewBase {

    /**是否开始编辑 */
    private edit: boolean = false;
    private articleId;  //文章id
    private roomId;    //场次Id

    async   onEnable() {

        this.setLazyLoad();


        //导航选择
        $('#nav').on('click', 'em', function () {
            let i = $(this).index();
            $(this).addClass('cur').siblings().removeClass('cur');
            $(".itemTab").hide().eq(i).show();
            $("#itemTabCon").find('li').removeClass('edit');
        });

        //返回按钮功能
        $('#goBack').on('click', () => {
            Core.viewManager.openView(ViewConfig.personal);
            window.history.pushState(null, '', '#personal');//临时用，后期优化
        });


        //收藏列表
        let favList = await Net.getData(Api.favList)
        this.favArticleList(favList['list']);      

        //删除收藏文章列表
        $("#favArticleList").on("click", '.del-btn', function (e) {
            $(".sureDialog").show();
            this.articleId = $(this).parent().data('id');
            $(".del").click(async()=> {
                await Net.getData(Api.articleFav, { id: this.articleId, action: 2 });

                $("#favArticleList").find("li").forEach(item => {
                    if($(item).data('id')==this.articleId){
                        $(item).remove();
                    }
                })
                $(".sureDialog").hide();
                if($("#favArticleList li").length==0){
                    let html1=`<div class="pageNull">
                            <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                            <p class="txt">您暂无收藏的文章哦</p>
                        </div>`
                    $("#favArticleList").html(html1);
                } 
            })
           
        })

        //收藏场次列表
        let favRoomList = await Net.getData(Api.favRoomList)
        this.favRoomList(favRoomList['list']);

        /**
         * 文章右滑删除
         */
        var expansion = null; //是否存在展开的list
        let favListDel = $("#favArticleList li");
        for(var i = 0; i < favListDel.length; i++){    
            var x, y, X, Y, swipeX, swipeY;
            favListDel[i].addEventListener('touchstart', function(event) {
                if ( $(event.target).hasClass('del-btn') ) return;

                x = event.changedTouches[0].pageX;
                y = event.changedTouches[0].pageY;
                swipeX = true;
                swipeY = true ;
                if(expansion){   //判断是否展开，如果展开则收起
                    expansion.className = "";
                }        
            })
            favListDel[i].addEventListener('touchmove', function(event){       
                X = event.changedTouches[0].pageX;
                Y = event.changedTouches[0].pageY;        
                // 左右滑动
                if(swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0){
                    // 阻止事件冒泡
                    event.stopPropagation();
                    if(X - x > 10){   //右滑
                        event.preventDefault();
                        this.className = "";    //右滑收起
                    }
                    if(x - X > 10){   //左滑
                        event.preventDefault();
                        this.className = "edit";   //左滑展开
                        expansion = this;
                    }
                    swipeY = false;
                }
                // 上下滑动
                if(swipeY && Math.abs(X - x) - Math.abs(Y - y) < 0) {
                    swipeX = false;
                }        
            });
        }


        //场次右滑删除
        var expansion1 = null; //是否存在展开的list
        let roomListDel = $("#roomList li");
        for(var i = 0; i < roomListDel.length; i++){    
            var x, y, X, Y, swipeX, swipeY;
            roomListDel[i].addEventListener('touchstart', function(event) {
                if ( $(event.target).hasClass('del-btn') ) return;

                x = event.changedTouches[0].pageX;
                y = event.changedTouches[0].pageY;
                swipeX = true;
                swipeY = true ;
                if(expansion){   //判断是否展开，如果展开则收起
                    expansion.className = "roomItem";
                }        
            })
            roomListDel[i].addEventListener('touchmove', function(event){       
                X = event.changedTouches[0].pageX;
                Y = event.changedTouches[0].pageY;        
                // 左右滑动
                if(swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0){
                    // 阻止事件冒泡
                    event.stopPropagation();
                    if(X - x > 10){   //右滑
                        event.preventDefault();
                        this.className = "roomItem";    //右滑收起
                    }
                    if(x - X > 10){   //左滑
                        event.preventDefault();
                        this.className = "roomItem edit";   //左滑展开
                        expansion = this;
                    }
                    swipeY = false;
                }
                // 上下滑动
                if(swipeY && Math.abs(X - x) - Math.abs(Y - y) < 0) {
                    swipeX = false;
                }        
            });
        }


         //删除收藏场次列表

         $("#roomList").on("click", '.del-btn', function () {
            $(".sureDialog").show();
            this.roomId= $(this).parent().data('id');
            $(".del").click(async()=> {
                await Net.getData(Api.roomFav, { id: this.roomId, action: 2 });
                $("#roomList").find("li").forEach(item => {
                    if($(item).data('id')==this.roomId){
                        $(item).remove();
                    }
                })
                $(".sureDialog").hide();
                if($("#roomList li").length==0){
                    let html1=`<div class="pageNull">
                            <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                            <p class="txt">您暂无收藏的文章哦</p>
                        </div>`
                    $("#roomList").html(html1);
                }
               
            })
        })
 


        this.setLazyLoad();

    }

    onClick(e: Event) {
        switch (e.target['className']) {
            case 'cancle'://取消删除功能
                this.cancle();
                break;
        }
    }

    /**
     * 收藏文章列表
     */
    private favArticleList(list: any[]) {
        let html = '';
        if(list.length==0){
            let html1=`<div class="pageNull">
                     <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                     <p class="txt">您暂无收藏的文章哦</p>
                 </div>`
             $("#favArticleList").html(html1);
             return;
         }
        for (let x = 0; x < list.length; x++) {
            html += ` <li data-id="${list[x]['id']}">
                    <a href="javascript:void(0);">
                        <img class="lazy"  data-src="${ Config.imgBase + list[x]['src']}">
                    </a>
                    <div class="right relative">
                        <h3>${list[x]['title']}</h3>
                        <a href="javascript:void(0);" class="btn_red get-btn absolute">立即查看</a>
                    </div>
                    <em class="del-btn absolute">
                        删除
                    </em>
                </li>`
        }
        $("#favArticleList").html(html);

        //立即查看
        $("#favArticleList").on("click", '.btn_red', function () {
            location.href = '#newsContent?id=' + $(this).parent().parent().data('id');
            //Core.viewManager.openView(ViewConfig.newsContent,$(this).parent().parent().data('id'));
        })
    }

    /**
     * 收藏场次列表
     */
    private favRoomList(list: any) {
        let html='';
        if(list.length==0){
            let html1=`<div class="pageNull">
                     <img src="http://s-h5.52kouhong.com/upload/2018/ci/Null.png" />
                     <p class="txt">您暂无收藏的场次哦</p>
                 </div>`
             $("#roomList").html(html1);
             return;
         }
        for(let x=0;x<list.length;x++){
            let low_coin: any=list[x]['low_coin'] / 100;
            if (!list[x]['src']) continue;
            html+=`<li class="roomItem" data-id="${list[x]['id']}">
                    <a>
                        <img class="lazy" data-src="${ Config.imgBase + list[x]['src']}" alt="">
                    </a>
                    <div class="item-msg">
                        <div class="left">
                            <h3 class="font-clip">${list[x]['title']}</h3>
                            <span class="flex">
                                <em class="price f26">魅力币：${parseInt(low_coin)}</em>
                                <del class="f22">专柜价：￥${list[x]['discount']}</del>
                            </span>
                        </div>
                        <div class="right" id="favRoom">
                            <a  href="javascript:void(0);" class="btn_red need-btn f26" data-id="${list[x]['id']}" >我要这支</a>
                        </div>
                    </div>
                    <i class="absolute game-status f20 font-clip">
                        2000人游戏中
                    </i>
                    <em class="del-btn absolute">
                        删除
                    </em>
                </li>`
        }
        $("#roomList").html(html);

        //我要这支
        $("#roomList").on("click", '.btn_red', function () {
            location.href = '#gameInner?id=' + $(this).data('id');
        })

    }


    /**
     * 取消删除文章
     */
    private cancle() {
        $(".sureDialog").hide();
        this.node.find('li').removeClass('edit');
    }


    /**
     * 设置可编辑状态
     */
    private setEdit() {
       // this.edit = !this.edit;

        this.node.find('li').hasClass("edit") ? this.node.find('li').removeClass('edit') : this.node.find('li').addClass('edit');
        
        // if (this.edit) {
        //     this.node.find('li').addClass('edit');
        // } else {
        //     this.node.find('li').removeClass('edit');
        // }
    }

    /**
     * 设置懒加载 
     */
    private setLazyLoad() {
        lazyload($(".lazy"));
    }
}