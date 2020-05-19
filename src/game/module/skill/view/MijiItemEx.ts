class MijiItemEx extends BaseItemRender {

	private miji:MijiItem;
	private nameTF:eui.Label;
	constructor() {
		super();
		this.skinName = "MijiWithNameItemSkin";
		this.init();
	}

	protected dataChanged(): void {
		if( !this.data )return;
		this.miji.data = this.data;
		let config:MiJiSkillConfig = GlobalConfig.MiJiSkillConfig[this.data];
		let cfg:ItemConfig = GlobalConfig.ItemConfig[config.item];
		this.nameTF.text = cfg.name;

	}
	/**触摸事件 */
	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	public onClick(){
		let config:MiJiSkillConfig = GlobalConfig.MiJiSkillConfig[this.data];
		ViewManager.ins().open(PropGainTipsWin,0,config.item);
		// egret.log("this.miji.data = "+this.miji.data)
	}
}
