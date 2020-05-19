/**
 * 轮回合成左边面板按钮
 * Created by Peach.T on 2017/12/18.
 */
class SamsaraComposeMenuItem extends BaseItemRender {

	public nameLabel: eui.Label;

	public list: eui.List;
	public redPoint: eui.Image;
	public rein_equips: eui.Image;

	public constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	public init() {
		this.list.itemRenderer = SamsaraComposeSecMenuItem;
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListChange, this);
	}

	private onListChange(): void {
		let data = this.list.selectedItem;
		let compose:any = (ViewManager.ins().getView(BagWin) as BagWin).reinComposePanel;
		//compose.updateView(data.type, data.zsLv, SamsaraModel.ins().getComposeEquipId(data.type, data.zsLv));
		compose.unSelectList();
		(this.list.getElementAt(this.list.selectedIndex) as SamsaraComposeSecMenuItem).setSelect(true);
	}

	public selectList(index: number): void {
		this.list.selectedIndex = index;
		let item = (this.list.getElementAt(this.list.selectedIndex) as SamsaraComposeSecMenuItem);
		item.selected = true;
		item.setSelect(true);
	}

	protected dataChanged(): void {
		let type: number = this.data;
	//	this.nameLabel.text = `${GlobalConfig.ReincarnationBase.headName[type - 1]}.轮回装备`;
	//	this.list.dataProvider = new ArrayCollection(SamsaraModel.ins().getComposeZsList(type));
	//	this.redPoint.visible = SamsaraModel.ins().isCanTypeCompose(type);
		if (type == 1) {
			this.rein_equips.source = "rein_equip_shen";
		} else {
			this.rein_equips.source = "rein_equip_sheng";
		}
	}
}
