/**
 * Created by linsiyang on 2016/11/10.
 */
class FriendsIconRule extends RuleIconBase {

	private firstTap: boolean = false;

	constructor(t: egret.DisplayObjectContainer) {
		super(t);

		this.updateMessage = [
			Friends.ins().postFriendChange
		];
	}

	public checkShowIcon(): boolean {
		return Actor.level >= 70;
	}

	public checkShowRedPoint(): number {
		let rtn = 0;
		if (Object.keys(Friends.ins().newMsg).length > 0) {
			for (let key in Friends.ins().newMsg) {
				var value = Friends.ins().newMsg[key];
				if (value == true) {
					rtn++;
					break;
				}
			}

		}

		if (Friends.ins().appList.length > 0) {
			rtn++;
		}
		return rtn;
	}

	public getEffName(redPointNum: number): string {
		// if (this.firstTap || redPointNum) {
		//     this.effX = 35;
		//     this.effY = 35;
		//     return "actIconCircle";
		// }
		return undefined;
	}

	public tapExecute(): void {
		if (Actor.level < GlobalConfig.FriendLimit.sysLv) {
			UserTips.ins().showTips(`${GlobalConfig.FriendLimit.sysLv}级开启好友功能`);
		} else {
			ViewManager.ins().open(FriendBgWin);
			this.firstTap = false;
			this.update();
		}
	}
}
