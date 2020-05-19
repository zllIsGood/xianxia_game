/**
 * Created by MPeter on 2017/12/16.
 * 小地图
 * */
class SmallMapPanel extends BaseView {

	/**地图背景 */
	private mapBg: eui.Image;
	/**前置边框图 */
	private frameImg: eui.Image;

	/**实体移动点标记对象列表 */
	private signList: eui.Image[];
	/**实体列表 */
	private _entityList: any;
	/**固定点对象列表 */
	private _fixedList: eui.Image[];
	/**固定点个数 */
	private _fixedMaxNum: number = 0;
	/**当前场景类型 */
	private _curSceneType: SmallSceneType;
	/**限制宽度 */
	private _limit_width: number = 200;
	/**限制高度 */
	private _limit_height: number = 0;


	/**地图变化尺寸频率*/
	private R_Scale: number = 0.58;
	/**移动侦听间隔时间 (毫秒)*/
	private MOVE_DELAY: number = 300;

	/**旗子资源 0未分配 1己方 2敌方 */
	private flagRes: string[] = ["wj_gray_flag_icon", "wj_green_flag_icon", "wj_red_flag_icon"];
	/**实体资源 0己方 1敌方*/
	private entityRes: string[] = ["wj_green_point", "wj_blue_point"];

	/** 
	 * @param limit_W 小地图限制宽度
	 * @param limit_H 小地图限制高度
	 * 注意：不要两个都填，非正方形地图，会显示很奇怪！
	*/
	public constructor(limit_W: number = 200, limit_H?: number) {
		super();

		if (limit_W) this._limit_width = limit_W;
		if (limit_H) this._limit_height = limit_H;
	}
	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.signList = [];
		this.initUI();
	}
	/**地图加载完毕 */
	private onMapComplete(e: egret.Event): void {
		//已200的宽度为主
		if (this._limit_width)
			this.R_Scale = this._limit_width / this.mapBg.width;
		else if (this._limit_height)
			this.R_Scale = this._limit_height / this.mapBg.height;

		//计算当前地图的尺寸
		this.mapBg.width *= this.R_Scale;
		this.mapBg.height *= this.R_Scale;
		//设置前置框宽高
		this.frameImg.width = this.mapBg.width;
		this.frameImg.height = this.mapBg.height;

		//因为比例值需要在加载完地图后才能算出，所以必须放在后面
		this.initFixedP();
	}
	/**打开面板 */
	public open(type: SmallSceneType): void {
		this._curSceneType = type;
		//TODO:不能用监听移动事件，用定时器遍历
		// this.observe(GameLogic.ins().postMoveEntity, this.refreshCoordinate);
		this.observe(GameLogic.ins().postCOEntity, this.calcPlayMainEntityList);
		this.observe(WJBattlefieldSys.ins().postRefCampFlag, this.refreshFixedP);

		this.calcPlayMainEntityList();
		this.refreshCoordinate();
		this.refreshFixedP();

		//实时侦听移动坐标
		TimerManager.ins().doTimer(this.MOVE_DELAY, 0, this.refreshCoordinate, this);
	}
	/**关闭面板 */
	public close(): void {
		this.signList = [];
		TimerManager.ins().remove(this.refreshCoordinate, this);
	}
	/**初始化UI */
	private initUI(): void {
		//固定点处理
		this._fixedList = [];
		switch (this._curSceneType) {
			case SmallSceneType.WJBattle://无极战场
				this._fixedMaxNum = 3;
				for (let i: number = 0; i < this._fixedMaxNum; i++) {
					this._fixedList[i] = new eui.Image();
					this._fixedList[i].source = this.flagRes[0];
					//一般以图标底部中间为中心点，需要调整中心点，由于图标一般会打包成图集，毕竟基本会预加载，所以可直接通过宽高来设定
					this._fixedList[i].anchorOffsetX = this._fixedList[i].width >> 1;
					this._fixedList[i].anchorOffsetY = this._fixedList[i].height;
					let pos = GlobalConfig.WujiBaseConfig.flagPoint[i];
					this._fixedList[i].x = pos.x * GameMap.CELL_SIZE / 10 * this.R_Scale;
					this._fixedList[i].y = pos.y * GameMap.CELL_SIZE / 10 * this.R_Scale;
					this.addChild(this._fixedList[i]);
				}
				break;
		}

		//构造地图
		this.mapBg = new eui.Image();
		this.mapBg.source = `map/${GameMap.getFileName()}/small.jpg`;
		this.mapBg.addEventListener(egret.Event.COMPLETE, this.onMapComplete, this);
		this.addChildAt(this.mapBg, 0);
	}
	/**初始化固定坐标 */
	private initFixedP(): void {
		switch (this._curSceneType) {
			case SmallSceneType.WJBattle://无极战场
				for (let i: number = 0; i < this._fixedMaxNum; i++) {
					let pos = GlobalConfig.WujiBaseConfig.flagPoint[i];
					this._fixedList[i].x = pos.x * GameMap.CELL_SIZE / 10 * this.R_Scale;
					this._fixedList[i].y = pos.y * GameMap.CELL_SIZE / 10 * this.R_Scale;
				}
				break;
		}
	}

	/**刷新固定点坐标 */
	private refreshFixedP(): void {
		switch (this._curSceneType) {
			case SmallSceneType.WJBattle:
				for (let i: number = 0; i < this._fixedMaxNum; i++) {
					if (WJBattlefieldSys.ins().flagInfos[i + 1]) {
						this._fixedList[i].source = WJBattlefieldSys.ins().flagInfos[i + 1] == 100 ? this.flagRes[1] : this.flagRes[2];
					}
					else this._fixedList[i].source = this.flagRes[0];
				}
				break;
		}

	}
	/**
	 * 刷新坐标
	 * TODO:注意，需要优化性能，先屏蔽了
	 */
	private refreshCoordinate(): void {
		// for (let i in this._entityList) {
		// 	let entity = this._entityList[i];
        //
		// 	if (entity.infoModel && !this.signList[entity.infoModel.handle]) {
		// 		if (entity.infoModel.type != EntityType.Role) continue;
        //
		// 		let entityImg: eui.Image = new eui.Image();
		// 		//需要判断是否为己方，来显示不同颜色的红点
		// 		let isMe: boolean = (<Role>entity.infoModel).camp == WJBattlefieldSys.ins().myCampId;
		// 		if (isMe) {
		// 			entityImg.source = this.entityRes[0];
		// 		}
		// 		else entityImg.source = this.entityRes[1];
        //
		// 		entityImg.anchorOffsetX = entityImg.width >> 1;
		// 		entityImg.anchorOffsetY = entityImg.height >> 1;
        //
		// 		this.addChild(entityImg);
		// 		this.signList[entity.infoModel.handle] = entityImg;
        //
		// 	}
        //
		// 	this.signList[entity.infoModel.handle].x = entity.x / 10 * this.R_Scale >> 0;
		// 	this.signList[entity.infoModel.handle].y = entity.y / 10 * this.R_Scale >> 0;
		// }
	}


	//////////////////////////////////////
	/**计算玩家主实体列表 */
	private calcPlayMainEntityList(): any {
		let list: any = {};

		let teams: any = {};
		let entityList = EntityManager.ins().getAllEntity();
		for (let i in entityList) {
			let entity = entityList[i];
			if (entity && entity.infoModel) {
				//只统计人类
				if (entity.infoModel.type != EntityType.Role) continue;
				let role: Role = entity.infoModel;
				if (!teams[role.name]) teams[role.name] = [];
				teams[role.name].push(entity);
			}

		}

		///////////////////////////////////////////////
		for (let s in teams) {
			let team: CharMonster[] = teams[s];
			///根据职业排序
			team.sort((a: CharMonster, b: CharMonster): number => {
				if ((<Role>a.infoModel).job < (<Role>b.infoModel).job) return -1;
				if ((<Role>a.infoModel).job > (<Role>b.infoModel).job) return 1;
				return 0;
			})
			let mainEntity = team[0];
			list[mainEntity.infoModel.handle] = mainEntity;
		}
		this._entityList = list;
		return list;
	}
}

/**小场景类型 */
enum SmallSceneType {
	/**无极战场 */
	WJBattle
}
