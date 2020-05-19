/**
 * 引导工具类，根据每个项目重写实现可重写实现
 */
class GuideUtils extends BaseClass {

	public static ins(): GuideUtils {
		return super.ins() as GuideUtils;
	}

	protected isInit: boolean;
	protected view: GuideView;
	protected step: number = 0;
	protected part: number = 0;
	protected wrongCount: number = 0;
	protected maxWrongCount: number = 2;
	private cfg: any[][];
	public curCfg: GuideConfig;
	private overs: GuideCondition[];
	public constructor() {
		super();
	}

	public init() {
		if (this.isInit) return;
		this.isInit = true;

		if (Setting.currPart == 0) {
			this.part = 1;
			this.step = 1;
		}
		else {
			this.part = Setting.currPart;
			this.step = Setting.currStep;
		}

		this.cfg = [];
		let temp: any;
		for (let i in GlobalConfig.GuideConfig) {
			temp = [];
			for (let j in GlobalConfig.GuideConfig[i]) {
				temp.push(GlobalConfig.GuideConfig[i][j]);
			}
			this.cfg.push(temp);
		}

		if (this.part <= this.cfg.length) {
			let len: number = this.cfg[this.part - 1].length - 1;
			this.overs = this.cfg[this.part - 1][len].overs;
		}
		
		if (this.part <= this.cfg.length) {
			MessageCenter.addListener(UserTask.ins().postUpdteTaskTrace, this.updateByTask, this);
		}
	}

	/** 任务的引导 */
	private updateByTask() {
		this.guideOver();
		this.update(1);
	}

	/**点击任务之后的引导 */
	public updateByClick() {
		this.update(2);
	}

	/** 根据某些出现触发引导*/
	public updateByAppear() {
		this.update(3);
	}


	private canShow(): boolean {
		if(Assert(this.cfg,`新手引导未初始化就调用 canShow()`)) {
			return false;
		}
		if (this.part > this.cfg.length) {
			MessageCenter.ins().removeAll(this);
			return false;
		}
		if (this.view && this.view.parent)
			return false;
		return true;
	}

	private checkShow():boolean {
		if(!this.curCfg) return false;
		try {
			let displayObject = this.getDisplayObj(this.part, this.step);
			if (!displayObject) {
				return false;
			}
		} catch (e) {
			return false;
		}
		return true;
	}

	private addTimeHandler() {
		if(!TimerManager.ins().isExists(this.timeHandler,this)) {
			TimerManager.ins().doTimer(50,0,this.timeHandler,this);
		}
	}

	private removeTimeHandler() {
		TimerManager.ins().remove(this.timeHandler,this);
	}

	private timeHandler(){
		if(this.canShow()) {
			if(this.checkShow()) {
				this.show(this.part, this.step);
			}
		} else {
			this.removeTimeHandler();
		}
	}

	/**根据任务状态判断引导是否结束 */
	private guideOver() {
		let data: AchievementData = UserTask.ins().taskTrace;
		if (this.overs && data && data.state == 0) {
			let len: number = this.overs.length;
			for (let i = 0; i < len; i++) {
				let over: GuideCondition = this.overs[i];
				if (over.type == 1 && over.value == data.id) {
					this.readyForNext();
					this.close();
					return;
				}
			}
		}
	}
	private update(type: number = 0) {
		if (this.canShow() == false) return;
		this.curCfg = this.cfg[this.part - 1][this.step - 1];
		if (!this.curCfg || !this.curCfg.start) return;
		if (type == 1) {
			if (this.curCfg.start.type == 1) {
				let data: AchievementData = UserTask.ins().taskTrace;
				if (data.id == this.curCfg.start.value)
					if (data.state == 0)
						GuideUtils.ins().show(this.part, this.step);
			}
			else if (this.curCfg.start.type == 3) {
				let data: AchievementData = UserTask.ins().taskTrace;
				if (data.id == this.curCfg.start.value && data.state == 1)
					GuideUtils.ins().show(this.part, this.step);
			}
		}
		else if (type == 2) {
			if (this.curCfg.start.type == 2) {
				let data: AchievementData = UserTask.ins().taskTrace;
				if (data.id == this.curCfg.start.value && data.state == 0)
					GuideUtils.ins().show(this.part, this.step);
			}
		}
		else if (type == 3) {
			if ( this.curCfg.start.type == 4) {
				GuideUtils.ins().show(this.part, this.step);
			}
		}
	}

	//-----------------------------------------------------------------
	/**
	 * 显示
	 */
	public show(part: number, step: number): void {
		this.part = part;
		this.step = step;

		let cfg = this.cfg[this.part-1];
		if(cfg) {
			this.curCfg = this.cfg[this.part - 1][this.step - 1];
		} else {
			this.curCfg = null;
		}

		if(!this.curCfg) {
			this.readyForNext();
			this.close();
			return;
		}

		if (!this.checkShow()) {
			this.close();
			this.addTimeHandler();
			return;
		}

		if (this.view == null) {
			this.view = new GuideView();
		}
		this.view.clickCD = true;
		if (!this.view.hasEventListener(egret.Event.CHANGE))
			this.view.addEventListener(egret.Event.CHANGE, this.next, this);
		this.save();

		let displayObject: egret.DisplayObject;
		try {
			displayObject = this.getDisplayObj(part, step);
		} catch (e) {
			if (this.wrongCount >= this.maxWrongCount) {
				// Assert(false, `新手引导:${part},${step}出错,跳过`);
				this.close();
				return;
			} else {
				this.wrongCount++;
				this.view.close();
				console.log(`新手引导:${part},${step}出错,重新播放`);
				TimerManager.ins().doTimer(300, 1, () => {
					this.show(part, step - 1);
				}, this);
				return;
			}
		}
		if (displayObject) {
			console.log(`播放新手引导:${part},${step}`);
			TimerManager.ins().doNext(() => {
				this.view.show(displayObject);
				StageUtils.ins().getStage().addChild(this.view);
			}, this);

		}
		else {
			this.readyForNext();
			this.close();
		}

	}

	public clickOut(): void {
		if (this.curCfg && this.curCfg.type == 1) {
			this.readyForNext();
			this.close();
		}
	}
	private readyForNext(): void {
		this.part++;
		this.step = 1;
		if (this.part <= this.cfg.length) {
			let len: number = this.cfg[this.part - 1].length - 1;
			this.overs = this.cfg[this.part - 1][len].overs;
		}
		else
			this.overs = null;
		this.curCfg = null;
	}

	protected close(): void {
		if (this.view) {
			DisplayUtils.removeFromParent(this.view);
			this.view.close();
			this.view.removeEventListener(egret.Event.CHANGE, this.next, this);
			this.wrongCount = 0;
		}
		this.removeTimeHandler();
	}

	//-------------------------------------------------------------需要复写的函数
	//下一步
	protected next(): void {
		TimerManager.ins().doNext(() => {
			this.show(this.part, this.step + 1);
		}, this);
	}

	/**保存设置 */
	protected save(): void {
		//这是一个例子:
		if (this.step == 1) {
			//ViewManager.ins().closeTopLevel();
			// Setting.ins().sendSaveGuide(this.part + 1, 1);
			Setting.ins().setValue(ClientSet.guidePart, this.part+1);
			Setting.ins().setValue(ClientSet.guideStep, 1);
		}
	}

	/**获取焦点显示对象 */
	protected getDisplayObj(part: number, step: number): egret.DisplayObject {
		let displayObject: egret.DisplayObject;
		let cfg: GuideConfig;
		if (this.cfg[part - 1] && step <= this.cfg[part - 1].length) {
			cfg = this.cfg[part - 1][step - 1];
			displayObject = eval('ViewManager.ins().getView(' + cfg.view + ')' + '.' + cfg.target);
		}
		//这是一个例子:
		// switch (part) {
		// 	case GuiderId.Equip://角色装备引导
		// 		if (step == 1) {
		// 			displayObject = (ViewManager.ins().getView(UIBottomView2) as UIBottomView2).getToggleBtn(UIBottomView2.NAV_ROLE);
		// 		} else if (step == 2) {
		// 			displayObject = (ViewManager.ins().getView(RoleWin) as RoleWin).getEquipGrid(EquipPos.WEAPON);
		// 		} else if (step == 3) {
		// 			displayObject = (ViewManager.ins().getView(RoleEquipTipsWin) as RoleEquipTipsWin).getEquipBtn();
		// 		} else if (step == 4) {
		// 			displayObject = (ViewManager.ins().getView(RoleEquipSelectWin) as RoleEquipSelectWin).getListItem(1).getEuipBtn();
		// 		} else if (step == 5) {
		// 			displayObject = (ViewManager.ins().getView(RoleWin) as RoleWin).getCloseBtn();
		// 		}
		// 		break;
		// }
		return displayObject;
	}

}
namespace GameSystem {
	export let  guideUtils = GuideUtils.ins.bind(GuideUtils);
}

