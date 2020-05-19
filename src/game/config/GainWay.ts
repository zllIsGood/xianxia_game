/**
 * 道具途径
 */
class GainWay extends Array{
	
	//途径名字
	public get gainName():string
	{
		return this[0] as string;
	}
	//窗口名
	public get winName():string
	{
		return this[1] ? this[1] as string : undefined;
	}
	//打开的页面
	public get page():number
	{
		return this[2] ? this[2] as number : 0;
	}
}
