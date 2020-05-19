/**
 * 铸造单个控件
 */
class ForgeZhuItem extends BaseItemRender {

	public itemIcon: ItemIcon;
	public unlock: eui.Group;
	public bitmapNum: eui.BitmapLabel;
	public lockbitmapNum: eui.BitmapLabel;
	public state: eui.Image;
	public select: eui.Image;
	public iItem: number;
	public add: eui.Image;
	public zbItem: eui.Group;//单个控件组件

	private successEff: MovieClip;//铸造完成特效

	constructor() {
		super();

		this.skinName = 'CastingZBItemSkin';
	}
	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}
	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);

		this.itemIcon.imgJob.visible = false;

		// this.successEff = new MovieClip();
		// this.addChild(this.successEff);
		// this.successEff.x = this.zbItem.width/2;
		// this.successEff.y = this.zbItem.height/2;
		// this.successEff.playFile(RES_DIR_EFF + "functionopeneff", -1);

	}
	public onClick(e: egret.TouchEvent) {
		// egret.log("e = "+e.currentTarget);

	}
	public hideAdd() {
		this.add.visible = false;
		this.bitmapNum.visible = false;
	}
	public updateItem(item: ItemConfig, pos: number, lv: number, itemNum: number, isZZ: boolean = true): void {
		this.add.visible = lv > 0 ? true : false;
		let openConfig: StoneOpenConfig = GlobalConfig.StoneOpenConfig[pos];
		if (Actor.level >= openConfig.openLv) {
			//足够的材料才显示可铸造
			let costConfig = UserForge.ins().getStoneLevelCostConfigByLv(lv + 1);
			let cost: number = 0;
			if (costConfig) {
				cost = costConfig.soulNum;
			}
			let colorStr: string = "";
			let isCost = itemNum >= cost ? true : false;
			this.state.visible = isCost;
			if (lv >= 80) {
				this.state.visible = false;
			}


			this.bitmapNum.text = lv + ``;
			if (item) {
				// egret.log("item.icon = "+item.icon);
				this.setItemImg(item.icon + "_png");
			} else {
				// egret.log("item.icon = "+"xb_"+(pos+10));
				this.setItemImg("xb_" + (pos + 10).toString());
			}

			this.unlock.visible = false;
			this.lockbitmapNum.visible = false;

		}
		else {
			this.state.visible = false;
			this.unlock.visible = true;
			this.lockbitmapNum.visible = true;
			this.add.visible = false;
			this.setItemImg("xb_" + (pos + 10));
			this.lockbitmapNum.text = openConfig.openLv + ``;
		}
		this.bitmapNum.visible = this.add.visible;

		//中间的两个空间不显示可铸造
		if (!isZZ)
			this.state.visible = false;


	}
	public setItemImg(str: string): void {
		this.itemIcon.imgIcon.source = str;
	}
	public setItemData(item: ItemConfig) {
		// egret.log("item.icon.toString() = "+item.icon);
		this.setItemImg(item.icon.toString() + "_png");
	}
	protected dataChanged(): void {
		// egret.log("***********dataChanged************");
		// egret.log("this.data.item = "+this.data.item);
		// egret.log("this.data.pos = "+this.data.pos);
		// egret.log("this.data.lv = "+this.data.lv);
		// egret.log("this.data.itemNum = "+this.data.itemNum);
		this.updateItem(this.data.item, this.data.pos, this.data.lv, this.data.itemNum);
	}


}