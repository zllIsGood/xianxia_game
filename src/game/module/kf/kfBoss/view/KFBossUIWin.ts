/**
 * 跨服boss主界面UI 
 * 暂时没用
 * 
 */
class KFBossUIWin extends BaseEuiView {
	///可攻击列表
	private attList: eui.Group;
	private flagGroup: eui.Group;
	private flagHead: eui.Image;
	private flagName: eui.Label;
	private bar: eui.Scroller;
	private attackList: eui.List;

	///被攻击列表
	private weixie: eui.Group;
	private attackedList: eui.List;
    
	///归属者
	private belongGroup: eui.Group;
	private roleHead: eui.Image;
	private neigongBar: eui.ProgressBar;
	private bloodBar: eui.ProgressBar;
	private belongNameTxt: eui.Label;
	private attguishu: eui.Button;


    ///攻击boss，攻击归属者
	private attackBtnGroup: eui.Group;
	private attackBoss: BaseComponent;
	private attackPlayer: BaseComponent;

	public constructor() {
		super();
		this.skinName = `KFbossUISkin`;


		this.attackList.itemRenderer = TargetMemberHeadRender;
		this.attackedList.itemRenderer = TargetMemberHeadRender;
	}
	public open(...args): void {
        
	}
	public close(...args): void {

	}
}

ViewManager.ins().reg(KFBossUIWin, LayerManager.UI_Main);