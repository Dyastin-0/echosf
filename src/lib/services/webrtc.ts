export class WRTC {
	private pc: RTCPeerConnection;
	private audioTrack: MediaStreamTrack | null;
	private videoTrack: MediaStreamTrack | null;
	private screenStream: MediaStream | null;
	private ws: App.IWebSocketService | null;
	public mediaState: App.MediaState;

	constructor() {
		this.pc = new RTCPeerConnection();
		this.audioTrack = null;
		this.videoTrack = null;
		this.screenStream = null;
		this.ws = null;
		this.mediaState = {
			isMuted: false,
			isCameraOn: true,
			isScreenSharing: false
		};
	}

	public getPeerConnection(): RTCPeerConnection {
		return this.pc;
	}

	public setLocalTracks(stream: MediaStream): void {
		this.audioTrack = stream.getAudioTracks()[0] || null;
		this.videoTrack = stream.getVideoTracks()[0] || null;
	}

	public addTrack(track: MediaStreamTrack, stream: MediaStream): void {
		this.pc.addTrack(track, stream);
	}

	public toggleAudio(): void {
		if (this.audioTrack) {
			this.audioTrack.enabled = !this.audioTrack.enabled;
		}
	}

	public toggleVideo(): void {
		if (this.videoTrack) {
			this.videoTrack.enabled = !this.videoTrack.enabled;
		}
	}

	public async startScreenSharing(stopScreenSharing: () => void): Promise<boolean> {
		try {
			this.screenStream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
				audio: true
			});
			this.screenStream.getTracks().forEach((track) => {
				track.onended = () => stopScreenSharing();
				this.pc.addTrack(track, this.screenStream as MediaStream);
			});
			await this.renegotiate();
			return true;
		} catch (error) {
			console.error('Error starting screen share:', error);
			return false;
		}
	}

	public stopScreenSharing(): void {
		if (this.screenStream) {
			this.screenStream.getTracks().forEach((track) => {
				track.stop();
				const sender = this.pc.getSenders().find((s) => s.track === track);
				if (sender) {
					this.pc.removeTrack(sender);
				}
			});
			this.renegotiate();
			this.screenStream = null;
		}
	}

	public async renegotiate(): Promise<void> {
		try {
			const offer = await this.pc.createOffer();
			await this.pc.setLocalDescription(offer);
			if (this.ws) {
				this.ws.sendMessage({
					event: 'renegotiate',
					data: JSON.stringify(offer)
				});
			}
		} catch (error) {
			console.error('Renegotiation failed:', error);
		}
	}

	public setWebsocketService(websocket: App.IWebSocketService): void {
		this.ws = websocket;
	}

	public setOnTrackCallback(
		callback: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null
	): void {
		this.pc.ontrack = callback;
	}

	public setOnIceCandidateCallback(
		callback: ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null
	): void {
		this.pc.onicecandidate = callback;
	}

	public setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void> {
		return this.pc.setRemoteDescription(desc);
	}

	public createAnswer(): Promise<RTCSessionDescriptionInit> {
		return this.pc.createAnswer();
	}

	public setLocalDescription(desc: RTCLocalSessionDescriptionInit | undefined): Promise<void> {
		return this.pc.setLocalDescription(desc);
	}

	public addIceCandidate(candidate: RTCIceCandidateInit | null | undefined): Promise<void> {
		return this.pc.addIceCandidate(candidate);
	}
}

export const newWRTC = (): WRTC => {
	return new WRTC();
};
