/**
 * Created by hrz on 2018/1/22.
 */
class ComposeMenuItem extends BaseItemRender {

    public nameLabel: eui.Label;

    public list: eui.List;
    public redPoint: eui.Image;
    public rein_equips: eui.Image;

    public constructor() {
        super();
    }

    public childrenCreated(): void {
        this.init();
    }

    public init() {
        
        this.list.itemRenderer = ComposeSecMenuItem;
        this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onListChange, this);
    }

    private onListChange(): void {
        let data:MergeConfig = this.list.selectedItem;
        let compose: ComposePanel = (ViewManager.ins().getView(BagWin) as BagWin).reinComposePanel;
        compose.updateView(data.id, data.index, MergeCC.ins().getCanMergeTargetId(data.id, data.index));
        compose.unSelectList();
        (this.list.getVirtualElementAt(this.list.selectedIndex) as ComposeSecMenuItem).setSelect(true);
    }

    public selectList(index: number): void {
        this.list.selectedIndex = index;
        let item = (this.list.getVirtualElementAt(this.list.selectedIndex) as ComposeSecMenuItem);
        item.selected = true;
        item.setSelect(true);
    }

    protected dataChanged(): void {
        let data: MergeTotal = this.data;
        this.list.dataProvider = new ArrayCollection(MergeCC.ins().getMergeSecMenu(data.id));
        this.redPoint.visible = MergeCC.ins().isCanMergeById(data.id);
        this.rein_equips.source = data.btn_source;
    }
}
