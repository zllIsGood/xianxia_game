class GuardLogsListRenderer extends BaseItemRender {
	public showText: eui.Label;
	constructor() {
		super();
		this.skinName = "UIshowDropNoticeSkin";
	}

	public dataChanged(): void {
		if( !this.data )return;
		//{noticeId:number,roleName:string,monsterName:string,itemName:string}
		let color = GlobalConfig.GuardGodWeaponConf.UIshowDrop[this.data.noticeId];
		color = color?color:0xffffff;
		let desc = GlobalConfig.GuardGodWeaponConf.UIshowDropNotice;
		desc = StringUtils.replace(desc,this.data.roleName,this.data.monsterName,`|C:${color}&T:${this.data.itemName}`);
		this.showText.textFlow = TextFlowMaker.generateTextFlow1(desc);
	}

}