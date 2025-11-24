type WebRtcInitOptions = {
  onRemoteStream?: (stream: MediaStream) => void;
  iceServers?: RTCIceServer[];
};

export const createPeerConnection = ({
  onRemoteStream,
  iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]
}: WebRtcInitOptions = {}) => {
  const pc = new RTCPeerConnection({ iceServers });

  pc.addEventListener('track', (event) => {
    if (event.streams[0] && onRemoteStream) {
      onRemoteStream(event.streams[0]);
    }
  });

  return pc;
};

export const attachStreamToPeer = (stream: MediaStream, pc: RTCPeerConnection) => {
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
  });
};

export const createOffer = async (pc: RTCPeerConnection) => {
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: false
  });
  await pc.setLocalDescription(offer);
  return offer;
};

export const acceptAnswer = async (
  pc: RTCPeerConnection,
  answer: RTCSessionDescriptionInit
) => {
  if (!answer.sdp) {
    throw new Error('Invalid SDP answer');
  }
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
};

export const injectRemoteCandidate = async (
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
) => {
  await pc.addIceCandidate(candidate);
};

