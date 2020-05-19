/**
 * 圣物合成 融合页面
 * Created by Peach.T on 2017/11/17.
 */
class GodweaponItemMixView extends BaseView {
	public leftButton: eui.Button;
	public rightButton: eui.Button;
	public list: eui.List;
	public mix1: eui.Group;
	public mix2: eui.Group;
	public mix3: eui.Group;
	public targetGroup: eui.Group;
	public targetLabel: eui.Label;
	public targetImg: eui.Image;
	public mix: eui.Button;
	public turn: eui.Label;
	public targetRandom: eui.Image;
	public mixline0Effect: eui.Image;
	public mixline1Effect: eui.Image;
	public rightEff: eui.Group;
	public leftEff: eui.Group;
	public buttonEff: eui.Group;
	public noItemDesc:eui.Label;

	/**
	 * 合成格子框1的数据
	 */
	private mixData1: GodweaponItemData;
	/**
	 * 合成格子框2的数据
	 */
	private mixData2: GodweaponItemData;
	/**
	 * 合成格子框3的数据
	 */
	private mixData3: GodweaponItemData;

	private dataSource: PageArray;

	private dataList: GodweaponItemData[];

	private labelEffect: MovieClip;

	private hintEffect: MovieClip;

	private isHintEffectPlay: boolean = false;

	/**融合进度条形特效 */
	private isPlay = false;

	/**
	 * 合成状态
	 * @type {string}
	 */
	private COMPOUND_STATE = "mix";

	/**
	 * 融合状态
	 * @type {string}
	 */
	private FUSE_STATE = "ultramix";

	private PAGE_SIZE = 5;

	public open(): void {
		this.mix1.touchChildren = false;
		this.mix2.touchChildren = false;
		this.mix3.touchChildren = false;
		this.targetGroup.touchChildren = false;
		this.mix.enabled = false;
		this.list.itemRenderer = GodweaponItem;
		this.labelEffect = new MovieClip;
		this.labelEffect.scaleX = 0.6;
		this.labelEffect.scaleY = 0.5;
		this.labelEffect.touchEnabled = false;

		this.hintEffect = new MovieClip;
		this.hintEffect.touchEnabled = false;

		this.addCustomEvent();
		this.updateView();
	}

	public close(): void {
		this.removeObserve();
	}

	private addCustomEvent(): void {
		this.addTouchEvent(this.turn, this.changeState);
		this.addTouchEvent(this.leftButton, this.prevPage);
		this.addTouchEvent(this.rightButton, this.nextPage);
		this.addTouchEvent(this.mix1, this.touchMixItem);
		this.addTouchEvent(this.mix2, this.touchMixItem);
		this.addTouchEvent(this.mix3, this.touchMixItem);
		this.addTouchEvent(this.targetGroup, this.touchTargetItem);
		this.addTouchEvent(this.mix, this.operate);
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListChange, this);
		this.observe(GodWeaponItemCC.ins().postCompound, this.onCompound);
		this.observe(GodWeaponItemCC.ins().postFuse, this.onFuse);
	}

	private operate(): void {
		if (!this.mix.enabled) return;
		if (this.currentState == this.FUSE_STATE) {
			GodWeaponItemCC.ins().requestFuse(this.mixData1.id, this.mixData2.id);
		}
		else {
			GodWeaponItemCC.ins().requestCompound(this.mixData1.id, this.mixData2.id, this.mixData3.id);
		}
	}

	private onCompound(data: { id, isSuccess }): void {
		this.mix.enabled = false;
		this.addEffect();
		TimerManager.ins().doTimerDelay(300, 0, 1, () => {
			this.addEffect(() => {
				this.updateView();
				this.updateTargetItem(data.id);
				this.addResultEffect(data.isSuccess, data.id, true);
			})
		}, this);
	}

	private addResultEffect(success: boolean, id: number, isForceFly: boolean = false): void {
		let effect = new MovieClip;
		effect.x = this.targetGroup.width / 2;
		this.targetGroup.addChild(effect);
		let effectPath;
		if (success) {
			effectPath = RES_DIR_EFF + "forgeSuccess";
			effect.y = this.targetGroup.height / 2 - 15;
		}
		else {
			effectPath = RES_DIR_EFF + "litboom";
			effect.y = this.targetGroup.height / 2;
		}
		effect.playFile(effectPath, 1, () => {
				if (!isForceFly) {
					this.cleanEff();
				}
				if (id && (isForceFly || success)) {
					this.flyItem(id);
				}
			}
		)
	}

	private playEff(fun: Function) {
		if (this.isPlay) {
			return;
		}
		let effSour = RES_DIR_EFF + "jljdt";
		this.isPlay = true;

		let speed = 1;
		//左
		let leff = new MovieClip();
		leff.playFile(effSour, -1);//
		this.leftEff.addChild(leff);
		leff.scaleX = 0;
		leff.scaleY = 0.6;


		//右
		let reff = new MovieClip();
		reff.playFile(effSour, -1);
		this.rightEff.addChild(reff);
		reff.scaleX = 0;
		reff.scaleY = 0.6;

		//下
		let beff = new MovieClip();
		beff.playFile(effSour, -1);
		this.buttonEff.addChild(beff);
		beff.x += 14;
		beff.scaleX = 0;
		beff.scaleY = 0.6;
		beff.$setRotation(90);

		let maxX = 0.23;
		let t1: egret.Tween = egret.Tween.get(leff);
		let t2: egret.Tween = egret.Tween.get(reff);
		t2.to({scaleX: maxX}, 250 * speed);
		t1.to({scaleX: maxX}, 250 * speed).call(() => {
			let t3: egret.Tween = egret.Tween.get(beff);
			t3.to({scaleX: 0.35}, 250 * speed).call(() => {
				this.isPlay = false;
				if (fun) fun.call(this);
			});
		});
	}

	private cleanEff() {
		this.leftEff.removeChildren();
		this.rightEff.removeChildren();
		this.buttonEff.removeChildren();
	}

	private addEffect(fun?: Function): void {
		let effect = new MovieClip;
		effect.scaleX = 3;
		effect.scaleY = 3;
		effect.x = this.targetGroup.width / 2 - 4;
		effect.y = this.targetGroup.height / 2 - 7;
		this.targetGroup.addChild(effect);
		let path = DisplayUtils.getEffectPath("forceguildeff");
		effect.playFile(path, 1, () => {
			if (fun) fun.call(this);
		});
	}

	private onFuse(data: { id, isSuccess }): void {
		this.mix.enabled = false;
		let success = data.isSuccess;
		let weaponData: GodweaponItemData;
		if (!success && this.mixData1) {//融合失败 主圣物不刷新
			weaponData = new GodweaponItemData(this.mixData1.id, this.mixData1.count, this.mixData1.quality);
		}
		this.playEff(() => {
			this.updateView();
			this.updateTargetItem(data.id);
			if (!success && weaponData) {
				this.updateMixItem(1, weaponData);
				if (this.mixData1 && this.currentState == this.FUSE_STATE) { //刷新界面数据
					this.dataSource = new PageArray(this.updateMixData(), this.PAGE_SIZE);
					this.setPageData();
				}
			}
			this.addResultEffect(success, data.id);
		});
	}

	private flyItem(itemId: number): void {
		let itemBase: ItemBase = new ItemBase();
		itemBase.x = this.targetGroup.x;
		itemBase.y = this.targetGroup.y;
		itemBase.data = itemId;
		itemBase.anchorOffsetX = itemBase.width / 2;
		itemBase.anchorOffsetY = itemBase.height / 2;
		this.targetGroup.parent.addChild(itemBase);
		GameLogic.ins().postFlyItemEx(itemBase);
	}

	private touchMixItem(e: eui.ItemTapEvent): void {
		let group = e.target;
		let index = 1;
		if (group == this.mix1) {
			index = 1;
		}
		else if (group == this.mix2) {
			index = 2;
		}
		else if (group == this.mix3) {
			index = 3;
		}
		if (!this[`mixData${index}`]) {//点击没有物品的物品栏 列表弹提示
			this.addHintEffect();
		}
		this.updateMixItem(index);
		if (this.currentState != this.FUSE_STATE) {
			this.setCompoundState(false);
		}
		else {
			this.updateTargetItem();
			if (index == 1) this.updateMixItem(2);//取消主魂石时候 清空副魂石
		}
		this.dataSource = new PageArray(this.updateMixData(), this.PAGE_SIZE);//刷新界面数据
		this.setPageData();
	}

	private touchTargetItem(): void {
		let isFuse = this.isCanFuse();
		if (!isFuse) this.updateTargetItem();  //融合时候 配方物品格不能取消
	}

	private updateTargetItem(itemId: number = 0): void {
		if (itemId) {
			let item = GlobalConfig.ItemConfig[itemId];
			this.targetImg.visible = true;
			this.targetImg.source = item.icon + '_png';
			this.targetLabel.text = item.name;
			this.targetLabel.textColor = ItemConfig.getQualityColor(item);
		} else {
			let isCanCompound = this.isCanCompound();
			this.setCompoundState(isCanCompound);
			this.targetLabel.textColor = 0xd1c28f;
			this.targetImg.source = "";
			this.targetImg.visible = false;
		}
	}

	private setCompoundState(isCanCompound: boolean): void {
		let desc;
		if (isCanCompound) {
			desc = "随机圣物";
		}
		else {
			desc = "";
		}
		this.targetLabel.text = desc;
		this.targetRandom.visible = isCanCompound;
		this.mixline0Effect.visible = isCanCompound;
		this.mixline1Effect.visible = isCanCompound;
	}

	private updateMixItem(itemIndex: number, itemData: GodweaponItemData = null): void {
		let img: eui.Image = this[`mix${itemIndex}Img`];
		let label: eui.Label = this[`mix${itemIndex}Name`];
		if (itemData) {
			img.visible = true;
			let item = GlobalConfig.ItemConfig[itemData.id];
			img.source = `${item.icon}_png`;
			label.text = item.name;
			label.textColor = ItemConfig.getQualityColor(item);
		} else {
			label.text = "";
			img.visible = false;
		}
		this[`mixData${itemIndex}`] = itemData;
	}

	private addHintEffect(): void {
		if (this.isHintEffectPlay) return;
		DisplayUtils.removeFromParent(this.hintEffect);
		this.list.addChild(this.hintEffect);
		this.isHintEffectPlay = true;
		this.hintEffect.x = 241;
		this.hintEffect.y = 49;
		let path = DisplayUtils.getEffectPath("mixhint");
		this.hintEffect.playFile(path, 1, () => {
			this.isHintEffectPlay = false;
		});
	}

	private onListChange(): void {
		let data = this.list.selectedItem;
		let isSuccess = this.setMixData(data);
		if (isSuccess) {
			let isFuse = this.isCanFuse();
			if (!isFuse) this.updateTargetItem();
			this.dataSource = new PageArray(this.updateMixData(), this.PAGE_SIZE);
			this.setPageData();
		}
		else {
			UserTips.ins().showTips("物品格已满");
		}
	}

	private setMixData(data: GodweaponItemData): boolean {
		if (this.currentState == this.FUSE_STATE) {
			let isFuse = this.isCanFuse();
			if (isFuse) return false;
			let index: number = 1;
			if (!this.mixData1) {
				this.mixData1 = data;
				index = 1;
			} else if (!this.mixData2) {
				this.mixData2 = data;
				index = 2;
			}
			this.updateMixItem(index, data);
			return true;
		}
		else {
			let isCompound = this.isCanCompound();
			if (isCompound) return false;
			let index: number = 1;
			if (!this.mixData1) {
				this.mixData1 = data;
				index = 1;
			} else if (!this.mixData2) {
				this.mixData2 = data;
				index = 2;
			}
			else if (!this.mixData3) {
				this.mixData3 = data;
				index = 3;
			}
			this.updateMixItem(index, data);
			return true;
		}
	}

	/**
	 * 校验是否融合状态 并且格子填充满
	 */
	private isCanCompound(): boolean {
		return (this.mixData1 && this.mixData2 && this.mixData3 && this.currentState != this.FUSE_STATE);
	}

	/**
	 * 校验是否合成状态 并且格子填充满
	 */
	private isCanFuse(): boolean {
		return (this.mixData1 && this.mixData2 && this.currentState == this.FUSE_STATE);
	}

	private updateMixData(): GodweaponItemData[] {
		let result: GodweaponItemData[] = this.dataList.concat();
		if (this.currentState == this.FUSE_STATE) {
			if (this.mixData1) {
				result = GodweaponItemModel.ins().filterFuseItemList(this.mixData1, result);
			}
			if (this.mixData2) {
				result = GodweaponItemModel.ins().filterFuseItemList(this.mixData2, result);
			}
			let isFuse = this.isCanFuse();
			this.mix.enabled = isFuse;
			if (isFuse) this.updateTargetItem(GodweaponItemModel.ins().getFuseTargetItem(this.mixData1.id, this.mixData2.id));
		}
		else {
			if (this.mixData1) {
				result = GodweaponItemModel.ins().filterCompoundItemList(this.mixData1, result);
			}
			if (this.mixData2) {
				result = GodweaponItemModel.ins().filterCompoundItemList(this.mixData2, result);
			}
			if (this.mixData3) {
				result = GodweaponItemModel.ins().filterCompoundItemList(this.mixData3, result);
			}
			this.mix.enabled = this.isCanCompound();
		}
		return result;
	}

	private changeState(): void {
		if (this.currentState == this.FUSE_STATE) {
			this.currentState = this.COMPOUND_STATE;
		}
		else {
			this.currentState = this.FUSE_STATE;
		}
		this.updateView();
	}

	private prevPage(): void {
		this.dataSource.prev();
		this.setPageData();
	}

	private nextPage(): void {
		this.dataSource.next();
		this.setPageData();
	}

	private setPageData(): void {
		this.leftButton.visible = this.dataSource.havePre();
		this.rightButton.visible = this.dataSource.haveNext();
		this.list.dataProvider = new ArrayCollection(this.dataSource.pageData);
	}

	private clearView(): void {
		for (let i = 1; i < 4; i++) {
			this[`mixData${i}`] = null;
			this.updateMixItem(i);
		}
		this.updateTargetItem();
	}

	private updateView(): void {
		let data;
		let labelDesc;
		let isCanOperate;
		this.clearView();
		if (this.currentState == this.FUSE_STATE) {
			data = GodweaponItemModel.ins().getFuseItemList();
			labelDesc = "圣物合成";
			isCanOperate = GodweaponItemModel.ins().isCanCompound();
		}
		else {
			data = GodweaponItemModel.ins().getCompoundItemList();
			labelDesc = "圣物融合";
			isCanOperate = GodweaponItemModel.ins().isCanFuse();
		}
		if (isCanOperate) {
			this.addLabelEffect();
		}
		else {
			this.removeLabelEffect();
		}
		this.turn.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${labelDesc}</u></a>`);
		this.dataList = GodweaponItemModel.ins().toList(data);

		this.noItemDesc.visible = (this.dataList.length == 0);
		this.dataSource = new PageArray(this.dataList, this.PAGE_SIZE);
		this.setPageData();
	}

	private addLabelEffect(): void {
		TimerManager.ins().doNext(() => {
			DisplayUtils.removeFromParent(this.labelEffect);
			this.labelEffect.x = this.turn.x + 37;
			this.labelEffect.y = this.turn.y + 11;
			if (this.labelEffect.parent == null) {
				this.turn.parent.addChild(this.labelEffect);
			}
			this.labelEffect.playFile(RES_DIR_EFF + "chargeff1", -1);
		}, this);
	}

	private removeLabelEffect(): void {
		this.labelEffect.stop();
		DisplayUtils.removeFromParent(this.labelEffect);
	}
}