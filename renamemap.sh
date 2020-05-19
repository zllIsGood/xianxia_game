#!/bin/sh
# 重命名地图块

shellPath=`pwd`
echo $shellPath
mapName=""
jpgName=""
jpgPath=""
oldName=""
function read_dir(){
for file in `ls $1` #注意此处这是两个反引号，表示运行系统命令
do
	if [ -d $1"/"$file ] #注意此处之间一定要加上空格，否则会报错
	then
		read_dir $1"/"$file
	else
		mapName=$1"/"$file
		jpgPath=${mapName%/*}
		jpgName=${mapName##*/}
		jpgName=${jpgName%.*}
		mapName=${mapName%/*}
		mapName=${mapName%/*}
		mapName=${mapName##*/}
		oldName=${jpgName#*_}
		if [[ $jpgName == *_* ]]; then 
			echo $jpgPath/$jpgName.jpg
			echo  $jpgPath/$oldName.jpg
			mv $jpgPath/$jpgName.jpg $jpgPath/$oldName.jpg
		fi
		# if [[  $jpgName == *[a-zA-Z]* ]]; then
		# 	echo $jpgPath/$jpgName.jpg
		# 	echo $jpgPath/$mapName"_"$jpgName.jpg
		# 	mv $jpgPath/$jpgName.jpg $jpgPath/$mapName"_"$jpgName.jpg
		# fi
	fi
done
} 

read_dir $shellPath/resource/map
