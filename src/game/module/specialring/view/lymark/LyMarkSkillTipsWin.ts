/**
 * 烈焰印记技能
 * Created by wanghengshuai on 2018/1/2.
 */
class LyMarkSkillTipsWin extends BaseEuiView{

	public closeBtn:eui.Rect;
	public quali:eui.Image;
	public corner:eui.Image;
	public redpoint:eui.Image;
	public skillImg:eui.Image;
	public nametxt:eui.Label;
	public lvtxt:eui.Label;
	public keyDesctxt:eui.Label;
	public infoDesctxt:eui.Label;
	public skillDesctxt:eui.Label;
	public damageDesctxt:eui.Label;
	public show:eui.Group;
	public update:eui.Button;
	public cost:eui.Group;
	public costImg:eui.Image;
	public costNum:eui.Label;
	public nextLevel:eui.Label;
	public uieff:eui.Group;

	private _cfg:FlameStampEffect;

	private _nextCfg:FlameStampEffect;

	private _uiEffect:MovieClip;

	public constructor() {
		super();
		this.skinName = "markSkillTipsSkin";
		this.isTopLevel = true;
	}

	public open(...args:any[]):void
	{
		this._cfg = args[0];
		this.addTouchEvent(this, this.onTouch);
		this.observe(LyMark.ins().postMarkData, this.resetCfg);
		this.observe(UserBag.ins().postItemAdd, this.updateData);
		this.observe(UserBag.ins().postItemChange, this.updateData);

		this.updateData();
	}

	public close():void
	{
		if (this._uiEffect)
		{
			this._uiEffect.destroy();
			this._uiEffect = null;
		}
	}

	private resetCfg():void
	{
		let skillLv:number = LyMark.ins().getSkillLvById(this._cfg.id);
		if (!skillLv)
			skillLv = 1;
			
		this._cfg = GlobalConfig.FlameStampEffect[this._cfg.id][skillLv];
		this.updateData();
	}

	private updateData():void
	{
		this.currentState = "skill" + (this._cfg.id - 1);
		this.skillImg.source = this._cfg.icon;
		this.nametxt.text = this._cfg.skillname;

		let lv:number = LyMark.ins().getSkillLvById(this._cfg.id);
		this.lvtxt.text = "Lv." + lv;
		this.redpoint.visible = false;
		this.nextLevel.text = "";
		if (this._cfg.id == 1)
		{
			let time:number = 0;

			let lv3:number = LyMark.ins().getSkillLvById(3);
			let mCd:number = lv3 ? GlobalConfig.FlameStampEffect[3][lv3].reloadTime : 0;
			let skillID:number = this._cfg.skillId;
			let count:number = this._cfg.stamp;
			if (!lv)
				mCd = 0;
			else if (LyMark.ins().getSkillLvById(2))
			{
				lv3 = LyMark.ins().getSkillLvById(2);
				skillID = GlobalConfig.FlameStampEffect[2][lv3].skillId;
				count = GlobalConfig.FlameStampEffect[2][lv3].stamp;
			}
			
			let skillDes:SkillsDescConfig = GlobalConfig.SkillsDescConfig[GlobalConfig.SkillsConfig[skillID].desc];
			time = (skillDes.cd - mCd) / 1000 >> 0;
			this.keyDesctxt.text = "充能时间：" + time + "秒";
			this.skillDesctxt.textFlow = TextFlowMaker.generateTextFlow1(skillDes.desc.replace("{0}", `|C:${0x00ff00}&T:${time / count >> 0}|`).replace("{1}", `|C:${0x00ff00}&T:${count}|`));
			this.damageDesctxt.textFlow = TextFlowMaker.generateTextFlow1(LyMark.ins().lyMarkLv ? GlobalConfig.FlameStampLevel[LyMark.ins().lyMarkLv].bulletDesc : "");
		}
		else
		{
			if (this._cfg.id == 2 || this._cfg.id == 3 || this._cfg.id == 7)
				this.keyDesctxt.text = "最大等级：" + Object.keys(GlobalConfig.FlameStampEffect[this._cfg.id]).length;
			else
				this.keyDesctxt.text = "触发概率：" + (GlobalConfig.EffectsConfig[this._cfg.id == 4 ? this._cfg.selfEffId : this._cfg.effId].probabilityBuff / 100 >> 0) + "%";

			this.skillDesctxt.textFlow = TextFlowMaker.generateTextFlow1(this._cfg.skillDesc);

			let isMax:boolean = lv >= (Object.keys(GlobalConfig.FlameStampEffect[this._cfg.id]).length);
			this.cost.visible = false;
			this.update.visible = false;
			if (!isMax)
			{
				let nextCfg:FlameStampEffect = GlobalConfig.FlameStampEffect[this._cfg.id][lv <=0 ? 1 : lv + 1];
				if (nextCfg.costItem)
				{
					let itemConfig:ItemConfig = GlobalConfig.ItemConfig[nextCfg.costItem];
					this.costImg.source = itemConfig.icon + '_png';
					let itemData: ItemData = UserBag.ins().getBagItemById(nextCfg.costItem);
					let count:number = itemData ? itemData.count : 0;
					this.costNum.textFlow = TextFlowMaker.generateTextFlow1(`|C:${count < nextCfg.costCount ? 0xff0000 : 0xD1C28F}&T:X ${nextCfg.costCount}|`);

					this.redpoint.visible = count >= nextCfg.costCount && LyMark.ins().lyMarkLv >= nextCfg.stampLevel;
					this._nextCfg = nextCfg;

					if (LyMark.ins().lyMarkLv >= nextCfg.stampLevel)
					{
						this.cost.visible = count < nextCfg.costCount;
						this.update.visible = !this.cost.visible;
					}
					else
						this.nextLevel.text = "烈焰印记达到" + nextCfg.stampLevel + "级解锁升级";
				}
				else if (LyMark.ins().lyMarkLv < nextCfg.stampLevel)
				{
					this.nextLevel.text = "烈焰印记达到" + nextCfg.stampLevel + "级自动升级";
				}
			}
		}

		//界面特效
		if (!this._uiEffect)
		{
			this._uiEffect = ObjectPool.pop("MovieClip");
			this.uieff.addChild(this._uiEffect);
		}

		this._uiEffect.playFile(`${RES_DIR_EFF}${this._cfg.uiEff}`, -1);	
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch(e.target)
		{
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.update:
				if (this.redpoint.visible)
					LyMark.ins().sendUpSkill(this._cfg.id);
				else
				{
					if (this._nextCfg.stampLevel > LyMark.ins().lyMarkLv)
						UserTips.ins().showTips("需要烈焰印记达到" + this._nextCfg.stampLevel + "级");
					else
						UserTips.ins().showTips("材料不足");
				}
				break;
		}
	}
}

ViewManager.ins().reg(LyMarkSkillTipsWin, LayerManager.UI_Main);
