import { get } from 'svelte/store';
import { showToast } from '$lib/stores/toastStore';
import { roomInfoStore } from '$lib/stores/roomStore';
import { messagesStore } from '$lib/stores/messagesStore';
import { mediaStore } from '$lib/stores/mediaStore';
import type { WS } from './websocket';
import type { WRTC } from './webrtc';

export function handleParticipantDisconnect(msg: App.WebsocketMessage) {
  roomInfoStore.update((state) => {
    const updatedParticipants = state.participants;

    if (msg?.target) {
      showToast(
        `${updatedParticipants[msg.target].name} left the room 🤷‍♀️`,
        'info',
        3000
      );
      delete updatedParticipants[msg.target];
    }

    return {
      ...state,
      updatedParticipants
    };
  });
}

export function handleParticipantStatusMessage(msg: App.WebsocketMessage) {
  showToast(`${msg.name} ${msg.data}`, 'info');
  messagesStore.update((messages) => [...messages, msg]);
}

export function handleStreamMessage(msg: App.WebsocketMessage) {
  const { streamId, name, id } = msg;
  if (!id || !name) return;

  roomInfoStore.update((state) => {
    const updatedParticipants = state.participants;
    updatedParticipants[id] = {
      ...updatedParticipants[id],
      screen: streamId,
      streams: {
        ...updatedParticipants[id].streams,
        [`${streamId}`]: true
      }
    };

    const updatedMapper = state.streamIdMapper;
    updatedMapper[streamId] = id;

    return {
      ...state,
      participants: updatedParticipants,
      streamIdMapper: updatedMapper
    };
  });
}

export function handleAudioToggleMessage(msg: App.WebsocketMessage) {
  roomInfoStore.update((state) => {
    const { audioState, id } = msg;
    const updatedStates = state.participants;

    if (!id) return { ...state };

    updatedStates[id] = {
      ...updatedStates[id],
      audio: audioState ? 'enabled' : 'disabled'
    };

    return {
      ...state,
      participants: updatedStates
    };
  });
}

export function handleCameraToggleMessage(msg: App.WebsocketMessage) {
  roomInfoStore.update((state) => {
    const { videoState, id } = msg;
    const updatedStates = state.participants;

    if (!id) return { ...state };

    updatedStates[id] = {
      ...updatedStates[id],
      camera: videoState ? 'enabled' : 'disabled'
    };

    return {
      ...state,
      participants: updatedStates
    };
  });
}

export function handleInitialStatesMessage(msg: App.WebsocketMessage) {
  const { streamId, audioState, videoState, name, target } = msg;

  roomInfoStore.update((state) => {
    const updatedParticipants = state.participants;
    const updatedMapper = state.streamIdMapper;

    if (!target || !name) return { ...state };

    if (streamId) {
      updatedParticipants[target] = {
        ...updatedParticipants[target],
        camera: videoState ? 'enabled' : 'disabled',
        audio: audioState ? 'enabled' : 'disabled',
        name,
        streams: {
          [`${streamId}`]: true
        }
      };

      updatedMapper[streamId] = target;
    } else {
      updatedParticipants[target] = {
        ...updatedParticipants[target],
        camera: videoState ? 'enabled' : 'disabled',
        audio: audioState ? 'enabled' : 'disabled',
        name
      };
    }

    return {
      ...state,
      streamIdMapper: updatedMapper,
      participants: updatedParticipants
    };
  });
}

export function handleStateRequestMessage(
  msg: App.WebsocketMessage,
  websocket: WS,
  webrtc: WRTC
) {
  websocket.sendMessage({
    event: 'message',
    type: 'stateAnswer',
    streamId: get(mediaStore).localStream?.id,
    screenStreamId: webrtc.screenStream?.id,
    target: msg.target,
    audioState: get(mediaStore).localStream
      ?.getAudioTracks()[0]
      .enabled,
    videoState: get(mediaStore).localStream
      ?.getVideoTracks()[0]
      .enabled
  });
}

export function handleStateAnswerMessage(msg: App.WebsocketMessage) {
  if (msg?.target !== get(roomInfoStore).userId) return;

  const {
    id,
    streamId,
    screenStreamId,
    audioState,
    videoState,
    name
  } = msg;

  roomInfoStore.update((state) => {
    const updatedStates = state.participants;

    if (!id || !name) return { ...state };

    if (streamId) {
      updatedStates[id] = {
        camera: videoState ? 'enabled' : 'disabled',
        audio: audioState ? 'enabled' : 'disabled',
        screen: screenStreamId,
        name,
        streams: {
          [`${streamId}`]: true
        }
      };
    } else {
      updatedStates[id] = {
        ...updatedStates[id],
        camera: videoState ? 'enabled' : 'disabled',
        audio: audioState ? 'enabled' : 'disabled',
        screen: screenStreamId,
        name
      };
    }

    if (screenStreamId) {
      updatedStates[id] = {
        ...updatedStates[id],
        streams: {
          ...updatedStates[id].streams,
          [`${screenStreamId}`]: true
        }
      };
    }

    return {
      ...state,
      participants: updatedStates
    };
  });
}

export function sendChatMessage(message: string, websocket: WS) {
  const roomInfo = get(roomInfoStore);

  messagesStore.update((state) => [
    ...state,
    {
      event: 'message',
      data: message,
      name: roomInfo.userName,
      id: roomInfo.userId
    }
  ]);

  websocket.sendMessage({
    event: 'message',
    data: message
  });
}
