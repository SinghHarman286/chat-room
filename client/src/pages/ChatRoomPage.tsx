import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Select, Dropdown, Menu, Input, Button, Modal, Empty } from "antd";
import { SendOutlined } from "@ant-design/icons";
import useModal from "../hooks/use-modal";
import "./ChatRoom.css";
const { Search } = Input;

const ChatRoomPage = () => {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<{ username: string; userId: string; message: string; _v: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [currentUserSelected, setCurrentUserSelected] = useState<string | null>(null);
  const [modalVisible, setModalVisibility] = useModal(["add", "delete"], false);
  const chatContainerRef = useRef<HTMLInputElement | null>(null);
  const { id } = useParams<{ id: string }>();
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
    if (chatContainerRef && chatContainerRef.current) {
      const element = chatContainerRef.current;
      element.scroll({
        top: element.scrollHeight,
        left: 0,
        // behavior: "smooth",
      });
    }
  }, [chatContainerRef, messages]);

  const fetchMessages = () => {
    socket.emit("get-message", { roomId: id });
    socket.on("recieve-message", (result) => {
      console.log("recieving in chatRoom");
      setMessages(result.conversations);
    });
  };

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);
  setTimeout(() => {
    setUserId(localStorage.getItem("userId")!);
    setUsername(localStorage.getItem("username")!);
  }, 1000);

  useEffect(() => {
    if (users.length > 0) {
      setCurrentUserSelected(users[0].id);
    }
  }, [users]);

  const handleAddUser = () => {
    if (currentUserSelected) {
      socket.emit("add-member-room", { userId: currentUserSelected, roomId: id, by: username });
    }
    setModalVisibility("add", false);
  };

  const handleDeleteUser = () => {
    if (currentUserSelected) {
      socket.emit("remove-member-room", { userId: currentUserSelected, roomId: id, by: username });
    }
    setModalVisibility("delete", false);
  };

  const fetchAddUsers = async () => {
    const response = await axios.get(`http://localhost:4000/api/chat/getUserToAdd/${id}`);
    setUsers(response.data.user.filter((user: { id: string; email: string }) => user.id !== userId));
    return;
  };

  const fetchDeleteUsers = async () => {
    const response = await axios.get(`http://localhost:4000/api/chat/getUserToDelete/${id}`);
    console.log(response.data, userId);
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
          <Button key="submit" disabled={!isUser} type="primary" onClick={handleDeleteUser}>
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
    await socket.emit("post-message", { message: inputMessage, userId, username, roomId: id });
    setInputMessage("");
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
        Messages <Dropdown.Button overlay={menu} placement="bottomCenter"></Dropdown.Button>
      </h1>

      <div ref={chatContainerRef} style={{ minHeight: 600, maxHeight: 600, overflowY: "scroll" }}>
        <div style={{ margin: 50 }}>
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
    </div>
  );
};

export default ChatRoomPage;
