/**
 * 地图网格节点
 * @author WynnLam
 *
 */
class MapGridNode {
	///////////////////////////////
	//网格节点标识定义
	///////////////////////////////
	/**
	 * 可移动标记位
	 */
	static FLAG_WALKABLE: number = 0x8000;
	/**
	 * 遮挡标记位
	 */
	static FLAG_HIDDEN: number = 0x4000;

	public bgImgIndex: number;//地表层图片编号
	public objImgInex: number;//物体层图片编号
	public flags: number;//节点标识
	public objImgCate: number;//物体层图片分类
	public objImgType: number;//物体层图片类型，0-jpg，1-png
	public effectId: number;//特效编号
	public effectWidth: number;//特效宽度，占的地图x坐标数
	public effectHeight: number;//特效高度，占的地图y坐标数

	public bgImg: egret.DisplayObject;//该节点的地砖图片引用
	public bdImg: egret.DisplayObject;//该节点的建筑图片引用

	/**
	 * 遮挡标记。true-遮挡，false-不遮挡
	 * @return
	 *
	 */
	public get hidden(): boolean {
		return (this.flags & (1 << 1)) > 0;
	}

	/** 移动标记。true-可移动，false-不可移动 */
	public get walkable(): boolean {
		return (this.flags & (1 << 0)) > 0;
	}
}