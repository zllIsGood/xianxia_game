import Group = eui.Group;
/**
 * Created by hjh on 2017/11/3.
 */

class HefuXunbaoPanel extends BaseView {
    private actTime:eui.Label;
    private actDesc:eui.Label;
    private _time:number;
    private eff1:eui.Group;
    private mc1:MovieClip;
    private eff2:eui.Group;
    private mc2:MovieClip;
    public activityID:number;
    private goBtn:eui.Button;
    constructor() {
        super();
        this.skinName = `hefuXunbao`;
    }

    protected childrenCreated() {
        super.childrenCreated();
    }
    close(){
        this.removeTouchEvent(this.goBtn,this.onTap);
        TimerManager.ins().remove(this.playSkillAnmi, this);
    }
    open() {
        this.addTouchEvent(this.goBtn, this.onTap);
        if( !TimerManager.ins().isExists(this.playSkillAnmi,this) )
            TimerManager.ins().doTimer(3000, 0, this.playSkillAnmi, this);
        this.initData();
    }
    private initData(){
        this.playSkillAnmi();
        this.updateData();
    }
    private onTap(e:egret.TouchEvent){
        switch (e.currentTarget){
            case this.goBtn:
                ViewManager.ins().close(ActivityWin);
                ViewManager.ins().open(TreasureHuntWin);
                break;
        }
    }

    updateData(){
        //合服寻宝时间段在寻宝配置表里
        let activityData: ActivityType0Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType0Data;
        let beganTime = Math.floor(activityData.startTime/1000 - GameServer.serverTime / 1000);
        let endedTime = Math.floor(activityData.endTime/1000 - GameServer.serverTime / 1000);

        if (beganTime >= 0) {
            this.actTime.text = "活动未开启";
        } else if (endedTime <= 0) {
            this.actTime.text = "活动已结束";
        } else {
            this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
        }
        let btncfg:ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
        this.actDesc.textFlow = TextFlowMaker.generateTextFlow1(btncfg.acDesc);
    }
    private playSkillAnmi(){
        // for( let i = 1;i <= 2;i++ ){
        //     if( !this[`mc${i}`] )
        //         this[`mc${i}`] = new MovieClip;
        //     if( !this[`mc${i}`].parent )
        //         this[`eff${i}`].addChild(this[`mc${i}`]);
        // }
        //
        // let role:Role = SubRoles.ins().getSubRoleByIndex(0);
        // let mcSkillID = `skill40${role.job}`;
        // let targetSkillID = `skill${403+role.job}`;
        //
        // let t: egret.Tween = egret.Tween.get(this);
        // this.mc1.playFile(`res/skilleff/${mcSkillID}`, 1, null, true);
        // t.wait(1500).call(() => {
        //         this.mc2.playFile(`res/skilleff/${targetSkillID}`, 1, null, true);
        // }, this);

        if( !this.mc1 )
            this.mc1 = new MovieClip;
        if( !this.mc1.parent )
            this.eff1.addChild(this.mc1);
        this.mc1.x = this.eff1.x;
        this.mc1.y = this.eff1.y;
        this.mc1.playFile(RES_DIR_SKILLEFF + "fashi05", -1);
    }


}