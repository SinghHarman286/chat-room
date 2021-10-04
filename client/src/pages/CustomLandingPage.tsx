import { Result, Button } from "antd";
import { useHistory } from "react-router-dom";
import { SendOutlined } from "@ant-design/icons";

const CustomLandingPage = () => {
  const history = useHistory();
  return (
    <Result
      icon={<SendOutlined />}
      title="Welcome to ChatRoom"
      subTitle="Please Log In or Sign Up to continue using ChatRoom"
      extra={
        <Button type="primary" key="Log In" onClick={() => history.push("/auth")}>
          Login
        </Button>
      }
    />
  );
};

export default CustomLandingPage;
