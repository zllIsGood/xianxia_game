/**
 * Created by hrz on 2017/9/6.
 */

class GuildFirePanel extends BaseView {
    private btnImg: eui.Image;
    private progressBar: eui.ProgressBar;
    private desc1: eui.Label;
    private desc2: eui.Label;
    private cha: eui.Label;
    private count: eui.Label;
    private give: eui.Button;
    private fireLv: eui.Group;

    private lv0: eui.Image;
    private lv1: eui.Image;//lv1,lv2...lv5
    private fire1: eui.Image;
    private firestar: eui.Image;
    private redPoint: eui.Image;

    private itemCount: number = 0;
    constructor() {
        super();
        // this.skinName = `GuildCampFireSkin`
    }

    open() {
        this.addTouchEvent(this.give, this.onGive);
        this.observe(Guild.ins().postUpdateFire, this.update);
        this.update();
    }

    close() {
        this.removeTouchEvent(this.give, this.onGive);
        this.removeObserve();
    }

    private update() {
        let fireDic = Guild.ins().fireDic;
        if (fireDic.fireLvl > 0) {
            this.firestar.visible = true;
        } else {
            this.firestar.visible = false;
        }
        let lv = 0;
        while (true) {
            if (this['lv' + lv]) {
                this['lv' + lv].visible = fireDic.fireLvl >= lv;
                if (this['fire' + lv])
                    this['fire' + lv].visible = fireDic.fireLvl == lv;
            } else {
                break;
            }
            lv += 1;
        }

        let config = GlobalConfig.GuildBonFireConfig[fireDic.fireLvl];
        let nextConf = GlobalConfig.GuildBonFireConfig[fireDic.fireLvl + 1];
        if (config) {
            this.progressBar.maximum = config.value;
            this.progressBar.value = fireDic.fireVal;
        } else {
            this.progressBar.maximum = 100;
            this.progressBar.value = 100;
        }

        let conf = GlobalConfig.GuildConfig;

        let item = UserBag.ins().getBagItemById(conf.bonfireItem);
        if (item) {
            this.count.text = `${item.count}`;
            this.cha.textColor = this.count.textColor = 0x35E62D;
            this.itemCount = item.count;
            this.redPoint.visible = true;
        } else {
            this.count.text = `0`;
            this.cha.textColor = this.count.textColor = 0xff0000;
            this.itemCount = 0;
            this.redPoint.visible = false;
        }

        if (nextConf) {
            this.desc1.textFlow = TextFlowMaker.generateTextFlow1(`每捐献 1 个仙泉增加 |C:0x35E62D&T:${conf.bonfireValue}| 点神树值以及 |C:0x35E62D&T:${conf.bonfireReward[0].count}| 点仙盟贡献`);
            this.desc2.textFlow = TextFlowMaker.generateTextFlow1(`再捐献总计 |C:0x35E62D&T:${(config.value - fireDic.fireVal) / conf.bonfireValue}| 个仙泉可增加 |C:0x35E62D&T:${nextConf.reward}| 仙盟资金`);
        } else if (config) {
            this.desc1.textFlow = TextFlowMaker.generateTextFlow1(`每捐献 1 个仙泉增加 |C:0x35E62D&T:${conf.bonfireValue}| 点神树值以及 |C:0x35E62D&T:${conf.bonfireReward[0].count}| 点仙盟贡献`);
            this.desc2.textFlow = TextFlowMaker.generateTextFlow1(`神树值已达到最大 次日可增加 |C:0x35E62D&T:${config.reward}| 仙盟资金`);
        } else {
            Assert(config, `cant get GuildBonFireConfig by lv: ${fireDic.fireLvl}`)
        }


    }

    private onGive() {
        if (this.itemCount > 0) {
            let count = GlobalConfig.GuildConfig.bonfirecount;
            if (this.itemCount < count)
                count = this.itemCount;
            this.itemCount -= count;
            Guild.ins().sendToFire(count, this.itemCount);
        } else {
            UserTips.ins().showTips(`道具不足`);
        }
    }
}