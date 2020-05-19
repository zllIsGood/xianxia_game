/** 玉佩数据 */
class JadeDataNew {
	
	/** 玉佩等级 */
	public lv:number = 0;

	/** 经验值 */
	public exp:number = 0;

	/** 提升丹使用数据 */
	public danDate:Object;

	private _skillList:SkillData[];
	private _isUpdate:boolean = true;
	
	public constructor() {
	}

	public parser(bytes:GameByteArray):void
	{
		this.lv = bytes.readShort();
		this.exp = bytes.readShort();
		
		let len:number = bytes.readShort();
		this.danDate = new Object();
		for (let i:number = 0; i < len; i++)
			this.danDate[bytes.readInt()] = bytes.readShort();
			//this.danDate[i] = {id:bytes.readInt(), count:bytes.readShort()};
		this._isUpdate = true;
		
	}

	public parserOther(bytes:GameByteArray):void
	{
		this.lv = bytes.readShort();
		this._isUpdate = true;
	}

	public getSkillList() {
		if(this._isUpdate) {
			this._isUpdate = false;
			this._skillList = [];
			let skills = JadeNew.ins().getSkillsByLv(this.lv);
			if (skills) {
				for (let skillId of skills)
					this._skillList.push(new SkillData(skillId));
			}
		}
		return this._skillList;
	}
}