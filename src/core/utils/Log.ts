/**
 * Created by yangsong on 2014/11/22.
 */
class Log {
	/**
	 * Debug_Log
	 * @param messsage 内容
	 * @constructor
	 */
	public static trace(...optionalParams:any[]):void {
		if (DebugUtils.isDebug) {
			optionalParams[0] = "[DebugLog]" + optionalParams[0];
			debug.log.apply(console, optionalParams);
		}
	}
}