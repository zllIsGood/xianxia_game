/**
 * 开门红展示控件
 */
class KaiMenItem extends BaseItemRender {
	private reward: eui.List;
	private get: eui.Button;
	private already: eui.Label;//已领取
	private redPoint: eui.Image;
	private day: eui.Label;
	private unready: eui.Label;//已过期
	private daySchedule: eui.Label;
	private buyGroup: eui.Group;
	constructor() {
		super();
		this.skinName = 'KMHRechargeItem';
		this.init();
	}
	protected childrenCreated(): void {
		super.childrenCreated();

	}
	/**触摸事件 */
	protected init(): void {
		this.reward.itemRenderer = ItemBase;
		this.get.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	public onClick() {
		if (!this.data || !(this.data instanceof KaiMenData)) return;
		if (this.data.already) {
			UserTips.ins().showTips(`已购买`);
			return;
		}
		if (this.data.unready) {
			UserTips.ins().showTips(`已过期`);
			return;
		}
		if (this.data.type == 3) {
			if (!this.data.redPoint) {
				ViewManager.ins().open(ChargeFirstWin);
				return;
			}
		} else {
			if (!this.data.redPoint) {
				UserTips.ins().showTips(`未达到条件`);
				return;
			}
		}
		Activity.ins().sendReward(this.data.id, this.data.index);
	}

	protected dataChanged(): void {
		if (!this.data || !(this.data instanceof KaiMenData)) return;
		this.unready.visible = this.data.unready;
		this.already.visible = this.data.already;
		this.redPoint.visible = this.data.redPoint;
		this.reward.dataProvider = new eui.ArrayCollection(this.data.reward);
		if (this.data.type == 3) {
			if (this.unready.visible) {//已过时
				this.get.visible = false;
			} else {
				this.get.visible = !this.already.visible;
			}
			this.day.text = `第${this.data.day}天`;
			DisplayUtils.removeFromParent(this.daySchedule);
			if (!this.get.parent)
				this.buyGroup.addChild(this.get);
		} else if (this.data.type == 2) {//连冲
			if (this.unready.visible) {//未到不显示按钮
				this.get.visible = false;
			} else {
				this.get.visible = this.redPoint.visible;//同显同隐
				if (!this.get.parent)
					this.buyGroup.addChild(this.get);
			}
			this.unready.visible = false;//连冲不显示
			this.day.text = `累充${this.data.day}天`;
			if (this.already.visible)
				DisplayUtils.removeFromParent(this.daySchedule);
			else {
				if (!this.daySchedule.parent)
					this.buyGroup.addChild(this.daySchedule);
			}
		} else if (this.data.type == 1) {//连冲
			if (this.unready.visible) {//未到不显示按钮
				this.get.visible = false;
			} else {
				this.get.visible = this.redPoint.visible;//同显同隐
				if (!this.get.parent)
					this.buyGroup.addChild(this.get);
			}
			this.unready.visible = false;//连冲不显示
			this.day.text = `连充${this.data.day}天`;
			if (this.already.visible)
				DisplayUtils.removeFromParent(this.daySchedule);
			else {
				if (!this.daySchedule.parent)
					this.buyGroup.addChild(this.daySchedule);
			}
		}
		if (!this.get.visible) {
			DisplayUtils.removeFromParent(this.get);
		}

		if (this.data.type == 3 && !this.data.redPoint) {
			this.get.label = "充值";
		} else {
			this.get.label = "领取";
		}
		if (this.daySchedule.parent) {
			let act = Activity.ins().getActivityDataById(this.data.id) as ActivityType3Data;
			let color = 0x00ff00;//this.redPoint.visible?0x00ff00:0xff0000;
			this.daySchedule.textFlow = TextFlowMaker.generateTextFlow1(`累充|C:${color}&T:${act.dabiao[this.data.index - 1]}|/${this.data.day}天`);
		}

	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}


}

class KaiMenData {
	id: number;//活动Id
	index: number;//活动index
	type: number;//逻辑类型
	already: boolean;//已购买
	unready: boolean;//已过期
	redPoint: boolean;//可购买红点
	day: number;//第N天
	reward: RewardData[];//奖励
}