/**
 * Created by hrz on 2017/9/15.
 */

class BookRedPoint extends RedPointBase {
    canLvlUp:boolean = false;
    constructor() {
        super();

        this.registerOpen(Actor.ins().postLevelChange,UserZs.ins().postZsData);

        //可激活
        this.registerTab(0,
            Book.ins().postDataChange,
            UserBag.ins().postItemAdd,
            GameLogic.ins().postChildRole
        );

        //可分解
        this.registerTab(1,
            Book.ins().postDataChange,
            UserBag.ins().postItemAdd
        );

        this.associated(this.postLvlUp,
            Book.ins().postDataChange
        );

        //屏蔽原因 可升级红点不在历练按钮显示
        // //可升级
        // this.registerTab(2,
        //     Book.ins().postDataChange,
        // );

    }

    static ins():BookRedPoint{
        return super.ins() as BookRedPoint;
    }

    public postLvlUp() {
        let oldv = this.canLvlUp;
        this.canLvlUp = Book.ins().getBookUpRed();
        return oldv != this.canLvlUp;
    }

    protected getTabRedPoint(tab:number):boolean {
        if (tab == 0) {
            return Book.ins().getBookRed();
        } else if (tab == 1) {
            return Book.ins().checkResolveRedPoint();
        } else if (tab == 2) {
            return Book.ins().getBookUpRed();
        }
        return false;
    }

    protected getIsOpen():boolean {
        return LiLian.ins().checkBookOpen();
    }
}

namespace GameSystem {
    export let  bookRedPoint = BookRedPoint.ins.bind(BookRedPoint);
}