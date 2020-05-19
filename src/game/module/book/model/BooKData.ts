class BooKData {
	public id: number;
	public level: number = -1;
	public exp: number = 0;
	public number: number = 0;


	public updateData(bytes: GameByteArray) {
		this.level = bytes.readShort();
	}
	//roleJob=undefined就是对非职业图鉴进行判定
	public getNum(roleJob?:number): number {
		let id = GlobalConfig.CardConfig[this.id][0].itemId;
		let isHave = UserBag.ins().getItemCountById(0, id);
		if( isNaN(roleJob) ){
			//判断id是否是职业图鉴id 是就要看玩家是否开启了这个图鉴
			let suitId:number = Book.ins().getSuitIdByBookId(this.id);
			if( !suitId )
				return isHave;
			let tmproleJob = Book.jobs.indexOf(suitId);
			if( tmproleJob == -1 )//非职业图鉴
				return isHave;
			//职业图鉴
			//是否开启了这个职业图鉴对应的职业 没有则不让激活
			let isActRole:boolean;
			for( let i = 0;i<SubRoles.ins().subRolesLen;i++ ){
				let role:Role = SubRoles.ins().getSubRoleByIndex(i);
				if( !role )
					continue;
				if( role.job == (tmproleJob+1) ){
					isActRole = true;
					break;
				}
			}
			if( !isActRole )//玩家没有开通这个职业图鉴对应的职业角色
				return 0;

			return isHave;
		}

		//有图鉴判定是否是职业图鉴 是则判定这个图鉴是否是玩家已经有的角色 没有不让激活
		if( isHave ){
			//求出图鉴所属套装
			for( let k in GlobalConfig.SuitConfig ){
				let tmproleJob = Book.jobs.indexOf(Number(k));
				if( tmproleJob != -1 && GlobalConfig.SuitConfig[k][1].idList.indexOf(this.id) != -1){
					//是否开启了这个职业图鉴对应的职业 没有则不让激活
					for( let i = 0;i<SubRoles.ins().subRolesLen;i++ ){
						let role:Role = SubRoles.ins().getSubRoleByIndex(i);
						if( !role )
							continue;
						if( role.job == (roleJob+1) )
							return isHave;
					}
				}
			}
		}
		return 0;
	}

	public getItemId(): number {
		return GlobalConfig.CardConfig[this.id][0].itemId;
	}

	public canOpen(): boolean {
		return this.getNum() > 0;
	}

	public getNextLevelCost():number {
		if(this.level == -1) return 0;
		let nextConf = GlobalConfig.CardConfig[this.id][this.level + 1];
		if(nextConf) return nextConf.cost;
		return 0;
	}

	public getState(roleJob?:number): number {
		if (this.level > -1)
			return BookState.haveOpen;
		if (this.getNum(roleJob) > 0)
			return BookState.canOpen;
		else
			return BookState.noOpen;
	}

	
}