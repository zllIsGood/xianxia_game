/**
 * Created by yangsong on 2014/11/23.
 * 服务端返回消息处理
 */
class MessageCenter extends BaseClass {
	private dict: any;
	private eVec: MessageVo[];
	private type: number;
	private flag: number = 0;

	public static ins(): MessageCenter {
		// if (!MessageCenter._ins) MessageCenter._ins = new MessageCenter(0);
		// return MessageCenter._ins;
		return super.ins(0) as MessageCenter;
	}

	/**
	 * 构造函数
	 * @param type 0:使用分帧处理 1:及时执行
	 */
	public constructor(type: number) {
		super();
		this.type = type;
		this.dict = {};
		this.eVec = [];
		if (this.type == 0) {
			egret.startTick(this.run, this);
		}
	}

	/**
	 * 清空处理
	 */
	public clear() {
		this.dict = {};
		this.eVec.splice(0);
	}

	/**
	 * 添加消息监听
	 * @param type 消息唯一标识
	 * @param listener 侦听函数
	 * @param listenerObj 侦听函数所属对象
	 *
	 */
	public addListener(type: string, listener: Function, listenerObj: any): void {
		let arr = this.dict[type];
		if (!arr) {
			this.dict[type] = arr = [];
		}
		else if (this.flag != 0) {
			this.dict[type] = arr = arr.concat();
		}

		//检测是否已经存在
		for (let item of arr) {
			if (item[0] == listener && item[1] == listenerObj) {
				return;
			}
		}

		arr.push([listener, listenerObj]);
	}

	/**
	 * 移除消息监听
	 * @param type 消息唯一标识
	 * @param listener 侦听函数
	 * @param listenerObj 侦听函数所属对象
	 */
	public removeListener(type: string, listener: Function, listenerObj: any): void {
		let arr = this.dict[type];
		if (!arr) {
			return;
		}
		if (this.flag != 0) {
			this.dict[type] = arr = arr.concat();
		}
		let len: number = arr.length;
		for (let i = 0; i < len; i++) {
			if (arr[i][0] == listener && arr[i][1] == listenerObj) {
				arr.splice(i, 1);
				break;
			}
		}

		if (arr.length == 0) {
			this.dict[type] = null;
			delete this.dict[type];
		}
	}

	/**
	 * 移除某一对象的所有监听
	 * @param listenerObj 侦听函数所属对象
	 */
	public removeAll(listenerObj: any): void {
		let keys = Object.keys(this.dict);
		for (let type of keys) {
			let arr = this.dict[type];
			if (this.flag != 0) {
				this.dict[type] = arr = arr.concat();
			}

			for (let j = 0; j < arr.length; j++) {
				if (arr[j][1] == listenerObj) {
					arr.splice(j, 1);
					j--;
				}
			}

			if (arr.length == 0) {
				this.dict[type] = null;
				delete this.dict[type];
			}
		}
	}

	/**
	 * 触发消息
	 * @param type 消息唯一标识
	 * @param param 消息参数
	 *
	 */
	public dispatch(type: string, ...param: any[]): void {
		let vo: MessageVo = ObjectPool.pop("MessageVo");
		vo.type = type;
		vo.param = param;
		if (this.type == 0) {
			let isExit = false;
			for (let item of this.eVec) {
				//对于不带参数的post事件，进行是否已存在的判断
				if (vo.type == item.type && vo.param.length == item.param.length) {
					isExit = true
					for (let i = 0; i < vo.param.length; i++) {
						let vpm = vo.param[i];
						let ipm = item.param[i];
						if (vpm !== ipm) {
							isExit = false;
							break;
						}
					}
					// vo.param = param
					// isExit && DebugUtils.warn("same evo dispatch: " + vo.type);
					break;
				}
			}
			if (!isExit)
				this.eVec.push(vo);
		}
		else if (this.type == 1) {
			this.dealMsg(vo);
		}
		else {
			Log.trace("MessageCenter未实现的类型");
		}
	}

	/**
	 * 运行
	 *
	 */
	private run(time: number): boolean {
		let currTime: number = egret.getTimer();
		let lastTime: number = currTime;
		let arr = [];
		while (this.eVec.length > 0) {
			let e = this.eVec.shift();
			arr.push(e.type);
			this.dealMsg(e);
			// this.dealMsg(this.eVec.shift());
			let t = egret.getTimer();
			let usedTime = t - lastTime;
			lastTime = t;
			arr.push(usedTime);
			if ((t - currTime) > 5) {
				// DebugUtils.log(`时间处理超过5毫秒,执行事件数量` + (arr.length / 2), arr);
				break;
			}
		}
		return false;
	}

	/**
	 * 处理一条消息
	 * @param msgVo
	 */
	private dealMsg(msgVo: MessageVo): void {
		let listeners = this.dict[msgVo.type];
		if (!listeners) {
			return;
		}

		let len = listeners.length;
		if (len == 0) return;

		this.flag++;
		for (let listener of listeners) {
			listener[0].apply(listener[1], msgVo.param);
		}
		this.flag--;

		msgVo.dispose();
		ObjectPool.push(msgVo);
	}


	public static splite: string = ".";

	public static setFunction(ins: boolean, obj: any, name: string, ex: string): boolean {
		if (name.indexOf(ex) == 0 && typeof (obj[name]) == "function") {
			let msgname = obj.__class__ + MessageCenter.splite + name;

			let func: Function = obj[name];
			let newfunc = function (...args: any[]) {
				let argsLen: number = args.length;
				let data: any;
				if (ins)
					data = func.call(this, ...args);
				else
					data = func(...args);

				if (typeof data != "boolean" || data) {
					MessageCenter.ins().dispatch(msgname, data);
				}
				return data;
			};
			newfunc["funcallname"] = msgname;
			obj[name] = newfunc;
			return true;
		}
		return false;
	}

	/**
	 * 编译 静态函数不编译
	 * */
	public static compile(thisobj: any, ex: string = "post") {
		let p = thisobj.prototype;
		for (let name in p) {
			MessageCenter.setFunction(true, p, name, ex);
		}

		// for (let name in thisobj) {
		// 	MessageCenter.setFunction(false, thisobj, name, ex);
		// }

		// let keys = Object.keys(p);
		// for (let name of keys) {
		// 	MessageCenter.setFunction(true, p, name, ex);
		// }
	}

	public static addListener(func: any, listener: Function, thisObj: any, callobj: any = undefined): boolean {
		if (func.funcallname) {
			MessageCenter.ins().addListener(func.funcallname, listener, thisObj);
			if (callobj)
				func.call(callobj);
			return true;
		}
		else {
			debug.log("MessageCenter.addListener error:" + egret.getQualifiedClassName(thisObj));
			return false;
		}
	}
}

class MessageVo {
	public type: string;
	public param: any[];

	public constructor() {
	}

	public dispose(): void {
		this.type = null;
		this.param = null;
	}
}

function post(target, key: string, descriptor: PropertyDescriptor) {
	const method = descriptor.value;
	let msgname = target.constructor.name + MessageCenter.splite + key;

	let newfunc = function (...args) {
		let data = method.call(this, ...args);
		if (typeof data != "boolean" || data) {
			MessageCenter.ins().dispatch(msgname, data);
		}
		return data;
	};
	newfunc["funcallname"] = msgname;
	descriptor.value = newfunc;

	return descriptor;
}

function callLater(target, key: string, descriptor: PropertyDescriptor) {
	let method = descriptor.value;

	let tkey = `$${key}CL`;

	let newfunc = function (...args) {
		delete this[tkey];
		method.call(this, ...args);
	};

	let newfunc2 = function (...args) {
		if (this[tkey]) return;
		egret.callLater(newfunc, this, ...args);
		this[tkey] = true;
	};

	descriptor.value = newfunc2;
	return descriptor;
}

function callDelay(delay: number) {
	return function (target, key: string, descriptor: PropertyDescriptor) {
		let method = descriptor.value;

		let tkey = `$isDelay${key}`;
		let newfunc = function (...args) {
			this[tkey] = false;
			method.call(this, ...args);
		};

		let newfunc2 = function (...args) {
			if (this[tkey]) return;
			this[tkey] = true;
			egret.setTimeout(newfunc, this, delay, ...args);
			// TimerManager.ins().doTimer(delay, 1, newfunc.bind(this, ...args), this); //有隐患，假如TimerManager.ins().removeAll(this)之后，可能会出现异常
		};

		descriptor.value = newfunc2;
		return descriptor;
	};
}

