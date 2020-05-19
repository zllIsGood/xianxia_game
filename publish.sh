#!/bin/sh
# 发布

if [ $# -ne 1 ] ;then
	echo "Usage:$0 target name:web|ios|wxgame|vivo" && exit
fi

shellPath=`pwd`

sourcePath=$shellPath

target="$1"
ver=1

targetPath=$shellPath/../../publish/${sourcePath##*/}/$target
releasePath=$sourcePath/bin-release/$target/$ver
updateResPath=$shellPath/../../publish/${sourcePath##*/}/web
resourcePath=$shellPath/../../../common/${sourcePath##*/}/config/client/resource/resource
vivoPath=$shellPath/../../platform/vivogame

# 检测压缩插件是否安装
function _check(){
	info=`uglifyjs -V`
	if [ -z "$info" ]; then
		echo "please run:npm install uglify-js -g"
		return 0
	else
		return 1
	fi
}

function _commit(){
	path=$1
	echo "start commit $path ..."
	value=`svn st | grep "\?" | awk -F: '{print $1}'| cut -d' ' -f8`
	if [[ -n "$value" ]];then
		svn add $value
	fi

	# 删除旧文件
	value=`svn st | grep "\!" | awk -F: '{print $1}'| cut -d' ' -f8`
	if [[ -n "$value" ]];then
		svn del $value
	fi

	svn ci -m'M:自动提交打包'
}

#----------------------start publish--------------------
echo "start cpoy resource ..."
svn up $updateResPath/
pushd $resourcePath
	svn up
popd
rm -rf $releasePath/
cp -R $resourcePath $sourcePath/resource

echo "start publish $target ..."
if [[ "$target" == "wxgame" ]];then
	rm -rf $updateResPath/resource

	#----------------------Move File--------------------
	python3 $shellPath/LoadClass.py
	svn ci src/LoadAllClass.ts src/LoadAllInterface.ts -m'M:自动提交 LoadAllClass.ts LoadAllInterface.ts'

	egret publish --version $ver --target $target
	#压缩default.thm.js
	uglifyjs $releasePath/stage1/default.thm.js -o $releasePath/stage1/default.thm.js
elif [[ "$target" == "vivo" ]]; then
	egret publish --version $ver --target $target
	uglifyjs $releasePath/resource/default.thm.js -o $releasePath/resource/default.thm.js
else
	rm -rf $targetPath	
	egret publish --version $ver
	uglifyjs $releasePath/resource/default.thm.js -o $releasePath/resource/default.thm.js
fi

#压缩必要大文件
if [[ "$target" != "wxgame" ]];then
	zip -9 -j $releasePath/main.min.js.cfg $releasePath/main.min.js
	zip -9 -j $releasePath/resource/default.thm.js.cfg $releasePath/resource/default.thm.js
fi
zip -9 -j $releasePath/resource/config/config.json.cfg $releasePath/resource/config/config.json
#---------------------end publish-----------------------

# if [[ "$target" == "ios" ]];then
# 	cp -rf $sourcePath/index2.html $sourcePath/bin-release/web/$ver/index.html
# elif [[ "$target" == "web" ]];then
# 	cp -rf $sourcePath/index3.html $sourcePath/bin-release/web/$ver/index.html
# fi

#----------------------start copy--------------------
echo "start copy ..."
if [[ "$target" == "wxgame" ]];then
	cp -rf $releasePath/js/ $targetPath/js/
	cp -rf $releasePath/stage1/ $targetPath/stage1/
	cp -rf $releasePath/stage2/ $targetPath/stage2/
	cp $releasePath/manifest.js $targetPath/manifest.js
	# cp -rf $releasePath/resource/ $updateResPath/resource/
elif [[ "$target" == "vivo" ]];then
	cp $releasePath/main.min.js $vivoPath/engine/js/main.min.js
	cp $releasePath/resource/default.thm.js $vivoPath/engine/js/default.thm.js

else
	cp -rf $releasePath/ $targetPath/
fi
rm -rf $sourcePath/resource
#----------------------end copy--------------------

#----------------------start commit--------------------
# if [[ "$target" == "wxgame" ]];then
# 	pushd $updateResPath
# 	_commit $updateResPath
# 	popd
# fi
if [[ "$target" == "vivo" ]];then
	pushd $vivoPath
	npm run release
	_commit $vivoPath
	popd
else
	pushd $targetPath
	_commit $targetPath
	popd
fi
#----------------------end commit--------------------

echo "publish success..."