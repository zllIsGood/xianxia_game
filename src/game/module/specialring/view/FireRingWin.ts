/**
 * 当火焰戒指激活以后，此界面替换原有灵戒界面
 * Created by Peach.T on 2017/10/30.
 */
class FireRingWin extends BaseEuiView {
    public viewStack: eui.ViewStack;
    public LYRBase: FireRingInfoPanel;
    public LYRSkill: FireRingSkillPanel;
    public LYRFb:FireRingFb;
    public LYRMark:LyMarkPanel;
	
    public roleSelect: BaseComponent;
    public tab: eui.TabBar;
    public redPoint0:eui.Image;
    public redPoint1:eui.Image;
    public redPoint2:eui.Image;
    public redPoint3:eui.Image;

    private lastSelect: number = 0;

    public constructor() {
        super();
        this.skinName = `LYRingSkin`;
        this.isTopLevel = true;//设为1级UI
    }

    public open(...param: any[]): void {
        this.lastSelect = param[0] || 0;
        this.addChangingEvent(this.tab, this.onTabTouching);
        this.tab.addEventListener(egret.Event.CHANGE, this.setSelectedIndex, this);
        this.tab.selectedIndex = this.lastSelect;
        this.viewStack.selectedIndex = this.lastSelect;
        this.viewStack.getElementAt(this.lastSelect)['open']();
        this.checkPoint();

        this.observe(SpecialRing.ins().postSRStairUp, this.checkPoint);//升阶 升星检查红点
        this.observe(SpecialRing.ins().postSkillInfo, this.checkPoint);//技能更新 检查红点
        this.observe(UserFb.ins().postFbRingInfo, this.checkPoint);//副本 检查红点
        this.observe(UserBag.ins().postItemAdd, this.checkPoint);//道具变更检查红点
        this.observe(UserBag.ins().postItemDel, this.checkPoint);
        this.observe(UserBag.ins().postItemCountChange, this.checkPoint);
        this.observe(LyMark.ins().postMarkData, this.checkPoint);
    }

    public close():void
    {
        this.removeEventListener(egret.Event.CHANGING, this.onTabTouching, this.tab);
        this.removeEventListener(egret.Event.CHANGE, this.setSelectedIndex, this);

        if(this.viewStack.getElementAt(this.lastSelect))
            this.viewStack.getElementAt(this.lastSelect)['close']();
    }

    private onTabTouching(e: egret.TouchEvent) {
		if (!this.checkIsOpen(this.tab.selectedIndex)) {
			e.preventDefault();
		}
	}

    /**页签开启判定*/
	private checkIsOpen(index: number): boolean {
		if (index == 3 && !LyMark.ins().checkOpen())
		{
			UserTips.ins().showTips(`烈焰戒指达到${GlobalConfig.FlameStamp.openLevel}级开启`);
			return false;
		}

		return true;
	}

    private setSelectedIndex(e: egret.Event) {
        this.viewStack.getElementAt(this.lastSelect)['close']();
        this.lastSelect = this.viewStack.selectedIndex;
        this.viewStack.getElementAt(this.lastSelect)['open']();
    }

    private checkPoint(): void {
        this.redPoint0.visible = SpecialRing.ins().checkHaveUpRing();
        this.redPoint1.visible = SpecialRing.ins().isCanStudySkill() || SpecialRing.ins().isCanUpgradeSkill();
        this.redPoint2.visible = SpecialRing.ins().fireRingRedPoint();
        this.redPoint3.visible = LyMark.ins().checkRed();
}
}

ViewManager.ins().reg(FireRingWin, LayerManager.UI_Main);
