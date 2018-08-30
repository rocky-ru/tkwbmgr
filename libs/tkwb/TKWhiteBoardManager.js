import LC from './LC/index.js'

class TKWhiteBoardManager {
	constructor(room) {
		/**
		 * room相关设置
		 */
		this.room = room;
		// 监听的事件列表
		this.listenedEventList = [
			'room-receiveActionCommand',
			'room-pubmsg',
			'room-delmsg',
			'room-connected',
			'room-disconnected',
			'room-msglist',
			'room-usermediastate-changed',
			'room-userfilestate-changed',
			'room-usermediaattributes-update',
			'room-userfileattributes-update',
			'room-error-notice',
		]
		this.backupid = new Date().getTime() + '_' + Math.random();
		this._batchListen(this.listenedEventList)

		// 白板相关
		this.lc = new LC()
	}

	_batchListen(eventList) {
		if (!Array.isArray(eventList)) return

		eventList.forEach((eventType, index) => {
			this._listen(eventType)
		})
	}

	_listen(eventType) {
		if (typeof eventType !== 'string') return
		const eventHandlerKey = this._getEventKey(eventType)

		this.room.addEventListener(eventType,
			this[eventHandlerKey] && this[eventHandlerKey].bind(this) || this._handlerEvent.bind(this),
			this.backupid)
	}

	_getEventKey(eventType) {
		let strArr = eventType.split('-')
		new RegExp('room').test(strArr[0]) && strArr.shift()
		return strArr.reduce((t, cv, ci, arr) => {
			return `${t}${cv.replace(cv[0], cv[0].toUpperCase())}`
		}, '_handler');
	}

	_handlerEvent(e) {
		console.error(e)
	}

	_handlerConnected() {
	}

	_handlerPubmsg(e) {
		const { message } = e,
			{ data: drawData } = message.data

		Object.assign(drawData, drawData.data)
		
		switch (message.name) {
			case 'SharpsChange':
				this.lc.draw(drawData)
				break;

			default:
				break;
		}
	}

}

export default TKWhiteBoardManager