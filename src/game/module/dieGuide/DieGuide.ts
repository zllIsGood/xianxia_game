/**
 * 死亡引导类
 */
class DieGuide extends BaseSystem {
	public static Show    = 1;//显示过(包括第二角色)
	public static Show2   = 2;//第三角色


	public static RECHARGE = 1;
	public static VIP      = 2;
	public static FB       = 3;

	public resImg:string[] = ["lost_v5_jpg","lost_v7_jpg"];
	private isInitRecharge1:boolean;
	private isInitSetting:boolean;
	public static ins(): DieGuide {
		return super.ins() as DieGuide;
	}

	public constructor() {
		super();

		this.observe(Encounter.ins().postFightResult,this.postdieGuide);
		this.observe(Recharge.ins().postRecharge1Data,this.initRecharge1);
		this.observe(Setting.ins().postInitSetting,this.initSetting);


	}
	private initRecharge1(){
		this.isInitRecharge1 = true;
	}
	private initSetting(){
		this.isInitSetting = true;
	}
	/**
	 * 首死亡处理
	 * @param result 结果
	 * */
	public postdieGuide(result:number){
		//胜利
		if( result )
			return;
		//失败
		let dieTime:number = Setting.ins().getValue(ClientSet.diedFirstTime);
		if( !dieTime ){//设置首次死亡时间
			dieTime = Math.floor(new Date().getTime()/1000);
			Setting.ins().setValue(ClientSet.diedFirstTime,dieTime);
		}
		//首充后的抽次失败
		let rch:RechargeData = Recharge.ins().getRechargeData(0);
		if( rch.num ){
			dieTime = Setting.ins().getValue(ClientSet.diedFirstTime2);
			if( !dieTime ){//设置首充后的首次死亡时间
				dieTime = Math.floor(new Date().getTime()/1000);
				Setting.ins().setValue(ClientSet.diedFirstTime2,dieTime);
			}
		}

	}

	/**
	 * 副本红点死亡引导判定
	 * @param resetCount 扫荡次数
	 * @return boolean
	 * */
	public dieFbRedPoint(resetCount:number,fbId:number):boolean{
		//玩家是否达到开启副本条件条件
		let fbconfig:DailyFubenConfig = GlobalConfig.DailyFubenConfig[fbId];
		if( !fbconfig )
			return false;
		if( UserZs.ins().lv < fbconfig.zsLevel || Actor.level < fbconfig.levelLimit )
			return false;

		//是否点击过扫荡
		let timer:number = Setting.ins().getValue(ClientSet.FB);
		if( timer ){
			let index:number = fbId - 3000;
			if( (timer >> index) & 1 )
				return false;//已经触发过扫荡
		}

		//如果是同一天 则对首次死亡引导进行处理
		let dieTime:number = Setting.ins().getValue(ClientSet.diedFirstTime);
		if( !dieTime )
			return false;//未首次死亡过

		let curTime:number = Math.floor(new Date().getTime()/1000);//秒
		if( curTime > (DateUtils.getTodayZeroSecond(new Date(dieTime*1000)) + 60 * 60 * 24) )
			return false;//不是和首次死亡同一天

		if (resetCount > 0) {
			return true;
		}
		return false;
	}
	/**
	 * 是否弹出首充或vip引导页
	 *
	 * */
	public checkFirstChargeOrVIPWin(){
		if( !this.isInitRecharge1 || !this.isInitSetting)//没有经过初始化消息不进行检测
			return;
		if( UserFb.ins().pkGqboss )//闯关中
			return;
		let rch:RechargeData = Recharge.ins().getRechargeData(0);
		//未首充
		if( !rch.num ){
			//等级限制
			// if( UserTask.ins().taskTrace.id > 100005 ){
			// 	//弹出首充
			// 	let recharge:number = Setting.ins().getValue(ClientSet.recharge1);
			// 	if( !recharge ) {
			// 		let view: PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
			// 		if (view) {
			// 			view.setDieGuide(DieGuide.RECHARGE);
			// 		}
			// 		Setting.ins().setValue(ClientSet.recharge1,DieGuide.Show);
			// 		return;
			// 	}
			// }
			//首次死亡限制
			let dieTime:number = Setting.ins().getValue(ClientSet.diedFirstTime);
			if( dieTime && dieTime > 0){
				//弹出首充
				let recharge:number = Setting.ins().getValue(ClientSet.recharge2);
				if( !recharge ){
					let view:PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
					if( view ){
						view.setDieGuide(DieGuide.RECHARGE);
					}
					Setting.ins().setValue(ClientSet.recharge2,DieGuide.Show);
					return;
				}
			}

		}
		else{
			//已首充
			//首次死亡
			let dieTime:number = Setting.ins().getValue(ClientSet.diedFirstTime2);
			if( dieTime && dieTime > 0){
				if( UserVip.ins().lv < 6 ){
					//弹出VIP引导
					let vipGuide:number = Setting.ins().getValue(ClientSet.vip);
					if( !vipGuide ){
						let view:PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
						if( view ){
							view.setDieGuide(DieGuide.VIP);
						}
						Setting.ins().setValue(ClientSet.vip,DieGuide.Show);
						return;
					}
				}
			}
		}

	}

	/**
	 * 根据对应开启角色显示引导图片
	 * **/
	public getOpenRoles(){
		let id:number = Setting.ins().getValue(ClientSet.role);
		if( id == DieGuide.Show2 ){
			if ( SubRoles.ins().subRolesLen >= 3 )
				return "";
		}
		let len:number = 3;
		for( let i = 1;i < len;i++ ){
			let role:Role = SubRoles.ins().getSubRoleByIndex(i);
			if( !role ){
				if( !id ){
					Setting.ins().setValue(ClientSet.role,DieGuide.Show);
				}
				else if( id == DieGuide.Show && i == 2 ){
					Setting.ins().setValue(ClientSet.role,DieGuide.Show2);
				}
				// return `vipbn${i+1}_png`;
				return this.resImg[i-1];
			}
		}
		return "";
	}

	/***
	 * 设置扫荡位
	 */
	public setClick(fbID:number){
		let index:number = fbID - 3000;
		let timer:number = Setting.ins().getValue(ClientSet.FB);
		if( !timer )
			timer = 0;
		if( (timer >> index) & 1 )//已点击过
			return;
		timer = timer | 1 << index;
		Setting.ins().setValue(ClientSet.FB,timer);
	}
	//材料副本全部满标记位
	public setMaxFb(sweeps:number[]){
		let timer:number = Setting.ins().getValue(ClientSet.FB);
		for( let i = 0;i < sweeps.length;i++ ){
			if( sweeps[i] > 3000 ){
				let index = sweeps[i] - 3000;
				if( (timer >> index) & 1 )
					continue;
				timer = timer | 1 << index;
				//获取材料副本已通关列表 算出通关标记位状态
				Setting.ins().setValue(ClientSet.FB,timer);
			}
		}
	}


}
namespace GameSystem {
	export let dieGuide = DieGuide.ins.bind(DieGuide);
}
