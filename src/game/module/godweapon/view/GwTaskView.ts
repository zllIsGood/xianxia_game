/**
 * Created by hrz on 2017/11/7.
 */

class GwTaskView extends BaseView {
    private GwTask: eui.Group;
    private showSkill0: eui.Group;//0-2
    private item0: GwWeaponSkillIcon;//0-2
    private skillName0: eui.Label;//0-2
    private skillDesc0: eui.Label;//0-2
    private zhanshi: eui.Image;
    private fashi: eui.Image;
    private daoshi: eui.Image;
    private BG: eui.Image;

    private taskLabel: eui.Label;

    private renwuchushi: eui.Label;
    private quanbuwancheng: eui.Label;
    private renwuneirong: eui.Label;

    private btn: eui.Button;

    private taskComMc: MovieClip;
    private taskMc: MovieClip;

    private _state: number = 0;
    private _weaponId: number = 1;
    private weaponTxt = [`雷霆怒斩`, `羲和神杖`, `伏魔之灵`];
    constructor() {
        super();
        this.skinName = `GwTaskSkin`;
    }

    open(index: number) {
        this.addTouchEndEvent(this.btn, this.onTap);
        this.setSelectIndex(index);
    }

    close() {
        this.removeTouchEvent(this.btn, this.onTap);
    }

    setSelectIndex(index: number) {
        let weaponId = this._weaponId = index + 1;
        this.initSkill();

        let taskTip = `激活|C:0xFFCC00&T:${this.weaponTxt[index]}|，需要先完成神兵任务`;
        let btnTxt = [`领取任务`, `前往`, `完成任务`, `激活`];

        this.BG.source = [``, `godarms_bg_002_jpg`, `godarms_bg_004_jpg`, `godarms_bg_003_jpg`][weaponId];

        //展示神兵名字
        let nameImg = [`zhanshi`, `fashi`, `daoshi`];
        for (let i = 0; i <= 2; i++) {
            let img = this[nameImg[i]] as eui.Image;
            if (i == index)
                img.visible = true;
            else
                img.visible = false;
        }

        //提示
        let tipsTxt = [`renwuchushi`, `renwuneirong`, `quanbuwancheng`];
        for (let key of tipsTxt) {
            this[key].visible = false;
        }

        let gwTask = GodWeaponCC.ins().gwTask;
        if (!GodWeaponCC.ins().weaponIsActive(weaponId)) {
            if (gwTask.taskIdx && gwTask.weapon == weaponId) {
                let config = GlobalConfig.GodWeaponTaskConfig[gwTask.weaponIdx][gwTask.taskIdx];
                if (gwTask.statue == GwTaskData.DOING) {
                    taskTip += `|C:0xff0000&T:(${gwTask.taskIdx - 1}/5)|`;
                    this.taskLabel.textFlow = TextFlowMaker.generateTextFlow1(taskTip);

                    this.renwuneirong.visible = true;
                    this.renwuneirong.textFlow = TextFlowMaker.generateTextFlow1(`${gwTask.taskIdx}.${config.desc}${config.itemName[gwTask.weapon - 1] || ""}|C:0xff0000&T:(${gwTask.progress}/${config.target})|`);

                    this.btn.label = btnTxt[1];

                    this._state = 1;
                    this.removeTaskMc();
                } else if (gwTask.statue == GwTaskData.DONE) {
                    taskTip += `|C:0xff0000&T:(${gwTask.taskIdx - 1}/5)|`;
                    this.taskLabel.textFlow = TextFlowMaker.generateTextFlow1(taskTip);

                    this.renwuneirong.visible = true;
                    this.renwuneirong.textFlow = TextFlowMaker.generateTextFlow1(`${gwTask.taskIdx}.${config.desc}${config.itemName[gwTask.weapon - 1] || ""}|C:0x00ff00&T:(${gwTask.progress}/${config.target})|`);

                    this.btn.label = btnTxt[2];

                    this._state = 2;

                    this.addTaskMc();
                } else {
                    taskTip += `|C:0x00ff00&T:(${gwTask.taskIdx}/5)|`;
                    this.taskLabel.textFlow = TextFlowMaker.generateTextFlow1(taskTip);

                    this.quanbuwancheng.visible = true;
                    this.btn.label = btnTxt[3];

                    this._state = 3;

                    this.addTaskMc();
                }
            } else {
                this.taskLabel.textFlow = TextFlowMaker.generateTextFlow1(taskTip);
                this.renwuchushi.visible = true;
                this.btn.label = btnTxt[0];
                this._state = 0;
                this.removeTaskMc();
            }
        }

    }

    private addTaskMc() {
        this.validateNow();
        this.taskMc = this.taskMc || ObjectPool.pop(`MovieClip`);
        this.taskMc.x = this.btn.width / 2;
        this.taskMc.y = this.btn.height / 2;
        this.taskMc.scaleX = 1;
        this.taskMc.scaleY = 1;
        this.taskMc.touchEnabled = false;
        this.btn.parent.addChild(this.taskMc);
        this.taskMc.playFile(RES_DIR_EFF + "chargeff1", -1);
    }

    private removeTaskMc() {
        TimerManager.ins().removeAll(this);
        if (this.taskMc && this.taskMc.parent) {
            this.taskMc.parent.removeChild(this.taskMc);
            this.taskMc.destroy();
        }
        this.taskMc = null;
    }

    private initSkill() {
        let weaponId = this._weaponId;
        let skills = GlobalConfig.GodWeaponBaseConfig.noticeSkillId[weaponId - 1];
        let configs = GlobalConfig.GodWeaponLineConfig[weaponId];
        let index = 0;
        for (let skillId of skills) {
            // let skill = configs[skillId].skill;
            // let index = skills.indexOf(skill);
            // if (index >= 0) {
            let data = GodWeaponCC.ins().getWeaponSkinIdData(weaponId, configs[skillId].skinId);
            this[`item${index}`].imgLight = true;
            this[`item${index}`].updateView(data, weaponId - 1);

            this[`skillName${index}`].text = configs[skillId].skillName;
            this[`skillDesc${index}`].text = configs[skillId].lockDesc;
            index += 1;
            // }
        }
    }

    private onTap(e: egret.Event) {
        let tar = e.currentTarget;
        let gwTask = GodWeaponCC.ins().gwTask;
        if (tar == this.btn) {
            if (this._state == 0) {
                let role = SubRoles.ins().getSubRoleByJob(this._weaponId);
                if (!role) {
                    let jobNames: string[] = ["0", "战士", "法师", "术士"];
                    UserTips.ins().showTips(`未激活${jobNames[this._weaponId]}，无法领取任务`);
                    return;
                }
                if (gwTask.weapon == 0) {
                    WarnWin.show(`领取<font color='#FFCC00'>${this.weaponTxt[this._weaponId - 1]}</font>任务后，需要全部任务做完，才能再次领取其他神兵任务，是否确定领取？`, () => {
                        GodWeaponCC.ins().requestReceiveTask(this._weaponId);
                    }, this);
                } else {
                    UserTips.ins().showTips(`有已领取的神兵任务，请先完成`);
                }
            } else if (this._state == 1) {
                let config = GlobalConfig.GodWeaponTaskConfig[gwTask.weaponIdx][gwTask.taskIdx];
                if (config.controlTarget) {
                    ViewManager.ins().open(config.controlTarget[0], config.controlTarget[1]);
                }
            } else if (this._state == 2 || this._state == 3) {
                GodWeaponCC.ins().requestActiveWeapon();

                if (this._state == 2) {
                    this.taskComMc = this.taskComMc || ObjectPool.pop(`MovieClip`);
                    this.taskComMc.playFile(`${RES_DIR_EFF}complete`, 1, () => {
                        if (this.taskComMc.parent) {
                            this.taskComMc.parent.removeChild(this.taskComMc);
                            this.taskComMc.destroy();
                            this.taskComMc = null;
                        }
                    });
                    this.taskComMc.y = this.btn.y - 80;
                    this.taskComMc.x = this.btn.x + this.btn.width / 2;
                    this.GwTask.addChild(this.taskComMc);
                }
            }
        }
    }
}