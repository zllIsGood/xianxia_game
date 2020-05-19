/**
 * Created by Saco on 2014/12/1.
 */
class LocationProperty {

	private static urlParam: any = {};

	/**
	 * 获取URL参数
	 */
	public static init(url: string = null): void {
		let str: string = url?url:window['paraUrl'];
		str = decodeURIComponent(str);
		if (str) {
			let whIndex: number = str.indexOf("?");
			if (whIndex != -1) {

				let param: string[] = str.slice(whIndex + 1).split("&");
				let strArr: string[];
				for (let i: number = 0; i < param.length; i++) {
					strArr = param[i].split("=");
					this.urlParam[strArr[0]] = strArr[1];
				}
			}
		}
	}

	static get resAdd(): string {
		return this.urlParam['hosts'] || "";
		// return "http://192.168.201.191:8081/"
	}

	static set resAdd(str: string) {
		this.urlParam['hosts'] = str;
	}

	static get openID(): string {
		return this.urlParam['user'];
	}

	static set openID(str: string) {
		this.urlParam['user'] = str;
	}

	static get srvid(): number {
		return this.urlParam['srvid'];
	}

	static set srvid(v: number) {
		this.urlParam['srvid'] = v;
	}

	static get serverIP(): string {
		return this.urlParam['srvaddr'];
	}

	static set serverIP(str: string) {
		this.urlParam['srvaddr'] = str;
	}

	static get serverPort(): number {
		return this.urlParam['srvport'] || 9001;
	}

	static set serverPort(v: number) {
		this.urlParam['srvport'] = v;
	}

	static set password(pwd: any) {
		this.urlParam['spverify'] = pwd;
	}
	static get password() {
		return this.urlParam['spverify'] || "e10adc3949ba59abbe56e057f20f883e";
	}

	static get openKey(): string {
		return this.urlParam['openkey'];
	}

	/** //安卓：1， iOS：2 */
	static get zoneId(): number {
		return this.urlParam['zoneid'];
	}

	//srvid和服后的id
	//serverid和服前的id
	static get serverID(): string {
		return this.urlParam['serverid'];
	}

	static get appid(): string {
		return this.urlParam['appid'] || "0";
	}

	static get app_openid(): string {
		return this.urlParam['app_openid'] || "";
	}

	static get isSubscribe(): string {
		return this.urlParam['isSubscribe'];
	}

	static get nickName(): string {
		let str: string = this.urlParam['nickName'] || "";
		try {
			return str.length ? decodeURIComponent(str) : str;
		}
		catch (e) {
			return str;
		}
	}

	static get callUrl(): string {
		let str: string = this.urlParam['callUrl'] || "";
		return str.length ? decodeURIComponent(str) : str;
	}

	static get wabgift(): string {
		return this.urlParam['wb_gift'];
	}

	static get roleCount(): number {
		return parseInt(this.urlParam['roleCount']);
	}

	static get isnew(): number {
		return parseInt(this.urlParam['isnew'] || 0);
	}

	static get login_ip(): string {
		return this.urlParam['login_ip'] || this.urlParam['srvaddr'];
	}

	static get is_attention(): string {
		return this.urlParam['is_attention'];
	}

	static get isShowShare(): boolean {
		return window['isShowShare'];
	}

	static set v(val: number) {
		this.urlParam['v'] = val;
	}
	static get v(): number {
		 // 带值时需要生成对应的目录及文件 1/1.ver
		return parseInt(this.urlParam['v']);
	}

	static get isYelloVip(): number {
		return parseInt(this.urlParam['isYelloVip']);
	}

	static get isYelloYearVip(): number {
		return parseInt(this.urlParam['isYelloYearVip']);
	}

	static get yelloVipLevel(): number {
		return parseInt(this.urlParam['yelloVipLevel']);
	}

	static get isYelloHighVip(): number {
		return parseInt(this.urlParam['isYelloHighVip']);
	}

	static get logurl(): string {
		return decodeURIComponent(this.urlParam['logurl']);
	}

	static get isFirstLoad(): boolean {
		return !LocationProperty.isLocation && LocationProperty.roleCount == 0;
	}

	static get loadurl(): string {
		return decodeURIComponent(this.urlParam['loadurl']);
	}

	static get pfid(): string {
		return this.urlParam['pfid'] || "1";
	}

	static set pf(val: string) {
		this.urlParam["pf"] = val;
	}

	static get pf(): string {
		return this.urlParam['pf'] || "haoyu";
	}

	//资源版本
	static get ver_res(): number {
		return this.urlParam["ver_res"] ? parseInt(this.urlParam["ver_res"]) : 0;
	}

	/**身份认证*/
	static get verify(): number {
		return this.urlParam["verify"] ? parseInt(this.urlParam["verify"]) : 0;
	}

	/**身份认证*/
	static set verify(value: number) {
		this.urlParam["verify"] = value + "";
	}
	/**是否防沉迷 */
	static get wallow(): number {
		return this.urlParam["wallow"] ? parseInt(this.urlParam["wallow"]) : 0;
	}


	static isCanLogin(): boolean {
		return this.openID != null &&
			this.password != null &&
			this.srvid != null &&
			this.serverIP != null &&
			this.serverPort != null;
	}


	/**
	 * 是否内网
	 */
	static get isLocation(): boolean {
		return location.href.indexOf("192.168.1.7") >= 0
			|| location.href.indexOf("192.168.1.44") >= 0
			|| location.href.indexOf("192.168.1.55") >= 0
			|| location.href.indexOf("192.168.1.56") >= 0
			|| location.href.indexOf("192.168.1.57") >= 0
			|| location.href.indexOf("127.0.0.1") >= 0
		return false;
	}

	/**
	 * 设置加载进度 & 描述
	 */
	static setLoadProgress(n: number, str: string): void {
		window['showLoadProgress'](n, str);
	}

	/** [enterMode 游戏进入模式] 
		mode: 
			0：h5页面dev登入
			1：登录界面登入(审核服)
			2：app正式服
	*/
	static set enterMode(mode: number) {
		this.urlParam["enterMode"] = mode;
	}

	static get enterMode(): number{
		return this.urlParam["enterMode"] || 0;
	}

	/**
	 * [weiduanSrvList 微端服务器列表信息]
	 */
	static set weiduanSrvList(list: any) {
		this.urlParam["weiduanSrvList"] = list;
	}
	static get weiduanSrvList(): any {
		return this.urlParam["weiduanSrvList"];
	}

	/**
	 * [weiduanSdkData 微端sdk登录信息]
	 */
	static set weiduanSdkData(data: any) {
		this.urlParam["weiduanSdkData"] = data;
	}
	static get weiduanSdkData(): any {
		return this.urlParam["weiduanSdkData"];
	}

	/**
	 * [weiduanCurSrvData 微端当前选择的服务器信息]
	 */
	static set weiduanCurSrvData(data: any) {
		this.urlParam["weiduanCurSrvData"] = data;
	}
	static get weiduanCurSrvData(): any {
		return this.urlParam["weiduanCurSrvData"];
	}

	public static getParam() {
		return this.urlParam
	}

	// 非微端模式
	static get isNotNativeMode(): boolean {
		return this.urlParam["enterMode"] == 0 || this.urlParam["enterMode"] == undefined;
	}

	// 微端审核模式
	static get isNativeCheckMode(): boolean {
		return  this.urlParam["enterMode"] == "1";
	}
	// 微端正式模式
	static get isNativeFormalMode(): boolean {
		return  this.urlParam["enterMode"] == "2";
	}
	// 微信小游戏模式
	static get isWeChatMode(): boolean {
		return  this.urlParam["enterMode"] == "3";
	}
	// vivo快游戏
	static get isVivoMode(): boolean {
		return  this.urlParam["enterMode"] == "4";
	}

	// 华为快游戏
	static get isHuaweiMode(): boolean {
		return  this.urlParam["enterMode"] == "5";
	}

	/**
	 * 是否加载压缩文件的方式,用于正式服，开发时不必加载压缩文件
	 * 默认为打包正式服需要加载，开发时设为false
	 */
	static get isZipLoad(): boolean {
		// return (this.urlParam["zipLoad"]==undefined||this.urlParam["zipLoad"]=='true')?true:false;
		return LocationProperty.isWeChatMode 
				|| LocationProperty.isVivoMode
				|| LocationProperty.isHuaweiMode;
	}

	// 充值档位
	static set rechargeItemsConfig(data: any) {
		this.urlParam["ri"] = data;
	}
	static get rechargeItemsConfig() {
		return this.urlParam["ri"]
	}
	// 首充档位显示
	static set firstRechargeConfig(data: any) {
		this.urlParam["fri"] = data;
	}
	static get firstRechargeConfig() {
		return this.urlParam["fri"];
	}
	static get extra() {
		return this.urlParam["extra"] || "";
	}

}

/**
 * 分享成功返回
 */
function shareCallback() {
	UserTips.ins().showTips(`邀请成功`);
	/** 只要唤起邀请了, 就直接给用户发奖励 */
	// Invite.ins().sendDailyInviteSuccess();
	// ViewManager.ins().close(YqWin);
}

/**
 * 是否关注 -1关闭 0未关注 1已关注
 * @param code
 */
function isFocusCallback(code: string) {
	UserTips.ins().showTips(`关注成功`);
	// PfActivity.ins().postGuanZhu(+code);
}

/**
 * 是否开启分享 -1关闭 其他开启
 * @param code
 */
function isShareCallback(code: string) {
	// PfActivity.ins().postShare(+code);
}

function isVerifyCallback(code: string) {
	// PfActivity.ins().postRenZheng(+code);
}

/**
 * 实名认证成功返回
 */
function verifyCallback() {
	// UserTips.ins().showTips(`实名认证成功`);
	// LocationProperty.verify = 1;
	// PfActivity.ins().postRenZheng(1);
}

// h5充值回调
function rechargeCallback(code: number) {
	Recharge.ins().removePayWarn();
}

// 加载进度显示
function loadingText(text: string, progress: number) {
	if (window["showLoadProgress"]) {
		window["showLoadProgress"](progress,"");
	}
	if (window["scriptProgress"]) {
		window["scriptProgress"](text);
	}
	if (window["EgretLoadingView"]) {
		window["EgretLoadingView"].setLoadingText(text);
	}
}

function adapterIphoneX() {
	let isX = false;
	isX = platform.isIphoneX()||(platform.getVivoNotchHeight()!=0)
	if (window["adapterCustomX"]) {
		isX = window["adapterCustomX"]();
	}
	return isX;

}