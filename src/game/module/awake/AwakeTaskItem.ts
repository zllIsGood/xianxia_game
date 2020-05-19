/*
    file: src/game/module/awake/AwakeTaskItem.ts
    date: 2018-9-10
    author: solace
    descript: 唤醒任务界面选择项
*/
class AwakeTaskItem extends BaseItemRender {

	private taskNameTxt: eui.Label;
	private progTxt: eui.Label;
	private stateTxt: eui.Label;
	private goBtn: eui.Button;
	private redPoint: eui.Image;
	private taskIcon: ItemBase;


	constructor() {
		super();
		this.skinName = "AwakeItemSkin";

		this.goBtn.addEventListener(egret.TouchEvent.TOUCH_END,this.onGoBtnClick,this);
	}

	public dataChanged(): void {
		// console.log(this.data);
		let config: FunOpenTaskListConfig = this.data.config;
		let srvData = this.data.srvData;
		// console.log(config);

		this.taskNameTxt.text = config.desc;
		this.progTxt.text = `(${srvData.curCount}/${config.target})`;
		this.progTxt.textColor = srvData.curCount>=config.target?0x00ff00:0xed173c;

		// 奖励道具显示
		this.taskIcon.isShowName(false);
		this.taskIcon.data = config.awardList[0];

		//按钮状态
		this.stateTxt.visible = srvData.state==2;
		this.redPoint.visible = srvData.state==1;
		this.goBtn.label = srvData.state==0?'前往':'领取';
		this.goBtn.visible = srvData.state!=2;
	}

	private onGoBtnClick(): void{
		if (this.data.srvData.state == 0){ // 进行任务
			switch (this.data.config.control) {
				case 1:
					ViewManager.ins().open(this.data.config.controlTarget[0], this.data.config.controlTarget[1]);
					break;
				case 2:
					GameGuider.challengeBoss();
					break;
				default:
					ViewManager.ins().close(AwakeWin);
					break;
			}
		}else if (this.data.srvData.state == 1){ // 领取奖励
			UserTask.ins().c9014(this.data.srvData.id);
		}
	}
}