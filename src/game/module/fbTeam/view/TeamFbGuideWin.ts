/**
 * 组队副本攻略
 * @author wanghengshuai
 * 
 */
class TeamFbGuideWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public fbName:eui.Label;
	public scroll:eui.Scroller;
	public list:eui.List;

	private _roomId:number;

	private _collect:ArrayCollection;

	public constructor() {
		super();
		this.skinName = "teamFbGuideSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.list.itemRenderer = TeamFbGuideItemrender;
	}

	public open(...args:any[]):void
	{
		this._roomId = args[0];

		this.addTouchEvent(this.bgClose, this.onTouch);

		this.update();
	}

	public close():void
	{
		this.removeTouchEvent(this.bgClose, this.onTouch);
	}

	private update():void
	{
		this.fbName.text = GlobalConfig.TeamFuBenConfig[this._roomId].name;
		if (!this._collect)
		{
			this._collect = new ArrayCollection();
			this.list.dataProvider = this._collect;
		}

		let len:number = Object.keys(GlobalConfig.TeamFuBenGuideConfig[this._roomId]).length;
		let datas:TeamFuBenGuideConfig[] = [];
		for (let i:number = 1; i <= len; i++)
			datas.push(GlobalConfig.TeamFuBenGuideConfig[this._roomId][i]);

		this._collect.source = datas;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(TeamFbGuideWin, LayerManager.UI_Main);