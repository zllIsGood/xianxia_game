/**
 * 野外boss界面
 */
class WildBossWin extends BaseEuiView {

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public challengeBtn: eui.Button;
	public thinkBtn: eui.Button;
	public bossName: eui.Label;
	public awardTxt: eui.Label;
	/** boss形象 */
	private bossImage: MovieClip;

	constructor() {
		super();
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "ZaoYuBossSkin";

		this.bossImage = new MovieClip;
		this.bossImage.scaleX = -1;
		// this.bossImage.scaleY = 0.8;
		this.bossImage.x = 250;
		this.bossImage.y = 430;
		this.addChildAt(this.bossImage, 6);
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.challengeBtn, this.onTap);
		this.addTouchEvent(this.thinkBtn, this.onTap);

		// let bossID: number = EntityManager.ins().willBoss.infoModel.configID;
		// let boss: MonstersConfig = GlobalConfig.MonstersConfig[bossID];
		// this.bossImage.playFile(RES_DIR_MONSTER + `monster${boss.avatar}_3s`, -1);
        //
		// this.bossName.text = `${boss.name} Lv.${boss.level}`;
		// let willBossConfig: FieldBossConfig = GlobalConfig.FieldBossConfig[Encounter.ins().willBossID];
		// this.awardTxt.text = willBossConfig.name;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.challengeBtn, this.onTap);
		this.removeTouchEvent(this.thinkBtn, this.onTap);
	}

	public static openCheck(): boolean {
		if (EntityManager.ins().getTeamCount(Team.WillBoss)) {
			UserTips.ins().showTips("正在挑战中");
			return false;
		}
		return true;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.challengeBtn:
				// if (EntityManager.ins().willBoss)
				// 	EntityManager.ins().willBoss.dispatchEventWith(egret.TouchEvent.TOUCH_BEGIN);
			case this.thinkBtn:
			case this.closeBtn0:
			case this.closeBtn:
				ViewManager.ins().close(WildBossWin);
				break;
		}
	}
}

ViewManager.ins().reg(WildBossWin, LayerManager.UI_Main);