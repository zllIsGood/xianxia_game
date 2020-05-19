/**
 * Created by Administrator on 2017/3/3.
 */
class RuneExchangePanel extends BaseView {
	/** 当前选择的角色 */
	public curRole: number;
	public menulist0: eui.List;
	public _scrollV:number = 0;

	public constructor() {
		super();
		this.skinName = "RuneSkinExchange";
	}

	public childrenCreated(): void{
		this.init();
	}

	public init(): void {
		this.menulist0.itemRenderer = RuneExchangeItemRenderer;
	}

	public open(...param: any[]): void {
		//碎片变化
		this.observe(GameLogic.ins().postRuneExchange, this.updateList);
		this.addTouchEvent(this.menulist0, this.onListTap);

		//更新数据
		this.updateList();
	}

	public close(...param: any[]): void {
		this.removeObserve();
		for( let i = 0;i < this.menulist0.numElements;i++ ){
			let render:RuneExchangeItemRenderer = this.menulist0.getVirtualElementAt(i) as RuneExchangeItemRenderer;
			if (render) {
				render.close();
			}
		}
	}

	private updateList(): void {
		let data: RuneConverConfig[] = RuneConfigMgr.ins().getExchangeDataList();
		this.menulist0.dataProvider = new eui.ArrayCollection(data);

		let scro:eui.Scroller = this.menulist0.parent as eui.Scroller;
		scro.validateNow();
		scro.stopAnimation();
		this.menulist0.scrollV = this._scrollV;
	}

	private onListTap(e: egret.Event): void {
		if (e.target.name != "goBtn") {
			return;
		}
		//获取点击项数据
		let cfg: RuneConverConfig = this.menulist0.selectedItem as RuneConverConfig;
		if (!cfg || (cfg && cfg.conversion > Actor.runeExchange)) {
			UserWarn.ins().setBuyGoodsWarn(500008, cfg.conversion-Actor.runeExchange);
			UserTips.ins().showTips(`道具不足`);
			return;
		}
		if(SkyLevelModel.ins().lastPass || SkyLevelModel.ins().cruLevel >= cfg.checkpoint){

		}else{
			UserTips.ins().showTips(`通关等级不足`);
			return;
		}
		//发送协议 兑换符文
		Rune.ins().sendExchangeRune(cfg.id);
		this._scrollV = this.menulist0.scrollV;
	}
}