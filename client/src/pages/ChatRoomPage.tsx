import { useParams } from "react-router-dom";
import ChatRoomComponent from "../components/Chat/ChatRoomComponent";

const ChatRoomPage = () => {
  const { id } = useParams<{ id: string }>();

  return <ChatRoomComponent id={id} />;
};

export default ChatRoomPage;
