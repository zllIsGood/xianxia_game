/**
 * 限时任务
 */
class LimitTaskView extends BaseEuiView {

	private list: eui.List;

	private link: eui.Label;
	private time: eui.Label;
	private roleSelect: RoleSelectPanel;
	// private expLabel: eui.Label;
	// private expBar: eui.ProgressBar;
	private viewBtn: eui.Button;
	private link0: eui.Label;
	private link4: eui.Label;
	private link6: eui.Label;
	private link8: eui.Label;

	// private barbc = new ProgressBarEff();
	private expBar: eui.ProgressBar;

	private EffectGroup: eui.Group;
	private effArr: MovieClip[];

	private title0: eui.Group;
	private title1: eui.Group;
	private title2: eui.Group;
	private closeBtn:eui.Button;
	constructor() {
		super();

		this.skinName = "limittime";
		this.name = "限时任务";
		this.isTopLevel = true;//设为1级UI
		// this.init();
	}

	public open(): void {
		this.addTouchEvent(this.list, this.onTouch);
		this.addTouchEvent(this.viewBtn, this.onTouch);
		this.addTouchEvent(this.closeBtn, this.onTouch);
		this.observe(UserTask.ins().postUpdteLimitTaskData, this.setPanel);
		this.observe(UserTask.ins().postUpdteLimitTaskData, this.updateFly);
		// this.barbc.reset();
		this.setPanel();

		// if (UserTask.ins().limitTaskState == 0) {
		// 	UserTask.ins().sendGetLimitTask();
		// }
	}
	public close(): void {
		TimerManager.ins().remove(this.runTime, this);
		this.removeTouchEvent(this.list, this.onTouch);
		this.removeTouchEvent(this.viewBtn, this.onTouch);
		this.removeTouchEvent(this.closeBtn, this.onTouch);
		// MessageCenter.ins().removeListener(MessagerEvent.UPDATA_TASK,this.setPanel,this);


		this.removeObserve();
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.viewBtn:
				ViewManager.ins().open(RoleWin, 1);
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}

	private setPanel(): void {
		let list = this.sortList();

		this.list.dataProvider = new eui.ArrayCollection(list);

		let taskId = UserTask.ins().currTaskListsId;
		let config: LimitTimeConfig = GlobalConfig.LimitTimeConfig[taskId];
		if( !config ){
			UserTips.ins().showCenterTips("限时任务id:"+taskId+"不存在限时任务表中");
			return;
		}
		let str: string = "";
		if (config.openZhuan > 0) {
			str = `${config.openZhuan}转`;
		} else {
			str = `${config.openLevel}级`;
		}

		var titleArr = ['title0', 'title1', 'title2'];
		for (let i = 0; i < titleArr.length; i++) {
			if (i == taskId - 1) {
				this[titleArr[i]].visible = true;
			} else {
				this[titleArr[i]].visible = false;
			}
		}

		for (let i = 0; i < 8; i++) {
			this[`item${i}`].redPoint.visible = false;
		}

		this.link0.text = str;
		this.expBarChange();
		this.itemChange();
		this.updateAttr();
		if (UserTask.ins().limitTaskEndTime - Math.floor(GameServer.serverTime / 1000) > 0) {
			this.runTime();
			TimerManager.ins().doTimer(1000, 0, this.runTime, this);
		} else {
			this.time.text = "活动已过期";
		}
	}

	private runTime(): void {
		let time: number = UserTask.ins().limitTaskEndTime - Math.floor(GameServer.serverTime / 1000);
		if (time >= 0) {
			this.time.text = DateUtils.getFormatBySecond(time, 1)
		} else {
			this.time.text = "活动已过期";
			TimerManager.ins().remove(this.runTime, this);
		}
	}

	private expBarChange(): void {
		let maxCount: number = UserTask.ins().limitTaskList.length;
		let currCount: number = UserTask.ins().limitTaskCount;

		if (this.expBar.maximum != maxCount) {
			this.expBar.maximum = maxCount;
		}
		this.expBar.value = currCount;

		if (currCount == 0) {
			this.playAllEffect();
		} else {
			this.removeAllEffect();
		}
	}

	private itemChange() {
		let list = UserTask.ins().limitTaskList;
		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			let punchItem = this[`item${i}`] as PunchEquipItemBase;
			if (item.state == 2) {
				punchItem.visible = false;
			} else {
				punchItem.visible = true;
			}
			var award = item.awardList[0];
			punchItem.data = award;
			punchItem.destruct();
			punchItem.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchItem, this);
		}
	}

	private updateAttr() {
		let config: TogetherHitEquipQmConfig[][][] = GlobalConfig.TogetherHitEquipQmConfig;
		let award = UserTask.ins().limitTaskList[0].awardList[0];
		let awardConfig = GlobalConfig.ItemConfig[award.id];
		let lv = awardConfig.zsLevel || 0;
		for (let k in config) {
			if (k + "" == lv + "") {
				for (let l in config[k]) {
					let obj = config[k][l];
					for (let m in obj) {
						if (m + "" == "3") {
							this.link4.textFlow = TextFlowMaker.generateTextFlow1(obj[m].desc);
						} else if (m + "" == "5") {
							this.link6.textFlow = TextFlowMaker.generateTextFlow1(obj[m].desc);
						} else {
							this.link8.textFlow = TextFlowMaker.generateTextFlow1(obj[m].desc);
						}
					}
				}
				break;
			}
		}
	}

	private onTouchItem(e: egret.TouchEvent) {
		let item = e.currentTarget as PunchEquipItemBase;
		var award = item.data;
		ViewManager.ins().open(HejiEquipTipsWin, award, false);
	}

	private sortList(): any {
		let list = UserTask.ins().limitTaskList;
		return list;//完成的位置不变
		let rewardList = [];
		let noRewardList = [];
		for (let i: number = 0; i < list.length; i++) {
			if (list[i].state == 1) {
				rewardList.push(list[i]);
			} else {
				noRewardList.push(list[i]);
			}
		}
		return rewardList.concat(noRewardList.sort(this.sort));
	}

	public initUI(): void {
		super.initUI();
		this.list.itemRenderer = LimitTaskItem;
		this.time.text = "";

		// this.setSkinPart('roleSelect', new RoleSelectPanel());
		// for (let i = 0; i < 8; i++) {
		// 	this.setSkinPart(`item${i}`, new PunchEquipItemBase());
		// }
		this.expBar.slideDuration = 0;
		this.effArr = []
		for (let i: number = 0; i < 8; i++) {
			let eff = new MovieClip();
			eff.x = 177;
			eff.y = 174;
			eff.rotation = i * 45;
			eff.touchEnabled = false;
			this.effArr.push(eff);
		}
	}

	private sort(a: LimitTaskData, b: LimitTaskData): number {
		let s1: number = a.state;
		let s2: number = b.state;
		return Algorithm.sortAsc(s1, s2);
	}

	private playAllEffect(): void {
		for (let i: number = 0; i < this.effArr.length; i++) {
			if (!this.effArr[i].parent) {
				this.effArr[i].playFile(RES_DIR_EFF + "hejizbjihuoeff", -1);
				this.EffectGroup.addChild(this.effArr[i]);
			}
		}
	}

	private removeAllEffect(): void {
		for (let i: number = 0; i < this.effArr.length; i++) {
			if (this.effArr[i].parent) {
				DisplayUtils.removeFromParent(this.effArr[i]);
			}
		}
	}

	private updateFly(taskData?) {
		if (taskData && taskData.state == 2) {
			let index = UserTask.ins().limitTaskList.indexOf(taskData);
			if (index >= 0) {
				this.addFly(index);
			}
		}
	}

	private addFly(index) {
		let item = this[`item${index}`] as BaseComponent;

		let newItem = new PunchEquipItemBase();
		newItem.currentState = item.currentState;
		newItem.anchorOffsetX = item.width / 2;
		newItem.anchorOffsetY = item.height / 2;
		newItem.scaleX = 0.53;
		newItem.scaleY = 0.53;
		newItem.alpha = 0.8;

		let par = item.parent;

		let p: egret.Point = new egret.Point();

		// par.localToGlobal(item.x+item.width*0.53/2,item.y+item.height*0.53/2,p);
		// console.log("p:",p);

		par.parent.localToGlobal(par.x + (item.x + item.width / 2) * 0.53, par.y + (item.y + item.height / 2) * 0.53, p);

		this.globalToLocal(p.x, p.y, p);

		newItem.x = p.x;
		newItem.y = p.y;

		this.addChild(newItem);

		var award = UserTask.ins().limitTaskList[index].awardList[0];
		newItem.validateNow();
		newItem.data = award;

		let uiview2 = ViewManager.ins().getView(UIView2) as UIView2;
		let roleBtn = uiview2.getToggleBtn(0);
		let tar: egret.Point = new egret.Point();
		roleBtn.parent.localToGlobal(roleBtn.x + roleBtn.width / 2, roleBtn.y + roleBtn.height / 2, tar);

		let tw = egret.Tween.get(newItem);
		tw.to({ scaleX: 0.8, scaleY: 0.8 }, 300).to({ x: p.x + 30 }, 50).to({ x: p.x - 30 }, 50).to({ x: p.x + 30 }, 50).to({ x: p.x - 30 }, 50)
			.to({ x: p.x + 30 }, 50).to({ x: p.x - 30 }, 50).to({ x: p.x + 30 }, 50).to({ x: p.x - 30 }, 50)
			.to({ x: p.x }, 25).to({ x: tar.x, y: tar.y, scaleX: 0.15, scaleY: 0.15 }, 800).call(() => {
				if (newItem.parent) {
					newItem.parent.removeChild(newItem);
				}
			});
	}

	public static openCheck(...param: any[]): boolean {
		if( UserTask.ins().currTaskListsId > 0 )
			return true;
		ViewManager.ins().open(BossWin,2);

		return false;
	}
}

ViewManager.ins().reg(LimitTaskView, LayerManager.UI_Main);