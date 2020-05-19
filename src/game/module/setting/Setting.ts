/**
 * Created by wangzhong on 2016/6/23.
 */


enum ClientSet {
	guidePart = 0,//新手引导part
	guideStep = 1,//新手引导step
	expFirst = 2, //经验副本是否第一次挑战 默认0是 1否
	headRed = 3, //30级头像红点
	diedFirstTime = 4, //角色首次死亡对应的时间戳 同一天保留对应红点提示
	recharge1 = 5, //是否弹出过首充（30级等级限制）
	vip = 6, //是否弹出vip引导
	role= 7,//失败界面弹出引导开启角色
	FB=8,//副本扫荡点击位
	recharge2 = 9, //是否弹出过首充（首次死亡限制）
	diedFirstTime2 = 10, //首充后的首次死亡
	mijiRedPoint = 11,//秘术开启后第一次镶嵌了秘术
	firstMonthCard = 12,//是否已经第一次购买了月卡
	firstrecharge1 = 13,//是否点击首充消失过按钮
	firstClickTreasure = 14,//是否点击了寻宝icon 0否 1是
	firstShowRechargeBtn = 15,//第一次弹出首充
	collectGifBtn = 16, // 收藏有礼按钮, 0从未点击, 1点击过, 2点击过并且返回后台, 3领取过
	invite = 17, // 邀请功能, 0从未点击, 1已经领取过, 2每日邀请
	autoHeji = 18, //是否在部分场景自动释放合击 0否 1是
}

class Setting extends BaseSystem {

	public static get currPart():number {
		return Setting.ins().getValue(ClientSet.guidePart);
	};
	public static get currStep(): number{
		return Setting.ins().getValue(ClientSet.guideStep);
	};

	public map:Map<number> = {};

	public static ins(): Setting {
		return super.ins() as Setting;
	}

	public constructor() {
		super();
		this.sysId = PackageID.Default;

		this.regNetMsg(19, this.parser);
	}

	public parser(bytes: GameByteArray): void {
		let len = bytes.readShort();
		for (let i = 0; i < len; i++) {
			this.map[bytes.readInt()] = bytes.readInt();
		}
		GuideUtils.ins().init();
		this.postInitSetting();
	}
	public postInitSetting(){
		return true;
	}
	/**
	 * 0-19 保存数据
	 * @param key
	 * @param value
	 */
	private sendSave(key:ClientSet, value:number):void {
		let bytes: GameByteArray = this.getBytes(19);
		bytes.writeInt(key);
		bytes.writeInt(value);
		this.sendToServer(bytes);
		this.map[key] = value;
	}

	//保存数据
	public setValue(key:ClientSet, value:number):void {
		this.sendSave(key, value);
	}

	//读取数据
	public getValue(key:ClientSet, def:number = 0):number {
		return this.map[key] == undefined ? def : this.map[key];
	}

}

namespace GameSystem {
	export let  setting = Setting.ins.bind(Setting);
}
