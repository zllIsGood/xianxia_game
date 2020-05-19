/**
 * Created by MPeter on 2017/12/16.
 * 跨服-切换服务器中提示窗口
 */
class ServerSwitchIngWin extends BaseEuiView {
	/**切换提示标签 */
	private switchLabel: eui.Label;
	public progressGroup: eui.Group;
	public progressBar: eui.ProgressBar;
	public effGroup: eui.Group;
	public barBg: eui.Image;


	private symbolStrs: string[] = [`.`, '..', '...'];
	private _tick: number = 0;

	public constructor() {
		super();
		this.skinName = `KFSwitchServerSkin`;
		this.progressBar.maximum = 20;
		this.progressBar.value = 0;
	}

	public open(...args): void {
		this._tick = 0;
		if (!TimerManager.ins().isExists(this.onTime, this))
			TimerManager.ins().doTimer(100, 0, this.onTime, this);
	}

	static redClose(): void {
		let win = <ServerSwitchIngWin>ViewManager.ins().getView(ServerSwitchIngWin);
		if (win) win.redClose();
	}

	public redClose(): void {
		this.progressBar.value = this.progressBar.maximum;
		if (!TimerManager.ins().isExists(this.closeWin, this))
			TimerManager.ins().doTimer(1000, 1, this.closeWin, this);
	}

	private onTime(): void {
		this._tick += 1;
		this.switchLabel.text = KFServerSys.ins().isKFServ ? `正在前往跨服...` : `正在回到本服...`;
		this.progressBar.value = this._tick;
		if (this._tick > 20) {
			TimerManager.ins().remove(this.onTime, this);
		}
	}

	public close(...args): void {
		TimerManager.ins().removeAll(this);
		this.progressBar.value = 0;
	}
}

ViewManager.ins().reg(ServerSwitchIngWin, LayerManager.UI_Tips);
