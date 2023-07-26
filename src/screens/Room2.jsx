import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Room2Screen = () => {
  const socket = useSocket();
  const { roomId, role } = useParams();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const rtcPeerConnection = useRef(
    new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun.l.google.com:19302" },
      ],
    })
  );

  const handleStream = (stream) => {
    //let { width, height } = stream.getVideoTracks()[0].getSettings();
    //window.electronAPI.setSize({ width, height });
    //videoRef.current.srcObject = stream;
    setMyStream(stream);
    rtcPeerConnection.current.addStream(stream);
    //videoRef.current.onloadedmetadata = (e) => videoRef.current.play();
  };

  const createStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true,
      });

      //rtcPeerConnection.current.addTransceiver('video')
      //rtcPeerConnection.current.getTransceivers().forEach(t=>t.direction = 'recvonly')
      rtcPeerConnection.current
        .createOffer({
          offerToReceiveVideo: 1,
        })
        .then((sdp) => {
          rtcPeerConnection.current.setLocalDescription(sdp);
          setMyStream(stream);
          console.log("sending offer");
          socket.emit("offer", sdp);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const handleSocketOffer = useCallback(
    (offerSDP) => {
      console.log("received offer");
      rtcPeerConnection.current
        .setRemoteDescription(new RTCSessionDescription(offerSDP))
        .then(() => {
          rtcPeerConnection.current.createAnswer().then((sdp) => {
            rtcPeerConnection.current.setLocalDescription(sdp);
            console.log("sending answer");
            socket.emit("answer", sdp);
          });
        });
    },
    [socket]
  );

  const handleSocketAnswer = useCallback((answerSDP) => {
    console.log("received answer");
    rtcPeerConnection.current.setRemoteDescription(
      new RTCSessionDescription(answerSDP)
    );
  }, []);

  const handleSocketIceCandidate = useCallback((icecandidate) => {
    rtcPeerConnection.current.addIceCandidate(
      new RTCIceCandidate(icecandidate)
    );
  }, []);

  const sendStreams = useCallback(() => {
    myStream.getTracks().forEach((track) => {
      rtcPeerConnection.current.addTrack(track, myStream);
    });
  }, [myStream]);

  useEffect(() => {
    socket.on("offer", handleSocketOffer);
    socket.on("answer", handleSocketAnswer);
    socket.on("icecandidate", handleSocketIceCandidate);

    return () => {
      socket.off("offer", handleSocketOffer);
      socket.off("answer", handleSocketAnswer);
      socket.off("icecandidate", handleSocketIceCandidate);
    };
  }, [handleSocketAnswer, handleSocketIceCandidate, handleSocketOffer, socket]);

  useEffect(() => {
    rtcPeerConnection.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("icecandidate", e.candidate);
    };

    rtcPeerConnection.current.onconnectionstatechange = (e) => {
      console.log(e);
    };

    rtcPeerConnection.current.ontrack = (e) => {
      console.log(e);
      setRemoteStream(e.streams[0]);
    };
  }, [socket]);

  useEffect(() => {
    rtcPeerConnection.current.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log(remoteStream);
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && (
        <div>
          <h1>My Stream</h1>
          <ReactPlayer playing muted url={myStream} />
        </div>
      )}
      {remoteStream && (
        <div>
          <h1>RemoteStream</h1>
          <ReactPlayer playing muted url={remoteStream} />
        </div>
      )}
      {role === "user" && <button onClick={createStream}>Stream</button>}
      {role === "user" && <button onClick={() => sendStreams()}>ttttt</button>}
    </div>
  );
};

export default Room2Screen;
