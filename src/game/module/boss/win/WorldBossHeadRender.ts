class WorldBossHeadRender extends GuildWarMemberHeadRender {

	private isAddEff: boolean = false;

	public dataChanged(): void {
		this.haveGuildName(false);
		this.isAddEff = false;
		if (this.data instanceof CharMonster) {
			this.currentState = "war";
			this.updateChar(this.data);
		}
		else if (!isNaN(this.data)) {
			this.currentState = "war";
			if (this.data) {
				let charSource = EntityManager.ins().getEntityByHandle(this.data) || EntityManager.ins().getEntityBymasterhHandle(this.data);
				if (charSource) this.updateChar(charSource);
				else if (KFBossSys.ins().isKFBossBattle && KFBossSys.ins().flagHandle == this.data) {
					//跨服boss固定旗帜
					let flagConfig = GlobalConfig.MonstersConfig[GlobalConfig.CrossBossBase.flagId];
					if (flagConfig && this.checkMonHead(flagConfig)) {
						let t: number = KFBossSys.ins().flagCD - egret.getTimer();
						let tStr: string = DateUtils.getFormatBySecond(t / 1000);
						if (t <= 0) {
							tStr = "";
							this.haveGuildName(false);
						}
						else this.haveGuildName(true);
						let str: string = `${flagConfig.name}\n|C:${ColorUtil.RED}&T:${tStr}|`;
						this.roleName.textFlow = TextFlowMaker.generateTextFlow1(str);
						this.roleHead.source = `monhead${flagConfig.head}_png`;
						this.addAttEffect();
					}
				}
				else if (KfArenaSys.ins().isKFArena && KfArenaSys.ins().flagHandle == this.data) {
					//跨服竞技场固定旗帜
					let flagConfig = GlobalConfig.MonstersConfig[GlobalConfig.CrossArenaBase.flagBossId];
					if (flagConfig && this.checkMonHead(flagConfig)) {
						let t: number = KfArenaSys.ins().flagCD - egret.getTimer();
						let tStr: string = `|C:${ColorUtil.RED}&T:${DateUtils.getFormatBySecond(t / 1000)}|`;
						if (t <= 0) {
							if (!KfArenaSys.ins().firstCollect) {
								tStr = `|C:${ColorUtil.GREEN}&T:(首采翻倍)|`;
								this.haveGuildName(true);
							}
							else {
								tStr = "";
								this.haveGuildName(false);
							}

						}
						else this.haveGuildName(true);


						let str: string = `${flagConfig.name}\n${tStr}`;
						this.roleName.textFlow = TextFlowMaker.generateTextFlow1(str);
						this.roleHead.source = `monhead${flagConfig.head}_png`;
						this.addAttEffect();
					}
				}
			}
			else {
				let bossConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
				if (bossConfig && this.checkMonHead(bossConfig)) {
					this.roleName.textFlow = new egret.HtmlTextParser().parser(bossConfig.name);
					this.roleHead.source = `monhead${bossConfig.head}_png`;
					this.addAttEffect();
				}
			}

		} else if (this.data instanceof SelectInfoData) {
			this.currentState = "panel";
			this.num.textFlow = new egret.HtmlTextParser().parser(this.data.num + "份");
			this.roleName.textFlow = new egret.HtmlTextParser().parser(this.data.data.name);
			this.roleHead.source = `main_role_head${this.data.data.job}`;
		}

		if (!this.isAddEff) {
			this.removeAttEffect();
		}
	}

	private checkMonHead(config: MonstersConfig) {
		if (Assert(config.head, `怪物头像不存在，id:${config.id},name:${config.name},fbType:${GameMap.fbType},fbId:${GameMap.fubenID},last:${GameMap.lastFbTyp},${GameMap.lastFbId},parent:${this.parent && this.parent.name}`))
			return false;
		return true;
	}

	private updateChar(charSource: CharMonster) {
		if (charSource instanceof CharRole) {
			let info: Role = <Role>charSource.infoModel;
			if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
				let tname: string = info.name;
				if (info.type == EntityType.LadderPlayer) {
					let strlist = tname.split("\n");
					if (strlist[1])
						tname = strlist[1];
					else
						tname = strlist[0];

					tname = StringUtils.replaceStr(tname, "0xffffff", this.roleName.textColor + "");
				}
				//|C:0x6495ed&T:龙城[长老]
				this.roleName.textFlow = TextFlowMaker.generateTextFlow1(tname);//new egret.HtmlTextParser().parser(`${info.name}\n<font color='#6495ed'>龙城[长老]</font>`);

			} else {

				let guildName = info.guildName ? `\n|C:0x6495ed&T:${info.guildName}|` : "";

				let str = DevildomSys.ins().isDevildomBattle && guildName ? info.name + guildName : info.getNameWithServer2();
				if (str.indexOf(`\n`) > -1) {
					this.haveGuildName(true);
				}

				this.roleName.textFlow = TextFlowMaker.generateTextFlow1(str);

			}
			if (Assert(info.job, `任务职业不存在，id:${info.configID},name:${info.name}`))
				return;

			this.roleHead.source = `main_role_head${info.job}`;

			if (this.checkIsCurrAttack(info.handle)) {
				this.addAttEffect();
			}
		}
		else {
			let monster: CharMonster = charSource;
			if (monster.infoModel.type == EntityType.Monster || (KFBossSys.ins().isKFBossBattle && monster.infoModel.type == EntityType.CollectionMonst)) //怪物
			{
				let config = GlobalConfig.MonstersConfig[monster.infoModel.configID];
				if (Assert(config, `怪物配置找不到 id:${monster.infoModel.configID}`))
					return;
				if (!this.checkMonHead(config)) return;
				this.roleName.textFlow = new egret.HtmlTextParser().parser(config.name);
				this.roleHead.source = `monhead${config.head}_png`;
				if (this.checkIsCurrAttack(monster.infoModel.handle))
					this.addAttEffect();
			}
		}
	}

	private checkIsCurrAttack(handle) {
		let curMasterHandle = EntityManager.ins().getRootMasterHandle(GameLogic.ins().currAttackHandle);
		return curMasterHandle == EntityManager.ins().getRootMasterHandle(handle);
	}

	public addAttEffect() {
		super.addAttEffect();
		this.isAddEff = true;
	}
}