import { Card, Space, Avatar, Typography } from "antd";

const { Text } = Typography;

export default function CloudPage({ customers }) {
  return (
    <Card className="dashboard-card" title="Cloud Network Overview" styles={{ body: { padding: 24 } }}>
      <div className="network-flow">
        <span>DNS</span>
        <b>→</b>
        <span>Load Balancer</span>
        <b>→</b>
        <span>CRM App</span>
        <b>→</b>
        <span>Database</span>
      </div>

      <Space direction="vertical" size="middle" className="network-list">
        <Card size="small">VPC: private isolated cloud network</Card>
        <Card size="small">Subnet: public app layer and private DB layer</Card>
        <Card size="small">VPN: secure office connection</Card>
        <Card size="small">Auto Scaling: ready for high traffic</Card>
      </Space>
      <Card title="Recent Activity" className="activity-card">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {customers.slice(0, 4).map((item) => (
            <Card key={item.id || item.key} size="small">
              <Card.Meta
                avatar={<Avatar>{item.name.charAt(0).toUpperCase()}</Avatar>}
                title={`${item.name} added to CRM`}
                description={`Status: ${item.status} • Deal value: $${Number(
                  item.value || 0
                ).toLocaleString()}`}
              />
            </Card>
          ))}
        </Space>
      </Card>
    </Card>
  );
}
