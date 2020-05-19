/**
 * 飞剑
 */
class FlySword extends BaseSystem {
	/** 数据模块组 */
	public models: FlySwordModel[] = [];

	public constructor() {
		super();

		this.sysId = PackageID.FlySword;

		this.regNetMsg(1, this.postData);
		this.regNetMsg(2, this.postUpgradeLevel);
		this.regNetMsg(3, this.postActivation);
		this.regNetMsg(4, this.postChangeAppearance);
		this.regNetMsg(5, this.postUserDan);
		this.regNetMsg(6, this.postOpenFlySword);

		this.observe(GameLogic.ins().postChildRole, this.updateAllPower);
	}

	/**
	 * 获取单例
	 * @returns FlySword
	 */
	public static ins(): FlySword {
		return super.ins() as FlySword;
	}

	/**
	 * 更新数据组所有战力
	 * @returns void
	 */
	private updateAllPower(): void {
		for (let data of this.models) {
			data.updatePower();
		}
	}

	/**
	 * 处理拥有飞剑数据
	 * 67-1
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	public postData(bytes: GameByteArray): void {
		this.models = [];
		let count: number = bytes.readShort();

		for (let i: number = 0; i < count; i++) {
			let data = new FlySwordModel();
			this.models.push(data);
			data.appearanceModel.initDataList(FlySwordAppearanceData, i);
			data.parserData(bytes);

			let role = SubRoles.ins().roles[data.roleId];
			if (role)
				role.updateFlySword();

			data.appearanceModel.refresh();
		}
	}

	/**
	 * 请求进阶
	 * 67-2
	 * @returns void
	 */
	public sendUpgradeLevel(roleId: number, autoBuy: boolean): boolean {
		let data = this.getLevelData(roleId)
		if (!data)
			return false;

		if (data.getIsMaxLevelExp()) {
			UserTips.ins().showTips(`已满阶`);
			return false;
		}

		let isItem = data.getIsUpgrade()

		if (!isItem && !autoBuy) {
			UserTips.ins().showTips(`${data.getCurrCostItemData().itemConfig.name}不足，可自动消耗元宝升级`);
			return false;
		}

		if (!isItem && autoBuy) {
			if (Actor.yb < data.getBuyItemPrice()) {
				UserTips.ins().showTips(`元宝不足`);
				return false;
			}
		}

		let bytes = this.getBytes(2);
		bytes.writeShort(roleId);
		bytes.writeByte(Number(autoBuy));
		this.sendToServer(bytes);
		return true;
	}

	/**
	 * 派发进阶结果
	 * 67-2
	 * @param  {GameByteArray} bytes
	 * @returns number
	 */
	public postUpgradeLevel(bytes: GameByteArray): number {
		let roleId: number = bytes.readShort();
		let data = this.getModel(roleId);
		if (!data)
			return;

		let isUpgrade = data.parserUpgradeLevel(bytes);

		if (isUpgrade) {
			UserTips.ins().showTips(`进阶成功`);
			this.sendChangeCurrLevelAppearance(roleId);

			let config = data.levelModel.getCurrAppearanceConfig();
			console.log('postUpgradeLevel');
			console.log(config.name);
			console.log(`${config.resourceId}_png`);
			Activationtongyong.show(1, config.name, `${config.resourceId}_png`, ActivationtongyongShareType.FlySword);

			this.sendChangeCurrLevelAppearance(roleId);
		}
		return Number(isUpgrade);
	}

	/**
	 * 幻化当前阶级形象
	 * @returns void
	 */
	private sendChangeCurrLevelAppearance(roleId: number): void {
		let data = this.getLevelModel(roleId);
		if (data)
			this.sendChangeAppearance(roleId, data.getCurrAppearanceConfig().appearanceId);
	}

	/**
	 * 请求激活飞剑外观
	 * 67-3
	 * @param  {number} id
	 * @returns void
	 */
	public sendActivation(roleId: number, id: number): void {
		let data: CultivateAppearanceDataBase = this.getAppearanceModel(roleId).getDataById(id);
		if (!data)
			return;

		if (data.getIsActivation()) {
			UserTips.ins().showTips(`已激活，不能重复激活`);
		}
		else if (data.getCanActivation()) {
			let bytes: GameByteArray = this.getBytes(3);
			bytes.writeShort(roleId);
			bytes.writeInt(id);
			this.sendToServer(bytes);
		}
		else {
			if (data.getIsLevel()) {
				UserTips.ins().showTips(`品阶未达到，无法激活`);
			}
			else {
				UserTips.ins().showTips(`道具不足`);
			}
		}
	}

	/**
	 * 派发飞剑外观激活
	 * 67-3
	 * @param  {GameByteArray} bytes
	 * @returns number
	 */
	public postActivation(bytes: GameByteArray): number {
		let roleId: number = bytes.readShort();
		let data = this.getModel(roleId);
		let param: number[] = data ? data.parserActivation(bytes) : [0, 0];
		if (param[0] != 0) {
			let config = GlobalConfig.FlySwordTypeConfig[param[0]];
			console.log('postActivation');
			console.log(config.name);
			console.log(`${config.resourceId}_png`);
			Activationtongyong.show(0, config.name, `${config.resourceId}_png`, ActivationtongyongShareType.FlySword);
		}
		return param[1];
	}

	/**
	 * 请求幻化改变外观
	 * 67-4
	 * @param  {number} id
	 * @returns void
	 */
	public sendChangeAppearance(roleId: number, id: number, type: FlySwordAppearanceType = FlySwordAppearanceType.Equip): void {
		let data: CultivateAppearanceDataBase = this.getAppearanceModel(roleId).getDataById(id);
		if (!data)
			return;

		let typeStr: string = type == FlySwordAppearanceType.Equip ? `幻化` : `卸下`;

		if (!data.getIsActivation()) {
			UserTips.ins().showTips(`未激活，无法${typeStr}`);
			return;
		}

		if (data.getIsAppearance() && type == FlySwordAppearanceType.Equip) {
			UserTips.ins().showTips(`重复${typeStr}`);
			return;
		}

		if (!data.getIsAppearance() && type == FlySwordAppearanceType.Unload) {
			UserTips.ins().showTips(`重复${typeStr}`);
			return;
		}

		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(roleId);
		bytes.writeInt(type == FlySwordAppearanceType.Equip ? id : 0);
		this.sendToServer(bytes);
	}

	/**
	 * 派发幻化结果
	 * 67-4
	 * @param  {GameByteArray} bytes
	 * @returns number
	 */
	public postChangeAppearance(bytes: GameByteArray): number {
		let roleId: number = bytes.readShort();
		let id: number = bytes.readInt();
		let result: boolean = bytes.readByte() == 1;

		let data = this.getAppearanceModel(roleId);
		if (result) {
			UserTips.ins().showTips(id != 0 ? `幻化成功` : `卸下成功`);
			let roleData = SubRoles.ins().roles[roleId];
			data.appearanceID = roleData.flySwordId = roleData.flySwordData.id = id;
			let role = EntityManager.ins().getMainRole(roleData.index);
			if (role) {
				role.updateModel();
			}
		}

		return data.getCurrAppearanceIndex();
	}

	/**
	 * 使用丹药
	 * 67-5
	 * @param  {number} roleId
	 * @param  {CultivateDanType} type
	 * @returns void
	 */
	public sendUserDan(roleId: number, type: CultivateDanType): void {
		switch (type) {
			case CultivateDanType.Growth:
				this.sendUseGrowthDan(roleId);
				break;
			case CultivateDanType.Qualification:
				this.sendUseQualificationDan(roleId);
				break;
		}
	}

	/**
	 * 派发丹药使用结果
	 * 67-5
	 * @param  {GameByteArray} bytes
	 * @returns number
	 */
	public postUserDan(bytes: GameByteArray): number {
		let roleId: number = bytes.readShort();
		let type: number = bytes.readInt();
		let data = this.models[roleId];
		let b: boolean = false;

		switch (type) {
			case CultivateDanType.Growth:
				b = data.parserGrowthDan(bytes);
				break;
			case CultivateDanType.Qualification:
				b = data.parserQualificationDan(bytes);
				break;
		}

		if (b) {
			UserTips.ins().showTips(`使用成功`);
		}

		return Number(b);
	}

	/**
	 * 请求使用资质丹
	 * 67-5
	 * @returns void
	 */
	public sendUseQualificationDan(roleId: number): void {
		let levelData: CultivateLevelData = this.getLevelData(roleId);
		let trainData: CultivateDanData = this.getQualificationData(roleId);

		if (trainData.isCanUpgrade()) {
			let bytes: GameByteArray = this.getBytes(5);
			bytes.writeShort(roleId);
			bytes.writeInt(CultivateDanType.Qualification);
			this.sendToServer(bytes);
		}
		else {
			if (trainData.isTopMaxNotLevelMax() && !levelData.getIsLevelCap()) {
				UserTips.ins().showTips(`已达到当前阶数最大等级`);
			}
			ViewManager.ins().open(CultivateTrainTipsWin, trainData);
		}
	}

	/**
	 * 请求使用成长丹
	 * 67-5
	 * @returns void
	 */
	public sendUseGrowthDan(roleId: number): void {
		let levelData: CultivateLevelData = this.getLevelData(roleId);
		let trainData: CultivateDanData = this.getGrowthData(roleId);

		if (trainData.isCanUpgrade()) {
			let bytes: GameByteArray = this.getBytes(5);
			bytes.writeShort(roleId);
			bytes.writeInt(CultivateDanType.Growth);
			this.sendToServer(bytes);
		}
		else {
			if (trainData.isTopMaxNotLevelMax() && !levelData.getIsLevelCap()) {
				UserTips.ins().showTips(`已达到当前阶数最大等级`);
			}
			ViewManager.ins().open(CultivateTrainTipsWin, trainData);
		}
	}

	/**
	 * 开启飞剑
	 * 67-6
	 * @param  {number} roleId
	 * @returns void
	 */
	public sendOpenFlySword(roleId: number): void {
		let data = this.getAppearanceModel(roleId);
		if (!data)
			return;

		if (data.getIsActivation()) {
			UserTips.ins().showTips(`已开启功能`);
			return;
		}

		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeShort(roleId);
		this.sendToServer(bytes);
	}

	/**
	 * 派发开启飞剑
	 * 67-6
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	public postOpenFlySword(bytes: GameByteArray): void {
		let roleId = bytes.readShort();
		let data = this.getModel(roleId);
		if (!data)
			return;

		data.levelModel.level = SubRoles.ins().roles[roleId].flySwordData.level = 1;
		data.appearanceModel.isActivation = SubRoles.ins().roles[roleId].flySwordData.isOpen = bytes.readByte() == 1;

		let config = GlobalConfig.FlySwordTypeConfig[data.appearanceModel.idList[0]];
		console.log(config.name);
		console.log(`${config.resourceId}_png`);
		console.log('postOpenFlySword');
		Activationtongyong.show(0, config.name, `${config.resourceId}_png`, ActivationtongyongShareType.FlySword);

		this.sendChangeCurrLevelAppearance(roleId);

		// 激活翅膀后需要请求下一个唤醒任务
		UserTask.ins().requestNextAwakeTask(UserTask.AWAKE_TASK_TYPE.FLYSWORD);
	}

	/**
	 * 激活当前品阶飞剑
	 */
	private onActivationCurrLevelFlySword(roleId: number): void {
		this.sendActivation(roleId, this.getLevelData(roleId).getCurrLevelConfig().appearanceId);
	}

	/**
	 * 获取外观数据模型
	 * @returns FlySwordAppearanceModel
	 */
	public getAppearanceModel(roleId: number): FlySwordAppearanceModel {
		let data = this.getModel(roleId);
		return data ? data.appearanceModel : undefined;
	}

	/**
	 * 获取品阶数据模型
	 * @returns FlySwordLevelModel
	 */
	public getLevelModel(roleId: number): FlySwordLevelModel {
		let data = this.getModel(roleId);
		return data ? data.levelModel : undefined;
	}

	/**
	 * 获取品阶数据
	 * @returns FlySwordLevelData
	 */
	public getLevelData(roleId: number): FlySwordLevelData {
		let data = this.getModel(roleId);
		return data ? data.levelModel.levelData : undefined;
	}

	/**
	 * 获取成长数据
	 * @returns FlySwordGrowthLevelData
	 */
	public getGrowthData(roleId: number): FlySwordGrowthData {
		let data = this.getModel(roleId);
		return data ? data.levelModel.growthData : undefined;
	}

	/**
	 * 获取资质数据
	 * @returns FlySwordQualificationLevelData
	 */
	public getQualificationData(roleId: number): FlySwordQualificationData {
		let data = this.getModel(roleId);
		return data ? data.levelModel.qualificationData : undefined;
	}

	/**
	 * 获取是否激活
	 * @param  {number} roleId
	 * @returns boolean
	 */
	public getIsActivation(roleId: number): boolean {
		let data = this.getAppearanceModel(roleId);
		return data ? data.getIsActivation() : undefined;
	}

	/**
	 * 获取数据
	 * @param  {number} roleId
	 * @returns FlySwordModel
	 */
	public getModel(roleId: number): FlySwordModel {
		for (let data of this.models) {
			if (data.roleId == roleId)
				return data;
		}
		return undefined;
	}

	/**
	 * 是否开启功能玩法
	 * @returns boolean
	 */
	public isOpen(): boolean {
		let config = GlobalConfig.FlySwordCommonConfig;
		return Actor.totalLevel >= config.levelLimit && GameServer.serverOpenDay >= config.dayLimit - 1 && UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.FLYSWORD);
	}

	/**
	 * 是否可开启功能
	 * @param  {any} roleId
	 * @returns boolean
	 */
	public isCanOpen(roleId): boolean {
		let model = this.getModel(roleId);
		return model ? !model.appearanceModel.getIsActivation() && this.isOpen() : false;
	}

	/**
	 * 获取总战力
	 * @param  {number} roleId
	 * @returns number
	 */
	public getTotalCombatPower(roleId: number): number {
		let data = this.getModel(roleId);
		return data ? data.getTotalCombatPower() : 0;
	}

}

namespace GameSystem {
	export let  flysword = FlySword.ins.bind(FlySword);
}