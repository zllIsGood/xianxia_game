/**
 * 符文窗体
 */
class RunePanel extends BaseView {
	public Rune: eui.Group;
	public Runeitem: eui.Group;
	public runeBook: eui.Image;
	public rune0: RuneDisplay;
	public rune1: RuneDisplay;
	public rune2: RuneDisplay;
	public rune3: RuneDisplay;
	public rune4: RuneDisplay;
	public rune5: RuneDisplay;
	public rune6: RuneDisplay;
	public rune7: RuneDisplay;
	public levelsay: eui.Label;
	public up: eui.Group;
	public replace: eui.Button;
	public uplevel: eui.Button;
	private jumpTresureRuneBtn: eui.Button;
	public rune8: RuneDisplay;

	public addAttr: eui.Label;
	public cost: eui.Label;
	public attrDesc: eui.Label;
	public costImg: eui.Image;

	public upRed: eui.Image;
	public redPointReplace: eui.Image;
	public arrow: eui.Image;
	private bookBtn: BaseComponent;


	/**符文显示体链表 */
	private runeList: RuneDisplay[] = null;
	/**角色索引 */
	public curRole: number = 0;
	/**符文选择索引 */
	private selectedIndex: number = 0;
	/**升级碎片差值 */
	private upgradeDifference: number = 0;
	//选中的数据
	private selectItem: ItemData = null;
	//开启的槽位个数
	private openNum: number = 0;
	//已镶嵌的印记类型
	private runeTypeList: number[];

	// private powerGroup: eui.Group;

	public powerPanel: PowerPanel;

	private nuneName: eui.Label;
	public noOpenTF: eui.Label;

	constructor() {
		super();
		// this.skinName = "RuneSkinUp";
	}

	protected childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.initRunes();
		this.addTouchEvent(this.noOpenTF, () => {
			ViewManager.ins().open(FbWin, 2);
		});
	}

	// /**
	//  * 初始化符文显示体
	//  * @returns void
	//  */
	private initRunes(): void {
		this.runeList = [];
		let len: number = 8;
		let rd: RuneDisplay = null;
		for (let i: number = 0; i < len; i++) {
			rd = this["rune" + i] as RuneDisplay;
			if (rd) {
				this.runeList.push(rd);
			}
		}
	}

	// public open(...param: any[]): void {

	// }

	public open(...param: any[]): void {
		let len: number = this.runeList.length;

		//选择索引
		this.selectedIndex = isNaN(param[1]) ? this.selectedIndex : param[1];
		if (this.selectedIndex < 0) this.selectedIndex = 0;
		if (this.selectedIndex >= len) this.selectedIndex = len - 1;

		//侦听其他
		this.addTouchEvent(this.replace, this.onTap);
		this.addTouchEvent(this.uplevel, this.onTap);
		this.addTouchEvent(this.runeBook, this.onTap);
		this.addTouchEvent(this.bookBtn, this.onTap);
		this.addTouchEvent(this.btn1, this.onTap);
		this.addTouchEvent(this.btn2, this.onTap);
		this.addTouchEndEvent(this.jumpTresureRuneBtn, this.onClick);

		this.observe(Rune.ins().postInlayResult, this.onInlayResult);
		this.observe(Rune.ins().postUpgradeResult, this.onUpgradeResult);
		//转生侦听
		this.observe(UserZs.ins().postZsData, this.onLevelUp);
		//等级侦听
		this.observe(Actor.ins().postPowerChange, this.onLevelUp);
		//碎片变化
		this.observe(GameLogic.ins().postRuneShatter, this.onShatterChange);
		//道具添加
		this.observe(UserBag.ins().postItemAdd, this.onItemChange);
		//道具删除
		this.observe(UserBag.ins().postItemDel, this.onItemChange);
		//道具变更
		this.observe(UserBag.ins().postItemChange, this.onItemChange);


		//更新符文
		this.updateRunes(true);
		//侦听符文
		for (let i: number = 0; i < len; i++) {
			let runeDisplay: RuneDisplay = this.runeList[i];
			this.addTouchEvent(runeDisplay, this.onRuneTap);
			if (runeDisplay && runeDisplay.currentState == RuneDisplay.SKIN_STATE_UNLOCK) {
				if (this["linebg" + i])
					this["linebg" + i].source = "rune_bar";
			} else {
				if (this["linebg" + i])
					this["linebg" + i].source = "rune_bar_bg";
			}
		}

		//更新符文细节
		this.updateRuneDetail();
		//更新符文选中效果
		this.updateSelectedEffect();
		//更新红点
		this.showRuneRedPoint();

		//下一个槽位的开启限制
		this.setNextOpenInfo();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.replace, this.onTap);
		this.removeTouchEvent(this.uplevel, this.onTap);
		this.removeTouchEvent(this.runeBook, this.onTap);
		this.removeTouchEvent(this.bookBtn, this.onTap);
		this.removeTouchEvent(this.btn1, this.onTap);
		this.removeTouchEvent(this.btn2, this.onTap);
		this.removeTouchEvent(this.jumpTresureRuneBtn, this.onClick);
		this.removeObserve();

		let runeDisplay: RuneDisplay = null;
		let len = this.runeList.length;
		for (let i: number = 0; i < len; i++) {
			runeDisplay = this.runeList[i];
			runeDisplay.close();
		}
	}

	private setNextOpenInfo(): void {
		let rlpc: RuneLockPosConfig = RuneConfigMgr.ins().getLockCfg(this.openNum);
		if (rlpc)
			this.levelsay.text = `通过第${rlpc.lockLv}关开启下一凹槽`;
		else
			this.levelsay.text = "";
	}

	/**
	 * 等级提升处理（普通等级和转生等级）
	 * @returns void
	 */
	private onLevelUp(): void {
		this.updateRunes();
		this.updateRuneDetail();

		//更新红点
		this.showRuneRedPoint();
		this.showReplaceRedPoint();
	}

	/**
	 * 处理升级结果
	 * @param  {any[]} param
	 * @returns void
	 */
	private onUpgradeResult(param: any[]): void {
		if (param[0]) {
			UserTips.ins().showTips(`升级符文成功`);
			let roleIndex: number = param[1];
			this.curRole = roleIndex;
			this.updateRunes();
			this.updateRuneDetail();

			//更新红点
			this.showRuneRedPoint();
			this.showReplaceRedPoint();
		}
		else {
			UserTips.ins().showTips(`升级符文失败，请稍后再试`);
		}
	}

	/**
	 * 处理镶嵌结果
	 * @param  {any[]} param
	 * @returns void
	 */
	private onInlayResult(param: any[]): void {
		//替换符文
		if (param[0]) {
			UserTips.ins().showTips(`镶嵌符文成功`);
			let roleIndex: number = param[1];
			let posIndex: number = param[2];
			let id: number = param[3];
			RuneDataMgr.ins().replaceRune(roleIndex, posIndex, id);
			this.curRole = roleIndex;
			this.updateRunes();
			this.updateRuneDetail();

			//更新红点
			this.showRuneRedPoint();
			this.showReplaceRedPoint();
		}
		else {
			UserTips.ins().showTips(`镶嵌符文失败，请稍后重试`);
		}
	}

	/**
	 * 碎片变化
	 * @returns void
	 */
	private onShatterChange(): void {
		this.updateRuneDetail();

		//更新红点
		this.showRuneRedPoint();
	}

	/**
	 * 道具变化
	 * @returns void
	 */
	private onItemChange(): void {
		//更新红点
		this.showRuneRedPoint();
		this.showReplaceRedPoint();
	}

	/**
	 * 点击处理
	 * @param  {egret.TouchEvent} e
	 * @returns void
	 */
	private onTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget) {
			switch (e.currentTarget) {
				case this.replace:
					this.showReplaceWin();
					break;
				case this.uplevel:
					this.upgradeRune();
					break;
				case this.runeBook:
					ViewManager.ins().open(RuneAttrWin, this.curRole);
					break;
				case this.bookBtn:
					ViewManager.ins().open(RuneBookWin);
					break;
				case this.btn1:
					// ViewManager.ins().close(RuneWin);
					ViewManager.ins().open(TreasureHuntWin, 1);
					break;
				case this.btn2:
					// ViewManager.ins().close(RuneWin);
					ViewManager.ins().open(FbWin, 2);
					break;
			}
		}
	}

	/**
	 * 升级符文
	 * @returns void
	 */
	private upgradeRune(): void {
		let rd: RuneDisplay = this.getRuneDisplay(this.selectedIndex);
		if (rd) {
			switch (rd.currentState) {
				case RuneDisplay.SKIN_STATE_LOCK:
				case RuneDisplay.SKIN_STATE_READY:
					UserTips.ins().showTips(`请先解锁`);
					break;
				case RuneDisplay.SKIN_STATE_UNLOCK:
					let ic: ItemConfig = this.getCurIC();
					if (ic) {
						let next: ItemConfig = GlobalConfig.ItemConfig[ic.id + 1];
						if (!next) {
							UserTips.ins().showTips(`符文等级已满无法进行升级`);
						} else {
							if (this.upgradeDifference <= 0) {
								Rune.ins().sendUpgrade(this.curRole, this.selectedIndex);
							} else {
								UserTips.ins().showTips(`符文精华不足，分解符文可获得符文精华`);
							}
						}
					} else {
						UserTips.ins().showTips(`请先镶嵌一个符文`);
					}
					break;
			}
		}
	}

	private onClick(e: egret.TouchEvent) {
		//跳转寻宝符文页签
		let openlevel: number = GlobalConfig.FuwenTreasureConfig.openlevel;
		if (Actor.level < openlevel) {
			UserTips.ins().showTips(`${openlevel}级开启`);
			e.$cancelable = true;
			e.preventDefault();
			return;
		} else {
			ViewManager.ins().open(TreasureHuntWin,1);
		}
	}

	/**
	 * 显示替换窗体
	 * @returns void
	 */
	private showReplaceWin(): void {
		let rd: RuneDisplay = this.getRuneDisplay(this.selectedIndex);
		if (rd) {
			switch (rd.currentState) {
				case RuneDisplay.SKIN_STATE_LOCK:
				case RuneDisplay.SKIN_STATE_READY:
					UserTips.ins().showTips(`请先解锁`);
					break;
				case RuneDisplay.SKIN_STATE_UNLOCK:
					ViewManager.ins().open(RuneReplaceWin, this.selectedIndex, this.curRole, rd.data, this.runeTypeList);
					break;
			}
		}
	}

	/**
	 * 处理符文点击
	 * @param  {egret.TouchEvent}
	 * @returns void
	 */
	private onRuneTap(e: egret.TouchEvent): void {
		if (e && e.currentTarget) {
			let rd: RuneDisplay = e.currentTarget as RuneDisplay;
			this.selectedIndex = rd.pos;

			this.updateRuneDetail();
			this.updateSelectedEffect();

			//更新替换红点
			this.showReplaceRedPoint();

			this.noOpenTF.textFlow = TextFlowMaker.generateTextFlow1(rd.lockStr);

			//直接打开替换判断
			if (rd.currentState == RuneDisplay.SKIN_STATE_UNLOCK) {
				let runeData: ItemData = RuneDataMgr.ins().getRune(this.curRole, this.selectedIndex);
				if (runeData && runeData.configID <= 0) {
					ViewManager.ins().open(RuneReplaceWin, this.selectedIndex, this.curRole, rd.data, this.runeTypeList);
				}
			}
		}
	}

	/**
	 * 更新选中特效
	 * @returns void
	 */
	private updateSelectedEffect(): void {
		if (this.runeList) {
			for (let v of this.runeList) {
				if (v) {
					v.showOrHideSelected(v.pos == this.selectedIndex);
				}
			}
		}
	}
	/**
	 * 符文链接跳转(无需判断红点)
	 * */
	private linkGroup: eui.Group;
	private btn1: eui.Button;
	private btn2: eui.Button;
	private showLink() {
		this.linkGroup.visible = false;
		let rdList: ItemData[] = RuneDataMgr.ins().getRoleRune(this.curRole);
		if (!rdList) return;
		let isShow = true;
		let cfg: RuneBaseConfig;
		let len: number = this.runeList.length;
		for (let i: number = 0; i < len; i++) {
			let rd: ItemData = rdList[i];
			cfg = RuneConfigMgr.ins().getBaseCfg(rd);
			if (cfg) {
				isShow = false;//有符文不显示
				break;
			}
		}
		this.linkGroup.visible = isShow;

	}
	/**
	 * 更新符文
	 * @returns void
	 */
	private updateRunes(init?: boolean): void {
		let rdList: ItemData[] = RuneDataMgr.ins().getRoleRune(this.curRole);
		if (!rdList) return;


		this.openNum = 0;
		this.runeTypeList = [];
		let lockNum = 0;
		let rd: ItemData = null;
		let cfg: RuneBaseConfig = null;
		let rDisplay: RuneDisplay = null;
		let len: number = this.runeList.length;
		let attrPoint: number = 0;
		this.runeBook.visible = false;
		for (let i: number = 0; i < len; i++) {
			rd = rdList[i];
			cfg = RuneConfigMgr.ins().getBaseCfg(rd);
			if (cfg)
				attrPoint += UserBag.getAttrPower(cfg.attr) + (cfg.power || 0);
			rDisplay = this.runeList[i];

			if (rd.configID && rd.itemConfig) {
				this.runeTypeList.push(ItemConfig.getSubType(rd.itemConfig));
			}
			if (rDisplay) {
				rDisplay.setPos(i);
				if (rd && rd.itemConfig && rd.itemConfig.id > 0) {
					rDisplay.setData(rd);
					this.runeBook.visible = true;
				} else {
					rDisplay.cleanData();
				}
				if (rDisplay.currentState == RuneDisplay.SKIN_STATE_UNLOCK)
					this.openNum += 1;
				if (rDisplay.currentState == RuneDisplay.SKIN_STATE_LOCK) {
					lockNum += 1;
					if (lockNum == 1)
						rDisplay.setLockTF(true);
					else
						rDisplay.setLockTF(false);
				} else {
					rDisplay.setLockTF(false);
				}
			}
		}
		this.powerPanel.setPower(attrPoint);
		//根据规则设定默认索引
		if (init)
			this.setSelectedIndexRule(this.curRole);
		//相关按钮链接
		this.showLink();
	}

	/**
	 * 更新符文细节
	 * @returns void
	 */
	private updateRuneDetail(): void {
		let rd: ItemData = RuneDataMgr.ins().getRune(this.curRole, this.selectedIndex);
		this.selectItem = rd;
		if (rd && rd.configID > 0) {
			/////////////////////有符文数据，即镶嵌了的
			this.rune8.showName(false);
			this.rune8.setData(rd);
			let itemCfg: ItemConfig = GlobalConfig.ItemConfig[rd.itemConfig.id];
			let nameCfg: RuneNameConfig = GlobalConfig.RuneNameConfig[ItemConfig.getSubType(itemCfg)];
			this.nuneName.textFlow = TextFlowMaker.generateTextFlow(`|C:${ItemConfig.getQualityColor(itemCfg)}&T:${nameCfg.runeName}Lv.${itemCfg.id % 100}`);

			let rbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(rd);
			let ic: ItemConfig = this.getCurIC();
			if (!ic || !rbc) return;
			this.up.visible = true;
			this.showReplaceRedPoint();
			// let isMaxQuality: boolean = ic.quality >= RuneConfigMgr.ins().getOtherCfg().maxQuality;
			let nextRBC: RuneBaseConfig = null;
			nextRBC = RuneConfigMgr.ins().getBaseCfg(rd, true);
			if (nextRBC) {
				this.attrDesc.text = RuneConfigMgr.ins().getcfgAttrDesc(nextRBC);
				this.setCost(rbc);
				this.costImg.visible = true;
				this.cost.x = 328;
				this.arrow.visible = true;
			} else {
				this.attrDesc.text = "";
				this.costImg.visible = false;
				this.arrow.visible = false;
				this.cost.textFlow = TextFlowMaker.generateTextFlow(`|C:0xf3311e&T:等级已满|`);
				this.cost.x = 310;
			}
			this.addAttr.text = RuneConfigMgr.ins().getcfgAttrDesc(rbc);
		} else {
			this.up.visible = false;
		}
	}

	/**
	 * 设置消耗
	 * @param  {RuneBaseConfig} cfg
	 * @returns void
	 */
	private setCost(cfg: RuneBaseConfig): void {
		if (!cfg) return;
		let needNum: number = cfg.expend;
		let curNum: number = Actor.runeShatter;
		this.upgradeDifference = needNum - curNum;
		if (this.upgradeDifference < 0) this.upgradeDifference = 0;

		let colorStr: string = "";
		if (curNum >= needNum)
			colorStr = ColorUtil.GREEN_COLOR;
		else
			colorStr = ColorUtil.RED_COLOR;

		this.cost.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${curNum}</font><font color=${ColorUtil.WHITE_COLOR}>/${needNum}</font> `);
	}

	/**
	 * 获取符文显示体
	 * @param  {number} pos
	 * @returns RuneDisplay
	 */
	private getRuneDisplay(pos: number): RuneDisplay {
		if (this.runeList) {
			return this.runeList[pos];
		}
		return null;
	}

	/**
	 * 获取当前选择的符文的物品配置
	 * @returns ItemConfig
	 */
	private getCurIC(): ItemConfig {
		let rd: ItemData = RuneDataMgr.ins().getRune(this.curRole, this.selectedIndex);
		if (rd && rd.configID > 0) {
			let itemCfg: ItemConfig = GlobalConfig.ItemConfig[rd.configID];
			if (!this.assert(itemCfg, "ItemConfig(" + rd.configID + ")")) {
				return itemCfg;
			}
		}
		return null;
	}

	/**
	 * 显示符文红点
	 * @returns void
	 */
	private showRuneRedPoint(): void {
		let isShow: boolean = false;
		let rd: ItemData = null;
		for (let v of this.runeList) {
			if (v) {
				isShow = RuneRedPointMgr.ins().checkSingleInlay(this.curRole, v.pos);
				if (!isShow) {
					rd = v.data as ItemData;
					if (rd && rd instanceof ItemData && rd.configID > 0) {
						isShow = RuneRedPointMgr.ins().checkSingleUpgrade(rd);
						if (!isShow) isShow = RuneRedPointMgr.ins().checkSingleReplace(this.curRole, rd);
					}
				}
				v.redPoint.visible = isShow;
			}
		}
	}

	/**
	 * 显示替换红点
	 * @returns void
	 */
	private showReplaceRedPoint(): void {
		let rd: ItemData = RuneDataMgr.ins().getRune(this.curRole, this.selectedIndex);
		if (rd && rd.configID > 0) {
			this.redPointReplace.visible = RuneRedPointMgr.ins().checkSingleReplace(this.curRole, rd);
			if (this.upRed) {//这个变量皮肤里边不存在
				this.upRed.visible = RuneRedPointMgr.ins().checkSingleUpgrade(rd);
			}
		} else {
			this.redPointReplace.visible = false;
			if (this.upRed) {//这个变量皮肤里边不存在
				this.upRed.visible = false;
			}
		}
	}
	/**
	 *  默认打开符文显示规则
	 *  @returns selectedIndex
	 * */
	private setSelectedIndexRule(roleId: number): void {
		let minItem: ItemData = RuneDataMgr.ins().getMinRune(roleId, true);
		if (!minItem) return;
		for (let i: number = 0; i < this.runeList.length; i++) {
			if (this.runeList[i].getItemConfig() && this.runeList[i].getItemConfig().id == minItem.configID) {
				this.selectedIndex = this.runeList[i].pos;
				break;
			}
		}
	}

	/**
	 * 断言
	 * @param  {any} value
	 * @param  {string} msg
	 * @returns boolean
	 */
	private assert(value: any, msg: string): boolean {
		return Assert(value, "[" + egret.getQualifiedClassName(RunePanel) + "] " + msg + "is null!");
	}
}
// ViewManager.ins().reg(RunePanel, LayerManager.UI_Main);
