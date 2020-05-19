/**
 * Created by hrz on 2017/7/20.
 *
 * 设置
 */

class SysSetting extends BaseClass {

    static ins(): SysSetting {
        return super.ins() as SysSetting;
    }

    //音效
    static SOUND_EFFECT: string = `sound_effect`;
    //震屏
    static SHAKE_WIN: string = `shake_win`;
    //自动释放必杀技能
    static AUTO_HEJI: string = `auto_heji`;
    //自动使用元宝投骰子(暂时不需要服务器做记录)
    static DICE: string = `dice`;

    private _storage: any = {};
    private _tempStorage: any = {};

    private defaultValue: any = {
        sound_effect: 0,
        shake_win: 1,
        auto_heji: 0,
        dice: 0
    }

    constructor() {
        super();
        this.init();
    }

    setItem(key: string, value: any) {
        if (this._storage[key] != value) {
            this._storage[key] = value;

            if (key == SysSetting.SOUND_EFFECT) {
                SoundManager.ins().setEffectOn(this.getBool(key));
            } else if (key == SysSetting.SHAKE_WIN) {
                DisplayUtils.setShakeOn(this.getBool(key));
            } else if (key == SysSetting.DICE) {
                Millionaire.ins().autoTurnDice = value;
            }

            let tms = TimerManager.ins();
            if (!tms.isExists(this.storage, this)) {
                tms.doNext(this.storage, this);
            }
        }
    }

    getItem(key: string) {
        return this._storage[key];
    }

    setBool(key: string, b: boolean) {
        this.setItem(key, b ? 1 : 0);
    }

    getBool(key): boolean {
        return !!this.getItem(key);
    }

    setValue(key, value) {
        this._tempStorage[key] = value;
    }

    getValue(key) {
        return this._tempStorage[key];
    }

    public init() {
        try {
            let str = egret.localStorage.getItem(this.getStorageKey());
            if (str) {
                this._storage = JSON.parse(str) || {};
            } else {
                this._storage = {};
            }
        } catch (e) {
            console.log(e);
            this._storage = {};
        }

        this.initValue();
    }

    private initValue() {
        this.defaultValue.sound_effect = LocationProperty.isVivoMode?1:0; // 特殊处理vivo渠道不默认关闭声音
        for (let key in this.defaultValue) {
            if (this._storage[key] == undefined) {
                this._storage[key] = this.defaultValue[key];
            }
        }

        SoundManager.ins().setEffectOn(this.getBool(SysSetting.SOUND_EFFECT));
        DisplayUtils.setShakeOn(this.getBool(SysSetting.SHAKE_WIN));
        this._storage[SysSetting.DICE] = this.defaultValue[SysSetting.DICE];
    }

    private storage() {
        try {
            let str = JSON.stringify(this._storage);
            egret.localStorage.setItem(this.getStorageKey(), str);
        } catch (e) {

        }
    }

    private getStorageKey() {
        return (Actor.actorID + "") || "game_longlin";
    }

}
namespace GameSystem {
    export let  syssetting = SysSetting.ins.bind(Setting);
}
