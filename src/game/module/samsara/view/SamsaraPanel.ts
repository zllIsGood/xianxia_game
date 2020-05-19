/**
 * 轮回面板
 * Created by Peach.T on 2017/11/24.
 */
class SamsaraPanel extends BaseView {

	public dinghong: eui.Group;
	public upBtn: eui.Button;
	public redPoint: eui.Image;
	public maxLevel: eui.Label;
	public getItemTxt: eui.Label;
	public attrGroup0: eui.Group;
	public powerPanel0: BaseComponent;
	public attr0: eui.Label;
	public attrGroup1: eui.Group;
	public powerPanel1: PowerPanel;
	public attr1: eui.Label;
	public attrGroup2: eui.Group;
	public powerPanel2: PowerPanel;
	public attr2: eui.Label;
	public yeliValue: eui.Label;
	public lunhuiLv: eui.BitmapLabel;

	public lv0: eui.Image;
	public lv1: eui.Image;
	public lv2: eui.Image;
	public lv3: eui.Image;
	public lv4: eui.Image;
	public lv5: eui.Image;
	public eff0: eui.Group;
	public eff1: eui.Group;
	public eff2: eui.Group;
	public eff3: eui.Group;
	public eff4: eui.Group;
	public eff5: eui.Group;
	public ball: eui.Group;
	public water: eui.Group;

	private masksp: egret.Sprite;
	private ballEffect: MovieClip;
	private waterEffect: MovieClip;
	private labelEffect: MovieClip;
	private isExpEnough;
	private lvImgAry: any[];
	private effectContainerAry: any[];
	public help: eui.Button;
	constructor() {
		super();
		this.skinName = "ReincarnationWinSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.lvImgAry = [this.lv0, this.lv1, this.lv2, this.lv3, this.lv4, this.lv5];
		this.effectContainerAry = [this.eff0, this.eff1, this.eff2, this.eff3, this.eff4, this.eff5];
		for (let i in this.effectContainerAry) {
			let effect = new MovieClip();
			effect.playFile(RES_DIR_EFF+"reincarnation_fire", -1);
			this.effectContainerAry[i].addChild(effect);
		}
		this.ballEffect = new MovieClip();
		this.ballEffect.playFile(RES_DIR_EFF+"reincarnation_ball", -1);
		this.ball.addChild(this.ballEffect);

		// this.waterEffect = new MovieClip();
		// this.waterEffect.playFile(RES_DIR_EFF+"reincarnation_water", -1);
		// this.water.addChild(this.waterEffect);

		this.labelEffect = new MovieClip;
		this.labelEffect.scaleX = 0.8;
		this.labelEffect.scaleY = 0.8;
		this.labelEffect.touchEnabled = false;
		this.redPoint.visible = false;
		this.getItemTxt.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.getItemTxt.text}</u></a>`);
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.getItemTxt, this.getItem);
		this.addTouchEvent(this.upBtn, this.upgrade);
		this.addTouchEvent(this.help, this.onHelp);
		this.observe(SamsaraCC.ins().postSamsaraInfo, this.updateView);
		this.updateView();
	}

	private upgrade(): void {
		if (this.isExpEnough) {
			SamsaraCC.ins().upgradeSamsaraLv();
		} else {
			UserTips.ins().showTips("业力不足");
		}
	}

	private onHelp():void{
		ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[22].text);
	}

	private getItem(): void {
		ViewManager.ins().open(GetSamsaraExpPanel);
	}

	private getValue(attrs: AttributeData[], typeValue: number): string {
		let obj = CommonUtils.getObjectByAttr(attrs, "type", typeValue);
		return obj.value.toString();
	}

	public updateView(): void {
		let mode = SamsaraModel.ins().samsaraInfo;
		let lv = mode.lv;
		let cfg = GlobalConfig.ReincarnationLevel[lv];
		let attrDesc = AttributeData.getAttStr(cfg.attrs, 0, 1, "  :  ");
		attrDesc += `\n必杀神圣伤害 : ${this.getValue(cfg.ex_attrs, 57)}`;
		this.attr1.text = attrDesc;
		let power = UserBag.getAttrPower(cfg.attrs) * 3 + cfg.ex_power;
		this.powerPanel1.setPower(power);
		let percent;

		let nextLv = lv + 1;
		let isFull = false;
		if (nextLv >= CommonUtils.getObjectLength(GlobalConfig.ReincarnationLevel)) {
			this.attr2.text = "已满级";
			this.yeliValue.text = "已满级";
			isFull = true;
			percent = 1;
		}
		else {
			let nextCfg = GlobalConfig.ReincarnationLevel[nextLv];
			let nextPower = UserBag.getAttrPower(nextCfg.attrs) * 3 + nextCfg.ex_power;
			this.powerPanel2.setPower(nextPower);//这里显示的战斗力 = （生命*0.2+攻击*3.6+物防*1.8+魔防*1.8）*3 + 拓展战力

			attrDesc = AttributeData.getAttStr(nextCfg.attrs, 0, 1, "  :  ");
			attrDesc += `\n必杀神圣伤害 : ${this.getValue(nextCfg.ex_attrs, 57)}`;
			this.attr2.text = attrDesc;

			let colorStr;
			let exp = mode.exp;
			let needExp = nextCfg.consume;
			if (exp >= needExp) {
				colorStr = ColorUtil.GREEN_COLOR;
				this.isExpEnough = true;
			}
			else {
				colorStr = ColorUtil.RED_COLOR;
				this.isExpEnough = false;
			}
			this.yeliValue.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${exp}</font><font color=${ColorUtil.WHITE_COLOR}>/${needExp}</font> `);
			percent = exp / needExp;
		}

		if (!isFull && (SamsaraModel.ins().isCanItemExchange() || (Actor.level >= GlobalConfig.ReincarnationBase.levelLimit && SamsaraModel.ins().getExpExchangeTimes() > 0))) {
			this.addLabelEffect();
		}
		else {
			this.removeLabelEffect();
		}

		let lv1 = SamsaraModel.ins().getSamsara(Actor.samsaraLv);
		let lv2 = SamsaraModel.ins().getSamsaraLv(Actor.samsaraLv);
		let desc = SamsaraModel.ins().getSamsaraDesc(lv1) + "·" + SamsaraModel.ins().getSamsaraLvDesc(lv2);
		this.lunhuiLv.text = desc;
		this.setLvImgState(lv2);
		this.maskImage(percent);
		this.redPoint.visible = this.upBtn.visible && SamsaraModel.ins().isCanUpgrade();
		this.maxLevel.visible = isFull;
		this.upBtn.visible = !isFull;
		this.getItemTxt.visible = !isFull;
		this.powerPanel2.visible = !isFull;
	}

	private setLvImgState(samsaraLv: number): void {
		for (let i in this.lvImgAry) {
			this.lvImgAry[i].visible = false;
			this.effectContainerAry[i].visible = false;
		}
		for (let i = 0; i <= samsaraLv; i++) {
			this.lvImgAry[i].visible = true;
			this.effectContainerAry[i].visible = true;
		}
	}

	private addLabelEffect(): void {
		TimerManager.ins().doNext(() => {
			DisplayUtils.removeFromParent(this.labelEffect);
			this.labelEffect.x = this.getItemTxt.x + this.getItemTxt.width/2;
			this.labelEffect.y = this.getItemTxt.y + this.getItemTxt.height/2;
			if (this.labelEffect.parent == null) {
				this.getItemTxt.parent.addChild(this.labelEffect);
			}
			this.labelEffect.playFile(RES_DIR_EFF + "chargeff1", -1);
		}, this);
	}

	private maskImage(percent :number) {
		if (percent >= 1) {
			DisplayUtils.removeFromParent(this.masksp);
			this.masksp = null;
			return;
		}
		//背图/遮罩高度
		let imgHeight = 150;
		if (!this.masksp) {
			this.masksp = new egret.Sprite();
			let square: egret.Shape = new egret.Shape();
			square.graphics.beginFill(0xffff00);
			square.graphics.drawRect(this.ball.x - 75, this.ball.y - 75, 152, imgHeight);
			square.graphics.endFill();
			this.masksp.addChild(square);
			this.ball.parent.addChild(this.masksp);
			this.ball.mask = this.masksp;
		}
		this.masksp.y = imgHeight * (1 - percent);
		// this.water.visible = percent > 0;
		// this.water.y = this.masksp.y + 5;
	}

	private removeLabelEffect(): void {
		this.labelEffect.stop();
		DisplayUtils.removeFromParent(this.labelEffect);
	}

	public close(...param: any[]): void {
		this.removeObserve();
	}
}
