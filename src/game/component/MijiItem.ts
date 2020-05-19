class MijiItem extends BaseItemRender {

	//秘术图标  没开启为锁头
	private icon: eui.Image;

	private iconBg: eui.Image;

	private count: eui.Label;

	public select: eui.Image;
	public lock: eui.Image;
	public addImg: eui.Image;
	private redPoint:eui.Image;
	private itemLock: eui.Image;
	private unlearn: eui.Label;

	constructor() {
		super();
		this.skinName = "MijiItemSkin";
	}

	protected dataChanged(): void {
		this.addImg.visible = false;
		this.itemLock.visible = false;
		this.unlearn.visible = false;
		if (this.data == null) {
			this.lock.visible = true;
			this.icon.source = "";
			this.setUnlearn(false);
		}
		else if (this.data instanceof ItemData) {
			this.lock.visible = false;
			this.icon.source = (<ItemData>this.data).itemConfig.icon + "_png";
			this.count.text = (<ItemData>this.data).count + "";
			this.icon.visible = true;
		}
		else if (!isNaN(this.data.id) || !isNaN(this.data)) {
			let b:boolean = !isNaN(this.data.id);
			this.lock.visible = false;
			this.count.text = "";
			let id:number;
			if(b){
				this.itemLock.visible = this.data.isLocked;
				id = this.data.id;
			}
			else{
				id = this.data;
			}
			if (GlobalConfig.MiJiSkillConfig[id]) {
				let itemId:number = GlobalConfig.MiJiSkillConfig[id].item;
				let cfg:ItemConfig = GlobalConfig.ItemConfig[itemId];
				if( cfg )
					this.icon.source = cfg.icon + "_png";
				this.icon.visible = true;
			} else {
				this.icon.source = "";
			}
		}
		this.select.visible = false;
	}

	public setCountLabel(index:number):void
	{
		this.count.textFlow = new egret.HtmlTextParser().parser("<font color = '#9f946d'>" + (index+1) + "转开启</font>");
		this.count.visible = true;
	}

	public showSelect():void
	{
		this.lock.visible = false;
		this.icon.source = "";
		this.addImg.visible = false;
		this.select.visible = true;
	}

	public setSelected(bool:boolean):void{
		this.select.visible = bool;
	}

	public setUnlearn(b: boolean):void{
		this.unlearn.visible = b;
	}

	public showAdd(): void {
		this.data = null;
		this.lock.visible = false;
		this.icon.source = "";
		this.addImg.visible = true;
		this.redPoint.visible = UserMiji.ins().isMjiSum();
	}
}
