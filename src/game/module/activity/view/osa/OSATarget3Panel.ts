/**
 * Created by hrz on 2017/9/2.
 */
class OSATarget3Panel extends ActivityPanel {
    public type3PanelList: any[] = [];
    public cruPanel: any;
    public static targetIndex = {
        1 : "OSATarget3Panel3", //开服活动-七日连充
        2 : "OSATarget3Panel2", //开服活动-七日累充
        3 : "OSATarget3Panel4", //开服活动-七日每日充 7日累充
        4 : "DailyRechargePanel", //累计充值送诛仙装备
        5 : "OSATarget3Panel5", //合服活动-累充活动/感恩节活动
        6 : "OSATarget3Panel6",//合服累充162
        7 : "OSATarget3Panel7",//合服连冲162
        9: "OSATarget3Panel9",//谁与争锋 CERechargeSkin
        10: "OSATarget3Panel10",//新连冲
    }
    constructor() {
        super();
    }

    protected childrenCreated(): void {
        super.childrenCreated();

        // this.init();
    }

    public init() : void {
        this.initPanelList();
    }

    public open(...param: any[]): void {

        this.observe(Activity.ins().postActivityIsGetAwards, this.updateData);
        this.observe(Activity.ins().postChangePage, this.updateData);
        this.observe(Activity.ins().postRewardResult, this.updateData);
        // if (this.cruPanel) {
        //     this.cruPanel.close();
        //     DisplayUtils.removeFromParent(this.cruPanel);
        // }
        // let id:number = this.activityID;
        // this.initPanelList();
        // this.cruPanel = this.type3PanelList[id + ""];
        // this.addChild(this.cruPanel);
        // this.cruPanel.open();

        if (!this.cruPanel) {
			if (this.cruPanel) {
				this.cruPanel.close();
				DisplayUtils.removeFromParent(this.cruPanel);
			}
			this.initPanelList();
			this.addChild(this.cruPanel);
			this.cruPanel.open();
		}
    }

    public close(...param: any[]): void {
        this.removeObserve();
        if(this.cruPanel) this.cruPanel.close();
        // DisplayUtils.removeFromParent(this.cruPanel);
    }
    private initPanelList(){
        let clsStr:string = "";
        let id = this.activityID;
        let config:ActivityType3Config[] = GlobalConfig.ActivityType3Config[id];
        for( let i in config ){
            if( !OSATarget3Panel.targetIndex[config[i].showType] )
                continue;
            clsStr = OSATarget3Panel.targetIndex[config[i].showType];
            break;
        }

        if (!clsStr) return;
		let Cls = egret.getDefinitionByName(clsStr);
		this.cruPanel = new Cls(id);
		this.cruPanel.top = 0;
		this.cruPanel.bottom = 0;
		this.cruPanel.left = 0;
		this.cruPanel.right = 0;
		this.cruPanel.activityID = id;
        // if( !clsStr )return;
        // if (!this.type3PanelList[id + ""]) {
        //     let Cls = HYDefine.getDefinitionByName(clsStr);

        //     this.type3PanelList[id + ""] = new Cls(id);
        //     this.type3PanelList[id + ""].top = 0;
        //     this.type3PanelList[id + ""].bottom = 0;
        //     this.type3PanelList[id + ""].left = 0;
        //     this.type3PanelList[id + ""].right = 0;
        //     this.type3PanelList[id + ""].activityID = id;
        // }
    }

    public updateData() {
        // this.cruPanel.updateData();
        this.cruPanel && this.cruPanel.updateData();
    }

}