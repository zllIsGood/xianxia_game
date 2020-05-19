/**
 * Created by hrz on 2017/8/11.
 *
 * 用户操作
 */

enum Handler {
    none = 0,
    clickMap = 1,
    clickTransfer = 2,
    clickNpc = 4
}

class UserHandler extends BaseClass {
    constructor(){
        super();
    }

    static ins():UserHandler {
        return super.ins() as UserHandler;
    }

    curHandler:Handler = Handler.none;
    curTarget:any;
    callBack:Function;

    execute(handler:Handler, target, callBack?:Function) {
        this.curHandler = handler;
        this.callBack = callBack;

        switch (handler) {
            case Handler.none:
                this.reset();
                break;
            case Handler.clickMap:
                this.curTarget = target;
                // GameMap.myMoveTo(target.x, target.y);
                GameMap.moveTo(target.x, target.y);
                break;
            case Handler.clickTransfer:
                this.curTarget = target;
                GameMap.moveTo(target.x, target.y);
                this.addTime();
                break;
            case Handler.clickNpc:
                this.curTarget = target;

                if (this.checkCanActive(this.curHandler)) {
                    this.active(this.curHandler);
                } else {
                    let role = EntityManager.ins().getNoDieRole();
                    if (!role) {return;}
                    let pos = GameMap.getPosRangeRandom(target.x, target.y, DirUtil.get8DirBy2Point({x: target.x, y: target.y}, {x: role.x, y: role.y}));
                    GameMap.moveTo(pos[0]*GameMap.CELL_SIZE  +Math.floor(MathUtils.limit(0.2,1)*GameMap.CELL_SIZE),pos[1]*GameMap.CELL_SIZE+Math.floor(MathUtils.limit(0.2,1)*GameMap.CELL_SIZE));
                    this.addTime();
                }
                break;
        }
    }

    active(handler:Handler) {
        if (this.callBack) {
            this.callBack(handler, this.curTarget);
        }
        this.reset();
    }

    checkCanActive(handler:Handler):boolean {
        let role = EntityManager.ins().getNoDieRole();
        if (!this.curTarget || !role) return false;
        if (this.curHandler == Handler.clickTransfer) {
            if (egret.Point.distance(role as any, this.curTarget as any) < GameMap.CELL_SIZE/2) {
                return true;
            }
        } else if (this.curHandler == Handler.clickNpc) {
            if (egret.Point.distance(role as any, this.curTarget as any) < GameMap.CELL_SIZE * 2) {
                return true;
            }
        }
        return false;
    }

    private addTime(){
        if (!TimerManager.ins().isExists(this.timeHandler,this)) {
            TimerManager.ins().doTimer(100, 0, this.timeHandler, this);
        }
    }

    private timeHandler() {
        if(this.checkCanActive(this.curHandler)) {
            this.active(this.curHandler);
        }
    }

    reset(){
        this.curHandler = Handler.none;
        this.curTarget = null;
        this.callBack = null;
        TimerManager.ins().removeAll(this);
    }
}