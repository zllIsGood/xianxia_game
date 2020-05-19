/**
 * 烈焰印记实体特效
 * Created by wanghengshuai on 2018/1/4.
 */
class LyMarkEffect {
    private _ring: MovieClip;

    private _balls: MovieClip[];

    private _angle: number = 0.1;

    private _angles: number[] = [0, 0, 0, 0, 0, 0, 0];

    private _circleCenter: { x: number, y: number } = {x: 0, y: -72};

    private _a: number = 60;

    private _b: number = 30;

    private _oldBallNum: number = 0;

    private _infoModel: EntityModel;

    private _curTimes: number = 0;

    private _isShowBall: boolean = true;

    public constructor(ring: MovieClip, infoModel: EntityModel) {
        this._ring = ring;
        this._infoModel = infoModel;

        MessageCenter.addListener(LyMark.ins().postMarkData, this.dataChange, this);
        this.usedLyMarkSkill();
    }

    private dataChange(): void {
        if (!this._infoModel || this._infoModel.masterHandle != Actor.handle)
            return;

        this.update();
    }

    private get _parent() {
        return this._ring.parent;
    }

    /** 使用了烈焰印记技能 */
    public usedLyMarkSkill(): void {
        this.resetBalls();
        TimerManager.ins().removeAll(this);
        //cd
        let lv: number = this.getSkillLvById(1);
        if (!lv)
            return;
        let cfg: FlameStampEffect = GlobalConfig.FlameStampEffect[1][lv];
        lv = this.getSkillLvById(3);
        let mCd: number = lv ? GlobalConfig.FlameStampEffect[3][lv].reloadTime : 0;
        let skillID: number = cfg.skillId;
        let count: number = cfg.stamp;
        if (this.getSkillLvById(2)) {
            lv = this.getSkillLvById(2);
            skillID = GlobalConfig.FlameStampEffect[2][lv].skillId;
            count = GlobalConfig.FlameStampEffect[2][lv].stamp;
        }

        let skillDes: SkillsDescConfig = GlobalConfig.SkillsDescConfig[GlobalConfig.SkillsConfig[skillID].desc];
        let cdPer = (skillDes.cd - mCd) / count >> 0;
        TimerManager.ins().doTimer(cdPer, count, this.doTimer, this);
        this._curTimes = 0;
    }

    private doTimer(): void {
        this._curTimes++;
        this.updateBalls(this._curTimes);
    }

    private update(): void {
        //技能
        let skillLv: number, effectCfg: FlameStampEffect;
        let bollNum: number = 0, realLv: number = 0;
        for (let i: number = 0; i <= 6; i++) {
            realLv = skillLv = this.getSkillLvById(i + 1);
            if (!skillLv)
                skillLv = 1;

            effectCfg = GlobalConfig.FlameStampEffect[i + 1][skillLv];
            if ((i + 1 == 1 || i + 1 == 2) && realLv)
                bollNum = effectCfg.stamp;
        }

        this.updateBalls(bollNum);
    }

    private updateBalls(bollNum: number): void {
        if (!this._ring || !this._parent)
            return;

        //旋转印记
        if (bollNum && this._oldBallNum != bollNum) {
            this.resetBalls();
            this._oldBallNum = bollNum;

            if (!this._balls) {
                this._balls = [];
                TimerManager.ins().doTimer(17 * 3, 0, this.doCircle, this);
            }

            let ball: MovieClip;
            let radian: number = 2 * Math.PI / bollNum;
            for (let i: number = 0; i < bollNum; i++) {
                ball = ObjectPool.pop("MovieClip");
                if (this._isShowBall) this._parent.addChild(ball);

                this._angles[i] = radian * i;
                ball.x = this._a * Math.cos(radian * i) + this._circleCenter.x;
                ball.y = this._b * Math.sin(radian * i) + this._circleCenter.y;
                this._balls.push(ball);
                ball.playFile(`${RES_DIR_SKILLEFF}skill6204a`, -1);
            }
        }
    }

    private doCircle(): void {
        if (!this._balls) {
            TimerManager.ins().remove(this.doCircle, this);
            return;
        }

        if (!this._isShowBall) return;

        if (!this._ring || !this._parent)
            return;

        let len: number = this._balls.length, ball: MovieClip;
        let parent: egret.DisplayObjectContainer;
        let imgIndex: number = 0, selfIndex: number = 0;
        for (let i: number = 0; i < len; i++) {
            ball = this._balls[i];
            ball.x = this._a * Math.cos(this._angles[i]) + this._circleCenter.x;
            ball.y = this._b * Math.sin(this._angles[i]) + this._circleCenter.y;
            this._angles[i] += this._angle;
            this._angles[i] = this._angles[i] % (2 * Math.PI);
            parent = ball.parent;
            if (parent != null) {
                imgIndex = parent.getChildIndex(this._ring);
                selfIndex = parent.getChildIndex(ball);
                if (this._angles[i] >= 2.5 && this._angles[i] <= 6) {
                    if (selfIndex > imgIndex)
                        parent.addChildAt(ball, imgIndex);
                }
                else {
                    if (selfIndex < imgIndex)
                        parent.addChildAt(ball, parent.numChildren);
                }
            }
        }
    }

    private resetBalls(): void {
        TimerManager.ins().remove(this.doCircle, this);
        this._oldBallNum = 0;
        if (this._balls) {
            let len: number = this._balls.length;
            for (let i: number = 0; i < len; i++) {
                this._balls[i].destroy();
            }
            this._balls = null;
        }
    }

    /** 根据id获得技能等级 */
    private getSkillLvById(id: number): number {
        let skills: number[] = this._infoModel.masterHandle == Actor.handle ? LyMark.ins().skills : this._infoModel.lyMarkSkills;
        if (!skills || skills.length < id)
            return 0;
        return skills[id - 1];
    }

    /** 获得印记等级*/
    private getLyMarkLv(): number {
        return this._infoModel.masterHandle == Actor.handle ? LyMark.ins().lyMarkLv : this._infoModel.lyMarkLv;
    }

    /** 屏蔽火球 */
    public showBall() {
        if (this._isShowBall) return;
        this._isShowBall = true;
        this.updateBalls(this._curTimes);

        if (this._balls) {
            let len: number = this._balls.length;
            for (let i: number = 0; i < len; i++) {
                this._parent.addChild(this._balls[i]);
            }
        }
    }

    /** 隐藏火球 */
    public hideBall() {
        if (!this._isShowBall) return;
        this._isShowBall = false;
        this.resetBalls();
    }

    public destruct(): void {
        this.resetBalls();
        TimerManager.ins().removeAll(this);

        this._ring = null;
        this._infoModel = null;
        MessageCenter.ins().removeAll(this);
    }
}