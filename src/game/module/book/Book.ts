class Book extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.Book;
		this.regNetMsg(1, this.postDataChange);
		this.listBook = {};
		this.itemBook = {};
	}
	public static jobs:number[] = [6,7,8];//战法道专属图鉴套装id
	private listBook: {[key:string]:BooKData};
	public itemBook: {[itemId:number]:BooKData[]};
	// public attrs: AttributeData[] = [];
	private bookPower:number = 0;
	public score:number = -1;

	public static ins(): Book {
		return super.ins() as Book;
	}
	//通过图鉴配置id获取套装id(用于区分职业套装和非职业套装用)
	public getSuitIdByBookId(id:number):number{
		let cardConfig:CardConfig = GlobalConfig.CardConfig[id][0];
		if( !cardConfig )
			return 0;

		for( let k in GlobalConfig.SuitConfig ){
			if( GlobalConfig.SuitConfig[k][1].idList.indexOf(id) != -1){
				return Number(k);
			}
		}
		return 0;
	}
	//通过套装id返回玩家身上集齐了几件
	public getSuitNum(suitId): number {
		let conf = GlobalConfig.SuitConfig[suitId][1];
		let num = 0;
		for (let i = 0; i < conf.idList.length; i++) {
			let bookData = this.getBookById(conf.idList[i]);
			if (bookData.level > -1) {
				num++;
			}
		}
		return num;
	}
	//返回套装等级
	public getSuitLevel(suitId: number): number {
		let num = this.getSuitNum(suitId);
		let level = 0;
		let index = 1;
		while (GlobalConfig.SuitConfig[suitId][index]) {
			if (GlobalConfig.SuitConfig[suitId][index].count <= num) {
				level = GlobalConfig.SuitConfig[suitId][index].level;
			}
			index++;
		}
		return level;
	}

	//可激活
	public getBookRed(): boolean {
		for (let key in GlobalConfig.BookListConfig) {
			let idList = GlobalConfig.BookListConfig[key].idList;
			for (let i of idList) {
				let element = GlobalConfig.SuitConfig[i][1].idList;
				for (let id of element) {
					if (this.getBookById(id).getState() == BookState.canOpen)
						return true;
				}
			}
		}

		return false;
	}

	public getBookUpRed():boolean {
		for (let key in GlobalConfig.BookListConfig) {
			let idList = GlobalConfig.BookListConfig[key].idList;
			for (let i of idList) {
				if(this.getBookUpRedByListId(i))
					return true;
			}
		}

		return false;
	}

	public getBookUpRedByListId(listId:number):boolean {
		let elements = GlobalConfig.SuitConfig[listId][1].idList;
		for (let id of elements) {
			let data = this.getBookById(id);
			let nextCost:number = data.getNextLevelCost();
			if (nextCost && this.score >= nextCost) {
				return true;
			}
		}
	}

	public getBookRedById(bookId: any): boolean {
		if (this.getBookById(bookId).getState() == BookState.canOpen)
			return true;
		return false;
	}

	public getBookById(id: number): BooKData {
		if (!this.listBook[id]) {
			let data = new BooKData();
			this.listBook[id] = data;
			data.id = id;
		}
		return this.listBook[id];
	}

	public getBookByItemId(itemId:number):BooKData[] {
		if (!this.itemBook[itemId]) {
			this.itemBook[itemId] = [];
		}
		return this.itemBook[itemId];
	}

	//获得总战力(非职业图鉴)
	public getBookPown(): number {
		let conf = GlobalConfig.CardConfig;
		let pown: number = 0;
		//每个图鉴战力
		for (let k in this.listBook) {
			let bookData = this.listBook[k] as BooKData;
			if (bookData.level > -1) {
				let data = conf[k][bookData.level] as CardConfig;

				pown += Math.floor(UserBag.getAttrPower(data.attrs));//data.power;
			}
		}
		//套装属性战力
		let suitAttrSum:AttributeData[] = [];
		for( let i in GlobalConfig.BookListConfig ){
			let cfg:BookListConfig = GlobalConfig.BookListConfig[i];
			let curNum:number = Book.ins().getSuitNum(cfg.idList[0]);
			for( let j in GlobalConfig.SuitConfig[cfg.idList[0]] ){
				let suit:SuitConfig = GlobalConfig.SuitConfig[cfg.idList[0]][j];
				if( curNum >= suit.count ){
					suitAttrSum = suit.attrs;
				}else{
					pown += Math.floor(UserBag.getAttrPower(suitAttrSum));
					suitAttrSum = [];
					break;
				}
			}
			//单个套装全部集齐
			if( suitAttrSum.length > 0 )
				pown += Math.floor(UserBag.getAttrPower(suitAttrSum));

		}


		return pown;
	}

	/**
	 * 获取图鉴战力，根据角色数量决定
	 * 用于查看每个图鉴用:
	 * (玩家不一定拥有这个图鉴 如果是查看职业图鉴 默认是*1角色 因为如果玩家未开启角色*0 就看不见战力了)
	 * @param 战力
	 * @param 图鉴id
	 * */
	public getBookPowerNum(power,id:number) {
		let len = SubRoles.ins().subRolesLen;
		if( id ){
			for( let k in GlobalConfig.SuitConfig ){
				if( Book.jobs.indexOf(Number(k)) != -1 && GlobalConfig.SuitConfig[k][1].idList.indexOf(id) != -1){
					len = 1;//职业角色
					break;
				}
			}
		}

		return power * len;
	}
	/**计算玩家图鉴总战力(包括职业图鉴区分)*/
	public getBookPowerNumEx():number{
		return this.bookPower;
		// let len = SubRoles.ins().subRolesLen;
		// let conf = GlobalConfig.CardConfig;
		// let pown: number = 0;//所有单个图鉴加总战力
		// //每个图鉴战力
		// for (let k in this.listBook) {
		// 	let bookData = this.listBook[k] as BooKData;
		// 	let tmp:number = 0;
		// 	if (bookData.level > -1) {
		// 		let data = conf[k][bookData.level] as CardConfig;
		// 		tmp += Math.floor(UserBag.getAttrPower(data.attrs));//data.power;
        //
		// 		let suitId:number = this.getSuitIdByBookId(bookData.id);
		// 		let roleJob:number = Book.jobs.indexOf(suitId);
		// 		if( roleJob == -1 ){
		// 			//非职业图鉴
		// 			tmp *= len;
		// 		}else{
		// 			//职业图鉴
		// 			let isHave = false;
		// 			for( let i = 0;i < len;i++ ){
		// 				let role:Role = SubRoles.ins().getSubRoleByIndex(i);
		// 				if( role.job == (roleJob+1) ){
		// 					isHave = true;
		// 					break;
		// 				}
		// 			}
		// 			//没有这个职业图鉴对应的职业角色
		// 			if( !isHave )
		// 				tmp = 0;
		// 		}
		// 	}
		// 	pown += tmp;
		// }
		// //套装属性战力
		// let suitPown: number = 0;//套装总战力
		// let suitAttrSum:AttributeData[] = [];
		// for( let i in GlobalConfig.BookListConfig ){
		// 	let cfg:BookListConfig = GlobalConfig.BookListConfig[i];
		// 	let curNum:number = Book.ins().getSuitNum(cfg.idList[0]);
		// 	let tmp:number = 0;
		// 	for( let j in GlobalConfig.SuitConfig[cfg.idList[0]] ){
		// 		let suit:SuitConfig = GlobalConfig.SuitConfig[cfg.idList[0]][j];
		// 		if( curNum >= suit.count ){
		// 			suitAttrSum = suit.attrs;
		// 		}else{
		// 			tmp += Math.floor(UserBag.getAttrPower(suitAttrSum));
		// 			suitAttrSum = [];
		// 			break;
		// 		}
		// 	}
		// 	//单个套装全部集齐
		// 	if( suitAttrSum.length > 0 )
		// 		tmp += Math.floor(UserBag.getAttrPower(suitAttrSum));
        //
        //
		// 	if( tmp ){
		// 		//检查是否职业图鉴
		// 		let suitId:number = cfg.idList[0];
		// 		let roleJob:number = Book.jobs.indexOf(suitId);
		// 		if( roleJob == -1 ){
		// 			//非职业图鉴
		// 			tmp *= len;
		// 		}else{
		// 			//职业图鉴
		// 			tmp *= len;//职业图鉴的套装和非职业套装一样算法
		// 			// let isHave = false;
		// 			// for( let i = 0;i < len;i++ ){
		// 			// 	let role:Role = SubRoles.ins().getSubRoleByIndex(i);
		// 			// 	if( role.job == (roleJob+1) ){
		// 			// 		isHave = true;
		// 			// 		break;
		// 			// 	}
		// 			// }
		// 			// //没有这个职业图鉴对应的职业角色
		// 			// if( !isHave )
		// 			// 	tmp = 0;
		// 		}
		// 	}
        //
		// 	suitPown += tmp;
		// 	suitAttrSum = [];
		// }
        //
		// return pown + suitPown;
	}


	public getUpChipData(booKData: BooKData): number[] {
		let result: number[] = [];
		let conf = GlobalConfig.CardConfig;
		let arrConf = conf[booKData.id];
		let maxExp: number = 0;
		for (let k in arrConf) {
			if (arrConf[k].level > booKData.level)
				maxExp += arrConf[k].cost;
		}


		let chipConf = GlobalConfig.DecomposeConfig;
		let needExp = maxExp - booKData.exp;
		let upExp = 0;
		for (let k in this.listBook) {
			let data = conf[k][1] as CardConfig;
			let count = UserBag.ins().getItemCountById(0, data.itemId);
			let chip = chipConf[booKData.id];
			let bookData = this.listBook[k] as BooKData;
			if (bookData.level > -1 && count > 0) {
				for (let i = 0; i < count; i++) {
					if (upExp > needExp)
						break;
					upExp += chip.value;
					result.push(parseInt(k));
					if (result.length >= 12)
						return result;
				}
			}
		}
		result.sort(Book.sort);
		return result;
	}

	private static sort(a: number, b: number) {
		if (a == b)
			return 0;
		let aConf = GlobalConfig.DecomposeConfig[a];
		let bConf = GlobalConfig.DecomposeConfig[b];
		if (aConf.value > bConf.value)
			return 1;
		if (aConf.value < bConf.value)
			return -1;
		else
			return 0;
	}


	public getTitleById(id: number): string {
		let config = GlobalConfig.BookListConfig;
		for (let k in config) {
			if (config[k].idList.indexOf(id) != -1) return config[k].name;
		}
		return "";
	}


	public getListData() {
		return this.listBook;
	}

	/**
	 * 53-1
	 * 请求图鉴信息
	 */
	public sendBookData() {
		let bytes: GameByteArray = this.getBytes(1);
		this.sendToServer(bytes);
	}

	/**
	 * 53-1
	 * 更新图鉴信息
	 */
	public postDataChange(bytes: GameByteArray) {

		if (this.score == -1) {
			let configs = GlobalConfig.DecomposeConfig;
			for (let id in configs) {
				let data = this.getBookById(+id);
				this.getBookByItemId(configs[id].itemId).push(data);
			}
		}

		let len = bytes.readInt();
		for (let i = 0; i < len; i++) {
			let id = bytes.readShort();
			let data = this.getBookById(id);
			data.updateData(bytes);
		}
		let score = bytes.readInt();
		if (this.score > -1) {
			let addScore = score - this.score;
			if (addScore > 0) {
				UserTips.ins().showTips(`获得|C:0xff700f&T:图鉴经验x${addScore}|`);
			}
		}
		this.score = score;

		// let num = bytes.readShort();
		// this.attrs = [];
		// for (let i = 0; i < num; i++) {
		// 	let attr: AttributeData = new AttributeData();
		// 	attr.type = bytes.readShort();
		// 	attr.value = bytes.readDouble();
		// 	this.attrs.push(attr);
		// }
		this.bookPower = bytes.readDouble();
	}

	/**
	 * 53-2
	 * 激活图鉴
	 */
	public sendOpen(id: number) {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(id);
		this.sendToServer(bytes);
	}

	/**
	 * 53-3
	 * 请求分解
	 */
	public sendDecompose(arrId: number[][]) {
		let bytes: GameByteArray = this.getBytes(3);

		bytes.writeInt(arrId.length);
		for (let i = 0; i < arrId.length; i++) {
			bytes.writeShort(arrId[i][0]);
			bytes.writeShort(arrId[i][1]);
		}
		this.sendToServer(bytes);
	}

	/**
	 * 升星
	 * @param id
	 */
	public sendUp(id:number) {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(id);
		this.sendToServer(bytes);
	}

	//获取图鉴基础配置
	public getDecomposeConfigByItemId(itemId):DecomposeConfig {
		let configs = GlobalConfig.DecomposeConfig;

		if(!this.itemBook[itemId]){
			Assert(false, `图鉴数据未初始化,id=${itemId},itemBook keys length=${Object.keys(this.itemBook).length}`);
			return null;
		}
		if (this.itemBook[itemId][0]) {
			let id = this.itemBook[itemId][0].id;
			return configs[id];
		}
		return null;
	}

	//分解红点
	public checkResolveRedPoint() {
		let itemData = UserBag.ins().getItemByType(ItemType.TYPE_9);
		if (!itemData.length) {
			return false;
		}

		let listBook = this.itemBook;
		let noActDic: any = {};
		for (let itemId in listBook) {
			for (let item of listBook[itemId]) {
				if (item.getState() != BookState.haveOpen) {
					noActDic[itemId] = true;
					break;
				}
			}
		}

		for (let item of itemData) {
			if (!noActDic[item.configID]) {
				return true;
			}
		}

		return false;
	}

	//获取每个组红点
	public getSuitRedPoint(s) {

		let self = this;
		let config = GlobalConfig.SuitConfig;

		let books = UserBag.ins().getItemByType(ItemType.TYPE_9);
		if (books.length == 0) return false;

		let packDic = {};
		for (let item of books) {
			packDic[item.configID] = true;
		}

		let f = function (_suit) {
			let conf = config[_suit][1];
			let idList = conf['idList'];
			for (let id of idList) {
				if (self.listBook[id] && self.listBook[id].level == -1) {
					// let c = GlobalConfig.DecomposeConfig[id];
					// if (packDic[c.itemId]) {
					// 	return true;
					// }

					let roleJob:number = Book.jobs.indexOf(conf.id);
					if( roleJob == -1 ) {
						//非职业图鉴
						let c = GlobalConfig.DecomposeConfig[id];
						if (packDic[c.itemId]) {
							return true;
						}
					}else{
						//职业图鉴
						let isHaveRole:boolean = false;
						for( let i = 0;i < SubRoles.ins().subRolesLen;i++ ){
							let role:Role = SubRoles.ins().getSubRoleByIndex(i);
							if( role.job == (roleJob+1) ){
								isHaveRole = true;
								break;
							}
						}
						if( !isHaveRole )
							continue;
						let cardConfig:CardConfig = GlobalConfig.CardConfig[id][0];
						if( cardConfig ){
							if (packDic[cardConfig.itemId]) {
								return true;
							}
						}
					}

				}


			}
			return false;
		}

		if (s == 0) {
			for (let suit in config) {
				if (f(suit)) return true;
			}
		} else {
			return f(s);
		}
		return false;
	}

	/**
	 * 查看是否拥有某个套装
	 * @param 套装id
	 * @return {ishave:boolean;cur:number;target:number}是否集齐 当前拥有套装所需数 套装所需数
	 *
	 * **/
	private getHaveBookSuit(id:number):{ishave:boolean,cur:number,target:number}{
		let books = UserBag.ins().getItemByType(ItemType.TYPE_9);
		let config:SuitConfig = GlobalConfig.SuitConfig[id][1];
		if (books.length == 0) {
			return {ishave:false,cur:0,target:config.idList.length};
		}
	}

}

namespace GameSystem {
	export let  book = Book.ins.bind(Book);
}