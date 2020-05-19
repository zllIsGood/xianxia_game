/**
 * Created by MPeter on 2018/1/18.
 * 跨服战场-跨服战场列表
 */
class KffieldPanel extends BaseView {
	/** 跨服boss*/
	public island0: BaseComponent;
	/** 跨服竞技场*/
	public island1: BaseComponent;
	/** 未知*/
	public island2: BaseComponent;
	/** 魔界入侵*/
	public island3: BaseComponent;

	private kfBossMc: MovieClip;

	public constructor() {
		super();
	}

	public open(): void {
		this.addTouchEvent(this, this.onTouch);
		this.observe(KFBattleRedPoint.ins().postRedPoint, this.refRedPoint);
		this.observe(DevildomRedPoint.ins().postRedPoint, this.refRedPoint);
		this.observe(KfArenaRedPoint.ins().postRedPoint, this.refRedPoint);

		this.initData();
		this.refRedPoint();
	}

	public close(): void {
		this.$onClose();
		DisplayUtils.removeFromParent(this.kfBossMc);
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.island0://跨服boss
				ViewManager.ins().open(KFBossWin);
				break;
			case this.island1://跨服竞技场
				ViewManager.ins().open(KfArenaWin);
				break;
			case this.island2:
				break;
			case this.island3://魔界入侵
				ViewManager.ins().open(DevildomWin, DevildomBossModel.ins().getCurFbIndex());
				break;
		}
	}

	private initData(): void {
		//跨服boss
		this.island0.currentState = `unlock`;
		this.island0[`title`].source = `kf_function_boss`;
		this.island0[`island`].source = ``;


		//魔界入侵
		this.island3.currentState = `unlock`;
		egret.callLater(() => {
			this.island3[`title`].source = `kf_function_invasion`;
			this.island3[`island`].source = `kf_field_invasion`;
		}, this);


		//特定怪物形象
		if (!this.kfBossMc) {
			this.kfBossMc = new MovieClip();
			this.kfBossMc.scaleX = this.kfBossMc.scaleY = .45;
			this.kfBossMc.x = 0;
			this.kfBossMc.y = 35;

		}

		this.island0[`boossGroup`].addChild(this.kfBossMc);

		let showBody: string = GlobalConfig.CrossBossBase.showBoss ? GlobalConfig.CrossBossBase.showBoss : `monster10041_3s`;
		this.kfBossMc.playFile(RES_DIR_MONSTER + showBody, -1);

		//跨服竞技场
		egret.callLater(() => {
			this.island1[`title`].source = `kf_function_ladder`;
			this.island1[`island`].source = `kf_field_ladder`;
		}, this);
		this.island1.currentState = `unlock`;


		//未开
		this.island2.currentState = `lock`;
	}

	private refRedPoint(): void {
		this.island0[`redPoint`].visible = KFBattleRedPoint.ins().redPoint2 > 0;
		this.island1[`redPoint`].visible = KfArenaRedPoint.ins().redpoint > 0;
		this.island3[`redPoint`].visible = DevildomRedPoint.ins().redPoint > 0;
	}
}