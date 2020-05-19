/**
 * Created by hrz on 2017/8/9.
 * npc 不移动
 */

class NpcModel extends EffectModel {
    constructor() {
        super();
        this.type = EntityType.Npc;
    }

    get avatarString() {
        let config = GlobalConfig.NpcBaseConfig[this.configID];
        return config ? config.avatar : null;
    }

    get avatarFileName():string {
        let config = this.npcConfig;
        if (config.actType == 1) {
            return `${RES_DIR_BODY}body${config.avatar}`;
        }
        return `${RES_DIR_MONSTER}monster${config.avatar}`;
    }

    get weaponFileName():string {
        let config = this.npcConfig;
        if (config.weapon) {
            return `${RES_DIR_WEAPON}weapon${config.weapon}`;
        }
        return '';
    }

    get npcConfig():NpcBaseConfig {
        return GlobalConfig.NpcBaseConfig[this.configID];
    }

    //浅复制
    clone(model?):NpcModel {
        let Cls = egret.getQualifiedClassName(this);
        model = model || ObjectPool.pop(Cls);
        for (let key in this) {
            if (typeof this[key] != 'function') {
                if(key != "__class__" && key != "__types__") {
                    model[key] = this[key];
                }
            }
        }
        return model;
    }
}