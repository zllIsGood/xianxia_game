/**
 * 通天塔抽奖物品栏
 * Created by Peach.T on 2017/10/20.
 */
class BabelLotteryItem extends BaseComponent {
    public itemIcon: ItemBase;

    constructor() {
        super();
    }

    public rewardState(isGet: boolean): void {
        if (isGet) {
            this.currentState = "yilingqu";
        }
        else {
            this.currentState = "weilingqu";
        }
    }

}