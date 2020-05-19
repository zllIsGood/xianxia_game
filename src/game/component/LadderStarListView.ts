/**
 * 天梯 - 星星段位界面
 */
class LadderStarListView extends BaseComponent {

	public star1: LadderStarView;
	public star2: LadderStarView;
	public dwImg: eui.Image;
	public level: eui.Image;

	public len: number;
	public upSign: boolean;
	//特效
	private mc: MovieClip;
	private rankMc: MovieClip;
	public numRank: number;
	public numLevel: number;

	constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.skinName = "LadderSratListSkin";
		this.level.anchorOffsetX = 10;
		this.level.anchorOffsetY = 14;
		this.level.x = 100;
		this.level.y = 141;
	}

	/**
	 * 设置奖牌等级
	 */
	public setLvAndRank(info: TianTiDanConfig): void {

		if (info == undefined) {
			this.dwImg.source = "competition1_icon_0";
			this.level.source = null;
			return;
		}
		this.dwImg.source = "competition1_icon_" + info.level;

		if (info.level >= 4 || info.showDan <= 0 || info.showDan > 5) {
			this.level.source = null;
		} else {
			this.level.source = 'laddergradnum_' + info.showDan;
		}
	}

	/**
	 * 更新星星状态显示
	 */
	public updataStarInfo(info: TianTiDanConfig, change: boolean = true): void {
		if (info) {
			this.len = Ladder.ins().getStatuByLevel(info.level);
			for (let i: number = 1; i <= 5; i++) {
				this["star" + i].currentState = i > info.showStar ? "black" : "light";
			}
		} else {
			this.len = 0;
		}
		this.currentState = this.len + "";

		this.setLvAndRank(info);
	}

	/**
	 * 星星特效
	 */
	public upStarStatu(index: number, num: number, light: boolean = false): void {
		let times: number = num;
		let _index: number = light ? index : index - 1;
		let self = this;
		if (_index <= 0) {
			_index = 1;
		}
		if (this.mc == undefined) {
			this.mc = new MovieClip;
		}
		let item: LadderStarView = this["star" + _index];
		this.mc.x = item.x + 22;
		this.mc.y = item.y + 22;
		this.addChild(this.mc);
		let len = this.len;
		if (light) {
			--times;
			this.mc.playFile(RES_DIR_EFF + "addstar", 1, () => {
				if (self.getChildIndex(self.mc) != -1)
					self.removeChild(self.mc);
				item.currentState = "light";
				if (len == _index)
					item.currentState = "black";
				if (times > 0 && _index < this.len) {
					this.upStarStatu(++_index, times, light);
				}

			});//待后续改变
		} else {
			--times;
			--_index;
			this.mc.playFile(RES_DIR_EFF + "minusstar", 1, () => {
				if (self.getChildIndex(self.mc) != -1)
					self.removeChild(self.mc);
				item.currentState = "black";
				if (_index == 0) {
					let win: LadderResultWin = ViewManager.ins().getView(LadderResultWin) as LadderResultWin;
					if (win && win.isShow())
						win.cheackIsChangeLevel(times);
					this.upSign = false;
				}
			});
			times = 0;
		}
		if (light && _index == this.len) {
			let win: LadderResultWin = ViewManager.ins().getView(LadderResultWin) as LadderResultWin;
			if (win && win.isShow())
				win.cheackIsChangeLevel(times);
			this.upSign = true;
		}
	}

	/**
	 * 等级上升特效
	 * @param currentLv    等级
	 */
	public showLvUp(currentLv: number): void {
		this.numLevel = currentLv;
	}

	/**
	 * 奖牌上升特效
	 * @param currentRank    奖牌
	 */
	public showRankUp(currentRank: number): void {
		this.numRank = currentRank;
		this.rankMc = new MovieClip();
		this.rankMc.x = 100;
		this.rankMc.y = 99;
		this.rankMc.playFile(RES_DIR_EFF + "ladderlvup", 1, this.RankChangeCallback.bind(this));
		this.addChild(this.rankMc);
	}

	/**
	 * 等级下降特效
	 * @param currentLv    等级
	 */
	public showLvDown(currentLv: number): void {
		this.numLevel = currentLv;

		this.level.source = 'laddergradnum_' + this.numLevel;
	}

	/**
	 * 设置奖牌
	 */
	public RankChangeCallback(): void {
		this.dwImg.source = "competition1_icon_" + this.numRank;
		let tw: egret.Tween = egret.Tween.get(this.dwImg);
		this.dwImg.alpha = 0;
		tw.to({'alpha': 1}, 700);
	}
}