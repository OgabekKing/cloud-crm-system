import { Button, Card, Row, Col, Space, Typography } from "antd";

const { Text } = Typography;

export default function SettingsPage({
  isDarkMode,
  toggleTheme,
  handleLogout,
  themeIcon,
}) {
  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} md={12}>
        <Card title="Appearance" styles={{ body: { padding: 24 } }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Text>Toggle between light and dark mode to match your workspace.</Text>
            <Button type="primary" icon={themeIcon} onClick={toggleTheme}>
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Account" styles={{ body: { padding: 24 } }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Text strong>Admin User</Text>
            <Text type="secondary">demo@cloudcrm.com</Text>
            <Button type="default" onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
