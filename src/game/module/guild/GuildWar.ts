class GuildWar extends BaseSystem {

	constructor() {
		super();

		this.sysId = PackageID.GuildWar;
		this.regNetMsg(1, this.postRedBagInfo);
		this.regNetMsg(2, this.doSendRedBack);
		this.regNetMsg(3, this.doRobRedBack);
		this.regNetMsg(4, this.postJoinPlayBack);
		this.regNetMsg(5, this.doPlayNextCard);
		this.regNetMsg(6, this.doGetPointInfo);
		this.regNetMsg(7, this.doGetGongXunChange);
		this.regNetMsg(8, this.doGuildRankinfo);
		this.regNetMsg(9, this.postGuildPersonalRank);
		this.regNetMsg(10, this.doGuildWarKillInfo);
		this.regNetMsg(11, this.doGuildWarCityOwn);
		this.regNetMsg(12, this.postDayRewardInfo);
		this.regNetMsg(14, this.doMyActivityRankInfo);
		this.regNetMsg(15, this.postFlagInfoChange);
		this.regNetMsg(17, this.doGuildWarResult);
		this.regNetMsg(18, this.doHuDunInfoChange);
		this.regNetMsg(19, this.postAssignsReward);
		this.regNetMsg(20, this.postSendRewardSuccess);
		this.regNetMsg(21, this.postWinGuildInfo);
		this.regNetMsg(22, this.postGuildWarStarInfo);
		this.regNetMsg(23, this.doGuildWarDoorHuDun);
		this.regNetMsg(24, this.doLotteryInfo);
		this.regNetMsg(25, this.doGetMyPoint);
		this.regNetMsg(26, this.doRankInfoChange);
		this.regNetMsg(27, this.doChangeAttrHandle);
		this.regNetMsg(28, this.doChangeShowList);
		this.regNetMsg(29, this.doPointRewardInfo);
		this.regNetMsg(31, this.doDoorEndtime);
		this.regNetMsg(32, this.doTalkMaxPoint);
		this.regNetMsg(33, this.postKillHuman);
		this.regNetMsg(34, this.postHeFuBelong);
	}

	private _guildWarModel: GuildWarModel;

	public static ins(): GuildWar {
		return super.ins() as GuildWar;
	}

	public getModel(): GuildWarModel {
		if (!this._guildWarModel)
			this._guildWarModel = new GuildWarModel();
		return this._guildWarModel;
	}

	/**
	 * 请求发红包
	 * 40-2
	 */
	public requestSendRedBag(num: number, bagNum: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(num);
		bytes.writeInt(bagNum);
		this.sendToServer(bytes);
	}

	/**
	 * 请求领取红包
	 * 40-3
	 */
	public requestRobRedBag(): void {
		let bytes: GameByteArray = this.getBytes(3);
		this.sendToServer(bytes);
	}

	/**
	 * 请求进入天盟争霸
	 * 40-4
	 */
	public requestJoinAc(): void {
		let bytes: GameByteArray = this.getBytes(4);
		this.sendToServer(bytes);
	}

	/**
	 * 请求进入下一场景
	 * 40-5
	 */
	public requestPlayNextMap(index:number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeByte(index);
		this.sendToServer(bytes);
	}

	/**
	 * 请求天盟争霸 帮派排行榜数据
	 * 40-8
	 */
	public requestGuildRank(): void {
		let bytes: GameByteArray = this.getBytes(8);
		this.sendToServer(bytes);
	}

	/**
	 * 请求天盟争霸 个人排行榜数据
	 * 40-9
	 */
	public requestOwnGuildRank(): void {
		let bytes: GameByteArray = this.getBytes(9);
		this.sendToServer(bytes);
	}

	/**
	 * 仙盟战个人排行榜
	 * 40-9
	 */
	public postGuildPersonalRank(bytes: GameByteArray): RankGuildInfo[] {
		let list: RankGuildInfo[] = [];
		let len = bytes.readInt();
		for (let i: number = 0; i < len; i++) {
			let info = new RankGuildInfo();
			info.parse(bytes);
			list[i] = info;
		}
		return list;
	}

	/**
	 * 请求天盟争霸 个人每日奖励
	 * 40-13
	 */
	public requestDayReward(day: number): void {
		let bytes: GameByteArray = this.getBytes(13);
		bytes.writeInt(day);
		this.sendToServer(bytes);
	}

	/**
	 * 请求天盟争霸 个人帮派积分排行
	 * 40-14
	 */
	public requestOwnMyGuildRank(): void {
		let bytes: GameByteArray = this.getBytes(14);
		this.sendToServer(bytes);
	}

	/**
	 * 请求 开始采集旗子
	 * 40-16
	 */
	public requestStartGetFlag(): void {
		let bytes: GameByteArray = this.getBytes(16);
		this.sendToServer(bytes);
	}

	/**
	 * 请求 天盟争霸获胜帮派信息
	 * 40-15
	 */
	public requestWinGuildInfo(): void {
		let bytes: GameByteArray = this.getBytes(21);
		this.sendToServer(bytes);
	}

	/**
	 * 红包信息
	 */
	public postRedBagInfo(bytes: GameByteArray): void {
		this.getModel().getRedbagInfo(bytes);
	}

	/**
	 * 发红包返回
	 */
	public doSendRedBack(bytes: GameByteArray): void {
		if (bytes.readBoolean()) {
			ViewManager.ins().close(RedBagWin);
			UserTips.ins().showTips("|C:0x35e62d&T:发送红包成功|");
		}
	}

	/**
	 * 抢红包返回
	 */
	public doRobRedBack(bytes: GameByteArray): void {
		if (bytes.readBoolean()) {
			ViewManager.ins().close(RedBagWin);
			ViewManager.ins().open(RedBagDetailsWin, 1);
		}
	}

	/**
	 * 进入天盟争霸的返回
	 * 40-4
	 */
	public postJoinPlayBack(bytes: GameByteArray): void {
		let flag: boolean = bytes.readBoolean();
		this.getModel().doorDie = bytes.readBoolean();
		if (flag) {
			ViewManager.ins().close(GuildWarMainWin);
			ViewManager.ins().close(GuildMap);
		}

	}

	/**
	 * 进入下个场景的返回
	 */
	public doPlayNextCard(bytes: GameByteArray): void {
		// egret.log("进入下个场景的返回");
	}

	/**
	 * 个人积分 帮派积分 变化 返回
	 */
	public doGetPointInfo(bytes: GameByteArray): void {
		this.getModel().ownPoint = bytes.readInt();
		this.getModel().guildPoint = bytes.readInt();
		let addNum: number = bytes.readInt();
		if (addNum > 0) {
			UserTips.ins().showTips(`获得 ${addNum} 积分`);
		}
		this.postPointUpdate();
	}

	public postPointUpdate() {

	}

	/**
	 * 功勋值变化 变化 返回
	 */
	public doGetGongXunChange(bytes: GameByteArray): void {
		this.getModel().gongXun = bytes.readInt();
		this.postPointUpdate();
	}

	/**
	 * 帮派排行数据
	 * 40-8
	 */
	public doGuildRankinfo(bytes: GameByteArray): void {
		this.getModel().decodeGuildRankInfo(bytes);
	}

	/**
	 * 帮派战 复活信息
	 */
	public doGuildWarKillInfo(bytes: GameByteArray): void {
		let time: number = bytes.readInt();
		this.getModel().killName = bytes.readString();
		this.getModel().killGuild = bytes.readString();
		ViewManager.ins().open(GuileWarReliveWin, 2, time);
	}

	/**
	 * 帮派战 天盟归属变更
	 */
	public doGuildWarCityOwn(bytes: GameByteArray): void {
		this.getModel().cityOwn = bytes.readString();
		this.postCityownChange();
	}

	public postCityownChange() {

	}

	/**
	 * 帮派战 本帮排行
	 */
	public doMyActivityRankInfo(bytes: GameByteArray): void {
		this.getModel().decodeMyGuildRankInfo(bytes);
	}

	/**领取每日奖励状态 变化 */
	public postDayRewardInfo(bytes: GameByteArray): void {
		this.getModel().canGetDay = bytes.readBoolean();
		this.getModel().getDayReward = bytes.readBoolean();
		this.getModel().rewardDay = bytes.readInt();
	}

	/**旗子状态变化 */
	public postFlagInfoChange(bytes: GameByteArray): void {
		//(0 不可采集,1 可采集 ,2 采集中)
		this.getModel().flagAcId = 0;
		this.getModel().flagStatu = bytes.readShort();
		if (this.getModel().flagStatu == 0) {
			this.getModel().endTime = bytes.readInt();
		} else if (this.getModel().flagStatu == 2) {
			this.getModel().flagName = bytes.readString();
			this.getModel().flagAcId = bytes.readInt();
			this.getModel().endTime = bytes.readInt();
			this.getModel().flagGuild = bytes.readString();
			if (this.getModel().flagAcId == Actor.actorID) {
				UserTips.ins().showTips("开始采集");
			}
		}
	}

	/**结算 */
	public doGuildWarResult(bytes: GameByteArray): void {
		this.getModel().decodeGulidWarResult(bytes);
	}

	/**护盾 */
	public doHuDunInfoChange(bytes: GameByteArray): void {
		this.postHudunInfo(bytes.readInt(), bytes.readInt());
	}

	public postHudunInfo(num1, num2) {
		return [num1, num2];
	}

	public postAssignsReward(bytes: GameByteArray): void {
		this.getModel().guildWarRank = bytes.readInt();
		this.getModel().canSendReward = bytes.readBoolean();
		this.getModel().rewardFlag = bytes.readByte();
	}

	public sendFenReward(num: number, list: any): void {
		let numList: any[] = this.getModel().sendNumList;
		let bytes: GameByteArray = this.getBytes(20);
		bytes.writeInt(num);
		for (let i: number = 1; i <= num; i++) {
			bytes.writeInt(i);
			let index: number = i - 1;
			let len: number = list[index].length;
			bytes.writeInt(len);
			for (let k: number = 0; k < len; k++) {
				let data: GuildMemberInfo = list[index][k] as GuildMemberInfo;
				bytes.writeInt(data.roleID);
				bytes.writeInt(numList[index][k]);
			}
		}
		this.sendToServer(bytes);
	}

	public postSendRewardSuccess(bytes: GameByteArray): void {
		if (bytes.readBoolean()) {
			ViewManager.ins().close(SelectMemberRewardWin);
			this.getModel().canSendReward = false;
			UserTips.ins().showTips("奖励已分配完");
		}
	}

	public postWinGuildInfo(bytes: GameByteArray): void {
		if (!this.getModel().winGuildInfo) {
			this.getModel().winGuildInfo = new WinGuildInfo();
		}
		this.getModel().winGuildInfo.parse(bytes);
	}

	public postGuildWarStarInfo(bytes: GameByteArray): void {
		this.getModel().isWatStart = bytes.readBoolean();
		this.getModel().startTime = bytes.readInt();
		this.getModel().acEndTime = bytes.readInt();
	}

	/**城门 护盾剩余百分比 */
	public doGuildWarDoorHuDun(bytes: GameByteArray): void {
		UserBoss.ins().curShield = bytes.readInt();
		UserBoss.ins().postShieldPer();
	}

	//抽奖信息
	public doLotteryInfo(bytes: GameByteArray): void {
		UserBoss.ins().worldPrize = bytes.readInt();
		ViewManager.ins().open(WorldBossJiangLiWin, 1);
	}

	/**
	 *  25  参与抽奖
	 */
	public sendPlayLotteryInfo(): void {
		let bytes: GameByteArray = this.getBytes(25);
		this.sendToServer(bytes);
	}

	/**
	 *  排行榜 前三变化
	 */
	public doRankInfoChange(bytes: GameByteArray): void {
		this.getModel().rankListChange(bytes);
	}

	public doChangeAttrHandle(bytes: GameByteArray): void {
		if (GameMap.fbType != 14) {
			return;
		}
		let handle = bytes.readDouble();
		if (!(this.getModel().attHandle == handle)) {
			this.getModel().attHandle = handle;
			EntityManager.ins().showHideSomeOne(handle);
			debug.log("add-----------:" + handle)
		}
		this.postWeixieChange(1);
	}

	public postWeixieChange(b: number) {
		return b;
	}

	/**仙盟红点 */
	public postGuildRedPointChange(b: boolean) {
		return b;
	}

	public doChangeShowList(bytes: GameByteArray): void {
		//移除实体时  检测一下是否在天盟争霸活动的威胁列表中 或者 可攻击列表中
		if (GameMap.fbType != 14) {
			return;
		}
		let handle: number = bytes.readDouble();
		this.getModel().changeWeiXieList(handle, false);
		this.getModel().changecanPlayList(handle, false);
		this.getModel().setMyGuildNum(handle, false);
		if (this.getModel().attHandle && this.getModel().attHandle == handle) {
			//攻击目标 移除的时候 清掉handel
			this.getModel().attHandle = 0;
			debug.log("cancel------------:" + handle)
		}
	}

	public doPointRewardInfo(bytes: GameByteArray): void {
		this.getModel().decodePointRewardInfo(bytes);
	}

	/**
	 *  30 请求积分奖励
	 */
	public sendPointReward(): void {
		let bytes: GameByteArray = this.getBytes(30);
		this.sendToServer(bytes);
	}

	/**
	 *  31 城门倒计时
	 */
	public doDoorEndtime(bytes: GameByteArray): void {
		this.getModel().doEndDoorTime(bytes.readByte());
	}

	/**自己的抽奖点数  25*/
	public doGetMyPoint(bytes: GameByteArray): void {
		// this.postLotteryPoint(bytes.readShort());
		let ran: number = bytes.readShort();
		UserBoss.ins().postLotteryRan(ran);
	}

	public postLotteryPoint(n: number): number {
		return n;
	}

	/**抽奖最高点数 32*/
	public doTalkMaxPoint(bytes: GameByteArray): void {
		let point: number = bytes.readInt();
		let name: string = bytes.readString();
		UserBoss.ins().postLotteryResult(name, point);
		// egret.log("iii:" + name)
	}

	/**击杀数*/
	public postKillHuman(bytes: GameByteArray):number{
		let kill: number = bytes.readInt();
		return kill;
	}

	/**
	 * 合服活动归属仙盟名称
	 * 40-34
	 * */
	public GuildNameBelongs:string[];//归属名称
	public postHeFuBelong(bytes: GameByteArray):void{
		let len: number = bytes.readShort();
		this.GuildNameBelongs = [];
		for( let i = 0;i < len;i++ ){
			let belong: string = bytes.readString();
			this.GuildNameBelongs.push(belong);
		}
	}

	/**
	 * 获取合服活动归属仙盟名
	 * 40-34
	 */
	public sendHeFuBelong(){
		this.sendBaseProto(34);
	}

	public postLotteryMaxPost(str: string, n: number) {
		return [str, n]
	}

	public postMyRankChange() {

	}

	public postPointRewardChange() {

	}

	public postCanplayChange() {

	}

	public postRankListChange() {

	}

	public postGuildNumChange() {

	}

	public postSendListChange() {

	}

	public postRankInfo() {

	}
}

namespace GameSystem {
	export let  guildwar = GuildWar.ins.bind(GuildWar);
}