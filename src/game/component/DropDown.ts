class DropDown extends BaseComponent {

	private value: eui.Label;

	private btn: eui.ToggleButton;

	private list: eui.List;

	constructor() {

		super();
	}

	public childrenCreated(): void{
		this.init();
	}

	protected init(): void {

		// this.skinName = 'DropDownSkin';
		this.touchEnabled = true;
		this.currentState = 'up';
		this.addChangeEvent(this.list, this.listSelect);
		this.addTouchEvent(this, this.onTap);
		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeStage, this);

		this.list.itemRenderer = DropDownListItem;
	}

	private listSelect(e: egret.Event): void {

		this.value.text = this.list.selectedItem.name;
	}

	private removeStage(e?: egret.Event): void {
		if (this.stage)
			this.removeTouchEvent(this.stage, this.onTap);
	}

	private onTap(e: egret.Event): void {
		this.currentState = this.currentState == 'up' ? 'down' : 'up';

		e.stopPropagation();

		if (this.stage) {
			if (this.currentState == 'down')
				this.addTouchEvent(this.stage, this.onTap);
			else
				this.removeTouchEvent(this.stage, this.onTap);
		}
	}

	public setData(data: eui.ICollection) {
		this.list.dataProvider = data;
	}

	public setSelectedIndex(value: number) {
		this.list.selectedIndex = value;
	}

	public getSelectedIndex(): number {
		return this.list.selectedIndex;
	}

	public setLabel(str: string) {
		this.value.text = str;
	}

	public getLabel(): string {
		return this.value.text;
	}

	public setEnabled(b: boolean) {
		this.list.touchEnabled = b;
		this.list.touchChildren = b;
	}

	public getEnabled(): boolean {
		return this.list.touchEnabled;
	}

	destructor(): void {

		this.list.removeEventListener(egret.Event.CHANGE, this.listSelect, this);
		this.removeTouchEvent(this, this.onTap);
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeStage, this);
		this.removeStage();
	}
}

class DropDownListItem extends BaseItemRender {
	private nameLbl:eui.Label;
	constructor(){
		super();
	}

	dataChanged() {
		this.nameLbl.text = this.data.name;
	}
}