class Hunt extends BaseSystem {

	public constructor() {
		super();

		this.sysId = PackageID.TreasureHunt;
		this.regNetMsg(1, this.doHuntResult);
		this.regNetMsg(2, this.postBestListInfo);


	}

	public static ins(): Hunt {
		return super.ins() as Hunt;
	}

	/**
	 * 发送探宝
	 * 22-1
	 * @param type	探宝类型
	*/
	public sendHunt(type) {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(type);
		this.sendToServer(bytes);
	}

	/**
	 * 探宝列表
	 * 22-2
	 * @param type	探宝类型
	 */
	public sendHuntList() {
		this.sendBaseProto(2);
	}

	/**
	 * 探宝结果
	 * 22-1
	 */
	public doHuntResult(bytes: GameByteArray) {
		let type = bytes.readShort();
		let num = bytes.readInt();

		let arr = [];
		for (let i = 0; i < num; i++) {
			arr[i] = [bytes.readInt(), bytes.readInt()];
		}

		if (ViewManager.ins().getView(HuntResultWin)) {
			this.postHuntResult(type, arr, 0);
		} else {
			ViewManager.ins().open(HuntResultWin, type, arr, 0);
			this.postHuntResult(type, arr, 0);
		}


	}

	public postHuntResult(...params): any[] {
		return params;
	}

	public postBestListInfo(bytes: GameByteArray): any[] {
		let num = bytes.readShort();

		let arr = [];
		for (let i = 0; i < num; i++) {
			arr[i] = [bytes.readString(), bytes.readInt()];
		}
		arr.reverse();

		return arr;
	}
}

namespace GameSystem {
	export let  hunt = Hunt.ins.bind(Hunt);
}
