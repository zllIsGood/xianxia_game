/**
 * Created by MPeter on 2018/3/5.
 * 魔界入侵-结算界面
 */
class DevildomResultWin extends BaseEuiView {
	/////////////////皮肤组件部分///////////////////
	private closeBtn: eui.Button;
	private effGroup: eui.Group;
	private title: eui.Image;
	private winnerGroup: eui.Group;
	private roleIcon: eui.ToggleButton;
	private belongTxt: eui.Label;
	private saleList: eui.List;
	private rewardLabel: eui.Label;
	private rewardList: eui.List;
	private saleLabel: eui.Label;

	private quitTime: number = 30;

	public constructor() {
		super();
		this.skinName = `KFInvasionResultSkin`;
	}

	protected childrenCreated(): void {
		this.init();
	}


	

	public init() {
		
		
		this.saleList.itemRenderer = ItemBase;
		this.rewardList.itemRenderer = ItemBase;
	}

	public open(...param): void {
		this.addTouchEvent(this.closeBtn, this.onCloseWin);

		let winer: CharRole = EntityManager.ins().getEntityByHandle(param[0]);
		if (winer) {
			let info = <Role>winer.infoModel;

			let tname: string = info.name;
			tname = StringUtils.replaceStr(tname, "0xffffff", ColorUtil.ROLENAME_COLOR_GREEN + "");
			this.belongTxt.textFlow = TextFlowMaker.generateTextFlow1(`${tname}【${info.guildName}】`);
			this.roleIcon.icon = `main_role_head${info.job}`;
		}
		else {
			this.belongTxt.textFlow = TextFlowMaker.generateTextFlow1(`${param[1]}`);
		}

		this.roleIcon['jobImg'].visible = false;


		//是否为归属者
		if (!param[2]) {
			this.rewardLabel.text = `我的参与奖：`;
		}

		let saleRewards: RewardData[] = param[3];
		this.saleList.dataProvider = new eui.ArrayCollection(saleRewards);
		if (saleRewards.length == 0) this.saleLabel.text = `行会拍卖品：无`;

		let rewards: RewardData[] = param[4];
		this.rewardList.dataProvider = new eui.ArrayCollection(rewards);


		TimerManager.ins().doTimer(1000, this.quitTime + 1, this.onTimer, this);
		this.onTimer();

	}

	public close(...param): void {
		TimerManager.ins().removeAll(this);
	}

	private onCloseWin(): void {
		ViewManager.ins().close(this);
		UserFb.ins().sendExitFb();
	}

	private onTimer(): void {
		this.closeBtn.label = `确定(${--this.quitTime})`;
		if (this.quitTime <= 0) {
			this.onCloseWin();
		}
	}

}
ViewManager.ins().reg(DevildomResultWin, LayerManager.UI_Popup);
