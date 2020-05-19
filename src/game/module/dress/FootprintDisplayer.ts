/*足迹*/
class FootprintDisplayer extends egret.DisplayObjectContainer {

	//移动的距离
	private TARGET_POINT: number = 80;
	//上一次出现特效的位置
	private gOwnerLastX: number = 0;
	private gOwnerLastY: number = 0;

	private gOwnerLiLastX: number;
	private gOwnerLiLastY: number;

	private owner: CharRole;
	private image: MovieClip;

	private _waterTimeId: number;

	private imageAry: MovieClip[] = [];
	private gsv: GameSceneView;
	private footId: number;

	public constructor() {
		super();
	}

	//设置角色
	public setOwner(player: CharRole, id: number): void {
		this.owner = player;
		this.footId = id;
		this.gsv = ViewManager.ins().getView(GameSceneView) as GameSceneView;
		TimerManager.ins().doTimer(20, 0, this.update, this)
	}

	/**
	 *更新角色位置 
	* @param owner
	* 
	*/
	public update(): void {
		if (this.gOwnerLastX == 0 && this.gOwnerLastY == 0) {
			this.show();
			this.gOwnerLastX = this.owner.x;
			this.gOwnerLastY = this.owner.y;
		} else {
			if (this.gOwnerLiLastX - this.owner.x != 0 || this.gOwnerLiLastY - this.owner.y != 0) {
				if (this.image) {
					this.clear();
				}
				this.gOwnerLiLastX = this.owner.x;
				this.gOwnerLiLastY = this.owner.y;
			} else {
				this.show();
			}
			if (MathUtils.getDistance(this.owner.x, this.owner.y, this.gOwnerLastX, this.gOwnerLastY) >= this.TARGET_POINT) {
				let img: MovieClip = new MovieClip();
				// this.img.setAnimPath(GameResPath.getEffectNew(44, "", ".7t"), 0, AssetGroupEnum.SCENE_GROUP);
				let res = GlobalConfig.ZhuangBanId[this.footId].res;
				img.playFile(RES_DIR_FOOTSTEP + res, 1, () => {
					if (img) {
						img.dispose();
						DisplayUtils.removeFromParent(img);
						img = null;
					}
				});
				img.x = this.owner.x;
				img.y = this.owner.y + 6;
				if (this.imageAry == null)
					this.imageAry = [];
				this.imageAry.push(img);
				this.gsv.map.addFootPrint(img);
				// HelperLayer.layer3d.scene_body_bottom.addChild(img);
				this.gOwnerLastX = this.owner.x;
				this.gOwnerLastY = this.owner.y;
			}
		}
	}

	private show(): void {
		if (this.image == null) {
			this.image = new MovieClip;
			if (this.footId && GlobalConfig.ZhuangBanId[this.footId]) {
				let res = GlobalConfig.ZhuangBanId[this.footId].res;
				this.image.playFile(RES_DIR_FOOTSTEP + res);
				this.image.x = 0;
				this.image.y = 6;
				// this.owner.footContainer.addChild(this.image);
				// this.gsv.map.addEntity(this.image);

			}
		}
		if (this.image.parent == null) {
			this.owner.addChildAt(this.image, 0);
		} else if (this.image.isPlaying == false) {
			this.image.gotoAndPlay(0);
		}
	}

	private clear(): void {
		if (this.imageAry)
			this.imageAry.forEach(element => {
				if (element) {
					element.dispose();
					DisplayUtils.removeFromParent(element);
					element = null;
				}
			});
		this.imageAry = null;
		if (this.image) {
			DisplayUtils.removeFromParent(this.image);
			this.image = null;
		}
	}

	/**
	 *清理 
	 * 
	 */
	public dispose(): void {
		this.clear();
		this.owner = null;
		TimerManager.ins().removeAll(this);
		ObjectPool.push(this);
	}
}