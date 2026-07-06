export function setVideoStream(
  node: HTMLVideoElement,
  stream: MediaStream | null,
) {
  if (stream) {
    node.srcObject = stream;
    node.play().catch((err) => console.warn("Video play failed/blocked:", err));
  }
  return {
    update(newStream: MediaStream | null) {
      if (newStream) {
        if (node.srcObject !== newStream) {
          node.srcObject = newStream;
        }
        node
          .play()
          .catch((err) => console.warn("Video play failed/blocked:", err));
      } else {
        node.srcObject = null;
      }
    },
    destroy() {
      node.srcObject = null;
    },
  };
}
