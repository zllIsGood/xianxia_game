class SpecialRingItem extends BaseItemRender {
    // private selectIcon: eui.Image;
    private ringicon: eui.Image;
    private redPoint: eui.Group;
    private actTxt: eui.Image;
    private ringNameTxt: eui.Label;
    private levelTxt: eui.Label;
    private openLv: eui.Label;
    private noopen: eui.Image;
    private textBg: eui.Image;
    private isAddEvent: boolean;
    // public dieBg: eui.Image;
    constructor() {
        super();
        this.skinName = "ringtogglebtn";
    }

    public dataChanged(): void {
        let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[this.data.id];
        if (!config) {
            return;
        }
        this.addEvent();
        this.ringNameTxt.text = config.name;
        // this.textBg.visible = this.data.level > 0;
        if (this.data.level > 0) {
            this.levelTxt.text = `${SpecialRing.ins().getRingStair(this.data.level)}阶`;
            this.openLv.text = "";
            this.noopen.visible = false;
            this.ringicon.source = config.icon;
        } else {
            this.levelTxt.text = "";
            this.noopen.visible = true;
            this.ringicon.source = config.icon + "a";
            if (config.openDay > 0 && config.openVip > 0) {
                this.openLv.text = `第${config.openDay}天或${UserVip.formatLvStr(config.openVip)}开启`;
            } else if (config.openDay > 0) {
                this.openLv.text = `第${config.openDay}天开启`;
            } else if (config.openVip > 0) {
                this.openLv.text = `${UserVip.formatLvStr(config.openVip)}开启`;
            }
            else if (config.openYb > 0) {
                this.openLv.text = `${config.openYb}元宝开启`;
            }
        }
        // this.ringicon.source = config.icon;
        this.updateRedPoint();
    }

    public addEvent() {
        if (this.isAddEvent) {
            return;
        }
        this.isAddEvent = true;
        MessageCenter.addListener(UserBag.ins().postItemAdd, this.updateRedPoint, this);//道具添加
        MessageCenter.addListener(UserBag.ins().postItemDel, this.updateRedPoint, this);//道具
        MessageCenter.addListener(UserBag.ins().postItemCountChange, this.updateRedPoint, this);//道具
        // MessageCenter.addListener(UserTask.ins().postTaskChangeData, this.updateRedPoint, this);
        MessageCenter.addListener(UserVip.ins().postUpdateVipData, this.updateRedPoint, this);
        MessageCenter.addListener(SpecialRing.ins().postActiveRing, this.updateRedPoint, this);
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
    }

    private onRemove() {
        this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
        this.destruct();
    }

    public destruct(): void {
        MessageCenter.ins().removeAll(this);
        this.isAddEvent = false;
    }

    private updateRedPoint() {
        if (this.data.level > 0) {
            this.actTxt.visible = false;
        } else {
            if (this.data.id == SpecialRing.FIRE_RING_ID) {
                this.actTxt.visible = SpecialRing.ins().isFireRingCanActivate();
            }
            else {
                this.actTxt.visible = SpecialRing.ins().checkCanActive(this.data.id);
            }
        }
        this.openLv.visible = !this.actTxt.visible;
        this.redPoint.visible = SpecialRing.ins().checkRedPoint(this.data.id, this.data.level);
    }
}