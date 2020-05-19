/**
 * Created by hrz on 2017/9/4.
 */

class VipGiftPanel extends BaseView {
    private leftBtn: eui.Button;
    private rightBtn: eui.Button;
    private menuList: eui.List;
    private menuScroller: eui.Scroller;
    private vipGiftItem: VipGiftItemView;
    public curIndex: number;//N次合服
    private roleSelect: RoleSelectPanel;

    constructor(...param: any[]) {
        super();
        this.curIndex = param[0] ? param[0] : 0;
        this.skinName = `VipGift${this.curIndex}Skin`;
    }

    protected childrenCreated() {
        super.childrenCreated();

    }

    open(...param: any[]): void {
        this.curIndex = param[0] ? param[0] : 0;
        this.menuList.itemRenderer = VipGiftBtnRender;
        this.addTouchEvent(this.leftBtn, this.onTouchBtn);
        this.addTouchEvent(this.rightBtn, this.onTouchBtn);

        this.addEvent(eui.ItemTapEvent.ITEM_TAP, this.menuList, this.onTouchMenu);
        this.addEvent(eui.UIEvent.CHANGE_END, this.menuScroller, this.onChange);
        this.observe(UserVip.ins().postVipGiftBuy, this.onUpdate);
        this.roleSelect.hideRole();
        this.updateMenu();
        this.setDefault();
    }

    private onTouchMenu(e: eui.ItemTapEvent) {
        SoundUtil.ins().playEffect(SoundUtil.WINDOW);
        this.setGiftId(e.item.id);
    }

    private onChange(): void {
        if (this.menuList.scrollH < 20) {
            this.leftBtn.visible = false;
            this.rightBtn.visible = true;
        } else if (this.menuList.scrollH > (this.menuList.dataProvider.length - 5) * 88 + 2) {
            this.leftBtn.visible = true;
            this.rightBtn.visible = false;
        } else {
            this.leftBtn.visible = true;
            this.rightBtn.visible = true;
        }
        if (this.menuList.dataProvider.length <= 5) {
            this.leftBtn.visible = false;
            this.rightBtn.visible = false;
        }
    }

    private updateMenu() {
        let configs = GlobalConfig.VipGiftConfig;
        let arr = [];
        for (let id in configs) {
            let hfTimes = configs[id].hfTimes ? configs[id].hfTimes : 0;
            if (this.curIndex == hfTimes)
                arr.push(configs[id]);
        }
        arr.sort((a, b) => {
            return a.id < b.id ? -1 : 1;
        });
        this.menuList.dataProvider = new eui.ArrayCollection(arr);
        this.menuList.validateNow();
    }

    private setDefault() {
        let startId = 0;
        let endId = Object.keys(GlobalConfig.VipGiftConfig).length;
        for (let k in GlobalConfig.VipGiftConfig) {
            let hfTimes = GlobalConfig.VipGiftConfig[k].hfTimes;
            hfTimes = hfTimes ? hfTimes : 0;
            if (hfTimes == this.curIndex) {
                if (!startId) {
                    startId = GlobalConfig.VipGiftConfig[k].id;
                }
                endId = +k;
            }
        }
        let state: { id: number, state: number }[] = UserVip.ins().vipGiftState;
        let defId = endId;
        for (let id = startId ? startId : 1; id <= endId; id++) {
            // if ( ((state >> id) & 1) == 0 ) {
            if ((state[id - 1].state & 1) == 0) {
                defId = id;
                break;
            }
        }
        this.setGiftId(defId);
        startId = startId ? startId : 1;
        let menuIndex = defId - startId;
        this.menuList.selectedIndex = menuIndex;

        TimerManager.ins().doNext(() => {
            let scroH: number = menuIndex * 92;

            if (scroH > (this.menuList.contentWidth - this.menuScroller.width)) {
                scroH = this.menuList.contentWidth - this.menuScroller.width;
            }

            this.menuList.scrollH = scroH;

            this.onChange();

        }, this);

    }

    private onTouchBtn(e: egret.TouchEvent): void {
        let num: number = 92 * 5;
        let scrollH: number = 0;
        switch (e.target) {
            case this.leftBtn:
                scrollH = this.menuList.scrollH - num;
                scrollH = Math.round(scrollH / 92) * 92;
                if (scrollH < 0) {
                    scrollH = 0;
                }
                this.menuList.scrollH = scrollH;
                break;
            case this.rightBtn:
                scrollH = this.menuList.scrollH + num;
                scrollH = Math.round(scrollH / 92) * 92;
                if (scrollH > this.menuList.contentWidth - this.menuScroller.width) {
                    scrollH = this.menuList.contentWidth - this.menuScroller.width;
                }
                this.menuList.scrollH = scrollH;
                break;
        }
        this.onChange();
    }

    private onUpdate() {
        let arr = this.menuList.dataProvider as eui.ArrayCollection;
        for (let i = 0; i < arr.length; i++) {
            arr.itemUpdated(arr.getItemAt(i));
        }

        this.setDefault();
    }

    private setGiftId(id) {
        this.vipGiftItem.open(id);
    }

    close() {
        this.vipGiftItem.close();
        this.menuList.dataProvider = new eui.ArrayCollection();
    }
}