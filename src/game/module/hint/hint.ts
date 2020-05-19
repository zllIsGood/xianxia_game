/**
 * 提示模块
 */
class Hint extends BaseSystem {
	public static TARTYPE_WELCOME = 1;//欢迎页
	public static TARTYPE_ACH_BEF = 2;//成就表任务完成前
	public static TARTYPE_ACH_AFT = 3;//成就表任务完成后
	public static TARTYPE_SCE_IN  = 4;//场景表进入副本
	public static TARTYPE_KILL_BOSS  = 5;//击杀某个boss
	constructor() {
		super();

		this.observe(GameLogic.ins().postEnterMap, this.postSeceneIn);
		// this.observe(UserBag.ins().postItemChange, this.postAchievementBef);
		// this.observe(UserBag.ins().postItemChange, this.postAchievementAft);
		// this.observe(UserBag.ins().postItemChange, this.postAchievementAft);
	}
	public static ins(): Hint {
		return super.ins() as Hint;
	}

	private checkHint(cfg?:any,targetType?:number,config?:any,parma?:any):boolean{
		if(!cfg){
			switch (targetType){
				case Hint.TARTYPE_WELCOME:
					this.showHint(targetType);
					return true;
				case Hint.TARTYPE_KILL_BOSS:
					// if( this.killType == 1 && this.picKillBoss){
					// 	this.showHint(targetType,this.picKillBoss);
					// 	this.picKillBoss = ""
					// 	this.killType = 0;
					// 	return true;
					// }
					for (var key in GlobalConfig.HintConfig) {
						let hcf: HintConfig = GlobalConfig.HintConfig[key];
						if( hcf.target[0].guanqiaId == parma.gqid ){
							this.showHint(targetType,hcf.image);
							return true;
						}
					}
					break;
			}
			return false;
		}
		if( cfg ){
			let pic:string = this.HitConfig(cfg,targetType);
			if( pic != null ){
				this.showHint(targetType,pic);
				return true;
			}
		}else{
			for (var key in config) {
				let cfg = config[key];
				let pic:string = this.HitConfig(cfg,targetType);
				if( pic != null ){
					this.showHint(targetType,pic);
					return true;
				}
			}
		}

		return false;
	}
	private HitConfig(data?:any,targetType?:number): string {
		// let cfg: AchievementTaskConfig | SceneConfig;
		let cfg:any = data;
		// if( data instanceof SceneConfig)
		// 	cfg = data as SceneConfig;
		// else
		// 	cfg = data as AchievementTaskConfig;


		for (var key in GlobalConfig.HintConfig) {
			let hcf: HintConfig = GlobalConfig.HintConfig[key];
			if( hcf.targetType != targetType ) continue;
			switch (targetType){
				case Hint.TARTYPE_ACH_BEF:
					if (cfg.achievementId == hcf.target[0].achievementId &&
						cfg.taskId == hcf.target[0].taskId )
						if( hcf.target[0].isfull && hcf.target[0].isfull > 0 && UserBag.ins().getSurplusCount() )//判断背包是否已满
							return hcf.image;
					break;
				case Hint.TARTYPE_ACH_AFT:
					if (cfg.achievementId == hcf.target[0].achievementId &&
						cfg.taskId == hcf.target[0].taskId )
						return hcf.image;
					break;
				case Hint.TARTYPE_SCE_IN:
					if( GameMap.mapID == hcf.target[0].sceneid &&
						GameMap.fubenID == hcf.target[0].fbId &&
						this.presceneid == hcf.target[0].presceneid &&
						this.prefbId == hcf.target[0].prefbId
					)
						return hcf.image;
					break;
				// case Hint.TARTYPE_KILL_BOSS:
				// 	if (cfg.achievementId == hcf.target[0].achievementId &&
				// 		cfg.taskId == hcf.target[0].taskId ){
				// 		this.killType = 1;
				// 		this.picKillBoss = hcf.image;
				// 		return null;
				// 	}
				// 	break;
			}
		}

		return null;
	}

	private showHint(targetType:number,pic?:string):void{
		// let pic = "";
		if( !pic && targetType == Hint.TARTYPE_WELCOME ){
			let cfg = GlobalConfig.HintConfig[1];
			pic = cfg.image;
			UserTips.ins().showHintTips(pic);
			return;
		}

		// for (var key in GlobalConfig.HintConfig) {
		// 	let cfg = GlobalConfig.HintConfig[key];
		// 	if( cfg.targetType == targetType ){
		// 		let cfg_sceneid:number = -1;
		// 		let cfg_achievementId:number = -1;
		// 		let cfg_taskId:number = -1;
		// 		//表数据
		// 		for (var k in cfg.target) {
		// 			let htd:HintTargetData = cfg.target[k];
		// 			cfg_sceneid       = htd.sceneid;
		// 			cfg_achievementId = cfg_achievementId;
		// 			cfg_taskId        = htd.taskId;
		// 			break;//只有1个数据
		// 		}
		// 		//当前被判定数据
		// 		let isCondition = true;//是否符合条件
		// 		for (var k in target) {
		// 			let htd:HintTargetData = target[k];
		// 			if( cfg_sceneid != -1 && cfg_sceneid != htd.sceneid){
		// 				isCondition = false;
		// 				break;
		// 			}
		// 			if( cfg_achievementId != -1 && cfg_sceneid != htd.achievementId){
		// 				isCondition = false;
		// 				break;
		// 			}
		// 			if( cfg_taskId != -1 && cfg_sceneid != htd.taskId){
		// 				isCondition = false;
		// 				break;
		// 			}
		// 			break;//只有1个数据
		// 		}
		// 		if( !isCondition )
		// 			continue;
        //
		// 		pic = cfg.image;
		// 		break;
		// 	}
		// }
		if( pic && pic != "" )
			UserTips.ins().showHintTips(pic);
	}

	/**
	 * ////////////////////////派发条件回调//////////////////////////////
	 */
	/**
	 * 欢迎页
	 */
	public postWelcome():void{
		this.checkHint(null,Hint.TARTYPE_WELCOME);
	}
	/**
	 * 接收任务
	 * @param cfg
	 */
	public postAchievementBef(cfg?:AchievementTaskConfig):void{
		// let cfg: AchievementTaskConfig;
		// if( id ){
		// 	cfg = GlobalConfig.AchievementTaskConfig[id];
		// }
		if( !cfg ){
			return;
		}
		this.checkHint(cfg,Hint.TARTYPE_ACH_BEF);
	}

	/**
	 * 任务完成后
	 * @param ad
	 */
	public postAchievementAft(ad?:AchievementData):void{
		if( !ad ){
			return;
		}
		let cfg:AchievementTaskConfig;
		//任务的唯一性: achievementId taskId共同决定
		for (var key in GlobalConfig.AchievementTaskConfig) {
			let dcfg = GlobalConfig.AchievementTaskConfig[key];
			if( dcfg.achievementId == ad.achievementId && dcfg.taskId == ad.id ){
				cfg = dcfg;
				break;
			}
		}
		if( !cfg ){
			return;
		}
		this.checkHint(cfg,Hint.TARTYPE_ACH_AFT);
	}

	/**
	 * 进入场景
	 */
	private presceneid = -1;
	private prefbId = -1;
	public postSeceneIn():void{
		// egret.log("GameMap.fubenID = "+GameMap.fubenID);
		//记录上一次场景Id是为了要通过上下文 知道玩家当前地图的确切场景位置
		//例如:玩家进入新地图矿洞 需要知道上一次是打完boss 这一次进入新地图普通关卡
		if( this.presceneid == -1 )
			this.presceneid = GameMap.mapID;
		if( this.prefbId == -1 )
			this.prefbId = GameMap.fubenID;

		let cfg:ScenesConfig = GlobalConfig.ScenesConfig[GameMap.mapID];
		if( !cfg ){
			return;
		}
		this.checkHint(cfg,Hint.TARTYPE_SCE_IN);
		//检测完后把上一次值重置为当前值 便于下一次使用
		this.presceneid = GameMap.mapID;
		this.prefbId = GameMap.fubenID;
	}

	/**
	 * 击杀某个怪物
	 */
	private killType:number = 0;//0:没触发打boss 1:触发打boss
	private picKillBoss:string = "";
	public postKillBoss(cfg?:AchievementTaskConfig):void{

		this.checkHint(cfg,Hint.TARTYPE_KILL_BOSS);
	}
	public postKillBossEx(guanqiaId:number):void{

		this.checkHint(null,Hint.TARTYPE_KILL_BOSS,null,{gqid:guanqiaId});
	}

}

namespace GameSystem {
	export let  hint = Hint.ins.bind(Hint);
}