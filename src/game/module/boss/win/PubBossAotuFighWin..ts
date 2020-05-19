/**
 *
 */
class PubBossAotuFighWin extends BaseEuiView {

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;

	private list0: eui.List;
	private listDatas: eui.ArrayCollection;
	private bgClose: eui.Rect;
	private selectBoss:any[]=[];
	private vipselectBoss:any[]=[];
	private tips: eui.Label;
	private type:number = 0;

	constructor() {
		super();
		this.skinName = "BossAutomaticSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

		this.listDatas = new eui.ArrayCollection;
	}

	public open(...param: any[]): void {
		this.type = param[0];
		if (this.type == UserBoss.BOSS_SUBTYPE_QMBOSS) {
			this.list0.itemRenderer = PubBossAutoFighItem;//野外Boss
		} else if (this.type == UserBoss.BOSS_SUBTYPE_HOMEBOSS) {
			this.list0.itemRenderer = HomeBossAutoFighItem;//VipBoss
			this.tips.text = "VIPBoss最多选择2种Boss自动挑战";
		}

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap)
		let tempArr: WorldBossItemData[] = [];
		tempArr = UserBoss.ins().worldInfoList[this.type].slice();
		if(this.type == UserBoss.BOSS_SUBTYPE_QMBOSS){
			if(!SamsaraModel.ins().isOpen()){
				let ary : WorldBossItemData[] = [];
				for(let i in tempArr){
					let config: WorldBossConfig = GlobalConfig.WorldBossConfig[tempArr[i].id];
					if(!config.samsaraLv){
						ary.push(tempArr[i]);
					}
				}
				tempArr = ary;
			}
		}

		this.listDatas.source = tempArr.sort(this.compareFn);
		this.list0.dataProvider = this.listDatas;
		this.addTouchEvent(this,this.onTap);
		this.checkLength();
	}

	public close(...param: any[]): void {
		UserBoss.ins().sendBossAutoFigh();//改成世界Boss发送自动挑战设置
		this.removeTouchEvent(this, this.onTap);
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		UserTips.ins().showTips(`设置完成`);
	}

	private checkLength():void{
		for (let i = 0; i < UserBoss.ins().activeList.length; i++){
			let config: WorldBossConfig = GlobalConfig.WorldBossConfig[UserBoss.ins().activeList[i]];
			config.type == 2 ? this.selectBoss.push(UserBoss.ins().activeList[i]) : this.vipselectBoss.push(UserBoss.ins().activeList[i])
		}
	}

	private onTap(e: egret.TouchEvent): void {
		if (e.target instanceof eui.CheckBox) {
			let index: number = parseInt((<eui.CheckBox>e.target).name);
			if (this.type == UserBoss.BOSS_SUBTYPE_QMBOSS){
				let is_show = this.selectBoss.indexOf(index);
				if (is_show == -1){
					if (this.selectBoss.length <2){
						this.selectBoss.push(index);
						UserBoss.ins().setBossAutoFigh(index);
					} else {
						e.target.selected = false;
					}
				} else{
					e.target.selected = false;
					for (let i = 0; i < this.selectBoss.length; i++){
						if (this.selectBoss[i] == index){
							this.selectBoss.splice(i,1);
						}
					}
					UserBoss.ins().setBossAutoFigh(index);
				}
			} else if (this.type == UserBoss.BOSS_SUBTYPE_HOMEBOSS){
				let is_show = this.vipselectBoss.indexOf(index);
				if (is_show == -1){
					if (this.vipselectBoss.length <2){
						this.vipselectBoss.push(index);
						UserBoss.ins().setBossAutoFigh(index);
					} else {
						e.target.selected = false;
					}
				} else{
					e.target.selected = false;
					for (let i = 0; i < this.vipselectBoss.length; i++){
						if (this.vipselectBoss[i] == index){
							this.vipselectBoss.splice(i,1);
						}
					}
					UserBoss.ins().setBossAutoFigh(index);
				}
			}
				          
		}
		else {
			switch (e.currentTarget) {
				case this.bgClose:
				case this.closeBtn:
				case this.closeBtn0:
					ViewManager.ins().close(this);
					break;
			}
		}
	}

	private compareFn(a: WorldBossItemData, b: WorldBossItemData): number {
		let configA: WorldBossConfig = GlobalConfig.WorldBossConfig[a.id];
		let configB: WorldBossConfig = GlobalConfig.WorldBossConfig[b.id];
		let canChallenge1 = UserBoss.isCanChallenge(configA);
		let canChallenge2 = UserBoss.isCanChallenge(configB);
		if (canChallenge1 && !canChallenge2) {
			return -1;
		} else if (!canChallenge1 && canChallenge2) {
			return 1;
		} else {
			if (configA.samsaraLv > configB.samsaraLv) {
				return 1;
			}
			else if (configA.samsaraLv < configB.samsaraLv) {
				return -1;
			}
			else if (configA.samsaraLv == configB.samsaraLv && configA.samsaraLv != 0) {
				if (configA.level > configB.level)
					return 1;
				else if (configA.level < configB.level)
					return -1;
			}
			else {
				if (configA.zsLevel > configB.zsLevel) {
					return 1;
				} else if (configA.zsLevel < configB.zsLevel) {
					return -1;
				}

				if (configA.level > configB.level)
					return 1;
				else if (configA.level < configB.level)
					return -1;
				else
					return 0;
			}
		}
	}
}
ViewManager.ins().reg(PubBossAotuFighWin, LayerManager.UI_Main);