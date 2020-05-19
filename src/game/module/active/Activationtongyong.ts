/**
 * Created by Administrator on 2017/6/5.
 */

enum ActivationtongyongShareType {
	None      = 0,
	Wing      = 1,
	HuanShou  = 2,
	FlySword  = 3,
	TianXian  = 4,
	RingAwake = 5,
}

class Activationtongyong extends BaseEuiView {

	public bgClose: eui.Rect;
	public lbg: eui.Image;
	public rbg: eui.Image;
	public imgGroup: eui.Group;
	public imgAct: eui.Group;

	public bg: eui.Image;//台阶
	public title: eui.Image;
	public tielian: eui.Group;
	public titleBg: eui.Image;
	public leftBg: eui.Image;
	public buttonBg: eui.Image;
	public itemname: eui.Label;
	public layer: eui.Group;
	public img: eui.Image;
	public imgMc: eui.Group;
	public zlMc:eui.Group;
	public imgEff:MovieClip;
	public zlEff:MovieClip;
	public share: eui.CheckBox;
	public awardBtn: eui.Button;

	private mc: MovieClip;
	private shareType: ActivationtongyongShareType;

	private Groupeff: eui.Group;//特效定位
	private closeFunc: Function;

	private winWidth: number;
	private cloudL = [];
	private cloudR = [];

	private state1: eui.Group;
	private state2: eui.Group;

	constructor() {
		super();

		this.skinName = `activationtongyong`;
		this.isTopLevel = true;
		this.bgClose.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.awardBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.winWidth = egret.MainContext.instance.stage.stageWidth;
		// console.log(this.winWidth);
		// console.log(this.width);
		let diffWidth = this.winWidth/2-this.width/2;
		for (let i = 1; i <= 3; i++) {
			this.cloudL[i] = this[`cloudL${i}`];
			this.cloudR[i] = this[`cloudR${i}`];
			this.cloudL[i].x += diffWidth;
			this.cloudR[i].x += diffWidth;
		}
	}

	private onTap(e: egret.TouchEvent): void {

		switch (e.currentTarget) {
			case this.awardBtn:
			case this.bgClose:
				if (this.share.selected && LocationProperty.isWeChatMode && this.shareType != ActivationtongyongShareType.None) {

					let info = GlobalConfig.ShareDevConfig[this.shareType];
					let wordRan = 0;
					let imgRan = 0;
					let title: string = "";
					let img: string = "";
					if (info.word.length > 0) {
						wordRan = Math.floor(Math.random() * info.word.length);
						title = info.word[wordRan];
					} 

					if (info.pic.length > 0) {
						imgRan = Math.floor(Math.random() * info.pic.length);
						img = info.pic[imgRan];
					}
					// let title: string = info.word.length > 0 ? info.word[0] : "";
					// let img: string = info.pic.length > 0 ? info.pic[0] : "";

					let imgPath: string = `resource/image/share/${img}`;

					// 获取分享图片的版本号信息
					let version = ResVersionManager.ins().getDir(imgPath)

					platform.shareAppMessage(title, "", `${version}/${imgPath}`).then(() => {
						ViewManager.ins().close(Activationtongyong);		
					});
				} else {
					ViewManager.ins().close(Activationtongyong);
				}
				break;
		}
	}

	public open(...param: any[]): void {
		let type: number = param[0];
		let name: string = param[1];
		let source: string = param[2];
		this.shareType = param[3];
		let play: boolean = param[4];
		this.closeFunc = param[5];
		let effmc: string = param[6];
		let effmcSet: { x?: number, y?: number, rotation?: number } = param[7];
		let zlmodel: string = param[8];
		
		this.title.source = type ? "tongyongjihuochenggongp3" : "tongyongjihuochenggongp2";

		if (this.shareType != ActivationtongyongShareType.None && LocationProperty.isWeChatMode) {
			this.share.selected = true;
			this.awardBtn.visible = true;
			this.share.visible = true;
			this.state1.visible = false;
			this.state2.visible = true;
		} else {
			this.state1.visible = true;
			this.state2.visible = false;
			this.share.selected = true;
			this.awardBtn.visible = false;
			this.share.visible = false;
		}

		let rxa: RegExpExecArray = RegExpUtil.NonNumericExp.exec(name);
		if (!rxa)
			this.itemname.text = name;
		else {
			let num = "";
			let oth = "";

			for (let i = 0; i < name.length; i++) {
				if (i >= rxa.index) {
					oth += name[i];
				} else {
					num += name[i];
				}
			}
			let str = "";
			if (Number(num) / 10 >= 1) {
				str = num;
			} else {
				str = " " + num;
			}
			this.itemname.text = str + oth;
		}
		// egret.log("this.itemname.text = "+this.itemname.text);
		this.img.source = source;
		if (effmc) {
			if (!this.imgEff)
				this.imgEff = new MovieClip;
			if (!this.imgEff.parent)
				this.imgMc.addChild(this.imgEff);
			this.imgEff.playFile(RES_DIR_EFF + effmc, -1);
			if (effmcSet) {
				this.imgEff.rotation = effmcSet.rotation;
				this.imgEff.x = effmcSet.x;
				this.imgEff.y = effmcSet.y;
			}
		}
		if (zlmodel) {//天仙
			if (!this.zlEff)
				this.zlEff = new MovieClip;
			if (!this.zlEff.parent)
				this.zlMc.addChild(this.zlEff);
			this.zlEff.playFile(RES_DIR_EFF + zlmodel, -1);
		}
		// egret.log("img.source = "+source);
		// egret.log("this.img.x = "+this.img.x);
		// egret.log("this.img.y = "+this.img.y);
		// this.artifactTween();//浮动
		// this.showPanel(play);
		this.playAnimaiton(play);
	}

	public close() {

		egret.Tween.removeTweens(this.title);
		egret.Tween.removeTweens(this.titleBg);
		egret.Tween.removeTweens(this.img);
		egret.Tween.removeTweens(this.imgMc);
		egret.Tween.removeTweens(this.zlMc);
		egret.Tween.removeTweens(this.tielian)

		egret.Tween.removeTweens(this.imgAct);

		if (this.closeFunc)
			this.closeFunc.apply(null);
		this.closeFunc = null;
		DisplayUtils.removeFromParent(this.zlEff);
		DisplayUtils.removeFromParent(this.imgEff);
		DisplayUtils.removeFromParent(this.mc);
		this.zlEff = null;
		this.imgEff = null;
		this.mc = null;
	}
	/**开场前动画 */
	private playAnimaiton(play: boolean) {
		//记录坐标
		let tlpos = [this.tielian.x, this.tielian.y];
		let lbgpos = [this.lbg.x, this.lbg.y];
		let rbgpos = [this.rbg.x, this.rbg.y];

		//记录缩放
		let titleScale = [this.title.scaleX, this.title.scaleY];
		let tbgScale = [this.titleBg.scaleX, this.titleBg.scaleY];
		let imgScale = [this.img.scaleX, this.img.scaleY];
		let imgMcScale = [this.imgMc.scaleX, this.imgMc.scaleY];

		//台阶
		this.bg.visible = false;
		this.itemname.visible = false;
		this.leftBg.visible = false;
		this.buttonBg.visible = false;


		//开始前
		this.title.scaleX = 0;
		this.title.scaleY = 0;
		this.titleBg.scaleX = 0;
		this.titleBg.scaleY = 0;
		this.img.scaleX = 0;
		this.img.scaleY = 0;
		this.imgMc.scaleX = 0;
		this.imgMc.scaleY = 0;
		this.tielian.y = -this.tielian.height * 2;

		//动画开始
		let speed = 1;//播放速度
		let t1: egret.Tween = egret.Tween.get(this.tielian);
		t1.to({ "y": tlpos[1] + 50 }, 200 * speed).to({ "y": tlpos[1] }, 100 * speed).call(() => {//下拉
			this.bg.visible = true;//台阶
			let t2: egret.Tween = egret.Tween.get(this.title);
			let t3: egret.Tween = egret.Tween.get(this.titleBg);
			let t4: egret.Tween = egret.Tween.get(this.img);
			let t5: egret.Tween = egret.Tween.get(this.imgMc);
			t2.to({ scaleX: titleScale[0], scaleY: titleScale[1] }, 500 * speed);
			t3.to({ scaleX: tbgScale[0], scaleY: tbgScale[1] }, 500 * speed);
			t5.to({ scaleX: imgMcScale[0], scaleY: imgMcScale[1] }, 500 * speed);
			t4.to({ scaleX: imgScale[0], scaleY: imgScale[1] }, 500 * speed).wait(500).call(() => {
				//文字 文字背景 点击任意关闭文字
				this.itemname.visible = true;
				//this.leftBg.visible = true;
				this.buttonBg.visible = true;
				//播放特效
				this.showPanel(play);
				this.artifactTween();//浮动
			});
		});
		//底边
		this.lbg.y = -this.tielian.height;
		this.rbg.y = -this.tielian.height;
		let tl: egret.Tween = egret.Tween.get(this.lbg);
		tl.to({ "y": lbgpos[1] + 50 }, 200 * speed).to({ "y": lbgpos[1] }, 100 * speed);
		let tr: egret.Tween = egret.Tween.get(this.rbg);
		tr.to({ "y": rbgpos[1] + 50 }, 200 * speed).to({ "y": rbgpos[1] }, 100 * speed);

		// ☁☁☁
		let outTime: number[] = [1000,1200,1000];
		for (let i = 1; i <= 3; i++) {
			egret.Tween.get(this.cloudL[i]).to({x:this.cloudL[i].x-this.winWidth},outTime[i-1],egret.Ease.sineInOut);
			egret.Tween.get(this.cloudR[i]).to({x:this.cloudR[i].x+this.winWidth},outTime[i-1],egret.Ease.sineInOut);
		}
	}
	/**动画完结后的显示 */
	private showPanel(play: boolean) {
		if (play) {
			this.mc = this.mc || new MovieClip();
			this.mc.anchorOffsetX = this.Groupeff.anchorOffsetX;
			this.mc.anchorOffsetY = this.Groupeff.anchorOffsetY;
			this.Groupeff.addChild(this.mc);
			this.mc.playFile(RES_DIR_EFF + "artifacteff", -1);
		}
	}

	//道具上下浮动
	public artifactTween() {
		let t: egret.Tween = egret.Tween.get(this.imgAct, { "loop": true });
		t.to({ "y": this.imgAct.y - 20 }, 1000).to({ "y": this.imgAct.y }, 1000);
	}

	/**
	 * 显示通用激活升阶界面
	 * @param type    0激活1升阶
	 * @param name    对象名字
	 * @param source    资源名字
	 */
	static show(type: number, name: string, source: string, shareType: ActivationtongyongShareType = ActivationtongyongShareType.None, play: boolean = true, func: Function = null, effmc?: string, effmcSet?: { x?: number, y?: number, rotation?: number }, zlmodel?: string): void {
		ViewManager.ins().open(Activationtongyong, type, name, source, shareType, play, func, effmc, effmcSet, zlmodel);
		StageUtils.ins().setTouchChildren(true);
	}
}
ViewManager.ins().reg(Activationtongyong, LayerManager.UI_Main);