import {
  Button,
  Card,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  Popconfirm,
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function CustomersPage({
  customers,
  filteredCustomers,
  search,
  setSearch,
  columns,
  bulkSelectMode,
  setBulkSelectMode,
  selectedCustomerIds,
  setSelectedCustomerIds,
  deleteCustomer,
  bulkDeleteCustomers,
  openEditModal,
  setOpen,
}) {
  return (
    <>
      <Space wrap style={{ marginBottom: 18 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Add Customer
        </Button>
      </Space>
      <Card 
        className="dashboard-card" 
        title="Customer Database"
        styles={{ body: { padding: 24 } }}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                if (bulkSelectMode === "customers") {
                  setBulkSelectMode(null);
                  setSelectedCustomerIds([]);
                } else {
                  setBulkSelectMode("customers");
                }
              }}
            >
              {bulkSelectMode === "customers" ? "Done" : "Bulk Edit"}
            </Button>
            {bulkSelectMode === "customers" && selectedCustomerIds.length > 0 && (
              <Popconfirm
                title={`Delete ${selectedCustomerIds.length} customers?`}
                onConfirm={bulkDeleteCustomers}
              >
                <Button danger>Delete Selected</Button>
              </Popconfirm>
            )}
          </Space>
        }
      >
        <div className="search-container">
          <Input
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </>
  );
}
