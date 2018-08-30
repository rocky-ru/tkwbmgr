//index.js
//获取应用实例
import TKWhiteBoardManager from '../../libs/tkwb/TKWhiteBoardManager'

const app = getApp(),
		  {TK} = app.globalData,
		  roomOptions = {
				autoSubscribeAV: false   //是否自动订阅音视频 , 如果为true则订阅过程中会接收服务器的音视频数据,否则不接收服务器音视频数据,只有调用playStream才会取服务器的相关音视频数据 , 默认为true
		  },
		  room = TK.Room(roomOptions);
		  

Page({
  data: {},
  onLoad: function () {
	  // 房间初始化并设置显示开发日志
		room.init('82AUScqguvqXzhUh')
		room.setLogIsDebug(true)
		room.joinroom('demo.talk-cloud.net', 443, `${Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1)}_${new Date().getTime()}`, undefined, { serial: "2139056258", password: "" })
	  	const WBMgr = new TKWhiteBoardManager(room)
		const shape = {
			"className": 'Line',
			"x1": 64,
			"y1": 38,
			"x2": 64,
			"y2": 85,
			"strokeWidth": 10,
			"color": "#000000",
			"capStyle": "round",
			"dash": null,
			"endCapShapes": [
				null,
				null
			]
		} 
		// WBMgr.lc.draw(shape)
		// 试验canvas是否可用
		// {
		//   let ctx = wx.createCanvasContext('main')
		//   ctx.lineWidth = 5;
		//   ctx.strokeStyle = 'red';
		//   ctx.beginPath();
		//   ctx.moveTo(0, 0);
		//   ctx.lineTo(50, 50);
		//   ctx.stroke();
		//   console.log(111)
		//   ctx.draw(true);
		// }
  },
  test: function(){}
})
