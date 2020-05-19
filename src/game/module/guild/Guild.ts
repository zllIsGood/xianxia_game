/**
 * 仙盟数据
 */
class Guild extends BaseSystem {

	public guildID: number = 0;
	public guildName: string = "";
	public guildLv: number = 0;
	/**第一个元素就是仙盟等级 */
	private _buildingLevels: number[] = [];
	/**资金 */
	public money: number = 0;
	/**公告 */
	public notice: string = "";

	public records: string[] = [];

	public guildListInfos: GuildListInfo[] = [];//仙盟列表
	private _guildMembers: GuildMemberInfo[] = [];//仙盟成员列表
	public applyGuilds: number[] = [];//申请仙盟列表
	private _guillRoleSkillInfo: GuildRoleSkillInfo[] = [];//仙盟技能数据
	public guildTaskInfos: eui.ArrayCollection = new eui.ArrayCollection();//仙盟任务列表
	public guildMessageInfoData: eui.ArrayCollection//仙盟聊天记录包含仙盟公告
	public isFirstGetMessageInfo: boolean = true;

	/** 按历史贡献 排序，按当日贡献排序*/
	private _memberSortType: number = 0;

	public pageMax: number = 1;

	/**我的当前贡献 */
	public myCon: number;
	/**我的历史贡献 */
	public myTotalCon: number;
	/**我的职位 */
	public myOffice: number;

	private _conCount: number[];
	/**是否有玩家申请 */
	private hasApply: boolean = false;

	/**神树等级及数据*/
	public fireDic: { fireLvl: number, fireVal: number };
	/** 可改名次数 */
	public changeNameNum: number = 0;
	//仙盟有新的聊天信息
	public hasNewMsg: boolean = false;

	public constructor() {
		super();

		this._conCount = [];
		this.sysId = PackageID.Guild;
		this.regNetMsg(1, this.postGuildInfo);
		this.regNetMsg(2, this.postGuildMembers);
		this.regNetMsg(3, this.postGuildList);
		this.regNetMsg(4, this.postGuildCreate);
		this.regNetMsg(6, this.postJoinGuild);
		this.regNetMsg(7, this.postApplyInfos);
		this.regNetMsg(8, this.postProcessJoin);
		this.regNetMsg(9, this.doChangeOffice);
		this.regNetMsg(11, this.postQuitGuild);
		this.regNetMsg(12, this.doUpdateGuildInfo);
		this.regNetMsg(13, this.postGuildMoney);
		this.regNetMsg(14, this.postChangeNotice);
		this.regNetMsg(15, this.doGuildSkillInfo);
		this.regNetMsg(16, this.postLearnGuildSkill);
		this.regNetMsg(17, this.postUpBuilding);
		this.regNetMsg(18, this.doPracticeGuildSkill);
		this.regNetMsg(19, this.doGuildTaskInfos);
		this.regNetMsg(20, this.doGuildTaskUpdate);
		this.regNetMsg(22, this.postManageList);
		this.regNetMsg(23, this.doManage);
		this.regNetMsg(24, this.postConCount);
		this.regNetMsg(25, this.postMyGuildInfo);
		this.regNetMsg(26, this.doGuildMessage);
		this.regNetMsg(27, this.postAllGuildMessage);
		this.regNetMsg(28, this.doAddGuildlimit);
		this.regNetMsg(30, this.postUpdateFire);

		this.observe(GameLogic.ins().postEnterMap, this.startCheckShow);
		this.observe(GameLogic.ins().postGuildChange, this.setGuild);

		this.initData();
	}

	public initData() {
		if (!this.guildMessageInfoData) this.guildMessageInfoData = new eui.ArrayCollection();
		this.guildMessageInfoData.removeAll();
		this.isFirstGetMessageInfo = true;
	}

	public setGuild(arr: [number, string]) {
		let [id, name] = arr;
		if (this.guildID != id) {
			this.guildID = id;
			this.guildName = name;
			this.sendGuildInfo();
			if (this.guildID != 0) {
				if (ViewManager.ins().isShow(GuildApplyWin)) {
					ViewManager.ins().close(GuildApplyWin);
					ViewManager.ins().open(GuildMap);
				}
			}
		}
	}

	public static ins(): Guild {
		return super.ins() as Guild;
	}

	protected initLogin(): void {
		this.sendGuildInfo();
		this.sendMyGuildInfo();
	}

	/**仙盟技能数据 */
	public getSkllInfoByIndex(index: number): GuildRoleSkillInfo {
		return this._guillRoleSkillInfo[index];
	}

	/**仙盟成员列表 */
	public getGuildMembersByIndex(index: number): GuildMemberInfo {
		return this._guildMembers[index];
	}

	/**仙盟任务列表 */
	public getGuildTaskInfosByIndex(index: number): GuildTaskInfo {
		return this.guildTaskInfos.getItemAt(index);
	}

	/**第一个元素就是仙盟等级 */
	public getBuildingLevels(index: number = -1): any {
		return index == -1 ? this._buildingLevels : this._buildingLevels[index];
	}

	public getConCount(index: number = -1): any {
		return index == -1 ? this._conCount : this._conCount[index];
	}

	/**
	 * 请求帮派信息
	 * 37-1
	 */
	public sendGuildInfo(): void {
		this.sendBaseProto(1);
	}

	/**
	 * 37-1
	 * @param bytes
	 * @returns {any}
	 */
	public postGuildInfo(bytes: GameByteArray): [number, string] | boolean {
		this._buildingLevels = [];
		//等于1已经加入帮派了
		if (bytes.readByte() == 1) {

			this.guildID = bytes.readUnsignedInt();
			this.guildName = bytes.readString();
			let len: number = bytes.readUnsignedByte();
			for (let index = 0; index < len; index++) {
				this._buildingLevels.push(bytes.readUnsignedByte());
			}
			this.money = bytes.readInt();
			this.notice = bytes.readString();
			this.doAddGuildlimit(bytes);
			this.guildLv = this._buildingLevels[0];
			this.sendGuildMembers();
			this.sendGuildSkillInfo();
			this.postUpdateFire(bytes);
			this.changeNameNum = bytes.readInt();
			return [this.guildID, this.guildName];
		}
		return false;
	}

	/**
	 * 获取仙盟成员列表
	 * 37-2
	 */
	public sendGuildMembers(): void {
		this.sendBaseProto(2);
	}

	public postGuildMembers(bytes: GameByteArray): void {
		let len: number = bytes.readInt();
		this._guildMembers = [];
		for (let index = 0; index < len; index++) {
			let info = new GuildMemberInfo;
			info.roleID = bytes.readInt();
			info.name = bytes.readString();
			info.office = bytes.readUnsignedByte();
			info.job = bytes.readUnsignedByte();
			info.sex = bytes.readUnsignedByte();
			info.sex = info.job == JobConst.ZhanShi ? 0 : 1;
			info.vipLevel = bytes.readInt();
			info.monthCard = bytes.readUnsignedByte();
			info.contribution = bytes.readInt();
			info.curContribution = bytes.readInt();
			info.attack = bytes.readDouble();
			info.downTime = bytes.readUnsignedInt();
			info.level = bytes.readInt();
			info.zsLevel = bytes.readInt();
			this._guildMembers.push(info);
		}
	}

	/**
	 * 获取仙盟列表
	 * 37-3
	 */
	public sendGuildList(page?: number, num?: number): void {
		this.sendBaseProto(3);
	}

	public postGuildList(bytes: GameByteArray): void {
		this.guildListInfos = [];
		let len: number = bytes.readInt();
		for (let i = 0; i < len; i++) {
			let info = new GuildListInfo;
			info.guildRank = i + 1;
			info.guildID = bytes.readUnsignedInt();
			info.guildLevel = bytes.readUnsignedByte();
			info.guildMember = bytes.readInt();
			info.guildName = bytes.readString();
			info.guildPresident = bytes.readString();
			info.attr = bytes.readInt();
			this.guildListInfos.push(info);
		}
	}

	/**
	 * 创建仙盟
	 * 37-4
	 */
	public sendGuildCreate(id: number, name: string): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeByte(id);
		bytes.writeString(name);
		this.sendToServer(bytes);
	}

	/**
	 * 创建仙盟结果
	 * 37-4
	 */
	public postGuildCreate(bytes: GameByteArray): boolean {
		let result: number = bytes.readUnsignedByte();
		if (result == 0) {
			this.guildID = bytes.readUnsignedInt();
			ViewManager.ins().close(GuildCreateWin);
			ViewManager.ins().close(GuildApplyWin);
			ViewManager.ins().open(GuildMap);
			UserTips.ins().showTips("仙盟创建成功");
			this.sendGuildInfo();
			// this.sendAddGuildLimit(this.isAuto,this.attrLimit);
			return true;
		}
		return false;
	}

	/**
	 * 退出仙盟
	 * 37-5
	 */
	public sendQuitGuild(): void {
		this.sendBaseProto(5);
	}

	/**
	 * 申请加入仙盟
	 * 37-6
	 */
	public sendJoinGuild(guildID: number): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(guildID);
		this.sendToServer(bytes);
	}

	/**
	 * 通知有人申请加入仙盟
	 * 37-6
	 */
	public postJoinGuild(bytes: GameByteArray): void {
		this.hasApply = true;
	}

	/**
	 * 获取申请加入仙盟玩家信息
	 * 37-7
	 */
	public sendApplyInfos(): void {
		this.sendBaseProto(7);
	}

	/**
	 * 发送申请加入仙盟玩家信息
	 * 37-7
	 */
	public postApplyInfos(bytes: GameByteArray): GuildApplyInfo[] {
		let len: number = bytes.readInt();
		let applyPlayers: GuildApplyInfo[] = [];
		for (let index = 0; index < len; index++) {
			let info = new GuildApplyInfo;
			info.roleID = bytes.readInt();
			info.vipLevel = bytes.readInt();
			info.job = bytes.readUnsignedByte();
			info.sex = bytes.readUnsignedByte();
			info.sex = info.job == JobConst.ZhanShi ? 0 : 1;
			info.attack = bytes.readDouble();
			info.name = bytes.readString();
			applyPlayers.push(info);
		}
		this.hasApply = len > 0;
		return applyPlayers;
	}

	/**
	 * 处理申请
	 * 37-8
	 */
	public sendProcessJoin(joinId: number, b: number): void {
		let bytes: GameByteArray = this.getBytes(8);
		bytes.writeInt(joinId);
		bytes.writeByte(b);
		this.sendToServer(bytes);
	}

	/**
	 * 通知申请的玩家申请结果
	 * 37-8
	 */
	public postProcessJoin(bytes: GameByteArray): boolean {
		let guildID: number = bytes.readUnsignedInt();
		let result: number = bytes.readUnsignedByte();
		let applyGuilds: number[] = this.applyGuilds;
		let index: number = applyGuilds.indexOf(guildID);
		if (index != -1 && result == 0) {
			applyGuilds.splice(index, 1);
		}
		if (result == 1)
			return true;
		return false;
	}

	/**
	 * 升降职
	 * 37-9
	 * roleID 玩家id
	 * guildOffice 职位id
	 */
	public sendChangeOffice(roleID: number, guildOffice: number): void {
		let bytes: GameByteArray = this.getBytes(9);
		bytes.writeInt(roleID);
		bytes.writeByte(guildOffice);
		this.sendToServer(bytes);
	}

	/**
	 * 通知玩家职位变化
	 * 37-9
	 */
	public doChangeOffice(bytes: GameByteArray): void {
		let roleID: number = bytes.readInt();
		let newOffice: number = bytes.readUnsignedByte();
		for (let index = 0; index < this._guildMembers.length; index++) {
			let element = this.getGuildMembersByIndex(index);
			if (element.roleID == roleID) {
				element.office = newOffice;
				return;
			}
		}
	}

	/**
	 * 弹劾
	 * 37-10
	 */
	public sendDemise(): void {
		this.sendBaseProto(10);
	}

	/**
	 * 踢出
	 * 37-11
	 */
	public sendKick(roleID: number): void {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeInt(roleID);
		this.sendToServer(bytes);
	}

	/**
	 * 退出仙盟
	 * 37-11
	 */
	public postQuitGuild(bytes: GameByteArray): boolean {
		let roleID: number = bytes.readInt();
		if (roleID == Actor.actorID) {
			this.clearGuildInfo();
			ViewManager.ins().close(GuildWin);
			ViewManager.ins().close(GuildMap);
			return true;
		}
		return false;
	}

	/**
	 * 处理帮派信息请求刷新
	 * 37-12
	 * @param bytes
	 */
	public doUpdateGuildInfo(bytes: GameByteArray): void {
		let flag = bytes.readUnsignedByte();
		switch (flag) {
			case 1:
				break;
			case 2:
				this.sendGuildInfo();
				break;
			case 3:
				this.sendGuildMembers();
				break;
			case 4:
				break;
			case 5:
				this.sendApplyInfos();
				break;
			case 6:
				break;
		}
	}

	/**
	 * 捐献
	 * 37-13
	 */
	public sendCon(type: number): void {
		let bytes: GameByteArray = this.getBytes(13);
		bytes.writeInt(type);
		this.sendToServer(bytes);
	}

	/**
	 * 仙盟资金
	 * 37-13
	 */
	public postGuildMoney(bytes: GameByteArray): void {
		this.money = bytes.readInt();
	}

	/**
	 * 修改公告
	 * 37-14
	 */
	public sendChangeNotice(text: string): void {
		let bytes: GameByteArray = this.getBytes(14);
		bytes.writeString(text);
		this.sendToServer(bytes);
	}

	/**
	 * 修改公告
	 * 37-14
	 */
	public postChangeNotice(bytes: GameByteArray): void {
		let resule: number = bytes.readUnsignedByte();
		if (resule == 0) {
			this.notice = bytes.readString();
		}
	}

	/**
	 * 获取仙盟技能信息
	 * 37-15
	 */
	public sendGuildSkillInfo(): void {
		this.sendBaseProto(15);
	}

	/**
	 * 获取仙盟技能信息
	 * 37-15
	 */
	public doGuildSkillInfo(bytes: GameByteArray): void {
		let len: number = bytes.readUnsignedByte();
		this._guillRoleSkillInfo = [];
		for (let index = 0; index < len; index++) {
			let roleSkillInfo: GuildRoleSkillInfo = new GuildRoleSkillInfo;
			let len2 = bytes.readUnsignedByte();
			for (let j = 0; j < len2; j++) {
				let skillInfo: GuildSkillInfo = new GuildSkillInfo;
				skillInfo.level = bytes.readInt();
				roleSkillInfo.guildSkillInfo.push(skillInfo);
			}
			len2 = bytes.readUnsignedByte();
			for (let k = 0; k < len2; k++) {
				let element = len2[k];
				let skillInfo: GuildSkillInfo = new GuildSkillInfo;
				skillInfo.level = bytes.readInt();
				skillInfo.exp = bytes.readInt();
				roleSkillInfo.practiceSkillInfo.push(skillInfo);
			}
			this._guillRoleSkillInfo.push(roleSkillInfo);
		}
		this.postGuildSkillInfo();
	}

	public postGuildSkillInfo(): void {

	}

	/**
	 * 学习仙盟技能
	 * 37-16
	 */
	public sendLearnGuildSkill(roleID: number, skillID: number): void {
		let bytes: GameByteArray = this.getBytes(16);
		bytes.writeShort(roleID);
		bytes.writeByte(skillID);
		this.sendToServer(bytes);
	}

	/**
	 * 学习仙盟技能
	 * 37-16
	 */
	public postLearnGuildSkill(bytes: GameByteArray): void {
		let roleID: number = bytes.readShort();
		let skillID: number = bytes.readUnsignedByte();
		this.getSkllInfoByIndex(roleID).guildSkillInfo[skillID - 1].level = bytes.readInt();
		this.postGuildSkillInfo();
		UserTips.ins().showTips("升级成功");
	}

	/**
	 * 修炼仙盟技能
	 * 37-18
	 */
	public sendPracticeGuildSkill(roleID: number, skillID: number): void {
		let bytes: GameByteArray = this.getBytes(18);
		bytes.writeShort(roleID);
		bytes.writeByte(skillID);
		this.sendToServer(bytes);
	}

	/**
	 * 修炼仙盟技能
	 * 37-18
	 */
	public doPracticeGuildSkill(bytes: GameByteArray): void {
		let roleID: number = bytes.readShort();
		let skillID: number = bytes.readUnsignedByte();
		this.getSkllInfoByIndex(roleID).practiceSkillInfo[skillID - 1].level = bytes.readInt();
		this.getSkllInfoByIndex(roleID).practiceSkillInfo[skillID - 1].exp = bytes.readInt();
		let add: number = bytes.readInt();
		this.postGuildSkillInfo();
		UserTips.ins().showTips(`|C:0x23CA23&T:修炼值 +${add}|`);
	}

	/**
	 * 升级建筑
	 * 37-17
	 */
	public sendUpBuilding(buildType: number): void {
		let bytes: GameByteArray = this.getBytes(17);
		bytes.writeByte(buildType);
		this.sendToServer(bytes);
	}

	public postUpBuilding(bytes: GameByteArray): void {
		let type: number = bytes.readByte();
		this._buildingLevels[type - 1] = bytes.readByte();
		this.guildLv = this._buildingLevels[0];
	}

	/**
	 * 发送任务信息列表
	 * 37-19
	 */
	private doGuildTaskInfos(bytes: GameByteArray): void {
		this.guildTaskInfos.removeAll();
		this.initTaskInfos();
		let source: GuildTaskInfo[] = [];
		let len: number = bytes.readInt();
		for (let index = 0; index < len; index++) {
			let element: GuildTaskInfo = new GuildTaskInfo();
			element.taskID = bytes.readInt();
			element.param = bytes.readInt();
			element.state = bytes.readInt();
			element.stdTask = GlobalConfig.GuildTaskConfig[element.taskID];
			this.guildTaskInfos.addItem(element);
		}
		this.updateTaskList();
	}

	public postGuildTaskUpdate(): void {

	}

	/**
	 * 通知任务信息改变
	 * 37-20
	 */
	private doGuildTaskUpdate(bytes: GameByteArray): void {
		let id: number = bytes.readInt();
		let param: number = bytes.readInt();
		let state: number = bytes.readInt();
		for (let i = 0; i < this.guildTaskInfos.length; i++) {
			let element: GuildTaskInfo = this.guildTaskInfos.getItemAt(i);
			if (element && element.taskID == id) {
				element.param = param;
				element.state = state;
				break;
			}
		}
		this.updateTaskList();
	}

	private updateTaskList(): void {
		let source: GuildTaskInfo[] = this.guildTaskInfos.source;
		for (let i = source.length - 1; i >= 0; i--) {
			if (source[i].stdTask.type == 0)
				source.splice(i, 1);
		}
		source.sort(this.taskInfosSortFunc);
		this.guildTaskInfos.replaceAll(source);
		this.postGuildTaskUpdate();
	}

	/**
	 * 升级建筑
	 * 37-21
	 */
	public sendGetTaskAward(taskID: number): void {
		let bytes: GameByteArray = this.getBytes(21);
		bytes.writeByte(taskID);
		this.sendToServer(bytes);
	}

	/**
	 * 获取仙盟事件记录
	 * 37-22
	 */
	public sendManageList(): void {
		this.sendBaseProto(22);
	}

	public postManageList(bytes: GameByteArray): void {
		this.records = [];
		let count: number = bytes.readInt();
		for (let i: number = 0; i < count; i++) {
			this.parserManage(bytes);
		}
	}

	private doManage(bytes: GameByteArray): void {

	}

	/**
	 * 获取捐献次数
	 * 37-24
	 */
	public sendConCount(): void {
		this.sendBaseProto(24);
	}

	public postConCount(bytes: GameByteArray): void {
		let count: number = bytes.readUnsignedByte();
		for (let i: number = 0; i < count; i++) {
			this._conCount[i] = bytes.readInt();
		}
	}


	/**
	 * 获取玩家仙盟数据
	 * 37-25
	 */
	public sendMyGuildInfo(): void {
		this.sendBaseProto(25);
	}

	/**
	 * 处理玩家仙盟数据
	 * 37-25
	 */
	public postMyGuildInfo(bytes: GameByteArray): void {
		this.myCon = bytes.readInt();
		this.myTotalCon = bytes.readInt();
		this.myOffice = bytes.readUnsignedByte();
	}

	/**
	 * 发送仙盟聊天消息
	 * 37-26
	 */
	public sendGuildMessage(str: string): void {
		let bytes: GameByteArray = this.getBytes(26);
		bytes.writeString(str);
		this.sendToServer(bytes);

		ReportData.getIns().reportChat(str, 6);

	}

	/**
	 * 广播仙盟聊天消息
	 * 37-26
	 */
	private doGuildMessage(bytes: GameByteArray): void {
		let element: GuildMessageInfo = new GuildMessageInfo();
		element.parserMessage(bytes);
		if (Friends.ins().indexOfBlackList(element.roleId) == -1) {
			if (this.guildMessageInfoData.length >= 50) {
				let msg = this.guildMessageInfoData.removeItemAt(0);
				Chat.ins().removeAllChatMsg(msg);
			}
			this.guildMessageInfoData.addItem(element);
			// this.postGetNewGuildMessage(element);
			Chat.ins().insertAllChatMsg(element);
			Chat.ins().postNewChatMsg(element);

			if (element.type == 1 && element.roleId != Actor.actorID) {
				this.hasNewMsg = true;
			}
		}

		//伪造一个普通聊天的tip在场景上
		if (element.type == 1) {
			let msg: ChatInfoData = new ChatInfoData(null);
			msg.name = element.name;
			msg.type = 7;
			msg.str = element.content;
			Chat.ins().postNewChatMsg(msg);
		}
		//用于提示仙盟强盗信息
		if (element.type == 2) {
			this.postGuildBossHaveRelive(true, element.content);
		}
	}

	public postGetNewGuildMessage(ele: GuildMessageInfo) {
		return ele;
	}

	public postGuildBossHaveRelive(...params) {
		return params;
	}

	/**
	 * 获取玩家仙盟数据
	 * 37-27
	 */
	public sendAllGuildMessage(): void {
		if (!this.isFirstGetMessageInfo) {
			return;
		}
		this.isFirstGetMessageInfo = false;
		this.sendBaseProto(27);
	}

	/**
	 * 处理玩家仙盟数据
	 * 37-27
	 */
	public postAllGuildMessage(bytes: GameByteArray): void {
		this.guildMessageInfoData.removeAll();
		let len: number = bytes.readInt();
		for (let index = 0; index < len; index++) {
			let element = new GuildMessageInfo;
			element.parserMessage(bytes);
			if (Friends.ins().indexOfBlackList(element.roleId) == -1) {
				this.guildMessageInfoData.addItem(element);
				Chat.ins().insertAllChatMsg(element);
			}
		}
		if (this.guildMessageInfoData.length) {
			Chat.ins().postNewChatMsg(this.guildMessageInfoData.getItemAt(this.guildMessageInfoData.length - 1));
		}
	}

	/**
	 * 玩家自动加入仙盟数据
	 * 37-28
	 */
	public sendAddGuildLimit(auto: number, attr: number): void {
		let bytes: GameByteArray = this.getBytes(28);
		bytes.writeByte(auto);
		bytes.writeInt(attr);
		this.sendToServer(bytes);
	}

	/**
	 * 处理 自动加入帮派的变化
	 * 37-28
	 */
	private doAddGuildlimit(bytes: GameByteArray): void {
		this.isAuto = bytes.readUnsignedByte();
		this.attrLimit = bytes.readInt();
	}

	/**
	 * 37-30
	 * 捐献神树
	 */
	public sendToFire(count, itemCount: number) {
		let bytes = this.getBytes(30);
		bytes.writeShort(count);
		this.sendToServer(bytes);
		this.sendToFireCount.push([count, itemCount]);
	}
	private sendToFireCount: number[][] = [];
	/**
	 * 神树
	 * 37-30
	 * @param bytes
	 */
	public postUpdateFire(bytes: GameByteArray) {
		this.fireDic = this.fireDic || {} as any;
		let fireLvl = bytes.readShort();
		let fireVal = bytes.readInt();
		let isUpdate = this.fireDic.fireLvl != fireLvl || this.fireDic.fireVal != fireVal;
		this.fireDic.fireLvl = fireLvl;
		this.fireDic.fireVal = fireVal;

		if (isUpdate) {
			let conf = GlobalConfig.GuildConfig;
			let item = UserBag.ins().getBagItemById(conf.bonfireItem);
			let count = item ? item.count : 0;
			for (var i = 0; i < this.sendToFireCount.length; i++) {
				if (count == this.sendToFireCount[i][1]) {
					while (i >= 0) {
						let v = this.sendToFireCount.shift()[0];
						UserTips.ins().showCenterTips(`仙盟总神树值 +${5 * v} 个人仙盟贡献 +${30 * v}`);
						i -= 1;
					}
					break;
				}
			}
		}
	}

	public sendGuildChangeName(nameStr: string) {
		let bytes = this.getBytes(31);
		bytes.writeString(nameStr);
		this.sendToServer(bytes);
	}

	parserManage(bytes: GameByteArray): void {
		if (!this.records)
			return;

		let str: string = "";

		//时间 unsigned int
		//事件类型 unsigned char 从1开始分别表示加入仙盟，离开仙盟，副盟主任命，盟主禅让，盟主弹劾，仙盟副本进度首通，元宝/金币捐献，建筑升级
		//参数1 int
		//参数2 int
		//参数3 int
		//玩家名 string
		//玩家名2 string

		let time: string = DateUtils.getFormatBySecond(DateUtils.formatMiniDateTime(bytes.readUnsignedInt()) * 0.001, 8);
		time = StringUtils.complementByChar(time, 16);
		let type: number = bytes.readUnsignedByte();
		let param1: number = bytes.readInt();
		let param2: number = bytes.readInt();
		let param3: number = bytes.readInt();
		let name1: string = bytes.readString();
		let name2: string = bytes.readString();
		switch (type) {
			case 1:
				str = time + "  [" + name1 + "]加入仙盟";
				break;
			case 2:
				str = time + "  [" + name1 + "]离开仙盟";
				break;
			case 3:
				str = time + "  [" + name1 + "]被任命副盟主";
				break;
			case 4:
				str = time + "  [" + name1 + "]成为新的盟主";
				break;
			case 5:
				str = time + "  [" + name1 + "]发起弹劾";
				break;
			case 6:
				str = time + "  [" + name1 + "]仙盟副本进度首通";
				break;
			case 7:
				str = time + "  [" + name1 + "]捐献了" + param2 + (param1 == 2 ? "元宝" : "金币");
				break;
			case 8:
				str = time + "  [" + name1 + "]把" + GlobalConfig.GuildConfig.buildingNames[param1 - 1] + "升级到" + param2 + "级";
				break;
			case 9:
				let config: ItemConfig = GlobalConfig.ItemConfig[param1];
				str = `${time}  [${name1}]在仙盟商店获得了<font color=${ItemConfig.getQualityColor(config)}>${config.name}</font>`;
				break;
			case 10:
				str = time + "  <font color='#35e62d'>仙盟强盗已经全部击杀</font>";
				break;
			case 11:
				str = time + "  [" + name1 + "]被降职了";
				break;
		}

		this.records.unshift(str);
	}

	/**是否有玩家申请 */
	public hasApplys(): boolean {
		return this.myOffice >= GuildOffice.GUILD_FUBANGZHU && this.hasApply;
	}

	private clearGuildInfo(): void {
		this.guildID = 0;
		this.guildName = "";
		this.guildListInfos = [];
		this._guildMembers = [];
		this.applyGuilds = [];
		this.pageMax = 1;
		//退出仙盟后清除仙盟聊天信息标记
		this.hasNewMsg = false;
	}

	/**移除某id的聊天 */
	public removeMsgWithId(userId: number): void {
		var source = [];
		for (let i = 0; i < this.guildMessageInfoData.length; i++) {
			var msgInfo: GuildMessageInfo = this.guildMessageInfoData.getItemAt(i);
			if (msgInfo.roleId != userId) {
				source.push(msgInfo);
			}
		}
		this.guildMessageInfoData.source = source;
		this.guildMessageInfoData.refresh();
	}

	private initTaskInfos(): void {
		if (this.guildTaskInfos != null) {
			return;
		}

		let infoList = [];

		let dp: GuildTaskConfig[] = GlobalConfig.GuildTaskConfig;

		for (let key in dp) {
			if (dp.hasOwnProperty(key)) {
				let gtc = dp[key];
				let element = new GuildTaskInfo;
				element.taskID = gtc.id;
				element.param = 0;
				element.state = 0;
				element.stdTask = gtc;
				infoList.push(element);
			}
		}
		this.guildTaskInfos.replaceAll(infoList);
	}

	private taskInfosSortFunc(aConfig: GuildTaskInfo, bConfig: GuildTaskInfo): number {
		if (aConfig.state == bConfig.state) {
			if (aConfig.taskID < bConfig.taskID)
				return -1;
			if (aConfig.taskID > bConfig.taskID)
				return 1;
			return 0;
		}
		if (aConfig.state == 2)
			return 1;
		if (bConfig.state == 2)
			return -1;
		if (aConfig.state != 2 && bConfig.state != 2) {
			if (aConfig.taskID < bConfig.taskID)
				return -1;
			if (aConfig.taskID > bConfig.taskID)
				return 1;
		}
		return 0;
	}

	public getMemberNum(): number {
		return this._guildMembers.length;
	}

	/**
	 * 获取成员列表
	 * sortType 排序方式， 0不排序，1按历史贡献，2 按当日贡献
	 */
	public getGuildMembers(sortType: number): GuildMemberInfo[] {
		if (sortType == 0 || this._memberSortType == sortType)
			return this._guildMembers;
		if (sortType == 1)
			return this._guildMembers.sort(this.memberSortFunc);
		if (sortType == 2)
			return this._guildMembers.sort(this.memberSortFunc2);
		return this._guildMembers;
	}

	/**获取某个职的数量 */
	public getOfficeNum(office: number): number {
		let len: number = this._guildMembers.length;
		let num: number = 0;
		for (let index = 0; index < len; index++) {
			let element = this._guildMembers[index];
			if (element.office == office)
				num++;
		}
		return num;
	}

	/**能否任命副盟主 */
	public canAppointFHZ(): boolean {
		return this.getOfficeNum(GuildOffice.GUILD_FUBANGZHU) < GlobalConfig.GuildConfig.posCounts[this.guildLv - 1][1];
	}

	private memberSortFunc(aInfo: GuildMemberInfo, bInfo: GuildMemberInfo): number {
		if (aInfo.office > bInfo.office)
			return -1;
		if (aInfo.office < bInfo.office)
			return 1;
		if (aInfo.office == bInfo.office) {
			if (aInfo.contribution == bInfo.contribution)
				return 0;
			return aInfo.contribution > bInfo.contribution ? -1 : 1;
		}
		return 0;
	}

	private memberSortFunc2(aInfo: GuildMemberInfo, bInfo: GuildMemberInfo): number {
		if (aInfo.curContribution == bInfo.curContribution)
			return 0;
		return aInfo.curContribution > bInfo.curContribution ? -1 : 1;
	}

	public checkIsInGuild(id: number): boolean {
		for (var k in this._guildMembers) {
			var info: GuildMemberInfo = this._guildMembers[k];
			if (info.roleID == id) {
				return true;
			}
		}
		return false;
	}

	private startCheckShow(): void {
		if (GuildWar.ins().getModel().checkinAppoint()) {
			ViewManager.ins().closeTopLevel();
			ViewManager.ins().open(GuildWarUiInfo);
		} else {
			ViewManager.ins().close(GuildWarUiInfo);
		}
	}

	/**是否自动加入帮派 */
	public isAuto: number = 1;
	/**自动加入的限制战力 */
	public attrLimit: number = 99999;

	/**是否有可升级的建筑(有权限的成员) */
	public isUpGradeBuilding(): boolean {

		if (Guild.ins().myOffice < GuildOffice.GUILD_FUBANGZHU) {
			return false;
		}

		let buildings = [GuildBuilding.GUILD_HALL, GuildBuilding.GUILD_LIANGONGFANG];

		for (let i = 0; i < buildings.length; i++) {
			let type: number = buildings[i];//建筑类型从1开始
			let curLevel = Guild.ins().getBuildingLevels(type - 1) || 0;
			let glc: GuildLevelConfig[] = GlobalConfig.GuildLevelConfig[type];
			let maxLevel = 0;
			let dp: GuildLevelConfig = null;
			let dpNext: GuildLevelConfig = null;
			let nextMoney = 0;
			for (let key in glc) {
				if (glc.hasOwnProperty(key)) {
					let element: GuildLevelConfig = glc[key];
					maxLevel = element.level > maxLevel ? element.level : maxLevel;
					if (element.level == curLevel)
						dp = element;
					if (element.level == curLevel + 1)
						dpNext = element;
				}

			}

			if (dp || dpNext || (type == GuildBuilding.GUILD_LIANGONGFANG)) {
				if (dpNext && curLevel < maxLevel) {
					nextMoney = dpNext.upFund;
				}
			}

			if (type == GuildBuilding.GUILD_HALL && curLevel >= maxLevel) {
				continue;
			}
			else if (type != GuildBuilding.GUILD_HALL && curLevel >= Guild.ins().guildLv) {
				continue;
			}
			else if (Guild.ins().money < nextMoney) {
				continue;
			}
			return true;
		}
		return false;

	}

}

namespace GameSystem {
	export let  guild = Guild.ins.bind(Guild);
}