/**
 * 戒指升级界面
 * Created by Peach.T on 2017/11/7.
 */
class RingUpgradeWin extends BaseEuiView {

    public colorCanvas: eui.Rect;
    public anigroup: eui.Group;
    public abilityName: eui.Label;
    public ring0eff: eui.Group;
    public ring1eff: eui.Group;
    public abilityDesc: eui.Label;
    public itemName: eui.Label;
    private bossImage: MovieClip;
    private nextBossImage: MovieClip;

    public constructor() {
        super();
        this.skinName = `LYRUltraSkin`;
        this.isTopLevel = true;//设为1级UI
    }

    private addBossImg(id: number): void {
        this.bossImage = new MovieClip;
        this.bossImage.scaleX = -1;
        this.bossImage.scaleY = 1;
        this.bossImage.x = this.ring0eff.width / 2;
        this.bossImage.y = 115;
        this.ring0eff.addChild(this.bossImage);
        let monster = GlobalConfig.MonstersConfig[id];
        this.bossImage.playFile(RES_DIR_MONSTER + `monster${monster.avatar}_3s`, -1);
    }

    private addNextBossImg(id: number): void {
        this.nextBossImage = new MovieClip;
        this.nextBossImage.scaleX = -1;
        this.nextBossImage.scaleY = 1;
        this.nextBossImage.x = this.ring1eff.width / 2;
        this.nextBossImage.y = 115;
        this.ring1eff.addChild(this.nextBossImage);
        let monster = GlobalConfig.MonstersConfig[id];
        this.nextBossImage.playFile(RES_DIR_MONSTER + `monster${monster.avatar}_3s`, -1);
    }

    public open(...param: any[]): void {
        this.addTouchEvent(this.colorCanvas, this.otherClose);
        let abilityId = SpecialRing.ins().getAbilityID();
        if (abilityId == 0) abilityId = 1;
        let lv = SpecialRing.ins().abilityIds[abilityId];
        lv = !lv ? 1 : lv;
        let cfg = GlobalConfig.ActorExRingItemConfig[SpecialRing.FIRE_RING_ID][abilityId][lv];
        let monId = GlobalConfig.ActorExRingConfig[SpecialRing.FIRE_RING_ID].monsterId;
        let nextMonId = monId + cfg.monId;
        this.abilityDesc.textFlow = TextFlowMaker.generateTextFlow(cfg.abilityDesc);
        this.addBossImg(monId);
        this.addNextBossImg(nextMonId);
    }

    private otherClose(evt: egret.TouchEvent) {
        ViewManager.ins().close(this);
    }
}

ViewManager.ins().reg(RingUpgradeWin, LayerManager.UI_Popup);
