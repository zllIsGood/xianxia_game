/**
 * 诛仙控件专属
 */
class HeirloomItem extends BaseItemRender {

	// public static QUALITY_COLOR: number[] = [0xf7f0f0, 0x5ad200, 0x00d8ff, 0xce1af5, 0xfeca2d, 0xf3311e];
	// public static QUALITY_COLOR: number[] = [0xffffff, 0x33ff00, 0x9900cc, 0xff9900, 0xff3300, 0xff3399];
	//白,绿,紫,橙,红
	public static QUALITY_COLOR: number[] = [0xe2dfd4, 0x35e62d, 0xd242fb, 0xff750f, 0xf3311e, 0xffd93f];
	public itemIcon: HeirloomItemIcon;
	public selectIcon:eui.Image;
	public lv:eui.Image;
	public lvBg:eui.Image;
	public skilldesc:string;
	public skillname:string;
	public equipName:eui.Label;
	public redPoint:eui.Label;
	public upEffect: MovieClip;

	constructor() {
		super();
		this.skinName = 'heirloomItemSkin';

	}
	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	/**触摸事件 */
	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);

		//this.selectIcon.x = this.itemIcon.x;
		// this.selectIcon.y = this.itemIcon.y - 5;
	}

	protected dataChanged(): void {
		this.clear();
		if( !this.data )
			return;

		if( this.data.icon ){//技能不显示
			this.lv.visible = this.lvBg.visible = false;
		}

		let info:HeirloomInfo | HeirloomEquipConfig = this.data.info;
		this.itemIcon.setData(info,this.data.pos,this.data.icon,this.data.uplevel);
		this.lv.visible = info?true:false;
		if( !this.data.icon ){
			if( info && info.lv > 0 ){
				this.lv.visible = true;
				this.lv.source = "heir_0" + info.lv;
			}else{
				this.lv.visible = false;
			}
			this.lvBg.visible = this.lv.visible;
		}
		else{
			this.lvBg.visible = this.lv.visible = false;
			this.skillname    = this.data.skillname;
			this.skilldesc    = this.data.skilldesc;
			this.equipName.visible = false;
		}

		if( info.name )
			this.equipName.text = info.name;

		if( this.data.uplevel )
			this.setUpEff();


	}
	public cleanEff(){
		this.itemIcon.cleanEff();
	}
	public setTipsVisible(){
		this.itemIcon.imgRect.visible = false;
		this.equipName.visible = false;
	}
	/**
	 * 清除格子数据
	 */
	protected clear(): void {
		this.cleanEff();
	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	public onClick() {
		//this.selectIcon.x = this.itemIcon.x;
		// this.selectIcon.y = this.itemIcon.y - 5;
	}
	public setSelectIconVisible(v:boolean){
		this.selectIcon.visible = v;
		// let iconY:number = this.itemIcon.y;
		// if( !this.itemIcon.imgRect.visible )
		// 	iconY = this.itemIcon.y - 5;
		// this.selectIcon.y = iconY;
	}
	public setUpEff(){
		if (this.upEffect == null) {
			this.upEffect = new MovieClip;
			this.upEffect.x = this.itemIcon.x + this.itemIcon.width/2;
			this.upEffect.y = this.itemIcon.y + this.itemIcon.height/2;
			// this.addChildAt(this.upEffect, this.getChildIndex(this.imgIcon)+10);
			this.addChild(this.upEffect);
		}
		this.upEffect.playFile(RES_DIR_EFF + 'promoteeff',1);
	}

}