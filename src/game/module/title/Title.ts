class Title extends BaseSystem {

	/** 当前穿戴的称号ID */
	// public showID: number;

	/** 当前穿戴的角色索引 */
	// public useRole: number;

	/** 数据列表 */
	public list: eui.ArrayCollection;

	/** 称号信息字典（key = 称号ID，value = 称号信息） */
	public infoDict: any;

	/** 已拥有的称号的结束时间 */
	public timeDict: any;

	/** 总属性（key = 属性类型，value = 属性值） */
	private _totalAttrs: any[];

	/** 总属性文本数据 */
	private _totalAttrsText: eui.ArrayCollection;

	/** 标题切换状态更新事件 */
	public static TITLE_WIN_REFLASH_PANEL: string = "TITLE_WIN_REFLASH_PANEL";
	/** 标题正常标题高度 */
	public static SIMLPE_HEIGHT: number = 86;
	/** 标题展开标题高度 */
	public static EXPAND_HEIGHT: number = 380;

	public showTitleDic: any = {};

	public curSelectRole: number = 0;
	public constructor() {
		super();

		this.sysId = PackageID.Title;
		this.regNetMsg(1, this.postListUpdate);
		this.regNetMsg(2, this.doAdd);
		this.regNetMsg(3, this.doRemove);
		this.regNetMsg(4, this.doUpdateShow);
	}

	public static ins(): Title {
		return super.ins() as Title;
	}

	/**
	 * 获取战斗力接口
	 */
	public getTotalPower(): number {
		let count = this.list.length;
		let power: number = 0;
		for (let i = 0; i < count; i++) {
			let data: TitleInfo = this.list.getItemAt(i);
			if (data.endTime >= 0) {
				power += data.power;
			}
		}
		return power;
	}

	/**派发使用称号 */
	public postUseTitle(data: TitleInfo): TitleInfo {
		return data;
	}

	/**
	 * 请求称号列表
	 * 38-1
	 */
	public sendGetList(): void {
		this.sendBaseProto(1);
	}
	/**
	 * 称号列表
	 * 38-1
	 */
	public postListUpdate(bytes: GameByteArray): void {
		//读取已拥有的称号结束时间
		let timeDict: any = {};
		let n: number = bytes.readInt();
		for (let i: number = 0; i < n; ++i) {
			timeDict[bytes.readInt()] = bytes.readUnsignedInt();
		}
		//初始化列表
		this.initList(timeDict);
		//检查已佩戴的称号ID和角色索引
		this.showTitleDic = {};
		let subRoles = SubRoles.ins();
		let len: number = subRoles.subRolesLen;

		for (let i: number = 0; i < len; i++) {
			let role: Role = subRoles.getSubRoleByIndex(i);
			if (role == null)
				continue;
			//记录已显示的称号
			this.showTitleDic[Number(i)] = role.title;
		}
	}
	/**
	 * 获得一个称号
	 * 38-2
	 */
	private doAdd(bytes: GameByteArray): void {
		this.change(bytes.readInt(), bytes.readUnsignedInt());
	}

	/**
	 * 失去一个称号
	 * 38-3
	 */
	private doRemove(bytes: GameByteArray): void {
		this.change(bytes.readInt(), -1);
	}

	/**
	 * 设置显示的称号
	 * 38-4
	 */
	public sendChangeShow(roleID: number, title: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(roleID);
		bytes.writeInt(title);
		this.sendToServer(bytes);
	}

	/**
	 * 更新角色显示的称号
	 * 38-4
	 */
	private doUpdateShow(bytes: GameByteArray): void {
		let role: CharRole = EntityManager.ins().getEntityByHandle(bytes.readDouble()) as CharRole;
		if (role) {
			(<Role>role.infoModel).title = bytes.readInt();
			role.updateTitle();
			if (role.team == Team.My) {
				let index = (<Role>role.infoModel).index;
				let title: number = 0;
				let lastTitle: number = this.showTitleDic[index] || 0;
				let roleModel: Role = <Role>role.infoModel;
				// if (roleModel.title) {
				title = (<Role>role.infoModel).title;
				this.showTitleDic[index] = title;
				// }
				this.postTitleShow(index, title, lastTitle);
			}
		}
	}

	public postTitleShow(param1: number, param2: number, param3: number): any {
		return [param1, param2, param3];
	}
	/**
	 * 设置称号
 	*/
	public setTitle(roleIndex: number, titleID: number): void {
		for (let k in this.showTitleDic) {
			if (this.showTitleDic[k] == titleID) {
				this.sendChangeShow(Number(k), 0);
				break;
			}
		}
		this.sendChangeShow(roleIndex, titleID);
		//设置到另一个角色，要移除之前的角色称号
		// if (roleIndex != this.useRole && this.showID) {
		// 	this.sendChangeShow(this.useRole, 0)
		// }
	}

	/**
	 * 排序方法
	 */
	private sortFunc(a: TitleInfo, b: TitleInfo): number {
		return a.endTime < 0 == b.endTime < 0 ? (a.config.sort > b.config.sort ? 1 : -1) : a.endTime < 0 ? 1 : -1;
	}

	/**
	 * 初始化列表
	 */
	public initList(timeDict: any): void {
		this.timeDict = timeDict;
		this.infoDict = {};
		this._totalAttrs = [];
		this._totalAttrsText = new eui.ArrayCollection;
		let infoList: TitleInfo[] = [];
		let configList: TitleConf[] = GlobalConfig.TitleConf;
		for (let i in configList) {
			let info: TitleInfo = new TitleInfo(configList[i]);
			if (info.config.Id in timeDict) {
				info.endTime = timeDict[info.config.Id];
				for (let i in info.config.attrs) {
					this._totalAttrs[info.config.attrs[i].type] = (this._totalAttrs[info.config.attrs[i].type] || 0) + info.config.attrs[i].value;
				}
			}
			else {
				info.endTime = -1;
			}
			infoList[infoList.length] = this.infoDict[info.config.Id] = info;
			info.attrsTotal = this._totalAttrsText;
		}
		infoList.sort(this.sortFunc);
		this.list = new eui.ArrayCollection(infoList);
		this.updateTotalAttrs();
	}

	/**
	 * 称号变更（增加、减少）
	 */
	public change(id: number, time: number): void {
		if (!this.infoDict || !(id in this.infoDict))
			return;
		if ((id in this.timeDict) == time >= 0)
			return;

		let info: TitleInfo = this.infoDict[id];
		info.endTime = time;

		if (time < 0)
			delete this.timeDict[id];
		else
			this.timeDict[id] = time;

		//重新排序
		this.list.source.sort(this.sortFunc);
		this.list.refresh();

		//总属性增减
		let sign: number = time < 0 ? -1 : 1;
		for (let attr of info.config.attrs) {
			this._totalAttrs[attr.type] = (this._totalAttrs[attr.type] || 0) + sign * attr.value;
		}
		this.updateTotalAttrs();
		if (sign > 0)//属性增加 穿戴
			this.autoWearTitle(info);
	}

	/**
	 * 更新总属性
	 */
	private updateTotalAttrs(): void {
		let list: Object[] = this._totalAttrsText.source;
		list.length = 0;
		for (let i in this._totalAttrs) {
			if (this._totalAttrs[i] > 0)
				list.push(TitleInfo.formatAttr(Number(i), this._totalAttrs[i]));
		}
		//没有总属性，默认显示为0
		if (list.length == 0) {
			let attrs = (this.infoDict[1] as TitleInfo).config.attrs;
			for (let attr of attrs) {
				list.push(TitleInfo.formatAttr(attr.type, 0));
			}
		}
		this._totalAttrsText.refresh();
	}

	/**
	 * 特权称号: 自动穿戴称号
	 */
	private autoWearTitle(info: any) {
		//特权称号
		if (info.config.Id != 17)
			return;
		if (info instanceof TitleInfo) {
			let len = SubRoles.ins().subRolesLen;
			let title = Title.ins();
			for (let i = 0; i < len; i++) {
				if (!title.showTitleDic[i]) {
					title.setTitle(i, info.config.Id);
					break;
				}
			}
		}
	}
}

namespace GameSystem {
	export let  title = Title.ins.bind(Title);
}
