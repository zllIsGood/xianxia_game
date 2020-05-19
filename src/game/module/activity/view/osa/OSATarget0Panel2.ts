/**
 * Created by hrz on 2017/9/4.
 * 42日累计充值
 */

class OSATarget0Panel2 extends BaseView {

	private actInfo0: eui.Label;
	private content: eui.List;
	private bigReward: eui.List;
	public activityID: number;
	private actDesc: eui.Label;

	constructor() {
		super();
		this.skinName = `Days42Recharge`;
	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();
	}

	public init() {
		this.content.useVirtualLayout = true;
		this.content.itemRenderer = OSATargetDays42ItemRender;
		this.bigReward.itemRenderer = OSATargetDays42ItemRender2;
	}

	open() {
		if(this.content.dataProvider){
			this.updateData();
		} else {
			this.updateList();
		}
		this.observe(Recharge.ins().postRechargeTotalDay, this.updateData);
	}

	private updateList() {
		let configs = GlobalConfig.RechargeDaysAwardsConfig;
		let arr = [];
		let bigArr = [];

		let ybAward = new RewardData();
		ybAward.count = 0;
		ybAward.id = 2;
		ybAward.type = 0;

		let byConfig = {id:100, awardList:[ybAward]}
		bigArr.push(byConfig);

		for (let id in configs) {
			let conf = configs[id];
			arr.push(conf);

			ybAward.id = conf.awardList[0].id;
			ybAward.type = conf.awardList[0].type;
			ybAward.count += conf.awardList[0].count;

			if (conf.awardList.length>1) {
				bigArr.push(conf);
			}
		}

		arr.sort(this.sort);
		bigArr.sort(this.sort2);


		this.content.dataProvider = new eui.ArrayCollection(arr.splice(0, 4));
		this.delayUpdate(arr);

		this.bigReward.dataProvider = new eui.ArrayCollection(bigArr);

		let data: ActivityBtnConfig = Activity.ins().getbtnInfo(this.activityID);
		this.actDesc.text = data.acDesc;
	}

	@callLater
	private delayUpdate(arr: any[]) {
		let ac = (<eui.ArrayCollection>this.content.dataProvider);
		ac.addItem(arr.shift());
		if (arr.length)
			this.delayUpdate(arr);
	}

	private sort(a, b): number {
		let hasGetDay = Recharge.ins().rechargeTotal.hasGetDays;
		if (hasGetDay.indexOf(a.id) >= 0 && hasGetDay.indexOf(b.id) < 0)
			return 1;
		else if (hasGetDay.indexOf(a.id) < 0 && hasGetDay.indexOf(b.id) >= 0)
			return -1;
		if (a.id < b.id)
			return -1;
		return 1;
	}

	private sort2(a, b): number {
		if (a.id < b.id)
			return 1;
		return -1;
	}

	close() {
		this.removeObserve();
	}

	updateData() {
		let datas = this.content.dataProvider as eui.ArrayCollection;
		datas.source.sort(this.sort);
		for (let i = 0; i < datas.length; i++) {
			datas.itemUpdated(datas.getItemAt(i));
		}

		datas = this.bigReward.dataProvider as eui.ArrayCollection;
		for (let i = 0; i < datas.length; i++) {
			datas.itemUpdated(datas.getItemAt(i));
		}
	}
}