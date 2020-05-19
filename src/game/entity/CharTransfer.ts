/**
 * Created by hrz on 2017/8/10.
 */

class CharTransfer extends CharEffect {
    private transferName: TransferNameHead;
    constructor() {
        super();
        this.hasDir = [];
        this.touchEnabled = true;
        this.transferName = new TransferNameHead();
        this.transferName.anchorOffsetX = 40;
        this.transferName.anchorOffsetY = 21;
        this.titleCantainer.addChild(this.transferName);

        this.titleCantainer.anchorOffsetY = 80;
    }

    set infoModel(model: TransferModel) {
        this._infoModel = model;
    }

    get infoModel(): TransferModel {
        return this._infoModel as TransferModel;
    }

    updateModel() {
        this.x = this.infoModel.x + 40;
        this.y = this.infoModel.y - 40;
        this.transferName.updateModel(this.infoModel);
        this.addMc(CharMcOrder.BODY, this.infoModel.avatarFileName);
    }
}