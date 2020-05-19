/**
 * 组队副本攻略子项
 * @author wanghengshuai
 * 
 */
class TeamFbGuideItemrender extends BaseItemRender{
	
	public nameTxt:eui.Label;
	public dangerLvTxt:eui.Label;
	public guideTxt:eui.Label;
	public monHeadImg:eui.Image;

	public constructor() {
		super();
		//this.skinName = "teamFbGuideItem";
	}

	public dataChanged():void
	{
		let cfg:TeamFuBenGuideConfig = this.data;
		this.monHeadImg.source = cfg.monHead;
		this.nameTxt.text = cfg.monName;
		this.dangerLvTxt.textFlow = TextFlowMaker.generateTextFlow(cfg.dangerLv);
		this.guideTxt.textFlow = TextFlowMaker.generateTextFlow(cfg.guideText);
	}
}