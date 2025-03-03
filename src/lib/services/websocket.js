class WS {
  constructor(url, webrtcService) {
    this.ws = new WebSocket(url);
    this.webrtcService = webrtcService;
    this.chatMessageCallback = null;

    this.ws.onclose = () => {
      alert("WebSocket closed");
    };

    this.ws.onerror = (e) => {
      console.error(e);
    };

    this.ws.onmessage = (event) => {
      let msg = JSON.parse(event.data);
      if (!msg) return console.log("Failed to parse msg");

      switch (msg.event) {
        case "offer":
          let offer = JSON.parse(msg.data);
          if (!offer) return console.log("Failed to parse offer");
          this.webrtcService.setRemoteDescription(offer);
          this.webrtcService.createAnswer().then((answer) => {
            this.webrtcService.setLocalDescription(answer);
            this.ws.send(
              JSON.stringify({ event: "answer", data: JSON.stringify(answer) })
            );
          });
          break;

        case "candidate":
          let candidate = JSON.parse(msg.data);
          if (!candidate) return console.log("Failed to parse candidate");
          this.webrtcService.addIceCandidate(candidate);
          break;

        case "message":
          if (this.chatMessageCallback) {
            this.chatMessageCallback(msg);
          }
          break;
      }
    };

    this.webrtcService.setOnIceCandidateCallback((e) => {
      if (e.candidate) {
        this.ws.send(
          JSON.stringify({
            event: "candidate",
            data: JSON.stringify(e.candidate),
          })
        );
      }
    });
  }

  sendMessage(message) {
    this.ws.send(JSON.stringify(message));
  }

  setChatMessageCallback(callback) {
    this.chatMessageCallback = callback;
  }
}

export const newWS = (url, webrtcService) => {
  return new WS(url, webrtcService);
}