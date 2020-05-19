class SelectMemberPanelWin extends BaseEuiView {

	public list: eui.List;
	public chooseNum: eui.Label;
	public sureBtn: eui.Button;

	public index: number;
	public maxNum: number;
	private selectItemList: MemberItem3Renderer[];
	public selectList: GuildMemberInfo[];
	public numList: number[];
	public bgClose:eui.Rect;


	constructor() {
		super();
    }

    public initUI(): void {
        super.initUI();
        this.skinName = "SelectMemberPanelSkin";
		this.list.itemRenderer = MemberItem3Renderer;
	}

	public open(...param: any[]): void {
		this.index = param[0];
		this.maxNum = param[1];
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.list, this.onTap);
		this.addTouchEvent(this.sureBtn, this.onTap);

		GuildWar.ins().getModel().sendList[this.index] = [];
		GuildWar.ins().getModel().sendNumList[this.index] = [];
		this.selectList = [];
		this.numList = [];
		this.selectItemList = [];
		this.chooseNum.text = "已选择 " + this.countNum() + "/" + this.maxNum;
		this.sureBtn.enabled = this.selectList.length == this.maxNum;
		this.refushList();
	}

	public refushList(): void {
		this.list.dataProvider = new eui.ArrayCollection(GuildWar.ins().getModel().getMyGuildPointRank());
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this.list, this.onTap);
		this.removeTouchEvent(this.sureBtn, this.onTap);
		GuildWar.ins().postSendListChange();
	}

	private countNum(): number {
		var count: number = 0;
		if (this.selectItemList) {
			for (var k in this.selectItemList) {
				count += this.selectItemList[k].chooseNum;
			}
		}
		return count;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
            case this.bgClose:
				ViewManager.ins().close(SelectMemberPanelWin);
				break;
			case this.sureBtn:
				this.toNumList();
				GuildWar.ins().getModel().sendList[this.index] = this.selectList;
				GuildWar.ins().getModel().sendNumList[this.index] = this.numList;
				ViewManager.ins().close(SelectMemberPanelWin);
				break;
			case this.list:
				var item: MemberItem3Renderer = e.target.parent as MemberItem3Renderer;
				if (item && item.data) {
					var i: number = this.selectItemList.lastIndexOf(item);
					switch (e.target) {
						case item.btn1:
							--item.chooseNum;
							if (item.chooseNum < 1) {
								item.chooseNum = 1;
							}
							break;
						case item.btn2:
							if (this.countNum() >= this.maxNum) {
								UserTips.ins().showTips("|C:0xf3311e&T:分配人数已满|");
								return;
							}
							++item.chooseNum;
							break;
						default:
							if (i >= 0) {
								item.checkBoxs.selected = false;
								item.chooseNum = 0;
								this.selectItemList.splice(i, 1);
							} else {
								if (this.countNum() >= this.maxNum) {
									item.checkBoxs.selected = false;
									UserTips.ins().showTips("|C:0xf3311e&T:分配人数已满|");
									return;
								}
								item.checkBoxs.selected = true;
								this.selectItemList.push(item);
								item.chooseNum = 1;
							}
					}
					item.num1.text = item.chooseNum + "";
					this.setAddInfoShow(item, item.checkBoxs.selected);
					this.chooseNum.text = "已选择 " + this.countNum() + "/" + this.maxNum;
					this.sureBtn.enabled = this.countNum() == this.maxNum;
				}
				break;
		}
    }

	private setAddInfoShow(item: MemberItem3Renderer, show: boolean = false): void {
		item.btn1.visible = item.btn2.visible = item.num1.visible = item.inputBg.visible = show;
	}

	private toNumList(): void {
		if (this.selectItemList) {
			for (var k in this.selectItemList) {
				this.selectList.push(this.selectItemList[k].data.data);
				this.numList.push(this.selectItemList[k].chooseNum);
			}
		}
	}
}
ViewManager.ins().reg(SelectMemberPanelWin, LayerManager.UI_Popup);