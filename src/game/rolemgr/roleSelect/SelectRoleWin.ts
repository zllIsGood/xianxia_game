class SelectRoleWin extends BaseEuiView {

	private btnStart: eui.Button;
	private list: eui.List;

	constructor() {
		super();
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "SelectRoleSkin";
		this.list.itemRenderer = SelectRoleItem;
	}

	public open(...param: any[]) {
		this.addTouchEvent(this.btnStart, this.onStartGame);
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);

		let list:SelectRoleData[] = param[0];
		list.sort((a,b)=>{
			return a.power < b.power ? 1 : -1;
		});

		this.list.dataProvider = new eui.ArrayCollection(list);
		this.list.selectedIndex = 0;
	}

	private onTap(e:eui.ItemTapEvent) {
		this.list.selectedIndex = e.itemIndex;

		let dataPro = this.list.dataProvider as eui.ArrayCollection;
		dataPro.source.forEach((item,index)=>{
			dataPro.itemUpdated(item);
		});
	}

	public close(...param: any[]) {
		this.removeTouchEvent(this.btnStart, this.onStartGame);
		this.list.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTap, this);
	}

	private onStartGame() {
		var _data = this.list.getVirtualElementAt(this.list.selectedIndex) as SelectRoleItem;
		RoleMgr.ins().sendEnterGame(_data.data.id);
		// App.ControllerManager.applyFunc(ControllerConst.StartGame, StartGameFunc.SEND_ENTER_GAME, _data.data.id)
	}
}
ViewManager.ins().reg(SelectRoleWin, LayerManager.UI_Main);