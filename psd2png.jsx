if (!hasFilePath()) {
    alert("File did not save\nPlease save the file and try again");
} else {
    showExportDialog();
}

var usePNG8 = false;
var isFont = false;

function showExportDialog() {
    var dialog = new Window("dialog", "导出");
    var chk = dialog.add('checkbox');
    chk.text = '使用PNG8压缩';
    chk.checked = usePNG8;
    chk.onClick = function () {
        usePNG8 = !usePNG8;
    };
    var chk1 = dialog.add('checkbox');
    chk1.text = '作为BitmapFont';
    chk1.checked = isFont;
    chk1.onClick = function () {
        isFont = !isFont;
    };
    var okBtn = dialog.add('button');
    okBtn.text = '导出为...';
    okBtn.onClick = function () {
        var output = Folder.selectDialog('');
        if (output)
            init(output + '');
        this.parent.close(0);
    };
    var cancelBtn = dialog.add('button');
    cancelBtn.text = '取消';
    cancelBtn.onClick = function () {
        this.parent.close(0);
    };
    dialog.center();
    dialog.show();
}

function init(outPath) {
    app.activeDocument.duplicate();
    app.activeDocument.rasterizeAllLayers();//栅格化
    var layers = [];
    for (var i = 0, l = app.activeDocument.layers.length; i < l; i++) {
        if (app.activeDocument.layers[i].visible) {
            getLayers(app.activeDocument.layers[i], layers);
        }
    }

    var layerCount = layers.length;
    for (var i = layerCount - 1; i >= 0; i--) {
        var layer = layers[i];
        layer.visible = false;
    }
    createPng(outPath + '/', layers)
    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function hasFilePath() {
    var reference = new ActionReference();
    reference.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return executeActionGet(reference).hasKey(stringIDToTypeID("fileReference"));
}

function getLayers(layer, collect) {
    if (!layer.layers || layer.layers.length == 0) {
        collect.push(layer);
        return;
    }
    for (var i = 0, n = layer.layers.length; i < n; i++) {
        getLayers(layer.layers[i], collect);
    }
}

function trim(value) {
    if (isFont)
        return value.charCodeAt(0).toString(10);
    else
        return value.replace(/\s/g, "_")
            // .replace(/\./g, "_-0")
            .replace(/\//g, "_-1")
            .replace(/\\/g, "_-2")
            .replace(/\*/g, "_-3")
            .replace(/\:/g, "_-4")
            .replace(/\?/g, "_-5")
            .replace(/\"/g, "_-6")
            .replace(/\</g, "_-7")
            .replace(/\>/g, "_-8")
            .replace(/\|/g, "_-9");
}

function stepHistoryBack(n) {
    var descriptor = new ActionDescriptor();
    var reference = new ActionReference();
    reference.putEnumerated(charIDToTypeID("HstS"), charIDToTypeID("Ordn"), charIDToTypeID("Prvs"));
    descriptor.putReference(charIDToTypeID("null"), reference);
    for (var i = n; i > 0; i--)
        executeAction(charIDToTypeID("slct"), descriptor, DialogModes.NO);
}

function formatBounds(bounds) {
    var left = Number(bounds[0].as("px").toFixed(0)),
        top = Number(bounds[1].as("px").toFixed(0)),
        right = Number(bounds[2].as("px").toFixed(0)),
        bottom = Number(bounds[3].as("px").toFixed(0)),
        w = Math.floor(right - left),
        h = Math.floor(bottom - top);
    return { 'x': left + w / 2, 'y': top + h / 2, 'w': w, 'h': h };
}

function saveImg(name, dir) {
    var file = File(dir + name + '.png');
    if (file.exists) file.remove();
    var pngSaveOptions = new ExportOptionsSaveForWeb();
    pngSaveOptions.format = SaveDocumentType.PNG;
    pngSaveOptions.transparency = true;
    pngSaveOptions.includeProfile = false;
    pngSaveOptions.interlaced = true;
    pngSaveOptions.PNG8 = !!usePNG8;
    app.activeDocument.saveAs(file, new PNGSaveOptions(), true, Extension.LOWERCASE);
    app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, pngSaveOptions);
}

function createImage(layer, dir) {
    // alert('a');
    var bounds = formatBounds(layer.bounds);
    var doc = app.activeDocument;
    if (!layer.isBackgroundLayer) {
        doc.trim(TrimType.TRANSPARENT, true, true, true, true);
    }
    doc.activeLayer = layer;
    var name = trim(layer.name);
    saveImg(name, dir);
    if (!layer.isBackgroundLayer) {
        if (bounds[2] != 0 && bounds[3] != 0) {
            stepHistoryBack(1);
        }
    }
}

function createPng(dir, layers) {
    try {
        for (var i = layers.length - 1; i >= 0; i--) {
            var layer = layers[i];
            layer.visible = true;
            createImage(layer, dir);
            layer.visible = false;
        }
    } catch (e) {
        alert(e)
    }
}