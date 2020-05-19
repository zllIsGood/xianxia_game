class ChatSystemData extends ChatDataBase{
	public type:number;
	public str:string;
	public lv: number;


	public constructor(type:number, str:string) {
		super();
		this.type = type;
		this.str = str;
	}
}