/**
 * Created by hrz on 2017/7/11.
 *
 * 新道具 icon和名字分开不同层次
 */

class CharItem2 extends egret.DisplayObjectContainer implements IChar {
    item:CharItem;
    itemName:CharItemName;
    /** 道具信息 */
    protected _infoModel: EntityModel;
    private _itemParent:egret.DisplayObjectContainer;
    constructor() {
        super();
        this.touchEnabled = false;
        this.touchChildren = false;

        this.item = new CharItem();
        this.itemName = new CharItemName();
    }

    get infoModel(): EntityModel {
        return this._infoModel;
    }

    set infoModel(model: EntityModel) {
        this._infoModel = model;
    }

    setData(item:RewardData){
        this.item.setData(item);
        this.itemName.setData(item);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAdd, this);
    }

    setItemParent(parent) {
        this._itemParent = parent;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAdd, this);
        this._itemParent.addChild(this);
    }

    addRoatEffect() {
        this.item.addRoatEffect();
    }

    removeRoatEffect() {
        this.item.removeRoatEffect();
    }

    addFloatEffect(){
        egret.Tween.removeTweens(this.item);
        let t: egret.Tween = egret.Tween.get(this.item);
        let posY: number = this.item.y;

        //爆出掉落效果
        this.item.y -= 100;
        t.to({ y: posY }, 500, egret.Ease.bounceOut);
    }

    private onAdd(e:egret.Event) {
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
        ResourceMgr.ins().reloadContainer(this.item);

        if (this._itemParent) {
            this._itemParent.addChild(this.item);
            this._itemParent.addChild(this.itemName);
        } else {
            DropHelp.dropContainer.addChild(this.item);
            DropHelp.dropNameContainer.addChild(this.itemName);
        }

    }

    private onRemove(e:egret.Event){
        this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
        if(this.item.parent){
            this.item.parent.removeChild(this.item);
        }
        if(this.itemName.parent){
            this.itemName.parent.removeChild(this.itemName);
        }
        this.removeRoatEffect();
    }

    set x (_x:number) {
        egret.superSetter(CharItem2, this, 'x', _x);
        this.itemName.x = _x;
        this.item.x = _x;
    }

    get x () {
        return egret.superGetter(CharItem2, this, 'x');
    }

    set y (_y:number) {
        egret.superSetter(CharItem2, this, 'y', _y);
        this.itemName.y = _y;
        this.item.y = _y;
    }

    get y () {
        return egret.superGetter(CharItem2, this, 'y');
    }

    get team() {
        return this.infoModel.team;
    }

    public reset(): void {
        this.item.scaleX = 1;
        this.item.scaleY = 1;
        this.itemName.scaleX = 1;
        this.itemName.scaleY = 1;
    }

    public destruct(): void {
        this.item.scaleX = 1;
        this.item.scaleY = 1;
        this.itemName.scaleX = 1;
        this.itemName.scaleY = 1;
        this._itemParent = null;
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAdd, this);
    }

}