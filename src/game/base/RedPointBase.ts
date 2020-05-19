/**
 * Created by hrz on 2017/9/14.
 *
 * 红点基类
 * 用法可以参考 FbRedPoint
 *
 * 红点只需监听
 * RedPointBase.ins().postRedPoint
 * RedPointBase.ins().postTabs
 *
 * 是否开启功能可以监听
 * RedPointBase.ins().postOpen
 */

class RedPointBase extends BaseSystem {

    //系统是否开启
    isOpen:boolean;
    //系统入口红点
    redpoint:boolean;
    //系统对于tab的红点 tab可指系统对应的标签或标签内的红点
    tabs:{[tab:number]: boolean};

    //key=tab,value=tabs 指当key有更新时，遍历value中的每个tab
    private toTabs:{[tab:number]:number[]};
    //key=tab,value=tabs 指value中的任何一个tab更新时，求key的总和
    private sumTabs:{[tab:number]:number[]};

    constructor() {
        super();

        this.initTabs();
    }

    static ins():RedPointBase {
        return super.ins() as RedPointBase;
    }

    protected initTabs() {
        this.isOpen = false;
        this.redpoint = false;
        this.tabs = {};
        this.toTabs = {};
        this.sumTabs = {};

        this.observe(this.postRedPoint, this.postOpen);
    }

    /**
     * tab 可任意数值
     * tab相同时，registerTab 和 registerSum 互斥，只能用其中一个
     * @param tab
     * @param args
     */
    protected registerTab(tab:number, ...args) {
        this.tabs[tab] = false;
        this.associated( () => this.updateTabRedPoint(tab), ...args );
    }

    /**
     * 可以指向tab，比如 tab=10，11，14更新后，tab=0也要更新，就可以registerSum(0, [10,11,14]);
     * tab相同时，registerTab 和 registerSum 互斥，只能用其中一个
     * @param tab
     * @param tabs
     */
    protected registerSum(tab:number, tabs:number[]) {
        this.sumTabs[tab] = tabs;
        for (let t of tabs) {
            if(this.toTabs[t]) this.toTabs[t].push(tab);
            else this.toTabs[t] = [tab];
        }
    }

    /**
     * 开启功能
     * @param args
     */
    protected registerOpen(...args) {
        this.associated(this.postOpen, ...args);
    }

    postOpen():boolean {
        let oldv = this.isOpen;
        this.isOpen = this.getIsOpen();

        if (this.isOpen && oldv != this.isOpen) {
            let keys = Object.keys(this.tabs);
            for (let i = 0; i < keys.length; i++) {
                let tab = +keys[i];
                this.updateTabRedPoint(tab);
            }
        }

        return this.isOpen != oldv;
    }

    postRedPoint():boolean {
        if (!this.isOpen) {
            if(this.redpoint) {
                this.redpoint = false;
                return true;
            } else {
                return false;
            }
        }

        let oldv = this.redpoint;
        this.redpoint = this.and();
        return this.redpoint != oldv;
    }

    postTabs(tab:number):number {
        return tab;
    }

    getRedPoint(tab:number):boolean {
        return this.tabs[tab];
    }

    protected updateTabRedPoint(tab) {
        if (!this.isOpen) return;
        let oldv = this.tabs[tab];
        this.tabs[tab] = this.getTabRedPoint(tab);
        if (this.tabs[tab] != oldv) {
            this.sendTabs(tab);
        }
    }

    protected sendTabs(tab) {
        this.postTabs(tab);

        let toTabs = this.toTabs[tab];
        if (toTabs) {
            for (let t of toTabs) {
                let oldv = this.tabs[t];
                this.tabs[t] = this.andTabs(this.sumTabs[t]);
                if(this.tabs[t] != oldv) {
                    this.postTabs(t);
                }
            }
        }
        this.postRedPoint();
    }

    protected and():boolean {
        for (let k in this.tabs) {
            if (this.tabs[k]) return true;
        }
        return false;
    }

    protected andTabs(tabs):boolean {
        for (let k in tabs) {
            if (this.getRedPoint(tabs[k])) return true;
        }
        return false;
    }

    private andList(list):boolean {
        for (let k in list) {
            if (list[k]) return true;
        }
        return false;
    }

    /**
     * 后面实现该用法（根据标签判断是否显示红点）
     * @param tab
     */
    protected getTabRedPoint(tab:number):boolean {
        return false;
    }

    /**
     * 判断当前功能是否开启
     * 如果 this.isOpen 初始化为 false 需要重写
     */
    protected getIsOpen():boolean {
        return true;
    }
}