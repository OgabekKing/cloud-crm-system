import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Space,
  Statistic,
  Table,
  Popconfirm,
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

export default function OrdersPage({
  orders,
  filteredOrders,
  orderSearch,
  setOrderSearch,
  orderColumns,
  bulkSelectMode,
  setBulkSelectMode,
  selectedOrderIds,
  setSelectedOrderIds,
  deleteOrder,
  bulkDeleteOrders,
  openOrderEditModal,
  setIsOrderModalOpen,
  orderForm,
  totalOrders,
  completedOrders,
  pendingOrders,
  orderRevenue,
}) {
  return (
    <>
      <Row gutter={[20, 20]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Orders" value={totalOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Completed" value={completedOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Pending" value={pendingOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Order Revenue" value={orderRevenue} prefix="$" />
          </Card>
        </Col>
      </Row>

      <Card
        className="dashboard-card"
        title="Orders"
        styles={{ body: { padding: 24 } }}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                if (bulkSelectMode === "orders") {
                  setBulkSelectMode(null);
                  setSelectedOrderIds([]);
                } else {
                  setBulkSelectMode("orders");
                }
              }}
            >
              {bulkSelectMode === "orders" ? "Done" : "Bulk Edit"}
            </Button>
            {bulkSelectMode === "orders" && selectedOrderIds.length > 0 && (
              <Popconfirm
                title={`Delete ${selectedOrderIds.length} orders?`}
                onConfirm={bulkDeleteOrders}
              >
                <Button danger>Delete Selected</Button>
              </Popconfirm>
            )}
            <Button>Full Screen</Button>
          </Space>
        }
      >
        <Space wrap style={{ marginBottom: 18, width: "100%", justifyContent: "space-between" }}>
          <Input
            placeholder="Search orders..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 320, width: "100%" }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              orderForm.resetFields();
              setIsOrderModalOpen(true);
            }}
          >
            Add Order
          </Button>
        </Space>
        <Table
          columns={orderColumns}
          dataSource={filteredOrders}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </>
  );
}
