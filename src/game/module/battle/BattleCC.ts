class BattleCC extends BaseSystem {

	/** 阵营战 */
	private _isBattle: boolean;

	/** 阵营 1为冰，2 为火*/
	public camp: number;

	private _leftTime: number = 0;

	/** 排行数据 */
	public battleRanks: Array<BattleRankVo> = [];

	public myRank: number = 0;

	public myScore: number = 0;

	/** 奖励状态  已领取的id，为0表示都没领取过*/
	public awardID: number = 0;

	/** 寻路到npc标识 */
	public gotoNpc: boolean;

	/** 活动是否开启 */
	public isOpen: boolean;

	/** 开启倒计时 */
	private _openLeftTime: number = 0;

	private _openTimer: number = 0;

	/** 进入CD */
	private _enterCD: number = 0;

	private _enterCDTimer: number = 0;

	/** 切换阵营倒计时 */
	private _changeTime:number = 0;

	/** 切换阵营3秒倒计时 */
	private _changeLittle:number = 0;

	constructor() {
		super();
		this.sysId = PackageID.Battle;

		this.observe(GameLogic.ins().postEnterMap, this.mapChange);

		this.regNetMsg(1, this.joinResult); //进入阵营结果
		this.regNetMsg(2, this.doRank); //排行数据
		this.regNetMsg(3, this.doOpen); //活动开启
		this.regNetMsg(4, this.doRelive); //复活
		this.regNetMsg(5, this.getAwardResult); //领取奖励结果
		this.regNetMsg(6, this.doAwardInfo); //奖励信息
		this.regNetMsg(7, this.doMyScore); //自己的积分
		this.regNetMsg(10, this.doMyRank); //个人排行积分变更
		this.regNetMsg(11, this.doEnterCD); //进入CD
		this.regNetMsg(12, this.doGameOver); //活动结束
		this.regNetMsg(13, this.postLittleChange); //切换阵营3秒倒计时
		this.regNetMsg(14, this.postChangeTime); //切换阵营倒计时
	}

	private mapChange(): void {
		if (GameMap.fubenID == GlobalConfig.CampBattleConfig.fbId)
			this.enterBattle();

		if (this._isBattle && GameMap.fubenID != GlobalConfig.CampBattleConfig.fbId)
			this.escBattle();

		if (this.gotoNpc && GameMap.fbType == UserFb.FB_TYPE_CITY) {
			this.gotoNpc = false;
			GameMap.myMoveTo(GlobalConfig.CampBattleConfig.npcPos[0] * GameMap.CELL_SIZE, GlobalConfig.CampBattleConfig.npcPos[1] * GameMap.CELL_SIZE, this.findComplete);
			GameMap.moveTo(GlobalConfig.CampBattleConfig.npcPos[0] * GameMap.CELL_SIZE, GlobalConfig.CampBattleConfig.npcPos[1] * GameMap.CELL_SIZE);
		}
	}

	public findComplete(): void {
		ViewManager.ins().open(BattleNpcTipWin);
	}

	public static ins(): BattleCC {
		return super.ins() as BattleCC;
	}

	public isBattle(): boolean {
		return this._isBattle;
	}

	/** 参与阵营战  61-1*/
	public joinBattle(): void {
		this.sendBaseProto(1);
	}

	/** 61-1 */
	private joinResult(bytes: GameByteArray): void {
		this.camp = bytes.readShort();
		this._leftTime = DateUtils.formatMiniDateTime(bytes.readInt());
		this.postEnterSuccess();
	}

	public postEnterSuccess(): void {

	}

	/** 61-2 */
	private doRank(bytes: GameByteArray): void {
		var len: number = bytes.readInt();
		this.battleRanks.length = len;
		var vo: BattleRankVo;
		for (var i: number = 0; i < len; i++) {
			vo = this.battleRanks[i];
			if (!vo) {
				vo = new BattleRankVo();
				this.battleRanks[i] = vo;
			}

			vo.parse(bytes);
		}

		this.postRankInfo();
	}

	private doOpen(bytes: GameByteArray): void {
		this.isOpen = bytes.readBoolean();
		this._openLeftTime = bytes.readInt();
		this._openTimer = egret.getTimer();
		this.postOpenInfo();
	}

	private doRelive(bytes: GameByteArray): void {
		UserBoss.ins().reliveTime = bytes.readInt();
		UserBoss.ins().killerHandler = bytes.readDouble();

		if (UserBoss.ins().reliveTime > 0) {
			UserBoss.ins().clearWorldBossList();
			ViewManager.ins().open(WorldBossBeKillWin);
		}
		else
			ViewManager.ins().close(WorldBossBeKillWin);
	}

	public postOpenInfo(): void {

	}

	/** 获得开启剩余时间 */
	public getOpenLeftTime(): number {
		return this._openLeftTime - (egret.getTimer() - this._openTimer) / 1000;
	}

	/** 获得前几名 */
	public getRankTop(len: number = 3): Array<BattleRankVo> {
		if (this.battleRanks)
			return this.battleRanks.slice(0, len);

		return null;
	}

	public postRankInfo(): void {

	}

	/** 活动剩余时间s */
	public getLeftTime(): number {
		return Math.floor((this._leftTime - GameServer.serverTime) / 1000);
	}

	/** 进入阵营 */
	private enterBattle(): void {
		this._isBattle = true;
		if (!ViewManager.ins().isShow(BattleWin))
			ViewManager.ins().open(BattleWin);
		
		ViewManager.ins().close(BattleNpcTipWin);
		TargetListCC.ins().attackMeHandles.length = 0;
		TargetListCC.ins().canAttackHandles.length = 0;
		ViewManager.ins().open(TargetListPanel);
	}

	/** 离开阵营 */
	private escBattle(): void {
		this._isBattle = false;
		ViewManager.ins().close(BattleWin);

		//离开副本刷新下玩家名字(修复玩家离开副本红名bug)
		let roleList: CharRole[] = EntityManager.ins().getEntitysBymasterhHandle(Actor.handle, EntityType.Role);
		if (roleList && roleList.length > 0)
		{
			let len:number = roleList.length;
			let role:CharRole;
			for (let i:number = 0; i < len; i++)
			{
				role = roleList[i];
				if (role && role.infoModel)
				{
					role.setCharName((role.infoModel as Role).guildAndName);
					role.updateNameColor();
				}		
			}
		}
	}

	/** 原地复活 61-4*/
	public sendReLive(): void {
		this.sendBaseProto(4);
	}

	/** 获得自己积分奖励  61-5*/
	public getMyAward(): void {
		this.sendBaseProto(5);
	}

	/** 61-5 */
	private getAwardResult(bytes: GameByteArray): void {
		if (bytes.readBoolean()) //领取成功
		{

		}
	}

	/** 61-6 */
	private doAwardInfo(bytes: GameByteArray): void {
		this.awardID = bytes.readInt();
		this.postGiftInfo();
	}

	public postGiftInfo(): void {

	}

	/** 61-7 */
	private doMyScore(bytes: GameByteArray): void {
		this.myScore = bytes.readInt();
		var change:number = bytes.readInt();
		var roleName:string = bytes.readString();

		var str:string;
		switch(bytes.readUnsignedByte())
		{
			case 1:
				str = `成功击杀|C:0x00ff00&T:${roleName}|，积分+|C:0x00ff00&T:${change}|`;
			   break;
			case 2:
				str = `助攻击杀|C:0x00ff00&T:${roleName}|，积分+|C:0x00ff00&T:${change}|`;
			   break;
			case 3:
				str = `被|C:0x00ff00&T:${roleName}|击杀，积分-|C:0x00ff00&T:${change}|`;
			   break;
			case 4:
				str = `获得持续参与奖，积分+|C:0x00ff00&T:${change}|`;
			   break;
			case 5:
				str = `杀怪获得积分+|C:0x00ff00&T:${change}|`;
				break;
		}

		if (str)
			UserTips.ins().showTips(str);

		this.postScoreChange();
	}

	/** 61-10 */
	private doMyRank(bytes: GameByteArray): void {
		this.myRank = bytes.readInt();
		this.myScore = bytes.readInt();
		this.postScoreChange();
	}

	/** 个人积分变更 */
	public postScoreChange(): void {

	}

	private doEnterCD(bytes: GameByteArray): void {
		this._enterCD = bytes.readInt();
		this._enterCDTimer = egret.getTimer();
	}

	private doGameOver(bytes: GameByteArray): void {
		ViewManager.ins().open(BattleResultWin);
	}

	/** 阵营切换3秒倒计时 */
	public postLittleChange(bytes:GameByteArray):void
	{
		this._changeLittle = DateUtils.formatMiniDateTime(bytes.readInt());
	}

	public getChangeLittleTime():number
	{
		return Math.floor((this._changeLittle - GameServer.serverTime) / 1000);
	}

	/** 阵营战玩家是否可以移动 */
	public canMove():boolean
	{
		return this.getChangeLittleTime() <= 0;
	}

	/** 阵营切换时间 */
	public postChangeTime(bytes:GameByteArray):void
	{
		this._changeTime = DateUtils.formatMiniDateTime(bytes.readInt());
	}

	public getChangeTime():number
	{
		return Math.floor((this._changeTime - GameServer.serverTime) / 1000);
	}

	/** 进入CD */
	public getEnterCD(): number {
		return Math.ceil(this._enterCD - (egret.getTimer() - this._enterCDTimer) / 1000);
	}

	/** 检测红点 */
	public checkRedPoint(): boolean {
		return this.isOpen && Actor.level >= GlobalConfig.CampBattleConfig.openLevel;
	}
}

namespace GameSystem {
	export let  battlecc = BattleCC.ins.bind(BattleCC);
}
