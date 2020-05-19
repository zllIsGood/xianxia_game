/**
 * 天梯 - 结算界面（胜利）
 */
class LadderResultWin extends BaseEuiView {

	public container: eui.Group;
	public bg: eui.Image;
	public sureBtn: eui.Button;
	public list: eui.List;
	public result: eui.Image;
	/** 星星段位界面 */
	public starList: LadderStarListView;
	public upStar: eui.Group;
	public star1: LadderStarView;
	public star2: LadderStarView;

	/** 倒计时剩余秒 */
	private s: number;
	public listData: eui.ArrayCollection;
	/** 是否胜利 */
	private isWin: boolean;

	private upLevel: number;
	private upId: number;

	private mc: MovieClip;

	private lastlevel: number;
	private lastRank: number;

	constructor() {
		super();
		this.skinName = "ladderresultwinskin";
	}

	public initUI(): void {
		super.initUI();
		this.listData = new eui.ArrayCollection();

		this.mc = new MovieClip;
		this.mc.scaleX = this.mc.scaleY = 1.2;
		this.starList.addChildAt(this.mc, 0);
	}

	/**
	 * @param param
	 */
	public open(...param: any[]): void {
		super.open(param);

		//是否胜利
		this.isWin = param[0];
		//奖励数据列表
		let list: RewardData[] = param[1];
		//之前的level
		let upLevel: number = param[2];
		//之前的id
		let upId: number = param[3];
		//加了多少星
		let upStar: number = param[4];

		this.bg.source = this.isWin ? "win_jpg" : "lost_jpg";
		this.result.source = this.isWin ? "win_02" : "lost_02";
		this.sureBtn.name = this.isWin ? `领取奖励` : `退出`;

		//设置倒计时5秒关闭界面
		this.s = 5;
		this.updateCloseBtnLabel();
		TimerManager.ins().doTimer(1000, 5, this.updateCloseBtnLabel, this);

		//设置奖励列表数据
		this.listData.source = list;
		this.list.dataProvider = this.listData;

		//设置奖牌星星
		this.refushStarInfo(upLevel, upId, upStar);

		this.addTouchEvent(this.sureBtn, this.onTap);

		this.playEffect();
	}

	/**
	 * 提升后的回调
	 */
	private playEffect(): void {
		if( !this.isWin )
			return;//胜利才播
		//待后续改变
		this.mc.playFile(RES_DIR_EFF + "laddercircle", -1);
		this.mc.x = this.starList.width >> 1;
		this.mc.y = this.starList.height >> 1;
	}

	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);
		this.removeTouchEvent(this.sureBtn, this.onTap);
		egret.Tween.removeTweens(this.starList);
		DisplayUtils.removeFromParent(this.mc);
		if (GameMap.fubenID > 0) {
			UserFb.ins().sendExitFb();
			ViewManager.ins().open(LadderWin, 1);
		}
	}

	/**
	 * 更新界面
	 * @param level        等级
	 * @param id        id
	 * @param starNum    加了多少星
	 */
    private refushStarInfo(level: number, id: number, starNum: number): void {
        let info: TianTiDanConfig = Ladder.ins().getLevelConfig(level, id);
        this.upLevel = level;
        this.upId = id;
        //更新段位星星
        this.starList.updataStarInfo(info);
        this.lastlevel = info.showDan;
        this.lastRank = info.level;

        //设置星级奖励显示
        this.star1.visible = false;
        this.star2.visible = false;
        for (let i: number = 0; i < starNum; i++) {
            this["star" + (i + 1)].visible = true;
            this["star" + (i + 1)].currentState = this.isWin ? "light" : "black";
        }
        //星级奖励：???
        this.upStar.visible = Ladder.ins().getLevelConfig().showDan > 0;

        //延迟0.5秒播放星星改变动画
        if (starNum > 0) {
            let self = this;
            let playFun: Function = function () {
                TimerManager.ins().remove(playFun, self);
                self.setStarInfoChange(info.showStar, starNum);
            }
            TimerManager.ins().doTimer(500, 1, playFun, self);
        }
    }

	/**
	 * 星星数量改变
	 * @param index    当前数量
	 * @param num    增加数量
	 */
	private setStarInfoChange(index: number, num: number): void {
		if (num > 0) {
			this.starList.upStarStatu(index + 1, num, this.isWin);
		}
	}

	public cheackIsChangeLevel(num: number): void {

		if (this.upLevel == Ladder.ins().level && this.upId == Ladder.ins().nowId) {
			return;
		}
		let t: egret.Tween = egret.Tween.get(this.starList);

		t.to({"alpha": 1}, 300).call(() => {

			if (this.isWin) {
				if (num >= 1) {
					this.starList.upStarStatu(1, num, this.isWin);
				}
			}
			let info: any = Ladder.ins().getLevelConfig();
			let currentLevel = info.showDan;
			let currentRank = info.level;
			if (this.lastRank < currentRank) {
				this.starList.showRankUp(currentRank);
				this.starList.showLvUp(currentLevel);
			} else {
				if (this.lastlevel < currentLevel) {
					this.starList.showLvDown(currentLevel);
				} else if (this.lastlevel > currentLevel) {
					this.starList.showLvUp(currentLevel);
				}
			}
			this.starList.updataStarInfo(info, false);
			egret.Tween.removeTweens(this.starList);
		}, this);
	}

	/**
	 * 触摸事件
	 */
	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.sureBtn://关闭按钮
				ViewManager.ins().close(this);
				break;
		}
	}

	/**
	 * 倒计时关闭界面
	 */
	private updateCloseBtnLabel(): void {
		this.s--;
		if (this.s <= 0)
			ViewManager.ins().close(this);
		this.sureBtn.label = `${this.sureBtn.name}(${this.s}s)`;
	}
}
ViewManager.ins().reg(LadderResultWin, LayerManager.UI_Popup);