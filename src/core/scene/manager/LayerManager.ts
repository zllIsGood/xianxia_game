/**
 * Created by yangsong on 2014/11/23.
 * 游戏层级类
 */
class LayerManager {
	/**
	 * 游戏背景层
	 * @type {BaseSpriteLayer}
	 */
	public static Game_Bg:BaseEuiLayer = new BaseEuiLayer();
	/**
	 * 主游戏层
	 * @type {BaseSpriteLayer}
	 */
	public static Game_Main:BaseEuiLayer = new BaseEuiLayer();

	/**
	 * 游戏主界面
	 * @type{BaseEuiLayer}
	 */
	public static Main_View:BaseEuiLayer = new BaseEuiLayer();

	/**
	 * UI主界面，功能弹窗
	 * @type {BaseEuiLayer}
	 */
	public static UI_Main:BaseEuiLayer = new BaseEuiLayer();

	/**
	 * UI主界面2 比 UI主界面 高一层
	 * @type {BaseEuiLayer}
	 */
	public static UI_Main2:BaseEuiLayer = new BaseEuiLayer();
	/**
	 * UI弹出框层
	 * @type {BaseEuiLayer}
	 */
	public static UI_Popup:BaseEuiLayer = new BaseEuiLayer();
	/**
	 * UI警告消息层
	 * @type {BaseEuiLayer}
	 */
	public static UI_Message:BaseEuiLayer = new BaseEuiLayer();
	/**
	 * UITips层
	 * @type {BaseEuiLayer}
	 */
	public static UI_Tips:BaseEuiLayer = new BaseEuiLayer();
	/**
	 * loading界面层
	 * @type {BaseEuiLayer}
	 */
	public static UI_LOADING:BaseEuiLayer = new BaseEuiLayer();
}