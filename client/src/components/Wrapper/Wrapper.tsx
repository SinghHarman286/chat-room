import { useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Button } from "antd";
import styles from "./Wrapper.module.css";
import AuthContext from "../../store/auth-context";
const { Header, Content, Footer } = Layout;

const Wrapper: React.FC = ({ children }) => {
  const authContext = useContext(AuthContext);
  const isLoggedIn = authContext.isLoggedIn;

  return (
    <Layout className="layout">
      <Header style={{ backgroundColor: "white" }}>
        <Menu theme="light" mode="horizontal">
          <Menu.Item key={1}>
            <Link to="/">Home</Link>
          </Menu.Item>
          {!isLoggedIn && (
            <Menu.Item key={2}>
              <Link to="/auth">Login</Link>
            </Menu.Item>
          )}
          {isLoggedIn && (
            <Menu.Item key={3}>
              <Link to="/profile">Profile</Link>
            </Menu.Item>
          )}
          {isLoggedIn && (
            <Menu.Item key={4}>
              <Button onClick={authContext.logout}>Log Out</Button>
            </Menu.Item>
          )}
        </Menu>
      </Header>
      <Content style={{ padding: "0 50px", margin: "16px 0" }}>
        <div className={styles["site-layout-content"]}>{children}</div>
      </Content>
      <Footer style={{ textAlign: "center" }}>ChatRoom ©2021 Created by Harman Singh</Footer>
    </Layout>
  );
};

export default Wrapper;
