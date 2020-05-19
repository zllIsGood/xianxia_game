/**属性格式化 */
class AttributeFormat {
	//默认颜色
	public static DEFAULT_COLOR: number = 0xDFD1B5;

	/** 属性名与属性值间隔多宽(默认4格)*/
	public intervals: number = 4;
	/**两个属性值之间的空行数量 ,默认为0 */
	public emptyLine: number = 0;
	/**符号 +,-,: */
	public sign: string = "+";
	/**空格的数量 */
	public spaceCount: number = 0;
	/**是否显示属性名 */
	public isShowAttName: number = 1;
	/**文字颜色 */
	public wordColor: number = AttributeFormat.DEFAULT_COLOR;
	/**属性颜色 */
	public attrColor: number = AttributeFormat.DEFAULT_COLOR;
	public constructor() {
	}

	/**根据参数获取显示格式 */
	public static getFormat(intervals: number = 4, emptyLine: number = 0, sign: string = "+", spaceCount: number = 0,
							isShowAttName: number = 1, wordColor: number = this.DEFAULT_COLOR, attrColor: number = this.DEFAULT_COLOR): AttributeFormat {
		let format: AttributeFormat = new AttributeFormat();
		format.intervals = intervals;
		format.emptyLine = emptyLine;
		format.sign = sign;
		format.spaceCount = spaceCount;
		format.isShowAttName = isShowAttName;
		format.wordColor = wordColor;
		format.attrColor = attrColor;
		return format;
	}

	/** 
	 * 格式1如下
	 * 力量:400
	 * 敏捷:400
	*/
	public static FORMAT_1(): AttributeFormat {
		return this.getFormat(0, 0, "：");
	}
	/** 
	 * 格式1如下
	 * 力量:400(绿色数字)
	 * 敏捷:400(绿色数字)
	*/
	public static FORMAT_2(): AttributeFormat {
		let format: AttributeFormat = this.FORMAT_1();
		format.attrColor = 0x35e62d;
		return format;
	}
}