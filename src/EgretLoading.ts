
class EgretLoading extends egret.DisplayObjectContainer {

    private progressW: number = 320;
    private progressH: number = 25;

    private bg: eui.Image;
    private label: eui.Label;
    
    constructor() {
        super();
        let sw = StageUtils.ins().getWidth();
        let sh =  StageUtils.ins().getHeight();

        // 加载背景图资源
        this.bg = new eui.Image();
        this.bg.source = 'https://cdnftznh5.hulai.com/client1/res/0/resource/image/loading/loading_res.jpg';
        this.bg.x = 0;
        let y = adapterIphoneX() ? 52 : 0;
        this.bg.y = y;
        this.bg.width = sw;
        this.bg.height = sh;
        this.addChild(this.bg);


        // 当前进度内容
        this.label = new eui.Label();
        this.label.text = `正在进入游戏...`;
        this.label.textColor = 0xffffff;
        this.label.x = (sw - 170) / 2;
        this.label.y = sh - 120 - this.progressH;
        this.label.size = 20;
        this.label.textAlign = egret.HorizontalAlign.JUSTIFY;
        this.addChildAt(this.label, 999);

        let beianLabel = new eui.Label();
        beianLabel.text = "抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。备案号：文网游备字〔2015〕Ｍ-RPG 0781 号。著作权人：互爱互动（北京）科技有限公司。软著登记号：2015SR024500。出版单位：互爱互动（北京）科技有限公司。批准文号：新广出审[2015]796号。出版物号：ISBN 978-7-89988-380-8。发行商：重庆策娱科技有限公司";
        beianLabel.textColor = 0xffffff;
        beianLabel.size = 14;
        beianLabel.lineSpacing = 4;
        beianLabel.width = sw - 20;
        beianLabel.x = 10;
        beianLabel.y = sh - 100;
        beianLabel.textAlign = egret.HorizontalAlign.JUSTIFY;
        this.addChildAt(beianLabel, 999);
    }

    public enterGame() {
        // 进入游戏
        this.parent.removeChild(this);
    }
    
    public setLoadingText(str: string) {
        this.label.text = str;
    }
}