/**
 *
 * @author hujinheng 2017/11/15
 *
 */
class PunchEquipForgeData {
	public static TYPE_NO = 0;//材料不足
	public static TYPE_OK = 1;//可升级
	public static TYPE_MAX = 2;//满级
	private data: PunchEquipData[];
	constructor() {

		this.data = [];
	}

	public parser(bytes: GameByteArray): void {
		let len = bytes.readShort();
		for (let i = 0; i < len; i++) {
			let pos = bytes.readShort();
			let lv = bytes.readInt();
			if (!this.data[pos]) {
				let d: PunchEquipData = new PunchEquipData;
				d.id = pos;
				d.level = lv;
				this.data[pos] = d;
			}
			else {
				this.data[pos].id = pos;
				this.data[pos].level = lv;
			}

		}
	}

	/**获取注灵总等级*/
	public get level(): number {
		let level = 0;
		for (let i = 0; i < this.data.length; i++) {
			let punch: PunchEquipData = this.data[i];
			level += punch.level;
		}
		return level;
	}
	/**求出套装等级 目前按部位顺序升级*/
	public getSuitlevel(): number {
		let lv: number = 0;
		for (let k in GlobalConfig.PunchEquipMasterConfig) {
			let cfg: PunchEquipMasterConfig = GlobalConfig.PunchEquipMasterConfig[k];
			if (Math.floor(this.level / 8) >= cfg.level)
				lv = cfg.level;
		}
		return lv;
	}
	/**求出下一级套装等级*/
	public getNextSuitlevel(): number {
		let lv: number = 0;
		for (let k in GlobalConfig.PunchEquipMasterConfig) {
			let cfg: PunchEquipMasterConfig = GlobalConfig.PunchEquipMasterConfig[k];
			if (cfg.level > Math.floor(this.level / 8)) {
				lv = cfg.level;
				break;
			}
		}
		return lv;
	}

	/**获取部位等级*/
	public getPunchLevel(pos: number): number {
		return this.data[pos].level;
	}
	/**获取当前选中部位所需消耗*/
	public getCurCost(): PunchEquipConfig {
		let startPos: number;
		let minLv: number;
		let isRound: boolean = true;//轮询一圈 所有部位同等级
		for (let i = 0; i < 8; i++) {
			let punch: PunchEquipData = this.data[i];
			if (!i) {
				startPos = i;
				minLv = punch.level;
				continue;
			}
			if (minLv < punch.level) {
				isRound = false;
				startPos = i;
				minLv = punch.level;
			}
		}
		if (isRound) {
			startPos = 0;
			minLv++;
		}

		return GlobalConfig.PunchEquipConfig[startPos][minLv];
	}
	/**获取下一个将要升的部位配置*/
	public getNextConfig(pos: number): PunchEquipConfig {
		let slot: number = pos + 1;
		let lv: number = this.getPunchLevel(pos);
		if (slot > 7) {
			slot = 0;
			lv = this.getPunchLevel(slot) + 1;
		}
		return GlobalConfig.PunchEquipConfig[slot][lv];
	}
	/**获取部位下一级配置*/
	public getPosNextLevelConfig(pos: number): PunchEquipConfig {
		let lv: number = this.getPunchLevel(pos);
		lv++;
		return GlobalConfig.PunchEquipConfig[pos][lv];
	}

	/**是否可以显示必杀注灵*/
	public isShowPunchEquipForge() {
		let list: ItemData[] = UserSkill.ins().equipListData;
		for (let i = 0; i < list.length; i++) {
			let items: ItemData = list[i];
			//所有部位4阶以上显示(含4阶)
			if (!items.itemConfig || !items.itemConfig.zsLevel || items.itemConfig.zsLevel < 4)
				return false;
		}
		return true;
	}

	/**是否有足够材料升级当前部位等级*/
	public isUpgradePunchForge(pos: number): number {
		let lv: number = 1;
		if (this.data[pos]) {
			lv = this.data[pos].level;
		}
		//满级
		if (!GlobalConfig.PunchEquipConfig[pos][lv + 1])
			return PunchEquipForgeData.TYPE_MAX;

		if (!lv) lv = 1;

		let cfg: PunchEquipConfig = GlobalConfig.PunchEquipConfig[pos][lv];
		// let itemData: ItemData = UserBag.ins().getBagItemById(cfg.cost.id);
		let count: number = 0;
		if (cfg.cost.id == MoneyConst.punch1) {
			count = Actor.togeatter1;
		} else if (cfg.cost.id == MoneyConst.punch2) {
			count = Actor.togeatter2;
		}
		if (count >= cfg.cost.count) {
			return PunchEquipForgeData.TYPE_OK;
		}
		return PunchEquipForgeData.TYPE_NO;
	}
	/**计算当前选中部位*/
	public calcSelectPos(): number {
		let startPos: number;
		let minLv: number;
		let isRound: boolean = true;//轮询一圈 所有部位同等级
		for (let i = 0; i < 8; i++) {
			if (!this.data[i]) continue;
			let punch: PunchEquipData = this.data[i];
			if (!i) {
				startPos = i;
				minLv = punch.level;
				continue;
			}
			if (minLv > punch.level) {
				isRound = false;
				startPos = i;
				minLv = punch.level;
			}
		}
		if (isRound) {
			startPos = 0;
			minLv++;
		}
		return startPos;
	}


	/**注灵红点*/
	public getRedPoint(): boolean {
		if (!this.isShowPunchEquipForge())
			return false;
		let fullCount: number = 0;
		let max:number = 8;
		for (let i = 0; i < max; i++) {
			let b = this.isUpgradePunchForge(i);
			if (b == PunchEquipForgeData.TYPE_NO) return false;
			else if (b == PunchEquipForgeData.TYPE_MAX) {
				fullCount++;
			}
		}
		//全部满级,则不提示红点
		if (fullCount == max) return false;
		return true;
	}
	/**获取当前注灵总属性*/
	public getAttributeData() {
		let attrs: AttributeData[] = [];//各属性总值
		for (let i = 0; i < this.data.length; i++) {
			let pos = this.data[i].id;
			let lv = this.data[i].level;
			let config: PunchEquipConfig = GlobalConfig.PunchEquipConfig[pos][lv];
			if (config) {
				for (let j = 0; j < config.attr.length; j++) {
					if (!attrs.length) {
						let at: AttributeData = new AttributeData;
						at.type = config.attr[j].type;
						at.value = config.attr[j].value;
						attrs.push(at);
					} else {
						let ishave = false;//是否有这条属性
						for (let k = 0; k < attrs.length; k++) {
							if (attrs[k].type == config.attr[j].type) {
								ishave = true;
								attrs[k].value += config.attr[j].value;
							}
						}
						if (!ishave) {
							let at: AttributeData = new AttributeData;
							at.type = config.attr[j].type;
							at.value = config.attr[j].value;
							attrs.push(at);
						}
					}
				}
			}
		}
		return attrs;
	}


}
/**注灵部位数据*/
class PunchEquipData {
	id: number;
	level: number;
}
