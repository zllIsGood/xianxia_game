/** 
 * 平台数据接口。
 * 由于每款游戏通常需要发布到多个平台上，所以提取出一个统一的接口用于开发者获取平台数据信息
 * 推荐开发者通过这种方式封装平台逻辑，以保证整体结构的稳定
 * 由于不同平台的接口形式各有不同，白鹭推荐开发者将所有接口封装为基于 Promise 的异步形式
 */
declare interface Platform {

    getUserInfo(): Promise<any>;

    login(): Promise<any>;

    reLogin(): Promise<any>;

    shareAppMessage(title: string, query: string, img: string): Promise<any>

    gameLogin(serverId): Promise<any>

    isIphoneX(): boolean | void;

    isIphone(): boolean | void;

    showLoginView();

    setLoadingProgress(title: string, cur: number, total: number);

    init(onShow: Function, onHide: Function);

    getPt(): string | void;

    requestMidasPayment(buyQuantity: string): Promise<any>;

    requestVivoPayment(param: string, signature: string): Promise<any>;

    playVivoSound(soudnPath: string, loop: boolean);
    
    getVivoNotchHeight();

    /**
   * account: 账号
   * serverid: 服务器id
   * role: 角色id
   * time: 时间戳
   * amount: 金额
   * orderId: 订单
   */
  payment(account: string, serverId: string, role: string, time: string, amount: string, orderId: string, sign: string, itemId: number): Promise<any>

}

class DebugPlatform implements Platform {

    showLoginView() {

    }

    setLoadingProgress(title: string, cur: number, total: number) {

    }

    async getUserInfo() {
        return { nickName: "username" }
    }
    async login() {

    }
    async shareAppMessage(title: string, query: string, img: string) {

    }

    async gameLogin(serverId) {

    }

    isIphoneX(): boolean | void {
        
    }

    isIphone(): boolean | void {
        
    }

    init(onShow: Function, onHide: Function) {
        
    }

    async requestMidasPayment(buyQuantity: string) {

    }

    async requestVivoPayment(param: string, signature: string) {

    }

    async payment(account: string, serverId: string, role: string, time: string, amount: string, orderId: string, sign: string, itemId: number): Promise<any> {

    }

    async reLogin(): Promise<any> {

    }

    getPt(): string | void {

    }

    playVivoSound(soudnPath: string, loop: boolean) {
        
    }

    getVivoNotchHeight() {
        return 0;
    }
}


if (!window.platform) {
    window.platform = new DebugPlatform();
}



declare let platform: Platform;

declare interface Window {

    platform: Platform
}





