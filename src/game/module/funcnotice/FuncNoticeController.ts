/**
 * file: src/game/module/funcnotice/FuncNoticeController.ts
    date: 2018-9-17
    author: solace
    descript: 功能预告控制器
 */
class FuncNoticeController extends BaseSystem {

	/*功能预告数据*/
	private funcNoticeData: any = {}; 
	/*功能预告配置*/
	private funcConfig: FunOpenNoticeConfig; 

	public constructor() {
		super();

		this.funcConfig = GlobalConfig.FunOpenNoticeConfig;

		this.sysId = PackageID.FuncNotice;
		this.regNetMsg(1, this.post69001Event); 	//下发功能预告数据
		this.regNetMsg(2, this.post69002Event); 	//下发更新功能预告数据

		this.observe(UserTask.ins().postUpdteTaskTrace,this.checkTask); // 主线任务更新检测
		this.observe(UserZs.ins().postZsData,this.checkZSLv); // 转生等级更新检测
		this.observe(Actor.ins().postLevelChange,this.checkLv); // 等级更新检测
		this.observe(UserFb.ins().postGqIdChange,this.checkChapterLv); // 关卡更新检测
		this.observe(GameServer.ins().postServerOpenDay,this.checkOpenDay); // 开服天数更新检测
		GameServer.ins().postServerOpenDay //派发开服天数事件 
	}

	public static ins(): FuncNoticeController {
		return super.ins() as FuncNoticeController;
	}

	/**
	 * [post69001Event 下发功能预告数据]
	 * unsigned short 预告id数量
	 * array = {
	 * 	int           预告id
		unsigned char 状态 0:进行中 1:任务完成 2:已领取
	 * }
	 */
	public post69001Event(bytes: GameByteArray): void{
		this.funcNoticeData = {};
		this.funcNoticeData.funcCount = bytes.readShort();
		this.funcNoticeData.funcData = {};
		for (let i = 1; i <= this.funcNoticeData.funcCount; ++i) {
			if (this.funcConfig[i]) {
				let data: any = {};
				data.funcId = bytes.readInt();
				data.state = bytes.readByte();
				data.config = this.funcConfig[i];
				data.typeState = {}; // 功能开启类型状态,需要全部满足data.state才会更换状态为1
				data.typeState.zsLv = data.config.ZsLv?false:true; // 转生条件是否满足
				data.typeState.lv = data.config.Lv?false:true; // 等级条件是否满足
				data.typeState.chapterLv = data.config.ChapterLv?false:true; // 闯关条件是否满足
				data.typeState.openDay = data.config.openDay?false:true; // 开服天书条件是否满足
				data.typeState.task = data.config.achieveId&&data.config.taskId?false:true; // 任务条件是否满足
				this.funcNoticeData.funcData[data.funcId] = data;
			}
		}
		// console.log(GlobalConfig.FunOpenNoticeConfig);
		// console.log(this.funcNoticeData);
		this.checkTask();
		this.checkZSLv();
		this.checkLv();
		this.checkChapterLv();
		this.checkOpenDay();
		// console.log(this.funcNoticeData);
	}

	/**
	 * [post69002Event 下发更新功能预告数据]
	 * int 预告id
	 * unsigned char 状态 0:进行中 1:任务完成 2:已领取
	 */
	public post69002Event(bytes: GameByteArray): void{
		let id: number = bytes.readInt();
		let state: number = bytes.readByte();
		for (let key in this.funcNoticeData.funcData) {
			if (this.funcNoticeData.funcData[key].funcId == id){
				this.funcNoticeData.funcData[key].state = state;
			}
		}
		this.postFuncStateUpdate();
		// console.log(this.funcNoticeData);
	}

	/**
	 * [c69003 领取功能预告奖励]
	 * @param {number} id [功能预告id]
	 */
	public c69003(id: number): void{
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * [getFuncNoticeData 获取功能预告]
	 * @return {any} [this.funcNoticeData]
	 */
	public getFuncNoticeData(): any{
		return this.funcNoticeData;
	}

	/**
	 * [getFuncNoticeDataById 根据功能唤醒ID获取数据]
	 * @param {any} id [功能唤醒id]
	 */
	public getFuncNoticeDataById(id: number): any{
		return this.funcNoticeData[id];
	}

	/**
	 * [checkTask 检测任务]
	 */
	public checkTask(): void{
		let taskData: AchievementData = UserTask.ins().taskTrace
		let data: any;
		for (let key in this.funcNoticeData.funcData) {
			if (this.funcNoticeData.funcData[key].state != 2){
				data = this.funcNoticeData.funcData[key];
				if (data.config.achieveId && data.config.taskId){
					if (taskData.achievementId >= data.config.achieveId 
						&& taskData.id >= data.config.taskId
						&& taskData.state != 0){
						this.funcNoticeData.funcData[key].typeState.task = true;
						this.funcNoticeData.funcData[key].state = this.isDone(this.funcNoticeData.funcData[key].typeState,this.funcNoticeData.funcData[key].state);
					}
				}
			}
		}
		this.postFuncStateUpdate();
	}

	/**
	 * [checkZSLv 检测转生等级]
	 */
	public checkZSLv(): void{
		let data: any;
		for (let key in this.funcNoticeData.funcData) {
			if (this.funcNoticeData.funcData[key].state != 2){
				data = this.funcNoticeData.funcData[key];
				if (data.config.ZsLv){
					if (UserZs.ins().lv >= data.config.ZsLv){
						this.funcNoticeData.funcData[key].typeState.zsLv = true;
						this.funcNoticeData.funcData[key].state = this.isDone(this.funcNoticeData.funcData[key].typeState,this.funcNoticeData.funcData[key].state);
					}
				}
			}
		}
		this.postFuncStateUpdate();
	}

	/**
	 * [checkLv 检测等级]
	 */
	public checkLv(): void{
		let data: any;
		for (let key in this.funcNoticeData.funcData) {
			if (this.funcNoticeData.funcData[key].state != 2){
				data = this.funcNoticeData.funcData[key];
				if (data.config.Lv){
					if (Actor.level >= data.config.Lv){
						this.funcNoticeData.funcData[key].typeState.lv = true;
						this.funcNoticeData.funcData[key].state = this.isDone(this.funcNoticeData.funcData[key].typeState,this.funcNoticeData.funcData[key].state);
					}
				}
			}
		}	
		this.postFuncStateUpdate();	
	}

	/**
	 * [checkChapterLv 检测关卡]
	 */
	public checkChapterLv(): void{
		let data: any;
		for (let key in this.funcNoticeData.funcData) {
			if (this.funcNoticeData.funcData[key].state != 2){
				data = this.funcNoticeData.funcData[key];
				if (data.config.ChapterLv){
					if (UserFb.ins().guanqiaID >= data.config.ChapterLv){
						this.funcNoticeData.funcData[key].typeState.chapterLv = true;
						this.funcNoticeData.funcData[key].state = this.isDone(this.funcNoticeData.funcData[key].typeState,this.funcNoticeData.funcData[key].state);
					}
				}
			}
		}	
		this.postFuncStateUpdate();
	}

	/**
	 * [checkOpenDay 检测开服天数]
	 */
	public checkOpenDay(): void{
		let data: any;
		for (let key in this.funcNoticeData.funcData) {
			if (this.funcNoticeData.funcData[key].state != 2){
				data = this.funcNoticeData.funcData[key];
				if (data.config.openDay){
					if (GameServer.serverOpenDay >= data.config.openDay){
						this.funcNoticeData.funcData[key].typeState.openDay = true;
						this.funcNoticeData.funcData[key].state = this.isDone(this.funcNoticeData.funcData[key].typeState,this.funcNoticeData.funcData[key].state);
					}
				}
			}
		}
		this.postFuncStateUpdate();
	}

	/**
	 * [isAllFuncOpen 是否所有功能开启了]
	 * @return {boolean} [true/false]
	 */
	public isAllFuncOpen(): boolean{
		let isAllDone: boolean = true;
		for (let key in this.funcNoticeData.funcData) {
			if (this.funcNoticeData.funcData[key].state != 2){
				isAllDone = false;
				break;
			}
		}
		return isAllDone;
	}

	/**
	 * [isDone 检测功能开启任务类型是否全部完成]
	 * @param  {any}    typeState [this.funcNoticeData[key].typeState]
	 * @param  {number} state     [this.funcNoticeData[key].funcData.state]
	 * @return {number}           [0/1]
	 */
	private isDone(typeState: any,state: number): number{
		if (state==2){
			return 2;
		}
		let done: number = 1;
		for (let key in typeState) {
			if (!typeState[key]){
				done = 0;
				break;
			}
		}
		return done;
	}

	/**
	 * [postFuncStateUpdate 用于派发功能状态更新事件]
	 */
	public postFuncStateUpdate(): void{}
}

namespace GameSystem {
	export let  funcNoticeController = FuncNoticeController.ins.bind(FuncNoticeController);
}
