/**觉醒dwl */
class AwakenPanel extends BaseEuiView {
	public closeBtn: eui.Button;
	public yulan: eui.Group;
	public item0: RoleItem;
	public btnSuit: eui.Button;
	public powerPanel: PowerPanel;
	public attr: AttrUpgradePanel;
	public stageStarView: StageStarView;
	public labNum: eui.Label;
	public btnAwaken: eui.Button;
	public redPoint: eui.Image;
	public labTip: eui.Label;
	public labMax: eui.Label;
	public itemImage: eui.Image;
	public costGrp: eui.Group;
	public getItemTxt: eui.Label;

	public curRole: number;		   //当前角色
	private itemRes = [
		"common1_icon_wuqi",// 武器
		"common1_icon_toubu",// 头部
		"common1_icon_yifu",//  衣服
		"common1_icon_xianglian",// 项链
		"common1_icon_huwan",// 护腕
		"common1_icon_yaodai",//腰带
		"common1_icon_jiezhi",// 戒指
		"common1_icon_xiezi"// 鞋子
	];

	public constructor() {
		super();
		this.skinName = 'equipjuexingSkin';
		this.isTopLevel = true;
	}

	protected childrenCreated() {
		super.childrenCreated();
		this.init();	
	}

	public init() {
		
		for (let i = 1; i < 9; i++) {
			this[`item` + i].name = i;
			this.addTouchEvent(this[`item` + i], this.itemTouch);
		}
		this.getItemTxt.textFlow = (new egret.HtmlTextParser).parser(`<u>${this.getItemTxt.text}</u>`);

		this.awakenMaxLv = Object.keys(GlobalConfig.AwakenAttrConfig[0]).length;
		this.stageStarView.create(this.awakenMaxLv);
		this.addTouchEvent(this.btnSuit, this.suitTouch);
		this.addTouchEvent(this.btnAwaken, this.awakenTouch);
		this.observe(UserForge.ins().postAwaken, this.update);
		this.addTouchEvent(this.getItemTxt, this.onGetItem);
	}

	private onGetItem(e: TouchEvent): void {
		UserWarn.ins().setBuyGoodsWarn(this.awakenCondition.itemId);
	}

	public open(...param: any[]) {
		this.curRole = param[0]
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		this.awakenDatas = roleData.awakenData;
		if (!this.awakenDatas) return;
		this.selectIndex = -1;
		this.update(true);
	}

	public close() {
		this.selectIndex = -1;
	}

	private awakenDatas: AwakenData;
	private refreshState = false;
	private update(state: boolean = false) {
		this.refreshState = state;
		this.powerPanel.setPower(this.awakenDatas.getTotalPower());
		//显示装备位置剪影、阶级、红点
		for (let i = 1; i < 9; i++) {
			let itemIcon: AwakenIcon = this[`item` + i];
			itemIcon.imgIcon.source = this.itemRes[i - 1];
			itemIcon.redPoint.visible = this.awakenDatas.getRedPoint(i);
			itemIcon.lvtxt.text = this.awakenDatas.posLevel[i - 1] == 0 ? '' : `${this.awakenDatas.posLevel[i - 1]}阶`;
		}
		this.itemTouch(null);
	}

	private itemIndex: number = 0;
	private selectIndex: number = -1;
	private oldTarget: AwakenIcon;
	private awakenMaxLv: number = 0;
	private awakenCondition: AwakenCondition;
	private itemTouch(e: egret.TouchEvent) {
		if (!e) {
			this.itemIndex = this.itemIndex == 0 ? UserForge.ins().getCanUpIndex(this.curRole) : this.itemIndex;
		} else {
			this.itemIndex = +e.currentTarget.name;
		}
		if (this.selectIndex == this.itemIndex && this.refreshState) return;
		this.selectIndex = this.itemIndex;
		if (this.awakenDatas.isMaxLevel(this.itemIndex)) {
			this.labMax.visible = true;
			this.costGrp.visible = false;
		} else {
			this.awakenCondition = this.awakenDatas.getCondition(this.itemIndex);
			let curNum = UserBag.ins().getItemCountById(0, this.awakenCondition.itemId);
			let str = curNum >= this.awakenCondition.needItemNum ? `|C:0x35e62d&T:${curNum}|/${this.awakenCondition.needItemNum}` : `|C:0xf3311e&T:${curNum}|/${this.awakenCondition.needItemNum}`;
			this.labNum.textFlow = TextFlowMaker.generateTextFlow(str);
			let item: ItemConfig = GlobalConfig.ItemConfig[this.awakenCondition.itemId];
			if (Assert(item, `item is err form awaken`)) return;
			this.itemImage.source = `${item.icon}_png`;
			this.costGrp.visible = true;
			this.labMax.visible = false;
			let needLv = '';
			if (this.awakenCondition.needZs != 0 && UserZs.ins().lv < this.awakenCondition.needZs) {
				needLv = `${this.awakenCondition.needZs}转`;
			}
			if (Actor.level < this.awakenCondition.needLv) {
				needLv += `${this.awakenCondition.needLv}级`;

			}
			needLv = needLv != '' ? `角色等级需要${needLv}` : '';
			this.labTip.textFlow = TextFlowMaker.generateTextFlow(`|C:0xf3311e&T:${needLv}|`);
		}
		//属性显示
		let cur = this.awakenDatas.getAttrs(this.itemIndex, this.awakenDatas.posLevel[this.itemIndex - 1]);
		let next = this.awakenDatas.getAttrs(this.itemIndex, this.awakenDatas.posLevel[this.itemIndex - 1] + 1);
		this.attr.showAttr(cur, next);

		this.stageStarView.update(this.awakenDatas.posLevel[this.itemIndex - 1]);
		this.redPoint.visible = this.awakenDatas.getRedPoint(this.itemIndex);

		if (this.oldTarget) this.oldTarget.select.visible = false;
		let target: AwakenIcon = this[`item` + this.itemIndex];
		target.select.visible = true;
		this.oldTarget = target;

		//预览显示 
		let model: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let element: EquipsData = model.getEquipByIndex(this.itemIndex - 1);
		if (element.item.configID == 0) {
			this.item0.clear();
			this.item0.setItemImg(this.itemRes[this.itemIndex - 1]);
			return;
		}
		this.item0.setModel(model);
		this.item0.setCurRole(this.curRole);
		this.item0.setIndex(this.itemIndex - 1);
		this.item0.setAwakenLevel(this.awakenMaxLv);
		this.item0.data = element.item;
		this.item0.isShowTips(true);
	}

	private suitTouch() {
		ViewManager.ins().open(AwakenSuitTipWin, this.awakenDatas.getSuitData());
	}

	private awakenTouch() {
		let condition: AwakenCondition = this.awakenDatas.getCondition(this.itemIndex);
		if (condition.needZs != 0 && condition.needZs > UserZs.ins().lv) {
			UserTips.ins().showTips(`角色等级需要${condition.needZs}转`);
			return;
		}
		let curNum = UserBag.ins().getItemCountById(0, condition.itemId);
		if (curNum < condition.needItemNum) {
			UserTips.ins().showTips(`道具不足`);
			return;
		}
		UserForge.ins().sendAwaken(this.curRole, this.itemIndex - 1);
	}
}