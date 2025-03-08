import { mediaStore } from '$lib/stores/mediaStore';
import { get } from 'svelte/store';

export class WRTC {
	private pc: RTCPeerConnection;
	private audioTrack: MediaStreamTrack | null;
	private videoTrack: MediaStreamTrack | null;
	private screenStream: MediaStream | null;
	private ws: App.IWebSocketService | null;

	constructor() {
		this.pc = new RTCPeerConnection();
		this.audioTrack = null;
		this.videoTrack = null;
		this.screenStream = null;
		this.ws = null;

		setInterval(() => {
			this.audioStats();
		}, 500);
	}

	public getPeerConnection(): RTCPeerConnection {
		return this.pc;
	}

	public close(): void {
		const senders = this.pc.getSenders();
		senders.forEach((sender) => {
			if (sender.track) {
				sender.track.stop();
				this.pc.removeTrack(sender);
			}
		});

		this.pc.close();

		this.audioTrack = null;
		this.videoTrack = null;

		if (this.screenStream) {
			this.screenStream.getTracks().forEach((track) => track.stop());
			this.screenStream = null;
		}

		this.ws = null;

		this.setOnTrackCallback(null);
		this.setOnIceCandidateCallback(null);
	}

	public reset(): void {
		this.close();
		this.pc = new RTCPeerConnection();
	}

	public setLocalTracks(stream: MediaStream | null): void {
		if (!stream) return;
		this.audioTrack = stream.getAudioTracks()[0] || null;
		this.videoTrack = stream.getVideoTracks()[0] || null;
	}

	public addTrack(track: MediaStreamTrack, stream: MediaStream | null): void {
		if (!stream) return;
		this.pc.addTrack(track, stream);
	}

	public async audioStats(): Promise<void> {
		const report = await this.pc.getStats();

		report.forEach((stats, id) => {
			if (stats.type === 'media-source' && stats.kind === 'audio') {
				mediaStore.update((state) => {
					const updatedStates = { ...state.remoteStreamStates };

					if (!updatedStates[stats.trackIdentifier]) {
						updatedStates[stats.trackIdentifier] = { audioLevel: 0 };
					}

					updatedStates[stats.trackIdentifier].audioLevel = stats.audioLevel;

					return {
						...state,
						remoteStreamStates: updatedStates
					};
				});
			}

			if (stats.type === 'inbound-rtp' && stats.kind === 'audio') {
				mediaStore.update((state) => {
					const updatedStates = { ...state.remoteStreamStates };

					if (!updatedStates[stats.trackIdentifier]) {
						updatedStates[stats.trackIdentifier] = { audioLevel: 0 };
					}

					updatedStates[stats.trackIdentifier].audioLevel = stats.audioLevel;

					return {
						...state,
						remoteStreamStates: updatedStates
					};
				});
			}
		});
	}

	public toggleAudio(): void {
		if (this.audioTrack) {
			this.audioTrack.enabled = !this.audioTrack.enabled;

			const localStream = get(mediaStore).localStream;

			if (localStream) {
				mediaStore.update((state) => {
					const updatedStates = { ...state.remoteStreamStates };

					if (!updatedStates[localStream.id]) {
						updatedStates[localStream.id] = { audio: 'unknown', video: 'unknown' };
					}

					updatedStates[localStream.id].audio = this.audioTrack?.enabled ? 'enabled' : 'disabled';

					return {
						...state,
						remoteStreamStates: updatedStates
					};
				});
			}

			if (this.ws) {
				this.ws.sendMessage({
					event: 'message',
					type: 'audioToggle',
					data: localStream?.id,
					state: localStream?.getAudioTracks()[0].enabled
				});
			}
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
