class KfArenaJoinItemRender extends BaseItemRender {
	public target: eui.Label;
	private rewardList: eui.List;
	private isGet: boolean = false;
	private stateImg: eui.Image;
	private btnGroup: eui.Group;

	public constructor() {
		super();
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	

	public init() {
		
		this.rewardList.itemRenderer = ItemBase;
		this.btnGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);

	}

	public dataChanged(): void {
		if (!this.data) return;
		this.isGet = false;
		this.stateImg.source = "tag_weidacheng";
		this.btnGroup.visible = false;
		this.target.text = `${this.data.count}`;
		let state: number = KfArenaSys.ins().dflState;
		if (((state >> this.data.id) & 1) == 1) {
			//已领
			this.stateImg.source = "yilingqu";
			this.btnGroup.visible = false;
		} else {
			if (KfArenaRedPoint.ins().JoinRedPoint.length > 0 && KfArenaRedPoint.ins().JoinRedPoint[this.data.id] > 0) {
				this.isGet = true;
				this.stateImg.source = null;
				this.btnGroup.visible = true;
			}
		}
		this.rewardList.dataProvider = new eui.ArrayCollection(this.data.award);
	}

	private onTap(e: egret.TouchEvent) {
		if (this.isGet)
			KfArenaSys.ins().sendJoinRewards(this.data.id);
	}

	public destruct(): void {
		this.btnGroup.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}
}