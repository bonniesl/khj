import ViewBase from "../../core/ViewBase";


export default class Gift  extends ViewBase {

    onEnable(){
        let images = document.querySelectorAll(".lazy");
        lazyload(images);
    }

    onClick(e) {
        console.log(e)
    }
}   