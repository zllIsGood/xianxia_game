/*
    file: src/game/module/specialring/view/RingAwakeWin.ts
    date: 2018-9-14
    author: solace
    descript: 戒指唤醒激活界面
*/

class RingAwakeWin extends BaseEuiView {
	/** 控件 */
    private goQuicklyOpen0: eui.Button;
    private redPoint: eui.Image;
    private eff: eui.Group;

    /** 数据 */
    private awakeData; //服务端数据

    /** 配置 */

    /** 特效 */
    private activateEff: MovieClip;
    private ringEff: MovieClip;

	constructor() {
		super();
		this.skinName = "NewRingSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

        this.activateEff = new MovieClip();
        this.activateEff.playFile(RES_DIR_EFF + "chargeff1", -1);
        this.activateEff.x = this.goQuicklyOpen0.width/2;
        this.activateEff.y = this.goQuicklyOpen0.height/2;
        this.goQuicklyOpen0.addChild(this.activateEff);

        this.ringEff = new MovieClip();
        this.ringEff.playFile(RES_DIR_EFF + "tejie06", -1);
        this.ringEff.x = this.eff.width/2;
        this.ringEff.y = this.eff.height/2;
        this.eff.addChild(this.ringEff);

        this.refreshData();
	}

	public open(...param: any[]): void {
        this.addTouchEvent(this.goQuicklyOpen0,this.awakeBtnCallBack)
        this.observe(UserTask.ins().post9012Event,this.refreshData);
        this.observe(SpecialRing.ins().postUnLock,this.refreshData);
        this.observe(SpecialRing.ins().postActiveRing,function () {
            ViewManager.ins().open(FireRingWin);
            let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[7];
            Activationtongyong.show(0, config.name, `j${config.icon}_png`, ActivationtongyongShareType.RingAwake);//激活特效界面
            this.closeWin();
        });
	}

    public close(...param: any[]): void {
	}

	public playUIEff(...param: any[]): void {
	}

    public refreshData(): void{
        this.awakeData = UserTask.ins().awakeData;

        let isFireRingAct = SpecialRing.ins().isFireRingActivate()
        this.goQuicklyOpen0.label = isFireRingAct ? '激  活' : '前往唤醒';

        // 显示红点
        let awakeData = UserTask.ins().awakeData;
        let len: number = Object.keys(awakeData.taskData).length;
        let count: number = isFireRingAct?1:0;
        let index: number = 0;
        for (let i in awakeData.taskData) {
            if (awakeData.taskData[i].state==1){
                count = 1;
            }
            if (awakeData.taskData[i].state==2){
                index++;
                if (index == len){
                    count = 1;
                }
            }
        }
        this.redPoint.visible = count==1;

        for (let i = 1; i <= 5; ++i) {
            if (!UserTask.ins().isTaskAwaked(i)){
                this[`icon${i}`].filters = FilterUtil.ARRAY_GRAY_FILTER;
                this[`skillName${i}`].textColor = 0x7F7F7F;
                this[`skillDes${i}`].textColor = 0x7F7F7F;
                this[`under${i}`].source = "ring_awake_p1_json.rings_btn_rate_lock";
            }
            else{
                this[`icon${i}`].filters = [];
                this[`skillName${i}`].textColor = 0x9F946D;
                this[`skillDes${i}`].textColor = 0x35E62B;
                this[`under${i}`].source = "ring_awake_p1_json.rings_btn_rate_unlock";
            }
        }

        if (!isFireRingAct) {
            this.ringEff.setGrey(true);
        }
    }

    private awakeBtnCallBack(): void{
        if (SpecialRing.ins().isFireRingActivate()){
            SpecialRing.ins().sendActiveRing(7);; //7是激活戒指的戒指ID
        }
        else{
            ViewManager.ins().open(AwakeWin);
            this.closeWin();
        }
    }
}
ViewManager.ins().reg(RingAwakeWin, LayerManager.UI_Main);
