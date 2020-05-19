/**
 * Created by hrz on 2017/9/13.
 */

class NewWorldBossWin extends BaseEuiView {
    private bgClose:eui.Rect;
    private bossImg:eui.Image;
    private bar:eui.ProgressBar;
    private list:eui.List;
    private enter:eui.Button;
    private nameTxt:eui.Label;
    private tips:eui.Group;
    private help:eui.Image;

    private boss:eui.Group;
    private bossImage: MovieClip;

    constructor(){
        super();
        this.skinName = `wpkBossSkin`;
    }

    public initUI() {
        super.initUI();

        this.bossImage = new MovieClip;
        this.bossImage.scaleX = -1;
        this.bossImage.scaleY = 1;
        this.bossImage.x = 0;
        this.bossImage.y = 215;
        this.boss.addChild(this.bossImage);

        this.list.itemRenderer = ItemBaseNoName;

        UserBoss.ins().sendGetNewBossInfo();
    }

    open() {
        this.observe(UserBoss.ins().postNewBossInfo, this.update);
        this.addTouchEvent(this.enter, this.onTap);
        this.addTouchEvent(this.help, this.onTap);
        this.addTouchEvent(this.bgClose, this.onTap);

        this.update();
    }

    private update() {
        let id = UserBoss.ins().newWorldBossData.bossID;
        let config = GlobalConfig.MonstersConfig[id];
        if (!config) return;
        this.nameTxt.text = `${config.name}(${config.level})`;
        this.bossImage.playFile(RES_DIR_MONSTER + `monster${config.avatar}_3s`, -1);

        this.list.dataProvider = new eui.ArrayCollection(GlobalConfig.NewWorldBossBaseConfig.showAwards);

        this.bar.maximum = config.hp;
        this.bar.value = UserBoss.ins().newWorldBossData.curHp;
    }

    private onTap(e:egret.TouchEvent) {
        let tar = e.currentTarget;
        if (tar == this.enter) {
            if(UserBoss.ins().newWorldBossData.startTime > GameServer.serverTime){
                let date = new Date(UserBoss.ins().newWorldBossData.startTime);
                let time = `${date.getHours()}点${date.getMinutes() ? date.getMinutes()+"分":""}`;
                UserTips.ins().showTips(`每天${time}开启，请按时参加`);
                return;
            }
            if (!UserBoss.ins().checkNewWorldBossOpen()) {
                UserTips.ins().showTips(`${GlobalConfig.NewWorldBossBaseConfig.openLv}级才可以参加`);
                return;
            }
            UserBoss.ins().sendIntoNewBoss();
            ViewManager.ins().close(this);
        } else if (tar == this.help) {
            ViewManager.ins().open(ZsBossRuleSpeak, 15);
        } else if (tar == this.bgClose) {
            ViewManager.ins().close(this);
        }
    }

    close() {

    }
}

ViewManager.ins().reg(NewWorldBossWin, LayerManager.UI_Popup);