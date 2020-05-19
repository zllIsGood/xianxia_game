/**
 * Created by Peach.T on 2017/11/1.
 */
class RingDetailPanel extends BaseEuiView {
    public bgClose: eui.Rect;
    public anigroup: eui.Group;
    public bg: eui.Image;
    public bg0: eui.Image;
    public closeBtn: eui.Button;
    public attrGroup: eui.Group;
    public attrName: eui.Label;
    public attrValue: eui.Label;

    public constructor() {
        super();
        this.skinName = `LYRAttrSkin`;
        this.isTopLevel = true;//设为1级UI
    }

    public open(...param: any[]): void {
        let taskCount: number = Object.keys(GlobalConfig.FunOpenTaskConfig).length;
        let attr;
        for (let i = 1; i <= taskCount; ++i) {
            if (i < UserTask.ins().awakeData.awakeTaskId){
                let config = UserTask.ins().getAwakeTypeConfById(i);
                if (config){
                    if (!attr){
                        attr = config.attr;
                    }else{
                        attr = AttributeData.AttrChangeAddition(attr, config.attr);
                    }
                }
            }
        }

        //戒指属性也添加到详情页
        for (let i = 2; i <= 7; i++) { //迭代所有灵戒属性
            let lvl = 1;
            if (i == SpecialRing.FIRE_RING_ID) {
                lvl = SpecialRing.ins().getSpecialRingDataById(7).level;
            }
            let cfg = SpecialRing.ins().getRingConfigById(i, lvl);
            if (cfg){
                if (!attr) {
                    attr = cfg.attrAward;
                } else {
                    if (i == SpecialRing.FIRE_RING_ID) {
                        let addAttr = CommonUtils.copyDataHandler(cfg.attrAward);
                        //计算烈焰戒指基础特性概率
                        let abilityId = SpecialRing.ins().getAbilityID();
                        if (abilityId) {
                            let exRingCfg = GlobalConfig.ActorExRingItemConfig[SpecialRing.FIRE_RING_ID][abilityId][SpecialRing.ins().abilityIds[abilityId]];
                            addAttr.forEach(function (dp, index) {
                                dp.value *= 1 + exRingCfg.attrPer / 10000;
                                dp.value = Math.round(dp.value)//四舍五入取整
                            })
                        }
                        attr = AttributeData.AttrAddition(attr, addAttr);
                    }
                    else {
                        attr = AttributeData.AttrChangeAddition(attr, cfg.attrAward);
                    }
                }
            }
        }

        this.attrValue.text = AttributeData.getAttStr(attr, 0, 1, "    ", false, false);
        this.addTouchEndEvent(this.bgClose, this.otherClose);
    }

    private otherClose(evt: egret.TouchEvent) {
        ViewManager.ins().close(this);
    }
}

ViewManager.ins().reg(RingDetailPanel, LayerManager.UI_Popup);



