/*
    file: src/game/module/awake/AwakeWin.ts
    date: 2018-9-10
    author: solace
    descript: 唤醒任务界面
*/

class AwakeWin extends BaseEuiView {
	/** 控件 */
	private closeBtn: eui.Button;
    private img: eui.Image; //形象图片
    private awakeName: eui.Label; //形象名称
    private imgFunc: eui.Image; //广告词
    private des: eui.Label; // 描述
    private list: eui.List; // 子任务列表
    private awakeBtn: eui.Button; //激活按钮
    private labPower: eui.BitmapLabel;// 战力显示
    private Groupeff: eui.Group;

    /** 数据 */
    private awakeData; //服务端数据
    private taskData: any[]; 

    /** 配置 */
    private typeConfig;

    /** 特效 */
    private activateEff: MovieClip;

	constructor() {
		super();
		this.skinName = "AwakeSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

        // 浮动动画
        DisplayUtils.upDownSineInOut(this.img,35);

        // 展示特效
        let effect: MovieClip = new MovieClip();
        this.Groupeff.addChild(effect);
        effect.playFile(`${RES_DIR_EFF}artifacteff2`, -1);

        this.refreshData();
        this.list.itemRenderer = AwakeTaskItem;
	}

	public open(...param: any[]): void {
        this.addTouchEvent(this.closeBtn, function(){ViewManager.ins().close(this);});
        this.addTouchEvent(this.awakeBtn, this.onAwakeCallBack);
        this.observe(UserTask.ins().post9013Event,this.refreshData);
        this.observe(UserTask.ins().post9012Event,this.refreshData);
	}

    public close(...param: any[]): void {
        egret.Tween.removeTweens(this.img);
	}

	public playUIEff(...param: any[]): void {
	}

	public refreshData(): void{

		this.awakeData = UserTask.ins().awakeData;
		this.typeConfig = UserTask.ins().getAwakeTypeConf(this.awakeData.taskGroupId);
		if (!this.typeConfig) return;

		let curType: number = this.awakeData.taskGroupId;

        // console.log(GlobalConfig.FunOpenTaskConfig);
        // console.log(GlobalConfig.FunOpenTaskListConfig);
        // console.log(GlobalConfig.FunOpenTaskTypeConfig);
        // console.log(this.awakeData);

        this.awakeName.text = this.typeConfig.name;
        this.des.textFlow = TextFlowMaker.generateTextFlow(this.typeConfig.des);

        this.imgFunc.source = this.typeConfig.word;
        this.img.source = this.typeConfig.fashion;
        this.labPower.text = this.typeConfig.power;

        let isAllDone: boolean = UserTask.ins().isCanAwake(this.awakeData.taskGroupId);
        this.imgFunc.visible = !isAllDone;
        this.des.visible = !isAllDone;
        this.awakeBtn.visible = isAllDone;
        this.awakeBtn.label = '立即唤醒';
        if (isAllDone && !this.activateEff){
        	this.activateEff = new MovieClip();
        	this.activateEff.playFile(RES_DIR_EFF + "chargeff1", -1);
        	this.activateEff.x = this.awakeBtn.width/2;
        	this.activateEff.y = this.awakeBtn.height/2;        	
        	this.awakeBtn.addChild(this.activateEff);
        }

		this.taskData = [];
        for (let i in GlobalConfig.FunOpenTaskListConfig[curType]) {
        	let data = {config:GlobalConfig.FunOpenTaskListConfig[curType][i],srvData:this.awakeData.taskData[i]};
        	this.taskData.push(data);
        }
        this.list.dataProvider = new eui.ArrayCollection(this.taskData);
	}

	private onAwakeCallBack(): void{

		switch (this.typeConfig.control) {
			case 1:
					ViewManager.ins().open(this.typeConfig.controlTarget[0], this.typeConfig.controlTarget[1]);
				break;

			default:
				break;
		}

        // 天仙没有激活功能，因此天仙唤醒任务奖励全部领取完后请求下一任务组
        if (this.awakeData.taskGroupId == UserTask.AWAKE_TASK_TYPE.ZHANLING
            && UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.ZHANLING)){
            UserTask.ins().requestNextAwakeTask(UserTask.AWAKE_TASK_TYPE.ZHANLING);
        }
        else if (this.awakeData.taskGroupId == UserTask.AWAKE_TASK_TYPE.RING
            && UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.RING)){
            UserTask.ins().requestNextAwakeTask(UserTask.AWAKE_TASK_TYPE.RING);
        }

		this.closeWin();
	}
}
ViewManager.ins().reg(AwakeWin, LayerManager.UI_Main);
