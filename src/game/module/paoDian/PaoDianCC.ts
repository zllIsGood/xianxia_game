class PaoDianCC extends BaseSystem{
	
		/** 泡点 */
	private _isPaoDian: boolean;

	/** 寻路到npc标识 */
	public gotoNpc: boolean;

	/** 活动是否开启 */
	private _isOpen: boolean;

	/** 开启倒计时 */
	private _openLeftTime: number = 0;

	private _openTimer: number = 0;

	/** 进入CD */
	private _enterCD: number = 0;

	private _enterCDTimer: number = 0;

	/** 归属者信息 */
	private _belongs:{id:number, handler:number}[];

	/** 活动结束时间戳 */
	private _leftTime: number = 0;

	/** 当前区域 */
	private _areaId:number = 0;

	/** 累计神兵经验 */
	private _shenBingExp:number = 0;

	/** 玉佩碎片 */
	private _jadeChips:number = 0;

	public constructor() {
		super();
		this.sysId = PackageID.PaoDian;

		this.observe(GameLogic.ins().postEnterMap, this.mapChange);

		this.regNetMsg(1, this.postEnterSuccess);
		this.regNetMsg(2, this.postBelongChange);
		this.regNetMsg(3, this.doEnterCD);
		this.regNetMsg(4, this.postOpenInfo);
		this.regNetMsg(5, this.doRelive);
		this.regNetMsg(6, this.postMyInfo);
		this.regNetMsg(7, this.postAreaChange);
		this.regNetMsg(8, this.doResult);
	}

	public get areaId():number
	{
		return this._areaId;
	}

	public get shenBingExp():number
	{
		return this._shenBingExp;
	}

	public get jadeChips():number
	{
		return this._jadeChips;
	}

	private mapChange(): void 
	{
		if (GameMap.fubenID == GlobalConfig.PassionPointConfig.fbId)
			this.enterBattle();

		if (this._isPaoDian && GameMap.fubenID != GlobalConfig.PassionPointConfig.fbId)
			this.escBattle();

		if (this.gotoNpc && GameMap.fbType == UserFb.FB_TYPE_CITY) {
			this.gotoNpc = false;
			GameMap.myMoveTo(GlobalConfig.PassionPointConfig.npcPos[0] * GameMap.CELL_SIZE, GlobalConfig.PassionPointConfig.npcPos[1] * GameMap.CELL_SIZE, this.findComplete);
			GameMap.moveTo(GlobalConfig.PassionPointConfig.npcPos[0] * GameMap.CELL_SIZE, GlobalConfig.PassionPointConfig.npcPos[1] * GameMap.CELL_SIZE);
		}
	}

	public findComplete(): void {
		ViewManager.ins().open(PaoDianNpcTalkWin);
	}

	/** 进入泡点 */
	private enterBattle(): void {
		this._isPaoDian = true;
		if (!ViewManager.ins().isShow(PaoDianWin))
			ViewManager.ins().open(PaoDianWin);
		
		ViewManager.ins().close(PaoDianNpcTalkWin);
		TargetListCC.ins().attackMeHandles.length = 0;
		TargetListCC.ins().canAttackHandles.length = 0;
		ViewManager.ins().open(TargetListPanel);
	}

	/** 离开泡点*/
	private escBattle(): void {
		this._isPaoDian = false;
		ViewManager.ins().close(PaoDianWin);
	}

	public static ins(): PaoDianCC {
		return super.ins() as PaoDianCC;
	}

	public get isPaoDian(): boolean {
		return this._isPaoDian;
	}

	public get isOpen():boolean
	{
		return this._isOpen;
	}

	/** 进入副本 */
	public enterPaoDian():void
	{
		this.sendBaseProto(1);
	}

	public postEnterSuccess(bytes:GameByteArray):void
	{
		this._leftTime = (bytes.readInt() + DateUtils.SECOND_2010) * 1000;
	}

	/** 活动剩余时间s */
	public getLeftTime(): number {
		return Math.floor((this._leftTime - GameServer.serverTime) / 1000);
	}

	/** 归属信息变更 */
	public postBelongChange(bytes:GameByteArray):void
	{
		this._belongs = [];
		let len:number = bytes.readInt();
		this._belongs.length = len;
		for (let i:number = 0; i < len; i++)
			this._belongs[i] = {id:bytes.readShort(), handler:bytes.readDouble()};
	}

	//进入CD
	private doEnterCD(bytes: GameByteArray): void {
		this._enterCD = bytes.readInt();
		this._enterCDTimer = egret.getTimer();
	}

	/** 进入CD */
	public getEnterCD(): number {
		return Math.ceil(this._enterCD - (egret.getTimer() - this._enterCDTimer) / 1000);
	}

	public postOpenInfo(bytes:GameByteArray):void
	{
		this._isOpen = bytes.readBoolean();
		this._openLeftTime = bytes.readInt();
		this._openTimer = egret.getTimer();
	}

	/** 获得开启剩余时间 */
	public getOpenLeftTime(): number {
		return this._openLeftTime - (egret.getTimer() - this._openTimer) / 1000;
	}

	/** 原地复活 62-5*/
	public sendReLive(): void {
		this.sendBaseProto(5);
	}

	/** 复活 */
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

	/** 查看自己信息 */
	public sendCheckMyInfo():void
	{
		this.sendBaseProto(6);
	}

	/** 个人信息 */
	public postMyInfo(bytes:GameByteArray):void
	{
		this._shenBingExp = bytes.readInt();
		this._jadeChips = bytes.readInt();
	}

	/** 区域变更 */
	public postAreaChange(bytes:GameByteArray):void
	{
		this._areaId = bytes.readShort();
	}

	/**
	 * 结算
	 * 62-8
	*/
	private doResult(bytes:GameByteArray):void
	{
		let len:number = bytes.readInt();
		let list:Array<PaoDianRankVo> = [];
		list.length = len;
		for (let i:number = 0; i < len; i++)
			list[i] = new PaoDianRankVo(bytes);

		ViewManager.ins().open(PaoDianResultWin, list);
	}

	/** 检测红点 */
	public checkRedPoint(): boolean {
		return this.isOpen && (Actor.level + UserZs.ins().lv * 1000 >= GlobalConfig.PassionPointConfig.openLv);
	}

	/**
	 * 根据区域ID获得归属信息
	 * @param id 区域ID
	*/
	public getBelongById(id:number):{id:number, handler:number}
	{
		if (!this._belongs || this._belongs.length == 0)
			return null;
		
		let len:number = this._belongs.length;
		for (let i:number = 0; i < len; i++)
		{
			if (this._belongs[i].id == id)
				return this._belongs[i];
		}
			
		return null;
	}
}

namespace GameSystem{
	export let  paoDianCC = PaoDianCC.ins.bind(PaoDianCC);
}
