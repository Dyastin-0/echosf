export function setVideoStream(node: HTMLVideoElement, stream: MediaStream) {
	if (stream) {
		node.srcObject = stream;
	}
	return {
		update(newStream: MediaStream) {
			if (newStream !== node.srcObject) {
				node.srcObject = newStream;
			}
		},
		destroy() {
			node.srcObject = null;
		}
	};
}
