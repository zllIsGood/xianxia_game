/**
 * Created by wangzhong on 2016/7/20.
 */
class ActivityIconRule_fanli extends ActivityIconRule {
	protected pageStyle: ActivityPageStyle = ActivityPageStyle.KAIFUFANLI;

	checkShowIcon(): boolean {

		if (GameServer.serverOpenDay >= 14) {
			(this.tar as any).icon = `icon_zzb_json.icon_huodong`;
		}
		
		if(WxTool.shouldRecharge()) {
			return super.checkShowIcon();
		} else {
			return false;
		}
	}
}
