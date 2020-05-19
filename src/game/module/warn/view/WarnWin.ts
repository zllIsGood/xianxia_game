/**
 * 弹出框（普通）
 */
class WarnWin extends BaseEuiView {
	private frame: eui.Image;
	private body: eui.Image;
	private title: eui.Label;
	protected sureBtn: eui.Button;
	protected notBtn: eui.Button;
	protected warnLabel: eui.Label;

	protected leftGroup: eui.Group;
	protected icon1: eui.Image;
	protected label1: eui.Label;
	protected rightGroup: eui.Group;
	protected icon2: eui.Image;
	protected label2: eui.Label;

	public _isShowWin: boolean;
	public bgClose: eui.Rect;
	protected cbx:eui.CheckBox;
	static show(str: string, func: Function, thisObj: any, func2: Function = null, thisObj2: any = null, statu: string = "normal",align = "center"): WarnWin {
		let rtn = UserWarn.ins().setWarnLabel(
			str,
			{
				"func": func, "thisObj": thisObj
			},
			{
				"func2": func2, "thisObj2": thisObj2,
			},
			statu,
			align
		);
		return rtn;
	}


	public showUI(icon1?:string,label1?:string,icon2?:string,label2?:string){
		this.leftGroup.visible = false;
		this.icon1.visible = false;
		this.label1.visible = false;
		this.rightGroup.visible = false;
		this.icon2.visible = false;
		this.label2.visible = false;
		if( icon1 || label1 ){
			this.leftGroup.visible = true;
			if(icon1){
				this.icon1.visible = true;
				this.icon1.source = icon1;
			}
			if(label1){
				this.label1.visible = true;
				this.label1.text = label1;
			}

		}
		if( icon2 || label2 ){
			this.rightGroup.visible = true;
			if(icon2){
				this.icon2.visible = true;
				this.icon2.source = icon2;
			}

			if(label2){
				this.label2.visible = true;
				this.label2.text = label2;
			}

		}

	}

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "warnFrameSkin";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.sureBtn, this.onTap);
		this.addTouchEvent(this.notBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.cbx, this.onTap);

		this.cbx.selected = SysSetting.ins().getBool(SysSetting.DICE);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.sureBtn, this.onTap);
		this.removeTouchEvent(this.notBtn, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this.cbx, this.onTap);
	}

	public onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.sureBtn:
				if (this.callBack.func != null)
					this.callBack.func.call(this.callBack.thisObj);
				break;
			case this.notBtn:
				if (this.calback2.func2) {
					this.calback2.func2.call(this.calback2.thisObj2);
				}
				break;
			case this.bgClose:
				ViewManager.ins().close(this);
				break
			case this.cbx:
				SysSetting.ins().setBool(SysSetting.DICE, e.currentTarget.selected);
				break;
		}
		if( e.currentTarget != this.cbx )
			ViewManager.ins().close(WarnWin);
	}

	/**
	 * 是否显示框
	 */
	public set isShowWin(bool: boolean) {
		if (this._isShowWin == bool) return;
		this._isShowWin = bool;
	}

	/**
	 * 是否显示框
	 */
	public get isShowWin(): boolean {
		return this._isShowWin;
	}

	protected callBack: { func: Function, thisObj: any };
	protected calback2: { func2: Function, thisObj2: any };

	public setWarnLabel(str: string, callbackFunc: { func: Function, thisObj: any }, calbackFun2: { func2: Function, thisObj2: any } = null, statu: string = "normal", align = "left"): void {
		this.warnLabel.textFlow = (new egret.HtmlTextParser).parser(str);
		this.callBack = callbackFunc;
		this.calback2 = calbackFun2;
		this.currentState = statu;
		this.warnLabel.textAlign = align;
	}

	public setBtnLabel(leftTxt?, rightTxt?):void{
		if(leftTxt) this.sureBtn.label = leftTxt;
		if(rightTxt) this.notBtn.label = rightTxt;
	}

}

ViewManager.ins().reg(WarnWin, LayerManager.UI_Popup);
