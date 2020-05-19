/**
 * Created by yangsong on 2014/11/22.
 * View基类，继承自eui.Component
 */
class BaseEuiView extends BaseView implements IBaseView {
	private _isInit: boolean;

	private _resources: string[] = null;

	/**是否一级窗口,一级窗口会把部分主界面遮挡 */
	public isTopLevel: boolean = false;

	/** 互斥窗口,类名或者类字符串的数组,打开某些窗口会关闭互斥的窗口*/
	public exclusionWins: string[] = [];

	/**
	 * 构造函数
	 * @param $controller 所属模块
	 * @param $parent 父级
	 */
	public constructor() {
		super();
		this._isInit = false;

		this.percentHeight = 100;
		this.percentWidth = 100;
	}

	/**
	 * 添加互斥窗口
	 * @classOrName 类名或者类字符串
	 * */
	public addExclusionWin(classOrName: string): void {
		if (this.exclusionWins.indexOf(classOrName) == -1)
			this.exclusionWins.push(classOrName);
	}

	/**
	 * 是否已经初始化
	 * @returns {boolean}
	 */
	public isInit(): boolean {
		return this._isInit;
	}

	/**
	 * 面板是否显示
	 * @return
	 *
	 */
	public isShow(): boolean {
		return this.stage != null && this.visible;
	}

	/**
	 * 添加到父级
	 */
	public addToParent(p: egret.DisplayObjectContainer): void {
		p.addChild(this);
	}

	/**
	 * 从父级移除
	 */
	public removeFromParent(): void {
		DisplayUtils.removeFromParent(this);
		this.destoryView();
	}

	/**
	 *对面板进行显示初始化，用于子类继承
	 *
	 */
	public initUI(): void {
		this._isInit = true;
	}

	/**
	 *对面板数据的初始化，用于子类继承
	 *
	 */
	public initData(): void {

	}

	/**
	 * 销毁
	 */
	public destroy(): void {
	}

	public destoryView(destroyUI: boolean = true): void {
		TimerManager.ins().removeAll(this);
		ViewManager.ins().destroy(this.hashCode);
		if (destroyUI) {
			ResourceMgr.ins().destroyWin();
		}
	}

	/**
	 * 面板开启执行函数，用于子类继承
	 * @param param 参数
	 */
	public open(...param: any[]): void {
	}

	/**
	 * 面板关闭执行函数，用于子类继承
	 * @param param 参数
	 */
	public close(...param: any[]): void {
	}

	/**
	 * 加载面板所需资源
	 */
	public loadResource(loadComplete: Function, initComplete: Function): void {
		if (this._resources && this._resources.length > 0) {
			ResourceUtils.ins().loadResource(this._resources, [], loadComplete, null, this);
			this.addEventListener(eui.UIEvent.CREATION_COMPLETE, initComplete, this);
		}
		else {
			loadComplete();
			initComplete();
		}
	}

	/**
	 * 设置是否隐藏
	 * @param value
	 */
	public setVisible(value: boolean): void {
		this.visible = value;
	}

	public static openCheck(...param: any[]): boolean {
		return true;
	}

	public anigroup: eui.Group;//规则:anigroup意味着组动画 一般用于二三级界面(tips层)
	public playUIEff(...param: any[]): void {
		if (this.anigroup)
			UIAnimation.setAnimation(this.anigroup, UIAnimation.ANITYPE_IN_SCALE_VER, { time: 200 });
		// egret.log("BaseEuiView PlayUIEff");
		// let layer = param[0];
		// if( layer.layerName == "UI_Popup" )
		// 	UIAnimation.setAnimation(this,UIAnimation.ANITYPE_IN_RIGHT_HOR,{time:300,ease:egret.Ease.sineInOut});
	}

	public closeEx(...param: any[]): void {
		let func = param[0];
		if (this.parent == LayerManager.UI_Popup) {
			if (this.anigroup)
				UIAnimation.setAnimation(this.anigroup, UIAnimation.ANITYPE_OUT_SCALE_VER, {
					time: 200,
					func: func,
					ease: egret.Ease.sineIn
				});
			else
				func();
		}
		else {
			func();
		}

	}

	protected closeWin(): void {
		ViewManager.ins().close(this);
	}
}