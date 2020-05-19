/**
 *
 * 神羽技能tips
 *
 */
class GodWingSkillTipsWin extends BaseEuiView {
	/**当前*/
	private icon:GodWingItem;
	private lv:eui.Label;
	private content:eui.Label;
	private condition:eui.Label;
	private name1:eui.Label;
	/**下一阶*/
	private icon0:GodWingItem;
	private lv0:eui.Label;
	private content0:eui.Label;
	private condition0:eui.Label;


	private bgClose:eui.Rect;
	private gwsConfig:GodWingSuitConfig;
	private nextConfig:GodWingSuitConfig;
	constructor() {
		super();
		this.skinName = "ShenYuSkillTipsSkin";
	}


	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this.bgClose, this.onClick);
		this.gwsConfig = param[0];
		let isActive = param[1];
		for( let i in GlobalConfig.GodWingSuitConfig ){
			let suitconfig:GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[i];
			if( suitconfig.skillname && suitconfig.lv > this.gwsConfig.lv ){
				this.nextConfig = suitconfig;//取最新技能套装
				break;
			}
		}
		if( !isActive ){
			this.currentState = "unactive";
		}else{
			if( this.nextConfig ){
				this.currentState = "active";
			}else{
				this.currentState = "max";
			}
		}
		this.validateNow();


		this.updateDesc();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onClick)
		this.removeObserve();
	}

	private onClick(){
		ViewManager.ins().close(this);
	}
	private updateDesc(){
		this.setCurDesc();
		this.setNextDesc();
	}
	//当前
	private setCurDesc(){
		this.icon.data = this.gwsConfig;
		this.icon.setNameVisible(false);
		this.icon.setCountVisible(false);
		this.content.textFlow = TextFlowMaker.generateTextFlow1(this.gwsConfig.skilldesc);
		// let rex:RegExp = /\d+/g;
		// let rlv = rex.exec(this.gwsConfig.skillname);//获取等级
		this.lv.text = `等级：`+this.gwsConfig.skilllevel;
		let glc:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[this.gwsConfig.lv][1];
		let showlv:number = GlobalConfig.GodWingItemConfig[glc.itemId].showlv;
		this.condition.text = `所有神羽达到${showlv}阶`;
	}
	//下一阶
	private setNextDesc(){
		if( !this.nextConfig )return;
		this.icon0.data = this.nextConfig;
		this.icon0.setNameVisible(false);
		this.icon0.setCountVisible(false);
		this.content0.textFlow = TextFlowMaker.generateTextFlow1(this.nextConfig.skilldesc);
		// let rex:RegExp = /\d+/g;
		// let rlv = rex.exec(this.nextConfig.skillname);//获取等级
		this.lv0.text = `等级：`+this.nextConfig.skilllevel + "";
		let glc:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[this.nextConfig.lv][1];
		let showlv:number = GlobalConfig.GodWingItemConfig[glc.itemId].showlv;
		this.condition0.text = `所有神羽达到${this.nextConfig.lv}阶`;
	}




}
ViewManager.ins().reg(GodWingSkillTipsWin, LayerManager.UI_Popup);