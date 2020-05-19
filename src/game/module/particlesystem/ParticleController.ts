/*
    file: src/game/module/particle/ParticleController.ts
    date: 2019-1-11
    author: solace
    descript: 粒子系统控制器
    tips: https://bbs.egret.com/thread-1979-1-1.html
    	  http://developer.egret.com/cn/github/egret-docs/extension/particle/introduction/index.html

   	example: 
   			let par = ParticleController.ins().playParticle("particleTest",this,5000);
*/

class ParticleController extends BaseClass {

	private particleList;
	
	constructor() {
		super();
		this.particleList = [];
	}

	/*
		用于创建新粒子系统
		particleName：粒子名称(对应resource/res/particle/中的资源名字)
		parent: 父节点
		time： 粒子持续时间，单位毫秒
	 */
	public playParticle(particleName: string, parent: egret.DisplayObjectContainer, time: number = -1) {
		if (!parent) return;

		let img: any;
		let json: any;
		let par;
		let path: string = `${RES_DIR_FLOWER}${particleName}`;
		let self = this;
		let createFunc = function () {
			if (!img || !json) return;
			par = new particle.GravityParticleSystem(img,json);
			parent.addChild(par);
			par.start(time);
			self.particleList.push(par);
			par.addEventListener(egret.Event.COMPLETE,()=>{
				self.removeParticle(par);
			},self)
		}

		RES.getResByUrl(path + ".json", (data, url) => {
			if (path + ".json" != url || !data)
				return;
			json = data;
			createFunc();
			if (par)
				return par;
		}, this, RES.ResourceItem.TYPE_JSON);

		RES.getResByUrl(path + ".png", (data, url) => {
			if (path + ".png" != url || !data)
				return;
			img = data;
			createFunc();
			if (par)
				return par;
		}, this, RES.ResourceItem.TYPE_IMAGE);
	}

	public removeParticle(parNode: particle.GravityParticleSystem) {
		for (var i = 0; i < this.particleList.length; i++) {
			if (this.particleList[i] == parNode) {
				this.particleList[i].stop();
				DisplayUtils.removeFromParent(this.particleList[i]);
				this.particleList.splice(i,1);
				break;
			}
		}
	}

	public clearAllParticle() {
		for (var i = 0; i < this.particleList.length; i++) {
			if (this.particleList[i] != null) {
				this.particleList[i].stop();
				DisplayUtils.removeFromParent(this.particleList[i]);
			}
		}
		this.particleList = [];
	}
}