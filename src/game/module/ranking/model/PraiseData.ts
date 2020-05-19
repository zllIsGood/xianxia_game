/**
 * 膜拜
 */

class SubRole {
	public job: number;
	public sex: number;
	public clothID: number;
	public swordID: number;
	public wingLevel: number;
	public pos1: number = 0;
	public pos2: number = 0;
	public pos3: number = 0;

	public parser(bytes: GameByteArray): void {
		this.job = bytes.readByte();
		this.sex = bytes.readByte();
		this.sex = this.job == JobConst.ZhanShi ? 0 : 1;
		this.clothID = bytes.readInt();
		this.swordID = bytes.readInt();
		this.wingLevel = bytes.readInt();
		if (bytes.readInt() == 0) {
			this.wingLevel = -1;
		}
		this.pos1 = bytes.readInt();
		this.pos2 = bytes.readInt();
		this.pos3 = bytes.readInt();
	}
}

class PraiseData {
	public id: number;	   //唯一id
	public name: string;	   //名字
	public ce: number;	   //战力
	public level: number;		//等级
	public zhuan: number;	 //转生次数
	public vipLevel: number;		//vip等级

	public subRole: SubRole[] = [];

	public praiseTime: number;	 //膜拜次数

	public getLastMobaiNum(): number {
		let index = UserZs.ins().lv > 0 ? UserZs.ins().lv * 1000 : Actor.level;
		let maxPraiseTime = GlobalConfig['MorshipConfig'][index].count;
		return maxPraiseTime - this.praiseTime;
	}


	/**
	 * 详细数据处理
	 * @param bytes
	 */
	public parser(bytes: GameByteArray): void {
		this.id = bytes.readInt();
		if (this.id > 0) {
			this.name = bytes.readString();
			this.ce = bytes.readDouble();
			this.level = bytes.readShort();
			this.zhuan = bytes.readShort();
			this.vipLevel = bytes.readShort();

			let num = bytes.readShort();

			for (let i = 0; i < num; i++) {
				this.subRole[i] = new SubRole;
				this.subRole[i].parser(bytes);
			}
		}
	}

	/**
	 * 根据职业获取对应的子角色形象
	 */
	public getRoleByJob(job: number): SubRole {
		if (job > 0) {
			for (let i in this.subRole) {
				if (this.subRole[i].job == job)
					return this.subRole[i];
			}
		}
		return this.subRole[0];
	}
}
