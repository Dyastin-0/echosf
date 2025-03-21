import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { roomInfoStore } from '$lib/stores/roomStore';
import { resetRoomState } from '$lib/stores/reset';
import { flowStep } from '$lib/stores/flowStore';

export async function navigateToRoom(roomId: string) {
	await goto(`/${roomId}`);
	document.title = `echos - ${roomId}`;
}

export function updateRoomInfo(roomId: string, name: string, id: string) {
	roomInfoStore.update((state) => ({
		...state,
		joined: true,
		id: roomId,
		userName: name,
		userId: id
	}));

	roomInfoStore.update((state) => {
		const updatedParticipants = state.participants;
		if (!updatedParticipants) return { ...state };

		const roomInfo = get(roomInfoStore);
		const participant = updatedParticipants[roomInfo.userId];

		updatedParticipants[roomInfo.userId] = {
			...participant,
			name: roomInfo.userName
		};

		return {
			...state,
			participants: updatedParticipants
		};
	});
}

export function leaveRoom(webrtcReset: () => void) {
	document.title = 'echos';
	webrtcReset();
	resetRoomState();
	flowStep.set('create');
}
