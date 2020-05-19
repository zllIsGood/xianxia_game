/**
 * 跨服战场玩法列表
 * @author MPeter
 * 
 */
class KFBattlListPanel extends BaseComponent {
	//////////////////跨服列表/////////////////////
	/**无极战场组 */
	private wjGroup: eui.Group;
	/**玩法说明*/
	private helpLink0: eui.Label;
	/**进入按钮*/
	private btn0: eui.Button;
	/**可操作红点 */
	private redPoint0: eui.Image;
	/**开启条件 */
	private openTerm0: eui.Label;
	/**活动时间 */
	private time0: eui.Label;


	/**活动总个数 */
	private count: number = 1;
	public constructor() {
		super();
		this.name = `跨服`;
		// this.skinName = `KFBattlListSkin`;
	}
	public childrenCreated(): void {
		super.childrenCreated();
		
	}
	public open() {
		this.addTouchEvent(this, this.onTap);

        // for (let i = 0; i <= 1; i++) {
		// 	let str = this[`helpLink${i}`].text;
		// 	this["helpLink" + i].textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${str}`);
		// }
		this.refRedpoint();
	}
    /**触摸处理 */
	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.btn0://无极战场
				ViewManager.ins().open(WJBattlefieldWin);
				break;
			case this.helpLink0://无极战场帮助
				ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[25].text);
				break;
		}
	}
    
	/**刷新红点 */
	private refRedpoint(): void {

		for (let i: number = 0; i < this.count; i++) {
			this[`redPoint${i}`].visible = KFBattleRedPoint.ins()[`postRedPoint${i+1}`]();
		}
	}
}