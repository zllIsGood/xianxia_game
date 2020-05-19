/**
 * 限时任务数据
 */
class LimitTaskData {
	public id: number = 0;
	public name: string = "";
	public desc: string = "";
	public target: number = 0;
	public awardList: any[];
	public control: number = 0;
	public controlTarget: any[];
	public type:number = 0;

	public state:number = 0;
	public progress:number = 0;

	public setBaseData(obj:any):void
	{
		if(obj == void 0)return;
		this.id = obj.id;
		this.name = obj.name;
		this.desc = obj.desc;
		this.target = obj.target;
		this.awardList = obj.awardList;
		this.control = obj.control;
		this.controlTarget = obj.controlTarget;
		this.type = obj.type;
	}

	public parser(bytes: GameByteArray): void {
		this.progress = bytes.readInt();
		this.state = bytes.readByte();
	}	
}