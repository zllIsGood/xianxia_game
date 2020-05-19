/**
 * Created by Administrator on 2017/5/2.
 */
class BoxPayItemRenderer extends BaseItemRender {

	public boxName: eui.Label;
	public t3: eui.Label;
	public payNum: eui.Label;
	public baoxiang: eui.Image;
	public jishi: eui.Label;
	public openDesc: eui.Label;
	public imgNeedle: eui.Image;


	public dataInfo: BoxOpenData;

	public constructor() {
		super();
		this.skinName = `ChestSkinState1`;
	}

	protected dataChanged() {
		let info: TreasureBoxGridConfig = this.data as TreasureBoxGridConfig;
		let level: number = UserFb.ins().guanqiaID;
		egret.Tween.removeTweens(this.imgNeedle);
		this.addEventListener(egret.Event.REMOVED_FROM_STAGE,this.onRemove,this);
		this.imgNeedle.rotation = 0;
		if (info.chapter > level) {
			//格子还未开启
			this.currentState = "kong2";
			this.openDesc.text = `第${info.chapter}关开启`;
		} else {
			//格子已开启
			let openInfo: BoxOpenData = Box.ins().getGridInfoById(info.pos);
			this.dataInfo = openInfo;
			if (openInfo && openInfo.itemId > 0) {
				let boxCfg: TreasureBoxConfig = GlobalConfig.TreasureBoxConfig[openInfo.itemId];
				if (boxCfg)
					this.baoxiang.source = boxCfg.imgClose;
				//有箱子的数据
				if (openInfo.state == 1) {
					if (boxCfg) {
						this.boxName.text = boxCfg.name;
						this.jishi.text = DateUtils.getFormatBySecond(boxCfg.time, 9);
					}
					//1还没倒计时的宝箱
					if (Box.ins().isHaveFreePos()) {
						//有空闲的队列
						this.currentState = "wait2";
					} else {
						//没有空闲的队列
						this.currentState = "wait3";
					}
				} else {
					//2正在倒计时的宝箱
					if (openInfo.getTime() > 0) {
						this.currentState = "wait";
						this.refushDaojishi();
						TimerManager.ins().doTimer(1000, 0, this.refushDaojishi, this);
						this.runTween();
					} else {
						this.currentState = "open";
					}
				}
			} else {
				//当前格子没有格子数据
				this.currentState = "kong";
			}
		}
	}

	public runTween() {
		this.imgNeedle.rotation = 0;
		egret.Tween.removeTweens(this.imgNeedle);
		let t = egret.Tween.get(this.imgNeedle,{loop:true});
		t.to({ "rotation": 360 }, 2000);
	}


	private refushDaojishi(): void {
		let lastTime: number = this.dataInfo.getTime();
		this.t3.text = DateUtils.getFormatBySecond(lastTime);
		let cost: number = BoxModel.ins().countBoxTimeCost(lastTime, this.dataInfo.itemId);
		this.payNum.text = cost + "";
		if (lastTime <= 0) {
			TimerManager.ins().removeAll(this);
			this.currentState = "open";
			this.imgNeedle.rotation = 0;
		}
	}

	private onRemove(){
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE,this.onRemove,this);
		TimerManager.ins().removeAll(this);
		egret.Tween.removeTweens(this.imgNeedle);
	}

}
