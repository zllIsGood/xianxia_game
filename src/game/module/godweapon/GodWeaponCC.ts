/**神兵*/
class GodWeaponCC extends BaseSystem {
	//当前经验
	public curExp: number = 0;

	/** 首次获得当前经验数据 */
	private _firstExp:boolean = true;

	//神兵技能(skinId)
	public allSkillData: any;
	//神兵技能(skillId)
	public allSkillData2: any;
	//神兵信息
	public weaponDataAry: GodWeaponData[];
	//所用圣物
	public allGodItemData: any;
	//副本信息
	public fubenInfoData: GwFubenData;
	//排行榜信息
	public rankInfoDataAry: GwRankInfoData[];
	//最大的id
	public maxSkillIdAry: number[];
	private _timeMijinAry: number[];//试炼的评分时间
	private _isFirst: boolean = false;
	public exattrDesObj: Object = {
		"43": "施放断空斩附加吸血效果，恢复%s%%伤害值的生命",
		"48": "白虎会吸收其他角色的亡魂，每死亡一个角色，其伤害提高%s%%",
		"44": "攻击时有几率触发武神之怒效果",
		"45": "攻击时有几率触发武神之怒效果",
		"46": "攻击时有几率触发武神之怒效果",
		"47": "白虎攻击时有10%机率狂暴，增加自身%s%%攻击力并且必暴击，持续3秒"
	}
	private gwSkillConfig: { [key: string]: { [key: string]: GWSkillReviseConfig } };//神兵技能配置 skill,gwIndex
	public gwshowTips: boolean;//神兵提示
	public roleshowTips: number;//升级神兵0-8返回数 用于置换gwshowTips用

	public gwTask:GwTaskData;//神兵任务

	public constructor() {
		super();
		this.sysId = PackageID.GodWeapon;

		this.gwTask = new GwTaskData();

		this.regNetMsg(1, this.postUpdateExp);
		this.regNetMsg(2, this.postUpdateInfo);

		//神兵副本
		this.regNetMsg(6, this.postFubenInfo);
		this.regNetMsg(9, this.postRankInfo);
		this.regNetMsg(13,this.doGetAward);

		//神兵任务
		this.regNetMsg(10, this.postGwTask);
	}
	public static ins(): GodWeaponCC {
		return super.ins() as GodWeaponCC;
	}
	//初始化数据
	private createData(): void {
		if (this._isFirst == false) {
			this.initData();
			this._isFirst = true;
		}
	}
	//初始配置数据
	private initData(): void {
		this.maxSkillIdAry = [];
		this.weaponDataAry = [];
		this.allSkillData = {};
		this.allSkillData2 = {};
		this.allGodItemData = {};
		for (let key in GlobalConfig.GodWeaponLineConfig) {
			let tempObj: any = {};
			let tempObj2: any = {};
			let data: GodWeaponLineConfig[] = GlobalConfig.GodWeaponLineConfig[key];
			this.allSkillData[key] = tempObj;
			this.allSkillData2[key] = tempObj2;
			let maxId: number = 0;
			for (let i in data) {
				let skillData: GwSkillData = new GwSkillData();
				skillData.skillId = parseInt(i);
				skillData.skillLv = 0;
				skillData.config = data[i];
				skillData.weaponId = parseInt(key);
				tempObj2[skillData.skillId] = skillData;
				tempObj[skillData.config.skinId] = skillData;
				maxId++;
			}
			this.maxSkillIdAry.push(maxId);
			let aryItem: GwItem[] = [];
			for (let j: number = 0; j < GlobalConfig.GodWeaponBaseConfig.weaponItemCount; j++) {
				let item: GwItem = new GwItem();
				item.pos = j + 1;
				item.itemId = undefined;
				item.config = null;
				item.weaponId = parseInt(key);
				aryItem.push(item);
			}
			this.allGodItemData[key] = aryItem;
		}

		this.gwSkillConfig = {};
		for (let key in GlobalConfig.GWSkillReviseConfig) {
			let data = GlobalConfig.GWSkillReviseConfig[key];
			if (!this.gwSkillConfig[data.skill]) this.gwSkillConfig[data.skill] = {};
			this.gwSkillConfig[data.skill][data.gwIndex] = data;
		}

	}

	public godWeaponIsOpen() {
		return UserZs.ins().lv >= GlobalConfig.GodWeaponBaseConfig.zhuanshengLevel && GameServer.serverOpenDay >= GlobalConfig.GodWeaponBaseConfig.openDay;
	}

	/**
	 * 获取技能附加参数配置表
	 * @param skillId
	 * @returns {any}
	 */
	public getReviseBySkill(skillId: number) {
		if (!this.allSkillData2) return null;
		let weaponId = `${skillId}`.charAt(0);
		let skillData = this.allSkillData2[weaponId];
		if (!skillData) return null;
		let skill = Math.floor(skillId / 1000);
		let skills = [];
		for (var skillIdx in skillData) {
			let data: GwSkillData = skillData[skillIdx];
			if (data.config.skill == skill) {
				if (data.skillLv == 0) {
					continue;
				}
				let lv = data.skillLv + data.addLv;
				let index = data.skillId * 1000 + lv;
				if (this.gwSkillConfig[skill] && this.gwSkillConfig[skill][index]) {
					skills.push(this.gwSkillConfig[skill][index]);
				}
			}
		}
		return skills;
	}

	/**
	 * 获取神兵职业新技能 [SkillData,SkillData]
	 * @param job
	 * @returns {Array}
	 */
	public getJobGWNewSkill(job: number) {
		if (!this.allSkillData2) return null;
		let skillData = this.allSkillData2[job];
		if (!skillData) return null;

		let roleData = SubRoles.ins().getSubRoleByJob(job);
		if (!roleData) return null;

		if (!roleData.godWeaponSkills) roleData.godWeaponSkills = [];

		let count = 0;
		for (var skillIdx in skillData) {
			let data: GwSkillData = skillData[skillIdx];
			if (data.config.newskill || data.config.passiveskill) {
				let skill = data.config.newskill || data.config.passiveskill;
				let skillId = skill * 1000 + (data.skillLv + data.addLv);

				roleData.godWeaponSkills[count] = roleData.godWeaponSkills[count] || new SkillData(skillId);
				roleData.godWeaponSkills[count].configID = skillId;

				count += 1;
			}
		}
		return roleData.godWeaponSkills;
	}

	//得到神兵技能 (skinId)
	public getWeaponSkinIdData(weaponId: number, skinId: number): GwSkillData {
		return this.allSkillData[weaponId][skinId];
	}
	//得到神兵技能 (skillid)
	public getWeaponSkillidData(weaponId: number, skillId: number): GwSkillData {
		return this.allSkillData2[weaponId][skillId];
	}
	//得到圣物 pos 1 开始 weaponId 从1开始
	public getGodItemData(weaponId: number, pos: number): GwItem {
		return this.allGodItemData[weaponId][pos - 1]
	}
	/**
	 * 60-1
	 * 更新神兵经验信息
	 */
	public postUpdateExp(bytes: GameByteArray): void {
		let oldExp:number = this.curExp;
		this.curExp = bytes.readInt();

		if (!this._firstExp)
		{
			if (this.curExp - oldExp > 0)
				UserTips.ins().showTips(`|C:0xffd93f&T:神兵经验  +${this.curExp - oldExp}|`);	
		}

		this._firstExp = false;
	}
	/**
	 * 60-2
	 * 更新神兵信息
	 */
	public postUpdateInfo(bytes: GameByteArray): void {
		this.createData();
		let count: number = bytes.readInt();
		let data: GodWeaponData;
		for (let i: number = 0; i < count; i++) {
			if (this.weaponDataAry[i]) {
				data = this.weaponDataAry[i];
				data.parse(bytes);
			} else {
				data = new GodWeaponData(bytes);
				this.weaponDataAry.push(data);
			}
		}

		this.weaponDataAry.sort((a:GodWeaponData, b:GodWeaponData):number=>{
			if(a.weaponId < b.weaponId)
				return -1;
			return 1;
		});
	}

	public getWeaponData(weaponId:number):GodWeaponData {
		if(this.weaponDataAry) {
		for (let data of this.weaponDataAry)
			if(data.weaponId == weaponId)
				return data;
		}
		return null;
	}

	/**
	 * 60-3
	 * 升级技能(哪个神兵，技能id);
	 */
	public upSkill(weaponId: number, skillId: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(weaponId);
		bytes.writeInt(skillId);
		this.sendToServer(bytes);
	}
	/**
	 * 60-4
	 * 镶嵌圣物(哪个神兵，位置，镶嵌Id);
	 */
	public inlayItem(weaponId: number, pos: number, itemId: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeInt(weaponId);
		bytes.writeInt(pos);
		bytes.writeInt(itemId);
		this.sendToServer(bytes);
	}
	/**
	 * 60-5
	 * 升级神兵
	 */
	public upWeapon(value: number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(value);
		this.sendToServer(bytes);
	}
	//是否显示红点
	public hadRedPoint(): boolean {
		this.createData();
		let b: boolean = false;
		// if(!GodWeaponWin.openCheck(true)){
		// 	return b;
		// }
		if (GameServer.serverOpenDay < GlobalConfig.GodWeaponBaseConfig.openDay) {//没有开启
			return b;
		}
		if(GodWeaponRedPoint.ins().gwTaskRed) {
			b = true;
		} else {
			for (let i: number = 0; i < this.weaponDataAry.length; i++) {
				if (this.weaponDataAry[i] && this.weaponDataAry[i].hasRedPoint == true || this.getSwRedPoint(this.weaponDataAry[i].weaponId)) {
					b = true;
					break;
				}
			}
		}
		b = b || this.mijintHadRedPoint() || this.maxLvRedPoint();
		return b;
	}
	//最大神兵的等级是否满足红点
	public maxLvRedPoint(): boolean {
		if(!this.weaponDataAry) return false;
		let tempData: GodWeaponData[] = this.weaponDataAry.concat();
		tempData.sort(function (a: GodWeaponData, b: GodWeaponData) {
			return a.curLv - b.curLv;
		});
		let dataMax: GodWeaponData = tempData[tempData.length - 1];//最大的等级
		if (dataMax && dataMax.config && GodWeaponCC.ins().curExp >= dataMax.config.everyExp * 2) {
			return true;
		} else {
			return false;
		}
	}
	//试炼红点
	public mijintHadRedPoint(): boolean {
		if (this.fubenInfoData && this.godWeaponIsOpen() && this.fubenInfoData.hadChallengeNum > 0) {//神兵副本还有免费的挑战次数
			return true;
		} else {
			return false;
		}
	}
	//得到圣物红点
	public getSwRedPoint(weaponId: number): boolean {
		let ary: GwItem[] = this.allGodItemData[weaponId];
		let data: GwItem;
		for (let i: number = 0; i < ary.length; i++) {
			data = ary[i];
			if (data.isOpen && !data.itemId && GwShengWuChooseView.getGwItemType(data).length > 0) {
				return true;
			}
		}
		return false;
	}
	//得到神兵加成属性 weaponId 0,1,2
	public gwAddAttr(weaponId: number): { value: number, type: number }[] {
		let gwAry: { value: number, type: number }[] = this.getWeaponData(weaponId+1).addAttr.concat();//神兵等级属性加成
		let dataSkill: GwSkillData;
		let i: number = 0;
		let j: number = 0
		//神兵技能
		for (i = 0; i < this.maxSkillIdAry[weaponId]; i++) {
			dataSkill = this.getWeaponSkillidData(weaponId + 1, i + 1);
			if (dataSkill.skillLv + dataSkill.addLv > 0) {
				if (dataSkill.config.attr) {
					for (j = 0; j < dataSkill.config.attr.length; j++) {
						let objData: { value: number, type: number } = { value: 0, type: 0 };
						objData.value = dataSkill.config.attr[j].value * (dataSkill.skillLv + dataSkill.addLv);
						objData.type = dataSkill.config.attr[j].type;
						gwAry.push(objData);
					}
				}
			}
		}
		//圣物加成
		let aryGw: GwItem[] = this.allGodItemData[weaponId + 1];
		for (i = 0; i < aryGw.length; i++) {
			if (aryGw[i].itemId) {
				for (j = 0; j < aryGw[i].config.attr.length; j++) {
					let objData: { value: number, type: number } = { value: 0, type: 0 };
					objData.value = aryGw[i].config.attr[j].value;
					objData.type = aryGw[i].config.attr[j].type;
					gwAry.push(objData);
				}
			}
		}
		let addAry: { value: number, type: number }[] = [];
		for (i = 0; i < gwAry.length; i++) {
			let b: boolean = false;
			for (j = 0; j < addAry.length; j++) {
				if (addAry[j].type == gwAry[i].type) {
					addAry[j].value += gwAry[i].value;
					b = false;
					break;
				} else {
					b = true;
				}
			}
			if (b == true || addAry.length == 0) {
				let objData: { value: number, type: number } = { value: gwAry[i].value, type: gwAry[i].type };
				addAry.push(objData);
			}
		}
		return addAry;
	}
	/************************神兵副本*********************/
	/**60-6
	 * 副本信息
	 */
	public postFubenInfo(bytes: GameByteArray): void {
		if (!this.fubenInfoData) {
			this.fubenInfoData = new GwFubenData();
		}
		this.fubenInfoData.parse(bytes);
	}
	/**60-9
	 * 排行榜信息
	 */
	public postRankInfo(bytes: GameByteArray): void {
		if (!this.rankInfoDataAry) {
			this.rankInfoDataAry = [];
		}
		let count: number = bytes.readInt();
		let data: GwRankInfoData;
		for (let i: number = 0; i < count; i++) {
			data = this.rankInfoDataAry[i];
			if (!data) {
				data = new GwRankInfoData();
				this.rankInfoDataAry[i] = data;
			}
			data.parse(bytes);
		}
		this.rankInfoDataAry.sort(this.sortFun);
	}
	private sortFun(a: GwRankInfoData, b: GwRankInfoData): number {
		return a.rank - b.rank;
	}

	/**
	 * 60-10 神兵任务信息
	 * @param bytes
	 */
	public postGwTask(bytes: GameByteArray){
		this.gwTask.parser(bytes);
	}

	//请求副本信息60-6
	public requestFubenInfo(): void {
		let bytes: GameByteArray = this.getBytes(6);
		this.sendToServer(bytes);
	}
	//进入副本 60-7
	public joinFuben(value: number): void {
		let bytes: GameByteArray = this.getBytes(7);
		bytes.writeInt(value);
		this.sendToServer(bytes);
	}
	//购买buff 60-8
	public buybuff(type: number): void {
		let bytes: GameByteArray = this.getBytes(8);
		bytes.writeInt(type);
		this.sendToServer(bytes);
	}
	//请求排行榜信息60-9
	public requestRanInfo(): void {
		let bytes: GameByteArray = this.getBytes(9);
		this.sendToServer(bytes);
	}
	//领取副本奖励
	private doGetAward(bytes:GameByteArray):void{
		let win:number = bytes.readByte();//胜利或失败
		let curPoint:number = bytes.readByte();//评分
		if(ViewManager.gamescene){
			ViewManager.gamescene.removeMiingTimeFun();
			ViewManager.gamescene.setMJPingfen(curPoint);
		}
		if(win){//胜利
			ViewManager.ins().open(GwResultView,GameMap.fubenID,curPoint,UserFb.ins().mijingUseTime);
		}else{
			ViewManager.ins().open(GwResultView, GameMap.fubenID, 4)
		}
	}
	public requestGetAward():void{
		let bytes: GameByteArray = this.getBytes(13);
		this.sendToServer(bytes);
	}

	/**
	 * 接神兵任务 60-11
	 * @param job
	 */
	public requestReceiveTask(job:number) {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeInt(job);
		this.sendToServer(bytes);
	}

	/**
	 * 完成任务或激活神兵 60-12
	 * @param job
	 */
	public requestActiveWeapon() {
		this.sendBaseProto(12);
	}

	//得到时间
	public getPinfenTime(index: number): number {
		let time: number;
		if (!this._timeMijinAry) {
			this._timeMijinAry = [];
			for (let key in GlobalConfig.GodWeaponBaseConfig.fbGrade) {
				if (time) {
					this._timeMijinAry.push(GlobalConfig.GodWeaponBaseConfig.fbGrade[key] - time);
					time = GlobalConfig.GodWeaponBaseConfig.fbGrade[key];
				} else {
					time = GlobalConfig.GodWeaponBaseConfig.fbGrade[key];
					this._timeMijinAry.push(time);
				}
			}
		}
		return this._timeMijinAry[index];
	}

	//--------------------神兵任务---------------------

	//神兵是否已经激活
	public weaponIsActive(weaponId:number) {
		if(this.weaponDataAry) {
		for (let data of this.weaponDataAry) {
			if(data.weaponId == weaponId)
				return true;
		}
		}
		return false;
	}

	//任务是否开启
	public taskIsOpen() {
		if(GameServer.serverOpenDay >= GlobalConfig.GodWeaponBaseConfig.openDay) {
			return true;
		}
		return false;
	}

	/**
	 * 重置神兵技能点
	 * 60-14
	 * @param id 神兵ID
	*/
	public sendReset(id:number):void
	{
		let bytes:GameByteArray = this.getBytes(14);
		bytes.writeInt(id);
		this.sendToServer(bytes);
}
}
namespace GameSystem {
	export let  godWeaponCC = GodWeaponCC.ins.bind(GodWeaponCC);
}