/**
 * 组队副本子项
 * @author wanghengshuai
 * 
 */
class TeamFbItemRender extends BaseItemRender{
	
	public zhankai:eui.Group;
	public done:eui.Label;
	public createRoomBtn:eui.Button;
	public head:eui.Image;
	public nameTxt:eui.Label;
	public Rewardlist:eui.List;
	public base:eui.Group;
	public fbImg:eui.Image;
	public unlock:eui.Image;
	public lock:eui.Image;
	public fbDesc:eui.Label;
	public redPoint:eui.Image;
	public nameImg:eui.Image;
	public gonglveTxt:eui.Label;

	public text:eui.Label;
	private starList: StarList1;
	private starGroup: eui.Group;

	private _isShow:boolean = false;
	public constructor() {
		super();
		this.skinName = "teamFbItem";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.Rewardlist.itemRenderer = ItemBase;
		this.gonglveTxt.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.gonglveTxt.text}`);
	}

	public dataChanged():void
	{
		//{config:config, passID:UserFb.ins().tfPassID, open:open};
		this.nameImg.source = this.data.config.nameImg;
		this.fbDesc.textFlow = TextFlowMaker.generateTextFlow(this.data.config.infoText);
		this.head.source = this.data.config.bossImg;
		this.Rewardlist.dataProvider = new ArrayCollection(this.data.config.rewardShow);
		this.nameTxt.text = this.data.config.bossName;
		this.fbImg.source = this.data.config.guanqiaImg;

		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);

		this.updateStates();

		if (this.data.open)
		{
			this._isShow = true;
			this.currentState = "zhankai";
		}

		if (!this.starList) {
			this.starList = new StarList1(this.data.config.star);
			this.starList.x = this.starGroup.width - 20;
			this.starList.y = 0;
			this.starGroup.addChild(this.starList);
		} 
		//星数
		this.starList.setStarNum(this.data.config.star);

		let spacing:number  = -40;
		this.text.x += this.data.config.star*spacing;
	}

	private updateStates():void
	{
		this.lock.visible = this.data.config.id > (this.data.passID + 1);
		this.unlock.visible = !this.lock.visible;
		this.redPoint.visible = this.data.config.id == (this.data.passID + 1);
		this.createRoomBtn.visible = this.data.config.id > this.data.passID;
		this.done.visible = this.data.config.id <= this.data.passID;
	}

	private onTap(e:egret.TouchEvent):void
	{
		if (e.target == this.fbImg)
		{
			this._isShow = !this._isShow;
			this.currentState = this._isShow ? "zhankai" : "normal";
			MessageCenter.ins().dispatch(UserFb.TEAM_FB_WIN_REFLASH_PANEL, this, this._isShow);
		}
		else if (e.target == this.createRoomBtn)
		{
			if (GameMap.fbType != 0)
			{
				UserTips.ins().showTips(`正在其他副本中，不能挑战`);
				return;
			}
			
			ViewManager.ins().open(TeamFbRoomWin, this.state, this.data.config.id, 0);
		}
		else if (e.target == this.gonglveTxt)
			ViewManager.ins().open(TeamFbGuideWin, this.data.config.id);
	}

	/** 获得当前boss状态 0 不可挑战，1 可以挑战，2 已挑战 */
	public get state():number
	{
		if (this.data.passID >= this.data.config.id)
			return 2;
		else if (this.data.config.id == (this.data.passID + 1))
			return 1;
		else
			return 0;
	}

	private onRemove(){
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);	
	}
	
}