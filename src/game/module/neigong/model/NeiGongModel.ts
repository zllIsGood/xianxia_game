class NeiGongModel extends BaseClass {

	public static ins(): NeiGongModel {
		return super.ins() as NeiGongModel;
	}

	//内功的数据
	public neiGongList: NeiGongData[] = [];

	public checkRedPoint(){
		if (Object.keys(NeiGong.ins().isActList).length == 0) return false;
		let len: number = SubRoles.ins().subRolesLen;
		let b = false;
		for (let i: number = 0; i < len; i++) {

			let cost: number = 0;
			let data = NeiGongModel.ins().neiGongList[i];
			
			let cruLevelCfg = GlobalConfig.NeiGongStageConfig[data.stage][data.level];
			let discount: number = GlobalConfig.MonthCardConfig.neiGongGoldPrecent / 100;
			let addValue: number = Recharge.ins().getIsForeve() ? 1 - discount : 1;
			if (!data.canMix) {
				cost = Math.floor(cruLevelCfg.costMoney * addValue);
			}
			
			let a = NeiGong.ins().isActList[i].act == 0 && UserFb.ins().guanqiaID > GlobalConfig.NeiGongBaseConfig.openGuanqia;
			if(a){

				if (Actor.gold >= cost) {
					b = true; 
					break;
				}
				
			}
		}
		return b;
	}

	public canUp(): boolean {
		if (UserFb.ins().guanqiaID < GlobalConfig.NeiGongBaseConfig.openGuanqia) return false;
		let len: number = Math.min(SubRoles.ins().subRolesLen, this.neiGongList.length);
		for (let i: number = 0; i < len; i++) {
			if (this.canUpById(i))
				return true;
		}
		return false;
	}

	public canUpById(id: number): boolean {
		if (this.neiGongList[id]) {
			if ( UserFb.ins().guanqiaID <= GlobalConfig.NeiGongBaseConfig.openGuanqia )
				return false;
			if (this.neiGongList[id].stage >= GlobalConfig.NeiGongBaseConfig.maxStage)
				return false;
			if (this.neiGongList[id].canMix || this.neiGongList[id].getCanLevelUp())
				return true;
		}
		return false;
	}
}

class NeiGongData {
	public roleId: number = 0;
	//等级
	public level: number = 0;
	//阶级
	public stage: number = 0;
	//经验
	public exp: number = 0;

	public canMix: boolean;

	public parse(bytes: GameByteArray): void {
		this.level = bytes.readInt();
		this.stage = bytes.readInt();
		this.exp = bytes.readInt();
		let cruLevelCfg: NeiGongStageConfig = GlobalConfig.NeiGongStageConfig[this.stage][this.level];
		this.canMix = this.level > 0 && this.level % GlobalConfig.NeiGongBaseConfig.levelPerStage == 0;
	}
	/**从能够升级变成能够升一阶**/
	public getCanLevelUp(): boolean {
		// let cruLevelCfg: NeiGongStageConfig = GlobalConfig.NeiGongStageConfig[this.stage][this.level];
		// return !this.canMix && cruLevelCfg && cruLevelCfg.costMoney <= Actor.gold;
		let cruLevelCfg: NeiGongStageConfig = GlobalConfig.NeiGongStageConfig[this.stage][this.level];
		if( !cruLevelCfg )
			return false;
		// if( !cruLevelCfg.addExp )
		// 	return false;
		// if( !this.exp ){
		// 	//足够刚好点5次升一阶
		// 	return Actor.gold >= cruLevelCfg.costMoney*5 && Actor.gold>=1000000;
		// }else{
		// 	return false;//不能点够5次
		// }

		// let nextExp:number = this.exp + cruLevelCfg.addExp;
		// if( nextExp >= cruLevelCfg.totalExp ){//升一阶
		// 	//大于等于一百万也提示
		// 	return (!this.canMix && cruLevelCfg && cruLevelCfg.costMoney <= Actor.gold) || (Actor.gold>=1000000);
		// }else{
		// 	return false;
		// }

		//足够升一阶而且大于等于一百万
		let difexp:number = cruLevelCfg.totalExp - this.exp;
		let count:number = Math.ceil(difexp/cruLevelCfg.addExp);
		return Actor.gold >= count*cruLevelCfg.costMoney && Actor.gold>=1000000;

	}

}