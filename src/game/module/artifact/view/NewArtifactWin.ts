class NewArtifactWin extends BaseEuiView {
	private imgName: eui.Image;
	private labelDesc0: eui.Label;
	private labelAttr: eui.Label;
	private imgFunc: eui.Image;
	private imgArtfact: eui.Image;
	private index: number;
	// private labelMaterial: eui.Label;
	private imgLeft: eui.Image;
	private imgRight: eui.Image;

	private rect: eui.Rect;
	private groupMaterial: eui.Group;
	private arrImage: eui.Image[];
	private powerPanel: PowerPanel;
	private beginY: number;
	private btnOpen: eui.Button;
	private isBtnOpen: boolean;

	private groupEff: eui.Group;
	private mc: MovieClip;
	public piece: eui.List;
	public icon: eui.Image;
	public attribute: eui.Group;
	private detail: eui.Button;
	private imgOpen: eui.Image;
	private parttips: eui.Group;


	private powerPanel0: PowerPanel;
	private partname: eui.Label;
	private getway: eui.Label;

	private list: eui.List;
	private turnicon: eui.Label;
	// private partname: eui.Label;
	private pieceCom: ShenqiSelectItemWin;
	private actGroup: eui.Group;
	private eff: MovieClip;
	// private shenqispTipsWin:shenqispTipsWin;

	public constructor() {
		super();
		this.isTopLevel = true;
		this.arrImage = [];
		this.name = `神器`;
		this.skinName = "XinShenQiSkin";
	}

	protected childrenCreated() {
		this.init();
	}

	private init() {
		this.beginY = this.imgArtfact.y;
		this.mc = new MovieClip();
		this.groupEff.addChild(this.mc);
		this.mc.x = 0;
		this.mc.y = 0;
		this.mc.playFile(RES_DIR_EFF + `artifacteff`, -1);

		// this.piece.itemRenderer = ArtifactSuiItemRenderer;
		// this.attribute.touchChildren = false;
		this.pieceCom.piece.itemRenderer = ArtifactSuiItemRenderer;

		this.list.itemRenderer = ArtifactAttrDescItem;

		this.turnicon.textFlow = new egret.HtmlTextParser().parser(`<u>查看必杀</u>`);

		this.eff = new MovieClip;
		this.eff.x = 65;
		this.eff.y = 25;
		// this.eff.scaleX = 0.8;
		// this.eff.scaleY = 0.8;
		this.eff.touchEnabled = false;
	}

	public open() {
		this.index = 1;
		// this.parttips.visible = true;
		// this.addTouchEvent(this.imgArtfact, this.onTap);
		this.addTouchEvent(this.imgLeft, this.onTap);
		this.addTouchEvent(this.imgRight, this.onTap);
		// this.addTouchEvent(this.rect, this.onTap);
		// this.addTouchEvent(this.groupMaterial, this.onTap);
		this.addTouchEvent(this.btnOpen, this.onTap);
		this.addTouchEvent(this.detail, this.onTap);
		this.addTouchEvent(this.turnicon, this.onTap);
		// this.piece.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onLink, this);
		this.pieceCom.piece.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onLink, this);
		// this.addTouchEvent(this.parttips, this.onTap);
		this.observe(Artifact.ins().postNewArtifactUpdate, this.updateView);
		this.observe(Artifact.ins().postNewArtifactInit, this.updateView);


		// this.labelMaterial.addEventListener(egret.TextEvent.LINK, this.onLink, this);
		this.getGuideTips();
		this.updateView()
		this.tweenGG();
	}

	public tweenGG() {
		egret.Tween.removeTweens(this.groupMaterial);
		let t: egret.Tween = egret.Tween.get(this.groupMaterial);
		this.groupMaterial.verticalCenter = -46;
		let y1 = this.groupMaterial.verticalCenter - 20;
		let y2 = this.groupMaterial.verticalCenter;
		t.to({ "verticalCenter": y1 }, 1500).to({ "verticalCenter": y2 }, 1500).call(this.tweenGG, this);
	}

	public close() {
		DisplayUtils.removeFromParent(this.eff);
		egret.Tween.removeTweens(this.groupMaterial);
		ViewManager.ins().close(ArtifactChipOpenWin);
		egret.Tween.removeTweens(this.groupMaterial);
	}

	public onTap(e: egret.Event) {
		// this.parttips.visible = false;
		this.isBtnOpen = false;
		switch (e.target) {
			case this.imgLeft:
				if (this.index == 1)
					break;
				else
					this.index--;
				this.updateView();
				break;
			case this.imgRight:

				if (this.index < Artifact.ins().getMaxIndex()) {
					if (this.getIsNext())
						this.index++;
				}
				this.updateView();
				break;
			case this.btnOpen:
				this.isBtnOpen = true;
				Artifact.ins().openArtifact(this.index);
				break;
			case this.detail:
				ViewManager.ins().open(ArtifactAllAttrWin);
				break;
			case this.turnicon:
				let conf = GlobalConfig.ImbaConf[this.index];
				if (conf && conf.winGuide) {
					GameGuider.guidance(conf.winGuide[0], conf.winGuide[1]);
					if (conf.winGuide[0] != "LiLianWin") ViewManager.ins().close(LiLianWin);
				}
				break;
			default:
				break;
		}
	}

	private getIsNext() {
		if (this.index == 1)
			return true;
		let pidx = this.index - 1;//检查它的上一个是否有激活
		let cafd: NewArtifactData = Artifact.ins().getNewArtifactBy(pidx);
		if (!cafd.open)//不存在代表最多浏览到当前
			return false;

		return true;
	}
	private updateView() {
		let conf: ImbaConf = GlobalConfig.ImbaConf[this.index];
		let data = Artifact.ins().getNewArtifactBy(this.index);

		if (data && data.open && conf.turnDesc) {
			this.turnicon.visible = true;
			this.turnicon.textFlow = new egret.HtmlTextParser().parser(`<u>${conf.turnDesc}</u>`);
		} else {
			this.turnicon.visible = false;
		}

		// egret.Tween.removeTweens(this.imgArtfact);
		this.imgArtfact.y = this.beginY;

		//set ArtifactImg
		this.imgOpen.visible = !data.open;
		if (!this.getGuideMaterialId(this.index)) {
			if (data.open) {
				this.imgArtfact.source = conf.img;
				this.cleanMaterialImg();
				this.groupEff.visible = true;
				this.currentState = `normal`;
				DisplayUtils.removeFromParent(this.eff);
				this.artifactTween();
			} else {
				this.imgArtfact.source = conf.imgShadow;
				this.setMaterialImg();
				this.groupEff.visible = false;
				this.currentState = `open`;

				this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
				if (!this.eff.parent) this.actGroup.addChild(this.eff);

				// egret.Tween.removeTweens(this.groupMaterial);
				this.groupMaterial.x = 42;
				this.groupMaterial.y = 101;
			}
		} else {
			this.imgArtfact.source = conf.imgShadow;
			this.setMaterialImg();
			this.groupEff.visible = false;
			this.currentState = `normal`;
			DisplayUtils.removeFromParent(this.eff);
			// egret.Tween.removeTweens(this.groupMaterial);
			this.groupMaterial.x = 42;
			this.groupMaterial.y = 101;
		}
		//set desc
		this.imgName.source = conf.imgName;
		let attstr = "";
		let num: number = 0;
		for (let key in conf.attrs) {
			num++;
		}
		if (conf.attrs)
			attstr = AttributeData.getAttStr(conf.attrs, 1);
		if (conf.exattrs != null) {
			// attstr += AttributeData.getAttStr(conf.exattrs, 1);
			for (let key in conf.exattrs) {
				attstr += "\n";
				attstr += AttributeData.getExtAttStrByType(conf.exattrs[key], 1);
				num++;
			}
		}
		this.labelAttr.text = conf.funcDesc;
		this.imgFunc.source = conf.simpleDesc;
		let str = "";
		let array = [];
		let artData = Artifact.ins().getNewArtifactBy(this.index);
		let len = 0;
		for (let i = 0; i < 8; i++) {
			let color;
			let state = (artData.record >> i) & 1;
			let state2 = ((artData.exitRecord >> i) & 1) && (state == 0);
			var obj = {};
			obj["state"] = state;
			obj["state2"] = state2;
			let mId = conf.jigsawId[i];
			let name = "";
			let img = ""
			if (mId == null) {
				name = "";
				img = "";
			} else {
				name = GlobalConfig.ImbaJigsawConf[mId].name;
				let itemConf = GlobalConfig.ItemConfig[mId];
				img = itemConf.icon + '_png';
				len++;
			}
			obj["name"] = name;
			obj["index"] = mId;
			obj["img"] = img;
			array.push(obj);
		}
		// this.piece.dataProvider = new eui.ArrayCollection(array);
		// this.piece.validateNow();
		len = len > 2 ? len : 2;
		this.pieceCom.setData(len);
		this.pieceCom.piece.dataProvider = new eui.ArrayCollection(array);
		this.pieceCom.piece.validateNow();
		// this.labelMaterial.textFlow = TextFlowMaker.generateTextFlow1(str);
		this.powerPanel.setPower(Artifact.ins().getNewArtifactPower(this.index));
		this.imgLeft.visible = this.index != 1;
		this.imgRight.visible = this.index < Artifact.ins().getMaxIndex() && this.getIsNext();

		// 激活特效界面
		if (data.open && this.isBtnOpen) {
			let arr = conf.img.split("_");
			let img = arr[0] + "_" + arr[1];
			Activationtongyong.show(0, conf.name, `j${img}_png`, ActivationtongyongShareType.None, true, () => {
				if (conf.winGuide) {
					if (ViewManager.ins().getView(conf.winGuide[0])) {
						ViewManager.ins().close(conf.winGuide[0]);
					}
					ViewManager.ins().open(conf.winGuide[0], conf.winGuide[1]);
					if (conf.winGuide[0] != "LiLianWin") ViewManager.ins().close(LiLianWin);
				}
			});
		}
	}

	public artifactTween() {
		let t: egret.Tween = egret.Tween.get(this.groupMaterial, { "loop": true });
		t.to({ y: 60 }, 1000).to({ y: 101 }, 1000);
	}

	private getGuideTips() {
		let maxIndex = Artifact.ins().getMaxIndex();
		for (let i = 1; i <= maxIndex; i++) {
			let data = Artifact.ins().getNewArtifactBy(i);
			let mId = this.getGuideMaterialId(i);
			this.index = i;
			if (!data.open) {
				break;
			}
		}
	}
	private getGuideMaterialId(index: number): number {
		let conf = GlobalConfig.ImbaConf[index];
		let data = Artifact.ins().getNewArtifactBy(index);
		let id = 0;
		for (let i = 0; i < conf.jigsawId.length; i++) {
			let e = (data.record >> i) & 1;
			if (e != 1) {
				id = conf.jigsawId[i];
				break;
			}
		}
		return id;
	}

	private openTips(mId: number) {
		let artData = Artifact.ins().getNewArtifactBy(this.index);
		let conf: ImbaConf = GlobalConfig.ImbaConf[this.index];
		let itemConf = GlobalConfig.ImbaJigsawConf[mId];
		let index = conf.jigsawId.indexOf(mId);
		let state = (artData.record >> index) & 1;
		let state2 = ((artData.exitRecord >> index) & 1) && !state;
		this.parttips.visible = false;
		if (state2)
			ViewManager.ins().open(ArtifactChipOpenWin, mId, this.index);
		// else if (!state)
		// 	UserTips.ins().showTips(itemConf.guide);
		else {
			// this.parttips.visible = true;
			ViewManager.ins().open(shenqispTipsWin, mId, this.index);

			// let conf = GlobalConfig.ImbaJigsawConf[mId];
			// this.partname.text = conf.name;
			// this.getway.text = conf.guide;
			// this.icon.source = conf.img;
			// let data = Artifact.ins().getNewArtifactBy(this.index);
			// this.list.dataProvider = new eui.ArrayCollection(itemConf.attrs);
			// let index = mId % 10 - 1;
			// let state = (data.record >> index) & 1;
			// let str = "";
			// let power = UserBag.getAttrPower(itemConf.attrs);
			// this.powerPanel0.setPower(power);
			// if (state)
			// 	str = "|C:0x35e62d&T:已获得|";
			// else
			// 	str = "|C:0xf3311e&T:未获得|";

			// this.tipsHave.textFlow = TextFlowMaker.generateTextFlow1(str);
			// this.tipsAttr.text = AttributeData.getAttStr(conf.attrs, 0, 1, "：");

			// this.groupTips.visible = true;
		}
	}

	private setMaterialImg() {
		this.cleanMaterialImg();
		let conf = GlobalConfig.ImbaConf[this.index];
		let data = Artifact.ins().getNewArtifactBy(this.index);
		let id = 0;
		for (let i = 0; i < conf.jigsawId.length; i++) {
			let e = (data.record >> i) & 1;
			if (!this.arrImage[i]) {
				let img = new eui.Image();
				this.arrImage.push(img);
				this.groupMaterial.addChild(img);
			}
			if (e == 1) {
				let mConf = GlobalConfig.ImbaJigsawConf[conf.jigsawId[i]];
				this.arrImage[i].source = mConf.img;
				this.arrImage[i].visible = true;
				this.arrImage[i].x = mConf.point.x;
				this.arrImage[i].y = mConf.point.y;
			}
		}
	}

	private cleanMaterialImg() {
		for (let i = 0; i < this.arrImage.length; i++) {
			this.arrImage[i].visible = false;
		}
	}

	private onLink(e: eui.ItemTapEvent) {
		let mid = parseInt(e.item["index"]);
		if (!isNaN(mid))
			this.openTips(mid);
	}
}

ViewManager.ins().reg(NewArtifactWin, LayerManager.UI_Main);