class RuneBookItemRenderer extends BaseItemRender {
	public lbName: eui.Label;
	// public itemIcon: ItemIcon;
	private white:BaseComponent;
	private green:BaseComponent;
	private purple:BaseComponent;
	private orange:BaseComponent;
	private red:BaseComponent;
	private keys:string[] = ['red','orange','purple','green','white'];
	public constructor() {
		super();
		this.skinName = 'RuneOverViewItem';
	}

	public dataChanged(): void {
		let data = this.data as RuneBookItemData;
		if (data.title) {
			this.currentState = 'title';
			this.lbName.text = data.title;
		} else {
			let rbc: RuneConverConfig = data.data;
			if (rbc) {
				if (rbc.checkpoint == 0) {
					this.currentState = 'rune';
				} else {
					this.currentState = 'nune_lock';
					let config = GlobalConfig.FbChallengeConfig[rbc.checkpoint];
					this.lbName.text =  `通关通天塔${GlobalConfig.FbChNameConfig[config.group].name}解锁`;
				}

				let maxId = rbc.id;
				for (let i = 0; i < this.keys.length; i++) {
					let id = maxId - 100 * i;
					let icon:RuneDisplay = this[this.keys[i]] as RuneDisplay;
					icon.setDataByItemConfig(GlobalConfig.ItemConfig[id]);
				}
			}
		}
	}
}

class RuneBookItemData {
	data:RuneConverConfig;
	title:string;
	private _itemConfig: ItemConfig;
	constructor(data?:RuneConverConfig,title?:string){
		this.data = data;
		this.title = title;
		if( this.data ){
			this._itemConfig = GlobalConfig.ItemConfig[this.data.id];
		}
	}
	public getItemConfig(): ItemConfig {
		return this._itemConfig;
	}
}