/**
 * 红包开启后展示列表控件(红包里面玩家的名字)
 */
class HongBaoRewardsItem extends BaseItemRender {
	private myFace:eui.Image;
	private playerName:eui.Label;
	private speaktxt:eui.Label;
	constructor() {
		super();
		this.skinName = 'hongbaoRewardItem';
	}

	protected dataChanged(): void {
		if( !this.data )return;
		let yb = this.data.yb;
		let gold = this.data.gold;
		let money = `${yb}`;
		let text = "";
		if( !this.itemIndex && this.data.name == Actor.myName ){
			this.playerName.bold = true;
			text = "手气爆炸，在红包里抢到了";
		}else{
			text = `在红包里抢到了`;
		}
		if( gold ){
			money = CommonUtils.overLength(gold);
			text += money+"金币";
		}else{
			text += money+"元宝";
		}
		this.validateNow();
		this.speaktxt.text = text;

		let sex:number
		switch (this.data.job) {
			case 1:
				sex = 0;
				break;
			case 2:
			    sex = 1;
				break;
			case 3:
			    sex = 1;
				break;
		}

		if (!this.data){
			this.myFace.source = `yuanhead${this.data.job}${sex}`;
		}
		this.playerName.text = this.data.name;
	}

	public destruct(): void {

	}


}