import { get } from 'svelte/store';
import { mediaStore } from '$lib/stores/mediaStore';
import { roomInfoStore } from '$lib/stores/roomStore';
import { messagesStore } from '$lib/stores/messagesStore';
import { handleStreamRemoval } from './media';
import {
  handleParticipantStatusMessage,
  handleStreamMessage,
  handleAudioToggleMessage,
  handleCameraToggleMessage,
  handleInitialStatesMessage,
  handleStateRequestMessage,
  handleStateAnswerMessage,
  handleParticipantDisconnect
} from './message';
import type { WRTC } from './webrtc';
import type { WS } from './websocket';

export function setupWebRTCCallbacks(
  webrtc: WRTC,
  websocket: WS,
  id: string | null
) {
  webrtc.setOnTrackCallback((event: RTCTrackEvent) => handleTrackEvent(event));
  websocket.setOnOpenCallback(() => handleWebSocketOpen(websocket));
  websocket.setChatMessageCallback((message) =>
    handleWebSocketMessage(message, id, websocket, webrtc)
  );
}

export function handleTrackEvent(event: RTCTrackEvent) {
  mediaStore.update((state) => {
    const stream = event.streams[0];
    const updatedRemoteStreams = state.remoteStreams;
    updatedRemoteStreams[`${stream.id}`] = stream;

    stream.onremovetrack = (removeEvent) => {
      if (removeEvent.track.id === event.track.id) {
        handleStreamRemoval(stream);
      }
    };

    return {
      ...state,
      remoteStreams: updatedRemoteStreams
    };
  });
}

export function handleWebSocketOpen(websocket: WS) {
  const roomInfo = get(roomInfoStore);
  const localStream = get(mediaStore).localStream;

  websocket.sendMessage({
    id: roomInfo.userId,
    event: 'message',
    data: 'Joined the room 👋',
    type: 'join'
  });

  websocket.sendMessage({
    event: 'message',
    type: 'initialStates',
    audioState: localStream?.getAudioTracks()[0]?.enabled,
    videoState: localStream?.getVideoTracks()[0]?.enabled,
    target: roomInfo.userId,
    name: roomInfo.userName,
    streamId: localStream?.id
  });

  websocket.sendMessage({
    event: 'message',
    type: 'stateRequest',
    target: roomInfo.userId
  });
}

export function handleWebSocketMessage(
  msg: App.WebsocketMessage,
  currentUserId: string | null,
  websocket: WS,
  webrtc: WRTC
) {
  if (msg.id === currentUserId) return;

  if (msg?.type) {
    switch (msg.type) {
      case 'join':
        handleParticipantStatusMessage(msg);
        break;

      case 'disconnect':
        handleParticipantDisconnect(msg);
        break;

      case 'stream':
        handleStreamMessage(msg);
        break;

      case 'audioToggle':
        handleAudioToggleMessage(msg);
        break;

      case 'cameraToggle':
        handleCameraToggleMessage(msg);
        break;

      case 'initialStates':
        handleInitialStatesMessage(msg);
        break;

      case 'stateRequest':
        handleStateRequestMessage(msg, websocket, webrtc);
        break;

      case 'stateAnswer':
        handleStateAnswerMessage(msg);
        break;

      default:
        break;
    }
    return;
  }

  messagesStore.update((messages) => [...messages, msg]);
}
