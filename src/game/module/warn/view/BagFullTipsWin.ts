/*空余背包不足提示 */
class BagFullTipsWin extends BaseEuiView{
	private closeBtn:eui.Button;
	private sureBtn:eui.Button;
	private numText:eui.Label;
   constructor() {
		super();
		this.skinName = "FullBagSkin";
	}
	
	public open(...param: any[]){
		this.addTouchEvent(this.closeBtn,this.onTap);
		this.addTouchEvent(this.sureBtn,this.onTap);
		let num:number = 20;
		if(param[0])num = param[0];
		this.numText.text = `${num}`
	}
	public close(){
		this.removeTouchEvent(this.closeBtn,this.onTap);
		this.removeTouchEvent(this.sureBtn,this.onTap);
	}
	public onTap(e:egret.TouchEvent){
		switch(e.currentTarget){
			case this.closeBtn:
			ViewManager.ins().close(this);
			break;
			case this.sureBtn:
			ViewManager.ins().close(this);
			ViewManager.ins().open(SmeltEquipTotalWin);
			break;

		}
	}

}

ViewManager.ins().reg(BagFullTipsWin,LayerManager.UI_Popup);