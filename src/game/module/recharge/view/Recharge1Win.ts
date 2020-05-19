/**
 * 首冲
 */
class Recharge1Win extends BaseEuiView {
	/** 关闭按钮 */
	public closeBtn: eui.Button;

	private chong0: eui.Button;
	private chong1: eui.Button;
	private chong2: eui.Button;
	private chong3: eui.Button;

	private _data: RechargeData;
	private _index: number;

	private btnArr: eui.Button[];
	private buyed: eui.Button;
	private imageBuyed: eui.Image;

	// private weapImg: eui.Image;
	private roleImg: eui.Image;

	private show_img: eui.Image;
	private show_imgY: number;
	private show_imgMoveY: number;

	private effGroup0: eui.Group;
	private artifactEff: MovieClip;

	private unbuy: eui.Group;

	private eff: MovieClip;
	private buyGroup: eui.Group;
	private effGroup: eui.Group;
	constructor() {
		super();
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

		this.setSkinName();

		// this.list.itemRenderer = ItemBase;

		this.btnArr = [];
		for (let i: number = 0; i < 4; i++) {
			this.btnArr.push(this[`chong${i}`]);
		}

		this.eff = new MovieClip;
		// this.eff.x = this.buyed.x + 77;
		// this.eff.y = this.buyed.y + 32;
		// this.eff.scaleX = 1.15;
		// this.eff.scaleY = 1.5;
		this.eff.touchEnabled = false;
		this.imageBuyed.touchEnabled = false;

		this.show_imgY = this.show_img.y;
		this.show_imgMoveY = this.show_imgY - 10;
	}

	protected setSkinName(): void {
		this.skinName = "FirstChargeSkin";

		this.observe(Recharge.ins().postUpdateRechargeEx, this.setWinData);
	}
	public static openCheck(...param: any[]): boolean {
		if (!OpenSystem.ins().checkSysOpen(SystemType.FIRSTCHARGE)) {
			UserTips.ins().showTips(OpenSystem.ins().getNoOpenTips(SystemType.FIRSTCHARGE));
			return false;
		}
		let rch: RechargeData = Recharge.ins().getRechargeData(0);
		if (!param[0]) {
			if (rch.num == 2) {
				//每日冲是否领完
				let boo2 = Recharge.ins().getCurDailyRechargeIsAllGet()
				if (!boo2) {
					ViewManager.ins().open(Recharge2Win);
				} else {
					ViewManager.ins().open(ChargeFirstWin);
				}
				return false;
			}
			return true;
		}
		if (rch.num == 2) {
			ViewManager.ins().open(param[0][0]);
			return false;
		}
		return true;

	}
	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.closeCB);
		this.addTouchEvent(this.buyed, this.onTouch);

		for (let i: number = 0; i < this.btnArr.length; i++) {
			this.addTouchEvent(this.btnArr[i], this.onTouch);
		}

		let playPunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (playPunView) {
			playPunView.preRecharge = playPunView.recharge.visible = false;
		}
		/**新数据 */

		/**首冲道具奖励表*/
		let job: number = SubRoles.ins().getSubRoleByIndex(0).job;
		let rrd: RechargeRewardData[] = this.getRechargeRewardDatas(job);
		if (rrd) {
			for (let j = 0; j < rrd.length; j++) {
				let d: RechargeRewardData = rrd[j];
				//egret.log("当前道具类型 = " + d.type);
				//egret.log("道具id = " + d.id);
				//egret.log("数量 = " + d.count);
				let da = { id: d.id, type: d.type, count: d.count };
				this["item" + (j + 1)].data = da;

				// let item = GlobalConfig.ItemConfig[d.id];
				// if( item ){
				// 	this["img"+j].source = item.icon.toString()+"_png";
				// 	this["label"+j].text = item.name;
				// }
			}
		}

		/**展示*/
		let frConfig = GlobalConfig.FirstRechargeClientConfig;
		for (let k in frConfig) {
			if (frConfig[k].job == job) {
				// this.weapImg.source = frConfig[k].weaponshow + "_png";
				this.roleImg.source = frConfig[k].bodyshow + "_png";
				break;
			}
		}

		/**充值档次*/
		let i = 0;
		let frConf = Recharge.ins().getFirstRechargeConfig();
		for (let k in frConf) {
			let frc: FirstRechargeConfig = frConf[k];
			this.btnArr[i]['num'].text = frc.paydesc;
			this[`labGet${i}`].text = `获得${frc.payReturn}元宝`;
			this.btnArr[i]['money'] = frc.pay;
			i++;
		}

		this.setWinData();

		/**以下旧逻辑*/
		// let bool: boolean;
		// this._data = Recharge.ins().getRechargeData(0);
		// for (let i: number = 0; i < 4; i++) {
		// 	bool = (this._data.num >= this.getConfig(0).pay && !this.getRemindByIndex(0));
		// 	if (bool) {
		// 		// this.tab.selectedIndex = this._index = i;
		// 		this._index = i;
		// 		this.setWinData();
		// 		return;
		// 	}
		// }

		// this.tab.selectedIndex = this._index = 1;
		// this._index = 1;
		// this.setWinData();

		this.artifactEff = new MovieClip;
		this.artifactEff.x = this.effGroup0.width / 2;
		this.artifactEff.y = this.effGroup0.height / 2;
		this.artifactEff.playFile(RES_DIR_EFF + "artifacteff2", -1);
		this.effGroup0.addChild(this.artifactEff);
		
		this.playShowImageTween();
	}

	/**
	 * 播放icon缓动
	 */
	private playShowImageTween() {
		this.show_img.y = this.show_imgY;
		egret.Tween.removeTweens(this.show_img);
		
		egret.Tween.get(this.show_img, { loop: true }).to({ y: this.show_imgMoveY }, 1000).to({ y: this.show_imgY }, 1000);
	}

	/**
	 * 停止icon缓动
	 */
	private stopShowImageTween() {
		egret.Tween.removeTweens(this.show_img);
	}

	public close(...param: any[]): void {
		
		this.stopShowImageTween();

		DisplayUtils.removeFromParent(this.artifactEff);

		this.removeTouchEvent(this.closeBtn, this.closeCB);
		for (let i: number = 0; i < this.btnArr.length; i++) {
			this.removeTouchEvent(this.btnArr[i], this.onTouch);
		}
		DisplayUtils.removeFromParent(this.eff);
		egret.Tween.removeTweens(this);
		// this.removeTouchEvent(this.tab, this.onTabTouch);
		this.removeObserve();
		this.cleanEff();
	}

	private closeCB(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}

	private onTouch(e: egret.TouchEvent): void {
		let num: number = 0;
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.buyed://领取首充礼包
				// let job: number = SubRoles.ins().getSubRoleByIndex(0).job;
				// let rrd: RechargeRewardData[] = this.getRechargeRewardDatas(job);
				// if (!rrd) {
				// 	egret.log("表数据异常");
				// }
				// for (let j = 0; j < rrd.length; j++) {
				// 	let d: RechargeRewardData = rrd[j];
				// 	//egret.log("当前道具类型 = "+d.type);
				// 	//egret.log("道具id = "+d.id);
				// 	//egret.log("数量 = "+d.count);
				// 	if(d.type)num += d.count;
				// }
				// if (num > UserBag.ins().getSurplusCount()) {
				// 	UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|");
				// 	return;
				// }
				if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
					ViewManager.ins().open(BagFullTipsWin);
					return;
				}
				Recharge.ins().changeRecharge1Data();

				break;

			default:
				//首充4个档次
				let rechargeConf = Recharge.ins().getRechargeConfig();
				for (let i = 0; i < 4; i++) {
					if (e.currentTarget == this.btnArr[i]) {
						let money = this.btnArr[i]["money"];
						for (let i in rechargeConf) {
							if (money == rechargeConf[i].amount && 1 != rechargeConf[i].realMoney) {
								Recharge.ins().showReCharge(rechargeConf[i].id);
								// 充值测试
								// console.log(rechargeConf[i]); 
								// GameLogic.ins().sendGMCommad(`@addrecharge ${rechargeConf[i].amount}`);
								break;
							}
						}
						break;
						// frc.pay//充值额度
						// frc.payReturn//充值返利

						//egret.log("充值额度 = "+this.btnArr[i]["rmb"].text+"  充值返利 = "+this.btnArr[i]["yuanbao"].text);
					}
				}
				break;
		}

	}

	private onBtnTouch(e: egret.TouchEvent): void {
		let index: number = this.btnArr.indexOf(e.target);
		/**此处开始跳转充值*/
		//Recharge.ins().sendGetAwards(2,index);
		// if (index >= 0) {
		// 	this._index = index > 1 ? 1 : index;
		// 	this.setWinData();
		// }
	}

	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		if (e.currentTarget.selectedIndex == this._index)
			return;
		this._index = e.currentTarget.selectedIndex;
		this.setWinData();
	}

	protected setEff(index: number): void {
		switch (index) {
			case 0:
				break;
			case 1:
				this.cleanEff();
				break;
			default:
				break;
		}


	}
	private cleanEff() {
		for (let i = 0; i < 6; i++) {
			egret.Tween.removeTweens(this["item" + (i + 1)]);
		}
	}

	public setWinData(parma?: { type: number }): void {
		let type = parma ? parma.type : Recharge.ins().recharge_type;
		this._data = Recharge.ins().getRechargeData(type);

		//4个档次
		// for( let i=0;i<4;i++ ){
		// 	this.btnArr[i].visible = this._data.num == 1?false:true;
		// }
		// this.unbuy.visible = this._data.num == 1?false:true;
		//五个道具
		// for( let i=0;i<5;i++ ){
		// 	this["item"+(i+1)].visible = this._data.num?false:true;
		// }

		//未领取
		if (!this._data.num) {
			this.imageBuyed.visible = false;
			this.buyed.visible = false;
			this.unbuy.visible = true;
			for (let i = 0; i < 6; i++) {
				this["item" + (i + 1)].visible = true;
			}
			DisplayUtils.removeFromParent(this.eff);
			// this.setEff(0);
			this.effGroup.addChildAt(this.eff, 99);
			this.eff.x = this.effGroup.width / 2;
			this.eff.y = this.effGroup.height / 2;
			this.eff.playFile(RES_DIR_EFF + "chargebtn", -1);
		}
		//可领取
		else if (this._data.num == 1) {
			this.imageBuyed.visible = true;
			this.buyed.visible = true;
			this.unbuy.visible = false;
			for (let i = 0; i < 6; i++) {
				this["item" + (i + 1)].visible = true;
			}
			DisplayUtils.removeFromParent(this.eff);
			this.buyGroup.addChild(this.eff);
			this.eff.x = this.buyGroup.width / 2;
			this.eff.y = this.buyGroup.height / 2;
			this.eff.touchEnabled = this.buyGroup.touchEnabled = false;
			this.eff.playFile(RES_DIR_EFF + "chargebtn", -1);
			this.setEff(0);
		}
		//已领取
		else if (this._data.num == 2) {
			this.imageBuyed.visible = false;
			this.buyed.visible = false;
			this.unbuy.visible = false;
			DisplayUtils.removeFromParent(this.eff);
			this.cleanEff();
			//获取背包坐标
			let uiView2: UIView2 = ViewManager.ins().getView(UIView2) as UIView2;
			let bagBtn = uiView2.getBagBtn();
			// let p:egret.Point = bagBtn.localToGlobal();

			//获取动画
			for (let i = 0; i < 5; i++) {
				// this["item"+(i+1)].parent.globalToLocal(bagBtn.x,p.y,p);
				let t: egret.Tween = egret.Tween.get(this["item" + (i + 1)]);
				t.to({ x: bagBtn.x, y: bagBtn.y }, 1000).call(() => {
					this["item" + (i + 1)].visible = false;
				});
				//this["item"+(i+1)].visible = this._data.num == 2?false:true;
			}


			let tt: egret.Tween = egret.Tween.get(this);
			tt.wait(1000).call(() => {
				ViewManager.ins().close(Recharge1Win);
			});
		}
	}

	private getRechargeRewardDatas(index: number): RechargeRewardData[] {
		let frConfig = GlobalConfig.FirstRechargeClientConfig;
		for (let k in frConfig) {
			if (frConfig[k].job == index) {
				let gcz: RechargeRewardData[] = frConfig[k].RechargeRewardData;
				return gcz;
			}
		}

		return null;
	}

	private getRemindByIndex(index: number): boolean {
		return ((Recharge.ins().getRechargeData(0).isAwards >> index) & 1) == 1;
	}

}

ViewManager.ins().reg(Recharge1Win, LayerManager.UI_Main);
