module RankDataType {
	/** 战力排行 */
	export const TYPE_POWER: number = 0;
	/** 竞技场排行 */
	export const TYPE_ARENA: number = 1;
	/** 遭遇排行 */
	export const TYPE_SKIRMISH: number = 2;
	/** 关卡排行 */
	export const TYPE_PASS: number = 3;
	/** 副本排行 */
	export const TYPE_COPY: number = 4;
	/** 等级排行 */
	export const TYPE_LEVEL: number = 5;
	/** 翅膀排行 */
	export const TYPE_WING: number = 16;
	/** 职业排行（战士） */
	export const TYPE_JOB_ZS: number = 7;
	/** 职业排行（法师） */
	export const TYPE_JOB_FS: number = 8;
	/** 职业排行（术士） */
	export const TYPE_JOB_DS: number = 9;
	/** 神功排行 */
	export const TYPE_LILIAN: number = 10;
	/** 王者排行 */
	export const TYPE_LADDER: number = 11;
	/** 铸造总等级榜单 */
	export const TYPE_BAOSHI: number = 12;
	/** 天仙排行 */
	export const TYPE_ZHANLING: number = 13;
	/** 龙印总等级榜单*/
	export const TYPE_LONGHUN: number = 14;
	/** 徽章排行 */
	export const TYPE_XUNZHANG: number = 15;
	/** 消费排行 */
	export const TYPE_XIAOFEI: number = -1;

	/** 图鉴总战力 */
	export const TYPE_BOOK: number = 17;
	/** 转生榜 */
	export const TYPE_ZS: number = 18;
	/** 装备总评分*/
	export const TYPE_SCORE: number = 19;
	/** 合服消费排行榜 */
	export const TYPE_HF_XIAOFEI: number = 21;
	/** 威望排行榜 */
	export const TYPE_WEIWANG:number = 22;
	/** 天仙战力排行榜 */
	export const TYPE_MEIREN:number = 23;
	/** 幻兽战力排行榜 */
	export const TYPE_HUANSHOU_POWER:number = 24;
	/** 飞剑战力排行榜 */
	export const TYPE_FLYSWORD_POWER:number = 25;
	/** 灵戒战力排行榜 */
	export const TYPE_EXRING_POWER:number = 26;
	/** 天书战力排行榜 */
	export const TYPE_HEART_POWER:number = 27;
	/** 鲜花排行榜 */
	export const TYPE_XIANHUA:number = 29;

	/** 排名 - short */
	export const DATA_POS: string = 'pos';
	/** ID - int */
	export const DATA_ID: string = 'id';
	/** 名字 - string */
	export const DATA_PLAYER: string = 'player';
	/** 等级 - short */
	export const DATA_LEVEL: string = 'level';
	/** 转生 - short */
	export const DATA_ZHUAN: string = 'zhuan';
	/** VIP等级 - short */
	export const DATA_VIP: string = 'vip';
	/** 月卡 - short */
	export const DATA_MONTH: string = 'month';
	/** 战斗力 - int */
	export const DATA_POWER: string = 'power';
	/** 数量 - int */
	export const DATA_COUNT: string = 'count';
	/** 经验 - int */
	export const DATA_EXP: string = 'exp';
	/** 职业 - char */
	export const DATA_JOB: string = 'job';
	/** 性别 - char */
	export const DATA_SEX: string = 'sex';

	/** 威望 */
	export const DATA_WEIWANG:string = 'weiWang';
	/** 排行项目内容 */
	export const ITEMS: string[][] = [];

	//战力
	ITEMS[TYPE_POWER] =
		//翅膀
		ITEMS[TYPE_WING] =
			//职业
			ITEMS[TYPE_JOB_ZS] =
				ITEMS[TYPE_JOB_FS] =
					ITEMS[TYPE_JOB_DS] =
						[
							DATA_POS,
							DATA_ID,
							DATA_PLAYER,
							DATA_LEVEL,
							DATA_ZHUAN,
							DATA_VIP,
							DATA_MONTH,
							DATA_POWER,
						];

	//遭遇
	ITEMS[TYPE_SKIRMISH] =
		[
			DATA_POS,
			DATA_ID,
			DATA_PLAYER,
			DATA_JOB,
			DATA_SEX,
			DATA_LEVEL,
			DATA_ZHUAN,
			DATA_VIP,
			DATA_COUNT,
			DATA_MONTH,
		];

	//等级
	ITEMS[TYPE_LEVEL] =
		[
			DATA_POS,
			DATA_ID,
			DATA_PLAYER,
			DATA_LEVEL,
			DATA_ZHUAN,
			DATA_VIP,
			DATA_MONTH,
		];

	//关卡 
	ITEMS[TYPE_PASS] =
		//副本
		ITEMS[TYPE_COPY] =
			[
				DATA_POS,
				DATA_ID,
				DATA_PLAYER,
				DATA_POWER,
				DATA_VIP,
				DATA_COUNT,
				DATA_MONTH,
			];

	//战功
	ITEMS[TYPE_LILIAN] =
		[
			DATA_POS,
			DATA_ID,
			DATA_PLAYER,
			DATA_LEVEL,
			DATA_ZHUAN,
			DATA_VIP,
			DATA_MONTH,
			DATA_COUNT,
			DATA_EXP,
		];

	ITEMS[TYPE_XUNZHANG] =
		[
			DATA_POS,
			DATA_ID,
			DATA_PLAYER,
			DATA_LEVEL,
			DATA_ZHUAN,
			DATA_VIP,
			DATA_MONTH,
			DATA_COUNT
		];
	ITEMS[TYPE_XIANHUA] =
		[
			DATA_POS,
			DATA_ID,
			DATA_PLAYER,
			DATA_VIP,
			DATA_COUNT
		];

	//数据对应的读取方式
	export const readFunc: any = {};

	readFunc[DATA_JOB] =
		readFunc[DATA_SEX] =
			'readByte';

	readFunc[DATA_POS] =
		readFunc[DATA_LEVEL] =
			readFunc[DATA_ZHUAN] =
				readFunc[DATA_VIP] =
					readFunc[DATA_MONTH] =
						'readShort';

	readFunc[DATA_ID] =
		readFunc[DATA_POWER] =
			readFunc[DATA_COUNT] =
				readFunc[DATA_EXP] =
					'readInt';

	readFunc[DATA_POWER] = 'readDouble';

	readFunc[DATA_PLAYER] = 'readString';
}