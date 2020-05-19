/**首冲、累积充值 */
class Recharge extends BaseSystem {

	private _rechargeData: RechargeData[] = [];//0首充 1累积充值
	public costList: number;
	public flag: number = 0; //1未开启 2开启
	public forevetCard: number = 0;
	public rechargeTotal:{totalDay:number,hasGetDays:number[]};//总累计充值天数，已领取的累积天数
	public payWarning: WarnWin;
	private initPayListener: boolean = false;
	public leftTime:number = 0;
	private rechargeConf: RechargeItemsConfig[] = [];
	private firstRechargeConf: FirstRechargeConfig[] = [];
	public numLun:number = 0;
	public constructor() {
		super();

		this.sysId = PackageID.Recharge;
		this.regNetMsg(1, this.postRecharge1Data);
		this.regNetMsg(2, this.changeRecharge1Data);
		this.regNetMsg(6, this.getRecharge2Data);
		this.regNetMsg(7, this.changeRecharge2Data);
		this.regNetMsg(8, this.postUpDataItem);
		this.regNetMsg(9, this.postRechargeTotalDay);//下发42天累冲奖励


		// this.regNetMsg(10, this.postUpDataItem);
		this.regNetMsg(20, this.postGetMonthDay);

		this.regNetMsg(11, this.postFranchiseInfo);

		this.getRechargeConfig();
		this.getFirstRechargeConfig()
	}

	public static ins(): Recharge {
		return super.ins() as Recharge;
	}

	/**获取充值数据 RechargeData*/
	public getRechargeData(index: number = -1): any {
		return index == -1 ? this._rechargeData : (this._rechargeData[index] || new RechargeData());
	}

	/**获取当前充值**/
	public getCurRechargeConfig():DailyRechargeConfig[] | LoopRechargeConfig[] {
		let rch: RechargeData = this.getRechargeData(0);
		let len = CommonUtils.getObjectLength(GlobalConfig.DailyRechargeConfig);
		if (rch.day <= len) {
			return GlobalConfig.DailyRechargeConfig[rch.day];
		} else {
			let loopDay = rch.day - len;
			len = CommonUtils.getObjectLength(GlobalConfig.LoopRechargeConfig);
			loopDay = loopDay % len || len;
			return GlobalConfig.LoopRechargeConfig[loopDay];
		}
	}

	//每日冲是否领完
	public getCurDailyRechargeIsAllGet() {
		let data: RechargeData = Recharge.ins().getRechargeData(0);
		let config: any = Recharge.ins().getCurRechargeConfig();
		let len = CommonUtils.getObjectLength(config);
		for (let i = 0; i < len; i++) {
			let boo2 = ((data.isAwards >> i) & 1) ? true : false;
			if(!boo2) return false;
		}
		return true;
	}

	/**
	 * 请求领取充值奖励
	 * 27-2或27-7
	 * @param type 领取类型
	 */
	public sendGetAwards(type: number, id: number) {
		let bytes: GameByteArray = this.getBytes(type == 0 ? 2 : 7);
		bytes.writeShort(id);
		this.sendToServer(bytes);
	}

	/**
	 * 获取充值1数据
	 * 27-1
	 */
	public postRecharge1Data(bytes: GameByteArray) {
		this.recharge(bytes, 0);
	}



	/**
	 * 更新充值1数据
	 * 27-2
	 */
	public changeRecharge1Data() {
		let bytes: GameByteArray = this.getBytes(2);
		this.sendToServer(bytes);
		// let data = this.getRechargeData(0);
		// if (data) {
		// 	data.change(bytes);
		// 	Recharge.postUpdateRecharge(0);
		// }
	}
	public postUpdateRechargeEx(param?: number) {
		return { type: param };
	}
	public postUpdateRecharge(param?: number) {
		return param;
	}

	/**
	 * 领取每日充值奖励
	 * 27-3
	 */
	public getDayReward(index: number) {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	/**
	 * 获取充值2数据
	 * 27-6
	 */
	public getRecharge2Data(bytes: GameByteArray) {
		// this.recharge(bytes, 1);

	}

	/**
	 * 更新充值2数据
	 * 27-7
	 */
	public changeRecharge2Data(bytes: GameByteArray) {
		let data = this.getRechargeData(1);
		if (data) {
			data.change(bytes);
			Recharge.ins().postUpdateRecharge(1);
		}
	}

	/**
	 * 获取累计充值奖励（42天）
	 * 27-8
	 * @param index
	 */
	public getRechargeTotalAward(index:number) {
		let bytes:GameByteArray = this.getBytes(8);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	public recharge_type = 0;
	private recharge(bytes: GameByteArray, type: number): void {
		if (!this._rechargeData[type])
			this._rechargeData[type] = new RechargeData;

		this._rechargeData[type].parser(bytes, type);

		if (type == 0) {
			let boo2 = Recharge.ins().getCurDailyRechargeIsAllGet();

			if (boo2) ViewManager.ins().close(Recharge2Win);
		}

		Recharge.ins().postUpdateRechargeEx(type);
		this.recharge_type = type;
	}

	/**
	 * 充值套餐充值记录 是否第一次充值（按位获取）
	 * 27-8
	 *
	 */
	public postUpDataItem(bytes: GameByteArray): void {
		this.numLun = 0;
		this.costList = bytes.readInt();
		this.numLun = bytes.readInt();
	}

	/**
	 * 累计充值天数
	 * 27-9
 	 */
	public postRechargeTotalDay(bytes:GameByteArray):void {
		this.rechargeTotal = {} as any;
		this.rechargeTotal.hasGetDays = [];

		let len = bytes.readShort();
		for (let i = 0; i < len; i++) {
			this.rechargeTotal.hasGetDays.push(bytes.readShort());
		}
		this.rechargeTotal.totalDay = bytes.readShort();
	}


	/**
	 * 月卡剩余天数
	 * 27-20
	 */
	public postGetMonthDay(bytes: GameByteArray): void {
		this.leftTime = bytes.readUnsignedInt()
		if (this.leftTime > 0) {
			this.monthDay = this.leftTime;// * 1000 + egret.getTimer();
		} else {
			this.monthDay = 0;
		}
		if (this.leftTime > 0) this.flag = 2;
		this.forevetCard = bytes.readInt();

		this.isMC = !!bytes.readByte();
		//检查月卡是否第一次购买
		if( !Setting.ins().getValue(ClientSet.firstMonthCard) && (this.monthDay > 0 || this.getIsForeve()) )
			Setting.ins().setValue(ClientSet.firstMonthCard,1)
	}

	public getOrderByIndex(index: number = 0): number {
		let num: number = (this.costList >> index) & 1;
		return num;
	}

	private _monthDay: number;

	public set monthDay(value: number) {
		if (this._monthDay != value) {
			this._monthDay = value;
			TimerManager.ins().remove(this.downTime, this);
			if (this._monthDay > 0) {
				TimerManager.ins().doTimer(1000, this._monthDay, this.downTime, this);
			}
		}
	}

	public get monthDay(): number {
		return this._monthDay;
	}

	downTime(): void {
		this._monthDay -= 1;
	}

	getAddBagGrid(): number {
		return this.monthDay > 0 ? 100 : 0;
		// return 0;
	}

	getAddBagFranchiseGrid(): number {
		return this.franchise > 0 ? 100 : 0;
		// return 0;
	}

	public showReCharge(payIndex:number): void {
		//console.log("payIndex: " + payIndex);
		// SDK.pay(0, RMB, "");
		if (!OpenSystem.ins().checkSysOpen(SystemType.FIRSTCHARGE)) {
			UserTips.ins().showTips(`充值已屏蔽`);
			return;
		}

		
		if (platform.isIphone()) {
			// UserTips.ins().showTips(`iOS 不支持充值`);
			return;
		}

		this.removePayWarn();

		this.payWarning = WarnWin.show("正在拉起支付...\n如果长时间无响应，请尝试刷新网页重新购买", function () { }, this);
		TimerManager.ins().doTimer(3000,1,()=>{
			this.removePayWarn();
		},this);


		let payData;
		for (let i in this.rechargeConf) {
			if (payIndex == this.rechargeConf[i].id) {
				payData = this.rechargeConf[i];
				break;
			}
		}

		if (LocationProperty.isNativeCheckMode || LocationProperty.isNativeFormalMode) {
			if (payData) {
				HYTransport.send2Native(HYTransportCode.HY_TP_PAY,{
					Amout:payData.cash,
					ServerId:LocationProperty.weiduanCurSrvData?LocationProperty.weiduanCurSrvData.server_id:LocationProperty.srvid,
					ServerName:LocationProperty.weiduanCurSrvData?LocationProperty.weiduanCurSrvData.name:LocationProperty.srvid,
					RoleName:Actor.myName,
					Ext:Actor.actorID
				});

				if (LocationProperty.isNativeFormalMode && !this.initPayListener) {
					this.initPayListener = true;
					HYTransport.addNativeEventListener("HY_TP_PAYSUCCESS",function (e:egret.Event) {
			            // egret.log('支付成功');
			            if (window['chargeComplete']) {
							window['chargeComplete'](payIndex, Actor.actorID, {actorName:Actor.myName, actorLevel:Actor.level});
			            }
			        },this);
				}
			}
		}
		else if (LocationProperty.isWeChatMode) { // 微信小程序

			/** 购买数量 */
			platform.requestMidasPayment(`${payData.amount}`)
			.then((secret) => {
				
				let account = LocationProperty.openID;
				let serverId = LocationProperty.weiduanCurSrvData?LocationProperty.weiduanCurSrvData.server_id:LocationProperty.srvid;
				let role = `${Actor.actorID}`;
				let time = `${new Date().getTime() / 1000}`;
				let amount = payData.cash;
				let orderId = account + time;
				let sign = md5.hex_md5(account + serverId + amount + time + secret);
				return platform.payment(account, serverId, role, time, amount, orderId, sign, payIndex);
			})
			.then((res) => {
				// console.log('支付成功回调');
				// console.log(res);
				HYTransport.addNativeEventListener("HY_TP_PAYSUCCESS",function (e:egret.Event) {
					// egret.log('支付成功');
					if (window['chargeComplete']) {
						window['chargeComplete'](payIndex, Actor.actorID, {actorName:Actor.myName, actorLevel:Actor.level});
					}
				},this);
			})
			.catch((err) => {
				console.log(err);
				ViewManager.ins().close(WarnWin); 
			});
		}
		else if (LocationProperty.isVivoMode) {
			let packageName = 'com.ql.ftzn.vivo';
			let notifyUrl = 'https://loginpayftznh5.hulai.com/vivo/payment'
			let cpOrderNumber = `${LocationProperty.openID}_${LocationProperty.srvid}_${Actor.actorID}_${payIndex}_${Math.ceil(new Date().getTime() / 1000)}`;
			let orderTime = DateUtils.getFormatBySecond(0, 16);
			let orderAmount = `${payData.cash}.00`
			let orderTitle = payData.desc
			let orderDesc = payData.desc
			let appSecret = md5.hex_md5("649d8f823de9e4de3461bf7877eefbb8")
			// let param = `cpOrderNumber=${cpOrderNumber}&notifyUrl=${notifyUrl}&orderAmount=${orderAmount}&orderDesc=${orderDesc}&orderTime=${orderTime}&orderTitle=${orderTitle}&packageName=${packageName}`
			let param = {
				cpOrderNumber : `${LocationProperty.openID}_${LocationProperty.srvid}_${Actor.actorID}_${payIndex}_${Math.ceil(new Date().getTime() / 1000)}`,
				notifyUrl : 'https://loginpayftznh5.hulai.com/vivo/payment',
				orderAmount : `${payData.cash}.00`,
				orderDesc : payData.desc,
				orderTime : DateUtils.getFormatBySecond(0, 16),
				orderTitle : payData.desc,
				packageName : 'com.ql.ftzn.vivo',
				version : '1.0.0'
			}
			let paramStr = ''
			let keys = Object.keys(param)
			for (let i = 0; i < keys.length; i++) {
				paramStr += `${keys[i]}=${param[keys[i]]}`;
				if (i < keys.length-1) {
					paramStr += '&';
				}
			}
			let signature = md5.hex_md5(paramStr+`&${appSecret}`);
			platform.requestVivoPayment(paramStr,signature)
			.then(()=>{
				WarnWin.show("支付成功", function () { }, this);
			})
			.catch((err) => {
				console.log(err);
				WarnWin.show(err, function () { }, this);
			})
		}
		else if (LocationProperty.isHuaweiMode) { // 华为小游戏

			let productDesc = `${payData.amount}元宝`
			// let amount = 
			let orderInfo = {};
			orderInfo['amount'] = `${payData.cash}.00`;
			// orderInfo['amount'] = `0.01`;
			orderInfo['productDesc'] = productDesc;
			orderInfo['productName'] = productDesc;
			orderInfo['serviceCatalog'] = `X6`;
			orderInfo['merchantName'] = `重庆策娱科技有限公司`;
			orderInfo['requestId'] = "com.yuanbao." + `${new Date().getTime() / 1000}`;
			orderInfo['urlver'] = `2`;
			orderInfo['sdkChannel'] = `3`;
			let secret = 'f58dda2dcdf88f430c516253e44c567c';
			let sign = md5.hex_md5(orderInfo['requestId'] + secret);
			orderInfo['sign'] = sign;

			hw_getSign(orderInfo, (sign) => {

				orderInfo["applicationID"] = '100535857';
				orderInfo['merchantId'] = `890086000102159055`;
				orderInfo['publicKey'] = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhi13FVeCZx+7/jFJUjc7Cvcf8vLArKjY9X9OJ6X/tfWXioWXAAoI9lUce5SwaMvbsem/vW6o5OsDnkvM39qZZLmmdhaXDYH4h/pVRqEGU9sPckv+OWqc6j31XvU8gblLymRGefegGWr+8zwPsurBVR3w0amfZJyr5V9yt1ry+kofcfTzC2XMh3Djon/C1MpmKfmWpMMjfg0C2avFseKsx66mem1Ys0mTN8NBjS14sYi6ER9UD/fYdKKjqzMmQRiP2pqFDxRsw3wNfCEs94wcto6exM87iCvNWNWTfwnzfjh82Vs9RbeQUWT+ZhJ4u5T5mQrcCWECbKEuIJLOIsi8ywIDAQAB";
				orderInfo['sign'] = sign;

				let reportData = {
					'account': LocationProperty.openID,
					'serverId': LocationProperty.weiduanCurSrvData?LocationProperty.weiduanCurSrvData.server_id:LocationProperty.srvid,
					'actorid': `${Actor.actorID}`,
					'itemindx': payIndex
				};
				let reportDataStr = "";
				let keys = Object.keys(reportData)
				for (let i = 0; i < keys.length; i++) {
					let value = reportData[keys[i]];
					reportDataStr += value;
					if (i < keys.length-1) {
						reportDataStr += '|';
					}
				}
				orderInfo['extReserved'] = reportDataStr;
				hw_pay(orderInfo, () => {
					HYTransport.addNativeEventListener("HY_TP_PAYSUCCESS",function (e:egret.Event) {
						// egret.log('支付成功');
						if (window['chargeComplete']) {
							window['chargeComplete'](payIndex, Actor.actorID, {actorName:Actor.myName, actorLevel:Actor.level});
						}
					},this);
				})
			});
		}
		else if (window['showRecharge']) {
			if (payData) {
				window['showRecharge'](payIndex, Actor.actorID, {actorName:Actor.myName, actorLevel:Actor.level, amount:payData.cash});
			}
		} else {
			debug.log("未接入支付接口");
			console.log('结束了');
			ViewManager.ins().close(WarnWin); 
		}
	}

	public removePayWarn(): void {
		if (this.payWarning) {
			DisplayUtils.removeFromParent(this.payWarning);
		}
	}

	public getIsForeve(): boolean {
		return Recharge.ins().forevetCard == 2;
	}

	/*********特权*********/
	private _franchise:number;
	public franchiseflag: number = 0; //1未开启 2开启
	public franchiseget:number = 0;//每日领取威望 1:可领取 0:已领取
	public firstBuy:number = 0;//是否购买过特权 1:未购买过 0:已购买过
	/***是否为组合月卡的标志*/
	isMC: boolean
	/**
	 * 领取特权奖励
	 * 27-10
	 */
	public sendGetFranchise(){
		this.sendBaseProto(10);
	}

	/**
	 * 特权剩余天数
	 * 27-11
	 */
	public postFranchiseInfo(bytes: GameByteArray): void {
		this.leftTime = bytes.readUnsignedInt();
		if (this.leftTime > 0) {
			this.franchise = this.leftTime;// * 1000 + egret.getTimer();
		} else {
			this.franchise = 0;
		}
		this.franchiseget = bytes.readByte();
		//检查特权是否购买过
		this.firstBuy = bytes.readByte();

		this.isMC = !!bytes.readByte();
	}
	public set franchise(value: number) {
		if (this._franchise != value) {
			this._franchise = value;
			TimerManager.ins().remove(this.franchiseTime, this);
			if (this._franchise > 0) {
				TimerManager.ins().doTimer(1000, this._franchise, this.franchiseTime, this);
			}
		}
	}

	public get franchise(): number {
		return this._franchise;
	}

	franchiseTime(): void {
		this._franchise -= 1;
	}

	public getRechargeConfig() {
		if (this.rechargeConf.length > 0) return this.rechargeConf;
		this.sortConf(this.rechargeConf,GlobalConfig.RechargeItemsConfig);
	}

	public getFirstRechargeConfig() {
		if (this.firstRechargeConf.length > 0) return this.firstRechargeConf;
		this.sortConf(this.firstRechargeConf,GlobalConfig.FirstRechargeConfig);
	}

	private sortConf(list: any, conf: any) {
		for (let i in conf) {
			if ((conf[i].platform == 0 && LocationProperty.isNotNativeMode) 	// h5充值档位
				|| (conf[i].platform == 1 && LocationProperty.isWeChatMode) 	// 微信小游戏充值档位
				|| (conf[i].platform == 0 && LocationProperty.isVivoMode)
				|| (conf[i].platform == 0 && LocationProperty.isHuaweiMode)
				){ 
				list.push(conf[i]);
			}
		}
	}


	/**
	 *按平台模式获取月卡充值id
	 */
	public getMonthCardRechargeId(): number {
		if (LocationProperty.isNotNativeMode
			|| LocationProperty.isVivoMode
			|| LocationProperty.isHuaweiMode) {
			//h5月卡档位
			return 1000;
		} else if (LocationProperty.isWeChatMode) {
			//微信小游戏月卡档位
			return 1004;
		}
		return undefined;
	}


	/**
	 *按平台模式获取零元礼包充值id
	 */
	public getZeroRechargeId(index: number): number {
		if (index != 2 && index != 3) {
			return undefined;
		}
		if ((LocationProperty.isNotNativeMode
			|| LocationProperty.isVivoMode
			|| LocationProperty.isHuaweiMode)) {
			return index == 2 ? 1002 : 1003;
		} else if (LocationProperty.isWeChatMode) {
			return index == 2 ? 1006 : 1007;
		}
		return undefined;
	}

	/**
	 *按平台模式获取特权月卡充值id
	 */
	public getFranciseRechargeId(): number {
		if (LocationProperty.isNotNativeMode
			|| LocationProperty.isVivoMode
			|| LocationProperty.isHuaweiMode) {
			//h5特权月卡档位
			return 1001;
		} else if (LocationProperty.isWeChatMode) {
			//微信小游戏特权月卡档位
			return 1005;
		}
		return undefined;
	}

	/**
	 *按平台模式获取月卡和特权月卡打包充值id
	 */
	public getComMCardRechargeId(): number {
		if (LocationProperty.isNotNativeMode
			|| LocationProperty.isVivoMode
			|| LocationProperty.isHuaweiMode) {
			//h5特权月卡档位
			return 1008;
		} else if (LocationProperty.isWeChatMode) {
			//微信小游戏特权月卡档位
			return 1009;
		}
		return undefined;
	}
}

class RechargeData {
	public day: number;		  //开服第几天
	public isFirst: number;	 //是否显示首充
	public curDayPay: number;//当日累充
	public num: number;		 //首充奖励是否领取 0不可领取，1可以领取，2已领取 0和1显示首冲 2显示其他充值
	public isAwards: number;	//每日充值奖励，按位读取

	public parser(bytes: GameByteArray, type: number): void {
		this.day = bytes.readShort() + 1;
		// this.isFirst = bytes.readByte();
		this.curDayPay = bytes.readInt();
		this.num = bytes.readInt();
		this.isAwards = bytes.readInt();
		// egret.log("开服第几天 = "+this.day);
		// egret.log("当日累充 = "+this.curDayPay);
		// egret.log("首充奖励是否领取 = "+this.num);
		// egret.log("每日充值奖励，按位读取 = "+this.isAwards);
	}

	public change(bytes: GameByteArray): void {
		this.num = bytes.readInt();
		this.isAwards = bytes.readInt();
	}

	public static checkOpenWin(){
		let rdata:RechargeData = Recharge.ins().getRechargeData(0);
		if(!rdata || !rdata.num ){
			ViewManager.ins().open(Recharge1Win);
		}else{
			ViewManager.ins().open(ChargeFirstWin);
		}
	}
}

namespace GameSystem {
	export let  recharge = Recharge.ins.bind(Recharge);
}