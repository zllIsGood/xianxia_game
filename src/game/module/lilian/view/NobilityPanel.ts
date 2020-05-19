/**
 *
 * @author 
 *
 */
class NobilityPanel extends BaseView {
	private lvTxt: eui.Label;
	private attrTitleTxt: eui.Label;
	private attrTxt: eui.Label;
	private nextGroup: eui.Group;
	private nextAttrTxt: eui.Label;
	private list: eui.List;
	private sureBtn: eui.Button;
	private completely: eui.Label;
	private totalPower: eui.BitmapLabel;
	private _totalPower: number = 0;
	private mc: MovieClip;				   //特效
	private promoteeff: MovieClip;			//升级特效
	constructor() {
		super();

		this.skinName = "NobilitySkin";

		this.name = "天阶";

	}

	protected childrenCreated(): void {
		this.init();
	}

	public init() {
		this.list.itemRenderer = NobilityItem;

		this.totalPower = BitmapNumber.ins().createNumPic(0, "1");
		this.totalPower.x = 182;
		this.totalPower.y = 63;
		this.addChild(this.totalPower);

		this.promoteeff = new MovieClip;
		this.promoteeff.x = 214;
		this.promoteeff.y = 260;
	}

	public open(): void {
		this.addTouchEvent(this.list, this.onListTouch);
		this.addTouchEvent(this.sureBtn, this.onUpgrade);
		this.observe(UserTask.ins().postTaskChangeData, this.setData);
		this.observe(LiLian.ins().postNobilityData, this.setData);
		this.setData();
	}

	public close(): void {
		this.removeTouchEvent(this.list, this.onListTouch);
		this.removeTouchEvent(this.sureBtn, this.onUpgrade);
		this.removeObserve();
	}

	private onListTouch(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Label) {
			let item: NobilityItem = e.target.parent as NobilityItem;
			GameGuider.taskGuidance((item.data as AchievementData).id, 1);
		}
	}

	private onUpgrade(e: egret.TouchEvent): void {
		if (LiLian.ins().getNobilityIsUpGrade())
			LiLian.ins().sendNobilityUpgrade();
		else
			UserTips.ins().showTips("|C:0xf3311e&T:任务条件没达成，无法升级|");
	}

	private setData(): void {
		let lv: number = LiLian.ins().nobilityLv;
		((lv >= 0 && lv != null) ? lv : lv = 0);
		let config: KnighthoodConfig = GlobalConfig.KnighthoodConfig[lv];
		this.lvTxt.text = config.desc;
		this.attrTxt.text = AttributeData.getAttStr(config.attrs, 0, 1, "：");

		let power: number = UserBag.getAttrPower(config.attrs);
		if (power > this._totalPower && this._totalPower > 0)
			this.playEff()

		this._totalPower = power;
		BitmapNumber.ins().changeNum(this.totalPower, this._totalPower * SubRoles.ins().subRolesLen, "1");


		let list: AchievementData[] = [];
		for (let i: number = 0; i < config.achievementIds.length; i++) {
			list.push(UserTask.ins().getAchieveByTaskId(config.achievementIds[i]["taskId"]));
		}
		this.list.dataProvider = new eui.ArrayCollection(list);

		let nextConfig: KnighthoodConfig = GlobalConfig.KnighthoodConfig[lv + 1];
		if (nextConfig) {
			this.nextAttrTxt.text = AttributeData.getAttStr(nextConfig.attrs, 0, 1, "：");
			if (LiLian.ins().getNobilityIsUpGrade()) {
				this.mc = this.mc || new MovieClip;
				this.mc.x = 215;
				this.mc.y = 507;
				this.mc.playFile(RES_DIR_EFF + 'normalbtn', -1);
				this.addChild(this.mc);
			} else {
				if (this.mc) {
					DisplayUtils.removeFromParent(this.mc);
				}
			}
		} else {
			if (this.mc) {
				DisplayUtils.removeFromParent(this.mc);
			}
			this.nextGroup.visible = false;
			this.lvTxt.horizontalCenter = 0;
			this.attrTitleTxt.horizontalCenter = 0;
			this.attrTxt.horizontalCenter = 0;
			this.completely.visible = true;
		}
	}

	private playEff(): void {
		this.promoteeff.playFile(RES_DIR_EFF + "promoteeff", 1);
		this.addChild(this.promoteeff);
	}
}
