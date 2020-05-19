
/**
 * 每日邀请
 * Author: Ade
 */

class InviteDailyWin extends BaseEuiView {

    private cardScroller: eui.Scroller;
    private cardList0: eui.List;

    private barList: eui.Scroller;
    private list0: eui.List;
    
    private time: eui.Label;
    private word: eui.Label;
    private tipLabel: eui.Label;
    private inviteBtn: eui.Button;
    private num: eui.Label;
    private bar: eui.ProgressBar;

    private dailyInviteList: DailyInviteConfig[] = [];
    private inviteSuccessList: eui.ArrayCollection;
    private progressCounts: number[] = [2, 24, 24, 24, 28];
    private lastTimeDown: number = 0;
    private cardListData: eui.ArrayCollection;


    constructor() {
        super();
        this.skinName = 'invitedailySkin';
        this.isTopLevel = true;
        this.bar.maximum = 100;
        this.bar.value = 0;
        this.bar.slideDuration = 0;
    }

    /**
     * Public Methods
     */
    public initUI(): void {
        super.initUI();
        
        this.cardList0.itemRenderer = InviteCheckInCard;
        this.list0.itemRenderer = InviteListCheckInCard;

        this.cardListData = new eui.ArrayCollection();

        this.refreshData();
    }

    public destoryView(): void {
		super.destoryView();
    }

    public open(...param: any[]): void {

        /** 添加点击事件 */
        this.getItemAddTouchEvent();

        /** 设置邀请数据 */
        this.updateDailyInvite();

        this.addTouchEvent(this.inviteBtn, this.handleInviteBtnTap);
        this.addTouchEvent(this.cardList0, this.onListTap);

        /** 监听列表更新事件 */
        this.observe(Invite.ins().postUpdateInviteData, this.updateBarList);
        this.observe(Invite.ins().postDailyInviteData, this.updateDailyInvite);
    }
    
    public close(...param: any[]): void {
        
        this.cardListData = null;
        this.removeTouchEvent(this.cardList0, this.onListTap);
        for (let i = 0; i < 5; i++) {
            let isget = this['isget' + i];
            this.removeTouchEvent(isget, this.handleGiftItemTapped);
        }
        this.removeObserve();
        TimerManager.ins().remove(this.refushTimeLabel, this);
    }

    /**
     * Private Methods
     */
    private getItemAddTouchEvent() {
        for (let i = 0; i < 5; i++) {
            /** 获取界面元素 */
            let isget: eui.Group = this['isget' + i];
            this.addTouchEvent(isget, this.handleGiftItemTapped);
        }
    }

    /**
	 * 更新列表位置
	 * @returns void
	 */
    private updateBarList() {
        this.inviteSuccessList.replaceAll(Invite.ins().infoRecordModel.infoModels);
        // debugger;
        egret.setTimeout(() => {

            if (this.list0.contentHeight > this.list0.height) {
                this.list0.scrollV = this.list0.contentHeight - this.list0.height;   
            }
        },this, 100);
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

    private updateDailyInvite() {

        /** 分红记录更新 */
        this.updateBarList();

        /** 更新数据 */
        this.cardListData.replaceAll(this.parseConfigData(this.dailyInviteList));

        /** 读取TotalInviteConfig配置表, 获取界面信息 */
        let totalInviteConfig = GlobalConfig.TotalInviteConfig;
        let totalInviteList = this.parseConfigData(totalInviteConfig)

        /** 读取服务器数据, 获取当前进度信息 */
        let inviteModel: DailyInviteModel = Invite.ins().model;
        let progress: number = 0;
        
        for (let i = 0; i < totalInviteList.length; i++) {

            let element: TotalInviteConfig = totalInviteList[i];

            /** 获取界面元素 */
            let lingquImg: eui.Image = this[`lingqu` + i];
            // let redPointImg: eui.Image = this[`redPoint` + i];
            let invitenumLabel: eui.Label = this['invitenum' + i];
            let gift: ItemBase = this['gift' + i];
            let isget: eui.Group = this['isget' + i];
            let yellow: eui.Image = this['yellow' + i];
            let selImg: eui.Image = this['selImg' + i];
            selImg.touchEnabled = false;
            gift.data = element.inviteAwards[0];
            invitenumLabel.text = `${element.inviteCount}`;

            /** 这是当前邀请进度 */
            if (inviteModel.inviteTotalCount >= element.inviteCount) {
                progress += this.progressCounts[i];

                /** 判断是否已经领奖, awardTotalCount是从1开始的 */
                let isGet: boolean = Boolean((inviteModel.awardTotalCount >> (i + 1)) & 1);
                
                lingquImg.visible = isGet;
                yellow.visible = true;
            
                /** 如果已经领取, 就不显示红点 */
                if (!lingquImg.visible) {
                    selImg.visible = true;
                    DisplayUtils.flashingObj(selImg, true);
                    gift.clearEffect();
                    isget.touchEnabled = true;
                } else {
                    isget.touchEnabled = false;
                    selImg.visible = false;
                    gift.clearEffect();
                    DisplayUtils.flashingObj(selImg, false);
                }

            } else {
                lingquImg.visible = false;
                yellow.visible = false;
                selImg.visible = false;
                gift.clearEffect();
                DisplayUtils.flashingObj(selImg, false);
                isget.touchEnabled = false;
            }
        }

        this.bar.value = progress;

        TimerManager.ins().remove(this.refushTimeLabel, this);
        let isAllGet: boolean = Boolean((inviteModel.dailyAwardCount >> 3) & 1);
        if (isAllGet) {
            this.time.visible = false;
            this.word.visible = false;
            this.tipLabel.visible = true;
        } else {
            this.tipLabel.visible = false;
            if (inviteModel.dailyNextTime == 0) {
                this.time.visible = false;
                this.word.visible = false;
            } else {
                this.time.visible = true;
                this.word.visible = true;
                this.lastTimeDown = Math.floor((DateUtils.formatMiniDateTime(inviteModel.dailyNextTime) - GameServer.serverTime) / 1000);
                this.lastTimeDown = Math.max(0, this.lastTimeDown);
                this.time.text = DateUtils.getFormatBySecond(this.lastTimeDown, 1);
                
                TimerManager.ins().remove(this.refushTimeLabel, this);
                TimerManager.ins().doTimer(1000, this.lastTimeDown, this.refushTimeLabel, this);
            }
        }
        
        this.num.text =  `${inviteModel.inviteTotalCount}`;
    }

    private handleInviteBtnTap() {

        let info = Invite.ins().getInviteInfo();
        
        let title: string = info.word.length > 0 ? info.word[0] : "";
        let img: string = info.pic.length > 0 ? info.pic[0] : "";
        let imgPath: string = `resource/image/share/${img}`;

        // 获取分享图片的版本号信息
        let version = ResVersionManager.ins().getDir(imgPath);

        // 分享字段
        let query = 'act=' + Actor.actorID;

        platform.shareAppMessage(title, query, `${version}/${imgPath}`).then(() => {	
        });

        /** 只要唤起邀请了, 就直接给用户发奖励 */
        Invite.ins().sendDailyInviteSuccess();

        ViewManager.ins().close(this);
    }

    private handleGiftItemTapped(event: egret.TouchEvent) {

        for (let i = 0; i <= 4; i++) {
			if (event.currentTarget == this[`isget${i}`]) {
                let itemIcon: ItemIcon = this[`gift${i}`].getItemIcon();
                GameLogic.ins().flyItem(itemIcon);
                Invite.ins().sendDailyInviteAwake(2, i + 1);
				break;
			}
		}
    }

    private handleCloseBtnTap() {

        ViewManager.ins().close(this);
    }
    
    private refushTimeLabel(): void {
		if (this.lastTimeDown > 0) {
			--this.lastTimeDown;
			this.time.text = DateUtils.getFormatBySecond(this.lastTimeDown, 1);
		} else {
            this.time.visible = false;
            this.word.visible = false;
            TimerManager.ins().remove(this.refushTimeLabel, this);
        }
    }
    
    private refreshData(): void { 
        this.dailyInviteList = GlobalConfig.DailyInviteConfig;
        this.cardList0.dataProvider = this.cardListData;

        this.inviteSuccessList = new eui.ArrayCollection(Invite.ins().infoRecordModel.infoModels);
        this.list0.dataProvider = this.inviteSuccessList;
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

ViewManager.ins().reg(InviteDailyWin, LayerManager.UI_Main);