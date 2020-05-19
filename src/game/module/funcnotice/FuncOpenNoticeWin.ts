/*
    file: src/game/module/awake/FuncOpenNoticeWin.ts
    date: 2018-9-10
    author: solace
    descript: 功能开放界面
*/

class FuncOpenNoticeWin extends BaseEuiView {
	/** 控件 */
    private closeBtn: eui.Button;
    private img: eui.Image;
    private YesBtn: eui.Button;
    private des: eui.Label;
    private imgFunc: eui.Image;
    private listFunc: eui.List;
    private listReward: eui.List;
    private stateTxt: eui.Label;
    private Groupeff: eui.Group;

    private selectItem: FuncOpenNoticeItem;

    /** 数据 */
    private funcNoticeData: any; //服务端数据
    private provider: any[]; // 选项列表

    /** 配置 */

    /** 特效 */

	constructor() {
		super();
		this.skinName = "FuncNoticeSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

        // 浮动动画
        DisplayUtils.upDownSineInOut(this.img,30);

        // 展示特效
        let effect: MovieClip = new MovieClip();
        this.Groupeff.addChild(effect);
        effect.playFile(`${RES_DIR_EFF}artifacteff2`, -1);

        this.listReward.itemRenderer = ItemBase;
        this.listFunc.useVirtualLayout = false;
        this.listFunc.itemRenderer = FuncOpenNoticeItem;
        this.listFunc.addEventListener(eui.ItemTapEvent.ITEM_TAP,this.onFuncItemClick,this);
        this.refreshData();
	}

	public open(...param: any[]): void {
        this.addTouchEvent(this.closeBtn, this.closeWin);
        this.addTouchEvent(this.YesBtn, this.onGetRewardClick);
        this.observe(FuncNoticeController.ins().postFuncStateUpdate,this.refreshData);
	}

    public close(...param: any[]): void {
        this.removeTouchEvent(this.closeBtn,this.closeWin);
        this.removeTouchEvent(this.YesBtn,this.onGetRewardClick);
        this.removeObserve();
        egret.Tween.removeTweens(this.img);
	}

	public playUIEff(...param: any[]): void {
	}

    private refreshData(): void{
        this.funcNoticeData = FuncNoticeController.ins().getFuncNoticeData();
        this.provider = [];
        let pushData: Function = (state: number) => {
            for (let i in this.funcNoticeData.funcData) {
                if (this.funcNoticeData.funcData[i].state == state){
                    this.provider.push(this.funcNoticeData.funcData[i]);
                }
            }
        };
        pushData(1);
        pushData(0);
        pushData(2);
        // console.log(this.provider);
        this.listFunc.dataProvider = new eui.ArrayCollection(this.provider);
        // 选取可领奖功能，没有可领奖则选取下一个开启功能
        let funcChoose: Function;
        funcChoose = function () {
            TimerManager.ins().doNext(function () {
                for (let i = 0; i < this.listFunc.dataProvider.length; i++) {
                    let item = this.listFunc.getElementAt(i) as FuncOpenNoticeItem;
                    if (item && (item.data.state == 1 || item.data.state == 0)){
                        this.itemChoose(item);
                        this.listFunc.removeEventListener(egret.Event.ADDED,funcChoose,this);
                        break;
                    }
                }
            },this);
        }
        this.listFunc.addEventListener(egret.Event.ADDED,funcChoose,this);
    }

    private onFuncItemClick(e: eui.ItemTapEvent): void{
        // console.log(e.itemRenderer);
        this.itemChoose(e.itemRenderer as FuncOpenNoticeItem);
    }

    private itemChoose(item: FuncOpenNoticeItem): void{
        if (this.selectItem) {
            this.selectItem.setSelect(false);
        }
        this.selectItem = item;
        this.selectItem.setSelect(true);

        this.des.text = this.selectItem.data.config.openDes;
        this.img.source = this.selectItem.data.config.pic;
        this.imgFunc.source = this.selectItem.data.config.advert;
        this.listReward.dataProvider = new eui.ArrayCollection(this.selectItem.data.config.awardList);

        this.stateTxt.visible = this.selectItem.data.state==2;
        this.YesBtn.visible = this.selectItem.data.state==1;
    }

    private onGetRewardClick(): void{
        if (!this.selectItem) return;

        FuncNoticeController.ins().c69003(this.selectItem.data.funcId);

        if (this.selectItem.data.config.controlTarget){
            ViewManager.ins().open(this.selectItem.data.config.controlTarget[0], this.selectItem.data.config.controlTarget[1]);
        }
    }
}
ViewManager.ins().reg(FuncOpenNoticeWin, LayerManager.UI_Main);
