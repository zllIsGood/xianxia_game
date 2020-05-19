/**
 *
 * 神羽套装tips
 *
 */
class GodWingSuitTipsWin extends BaseEuiView {
	/**当前*/
	private content0:eui.Label;
	private name0:eui.Label;
	/**下一阶*/
	private name1:eui.Label;
	private content1:eui.Label;


	private bgClose:eui.Rect;
	private gwsConfig:GodWingSuitConfig;
	private nextConfig:GodWingSuitConfig;
	private roleIndex:number;
	constructor() {
		super();
		this.skinName = "ShenYuSuitTipsSkin";
	}


	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this.bgClose, this.onClick);
		this.roleIndex = param[0];
		let mySuitLevel:number = Wing.ins().getGodWing(this.roleIndex).getSuitLevel();
		let nextSuitLevel:number = 0;
		if( mySuitLevel ){
			nextSuitLevel = Wing.ins().getNextLevel(mySuitLevel);
		}
		this.gwsConfig = GlobalConfig.GodWingSuitConfig[mySuitLevel];

		if( !this.gwsConfig ){
			for( let i in GlobalConfig.GodWingSuitConfig ){
				this.gwsConfig = GlobalConfig.GodWingSuitConfig[i];
				break;
			}
		}

		if( !mySuitLevel ){
			this.currentState = "unactive";
		}else{
			this.nextConfig = GlobalConfig.GodWingSuitConfig[nextSuitLevel];
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
		if( this.currentState == "unactive" ){
			let precent:number = Math.floor(this.gwsConfig.precent/100);
			let totalSum:number = Wing.GodWingMaxSlot;
			let mySum:number = Wing.ins().getGodWing(this.roleIndex).getSuitSum();
			this.content0.text = `激活条件：全部神羽1阶可激活（${mySum}/${totalSum}）\n激活属性：羽翼全属性+${precent}%`;
			this.name0.text = this.gwsConfig.suitname;
		}
		else if(this.currentState == "max"){
			let precent:number = Math.floor(this.gwsConfig.precent/100);
			this.content0.text = `激活属性：羽翼全属性+${precent}%`;
			this.name0.text = this.gwsConfig.suitname;
		}
		else{
			let precent:number = Math.floor(this.gwsConfig.precent/100);
			this.content0.text = `激活属性：羽翼全属性+${precent}%`;
			this.name0.text = this.gwsConfig.suitname;
		}

	}
	//下一阶
	private setNextDesc(){
		if( this.currentState == "active" ){
			let precent:number = Math.floor(this.nextConfig.precent/100);
			let totalSum:number = Wing.GodWingMaxSlot;
			let slotData:{slot:number,level:number}[] = Wing.ins().calcGodWingSlot(this.roleIndex);
			let mySum:number = 0;
			for( let i = 0;i < slotData.length;i++ ){
				if( slotData[i].level >= this.nextConfig.lv ){
					mySum++;//拥有>=该等级的部件数
				}
			}
			//获取套装部位信息
			let glc:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[this.nextConfig.lv][1];
			let showLv:number = GlobalConfig.GodWingItemConfig[glc.itemId].showlv;
			this.content1.text = `激活条件：全部神羽${showLv}阶可激活（${mySum}/${totalSum}）\n激活属性：羽翼全属性+${precent}%`;
			this.name1.text = this.nextConfig.suitname;

		}

	}


}
ViewManager.ins().reg(GodWingSuitTipsWin, LayerManager.UI_Popup);