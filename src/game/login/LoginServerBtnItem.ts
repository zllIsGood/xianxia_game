class LoginServerBtnItem extends BaseItemRender {

	private labelDisplay: eui.Label;
    
	constructor() {
		super();
		this.skinName = "BtnServerSkin";
	}

	public dataChanged(): void {
		// console.log(this.data);
        this.labelDisplay.text = this.data.name;
	}
}