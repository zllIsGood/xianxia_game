/**
 * Created by Administrator on 2016/8/24.
 * 玩家申请列表
 */
class GuildApplyListWin extends BaseEuiView {

	private list: eui.List;
	private bgClose: eui.Rect;
	private checkBoxs: eui.CheckBox;
	private attrNum: eui.TextInput;
	constructor() {
		super();

		this.skinName = "MemberApplySkin";
		this.list.itemRenderer = GuildAppltListItemRender;
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
		this.attrNum.restrict = "0-9";
		this.attrNum.maxChars = 8;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.list, this.onListTouch);

		this.observe(Guild.ins().postApplyInfos, this.updateList);
		Guild.ins().sendApplyInfos();

		this.addTouchEvent(this.checkBoxs, this.onTap);
		this.addChangeEvent(this.attrNum, this.onTxtChange);

		this.checkBoxs.selected = Guild.ins().isAuto == 1;
		this.attrNum.text = Guild.ins().attrLimit + "";

	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this.list, this.onListTouch);
		this.removeTouchEvent(this.checkBoxs, this.onTap);
		this.attrNum.removeEventListener(egret.Event.CHANGE, this.onTxtChange, this);
		this.removeObserve();
	}

	private onTxtChange(e: egret.Event): void {
		Guild.ins().sendAddGuildLimit(this.checkBoxs.selected ? 1 : 0, parseInt(this.attrNum.text));
	}

	private updateList(listData: GuildApplyInfo[]): void {

		listData.sort(this.sort);
		this.list.dataProvider = new eui.ArrayCollection(listData);
	}

	private onListTouch(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Button) {
			let item: GuildAppltListItemRender = e.target.parent as GuildAppltListItemRender;
			item.onTap(e.target);
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.checkBoxs:
				this.onTxtChange(null);
				break;
		}
	}

	private sort(a: GuildApplyInfo, b: GuildApplyInfo): number {
		if (a.attack > b.attack)
			return -1;
		else if (a.attack < b.attack)
			return 1;
		else
			return 0;
	}
}

ViewManager.ins().reg(GuildApplyListWin, LayerManager.UI_Main);