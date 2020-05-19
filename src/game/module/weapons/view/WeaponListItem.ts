import MovieClipEvent = egret.MovieClipEvent;
/**
 * 剑灵列表框控件
 *
 */
class WeaponListItem extends BaseItemRender {
	private imgIcon:eui.Button;
	private timelabel:eui.Label;
	private levellabel:eui.Label;
	// private selectImage:eui.Image;
	private redPoint0:eui.Image;
	private huanhuaImage:eui.Group;
	// private blackImg:eui.Rect;
	private mc:MovieClip;
	private effpos:eui.Image;
	constructor() {
		super();
		this.skinName = 'soulItemSkin';
	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}
	//{isuse:boolean,id:number,isRedPoint:boolean,level:number,isSelect:boolean}
	protected dataChanged(): void {
		if( !this.data )return;
		let id:number 			= this.data.id;
		let isuse:boolean 		= this.data.isuse;
		let isRedPoint:boolean  = this.data.isRedPoint;
		let level:number  	  	= this.data.level;
		let isSelect:boolean  	= this.data.isSelect;
		let wsconfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
		let showId:number 		= this.data.showId;
		let job:number       = this.data.job;
		if(!wsconfig){
			//未激活
			wsconfig = GlobalConfig.WeaponSoulConfig[showId];
			this.setEff(wsconfig,job);
			// for( let k in GlobalConfig.WeaponSoulConfig){
			// 	wsconfig = GlobalConfig.WeaponSoulConfig[k];
			// 	break;
			// }
			let wssconfig:WeaponSoulSuit[] = GlobalConfig.WeaponSoulSuit[wsconfig.id];
			let wss:WeaponSoulSuit;
			for( let k in wssconfig) {
				wss = wssconfig[k];
				break;
			}
			// this.blackImg.visible = true;
			// this.imgIcon.source = wsconfig.icon + "_png";
			this.timelabel.text = wsconfig.name;
			this.huanhuaImage.visible = false;
			this.redPoint0.visible = isRedPoint;
			this.levellabel.text  = wss.level+"阶";
			// this.selectImage.visible = isSelect;

			this.setGray(this.mc);
			return;
		}
		//已激活
		this.setEff(wsconfig,job);
		// this.blackImg.visible = false;
		// this.imgIcon.source = wsconfig.icon + "_png";
		this.timelabel.text = wsconfig.name;
		this.huanhuaImage.visible = isuse;
		this.redPoint0.visible = isRedPoint;
		this.levellabel.text  = level+"阶";
		// this.selectImage.visible = isSelect;
	}
	private setEff(wsconfig:WeaponSoulConfig,job:number){
		if( !wsconfig )
			return;
		if( !this.mc )
			this.mc = new MovieClip;
		if( !this.mc.parent ){
			this.effpos.parent.addChild(this.mc);
			this.mc.x = this.effpos.x;
			this.mc.y = this.effpos.y;
			// this.mc.width = this.effpos.width;
			// this.mc.height = this.effpos.height;
			this.mc.rotation = this.effpos.rotation;
		}
		let eff:string = wsconfig.inside[job-1];
		this.mc.playFile(RES_DIR_EFF + eff,-1);
		this.touchEnabled = false;
		this.mc.touchEnabled = false;
		this.effpos.parent.touchEnabled = false;
		this.cleanFilters(this.mc);
	}
	/** 设置图片灰化 */
	public setGray(pic:egret.DisplayObject): void {
		if( this.mc ){
			this.cleanFilters(this.mc);
		}
		if( pic ){
			let colorMatrix: number[] = [0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0];
			pic.filters = [new egret.ColorMatrixFilter(colorMatrix)];
		}

	}
	public cleanFilters(pic:egret.DisplayObject){
		if( pic ){
			pic.filters = [];
		}
	}

	protected clear(): void {
		this.cleanFilters(this.mc);
	}


	public destruct(): void {
		this.clear();
	}
}