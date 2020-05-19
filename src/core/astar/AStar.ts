/**
 * A*寻路实现类
 * 阅读此代码必须具备A*算法的理论知识
 * @author WynnLam
 *
 */
class AStar {
	/**
	 * 寻路算法有关的常量定义
	 *
	 */
	static RMOVECOST: number = 14;//倾斜方向的移动耗费
	static DMOVECOST: number = 10;//直线方向的移动耗费
	static AS_MOVECOST: any[] = [AStar.DMOVECOST, AStar.RMOVECOST];

	// 7	0   1
	// 6		2
	// 5	4   3
	static NEIGHBORPOS_X_VALUES: number[] = [0, 1, 1, 1, 0, -1, -1, -1];//用于快速计算临近坐标值的优化数据
	static NEIGHBORPOS_Y_VALUES: number[] = [-1, -1, 0, 1, 1, 1, 0, -1];//用于快速计算临近坐标值的优化数据
	/**
	 * 类成员定义
	 */
	private m_LastOpenCell: ASMapCell;//最后一个开启的格子
	private m_ASMapCells: ASMapCell[];//网格地图格子列表，格子的访问索引为：y * Width + x
	private m_nWidth: number;//地图宽度
	private m_nHeight: number;//地图高度
	private m_nMarkTag: number = 0;//寻路优化成员，免去循环初始化所有节点的开销

	public constructor(map: MapGrid = null) {
		if (map) {
			this.initFromMap(map);
		}
	}

	/**
	 * 从地图中初始化
	 * @param map
	 *
	 */
	public initFromMap(map: MapGrid): void {
		let nOldCount: number = 0;
		if (this.m_ASMapCells)
			nOldCount = this.m_ASMapCells.length;
		else this.m_ASMapCells = [];

		this.m_nWidth = map.numCols;
		this.m_nHeight = map.numRows;

		//如果现有数组的格子数量少于新数量则扩展数组
		let nNewCount: number = this.m_nWidth * this.m_nHeight;
		if (nNewCount > this.m_ASMapCells.length)
			this.m_ASMapCells.length = nNewCount;
		for (let i: number = nOldCount; i < nNewCount; ++i) {
			this.m_ASMapCells[i] = new ASMapCell;
		}
		//初始化每个坐标格子
		let x: number, y: number, idx: number;
		let cell: ASMapCell;
		idx = 0;
		for (y = 0; y < this.m_nHeight; ++y) {
			for (x = 0; x < this.m_nWidth; ++x) {
				cell = this.m_ASMapCells[idx];
				cell.X = x;
				cell.Y = y;
				cell.CanNotMove = !map.isWalkableTile(x, y);
				idx++;
			}
		}
	}

	/**
	 * 寻路
	 * @param fromX 起始坐标X
	 * @param fromY 起始坐标Y
	 * @param targetX 目的地坐标X
	 * @param targetY 目的地坐标Y
	 * @return 路径点数组
	 *
	 */
	public getPatch(fromX: number, fromY: number, targetX: number, targetY: number): any {
		if (fromX == targetX && fromY == targetY)
			return null;
		if (fromX < 0 || fromX >= this.m_nWidth || fromY < 0 || fromY >= this.m_nHeight)
			debug.log("寻路的起始位置参数无效：(" + fromX + ", " + fromY + ")");
		if (targetX < 0 || targetX >= this.m_nWidth || targetY < 0 || targetY >= this.m_nHeight)
			debug.log("寻路的目的位置参数无效：(" + targetX + ", " + targetY + ")");
		let ac: ASMapCell = this.m_ASMapCells[targetY * this.m_nWidth + targetX];
		if (!ac || ac.CanNotMove) {
			// Assert(false, `寻路异常，无法获得路径点，请确认服务器地图与前端配置一致。mapId:${GameMap.mapID},x:${targetX},y:${targetY},fx:${fromX},fy:${fromY}`);
			return null;
		}

		this.reset(fromX, fromY);

		if(this.pathLine({x:fromX,y:fromY},{x:targetX,y:targetY})) {
			return [new AStarNode(targetX,targetY,DirUtil.get8DirBy2Point({x: fromX, y: fromY}, {
				x: targetX,
				y: targetY
			}))]
		}

		let boPathFound: Boolean = false;
		let nCurX: number = fromX;
		let nCurY: number = fromY;
		let curCell: ASMapCell = this.m_ASMapCells[nCurY * this.m_nWidth + nCurX];

		curCell.GCost = 0;
		curCell.LastX = -1;
		curCell.LastY = -1;
		curCell.X = nCurX;
		curCell.Y = nCurY;
		curCell.MarkTag = this.m_nMarkTag;
		curCell.HCost = Math.abs(targetX - fromX) + Math.abs(targetY - fromY) * 10;

		let i: number;
		let nX: number, nY: number;
		let cell: ASMapCell;

		while (true) {
			if (nCurX == targetX && nCurY == targetY) {
				boPathFound = true;
				break;
			}

			if (curCell.State != ASMapCell.CSCLOSE) {
				this.closeCell(curCell);
			}

			//遍历当前位置周围的8个格子
			for (i = 0; i < 8; ++i) {
				nX = nCurX + AStar.NEIGHBORPOS_X_VALUES[i];
				nY = nCurY + AStar.NEIGHBORPOS_Y_VALUES[i];
				if (nX < 0 || nX >= this.m_nWidth || nY < 0 || nY >= this.m_nHeight)
					continue;
				cell = this.m_ASMapCells[nY * this.m_nWidth + nX];
				if (cell.CanNotMove)
					continue;
				//cell.MarkTag与当前的m_nMarkTag不同，也视为是未开启状态
				if (cell.MarkTag != this.m_nMarkTag || cell.State == ASMapCell.CSNONE) {
					cell.MarkTag = this.m_nMarkTag;
					cell.LastX = nCurX;
					cell.LastY = nCurY;
					cell.btDir = i;
					cell.GCost = curCell.GCost + AStar.AS_MOVECOST[i & 1];
					cell.HCost = Math.abs(targetX - nX) + Math.abs(targetY - nY) * 10;
					this.openCell(cell);
				}
				else if (cell.State == ASMapCell.CSOPEN) {
					if (cell.GCost > curCell.GCost + AStar.AS_MOVECOST[i & 1]) {
						cell.LastX = nCurX;
						cell.LastY = nCurY;
						cell.btDir = i;
						cell.GCost = curCell.GCost + AStar.AS_MOVECOST[i & 1];
						this.reopenCell(cell);
					}
				}
			}

			//curCell = bestCell();
			curCell = this.m_LastOpenCell;
			if (curCell == null)
				break;

			nCurX = curCell.X;
			nCurY = curCell.Y;
		}

		if (boPathFound) {
			let Result: any[] = new Array();
			let lastNode:AStarNode;
			while (true) {
				if (lastNode && curCell && lastNode.nDir == curCell.btDir) {
					// lastNode.nX = curCell.X;
					// lastNode.nY = curCell.Y;
				} else {
					lastNode = new AStarNode(curCell.X, curCell.Y, curCell.btDir);
					Result.push(lastNode);
				}
				curCell = this.m_ASMapCells[curCell.LastY * this.m_nWidth + curCell.LastX];
				if ((curCell.LastX <= 0 && curCell.LastY <= 0) || curCell.MarkTag != this.m_nMarkTag)
					break;

			}
			return Result;
		}
		return null;
	}

	public pathLine(pt1:{x:number,y:number}, pt2:{x:number,y:number}) {
		let last = pt1;

		let k = 0;
		if (pt2.x == pt1.x) k = 1;
		else k = (pt2.y - pt1.y) * 1.0 / (pt2.x - pt1.x); // 直线方程 y = kx + b
		let b = pt2.y - k * pt2.x;

		// 第一个点先加进去
		let dx = pt2.x > pt1.x ? 1 : -1;	// x方向
		let dy = pt2.y > pt1.y ? 1 : -1;	// y方向

		let px = pt1.x + (dx > 0 ? 1 : 0);

		let loop = Math.abs(pt1.x - pt2.x);

		let pos = pt2;

		// i <= loop 多循环一次 是由于算法是在x轴方向上遍历递增，
		// 所以有可能在最后的点和pt2的x坐标相等，但y方向有差距的情况，所以最后循环是补全y轴的点
		for (let i = 0; i <= loop; i++, px += dx)
		{
			if (i != loop)
			{
				// x轴方向递增，每次计算出经过的格子
				pos.x = dx > 0 ? px : px - 1;
				pos.y = Math.floor(k * pos.x + b);
			}

			if (last.y != pos.y)
			{
				for (let j = last.y + dy;; j += dy)
				{
					if (!GameMap.checkWalkable(last.x, j))
					{
						return false;
					}
					if (j == pos.y) break;
				}
			}

			// i == loop 的情况下，point点其实是已经判断过了
			if (i != loop)
			{
				//OutputMsg(rmTip, "test PathLine. (%d,%d)->(%d,%d) path: (%d,%d)",
				//	pt1.x, pt1.y, pt2.x, pt2.y, pos.x, pos.y);
				if (!GameMap.checkWalkable(pos.x,pos.y))
				{
					return false;
				}
			}
			last = pos;
		}

		return true;
	}


/**
	 * 寻路开始的时候重置起点数据
	 * @param cX
	 * @param cY
	 *
	 */
	private reset(cX: number, cY: number): void {
		let cell: ASMapCell = this.m_ASMapCells[cY * this.m_nWidth + cX];
		cell.LastX = 0;
		cell.LastY = 0;
		cell.HCost = 0;
		cell.GCost = 0;
		cell.FValue = 0;
		cell.State = 0;
		cell.Prev = null;
		cell.Next = null;
		cell.btDir = 0;

		this.m_LastOpenCell = null;
		this.m_nMarkTag = this.m_nMarkTag + 1;
		/**
		 * 如果地图尺寸较大，会在此产生过多的时间开销，造成卡的显现。
		 * 已经使用MarkTag优化，在寻路的期间进行检测和重新初始化。
		 *
		 //将每个格子的状态设为空闲
		 for (let i: int = m_nWidth * m_nHeight - 1; i>-1; --i)
		 {
			 cell = m_ASMapCells[i];
			 cell.LastX = -1;
			 cell.State = ASMapCell.CSNONE;
		 }**/
	}

	/**
	 * 关闭指定的格子
	 * @param cell
	 *
	 */
	private closeCell(cell: ASMapCell): void {
		//如果格子已经开启则进行路径链表的移除操作
		if (cell.State == ASMapCell.CSOPEN) {
			if (cell.Prev)
				cell.Prev.Next = cell.Next;
			if (cell.Next)
				cell.Next.Prev = cell.Prev;
			if (cell == this.m_LastOpenCell)
				this.m_LastOpenCell = cell.Prev;
		}
		cell.State = ASMapCell.CSCLOSE;
	}

	/**
	 * 开启指定的格子
	 * @param cell
	 *
	 */
	private openCell(cell: ASMapCell): void {
		cell.State = ASMapCell.CSOPEN;
		let nFValue: number = cell.HCost + cell.GCost;
		cell.FValue = nFValue;

		let lastCell: ASMapCell = this.m_LastOpenCell;
		if (!lastCell) {
			this.m_LastOpenCell = cell;
			cell.Prev = null;
			cell.Next = null;
		}
		else {
			//开启格子的时候在已开启的格子链表中按移动估价值进行排序
			while (lastCell.FValue < nFValue) {
				if (lastCell.Prev == null) {
					lastCell.Prev = cell;
					cell.Prev = null;
					cell.Next = lastCell;
					return;
				}
				lastCell = lastCell.Prev;
			}

			//添加到当前开启格子链表的末尾
			cell.Prev = lastCell;
			if (lastCell.Next) {
				cell.Next = lastCell.Next;
				lastCell.Next.Prev = cell;
				lastCell.Next = cell;
			}
			else {
				cell.Next = null;
				lastCell.Next = cell;
				this.m_LastOpenCell = cell;
			}
		}
	}

	/**
	 * 重新开启指定的格子更新移动估价值并重新再已开启格子链表中排序
	 * @param cell
	 *
	 */
	private reopenCell(cell: ASMapCell): void {
		let nFValue: number = cell.HCost + cell.GCost;
		cell.FValue = nFValue;

		let nextCell: ASMapCell = cell.Next;
		if (nextCell && nextCell.FValue > nFValue) {
			do {
				nextCell = nextCell.Next;
			}
			while (nextCell && nextCell.FValue > nFValue);

			if (cell.Prev)
				cell.Prev.Next = cell.Next;
			if (cell.Next)
				cell.Next.Prev = cell.Prev;

			if (nextCell) {
				cell.Next = nextCell;
				if (nextCell.Prev) {
					cell.Prev = nextCell.Prev;
					nextCell.Prev.Next = cell;
				}
				else cell.Prev = null;
				nextCell.Prev = cell;
			}
			else {
				cell.Prev = this.m_LastOpenCell;
				cell.Next = null;
				this.m_LastOpenCell.Next = cell;
				this.m_LastOpenCell = cell;
			}
		}
	}
}

/**
 * A*寻路类地图中的坐标格子
 * 同时也作为寻路搜索过程中的路径点链表节点
 * 格子在寻路对象将按照链表的方式依据移动估价值进行排序
 * @author Miros
 *
 */
class ASMapCell {
	/**
	 * 格子状态值定义
	 *
	 */
	static CSNONE: number = 0;//未处理的格子
	static CSOPEN: number = 1;//格子已经开启
	static CSCLOSE: number = 2;//格子已经关闭

	public X: number;//格子的X坐标
	public Y: number;//格子的Y坐标
	public CanNotMove: boolean;//是否不可移动
	public MarkTag: number;//用于优化寻路算法效率，免去循环初始化所有节点的开销
	/**
	 * 寻路计算过程中的相关参数
	 */
	public LastX: number;//上一个格子的X坐标
	public LastY: number;//下一个格子的Y坐标
	public HCost: number;
	public GCost: number;
	public FValue: number;//距离目标格子的估价值
	public State: number;//状态，表示空闲、开启或关闭
	public Prev: ASMapCell; //上一个格子
	public Next: ASMapCell; //下一个格子
	public btDir: number;
}