/**
 *
 * @author
 *
 */
class ScenesConfig {

	/** 场景id */
	public sceneid: number;
	/** 场景文件名字 */
	public mapfilename: string;
	public x: number;
	public y: number;
	public bossX: number;
	public bossY: number;
	public turn: number = 0;
	public npc: { id: number, x: number, d: number, y: number }[];
	area: {attr:{type:number}[],grids:{y:number,x:number}[]}[];
	//area: { attr: number[], grids: XY[] }[];
	effPos: { pos: XY[], eff: string }[];
	weather: number;
	jumpList: XY[][];
	public autoPunch:number = 0;
}
