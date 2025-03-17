export class WS {
	private ws: WebSocket;
	private webrtcService: App.IWRTCService;
	private chatMessageCallback: ((msg: App.WebsocketMessage) => void) | null;
	private onOpenCallback: (() => void) | null;

	constructor(url: string | URL, webrtcService: App.IWRTCService) {
		this.ws = new WebSocket(url);
		this.webrtcService = webrtcService;
		this.chatMessageCallback = (msg: App.WebsocketMessage) => {};
		this.onOpenCallback = () => {};

		this.ws.onopen = () => {
			if (this.onOpenCallback) {
				this.onOpenCallback();
			}
		};

		this.ws.onerror = (e: Event) => {
			console.error(e);
		};

		this.ws.onmessage = (event: MessageEvent) => {
			let msg: App.WebsocketMessage;
			try {
				msg = JSON.parse(event.data);
			} catch (error) {
				console.log('Failed to parse msg');
				return;
			}
			if (!msg) {
				console.log('Failed to parse msg');
				return;
			}

			switch (msg.event) {
				case 'offer': {
					let offer: RTCSessionDescriptionInit;
					try {
						offer = JSON.parse(msg.data);
					} catch (error) {
						console.log('Failed to parse offer');
						return;
					}
					this.webrtcService.setRemoteDescription(offer);
					this.webrtcService.createAnswer().then((answer: RTCSessionDescriptionInit) => {
						this.webrtcService.setLocalDescription(answer);
						this.ws.send(JSON.stringify({ event: 'answer', data: JSON.stringify(answer) }));
					});
					break;
				}
				case 'candidate': {
					let candidate: RTCIceCandidateInit;
					try {
						candidate = JSON.parse(msg.data);
					} catch (error) {
						console.log('Failed to parse candidate');
						return;
					}
					this.webrtcService.addIceCandidate(candidate);
					break;
				}
				case 'message': {
					if (this.chatMessageCallback) {
						this.chatMessageCallback(msg);
					}
					break;
				}
				default:
					console.warn('Unhandled event:', msg);
			}
		};

		this.webrtcService.setOnIceCandidateCallback(
			(e: { candidate: RTCStatsIceCandidatePairState }) => {
				if (e.candidate) {
					this.ws.send(
						JSON.stringify({
							event: 'candidate',
							data: JSON.stringify(e.candidate)
						})
					);
				}
			}
		);
	}

	public getConnection(): WebSocket {
		return this.ws;
	}

	public close(): void {
		this.ws.close();
		this.chatMessageCallback = null;
	}

	public sendMessage(message: any): void {
		this.ws.send(JSON.stringify(message));
	}

	public setChatMessageCallback(callback: (msg: any) => void): void {
		this.chatMessageCallback = callback;
	}

	public setOnOpenCallback(callback: () => void): void {
		this.onOpenCallback = callback;
	}
}

export const newWS = (url: string | URL, webrtcService: App.IWRTCService): WS => {
	return new WS(url, webrtcService);
};
