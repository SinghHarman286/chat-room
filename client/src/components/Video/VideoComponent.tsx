import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import { io, Socket } from "socket.io-client";
import { Button, Modal, Card } from "antd";
import styled from "styled-components";

const StyledVideo = styled.video`
  border-radius: 15px;
  box-shadow: rgba(50, 50, 93, 0.15) 0px 30px 50px -12px inset, rgba(0, 0, 0, 0.3) 0px 15px 32px -18px inset;
  margin: 7px;
`;

const Video = (props: { peer: Peer.Instance; videoStyle: { marginLeft: string; height: string; width: string } }) => {
  const ref = useRef() as React.MutableRefObject<HTMLVideoElement>;

  useEffect(() => {
    props.peer.on("stream", (stream: MediaStream) => {
      ref.current!.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} style={props.videoStyle} />;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const VideoComponent = ({ username, roomId, handleDisconnectUserVideo }: { username: string; roomId: string; handleDisconnectUserVideo: () => void }) => {
  const [peers, setPeers] = useState<{ peerId: string; peer: Peer.Instance }[]>([]);
  const userVideo = useRef() as React.MutableRefObject<HTMLVideoElement>;
  type PeerRefType = { peerId: string; peer: Peer.Instance }[];
  const peersRef = useRef<PeerRefType>([]);
  const socket = useRef<Socket>();

  useEffect(() => {
    socket.current = io("http://localhost:4000");
    navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then((stream: MediaStream) => {
      userVideo.current!.srcObject = stream;
      socket.current!.emit("join-video-room", roomId);
      socket.current!.on("users-in-room", (users) => {
        const peers: { peerId: string; peer: Peer.Instance }[] = [];
        users.forEach((userId: string) => {
          const peer = createPeer(userId, socket.current!.id, stream);
          const peerObj = { peerId: userId, peer };
          peersRef.current.push(peerObj);
          peers.push(peerObj);
        });
        setPeers(peers);
      });

      socket.current!.on("user-joined", (payload: { signal: Peer.SignalData; callerID: string }) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerId: payload.callerID,
          peer,
        });

        setPeers((users) => [...users, { peerId: payload.callerID, peer }]);
      });

      socket.current!.on("receive-returned-signal", (payload: { signal: Peer.SignalData; id: String }) => {
        const item = peersRef.current.find((p) => p.peerId === payload.id);
        item!.peer.signal(payload.signal);
      });

      socket.current!.on("user-left", ({ id }: { id: string }) => {
        peersRef.current = peersRef.current.filter((peerObj) => peerObj["peerId"] !== id);
        setPeers((prevPeers) => prevPeers.filter((peerObj) => peerObj["peerId"] !== id));
      });
    });

    return () => {
      handleVideoDisconnectBtn();
    };
  }, []);

  const createPeer = (userToSignal: string, callerID: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.current!.emit("send-signal", { userToSignal, callerID, signal });
    });

    return peer;
  };

  const addPeer = (incomingSignal: Peer.SignalData, callerID: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.current!.emit("return-signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  };

  const handleVideoDisconnectBtn = () => {
    socket.current!.emit("disconnect-video");
    if (userVideo && userVideo.current && userVideo.current.srcObject) {
      const stream = userVideo.current.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach((track: MediaStreamTrack) => {
        track.stop();
      });

      userVideo.current.srcObject = null;
    }
    handleDisconnectUserVideo();
  };
  const videoStyle = peers.length === 0 ? { marginLeft: "20%", height: "60%", width: "60%" } : { marginLeft: "12%", height: "30%", width: "30%" };
  return (
    <Modal
      title="Video Call"
      width="90%"
      visible={true}
      onCancel={handleVideoDisconnectBtn}
      footer={[
        <Button key="Disconnect" onClick={handleVideoDisconnectBtn}>
          Disconnect
        </Button>,
        ,
      ]}
    >
      <StyledVideo style={videoStyle} muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer["peer"]} videoStyle={videoStyle} />;
      })}
    </Modal>
  );
};

export default VideoComponent;
