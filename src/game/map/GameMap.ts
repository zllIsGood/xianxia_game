/**
 *
 * 地图网格辅助类
 */
class GameMap {

	/** 当前地图格子大小 */
	public static CELL_SIZE: number = 64;
	/** 当前地图最大宽度 */
	public static MAX_WIDTH: number;
	/** 当前地图最大高度 */
	public static MAX_HEIGHT: number;
	public static COL: number;
	public static ROW: number;

	/** 格子数据 */
	private static grid: MapGrid;
	/** A* */
	private static aStar: AStar;

	/** 地图mData文件包 */
	private static mapZip: Map<MapInfo>;

	/** 副本id */
	private static _fubenID: number;
	/** 地图id */
	public static mapID: number;

	public static mapX: number;
	public static mapY: number;
	/**副本类型,对应fbMgr中的FB开头的枚举 */
	public static fbType: number = 0;

	public static fbName: string;
	public static fbDesc: string;

	/** 安全区 */
	public static SafetyZone: Map<XY>;

	/** 初始化 */
	static init(data: Map<MapInfo>): void {
		this.grid = this.grid || new MapGrid;
		this.aStar = this.aStar || new AStar;
		this.mapZip = data;
	}

	/** 更新数据 */
	static update(): void {
	}

	/**
	 * 移动实体
	 * @param entity
	 * @param endX
	 * @param endY
	 */
	static moveEntity(entity: CharMonster, endX: number, endY: number, isStraightLine: boolean = false): void {

		let size: number = GameMap.CELL_SIZE;

		let sx: number = Math.floor(entity.x / size);
		let sy: number = Math.floor(entity.y / size);
		let tx: number = Math.floor(endX / size);
		let ty: number = Math.floor(endY / size);

		// if (sx == endX && sy == endY) {
		//	 let nextPoint: egret.Point = new egret.Point(endX * size + (size >> 1),
		//		 endY * size + (size >> 1));
		//	 let xbX: number = nextPoint.x - entity.x;
		//	 let xbY: number = nextPoint.y - entity.y;
		//	 let xb: number = Math.sqrt(xbX * xbX + xbY * xbY);
		//	 if (xb) {
		//		 entity.playAction(EntityAction.RUN);
		//		 let t: egret.Tween = egret.Tween.get({
		//			 "onChange": this.checkEntityAlpha,
		//			 "onChangeObj": { '_this': this, 'entity': entity }
		//		 }
		//		 );
		//		 t.to({
		//			 "x": nextPoint.x,
		//			 "y": nextPoint.y
		//		 },
		//			 xb / entity.moveSpeed * 1000).call(() => {
		//				 entity.playAction(EntityAction.STAND);
		//			 }, this);
		//	 }
		//	 return;
		// }

		let path: AStarNode[];

		if (isStraightLine) {
			path = [new AStarNode(endX, endY, DirUtil.get8DirBy2Point({ x: entity.x, y: entity.y }, {
				x: endX,
				y: endY
			}))];
		}
		else if (sx == tx && sy == ty)
			path = [new AStarNode(tx, ty, DirUtil.get8DirBy2Point({ x: entity.x, y: entity.y }, {
				x: endX,
				y: endY
			}))];
		else {
			path = this.aStar.getPatch(sx, sy, tx, ty);
			if (!path) {
				// Assert(false, `寻路异常，mapId:${GameMap.mapID},fbid:${GameMap.fubenID},fbType:${GameMap.fbType},sx:${sx},sy:${sy},tx:${tx},ty:${ty}`);
				return;
			}
		}

		GameLogic.ins().postMoveEntity(entity, path, !isStraightLine);

	}

	/**
	 * 获取一个路径参数为网格坐标
	 * @param fromX
	 * @param fromY
	 * @param targetX
	 * @param targetY
	 */
	static getPatch(fromX: number, fromY: number, targetX: number, targetY: number): any {
		let path: AStarNode[] = this.aStar.getPatch(fromX, fromY, targetX, targetY);
		return path;
	}

	/**
	 * 全体人员去到某个点
	 * @param tx
	 * @param ty
	 * @param fun
	 * @param funThis
	 */
	static myMoveTo(tx: number, ty: number, fun: Function = null, funThis: any = null): void {
		let len: number = SubRoles.ins().subRolesLen;
		let char: CharRole;
		for (let i: number = 0; i < len; i++) {
			char = EntityManager.ins().getMainRole(i);
			if (char)
				this.moveEntity(char, tx, ty);
		}

		let tempFunc: Function = function () {
			let isCom: boolean = true;
			for (let i: number = 0; i < len; i++) {

				char = EntityManager.ins().getMainRole(i);
				if (char && char.action == EntityAction.RUN) {
					if (MathUtils.getDistance(char.x, char.y, tx, ty) < 20) {
						char.stopMove();
						char.playAction(EntityAction.STAND);
					}
					isCom = false;
				}
			}
			if (isCom) {
				TimerManager.ins().remove(tempFunc, this);
				fun && fun.call(funThis);
			}
		};

		TimerManager.ins().doTimer(500, 0, tempFunc, this);
	}

	//最后一个点是随机坐标
	static moveTo(endX: number, endY: number, checkAgin: boolean = true) {
		let size: number = GameMap.CELL_SIZE;
		let tx: number = Math.floor(endX / size);
		let ty: number = Math.floor(endY / size);

		if (SysSetting.ins().getValue("mapClickTx") == tx && SysSetting.ins().getValue("mapClickTy") == ty && checkAgin) {
			return false;
		}

		SysSetting.ins().setValue("mapClickTx", tx);
		SysSetting.ins().setValue("mapClickTy", ty);

		if (!this.checkWalkable(tx, ty)) {
			return false;
		}
		let role = EntityManager.ins().getNoDieRole();
		if (!role) {
			return false;
		}
		//如果被晕眩，也不可移动
		if (role.hasBuff(BUFF_GROUP.NUMB)) {
			UserTips.ins().showTips(`被晕眩，无法移动`);
			return false;
		}


		let sx: number = Math.floor(role.x / size);
		let sy: number = Math.floor(role.y / size);
		let path = this.aStar.getPatch(sx, sy, tx, ty);
		if (!path || path.length == 0) {
			return false;
		}
		let lastNode: AStarNode = path[0];
		lastNode.nX = endX;
		lastNode.nY = endY;
		GameLogic.ins().sendFindPathToServer(role.infoModel.handle, path, false);
		return true;
	}


	/** 检查是否不可移动 */
	static checkWalkable(x: number, y: number): boolean {
		let rtn = false;
		let node: MapGridNode = this.grid.getNode(x, y);
		if (!node) {
			(debug.log("地图:" + this.mapID + "副本:" + this._fubenID + "坐标:" + x + "," + y + "出现问题!"));
		} else {
			rtn = node.walkable;
		}
		return rtn;
	}

	/** 检查是否需要透明 */
	static checkAlpha(x: number, y: number): boolean {
		let rtn = false;
		let node: MapGridNode = this.grid.getNode(x, y);
		if (!node) {
			(debug.log("地图:" + this.mapID + "副本:" + this._fubenID + "坐标:" + x + "," + y + "出现问题!"));
		} else {
			rtn = node.hidden;
		}
		return rtn;

	}

	public static lastFbTyp: number = 0;
	public static lastFbId: number = 0;

	public static parser(bytes: GameByteArray): void {
		this.lastFbId = this.fubenID;
		this.fubenID = bytes.readInt();
		this.mapID = bytes.readInt();
		this.mapX = bytes.readShort();
		this.mapY = bytes.readShort();
		this.lastFbTyp = this.fbType;
		this.fbType = bytes.readByte();

		this.fbName = bytes.readString();
		this.fbDesc = bytes.readString();

		let mapName: string = this.getFileName();
		if (Assert(this.mapZip, `GameMap parser error: mapZip undefined name:${mapName}`)) return;
		let mapInfo = this.mapZip[mapName];
		// this.CELL_SIZE = mapInfo.title_wh;
		// this.MAX_HEIGHT = mapInfo.pixHeight;
		// this.MAX_WIDTH = mapInfo.pixWidth;
		this.COL = mapInfo.maxX;
		this.ROW = mapInfo.maxY;
		this.grid.initMapInfo(mapInfo, GameMap.getTurn());
		this.aStar.initFromMap(this.grid);

		this.MAX_WIDTH = this.COL * this.CELL_SIZE;
		this.MAX_HEIGHT = this.ROW * this.CELL_SIZE;

		this.SafetyZone = {};
		let cfg = GlobalConfig.ScenesConfig[this.mapID];
		for (let i = 0; cfg.area && i < cfg.area.length; i++) {
			let area = cfg.area[i];
			let attr = area.attr;
			for (let j = 0; j < attr.length; j++) {
				switch (attr[j].type) {
					//计算安全区
					case 0:
						this.safetyCalculate(area);
						break;
				}
			}
		}

		egret.localStorage.setItem("lastMapID", this.mapID + "");
	}

	private static safetyCalculate(area) {
		let p = area.grids;
		let left = Number.MAX_VALUE;
		let top = Number.MAX_VALUE;
		let right = Number.MIN_VALUE;
		let botton = Number.MIN_VALUE;
		let isHas = false;
		for (let i = 0; i < p.length; i++) {
			let p1 = p[i];
			let p2 = i + 1 == p.length ? p[0] : p[i + 1];
			let ps = BresenhamLine.tileLine(p1.x, p1.y, p2.x, p2.y);
			for (let k = 0; k < ps.length; k += 2) {
				let x = ps[k];
				let y = ps[k + 1];
				this.SafetyZone[y * GameMap.CELL_SIZE + x] = { x: x, y: y };
				isHas = true;
			}

			left = Math.min(p1.x, left);
			right = Math.max(p1.x, right);
			top = Math.min(p1.y, top);
			botton = Math.max(p1.y, botton);
		}
		if (isHas) {
			for (let i = top; i <= botton; i++) {
				let start;
				let end;
				for (let j = left; j <= right; j++) {
					if (this.SafetyZone[i * GameMap.CELL_SIZE + j]) {
						start = j;
						break;
					}
				}
				for (let j = right; j >= left; j--) {
					if (this.SafetyZone[i * GameMap.CELL_SIZE + j]) {
						end = j;
						break;
					}
				}
				if (!isNaN(start) && !isNaN(end)) {
					for (let j = start + 1; j <= end; j++) {
						this.SafetyZone[i * GameMap.CELL_SIZE + j] = { x: i, y: j };
					}
				}
			}
		}
	}

	/***
	 * 检查是否在安全区
	 * @param {XY} xy
	 * @returns {boolean}
	 */
	public static checkSafety(xy: XY): boolean {
		return !!this.SafetyZone[xy.y * GameMap.CELL_SIZE + xy.x];
	}

	public static get fubenID(): number {
		return this._fubenID;
	}

	public static set fubenID(value: number) {
		this._fubenID = value;
		if (value > 0) {
			GameLogic.ins().postHookStateChange(GameLogic.HOOK_STATE_HOOK);
		}
	}

	//是否在主场景
	public static sceneInMain(): boolean {
		return GameMap.fbType == 0 && GameMap.fubenID == 0;
	}

	//是否自动合击
	public static autoPunch(): boolean {
		return GlobalConfig.ScenesConfig[this.mapID].autoPunch == 1;
	}
	
	//是否在矿洞
	public static sceneInMine(): boolean {
		return GameMap.fbType == 0 && GameMap.fubenID != 0;
	}

	public static canStartAI(): boolean {
		return GameMap.fbType == 0;
	}

	public static getFileName(): string {
		return GlobalConfig.ScenesConfig[this.mapID].mapfilename;
	}

	public static getTurn(): number {
		return GlobalConfig.ScenesConfig[this.mapID].turn;
	}

	/** 获取相对于目标的坐标矩形 */
	static getRectangle(target: CharMonster, x: number, y: number): egret.Rectangle {
		let _x = target.x + (x - 0.5) * GameMap.CELL_SIZE;
		let _y = target.y + (y - 0.5) * GameMap.CELL_SIZE;
		return new egret.Rectangle(_x, _y, GameMap.CELL_SIZE, GameMap.CELL_SIZE);
	}

	/**
	 * 获取坐标内的怪物列表
	 */
	static getIncludeElement(target: CharMonster, points: egret.Point[], charList: CharMonster[]): CharMonster[] {
		let list: CharMonster[] = [];
		for (let k in points) {
			let re = GameMap.getRectangle(target, points[k].x, points[k].y);
			for (let p in charList) {
				let char = charList[p];
				if (char.x >= re.x && char.y >= re.y && char.x < re.x + re.width && char.y < re.y + re.height) {
					list.push(char);
				}
			}
		}
		return list;
	}

	/**
	 * 通过下标及长宽获取相对坐标
	 * @param index
	 * @param w
	 * @param h
	 * @returns {egret.Point}
	 */
	static getPoint(index: number, w: number, h: number): egret.Point {
		let y = Math.floor(index / w) - Math.floor(h / 2);
		let x = Math.floor(index % w) - Math.floor(w / 2);
		return new egret.Point(x, y);
	}

	/**
	 * 获取目标的下标
	 * @param sour
	 * @param target
	 * @param width
	 * @param height
	 * @returns {number}
	 */
	static getTargetIndex(sour: CharMonster, target: CharMonster, width: number, height: number): number {
		let aX = target.x - sour.x + GameMap.CELL_SIZE * (width / 2);
		let aY = target.y - sour.y + GameMap.CELL_SIZE * (height / 2);
		let x = Math.floor(aX / GameMap.CELL_SIZE);
		let y = Math.floor(aY / GameMap.CELL_SIZE);
		return width * y + x;
	}

	/** 检查是否不可移动 ,参数为像素点*/
	static checkWalkableByPixel(x: number, y: number): boolean {
		let mapX: number = Math.floor(x / GameMap.CELL_SIZE);
		let mapY: number = Math.floor(y / GameMap.CELL_SIZE);
		return GameMap.checkWalkable(mapX, mapY);
	}

	/**
	 * 返回随机一个在>=range范围的格子
	 * @param px 格子x
	 * @param py 格子y
	 * @param range 多少格子范围外的
	 * @returns {any}
	 */
	static getPosRange(px, py, range: number) {

		let _x = MathUtils.limitInteger(-range, +range);
		let _y = MathUtils.limitInteger(-range, +range);
		if (+_x != +range) {
			_y = Math.random() < 0.5 ? -range : range;
		}

		let count = 0;
		let i = _x, j = _y;
		while (true) {
			let walk: boolean = GameMap.checkWalkable(px + i, py + j);
			if (walk) {
				return [px + i, py + j];
			}
			//格子顺时针检查
			if (i == range && j < range) { //右
				j += 1;
			} else if (j == range && i > -range) { //下
				i -= 1;
			} else if (i == -range && j > -range) { //左
				j -= 1;
			} else if (j == -range && i < range) { //上
				i += 1;
			}
			if (i == _x && j == _y) { //回到最初的格子则向外加一个格子
				if (_x == range) {
					i = _x = range + 1;
				}
				if (_x == -range) {
					i = _x = -range - 1;
				}
				if (_y == range) {
					j = _y = range + 1;
				}
				if (_y == -range) {
					j = _y = -range - 1;
				}
				range += 1;
			}
			count += 1;
			if (count > 100) {
				break;
			}
		}
		return [px, py];
	}

	//获取当前方向（dir）距离（px,py） （range）个格子的 格子
	static getPosRangeByDir(px, py, dir: number, range: number) {
		let _px = px, _py = py;
		if ((dir >= 0 && dir <= 1) || dir == 7) {
			_py -= range;
		}
		if (dir >= 3 && dir <= 5) {
			_py += range;
		}
		if (dir >= 1 && dir <= 3) {
			_px += range;
		}
		if (dir >= 5 && dir <= 7) {
			_px -= range;
		}
		return [_px, _py, GameMap.checkWalkable(_px, _py)];
	}

	/**
	 * 获取目标点到方向格子的格子
	 * @param x 目标点
	 * @param y 目标点
	 * @param dir 目标点（x,y)到当前点（需要求的）的方向
	 * @returns {any[]}
	 */
	static getPosRangeRandom(x, y, dir: number, range: number = 1) {
		let px = GameMap.point2Grip(x);
		let py = GameMap.point2Grip(y);

		let arr = [dir];

		let random = Math.random();
		if (random > 0.66) { //-1
			dir = dir - 1 < 0 ? 7 : dir - 1;
			arr.unshift(dir);
			if (random > 0.8) {
				arr.push((dir + 2) % 8);
			} else {
				arr.splice(1, 0, (dir + 2) % 8);
			}
		} else if (random > 0.33) { //+1
			dir = dir + 1 > 7 ? 0 : dir + 1;
			arr.unshift(dir);
			if (random > 0.5) {
				arr.push((dir - 2 + 8) % 8);
			} else {
				arr.splice(1, 0, (dir - 2 + 8) % 8);
			}
		}

		let isGetPoint = false;
		let pos;
		for (let i = 0; i < arr.length; i++) {
			pos = GameMap.getPosRangeByDir(px, py, arr[i], range);
			if (pos[2]) {
				isGetPoint = true;
				break;
			}
		}
		if (!isGetPoint) {
			pos = GameMap.getPosRange(px, py, range);
		}

		return pos;
	}

	static point2Grip(x) {
		return Math.floor(x / GameMap.CELL_SIZE);
	}

	static grip2Point(px) {
		return px * GameMap.CELL_SIZE + (GameMap.CELL_SIZE >> 1);
	}
}