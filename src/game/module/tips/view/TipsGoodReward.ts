/**
 * 货币提示
 */
class TipsGoodReward extends BaseView {
	public desc: eui.Label;
	public skillName: eui.Label;
	public item: ItemBase;
	public isUsing: boolean;

	constructor() {
		super();
		this.skinName = "OrangeEquipNoticeSkin2";
		this.isUsing = false;
		this.horizontalCenter = 0;
	}

	public set data(item: any) {
		if( item instanceof RewardData ){//{type:number,id:number,count:number}
			switch (item.id){
				case MoneyConst.yuanbao:
					this.desc.text = `元宝`;
					// this.skillName.textFlow = TextFlowMaker.generateTextFlow1(`|C:${ItemBase.QUALITY_COLOR[4]}&T:元宝`);
					this.skillName.text = `${item.count}`;
					this.item.setItemImg(RewardData.CURRENCY_RES[item.id]);
					this.item.isShowName(false);
					this.item.showNum(false);
					this.item.isShowJob(false);
					break;
			}
		}
	}


}
