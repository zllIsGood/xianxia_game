/**
 * Created by wangzhong on 2016/7/20.
 */
class ActivityIconRule_tehui extends ActivityIconRule {

	protected pageStyle: ActivityPageStyle = ActivityPageStyle.KAIFUTEHUI; 

	checkShowIcon(): boolean {

		// 如果是iOS, 直接不显示这个icon
		if (!WxTool.shouldRecharge()) { return false; }

		return super.checkShowIcon();
	}

}
