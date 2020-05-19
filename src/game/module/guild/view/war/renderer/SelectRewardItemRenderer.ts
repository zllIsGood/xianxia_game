class SelectRewardItemRenderer extends BaseItemRender {
	//分配奖励的列表渲染器

	public chooseNum: eui.Label;
	public goods: ItemBase;
	public choosePeople: eui.Button;
	public list: eui.List;
	public boxname: eui.Label;
	public sendNum: number;
	public rightBtn: eui.Image;
	public leftBtn: eui.Image;


	private index: number = 0;

	constructor() {
		super();
		this.skinName = "SelectRewardItemSkin";
		this.choosePeople.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.list.itemRenderer = GuildWarMemberHeadRender;

		this.rightBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.leftBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	public dataChanged(): void {
		let reward: RewardData[] = GuildWar.ins().getModel().creatGuildRankReward(GuildWar.ins().getModel().guildWarRank, this.itemIndex);
		this.goods.data = reward[0];
		this.boxname.text = GlobalConfig.ItemConfig[reward[0].id].name;
		this.sendNum = GuildWar.ins().getModel().getCanSendNumByRank(this.itemIndex);
		let data: SelectInfoData[] = GuildWar.ins().getModel().getSelectDataByIndex(this.itemIndex);
		let count: number = 0;
		if (data.length > 0) {
			for (let k in data) {
				count += data[k].num;
			}
		}
		this.chooseNum.text = count + "/" + this.sendNum;
		this.list.dataProvider = new eui.ArrayCollection(data);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.choosePeople:
				GuildWar.ins().getModel().rewardIndex = this.itemIndex;
				ViewManager.ins().open(SelectMemberPanelWin, this.itemIndex, this.sendNum);
				break;

			case this.rightBtn:
				let gap = this.list.layout['gap'];
				let dis = this.list.getChildAt(0);
				if (!dis)return;
				let step = dis.width + gap;
				let showNum = Math.ceil(this.list.width / step);
				this.index = Math.ceil(this.list.scrollH / step);
				if (this.index + showNum >= this.list.numElements)
					return;
				this.index++;
				egret.Tween.removeTweens(this.list);
				let t = egret.Tween.get(this.list);
				t.to({scrollH: step * this.index}, 100);
				break;
			case this.leftBtn:
				gap = this.list.layout['gap'];
				dis = this.list.getChildAt(0);
				if (!dis)return;
				step = dis.width + gap;
				showNum = Math.ceil(this.list.width / step);
				this.index = Math.ceil(this.list.scrollH / step);
				if (this.index <= 0)
					return;
				this.index--;
				egret.Tween.removeTweens(this.list);
				t = egret.Tween.get(this.list);
				t.to({scrollH: step * this.index}, 100);
				break;
		}
	}
}