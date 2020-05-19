/**
 * 收藏有礼窗口
 * Author: Ade
 */

 class CollectGiftWin extends BaseEuiView {

    private YesBtn: eui.Button;
    private closeBtn: eui.Button;
    private placeholder: eui.Component;
    private desLabel: eui.Label;

    private nameLabel1: eui.Label;
    private nameLabel2: eui.Label;

    private icon1: eui.Image;
    private icon2: eui.Image;

    constructor() {
        super();
        this.skinName = 'CollectGiftWinSkin';
        this.isTopLevel = true;
    }

    public initUI(): void {
        super.initUI();

    }

    public destoryView(): void {
		super.destoryView();
    }
    
    public open(...param: any[]): void {
        
        let conf = GlobalConfig.CollectGift1Conf;

        let gameType = window["GameType"];
        if (!gameType) {
            gameType = "1";
        }

        this.setNameLabel(conf[gameType].word);
        this.setIcon(conf[gameType].pic);

        let collectGiftFlag = param[0];
        if (collectGiftFlag < CollectGiftOption.enterBg) {
            this.YesBtn.visible = false;
            this.desLabel.visible = true;
            this.nameLabel1.visible = true;
            Setting.ins().setValue(ClientSet.collectGifBtn, CollectGiftOption.clicked);
        } else {
            this.desLabel.visible = false;
            this.nameLabel1.visible = false;
            this.YesBtn.visible = true;
        }

        this.addTouchEndEvent(this.YesBtn, this.handleYesBtnTap);
        this.addTouchEndEvent(this.closeBtn, this.handleCloseBtnTap);
    }
    
    public close(...param: any[]): void {

        this.removeTouchEvent(this.YesBtn, this.handleYesBtnTap);
        this.removeTouchEvent(this.closeBtn, this.handleCloseBtnTap);
    }
    
    private handleYesBtnTap() {

        this.YesBtn.visible = false;

        /** 获取奖励配置 */
        let conf = GlobalConfig.CollectGiftConf;
        
        /** 领取奖励 */
        let itemConfig = GlobalConfig.ItemConfig[conf.awards[0].id];
        let str = `|C:${ItemBase.QUALITY_COLOR[itemConfig.quality]}&T:${itemConfig.name} x ${conf.awards[0].count}|`;
        UserTips.ins().showTips(str);

        /** 物品飞行到背包 */
        let imgIconSource = itemConfig.icon + '_png';
        let flyItem: eui.Image = new eui.Image(imgIconSource);
        flyItem.x = this.placeholder.x;
		flyItem.y = this.placeholder.y;
		flyItem.width = this.placeholder.width;
		flyItem.height = this.placeholder.height;
		flyItem.scaleX = this.placeholder.scaleX;
		flyItem.scaleY = this.placeholder.scaleY;
        this.addChild(flyItem);
        GameLogic.ins().postFlyItemEx(flyItem);

        Invite.ins().sendCollectGift();
        Setting.ins().setValue(ClientSet.collectGifBtn, CollectGiftOption.receiveAward);
        Invite.ins().postCollectGift();
    }

    private handleCloseBtnTap() {

        Setting.ins().setValue(ClientSet.collectGifBtn, CollectGiftOption.clicked);
        ViewManager.ins().close(this);
    }

    private setNameLabel(name: string) {
        this.nameLabel1.text = `"${name}"`;
        this.nameLabel2.text = `"${name}"`;
    }

    private setIcon(icon: string) {

        this.icon1.source = icon;
        this.icon2.source = icon;
    }
 }

 ViewManager.ins().reg(CollectGiftWin, LayerManager.UI_Main);