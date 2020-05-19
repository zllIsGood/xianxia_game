/**
 * Created by Administrator on 2017/3/8.
 */

const d_launchX = 180;
const d_launchY = 500;
const d_firstX = 0;
const d_firstY = 0;
const d_distantX = 77;
const d_distantY = 93;
const d_depotX = 320;
const d_depotY = 620;
const d_waitTime = 50;
class ChallengeDayRewardWin extends BaseEuiView {

	public GetRewardBtn0: eui.Button;
	private bgClose: eui.Image;

	constructor() {
		super();
		this.isTopLevel = true;

		this.skinName = "chuangtianguanDayReward";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.GetRewardBtn0, this.challenge);
		this.addTouchEvent(this.bgClose, this.closeCB);
		this.observe(UserFb2.ins().postRewardStatu, this.setBtnStatu);
		UserFb2.ins().sendrequestDayReward();
	}

	private challenge(): void {
		let func = () => {
			UserFb2.ins().sendGetDayReward();
		};
		this.playGet(func);
		this.canClicck = false;
	}

	private setBtnStatu(): void {
		if (SkyLevelModel.ins().rewardTimes >= 1) {
			this.GetRewardBtn0.label = `继续领取(${SkyLevelModel.ins().rewardTimes})`;
		}
		else {
			this.GetRewardBtn0.label = "确定";
		}
		this.arr = SkyLevelModel.ins().dayRewardList.slice();
		this.playResult();
	}


	private arr = [];
	private items: ItemBase[] = [];
	private canClicck: boolean;
	private listCon: eui.Group;
	private maxCount: number = 12;

	private playResult(fun?) {
		let count = this.arr.length > this.maxCount ? this.maxCount : this.arr.length;
		for (let i = 0; i < count; i++) {
			this.items[i] = this.createItem(this.arr[i]);
			let t: egret.Tween = egret.Tween.get(this.items[i]);
			this.items[i].x = (i % 4) * d_distantX + d_firstX;
			this.items[i].y = Math.floor(i / 4) * d_distantY + d_firstY;
			this.items[i].alpha = 0;
			t.wait(i * d_waitTime).to({alpha: 1}, 200).call(
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
		let count = this.arr.length > this.maxCount ? this.maxCount : this.arr.length;
		for (let i = 0; i < count; i++) {
			if (!this.items[i])
				continue;
			let t: egret.Tween = egret.Tween.get(this.items[i]);
			t.to({
				"y": d_depotY,
				"x": d_depotX,
				"scaleX": 0,
				"scaleY": 0
			}, 300 - Math.floor(i / 4) * 50).call(
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
		// item.num = data[2];
		// item.data = data[1];
		item.data = {type:data[0],count:data[2],id:data[1]};
		item.x = d_launchX;
		item.y = d_launchY;

		return item;
	}

	private releaseAllItem() {
		for (let k in this.items) {
			this.items[k].destruct();
			this.listCon.removeChild(this.items[k]);
		}
		this.items = [];
		if (SkyLevelModel.ins().rewardTimes == 0) {
			ViewManager.ins().close(ChallengeDayRewardWin);
		}
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
}
ViewManager.ins().reg(ChallengeDayRewardWin, LayerManager.UI_Main);
