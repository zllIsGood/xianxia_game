class Artifact extends BaseSystem {

	/** 神器数据 */
	// public artifacts: ArtifactData[] = [];
	/** 新神器数据 */
	public listArtifacts: any;
	/** 新神器激活列表 */
	private artifactsOpenDic: any;
	/** 新神器maxIndex */
	private maxIndex;
	/**显示引导特效起始时间 */
	public showGuide: number = -2000;

	//数值为2时候表示第一次开启必杀
	// public openHeji: number = 0;

	public static ins(): Artifact {
		return super.ins() as Artifact;
	}

	public constructor() {
		super();
		this.listArtifacts = {};
		this.sysId = PackageID.Artifact;

		// this.regNetMsg(1, this.postArtifactInit);
		// this.regNetMsg(2, this.postArtifactUpdate);
		this.regNetMsg(3, this.postNewArtifactInit);
		this.regNetMsg(4, this.postNewArtifactUpdate);
	}

	// /**通过id获取神器数据 */
	// public getDataById(id: number): ArtifactData {
	// 	return this.artifacts[id];
	// }

	public getNewArtifactPower(index: number): number {
		let conf = GlobalConfig.ImbaConf[index];
		let data = this.listArtifacts[conf.id] as NewArtifactData;
		if (!data)
			return 0;
		let isSuit: boolean = true;
		let power = 0;
		for (let i = 0; i < conf.jigsawId.length; i++) {
			let state = (data.record >> i) & 1;
			if (state)
				power += GlobalConfig.ImbaJigsawConf[conf.jigsawId[i]].power;
			else
				isSuit = false;
		}
		if (data.open)
			power += conf.power;
		return power;
	}


	public getAttr(): AttributeData[] {
		let list = {};
		for (let index in GlobalConfig.ImbaConf) {
			let conf = GlobalConfig.ImbaConf[index];
			let data = this.getNewArtifactBy(conf.index);
			for (let i = 0; i < conf.jigsawId.length; i++) {
				let state = (data.record >> i) & 1;
				if (state) {
					let chipConf = GlobalConfig.ImbaJigsawConf[conf.jigsawId[i]];
					for (let j = 0; j < chipConf.attrs.length; j++) {
						let attr = chipConf.attrs[j];
						AttributeData.addAttrToList(list, attr);
					}
				}
			}
			if (data.open) {
				if (conf.attrs) {
					for (let i = 0; i < conf.attrs.length; i++) {
						AttributeData.addAttrToList(list, conf.attrs[i]);
					}
				}
			}

		}

		let result = [];
		for (let k in list) {
			result.push(list[k]);
		}
		result.sort(AttributeData.sortAttribute);
		return result;
	}

	public getAllArtifactPower(): number {
		let power = 0;
		for (let k in GlobalConfig.ImbaConf) {
			power += this.getNewArtifactPower(parseInt(k));
		}
		return power;
	}

	public getArtifactIndexById(id: number): number {
		for (let k in GlobalConfig.ImbaConf) {
			if (GlobalConfig.ImbaConf[k].id == id) {
				return GlobalConfig.ImbaConf[k].index;
			}
		}
		return 0;
	}

	public getNewArtifactBy(index: number): NewArtifactData {
		let id: number = 0
		if (GlobalConfig.ImbaConf[index]) {
			id = GlobalConfig.ImbaConf[index].id;
		} else {
			return null
		}

		if (!this.listArtifacts[id]) {
			let data = new NewArtifactData();
			data.id = id;
			data.record = 0;
			this.listArtifacts[id] = data;
		}
		return this.listArtifacts[id];
	}

	public getMaxIndex() {
		if (!this.maxIndex) {
			let id = 1;
			let conf = GlobalConfig.ImbaConf;
			for (let i in conf) {
				id = Math.max(conf[i].index, id);
			}
			this.maxIndex = id;
		}
		return this.maxIndex;
	}

	public getConfById(id: number): ImbaConf {
		let conf = GlobalConfig.ImbaConf;
		for (let k in conf) {
			if (conf[k].id == id) {
				return conf[k];
			}
		}
	}

	public showRedPoint(): boolean {
		let max = this.getMaxIndex();
		for (let i = 1; i <= max; i++) {
			let conf = GlobalConfig.ImbaConf[i];
			let data = this.getNewArtifactBy(i);
			if (!data.open) {
				let len = conf.jigsawId.length;
				let complete = Math.pow(2, len) - 1;
				if (complete == data.record)
					return true;
				if (data.exitRecord != data.record)
					return true;
			}
		}
		return false;
	}

	public getNextChapterId() {
		let max = this.getMaxIndex();
		for (let i = 1; i <= max; i++) {
			let data = this.getNewArtifactBy(i);
			let id = data.getNextChipId();
			if (id) {

			}
		}
	}


	public getConfByChipId(id: number): ImbaConf {
		let conf = GlobalConfig.ImbaConf;
		for (let k in conf) {
			if (conf[k].jigsawId.indexOf(id) != -1) {
				return conf[k];
			}
		}
		return null;
	}

	public setGuide() {
		this.showGuide = egret.getTimer();
		this.postGuide();
		TimerManager.ins().remove(this.guideEnd, this);
		TimerManager.ins().doTimer(3000, 1, this.guideEnd, this)
	}

	public guideEnd() {
		Artifact.ins().showGuide = -3000;
		Artifact.ins().postGuide();
	}

	public postGuide() {

	}





	/**
	 * 初始化活动信息
	 * 26-1
	 * @param bytes
	 */
	// public postArtifactInit(bytes: GameByteArray): void {
	// 	let count: number = bytes.readInt();
	// 	for (let i = 0; i < count; i++) {
	// 		let artifact = new ArtifactData();
	// 		artifact.parser(bytes);
	// 		this.artifacts[artifact.id] = artifact;
	// 	}
	// }

	/**
	 * 升阶结果
	 * 26-2
	 * @param bytes
	 */
	// public postArtifactUpdate(bytes: GameByteArray): boolean {
	// 	let isSuccee = bytes.readBoolean();
	// 	if (isSuccee) {
	// 		let artifactId = bytes.readInt();
	// 		let rank = bytes.readShort();
	// 		this.artifacts[artifactId].rank = rank;
	// 	} else {
	// 		// debug.log("升阶失败");
	// 		UserTips.ins().showTips("不满足条件");
	// 	}
	// 	return isSuccee;
	// }

	/**
	 * 请求升阶神器
	 * 26-2
	 * @param artifactId  神器ID
	 */
	public sendRank(artifactId: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(artifactId);
		this.sendToServer(bytes);
	}

	/**
	 * 26-3
	 * 初始化新神器信息
	 */
	public postNewArtifactInit(bytes: GameByteArray) {
		let len = bytes.readUnsignedShort();
		this.artifactsOpenDic = {};
		for (let i = 0; i < len; i++) {
			let data = new NewArtifactData();
			data.id = bytes.readInt();
			data.record = bytes.readInt();
			data.open = bytes.readByte() != 0;
			if (!data.open) {
				data.exitRecord = bytes.readInt();
			} else {
				data.exitRecord = Math.pow(2, 32) - 1;
				// if (len == 1 && this.openHeji == 1) {
				// 	this.openHeji = 2;//激活神器开启必杀
				// }
			}
			this.listArtifacts[data.id] = data;
			if (data.open) this.artifactsOpenDic[data.id] = data;
		}
		this.setImbaBuffDic();
	}

	private imbaBuffDic: any;
	private attArr: string[] = [`a`, `args`, `b`, `cd`, `crit`, `d`, `selfEff`];

	private setImbaBuffDic(): void {
		if (!this.imbaBuffDic) {
			this.imbaBuffDic = {};
			let config = GlobalConfig.ImbaSkillReviseConfig;
			for (let k in config) {
				if (!this.imbaBuffDic[config[k].skill]) this.imbaBuffDic[config[k].skill] = {};
				if (!this.imbaBuffDic[config[k].skill][config[k].imba_id]) this.imbaBuffDic[config[k].skill][config[k].imba_id] = {};
				this.imbaBuffDic[config[k].skill][config[k].imba_id] = config[k];
			}
		}

		let len: number = CommonUtils.getObjectLength(this.artifactsOpenDic);
		if (len) {
			this.imbaSkillDic = {};
			for (let j in this.imbaBuffDic) {
				for (let l in this.imbaBuffDic[j]) {
					if (this.artifactsOpenDic[l]) {
						if (!this.imbaSkillDic[j]) {
							this.imbaSkillDic[j] = new ImbaSkillReviseConfig();
						}
						for (let m in this.imbaSkillDic[j]) {
							// if (m == "id" || m == "selfEff" || m == "args") continue;
							if (this.attArr.indexOf(m) == -1) continue;
							if (this.imbaBuffDic[j][l][m]) {
								if (m == "selfEff") {
									if (!this.imbaSkillDic[j][m]) {
										this.imbaSkillDic[j][m] = [];
									}
									this.imbaSkillDic[j][m].push(this.imbaBuffDic[j][l][m][0]);
								}
								else if (m == "args") {
									this.imbaSkillDic[j][m] = this.imbaBuffDic[j][l][m];
								}
								else {
									this.imbaSkillDic[j][m] += this.imbaBuffDic[j][l][m];
								}
							}
						}
					}
				}
			}
		}
	}

	//获取已开启神器列表
	public getArtifactsOpenDic(): object {
		return this.artifactsOpenDic;
	}

	private imbaSkillDic: any;

	public getReviseBySkill(sId: number): ImbaSkillReviseConfig {
		if (!this.imbaSkillDic) return null
		let skillId: number = Math.floor(sId / 1000);
		if (this.imbaSkillDic[skillId]) {
			return this.imbaSkillDic[skillId];
		}
		return null;
	}

	/**
	 * 26-4
	 * 更新神器信息
	 */
	public postNewArtifactUpdate(bytes: GameByteArray) {
		let id = bytes.readInt();
		let tar = this.listArtifacts[id] as NewArtifactData;
		if (tar) {
			let oldRecord = tar.exitRecord;
			tar.exitRecord = bytes.readInt();
			tar.record = bytes.readInt();
			let addRecord = tar.exitRecord - oldRecord;
			let conf = this.getConfById(id);
			for (let i = 0; i < conf.jigsawId.length; i++) {
				let state = (addRecord >> i) & 1;
				if (state) {
					let itemData = new ItemData();
					itemData.configID = conf.jigsawId[i];
					UserTips.ins().showGoodEquipTips(itemData);
				}
			}
		} else {
			let data = new NewArtifactData();
			data.id = id;
			data.exitRecord = bytes.readInt();
			data.record = bytes.readInt();
			this.listArtifacts[id] = data;
		}
	}

	/**
	 * 神器碎片激活
	 * 26-4
	 */
	public sendOpenChip(id: number) {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 26-3
	 * 请求激活神器
	 */
	public openArtifact(id: number) {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(id);
		this.sendToServer(bytes);
		// if (this.openHeji == 0) {
		// 	this.openHeji = 1;
		// }
	}
}

namespace GameSystem {
	export let  artifact = Artifact.ins.bind(Artifact);
}