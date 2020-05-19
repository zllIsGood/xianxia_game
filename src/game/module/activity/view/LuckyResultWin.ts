/**
 * 转盘10连抽结果
 * @author hujinheng
 *
 */
const cc_launchX = 180;
const cc_launchY = 500;
const cc_firstX = 0;
const cc_firstY = 0;
const cc_distantX = 77;
const cc_distantY = 93;
const cc_depotX = 320;
const cc_depotY = 620;
const cwaitTime = 50;

class LuckyResultWin extends BaseEuiView {
	private buyBtn: eui.Button;
	private closeBtn0: eui.Button;
	private listCon: eui.Group;

	private arr = [];
	private items: ItemBase[] = [];
	private canClicck: boolean;
	private type: number = 0;

	private ybicon:eui.Image;
	private desc:eui.Label;

	private yb:number;
	private zwNum1:eui.Label;

	private title:eui.Label;
	private icon:eui.Image;

	private activityID:number;
	private indexs:number[];//奖励索引组
	private itemId:number;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "HuntResult";
		this.isTopLevel = true;
	}
	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn0, this.closeCB);
		this.addTouchEvent(this.buyBtn, this.buy);
		this.observe(Activity.ins().postRewardResult, this.updateView);
		this.activityID = param[0];
		// let act: ActivityType9Data = Activity.ins().activityData[this.activityID] as ActivityType9Data;
		this.indexs = param[1];
		this.updateView();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn0, this.closeCB);
		this.removeTouchEvent(this.buyBtn, this.buy);
		this.removeObserve();
	}
	private zwHunt:eui.Group;
	private zbHunt:eui.Group;
	private zw:eui.Label;
	private zwNum2:eui.Label;
	private updateView(): void {
		//
		this.canClicck = true;
		this.ybicon.visible = false;
		this.desc.visible = false;
		this.zbHunt.visible = false;
		this.zwHunt.visible = true;
		this.zwNum2.visible = false;

		let config:ActivityType9Config[] = GlobalConfig.ActivityType9Config[this.activityID];
		this.arr = [];
		for( let i = 0;i < this.indexs.length;i++ ){
			if( !this.indexs[i] )continue;
			for( let j = 0;j < config[this.indexs[i]].reward.length;j++ ){
				this.arr.push(config[this.indexs[i]].reward[j]);//显示的奖励集合
			}
		}
		this.title.text = `获得如下宝物`;
		this.buyBtn.labelDisplay.text = `抽10次`;
		this.yb = config[0].yb * 10;
		this.zw.text = this.yb + "";
		let itemcfg:ItemConfig = GlobalConfig.ItemConfig[config[0].item];
		this.icon.source = itemcfg.icon + "_png";


		this.itemId = config[0].item;
		this.updateDesc();
		
		this.playResult();
	}


	private updateDesc(){

		let item:ItemData = UserBag.ins().getBagItemById(this.itemId);
		let colorStr: string = ColorUtil.WHITE_COLOR;
		let sum:number = 0;
		let maxsum:number = 10;
		if( item ){
			sum = item.count;
			if( item.count >= maxsum ){
				colorStr = ColorUtil.GREEN_COLOR;
			}
			else{
				colorStr = ColorUtil.RED_COLOR;
			}
		}
		this.zwNum1.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${sum}</font><font color=${ColorUtil.WHITE_COLOR}>/${maxsum}</font> `);
	}


	private playResult(fun?) {
		this.releaseAllItem();
		let count = this.arr.length;
		for (let i = 0; i < count; i++) {
			this.items[i] = this.createItem(this.arr[i]);
			let t: egret.Tween = egret.Tween.get(this.items[i]);
			this.items[i].x = (i % 5) * cc_distantX + cc_firstX;
			this.items[i].y = Math.floor(i / 5) * cc_distantY + cc_firstY;
			this.items[i].alpha = 0;
			// this.items[i].showEquipEffect();
			t.wait(i * cwaitTime).to({alpha: 1}, 200).call(
				() => {
					count--;
					if (count == 0) {
						if (fun != undefined) {
							fun();
						}
						this.canClicck = true;
					}
				});
		}
	}

	private playGet(fun?) {
		let count = this.arr.length;
		for (let i = 0; i < count; i++) {
			if (!this.items[i])
				continue;
			let t: egret.Tween = egret.Tween.get(this.items[i]);
			t.to({
				"y": cc_depotY,
				"x": cc_depotX,
				"scaleX": 0,
				"scaleY": 0
			}, 300 - Math.floor(i / 5) * 50).call(
				() => {
					count--;
					if (count == 0) {
						if (fun != undefined) {
							fun();
						}
						this.releaseAllItem();
					}
				}
			);
		}
	}

	private createItem(data): ItemBase {
		let item = new ItemBase();
		this.listCon.addChild(item);
		let cfg:ItemConfig = GlobalConfig.ItemConfig[data.id];
		if( cfg ){
			item.num = data.count;
			item.data = data;
		}else{
			item.data = {type:0,count:data.count,id:data.id};
		}
		item.x = cc_launchX;
		item.y = cc_launchY;

		return item;
	}

	private releaseAllItem() {
		for (let k in this.items) {
			this.items[k].destruct();
			this.listCon.removeChild(this.items[k]);
		}
		this.items = [];
	}

	private closeCB(e: egret.TouchEvent) {
		if (!this.canClicck) {
			return;
		}
		this.canClicck = false;

		let func = () => {
			ViewManager.ins().close(this);
		};
		this.playGet(func);
	}

	private buy(e: egret.TouchEvent) {
		if (!this.canClicck) {
			return;
		}

		if (Activity.ins().getIsRollTen(this.activityID)) {
			let func = () => {
				Activity.ins().sendReward(this.activityID,2);
			};

			this.playGet(func);
			this.canClicck = false;
		} else {
			UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
		}

	}

}

ViewManager.ins().reg(LuckyResultWin, LayerManager.UI_Main);
