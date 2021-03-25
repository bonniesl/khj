import { Net, Api } from "../../common/Net";
import Core from "../../core/Core";
import EventType from "../../common/EventType";
import Config from "../../common/Config";

export default class Login{

    private code: any;       //图形验证码
    private time = 60;
    private baseUrl = Config.baseUrl;
    private attach:any =0;
    private clickR=false;

    constructor() {
        this.init();
    }

    private async init() {
        this.code = this.getCodePic();
        let href=window.location.href;
       
        Core.eventManager.on(EventType.error, this, this.onError);
        this.createTemplate();   
    }

    private async createTemplate() {

        let html = '';
        html = `<div class="loginT">
                    <div class="closeLogin"></div>
                </div>
                  <div class="loginForm">
                    <div class="inputLine">
                        <input type="text" placeholder="手机号码" class="phone" />
                    </div>
                    <div class="inputLine valPic">
                        <input type="text" class="valcode" placeholder="输入图中验证码">
                        <div class="code_capats"><img src="${this.code}" /></div>
                    </div>
                    <div class="inputLine">
                        <input class="vate_code"   type="text" name="capth" placeholder="验证码">
                        <button type="button" class="valadite_btn">获取验证码</button>
                    </div>
                    <div class="errorTip"></div>
                  </div>
                  <div class="loginBtn">登录</div>`
        $(".loginCon").html(html);

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
            $(".phone").val('');
            $(".valcode").val('');
            $(".vate_code").val('');
            $(".loginDialog").hide();
            $(".errorTip").hide();
            $('.valadite_btn').text('获取验证码').removeAttr('disabled');
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
                this.clickR=false;
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
        if(this.clickR==false){
            this.clickR=true;
        }else{
            return;
        }
        let sendCode = await Net.getData(Api.register, {
            phone: $(".phone").val(),
            code: $(".valcode").val()
        });
        if (!sendCode) {
            this.clickR=false;
            $(".code_capats img")[0].src = this.getCodePic();
            return;
        }
        this.timer();
        
    }

     /**url处理 */
     private GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.href.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
        if (r != null) return unescape(r[2]); return null;
    }

    /**
     * 登录
     */
    private async registerClick() {
        if(this.GetQueryString('attach')){
            this.attach = this.GetQueryString('attach');
        }  
        let register = await Net.getData(Api.phoneLogin, {
            phone: $(".phone").val(),
            code: $(".vate_code").val(),
            attach:this.attach
        });

        if (register) {
            $('.valadite_btn').text('获取验证码').removeAttr('disabled');
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
                $(".errorTip").show();
                $(".errorTip").html(data['data']['mes']);
                setTimeout(() => {
                    $(".errorTip").hide();
                }, 1500);
            }
                break;
            case Api.phoneLogin.name: {
                $(".errorTip").show();
                $(".errorTip").html(data['data']['mes']);
                setTimeout(() => {
                    $(".errorTip").hide();
                }, 1500);
            }
            break;
        }
    }


}