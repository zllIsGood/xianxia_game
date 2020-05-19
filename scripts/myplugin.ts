/**
 * 示例自定义插件，您可以查阅 http://developer.egret.com/cn/github/egret-docs/Engine2D/projectConfig/cmdExtensionPlugin/index.html
 * 了解如何开发一个自定义插件
 */
export class CustomPlugin implements plugins.Command {

    constructor() {
    }

    async onFile(file: plugins.File) {
        return file;
    }

    async onFinish(commandContext: plugins.CommandContext) {

    }
}

export class RealignManifestPlugin implements plugins.Command {
    private buffer
    constructor() {
    }

    async onFile(file: plugins.File) {
        // 保存manifest.js文件的内容
        if (file.basename.indexOf('manifest.js') > -1) {
            this.buffer = file.contents
        }
        return file;
    }

    async onFinish(commandContext: plugins.CommandContext) {
        // 把'lib.min.js'移到第一位
        if (this.buffer) {
            let contents: string = this.buffer.toString()
            let arr = contents.split('\n')
            let lib = null
            arr.forEach((item, index) => {
                if (item.indexOf('lib.min.js') > -1) {
                    lib = item
                    arr.splice(index, 1)
                }
            })
            if (lib != null) {
                arr.unshift(lib)
            }

            let newCont = arr.join('\n')
            commandContext.createFile('manifest.js', new Buffer(newCont))
        }
    }
}