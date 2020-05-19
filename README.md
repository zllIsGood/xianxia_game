环境说明:
1.安装EgretLauncher最新版本
2.运行EgretLauncher内,安装EgretWing3(4.1.5版本)
3.安装引擎5.2.12
4.打开工程clean后即可运行
5.修改index.html内的208行,将ip修改成对应的跳转地址

resource目录说明：
1.resource目录在svn的路径与当前svn路径不同，方便修改资源

发布说明:
mac方法:
1.执行publish.sh即可生成一份可运行的包

版本发布方式:
sh ./publish.sh web|ios
会自动发布到../release/web|ios

# 修改内容
1. 原来的Platform修改成HYTransport, 因为Platform在新版中是用来做平台数据接口.
2. 标记为 "TODO fix" 就是待修改的.
3. 标记为 "TODO Modify" 就是已经为新版做了适配的, 可以帮忙看一下是否正确.
4. MergeJsonAnalyzer.ts 删除, 搜索了项目里没有使用这个文件, 之后可以通过插件的方式添加进来.

# 2018年10月29日 21:42:29
1.升级引擎到5.2.12
2.添加判断微信小程序不使用加载zip

publish.sh打包脚本:
1.先安装nodejs,npm
2.压缩js文件,需要先安装以下插件
npm install uglify-js -g
uglifyjs default.thm.js -o default.thm.js