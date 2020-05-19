
/**
 * A*寻路返回的路径点 
 * @author WynnLam
 * 
 */
class AStarNode {
	public nX: number;//路径点的X坐标
	public nY: number;//路径点的Y坐标
	public nDir: number;//上一个路径点到此路径点的移动方向
		
	constructor(x: number,y: number,dir: number) {
		this.nX = x;
		this.nY = y;
		this.nDir = dir;
	}
}