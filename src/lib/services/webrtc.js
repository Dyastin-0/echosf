class WRTC {
  constructor() {
    this.pc = new RTCPeerConnection();
    this.audioTrack = null;
    this.videoTrack = null;
    this.screenStream = null;
    this.ws = null;
  }

  getPeerConnection() {
	return this.pc;
  }

  setLocalTracks(stream) {
    this.audioTrack = stream.getAudioTracks()[0];
    this.videoTrack = stream.getVideoTracks()[0];
  }

  addTrack(track, stream) {
    this.pc.addTrack(track, stream);
  }

  toggleAudio() {
    if (this.audioTrack) {
      this.audioTrack.enabled = !this.audioTrack.enabled;
    }
  }

  toggleVideo() {
    if (this.videoTrack) {
      this.videoTrack.enabled = !this.videoTrack.enabled;
    }
  }

  async startScreenSharing() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      this.screenStream.getTracks().forEach(track => this.pc.addTrack(track, this.screenStream));
      return true;
    } catch (error) {
      console.error("Error starting screen share:", error);
      return false;
    }
  }

  stopScreenSharing() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => {
        track.stop();
        const sender = this.pc.getSenders().find(s => s.track === track);
        if (sender) {
          this.pc.removeTrack(sender);
        }
      });
      this.screenStream = null;
    }
  }

  async renegotiate() {
    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      if (this.ws) {
        this.ws.sendMessage({ event: "renegotiate", data: JSON.stringify(offer) });
      }
    } catch (error) {
      console.error("Renegotiation failed:", error);
    }
  }

  setWebsocketService(websocket) {
    this.ws = websocket;
  }

  setOnTrackCallback(callback) {
    this.pc.ontrack = callback;
  }

  setOnIceCandidateCallback(callback) {
    this.pc.onicecandidate = callback;
  }

  setRemoteDescription(desc) {
    return this.pc.setRemoteDescription(desc);
  }

  createAnswer() {
    return this.pc.createAnswer();
  }

  setLocalDescription(desc) {
    return this.pc.setLocalDescription(desc);
  }

  addIceCandidate(candidate) {
    return this.pc.addIceCandidate(candidate);
  }
}

export const newWRTC = () => {
  return new WRTC();
}