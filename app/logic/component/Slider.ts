/**
 * 轮播图组件
 */
export default class Slider {


    /** 容器 */
    private box: ZeptoCollection;
    /** a标签列表 */
    private sliderList: ZeptoCollection;
    /**当前图的下标 */
    private currentIndex: number = 0;
    /**最大宽度  */
    private maxWidth: number;
    /**触摸 */
    private touch: boolean = false;
    /**按下时的手指位置 */
    private oldTouchX: number;
    /**按下时当前精灵滑动的位置 */
    private oldMoveX: number;
    /**当前x位置 */
    private currentX: number = 0;
    /**圆点容器 */
    private point: ZeptoCollection;
    /** 定时器 */
    private time: any;
    /**tween动画 */
    private tween: any;


    /**
     * 轮播图组件
     * @param id 容器id
     */
    constructor(id: string) {
       
        this.box = $(id);
        this.sliderList = this.box.find('em');
        this.maxWidth = this.box.width();
        this.point = this.box.find('.banner-point');

        this.box.on('touchstart', (e) => this.onTouchStart(e));
        this.box.on('touchmove', (e) => this.onTouchMove(e));
        this.box.on('touchend', (e) => this.onTouchEnd(e));

       this.init();
       this.creatPoint();
    }

    /**
     * 初始化
     */
    init() {
        this.setSliderAttribute(0);
        this.creatTime();
    }

    /**
     * 初始化所有banner的层级
     */
    private initZIndex() {
        for (let x = this.sliderList.length - 1; x > -1; x--) {
            this.sliderList[x].style.zIndex = 0;
        }
    }

    /**
     * 根据banner的数量 添加对应的点
     */
    private creatPoint() {
        let html = '';
        for (let x = 0; x < this.sliderList.length; x++) {
            html += `<i></i>`;
        }
        this.point.html(html);
        this.setPointCurrent();
    }


    /**
     * 定时到当前图片的点的状态
     */
    private setPointCurrent() {
        let i: ZeptoCollection = this.point.find('i');
        for (let x = i.length - 1; x > -1; x--) {
            i.eq(x).removeClass('cur');
        }
        i.eq(this.currentIndex).addClass('cur');
    }


    /**
     * 触摸开始
     */
    private onTouchStart(e: Event) {
        if (e.target['nodeName'] == 'I' || e.target['id'] == 'point') {
            return false;
        }
        this.clearTime();
        if (this.tween) this.tween.stop();
        this.touch = true;
        let node: ZeptoCollection = $(e.target).parent();
        this.currentIndex = node.index();
        this.initZIndex();
        node.css({ zIndex: 10 });
        this.oldTouchX = e['changedTouches'][0]['pageX'];
        this.oldMoveX = this.conversionX(this.sliderList.eq(this.currentIndex));



        //临时优化，这个地方有问题，连续点击的时候会有点小问题
        let x: number = (e['changedTouches'][0]['pageX'] - this.oldTouchX) / this.maxWidth;//触摸点转换成宽度比例
        let currentX: number = this.oldMoveX + x * 100;
        this.currentX = currentX;

        // return false;
    }

    /**
     * 滑动
     */
    private onTouchMove(e: Event) {
        if (this.touch) {

            let x: number = (e['changedTouches'][0]['pageX'] - this.oldTouchX) / this.maxWidth;//触摸点转换成宽度比例
            let currentX: number = this.oldMoveX + x * 100;
            this.initZIndex();
            this.sliderMove(this.currentIndex, currentX);
            let next
            if (currentX < 0) {
                //向左滑动 右边数下一个
                next = this.currentIndex + 1;
                if (next > this.sliderList.length - 1) next = 0;
                this.sliderMove(next, 100 + currentX);
            } else {
                //向右滑动 左边数下一个
                next = this.currentIndex - 1;
                if (next < 0) next = this.sliderList.length - 1;
                this.sliderMove(next, currentX - 100);
            }

            this.currentX = currentX;
            this.setSliderAttribute(next);

        }
        return false;
    }

    /**
     * 触摸结束
     */
    private onTouchEnd(e: Event) {
        if(!this.touch)return;
        this.touch = false;
        if (!this.currentX) {
            this.creatTime();
            return;
        }
        let coords = { x: this.currentX },
            sliderList = this.sliderList;

        if (this.currentX < -10) {//向左滑， 右边为下一个
            this.currentIndex = this.next(2);

            this.tween = new TWEEN.Tween(coords).to({ x: -100 }, 600)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    sliderList.eq(this.next(1)).css({
                        zIndex: 10,
                        transform: `translateX(${coords.x}%)`
                    });

                    sliderList.eq(this.currentIndex).css({
                        transform: `translateX(${coords.x + 100}%)`
                    });

                })
                .start().onComplete(() => {
                    // this.currentX = 0;
                    this.creatTime();
                });
        } else if (this.currentX > 10) {//向右滑动 左边为下一个
            this.currentIndex = this.next(1);

            this.tween = new TWEEN.Tween(coords).to({ x: 100 }, 600)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    sliderList.eq(this.next(2)).css({
                        zIndex: 10,
                        transform: `translateX(${coords.x}%)`
                    });

                    sliderList.eq(this.currentIndex).css({
                        transform: `translateX(${coords.x - 100}%)`
                    });

                })
                .start().onComplete(() => {
                    // this.currentX = 0;
                    this.creatTime();
                });

        } else {//回到原点

            this.tween = new TWEEN.Tween(coords).to({ x: 0 }, 600)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    sliderList.eq(this.currentIndex).css({
                        transform: `translateX(${coords.x}%)`
                    });
                    if (this.currentX > 0) {
                        sliderList.eq(this.next(1)).css({
                            zIndex: 10,
                            transform: `translateX(${coords.x - 100}%)`
                        });
                    } else {
                        sliderList.eq(this.next(2)).css({
                            zIndex: 10,
                            transform: `translateX(${100 + coords.x}%)`
                        });
                    }

                })
                .start().onComplete(() => {
                    // this.currentX = 0;
                    this.creatTime();
                });

        }

        this.setPointCurrent();

        return false;
    }

    /**
     * 获取相对的下一个下标
     * @param type 1 向右滑动 左边数下一个 2 向左滑动 右边数下一个
     */
    private next(type: number): number {
        let next: number;
        if (type === 1) {
            next = this.currentIndex - 1;
            if (next < 0) next = this.sliderList.length - 1;
        } else {
            next = this.currentIndex + 1;
            if (next > this.sliderList.length - 1) next = 0;
        }
        return next
    }

    /**
     * 根据下标 图片移动到指定位置
     * @param eq 下标
     * @param x 目标位置
     */
    private sliderMove(eq: number, x: number) {
        this.sliderList.eq(eq).css({
            zIndex: 10,
            display: 'inline-block',
            transform: `translateX(${x}%)`
        });
    }

    /**
     * 转换transform的值
     */
    private conversionX(node: ZeptoCollection): number {
        if (!node.length) return 0;
        return parseFloat(node.css('transform').match(/[0-9|.|\-]+/g)[0]);
    }

    /**
     * 开始轮播定时器
     */
    private creatTime() {

        if (this.time) clearInterval(this.time);
        if (this.tween) this.tween.stop();
        let sliderList = this.sliderList;
        this.time = setInterval(() => {
            let coords = { x: 0 };
            this.currentIndex = this.next(2);


            this.setSliderAttribute(this.currentIndex);

            this.tween = new TWEEN.Tween(coords).to({ x: -100 }, 600)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    sliderList.eq(this.next(1)).css({
                        transform: `translateX(${coords.x}%)`
                    });
                    sliderList.eq(this.currentIndex).css({
                        transform: `translateX(${coords.x + 100}%)`
                    });

                })
                .start();
            this.setPointCurrent();
        }, 3000);
    }

    /**
     * 根据下标设置banner显示和图片纹理
     */
    private setSliderAttribute(eq: number) {
        let node: ZeptoCollection = this.sliderList.eq(eq),
            a: ZeptoCollection = node.find('a');
        node.css({
            display: 'inline-block'
        });
        if (a.attr('lazy')) {
            node.css({
                transform: `translateX(0)`
            });
            a.css('background-image', `url(${a.attr('lazy')})`);
            a.removeAttr('lazy');
        }

    }

    /**
     * 停止轮播
     */
    clearTime() {
        clearInterval(this.time);
    }

}