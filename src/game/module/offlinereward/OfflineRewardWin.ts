/**
 *
 * @author hepeiye
 * 离线收益
 *
 */
class OfflineRewardWin extends BaseEuiView {

	private okBtn: eui.Button;
	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private time: eui.Label;
	private exp: eui.Label;
	private money: eui.Label;
	private equipNum: eui.Label;
	private bagFull: eui.Label;

	public label0: eui.Label;
	public label2: eui.Label;
	public image1: eui.Image;
	public image: eui.Image;
	public label6: eui.Label;
	public label3: eui.Label;
	public label5: eui.Label;
	public label4: eui.Label;
	public label1: eui.Label;
	public jinglianshiNum:eui.Label;
	public coin:{id:number,count:number}[];

	private arr = [];

	constructor() {
		super();

		this.skinName = "OfflineRewardSkin";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.okBtn, this.onClick);
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.closeBtn0, this.onClick);
		this.arr = param[0];
		this.coin = param[1];
		for( let i=0;i<this.coin.length;i++ ){
			if( this.coin[i].id == MoneyConst.soul ){//精炼石
				this.arr.push(this.coin[i].count);//6
				break;
			}
			//挂机关卡表的 精英怪装备掉落 和 装备掉落不应该产出金币
			// else if( this.coin[i].id == 1 ){//金币
			// 	this.arr[2] += this.coin[i].count;
			// 	break;
			// }
		}

		this.update();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onClick);
		this.removeTouchEvent(this.closeBtn0, this.onClick);
		this.removeTouchEvent(this.okBtn, this.onClick);
	}

	private update() {
		this.time.text = "离线时间：" + DateUtils.getFormatBySecond(this.arr[0], DateUtils.TIME_FORMAT_9); 
		this.exp.text = "" + this.arr[1];
		this.money.text = "" + this.arr[2];
		this.equipNum.text = "" + (this.arr[3] + this.arr[4]);
		this.jinglianshiNum.text = "" + (this.arr[6]?this.arr[6]:0);

		if (this.arr[4] == 0) {
			this.bagFull.visible = false;
		} else {
			this.bagFull.visible = true;
			this.bagFull.textFlow = (new egret.HtmlTextParser).parser(`背包已满，自动熔炼<a color=0x35e62d>${this.arr[4]}</a>件装备`);
		}
		if (this.arr[5].length > 0) {
			for (let i = 0; i < this.arr[5].length; i++) {
				let obj: Object = this.arr[5][i];
				if (obj["type"] == 1)//图鉴
				{
					this.label4.text = obj["gold"];
					this.label6.text = obj["exp"];
				} else if (obj["type"] == 2)//月卡
				{
					this.label3.text = obj["gold"];
					this.label5.text = obj["exp"];
				}
				else if (obj["type"] == 3){//印记
					this.exp.text = "" + (this.arr[1] + obj["exp"]);
					this.arr[2] += obj["gold"];
					//
				}
				else if( obj["type"] == 4 ){//新神器
					this.exp.text = "" + (this.arr[1] + obj["exp"]);
					this.arr[2] += obj["gold"];
				}
			}
			this.money.text = "" + this.arr[2];
		}

	}

	private onClick(): void {

		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(OfflineRewardWin, LayerManager.UI_Main2);
