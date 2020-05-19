/**
 *
 * 通天塔查看排版
 *
 */
class FBChallengeRankWin extends BaseEuiView {
	private list0:eui.List;
	private myRank:eui.Label;
	private myNum:eui.Label;

	private bgClose:eui.Rect;
	private rankModel:RankModel;
	constructor() {
		super();
		this.skinName = "ChuangtianguanRankSkin";
	}


	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this.bgClose, this.onClick)
		this.rankModel = param[0];
		this.list0.itemRenderer = FBChallengeRankItem;
		this.init();
	}

	public close(...param: any[]): void {
		// this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this.bgClose);
		//this.removeTouchEvent(this.btn_toolbar, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onClick)
		this.removeObserve();
	}

	public init(){
		let copyList:any[] = this.rankModel.getDataList();
		let rankDataList:any[] = [];
		for( let i in copyList ){
			if( !copyList[i].count )
				break;
			rankDataList.push(copyList[i]);
		}
		this.list0.dataProvider = new eui.ArrayCollection(rankDataList);

		let myRankData:any = rankDataList[this.rankModel.selfPos-1];
		let info: FbChallengeConfig;
		let nameCfg: FbChNameConfig;
		if( myRankData ){
			info = GlobalConfig.FbChallengeConfig[myRankData.count];
			nameCfg = GlobalConfig.FbChNameConfig[info.group];
			this.myRank.text = "我的排名："+this.rankModel.selfPos;
		}else{
			let skModel: SkyLevelModel = SkyLevelModel.ins();
			info = GlobalConfig.FbChallengeConfig[skModel.cruLevel];
			nameCfg = GlobalConfig.FbChNameConfig[info.group];
			this.myRank.text = "我的排名：未上榜";
		}
		if( info && nameCfg )
			this.myNum.text =`${nameCfg.name}${info.layer}层`;



	}
	private onClick(e:egret.TouchEvent){
		switch (e.currentTarget){
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}




}
ViewManager.ins().reg(FBChallengeRankWin, LayerManager.UI_Popup);