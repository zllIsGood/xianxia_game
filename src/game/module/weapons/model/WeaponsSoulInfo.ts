/**
 * WeaponsSoulInfo
 * 各个剑灵单数据
 */
class WeaponsSoulInfo {
	public id:number;//剑灵ID
	public name:string;//名称
	public actcond:number[];//激活条件
	public inside:string[];//内观
	public outside:string[];//外观
	public pic:string[];//界面图片
	public icon:string = "";//icon
	constructor() {
		this.id       = 0;
		this.name     = "";
		this.actcond  = [];
		this.inside   = [];
		this.outside  = [];
		this.pic      = [];
		this.icon     = "";
	}

	public setSoulInfo(id:number){
		if( id > 0){
			let wsConfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
			if( !wsConfig )return;
			this.id       = wsConfig.id;
			this.name     = wsConfig.name;
			this.actcond  = wsConfig.actcond;
			this.inside   = wsConfig.inside;
			this.outside  = wsConfig.outside;
			this.pic      = wsConfig.pic;
			this.icon     = wsConfig.icon;
		}
	}

}