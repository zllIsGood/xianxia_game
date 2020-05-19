/// 阅读 api.d.ts 查看文档
///<reference path="api.d.ts"/>

import * as path from 'path';
import { UglifyPlugin, CompilePlugin, ManifestPlugin, ExmlPlugin, EmitResConfigFilePlugin, TextureMergerPlugin, CleanPlugin, ResSplitPlugin } from 'built-in';

import { WxgamePlugin } from './wxgame/wxgame';
import { SubPackagePlugin } from './wxgame/subpackage';
import { CustomPlugin } from './myplugin';
import { RealignManifestPlugin } from './myplugin';
import * as defaultConfig from './config';

const config: ResourceManagerConfig = {

    buildConfig: (params) => {

        const { target, command, projectName, version } = params;
        const outputDir = `bin-release/wxgame/${version}`; //自行修改导出目录
        // 将大文件拆分到子包处理 by oyxz        
        const subPak1 = ["default.thm.js"];
        const subPak2 = ["main.min.js"];
        if (command == 'build') {
            return {
                outputDir,
                commands: [
                    new CleanPlugin({ matchers: ["js", "resource", "stage1", "stage2"] }),
                    new CompilePlugin({ libraryType: "debug", defines: { DEBUG: true, RELEASE: false } }),
                    new ExmlPlugin('commonjs'), // 非 EUI 项目关闭此设置
                    new WxgamePlugin(), 
                    new SubPackagePlugin({
                        output: 'manifest.js',
                        subPackages: [{
                            root: "stage1",
                            "includes": subPak1
                        }, {
                            root: "stage2",
                            "includes": subPak2
                        }]
                    }),
                    new RealignManifestPlugin()
                ]
            }
        }
        else if (command == 'publish') {
            return {
                outputDir,
                commands: [
                    new CleanPlugin({ matchers: ["js", "resource", "stage1", "stage2"] }),
                    new CompilePlugin({ libraryType: "debug", defines: { DEBUG: true, RELEASE: false } }),
                    new ExmlPlugin('commonjs'), // 非 EUI 项目关闭此设置
                    new WxgamePlugin(),                    
                    new UglifyPlugin([
                        /*{
                            sources: ["main.js"],
                            target: "main.min.js"
                        },*/
                        {
                            sources: [
                                "libs/modules/egret/egret.js",
                                "libs/modules/eui/eui.js",
                                "libs/modules/assetsmanager/assetsmanager.js",
                                "libs/modules/tween/tween.js",
                                "libs/modules/socket/socket.js",
                                "libs/modules/game/game.js",
                                "3rdlib/particle/particle.js",
                                "3rdlib/jszip/jszip.js",
                            ],
                            target: "lib.min.js"
                        }]),
                    new SubPackagePlugin({
                        output: 'manifest.js',
                        subPackages: [{
                            root: "stage1",
                            "includes": subPak1
                        }, {
                            root: "stage2",
                            "includes": subPak2
                        }]
                    }),
                    new RealignManifestPlugin()
                ]
            }
        }
        else {
            throw `unknown command : ${params.command}`;
        }
    },

    mergeSelector: defaultConfig.mergeSelector,

    typeSelector: defaultConfig.typeSelector
}



export = config;
