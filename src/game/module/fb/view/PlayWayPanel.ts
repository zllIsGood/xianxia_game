
class PlayWayPanel extends BaseView {

    private btn1:eui.Button;
    private btn2:eui.Button;
    private redPoint2:eui.Image;
    public btn3:eui.Button;
    public redPoint3:eui.Image;
    public info:eui.Label;
    public info1:eui.Label;
    public info2:eui.Label;
    private time1:eui.Label;
    public info3:eui.Label;
    public info4:eui.Label;
    public btn4:eui.Button;
    public redPoint0:eui.Image;
    public time4:eui.Label;

    constructor() {
        super();
        this.name = `玩法`
        // this.skinName = `playWaySkin`;
    }

    public childrenCreated():void
    {
        super.childrenCreated();
        
        this.init();
    }

	public init() {
        for( let i=1;i<=4;i++ ){
            let str = this[`info${i}`].text;
            TextFlowMaker.generateTextFlow1(`|U:&T:${str}`);
        }

        let str = this.time1.text;
        if( !GameServer.serverOpenDay ){
            // str = `|T:开服第2天起 每天${time}开启`;
        }else {
            let tmp: string[] = str.split("每天");
            this.time1.textFlow = TextFlowMaker.generateTextFlow1(`每天${tmp[1]}`);
        }
        
        this.time4.text = GlobalConfig.PassionPointConfig.openTips;
        for (let i:number = 1; i <= 4; i++)
            this["info" + i].textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this["info" + i].text}`);


	}

    public open() {
        this.addTouchEvent(this, this.onTap);
        this.observe(Millionaire.ins().postMillionaireInfo, this.callbackMillionaireInfo);
        this.observe(Millionaire.ins().postTurnDice, this.callbackRedPoint);
        this.observe(Millionaire.ins().postRoundReward, this.callbackRedPoint);
        this.observe(Millionaire.ins().postMillionaireUpdate, this.callbackRedPoint);
        this.observe(BattleCC.ins().postOpenInfo, this.updateBattleRed);
        this.observe(Actor.ins().postLevelChange, this.updateBattleRed);
        this.observe(Actor.ins().postLevelChange, this.updatePaoDianRed);
        this.observe(PaoDianCC.ins().postOpenInfo, this.updatePaoDianRed);

        this.redPoint2.visible = Millionaire.ins().getRedPoint();
        this.updateBattleRed();
        this.updatePaoDianRed();
    }

    private updateBattleRed():void
    {
        this.redPoint3.visible = BattleCC.ins().checkRedPoint();
    }

    private updatePaoDianRed():void
    {
        this.redPoint0.visible = PaoDianCC.ins().checkRedPoint();
    }

    public close() {
        this.removeTouchEvent(this, this.onTap);
        this.removeObserve();
    }
    private onTap(e: egret.TouchEvent) {
        switch (e.target){
            case this.btn1:
                if (!UserBoss.ins().newWorldBossData.isOpen) {
                    UserTips.ins().showTips(`世界BOSS未开启`);
                    return;
                }
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
                break;
            case this.btn2:
                //打开界面获取大富翁数据
                Millionaire.ins().sendMillionaireInfo();
                break;
            case this.btn3:
                if (Actor.level <= GlobalConfig.CampBattleConfig.openLevel)
                {
                     UserTips.ins().showTips(GlobalConfig.CampBattleConfig.openLevel + `级可参与仙魔战场`);
                     return;
                }

                if (!BattleCC.ins().isOpen)
                {
                    UserTips.ins().showTips(GlobalConfig.CampBattleConfig.openTips);
                     return;
                }
                var cd:number = BattleCC.ins().getEnterCD();
                if (cd > 0)
                {
                    UserTips.ins().showTips(cd + "秒后才可进入阵营副本");
                    return;
                }
                
                ViewManager.ins().open(BattleNpcTipWin);

                
                // if (CityCC.ins().enterCD < 1)
                // {
                //     if (CityCC.ins().isCity)
                //     {
                //         GameMap.myMoveTo(GlobalConfig.CampBattleConfig.npcPos[0] * GameMap.CELL_SIZE, GlobalConfig.CampBattleConfig.npcPos[1] * GameMap.CELL_SIZE, BattleCC.ins().findComplete);
                //         GameMap.moveTo(GlobalConfig.CampBattleConfig.npcPos[0] * GameMap.CELL_SIZE, GlobalConfig.CampBattleConfig.npcPos[1] * GameMap.CELL_SIZE);
                //     }
                //     else
                //     {
                //         BattleCC.ins().gotoNpc = true;
			    //         CityCC.ins().sendEnter();
                //     }           
                // }
		        // else
			    //     UserTips.ins().showTips(`冷却中，${CityCC.ins().enterCD}秒后可进入主城`);

                break;
            case this.btn4:
                if (!PaoDianCC.ins().isOpen)
                {
                    UserTips.ins().showTips(GlobalConfig.PassionPointConfig.openTips);
                    return;
                }

                var openLevel:number = GlobalConfig.PassionPointConfig.openLv;

                if (Actor.level + UserZs.ins().lv * 1000 < openLevel)
                {
                    UserTips.ins().showTips((openLevel < 1000 ? openLevel + "级" : (openLevel % 1000 == 0 ? 
                    openLevel / 1000 + "转" : openLevel / 1000 + "转" + openLevel % 1000 + "级")) + `可参与瑶池盛会`);
                    return;
                }

                // if (CityCC.ins().enterCD < 1)
                // {
                //     if (CityCC.ins().isCity)
                //     {
                //         GameMap.myMoveTo(GlobalConfig.PassionPointConfig.npcPos[0] * GameMap.CELL_SIZE, GlobalConfig.PassionPointConfig.npcPos[1] * GameMap.CELL_SIZE, PaoDianCC.ins().findComplete);
                //         GameMap.moveTo(GlobalConfig.PassionPointConfig.npcPos[0] * GameMap.CELL_SIZE, GlobalConfig.PassionPointConfig.npcPos[1] * GameMap.CELL_SIZE);
                //     }
                //     else
                //     {
                //         PaoDianCC.ins().gotoNpc = true;
			    //         CityCC.ins().sendEnter();
                //     }           
                // }
		        // else
			    //     UserTips.ins().showTips(`冷却中，${CityCC.ins().enterCD}秒后可进入主城`);
                ViewManager.ins().open(PaoDianNpcTalkWin)
                break;
            case this.info1:
                ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[18].text);
                break;
            case this.info2:
                ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[19].text);
                break;
            case this.info3:
                ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[17].text);
                break;
            case this.info4:
                ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[20].text);
                break;
        }
    }
    private callbackMillionaireInfo():void{
        //走到起点会再发一次57-1 防止重复打开
        let view:MillionaireWin = ViewManager.ins().getView(MillionaireWin) as MillionaireWin;
        if( !view )
            ViewManager.ins().open(MillionaireWin);
        this.redPoint2.visible = Millionaire.ins().getRedPoint();
    }
    private callbackRedPoint():void{
        this.redPoint2.visible = Millionaire.ins().getRedPoint();
    }


}