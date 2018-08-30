/**
 * This file will provide a renderer collection and a function for draw shape to canvas
 */

import lineEndCapShapes from './lineEndCapShapes';

let _drawRawLinePath;
let defineCanvasRenderer;// Define and then regist renderer to renderers
let drawErasedLinePath;
let drawErasedLinePathLatest;
let drawLinePath;
let drawLinePathLatest;
let noop;
let renderShapeToCanvas;
let renderShapeToContext;
let renderers;// Renderer collection

renderers = {};

defineCanvasRenderer = (shapeName, drawFunc, drawLatestFunc) => renderers[shapeName] = {
    drawFunc,
    drawLatestFunc
};

noop = ()=>{};

/**
 * func step:
 * 1. Data validation
 * 2. Judge how to draw and then use the draw function draw shape to canvas
 */
renderShapeToContext = (ctx, shape, opts) => {
    let bufferCtx;
    if (opts == null) {
        opts = {};
    }
    if (opts.shouldIgnoreUnsupportedShapes == null) {
        opts.shouldIgnoreUnsupportedShapes = false;
    }
    if (opts.retryCallback == null) {
        opts.retryCallback = noop;
    }
    if (opts.shouldOnlyDrawLatest == null) {
        opts.shouldOnlyDrawLatest = false;
    }
    if (opts.bufferCtx == null) {
        opts.bufferCtx = null;
    }
    bufferCtx = opts.bufferCtx;
    if (renderers[shape.className]) {
        if (opts.shouldOnlyDrawLatest && renderers[shape.className].drawLatestFunc) {
            renderers[shape.className].drawLatestFunc(ctx, bufferCtx, shape, opts.retryCallback);
        } else {
            renderers[shape.className].drawFunc(ctx, shape, opts.retryCallback);
        }
    } else if (opts.shouldIgnoreUnsupportedShapes) {
        console.warn(`Can't render shape of type ${shape.className} to canvas`);
    } else {
        throw `Can't render shape of type ${shape.className} to canvas`;
    }
};

// TODO:wx-mini-program maybe not support get canvas context by canvas.getContext('2d')
renderShapeToCanvas = (canvas, shape, opts) => renderShapeToContext(canvas.getContext('2d'), shape, opts);

defineCanvasRenderer('Rectangle', (ctx, shape) => {
    let x = shape.x;
    let y = shape.y;
    if (shape.strokeWidth % 2 !== 0) {
        x += 0.5;
        y += 0.5;
    }
    ctx.fillStyle = shape.fillColor;
    ctx.fillRect(x, y, shape.width, shape.height);
    ctx.lineWidth = shape.strokeWidth;
    ctx.strokeStyle = shape.strokeColor;
    ctx.strokeRect(x, y, shape.width, shape.height);
    ctx.draw(true);
});

defineCanvasRenderer('Ellipse', (ctx, shape) => {
    ctx.save();
    let halfWidth = Math.floor(shape.width / 2);
    let halfHeight = Math.floor(shape.height / 2);
    let centerX = shape.x + halfWidth;
    let centerY = shape.y + halfHeight;
    ctx.translate(centerX, centerY);
    ctx.scale(1, Math.abs(shape.height / shape.width));
    ctx.beginPath();
    ctx.arc(0, 0, Math.abs(halfWidth), 0, Math.PI * 2);
    ctx.closePath();
    ctx.restore();
    ctx.fillStyle = shape.fillColor;
    ctx.fill();
    ctx.lineWidth = shape.strokeWidth;
    ctx.strokeStyle = shape.strokeColor;
    ctx.stroke();
    ctx.draw(true);
});

defineCanvasRenderer('SelectionBox', ((() => {
    const _drawHandle = (ctx, arg, handleSize) => {
        let x;
        let y;
        x = arg.x, y = arg.y;
        if (handleSize === 0) {
            return;
        }
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, handleSize, handleSize);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, y, handleSize, handleSize);
        ctx.draw(true);
    };
    return (ctx, shape) => {
        _drawHandle(ctx, shape.getTopLeftHandleRect(), shape.handleSize);
        _drawHandle(ctx, shape.getTopRightHandleRect(), shape.handleSize);
        _drawHandle(ctx, shape.getBottomLeftHandleRect(), shape.handleSize);
        _drawHandle(ctx, shape.getBottomRightHandleRect(), shape.handleSize);
        if (shape.backgroundColor) {
            ctx.fillStyle = shape.backgroundColor;
            ctx.fillRect(shape._br.x - shape.margin, shape._br.y - shape.margin, shape._br.width + shape.margin * 2, shape._br.height + shape.margin * 2);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = shape.backgroundColor || '#000';
        ctx.setLineDash([2, 4]);
        ctx.strokeRect(shape._br.x - shape.margin, shape._br.y - shape.margin, shape._br.width + shape.margin * 2, shape._br.height + shape.margin * 2);
        ctx.setLineDash([]);
        ctx.draw(true);
    };
}))());

defineCanvasRenderer('Image', (ctx, shape, retryCallback) => {
    if (shape.image.width) {
        if (shape.scale === 1) {
            ctx.drawImage(shape.image, shape.x, shape.y);
        } else {
            ctx.drawImage(shape.image, shape.x, shape.y, shape.image.width * shape.scale, shape.image.height * shape.scale);
        }
        ctx.draw(true)
    } else if (retryCallback) {
        shape.image.onload = retryCallback;
    }
});

defineCanvasRenderer('Line', (ctx, shape) => {
    if (shape.x1 === shape.x2 && shape.y1 === shape.y2) {
        return;
    }
    let x1 = shape.x1;
    let x2 = shape.x2;
    let y1 = shape.y1;
    let y2 = shape.y2;
    if (shape.strokeWidth % 2 !== 0) {
        x1 += 0.5;
        x2 += 0.5;
        y1 += 0.5;
        y2 += 0.5;
    }
    ctx.lineWidth = shape.strokeWidth;
    ctx.strokeStyle = shape.color;
    ctx.lineCap = shape.capStyle;
    if (shape.dash) {
        ctx.setLineDash(shape.dash);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
	console.log(111, ctx, shape)
    ctx.draw(true);
    if (shape.dash) {
        ctx.setLineDash([]);
    }
    const arrowWidth = Math.max(shape.strokeWidth * 2.2, 5);
    if (shape.endCapShapes[0]) {
        lineEndCapShapes[shape.endCapShapes[0]].drawToCanvas(ctx, x1, y1, Math.atan2(y1 - y2, x1 - x2), arrowWidth, shape.color);
    }
    if (shape.endCapShapes[1]) {
        lineEndCapShapes[shape.endCapShapes[1]].drawToCanvas(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), arrowWidth, shape.color);
    }
});

_drawRawLinePath = (ctx, points, close, lineCap) => {
    let i;
    let len;
    let point;
    let ref;
    if (close == null) {
        close = false;
    }
    if (lineCap == null) {
        lineCap = 'round';
    }
    if (!points.length) {
        return;
    }
    ctx.lineCap = lineCap;
    ctx.strokeStyle = points[0].color;
    ctx.lineWidth = points[0].size;
    ctx.beginPath();
    if (points[0].size % 2 === 0) {
        ctx.moveTo(points[0].x, points[0].y);
    } else {
        ctx.moveTo(points[0].x + 0.5, points[0].y + 0.5);
    }
    ref = points.slice(1);
    for (i = 0, len = ref.length; i < len; i++) {
        point = ref[i];
        if (points[0].size % 2 === 0) {
            ctx.lineTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x + 0.5, point.y + 0.5);
        }
    }
    if (close) {
        ctx.closePath();
    }
};

drawLinePath = (ctx, shape) => {
    _drawRawLinePath(ctx, shape.smoothedPoints);
    ctx.stroke();
    ctx.draw(true)
};

drawLinePathLatest = (ctx, bufferCtx, shape) => {
    if (shape.tail) {
        const segmentStart = shape.smoothedPoints.length - shape.segmentSize * shape.tailSize;
        const drawStart = segmentStart < shape.segmentSize * 2 ? 0 : segmentStart;
        const drawEnd = segmentStart + shape.segmentSize + 1;
        _drawRawLinePath(bufferCtx, shape.smoothedPoints.slice(drawStart, drawEnd));
    } else {
        _drawRawLinePath(bufferCtx, shape.smoothedPoints);
    }
    bufferCtx.stroke();
    bufferCtx.draw(true);
};

defineCanvasRenderer('LinePath', drawLinePath, drawLinePathLatest);

drawErasedLinePath = (ctx, shape) => {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    drawLinePath(ctx, shape);
    ctx.restore();
};

drawErasedLinePathLatest = (ctx, bufferCtx, shape) => {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    bufferCtx.save();
    bufferCtx.globalCompositeOperation = "destination-out";
    drawLinePathLatest(ctx, bufferCtx, shape);
    ctx.restore();
    bufferCtx.restore();
};

defineCanvasRenderer('ErasedLinePath', drawErasedLinePath, drawErasedLinePathLatest);

defineCanvasRenderer('Text', (ctx, shape) => {
    if (!shape.renderer) {
        shape._makeRenderer(ctx);
    }
    ctx.fillStyle = shape.color;
    shape.renderer.draw(ctx, shape.x, shape.y);
});

defineCanvasRenderer('Polygon', (ctx, shape) => {
    ctx.fillStyle = shape.fillColor;
    _drawRawLinePath(ctx, shape.points, shape.isClosed, 'butt');
    ctx.fill();
    ctx.stroke();
    ctx.draw(true);
});

export default {
    defineCanvasRenderer,
    // renderShapeToCanvas, // wx-mini-program can't get canvas element
    renderShapeToContext
}