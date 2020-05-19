class NeiGong extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.NeiGong;

		this.regNetMsg(1, this.postNeiGongDataChange);
		this.regNetMsg(3, this.postNeiGongAct);
	}

	public static ins(): NeiGong {
		return super.ins() as NeiGong;
	}

	public isActList:any = {};
	public isShow:boolean = false;//是否显示内功特效界面
	public ngList = {}
	public postNeiGongDataChange(bytes: GameByteArray): void {
		let roleId: number = bytes.readShort();
		if (!NeiGongModel.ins().neiGongList[roleId]) {
			NeiGongModel.ins().neiGongList[roleId] = new NeiGongData();
		}
		let data: NeiGongData = NeiGongModel.ins().neiGongList[roleId];
		data.roleId = roleId;
		data.parse(bytes);
		let neigongAct = bytes.readBoolean();
		if( !this.isActList[roleId] ) this.isActList[roleId] = {};
		this.isActList[roleId].act = neigongAct?1:0;
		this.ngList[roleId] = neigongAct;
	}

	
	public postNeiGongAct(bytes: GameByteArray):void{
		let roleId: number = bytes.readShort();
		let act: number = bytes.readInt();//0:没激活 1:已激活
		//egret.log("postNeiGongAct = roleId = "+roleId+"   isAct = "+this.isActList[roleId].act+"  act = "+act);
		this.ngList[roleId] = act;
		//内功激活特效界面判定
		this.isActList[roleId].isShow = false;
		if (this.isActList[roleId].act == 0 && act == 1) {
			this.isActList[roleId].isShow = true;
		}
		this.isActList[roleId].act = act;
	}

	/**
	 * 升级内功等级
	 */
	public sendNeiGongUpLevel(id: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(id);
		this.sendToServer(bytes);
	}

	/**
	 * 升级内功阶数
	 */
	public sendNeiGongUpStage(id: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(id);
		this.sendToServer(bytes);
	}

	/**
	 * 发送激活内功
	 */
	public sendNeiGongAct(id: number):void{
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(id);
		this.sendToServer(bytes);
	}
}
namespace GameSystem {
	export let  neigong = NeiGong.ins.bind(NeiGong);
}