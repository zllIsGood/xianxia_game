/** 印记碎片转换
 * 
 */
class PunchTransformWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public transformBtn:eui.Button;
	public quicklytransformBtn:eui.Button;
	public seniorPiece:eui.Group;
	public count0:eui.Label;
	public basePiece:eui.Group;
	public count1:eui.Label;
	public minus:eui.Button;
	public add:eui.Button;
	public changeBar:eui.ProgressBar;

	public constructor() {
		super();
		this.skinName = "PunchTransformSkin";
		this.isTopLevel = true;
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onTouch);
		this.observe(Actor.ins().postUpdateTogeatter, this.checkChange);

		this.update();
	}

	public close():void
	{
		this.removeTouchEvent(this, this.onTouch);
		this.removeObserve();
	}

	private checkChange(data:{value: number, type: number}):void
	{
		if (data && data.type == 2)
			this.update();
	}

	private update():void
	{
		this.count0.text = Actor.togeatter2 + "";
		this.count1.text = "0";
		this.changeBar.value = 0;
		this.changeBar.maximum = Actor.togeatter2;
		this.transformBtn.enabled = Actor.togeatter2 > 0;
		this.quicklytransformBtn.enabled = false;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch(e.target)
		{
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.transformBtn: //一键转换
				UserSkill.ins().sendChangeTogeatterHigh(Actor.togeatter2);
				break;
			case this.quicklytransformBtn: //转换
				UserSkill.ins().sendChangeTogeatterHigh(this.changeBar.value);
				break;
			case this.add:
				if (this.changeBar.value < Actor.togeatter2)
				{
					this.changeBar.value++;
					this.count1.text = (this.changeBar.value * GlobalConfig.TogerherHitBaseConfig.TogExgRate) + "";
					this.quicklytransformBtn.enabled = true;
				}
				else if (Actor.togeatter2 == 0)
					UserTips.ins().showTips("高级印记碎片不足");
				else
					UserTips.ins().showTips("已达到最大转换数量");
				break;
			case this.minus:
				if (this.changeBar.value > 0)
				{
					this.changeBar.value--;
					this.count1.text = (this.changeBar.value * GlobalConfig.TogerherHitBaseConfig.TogExgRate) + "";
				}
			
				if (this.changeBar.value <= 0)
					this.quicklytransformBtn.enabled = false;
				break;
		}
	}
}

ViewManager.ins().reg(PunchTransformWin, LayerManager.UI_Main);