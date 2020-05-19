/**
 * 跨服竞技场排行
 */
class KfArenaRankPanel extends BaseEuiView {
	/**我的排名*/
	public selfPos0: eui.Label;
	/**我的排名三个角色*/
	public rank1: RoleItemRenderer;
	public rank2: RoleItemRenderer;
	public rank0: RoleItemRenderer;
	/**排名列表*/
	public list: eui.List;
	/**暂无人上榜*/
	public state: eui.Label;

	////////////第一名相关组件////////////////////////////
	public firstGroup: eui.Group;
	public serverId0: eui.Label;
	public vip0: eui.Image;
	public firstNameTxt0: eui.Label;
	public score0: eui.Label;
	public seasonTitle0: eui.Label;

	/**排行数据*/
	private rankDatas: eui.ArrayCollection;
	private firstData: KfArenaRankData;
	private fristView: boolean = false;

	constructor() {
		super();
		this.name = `竞技排行`;
	}


	

	public init() {
		
		this.list.itemRenderer = KfArenaRankItemRender;
		this.rankDatas = new eui.ArrayCollection();
		this.list.dataProvider = this.rankDatas;

		this.rank0.index = 0;
		this.rank1.index = 1;
		this.rank2.index = 2;

		this.firstGroup.visible = false;
		this.firstGroup.touchChildren = false;
		this.state.visible = true;

	}
	protected childrenCreated() {

		this.init();
	}

	public open(...args): void {
		this.observe(KfArenaSys.ins().postRank, this.upData);
		this.observe(UserReadPlayer.ins().postPlayerResult, this.openOtherPlayer);

		this.addTouchEvent(this.list, this.onViewPlayer);
		this.addTouchEvent(this.firstGroup, this.onViewPlayer);
		KfArenaSys.ins().sendRank();
	}

	public close(): void {
		this.removeObserve();
		this.rank0.data = null;
		this.rank1.data = null;
		this.rank2.data = null;
		this.firstGroup.visible = false;
		this.firstGroup.touchChildren = false;
		this.state.visible = true;
		this.fristView = false;
	}


	private upData(): void {
		this.firstData = KfArenaSys.ins().rankDataList.shift();
		this.rankDatas.replaceAll(KfArenaSys.ins().rankDataList);
		this.selfPos0.text = KfArenaSys.ins().ownRank > 0 ? KfArenaSys.ins().ownRank : `未上榜`;

		if (!this.firstData)return;
		//第一名数据
		this.firstGroup.visible = true;
		this.state.visible = false;
		this.serverId0.text = `S${this.firstData.servId}`; 
		this.vip0.visible = this.firstData.vip > 0;
		this.firstNameTxt0.text = this.firstData.playerName;
		this.score0.text = this.firstData.score + "";
		this.seasonTitle0.text = GlobalConfig.CrossArenaBase.scoreMetalName[this.firstData.dan - 1];

		UserReadPlayer.ins().sendFindPlayer(this.firstData.playerId, this.firstData.playerName);
	}

	private onViewPlayer(e: egret.TouchEvent): void {
		//查看玩家
		if (e.target instanceof KfArenaRankItemRender) {
			let data = <KfArenaRankData>this.list.selectedItem;
			if (data) UserReadPlayer.ins().sendFindPlayer(data.playerId, data.playerName);
		}
		else if (e.target == this.firstGroup && this.firstData) {
			UserReadPlayer.ins().sendFindPlayer(this.firstData.playerId, this.firstData.playerName);
		}
	}

	private openOtherPlayer(otherPlayerData: OtherPlayerData): void {
		if (!this.fristView) {
			//展示当前第一名玩家信息
			this.rank0.data = {otherPlayerData: otherPlayerData};
			this.rank1.data = {otherPlayerData: otherPlayerData};
			this.rank2.data = {otherPlayerData: otherPlayerData};
			this.fristView = true;
		}
		else {
			let win = <RRoleWin>ViewManager.ins().open(RRoleWin, otherPlayerData);
			win.hideEx(2);
		}
	}

}
