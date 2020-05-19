/**
 * Created by yangsong on 15-1-14.
 * 音效类
 */
class SoundEffects extends BaseSound {
	private _volume:number;

	/**
	 * 构造函数
	 */
	public constructor() {
		super();
	}

	/**
	 * 播放一个音效
	 * @param effectName
	 */
	public play(effectName:string):void {
		let sound:egret.Sound = this.getSound(effectName);
		if (sound) {
			this.playSound(sound);
		}
	}

	/**
	 * 播放
	 * @param sound
	 */
	private playSound(sound:egret.Sound):void {
		let channel:egret.SoundChannel = sound.play(0, 1);
		channel.volume = this._volume;
	}

	/**
	 * 设置音量
	 * @param volume
	 */
	public setVolume(volume:number):void {
		this._volume = volume;
	}


	/**
	 * 资源加载完成后处理播放
	 * @param key
	 */
	public loadedPlay(key:string):void {
		let sound = RES.getRes(key);
		//避免音频解码失败报错
		if (!sound) {
			return;
		}
		this.playSound(sound);
	}
}