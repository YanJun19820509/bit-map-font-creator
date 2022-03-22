//@ts-ignore
import { copyFileSync } from 'fs';
import { join, normalize } from 'path';
import { FontCreator } from './FontCreator';
/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openPanel() {
        Editor.Panel.open('bit-map-font-creator');
    },
    async ok(v: string) {
        console.log(v);
        Editor.Message.broadcast("bit-map-font-creator:setState", '开始创建字体..');
        let a = JSON.parse(v);
        if (!FontCreator.createFont(a.input, a.output, a.name)) {
            Editor.Message.broadcast("bit-map-font-creator:setState", '字体创建失败！');
            return;
        }
        Editor.Message.broadcast("bit-map-font-creator:setState", '字体创建完成！');
        let op = a.output;
        let dest = normalize(op).replace(normalize(Editor.Project.path) + '\\', 'db://').replace(/\\/g, '/');
        await Editor.Message.request('asset-db', 'refresh-asset', dest);
    },
    downloadJSX(path: string) {
        let file = 'psd2png.jsx';
        copyFileSync(join(Editor.Project.path, './extensions/bit-map-font-creator', file), join(path, file));
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = function () { };

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () { };
