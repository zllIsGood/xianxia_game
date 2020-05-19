class YqWin extends BaseEuiView {
	public bgClose: eui.Rect;
	
	public closeBtn: eui.Button;
	public count: eui.Label;
	public time: eui.Label;
	public closeBtn1: eui.Button;
	private inviteBtn: eui.Button;
	public tipGroup: eui.Group;
	public group: eui.Group;
	public fxBtn: eui.Button;
	private cardList0: eui.List;
	private tipLabel: eui.Label;
	private cardListData: eui.ArrayCollection;
	private dailyInviteList: DailyInviteConfig[] = [];
	private lastTimeDown: number = 0;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "InviteFriendsSkin";

		this.cardListData = new eui.ArrayCollection();
		this.cardList0.itemRenderer = InviteCheckInCard;

		this.dailyInviteList = GlobalConfig.DailyInviteConfig;
        this.cardList0.dataProvider = this.cardListData;
	}

	public open(...param: any[]): void {
		
		this.addTouchEvent(this.inviteBtn, this.onTap);
		this.addTouchEvent(this.cardList0, this.onListTap);
		
		this.addTouchEvent(this.closeBtn1, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.fxBtn, this.onTap);

		this.observe(Invite.ins().postDailyInviteData, this.updateDailyInvite);

		this.updateDailyInvite();
	}

	public close(...param: any[]): void {

		this.removeTouchEvent(this.closeBtn1, this.onTap);
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this.fxBtn, this.onTap);
		this.removeTouchEvent(this.inviteBtn, this.onTap);
		this.removeTouchEvent(this.cardList0, this.onListTap);
		this.removeObserve();
		TimerManager.ins().remove(this.refushTimeLabel, this);
	}

	private updateDailyInvite() {

		/** 更新数据 */
		this.cardListData.replaceAll(this.parseConfigData(this.dailyInviteList));

		/** 读取服务器数据, 获取当前进度信息 */
		let inviteModel: DailyInviteModel = Invite.ins().model;
		
		this.count.text = `（${inviteModel.dailyFinishCount}/${Object.keys(this.dailyInviteList).length}）`;
		
		TimerManager.ins().remove(this.refushTimeLabel, this);
        let isAllGet: boolean = Boolean((inviteModel.dailyAwardCount >> 3) & 1);
        if (isAllGet) {
            this.time.visible = false;
            this.tipLabel.visible = true;
        } else {
            this.tipLabel.visible = false;
            if (inviteModel.dailyNextTime == 0) {
                this.time.visible = false;
            } else {
                this.time.visible = true;
                this.lastTimeDown = Math.floor((DateUtils.formatMiniDateTime(inviteModel.dailyNextTime) - GameServer.serverTime) / 1000);
                this.lastTimeDown = Math.max(0, this.lastTimeDown);
                this.time.text = DateUtils.getFormatBySecond(this.lastTimeDown, 1) + "后可再次邀请";
                
                TimerManager.ins().remove(this.refushTimeLabel, this);
                TimerManager.ins().doTimer(1000, this.lastTimeDown, this.refushTimeLabel, this) ;
            }
        }

	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn1:
			case this.closeBtn:
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.fxBtn:
				ViewManager.ins().open(WeiBoShareWin);
				break;
			case this.inviteBtn:
				this.handleInviteBtnTap();
				break;
		} 
	}

	private handleInviteBtnTap() {

		window["isShare"]((res) => {

			console.log(`分享回调: ${res}`);
			
			/** 只要唤起邀请了, 就直接给用户发奖励 */
			Invite.ins().sendDailyInviteSuccess();

			ViewManager.ins().close(this);
		});
    }

	private onListTap(e: egret.TouchEvent) {
        
        if (this.cardList0.selectedItem) {
            
            /** 读取服务器数据, 获取当前进度信息 */
            let inviteModel: DailyInviteModel = Invite.ins().model;

            let dailyInviteCfg: DailyInviteConfig = this.cardList0.selectedItem as DailyInviteConfig;
            // 未领取
            if (inviteModel.dailyFinishCount >= dailyInviteCfg.index) {
                Invite.ins().sendDailyInviteAwake(1, dailyInviteCfg.index); 
            }
        }
	}
	
	private refushTimeLabel(): void {
		if (this.lastTimeDown > 0) {
			--this.lastTimeDown;
			this.time.text = DateUtils.getFormatBySecond(this.lastTimeDown, 1) + "后可再次邀请";
		} else {
            this.time.visible = false;
            TimerManager.ins().remove(this.refushTimeLabel, this);
        }
    }

	private parseConfigData(list: any[]): any[] {

        let keys: any[] = Object.keys(list);
        let dataList = [];
        keys.forEach((key) => {
            let dailyInvite = list[key];
            dataList.push(dailyInvite);
        })
        return dataList;
    }
}

ViewManager.ins().reg(YqWin, LayerManager.UI_Popup);