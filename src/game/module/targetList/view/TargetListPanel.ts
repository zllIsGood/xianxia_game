class TargetListPanel extends BaseEuiView {

	/**正在攻击的目标 */
	public attackGroup0: eui.Group;
	/**正在攻击的目标 */
	public list1: eui.List;
	/**攻击我的敌人 */
	public beAttackGroup0: eui.Group;
	public bar2: eui.Scroller;
	/**攻击我的敌人 */
	public list3: eui.List;
	/**我可以攻击的目标 */
	public canAttackGroup0: eui.Group;
	public bar1: eui.Scroller;
	/**我可以攻击的目标 */
	public list2: eui.List;

	private list2Dt: eui.ArrayCollection;

	public constructor() {
		super();

		this.skinName = `TargetListSkin`;

		this.list1.itemRenderer = WorldBossHeadRender;
		this.list2.itemRenderer = TargetMemberHeadRender;
		this.list3.itemRenderer = TargetMemberHeadRender;
		this.list2Dt = new eui.ArrayCollection;
		this.list2Dt.source = TargetListCC.ins().canAttackHandles;
		this.list2.dataProvider = this.list2Dt;
	}

	public open(...param: any[]): void {
		this.observe(GameLogic.ins().postChangeTarget, this.updateTarget);
		this.observe(TargetListCC.ins().postTargetList, this.updateBeAttackList);
		this.observe(TargetListCC.ins().postChangeCanAttackHandle, this.updateCanAttackList);
		this.update();
		this.attackGroup0.visible = false;
	}

	private update() {
		this.updateTarget();
		this.updateBeAttackList();
		this.updateCanAttackList();
	}
	public showTarget(b: boolean) {
		this.attackGroup0.visible = b;
	}

	@callLater
	private updateTarget() {
		if (!this.attackGroup0.visible) return;
		if (!this.list1.dataProvider) {
			this.list1.dataProvider = new eui.ArrayCollection([GameLogic.ins().currAttackHandle]);
		} else {
			let dataPro = this.list1.dataProvider as eui.ArrayCollection;
			dataPro.replaceAll([GameLogic.ins().currAttackHandle]);
		}
	}
	@callLater
	private updateBeAttackList(): void {
		let data = TargetListCC.ins().attackMeHandles;
		this.beAttackGroup0.visible = data.length > 0;
		if (!this.beAttackGroup0.visible) return;
		if (!this.list3.dataProvider) {
			this.list3.dataProvider = new eui.ArrayCollection(data);
		} else {
			let dataPro = this.list3.dataProvider as eui.ArrayCollection;
			dataPro.replaceAll(data);
		}
	}
	@callLater
	private updateCanAttackList(): void {
		let data = TargetListCC.ins().canAttackHandles;
		this.canAttackGroup0.visible = data.length > 0;
		if (!this.canAttackGroup0.visible) return;
		//this.list2.dataProvider = new eui.ArrayCollection(data);
		this.list2Dt.replaceAll(TargetListCC.ins().canAttackHandles);
	}
}

namespace GameSystem {
	export let  targetlistpanel = () => {
		ViewManager.ins().reg(TargetListPanel, LayerManager.Main_View);
	}
}