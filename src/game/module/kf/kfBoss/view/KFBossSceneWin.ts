/**
 * 跨服boss主界面UI
 *
 */
class KFBossSceneWin extends BaseEuiView {
	public nameTxt: eui.Label;
	public endGroup: eui.Group;
	public leftTime: eui.Label;
	public winnerName: eui.Label;
	public bossRefTimeLabel: eui.Label;

	private curInfo: KFBossInfoData;

	public constructor() {
		super();
		this.skinName = `kfBossSceneSkin`;

	}

	public open(...args): void {
		this.observe(KFBossSys.ins().postBroadcastResult, this.bossEnd);
		this.observe(GameLogic.ins().postRemoveEntity, this.onRemove);

		this.endGroup.visible = false;
		let curFbId: number = GameMap.fubenID;
		for (let key in GlobalConfig.CrossBossConfig) {
			if (curFbId == GlobalConfig.CrossBossConfig[key].fbid) {
				let dp: CrossBossConfig = GlobalConfig.CrossBossConfig[key];
				let info = KFBossSys.ins().fbInfo[dp.id];
				this.nameTxt.text = dp.sceneName == `跨服战场` ? `S.${info.serverId}跨服战场` : `仙月岛`;
				this.curInfo = KFBossSys.ins().fbInfo[dp.id];
				break;
			}
		}
		this.checkBossRelive();

	}

	public close(...args): void {
		TimerManager.ins().removeAll(this);
		egret.Tween.removeTweens(this.endGroup);
	}

	private onRemove([handle, entity]): void {
		let mode = entity.infoModel;
		mode.configID = 45
		//boss死亡,则添加死亡倒计时
		if (entity instanceof CharRole || !GlobalConfig.MonstersConfig[mode.configID] || GlobalConfig.MonstersConfig[mode.configID].type != MonsterType.Boss)return;


		this.curInfo.bossRefTimer = GlobalConfig.CrossBossConfig[this.curInfo.dpId].refreshTime * 1000 + egret.getTimer();
		this.checkBossRelive();
	}

	private checkBossRelive(): void {
		if (!this.curInfo)return;
		let reTime: number = (this.curInfo.bossRefTimer - egret.getTimer()) / 1000 >> 0;
		TimerManager.ins().doTimer(1000, reTime + 2, this.onBossRelive, this);
		this.onBossRelive();
	}

	/**复活计时处理*/
	private onBossRelive(): void {
		if (!this.curInfo)return;

		let t: number = (this.curInfo.bossRefTimer - egret.getTimer()) / 1000 >> 0;
		if (t > 0) {
			this.bossRefTimeLabel.text = `boss复活：${DateUtils.getFormatBySecond(t, DateUtils.TIME_FORMAT_3)}`;
			this.nameTxt.y = 8;
		}
		else {
			TimerManager.ins().remove(this.onBossRelive, this);
			this.bossRefTimeLabel.text = "";
			this.nameTxt.y = 18;
		}

	}

	private bossEnd(winner: string): void {
		if (GameMap.fbType == UserFb.FB_TYPE_KF_BOSS) {
			this.endGroup.visible = true;
			this.endGroup.alpha = 1;
			this.winnerName.text = `最终归属者是：${winner}`;

			TimerManager.ins().doTimer(10000, 1, () => {
				egret.Tween.get(this.endGroup).to({"alpha": 0}, 300).call(() => {
					this.endGroup.visible = false;
				});
			}, this);
		}
	}
}

ViewManager.ins().reg(KFBossSceneWin, LayerManager.UI_Main);