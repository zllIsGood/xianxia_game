class HuanShouRedPoint extends BaseSystem {
	public upgradeRed: boolean = false;
	public danRed: boolean[] = [false, false];
	public skillRed: boolean = false;
	public equipListRed: boolean[] = [false, false, false, false, false, false];
	public equipPosRed: boolean[] = [false, false, false, false, false, false];
	public equipTotalRed: boolean = false;
	public skinListRed: { [key: number]: boolean };//为升级或升级或激活
	public skinListTalentRed: { [key: number]: boolean };//天赋
	public skinTotalRed: boolean = false;
	public totalRed: boolean = false;
	public isHuanShouOpen: boolean = false;
	public isRed: boolean = false;

	public constructor() {
		super();
		this.observe(UserHuanShou.ins().postUpgrade, this.postSkinListRed);
		this.associated(this.postUpgradeRed, UserHuanShou.ins().postUpgrade, UserHuanShou.ins().postHuanShouInfo, UserBag.ins().postItemAdd, UserBag.ins().postItemDel, this.postDanRed, this.postSkinTotalRed);
		this.associated(this.postDanRed, UserHuanShou.ins().postHuanShouInfo, UserHuanShou.ins().postUpdateDanInfo, UserBag.ins().postItemAdd, UserBag.ins().postItemDel, UserHuanShou.ins().postUpgrade);
		this.associated(this.postSkillRed, UserHuanShou.ins().postHuanShouInfo, UserHuanShou.ins().postUpdateSkill, UserHuanShou.ins().postHuanShouInfo, UserBag.ins().postItemAdd, UserBag.ins().postItemDel);
		this.associated(this.postEquipPosRed, UserHuanShou.ins().postHuanShouInfo, UserHuanShou.ins().postComposeEquip, UserBag.ins().postItemAdd, UserBag.ins().postItemDel);
		this.associated(this.postEquipListRed, UserHuanShou.ins().postHuanShouInfo, UserHuanShou.ins().postUpdateEquip, UserBag.ins().postItemAdd, UserBag.ins().postItemDel);
		this.associated(this.postEquipTotalRed, this.postEquipPosRed, this.postEquipListRed);
		this.associated(this.postTotalRed, this.postSkinTotalRed, this.postUpgradeRed, this.postSkillRed, this.postDanRed, this.postEquipTotalRed);

		this.associated(this.postSkinTotalRed, this.postSkinListRed, this.postSkinListTalentRed);
		this.associated(this.postSkinListRed, UserHuanShou.ins().postHuanShouInfo, UserHuanShou.ins().postSkinTrainInfo, UserBag.ins().postItemAdd, UserBag.ins().postItemDel);
		this.associated(this.postSkinListTalentRed, UserHuanShou.ins().postHuanShouInfo, UserHuanShou.ins().postTalentSkill, UserBag.ins().postItemAdd, UserBag.ins().postItemDel);
		
		this.associated(this.postHuanShouOpen, UserZs.ins().postZsLv, Actor.ins().postLevelChange, UserTask.ins().post9012Event, UserTask.ins().post9013Event);
	}

	public static ins(): HuanShouRedPoint {
		return super.ins() as HuanShouRedPoint;
	}

	public postSkinTotalRed(): boolean {
		let old = this.skinTotalRed;
		this.skinTotalRed = false;
		for (let key in this.skinListRed) {
			if (this.skinListRed.hasOwnProperty(key)) {
				if (this.skinListRed[key]) {
					this.skinTotalRed = true;
					break;
				}
			}
		}
		if (!this.skinTotalRed) {
			for (let key in this.skinListTalentRed) {
				if (this.skinListTalentRed.hasOwnProperty(key)) {
					if (this.skinListTalentRed[key]) {
						this.skinTotalRed = true;
						break;
					}
				}
			}
		}
		this.postHuanShouRed();
		return old != this.skinTotalRed;
	}

	public postSkinListRed(): boolean {
		if (!this.skinListRed) {
			this.initSkinListRed();
		}
		let conflist = GlobalConfig.HuanShouSkinConf;
		let ins = UserHuanShou.ins();
		let tempBool = false;
		for (let key in conflist) {
			if (conflist.hasOwnProperty(key)) {
				let element = conflist[key];
				let skinData = ins.skinList[element.skinId];
				let temp = this.skinListRed[element.skinId];
				if (!skinData) {
					//未激活
					let count = UserBag.ins().getItemCountById(0, element.itemId);
					this.skinListRed[element.skinId] = count >= element.count;
				} else {
					//已激活
					let trainConf = GlobalConfig.HuanShouSkinTrainConf[element.skinId];
					let skinSataeList = GlobalConfig.HuanShouSkinStageConf[element.skinId];
					let maxCount = CommonUtils.getObjectLength(trainConf) - 1;
					if (skinData.trainCount >= maxCount) {
						//满级
						this.skinListRed[element.skinId] = false;
						if (this.skinListRed[element.skinId] != temp)
							tempBool = true;
						continue;
					}
					let skinSataeConf = skinSataeList[skinData.rank];
					if (skinData.exp >= skinSataeConf.exp) {
						//可升阶
						this.skinListRed[element.skinId] = true;
						if (this.skinListRed[element.skinId] != temp)
							tempBool = true;
						continue;
					}

					let count = UserBag.ins().getItemCountById(0, trainConf[skinData.trainCount].itemId);
					this.skinListRed[element.skinId] = count >= trainConf[skinData.trainCount].count;
				}
				if (this.skinListRed[element.skinId] != temp)
					tempBool = true;
			}
		}
		this.postHuanShouRed();
		return tempBool;
	}

	public postSkinListTalentRed(): boolean {
		if (!this.skinListTalentRed) {
			this.initSkinListRed();
		}

		let ins = UserHuanShou.ins();
		let tempBool = false;
		let talenConfs = GlobalConfig.HuanShouTalentConf;
		let skinConfs = GlobalConfig.HuanShouSkinConf;
		for (let key in ins.skinList) {
			if (ins.skinList.hasOwnProperty(key)) {
				let element = ins.skinList[key];
				let old = this.skinListTalentRed[element.id];
				let confs = talenConfs[skinConfs[element.id].talentId];
				if (CommonUtils.getObjectLength(confs) > element.talentLv) {
					let conf = confs[element.talentLv];
					let count = UserBag.ins().getItemCountById(0, conf.itemId);
					this.skinListTalentRed[element.id] = count >= conf.count;
				} else {
					this.skinListTalentRed[element.id] = false;
				}
				if (old != this.skinListTalentRed[element.id])
					tempBool = true;
			}
		}
		this.postHuanShouRed();
		return tempBool;
	}

	private initSkinListRed(): void {
		this.skinListRed = {};
		this.skinListTalentRed = {};
		let conflist = GlobalConfig.HuanShouSkinConf;
		for (let key in conflist) {
			if (conflist.hasOwnProperty(key)) {
				let element = conflist[key];
				this.skinListRed[element.skinId] = false;
				this.skinListTalentRed[element.skinId] = false;
			}
		}
	}

	public postTotalRed(): boolean {
		let old = this.totalRed;
		let conf = GlobalConfig.HuanShouConf;
		if (conf.dayLimit > GameServer.serverOpenDay + 1) {
			this.totalRed = false;
			this.postHuanShouRed();
			return old != this.totalRed
		} else {
			let zsLv: number = Math.floor(conf.levelLimit / 1000);
			let lv: number = conf.levelLimit % 1000;
			if (zsLv > UserZs.ins().lv) {
				this.totalRed = false;
				this.postHuanShouRed();
				return old != this.totalRed
			} else if (lv > Actor.level) {
				this.totalRed = false;
				this.postHuanShouRed();
				return old != this.totalRed
			}
		}

		this.totalRed = this.upgradeRed;
		if (!this.totalRed)
			this.totalRed = this.skillRed;
		if (!this.totalRed) {
			this.totalRed = this.danRed[0] || this.danRed[1];
		}
		if (!this.totalRed) {
			this.totalRed = this.equipTotalRed;
		}
		if (!this.totalRed) {
			this.totalRed = this.skinTotalRed;
		}
		this.postHuanShouRed();
		return old != this.totalRed;
	}

	public postEquipTotalRed(): boolean {
		let old = this.equipTotalRed;
		let len = this.equipListRed.length;
		this.equipTotalRed = false;
		for (let i = 0; i < len; i++) {
			if (this.equipListRed[i]) {
				this.equipTotalRed = true;
				break;
			}
		}
		if (!this.equipTotalRed) {
			len = this.equipPosRed.length;
			for (let i = 0; i < len; i++) {
				if (this.equipPosRed[i]) {
					this.equipTotalRed = true;
					break;
				}
			}
		}
		this.postHuanShouRed();
		return old != this.equipTotalRed;
	}

	public postEquipListRed(): boolean {
		let ins = UserHuanShou.ins();
		let len = this.equipListRed.length;
		let oldAttr = this.equipListRed.concat([]);
		for (let i = 0; i < len; i++) {
			this.equipListRed[i] = ins.getEquipByPos(i + 1) > 0;
		}

		let ir = false;
		for (let i = 0; i < len; i++) {
			if (this.equipListRed[i] != oldAttr[i]) {
				ir = true;
				break;
			}
		}
		this.postHuanShouRed();
		return ir;
	}


	public postEquipPosRed(): boolean {
		let ins = UserHuanShou.ins();
		let len = this.equipPosRed.length;
		let oldAttr = [];
		for (let i = 0; i < len; i++) {
			oldAttr[i] = this.equipPosRed[i];
		}

		for (let i = 0; i < len; i++) {
			let ids = ins.getEquipIdsByPos(i + 1);
			let len1 = ids.length;
			let red = false;
			for (let j = 0; j < len1; j++) {
				red = ins.isComposeEquip(ids[j]);
				if (red)
					break;
			}
			this.equipPosRed[i] = red;
		}

		let ir = false;
		for (let i = 0; i < len; i++) {
			if (this.equipPosRed[i] != oldAttr[i]) {
				ir = true;
				break;
			}
		}
		this.postHuanShouRed();
		return ir;
	}

	public postDanRed(): boolean {
		let old0 = this.danRed[0];
		let old1 = this.danRed[1];
		let ins = UserHuanShou.ins();
		if (ins.rank == 0) {
			this.danRed[0] = false;
			this.danRed[1] = false;
			return old0 != this.danRed[0] || old1 != this.danRed[1];
		}

		let conf = GlobalConfig.HuanShouStageConf[ins.rank];
		let red = false;
		if (conf.qianNengLimit > ins.qianNengCount) {
			let count = UserBag.ins().getItemCountById(0, GlobalConfig.HuanShouConf.qianNengId);
			red = count > 0;
		}
		this.danRed[0] = red;
		red = false;
		if (conf.feiShengLimit > ins.feiShengCount) {
			let count = UserBag.ins().getItemCountById(0, GlobalConfig.HuanShouConf.feiShengId);
			red = count > 0;
		}
		this.danRed[1] = red;
		this.postHuanShouRed();
		return old0 != this.danRed[0] || old1 != this.danRed[1];
	}

	public postUpgradeRed(): boolean {
		let old = this.upgradeRed;
		if (UserHuanShou.ins().rank == 0) {
			this.upgradeRed = true;//激活
			return this.upgradeRed != old;
		}

		let currConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[UserHuanShou.ins().level];
		let nextConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[UserHuanShou.ins().level + 1];

		if (currConf && nextConf) {
			let confCount = currConf.count;
			let bagCount = UserBag.ins().getItemCountById(0, currConf.itemId);
			this.upgradeRed = confCount <= bagCount;
		} else {
			this.upgradeRed = false;
		}
		this.postHuanShouRed();
		return this.upgradeRed != old;
	}

	public postSkillRed(): boolean {
		let old = this.skillRed;
		if (UserHuanShou.ins().posCount == 0) {
			this.skillRed = false;//没有孔位
			return this.skillRed != old;
		}

		let len = UserHuanShou.ins().skills.length;
		let tempRed: boolean = false;
		for (let i = 0; i < len; i++) {
			tempRed = UserHuanShou.ins().isSkillRedByPos(UserHuanShou.ins().skills[i].pos);
			if (tempRed)
				break;
		}
		this.skillRed = tempRed;
		this.postHuanShouRed();
		return this.skillRed != old;
	}

	public postHuanShouOpen(): boolean {
		this.isHuanShouOpen = UserTask.ins().isTaskAwaked(UserTask.AWAKE_TASK_TYPE.HUANSHOU);
		this.postHuanShouRed();
		return this.isHuanShouOpen;
	}

	public postHuanShouRed() {
		this.isRed = ((this.upgradeRed || this.danRed[0] || this.danRed[1] || this.equipTotalRed || this.skillRed || this.skinTotalRed) && this.isHuanShouOpen);
	}
}

namespace GameSystem {
	export let  huanShouRedPoint = HuanShouRedPoint.ins.bind(HuanShouRedPoint);
}