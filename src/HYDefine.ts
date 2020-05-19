//---------------------------
// desc: 所有class的定义表
// author: oyxz
// since: 2018-10-31
// copyright: haoyu
//---------------------------
 
class HYDefine {
    public static classList: {[index:string]: any} = {};
    public static init(): void {
        LoadAllClass.init();
        LoadAllInterface.init();

        HYDefine.classList['UserFb'] = UserFb;
        HYDefine.classList['Activity'] = Activity;
        HYDefine.classList['Setting'] = Setting;
        HYDefine.classList['Artifact'] = Artifact;
        HYDefine.classList['ResourceMgr'] = ResourceMgr;
        HYDefine.classList['Actor'] = Actor;
        HYDefine.classList['ThreeHeroes'] = ThreeHeroes;
        HYDefine.classList['GuideUtils'] = GuideUtils;
        HYDefine.classList['DoubleTwelveModel'] = DoubleTwelveModel;
        HYDefine.classList['UserBag'] = UserBag;
        HYDefine.classList['BattleCC'] = BattleCC;
        HYDefine.classList['Book'] = Book;
        HYDefine.classList['BookRedPoint'] = BookRedPoint;
        HYDefine.classList['GwBoss'] = GwBoss;
        HYDefine.classList['UserBoss'] = UserBoss;
        HYDefine.classList['Box'] = Box;
        HYDefine.classList['CDKey'] = CDKey;
        HYDefine.classList['Chat'] = Chat;
        HYDefine.classList['DailyCheckIn'] = DailyCheckIn;
        HYDefine.classList['CityCC'] = CityCC;
        HYDefine.classList['HefuBossCC'] = HefuBossCC;
        HYDefine.classList['FlySword'] = FlySword;
        HYDefine.classList['FlySwordRedPoint'] = FlySwordRedPoint;
        HYDefine.classList['DieGuide'] = DieGuide;
        HYDefine.classList['Dress'] = Dress;
        HYDefine.classList['Encounter'] = Encounter;
        HYDefine.classList['EncounterFight'] = EncounterFight;
        HYDefine.classList['EntrustManager'] = EntrustManager;
        HYDefine.classList['UserExpGold'] = UserExpGold;
        HYDefine.classList['FbRedPoint'] = FbRedPoint;
        HYDefine.classList['MonsterSpeak'] = MonsterSpeak;
        HYDefine.classList['UserFb2'] = UserFb2;
        HYDefine.classList['UserForge'] = UserForge;
        HYDefine.classList['UserGem'] = UserGem;
        HYDefine.classList['UserZhuLing'] = UserZhuLing;
        HYDefine.classList['ForgeRedPoint'] = ForgeRedPoint;
        HYDefine.classList['Friends'] = Friends;
        HYDefine.classList['UserFuLi'] = UserFuLi;
        HYDefine.classList['UserFuLiNotice'] = UserFuLiNotice;
        HYDefine.classList['FuncNoticeController'] = FuncNoticeController;
        HYDefine.classList['GameLogic'] = GameLogic;
        HYDefine.classList['Invite'] = Invite;
        HYDefine.classList['GodWeaponCC'] = GodWeaponCC;
        HYDefine.classList['GodWeaponItemCC'] = GodWeaponItemCC;
        HYDefine.classList['GodWeaponRedPoint'] = GodWeaponRedPoint;
        HYDefine.classList['GodWingRedPoint'] = GodWingRedPoint;
        HYDefine.classList['Guild'] = Guild;
        HYDefine.classList['GuildBoss'] = GuildBoss;
        HYDefine.classList['GuildFB'] = GuildFB;
        HYDefine.classList['GuildRobber'] = GuildRobber;
        HYDefine.classList['GuildStore'] = GuildStore;
        HYDefine.classList['GuildWar'] = GuildWar;
        HYDefine.classList['Heirloom'] = Heirloom;
        HYDefine.classList['Hint'] = Hint;
        HYDefine.classList['HuanShouRedPoint'] = HuanShouRedPoint;
        HYDefine.classList['UserHuanShou'] = UserHuanShou;
        HYDefine.classList['KFBattleRedPoint'] = KFBattleRedPoint;
        HYDefine.classList['DevildomRedPoint'] = DevildomRedPoint;
        HYDefine.classList['DevildomSys'] = DevildomSys;
        HYDefine.classList['KfArenaRedPoint'] = KfArenaRedPoint;
        HYDefine.classList['KfArenaSys'] = KfArenaSys;
        HYDefine.classList['KFBossRedpoint'] = KFBossRedpoint;
        HYDefine.classList['KFBossSys'] = KFBossSys;
        HYDefine.classList['WJBattlefieldSys'] = WJBattlefieldSys;
        HYDefine.classList['Ladder'] = Ladder;
        HYDefine.classList['LiLian'] = LiLian;
        HYDefine.classList['WeiWangCC'] = WeiWangCC;
        HYDefine.classList['LongHun'] = LongHun;
        HYDefine.classList['HeartMethodRedPoint'] = HeartMethodRedPoint;
        HYDefine.classList['UserMail'] = UserMail;
        HYDefine.classList['MergeCC'] = MergeCC;
        HYDefine.classList['Millionaire'] = Millionaire;
        HYDefine.classList['Mine'] = Mine;
        HYDefine.classList['MoveCC'] = MoveCC;
        HYDefine.classList['NeiGong'] = NeiGong;
        HYDefine.classList['NewEquip'] = NewEquip;
        HYDefine.classList['Notice'] = Notice;
        HYDefine.classList['PaoDianCC'] = PaoDianCC;
        HYDefine.classList['PfActivity'] = PfActivity;
        HYDefine.classList['PlayFun'] = PlayFun;
        HYDefine.classList['PlayWayRedPoint'] = PlayWayRedPoint;
        HYDefine.classList['Rank'] = Rank;
        HYDefine.classList['UserReadPlayer'] = UserReadPlayer;
        HYDefine.classList['Recharge'] = Recharge;
        HYDefine.classList['UserEquip'] = UserEquip;
        HYDefine.classList['UserJingMai'] = UserJingMai;
        HYDefine.classList['UserRole'] = UserRole;
        HYDefine.classList['UserSkill'] = UserSkill;
        HYDefine.classList['Wing'] = Wing;
        HYDefine.classList['Rune'] = Rune;
        HYDefine.classList['SamsaraCC'] = SamsaraCC;
        HYDefine.classList['GameServer'] = GameServer;
        HYDefine.classList['SysSetting'] = SysSetting;
        HYDefine.classList['Shop'] = Shop;
        HYDefine.classList['SpecialRing'] = SpecialRing;
        HYDefine.classList['TargetListCC'] = TargetListCC;
        HYDefine.classList['UserTask'] = UserTask;
        HYDefine.classList['Title'] = Title;
        HYDefine.classList['Hunt'] = Hunt;
        HYDefine.classList['UserVip'] = UserVip;
        HYDefine.classList['UserWarn'] = UserWarn;
        HYDefine.classList['Weapons'] = Weapons;
        HYDefine.classList['ZhanLing'] = ZhanLing;
        HYDefine.classList['UserMiji'] = UserMiji;
        HYDefine.classList['UserZs'] = UserZs;
        HYDefine.classList['ZsBoss'] = ZsBoss;
        HYDefine.classList['RoleMgr'] = RoleMgr;
        HYDefine.classList['MessageVo'] = MessageVo;
        HYDefine.classList['KFServerSys'] = KFServerSys;
        HYDefine.classList['GameByteArray'] = GameByteArray;        
        HYDefine.classList['BaseComponent'] = BaseComponent;
        HYDefine.classList['SubRoles'] = SubRoles;
        HYDefine.classList['OpenSystem'] = OpenSystem;
        HYDefine.classList['CharRole'] = CharRole;
        HYDefine.classList['MovieClip'] = MovieClip;
        HYDefine.classList['CharMonster'] = CharMonster;
        HYDefine.classList['GuildRedPoint'] = GuildRedPoint;
        HYDefine.classList['ShopRedPoint'] = ShopRedPoint;
        HYDefine.classList['SkillData'] = SkillData;
        HYDefine.classList['CharNpc'] = CharNpc;
        HYDefine.classList['HeartMethod'] = HeartMethod;
        HYDefine.classList['OSATarget2Panel'] = OSATarget2Panel;
    }

    public static add(index: string, v: any): void {
        HYDefine.classList[index] = v;
    }

    public static getDefinitionByName(name: string): any {
        if (egret.hasDefinition(name)) {
            return egret.getDefinitionByName(name);
        } 
        
        if (LoadAllInterface.interfacelist.indexOf(name) != -1) {
            console.error('define error:' + name);    
        }
        
        return null;
    }
}