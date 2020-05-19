class MijiPanel extends BaseView {
	//提交按钮
	public getBtn: eui.Button;
	//秘术置换按钮
	public change: eui.Label;
	//秘术按钮
	public mijiBtns: MijiItem[];

	// private roleSelect: RoleSelectPanel;	//上部角色选择部分

	public mijiBtn0: MijiItem;
	public mijiBtn1: MijiItem;
	public mijiBtn2: MijiItem;
	public mijiBtn3: MijiItem;
	public mijiBtn4: MijiItem;
	public mijiBtn5: MijiItem;
	public mijiBtn6: MijiItem;
	public mijiBtn7: MijiItem;
	public select: MijiItem;


	public curZsLv: eui.Label;
	// public descImg: eui.Image;

	// private eff: MovieClip;

	public mijitujian: eui.Image;

	public learnLabel: eui.Label;
	public learnImg: eui.Image;
	private isTween: boolean = false;

	public curRole: number = 0;

	private powerPanel: PowerPanel;
	private curName: string;
	private roleID: number;
	// private totalPower: egret.DisplayObjectContainer;
	private btnAct: eui.Group;
	private mc: MovieClip;
	private all: eui.Image;
	private arrow: eui.Group;
	private _arrow: GuideArrow2;
	private btnLock: eui.Image;
	public help: eui.Button;

	constructor() {
		super();
		this.skinName = "MijiPanelSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {

		this.change.textFlow = new egret.HtmlTextParser().parser(`<u>秘术置换</u>`);
		this.mijiBtns = [this.mijiBtn0, this.mijiBtn1, this.mijiBtn2, this.mijiBtn3, this.mijiBtn4, this.mijiBtn5, this.mijiBtn6, this.mijiBtn7, this.select];

		// this.eff = new MovieClip;
		// this.eff.playFile(RES_DIR_EFF + "chargeff1");
		// this.eff.x = 278;
		// this.eff.y = 500;
		// this.eff.scaleX = this.eff.scaleY = 0.8;

		// this.totalPower = BitmapNumber.ins().createNumPic(0, "1");
		// this.totalPower.x = 190;
		// this.totalPower.y = 246;
		// this.addChild(this.totalPower);
	}

	destructor() {
		// this.roleSelect.destructor();
	}

	public setCurRole(roleId: number): void {
		if (this.curRole != roleId) {
			this.curRole = roleId;
			if (this.isTween) {
				UserMiji.ins().sendMijiwancheng(this.roleID);
				this.isTween = false;
				for (let i = 0; i < 8; i++) {
					egret.Tween.removeTweens(this["imageSmall_" + (i + 1)]);
				}
			}
		}
	}

	/**
	 * 设置界面数据
	 */
	public setData(): void {
		let ins: UserMiji = UserMiji.ins();
		let showSetCount: boolean = true;
		for (let i = 0; i < 8; i++) {
			this["imageMax_" + (i + 1)].visible = false;
			let numList: MijiData[];
			if (ErrorLog.Assert(ins.miji, "MijiPanel   data.miji is null")) {
				this.mijiBtns[i].data = null;
			} else {
				numList = ins.miji[this.curRole];
				if (ErrorLog.Assert(numList, "MijiPanel   numList " +
						"is null  roleId = " + this.curRole)) {
					this.mijiBtns[i].data = null;

				} else {
					let isLiang = !numList[i] ? false : (numList[i].id != 0);
					this["imageMax_" + (i + 1)].visible = isLiang;
					this.mijiBtns[i].data = !numList[i] ? null : numList[i];
					if (!numList[i]) {
						if (showSetCount) {
							this.mijiBtns[i].setCountLabel(i);
							showSetCount = false;
						}
					}
				}
			}
		}
		this.learnLabel.visible = false;
		this.learnImg.visible = false;
		ins.miji[this.curRole].forEach(element => {
			if (element.id > 0) {
				this.learnLabel.visible = true;
				this.learnImg.visible = true;
			}
		});
		// BitmapNumber.ins().changeNum(this.totalPower, ins.getPowerByRole(this.curRole), "1");
		this.powerPanel.setPower(ins.getPowerByRole(this.curRole));

	}
	
	private updateEff() {
		if (!this.select.addImg.visible) {
			if (!this.mc)
				this.mc = new MovieClip;
			if (!this.mc.parent) {
				this.btnAct.addChild(this.mc);
				this.mc.x = this.getBtn.x + this.getBtn.width / 2;
				this.mc.y = this.getBtn.y + this.getBtn.height / 2;
			}

			this.mc.playFile(RES_DIR_EFF + "chargeff1", -1);
		} else {
			DisplayUtils.removeFromParent(this.mc);
		}
	}

	private setOpenDesc(): void {

		let config: MiJiGridConfig = GlobalConfig.MiJiGridConfig[UserMiji.ins().grid + 1];
		if (config) {
			// this.curZsLv.text = `${config.zsLevel}转或者VIP${config.vipLevel}开启第${config.vipLevel}个秘术格`;
			// this.curZsLv.visible = true;
			// this.descImg.visible = true;
		}
		else {
			this.curZsLv.visible = false;
			// this.descImg.visible = false;
		}
	}

	public open(...param: any[]): void {
		this.setOpenDesc();
		this.setData();
		this.addTouchEvent(this.getBtn, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		this.addTouchEvent(this.change, this.onTap);
		this.addTouchEvent(this.mijitujian, this.onTap);
		this.addTouchEvent(this.all, this.onTap);
		this.addTouchEvent(this.btnLock, this.onTap);

		// this.addChangeEvent(this.roleSelect, this.setData);

		for (let a in this.mijiBtns) {
			this.addTouchEvent(this.mijiBtns[a], this.onTap);
		}
		this.observe(UserMiji.ins().postMijiData, this.updateRedPoint);
		this.observe(UserMiji.ins().postMijiUpDate, this.learnUpdate);
		this.observe(UserMiji.ins().postSelectedMiji, this.selectMijiItem);
		this.observe(UserMiji.ins().postMijiLockInfo, this.setData);
		this.select.showAdd();
	}

	public close(): void {
		for (let a in this.mijiBtns) {
			this.removeTouchEvent(this.mijiBtns[a], this.onTap);
		}
		this.removeTouchEvent(this.getBtn, this.onTap);
		this.removeTouchEvent(this.help, this.onTap);
		this.removeTouchEvent(this.change, this.onTap);
		this.removeTouchEvent(this.mijitujian, this.onTap);
		this.removeTouchEvent(this.all, this.onTap);
		// this.roleSelect.removeEventListener(egret.Event.CHANGE, this.setData, this);

		this.removeObserve();
	}

	/**
	 * 秘术选中更改
	 */
	private selectMijiItem(itemObj: any[]): void {
		this.select.data = itemObj[0];
		this.curName = itemObj[1];
		this.updateEff();
	}

	//背包使用秘籍
	public onBagUseMiji(itemId: number) {
		this.playEff();
		this.playArrow();
	}

	private playEff() {
		if (!this.mc)
			this.mc = new MovieClip;
		if (!this.mc.parent) {
			this.btnAct.addChildAt(this.mc, 1);
			this.mc.x = this.getBtn.x + this.getBtn.width / 2;
			this.mc.y = this.getBtn.y + this.getBtn.height / 2;
		}

		this.mc.playFile(RES_DIR_EFF + "chargeff1", -1);
	}

	private playArrow() {
		if (!this._arrow)
			this._arrow = new GuideArrow2();
		if (!this._arrow.parent)
			this.arrow.addChild(this._arrow);
		this._arrow.x = 0;
		this._arrow.setTips(`点击镶嵌秘籍`);
		this._arrow.setDirection(0);
	}

	private stopArrow() {
		if (this._arrow)
			this._arrow.removeTweens();
		DisplayUtils.removeFromParent(this._arrow);
		this._arrow = null;
	}

	private learnUpdate(para: number[]): void {
		let index = para[0];
		let id = para[1];
		let oldID = para[2];
		let isSuss = para[3];
		if (isSuss == 1) {
			this.learnUpdateEffect(index, false, () => {
				this["imageMax_" + (index + 1)].visible = true;
				let mc: MovieClip = ObjectPool.pop("MovieClip");
				mc.scaleX = mc.scaleY = 1;
				mc.rotation = 0;
				mc.x = mc.y = 36;
				//mc.loadFile("litboom", true)
				mc.playFile(RES_DIR_EFF + "faileff", 1, () => {
					ObjectPool.push(mc);
				});
				this.mijiBtns[index].addChild(mc);
				UserTips.ins().showTips("秘术镶嵌失败");
			});
		} else {
			this.learnUpdateEffect(index, true, () => {
				this["imageMax_" + (index + 1)].visible = true;
				TimerManager.ins().doTimer(500, 1, () => {
					let mc: MovieClip = ObjectPool.pop("MovieClip");
					mc.scaleX = mc.scaleY = 1;
					mc.rotation = 0;
					mc.x = mc.y = 36;
					//mc.loadFile("litboom", true)
					mc.playFile(RES_DIR_EFF + "successeff", 1, () => {
						ObjectPool.push(mc);
					});
					this.mijiBtns[index].addChild(mc);
					this.mijiBtns[index].showSelect();
					this.setData();
					let tempName: string = oldID ? ",[" + GlobalConfig.ItemConfig[GlobalConfig.MiJiSkillConfig[oldID].item].name + "]被替换" : "";
					// UserTips.ins().showTips( "秘术学习完成" + tempName);
					UserTips.ins().showTips("秘术镶嵌完成" + tempName);
					//判定是否镶嵌过 没有则设置标识 用于判断秘术红点新规则
					let mijiRedPoint: number = Setting.ins().getValue(ClientSet.mijiRedPoint);
					if (!mijiRedPoint)
						Setting.ins().setValue(ClientSet.mijiRedPoint, 1);
				}, this);
			});
		}
		// ViewManager.ins().close(MijiLearnWin);
		this.updateEff();
	}

	//特效播放
	private learnUpdateEffect(index: number, isSuss: boolean, fun: Function): void {
		this.isTween = true;
		let len = 8 * 3 + index + 1;
		for (let i = 0; i < len; i++) {
			let num: number = i;
			let time: number = 150 * i;
			let closeTime: number = 150;
			if (i > 7 && i < 16) {
				num = i - 8;
				time = 150 * i;
			}
			else if (i > 15 && i < 24) {
				num = i - 8 * 2;
				time = 150 * i + 100 * (i - 15);
				closeTime = 250;
			}
			else if (i > 23) {
				num = i - 8 * 3;
				time = 150 * i + 200 * (i - 23) + 650;
				closeTime = 350;
			}
			let tw = egret.Tween.get(this["imageSmall_" + (num + 1)]);
			tw.to({}, time).call(() => {
				let tw = egret.Tween.get(this["imageSmall_" + (num + 1)]);
				this["imageSmall_" + (num + 1)].visible = true;
				if (i == (len - 1))
					tw.to({ "visible": true }, 150).call(() => {
						for (let i = 0; i < 8; i++) {
							egret.Tween.removeTweens(this["imageSmall_" + (i + 1)]);
							this.isTween = false;
						}
						UserMiji.ins().sendMijiwancheng(this.roleID);
						fun();
					});
				else
					tw.to({ "visible": false }, closeTime);
			});
		}
	}

	private updateRedPoint(): void {
		this.setOpenDesc();
		this.setData();
	}

	private onTap(e: egret.TouchEvent): void {

		let ins: UserMiji = UserMiji.ins();
		switch (e.target) {
			case this.getBtn:
				DisplayUtils.removeFromParent(this.mc);
				this.stopArrow();

				//提升按钮
				if (!this.select.data) {
					let i = this.mijiBtns.indexOf(this.select);
					if (i == 8) {
						if (!ins.grid) {
							UserTips.ins().showTips(`1转后开启`);
							return;
						}
						ViewManager.ins().open(MijiLearnWin, this.curRole);
						return;
					}
					UserTips.ins().showTips("请选择技能！");
					return;
				}

				//获取高级技能id
				let id: number = this.select.data + 1;
				let isLearn: boolean;
				//获取中级技能id
				id = this.select.data - 1;
				//是否已经学习了中级
				isLearn = UserMiji.ins().hasSpecificSkillOfRole(this.curRole, id);
				// if (isLearn) {
				//已学习获取名字
				let tempName: string = ""
				if (GlobalConfig.MiJiSkillConfig[id]) {
					tempName = GlobalConfig.ItemConfig[GlobalConfig.MiJiSkillConfig[id].item].name;
				}

				// let tempName: string = GlobalConfig.ItemConfig[GlobalConfig.MiJiSkillConfig[id].item].name;

				WarnWin.show(`镶嵌后获得《${this.curName}》,有几率替换已镶嵌秘术，是否镶嵌？${isLearn ? "\n<font color='#f3311e'>(已镶嵌《" + tempName + "》,同类技能仅高级生效)</font>" : "\n<font color='#35e62d'>（低级秘术不会替换高级秘术）</font>"}`, () => {
					this.roleID = this.curRole;
					UserMiji.ins().sendMijiLearn(this.curRole, this.select.data);
					SoundUtil.ins().playEffect(SoundUtil.SKILL_UP);
					this.select.showAdd();
				}, this);

				break;
			case this.help:
				ViewManager.ins().open(ZsBossRuleSpeak, 45);
				break;
			case this.change:
				ViewManager.ins().open(MijiZhWin);
				break;
			case this.mijitujian:
				ViewManager.ins().open(MiJiTujianWin);
				break;
			case this.all:
				ViewManager.ins().open(MijiLookWin);
				break;
			case this.btnLock:
				ViewManager.ins().open(MijiLockWin, this.curRole);
				break;
			default:
				let i = this.mijiBtns.indexOf(e.target.parent);
				if (i == 8) {
					if (!ins.grid) {
						UserTips.ins().showTips(`1转后开启`);
						return;
					}
					ViewManager.ins().open(MijiLearnWin, this.curRole);
					return;
				}
				if (!this.mijiBtns[i] || this.mijiBtns[i].data && !this.mijiBtns[i].data.id)
					return;
				if (!ins.grid || i >= ins.grid) {
					// UserTips.ins().showTips( "未开启");
					UserTips.ins().showTips("未开启");
					return;
				}
				ViewManager.ins().open(MijiTipWin, this.mijiBtns[i].data);
				break;
		}

	}
}