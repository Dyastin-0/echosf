import { mediaStore } from '$lib/stores/mediaStore';
import { roomInfoStore } from '$lib/stores/roomStore';
import { showToast } from '$lib/stores/toastStore';
import { get } from 'svelte/store';

export class WRTC {
  private pc: RTCPeerConnection;
  public audioTrack: MediaStreamTrack | null;
  public videoTrack: MediaStreamTrack | null;
  public screenStream: MediaStream | null;
  private ws: App.IWebSocketService | null;

  constructor() {
    this.pc = new RTCPeerConnection();
    this.audioTrack = null;
    this.videoTrack = null;
    this.screenStream = null;
    this.ws = null;

    setInterval(() => {
      this.audioStats();
    }, 250);
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

    this.ws?.close();
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

    report.forEach((stats) => {
      if (stats.type === 'media-source' && stats.kind === 'audio') {
        mediaStore.update((state) => {
          const updatedStates = state.audioLevels;

          updatedStates[stats.trackIdentifier] = stats.audioLevel;

          return {
            ...state,
            audioLevels: updatedStates
          };
        });
      }

      if (stats.type === 'inbound-rtp' && stats.kind === 'audio') {
        mediaStore.update((state) => {
          const updatedStates = state.audioLevels;

          updatedStates[stats.trackIdentifier] = stats.audioLevel;

          return {
            ...state,
            audioLevels: updatedStates
          };
        });
      }
    });
  }

  public toggleAudio(): void {
    if (!this.audioTrack) {
      showToast('Audio device missing.', 'info', 3000);
      return;
    }

    this.audioTrack.enabled = !this.audioTrack.enabled;
    const localStream = get(mediaStore).localStream;

    if (localStream) {
      roomInfoStore.update((state) => {
        const updatedStates = state.participants;

        if (!updatedStates) return { ...state };

        updatedStates[get(roomInfoStore)?.userId].audio = this.audioTrack?.enabled
          ? 'enabled'
          : 'disabled';

        return {
          ...state,
          participants: updatedStates
        };
      });
    }

    if (this.ws) {
      this.ws.sendMessage({
        event: 'message',
        type: 'audioToggle',
        audioState: localStream?.getAudioTracks()[0].enabled
      });
    }
  }

  public toggleVideo(): void {
    if (!this.videoTrack) {
      showToast('Video device is missing.', 'info', 3000);
      return;
    }

    this.videoTrack.enabled = !this.videoTrack.enabled;

    roomInfoStore.update((state) => {
      const updatedStates = state.participants;

      if (!updatedStates) return { ...state };

      updatedStates[get(roomInfoStore)?.userId].camera = this.videoTrack?.enabled
        ? 'enabled'
        : 'disabled';

      return {
        ...state,
        participants: updatedStates
      };
    });

    if (this.ws) {
      this.ws.sendMessage({
        event: 'message',
        type: 'cameraToggle',
        videoState: this.videoTrack.enabled
      });
    }
  }

  public async startScreenSharing(): Promise<boolean> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      this.screenStream.getTracks().forEach((track) => {
        track.onended = () => this.stopScreenSharing();
        this.pc.addTrack(track, this.screenStream as MediaStream);
      });

      await this.renegotiate();

      mediaStore.update((state) => {
        const updatedRemoteStreams = state.remoteStreams;

        if (!this.screenStream) return { ...state };

        updatedRemoteStreams[this.screenStream?.id] = this.screenStream;

        return {
          ...state,
          remoteStreams: updatedRemoteStreams
        };
      });

      roomInfoStore.update((state) => {
        const updatedParticipants = state.participants;
        const updatedMapper = state.streamIdMapper;

        const participant = updatedParticipants[get(roomInfoStore).userId];
        updatedParticipants[get(roomInfoStore).userId] = {
          ...participant,
          screen: this?.screenStream?.id || '',
          streams: {
            ...participant.streams,
            [`${this.screenStream?.id}`]: true
          }
        };

        if (this.screenStream) updatedMapper[this.screenStream?.id] = get(roomInfoStore).userId;

        return {
          ...state,
          participants: updatedParticipants,
          streamIdMapper: updatedMapper
        };
      });

      this.ws?.sendMessage({
        event: 'message',
        type: 'stream',
        name: get(roomInfoStore).userName,
        data: this.screenStream.id
      });

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

      roomInfoStore.update((state) => {
        const updatedParticipants = state.participants;

        updatedParticipants[state.userId].screen = 'disabled';

        return {
          ...state,
          updatedParticipants
        };
      });
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
