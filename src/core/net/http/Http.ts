/**
 * Created by luoy on 2016/12/20.
 * Http请求处理
 */
class Http extends BaseClass {


	/**
	 * 构造函数
	 */
	public constructor() {
		super();
	}

	public static ins(): Http {
		return super.ins() as Http;
	}

	/**
	 * 请求数据
	 * @param	paramUrl								请求地址
	 * @param	resType									返回的数据格式	true文本数据	false二进制数据
	 * @param	method									数据请求类型	true：GET	false：POST
	 * @param	onComplete(event: egret.Event)			请求完成
	 * @param	onError(event: egret.IOErrorEvent)		请求错误
	 * @param	onProgress(event: egret.ProgressEvent)	请求进度
	 */
	public send(paramUrl: string, resType: boolean, method: boolean, onComplete: Function, onError?: Function, onProgress?: Function): void {
		let request: egret.HttpRequest = new egret.HttpRequest();
		request.responseType = resType ? egret.HttpResponseType.TEXT : egret.HttpResponseType.ARRAY_BUFFER;
		request.open(paramUrl, method ? egret.HttpMethod.GET : egret.HttpMethod.POST);
		request.once(egret.Event.COMPLETE, onComplete, this);
		request.once(egret.IOErrorEvent.IO_ERROR, onError ? onError : () => { }, this);
		request.once(egret.ProgressEvent.PROGRESS, onProgress ? onProgress : () => { }, this);
		request.send();
	}
}

