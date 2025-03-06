// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		export interface IWRTCService {
			setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void>;
			createAnswer(): Promise<RTCSessionDescriptionInit>;
			setLocalDescription(desc: RTCLocalSessionDescriptionInit | undefined): Promise<void>;
			addIceCandidate(candidate: RTCIceCandidateInit | null | undefined): Promise<void>;
			setOnIceCandidateCallback(callback: (e: { candidate: any }) => void): void;
		}
		export interface IWebSocketService {
			sendMessage(message: { event: string; data: string }): void;
		}
		export interface MediaState {
			isMuted: boolean;
			isCameraOn: boolean;
			isScreenSharing: boolean;
		}
		export interface RemoteVideo {
			id: string;
			stream: MediaStream;
			kind: string;
		}
		export interface WebsocketMessage {
			id: string | null;
			name: string | null;
			event: string;
			data: string;
		}
	}
}

export {};
