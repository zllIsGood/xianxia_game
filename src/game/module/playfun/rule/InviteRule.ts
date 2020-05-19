/**
 * 邀请
 * Author: Ade
 */

class InviteRule extends RuleIconBase {
    constructor(t: egret.DisplayObjectContainer) {
        super(t);

        this.updateMessage = [];
    }

    checkShowIcon(): boolean {

        /** 判断是否是支持开启分享功能 */
        if (OpenSystem.ins().checkSysOpen(SystemType.SHARE)) {
            
            /** 微信才需要判断是否第一次打开 */
            if (LocationProperty.isWeChatMode) {

                // 检查是否通过审核
                if (!WxTool.isCheck()) { return false; }

                let flag = Setting.ins().getValue(ClientSet.invite);

                /** 只有不是第一次邀请才会调用 */
                if (flag != 0 && Invite.ins().isFirstLoad) {
                    Invite.ins().sendInviteSuccess();
                    Invite.ins().isFirstLoad = false;
                }  
            }
            return true;   

        } else {
            return false;
        }
    }

    checkShowRedPoint(): number {

        if (OpenSystem.ins().checkSysOpen(SystemType.SHARE)) {

            /** 每日邀请配置 */
            let dailyInviteList = GlobalConfig.DailyInviteConfig;

            /** 累计邀请 */
            let totalInviteConfig = GlobalConfig.TotalInviteConfig;
            let totalInviteList = this.parseConfigData(totalInviteConfig)

            let inviteModel = Invite.ins().model;

            if (LocationProperty.isWeChatMode) {
                let flag = Setting.ins().getValue(ClientSet.invite);
    
                if (flag == 0) {
                    return 1;
                } else {

                    let allkeys = Object.keys(dailyInviteList);
                    for (let i = 0; i < allkeys.length; i++) {
                        let dailyInviteCfg = dailyInviteList[allkeys[i]];
                        // 日常邀请总数 >= 配置里要求的数量
                        if (inviteModel.dailyFinishCount >= dailyInviteCfg.index) {
                            let isGet: boolean = Boolean((inviteModel.dailyAwardCount >> dailyInviteCfg.index) & 1);
                            // 未领取
                            if (!isGet) { return 1; }
                        } 
                    }

                    for (let i = 0; i < totalInviteList.length; i++) {

                        let element: TotalInviteConfig = totalInviteList[i];

                        /** 这是当前邀请进度 */
                        if (inviteModel.inviteTotalCount >= element.inviteCount) {
                            
                            /** 判断是否已经领奖, awardTotalCount是从1开始的 */
                            let isGet: boolean = Boolean((inviteModel.awardTotalCount >> (i + 1)) & 1);
                            
                            if (!isGet) { return 1; }
                        }
                    }

                    return 0;
                }
            } else {

                let allkeys = Object.keys(dailyInviteList);
                for (let i = 0; i < allkeys.length; i++) {
                    let dailyInviteCfg = dailyInviteList[allkeys[i]];
                    // 日常邀请总数 >= 配置里要求的数量
                    if (inviteModel.dailyFinishCount >= dailyInviteCfg.index) {
                        let isGet: boolean = Boolean((inviteModel.dailyAwardCount >> dailyInviteCfg.index) & 1);
                        // 未领取
                        if (!isGet) { return 1; }
                    } 
                }
            }   
        }
        return 0;  
    }

    tapExecute(): void {
        
        if (OpenSystem.ins().checkSysOpen(SystemType.SHARE)) {
            
            if (LocationProperty.isWeChatMode) {
                let flag = Setting.ins().getValue(ClientSet.invite);
                if (flag == 0) {
                    ViewManager.ins().open(InviteWin);
                } else {
                    ViewManager.ins().open(InviteDailyWin);
                }       
            } else {
                ViewManager.ins().open(YqWin);
            }
        }
    }


    private parseConfigData(list: any[]): any[] {

        let keys: any[] = Object.keys(list);
        let dataList = [];
        keys.forEach((key) => {
            let dailyInvite = list[key];
            dataList.push(dailyInvite);
        })
        return dataList;
    }

}