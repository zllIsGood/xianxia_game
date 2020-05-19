/**
 * 地图网格类
 * 具备读取地图网格信息功能
 * @author WynnLam
 *
 */
class MapGrid extends egret.Sprite {
	/**
	 * @private
	 * 地图网格节点
	 */
	protected _nodes: MapGridNode[][];

	/**
	 * @private
	 * 列数，即地图的水平坐标数
	 */
	protected _numCols: number;//

	/**
	 * @private
	 * 行数，即地图的垂直坐标数
	 */
	protected _numRows: number;//


	/**调试输出方法*/
	public debugTrace: any;

	private _poolNodes: MapGridNode[];

	/**
	 * 构造函数
	 *
	 */
	constructor() {
		super();
		this.touchEnabled = false;
		this._poolNodes = [];
	}

	///////////////////////
	//getter and setter
	//////////////////////
	/**
	 * 网格列数，即地图的水平坐标数
	 * @return

	 */
	public get numCols(): number {
		return this._numCols;
	}

	/**
	 * 网格行数，即地图的垂直坐标数
	 * @return
	 *
	 */
	public get numRows(): number {
		return this._numRows;
	}

	////////////////////
	//公有方法
	////////////////////
	/**
	 * 获取指定坐标的网格节点
	 * @param x x坐标
	 * @param y y坐标
	 * @return 返回网格节点

	 */
	public getNode(x: number, y: number): MapGridNode {
		if (this._nodes && this._nodes[x])
			return this._nodes[x][y];
		else
			return undefined;
	}

	/**
	 * 判断指定的格子是否可移动
	 * @param x 格子x坐标
	 * @param y 格子y坐标
	 * @return
	 *
	 */
	public isWalkableTile(x: number, y: number): boolean {
		if (x < 0 || x >= this._numCols || y < 0 || y >= this._numRows)
			return false;
		else return this._nodes[x][y].walkable;
	}

	/**
	 * 释构
	 *
	 */
	public destruct(): void {
		this.clearNodes();
	}

	/////////////////////////////////////
	//保护方法
	////////////////////////////////////
	/**
	 * 初始化网格
	 * 这里可以使用对象池技术进行优化
	 */
	public initMapInfo(mapInfo: MapInfo, turn: number): void {

		//清除现有数据并重设网格尺寸
		if (this._nodes) this.clearNodes();
		//保存网格行列数
		this._numRows = mapInfo.maxY;
		this._numCols = mapInfo.maxX;
		//创建新的网格节点列表
		this._nodes = [];
		//读取网格节点信息
		let node: MapGridNode;
		for (let i: number = 0; i < this._numCols; i++) {
			this._nodes[i] = [];
			for (let j: number = 0; j < this._numRows; j++) {
				node = this.getGridNode();
				node.flags = mapInfo.grids[i * this._numRows + j];
				this._nodes[i][j] = node;
			}
		}

		if (turn) this._nodes.reverse();
	}

	/**
	 * 清除节点数据
	 *
	 */
	protected clearNodes(): void {
		for (let i in this._nodes) {
			this._poolNodes = this._poolNodes.concat(this._nodes[i]);
			this._nodes[i].length = 0;
		}
		this._nodes.length = 0;
	}

	protected getGridNode(): MapGridNode {
		return this._poolNodes.pop() || new MapGridNode();
	}

	/**
	 * 内部调试输出方法
	 * @param args
	 *
	 */
	protected _trace(...args): void {
		if (this.debugTrace != null) this.debugTrace.apply(null, args);
	}
}