import fs from 'fs';
import images from 'images';
import { MaxRects, Vec2 } from './MaxRects';
import { Frame, Fnt } from './fnt';

export namespace FontCreator {
    const space = 1;
    let fnt: Fnt;

    export function createFont(srcPath: string, output: string, name = 'spriteAtlas'): boolean {
        if (!fs.existsSync(srcPath)) {
            console.error('目录不存在：', srcPath);
            return false;
        }
        // console.log('aaa', srcPath, output, name);
        let types = ['png', 'PNG', 'jpg', 'jpeg', 'JPG', 'JPEG'];
        // let files: string[] = [];
        let imgs: { name: string, img: images.Image, offset: Vec2 }[] = [];
        fnt = new Fnt(name);
        fs.readdirSync(srcPath).forEach(file => {
            let p = `${srcPath}/${file}`;
            let s = fs.statSync(p);
            if (s.isFile() && types.includes(file.split('.')[1])) {
                // files[files.length] = p;
                imgs[imgs.length] = { name: file, img: getImage(p), offset: new Vec2() };
            }
        });
        imgs.sort((a, b) => {
            return (b.img.width() - a.img.width()) || (b.img.height() - a.img.height());
        });
        let maxSize = getMaxSize(imgs);
        drawImagsToAtlasAndSave(maxSize, imgs, `${output}/${name}`);
        return true;
    }

    function getImage(file: string): images.Image {
        return images(file);
    }

    function createImage(w: number, h: number): images.Image {
        return images(w, h);
    }

    function drawImagsToAtlasAndSave(size: { width: number, height: number }, imgs: { name: string, img: images.Image, offset: Vec2 }[], savePath: string) {
        let { width, height } = size;
        let atlas = createImage(width, height);
        let fontSize = 0;
        imgs.forEach(a => {
            let w = a.img.width(),
                h = a.img.height();
            let p = a.offset;
            if (p) {
                atlas.draw(a.img, p.x, p.y);
                let frame = new Frame(a.name);
                frame.setOffset(p.x, p.y);
                frame.setSize(w, h);
                fnt.addFrame(frame);
                if (h > fontSize) fontSize = h;
            }
        });
        atlas.save(savePath + '.png');
        fnt.setSize(width, height);
        fnt.setFontSize(fontSize);
        fs.writeFileSync(savePath + '.fnt', fnt.getContent());
    }

    function getMaxSize(imgs: { name: string, img: images.Image, offset: Vec2 }[]): { width: number, height: number } {
        let all = 0,
            maxW = 0,
            maxH = 0;
        imgs.forEach(img => {
            let { width, height } = img.img.size();
            let b = (width + space) * (height + space);
            all += b;
            maxW = Math.max(maxW, width + space);
            maxH = Math.max(maxH, height + space);
        });
        let c = Math.ceil(Math.sqrt(all));
        let w = Math.max(c, maxW);
        let h = Math.max(c, maxH);
        return getMaxRectSize(imgs, w, h);
    }

    function getMaxRectSize(imgs: { name: string, img: images.Image, offset: Vec2 }[], width: number, height: number): { width: number, height: number } {
        console.log('origin size', width, height);
        let maxRect = new MaxRects(width, height, space);
        let a = true;
        for (let i = 0, n = imgs.length; i < n; i++) {
            let size = imgs[i].img.size();
            let p = maxRect.find(size.width, size.height);
            if (!p) {
                if (size.width <= size.height) {
                    if (width + size.width + space < 2048) width += size.width + space;
                    else {
                        width = 2048;
                        height += size.height + space;
                    }
                } else {
                    if (height + size.height + space < 2048) height += size.height + space;
                    else {
                        height = 2048;
                        width += size.width + space;
                    }
                }
                width = Math.min(width, 2048);
                height = Math.min(height, 2048);
                a = false;
            } else imgs[i].offset = p;
        }
        if (!a && (width < 2048 || height < 2048))
            return getMaxRectSize(imgs, width, height);

        let w = 0, h = 0;
        imgs.forEach(img => {
            let size = img.img.size(),
                offset = img.offset;
            w = Math.max(w, offset.x + size.width);
            h = Math.max(h, offset.y + size.height);
        });
        console.log('getMaxRectSize', w, h);
        return { width: w, height: h };
    }
}