class ShenqiSelectItemWin extends BaseView {
	
	public piece:eui.List;

	constructor() {
		super();
	}
	public open(...param: any[]) {
		
		// this.currentState = //"2" "4" "5" "6" "8"
	}
	

	public setData(len:number): void {
		this.currentState = len.toString();

	}
	protected dataChanged(): void {


	}


}
