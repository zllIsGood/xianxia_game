class DateStyle extends BaseClass {
	/**格式 */
	public format: string[] = [];
	/** 起始精确度*/
	public from: number = 0;
	/**结束精确度 */
	public to: number = 0;
	/**是否补齐0 */
	public isFormatNum: boolean = false;

	public constructor(format: string[], from: number, to: number, isFormatNum: boolean) {
		super();
		this.format = format;
		this.from = from;
		this.to = to;
		this.isFormatNum = isFormatNum;
	}
}

/**
 * Created by yangsong on 2014/11/22.
 * Date工具类
 */
class DateUtils {
	/**时间格式1 00:00:00 */
	public static TIME_FORMAT_1: number = 1;
	/**时间格式2 yyyy-mm-dd h:m:s */
	public static TIME_FORMAT_2: number = 2;
	/**时间格式3 00:00 */
	public static TIME_FORMAT_3: number = 3;
	/**时间格式4 xx天前/xx小时前/xx分钟前 */
	public static TIME_FORMAT_4: number = 4;
	/**时间格式5 x天x小时x分x秒 */
	public static TIME_FORMAT_5: number = 5;
	/**时间格式6 h:m:s */
	public static TIME_FORMAT_6: number = 6;
	/**时间格式7 xx天/xx小时/<1小时 */
	public static TIME_FORMAT_7: number = 7;
	/**时间格式8 yyyy-mm-dd h:m */
	public static TIME_FORMAT_8: number = 8;
	/**时间格式9 x小时x分钟x秒 */
	public static TIME_FORMAT_9: number = 9;
	/**时间格式10 x分x秒**/
	public static TIME_FORMAT_10: number = 10;
	/**时间格式11x时x分x秒**/
	public static TIME_FORMAT_11: number = 11;
	/**时间格式12 x:x:x**/
	public static TIME_FORMAT_12: number = 12;
	/**时间格式13 x月x日（周几）h:m**/
	public static TIME_FORMAT_13: number = 13;
	/**时间格式14 x时x分**/
	public static TIME_FORMAT_14: number = 14;
	/**时间格式15 mm-dd h:m */
	public static TIME_FORMAT_15: number = 15;
	/**时间格式16 当前时间yyyyMMddHHmmss */
	public static TIME_FORMAT_16: number = 16;

	/**一秒的毫秒数 */
	public static MS_PER_SECOND: number = 1000;
	/**一分钟的毫秒数 */
	public static MS_PER_MINUTE: number = 60 * 1000;
	/**一小时的毫秒数 */
	public static MS_PER_HOUR: number = 60 * 60 * 1000;
	/**一天的毫秒数 */
	public static MS_PER_DAY: number = 24 * 60 * 60 * 1000;

	public static SECOND_PER_HOUR: number = 3600;//一小时的秒数
	public static SECOND_PER_DAY: number = 86400;//一天的秒数
	private static SECOND_PER_MONTH: number = 2592000;//一个月(30天)的秒数
	private static SECOND_PER_YEAR: number = 31104000;//一年(360天)的秒数

	public static DAYS_PER_WEEK: number = 7;//一周的天数

	public static YEAR_PER_YEAR: number = 1;//每年的年数
	public static MONTH_PER_YEAR: number = 12;//每年的月数
	public static DAYS_PER_MONTH: number = 30;//每月的天数
	public static HOURS_PER_DAY: number = 24;//每天的小时数
	public static MUNITE_PER_HOUR: number = 60;//每小时的分钟数
	public static SECOND_PER_MUNITE: number = 60;//每分钟的秒数
	public static SECOND_PER_SECOND: number = 1;//每秒的秒数字
	public static SECOND_2010: number = 1262275200;//1970年~2010年1月1日0时0分0秒的时间戳(单位:秒)
	/**余数 ,用来计算时间*/
	private static mod: number[] = [DateUtils.SECOND_PER_MUNITE, DateUtils.MUNITE_PER_HOUR, DateUtils.HOURS_PER_DAY, DateUtils.DAYS_PER_MONTH, DateUtils.MONTH_PER_YEAR, DateUtils.YEAR_PER_YEAR];
	/**除数 用来计算用来计算时间*/
	private static mul: number[] = [DateUtils.SECOND_PER_SECOND, DateUtils.SECOND_PER_MUNITE, DateUtils.SECOND_PER_HOUR, DateUtils.SECOND_PER_DAY, DateUtils.SECOND_PER_MONTH, DateUtils.SECOND_PER_YEAR];
	/**一周的天数 */
	/**一天的小时数 */
	/** 本游戏中使用的MiniDateTime时间的起始日期相对于flash时间(1970-01-01)的时差（毫秒） */
	public static MINI_DATE_TIME_BASE: number = Date.UTC(2010, 0) + new Date().getTimezoneOffset() * DateUtils.MS_PER_MINUTE;
	/**
	 * 时区偏移（毫秒数）<BR>
	 * 目前中国采用东八区，即比世界协调时间（UTC）/格林尼治时间（GMT）快8小时的时区 */
	public static TIME_ZONE_OFFSET: number = 8 * DateUtils.MS_PER_HOUR;

	/**精确度 */
	public static TO_SECOND: number = 0;
	public static TO_MINUTE: number = 1;
	public static TO_HOUR: number = 2;
	public static TO_DAY: number = 3;
	public static TO_MONTH: number = 4;
	public static TO_YEAR: number = 5;
	/** n年n月n日n时n分n秒 */
	private static FORMAT_1: string[] = ["秒", "分", "时", "天", "月", "年"];
	/** xx:xx:xx */
	private static FORMAT_2: string[] = [":", ":", ":", ":", ":", ":"];
	public static WEEK_CN: string[] = [`日`, `一`, `二`, `三`, `四`, `五`, `六`];

	/**x小时x分x秒 */
	public static STYLE_1: DateStyle = new DateStyle(DateUtils.FORMAT_1, DateUtils.TO_SECOND, DateUtils.TO_HOUR, false);
	/** x天x小时x分钟x秒 */
	public static STYLE_2: DateStyle = new DateStyle(DateUtils.FORMAT_1, DateUtils.TO_SECOND, DateUtils.TO_DAY, false);
	/** 00:00:00 */
	public static STYLE_3: DateStyle = new DateStyle(DateUtils.FORMAT_2, DateUtils.TO_SECOND, DateUtils.TO_HOUR, true);
	/** x分x秒 */
	public static STYLE_4: DateStyle = new DateStyle(DateUtils.FORMAT_1, DateUtils.TO_SECOND, DateUtils.TO_MINUTE, true);

	public constructor() {
	}

	/**
	 * 获取时间格式化的字符串
	 * @second 秒
	 * @style 格式化风格, 例如 :DateUtils.STYLE_1
	 *  */
	public static getFormatTimeByStyle(second: number, style: DateStyle = DateUtils.STYLE_1): string {
		if (second < 0) {
			second = 0;
			debug.log("输入参数有误!时间为负数:" + second);
		}
		if (style.from > style.to) {
			debug.log("输入参数有误!to参数必须大于等于from参数,请检查style参数的值");
			return "";
		}
		second = second >> 0;
		let result: string = "";
		for (let i: number = style.to; i >= style.from; i--) {
			let time: number = second / this.mul[i];//总共
			let timeStr: string = "";
			if (i != style.to)
				time = time % this.mod[i];//剩余
			if (style.isFormatNum && time < 10)
				timeStr = "0" + (time >> 0).toString();//补0
			else
				timeStr = (time >> 0).toString();
			result += (timeStr + style.format[i]);
		}
		return result;
	}

	/**
	 * 获取时间格式化的字符串
	 * @ms 毫秒
	 * @style 格式化风格, 例如 :DateUtils.STYLE_1
	 *  */
	public static getFormatTimeByStyle1(ms: number, style: DateStyle = DateUtils.STYLE_1): string {
		return this.getFormatTimeByStyle(ms / this.MS_PER_SECOND);
	}

	/**
	 * 把MiniDateTime转化为距离1970-01-01的毫秒数
	 * @param mdt 从2010年开始算起的秒数
	 * @return 从1970年开始算起的毫秒数
	 */
	public static formatMiniDateTime(mdt: number): number {
		return DateUtils.MINI_DATE_TIME_BASE + (mdt & 0x7FFFFFFF) * DateUtils.MS_PER_SECOND;
	}

	/**转成服务器要用的时间***/
	public static formatServerTime(time: number): number {
		return (time - DateUtils.MINI_DATE_TIME_BASE) / DateUtils.MS_PER_SECOND;
	}


	/**
	 * 根据秒数格式化字符串
	 * @param  {number} second            秒数
	 * @param  {number=1} type            时间格式类型（参考DateUtils.TIME_FORMAT_1, DateUtils.TIME_FORMAT_2...)
	 * @param  {showLength}    showLength    显示长度（一个时间单位为一个长度，且仅在type为DateUtils.TIME_FORMAT_5的情况下有效）
	 * @returns string
	 */
	public static getFormatBySecond(second: number, type: number = 1, showLength: number = 2): string {
		let str: string = "";
		let ms: number = second * 1000;
		switch (type) {
			case this.TIME_FORMAT_1:
				str = this.format_1(ms);
				break;
			case this.TIME_FORMAT_2:
				str = this.format_2(ms);
				break;
			case this.TIME_FORMAT_3:
				str = this.format_3(ms);
				break;
			case this.TIME_FORMAT_4:
				str = this.format_4(ms);
				break;
			case this.TIME_FORMAT_5:
				str = this.format_5(ms, showLength);
				break;
			case this.TIME_FORMAT_6:
				str = this.format_6(ms);
				break;
			case this.TIME_FORMAT_7:
				str = this.format_7(ms);
				break;
			case this.TIME_FORMAT_8:
				str = this.format_8(ms);
				break;
			case this.TIME_FORMAT_9:
				str = this.format_9(ms);
				break;
			case this.TIME_FORMAT_10:
				str = this.format_10(ms);
				break;
			case this.TIME_FORMAT_11:
				str = this.format_11(ms);
				break;
			case this.TIME_FORMAT_12:
				str = this.format_12(ms);
				break;
			case this.TIME_FORMAT_13:
				str = this.format_13(ms);
				break;
			case this.TIME_FORMAT_14:
				str = this.format_14(ms);
				break;
			case this.TIME_FORMAT_15:
				str = this.format_15(ms);
				break;
			case this.TIME_FORMAT_16:
				str = this.format_16();
				break;
		}
		return str;
	}

	/**
	 * 获取到指定日期00：00的秒数
	 * **/
	public static getRenainSecond(ms?: number): string {
		let tmpDate = ms ? new Date(ms) : new Date();
		//tmpDate.setDate(tmpDate.getDate()+1);
		let ptime = (DateUtils.getTodayZeroSecond(tmpDate) + 60 * 60 * 24) - tmpDate.getTime() / 1000;
		// console.log("ptime = " + ptime);
		return ptime.toFixed(0);
	}

	/**
	 * 今天已过去的秒数
	 * **/
	public static getTodayPassedSecond(): number {
		let tmpDate = new Date();
		let tdyPassTime = ((Date.now() - (new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime())) / 1000).toFixed(0);
		return parseInt(tdyPassTime);
	}

	/**
	 * 获取指定日期00:00时刻的秒数
	 * @parma 毫秒
	 * @returns {number}
	 */
	public static getTodayZeroSecond(tdate?: any): number {
		let tmpDate = tdate ? tdate : new Date();
		return parseInt(((new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime()) / 1000).toFixed(0));
	}

	/**
	 * 获取本周第一天
	 * **/
	public static showWeekFirstDay(): any {
		let Nowdate: any = new Date();
		let day = Nowdate.getDay();
		day = day ? day : 7
		let WeekFirstDay = new Date(Nowdate - (day - 1) * 86400000);
		// let M=Number(WeekFirstDay.getMonth())+1
		// return WeekFirstDay.getYear()+"-"+M+"-"+WeekFirstDay.getDate();
		return WeekFirstDay;
	}

	/**
	 * 获取本周最后一天
	 * @param 毫秒差
	 */
	public static showWeekLastDay() {
		let Nowdate = new Date();
		let WeekFirstDay = DateUtils.showWeekFirstDay();
		let WeekLastDay = new Date((WeekFirstDay / 1000 + 6 * 86400) * 1000);
		// let M=Number(WeekLastDay.getMonth())+1
		// return WeekLastDay.getYear()+"-"+M+"-"+WeekLastDay.getDate();
		return WeekLastDay;
	}

	/**
	 * 求出当前时间离下周一凌晨0点还差
	 * @param 毫秒差
	 * **/
	public static calcWeekFirstDay() {
		// let lastDay = showWeekLastDay().getDay();
		// lastDay = lastDay > 0?lastDay:7;
		let Nowdate = new Date();
		let curDay = Nowdate.getDay();
		curDay = curDay > 0 ? curDay : 7;
		let difday = 7 - curDay;//用
		let hours = Nowdate.getHours();
		let minutes = Nowdate.getMinutes();
		let seconds = Nowdate.getSeconds();
		// console.log("difday = "+difday);
		// console.log("hours = "+hours);
		// console.log("minutes = "+minutes);
		// console.log("seconds = "+seconds);
		let sum = difday * 86400 * 1000 + 86400 * 1000 - (hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000);
		return new Date(sum);
	}

	/**
	 * 格式1  00:00:00
	 * @param  {number} sec 毫秒数
	 * @returns string
	 */
	private static format_1(ms: number): string {
		let n: number = 0;
		let result: string = "##:##:##";

		n = Math.floor(ms / DateUtils.MS_PER_HOUR);
		result = result.replace("##", DateUtils.formatTimeNum(n));
		if (n) ms -= n * DateUtils.MS_PER_HOUR;

		n = Math.floor(ms / DateUtils.MS_PER_MINUTE);
		result = result.replace("##", DateUtils.formatTimeNum(n));
		if (n) ms -= n * DateUtils.MS_PER_MINUTE;

		n = Math.floor(ms / 1000);
		result = result.replace("##", DateUtils.formatTimeNum(n));
		return result;
	}

	/**
	 * 格式2  yyyy-mm-dd h:m:s
	 * @param  {number} ms        毫秒数
	 * @returns string            返回自1970年1月1号0点开始的对应的时间点
	 */
	private static format_2(ms: number): string {
		let date: Date = new Date(ms);
		let year: number = date.getFullYear();
		let month: number = date.getMonth() + 1; 	//返回的月份从0-11；
		let day: number = date.getDate();
		let hours: number = date.getHours();
		let minute: number = date.getMinutes();
		let second: number = date.getSeconds();
		return year + "-" + month + "-" + day + " " + hours + ":" + minute + ":" + second;
	}

	/**
	 * 格式3  00:00
	 * @param  {number} ms        毫秒数
	 * @returns string            分:秒
	 */
	private static format_3(ms: number): string {
		let str: string = this.format_1(ms);
		let strArr: string[] = str.split(":");
		return strArr[1] + ":" + strArr[2];
	}

	/**
	 * 格式4  xx天前，xx小时前，xx分钟前
	 * @param  {number} ms        毫秒
	 * @returns string
	 */
	private static format_4(ms: number): string {
		if (ms < this.MS_PER_HOUR) {
			return Math.floor(ms / this.MS_PER_MINUTE) + "分钟前";
		}
		else if (ms < this.MS_PER_DAY) {
			return Math.floor(ms / this.MS_PER_HOUR) + "小时前";
		}
		else {
			return Math.floor(ms / this.MS_PER_DAY) + "天前";
		}
	}

	/**
	 * 格式5 X天X小时X分X秒
	 * @param  {number} ms                毫秒
	 * @param  {number=2} showLength    显示长度（一个时间单位为一个长度）
	 * @returns string
	 */
	private static format_5(ms: number, showLength: number = 2): string {
		let result: string = "";
		let unitStr: string[] = ["天", "时", "分", "秒"];
		let arr: number[] = [];

		let d: number = Math.floor(ms / this.MS_PER_DAY);
		arr.push(d);
		ms -= d * this.MS_PER_DAY;
		let h: number = Math.floor(ms / this.MS_PER_HOUR);
		arr.push(h);
		ms -= h * this.MS_PER_HOUR;
		let m: number = Math.floor(ms / this.MS_PER_MINUTE);
		arr.push(m);
		ms -= m * this.MS_PER_MINUTE;
		let s: number = Math.floor(ms / 1000);
		arr.push(s);

		for (let k in arr) {
			if (arr[k] > 0) {
				result += this.formatTimeNum(arr[k], Number(k)) + unitStr[k];
				showLength--;
				if (showLength <= 0) break;
			}
		}

		return result;
	}

	/**
	 * 格式6  h:m:s
	 * @param  {number} ms        毫秒
	 * @returns string            返回自1970年1月1号0点开始的对应的时间点（不包含年月日）
	 */
	private static format_6(ms: number): string {
		let date: Date = new Date(ms);
		let hours: number = date.getHours();
		let minute: number = date.getMinutes();
		let second: number = date.getSeconds();
		return this.formatTimeNum(hours) + ":" + this.formatTimeNum(minute) + ":" + this.formatTimeNum(second);
	}

	/**
	 * 格式7  X天/X小时/<1小时
	 * @param  {number} ms        毫秒
	 * @returns string
	 */
	private static format_7(ms: number): string {
		if (ms < this.MS_PER_HOUR) {
			return "<1小时";
		}
		else if (ms < this.MS_PER_DAY) {
			return Math.floor(ms / this.MS_PER_HOUR) + "小时";
		}
		else {
			return Math.floor(ms / this.MS_PER_DAY) + "天";
		}
	}

	//8:yyyy-mm-dd h:m
	private static format_8(time: number): string {
		let date: Date = new Date(time);
		let year: number = date.getFullYear();
		let month: number = date.getMonth() + 1; 	//返回的月份从0-11；
		let day: number = date.getDate();
		let hours: number = date.getHours();
		let minute: number = date.getMinutes();
		return year + "-" + month + "-" + day + " " + hours + ":" + minute;
	}

	/**
	 * 格式9  x小时x分钟x秒
	 * @param  {number} ms        毫秒
	 * @returns string
	 */
	private static format_9(ms: number): string {
		let h: number = Math.floor(ms / this.MS_PER_HOUR);
		ms -= h * this.MS_PER_HOUR;
		let m: number = Math.floor(ms / this.MS_PER_MINUTE);
		ms -= m * this.MS_PER_MINUTE;
		let s: number = Math.floor(ms / 1000);

		return h + "小时" + m + "分钟" + s + "秒";
	}

	/**
	 * 格式10  x分x秒
	 * @param  {number} ms        毫秒
	 * @returns string
	 */
	private static format_10(ms: number): string {
		// let h: number = Math.floor(ms / this.MS_PER_HOUR);
		// ms -= h * this.MS_PER_HOUR;
		let m: number = Math.floor(ms / this.MS_PER_MINUTE);
		ms -= m * this.MS_PER_MINUTE;
		let s: number = Math.floor(ms / 1000);

		return m + "分" + s + "秒";
	}

	private static format_11(ms: number): string {
		let h: number = Math.floor(ms / this.MS_PER_HOUR);
		ms -= h * this.MS_PER_HOUR;
		let m: number = Math.floor(ms / this.MS_PER_MINUTE);
		ms -= m * this.MS_PER_MINUTE;
		let s: number = Math.floor(ms / 1000);

		return h + "时" + m + "分" + s + "秒";
	}

	private static format_12(ms: number): string {
		let h: number = Math.floor(ms / this.MS_PER_HOUR);
		ms -= h * this.MS_PER_HOUR;
		let m: number = Math.floor(ms / this.MS_PER_MINUTE);
		ms -= m * this.MS_PER_MINUTE;
		let s: number = Math.floor(ms / 1000);
		return DateUtils.formatTimeNum(h) + ":" + DateUtils.formatTimeNum(m) + ":" + DateUtils.formatTimeNum(s);
	}

	/**x月x日（周几）h:m */
	private static format_13(time: number): string {
		let date: Date = new Date(time);
		let year: number = date.getFullYear();
		let month: number = date.getMonth() + 1; 	//返回的月份从0-11；
		let week: number = date.getDay();
		let day: number = date.getDate();
		let hours: number = date.getHours();
		let minute: number = date.getMinutes();
		return month + "月" + day + "日(周" + this.WEEK_CN[week] + ") " + DateUtils.formatTimeNum(hours) + ":" + DateUtils.formatTimeNum(minute);
	}

	/**时 分 */
	private static format_14(time: number): string {
		let date: Date = new Date(time);
		let hours: number = date.getHours();
		let minute: number = date.getMinutes();
		return hours + "时" + minute + "分";
	}

	//15:yyyy-mm-dd h:m
	private static format_15(time: number): string {
		let date: Date = new Date(time);
		let month: number = date.getMonth() + 1; 	//返回的月份从0-11；
		let day: number = date.getDate();
		let hours: number = date.getHours();
		let minute: number = date.getMinutes();
		return DateUtils.formatTimeNum(month) + "-" + DateUtils.formatTimeNum(day) + " " + DateUtils.formatTimeNum(hours) + ":" + DateUtils.formatTimeNum(minute);
	}

	//16:yyyyMMddHHmmss
	private static format_16(): string {
		let date: Date = new Date();
		let year: number = date.getFullYear();
		let month: number = date.getMonth() + 1; 	//返回的月份从0-11；
		let day: number = date.getDate();
		let hours: number = date.getHours();
		let minute: number = date.getMinutes();
		let second: number = date.getSeconds();
		return year + DateUtils.formatTimeNum(month) + DateUtils.formatTimeNum(day) + DateUtils.formatTimeNum(hours) + DateUtils.formatTimeNum(minute) + DateUtils.formatTimeNum(second);
	}

	/**
	 * 格式化时间数为两位数
	 * @param  {number} t 时间数
	 * @returns String
	 */
	private static formatTimeNum(t: number, k?: number): string {
		return t >= 10 ? t.toString() : (k == 0 ? t.toString() : "0" + t);
	}

	/**
	 * 检验时间是否大于现在时间+天数
	 * @param  time时间
	 * @param  days天数
	 * @returns String
	 */
	public static checkTime(time: number, days: number): boolean {
		let currentDate = new Date().getTime();
		let t = (time > (currentDate + days * this.MS_PER_DAY)) as boolean;
		return t;
	}

	/**
	 * 格式化当前时间
	 * @param  time时间
	 * @returns String 2018年12月12日（周二） 12:12
	 */
	public static formatFullTime(time: number): string {
		let format: string;
		let date: Date = new Date(time);
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();
		let weekDay = date.getDay();
		let hour = date.getHours();
		let hourStr;
		if (hour < 10) {
			hourStr = "0" + hour;
		}
		else {
			hourStr = hour.toString();
		}
		let min = date.getMinutes();
		let minStr;
		if (min < 10) {
			minStr = "0" + min;
		}
		else {
			minStr = min.toString();
		}
		let weekDayStr;
		switch (weekDay) {
			case 1:
				weekDayStr = "一";
				break;
			case 2:
				weekDayStr = "二";
				break;
			case 3:
				weekDayStr = "三";
				break;
			case 4:
				weekDayStr = "四";
				break;
			case 5:
				weekDayStr = "五";
				break;
			case 6:
				weekDayStr = "六";
				break;
			case 0:
				weekDayStr = "日";
				break;
		}
		format = year + "年" + month + "月" + day + "日（周" + weekDayStr + "） " + hourStr + ":" + minStr;
		return format;
	}

	/**
	 *把字符串时间转换为毫秒数
	 * 2018.3.14-0:0
	 * */
	public static formatStrTimeToMs(str: string): number {
		let date: Date = new Date();
		let strList: any[] = str.split(".");
		date.setFullYear(strList[0]);
		date.setMonth((+strList[1]) - 1);

		let strL2: any[] = strList[2].split("-");
		date.setDate(strL2[0]);

		let strL3: any[] = strL2[1].split(":");
		date.setHours(strL3[0]);
		date.setMinutes(strL3[1]);
		date.setSeconds(0);

		return date.getTime();
	}
}


