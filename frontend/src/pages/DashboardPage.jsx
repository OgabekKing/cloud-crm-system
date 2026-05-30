import { lazy, Suspense } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Space,
  Avatar,
  Progress,
  Typography,
} from "antd";

const { Text } = Typography;

const Column = lazy(() => import("@ant-design/charts").then(module => ({ default: module.Column })));
const Pie = lazy(() => import("@ant-design/charts").then(module => ({ default: module.Pie })));

export default function DashboardPage({
  customers,
  orders,
  totalRevenue,
  totalOrders,
  completedOrders,
  processingOrders,
  orderRevenue,
  statusSummary,
  statusData,
  dealValueData,
  statusConfig,
  dealValueConfig,
  hasCustomerStatusData,
  hasDealValueData,
  totalStatusCount,
}) {
  return (
    <>
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" styles={{ body: { padding: 18 } }}>
            <Statistic title="Total Customers" value={customers.length} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" styles={{ body: { padding: 18 } }}>
            <Statistic
              title="VIP Clients"
              value={customers.filter((c) => c.status === "VIP").length}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" styles={{ body: { padding: 18 } }}>
            <Statistic
              title="Active Clients"
              value={customers.filter((c) => c.status === "Active").length}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" styles={{ body: { padding: 18 } }}>
            <Statistic title="Total Revenue" value={totalRevenue} prefix="$" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="analytics-row">
        <Col xs={24}>
          <Card
            className="analytics-main-card"
            title="Customer Analytics"
            styles={{ body: { padding: 24 } }}
          >
            <Text type="secondary">
              Top 10 customers by deal value. Chart is sorted descending and sized for readability.
            </Text>
            <div style={{ marginTop: 16 }}>
              <Suspense fallback={<div>Loading chart...</div>}>
                <Column {...dealValueConfig} />
              </Suspense>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="analytics-row">
        <Col xs={24} md={12}>
          <Card
            className="analytics-side-card"
            title="Customer Status Distribution"
            styles={{ body: { padding: 24 } }}
          >
            <Text type="secondary">
              Current customer segment breakdown by VIP, Active, and Pending accounts.
            </Text>
            <div style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                {statusSummary.map((item) => (
                  <Col xs={24} sm={8} key={item.label}>
                    <Statistic title={item.label} value={item.count} />
                    <Progress
                      percent={Math.round((item.count / totalStatusCount) * 100)}
                      strokeColor={item.color}
                      size="small"
                      format={(percent) => `${percent}%`}
                    />
                  </Col>
                ))}
              </Row>
            </div>
            <div style={{ marginTop: 24 }}>
              {hasCustomerStatusData ? (
                <Suspense fallback={<div>Loading chart...</div>}>
                  <Pie {...statusConfig} />
                </Suspense>
              ) : (
                <Text type="secondary">No customer status data available.</Text>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            className="analytics-side-card"
            title="Recent Activity"
            styles={{ body: { padding: 24 } }}
          >
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
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="analytics-row">
        <Col xs={24}>
          <Card
            className="analytics-summary-card analytics-order-summary-card"
            title="Order Performance Summary"
            styles={{ body: { padding: 18 } }}
          >
            <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
              Key order performance metrics in a compact dashboard widget.
            </Text>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card className="analytics-mini-stat-card" styles={{ body: { padding: 16 } }}>
                  <Statistic title="Total Orders" value={totalOrders} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="analytics-mini-stat-card" styles={{ body: { padding: 16 } }}>
                  <Statistic title="Completed" value={completedOrders} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="analytics-mini-stat-card" styles={{ body: { padding: 16 } }}>
                  <Statistic title="Processing" value={processingOrders} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="analytics-mini-stat-card" styles={{ body: { padding: 16 } }}>
                  <Statistic title="Order Revenue" value={orderRevenue} prefix="$" />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
}
