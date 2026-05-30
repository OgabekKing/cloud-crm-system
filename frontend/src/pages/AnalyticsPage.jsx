import { lazy, Suspense } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Space,
  Typography,
} from "antd";

const { Text } = Typography;

const Column = lazy(() => import("@ant-design/charts").then(module => ({ default: module.Column })));
const Pie = lazy(() => import("@ant-design/charts").then(module => ({ default: module.Pie })));

export default function AnalyticsPage({
  customers,
  orders,
  totalRevenue,
  totalOrders,
  completedOrders,
  processingOrders,
  orderRevenue,
  dealValueData,
  statusData,
  orderStatusData,
  dealValueConfig,
  statusConfig,
  orderStatusConfig,
  hasDealValueData,
  hasCustomerStatusData,
  hasOrderStatusData,
  orderStatusSummary,
}) {
  return (
    <>
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-kpi-card" title="Total Revenue" styles={{ body: { padding: 16 } }}>
            <Statistic title="" value={totalRevenue} prefix="$" />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-kpi-card" title="VIP Clients" styles={{ body: { padding: 16 } }}>
            <Statistic title="" value={customers.filter((c) => c.status === "VIP").length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-kpi-card" title="Total Orders" styles={{ body: { padding: 16 } }}>
            <Statistic title="" value={totalOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-kpi-card" title="Order Revenue" styles={{ body: { padding: 16 } }}>
            <Statistic title="" value={orderRevenue} prefix="$" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={16}>
          <Card className="dashboard-card" styles={{ body: { padding: 24 } }} title="Top 10 Customers by Deal Value">
            <Text type="secondary">
              Showing the highest revenue accounts for the most important customer relationships.
            </Text>
            <div style={{ marginTop: 16 }}>
              {hasDealValueData ? (
                <Suspense fallback={<div>Loading chart...</div>}>
                  <Column {...dealValueConfig} />
                </Suspense>
              ) : (
                <Text type="secondary">No customer deal value data available.</Text>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card className="dashboard-card" styles={{ body: { padding: 24 } }} title="Customer Status Distribution">
            <Text type="secondary">
              Visual breakdown of customer segments by current account status.
            </Text>
            <div style={{ marginTop: 16 }}>
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

        <Col xs={24}>
          <Card
            className="analytics-summary-card analytics-order-summary-card"
            title="Order Performance Summary"
            styles={{ body: { padding: 18 } }}
          >
            <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
              Core order metrics in a compact performance widget.
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

        <Col xs={24}>
          <Card
            className="analytics-summary-card analytics-order-status-card"
            styles={{ body: { padding: 18 } }}
            title="Order Status Breakdown"
          >
            <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
              Current order counts by status for quick operational visibility.
            </Text>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                {hasOrderStatusData ? (
                  <Suspense fallback={<div>Loading chart...</div>}>
                    <Pie {...orderStatusConfig} />
                  </Suspense>
                ) : (
                  <Text type="secondary">No order status data available.</Text>
                )}
              </Col>
              <Col xs={24} lg={8}>
                <Row gutter={[16, 16]}>
                  {orderStatusSummary.map((stat) => (
                    <Col xs={24} key={stat.label}>
                      <Card className="analytics-mini-stat-card" styles={{ body: { padding: 16 } }}>
                        <Statistic title={stat.label} value={stat.value} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
}
