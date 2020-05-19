/**
 * Created by hjh on 2017/8/26.
 */
class MillionaireData extends BaseClass {

	public dice:number;//剩余筛子数
	public gridId:number;//当前格子索引
	public round:number;//当前玩过了第几圈(不包括当前正在玩的)
	public roundReward:number;//圈数奖励已领标记位
	public randomGridById:number;//踩中全盘随机奖励的格仔(最新踩中的随机命运格子id)
	public randomGridByRewardId:number;//踩中全盘随机奖励的格仔中的奖励索引(随机命运配置表中奖励param的数组索引)
	public rewardIdByGrids:number[];//随机到的奖励索引数组


	public isStrideStart:number;//是否跨越了起点,1是,0否
	public dicePoint:number;//摇到的点数(1-6)

	public autoTurnDice:number;//勾选了不弹出提示框
	public isAutoGo:boolean;//自动扔骰子
	constructor() {
		super();
		this.dice = 0;
		this.gridId = 0;
		this.round = 0;
		this.roundReward = 0;
		this.randomGridById = 0;
		this.randomGridByRewardId = 0;
		this.rewardIdByGrids = [];
		this.isStrideStart = 0;
		this.dicePoint = 0;
		this.autoTurnDice = 0;
		this.isAutoGo = false;
	}
	static ins():MillionaireData {
		return super.ins() as MillionaireData;
	}


	/**
	 * 57-1
	 * @param short 剩余骰子数
	 * @param short 当前所在位置索引
	 * @param short 已经玩到第几圈
	 * @param int   圈数奖励已领标记位
	 * @param short   踩中全盘随机奖励的格仔,0表示没有(是否踩中随机命运 即最新踩中的随机命运格子id)
	 * @param unsigned char(readUnsignedByte) 踩中全盘随机奖励的格仔中的奖励索引,0表示没有(踩中随机命运后变化的奖励 包括所有奖励)
	 * @param short 棋盘格子数量(下面数组数量)
	 * @param array Byte(Short)  随机到的奖励索引, 特殊格仔为0, -1表示已经踩过
	 */
	parser(bytes:GameByteArray) {
		this.dice        = bytes.readShort();
		this.gridId      = bytes.readShort();
		this.round       = bytes.readShort();
		this.roundReward = bytes.readInt();
		this.randomGridById = bytes.readShort();
		this.randomGridByRewardId = bytes.readUnsignedByte();
		let gridSum     = bytes.readShort();
		for( let i = 1;i <= gridSum;i++ ){//服务器发回来奖励索引从1开始
			let reward = bytes.readShort();
			this.rewardIdByGrids[i] = reward;
		}
		// egret.log("***************57-1****************");
		// egret.log("当前剩余骰子: "+this.dice);
		// egret.log("当前所在格子: "+this.gridId);
		// egret.log("当前已走圈数: "+this.round);
		// egret.log("圈数奖励标记: "+this.roundReward);
		// egret.log("当前当前已踩随机命运: "+this.randomGridById);
		// egret.log("当前当前已踩随机命运奖励索引: "+this.randomGridByRewardId);
		let cfg:RichManGridConfig = GlobalConfig.RichManGridConfig[this.gridId];
		if( cfg && cfg.action == 2 ){
			// egret.log("当前格子是随机命运格子");
		}

	}

	/**
	 * 57-2
	 * @param unsigned char 是否跨越了起点,1是,0否
	 * @param short 当前最新的位置
	 * @param unsigned char 摇到的点数(1-6)
	 * @param short 剩余骰子数
	 */
	parserTurnDice(bytes:GameByteArray){
		this.isStrideStart = bytes.readUnsignedByte();
		this.gridId        = bytes.readShort();
		this.dicePoint     = bytes.readUnsignedByte();
		// this.dice        = bytes.readShort();
		// egret.log("***************57-2****************");
		// egret.log("是否跨越了起点: "+this.isStrideStart);
		// egret.log("当前最新的位置: "+this.gridId);
		// egret.log("摇到的点数: "+this.dicePoint);
		// egret.log("当前剩余骰子: "+this.dice);
	}

	/**
	 * 57-3
	 * @param unsigned char 配置的索引
	 * @param int 圈数奖励已领标记位
	 */
	parserRoundReward(bytes:GameByteArray){
		this.roundReward = bytes.readInt();
		// egret.log("***************57-3****************");
		// egret.log("圈数奖励已领标记位: "+this.roundReward);
	}

	/**
	 * 57-4
	 * @param unsigned char 踩中全盘随机奖励的格仔
	 * @param int 踩中全盘随机奖励的格仔中的奖励索引(配置表中param的数组索引)
	 */
	parserOverAllReward(bytes:GameByteArray){
		this.randomGridById = bytes.readShort();
		this.randomGridByRewardId = bytes.readUnsignedByte();
		// egret.log("***************57-4****************");
		// egret.log("当前当前已踩随机命运: "+this.randomGridById);
		// egret.log("当前当前已踩随机命运奖励索引: "+this.randomGridByRewardId);
	}

	/**
	 * 57-4
	 * @param unsigned char 踩中全盘随机奖励的格仔
	 * @param int 踩中全盘随机奖励的格仔中的奖励索引(配置表中param的数组索引)
	 */
	parserMillionaireUpdate(bytes:GameByteArray){
		this.dice        = bytes.readShort();
		this.round       = bytes.readShort();
		this.roundReward = bytes.readInt();
		// egret.log("***************57-5****************");
		// egret.log("骰子更新剩余数: "+this.dice);
		// egret.log("当前已走圈数: "+this.round);
		// egret.log("圈数奖励标记: "+this.roundReward);
	}

	/** 红点 **/
	public getRedPoint():boolean{
		if( !MillionaireWin.isOpen() )
			return false;
		if( this.dice > 0 )
			return true;
		for( let k in GlobalConfig.RichManRoundAwardConfig ){
			//奖励未领取
			if( !(this.roundReward >> Number(k) & 1) ){
				//判断奖励圈数
				if( this.round >= GlobalConfig.RichManRoundAwardConfig[k].round )
					return true;
			}
		}

		return false;
	}
}
