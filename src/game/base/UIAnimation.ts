/**UI动画展现控制 */
class UIAnimation {

	public static ANITYPE_FADEIN_LEFT_HOR: number      = 1;//左边进入
	public static ANITYPE_FADEIN_RIGHT_HOR: number     = 2;//右边进入
	public static ANITYPE_FADEIN_UP_VER: number        = 3;//上边进入
	public static ANITYPE_FADEIN_DOWN_VER: number      = 4;//下边进入

	//一般用于大界面 从屏幕外进入
	public static ANITYPE_IN_LEFT_HOR: number      		= 5;//左边进入
	public static ANITYPE_IN_RIGHT_HOR: number     		= 6;//右边进入
	public static ANITYPE_IN_UP_VER: number        		= 7;//上边进入
	public static ANITYPE_IN_DOWN_VER: number      		= 8;//下边进入

	public static ANITYPE_OUT_LEFT_HOR: number      	= 9;//左边弹出
	public static ANITYPE_OUT_RIGHT_HOR: number     	= 10;//右边弹出
	public static ANITYPE_OUT_UP_VER: number        	= 11;//上边弹出
	public static ANITYPE_OUT_DOWN_VER: number      	= 12;//下边弹出

	public static ANITYPE_IN_SCALE_VER: number      	= 13;//中间进入
	public static ANITYPE_OUT_SCALE_VER: number      	= 14;//中间弹出

	private static diff:number = 50;//幅度
	private static time:number = 200;//毫秒
	private static Egret_Ease 			    			= egret.Ease.backInOut;
	private static aniMap:Map<egret.DisplayObject>      = {};
	private static hroWidh:number = 1.5;//屏幕出入偏移
	public constructor() {
	}

	/**根据参数获取显示格式 */
	public static setAnimation(eobj:egret.DisplayObject,aniType:number,others?:{time:number,func?:any,ease?:any}): void {
		if( !UIAnimation.checkObj(eobj) ){
			if( others && typeof( others.func ) == "function" )
				others.func();
			return;
		}
		let obj:any;
		let className:string = egret.getQualifiedClassName(eobj);
		// egret.log( "className = "+className );
		switch(className){
			case "eui.Button":
				obj = eobj as eui.Button;
				break;
			case "eui.ToggleButton":
				obj = eobj as eui.ToggleButton;
				break;
			case "eui.Image":
				obj = eobj as eui.Image;
				break;
			case "eui.Group":
				obj = eobj as eui.Group;
				break;
			case "eui.Rect":
				obj = eobj as eui.Rect;
				break;
			case "BaseComponent":
				obj = eobj as BaseComponent;
				break;
			case "eui.TabBar":
				obj = eobj as eui.TabBar;
				break;
			// case "eui.Component":
			// 	obj = eobj as eui.Component;
			// 	break;
			default:
				obj = eobj as eui.Component;
				break;
		}
		if( !obj )return;
		egret.Tween.removeTweens(obj);
		//起点x:
		let sx      = NaN;
		let sxleft  = NaN;
		let sxhro   = NaN;//x轴
		let sxright = NaN;
		let sxscaleX = NaN;
		//终点x:
		let ex      = NaN;
		let exleft  = NaN;
		let exhro   = NaN;//x轴
		let exright = NaN;
		let exscaleX   = NaN;

		//起点y:
		let sy      = NaN;
		let sytop   = NaN;
		let syver   = NaN;//y轴
		let sybot   = NaN;
		let syscaleY = NaN;
		//终点y:
		let ey      = NaN;
		let eytop   = NaN;
		let eyver   = NaN;//y轴
		let eybot   = NaN;
		let eyscaleY = NaN;

		//透明度
		let salpha   = NaN;
		let ealpha   = NaN;
		switch (aniType){
		case UIAnimation.ANITYPE_FADEIN_LEFT_HOR:
			if( !isNaN(obj.left) ){
				sxleft = obj.left - UIAnimation.diff;
				exleft = obj.left;
			}
			if( !isNaN(obj.horizontalCenter) ){
				sxhro = obj.horizontalCenter - UIAnimation.diff;
				exhro = obj.horizontalCenter;
			}
			if( !isNaN(obj.right) ){
				sxright = obj.right + UIAnimation.diff;
				exright = obj.right;
			}
			if( !isNaN(obj.alpha) ){
				salpha = 0;
				ealpha = obj.alpha;
			}
			if( !isNaN(obj.x) ){
				sx = obj.x - UIAnimation.diff;
				ex = obj.x;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_FADEIN_RIGHT_HOR:
			if( !isNaN(obj.left) ){
				sxleft = obj.left + UIAnimation.diff;
				exleft = obj.left;
			}
			if( !isNaN(obj.horizontalCenter) ){
				sxhro = obj.horizontalCenter + UIAnimation.diff;
				exhro = obj.horizontalCenter;
			}
			if( !isNaN(obj.right) ){
				sxright = obj.right - UIAnimation.diff;
				exright = obj.right;
			}
			if( !isNaN(obj.alpha) ){
				salpha = 0;
				ealpha = obj.alpha;
			}
			if( !isNaN(obj.x) ){
				sx = obj.x + UIAnimation.diff;
				ex = obj.x;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_FADEIN_UP_VER:
			if( !isNaN(obj.top) ){
				sytop = obj.top - UIAnimation.diff;
				eytop = obj.top;
			}
			if( !isNaN(obj.verticalCenter) ){
				syver = obj.verticalCenter - UIAnimation.diff;
				eyver = obj.verticalCenter;
			}
			if( !isNaN(obj.bottom) ){
				sybot = obj.bottom + UIAnimation.diff;
				eybot = obj.bottom;
			}
			if( !isNaN(obj.alpha) ){
				salpha = 0;
				ealpha = obj.alpha;
			}
			if( !isNaN(obj.y) ){
				sy = obj.y - UIAnimation.diff;
				ey = obj.y;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_FADEIN_DOWN_VER:
			if( !isNaN(obj.top) ){
				sytop = obj.top + UIAnimation.diff;
				eytop = obj.top;
			}
			if( !isNaN(obj.verticalCenter) ){
				syver = obj.verticalCenter + UIAnimation.diff;
				eyver = obj.verticalCenter;
			}
			if( !isNaN(obj.bottom) ){
				sybot = obj.bottom - UIAnimation.diff;
				eybot = obj.bottom;
			}
			if( !isNaN(obj.alpha) ){
				salpha = 0;
				ealpha = obj.alpha;
			}
			if( !isNaN(obj.y) ){
				sy = obj.y + UIAnimation.diff;
				ey = obj.y;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
			/***************屏幕外进入***************/
		case UIAnimation.ANITYPE_IN_LEFT_HOR:
			if( !isNaN(obj.left) ){
				sxleft = obj.left - obj.width;
				exleft = obj.left;
			}
			if( !isNaN(obj.horizontalCenter) ){
				sxhro = obj.horizontalCenter - obj.width;
				exhro = obj.horizontalCenter;
			}
			if( !isNaN(obj.right) ){
				sxright = obj.right + obj.width;
				exright = obj.right;
			}
			if( !isNaN(obj.alpha) ){
				salpha = 0;
				ealpha = obj.alpha;
			}
			if( !isNaN(obj.x) ){
				sx = obj.x - obj.width;
				ex = obj.x;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_IN_RIGHT_HOR:
			if( !isNaN(obj.left) ){
				sxleft = obj.left + obj.width;
				exleft = obj.left;
			}
			if( !isNaN(obj.horizontalCenter) ){
				sxhro = obj.horizontalCenter + obj.width*UIAnimation.hroWidh;
				exhro = obj.horizontalCenter;
			}
			if( !isNaN(obj.right) ){
				sxright = obj.right - obj.width*UIAnimation.hroWidh;
				exright = obj.right;
			}
			if( !isNaN(obj.alpha) ){
				salpha = 0;
				ealpha = obj.alpha;
			}
			if( !isNaN(obj.x) ){
				sx = obj.x + obj.width*UIAnimation.hroWidh;
				ex = obj.x;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_IN_UP_VER:
			if( !isNaN(obj.top) ){
				sytop = obj.top - obj.height;
				eytop = obj.top;
			}
			if( !isNaN(obj.verticalCenter) ){
				syver = obj.verticalCenter - obj.height;
				eyver = obj.verticalCenter;
			}
			if( !isNaN(obj.bottom) ){
				sybot = obj.bottom + obj.height;
				eybot = obj.bottom;
			}
			if( !isNaN(obj.alpha) ){
				salpha = 0;
				ealpha = obj.alpha;
			}
			if( !isNaN(obj.y) ){
				sy = obj.y - obj.height;
				ey = obj.y;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_IN_DOWN_VER:
			if( !isNaN(obj.top) ){
				sytop = obj.top + obj.height;
				eytop = obj.top;
			}
			if( !isNaN(obj.verticalCenter) ){
				syver = obj.verticalCenter + obj.height;
				eyver = obj.verticalCenter;
			}
			if( !isNaN(obj.bottom) ){
				sybot = obj.bottom - obj.height;
				eybot = obj.bottom;
			}
			if( !isNaN(obj.alpha) ){
				salpha = 0;
				ealpha = obj.alpha;
			}
			if( !isNaN(obj.y) ){
				sy = obj.y + obj.height;
				ey = obj.y;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
			/***************屏幕内弹出***************/
		case UIAnimation.ANITYPE_OUT_LEFT_HOR:
			if( !isNaN(obj.left) ){
				sxleft = obj.left;
				exleft = obj.left - obj.width;
			}
			if( !isNaN(obj.horizontalCenter) ){
				sxhro = obj.horizontalCenter;
				exhro = obj.horizontalCenter - obj.width;
			}
			if( !isNaN(obj.right) ){
				sxright = obj.right;
				exright = obj.right + obj.width;
			}
			if( !isNaN(obj.alpha) ){
				salpha = obj.alpha;
				ealpha = 0;
			}
			if( !isNaN(obj.x) ){
				sx = obj.x;
				ex = obj.x - obj.width;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_OUT_RIGHT_HOR:
			if( !isNaN(obj.left) ){
				sxleft = obj.left + obj.width;
				exleft = obj.left;
			}
			if( !isNaN(obj.horizontalCenter) ){
				sxhro = obj.horizontalCenter;
				exhro = obj.horizontalCenter + obj.width*UIAnimation.hroWidh;
			}
			if( !isNaN(obj.right) ){
				sxright = obj.right;
				exright = obj.right - obj.width*UIAnimation.hroWidh;
			}
			if( !isNaN(obj.alpha) ){
				salpha = obj.alpha;
				ealpha = 0;
			}
			if( !isNaN(obj.x) ){
				sx = obj.x;
				ex = obj.x + obj.width*UIAnimation.hroWidh;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_OUT_UP_VER:
			if( !isNaN(obj.top) ){
				sytop = obj.top;
				eytop = obj.top - obj.height;
			}
			if( !isNaN(obj.verticalCenter) ){
				syver = obj.verticalCenter;
				eyver = obj.verticalCenter - obj.height;
			}
			if( !isNaN(obj.bottom) ){
				sybot = obj.bottom;
				eybot = obj.bottom + obj.height;
			}
			if( !isNaN(obj.alpha) ){
				salpha = obj.alpha;
				ealpha = 0;
			}
			if( !isNaN(obj.y) ){
				sy = obj.y;
				ey = obj.y - obj.height;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
		case UIAnimation.ANITYPE_OUT_DOWN_VER:
			if( !isNaN(obj.top) ){
				sytop = obj.top;
				eytop = obj.top + obj.height;
			}
			if( !isNaN(obj.verticalCenter) ){
				syver = obj.verticalCenter;
				eyver = obj.verticalCenter + obj.height;
			}
			if( !isNaN(obj.bottom) ){
				sybot = obj.bottom;
				eybot = obj.bottom - obj.height;
			}
			if( !isNaN(obj.alpha) ){
				salpha = obj.alpha;
				ealpha = 0;
			}
			if( !isNaN(obj.y) ){
				sy = obj.y;
				ey = obj.y + obj.height;
			}
			if( !isNaN(obj.scaleX) ){
				sxscaleX = obj.scaleX;
				exscaleX = obj.scaleX;
			}
			if( !isNaN(obj.scaleY) ){
				syscaleY = obj.scaleY;
				eyscaleY = obj.scaleY;
			}
			break;
			/***************屏幕中间放大进入***************/
			case UIAnimation.ANITYPE_IN_SCALE_VER:
				if( !isNaN(obj.scaleX) ){
					sxscaleX = 0.5;
					exscaleX = obj.scaleX;
				}
				if( !isNaN(obj.scaleY) ){
					syscaleY = 0.5;
					eyscaleY = obj.scaleY;
				}
				break;
			/***************屏幕中间缩小弹出***************/
			case UIAnimation.ANITYPE_OUT_SCALE_VER:
				if( !isNaN(obj.scaleX) ){
					sxscaleX = obj.scaleX;
					exscaleX = 0;
				}
				if( !isNaN(obj.scaleY) ){
					syscaleY = obj.scaleY;
					eyscaleY = 0;
				}
				break;
		}

		sx      = sx?sx:obj.x;
		sxleft  = sxleft?sxleft:obj.left;
		sxhro   = sxhro?sxhro:obj.horizontalCenter;//x轴
		sxright = sxright?sxright:obj.right;
		sxscaleX= sxscaleX?sxscaleX:obj.scaleX;

		ex      = ex?ex:obj.x;
		exleft  = exleft?exleft:obj.left;
		exhro   = exhro?exhro:obj.horizontalCenter;//x轴
		exright = exright?exright:obj.right;
		exscaleX= exscaleX==0?exscaleX:obj.scaleX;

		sy      = sy?sy:obj.y;
		sytop   = sytop?sytop:obj.top;
		syver   = syver?syver:obj.verticalCenter;//y轴
		sybot   = sybot?sybot:obj.bottom;
		syscaleY= syscaleY?syscaleY:obj.scaleY;

		ey      = ey?ey:obj.y;
		eytop   = eytop?eytop:obj.top;
		eyver   = eyver?eyver:obj.verticalCenter;//y轴
		eybot   = eybot?eybot:obj.bottom;
		eyscaleY= eyscaleY==0?eyscaleY:obj.scaleY;

		salpha  = salpha==0?salpha:obj.alpha;
		ealpha  = ealpha==0?ealpha:1;

		UIAnimation.aniStartEUI( obj,
								{
								sx:sx,sxleft:sxleft,sxhro:sxhro,sxright:sxright,//起点x
								ex:ex,exleft:exleft,exhro:exhro,exright:exright,//终点x
								sy:sy,sytop:sytop,syver:syver,sybot:sybot,//起点y
								ey:ey,eytop:eytop,eyver:eyver,eybot:eybot,//终点y
								salpha:salpha,ealpha:ealpha,
								sxscaleX:sxscaleX,exscaleX:exscaleX,
								syscaleY:syscaleY,eyscaleY:eyscaleY
								},others );
	}


	private static aniStartEUI(obj:any,dir:{
								sx:number,sxleft:number,sxhro:number,sxright:number,
								ex:number,exleft:number,exhro:number,exright:number,
								sy:number,sytop:number,syver:number,sybot:number,
								ey:number,eytop:number,eyver:number,eybot:number,
								salpha:number,ealpha:number,
								sxscaleX:number,exscaleX:number
								syscaleY:number,eyscaleY:number},
							   others:{time:number,func?:any,ease?:any})
	{
		obj.x                = dir.sx;
		obj.left             = dir.sxleft;
		obj.horizontalCenter = dir.sxhro;
		obj.right            = dir.sxright;
		obj.y                = dir.sy;
		obj.top              = dir.sytop;
		obj.verticalCenter   = dir.syver;
		obj.bottom           = dir.sybot;
		obj.alpha            = dir.salpha;
		obj.scaleX           = dir.sxscaleX;
		obj.scaleY           = dir.syscaleY;
		let tw:egret.Tween = egret.Tween.get(obj);
		let t:number = others?(others.time?others.time:UIAnimation.time):UIAnimation.time;
		let ease = others?(others.ease?others.ease:UIAnimation.Egret_Ease):UIAnimation.Egret_Ease;
		tw.to({
				x:dir.ex,left:dir.exleft, horizontalCenter:dir.exhro, right:dir.exright,
				y:dir.ey,top:dir.eytop,   verticalCenter:dir.eyver,   bottom:dir.eybot,
			    alpha:dir.ealpha,scaleX:dir.exscaleX,scaleY:dir.eyscaleY
				},t,ease).call(()=>{
			obj.x 				 = dir.ex;
			obj.left             = dir.exleft;
			obj.horizontalCenter = dir.exhro;
			obj.right            = dir.exright;
			obj.y 				 = dir.ey;
			obj.top              = dir.eytop;
			obj.verticalCenter   = dir.eyver;
			obj.bottom           = dir.eybot;
			obj.alpha            = dir.ealpha;
			obj.scaleX           = dir.exscaleX;
			obj.scaleY           = dir.eyscaleY;
			UIAnimation.cleanObj(obj);
			egret.Tween.removeTweens(obj);
			if( others && typeof( others.func ) == "function" )
				others.func();

		});

	}
	private static checkObj(obj:egret.DisplayObject):boolean{
		if( UIAnimation.aniMap[obj.hashCode] )
			return false;
		UIAnimation.aniMap[obj.hashCode] = obj;
		return true;
	}
	private static cleanObj(obj:egret.DisplayObject){
		if( UIAnimation.aniMap[obj.hashCode] )
			delete UIAnimation.aniMap[obj.hashCode];
	}

}