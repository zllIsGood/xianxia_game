/**
 * 必杀注灵
 */
class PunchEquipForge extends BaseView {
	private powerPanel:PowerPanel;

	//必杀伤害减免a% -> b% (注灵等级达到 X/Y)
	private exattr0:eui.Label;
	private arrow4:eui.Label;
	private exattr1:eui.Label;
	private exattr2:eui.Label;

	//attr0~attr3
	//arrow0~arrow3
	//addAttr0~addAttr3
	//pELv0~pELv7
	//pEquip0~pEquip7
	//eff0~eff7

	//消耗
	private costGroup:eui.Group;
	private cosedesc:eui.Label;
	private costicon:eui.Image;
	private costcount:eui.Label;

	//按钮
	private btn:eui.Button;
	private getItemTxt:eui.Label;
	private mc:MovieClip;

	private maxPos:number;//孔位
	private redPoint:eui.Image;//红点
	private mcs:MovieClip[];
	constructor() {
		super();
	}
	public childrenCreated(): void {
		this.init();
	}

	private init(){
		let text = this.getItemTxt.text;
		this.getItemTxt.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${text}`);
		this.maxPos = 8;
		this.mcs = [];
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.getItemTxt, this.onClick);
		this.addTouchEvent(this.btn, this.onClick);
		this.observe(UserSkill.ins().postUpgradeForge,this.UpgradeForgeCallback);
		this.observe(UserEquip.ins().postSmeltEquipComplete, this.callback);
		this.updateDate();
	}
	private callback(){
		this.updateDate();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.getItemTxt, this.onClick);
		this.removeTouchEvent(this.btn, this.onClick);
		DisplayUtils.removeFromParent(this.mc);
		for( let i = 0; i < this.mcs.length;i++ ){
			DisplayUtils.removeFromParent(this.mcs[i]);
		}
	}
	protected onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget){
			case this.getItemTxt:
				UserWarn.ins().setBuyGoodsWarn(909998);
				break;
			case this.btn:
				let pos:number = UserSkill.ins().getPunchForge().calcSelectPos();
				let ptype = UserSkill.ins().getPunchForge().isUpgradePunchForge(pos);
				if( ptype == PunchEquipForgeData.TYPE_NO ){
					UserTips.ins().showTips(`|C:0xff0000&T:碎片不足`);
					return;
				}
				if( ptype == PunchEquipForgeData.TYPE_MAX ){
					UserTips.ins().showTips(`|C:0x00ff00&T:已满级`);
					return;
				}
				UserSkill.ins().sendUpgradeForge(pos);
				break;
		}
	}
	private UpgradeForgeCallback(){
		this.updateDate(true);
	}
	private updateDate(eff?:boolean){
		let pos:number = UserSkill.ins().getPunchForge().calcSelectPos();
		let lv:number = 0;
		let ptype:number = PunchEquipForgeData.TYPE_MAX;
		//判断是否满级
		for( let i = 0; i < this.maxPos;i++ ){
			let tmp = UserSkill.ins().getPunchForge().isUpgradePunchForge(pos);
			if( tmp != PunchEquipForgeData.TYPE_MAX ){
				ptype = 0;
				break;
			}
		}

		if( ptype == PunchEquipForgeData.TYPE_MAX ){
			this.currentState = "full";
		}else{
			this.currentState = "normal";
			lv = UserSkill.ins().getPunchForge().getPunchLevel(pos);
		}
		this.validateNow();

		this.setSelect(pos);
		this.setEff();
		this.updateAttrDesc(pos,lv);
		this.updateCost(pos,lv);
		this.setPower();
		if( eff )
			this.setPosEff(pos);
	}
	private setPosEff(pos:number){
		let index = pos - 1;
		if( index < 0 )
			index = this.maxPos-1;

		if( !this.mcs[index] )
			this.mcs[index] = new MovieClip;
		if( !this.mcs[index].parent ){
			this[`eff${index}`].addChild(this.mcs[index]);
		}
		this.mcs[index].playFile(RES_DIR_EFF + "forgeSuccess", 1);

	}
	private setSelect(pos:number){
		for( let i = 0; i < this.maxPos;i++ ){
			this[`pEquip${i}`].visible = false;
			this[`pELv${i}`].text = `+${UserSkill.ins().getPunchForge().getPunchLevel(i)}`;
		}
		if( this.currentState == "normal" ){
			this[`pEquip${pos}`].visible = true;
		}

	}
	private setEff(){
		if( this.currentState != "normal" ){
			DisplayUtils.removeFromParent(this.mc);
			return;
		}
		if( !UserSkill.ins().canSolve() ){
			DisplayUtils.removeFromParent(this.mc);
			return;
		}

		if( !this.mc )
			this.mc = new MovieClip;
		if( !this.mc.parent ){
			this.getItemTxt.parent.addChild(this.mc);
			this.mc.playFile(RES_DIR_EFF + "chargeff1", -1);
			this.mc.touchEnabled = false;
			this.mc.scaleY = 0.8;
			this.mc.scaleX = 0.8;
		}
		this.mc.x = 0;
		this.mc.y = 0;

	}
	public updateAttrDesc(pos:number,lv:number){
		if( this.currentState == "full" ){
			//满级
			let suitlv:number = UserSkill.ins().getPunchForge().getSuitlevel();
			let mconfig:PunchEquipMasterConfig = GlobalConfig.PunchEquipMasterConfig[suitlv];

			//基础属性
			let attrs:AttributeData[] = UserSkill.ins().getPunchForge().getAttributeData();//所有部位加总的属性集合
			for( let i = 0; i < attrs.length;i++ ){
				if( this[`attr${i}`] ){
					let str = "";
					let value = 0;//config.attr[i].value;
					for( let j = 0;j < attrs.length;j++ ){
						if( attrs[j].type == attrs[i].type ){
							value = attrs[j].value;
							break;
						}
					}
					value += (mconfig.attr&&mconfig.attr[i])?mconfig.attr[i].value:0;
					str = AttributeData.getAttrStrByType(attrs[i].type);
					str += "+";
					str += value;
					this[`attr${i}`].text = str;
				}
			}
			//套装属性
			let astr = "";
			astr = "必杀伤害减免";//AttributeData.getExtAttrStrByType(mconfig.exattr[0].type);
			astr += mconfig.exattr[0].value/100;
			this.exattr0.text = `${astr}%`;
			return
		}

		let config:PunchEquipConfig = GlobalConfig.PunchEquipConfig[pos][lv];
		if( config ){
			let suitlv:number = UserSkill.ins().getPunchForge().getSuitlevel();
			let mconfig:PunchEquipMasterConfig = GlobalConfig.PunchEquipMasterConfig[suitlv];
			let isActive:boolean = true;//是否激活了注灵套装
			if( !mconfig ){
				isActive = false;
				for( let k in GlobalConfig.PunchEquipMasterConfig ){
					mconfig = GlobalConfig.PunchEquipMasterConfig[k];
					break;
				}
			}
			//基础属性
			let nextconfig:PunchEquipConfig = UserSkill.ins().getPunchForge().getPosNextLevelConfig(pos);
			let attrs:AttributeData[] = UserSkill.ins().getPunchForge().getAttributeData();//所有部位加总的属性集合
			for( let i = 0; i < config.attr.length;i++ ){
				if( this[`attr${i}`] ){
					let str = "";
					let value = 0;//config.attr[i].value;
					for( let j = 0;j < attrs.length;j++ ){
						if( attrs[j].type == config.attr[i].type ){
							value = attrs[j].value;
							break;
						}
					}
					value += (mconfig.attr&&mconfig.attr[i])?mconfig.attr[i].value:0;
					str = AttributeData.getAttrStrByType(config.attr[i].type);
					str += "+";
					str += value;
					this[`attr${i}`].text = str;
					if( nextconfig && this[`arrow${i}`] && this[`addAttr${i}`] && nextconfig.attr[i].value ){
						this[`addAttr${i}`].visible = this[`arrow${i}`].visible = true;
						let nstr = "";
						nstr += value + (nextconfig.attr[i].value - config.attr[i].value);
						this[`addAttr${i}`].text = nstr;
						this[`arrow${i}`].x = this[`attr${i}`].x + this[`attr${i}`].width;
						this[`addAttr${i}`].x = this[`arrow${i}`].x + this[`arrow${i}`].width;
					}else{
						this[`addAttr${i}`].visible = this[`arrow${i}`].visible = false;
					}
				}
			}
			//套装属性
			let nextsuitlv:number;
			let nextmconfig:PunchEquipMasterConfig;
			let astr = "";
			astr = "必杀伤害减免";//AttributeData.getExtAttrStrByType(mconfig.exattr[0].type);
			if( isActive ){
				astr += mconfig.exattr[0].value/100;
				nextsuitlv = UserSkill.ins().getPunchForge().getNextSuitlevel();
				nextmconfig = GlobalConfig.PunchEquipMasterConfig[nextsuitlv];
			}else{
				astr += 0;
				nextmconfig = mconfig;
				nextsuitlv = suitlv;
			}

			this.exattr0.text = `${astr}%`;
			this.arrow4.x = this.exattr0.x + this.exattr0.width + this.arrow4.width;
			this.exattr1.x = this.arrow4.x + this.arrow4.width;
			if( nextmconfig ){
				this.exattr1.text = `${nextmconfig.exattr[0].value/100}%`;
				this.exattr2.x = this.exattr1.x + this.exattr1.width;
				let curLevel:number = Math.floor(UserSkill.ins().getPunchForge().level/this.maxPos);
				this.exattr2.text = `(注灵等级达到 ${curLevel}/${nextsuitlv})`;
			}

		}else{
			//部位未升任何孔
			let attrs:AttributeData[] = UserSkill.ins().getPunchForge().getAttributeData();//所有部位加总的属性集合
			config = GlobalConfig.PunchEquipConfig[pos][1];
			for( let i = 0; i < config.attr.length;i++ ){
				if( this[`attr${i}`] ){
					let str = "";
					let value = 0;
					for( let j = 0;j < attrs.length;j++ ){
						if( attrs[j].type == config.attr[i].type ){
							value = attrs[j].value;
							break;
						}
					}
					str = AttributeData.getAttrStrByType(config.attr[i].type);
					str += "+";
					str += value;
					this[`attr${i}`].text = str;
					if( this[`arrow${i}`] && this[`addAttr${i}`] && config.attr[i].value){
						this[`addAttr${i}`].visible = this[`arrow${i}`].visible = true;
						let nstr = "";
						nstr += config.attr[i].value;
						this[`addAttr${i}`].text = nstr;
						this[`arrow${i}`].x = this[`attr${i}`].x + this[`attr${i}`].width;
						this[`addAttr${i}`].x = this[`arrow${i}`].x + this[`arrow${i}`].width;
					}else{
						this[`addAttr${i}`].visible = this[`arrow${i}`].visible = false;
					}
				}
			}

			//套装
			let mconfig:PunchEquipMasterConfig;
			for( let k in GlobalConfig.PunchEquipMasterConfig ){
				mconfig = GlobalConfig.PunchEquipMasterConfig[k];
				break;
			}

			let astr = "";
			astr = "必杀伤害减免";//AttributeData.getExtAttrStrByType(mconfig.exattr[0].type);
			astr += 0;
			this.exattr0.text = `${astr}%`;
			this.arrow4.x = this.exattr0.x + this.exattr0.width + this.arrow4.width;
			this.exattr1.x = this.arrow4.x + this.arrow4.width;
			if( mconfig ){
				this.exattr1.text = `${mconfig.exattr[0].value/100}%`;
				this.exattr2.x = this.exattr1.x + this.exattr1.width;
				this.exattr2.text = `(注灵等级达到 ${0}/${mconfig.level})`;
			}

		}

	}
	public updateCost(pos:number,lv:number){
		let config:PunchEquipConfig;
		if( !pos && !lv ){//未开一个孔
			config = GlobalConfig.PunchEquipConfig[0][1];
		}else{
			config = UserSkill.ins().getPunchForge().getPosNextLevelConfig(pos);
		}
		if( !config ){
			config = GlobalConfig.PunchEquipConfig[pos][1];
		}
		this.costicon.source = RewardData.getCurrencyRes(config.cost.id);
		let colorStr: string = "";
		let ptype = UserSkill.ins().getPunchForge().isUpgradePunchForge(pos);
		if (ptype == PunchEquipForgeData.TYPE_OK){
			colorStr = ColorUtil.GREEN_COLOR;
			this.redPoint.visible = true;
		}
		else{
			this.redPoint.visible = false;
			colorStr = ColorUtil.RED_COLOR;
		}

		let count:number = 0;
		if( config.cost.id == MoneyConst.punch1 ){
			count = Actor.togeatter1;
		}else if( config.cost.id == MoneyConst.punch2 ){
			count = Actor.togeatter2;
		}

		this.costcount.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${count}</font><font color=${ColorUtil.WHITE_COLOR}>/${config.cost.count}</font> `);

	}
	public setPower(){
		let attrs:AttributeData[] = UserSkill.ins().getPunchForge().getAttributeData();//所有部位加总的属性集合
		let powers:number = UserBag.getAttrPower(attrs);
		let suitlv:number = UserSkill.ins().getPunchForge().getSuitlevel();
		let mconfig:PunchEquipMasterConfig = GlobalConfig.PunchEquipMasterConfig[suitlv];
		if( mconfig && mconfig.attr){
			powers += UserBag.getAttrPower(mconfig.attr);
			powers += mconfig.exPower;
		}
		powers *= SubRoles.ins().subRolesLen;
		this.powerPanel.setPower(powers);
	}


}

