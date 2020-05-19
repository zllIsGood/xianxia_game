class JadeItem extends BaseComponent{
	public light:eui.Image;
	public processEff0:eui.Group;
	public processEff1:eui.Group;
	public processEff2:eui.Group;
	public processEff3:eui.Group;
	public processEff4:eui.Group;
	public processEff5:eui.Group;
	public processEff6:eui.Group;
	public processEff7:eui.Group;
	public processEff8:eui.Group;
	public line0:eui.Image;
	public line1:eui.Image;
	public line2:eui.Image;
	public line3:eui.Image;
	public line4:eui.Image;
	public line5:eui.Image;
	public line6:eui.Image;
	public line7:eui.Image;

	public perLevel:number = 11;

	private _mcList:Array<MovieClip>;

	private _nexMc:MovieClip;

	private _oldLevel:number = -1;

	private _oldJade:number = 0;

	public constructor() {
		super();
		this._mcList = [];
	}

	public setLevel(level:number, showFire:boolean):void
	{
		if (level == this._oldLevel)
			return;

		this._oldLevel = level;
		let jade:number = Math.floor(level / (GlobalConfig.YuPeiBasicConfig.perLevel * 9));
		this.skinName = "YuPei" + jade + "Skin";
		let phase:number = (Math.floor(level / GlobalConfig.YuPeiBasicConfig.perLevel) + 1) % 9;
		
		if (phase == 0)
			phase = 9;
		
		if (this._nexMc && this._nexMc.parent)
			this._nexMc.parent.removeChild(this._nexMc);

		let mc:MovieClip;
		let showNext:boolean;
		for (let i:number = 1; i <= 9; i++)
		{
			mc = this._mcList[i - 1];
			if (mc && mc.parent)
				mc.parent.removeChild(mc);

			if (this._oldJade != jade && mc)
				mc.stop();

			if (i > 1)
				this["line" + (i - 2)].visible = false;

			showNext = false;
			if (i <= phase)
			{
				if (i < phase || (level % GlobalConfig.YuPeiBasicConfig.perLevel) == 10)
				{
					if (!mc)
					{
						mc = new MovieClip();
						this._mcList[i - 1] = mc;
					}

					this["processEff" + (i - 1)].addChild(mc);
					if (i == phase && showFire)
					{
						if (!mc.isPlaying)
						{
							let t: egret.Tween = egret.Tween.get(this);
							mc.playFile(`${RES_DIR_EFF}bally3`, 1, null, false);
							t.wait(800).call(() => {
							this._mcList[phase - 1].playFile(`${RES_DIR_EFF}bally2`, -1);})
						}			
					}
					else if (!mc.isPlaying)
						mc.playFile(`${RES_DIR_EFF}bally2`, -1);

					if (i > 1)
						this["line" + (i - 2)].visible = true;
				}
				else
					showNext = true;
			}
			else
				showNext = !this._nexMc || !this._nexMc.parent;

			if (showNext)
			{
				if (!this._nexMc)
					this._nexMc = new MovieClip();

				this["processEff" + (i - 1)].addChild(this._nexMc);
				if (!this._nexMc.isPlaying)
					this._nexMc.playFile(`${RES_DIR_EFF}bally1`, -1);
			}
		}

		this._oldJade = jade;
	}

	public close():void
	{
		super.close();
		egret.Tween.removeTweens(this);
		let len:number = this._mcList.length;
		for (var i:number = 0; i < len; i++)
		{
			this._mcList[i].dispose();
			this._mcList[i] = null;
		}

		this._mcList.length = 0;
		this._mcList = null;

		if (this._nexMc)
		{
			this._nexMc.dispose();
			this._nexMc = null;
		}
	}
}