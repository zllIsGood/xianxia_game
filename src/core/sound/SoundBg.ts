/**
 * Created by yangsong on 15-1-14.
 * 背景音乐类
 */
class SoundBg extends BaseSound {
	private _currBg:string;
	private _currSound:egret.Sound;
	private _currSoundChannel:egret.SoundChannel;
	private _volume:number;

	/**
	 * 构造函数
	 */
	public constructor() {
		super();
		this._currBg = "";
	}

	/**
	 * 停止当前音乐
	 */
	public stop():void {
		if (this._currSoundChannel) {
			this.removeSoundChannel(this._currSoundChannel);
		}
		this._currSoundChannel = null;
		this._currSound = null;
		this._currBg = "";
	}

	/**
	 * 播放某个音乐
	 * @param effectName
	 */
	public play(effectName:string):void {
		if (this._currBg == effectName)
			return;
		this.stop();
		this._currBg = effectName;
		let sound:egret.Sound = this.getSound(effectName);
		if (sound) {
			this.playSound(sound);
		}
	}

	//主要是解决ios不播放的bug
	public touchPlay() {
		if (this._currSoundChannel && this._currSound) {
			let pos = this._currSoundChannel.position;
			this.removeSoundChannel(this._currSoundChannel);
			this._currSoundChannel = this._currSound.play(pos, 1);
			this.addSoundChannel(this._currSoundChannel);
		}
	}

	/**
	 * 播放
	 * @param sound
	 */
	private playSound(sound:egret.Sound):void {
		this._currSound = sound;
		this._currSoundChannel = this._currSound.play(0, 1);
		this.addSoundChannel(this._currSoundChannel);
	}

	private onSoundComplete(){
		if(this._currSoundChannel) this.removeSoundChannel(this._currSoundChannel);
		this.playSound(this._currSound);
	}

	private addSoundChannel(channel:egret.SoundChannel){
		channel.volume = this._volume;
		channel.addEventListener(egret.Event.SOUND_COMPLETE, this.onSoundComplete, this);
	}

	private removeSoundChannel(channel:egret.SoundChannel){
		channel.removeEventListener(egret.Event.SOUND_COMPLETE, this.onSoundComplete, this);
		channel.stop();
	}

	/**
	 * 设置音量
	 * @param volume
	 */
	public setVolume(volume:number):void {
		this._volume = volume;
		if (this._currSoundChannel) {
			this._currSoundChannel.volume = this._volume;
		}
	}

	/**
	 * 资源加载完成后处理播放
	 * @param key
	 */
	public loadedPlay(key:string):void {
		if (this._currBg == key) {
			let sound = RES.getRes(key);
			//避免音频解码失败报错
			if (!sound) {
				return;
			}
			this.playSound(sound);
		}
	}

	/**
	 * 检测一个文件是否要清除
	 * @param key
	 * @returns {boolean}
	 */
	public checkCanClear(key:string):boolean {
		return this._currBg != key;
	}
}