import axios from "axios";
import { useRef, useState, useEffect, Fragment } from "react";
import { useHistory } from "react-router-dom";
import { message, Alert, Divider, Empty, Input, Button, PageHeader, Card, Row, Col, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";

const HomeComponent = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [newRoomModal, setNewRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<{ isError: boolean; message: string }>({ isError: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const socket = io("http://localhost:4000");

  useEffect(() => {
    return () => {
      setUsername("");
      setUserId("");
      setNewRoomModal(false);
      setNewRoomName("");
      setRooms([]);
      setError({ isError: false, message: "" });
    };
  }, []);
  socket.once("connect", () => {
    if (userId) {
      socket.emit("join", { userId: userId, socketId: socket.id });
    } else {
      setTimeout(() => {
        socket.emit("join", { userId: userId, socketId: socket.id });
      }, 3000);
    }
  });

  socket.once("recieve-room", ({ result, body }) => {
    if (body) {
      if ("added" in body) {
        const { added } = body;
        if (added) {
          message.info(`You have been added to a new room by ${body.by}`);
        }
      } else if ("removed" in body) {
        const { removed } = body;
        if (removed) {
          message.error(`You have been removed from this room by ${body.by}`);
          history.replace("/");
        }
      }
    }
    setRooms((prevState) => {
      return result.rooms;
    });
  });

  useEffect(() => {
    if (userId && token) {
      socket.emit("get-room", { token, userId, body: { added: false, by: "" } });
      return () => {
        setRooms([]);
      };
    }
  }, [userId, token]);

  setTimeout(() => {
    setUsername(localStorage.getItem("username")!);
    setUserId(localStorage.getItem("userId")!);
    setToken(localStorage.getItem("tokenId")!);
  }, 1000);

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    setError({ isError: false, message: "" });
    setNewRoomName(e.currentTarget.value);
  };

  const handleCreateRoom = async () => {
    if (newRoomName.trim() === "") {
      setError({ isError: true, message: "You must input a room name" });
      return false;
    }
    try {
      const response = await axios.post(
        "http://localhost:4000/api/room/newRoom",
        {
          name: newRoomName,
          userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        }
      );
      socket.emit("get-room", { token, userId });
      setNewRoomName("");
      setNewRoomModal(false);
    } catch (err: any) {
      console.log(err);
      if (err && err.response) {
        setError({ isError: true, message: err.response.data.message });
      }
    }
  };

  const showCreateRoomModal = () => {
    return (
      <Modal title="Create New Room" visible={true} onOk={() => handleCreateRoom()} onCancel={() => setNewRoomModal(false)}>
        <Input placeholder="Enter name of the room you want to create" value={newRoomName} onChange={handleInputChange} />
        <br />
        {error.isError && <Alert message={error.message} type="error" showIcon closable />}
      </Modal>
    );
  };

  const handleJoinRoom = (id: number) => {
    history.push(`/rooms/${id}`);
  };
  return (
    <>
      <PageHeader className="site-page-header" title="Welcome" subTitle="You can create or join chat rooms" />
      {rooms.length === 0 && <Empty description="You are not joined to any rooms yet" />}
      <Row gutter={24}>
        {rooms.length === 0 && <Divider />}
        {rooms.length !== 0 &&
          rooms.map((room, roomIdx) => {
            return (
              <Fragment key={room.id}>
                <Col className="gutter-row" span={6} key={room.id}>
                  <Card style={{ textAlign: "center" }} title={room.name} bordered={true} key={room.id}>
                    <Button type="primary" onClick={() => handleJoinRoom(room.id)}>
                      JOIN
                    </Button>
                  </Card>
                </Col>
                {(roomIdx + 1) % 4 === 0 && roomIdx !== 0 && <Divider />}
              </Fragment>
            );
          })}
        <Col className="gutter-row" span={6}>
          <Card key="0" style={{ textAlign: "center" }} title="Create new room" bordered={true} onClick={() => setNewRoomModal(true)}>
            <Button>
              <PlusOutlined style={{ fontSize: "10" }} />
            </Button>
          </Card>
        </Col>
      </Row>
      {newRoomModal && showCreateRoomModal()}
    </>
  );
};

export default HomeComponent;
