class ItemUseTipsWin extends BaseEuiView {

	public BG: eui.Image;
	public itemIcon: ItemIcon;
	public nameLabel: eui.Label;
	public description: eui.Label;
	public num: eui.Label;
	public lv: eui.Label;
	public sub1Btn: eui.Image;
	public add1Btn: eui.Image;
	public maxBtn: eui.Button;
	public minBtn: eui.Button;
	public numLabel: eui.EditableText;
	public useBtn: eui.Button;//使用
	public useBtn0: eui.Button;//回收
	public add: eui.Group;
	public btnGroup: eui.Group;
	public useLabel:eui.Label;

	private useNum: number;
	private maxNum: number = 0;
	private oldNum: number = 0;
	private goodsId: number;

	private isBossBox: boolean;
	private bossBoxIdList: number[] = [230001, 230002, 230003];
	private bgClose: eui.Rect;

	private _data: ItemData;

	private itemList:eui.List;
	private showNoBtn:boolean;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "ItemUseTipsSkin";
		this.numLabel.restrict = "0-9";
		this.itemIcon.imgJob.visible = false;
		this.isTopLevel = true;
		this.showNoBtn = false;
	}

	public open(...param: any[]): void {
		this._data = param[0];
		this.showNoBtn = param[1];//true不显示按钮
		this.goodsId = this._data.configID;
		// this.addTouchEndEvent(this.colorCanvas, this.otherClose);
		this.addTouchEndEvent(this.BG, this.otherClose);
		this.addTouchEndEvent(this.minBtn, this.onTap);
		this.addTouchEndEvent(this.maxBtn, this.onTap);
		this.addTouchEndEvent(this.sub1Btn, this.onTap);
		this.addTouchEndEvent(this.add1Btn, this.onTap);
		this.addTouchEndEvent(this.useBtn, this.onTap);
		this.addTouchEndEvent(this.useBtn0, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.observe(UserBag.ins().postUseItemSuccess, this.useSuccess);
		this.observe(UserBag.ins().postItemChange, this.itemChange);
		this.observe(UserBag.ins().postItemDel, this.itemChange);
		this.addChangeEvent(this.numLabel, this.onTxtChange);
		this.setData(this._data);

		this.isBossBox = this.bossBoxIdList.lastIndexOf(this.goodsId) != -1;
		this.itemList.itemRenderer = ItemBase;
		this.useBtn.visible = !this.showNoBtn;
		this.useLabel.visible = this.showNoBtn;
	}

	public close(...param: any[]): void {
		// this.colorCanvas.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
		this.BG.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
		this.minBtn.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTap, this);
		this.maxBtn.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTap, this);
		this.sub1Btn.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTap, this);
		this.add1Btn.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTap, this);
		this.useBtn.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTap, this);
		this.numLabel.removeEventListener(egret.Event.CHANGE, this.onTxtChange, this);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
		this._data = null;
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(ItemUseTipsWin);
	}

	private onTxtChange(e: egret.Event): void {
		let num = Number(this.numLabel.text);
		if (num > this.maxNum) {
			num = this.maxNum;
		} else if (num <= 0) {
			num = 1;
		}
		this.useNum = num;
		this.numLabel.text = this.useNum + "";
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.minBtn:
				this.useNum = 1;
				break;
			case this.maxBtn:
				this.useNum = this.maxNum;
				break;
			case this.sub1Btn:
				this.useNum--;
				if (this.useNum <= 0) {
					this.useNum = 1;
				}
				break;
			case this.add1Btn:
				this.useNum++;
				if (this.useNum > this.maxNum) {
					this.useNum = this.maxNum;
				}
				break;
			case this.useBtn:
				if (Number(this.numLabel.text) <= 0) {
					this.numLabel.text = "1";
				}
				this.onUse();
				break;
			case this.useBtn0:
				this.onBack();
				break;
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
		this.numLabel.text = this.useNum + "";
	}

	private onUse() {
		let config = this._data.itemConfig;
		//羽翼飞升丹和资质丹特殊处理
		if (config.id == GlobalConfig.WingCommonConfig.attrPillId || config.id == GlobalConfig.WingCommonConfig.flyPillId) {
			Wing.ins().userDans(config.id);
			ViewManager.ins().close(this);
			return;
		}
		
		if (this.checkCanMerge()) {
			this.onMerge();
			ViewManager.ins().close(ItemUseTipsWin);
			return;
		}

		if (ItemConfig.getType(config) == ItemType.TYPE_2) {
			ViewManager.ins().open(SkillWin, 3);
			ViewManager.ins().close(this);
			UserMiji.ins().postBagUseMiji(config.id);
			return;
		}

		if (ItemConfig.getType(config) == ItemType.TYPE_10) {
			this.onUseType10();
			ViewManager.ins().close(ItemUseTipsWin);
			return;
		}

		if (ItemConfig.getType(config) == ItemType.TYPE_13) {
			this.onUseType13();
			ViewManager.ins().close(ItemUseTipsWin);
			return;
		}

		if (ItemConfig.getType(config) == ItemType.TYPE_14) {
			this.onUseType14();
			ViewManager.ins().close(ItemUseTipsWin);
			return;
		}

		//烈焰精髓
		if (ItemConfig.getType(config) == ItemType.TYPE_20) {
			if (!SpecialRing.ins().checkCanUseByItem(config.id)) {
				UserTips.ins().showTips(`烈焰精髓的使用数量已达到最大值`);
				ViewManager.ins().close(ItemUseTipsWin);
				return;
			}
		}

		if( config.id == ItemConst.LEVELUP_ITEM ){
			let rch:RechargeData = Recharge.ins().getRechargeData(0);
			if( !rch.num ){
				UserTips.ins().showTips(`充值任意金额才能开启礼包`);
				ViewManager.ins().close(ItemUseTipsWin);
				RechargeData.checkOpenWin();
				return;
			}
		}

		if (config.id == GlobalConfig.MijiBaseConfig.lockId) {
			ViewManager.ins().close(ItemUseTipsWin);
			ViewManager.ins().open(MijiLockWin, UserMiji.BAGOPEN);
			return;
		}

		if (ItemConfig.getType(config) == ItemType.TYPE_9) {
			ViewManager.ins().close(ItemUseTipsWin);
			ViewManager.ins().open(LiLianWin, 3);
			return;
		}

		if (this.isBossBox) {
			ViewManager.ins().close(ItemUseTipsWin);
			ViewManager.ins().open(RandBossWin, this.goodsId);
			return;
		}

		if( config.needyuanbao && Actor.yb < config.needyuanbao ){
			UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
			ViewManager.ins().close(this);
			return;
		}

		if (UserBag.ins().sendUseItem(this.goodsId, this.useNum) || config.split) {
			ViewManager.ins().close(ItemUseTipsWin);
		}
	}

	private onUseType10() {
		//TODO:特殊戒指：[200013,200014]
		let config = this._data.itemConfig;
		let index = config.id == 200013 ? 0 : 1;
		for (let i = 0; i < SubRoles.MAX_ROLES; i++) {
			let role = SubRoles.ins().getSubRoleByIndex(i);
			if (role) {
				let ringLv = SubRoles.ins().getSubRoleByIndex(i).getExRingsData(index);
				if (ringLv <= 0) {
					// SpecialRing.ins().sendUpGrade(index, i);
					ViewManager.ins().open(RoleWin, 0, i);
					ViewManager.ins().close(ItemUseTipsWin);
					break;
				}
			} else {
				UserTips.ins().showTips(`角色未开启，无法使用`);
				break;
			}
		}
	}

	//卷轴使用
	private onUseType13() {
		//BOSS_SUBTYPE_WORLDBOSS 试炼251
		//BOSS_SUBTYPE_QMBOSS  野外250
		//BOSS_SUBTYPE_SHENYU 神域450
		let config:ItemConfig = this._data.itemConfig;
		//对于卷轴类型服务器不用useCond字段 这里主要用于客户端获取boss类型 方便获取挑战次数
		let boosType:number = config.useCond;
		// if( config.descIndex == 250 )
		// 	boosType = UserBoss.BOSS_SUBTYPE_QMBOSS;
		// else if( config.descIndex == 251 )
		// 	boosType = UserBoss.BOSS_SUBTYPE_WORLDBOSS;
		// else if( config.descIndex == 450 )
		// 	boosType = UserBoss.BOSS_SUBTYPE_SHENYU;
		if( config.descIndex == 300 ) {
			this.onUseType13_300();
			return;
		} else if( config.descIndex == 302 ) {
			this.onUseType13_302();
			return;
		}


		if( !boosType ){
			UserTips.ins().showTips("错误卷轴的使用类型");
			return;
		}
		let leftSum:number = UserBoss.ins().worldBossLeftTime[boosType];
		let bname:string = config.name;
		// if( boosType == UserBoss.BOSS_SUBTYPE_WORLDBOSS  ){
		// 	bname = "试炼";
		// }else if( boosType == UserBoss.BOSS_SUBTYPE_QMBOSS ){
		// 	bname = "野外";
		// }
		if( leftSum > 0 ){//没有次数才可以使用
			UserTips.ins().showTips(`无${bname}挑战次数时,才能使用`);
			return;
		}
		UserTips.ins().showTips(`使用成功,获得${this.useNum}次${bname}挑战次数`);
		UserBag.ins().sendUseItem(this.goodsId, this.useNum);
		// ViewManager.ins().close(ItemUseTipsWin);
	}

	private onUseType13_300() {
		let leftSum = UserFb.ins().fbRings.challengeTime;
		if( leftSum > 0 ){//没有次数才可以使用
			UserTips.ins().showTips(`无挑战次数时,才能使用`);
			return;
		}
		UserTips.ins().showTips(`使用成功,获得${this.useNum}次烈焰副本挑战次数`);
		UserBag.ins().sendUseItem(this.goodsId, this.useNum);
	}

	private onUseType13_302() {
		let leftSum = GodWeaponCC.ins().fubenInfoData.hadChallengeNum;
		if( leftSum > 0 ){//没有次数才可以使用
			UserTips.ins().showTips(`无挑战次数时,才能使用`);
			return;
		}
		UserTips.ins().showTips(`使用成功,获得${this.useNum}次神兵副本挑战次数`);
		UserBag.ins().sendUseItem(this.goodsId, this.useNum);
	}

	//改名卡252
	private onUseType14() {
		ViewManager.ins().open(RenameWin);
	}

	private onMerge() {
		let itemConfig = this._data.itemConfig;
		let id = itemConfig.id;
		let count = this._data.count;
		let mergeConfig = GlobalConfig.ItemComposeConfig[id];
		if (mergeConfig.srcCount > count) {
			UserTips.ins().showTips(`数量不足,不能合成`);
			return;
		}
		UserBag.ins().sendMergeItem(id, count);
	}

	//回收
	private onBack() {
		let config = this._data.itemConfig;
		if (ItemConfig.getType(config) == ItemType.TYPE_10) {
			UserBag.ins().sendUseItem(this.goodsId, this.useNum)
		} else {
			if (UserBag.ins().sendUseItem(this.goodsId, this.useNum)) {
				ViewManager.ins().close(ItemUseTipsWin);
			}
		}
	}

	private useSuccess(): void {
		let data = UserBag.ins().getBagItemById(this.goodsId);
		if (!data) {
			ViewManager.ins().close(ItemUseTipsWin);
		} else {
			this.setData(data);
			this.onTxtChange(null);
		}

	}

	private itemChange() {
		let data = UserBag.ins().getBagItemById(this.goodsId);
		// let oldCount = this.oldNum;
		// let newCount = 0;
		// if (data) {
		// 	newCount = data.count;
		// }
		// if (oldCount - newCount == this.useNum) {
		// 	UserTips.ins().showTips(`|使用成功，${this._data.itemConfig.name}|C:0x40df38&T:x${this.useNum}|`);
		// }

		if (data) {
			this.setData(data);
			this.onTxtChange(null);
		} else {
			ViewManager.ins().close(this);
		}
	}

	private updateState() {
		let data = this._data;
		let type = ItemConfig.getType(data.itemConfig);
		if (this.checkCanMerge()) {
			this.currentState = 'rename';
		} else if (type == ItemType.TYPE_2) {
			this.currentState = "2";
		} else if (type == ItemType.TYPE_10) {
			this.currentState = '10';
		} else if (type == ItemType.TYPE_12) {
			this.currentState = 'guildgifts';
		} else if( type == ItemType.TYPE_14 ){
			this.currentState = 'rename';
		}else {
			this.currentState = '2';
		}
	}

	//是否可以合成
	private checkCanMerge() {
		let data = this._data;
		let id = data.itemConfig.id;
		return !!GlobalConfig.ItemComposeConfig[id];
	}

	//更新道具基础信息
	private updateBaseInfo(idata: ItemData) {
		let data = this._data;
		idata.count = idata.count ? idata.count : 1;
		let numStr: string = idata.count + "";

		let config = data.itemConfig;

		this.nameLabel.text = config.name;
		this.nameLabel.textColor = ItemConfig.getQualityColor(config);
		this.itemIcon.setData(config);
		this.lv.text = (config.level || 1) + "级";
		this.num.text = numStr;
		this.description.textFlow = TextFlowMaker.generateTextFlow(config.desc);
	}

	//更新道具使用信息
	private updateUse() {
		let data = this._data;
		this.useNum = this._data.count;
		this.numLabel.text = this.useNum + "";
		this.oldNum = data.count;
		this.maxNum = data.count;
		// if (this.maxNum > 100) {
		// 	this.maxNum = 100;
		// }
	}

	private updateHandlePos() {
		let data = this._data;
		// let posY: number = this.description.x + this.description.height + 30;
		// if (this.add.parent && this.add.visible) {
		// 	this.add.y = posY;
		// 	posY += 90;
		// }
		// if (this.btnGroup.parent && this.btnGroup.visible) {
		// 	this.btnGroup.y = posY;
		// 	posY += 90;
		// }
		// this.BG.height = posY;
	}

	private setData(data: ItemData): void {
		this._data = data;
		let config = this._data.itemConfig;
		this.updateState();
		this.updateBaseInfo(data);
		let type = ItemConfig.getType(config);
		if (type == ItemType.TYPE_2) {
			this.updateType2();
		} else if (type == ItemType.TYPE_10) {
			this.updateType10();
		}

		if(this.checkCanMerge()) {
			this.useBtn.label = "合成";
		}
		else if( config.needyuanbao ){
			this.useBtn.label = config.needyuanbao + "元宝";
		}
		this.updateUse();
		this.updateHandlePos();
		this.updateGuildGift(config);
	}

	private updateType2() {

	}
	private updateGuildGift(config:ItemConfig){
		let cfg:ItemGiftConfig = GlobalConfig.ItemGiftConfig[config.id];
		if( cfg ){
			this.itemList.dataProvider = new eui.ArrayCollection(cfg.awards);
		}
	}

	private updateType10() {
		let config = this._data.itemConfig;
		let activityNum: number = 0;
		if (SubRoles.ins().subRolesLen == SubRoles.MAX_ROLES) {
			//TODO:特殊戒指：[200013,200014]
			let index = config.id == 200013 ? 0 : 1;
			for (let i = 0; i < SubRoles.MAX_ROLES; i++) {
				let role = SubRoles.ins().getSubRoleByIndex(i);
				if (role) {
					let ringLv = SubRoles.ins().getSubRoleByIndex(i).getExRingsData(index);
					if (ringLv > 0) {
						activityNum += 1;
					}
				}
			}
		}
		if (activityNum == SubRoles.MAX_ROLES) {
			this.useBtn0.horizontalCenter = 0;
			this.useBtn.visible = false;
		} else {
			this.useBtn0.horizontalCenter = -90;
			this.useBtn.visible = true;
		}

	}
}
ViewManager.ins().reg(ItemUseTipsWin, LayerManager.UI_Popup);