/**
 * 神羽合成列表控件
 */
class GodWingComposeItem extends BaseItemRender {
	private nameTxt:eui.Label;
	private redPoint:eui.Image;
	private bg0:eui.Image;
	private bg:eui.Image;
	constructor() {
		super();
		this.skinName = 'ShenYuComposeItem';

	}
	protected childrenCreated(): void {
		super.childrenCreated();
	}

	protected dataChanged(): void {
		if( !this.data )
			return;
		// this.nameTxt.touchEnabled = this.bg0.touchEnabled = false;
		let suitConfig:GodWingSuitConfig = this.data.suitConfig as GodWingSuitConfig;
		let slot:number = this.data.slot;
		let gl:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[suitConfig.lv][slot];
		let config:ItemConfig = GlobalConfig.ItemConfig[gl.itemId];
		this.nameTxt.text = config.name;// + "阶神羽";
	}
	public setRedPoint(b:boolean){
		this.redPoint.visible = b;
	}

	public destruct(): void {

	}


}