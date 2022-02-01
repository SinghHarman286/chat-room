import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Skeleton, Select, Dropdown, Menu, Input, Button, Modal, Empty } from "antd";
import { SendOutlined, VideoCameraTwoTone } from "@ant-design/icons";
import useModal from "../../hooks/use-modal";
import VideoComponent from "../Video/VideoComponent";
import "./ChatRoomComponent.css";

const ChatRoomComponent: React.FC<{ id: string }> = ({ id }) => {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [admin, setAdmin] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<{ username: string; userId: string; message: string; _v: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [currentUserSelected, setCurrentUserSelected] = useState<string | null>(null);
  const [enableVideo, setEnableVideo] = useState(false);
  const [modalVisible, setModalVisibility] = useModal(["add", "delete"], false);
  const chatContainerRef = useRef<HTMLInputElement | null>(null);
  const socket = io("http://localhost:4000");

  useEffect(() => {
    socket.on("connect", () => {});
    return () => {
      setUserId("");
      setUsername("");
      setMessages([]);
      setInputMessage("");
      setCurrentUserSelected(null);
      setUsers([]);
    };
  }, []);

  useEffect(() => {
    // scrolls the html body to the bottom whenever messages start
    // overflowing
    if (chatContainerRef && chatContainerRef.current) {
      const element = chatContainerRef.current;
      element.scroll({
        top: element.scrollHeight,
        left: 0,
      });
    }
  }, [chatContainerRef, messages]);

  const fetchMessages = () => {
    socket.emit("get-message", { token, roomId: id });
    socket.on("recieve-message", ({ data, roomId }) => {
      roomId === id && setMessages(data.conversations);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    setIsLoading(true);
    const getAdmin = async () => {
      const response = await axios.get(`http://localhost:4000/api/room/getAdmin/${id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setAdmin(response.data.admin);
    };
    if (userId && token) {
      fetchMessages();
      getAdmin();
    }
  }, [userId, token]);

  setTimeout(() => {
    setUserId(localStorage.getItem("userId")!);
    setUsername(localStorage.getItem("username")!);
    setToken(localStorage.getItem("tokenId")!);
  }, 1000);

  useEffect(() => {
    if (users.length > 0) {
      setCurrentUserSelected(users[0].id);
    }
  }, [users]);

  const handleAddUser = () => {
    if (currentUserSelected) {
      socket.emit("add-member-room", { token, userId: currentUserSelected, roomId: id, by: username });
    }
    setModalVisibility("add", false);
  };

  const handleDeleteUser = () => {
    if (currentUserSelected) {
      socket.emit("remove-member-room", { token, userId: currentUserSelected, roomId: id, by: username });
    }
    setModalVisibility("delete", false);
  };

  const fetchAddUsers = async () => {
    const response = await axios.get(`http://localhost:4000/api/chat/getUserToAdd/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    setUsers(response.data.user.filter((user: { id: string; email: string }) => user.id !== userId));
    return;
  };

  const fetchDeleteUsers = async () => {
    const response = await axios.get(`http://localhost:4000/api/chat/getUserToDelete/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    setUsers(response.data.user.filter((user: { id: string; email: string }) => user.id !== userId));
  };

  const showDeleteModal = () => {
    const { Option } = Select;
    const isUser = users.length > 0;
    return (
      <Modal
        title="Choose a user to remove"
        visible={true}
        onCancel={() => setModalVisibility("delete", false)}
        onOk={() => setModalVisibility("delete", false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisibility("delete", false)}>
            Cancel
          </Button>,
          <Button key="submit" disabled={!isUser} type="primary" danger onClick={handleDeleteUser}>
            Remove User
          </Button>,
        ]}
      >
        {isUser && (
          <Select defaultValue={users[0].id} onChange={(v) => setCurrentUserSelected(v)} style={{ width: 300 }}>
            {users.map((data: { id: string; email: string }) => (
              <Option value={data.id} key={data.id}>
                {data.email}
              </Option>
            ))}
          </Select>
        )}
        {!isUser && <Empty description="There are no users to remove" />}
      </Modal>
    );
  };

  const showAddModal = () => {
    const { Option } = Select;
    const isUser = users.length > 0;
    return (
      <Modal
        title="Choose a user to add"
        visible={true}
        onCancel={() => setModalVisibility("add", false)}
        onOk={() => setModalVisibility("add", false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisibility("add", false)}>
            Cancel
          </Button>,
          <Button key="submit" disabled={!isUser} type="primary" onClick={handleAddUser}>
            Add User
          </Button>,
        ]}
      >
        {isUser && (
          <Select defaultValue={users[0].id} onChange={(v) => setCurrentUserSelected(v)} style={{ width: 300 }}>
            {users.map((data: { id: string; email: string }) => (
              <Option value={data.id} key={data.id}>
                {data.email}
              </Option>
            ))}
          </Select>
        )}
        {!isUser && <Empty description="There are no users to add" />}
      </Modal>
    );
  };

  const handleInputMessage = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputMessage(e.currentTarget.value);
  };

  const handleNewMessageInput = async () => {
    await socket.emit("post-message", { token, message: inputMessage, userId, username, roomId: id });
    setInputMessage("");
  };

  const handleVideoCallBtn = () => {
    setEnableVideo(true);
  };

  const handleDisconnectUserVideo = () => {
    setEnableVideo(false);
  };

  const handleMenuClick = async (e: { key: string }) => {
    const { key }: { key: string } = e;

    if (key === "1") {
      await fetchAddUsers();
      setModalVisibility("add", true);
    } else if (key === "2") {
      await fetchDeleteUsers();
      setModalVisibility("delete", true);
    } else {
      throw new Error("Invalid Key Selected");
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Add a new user</Menu.Item>
      <Menu.Item key="2">Remove a user</Menu.Item>
    </Menu>
  );

  return (
    <div>
      <h1>
        Messages {userId && admin === userId && <Dropdown.Button overlay={menu} placement="bottomCenter"></Dropdown.Button>}{" "}
        <VideoCameraTwoTone style={{ float: "right", fontSize: "25px" }} onClick={handleVideoCallBtn} />
      </h1>
      {isLoading && <Skeleton active />}
      <div ref={chatContainerRef} style={{ minHeight: 600, maxHeight: 600, overflowY: "scroll" }}>
        <div style={{ margin: 50 }}>
          {!isLoading && messages.length === 0 && <Empty description="There are no messages in this room yet" />}
          {messages &&
            messages.map((message, messageIdx) => {
              return (
                <div key={messageIdx} style={{ margin: 5, textAlign: message.userId === userId ? "right" : "left" }}>
                  <div style={{ color: "grey" }}>{message.username}</div>
                  <p className={`message ${message.userId === userId && "own"}`}>{message.message}</p>
                </div>
              );
            })}
        </div>
      </div>
      <footer>
        <Input
          placeholder="Message..."
          allowClear
          value={inputMessage}
          onChange={handleInputMessage}
          onPressEnter={handleNewMessageInput}
          addonAfter={<Button disabled={inputMessage.trim() === ""} size="small" style={{ backgroundColor: "#FAFAFA", border: "none" }} icon={<SendOutlined />} onClick={handleNewMessageInput} />}
        />
      </footer>
      {modalVisible["add"] && showAddModal()}
      {modalVisible["delete"] && showDeleteModal()}
      {enableVideo && <VideoComponent username={username} roomId={id} handleDisconnectUserVideo={handleDisconnectUserVideo} />}
    </div>
  );
};

export default ChatRoomComponent;
