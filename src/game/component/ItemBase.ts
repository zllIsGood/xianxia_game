/**
 * 基础道具显示类
 * (注意：内部带了touch事件，需要手动析构)
 */
class ItemBase extends BaseItemRender {

    // public static QUALITY_COLOR: number[] = [0xf7f0f0, 0x5ad200, 0x00d8ff, 0xce1af5, 0xfeca2d, 0xf3311e];
    // public static QUALITY_COLOR: number[] = [0xffffff, 0x33ff00, 0x9900cc, 0xff9900, 0xff3300, 0xff3399];
    //白,绿,紫,橙,红
    public static QUALITY_COLOR: number[] = [0xe2dfd4, 0x35e62d, 0xd242fb, 0xff750f, 0xf3311e, 0xffd93f];
    protected itemIcon: ItemIcon;
    protected count: eui.Label;
    protected nameTxt: eui.Label;
    public redPoint: eui.Group;

    protected itemConfig: ItemConfig;

    protected EquipEffect: MovieClip;

    public static additionRange: number = 15;

    public num: number;

    public desc: string;
    public desc2: string;

    public runeName: string;

    /** 显示特殊详细描述（诛仙至宝三选一） */
    public showSpeicalDetail: boolean = true;

    public selectFrame: eui.Image;

    //是否开启选中框
    protected isOpenSelectImg: boolean = false;
    //是否是货币
    private isCurrency: boolean = false;
    constructor() {
        super();
        this.skinName = 'ItemSkin';
        this.init();
    }

    /**触摸事件 */
    protected init(): void {
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
    }

    public setSoul(isSoul: boolean): void {
		this.itemIcon.setSoul(isSoul);
	}

    public setItemImg(str: string): void {
        this.itemIcon.imgIcon.source = str;
    }

    public setItemHeirloomBgImg(v: boolean, path?: string): void {
        if (path)
            this.itemIcon.imgheirloom.source = path + "_png";
        this.itemIcon.imgheirloom.visible = v;
    }

    public setDataByConfig(config: ItemConfig, nText?: string): void {
        if (this.itemIcon && typeof this.itemIcon.setData == 'function') {
            this.itemIcon.setData(config);
        }
        let type = ItemConfig.getType(config);
        if (type == 0 && config.descIndex != 248) {//玄玉不显示等级
            let nameStr: string = isNaN(config.zsLevel) ? ((config.level || 1) + `级`) : (config.zsLevel + "转");
            this.nameTxt.text = nameStr;
            //首充显示名字为无级别
            if (UserBag.fitleEquip.indexOf(config.id) != -1) {
                this.nameTxt.text = "无级别"
                this.nameTxt.textColor = ItemConfig.getQualityColor(config);
            }
        } else {
            this.nameTxt.text = nText ? nText : config.name;
            this.nameTxt.textColor = ItemConfig.getQualityColor(config);
        }

        // if (type != 0) {
        //     this.nameTxt.textColor = ItemConfig.getQualityColor(config);
        // }
        if (this.num != undefined) {
            this.setCount(this.num + "");
        }
        //仙盟礼包
        if (type == 12)
            this.redPoint.visible = this.getGuildGift(config);
        

    }

    protected dataChanged(): void {
        this.clear();
        let checkRedPoint = false;
        if (!isNaN(this.data)) {
            this.itemConfig = GlobalConfig.ItemConfig[this.data];
            // if(!this.itemConfig)
            // {
            //     egret.log(this.data);
            //     return;
            // }
            this.setDataByConfig(this.itemConfig, this.runeName);
        }
        // else if (this.data instanceof ItemConfig) {
        //     this.setDataByConfig(this.data);
        // }
        else if (this.data instanceof ItemData) {
            //道具数据
            this.itemConfig = this.data.itemConfig;
            if (!this.itemConfig)
                return;
            this.setDataByConfig(this.itemConfig);
            (<ItemData>this.data).count > 1 ? this.setCount((<ItemData>this.data).count + "") : this.setCount("");
            checkRedPoint = true;
        }
        else {
            //奖励数据
            if ((<RewardData>this.data).type == 0) {
                this.itemIcon.imgIcon.source = RewardData.getCurrencyRes((<RewardData>this.data).id);
                let type: number = 1;
                switch (this.data.id) {
                    case MoneyConst.yuanbao:
                        type = 5;
                        break;
                    case MoneyConst.gold:
                        type = 0;
                        break;
                    case MoneyConst.soul:
                        type = 2;
                        break;
                    case MoneyConst.piece:
                        type = 2;
                        this.itemIcon.imgIcon.source = RewardData.CURRENCY_RES[this.data.id];
                        break;
                    case MoneyConst.godweaponExp:
                        type = 2;
                        break;
                    default:
                        break;
                }
                this.isCurrency = true;
                this.itemIcon.imgBg.source = ItemConfig.getQualityBg(type);
                this.nameTxt.text = RewardData.getCurrencyName((<RewardData>this.data).id);
                this.nameTxt.textColor = ItemBase.QUALITY_COLOR[type];
                let count: number = (<RewardData>this.data).count;
                (count != undefined && count > 1) ? this.setCount(count + "") : this.setCount("");
            }
            else if ((<RewardData>this.data).type == 1) {
                //道具奖励
                this.itemConfig = GlobalConfig.ItemConfig[(<RewardData>this.data).id];
                if (!this.itemConfig)
                    return;
                this.setDataByConfig(this.itemConfig);
                let count: number = (<RewardData>this.data).count;
                count > 1 ? this.setCount(count + "") : this.setCount("");
            }
            else if ((<RewardData>this.data).type == 6) {
                this.itemConfig = GlobalConfig.ItemConfig[this.data.id];
                this.setDataByConfig(this.itemConfig);
                // this.desc = this.itemConfig.desc;
                let count: number = (<RewardData>this.data).count;
                (count != undefined && count > 1) ? this.setCount(count + "") : this.setCount("");
            }
        }
        //设置红点
        if (!this.redPoint.visible)
            this.redPoint.visible = (<ItemData>this.data).canbeUsed;
        this.showEquipEffect();
        //类型8红点独立判定
        if (checkRedPoint) {
            if (this.itemConfig) {
                if (ItemConfig.getType(this.itemConfig) == 8) {
                    let boo: boolean = true;
                    //先做使用等级限制
                    if (this.itemConfig.level && Actor.level < this.itemConfig.level) {
                        boo = false;
                    }
                    if (this.itemConfig.id == ItemConst.EXP_ITEM) {
                        boo = Actor.level >= 65;
                    } else if (this.itemConfig.id == ItemConst.FRESHEXP_ITEM) {
                        //经验宝瓶红点有玩家等级限制
                        boo = Actor.level >= this.itemConfig.level;
                    }
                    this.redPoint.visible = this.data && this.data.count > 0 && boo;
                    //升级大礼包红点判定
                    if (this.itemConfig.id == ItemConst.LEVELUP_ITEM) {
                        // if (this.redPoint.visible){
                        //     let rch:RechargeData = Recharge.ins().getRechargeData(0);
                        //     this.redPoint.visible = rch.num?true:false;
                        // }
                        this.redPoint.visible = true;
                    }
                } else if (ItemConfig.getType(this.itemConfig) == 17) {
                    this.redPoint.visible = true;
                } else if (ItemConfig.getType(this.itemConfig) == ItemType.TYPE_20) {
					this.redPoint.visible = (<ItemData>this.data).canbeUsed;
                } else {
                    //可合成
                    let composeConf = GlobalConfig.ItemComposeConfig[this.itemConfig.id];
                    if (composeConf && composeConf.srcCount <= (<RewardData>this.data).count) {
                        this.redPoint.visible = true;
                    }
                }
            }
        }
        this.setSelect(this.selected);
        this.dataChangeHandler();
    }

    public dataChangeHandler(): void {

    }

    /**
     * 清除格子数据
     */
    protected clear(): void {
        this.itemConfig = null;
        if (this.itemIcon && typeof this.itemIcon.setData == 'function') this.itemIcon.setData(null);
        this.count.text = "";
        this.nameTxt.text = "";
        this.nameTxt.textColor = 0xDFD1B5;
        DisplayUtils.removeFromParent(this.EquipEffect);
    }

    public destruct(): void {
        this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
    }

    public isShowJob(b: boolean): void {
        this.itemIcon.imgJob.visible = b;
    }


    public onClick() {
        this.showCurrency();
        this.showDetail();
    }

    public getItemType(): number {
        if (!this.itemConfig)
            return -1;
        else
            return ItemConfig.getType(this.itemConfig);
    }
    /** 货币 */
    protected showCurrency() {
        if (!this.isCurrency)
            return;

        switch (this.data.id) {
            case MoneyConst.yuanbao://元宝
            case MoneyConst.feat://功勋
                ViewManager.ins().open(ItemCurrencyWin, this.data.id, this.data.count);
                break;
        }
    }
    /** 非货币 */
    protected showDetail() {
        if (!this.itemConfig)
            return;

            //使用鲜花道具
        let flowerConfig = GlobalConfig.TeamFuBenBaseConfig.itemId;
		if (flowerConfig.indexOf(this.itemConfig.id) != -1) {
			ViewManager.ins().open(FlowerUseTipsWin,this.itemConfig.id);
			return;
		}

        switch (ItemConfig.getType(this.itemConfig)) {
            case 0:
            case 4:
                this.openEquipsTips();
                break;
            case 5:
                ViewManager.ins().open(HejiEquipTipsWin, this.data, false, true);
                break;
            case 1:
                if (this.data.handle && GlobalConfig.ItemComposeConfig[this.itemConfig.id]) {
                    ViewManager.ins().open(ItemUseTipsWin, this.data);
                } else{
                    ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, this.data.count);
                }
                break;
            case 2:
                if (this.data.handle)
                    ViewManager.ins().open(ItemUseTipsWin, this.data);
                else {
                    if (this.data.count)
                        ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, this.data.count);
                    else
                        ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id);
                }
                break;
            case 6:
                ViewManager.ins().open(RuneTipsWin, 0, this.itemConfig.id, this.desc, this.desc2);
                break;
            case 9:
                ViewManager.ins().open(BookTipsWin, this.itemConfig.id, 0, this.data.handle);
                break;
            case 10:
                if (this.data.handle) {
                    ViewManager.ins().open(ItemUseTipsWin, this.data);
                } else {
                    ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id);
                }
                break;
            case 8:
                if (this.data.type == 1) {//外部决定显示tips 例如:论剑天下奖励 通天塔每日奖励
                    ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, this.data.count);
                } else {
                    let count = parseInt(this.count.text);
                    // this.redPoint.visible = count > 0 ? true : false;
                    this.showSpeicalDetail = false;
                    let parentDisplay = this.parent;
                    while (parentDisplay && parentDisplay.parent) {
                        parentDisplay = parentDisplay.parent;
                        if (parentDisplay instanceof BagWin) {
                            this.showSpeicalDetail = true;
                            break;
                        }
                    }
                    if (this.showSpeicalDetail) {
                        ViewManager.ins().open(ItemUseTipsWin, {
                            itemConfig: this.itemConfig,
                            configID: this.itemConfig.id,
                            count: count
                        });
                    } else {
                        ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, count);
                    }
                }
                break;
            case 12://仙盟礼包
                if (!this.data.itemConfig) {
                    ViewManager.ins().open(ItemUseTipsWin,
                        {
                            itemConfig: this.itemConfig,
                            configID: this.itemConfig.id,
                            count: this.data.count
                        }, true);
                } else if (this.getGuildGift(this.data)) {
                    ViewManager.ins().open(ItemUseTipsWin, this.data);
                } else {
                    ViewManager.ins().open(ItemUseTipsWin, {
                        itemConfig: this.itemConfig,
                        configID: this.itemConfig.id,
                        count: this.data.count
                    }, true);
                }
                break;
            case 11://诛仙装备tips显示
                for (let k in GlobalConfig.HeirloomEquipItemConfig) {
                    let hcfg: HeirloomEquipItemConfig = GlobalConfig.HeirloomEquipItemConfig[k];
                    if (hcfg && hcfg.item == this.itemConfig.id) {
                        ViewManager.ins().open(HeirloomEquipTipsWin, null, hcfg.pos - 1);
                        break;
                    }
                }
                break;
            case 13://卷轴
            case 14://改名卡
                if (this.data.type == 1) {
                    ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, this.data.count);
                } else {
                    ViewManager.ins().open(ItemUseTipsWin,
                        {
                            itemConfig: this.itemConfig,
                            configID: this.itemConfig.id,
                            count: this.data.count
                        });
                }
                break;
            case 16://神羽
                let gwConfig: GodWingItemConfig = GlobalConfig.GodWingItemConfig[this.itemConfig.id]
                ViewManager.ins().open(GodWingTipsWin, gwConfig);
                break;
            case 17://诛仙之宝
                this.showSpeicalDetail = false;
                let parentDisplay = this.parent;
                while (parentDisplay && parentDisplay.parent) {
                    parentDisplay = parentDisplay.parent;
                    if (parentDisplay instanceof BagWin) {
                        this.showSpeicalDetail = true;
                        break;
                    }
                }
                ViewManager.ins().open(this.showSpeicalDetail ? TreasureChuanshiGiftWin : ItemDetailedWin, 0, this.itemConfig.id, this.data.count);
                break;
            case ItemType.TYPE_20:
				if (this.data.type == 1) {//外部决定显示tips 例如:王者争霸奖励 通天塔每日奖励
					ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, this.data.count);
				} else {
					let count = +(this.count.text);
					// this.redPoint.visible = count > 0 ? true : false;
					this.showSpeicalDetail = false;
					let parentDisplay = this.parent;
					while (parentDisplay && parentDisplay.parent) {
						parentDisplay = parentDisplay.parent;
						if (parentDisplay instanceof BagWin) {
							this.showSpeicalDetail = true;
							break;
						}
					}
					if (this.showSpeicalDetail) {
						ViewManager.ins().open(ItemUseTipsWin, {
							itemConfig: this.itemConfig,
							configID: this.itemConfig.id,
							count: count
						});
					} else {
						ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, count);
					}
				}
				break;
            case ItemType.TYPE_21://天仙装备
                ZhanLing.ins().ZhanLingItemTips(this.itemConfig.id);
                break;
            case ItemType.TYPE_22://天仙皮肤
                ViewManager.ins().open(ZhanlingZBTipWin, this.itemConfig.id);
                break;
            case ItemType.TYPE_28:
                ViewManager.ins().open(HuanShouSkinTips, this.itemConfig.id);
                break;
            default:
                ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id);
        }
    }

    private getGuildGift(config: ItemConfig | ItemData) {
        let level: number = 0;
        if (config instanceof ItemConfig) {
            level = config.level;
        } else if (config instanceof ItemData) {
            let cfg: ItemConfig = GlobalConfig.ItemConfig[config._configID];
            level = cfg.level;
        }
        if (Actor.level >= level && Guild.ins().guildID != 0) {
            return true;
        } else {
            return false;
        }
    }

    private setCount(str: string): void {
        if (str.length > 4) {
            let wNum: number = Math.floor(Number(str) / 1000);
            str = wNum / 10 + "万";
        }
        this.count.text = str;
    }

    protected openEquipsTips(): void {
        let subType = ItemConfig.getSubType(this.itemConfig);

        if (subType >= EquipPos.HAT && subType <= EquipPos.SHIELD) {
            ViewManager.ins().open(SamsaraEquipTips, this.itemConfig.id);
        }
        else {
            ViewManager.ins().open(EquipDetailedWin, 1, this.data.handle, this.itemConfig.id, this.data)
        }

    }

    public isShowName(b: boolean): void {
        this.nameTxt.visible = b;
    }

    public getItemSoure(): string {
        let str: string = "";
        if (this.data.type == 0) {
            str = RewardData.getCurrencyRes(this.data.id);
        } else {
            str = this.itemIcon.config.icon + '_png';
        }
        return str;
    }

    public getText(): string {
        return this.nameTxt.text;
    }

    public getTextColor(): number {
        return this.nameTxt.textColor;
    }

    public showEquipEffect(): void {
        let quality = ItemConfig.getQuality(this.itemConfig);
        let type = ItemConfig.getType(this.itemConfig);
        if ((!this.itemConfig || quality <= 3) && this.data.id != MoneyConst.yuanbao)
            return;
        let effectName: string = "";
        this.EquipEffect = this.EquipEffect || new MovieClip();
        this.EquipEffect.touchEnabled = false;
        if (this.data.id == MoneyConst.yuanbao) {
            effectName = "quaeff6";
            this.EquipEffect.x = 39;
            this.EquipEffect.y = 34;
            this.EquipEffect.scaleX = this.EquipEffect.scaleY = 1;
        }
        else if (quality == 4) {
            effectName = "quality_05";
            this.EquipEffect.x = 40;
            this.EquipEffect.y = 41;
            // this.EquipEffect.scaleX = this.EquipEffect.scaleY = 1.1;
        } else if (quality == 5) {
            effectName = "chuanqizbeff";
            this.EquipEffect.x = 40;
            this.EquipEffect.y = 41;
            this.EquipEffect.scaleX = this.EquipEffect.scaleY = 1.1;
        }

        if (this.itemIcon.parent) {
            this.itemIcon.addChild(this.EquipEffect);
            this.itemIcon.swapChildren(this.EquipEffect, this.itemIcon.imgJob);
        }
        let resName = RES_DIR_EFF + effectName;
        if (resName != this.EquipEffect.name || !this.EquipEffect.isPlaying)
            this.EquipEffect.playFile(resName, -1);
    }

    public clearEffect(): void {
        DisplayUtils.removeFromParent(this.EquipEffect);
        this.EquipEffect = null;
    }

    public HideImgBg() {
        this.itemIcon.imgBg.visible = false;
    }

    public showNum(isShow: boolean) {
        this.count.visible = isShow;
    }

    public setNum(num:number){
        if(num <=1 ){
            this.count.visible = false;
        }else{
            this.count.visible = true;
            this.count.text = num + "";
        }
    }

    public setImgBg(type: number) {
        this.itemIcon.imgBg.source = ItemConfig.getQualityBg(type);
    }

    public getItemIcon() {
        return this.itemIcon;
    }

    public setSelect(selected: boolean): void {
        if (this.isOpenSelectImg) {
            this.selectFrame.visible = selected;
        }
    }

    public hideName(): void {
        this.nameTxt.visible = false;
    }

    public PosItem(itemBas:{x:number, y:number}){
        this.x = itemBas.x;
        this.y = itemBas.y;
    }

    public setItemConfig(config:ItemConfig, data){
        this.itemConfig = config;
        this.data = data;
        this.setDataByConfig(config);
    }

    public setName(src: string): void {
		this.nameTxt.textFlow = TextFlowMaker.generateTextFlow1(src);
	}
}