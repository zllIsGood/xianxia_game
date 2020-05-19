class shenqispTipsWin extends BaseEuiView {

	public tipsbg:eui.Image;
	public icon:eui.Image;
	public list:eui.List;
	public tipsnamebg:eui.Image;
	public tipsdepartline:eui.Image;
	public getway:eui.Label;
	public partname:eui.Label;
	public tipscorner:eui.Image;
	public powerPanel: PowerPanel;
	public parttips: eui.Group;
	public rect:eui.Rect;

	constructor() {
		super();
		this.skinName = "shenqispTip";
		this.isTopLevel = true;
		// this.setSkinPart("powerPanel", new PowerPanel());

	}
	public open(...param: any[]) {
		let mId   = param[0];
		let index = param[1];
		this.list.itemRenderer = ArtifactAttrDescItem;

		this.addTouchEvent(this.rect, this.onTap);

		this.setData(mId,index);
		this.powerPanel.setBgVis(false);

	}
	public setData(mId:number,ix:number){
		let itemConf = GlobalConfig.ItemConfig[mId];
		let conf = GlobalConfig.ImbaJigsawConf[mId];
		this.partname.text = conf.name;
		this.getway.text = conf.guide;
		this.icon.source = itemConf.icon + '_png';
		let data = Artifact.ins().getNewArtifactBy(ix);
		this.list.dataProvider = new eui.ArrayCollection(conf.attrs);
		let index = mId % 10 - 1;
		let state = (data.record >> index) & 1;
		let str = "";
		let power = UserBag.getAttrPower(conf.attrs);
		this.powerPanel.setPower(power);
		if (state)
			str = "|C:0x35e62d&T:已获得|";
		else
			str = "|C:0xf3311e&T:未获得|";
	}
	public onTap(e: egret.Event) {
		switch (e.target) {
			case this.rect:
				ViewManager.ins().close(this);
				break;



		}
	}

	protected dataChanged(): void {


	}

}
ViewManager.ins().reg(shenqispTipsWin, LayerManager.UI_Popup);
