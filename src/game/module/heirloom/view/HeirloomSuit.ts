/**
 * 齐鸣tips
 *
 */
class HeirloomSuit extends BaseEuiView {
	//ColorUtil.GRAY_COLOR2 灰色
	//ColorUtil.WHITE_COLOR2 白色

	public bgClose: eui.Rect;

	//cur
	public name0:eui.Label;
	public num0:eui.Label;
	public informationname0:eui.Label;
	//private cgroup[0-7]:eui.Group
	//private desc[0-7]:eui.Label
	//private attr[0-7]:eui.Label

	//next
	public name1:eui.Label;
	public num1:eui.Label;
	public informationname1:eui.Label;
	//private ngroup[0-7]:eui.Group
	//private ndesc[0-7]:eui.Label
	//private nattr[0-7]:eui.Label

	//定位特效
	public eff1:eui.Group;
	public eff2:eui.Group;

	private model1:MovieClip;
	private model2:MovieClip;

	public curRole:Role;
	constructor() {
		super();
		this.skinName = "heirloomSuit";
	}


	public initUI(): void {
		super.initUI();

		this.model1 = new MovieClip;
		this.model1.x = this.eff1.x;
		this.model1.y = this.eff1.y;
		this.eff1.parent.addChild(this.model1);

		this.model2 = new MovieClip;
		this.model2.x = this.eff2.x;
		this.model2.y = this.eff2.y;
		this.eff2.parent.addChild(this.model2);
	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.onClick);

		let roleId:number = param[0];
		this.curRole = SubRoles.ins().getSubRoleByIndex(roleId);
		this.setData();
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
		DisplayUtils.removeFromParent(this.model1);
		DisplayUtils.removeFromParent(this.model2);
		this.model1 = null;
		this.model2 = null;
	}

	private onClick(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	private setData(): void {
		let hinfos:HeirloomInfo[] = this.curRole.heirloom.getData();
		if( !hinfos )
			return null;
		let minlv:number = this.getMinEquipLv(hinfos);
		let strMap:{str1:string,str2:string,lv1:number,lv2:number} = this.getInfoMation(hinfos,minlv);
		this.setCurSuit(minlv,strMap.str1,strMap.lv1);
		this.setNextSuit(minlv,strMap.str2,strMap.lv2);
	}
	//当前
	private setCurSuit(minlv:number,str:string,lvNum:number){
		if( !minlv ){
			for( let i=0;i<8;i++ ){
				this["desc"+i].visible = false;
				this["attr"+i].visible = false;
			}
			this.informationname0.visible = false;
			this.num0.visible = false;
			this.name0.text = "当前没有激活套装效果";

			return;
		}
		this.informationname0.textFlow = TextFlowMaker.generateTextFlow(str);
		let id:number = minlv?minlv:1;
		let config:HeirloomEquipSetConfig = GlobalConfig.HeirloomEquipSetConfig[id];
		for( let i = 0;i < config.attr.length; i++ ){
			let cfg:{type:number,value:number} = config.attr[i];
			if( lvNum < 8 ){//不足8件属性变灰
				this["attr"+i].textColor = ColorUtil.GRAY_COLOR2;
				this["desc"+i].textColor = ColorUtil.GRAY_COLOR2;
			}
			this["desc"+i].text = this.getAttrName(cfg.type);
			let value:number = cfg.value;
			//由于配置于角色配置表客户端没读这个表 而服务器没有单独下发这个数据 天盟以来一直写死 所以暂时写死
			if( cfg.type == AttributeType.atCritEnhance )//暴击多增加显示角色基础暴击
				value += 15000;
			let vtext = "+"+value;
			if( i >= 4 ){
				value /= 100;
				vtext = "+"+value+"%";
			}
			this["attr"+i].text = vtext;
			this["attr"+i].x = this["desc"+i].x + this["desc"+i].width;
		}
		for( let i = config.attr.length; i < 8;i++ ){
			this["cgroup"+i].visible = false;//把多余的隐藏
		}

		this.name0.text = config.name;
		this.num0.text = `（${lvNum}/8）`;

		this.model1.playFile(RES_DIR_EFF + config.neff,-1);
	}
	//下一级
	private setNextSuit(minlv:number,str:string,lvNum:number){
		this.informationname1.textFlow = TextFlowMaker.generateTextFlow(str);
		let id:number = minlv?(minlv+1):1;
		let config:HeirloomEquipSetConfig = GlobalConfig.HeirloomEquipSetConfig[id];
		if( !config ){//满级
			this.name1.text = "没有下级可预览";
			this.num1.visible = false;
			this.informationname1.visible = false;
			for( let i = 0;i < 8;i++ ){
				this["ngroup"+i].visible = false;
			}
			return;
		}
		for( let i = 0;i < config.attr.length; i++ ){
			let cfg:{type:number,value:number} = config.attr[i];
			this["ndesc"+i].text = this.getAttrName(cfg.type);
			let value:number = cfg.value;
			//由于配置于角色配置表客户端没读这个表 而服务器没有单独下发这个数据 天盟以来一直写死 所以暂时写死
			if( cfg.type == AttributeType.atCritEnhance )//暴击多增加显示角色基础暴击
				value += 15000;
			let vtext = "+"+value;
			if( i >= 4 ){
				value /= 100;
				vtext = "+"+value+"%";
			}
			this["nattr"+i].text = vtext;
			this["nattr"+i].x = this["ndesc"+i].x + this["ndesc"+i].width;
		}
		for( let i = config.attr.length; i < 8;i++ ){
			this["ngroup"+i].visible = false;//把多余的隐藏
		}
		this.name1.text = config.name;
		this.num1.text = `（${lvNum}/8）`;

		this.model2.playFile(RES_DIR_EFF + config.neff,-1);
	}


	//获取套装文字颜色显隐
	private getInfoMation(hinfos:HeirloomInfo[],minlv:number){
		//武器   头盔   衣服    项链   护腕   腰带   戒指   鞋子
		let str1:string = "";
		let str2:string = "";
		let lv1:number = 0;//多少件>最小等级
		let lv2:number = 0;//多少件>最小等级
		let minlv2 = minlv?(minlv+1):1;
		for( let i = 0; i < hinfos.length; i++ ){
			let info:HeirloomInfo = hinfos[i];
			//text
			let title:string = HeirloomData.getEquipName(i);
			if( !info.lv ){
				str1 += `|C:${ColorUtil.GRAY_COLOR2}&T:${title}|   `;
				str2 += `|C:${ColorUtil.GRAY_COLOR2}&T:${title}|   `;
			}else{
				if( info.lv >= minlv ){
					lv1++;
					str1 += `|C:${ColorUtil.WHITE_COLOR2}&T:${title}|   `;
				}else{
					str1 += `|C:${ColorUtil.GRAY_COLOR2}&T:${title}|   `;
				}

				if( info.lv >= minlv2 ){
					lv2++;
					str2 += `|C:${ColorUtil.WHITE_COLOR2}&T:${title}|   `;
				}else{
					str2 += `|C:${ColorUtil.GRAY_COLOR2}&T:${title}|   `;
				}
			}
			//
		}
		return {str1:str1,str2:str2,lv1:lv1,lv2:lv2};
	}
	//获取当前诛仙最低套装等级
	private getMinEquipLv(hinfos:HeirloomInfo[]){
		let minLv:number = 0;
		let everyLv:boolean = true;//判断是否每一件lv都>0
		for( let i = 0; i < hinfos.length; i++ ){
			let info:HeirloomInfo = hinfos[i];
			if( i == 0 )
				minLv = info.lv;
			if( !info.lv && everyLv )
				everyLv = false;
			if( info.lv <= minLv )
				minLv = info.lv;
		}

		//不是每一件都>0 当前显示灰色 (针对0级套装时候)
		if( !everyLv ){
			for( let i = 0;i < 8; i++ ){
				this["desc"+i].textColor = ColorUtil.GRAY_COLOR2;
				this["attr"+i].textColor = ColorUtil.GRAY_COLOR2;
			}
		}

		return minLv;
	}

	private getAttrName(attType:number){
		let str = "";
		switch (attType){//AttributeData->getAttrStrByType
			case AttributeType.atAttack://攻击
				str = "攻击";
				break;
			case AttributeType.atMaxHp://生命
				str = "生命";
				break;
			case AttributeType.atDef://物防
				str = "物防";
				break;
			case AttributeType.atRes://魔防
				str = "魔防";
				break;
			case AttributeType.atRoleDamageEnhance://攻击玩家伤害加深 万份比
				str = "攻击玩家伤害加深";
				break;
			case AttributeType.atRoleDamageReduction://受到玩家伤害减免 万分比
				str = "受到玩家伤害减免";
				break;
			case AttributeType.atCritEnhance://暴击伤害加强
				str = "暴击伤害加强";
			break;
			case AttributeType.atPenetrate://穿透(无视万分比双防)
				str = "穿透（无视防御）";
				break;

		}
		return str;

	}

}
ViewManager.ins().reg(HeirloomSuit, LayerManager.UI_Popup);