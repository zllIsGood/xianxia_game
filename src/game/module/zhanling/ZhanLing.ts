/**
 * 天仙系统
 */
class ZhanLing extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.WarSpirit;

		this.regNetMsg(1, this.postZhanLingInfo);
		this.regNetMsg(2, this.postZhanLingUpExp);
		this.regNetMsg(3, this.postZhanLingDrug);
		this.regNetMsg(4, this.postZhanLingWear);
		this.regNetMsg(6, this.postZhanLingComposeItem);
		this.regNetMsg(7, this.postZhanLingBubble);
		this.regNetMsg(8, this.doZhanLingSkill);
		this.regNetMsg(11, this.postZhanLingSkinUpGrade);
		this.regNetMsg(12, this.postZhangLingSkinChange);

		this.observe(UserZs.ins().postZsLv, this.initZhanLing);
		this.observe(UserBag.ins().postItemAdd, ZhanLingModel.ins().updateShowZLlist);//道具添加
		this.observe(UserBag.ins().postItemDel, ZhanLingModel.ins().updateShowZLlist);//道具删除
		this.observe(UserBag.ins().postItemCountChange, ZhanLingModel.ins().updateShowZLlist);//道具变更
	}

	public static ins(): ZhanLing {
		return super.ins() as ZhanLing;
	}

	/**
	 * 游戏登录初始化
	 */
	protected initLogin(): void {
		ZhanLingModel.ins().updateShowZLlist();//刷新显示列表
	}

	/**
	 * 0点游戏数据请求
	 * 用于查看跨天后的天仙开启状况
	 */
	protected initZero(): void {
		if (!ZhanLingModel.ins().getZhanLingDataById(0) && ZhanLingModel.ins().ZhanLingOpen()) {
			ZhanLingModel.ins().setZhanLingData(new ZhanLingData());
		}
	}

	/**
	 * 达到转生数后初始化天仙
	 */
	private initZhanLing() {
		if (!ZhanLingModel.ins().getZhanLingDataById(0) && ZhanLingModel.ins().ZhanLingOpen()) {
			ZhanLingModel.ins().setZhanLingData(new ZhanLingData());
		}
	}

	/** 天仙分页红点 **/
	public checkRedPoint(): boolean {
		//检测当前是否开启
		if (!ZhanLingModel.ins().ZhanLingOpen())
			return false;
		if (!UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.ZHANLING))
			return false;
		// if(!OpenSystem.ins().checkSysOpen(SystemType.XXXX)){
		// 	return false;
		// }

		//天仙本体(id=0)
		let id = 0;
		let b = ZhanLingModel.ins().isUpGradeByStar(id) || ZhanLingModel.ins().isHintNum(id);
		if (b) return true;
		b = ZhanLingModel.ins().isUpGradeByTalent(id);
		if (b) return true;
		//丹药
		let zllconfig = GlobalConfig.ZhanLingConfig;
		for (let k in zllconfig.upgradeInfo) {
			b = ZhanLingModel.ins().getZhanLingDataByDrugUse(id, Number(k));
			if (b) return true;
		}
		//天仙皮肤(皮肤没有丹药)
		for (let i = 0; i < ZhanLingModel.ins().showZLlist.length; i++) {
			let zlBase: ZhanLingBase = ZhanLingModel.ins().showZLlist[i];
			id = zlBase.id;
			if (id) {
				b = ZhanLingModel.ins().isUpGradeByStar(id) || ZhanLingModel.ins().isHintNum(id);
				if (b) return true;
				b = ZhanLingModel.ins().isUpGradeByTalent(id);
				if (b) return true;
			}
		}
		//天仙装备红点
		id = 0;
		b = ZhanLingModel.ins().getZhanLingItemRedPoint(id);
		return b;
	}

	/**
	 * 天仙装备tips
	 * @param id 道具id
	 * @param zlId 天仙id 穿戴身上需要显示套装相关属性
	 * @param body
	 * */
	public ZhanLingItemTips(id: number, zlId: number = 0, body: boolean = false) {
		let itemid: number = id;
		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[itemid];
		let have = body ? 1 : 0;
		let power = ZhanLingModel.ins().getZhanLingItemPower(itemid, have);
		let score: number = power;//目前评分和战力是一样
		let condition = itemConfig.level ? `${itemConfig.level}级` : "无级别";
		let config: ZhanLingEquip = GlobalConfig.ZhanLingEquip[itemid];
		let desc: { left: string, right: string } = {
			left: `部位:\n等级:`,
			right: `${GlobalConfig.ZhanLingConfig.zlEquipName[config.pos - 1]}\n${condition}`
		};
		let attrs: EquipAttrsTips[] = [];
		attrs.push({title: "基础属性:", attr: config.attrs});

		//套装名取决于装备的等级取对应套装名
		let suitLv = GlobalConfig.ZhanLingEquip[itemid].level;//ZhanLingModel.ins().getZhanLingDataBySuit(zlId);
		suitLv = suitLv ? suitLv : 1;
		let suitConfig: ZhanLingSuit = GlobalConfig.ZhanLingSuit[suitLv];
		let color = 0x00ff00;
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(zlId);
		let colorName: number = 0xff00ff;
		let colorValue: number = 0xff00ff;
		let curSum = 0;
		let itemNames = "";
		for (let i = 0; i < GlobalConfig.ZhanLingConfig.equipPosCount; i++) {
			let icolor = 0x00ff00;
			let equip = zlData ? GlobalConfig.ZhanLingEquip[zlData.items[i]] : null;
			if (!zlData || !zlData.items[i] || !equip || equip.level < suitLv) {
				icolor = color = 0xff0000;
				colorName = colorValue = 0x666666;
			} else {
				curSum++;
			}
			//身上以外的渠道观察这个tips 修正颜色
			if (!body) {
				if ((i + 1) == GlobalConfig.ZhanLingEquip[itemid].pos)
					icolor = 0x00ff00;
			}
			let iname = `|C:${icolor}&T:${GlobalConfig.ZhanLingConfig.zlEquipName[i]}`;
			if (i + 1 < GlobalConfig.ZhanLingConfig.equipPosCount)
				iname += `|C:${icolor}&T:、`;
			itemNames += iname;
		}
		//身上以外显示拥有数
		if (!body) {
			curSum = 1;
		}
		let exdesc = "天仙基础属性增加+" + suitConfig.precent / 100 + "%";
		let titile2 = `|C:${color}&T:(${curSum}/${GlobalConfig.ZhanLingConfig.equipPosCount})`;
		let suitdesc = itemNames;
		attrs.push({
			title: `|C:0xff00ff&T:${suitConfig.suitWithName}|${titile2}`,
			attr: suitConfig.attrs,
			colorName: colorName,
			colorValue: colorValue,
			others: {suitdesc: suitdesc, exdesc: exdesc}
		});

		ViewManager.ins().open(EquipTipsBase, UserBag.BAG_TYPE_OTHTER, itemid, score, power, desc, attrs);
	}


	//客户端请求服务器处理
	//============================================================================================
	/**
	 * 请求提升经验
	 * @param id 皮肤编号(天仙id)
	 * @param buy 是否有勾选自动购买元宝 0:没有 1:有
	 * 43-2
	 * */
	public sendZhanLingUpExp(id: number, buy: number = 0) {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeByte(id);
		bytes.writeByte(buy);
		this.sendToServer(bytes);
	}

	/**
	 * 请求使用提升丹
	 * @param id 皮肤编号(天仙id)
	 * @param itemid 提神丹物品id
	 * 43-3
	 * */
	public sendZhanLingDrug(id: number, itemid: number) {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeByte(id);
		bytes.writeInt(itemid);
		this.sendToServer(bytes);
	}

	/**
	 * 请求戴上装备
	 * @param id 皮肤编号(天仙id)
	 * @param itemid 装备id
	 * 43-4
	 * */
	public sendZhanLingWear(id: number, itemid: number) {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeByte(id);
		bytes.writeInt(itemid);
		this.sendToServer(bytes);
	}

	/**
	 * 合成装备
	 * @param itemid 装备id
	 * 43-5
	 * */
	public sendZhanLingComposeItem(itemid: number) {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(itemid);
		this.sendToServer(bytes);
	}

	/**
	 * 请求激活皮肤/升级皮肤天赋
	 * @param id 皮肤编号(天仙id)
	 * 43-11
	 * */
	public sendZhanLingSkinUpGrade(id: number) {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeByte(id);
		this.sendToServer(bytes);
	}

	/**
	 * 请求切换天仙皮肤
	 * @param id 皮肤编号(天仙id)
	 * 43-12
	 * */
	public sendZhangLingSkinChange(id: number) {
		let bytes: GameByteArray = this.getBytes(12);
		bytes.writeByte(id);
		this.sendToServer(bytes);
	}

	//服务器数据下发处理
	//============================================================================================
	/**
	 * 发送天仙信息
	 * 43-1
	 * */
	public postZhanLingInfo(bytes: GameByteArray): void {
		let len = bytes.readByte();
		for (let i = 0; i < len; i++) {
			let zlData: ZhanLingData = new ZhanLingData();
			zlData.id = bytes.readInt();
			zlData.talentLv = bytes.readByte();
			zlData.level = bytes.readShort();
			zlData.exp = bytes.readInt();
			zlData.drugs = [];
			let drugsLen = bytes.readByte();
			for (let j = 0; j < drugsLen; j++) {
				let itemid = bytes.readInt();
				let count = bytes.readShort();
				zlData.drugs.push({itemId: itemid, count: count});
			}
			let itemLen = bytes.readByte();
			if (itemLen) {
				zlData.items = [];
				for (let k = 0; k < itemLen; k++) {
					zlData.items.push(bytes.readInt());
				}
			}
			ZhanLingModel.ins().setZhanLingData(zlData);
		}
		//幻化的皮肤编号
		let skinId = bytes.readByte();
		ZhanLingModel.ins().ZhanLingSkinId = skinId;

	}

	/**
	 * 回应提升经验
	 * 43-2
	 * */
	public postZhanLingUpExp(bytes: GameByteArray) {
		let id = bytes.readByte();
		let level = bytes.readShort();
		let exp = bytes.readInt();
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(id);
		if (!zlData) return;//此天仙id未激活
		let oldlevel = zlData.level;
		zlData.level = level;
		zlData.exp = exp;
		if (level > oldlevel)
			this.postZhanLingUpgrade();
	}

	/**天仙升级消息派发*/
	public postZhanLingUpgrade(): void {

	}

	/**
	 * 回应使用提升丹
	 * 43-3
	 * */
	public postZhanLingDrug(bytes: GameByteArray) {
		let id = bytes.readByte();
		let itemid = bytes.readInt();
		let count = bytes.readShort();
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(id);
		if (!zlData) return;//此天仙id未激活
		let ishave = false;
		for (let i = 0; i < zlData.drugs.length; i++) {
			if (zlData.drugs[i].itemId == itemid) {
				zlData.drugs[i].count = count;
				ishave = true;
				break;
			}
		}
		if (!ishave) {
			zlData.drugs.push({itemId: itemid, count: count});
		}
	}

	/**
	 * 回应戴上装备
	 * 43-4
	 * */
	public postZhanLingWear(bytes: GameByteArray) {
		let id = bytes.readByte();
		let itemid = bytes.readInt();
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(id);
		if (!zlData) return;//此天仙id未激活
		let config: ZhanLingEquip = GlobalConfig.ZhanLingEquip[itemid];
		if (!config) return;
		zlData.items[config.pos - 1] = itemid;
	}

	/**
	 * 合成装备刷新身上装备数据
	 * @param bytes
	 * 43-6
	 * */
	public postZhanLingComposeItem(bytes: GameByteArray) {
		let id = bytes.readByte();
		let itemNum = bytes.readByte();
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(id);
		if (!zlData) return;//此天仙id未激活
		for (let i = 0; i < itemNum; i++) {
			zlData.items[i] = bytes.readInt();
		}
	}

	/**
	 * 发送天仙显示信息(头顶冒出天仙)
	 * 43-7
	 * */
	public postZhanLingBubble(bytes: GameByteArray) {
		let handle = bytes.readDouble();
		let lv = bytes.readInt();
		let id = bytes.readByte();
		// let isTrigger = bytes.readByte();

		let entity: CharRole = EntityManager.ins().getEntityByHandle(handle) as CharRole;
		if (entity) {
			entity.showZhanling(id, lv);
		}
	}

	/**
	 * 天仙技能
	 * 43-8
	 */
	private doZhanLingSkill(bytes: GameByteArray): void {
		//服务器服务知道当前使用什么技能，只知道技能buff，所以只能通过buff来反推天仙的天赋技能
		let buffId = bytes.readInt();

		for (let id in GlobalConfig.ZhanLingTalent) {
			let dpList = GlobalConfig.ZhanLingTalent[id];
			for (let lv in dpList) {
				let dp = dpList[lv];
				if (dp && dp.effId == buffId) {
					UserSkill.ins().postShowSkillWord(dp.showWords);
					return;
				}
			}
		}

	}

	/**
	 * 回应激活皮肤/升级皮肤天赋
	 * 43-11
	 * */
	public postZhanLingSkinUpGrade(bytes: GameByteArray) {
		let id = bytes.readByte();
		let talentLv = bytes.readShort();
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(id);
		let oldtalentLv = 0;
		if (!zlData) {//此天仙id未激活
			zlData = new ZhanLingData();
			zlData.id = id;
			ZhanLingModel.ins().setZhanLingData(zlData);
		} else {
			oldtalentLv = zlData.talentLv;
		}
		if (talentLv != oldtalentLv)
			this.postZhanLingTalentLvUpGrade();
		zlData.talentLv = talentLv;
	}

	//天仙天赋升级
	public postZhanLingTalentLvUpGrade() {

	}

	/**
	 * 回应切换天仙皮肤
	 * 43-12
	 * */
	public postZhangLingSkinChange(bytes: GameByteArray) {
		let id = bytes.readByte();
		ZhanLingModel.ins().ZhanLingSkinId = id;
	}


}

namespace GameSystem {
	export let  zhanling = ZhanLing.ins.bind(ZhanLing);
}