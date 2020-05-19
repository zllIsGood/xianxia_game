class DoubleElevenIconRule extends RuleIconBase{

	private firstTap: boolean = true;

	public constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Activity.ins().postActivityIsGetAwards,
			Actor.ins().postYbChange,
			Actor.ins().postLevelChange,
			Recharge.ins().postUpdateRecharge,
			Recharge.ins().postRechargeTotalDay,
			Recharge.ins().postUpdateRechargeEx,
			Activity.ins().postSpecials
		];
	}

	checkShowIcon(): boolean {
		if(!OpenSystem.ins().checkSysOpen(SystemType.DOUBLEELEVEN)){
			return false;
		}

		for (var k in Activity.ins().doubleElevenData)
		{
			if (Activity.ins().doubleElevenData[k].isOpenActivity())
				return true;
		}

		return false;
	}

	checkShowRedPoint(): number {
		let data = Activity.ins().doubleElevenData;
		for (var k in Activity.ins().doubleElevenData)
		{
			if (data[k].canReward())
			{
				if (Activity.ins().doubleElevenSpecialIDs.indexOf(data[k].id) != -1)
				{
					if ((data[k] as ActivityType2Data).isSpecialOpen())
						return 1;
				}
				else if (data[k].isOpenActivity())
					return 1;
			}
		}

		return 0;
	}

	getEffName(redPointNum: number): string {
		if (this.firstTap || redPointNum) {
			this.effX = 38;
			this.effY = 55;
			return "actIconCircle";
		}
		return undefined;
	}

	tapExecute(): void {
		ViewManager.ins().open(DoubleEleventWin);
		this.firstTap = false;
		this.update();
	}
}