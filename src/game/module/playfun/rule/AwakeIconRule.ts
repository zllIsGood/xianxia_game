class AwakeIconRule extends RuleIconBase {

	private clipShape: egret.Shape; // 进度遮罩

	constructor(t: egret.DisplayObjectContainer) {
		super(t);

		this.clipShape = new egret.Shape;
		this.clipShape.x = 38;
		this.clipShape.y = 36;
		
		this.tar["maskGroup"].addChild(this.clipShape);
		this.tar["progressImage"].mask = this.clipShape;

		this.updateMessage = [
			UserTask.ins().post9012Event,
			UserTask.ins().post9013Event,
			Actor.ins().postLevelChange,	
		];
	}

	checkShowIcon(): boolean {
		let isShow: boolean = OpenSystem.ins().checkSysOpen(SystemType.AWAKE_TASK) 
								&& !UserTask.ins().isAwakeDone()
								&& !SpecialRing.ins().isFireRingActivate();

		return isShow;
	}

	checkShowRedPoint(): number {
		let data: [number,number,number] = UserTask.ins().checkAwakeRedPoint();
		let count: number = data[0];
		let index: number = data[1];
		let len: number = data[2];

		let awakeTaskConf = UserTask.ins().getAwakeTypeConf(UserTask.ins().awakeData.taskGroupId);
		if (awakeTaskConf) {
			// 顺便更新按钮显示
			this.tar["num"].text = `${index}/${len}`;
			this.tar["Icon"].source = awakeTaskConf.enterIcon;
		}
		DisplayUtils.drawCir(this.clipShape,38,index/len*359.8-90,false,-90);

		return count;
	}

	getEffName(redPointNum: number): string {
		this.effParent = this.tar["eff"];
		this.effX = 0;
		this.effY = 0;
		return "awakeeff";
	}

	tapExecute(): void {
		ViewManager.ins().open(RingAwakeWin);
	}
}