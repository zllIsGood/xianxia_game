/**
 * 红包系统
 */
class HBSystem extends BaseSystem {

	public constructor() {
		super();

		this.observe(Activity.ins().postGetRedEnvelope, this.showHongBaoTips);//开红包返回元宝/金币弹出tips
		this.observe(Activity.ins().postRewardResult, this.ActRewardResult);//领取红包返回
		this.observe(Activity.ins().postEnvelopeDataCall, this.showEnvelope);//打开红包展示红包信息
		this.observe(Activity.ins().postRedEnvelopeData, this.updateHongBao);//下发新红包

	}

	public static ins(): HBSystem {
		return super.ins() as HBSystem;
	}

	private actData:ActivityType25Data;
	public updateHongBao() {

		// 微信平台直接不显示红包
		if (!WxTool.shouldRecharge()) { return; }
		
		let view: PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (!view || !view.hongbao) return;
		if (view.hongbao.numElements > 0) return;
        for (let i = 0; i < Activity.ins().activityTimers.length; i++) {
			let actId = Activity.ins().activityTimers[i];
			this.actData = Activity.ins().HongData;
			if (Activity.ins().HongData instanceof ActivityType25Data) {
				if (!this.actData.envelopeData.length) return;

				let hbData = this.actData.envelopeData.shift();
				if (!hbData.isOverTimer()) {
					let item: HongBaoShowItem = new HongBaoShowItem();
					item.data = {actId: actId, eId: hbData.id};
					view.hongbao.addChild(item);
				}
				// for (let j = this.actData.envelopeData.length - 1; j >= 0;) {
				// 	j = this.actData.envelopeData.length - 1;
				// 	if (!this.actData.envelopeData[j]) {//找不到红包类对象
				// 		this.actData.envelopeData.splice(i, 1);//移除领过的红包
				// 		continue;
				// 	}
				// 	let eId = this.actData.envelopeData[j].id;//最新的红包id
				// 	if (!this.actData.envelopeData[j].isOverTimer()) {//红包是否过时
				// 		let item: HongBaoShowItem = new HongBaoShowItem();
				// 		item.data = {actId: actId, eId: eId};
				// 		view.hongbao.addChild(item);
				// 		break;
				// 	} else {
				// 		//过时就扔了
				// 		this.actData.popEnvelope(eId);
				// 	}
				// }
			}
		}
	}

	//派发红包显示提示
	//actId:number,eId:number,yb:number,gold:number
	private showHongBaoTips(param: any) {
		let actId = param[0];
		let eId = param[1];
		let yb = param[2];
		let gold = param[3];
		let arr = param[4];
		// this.hongbao.removeChildren();
		if (this.actData) {
			if (yb) {
				let reward = new RewardData;
				reward.type = 0;
				reward.id = MoneyConst.yuanbao;
				reward.count = yb;
				UserTips.ins().showGoodRewardTips(reward);
			}
			if (eId)
			this.actData.popEnvelope(eId);//移除领过的红包
			// this.updateHongBao();//检测最新红包
			this.HongBaoResultAni(arr);
		}
	}

	//领取红包成功后展示动画
	private HongBaoResultAni(arr: { job: number, sex: number, name: string, yb: number, gold: number }[]) {
		let view: PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (!view || !view.hongbao)return;
		let item: HongBaoOpenItem = view.hongbao.getChildAt(1) as HongBaoOpenItem;
		if (item)
			item.playAni(arr, this.updateHongBao, this);
	}

	//活动领取响应
	private ActRewardResult(activityID: number) {
		if (Activity.ins().activityTimers.indexOf(activityID) == -1) return;
		if (Activity.ins().activityData[activityID] instanceof ActivityType25Data) {
			if (!Activity.ins().isSuccee) {
				if (Activity.ins().activityData[activityID].isOpenActivity())
					UserTips.ins().showTips(`|C:0xff0000&T:红包已过期`);
				else
					UserTips.ins().showTips(`|C:0xff0000&T:活动已结束`);
			}
		}
	}

	//红包展示
	private showEnvelope(eld: EnvelopeData) {
		let view: PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (!view || !view.hongbao)return;
		if (!eld) {
			//失败即过时
			UserTips.ins().showTips(`|C:0xff0000&T:红包已过期`);
			view.hongbao.removeChildren();
			this.updateHongBao();
			return;
		}
		if (Activity.ins().activityData[eld.id] instanceof ActivityType25Data) {
			// let actData:ActivityType12Data = Activity.ins().activityData[eld.id] as ActivityType12Data;
			let item: HongBaoOpenItem = new HongBaoOpenItem();
			if (!eld.desc) {
				eld.desc = GlobalConfig.ActivityType25Config[eld.id][eld.index].blessWord;
			}
			item.data = {
				actId: eld.id,
				eId: eld.eId,
				job: eld.job,
				sex: eld.sex,
				name: eld.name,
				text: eld.desc,
				index: eld.index
			};
			view.hongbao.addChildAt(item, 1);
		}
	}

}

namespace GameSystem {
	export let hbsystem = HBSystem.ins.bind(HBSystem);
}