import ViewBase from "../../core/ViewBase";
import { Net, Api } from "../../common/Net";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import Config from "../../common/Config";
import ViewConfig from "../../common/ViewConfig";

export default class LoginPage extends ViewBase {

    private code: any;       //图形验证码
    private time = 60;
    private baseUrl = Config.baseUrl;


    onEnable(){
        this.code = this.getCodePic();
        Core.eventManager.on(EventType.error, this, this.onError);

        // 关闭自己单独定义类名
        this.node.on('click', '.closeSelf', () => {
            console.log(Core.currentView)
           // Core.viewManager.closeView(ViewConfig.loginPage);
            $("#root").find("#creditDialog").hide();
            // window.history.pushState(null, '', '#recharge');
            // if (Core.currentView['name'] != 'gameInner')//如果是游戏界面就直接退出游戏
            //     Core.eventManager.event(EventType.updateBottomNav, { hide: true });// if(Core.currentView.name != 'personal')
            // $("body,html").css({"overflow":"auto" });    
        });

        let html =`<img src="${this.code}" />`;
        $(".code_capats").html(html);

         //获取图形验证码
         $(".loginDialog").on("click", '.code_capats', (e) => {
            $(".code_capats img")[0].src = this.getCodePic();
        })

        //获取验证码
        $(".loginDialog").on("click", '.valadite_btn', (e) => {
            this.sendValcode();
        });

        //登录
        $(".loginDialog").on("click", '.loginBtn', (e) => {
            this.registerClick();
        });

        //关闭登录
        $(".closeLogin").click(function(){
            $(".loginDialog").hide();
        })
    }

     //获取图形验证码
     private getCodePic() {
        return this.baseUrl + '/code/img/' + '?random=' + Math.random();
    }

    //获取验证码
    private timer() {
        const countDown = setInterval(() => {
            if (this.time === 0) {
                $('.valadite_btn').text('重新发送').removeAttr('disabled');
                clearInterval(countDown);
            } else {
                $('.valadite_btn').attr('disabled', true);
                $('.valadite_btn').text(this.time + 's后重新获取');
            }
            this.time--;
        }, 1000);
    }

    /**
     * 发送验证码
     */
    private async sendValcode() {
        let sendCode = await Net.getData(Api.register, {
            phone: $(".phone").val(),
            code: $(".valcode").val()
        });
        if (!sendCode) {
            $(".code_capats img")[0].src = this.getCodePic();
            return;
        }
        this.timer();
    }

    /**
     * 登录
     */
    private async registerClick() {
        let register = await Net.getData(Api.phoneLogin, {
            phone: $(".phone").val(),
            code: $(".vate_code").val()
        });

        if (register) {
            $(".loginDialog").hide();
            $("body").triggerHandler("loginEvent");
        }

    }

    /**
     * 错误弹窗显示
     * @param data  错误提示信息
     */

    private onError(data: any) {
        switch (data['api']) {
            case Api.register.name: {
                $(".errorTip").html(data['data']['mes']);
            }
                break;
            case Api.phoneLogin.name: {
                $(".errorTip").html(data['data']['mes']);
            }
            break;
        }
    }

    onClick(e) {
        console.log(e)
    }
}   