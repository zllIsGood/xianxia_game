
/**
 * 从服务器获取签名
 */
declare function hw_getSign(params: Object, cb: Function): void;

/**
 * 使用支付完成付款。调用此接口前，请确认已“申请支付服务”。
 * @param params 
 */
declare function hw_pay(params: Object, cb: Function): void;

/**
 * 使用华为帐号登录游戏。调用此接口前，请确认已“申请帐号服务”和“申请游戏服务”。
 * @param params 
 */
declare function hw_gameLogin(params: Object, cb: Function): void;

/**
 * 进入游戏
 */
declare function hw_enterGame(serverId: string, cb: Function): void;


/**
 * 当用户完成选择区服信息进入游戏后，或者用户的等级发生变化时，游戏可以调用此接口存储用户的角色信息。如果游戏本身不具有游戏等级、角色名称、游戏区服或者游戏公会这些信息则可以不接入此接口。调用此接口前，请确认已“申请游戏服务”。
 * @param params 
 */
declare function hw_savePlayerInfo(params: string): void;
