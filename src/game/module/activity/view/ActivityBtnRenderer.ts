class ActivityBtnRenderer extends FuliActBtnRenderer {
	public selectIcon: eui.Image;
	public iconDisplay: eui.Image;
	public redPoint: eui.Group;
	public mc: MovieClip;

	constructor() {
		super();
		this.skinName = "ActBtnSkin";
	}

	protected dataChanged(): void {
		let abc: ActivityBtnConfig = this.data as ActivityBtnConfig;
		if (abc != null) {
			this.iconDisplay.source = abc.icon;
			if(this.data.sort == 15){
				this.redPoint.visible = Activity.ins().isShowRedPointByBtnInfo(abc) || RoleMgr.ins().isFirst;
			}else{
				this.redPoint.visible = Activity.ins().isShowRedPointByBtnInfo(abc);
			}
			if (abc.light && !Activity.ins().getPalyEffListById(abc.id)) {
				if (!this.mc) {
					this.mc = new MovieClip();
					this.mc.x = 51;
					this.mc.y = 77;
				}
				this.mc.playFile(RES_DIR_EFF + "activityBtnEff", -1);
				this.addChildAt(this.mc, 3);
			} else {
				DisplayUtils.removeFromParent(this.mc);
			}
		}
		else {
			this.iconDisplay.source = "";
		}
	}
}