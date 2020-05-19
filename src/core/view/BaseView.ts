//显示基类,用于增加一些显示相关的共有函数
class BaseView extends eui.Component {
	public event = [];

	public constructor() {
		super();
	}

	public observe(func: Function, myfunc: Function, callobj: any = undefined) {
		MessageCenter.addListener(func, myfunc, this, callobj);
	}

	public removeObserve() {
		MessageCenter.ins().removeAll(this);
	}

	public addTouchEvent(obj: any, func: Function) {
		this.addEvent(egret.TouchEvent.TOUCH_TAP, obj, func);
	}

	public addTouchEndEvent(obj: any, func: Function) {
		this.addEvent(egret.TouchEvent.TOUCH_END, obj, func);
	}

	public addChangeEvent(obj: any, func: Function) {
		if (obj && obj instanceof eui.TabBar) {
			this.addEvent(egret.TouchEvent.CHANGE, obj, (...param)=>{
				SoundUtil.ins().playEffect(SoundUtil.WINDOW);
				func.call(this,...param);
			});
		} else {
			this.addEvent(egret.TouchEvent.CHANGE, obj, func);
		}
	}

	public addChangingEvent(obj:any, func:Function) {
		this.addEvent(egret.TouchEvent.CHANGING, obj, func);
	}

	public addEvent(ev: string, obj: any, func: Function) {
		if (!obj) {//Assert(obj, "不存在绑定对象")
			return;
		}
		obj.addEventListener(ev, func, this);
		this.event.push([ev, func, obj]);
	}

	public removeTouchEvent(obj: any, func: Function) {
		if (obj) obj.removeEventListener(egret.TouchEvent.TOUCH_TAP, func, this);
	}

	private removeEvents() {
		while (this.event.length > 0) {
			let ev = this.event.pop();
			ev[2].removeEventListener(ev[0], ev[1], this);
		}
	}

	setSkinPart(partName: string, instance: any): void {
		super.setSkinPart(partName, instance);

		if (!instance)
			return;
		if (!this.skin[partName] || this.skin[partName] == instance)
			return;
		let p = this.skin[partName].parent;
		let pIndex = p.getChildIndex(this.skin[partName]);
		DisplayUtils.removeFromParent(this.skin[partName]);
		for (let i = 0; i < BaseView.replaceKeys.length; i++) {
			let key = BaseView.replaceKeys[i];
			instance[key] = this.skin[partName][key];
		}
		this.skin[partName] = instance;
		p.addChildAt(instance, pIndex);
	}

	public static replaceKeys: string[] = ["x", "y", "alpha", "anchorOffsetX", "anchorOffsetY", "blendMode", "bottom",
		"cacheAsBitmap", "currentState", "enabled", "filters", "height", "horizontalCenter", "hostComponentKey",
		"includeInLayout", "left", "mask", "matrix", "maxHeight", "maxWidth", "minHeight", "minWidth", "name",
		"percentHeight", "percentWidth", "right", "rotation", "scaleX", "scaleY", "scrollRect", "skewX", "skewY",
		"skinName", "top", "touchChildren", "touchEnabled", "verticalCenter", "visible", "width"];

	public $onClose() {

		let fun = function (tar: egret.DisplayObjectContainer) {
			for (let i: number = 0; i < tar.numChildren; i++) {
				let obj = tar.getChildAt(i);
				if (obj instanceof BaseView) {
					(<BaseView>obj).$onClose();
				} else if (obj instanceof egret.DisplayObjectContainer) {
					arguments.callee(obj);
				}
			}
		};

		fun(this);

		this.removeEvents();
		this.removeObserve();
	}
}