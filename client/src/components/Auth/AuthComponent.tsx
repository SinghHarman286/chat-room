import { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Alert, Card, Form, Input, Button } from "antd";
import AuthContext from "../../store/auth-context";
import { AuthPayload } from "../../types/AuthContextTypes";
import axios from "axios";

const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ isError: false, message: "" });

  const authContext = useContext(AuthContext);
  const history = useHistory();

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  const onFinish = async (values: AuthPayload) => {
    setError({ isError: false, message: "" });
    setIsLoading(true);
    const { email, username, password } = values;
    let url = "http://localhost:4000/api/auth/";

    url += isLogin ? "login" : "signup";

    let payload: AuthPayload = { email, password };
    if (!isLogin) {
      payload = { ...payload, username };
    }
    try {
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const expTime = new Date(new Date().getTime() + +response.data.expiresIn * 1000);
      authContext.login(
        { userId: response.data.userId, username: response.data.username, token: response.data.token },
        expTime.toISOString()
      );
      history.push("/");
    } catch (err: any) {
      console.log(err);
      let errMsg = "Authentication Failed";
      if (err && err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      setError({ isError: true, message: errMsg });
    }
    setIsLoading(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    setError({ isError: false, message: "" });
    console.log("Failed:", errorInfo);
  };
  return (
    <Card title={isLogin ? "Login" : "SignUp"}>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            { required: true, message: "Please input your email!" },
          ]}
        >
          <Input />
        </Form.Item>

        {!isLogin && (
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {isLogin ? "Login" : "Create Account"}
          </Button>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          {isLogin ? "New User? " : "Returning User? "}
          <Button type="dashed" onClick={() => setIsLogin((prevState) => !prevState)}>
            {isLogin ? "Create new account" : "Login with existing account"}
          </Button>
        </Form.Item>
        {error["isError"] && <Alert message="Error" type="error" description={error["message"]} showIcon closable />}
      </Form>
    </Card>
  );
};

export default AuthComponent;
