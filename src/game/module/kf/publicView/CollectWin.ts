/**
 * Created by MPeter on 2018/1/17.
 * 跨服战场-采集进度条
 */
class CollectWin extends BaseEuiView {
	public progressGroup: eui.Group;
	public progressBar: eui.ProgressBar;
	public barBg1: eui.Image;
	public state: eui.Label;
	public effGroup: eui.Group;

	/**值特效 */
	private bgmc: MovieClip;

	public constructor() {
		super();
		this.skinName = `CollectSkin`;
		this.progressBar.labelFunction = (value, maximum): string => {
			return '';
		}

	}

	protected childrenCreated(): void {
		this.init();
	}

	public init() {
		this.progressBar.value = 0;
		this.progressBar.minimum = 0;
		// this.progressBar.visible = false;

		// this.bgmc = new MovieClip();
		// this.bgmc.playFile(RES_DIR_EFF + "jindutiaoeff1", -1);
		// this.bgmc.scaleY = 2;
		// this.bgmc.scaleX = 1.25;
		// this.effGroup.height = 50;
		// this.effGroup.scrollEnabled = true;
		// this.effGroup.addChild(this.bgmc);
	}

	public open(...param): void {
		this.state.text = `${Actor.myName} 正在采集中...`;
		egret.Tween.removeTweens(this.effGroup);
		this.effGroup.scaleX = 0;
		egret.Tween.get(this.effGroup).to({scaleX: 1}, param[1] * 1000);
		

		this.progressBar.maximum = (param[1]-1) * 1000;
		TimerManager.ins().doTimer(50,param[1]*20,function () {
			this.progressBar.value += 50;
		},this);
	}

	public close(...param): void {
		egret.Tween.removeTweens(this.effGroup);
	}
}

ViewManager.ins().reg(CollectWin, LayerManager.UI_Popup);