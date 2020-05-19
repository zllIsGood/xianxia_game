/**
 * 跨服副本-无极战场-小地图
 * */
class WJBattleMinMapPanel extends BaseView {
	/**地图背景 */
	private mapBg: eui.Image;
	/**旗子点 */
	private flag1: eui.Image;
	private flag2: eui.Image;
	private flag3: eui.Image;

	private signList: eui.Image[];

	private flagRes: string[] = ["wj_gray_flag_icon", "wj_green_flag_icon", "wj_red_flag_icon"];
	private entityRes: string[] = ["wj_green_point", "wj_blue_point"];

	public constructor() {
		super();
	}
	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}
	public init() {
		this.signList = [];
	}
	public open(): void {


		TimerManager.ins().doTimer(300, 0, this.refreshCoordinate, this);
		this.observe(WJBattlefieldSys.ins().postRefCampFlag, this.refreshFlag, this);
	}
	public close(): void {
		TimerManager.ins().removeAll(this);
		this.signList = [];

	}
	/**刷新旗子 */
	private refreshFlag(): void {
		for (let i: number = 0; i < 3; i++) {
			if (WJBattlefieldSys.ins().flagInfos[i + 1]) {
				this['flag' + (i + 1)].source = WJBattlefieldSys.ins().flagInfos[i + 1] == 100 ? this.flagRes[1] : this.flagRes[2];
			}
			else this['flag' + (i + 1)].source = this.flagRes[0];
		}
	}
	/**刷新坐标 */
	private refreshCoordinate(): void {
		let list = EntityManager.ins().getAllEntity();
		for (let i in list) {
			let entity = list[i];

			if (entity.infoModel && !this.signList[entity.infoModel.handle]) {
				let isFlag: boolean = false;//是否为旗子
				if (isFlag) {
					
				}
				else {
					let entityImg: eui.Image = new eui.Image(this.entityRes[0]);
					entityImg.x = entity.x / 10 >> 0;
					entityImg.y = entity.y / 10 >> 0;
					//需要判断是否为己方，来显示不同颜色的红点

					this.addChild(entityImg);
					this.signList[entity.infoModel.handle] = entityImg;
				}
			}

			this.signList[entity.infoModel.handle].x = entity.x / 10 >> 0;
			this.signList[entity.infoModel.handle].y = entity.y / 10 >> 0;



		}

	}
}
