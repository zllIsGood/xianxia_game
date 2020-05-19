/**
 * WeaponsInfo
 * 各个部位单数据
 */
class WeaponsInfo {
	public id:number;//部位
	public level:number;//lv
	public costItem:number;//升级消耗的道具
	public costNum:number;//升级消耗的数量
	public showlv:number;//展示等级
	public assault:number;//突破展示
	public icon:string;//部位资源
	public name:string;//部位名
	public attr:{type:number,value:number}[];//属性
	public ex_attr:{type:number,value:number}[];//扩展属性
	constructor() {
		this.id       = 0;
		this.level    = 0;
		this.costItem = 0;
		this.costNum  = 0;
		this.showlv   = 0;
		this.assault  = 0;
		this.icon     = "";
		this.name     = "";
		this.attr 	  = [];
		this.ex_attr  = [];
	}

	public setInfo(slot:number,lv:number){
		if( slot > 0 && lv > 0){
			let wConfig:WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[slot][lv];
			if(!wConfig)return;
			this.id         = wConfig.id;
			this.level      = wConfig.level;
			this.costItem   = wConfig.costItem;
			this.costNum    = wConfig.costNum;
			this.showlv     = wConfig.showlv;
			this.assault    = wConfig.assault;
			this.icon     	= wConfig.icon;
			this.name       = wConfig.name;
			this.attr  		= wConfig.attr;
			this.ex_attr    = wConfig.ex_attr;
		}
	}

}