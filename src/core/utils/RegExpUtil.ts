	/**
	 * 游戏里使用到的正则
	 * @author WynnLam
	 *
	 */
	class RegExpUtil
	{
		//换行符\r
		public static  LINE_BREAK:RegExp = /\r+/g;
		//空白字符和“\”号的正则
		public static  BLANK_REG:RegExp = /[\s\\]/g;
		//8位ARGB颜色
		public static  ARGB_COLOR:RegExp = /[a-fA-F0-9]{8}/;
		//html正则
		public static  HTML:RegExp = /<[^>]+>/g;
		//去除空格的正则表达式
		public static  DELETE_SPACE:RegExp = /\s/g; //去除空格字符

		public static  REPLACE_STRING:RegExp = /%s/g; //去除空格字符

		static NumericExp:RegExp = /^\d+$/;
		static NonNumericExp:RegExp = /\D/;
		static ActorNameExp:RegExp = /^([\u4e00-\u9fa5]?\w?[^>|!@#$%&*\^\?]){1,48}$/;

		//聊天表情正则
		static CHAT_EMOJI: RegExp = /#[0-9][0-9]#/g;
		static CHAT_EMOJI_ID: RegExp = /#/g;


	}

