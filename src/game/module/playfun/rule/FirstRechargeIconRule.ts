/**
 * Created by Administrator on 2016/7/21.
 */
class FirstRechargeIconRule extends RuleIconBase {
	private firstTap: boolean = true;
	private self;
	private playPunView: PlayFunView;
	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.ruleName = 'FirstRechargeIconRule';
		this.updateMessage = [
			Recharge.ins().postUpdateRecharge,
			Actor.ins().postLevelChange,
			UserTask.ins().postUpdteTaskTrace,
			UserFb.ins().postGuanqiaInfo,
			UserFb.ins().postGqIdChange,
			Recharge.ins().postUpdateRechargeEx
		];
		this.playPunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		this.self = t;
		// if( this.self == this.playPunView.rechargeBtn )
		// 	egret.log("this is rechargeBtn");
		// else if( this.self == this.playPunView.rechargeBtn0 )
		// 	egret.log("this is rechargeBtn0");
		// else
		// 	egret.log("this is nothing");
	}

	checkShowIcon(): boolean {
		if (!this.playPunView.btnGuanQiaGroup.visible)
			return false;
		if (!OpenSystem.ins().checkSysOpen(SystemType.FIRSTCHARGE)) { return false; }
		// if (UserTask.ins().taskTrace.id <= 100005) return false;

		let data = Recharge.ins().getRechargeData(0);

		if (Recharge.ins().getCurDailyRechargeIsAllGet()) {
			return false;
		}

		if (data.num != 2) {
			this.tar["icon"] = `main_entrance_shouchong`;//首充
			// 角色等级>=30弹出首充气泡图片
			if (Actor.level >= 30) {
				let recharge:number = Setting.ins().getValue(ClientSet.firstShowRechargeBtn)
				if (recharge != 1) {
					let view: PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
					if (view) {
						view.setDieGuide(DieGuide.RECHARGE);
					}
					Setting.ins().setValue(ClientSet.firstShowRechargeBtn,1);
				}
			}
		}
		else if (!data.isAwards) {
			this.tar["icon"] = `icon_tiantianshouchong`;//每日首充
		}
		else {
			this.tar["icon"] = `icon_tiantianshouchong`;//每日礼包
		}

		// let f = ()=>{
		// 	if( data.num !=2 || !data.isAwards ){
		// 		return true;
		// 	}else{
		// 		return false;
		// 	}
		// }
		// if( this.self == this.playPunView.rechargeBtn0 ){
		// 	return f();
		// } else {
		// 	return !f();
		// }
		return WxTool.shouldRecharge();



		// let boo1 = OpenSystem.ins().checkSysOpen(SystemType.FIRSTCHARGE);
		// let day: number = data.day > Recharge.ins().chargeMaxDay ? Recharge.ins().chargeMaxDay : data.day;
		// let config: DailyRechargeConfig[] = GlobalConfig.DailyRechargeConfig[day];
		// let len = CommonUtils.getObjectLength(config)-1;
		// let boo2 = ((data.isAwards >> len) & 1) ? true : false;
		// return boo1 && !boo2;
	}

	checkShowRedPoint(): number {
		let count: number = 0;
		let data: RechargeData = Recharge.ins().getRechargeData(0);
		if (data.num == 1) {//可领取
			count = data.num;
		} else if (data.num == 2) {
			let config: any = Recharge.ins().getCurRechargeConfig();
			for (let k in config) {
				let state: number = ((data.isAwards >> config[k].index) & 1);
				if (state == 0 && data.curDayPay >= config[k].pay) {
					return 1;
				}
			}
		}
		return count;
	}

	getEffName(redPointNum: number): string {
		let data = Recharge.ins().getRechargeData(0);
		if (this.firstTap || redPointNum) {
			if (data.num != 2) {
				this.effX = 38;
				this.effY = 50;
			} else {
				this.effX = 40;
				this.effY = 55;
			}
			return "actIconCircle";
		}
		return undefined;
	}

	tapExecute(): void {
		let data = Recharge.ins().getRechargeData(0);
		if (data.num == 2) {
			ViewManager.ins().open(Recharge2Win);
		} else {
			ViewManager.ins().open(Recharge1Win);
		}
	}
}
