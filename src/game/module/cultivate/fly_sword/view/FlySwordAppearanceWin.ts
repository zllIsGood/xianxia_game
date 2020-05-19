/**
 * 飞剑幻化形象窗口
 */
class FlySwordAppearanceWin extends BaseEuiView {
	public roleSelect: RoleSelectPanel;
	public closeBtn: eui.Button;
	public appearanceImage: eui.Image;
	public powerPanel: PowerPanel;
	public leftBtn: eui.Button;
	public rightBtn: eui.Button;
	public itemScroller: eui.Scroller;
	public itemList: eui.List;
	public attrPanel: AttrTwoColumnsPanel;
	public conditionGroup: eui.Group;
	public conditionLabel: eui.Label;
	public levelGroup: eui.Group;
	public nameImage: eui.Image;
	public stairImg: LevelImage;
	public timeLabel: eui.Label;
	public needLabel: eui.Label;
	public activation: eui.Button;
	public activationImage: eui.Image;

	private notAppearanceButtonName: string = `幻 化`;
	private activationButtonName: string = `激 活`;
	private appearanceButtonName: string = `卸下`;

	public constructor() {
		super();
		this.skinName = `FlySwordAppearanceSkin`;
		this.isTopLevel = true;
		this.setSkinPart(`attrPanel`, new AttrTwoColumnsPanel);
	}

	public initUI(): void {
		super.initUI();
		this.touchEnabled = false;
	}

	public initData(): void {
		this.itemList.useVirtualLayout = false;
		this.itemList.itemRenderer = FlySwordAppearanceItemRenderer;
	}

	public open(...param: any[]): void {
		this.roleSelect.setCurRole(param[0] != undefined ? param[0] : 0);
		this.itemList.dataProvider = FlySword.ins().getAppearanceModel(this.getRoleId()).dataCollection;
		this.initEvents();
		this.initObserve();
		this.onScroller();
		this.updateRedPoint();
	}

	protected initEvents(): void {
		this.once(egret.Event.RENDER, this.onRender, this);
		this.addTouchEvent(this.closeBtn, this.onTapBtn);
		this.addTouchEvent(this.leftBtn, this.onTapBtn);
		this.addTouchEvent(this.rightBtn, this.onTapBtn);
		this.addTouchEvent(this.activation, this.onTapBtn);
		this.addChangeEvent(this.itemScroller, this.onScroller);
		this.addChangeEvent(this.itemList, this.onChangeList);
		this.addChangeEvent(this.roleSelect, this.onRoleSelect);
	}

	protected initObserve(): void {
		this.observe(GameLogic.ins().postChildRole, this.updateView);
		this.observe(FlySword.ins().postActivation, this.onActivion);
		this.observe(FlySword.ins().postChangeAppearance, this.onActivion);
		this.observe(FlySwordRedPoint.ins().postTotalRedPoint, this.updateRedPoint);
		this.observe(FlySwordRedPoint.ins().postAppearanceRedPoint, this.updateRedPoint);
	}

	private onRender(): void {
		let selectedIndex: number = Math.max(FlySword.ins().getAppearanceModel(this.getRoleId()).getCurrAppearanceIndex(), 0);
		this.onActivion(selectedIndex);
	}

	private onRoleSelect(): void {
		this.itemScroller.stopAnimation();
		this.itemList.dataProvider = FlySword.ins().getAppearanceModel(this.getRoleId()).dataCollection;
		TimerManager.ins().doTimer(50, 1, this.onRender, this);
	}

	private onScroller(): void {
		let scrollerH = this.itemScroller.viewport.scrollH;
		let width = this.itemScroller.width;
		this.leftBtn.visible = scrollerH > 0;
		this.rightBtn.visible = scrollerH + width < this.itemScroller.viewport.contentWidth;
	}

	private onTapBtn(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.leftBtn:
				this.itemScroller.viewport.scrollH -= this.itemScroller.width;
				this.updateScroller();
				break;
			case this.rightBtn:
				this.itemScroller.viewport.scrollH += this.itemScroller.width;
				this.updateScroller();
				break;
			case this.activation:
				let data: FlySwordAppearanceData = this.getCurrSelectData();
				if (!data)
					return;
				if (data.getIsAppearance())
					FlySword.ins().sendChangeAppearance(this.getRoleId(), data.id, FlySwordAppearanceType.Unload);
				else if (data.getIsActivation())
					FlySword.ins().sendChangeAppearance(this.getRoleId(), data.id, FlySwordAppearanceType.Equip);
				else
					FlySword.ins().sendActivation(this.getRoleId(), data.id);
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}

	private onChangeList(e: eui.ItemTapEvent): void {
		this.updateView();
	}

	private onActivion(index: number = 0): void {
		if (index != -1)
			this.itemList.selectedIndex = index;
		let gap: number = (this.itemList.layout as eui.LinearLayoutBase).gap;
		let width: number = this.itemList.getVirtualElementAt(this.itemList.selectedIndex).width;

		this.itemScroller.viewport.scrollH = (width + gap) * index;
		this.updateScroller();
		this.updateView();
	}

	private onChangeData(index: number = 0): void {
		if (index != -1)
			this.itemList.selectedIndex = index;
		this.updateView();
	}

	private updateView(): void {
		let data: FlySwordAppearanceData = this.getCurrSelectData();
		if (!data)
			return;
		let isActivation: boolean = data.getIsActivation();
		let config: ICultivateTypeConfig = data.getConfig();

		if (isActivation) {
			this.startTimeLeft();
		}
		else {
			let costStr: string = ``;
			let costColor: number = data.getCanActivation() ? ColorUtil.GREEN : ColorUtil.RED;
			let conditionStr: string = ``;
			let itemData: ItemData = data.getCostItemData();

			if (config)
				conditionStr = config.desc;
			if (itemData && itemData.itemConfig)
				costStr = `[${itemData.itemConfig.name}]*${itemData.count}`;

			this.conditionLabel.text = `获得条件：${conditionStr}`;
			this.needLabel.textFlow = TextFlowMaker.generateTextFlow1(`需要：|C:${costColor}&T:${costStr}|`);
		}

		this.attrPanel.showAttr(data.getAttrs());

		let levelConfig = data.getLevelConfig()
		this.stairImg.visible = levelConfig != undefined;
		if (levelConfig)
			this.stairImg.setValue(config ? levelConfig.level : 0);

		this.powerPanel.setPower(data.getPower());
		this.nameImage.source = config ? config.nameIcon : ``;
		this.appearanceImage.source = config ? `${config.uishow}_png` : ``;
		this.appearanceImage.anchorOffsetY = 0;
		DisplayUtils.upDownGroove(this.appearanceImage, -12, 0);
		this.activation.label = isActivation ? data.getIsAppearance() ? this.appearanceButtonName : this.notAppearanceButtonName : this.activationButtonName;

		let isLevel: boolean = data.getIsLevel();
		if (data.getIsAppearance()) {
			this.activation.visible = true;
		}
		else {
			this.activation.visible = !(isLevel && !isActivation) || !isLevel;
		}
		this.needLabel.visible = !isLevel && !isActivation;
		this.timeLabel.visible = isActivation;
		this.conditionGroup.visible = !isActivation;
		this.activationImage.visible = !isActivation;
	}

	/**
	 * 获取当前选中的列表数据
	 * @returns FlySwordAppearanceData
	 */
	private getCurrSelectData(): FlySwordAppearanceData {
		return this.itemList.selectedItem;
	}

	/**
	 * 更新滚动条位置
	 * @returns void
	 */
	private updateScroller(): void {
		let min: number = 0;
		let max: number = this.itemScroller.viewport.contentWidth - this.itemScroller.width;
		let scrollerH: number = this.itemScroller.viewport.scrollH;

		if (scrollerH < min)
			scrollerH = min;
		else if (scrollerH > max)
			scrollerH = max;

		this.itemScroller.viewport.scrollH = scrollerH;

		this.onScroller();
	}

	/**
	 * 启动剩余时间的倒计时
	 * @returns void
	 */
	private startTimeLeft(): void {
		this.clearTimeLeft();
		this.runTimeLeft();
		TimerManager.ins().doTimer(1000, 0, this.runTimeLeft, this);
	}

	/**
	 * 运行剩余时间的倒计时
	 * @returns void
	 */
	private runTimeLeft(): void {
		let str: string = ``;
		let data: FlySwordAppearanceData = this.getCurrSelectData();

		if (data && data instanceof FlySwordAppearanceData) {
			let time: number = data.getEndTime();
			if (data.getIsActivation() && time > 0) {
				let timeStr: string = DateUtils.getFormatTimeByStyle(data.getEndTime(), DateUtils.STYLE_1);
				str = `剩余时间：${timeStr}`;
			}
			else
				this.clearTimeLeft();
		}
		else
			this.clearTimeLeft();

		this.timeLabel.textFlow = TextFlowMaker.generateTextFlow1(str);
	}

	/**
	 * 清除剩余时间的倒计时
	 * @returns void
	 */
	private clearTimeLeft(): void {
		TimerManager.ins().remove(this.runTimeLeft, this);
	}

	private getRoleId(): number {
		return this.roleSelect.getCurRole();
	}

	/**
	 * 刷新红点
	 * @returns void
	 */
	private updateRedPoint(): void {
		let redPoint = FlySwordRedPoint.ins();
		let roleId = this.getRoleId();

		for (let i: number = 0; i < 3; i++) {
			this.roleSelect.showRedPoint(i, redPoint.appearanceRedPoint[i].indexOf(true) != -1);
		}
	}

}

ViewManager.ins().reg(FlySwordAppearanceWin, LayerManager.UI_Main);