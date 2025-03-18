import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';

import { newWRTC, WRTC } from '$lib/services/webrtc';
import { newWS, WS } from '$lib/services/websocket';
import {
	getAvailableMedia,
	handleNoMediaAvailable,
	updateMediaStoreWithLocalStream,
	updateParticipantMediaState,
	addLocalTracksToWebRTC
} from '$lib/services/media';
import { navigateToRoom, updateRoomInfo, leaveRoom } from '$lib/services/room';
import { setupWebRTCCallbacks } from '$lib/services/callback';
import { sendChatMessage as sendMessage } from '$lib/services/message';
import { get } from 'svelte/store';
import { roomInfoStore } from '$lib/stores/roomStore';

export function useWRTC() {
	let webrtc: WRTC;
	let websocket: WS;

	async function initMedia() {
		webrtc = newWRTC();
		const stream = await getAvailableMedia();

		if (!stream) {
			handleNoMediaAvailable();
			return;
		}

		updateMediaStoreWithLocalStream(stream);
		updateParticipantMediaState(stream);
		webrtc.setLocalTracks(stream);
	}

	async function joinRoom(roomId: string, name: string, id: string) {
		await navigateToRoom(roomId);

		websocket = newWS(`${PUBLIC_WEBSOCKET_URL}?room=${roomId}&id=${id}`, webrtc);
		setupWebRTCCallbacks(webrtc, websocket, id);

		updateRoomInfo(roomId, name, id);

		webrtc.setWebsocketService(websocket);
		addLocalTracksToWebRTC(webrtc);
	}

	function exitRoom() {
		leaveRoom(websocket, () => webrtc.reset());
	}

	function sendChatMessage(message: string) {
		sendMessage(message, websocket);
	}

	function toggleMute() {
		webrtc.toggleAudio();
	}

	function toggleCamera() {
		webrtc.toggleVideo();
	}

	async function toggleScreenShare() {
		const roomInfo = get(roomInfoStore);
		if (!roomInfo.joined) return;

		const isCurrentlySharing = webrtc.screenStream;

		if (!isCurrentlySharing) {
			await webrtc.startScreenSharing(() => {
				webrtc.stopScreenSharing();
			});
		} else {
			webrtc.stopScreenSharing();
		}
	}

	return {
		initMedia,
		joinRoom,
		leaveRoom: exitRoom,
		sendChatMessage,
		toggleCamera,
		toggleMute,
		toggleScreenShare,
		getWebRTC: () => webrtc,
		getWebSocket: () => websocket
	};
}
