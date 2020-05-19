/**
 * 组队副本
 * @author wanghengshuai
 * 
 */
class TeamFbNewPanel extends BaseEuiView{

	public FbScroller:eui.Scroller;
	public Fblist:eui.DataGroup;

	private _collect:ArrayCollection;

	private _firstOpen:boolean;

	private _index:number = 0;

	public constructor() {
		super();
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.Fblist.itemRenderer = TeamFbItemRender;
	}

	public open(...args:any[]):void
	{
		this.observe(UserFb.ins().postFTRoomPassInfo, this.update);

		MessageCenter.ins().addListener(UserFb.TEAM_FB_WIN_REFLASH_PANEL, this.listFresh, this);

		this._firstOpen = true;
		this.update();

		UserFb.ins().postShowRedChange(false);

		UserFb.ins().zuDuiRed = false;
	}

	public close():void
	{
		TimerManager.ins().removeAll(this);
	}

	private listFresh(obj, param):void
	{
		if (!this._collect)
			return;
		
		if (obj.itemIndex == this._collect.length - 1) 
		{
			let itemHeight: number = UserFb.TF_EXPAND_HEIGHT - UserFb.TF_SIMLPE_HEIGHT;
			if (param == true) {
				this.Fblist.scrollV = this.Fblist.contentHeight - this.Fblist.height + itemHeight;
			} else {
				this.Fblist.scrollV = this.Fblist.contentHeight - this.Fblist.height - itemHeight;
			}
			this.Fblist.validateNow();
		}

	}

	private update():void
	{
		//boss信息
		if (!this._collect)
		{
			this._collect = new ArrayCollection();
			this.Fblist.dataProvider = this._collect;
		}

		let len:number = Object.keys(GlobalConfig.TeamFuBenConfig).length;
		let source:any[] = [];
		let index:number = 0;
		let open:boolean;
		for (let i:number = 0; i < len; i++)
		{
			open = GlobalConfig.TeamFuBenConfig[i + 1].id == (UserFb.ins().tfPassID + 1);
			if (open)
				this._index = i;
			
			source.push({config:GlobalConfig.TeamFuBenConfig[i + 1], passID:UserFb.ins().tfPassID, open:open});
		}

		this._collect.source = source;
		this.Fblist.validateNow();
		
		if (this._firstOpen)
		{
			this._firstOpen = false;
			TimerManager.ins().doTimer(50, 1, this.selectCanChallege, this);
			this.selectCanChallege();
		}
	}

	private selectCanChallege():void
	{
		let off:number = (this._index + 1) * UserFb.TF_SIMLPE_HEIGHT - this.Fblist.height + UserFb.TF_EXPAND_HEIGHT - UserFb.TF_SIMLPE_HEIGHT;
		this.Fblist.scrollV = off > 0 ? off : 0;
		this.Fblist.validateNow();
	}
}