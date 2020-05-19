/**
 * 道具数据结构.
 */
class ItemData {

	public handle: number;

	public _configID: number;

	public count: number;

	public att: AttributeData[];

	public extAtt: AttributeData[];

	public itemConfig: ItemConfig;

	public canbeUsed: boolean;

	public isSuggest:boolean;//诛仙分解是否显示推荐

	public _point:number = -1;

	public parser(bytes: GameByteArray): void {
		this.handle = bytes.readDouble();

		this.configID = bytes.readInt();

		this.count = bytes.readInt();

		this.att = [];
		for (let i = 0; i < 8; i++) {
			let att: AttributeData = new AttributeData(bytes.readInt(), bytes.readInt());
			this.att.push(att);
		}

		this.extAtt = [];
		for (let i = 0; i < 8; i++) {
			let att: AttributeData = new AttributeData(bytes.readInt(), bytes.readInt());
			this.extAtt.push(att);
		}
	}

	public get configID(): number {
		return this._configID;
	}

	public set configID(value: number) {
		this.itemConfig = GlobalConfig.ItemConfig[value];
		if (value != 0) {
			Assert(this.itemConfig, "无法读取道具配置，id：" + value + ",请检查配置");
		}
		this._point = -1;
		this._configID = value;
		this.setCanbeUsed();
	}

	/** TODO hepeiye
	 * 通过string数组获取多行字符串
	 * @param str[]   属性string数组
	 * @param newline  属性与属性上下间隔几行(默认1行)
	 */
	static getStringByList(str: string[], newline: number = 1, addStr: string = ": "): string {
		let ret: string = "";
		for (let i: number = 0; i < str.length; i++) {
			ret += str[i] + addStr;

			if (i < str.length - 1) {
				for (let j: number = 0; j < newline; j++)
					ret += "\n";
			}
		}
		return ret;
	}

	static getStringByNextList(now: string[], next: string[]): string {
		let ret: string = "";
		for (let i: number = 0; i < now.length; i++) {

			ret += now[i];
			if (next[i]) {
				ret += next[i];
			}

			if (i < now.length - 1) {
				ret += "\n";
			}
		}
		return ret;
	}

	public get point(): number {
		if (this._point == -1) {
			this._point = ItemConfig.calculateBagItemScore(this);
		}
		return this._point;
	}

	/**
	 * 设置道具可使用的红点提示
	 */
	public setCanbeUsed(): void {
		if (!this.itemConfig)
			return;
		if (ItemConfig.getType(this.itemConfig) == ItemType.TYPE_20) {
			//特戒使用
			this.canbeUsed = SpecialRing.ins().checkCanUseByItem(this.itemConfig.id);
		}
		else if (this.itemConfig.useType == 1 || this.itemConfig.useType == 2) {
			if (UserZs.ins().lv < this.itemConfig.zsLevel && Actor.level < this.itemConfig.level) {
				this.canbeUsed = false;
			}
			else {
				//屏蔽召唤令的红点提示
				if (this.itemConfig.id == 230001 || this.itemConfig.id == 230002 || this.itemConfig.id == 230003) {
					this.canbeUsed = false;
				} else {
					this.canbeUsed = true;
				}

				if (Math.floor(this.itemConfig.id / 10000) == 26) {
					let id = this.itemConfig.id % 260000;
					let bookData = Book.ins().getBookById(id);
					let state = bookData.getState();
					// egret.log(state + "d:" + this.itemConfig.id)
					this.canbeUsed = state == BookState.canOpen;
				}
			}
		} else {
			this.canbeUsed = false;
		}
	}

	public getCanbeUsed(): boolean {
		return this.canbeUsed;
	}

	public copy(item?:ItemData) {
		if (!item) item = new ItemData();
		let self = this;
		item.handle = self.handle;
		item.configID = self.configID;
		item.count = self.count;

		item._point = self._point;

		item.att = [];
		for (let i = 0; i < 8; i++) {
			let att: AttributeData = new AttributeData(self.att[i].type, self.att[i].value);
			item.att.push(att);
		}

		item.extAtt = [];
		for (let i = 0; i < 8; i++) {
			let att: AttributeData = new AttributeData(self.extAtt[i].type, self.extAtt[i].value);
			item.extAtt.push(att);
		}

		return item;
	}
}