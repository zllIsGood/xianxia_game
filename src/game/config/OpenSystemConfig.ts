class OpenSystemConfig {
	//功能ID
	public id: number = 0;
	//转数
	public openzs: number = 0;
	//开启等级
	public openlevel: number = 0;
	//开启关卡
	public opencheck: number = 0;
	//0功能关闭 1根据条件判断开启
	public judge:number;
	//0大于等于前边限制条件 1小于等于前边限制条件
	public than:number;
	public funName:string;

	public pf: string[];
}