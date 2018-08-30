import canvasRenderer from './canvasRenderer'

class LiterallyCanvas {

	constructor(canvasID='main', options={}){
		this.context = wx.createCanvasContext(canvasID)
		this.opts = options
	}

	draw(shape, opt={}){
		canvasRenderer.renderShapeToContext(this.context,shape, opt)
	}

}

export default LiterallyCanvas