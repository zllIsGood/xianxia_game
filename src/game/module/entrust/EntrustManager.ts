/**
 * Created by MPeter on 2018/3/20.
 *  委托管理器 用于委托处理游戏中一些特殊的任务操作
 */
class EntrustManager extends BaseSystem {
	/**任务字典*/
	private taskDic: any;

	/**是否启动*/
	private isStart: boolean = false;

	public constructor() {
		super();
		this.taskDic = {};
	}

	/**开启委托管理器*/
	public start(): void {
		if (!this.isStart) {
			this.isStart = true;
			//开启后，添加一些必要的侦听
			this.observe(GameLogic.ins().syncMyPos, this.transferComplete);
		}
	}

	/**停止所有委托*/
	public stop(): void {
		this.taskDic = {};
		this.removeObserve();
		TimerManager.ins().removeAll(this);
	}

	/**注册委托任务
	 * @param type 委托任务类型
	 * @param doFun 委托事件方法
	 * @param isThrowErr 是否侦听重复委托错误抛出
	 *
	 * */
	public regEntrusTask(type: EntrustType, doFun, callobj, isThrowErr): void {
		if (isThrowErr && Assert(!this.taskDic[EntrustType.Transfer], `当前有委托传送任务，不能多线程或重复委托任务！ value=${doFun}`))return;

		this.start();
		switch (type) {
			case EntrustType.Transfer:
				this.transferTask(doFun, callobj);
				break;
		}
	}

	/**取消委托*/
	public cancelEntrusTask(type: EntrustType): void {
		this.taskDic[type] = null;
		delete this.taskDic[type];
	}

	/**传送任务委托*/
	private transferTask(doFun, callobj): void {
		this.taskDic[EntrustType.Transfer] = {"doFun": doFun, "callobj": callobj};
	}

	/**传送完毕*/
	private transferComplete(): void {
		let transTask = this.taskDic[EntrustType.Transfer];
		if (!transTask)return;
		//有委托传送任务方法，则执行委托方法
		if (transTask.doFun instanceof Function) {
			if (transTask.callobj) {
				transTask.doFun.bind(transTask.callobj)();
			}
			else {
				transTask.doFun();
			}
			//用完后清空
			this.cancelEntrusTask(EntrustType.Transfer);
		}
		else if (!isNaN(this.taskDic[EntrustType.Transfer])) {
			//...
		}
	}


}
namespace EntrustManager {
	export let  entrustManager = EntrustManager.ins.bind(EntrustManager);
}

/**委托任务类型*/
enum  EntrustType{
	/**传送委托*/
	Transfer
}
