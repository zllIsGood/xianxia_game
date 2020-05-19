class GlobalConfig {

	private static config;

	static init(_config: JSON = null) {
		let self = this;
		if (self.config) return;

		let config = self.config = RES.getRes("config_json");
	
		if (_config) {
			config = _config;
		}
		if (!config) {
			return;
		}

		let parseKeys = function (obj: any, proto: any, key: number) {
			if (key == 0) {
				obj.__proto__ = proto;
			} else {
				for (let i in obj) {
					parseKeys(obj[i], proto, key - 1);
				}
			}
		}

		for (let key in config) {

			let value = config[key];

			let objCls = HYDefine.getDefinitionByName(key);

			if (objCls) {
				//用来存储配置一个默认实例
				let objKey = `_obj${key}`;
				self[objKey] = new objCls();

				//用来确认配置表是否已经设置 __proto__ 为 储存的实例（this[objKey])
				let boolKey = `_bool${key}`;
				self[boolKey] = false;

				//将真正的配置存放在this[newKey]中
				let newKey = `_${key}_`;
				//创建key引用配置
				Object.defineProperty(self, key, {
					get: function () {
						let obj = self[newKey];
						if (self[boolKey]) {
							return obj;
						}

						let proto = self[objKey];

						parseKeys(obj, proto, GlobalConfig.keys[key] || 0);

						self[boolKey] = true;

						return obj;
					},
					set: function (val) {
						self[newKey] = val;
					}
				});
			}

			//是否需要深拷贝赋值？
			self[key] = value;
		}

		// 当 config_json 内容为空时就不用释放
		if (RES.getRes('config_json')) {
			RES.destroyRes("config_json");	
		}
	}

	static SDKConfig: SDKConfig;
	static SpecialEquipsConfig: SpecialEquipsConfig;
	static PrivilegeData: PrivilegeData;
	static PunchEquipMasterConfig: PunchEquipMasterConfig[];
	static PunchEquipConfig: PunchEquipConfig[][];
	static ActivityType9Config: ActivityType9Config[][];
	static ActivityType10Config: ActivityType10Config[][];
	static SuperVipConfig: SuperVipConfig[];
	static GodWeaponTaskConfig: GodWeaponTaskConfig[][];
	static ActorExRingFubenConfig: ActorExRingFubenConfig;
	static TrainDayAwardConfig: TrainDayAwardConfig[][];
	static ActivityType5Config: ActivityType5Config[][];
	static ItemComposeConfig: ItemComposeConfig[];
	static LoopRechargeConfig: LoopRechargeConfig[][];
	static CampBattleConfig: CampBattleConfig;
	static CampBattlePersonalAwardConfig: CampBattlePersonalAwardConfig[];
	static CampBattlePersonalRankAwardConfig: CampBattlePersonalRankAwardConfig[];
	static GodWingLevelConfig: GodWingLevelConfig[][];
	static MonsterTitleConf: MonsterTitleConf[];
	static FbChallengeLotteryConfig: FbChallengeLotteryConfig[];
	static LoginActivateConfig: LoginActivateConfig;
	static GodWingSuitConfig: GodWingSuitConfig[];
	static GodWingItemConfig: GodWingItemConfig[];
	static NewWorldBossRankConfig: NewWorldBossRankConfig[][];
	static NewWorldBossAttrConfig: NewWorldBossAttrConfig[];
	static NewWorldBossBaseConfig: NewWorldBossBaseConfig;
	static MailIdConfig: MailIdConfig[];
	static CityBaseConfig: CityBaseConfig;
	static CityBossConfig: CityBossConfig[];
	static HefuBossBaseConfig: HefuBossBaseConfig;
	static HefuBossConfig: HefuBossConfig[];
	static LevelMailConfig: LevelMailConfig[];
	static LoginDayMailConfig: LoginDayMailConfig;
	static GuildBonFireConfig: GuildBonFireConfig[];
	static ActivityType4Config: ActivityType4Config[][];
	static VipGiftConfig: VipGiftConfig[];
	static ActivityType3Config: ActivityType3Config[][];
	static RechargeDaysAwardsConfig: RechargeDaysAwardsConfig[];
	static RechargeItemsConfig: RechargeItemsConfig[];
	static WeaponSoulSuit: WeaponSoulSuit[][];
	static WeaponSoulPosConfig: WeaponSoulPosConfig[][];
	static WeaponSoulConfig: WeaponSoulConfig[];
	static KuangYuanConfig: KuangYuanConfig[];
	static NpcBaseConfig: NpcBaseConfig[];
	static CaiKuangConfig: CaiKuangConfig;
	static RichManRoundAwardConfig: RichManRoundAwardConfig[];
	static RichManGridConfig: RichManGridConfig[];
	static RichManBaseConfig: RichManBaseConfig;
	static FuwenTreasureRewardConfig: FuwenTreasureRewardConfig[];
	static MonsterSpeakConfig: MonsterSpeakConfig[][];
	static LeadFubenBaseConfig: LeadFubenBaseConfig;
	static GuanYinAwardConfig: GuanYinAwardConfig[];
	static MonthCardConfig: MonthCardConfig;
	static ItemGiftConfig: ItemGiftConfig[];
	static HeirloomEquipConfig: HeirloomEquipConfig[][];
	static HeirloomEquipItemConfig: HeirloomEquipItemConfig[];
	static HeirloomEquipFireConfig: HeirloomEquipFireConfig[];
	static HeirloomEquipSetConfig: HeirloomEquipSetConfig[];
	static ItemDescConfig: ItemDescConfig[];
	static DailyRechargeConfig: DailyRechargeConfig[][];
	static FirstRechargeConfig: FirstRechargeConfig[];
	static FirstRechargeClientConfig: FirstRechargeClientConfig[];
	static ExpFubenBaseConfig: ExpFubenBaseConfig;
	static ExpFubenConfig: ExpFubenConfig[];
	static ExpFbMonsterConfig: ExpFbMonsterConfig[];
	static ImbaSkillReviseConfig: ImbaSkillReviseConfig[];
	static HintConfig: HintConfig[];
	static SkillsSorderConfig: SkillsSorderConfig[];
	static SkillsDescConfig: SkillsDescConfig[];
	static ScenesConfig: ScenesConfig[];
	static YouDangConfig: YouDangConfig[];
	static BossHomeConfig: BossHomeConfig[];
	static OpenSystemConfig: OpenSystemConfig[];
	static LoongSoulBaseConfig: LoongSoulBaseConfig;
	static DeathgainWayConfig: DeathgainWayConfig[];
	static DeathGuideConfig: DeathGuideConfig[];
	static TrainBaseConfig: TrainBaseConfig;
	static FbChNameConfig: FbChNameConfig[];
	static StoneOpenConfig: StoneOpenConfig[];
	static WorldBossKillMsgConfig: WorldBossKillMsgConfig[];
	static MonstershpConfig: MonstershpConfig[];
	static MonthSignVipConfig: MonthSignVipConfig[];
	static MonthSignDaysConfig: MonthSignDaysConfig[];
	static MonthSignBaseConfig: MonthSignBaseConfig;
	static MonthSignConfig: MonthSignConfig[];
	static BookListConfig: BookListConfig[];
	static DecomposeConfig: DecomposeConfig[];
	static SuitConfig: SuitConfig[][];
	static CardConfig: CardConfig[][];
	static TreasureBoxRateConfig: TreasureBoxRateConfig[];
	static TreasureBoxGridConfig: TreasureBoxGridConfig[];
	static TreasureBoxConfig: TreasureBoxConfig[];
	static TreasureBoxBaseConfig: TreasureBoxBaseConfig;
	static TianTiConstConfig: TianTiConstConfig;
	static TianTiDanConfig: TianTiDanConfig[][];
	static TianTiRankAwardConfig: TianTiRankAwardConfig[];
	static NeiGongBaseConfig: NeiGongBaseConfig;
	static NeiGongStageConfig: NeiGongStageConfig[][];
	static FuwenTreasureConfig: FuwenTreasureConfig;
	static FuwenTreasureLevelConfig: FuwenTreasureLevelConfig[];
	static FbChallengeConfig: FbChallengeConfig[];
	static RuneConverConfig: RuneConverConfig[];
	static RuneBaseConfig: RuneBaseConfig[];
	static RuneLockPosConfig: RuneLockPosConfig[];
	static RuneNameConfig: RuneNameConfig[];
	static RuneOtherConfig: RuneOtherConfig;
	static RuneAttrTypeConfig: RuneAttrTypeConfig[];
	static TogetherHitEquipPageConfig: TogetherHitEquipPageConfig[];
	static TogetherHitEquipQmConfig: TogetherHitEquipQmConfig[][][];
	static TogetherHitEquipExchangeConfig: TogetherHitEquipExchangeConfig[];
	static TogetherHitConfig: TogetherHitConfig[];
	static LimitTimeTaskConfig: LimitTimeTaskConfig[];
	static LimitTimeConfig: LimitTimeConfig[];
	static BubbleConfig: BubbleConfig[];
	static DefineEff: DefineEff[];
	static ActivityType25Config: ActivityType25Config[][];
	static ActorExRingConfig: ActorExRingConfig[];
	static ActorExRingBookConfig: ActorExRingBookConfig[][];
	static ActorExRing7Config: ActorExRing7Config[];
	static ActorExRingAbilityConfig: ActorExRingAbilityConfig[];
	static ActorExRingItemConfig: ActorExRingItemConfig[][];
	static MonstersConfig: MonstersConfig[];
	static ExpConfig: ExpConfig[];
	static ItemConfig: ItemConfig[];
	static EquipConfig: EquipConfig[];
	static SkillsConfig: SkillsConfig[];
	static SkirmishRewardConfig: SkirmishRewardConfig[];
	static SkirmishBaseConfig: SkirmishBaseConfig;
	static EffectsConfig: EffectsConfig[];
	static ChaptersRewardConfig: ChaptersRewardConfig[];
	static WorldRewardConfig: WorldRewardConfig[];
	static WingLevelConfig: WingLevelConfig[];
	static WingCommonConfig: WingCommonConfig;
	static DailyFubenConfig: DailyFubenConfig[];
	static DailyConfig: DailyConfig[];
	static DailyAwardConfig: DailyAwardConfig[];
	static ImbaJigsawConf: ImbaJigsawConf[];
	static ImbaConf: ImbaConf[];
	static AchievementTaskConfig: AchievementTaskConfig[];
	static ZhuanShengConfig: ZhuanShengConfig;
	static ZhuanShengLevelConfig: ZhuanShengLevelConfig[];
	static JingMaiStageConfig: JingMaiStageConfig[];
	static JingMaiLevelConfig: JingMaiLevelConfig[];
	static JingMaiCommonConfig: JingMaiCommonConfig;
	static SkillsUpgradeConfig: SkillsUpgradeConfig[];
	static SkillsOpenConfig: SkillsOpenConfig[];
	static ZhuanShengExpConfig: ZhuanShengExpConfig[];
	static NewRoleConfig: NewRoleConfig[];
	static ForgeIndexConfig: ForgeIndexConfig[];
	static StoneLevelCostConfig: StoneLevelCostConfig[];
	static StoneLevelConfig: StoneLevelConfig[];
	static ZhulingAttrConfig: ZhulingAttrConfig[];
	static ZhulingCostConfig: ZhulingCostConfig[];
	static EnhanceAttrConfig: EnhanceAttrConfig[];
	static EnhanceCostConfig: EnhanceCostConfig[];
	static LegendLevelupConfig: LegendLevelupConfig[];
	static LegendComposeConfig: LegendComposeConfig[];
	static ExRingConfig: ExRingConfig[];
	static ExRing0Config: ExRing0Config[];
	static ExRing1Config: ExRing1Config[];
	static EquipItemConfig: EquipItemConfig[];
	static ItemStoreConfig: ItemStoreConfig[];
	static StoreCommonConfig: StoreCommonConfig;
	static IntegralStore: IntegralStore[];
	static TreasureOverViewConfig: TreasureOverViewConfig[];
	static EffectConfig: EffectConfig[];
	static VipConfig: VipConfig[];
	static ShieldConfig: ShieldConfig[];
	static ShieldStageConfig: ShieldStageConfig[];
	static LoongSoulConfig: LoongSoulConfig[];
	static LoongSoulStageConfig: LoongSoulStageConfig[];
	static TreasureHuntConfig: TreasureHuntConfig;
	static TreasureHuntPoolConfig: TreasureHuntPoolConfig[];
	static TreasureHuntPoolHefuConfig: TreasureHuntPoolHefuConfig[];
	static SkirmishRankConfig: SkirmishRankConfig[];
	static GainItemConfig: GainItemConfig[];
	static BagBaseConfig: BagBaseConfig;
	static BagExpandConfig: BagExpandConfig[];
	static WorldBossConfig: WorldBossConfig[];
	static WorldBossBaseConfig: WorldBossBaseConfig;
	static ServerTips: ServerTips[];
	static GuardGodWeaponConf: GuardGodWeaponConf;
	static GGWWaveConf: GGWWaveConf[][];
	static AttrPowerConfig: AttrPowerConfig[];
	static TrainLevelConfig: TrainLevelConfig[];
	static LoginRewardsConfig: LoginRewardsConfig[];
	static ActivityType1Config: ActivityType1Config[][];
	static ActivityType2Config: ActivityType2Config[][];
	static ActivityType26Config: ActivityType26Config[][];
	static ActivityType6Config: ActivityType6Config[][];
	static ActivityType8Config: ActivityType8Config[][];
	static ActivityType7Config: ActivityType7Config[][];
	static ActivityType22_1Config: ActivityType22_1Config[][];
	static ActivityType22_2Config: ActivityType22_2Config[][];
	static ActivityConfig: ActivityConfig[];
	static ActivityBtnConfig: ActivityBtnConfig[];
	static SkillPowerConfig: SkillPowerConfig[];
	static KnighthoodConfig: KnighthoodConfig[];
	static KnighthoodBasicConfig: KnighthoodBasicConfig;
	static ChongZhi1Config: ChongZhi1Config[][][];
	static ChongZhi2Config: ChongZhi2Config[][][];
	static FuncNoticeConfig: FuncNoticeConfig[];
	static RefinesystemExpConfig: RefinesystemExpConfig[];
	static VipGridConfig: VipGridConfig[];
	static OtherBoss1Config: OtherBoss1Config[];
	static EquipPointConstConfig: EquipPointConstConfig;
	static EquipPointBasicConfig: EquipPointBasicConfig[];
	static EquipPointGrowUpConfig: EquipPointGrowUpConfig[][];
	static EquipPointRankConfig: EquipPointRankConfig[][];
	static EquipPointResolveConfig: EquipPointResolveConfig[];
	static WanBaGiftbagBasic: WanBaGiftbagBasic[];
	static HelpInfoConfig: HelpInfoConfig[];
	static ClientGlobalConfig: ClientGlobalConfig;
	static CashCowBoxConfig: CashCowBoxConfig[];
	static CashCowLimitConfig: CashCowLimitConfig[];
	static CashCowBasicConfig: CashCowBasicConfig[];
	static CashCowAmplitudeConfig: CashCowAmplitudeConfig[];
	static GuildConfig: GuildConfig;
	static GuildCommonSkillConfig: GuildCommonSkillConfig[][];
	static GuildPracticeSkillConfig: GuildPracticeSkillConfig[][];
	static GuildCreateConfig: GuildCreateConfig[];
	static GuildDonateConfig: GuildDonateConfig[];
	static GuildLevelConfig: GuildLevelConfig[][];
	static GuildTaskConfig: GuildTaskConfig[];
	static WelfareConfig: WelfareConfig[];
	static OtherBoss2Config: OtherBoss2Config[];
	static MiJiGridConfig: MiJiGridConfig[];
	static MiJiSkillConfig: MiJiSkillConfig[];
	static TitleConf: TitleConf[];
	static TrainLevelAwardConfig: TrainLevelAwardConfig[];
	static TerraceDescConfig: TerraceDescConfig[];
	static WeiXiGuanZhuConst: WeiXiGuanZhuConst;
	static GuildBattleLevel: GuildBattleLevel[];
	static GuildBattleConst: GuildBattleConst;
	static GuildBattleDayAward: GuildBattleDayAward[];
	static GuildBattleDistributionAward: GuildBattleDistributionAward[][];
	static GuildBattlePersonalAward: GuildBattlePersonalAward[];
	static GuildBattlePersonalRankAward: GuildBattlePersonalRankAward[];
	static GuildStoreConfig: GuildStoreConfig;
	static FriendLimit: FriendLimit;
	static ZhuangBanId: ZhuangBanId[];
	static ZhuangBanConfig: ZhuangBanConfig;
	static FeatsStore: FeatsStore[];
	static GuildBossConfig: GuildBossConfig;
	static GuildBossInfoConfig: GuildBossInfoConfig[];
	static GuildBossHpAwardsConfig: GuildBossHpAwardsConfig[][];
	static GuildBossRankConfig: GuildBossRankConfig[];
	static AllWorldConfig: AllWorldConfig[];
	static GuideConfig: GuideConfig[][];
	static TogerherHitBaseConfig: TogerherHitBaseConfig;
	static ActorExRingCommon: ActorExRingCommon;
	static HeirloomTreasureConfig: HeirloomTreasureConfig;
	static HeirloomTreasureRewardConfig: HeirloomTreasureRewardConfig[];
	static OptionalGiftConfig: OptionalGiftConfig[];
	static GodweaponItemConfig: GodweaponItemConfig[];
	static GodWeaponLineConfig: GodWeaponLineConfig[][];
	static GodWeaponLevelConfig: GodWeaponLevelConfig[];
	static GodWeaponBaseConfig: GodWeaponBaseConfig;
	static GodWeaponFubenConfig: GodWeaponFubenConfig[];
	static GWSkillReviseConfig: GWSkillReviseConfig[];
	static MoneyConfig: MoneyConfig[];
	static FbChallengeBaseConfig: FbChallengeBaseConfig;
	static YuPeiConfig: YuPeiConfig[];
	static YuPeiBasicConfig: YuPeiBasicConfig;
	static PassionPointConfig: PassionPointConfig;
	static PassionPointAwardConfig: PassionPointAwardConfig[];
	static RoleConfig: RoleConfig[][];
	static NewFuncNoticeConfig: NewFuncNoticeConfig[];
	static ReincarnationBase: ReincarnationBase;
	static ReincarnationExchange: ReincarnationExchange[];
	static ReincarnationLevel: ReincarnationLevel[];
	static ReincarnateSpirit: ReincarnateSpirit[][];
	static ReincarnateSuit: ReincarnateSuit[];
	static ReincarnateEquip: ReincarnateEquip[];
	static EquipWithEffConfig: EquipWithEffConfig[];
	static PrestigeBase: PrestigeBase;
	static PrestigeLevel: PrestigeLevel[];
	static ReincarnateEquipCompose: ReincarnateEquipCompose[];
	static ReincarnationSoulLevel: ReincarnationSoulLevel[][][];
	static ReincarnationDemonLevel: ReincarnationDemonLevel[][];
	static ReincarnationLinkLevel: ReincarnationLinkLevel[][][];
	static WelcomeConfig: WelcomeConfig[];
	static HeartMethodConfig: HeartMethodConfig[];
	static HeartMethodStarConfig: HeartMethodStarConfig[];
	static HeartMethodSuitConfig: HeartMethodSuitConfig[][];
	static HeartMethodPosConfig: HeartMethodPosConfig[][][];
	static HeartMethodBaseConfig: HeartMethodBaseConfig;
	static HeartMethodLevelConfig: HeartMethodLevelConfig[][];
	static HeartMethodStageConfig: HeartMethodStageConfig[][];
	/**这个是新手剧情用的气泡对话表 */
	static qipaoConfig: qipaoConfig[];
	static ActivityType17Config: ActivityType17Config[][];
	static ActivityType18Config: ActivityType18Config[][];
	static ActivityType19Config: ActivityType19Config[][];
	/**飞剑奇缘 */
	static ActivityType20Config: ActivityType20Config[][];
	/**寻宝 */
	static ActivityType21Config: ActivityType21Config[][];
	/**单笔充值 */
	static ActivityType23Config: ActivityType23Config[][];
	/**BOSS狂欢 */
	static ActivityType24Config: ActivityType24Config[];

	/**
	 * 春节相关活动, 对应P2的ActivityType18Config
	 */
	static ActivityType27Config: ActivityType27Config[][];

	/**觉醒属性 */
	static AwakenAttrConfig: AwakenAttrConfig[][];
	/**觉醒消耗 */
	static AwakenBaseConfig: AwakenBaseConfig;
	/**觉醒套装（共鸣） */
	static SuitAttrConfig: SuitAttrConfig[];

	static FlySwordTypeConfig: FlySwordTypeConfig[];
	static FlySwordTrainConfig: FlySwordTrainConfig[];
	static FlySwordCommonConfig: FlySwordCommonConfig;
	static FlySwordGrowthConfig: FlySwordGrowthConfig[];
	static FlySwordLevelUpConfig: FlySwordLevelUpConfig[];
	static FlySwordQualificationConfig: FlySwordQualificationConfig[];

	static ZhanLingConfig: ZhanLingConfig;
	static ZhanLingBase: ZhanLingBase[];
	static ZhanLingLevel: ZhanLingLevel[][];
	static ZhanLingEquip: ZhanLingEquip[];
	static ZhanLingSuit: ZhanLingSuit[];
	static ZhanLingTalent: ZhanLingTalent[][];
	static ZhanLingSkill: ZhanLingSkill[];
	static JadePlateLevelConfig: JadePlateLevelConfig[];
	static JadePlateBaseConfig: JadePlateBaseConfig;



	static MergeTotal: MergeTotal[];
	static MergeConfig: MergeConfig[][];

	//幻兽
	static HuanShouStageConf: HuanShouStageConf[];
	static HuanShouTrainConf: HuanShouTrainConf[];
	// static HuanShouBookConf: HuanShouBookConf[];
	static HuanShouSkillConf: HuanShouSkillConf[][];
	static HuanShouPreviewConfig: HuanShouPreviewConfig[];
	static HuanShouConf: HuanShouConf;
	static HuanShouEquipConf: HuanShouEquipConf[][];
	static HuanShouSuitConf: HuanShouSuitConf[];
	static HuanShouSkinConf: HuanShouSkinConf[];
	static HuanShouSkinTrainConf: HuanShouSkinTrainConf[][];
	static HuanShouSkinStageConf: HuanShouSkinStageConf[][];
	static HuanShouTalentConf: HuanShouTalentConf[][];

	static ZhiZunEquipLevel: ZhiZunEquipLevel[][];
	static ZhiZunLinkLevel: ZhiZunLinkLevel[][][];

	//唤醒任务
	static FunOpenTaskConfig: FunOpenTaskConfig[];
	static FunOpenTaskListConfig: FunOpenTaskListConfig[][];
	static FunOpenTaskTypeConfig: FunOpenTaskTypeConfig[];	
	
	//功能预告
	static FunOpenNoticeConfig: FunOpenNoticeConfig[];

	static SpecialGuideConfig: SpecialGuideConfig[];

	static WujiBaseConfig: WujiBaseConfig;
	static CrossBossConfig: CrossBossConfig[];
	static CrossBossBase: CrossBossBase;
	static DevilBossBase: DevilBossBase;
	static DevilBossConfig: DevilBossConfig[];
	static AuctionConfig: AuctionConfig;
	static AuctionItem: AuctionItem[];
	static CrossArenaBase: CrossArenaBase;
	static CrossArenaScore: CrossArenaScore;
	static CrossArenaMetalAward: CrossArenaMetalAward[];
	static CrossArenaRankAward: CrossArenaRankAward[];

	static ShareDevConfig: ShareDevConfig[];
	static InviteadConfig: InviteadConfig[];
	static DailyInviteConfig: DailyInviteConfig[];
	static TotalInviteConfig: TotalInviteConfig[];
	static InviteConf: InviteConf;
	static ItemQuickUseConfig: ItemQuickUseConfig[];
	static CollectGiftConf: CollectGiftConf;
	static CollectGift1Conf: CollectGift1Conf[];
	static ChatEmojiConfig: ChatEmojiConfig[];
	static ClickGiftConf: ClickGiftConf;
	static DeskGiftConf: DeskGiftConf;
	static WanBaHolidayGiftbag: WanBaHolidayGiftbag[];
	static WanBaGiftbagConst: WanBaGiftbagConst;

	static TeamFuBenBaseConfig: TeamFuBenBaseConfig;
	static TeamFuBenConfig: TeamFuBenConfig[];
	static TeamFuBenGuideConfig: TeamFuBenGuideConfig[][];
    static FlowerConfig: FlowerConfig[];
	static FlameStamp: FlameStamp;
	static FlameStampLevel: FlameStampLevel[];
	static FlameStampEffect: FlameStampEffect[][];
	static FlameStampMat: FlameStampMat[];

	static WeaponSoulItemAttr: WeaponSoulItemAttr[];
	static WeaponSoulBaseConfig: WeaponSoulBaseConfig;

	static MijiBaseConfig: MijiBaseConfig;

	private static keys = {

		"ClickGiftConf":1,
		"SpecialEquipsConfig": 1,
		"WeaponSoulItemAttr": 1,
		"WeaponSoulBaseConfig": 0,
		"PrivilegeData": 0,
		"PunchEquipMasterConfig": 1,
		"PunchEquipConfig": 2,
		"ActivityType9Config": 2,
		"ActivityType10Config": 2,
		"SuperVipConfig": 1,
		"GodWeaponTaskConfig": 2,
		"ActorExRingFubenConfig": 0,
		"TrainDayAwardConfig": 2,
		"ActivityType5Config": 2,
		"ItemComposeConfig": 1,
		"LoopRechargeConfig": 2,
		"CampBattleBaseConfig": 0,
		"CampBattleConfig": 0,
		"CampBattlePersonalAwardConfig": 1,
		"CampBattlePersonalRankAwardConfig": 1,
		"GodWingLevelConfig": 2,
		"MonsterTitleConf": 1,
		"FbChallengeLotteryConfig": 1,
		"LoginActivateConfig": 0,
		"GodWingSuitConfig": 1,
		"GodWingItemConfig": 1,
		"NewWorldBossRankConfig": 2,
		"NewWorldBossAttrConfig": 1,
		"NewWorldBossBaseConfig": 0,
		"MailIdConfig": 1,
		"CityBaseConfig": 0,
		"CityBossConfig": 1,
		"HefuBossBaseConfig": 0,
		"HefuBossConfig": 1,
		"LevelMailConfig": 1,
		"LoginDayMailConfig": 0,
		"GuildBonFireConfig": 1,
		"ActivityType4Config": 2,
		"VipGiftConfig": 1,
		"ActivityType3Config": 2,
		"RechargeDaysAwardsConfig": 1,
		"RechargeItemsConfig": 1,
		"WeaponSoulSuit": 2,
		"WeaponSoulPosConfig": 2,
		"WeaponSoulConfig": 1,
		"KuangYuanConfig": 1,
		"NpcBaseConfig": 1,
		"CaiKuangConfig": 0,
		"JadePlateLevelConfig": 1,
		"JadePlateBaseConfig": 0,


		"RichManRoundAwardConfig": 1,
		"RichManGridConfig": 1,
		"RichManBaseConfig": 0,
		"FuwenTreasureRewardConfig": 1,
		"MonsterSpeakConfig": 2,
		"LeadFubenBaseConfig": 0,
		"GuanYinAwardConfig": 1,
		"MonthCardConfig": 0,
		"ItemGiftConfig": 1,
		"HeirloomEquipConfig": 2,
		"HeirloomEquipItemConfig": 1,
		"HeirloomEquipFireConfig": 1,
		"HeirloomEquipSetConfig": 1,
		"ItemDescConfig": 1,
		"DailyRechargeConfig": 2,
		"FirstRechargeConfig": 1,
		"FirstRechargeClientConfig": 1,
		"ExpFubenBaseConfig": 0,
		"ExpFubenConfig": 1,
		"ExpFbMonsterConfig": 1,
		"ImbaSkillReviseConfig": 1,
		"HintConfig": 1,
		"SkillsSorderConfig": 1,
		"SkillsDescConfig": 1,
		"ScenesConfig": 1,
		"YouDangConfig": 1,
		"BossHomeConfig": 1,
		"OpenSystemConfig": 1,
		"LoongSoulBaseConfig": 0,
		"DeathgainWayConfig": 1,
		"DeathGuideConfig": 1,
		"TrainBaseConfig": 0,
		"FbChNameConfig": 1,
		"StoneOpenConfig": 1,
		"WorldBossKillMsgConfig": 1,
		"MonstershpConfig": 1,
		"MonthSignVipConfig": 1,
		"MonthSignDaysConfig": 1,
		"MonthSignBaseConfig": 0,
		"MonthSignConfig": 1,
		"BookListConfig": 1,
		"DecomposeConfig": 1,
		"SuitConfig": 2,
		"CardConfig": 2,
		"TreasureBoxRateConfig": 1,
		"TreasureBoxGridConfig": 1,
		"TreasureBoxConfig": 1,
		"TreasureBoxBaseConfig": 0,
		"TianTiConstConfig": 0,
		"TianTiDanConfig": 2,
		"TianTiRankAwardConfig": 1,
		"NeiGongBaseConfig": 0,
		"NeiGongStageConfig": 2,
		"FuwenTreasureConfig": 0,
		"FuwenTreasureLevelConfig": 1,
		"FbChallengeConfig": 1,
		"RuneConverConfig": 1,
		"RuneBaseConfig": 1,
		"RuneLockPosConfig": 1,
		"RuneNameConfig": 1,
		"RuneOtherConfig": 0,
		"RuneAttrTypeConfig": 1,
		"TogetherHitEquipPageConfig": 1,
		"TogetherHitEquipQmConfig": 3,
		"TogetherHitEquipExchangeConfig": 1,
		"TogetherHitConfig": 1,
		"LimitTimeTaskConfig": 1,
		"LimitTimeConfig": 1,
		"BubbleConfig": 1,
		"DefineEff": 1,
		"ActorExRingConfig": 1,
		"ActorExRingBookConfig": 2,
		"ActorExRing7Config": 1,
		"ActorExRingAbilityConfig": 1,
		"ActorExRingItemConfig": 2,
		"MonstersConfig": 1,
		"ExpConfig": 1,
		"ItemConfig": 1,
		"EquipConfig": 1,
		"SkillsConfig": 1,
		"SkirmishRewardConfig": 1,
		"SkirmishBaseConfig": 0,
		"EffectsConfig": 1,
		"ChaptersRewardConfig": 1,
		"WorldRewardConfig": 1,
		"WingLevelConfig": 1,
		"WingCommonConfig": 0,
		"DailyFubenConfig": 1,
		"DailyConfig": 1,
		"DailyAwardConfig": 1,
		"ImbaJigsawConf": 1,
		"ImbaConf": 1,
		"AchievementTaskConfig": 1,
		"ZhuanShengConfig": 0,
		"ZhuanShengLevelConfig": 1,
		"JingMaiStageConfig": 1,
		"JingMaiLevelConfig": 1,
		"JingMaiCommonConfig": 0,
		"SkillsUpgradeConfig": 1,
		"SkillsOpenConfig": 1,
		"ZhuanShengExpConfig": 1,
		"NewRoleConfig": 1,
		"ForgeIndexConfig": 1,
		"StoneLevelCostConfig": 1,
		"StoneLevelConfig": 1,
		"ZhulingAttrConfig": 1,
		"ZhulingCostConfig": 1,
		"EnhanceAttrConfig": 1,
		"EnhanceCostConfig": 1,
		"LegendLevelupConfig": 1,
		"LegendComposeConfig": 1,
		"ExRingConfig": 1,
		"ExRing0Config": 1,
		"ExRing1Config": 1,
		"EquipItemConfig": 1,
		"ItemStoreConfig": 1,
		"StoreCommonConfig": 0,
		"IntegralStore": 1,
		"TreasureOverViewConfig": 1,
		"EffectConfig": 1,
		"VipConfig": 1,
		"ShieldConfig": 1,
		"ShieldStageConfig": 1,
		"LoongSoulConfig": 1,
		"LoongSoulStageConfig": 1,
		"TreasureHuntConfig": 0,
		"TreasureHuntPoolConfig": 1,
		"TreasureHuntPoolHefuConfig": 1,
		"SkirmishRankConfig": 1,
		"GainItemConfig": 1,
		"BagBaseConfig": 0,
		"BagExpandConfig": 1,
		"WorldBossConfig": 1,
		"WorldBossBaseConfig": 0,
		"ServerTips": 1,
		"AttrPowerConfig": 1,
		"TrainLevelConfig": 1,
		"LoginRewardsConfig": 1,
		"ActivityType1Config": 2,
		"ActivityType2Config": 2,
		"ActivityType6Config": 2,
		"ActivityType8Config": 2,
		"ActivityType7Config": 2,
		"ActivityType22_1Config": 2,
		"ActivityType22_2Config": 2,
		"ActivityConfig": 1,
		"ActivityBtnConfig": 1,
		"SkillPowerConfig": 1,
		"KnighthoodConfig": 1,
		"KnighthoodBasicConfig": 0,
		"ChongZhi1Config": 3,
		"ChongZhi2Config": 3,
		"FuncNoticeConfig": 1,
		"RefinesystemExpConfig": 1,
		"VipGridConfig": 1,
		"OtherBoss1Config": 1,
		"EquipPointConstConfig": 0,
		"EquipPointBasicConfig": 1,
		"EquipPointGrowUpConfig": 2,
		"EquipPointRankConfig": 2,
		"EquipPointResolveConfig": 1,
		"WanBaGiftbagBasic": 1,
		"HelpInfoConfig": 1,
		"ClientGlobalConfig": 0,
		"CashCowBoxConfig": 1,
		"CashCowLimitConfig": 1,
		"CashCowBasicConfig": 1,
		"CashCowAmplitudeConfig": 1,
		"GuildConfig": 0,
		"GuildCommonSkillConfig": 2,
		"GuildPracticeSkillConfig": 2,
		"GuildCreateConfig": 1,
		"GuildDonateConfig": 1,
		"GuildLevelConfig": 2,
		"GuildTaskConfig": 1,
		"WelfareConfig": 1,
		"OtherBoss2Config": 1,
		"MiJiGridConfig": 1,
		"MiJiSkillConfig": 1,
		"TitleConf": 1,
		"TrainLevelAwardConfig": 1,
		"TerraceDescConfig": 1,
		"WeiXiGuanZhuConst": 0,
		"GuildBattleLevel": 1,
		"GuildBattleConst": 0,
		"GuildBattleDayAward": 1,
		"GuildBattleDistributionAward": 2,
		"GuildBattlePersonalAward": 1,
		"GuildBattlePersonalRankAward": 1,
		"GuildStoreConfig": 0,
		"FriendLimit": 0,
		"ZhuangBanId": 1,
		"ZhuangBanConfig": 0,
		"FeatsStore": 1,
		"GuildBossConfig": 0,
		"GuildBossInfoConfig": 1,
		"GuildBossHpAwardsConfig": 2,
		"GuildBossRankConfig": 1,
		"AllWorldConfig": 1,
		"GuideConfig": 2,
		"TogerherHitBaseConfig": 0,
		"ActorExRingCommon": 0,
		"HeirloomTreasureConfig": 0,
		"HeirloomTreasureRewardConfig": 1,
		"OptionalGiftConfig": 1,
		"GodweaponItemConfig": 1,
		"GodWeaponLineConfig": 2,
		"GodWeaponLevelConfig": 1,
		"GodWeaponBaseConfig": 0,
		"GodWeaponFubenConfig": 1,
		"GWSkillReviseConfig": 1,
		"MoneyConfig": 1,
		"FbChallengeBaseConfig": 0,
		"YuPeiConfig": 1,
		"YuPeiBasicConfig": 0,
		"PassionPointConfig": 0,
		"PassionPointAwardConfig": 1,
		"RoleConfig": 2,
		"NewFuncNoticeConfig": 1,
		"PrestigeBase": 0,
		"PrestigeLevel": 1,
		"ReincarnationBase": 0,
		"ReincarnationExchange": 1,
		"ReincarnationLevel": 1,
		"ReincarnateSpirit": 2,
		"ReincarnateSuit": 1,
		"ReincarnateEquip": 1,
		"EquipWithEffConfig": 1,
		"ActivityType17Config": 2,
		"ReincarnateEquipCompose": 1,
		"ZhanLingConfig": 0,
		"ZhanLingBase": 1,
		"ZhanLingLevel": 2,
		"ZhanLingEquip": 1,
		"ZhanLingSuit": 1,
		"ZhanLingTalent": 2,
		"ZhanLingSkill": 1,
		//幻兽
		"HuanShouStageConf": 1,
		"HuanShouTrainConf": 1,
		"HuanShouSkillConf": 2,
		"HuanShouPreviewConfig": 1,
		"HuanShouConf": 0,
		"HuanShouEquipConf": 2,
		"HuanShouSuitConf": 1,
		"HuanShouSkinConf": 1,
		"HuanShouSkinTrainConf": 2,
		"HuanShouSkinStageConf": 2,

		//轮回装备	
		"ReincarnationSoulLevel": 3,
		"ReincarnationDemonLevel": 2,
		"ReincarnationLinkLevel": 3,
		//唤醒任务
		"FunOpenTaskConfig": 1,
		"FunOpenTaskListConfig": 2,
		"FunOpenTaskTypeConfig": 1,
		
		//功能预告
		"FunOpenNoticeConfig": 1,
		
		"SpecialGuideConfig": 1,
		"CrossBossConfig": 1,
		"CrossBossBase": 0,
		"DevilBossBase": 0,
		"DevilBossConfig": 1,
		"AuctionItem": 1,
		"CrossArenaBase": 0,
		"CrossArenaScore": 1,
		"CrossArenaMetalAward": 1,
		"CrossArenaRankAward": 1,
		
		"ActivityType23Config": 2,
		"ActivityType24Config": 1,
		"ItemQuickUseConfig": 1,

		"DeskGiftConf": 0,

		"WanBaHolidayGiftbag": 1,
		"WanBaGiftbagConst": 0,

		"FlameStamp": 0,
		"FlameStampLevel": 1,
		"FlameStampEffect": 2,
		"FlameStampMat": 1	
	};
}
