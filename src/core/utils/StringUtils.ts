/**
 * Created by yangsong on 14/12/18.
 * 字符串操作工具类
 */
class StringUtils {

	private static HTML: RegExp = /<[^>]+>/g;

	/**
	 * 去掉前后空格
	 * @param str
	 * @returns {string}
	 */
	public static trimSpace(str: string): string {
		return str.replace(/^\s*(.*?)[\s\n]*$/g, '$1');
	}

	/**
	 * 获取字符串长度，中文为2
	 * @param str
	 */
	public static getStringLength(str: string): number {
		let strArr = str.split("");
		let length = 0;
		for (let i = 0; i < strArr.length; i++) {
			let s = strArr[i];
			if (this.isChinese(s)) {
				length += 2;
			} else {
				length += 1;
			}
		}
		return length;
	}

	/**
	 * 匹配替换颜色字符串
	 * @param 需要匹配替换的字符串
	 * @param 需要匹配目标颜色
	 * @return 替换后的字符串
	 * **/
	public static replaceStrColor(src: string, color: string): string {
		// src = "0x102030asdas0xff1536tttt0xff15370x888888aabb0x789456";//测试
		let tci = src.indexOf("0x");
		let tci2 = tci;
		let arghr2 = "";
		let arghr3 = "";
		while (tci2 != -1) {
			arghr2 = src.substring(tci, tci + 8);
			src = src.replace(arghr2, color);
			tci += 8;
			arghr3 = src.substring(tci);
			tci2 = arghr3.indexOf("0x");
			tci = tci + tci2;
		}
		return src;
	}

	/**
	 * 判断一个字符串是否包含中文
	 * @param str
	 * @returns {boolean}
	 */
	public static isChinese(str: string): boolean {
		let reg = /^[\u4E00-\u9FA5]+$/;
		if (!reg.test(str)) {
			return true;
		}
		return false;
	}


	/**
	 * 获取字符串的字节长度
	 * 一个中文算2两个字节
	 * @param str
	 * @return
	 */
	public static strByteLen(str: string): number {
		let byteLen: number = 0;
		let strLen: number = str.length;
		for (let i: number = 0; i < strLen; i++) {
			byteLen += str.charCodeAt(i) >= 0x7F ? 2 : 1;
		}
		return byteLen;
	}

	/**
	 * 补齐字符串
	 * 因为这里使用的是字节长度（一个中文算2个字节）
	 * 所以指定的长度是指字节长度，用来填补的字符按一个字节算
	 * 如果填补的字符使用中文那么会导致结果不正确，但这里没有对填补字符做检测
	 * @param str 源字符串
	 * @param length 指定的字节长度
	 * @param char 填补的字符
	 * @param ignoreHtml 是否忽略HTML代码，默认为true
	 * @return
	 *
	 */
	public static complementByChar(str: string, length: number, char: string = " ", ignoreHtml: boolean = true): string {
		let byteLen: number = this.strByteLen(ignoreHtml ? str.replace(StringUtils.HTML, "") : str);
		return str + this.repeatStr(char, length - byteLen);
	}

	/**
	 * 重复指定字符串count次
	 * @param str
	 * @param count
	 * @return
	 *
	 */
	public static repeatStr(str: string, count: number): string {
		let s: string = "";
		for (let i: number = 0; i < count; i++) {
			s += str;
		}
		return s;
	}

	/**
	 * 为文字添加颜色
	 * */
	public static addColor(content: string, color: any): string {
		let colorStr: string;
		if (typeof (color) == "string")
			colorStr = String(color)
		else if (typeof (color) == "number")
			colorStr = Number(color).toString(10);
		return `<font color=\"${colorStr}\">${content}</font>`;
	}
	/**
	 * 这个函数还没改完,用来替代addColor
	 * 
	 */
	public static addColor1(content: string, color: any): Object {
		let obj: Object = new Object;
		obj["style"] = new Object;
		obj["text"] = content;
		obj["textColor"] = Number(color).toString(16);

		return obj;
	}

	public static substitute(str: string, ...rest): string {
		let reg: RegExp = RegExpUtil.REPLACE_STRING;
		let replaceReg: any[] = str.match(reg);
		if (replaceReg && replaceReg.length) {
			let len: number = replaceReg.length;
			for (let t_i: number = 0; t_i < len; t_i++) {
				str = str.replace(replaceReg[t_i], rest[t_i]);
			}
		}
		return str;
	}

	/**
	 * 匹配替换字符串
	 * @param 需要匹配替换的字符串
	 * @param 匹配的字符串
	 * @param 需要替换成的字符串
	 * **/
	public static replaceStr(src: string, tar: string, des: string) {
		if (src.indexOf(tar) == -1)
			return src;

		let list = src.split(tar);
		return list[0] + des + list[1];
	}

	/**
	 * 字符串匹配拼接
	 * @param 需要拼接的字符串
	 * @param 匹配项
	 * @returns {string}
	 */
	public static replace(str: string, ...args: any[]): string {
		for (let i = 0; i < args.length; i++) {
			str = str.replace("%s", args[i] + "");
		}
		return str;
	}

	/**
	 * 返回字符串中的包含所有数字的数组
	 * @param 需要获取数字的字符串
	 * **/
	public static getStrByNumbers(src: string): string[] {
		let newStrlist = [];
		let newStr = src.replace(/\d+/g, function (): string {

			//调用方法时内部会产生 this 和 arguments
			// console.log("arguments[0] = "+arguments[0]);//匹配的字符串值
			// console.log("arguments[1] = "+arguments[1]);//字符串索引
			// console.log("arguments[2] = "+arguments[2]);//原字符串

			//查找数字后，可以对数字进行其他操作
			newStrlist.push(arguments[0]);
			return arguments[0].toString();//改变原来的数值
		});

		// console.log("newStrlist = "+newStrlist);
		return newStrlist
	}

	/**
	 * 根据正则匹配指定字符串 返回字符串中的包含所有数据的数组
	 * @param 需要获取数字的字符串
	 * @param 正则表达规则(缺省值)
	 * **/
	public static getStrByRegExp(src: string, reg: RegExp = /\d+/g): string[] {
		let newStrlist = [];
		let newStr = src.replace(reg, function (): string {

			//调用方法时内部会产生 this 和 arguments
			// console.log("arguments[0] = "+arguments[0]);//匹配的字符串值
			// console.log("arguments[1] = "+arguments[1]);//字符串索引
			// console.log("arguments[2] = "+arguments[2]);//原字符串

			//查找数字后，可以对数字进行其他操作
			newStrlist.push(arguments[0]);
			if (typeof arguments[0] == "number")//改变原来的数值
				return arguments[0].toString();
			else
				return arguments[0]
		});

		// console.log("newStrlist = "+newStrlist);
		return newStrlist
	}

	/**
	* 数字转中文
	* 例子:
	* StringUtils.NumberToChinese(325) = "三百二十五" (string）
	* */
	private static chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
	private static chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
	private static chnUnitChar = ["", "十", "百", "千"];
	public static NumberToChinese(num: number) {
		let unitPos = 0;
		let strIns = '', chnStr = '';
		let needZero = false;
		let chnNumChar = StringUtils.chnNumChar;
		let chnUnitSection = StringUtils.chnUnitSection;
		let bit = num;
		if (num === 0) {
			return chnNumChar[0];
		}

		while (num > 0) {
			let section = num % 10000;
			if (needZero) {
				chnStr = chnNumChar[0] + chnStr;
			}
			strIns = StringUtils.SectionToChinese(section);
			strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
			chnStr = strIns + chnStr;
			needZero = (section < 1000) && (section > 0);
			num = Math.floor(num / 10000);
			unitPos++;
		}

		if ((bit / 100) >> 0 == 0 && (bit / 10) >> 0 != 0 && chnStr[0] == "一")
			chnStr = chnStr.substr(1)

		return chnStr;
	}

	//转万单位以下
	private static SectionToChinese(section: number) {
		let strIns = '', chnStr = '';
		let unitPos = 0;
		let zero = true;
		let chnNumChar = StringUtils.chnNumChar;
		let chnUnitChar = StringUtils.chnUnitChar;
		while (section > 0) {
			let v = section % 10;
			if (v === 0) {
				if (!zero) {
					zero = true;
					chnStr = chnNumChar[v] + chnStr;
				}
			} else {
				zero = false;
				strIns = chnNumChar[v];
				strIns += chnUnitChar[unitPos];
				chnStr = strIns + chnStr;
			}
			unitPos++;
			section = Math.floor(section / 10);
		}
		return chnStr;
	}
}