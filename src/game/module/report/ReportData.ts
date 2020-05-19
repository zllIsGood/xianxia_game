/**
 * Created by Administrator on 2016/7/18.
 */
class ReportData {
	static isReport: boolean = true;//!DEBUG;

	static LOAD: string = "load";
	static GM: string = "gm";
	static ERROR: string = "error";

	private static _ins: ReportData;

	private httpRequest: egret.HttpRequest;

	private httpRequestUrl: HrInfo[];
	private isComplete: boolean = false;

	static getIns(): ReportData {
		this._ins = this._ins || new ReportData();
		return this._ins;
	}

	constructor() {
		this.httpRequest = new egret.HttpRequest();
		this.httpRequestUrl = [];
	}

	/** 上报打点记录 */
	report(str: string, reportType?: string) {
		let roleCount: number = LocationProperty.roleCount;
		//不是新账号不需要上报数据
		// if (roleCount != 0)
		// 	return;

		/*
		 参数说明：
		 pfrom_id: 平台标识 string（16）//登陆时新增登陆参数 pfid
		 server_id：区服id smallint（5）
		 account: 平台帐号 string(64)
		 counter: 打点标识 固定值load
		 kingdom：记录打点位置 string 32
		 is_new：是否新帐号 默认为 1
		 exts：扩展字段 string（32） 非必要字段
		 ip 登陆ip
		 logdate:2016-03-07 04:23:48请求时间精确到秒
		 */
		let ua: string = navigator.userAgent.toLowerCase();
		if (/iphone|ipad|ipod/.test(ua)) {
			ua = "1";
		} else if (/android/.test(ua)) {
			ua = "2";
		}
		else ua = "0";

		reportType = reportType || "load";

		//3e6d590812e1f1d370c135feeef60f97
		let key = md5.hex_md5(md5.hex_md5(reportType + "027a47eabf1ebcb409b7fe680ff69008"));

		let data: string = "&data=";
		data += LocationProperty.pfid;
		data += "|" + LocationProperty.srvid;
		data += "|" + LocationProperty.openID;
		data += "|" + reportType;
		data += "|" + str;
		data += "|" + LocationProperty.isnew;
		data += "|" + ua;
		data += "|" + LocationProperty.login_ip;
		data += "|" + DateUtils.getFormatBySecond(Math.floor((GameServer.serverTime || Date.now()) / 1000), 2);
		data += "|" + LocationProperty.appid;
		if (reportType != ReportData.ERROR) data += "|" + ((Actor.level==0||Actor.level==undefined)?1:Actor.level);
		// console.log(`调试上报`)
		this.reportUrl(`${LocationProperty.loadurl}/report?appv=1.0&counter=${reportType}&key=${key}${data}`);
		// this.reportUrl(`http://report.ftznh5.hulai.com/report?appv=1.0&counter=${reportType}&key=${key}${data}`);
	}

	//上报聊天
	reportChat(str: string, chatType: number) {
		/*
		 counter是chat，参数格式是
		 serverid|account|actorid|name|chattype|content|chatdate|ip|pf

		 参数说明：
		 pfrom_id: 平台标识 string（16）//登陆时新增登陆参数 pfid
		 server_id：区服id smallint（5）
		 account: 平台帐号 string(64)
		 counter: 打点标识 固定值load
		 kingdom：记录打点位置 string 32
		 is_new：是否新帐号 默认为 1
		 exts：扩展字段 string（32） 非必要字段
		 ip 登陆ip
		 chatdate:2016-03-07 04:23:48请求时间精确到秒

		 chatType:
		 1：私聊
		 2：喇叭
		 3：邮件
		 4：世界
		 5：阵营
		 6：帮派
		 7：队伍
		 8：附近
		 9：其他
		 */

		if (LocationProperty.isLocation) {
			return;
		}

		let reportType = "chat";

		str = str.replace(/\|/g, '、');

		//3e6d590812e1f1d370c135feeef60f97
		let key = md5.hex_md5(md5.hex_md5(reportType + "027a47eabf1ebcb409b7fe680ff69008"));

		let data: string = "&data=";
		data += LocationProperty.srvid;
		data += "|" + LocationProperty.openID;
		data += "|" + Actor.actorID;
		data += "|" + Actor.myName;
		data += "|" + chatType;
		data += "|" + str;
		data += "|" + DateUtils.getFormatBySecond(Math.floor((GameServer.serverTime || Date.now()) / 1000), 2);
		data += "|" + LocationProperty.login_ip;
		data += "|" + LocationProperty.pf;

		this.reportUrl(`${LocationProperty.loadurl}/report?appv=1.0&counter=${reportType}&key=${key}${data}`);
		// this.reportUrl(`http://report.ftznh5.hulai.com/report?appv=1.0&counter=${reportType}&key=${key}${data}`);
	}

	//上报建议
	advice(str: string, func: Function, funcThis: any) {

		let f: Function = function (v: egret.Event) {
			this.httpRequest.removeEventListener(egret.Event.COMPLETE, f, this);
			let request = <egret.HttpRequest>v.currentTarget;
			if (request.response == "true" || request.response == "true\n") {
				UserTips.ins().showTips("提交问题成功！");
				func.call(funcThis);
			}
			else
				UserTips.ins().showTips("网络出故障，请重新提交问题！");
		};
		this.httpRequest.addEventListener(egret.Event.COMPLETE, f, this);

		let ua: string = navigator.userAgent.toLowerCase();
		if (/iphone|ipad|ipod/.test(ua)) {
			ua = "1";
		} else if (/android/.test(ua)) {
			ua = "2";
		}
		else ua = "0";

		let counter = 'gm';

		str = str.replace(/\|/g, '、');

		let data: string = "&data=";
		data += LocationProperty.pfid;
		data += "|" + LocationProperty.srvid;
		data += "|" + LocationProperty.openID;
		data += "|" + counter;
		data += "|" + str;
		data += "|" + LocationProperty.isnew;
		data += "|" + ua;
		data += "|" + LocationProperty.login_ip;
		data += "|" + DateUtils.getFormatBySecond(Math.floor((GameServer.serverTime || Date.now()) / 1000), 2);
		data += "|" + LocationProperty.appid;
		data += "|" + Actor.level;

		//key = md5.hex_md5(md5.hex_md5(counter+"027a47eabf1ebcb409b7fe680ff69008"));
		this.reportUrl(`${LocationProperty.loadurl}/report?appv=1.0&counter=${counter}&key=d413074da338f01ab95010fac6f0c81a${data}`);
		// this.reportUrl(`https://report.ftznh5.hulai.com/report?appv=1.0&counter=${counter}&key=d413074da338f01ab95010fac6f0c81a${data}`);
	}

	//角色升级
	roleUp() {
		window['roleUp']({
			roleid: Actor.actorID || "",
			rolename: Actor.myName || "",
			rolelevel: Actor.level || "",
			moneynum: Actor.gold || "",
			vip: UserVip.ins().lv || "",
			power: Actor.power || "",
			partyid: Guild.ins().guildID || "",
			partyname: Guild.ins().guildName || "",
			zslv: UserZs.ins().lv || ""
		});
	}

	//进入游戏
	enterGame() {
		// window['enterGame'](Actor.actorID, Actor.myName, Actor.level);
		window['enterGame']({
			roleid: Actor.actorID || "",
			rolename: Actor.myName || "",
			rolelevel: Actor.level || "",
			moneynum: Actor.gold || "",
			vip: UserVip.ins().lv || "",
			power: Actor.power || "",
			partyid: Guild.ins().guildID || "",
			partyname: Guild.ins().guildName || "",
			zslv: UserZs.ins().lv || ""
		});
	}

	createRole(roleId,name) {
		window['createRole']({
			roleid: roleId || "",
			rolename: name || "",
			rolelevel: "",
			moneynum: "",
			vip: "",
			power: "",
			partyid: "",
			partyname: "",
			zslv: ""
		});
	}

	/** 上报建议 */
	advice1(str: string, func: Function, funcThis: any) {
		let f: Function = function (v: egret.Event) {
			this.httpRequest.removeEventListener(egret.Event.COMPLETE, f, this);
			let request = <egret.HttpRequest>v.currentTarget;
			if (request.response == "ok") {
				UserTips.ins().showTips("提交问题成功！");
				func.call(funcThis);
			}
			else
				UserTips.ins().showTips("网络出故障，请重新提交问题！");
		};
		this.httpRequest.addEventListener(egret.Event.COMPLETE, f, this);

		str = str.replace(/@/g, "");
		str = str.replace(/#/g, "");

		let data: string = "&serverid=" + LocationProperty.srvid;
		data += "&sign=" + md5.hex_md5(`${LocationProperty.srvid || 0}${Actor.actorID}enter_reportfeedbackqiyaohudongyule!@#`);
		data += "&actorid=" + Actor.actorID;
		data += "&actorname=" + Actor.myName;
		data += "&feedcnt=" + str;
		data += "&openid=" + LocationProperty.openID;
		data += "&userlevel=" + Actor.level;
		data += "&viplevel=" + UserVip.ins().lv;
		data += "&appid=";

		this.reportUrl(LocationProperty.loadurl + "/api/load?counter=enter_report" + data);

	}


	/*
		上报胡莱平台
		type:
			0~3:gameInfo
			4:counter
	 */
	public hoolaiReportGameInfo(type: number, actorId: number = 0): void {
		let typeValue = ["login","start","load_picture","welcome",""];

		let time = DateUtils.getFormatBySecond(Math.floor((GameServer.serverTime || Date.now()) / 1000), 2).split(" ");
		// console.log(`type:${type}, date:${time[0]}, time:${time[1]}`);
		let data: string = "userId=" + LocationProperty.openID;
		data += "&clientid=" + (LocationProperty.srvid || 0);
		data += "&userLevel=" + (Actor.level || 0);
		data += type!=4?"&gameInfo=loading":"&counter=role_choice";
		data += "&value=" + type;
		data += "&kingdom=" + typeValue[type];
		data += "&phylum=";
		data += "&classfield=";
		data += "&family=";
		data += "&genus=";
		data += type!=4?"&gameInfoDate=":"counterDate" + time[0];
		data +=  type!=4?"&gameInfoTime=":"counterTime" + time[1];
		data += "&extra=" + LocationProperty.extra;
		if (type==4) {
			data += "&udId=";
			data += "&roleId=" + actorId;
		}
		data += "&type="+ (type!=4?"gameInfo":"counter")

		if (LocationProperty.pf == "wxftzn") {
			this.reportUrl("https://loginpay-ftzn-szgame.cmcm.com/"+LocationProperty.pf+"/api/reportbi?" + data);
		} else {
			this.reportUrl("https://loginpayftznh5.hulai.com/"+LocationProperty.pf+"/api/reportbi?" + data);
		}
		// this.reportUrl("http://loginpayftznh5.hulai.com/haoyu/api/reportbi?" + data);
	}


	////////////////、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、
	reportUrl(url: string, method?: string) {
		// console.log(`isReport:${ReportData.isReport}, isLocation:${LocationProperty.isLocation}`);
		if (DEBUG) return;
		if (LocationProperty.isWeChatMode) {
			if (!ReportData.isReport) return;
		}
		else {
			if (!ReportData.isReport || LocationProperty.isLocation) return;
		}

		let vo = new HrInfo();
		vo.url = url;
		vo.method = method;
		this.httpRequestUrl.push(vo);
		this.sendReportUrl();
		// console.log(`reportUrl:${url}`);
	}

	private sendReportUrl(): void {
		if (this.isComplete == false && this.httpRequestUrl.length > 0) {
			let url = this.httpRequestUrl[0].url;
			let method = this.httpRequestUrl[0].method;
			this.httpRequest.open(url, method ? method : egret.HttpMethod.GET);
			this.httpRequest.send();
			this.isComplete = true;
			this.httpRequest.addEventListener(egret.Event.COMPLETE, this.onGetComplete, this);
			this.httpRequest.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this)
		}
	}

	private onGetComplete(event: egret.Event): void {
		this.isComplete = false;
		this.httpRequestUrl.shift();
		this.sendReportUrl();
	}

	private onGetIOError(event: egret.IOErrorEvent): void {
		this.isComplete = false;
		this.sendReportUrl();
	}


}

class HrInfo {
	public url: string;
	public method: string;
}