export class Frame {
    private _offset: { x: number, y: number } = { x: 0, y: 0 };
    private _size: { w: number, h: number } = { w: 0, h: 0 };
    private _code: string = '';

    constructor(name?: string) {
        this.setName(name);
    }

    public setName(name = '') {
        this._code = name.charCodeAt(0).toString(10);
    }

    public setOffset(x: number, y: number) {
        this._offset.x = x;
        this._offset.y = y;
    }

    public setSize(w: number, h: number) {
        this._size.w = w;
        this._size.h = h;
    }

    public getDictContent(): string {
        return `char id=${this._code}   x=${this._offset.x}   y=${this._offset.y}    width=${this._size.w}    height=${this._size.h}    xoffset=0     yoffset=0     xadvance=${this._size.w}    page=0  chnl=15
`;
    }
}

export class Fnt {
    private _frames: Frame[] = [];
    private _name: string = '';
    private _size: { w: number, h: number } = { w: 0, h: 0 };
    private _fontSize: number = 32;

    constructor(name: string) {
        this._name = name;
    }

    public setSize(w: number, h: number) {
        this._size = { w: w, h: h };
    }

    public setFontSize(n: number): void {
        this._fontSize = n;
    }
    

    public addFrame(frame: Frame) {
        this._frames[this._frames.length] = frame;
    }

    public getContent(): string {
        let framesContent = '';
        this._frames.forEach(frame => {
            framesContent += frame.getDictContent();
        });
       return `info face="黑体" size=${this._fontSize} bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1 outline=0
common lineHeight=${this._fontSize + 2} base=28 scaleW=${this._size.w} scaleH=${this._size.h} pages=1 packed=0 alphaChnl=1 redChnl=0 greenChnl=0 blueChnl=0
page id=0 file="${this._name}.png"
chars count=${this._frames.length}
${framesContent}`;
    }
}