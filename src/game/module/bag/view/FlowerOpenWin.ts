/**
 * 送花记录界面
 * @author wanghengshuai
 * 
 */
class FlowerOpenWin extends BaseEuiView{
	
	public scroller:eui.Scroller;
	public list:eui.List;
	public charmCount:eui.Label;
	public closeBtn:eui.Button;
	public closeBtn0:eui.Button;
	public jumpRank:eui.Label;

	private _collect:ArrayCollection;

	public constructor() {
		super();
		this.skinName = "flowerOpenSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.list.itemRenderer = FlowerRewardItemRender;
	}

	public open(...args:any[]):void
	{
		this.jumpRank.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.jumpRank.text}</u></a>`);
		this.addTouchEvent(this.closeBtn, this.onTouch);
		this.addTouchEvent(this.closeBtn0, this.onTouch);
		this.addTouchEvent(this.jumpRank, this.onJumpTouch);
		this.observe(UserFb.ins().postTeamFbFlowarRecords, this.update);

		this.update();
	}

	public close():void
	{
		UserFb.ins().clearTfFlowerRecords();

		let win:PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (win)
			win.removeFlowerItem();
	}

	private update():void
	{
		if (!this._collect)
		{
			this._collect = new ArrayCollection();
			this.list.dataProvider = this._collect;
		}

		let source:{roleName:string, id:number,count:number}[] = UserFb.ins().tfFlowerRecords.concat();
		source.reverse();
		this._collect.source = source;
		
		let len:number = source.length;
		let total:number = 0;
		let config = GlobalConfig.TeamFuBenBaseConfig.flowerValue;

		for (let i:number = 0; i < source.length; i++){
			for (let j in config){
				if (source[i].id == parseInt(j)){
					total += (source[i].count * config[j]);
				}
			}
		}

		this.charmCount.text = "你的魅力提高了 " + total + " 点";
	}

	private onTouch(e:egret.TouchEvent):void
	{
		ViewManager.ins().close(this);
	}

	private onJumpTouch(e:egret.TouchEvent):void{
		ViewManager.ins().open(RankingWin,6);
		ViewManager.ins().close(this);
	}

}

ViewManager.ins().reg(FlowerOpenWin, LayerManager.UI_Popup);
