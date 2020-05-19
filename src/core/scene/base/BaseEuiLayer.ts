/**
 * Created by yangsong on 15-1-7.
 */
class BaseEuiLayer extends eui.Group {
	public constructor() {
		super();

		this.percentWidth = 100;
		this.percentHeight = 100;

		if (adapterIphoneX()) {
			// ipx适配处理
			this.horizontalCenter = 0;
			this.top = 52;
			this.bottom = 38;
		}

		this.touchEnabled = false;

	}
}