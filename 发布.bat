@echo off

set resDir=..\..\..\common\trunk\config\client\resource\

echo begin publish..
svn up
egret publish --version 1 && (

cd %resDir%

echo svn up...
svn up

cd ..\..\..\..\..\code\client\trunk\

echo copy main.min.js..
copy %~dp0bin-release\web\1\main.min.js %resDir%

echo svn ci...
svn ci %resDir%main.min.js -m"M:自动提交"

pause
)

