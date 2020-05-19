/**
 * Created by hrz on 2017/9/16.
 */

class OpenSystem extends BaseSystem {
    constructor() {
        super();
    }

    static ins(): OpenSystem {
        return super.ins() as OpenSystem;
    }

    public checkSysOpen(type: SystemType): boolean {
        let config = GlobalConfig.OpenSystemConfig[type];
        if (config && config.judge) {

            /** 判断平台是否符合 */
            if (config.pf && config.pf.length > 0) {

                let flag: boolean = false;
                for(let i in config.pf) {
                 
                    let platform = config.pf[i];   
                    if (platform == LocationProperty.pf) {
                        flag = true;
                        break;
                    }
                }

                if (!flag) { return false; }
            }

            if (!config.than)
                return UserZs.ins().lv >= config.openzs && Actor.level >= config.openlevel && UserFb.ins().guanqiaID >= config.opencheck;
            else
                return UserZs.ins().lv <= config.openzs && Actor.level <= config.openlevel && UserFb.ins().guanqiaID <= config.opencheck;
            
        } else {
            if (type == SystemType.FIRSTCHARGE && LocationProperty.pfid == "2") {//哆可梦
                return true;
            }
        }
        return false;
    }

    public getNoOpenTips(type: SystemType): string {
        let config = GlobalConfig.OpenSystemConfig[type];
        let tips: string = "";
        if (config) {
            if (!config.judge) {
                tips = `${config.funName}未开启`;
            } else {
                if (!config.than) {
                    if (UserZs.ins().lv < config.openzs) {
                        tips += `${config.openzs}转`;
                    }
                    if (Actor.level < config.openlevel) {
                        tips += `${config.openlevel}级`;
                    }
                    if (UserFb.ins().guanqiaID < config.opencheck) {
                        tips += `通过第${config.opencheck}关`;
                    }
                    if (tips != "") tips += `开启${config.funName}`;
                }
            }
        }
        return tips;
    }
}