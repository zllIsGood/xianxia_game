class CenterTipsItem extends TipsItem{
    public set labelText(value: string) {
        this._labelText = value;
        this.lab.textFlow = TextFlowMaker.generateTextFlow(this._labelText);
        this.bg.width = this.lab.width+40;
        this.bg.source = "zjmqipao";

        this.bg.visible = true;
        this.lab.alpha = 1;

        this.bg.y = 0;
        this.lab.horizontalCenter = 0;
        this.lab.verticalCenter = -1;

        if(!this.addToEvent) {
            this.addToEvent = true;
            TimerManager.ins().doTimer(5000, 1, this.removeFromParent, this);
        }
    }

    public set labelText2(value: string) {
        this._labelText = value;
        this.lab.textFlow = TextFlowMaker.generateTextFlow(this._labelText);
        this.bg.width = this.lab.width+40;
        this.bg.source = "zjmqipao";

        this.bg.visible = true;
        this.lab.alpha = 1;

        this.bg.y = 0;
        this.lab.horizontalCenter = 0;
        this.lab.verticalCenter = -1;

        if(!this.addToEvent) {
            this.addToEvent = true;
            TimerManager.ins().doTimer(1000, 1, this.removeFromParent, this);
        }
    }
}