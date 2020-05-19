/**
 * Created by hrz on 2017/9/13.
 */

class NewWorldBossIconRule extends RuleIconBase {
    private alertText: eui.Label;
    constructor(t: egret.DisplayObjectContainer){
        super(t);
        this.alertText = new eui.Label();
        // this.alertText.fontFamily = "黑体";
        this.alertText.size = 14;
        this.alertText.width = 120;
        this.alertText.textAlign = "center";
        this.alertText.textColor = 0x35e62d;
        this.alertText.horizontalCenter = 0;
        t.addChild(this.alertText);
        this.alertText.y = 80;

        if (UserBoss.ins().newWorldBossData.startTime) {
            this.runTime();
            TimerManager.ins().doTimer(1000, 0, this.runTime, this);
        } else {
            this.alertText.text = "活动结束";
        }


        this.updateMessage = [
            UserBoss.ins().postNewBossOpen
        ];
    }

    private runTime(): void {
        let time: number = Math.floor((UserBoss.ins().newWorldBossData.startTime - GameServer.serverTime)/1000);
        if (time >= 0) {
            this.alertText.text = DateUtils.getFormatBySecond(time, DateUtils.TIME_FORMAT_12)
        }else if (GlobalConfig.NewWorldBossBaseConfig.bossTime*1000+UserBoss.ins().newWorldBossData.startTime > GameServer.serverTime) {
            this.alertText.text = "";
        } else {
            this.alertText.text = "活动结束";
            TimerManager.ins().remove(this.runTime, this);
            this.update();
        }
    }
 
    checkShowIcon(): boolean {
        if( !GameServer.serverOpenDay )return false;
        let b = UserBoss.ins().newWorldBossData.isOpen;
        if (b && UserBoss.ins().newWorldBossData.startTime) {
            if (!TimerManager.ins().isExists(this.runTime,this)) {
                this.runTime();
                TimerManager.ins().doTimer(1000, 0, this.runTime, this);
            }
        }
        return b;
    }

    checkShowRedPoint(): number {
        return GameServer.serverTime > UserBoss.ins().newWorldBossData.startTime && (GlobalConfig.NewWorldBossBaseConfig.bossTime*1000+UserBoss.ins().newWorldBossData.startTime > GameServer.serverTime) ? 1 : 0;
    }

    getEffName():string {
        if(this.checkShowRedPoint()){
            this.effX = 38;
            this.effY = 55;
            return "actIconCircle";
        }
        return "";
    }

    tapExecute(): void {
        ViewManager.ins().open(NewWorldBossWin);
    }
}