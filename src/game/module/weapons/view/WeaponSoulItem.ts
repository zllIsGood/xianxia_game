/**
 * 剑灵部位控件
 *
 */
class WeaponSoulItem  extends BaseItemRender {
	private itemIcon:ItemIcon;
	private lv:eui.Label;
	private nameTxt:eui.Label;
	private redPoint:eui.Group;
	private black:eui.Rect;
	public slot:number;
	constructor() {
		super();
		this.skinName = 'weaponSoulitem';
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.slot = 0;
	}

	protected dataChanged(): void {
		if( !this.data )return;
		let wsinfo:WeaponsInfo | WeaponSoulPosConfig;
		this.black.visible = false;
		if( this.data instanceof WeaponsInfo ){
			wsinfo = this.data as WeaponsInfo;
			this.itemIcon.setActived(true);
		}
		else{
			//未激活部位
			wsinfo = this.data as WeaponSoulPosConfig;
			this.black.visible = true;
		}

		this.slot = wsinfo.id;
		let cfg:WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[wsinfo.id][0];
		this.itemIcon.imgIcon.source = cfg.icon + "_png";
		this.lv.text = (!isNaN(wsinfo.level)?wsinfo.level:cfg.level)+"";
		this.nameTxt.text = cfg.name;
		let nextcfg:WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[wsinfo.id][Number(this.lv.text)+1];
		if( !wsinfo.costNum || !nextcfg )
			this.redPoint.visible = false;
		else{
			//背包拥有数
			let itemData:ItemData = UserBag.ins().getBagItemById(wsinfo.costItem);
			let costItemLen:number = itemData?itemData.count:0;
			this.redPoint.visible = costItemLen >= wsinfo.costNum?true:false;
		}
	}

	public destruct(): void {

	}
	protected clear(): void {

	}
}