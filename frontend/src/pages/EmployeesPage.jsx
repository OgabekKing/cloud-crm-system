import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Select,
  Space,
  Statistic,
  Table,
  Popconfirm,
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

export default function EmployeesPage({
  employees,
  filteredEmployees,
  employeeSearch,
  setEmployeeSearch,
  employeeStatusFilter,
  setEmployeeStatusFilter,
  employeeColumns,
  bulkSelectMode,
  setBulkSelectMode,
  selectedEmployeeIds,
  setSelectedEmployeeIds,
  deleteEmployee,
  bulkDeleteEmployees,
  openEmployeeEditModal,
  setIsEmployeeModalOpen,
  employeeForm,
  totalEmployees,
  activeEmployees,
  averageSalary,
  highestSalary,
}) {
  return (
    <>
      <Row gutter={[20, 20]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Employees" value={totalEmployees} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Active Employees" value={activeEmployees} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Average Salary" value={averageSalary} prefix="$" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Highest Salary" value={highestSalary} prefix="$" />
          </Card>
        </Col>
      </Row>
      <Card
        className="dashboard-card"
        title="Employees"
        styles={{ body: { padding: 24 } }}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                if (bulkSelectMode === "employees") {
                  setBulkSelectMode(null);
                  setSelectedEmployeeIds([]);
                } else {
                  setBulkSelectMode("employees");
                }
              }}
            >
              {bulkSelectMode === "employees" ? "Done" : "Bulk Edit"}
            </Button>
            {bulkSelectMode === "employees" && selectedEmployeeIds.length > 0 && (
              <Popconfirm
                title={`Delete ${selectedEmployeeIds.length} employees?`}
                onConfirm={bulkDeleteEmployees}
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
            placeholder="Search employees..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 360, width: "100%" }}
          />
          <Select
            placeholder="Filter by status"
            value={employeeStatusFilter}
            onChange={(value) => setEmployeeStatusFilter(value)}
            allowClear
            style={{ maxWidth: 220, width: "100%" }}
            options={[
              { value: "Active", label: "Active" },
              { value: "Onboarding", label: "Onboarding" },
              { value: "Inactive", label: "Inactive" },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              employeeForm.resetFields();
              setIsEmployeeModalOpen(true);
            }}
          >
            Add Employee
          </Button>
        </Space>
        <Table
          columns={employeeColumns}
          dataSource={filteredEmployees}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 6 }}
        />
      </Card>
    </>
  );
}
