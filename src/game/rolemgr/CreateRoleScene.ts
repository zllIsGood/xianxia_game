/**
 *
 * @author
 *
 */
class CreateRoleScene extends BaseScene {
	/**
	 * 构造函数
	 */
	public constructor() {
		super();
	}

	/**
	 * 进入Scene调用
	 */
	public onEnter(): void {
		super.onEnter();

		this.addLayer(LayerManager.UI_Main);
		this.addLayer(LayerManager.UI_Tips);
		this.addLayer(LayerManager.UI_Popup);
		
		if (adapterIphoneX()) {
			ViewManager.ins().adaptationIpx();
		}

		ViewManager.ins().open(CreateRoleView);

		ReportData.getIns().report("entercreaterole",ReportData.LOAD);
		// // 播放背景音乐
		SoundManager.ins().playBg("login_mp3");
	}

	/**
	 * 退出Scene调用
	 */
	public onExit(): void {
		super.onExit();
	}
}
