

class InviteListCheckInCard extends eui.ItemRenderer {

    private showText: eui.Label;

    public constructor() {
		super();
        this.skinName = "inviteListRendererSkin";
    }

    public dataChanged(): void {

        let inviteInfoModel: DailyInviteInfoModel = this.data;
        
        /** 
         * 1: 每日邀请奖励
         * 2: 累计邀请奖励
         */
        if (inviteInfoModel.award == 1) {
            
            let dailyInviteList = GlobalConfig.DailyInviteConfig;  
            let inviteAward = dailyInviteList[inviteInfoModel.index].inviteAwards[0];
            
            if (inviteAward.id) {
                let conf = GlobalConfig.ItemConfig[inviteAward.id];
                this.setShowText(conf, inviteAward.count);
            }
            
        } else {
            let totalInviteConfig = GlobalConfig.TotalInviteConfig;
            let inviteAward = totalInviteConfig[inviteInfoModel.index].inviteAwards[0];
            
            if (inviteAward.id) {

                let conf = GlobalConfig.ItemConfig[inviteAward.id];
                if (conf) {

                    this.setShowText(conf, inviteAward.count);
                    
                } else {
                    let name = RewardData.getCurrencyName(inviteAward.id);
                    let type: number = 1;
                    switch (inviteAward.id) {
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
                            break;
                        case MoneyConst.godweaponExp:
                            type = 2;
                            break;
                        default:
                            break;
                    }
                    let textColor = ItemBase.QUALITY_COLOR[type];
                    let str = `<font color = '#12b2ff'>${inviteInfoModel.playerNick}</font> 通过达成活动目标，获得奖励： <font color = '${textColor}'>${name}x${inviteAward.count}</font>`;
                    this.showText.textFlow = TextFlowMaker.generateTextFlow(str);
                }
            }
        }
        
    }

    private setShowText(conf: ItemConfig, count: number) {

        let inviteInfoModel: DailyInviteInfoModel = this.data;
        let color = `${ItemBase.QUALITY_COLOR[conf.quality]}`;
        let str = `<font color = '#12b2ff'>${inviteInfoModel.playerNick}</font> 通过达成活动目标，获得奖励： <font color = '${color}'>${conf.name}x${count}</font>`;
        this.showText.textFlow = TextFlowMaker.generateTextFlow(str);
    }
}