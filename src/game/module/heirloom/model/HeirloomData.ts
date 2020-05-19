/**
 * HeirloomData
 */
class HeirloomData {

	private heirloomData:HeirloomInfo[];
	constructor() {
		this.heirloomData = [];
	}
	parser(bytes: GameByteArray) {
		for (let i: number = 0; i < 8; i++) {//部位索引=HeirloomSlot-1
			let lv:number = bytes.readInt();//等级
			if( !this.heirloomData[i] )
				this.heirloomData[i] = new HeirloomInfo();
			this.heirloomData[i].setInfo(i+1,lv);
		}
	}

	update(solt:number,lv:number){
		if( solt <= 0 || solt > 8 )return;//不存在这个范围
		let info:HeirloomInfo = this.heirloomData[solt-1];
		if( info ){
			info.setInfo(solt,lv);
		}
	}


	public getData():HeirloomInfo[]{
		return this.heirloomData;
	}
	public getInfoBySolt(index:number):HeirloomInfo{
		if( index >= 0 && index < 8 ){
			let info:HeirloomInfo = this.heirloomData[index];
			if( info ){
				return info;
			}
		}
		return null;
	}
	//获取某部位一级配置表数据
	public static getInfoBySoltFirst(index:number):HeirloomEquipConfig{
		if( index >= 0 && index < 8 ){
			let config:HeirloomEquipConfig = GlobalConfig.HeirloomEquipConfig[index+1][1];
			return config;
		}
		return null;
	}
	//获取部位名字
	public static getEquipName(index:number){
		let str:string = "";
		switch (index+1){
			case HeirloomSlot.wq:
				str = "武器";
				break;
			case HeirloomSlot.tk:
				str = "头盔";
				break;
			case HeirloomSlot.yf:
				str = "衣服";
				break;
			case HeirloomSlot.xl:
				str = "项链";
				break;
			case HeirloomSlot.hw:
				str = "护腕";
				break;
			case HeirloomSlot.yd:
				str = "腰带";
				break;
			case HeirloomSlot.jz:
				str = "戒指";
				break;
			case HeirloomSlot.xz:
				str = "鞋子";
				break;
		}
		return str;
	}
	public getSuitConfig(role:Role):HeirloomEquipSetConfig{
		let hinfos:HeirloomInfo[] = role.heirloom.getData();
		let minLv:number = 0;
		let everyLv:boolean = true;//判断是否每一件lv都>0
		for( let i = 0; i < hinfos.length; i++ ){
			let info:HeirloomInfo = hinfos[i];
			if( i == 0 )
				minLv = info.lv;
			if( !info.lv && everyLv )
				everyLv = false;
			if( info.lv <= minLv )
				minLv = info.lv;
		}
		let suitConfig:HeirloomEquipSetConfig;
		if( everyLv ){
			suitConfig = GlobalConfig.HeirloomEquipSetConfig[minLv];
		}

		return suitConfig;
	}

}

enum HeirloomSlot{
	wq = 1,//武器
	tk = 2,//头盔
	yf = 3,//衣服
	xl = 4,//项链
	hw = 5,//护腕
	yd = 6,//腰带
	jz = 7,//戒指
	xz = 8,//鞋子
}