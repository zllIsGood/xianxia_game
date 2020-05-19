/**
 * 跨服boss 展示
 *
 */
class KFBossShowWin extends BaseEuiView {
	public bgClose: eui.Rect;
	public boss: eui.Group;
	public dropRewardList: eui.List;
	public challengeBtn: eui.Button;
	public bossName: eui.Image;


	private fbId: number;
	private bossMc: MovieClip;

	private dp: CrossBossConfig;

	public constructor() {
		super();
		this.skinName = `KFBossShowSkin`;
	}

	protected childrenCreated() {
		this.init();
	}

	public init() {
		
		this.boss.touchEnabled = false;
		this.boss.touchChildren = false;

		this.dropRewardList.itemRenderer = ItemBase;
	}

	open(...args): void {
		this.addTouchEvent(this.challengeBtn, this.onTouch);
		this.addTouchEvent(this.bgClose, this.onTouch);

		this.fbId = args[0];
		this.dp = GlobalConfig.CrossBossConfig[this.fbId];
		this.showAward();
		this.showBoss();
		this.bossName.source = `kf_name_${this.dp.bossId}`;
	}

	private showAward() {
		let rewardShow = this.dp.belongRewardshow;
		let awards = KFBossSys.ins().getBossShowAward(rewardShow);

		this.dropRewardList.dataProvider = new eui.ArrayCollection(awards);
	}

	private showBoss() {
		if (!this.bossMc) {
			this.bossMc = ObjectPool.pop("MovieClip");
			this.bossMc.scaleX = -1;
			this.bossMc.scaleY = 1;
			this.bossMc.x = 78;
			this.bossMc.y = 50;
			this.boss.addChild(this.bossMc);
		}


		let bossId = this.dp.bossId;
		let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[bossId];
		this.bossMc.playFile(RES_DIR_MONSTER + `monster${bossBaseConfig.avatar}_3s`, -1);
	}

	private onTouch(e: egret.TouchEvent) {
		switch (e.target) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.challengeBtn:
				if (!KfArenaSys.ins().checkIsMatching()) {
					return;
				}
				let cd = (KFBossSys.ins().enterCD - egret.getTimer()) / 1000 >> 0;
				if (cd > 0) {
					UserTips.ins().showTips(`|C:0xf3311e&T:${cd}秒后可以进入！`);
					return;
				}

				if (UserZs.ins().lv < this.dp.levelLimit[0] / 1000 || UserZs.ins().lv > this.dp.levelLimit[1] / 1000) {
					UserTips.ins().showTips(`|C:0xf3311e&T:需要转生等级到达${this.dp.levelLimit[0] / 1000 >> 0}转！`);
					return;
				}

				KFBossSys.ins().sendEnter(this.fbId);
				break;
		}
	}
}
ViewManager.ins().reg(KFBossShowWin, LayerManager.UI_Popup);