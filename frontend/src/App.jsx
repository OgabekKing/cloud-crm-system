import {useEffect, useState, lazy, Suspense } from "react";
import {
  ConfigProvider,
  theme as antdTheme,
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Space,
  Popconfirm,
  notification,
  message,
  Avatar,
  Progress,
} from "antd";
import {
  CloudOutlined,
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  GlobalOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  UserOutlined,
  FullscreenOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
const Column = lazy(() => import("@ant-design/charts").then(module => ({ default: module.Column })));
const Pie = lazy(() => import("@ant-design/charts").then(module => ({ default: module.Pie })));

// Lazy load page components
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const CloudPage = lazy(() => import("./pages/CloudPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

import "antd/dist/reset.css";
import "./App.css";
import axios from "axios";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const CUSTOMERS_API_URL = "https://d2hqdg9adqhzlf.cloudfront.net/customers/";
  const ORDERS_API_URL = "https://d2hqdg9adqhzlf.cloudfront.net/orders/";
  const EMPLOYEES_API_URL = "https://d2hqdg9adqhzlf.cloudfront.net/employees/";
  const [open, setOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem("cloud-crm-token"))
  );
  const [fullscreenCard, setFullscreenCard] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("cloud-crm-theme") === "dark"
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [employeeForm] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [search, setSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState(null);
  const [bulkSelectMode, setBulkSelectMode] = useState(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(CUSTOMERS_API_URL);

      const data = response.data.map((customer) => ({
        key: customer.id,
        ...customer,
      }));

      setCustomers(data);
    } catch (error) {
      console.error("Customers could not be loaded:", error);
      message.warning("Unable to load customers. Check your connection.");
      notification.warning({
        message: "Fetch Warning",
        description: "Unable to load customer data. Please refresh or try again later.",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(ORDERS_API_URL);
      const data = response.data.map((order) => ({
        key: order.id,
        ...order,
      }));
      setOrders(data);
    } catch (error) {
      console.error("Orders could not be loaded:", error);
      message.warning("Unable to load orders. Check your connection.");
      notification.warning({
        message: "Fetch Warning",
        description: "Unable to load order data. Please refresh or try again later.",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(EMPLOYEES_API_URL);
      const data = response.data.map((employee) => ({
        key: employee.id,
        ...employee,
      }));
      setEmployees(data);
    } catch (error) {
      console.error("Employees could not be loaded:", error);
      message.warning("Unable to load employees. Check your connection.");
      notification.warning({
        message: "Fetch Warning",
        description: "Unable to load employee data. Please refresh or try again later.",
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      await Promise.all([fetchCustomers(), fetchOrders(), fetchEmployees()]);
    };

    loadData();
  }, [isAuthenticated]);

  const addCustomer = async (values) => {
    try {
      await axios.post(CUSTOMERS_API_URL, {
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company,
        status: values.status,
        value: Number(values.value),
      });

      form.resetFields();
      setOpen(false);
      fetchCustomers();
      message.success("Customer added successfully");
      notification.success({
        message: "Customer Added",
        description: `${values.name} has been added to the CRM database.`,
      });
    } catch (error) {
      console.error("Customer could not be added:", error);
      message.error("Failed to add customer");
      notification.error({
        message: "Add Error",
        description: "Could not add this customer. Please try again.",
      });
    }
  };
  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`${CUSTOMERS_API_URL}${id}`);

      message.success("Customer deleted");
      notification.success({
        message: "Customer Deleted",
        description: "The customer record was removed successfully.",
      });

      fetchCustomers();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete customer");
      notification.error({
        message: "Delete Error",
        description: "Unable to delete the customer. Please try again.",
      });
    }
  };

  const bulkDeleteCustomers = async () => {
    if (selectedCustomerIds.length === 0) {
      message.warning("No customers selected");
      return;
    }

    try {
      await Promise.all(
        selectedCustomerIds.map((id) => axios.delete(`${CUSTOMERS_API_URL}${id}`))
      );
      message.success(`Deleted ${selectedCustomerIds.length} customers`);
      setSelectedCustomerIds([]);
      setBulkSelectMode(null);
      fetchCustomers();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      message.error("Failed to delete some customers");
    }
  };

  const toggleCustomerSelection = (id) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllCustomers = (checked) => {
    if (checked) {
      setSelectedCustomerIds(filteredCustomers.map((c) => c.id || c.key));
    } else {
      setSelectedCustomerIds([]);
    }
  };

  const handleLogin = (values) => {
    if (values.username === "admin" && values.password === "admin123") {
      localStorage.setItem("cloud-crm-token", "demo-cloud-crm-token");
      setIsAuthenticated(true);
      message.success("Login successful");
      notification.success({
        message: "Welcome Back",
        description: "You have successfully signed in to Cloud CRM.",
      });
      loginForm.resetFields();
    } else {
      message.error("Invalid username or password");
      notification.error({
        message: "Login Failed",
        description: "Username or password is incorrect. Please try again.",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cloud-crm-token");
    setIsAuthenticated(false);
    setOpen(false);
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    setSearch("");
    message.info("Logged out");
    notification.info({
      message: "Logged Out",
      description: "You have safely signed out of Cloud CRM.",
    });
  };

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem("cloud-crm-theme", nextMode ? "dark" : "light");
    message.success(`Switched to ${nextMode ? "Dark" : "Light"} Mode`);
  };

  const openFullScreen = (cardKey) => {
    setFullscreenCard(cardKey);
  };

  const closeFullScreen = () => {
    setFullscreenCard(null);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    editForm.setFieldsValue({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      status: customer.status,
      value: customer.value,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    editForm.resetFields();
  };

  const updateCustomer = async (values) => {
    if (!editingCustomer) return;

    try {
      await axios.put(`${CUSTOMERS_API_URL}${editingCustomer.id}`, {
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company,
        status: values.status,
        value: Number(values.value),
      });

      message.success("Customer updated successfully");
      notification.success({
        message: "Customer Updated",
        description: `${values.name}'s information has been updated.`,
      });
      closeEditModal();
      fetchCustomers();
    } catch (error) {
      console.error("Customer could not be updated:", error);
      message.error("Failed to update customer");
      notification.error({
        message: "Update Error",
        description: "Unable to update the customer. Please try again.",
      });
    }
  };

  const addOrder = async (values) => {
    try {
      await axios.post(ORDERS_API_URL, {
        customer_name: values.customer_name,
        product_name: values.product_name,
        quantity: Number(values.quantity),
        total_price: Number(values.total_price),
        status: values.status,
        payment_status: values.payment_status,
      });

      message.success("Order created successfully");
      notification.success({
        message: "Order Created",
        description: `New order for ${values.customer_name} has been added.`,
      });
      orderForm.resetFields();
      setIsOrderModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Order could not be created:", error);
      message.error("Failed to create order");
      notification.error({
        message: "Creation Error",
        description: "Unable to add the order. Please try again.",
      });
    }
  };

  const openOrderEditModal = (order) => {
    setEditingOrder(order);
    orderForm.setFieldsValue({
      customer_name: order.customer_name,
      product_name: order.product_name,
      quantity: order.quantity,
      total_price: order.total_price,
      status: order.status,
      payment_status: order.payment_status,
    });
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setEditingOrder(null);
    orderForm.resetFields();
  };

  const updateOrder = async (values) => {
    if (!editingOrder) return;

    try {
      await axios.put(`${ORDERS_API_URL}${editingOrder.id}`, {
        customer_name: values.customer_name,
        product_name: values.product_name,
        quantity: Number(values.quantity),
        total_price: Number(values.total_price),
        status: values.status,
        payment_status: values.payment_status,
      });

      message.success("Order updated successfully");
      notification.success({
        message: "Order Updated",
        description: `Order for ${values.customer_name} has been updated.`,
      });
      closeOrderModal();
      fetchOrders();
    } catch (error) {
      console.error("Order could not be updated:", error);
      message.error("Failed to update order");
      notification.error({
        message: "Update Error",
        description: "Unable to update the order. Please try again.",
      });
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`${ORDERS_API_URL}${orderId}`);
      message.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      console.error("Order could not be deleted:", error);
      message.error("Failed to delete order");
    }
  };

  const bulkDeleteOrders = async () => {
    if (selectedOrderIds.length === 0) {
      message.warning("No orders selected");
      return;
    }

    try {
      await Promise.all(
        selectedOrderIds.map((id) => axios.delete(`${ORDERS_API_URL}${id}`))
      );
      message.success(`Deleted ${selectedOrderIds.length} orders`);
      setSelectedOrderIds([]);
      setBulkSelectMode(null);
      fetchOrders();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      message.error("Failed to delete some orders");
    }
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllOrders = (checked) => {
    if (checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id || o.key));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const addEmployee = async (values) => {
    try {
      await axios.post(EMPLOYEES_API_URL, {
        full_name: values.full_name,
        position: values.position,
        department: values.department,
        email: values.email,
        phone: values.phone,
        salary: Number(values.salary),
        status: values.status,
      });

      message.success("Employee added successfully");
      notification.success({
        message: "Employee Added",
        description: `${values.full_name} has been added to the team.`,
      });
      employeeForm.resetFields();
      setIsEmployeeModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Employee could not be added:", error);
      message.error("Failed to add employee");
      notification.error({
        message: "Creation Error",
        description: "Unable to add the employee. Please try again.",
      });
    }
  };

  const openEmployeeEditModal = (employee) => {
    setEditingEmployee(employee);
    employeeForm.setFieldsValue({
      full_name: employee.full_name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      phone: employee.phone,
      salary: employee.salary,
      status: employee.status,
    });
    setIsEmployeeModalOpen(true);
  };

  const closeEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
    employeeForm.resetFields();
  };

  const updateEmployee = async (values) => {
    if (!editingEmployee) return;

    try {
      await axios.put(`${EMPLOYEES_API_URL}${editingEmployee.id}`, {
        full_name: values.full_name,
        position: values.position,
        department: values.department,
        email: values.email,
        phone: values.phone,
        salary: Number(values.salary),
        status: values.status,
      });

      message.success("Employee updated successfully");
      notification.success({
        message: "Employee Updated",
        description: `${values.full_name}'s profile has been updated.`,
      });
      closeEmployeeModal();
      fetchEmployees();
    } catch (error) {
      console.error("Employee could not be updated:", error);
      message.error("Failed to update employee");
      notification.error({
        message: "Update Error",
        description: "Unable to update the employee. Please try again.",
      });
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`${EMPLOYEES_API_URL}${employeeId}`);
      message.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("Employee could not be deleted:", error);
      message.error("Failed to delete employee");
    }
  };

  const bulkDeleteEmployees = async () => {
    if (selectedEmployeeIds.length === 0) {
      message.warning("No employees selected");
      return;
    }

    try {
      await Promise.all(
        selectedEmployeeIds.map((id) => axios.delete(`${EMPLOYEES_API_URL}${id}`))
      );
      message.success(`Deleted ${selectedEmployeeIds.length} employees`);
      setSelectedEmployeeIds([]);
      setBulkSelectMode(null);
      fetchEmployees();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      message.error("Failed to delete some employees");
    }
  };

  const toggleEmployeeSelection = (id) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllEmployees = (checked) => {
    if (checked) {
      setSelectedEmployeeIds(filteredEmployees.map((e) => e.id || e.key));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    ...(bulkSelectMode === "customers"
      ? [
          {
            title: (
              <input
                type="checkbox"
                checked={
                  selectedCustomerIds.length > 0 &&
                  selectedCustomerIds.length === filteredCustomers.length
                }
                onChange={(e) => toggleAllCustomers(e.target.checked)}
              />
            ),
            dataIndex: "checkbox",
            width: 50,
            render: (_, record) => (
              <input
                type="checkbox"
                checked={selectedCustomerIds.includes(record.id || record.key)}
                onChange={() => toggleCustomerSelection(record.id || record.key)}
              />
            ),
          },
        ]
      : []),
    {
      title: "Customer",
      dataIndex: "name",
      width: 260,
      render: (text, record) => (
        <div className="customer-name-cell">
          <Text strong>{text}</Text>
          <Text type="secondary" className="customer-company">
            • {record.company}
          </Text>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 250,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 180,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (status) => {
        let color = "blue";

        if (status === "VIP") color = "gold";
        if (status === "Active") color = "green";
        if (status === "Pending") color = "red";

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Deal Value",
      dataIndex: "value",
      width: 150,
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      title: "Action",
      width: 220,
      render: (_, record) => (
        <Space size="small" style={{ display: "flex" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete customer?"
            onConfirm={() => deleteCustomer(record.id || record.key)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const employeeSalaryRanks = employees
    .slice()
    .sort((a, b) => Number(b.salary) - Number(a.salary))
    .reduce((acc, emp, index) => {
      acc[emp.id] = index + 1;
      return acc;
    }, {});

  const filteredEmployees = employees.filter((employee) => {
    const query = employeeSearch.toLowerCase();
    const matchesSearch =
      employee.full_name.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query) ||
      employee.department.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.phone.toLowerCase().includes(query) ||
      employee.status.toLowerCase().includes(query);

    const matchesStatus =
      !employeeStatusFilter || employee.status === employeeStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const employeeColumns = [
    ...(bulkSelectMode === "employees"
      ? [
          {
            title: (
              <input
                type="checkbox"
                checked={
                  selectedEmployeeIds.length > 0 &&
                  selectedEmployeeIds.length === filteredEmployees.length
                }
                onChange={(e) => toggleAllEmployees(e.target.checked)}
              />
            ),
            dataIndex: "checkbox",
            width: 50,
            render: (_, record) => (
              <input
                type="checkbox"
                checked={selectedEmployeeIds.includes(record.id || record.key)}
                onChange={() => toggleEmployeeSelection(record.id || record.key)}
              />
            ),
          },
        ]
      : []),
    {
      title: "Rank",
      dataIndex: "id",
      width: 90,
      render: (_, record) => employeeSalaryRanks[record.id] || "-",
    },
    {
      title: "Full Name",
      dataIndex: "full_name",
      width: 220,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Position",
      dataIndex: "position",
      width: 180,
    },
    {
      title: "Department",
      dataIndex: "department",
      width: 180,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 240,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 180,
    },
    {
      title: "Salary",
      dataIndex: "salary",
      width: 160,
      render: (salary) => `$${Number(salary || 0).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (status) => {
        let color = "green";
        if (status === "Inactive") color = "red";
        if (status === "Onboarding") color = "gold";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      width: 220,
      render: (_, record) => (
        <Space size="small" style={{ display: "flex" }}>
          <Button icon={<EditOutlined />} onClick={() => openEmployeeEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete employee?"
            onConfirm={() => deleteEmployee(record.id || record.key)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((employee) => employee.status === "Active").length;
  const highestSalary = employees.reduce(
    (max, employee) => Math.max(max, Number(employee.salary || 0)),
    0
  );
  const averageSalary = totalEmployees
    ? Math.round(
        employees.reduce((sum, employee) => sum + Number(employee.salary || 0), 0) /
          totalEmployees
      )
    : 0;

  const totalRevenue = customers.reduce((sum, customer) => {
    return sum + Number(customer.value || 0);
  }, 0);

  const topCustomersByValue = [...customers]
    .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
    .slice(0, 10);

  const dealValueData = topCustomersByValue.map((customer) => ({
    customer: customer.name,
    value: Number(customer.value || 0),
  }));

  const statusCounts = customers.reduce(
    (acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    },
    { VIP: 0, Active: 0, Pending: 0 }
  );

  const statusData = Object.entries(statusCounts).map(([type, value]) => ({
    type,
    value,
  }));

  const totalStatusCount = Math.max(statusData.reduce((sum, item) => sum + item.value, 0), 1);

  const statusSummary = [
    { label: "VIP", count: statusCounts.VIP, color: "#fadb14" },
    { label: "Active", count: statusCounts.Active, color: "#52c41a" },
    { label: "Pending", count: statusCounts.Pending, color: "#1890ff" },
  ];

  const hasCustomerStatusData = statusData.some((item) => item.value > 0);
  const hasDealValueData = dealValueData.length > 0;

  const orderStatusCounts = orders.reduce(
    (acc, order) => {
      const statusKey = order.status || "New";
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    },
    { New: 0, Pending: 0, Processing: 0, Completed: 0, Cancelled: 0 }
  );

  const orderStatusData = Object.entries(orderStatusCounts)
    .map(([type, value]) => ({ type, value }))
    .filter((item) => item.value > 0);

  const hasOrderStatusData = orderStatusData.length > 0;

  const orderStatusSummary = [
    { label: "New", value: orderStatusCounts.New || 0 },
    { label: "Pending", value: orderStatusCounts.Pending || 0 },
    { label: "Processing", value: orderStatusCounts.Processing || 0 },
    { label: "Completed", value: orderStatusCounts.Completed || 0 },
    { label: "Cancelled", value: orderStatusCounts.Cancelled || 0 },
  ];

  const totalOrders = orders.length;
  const pendingOrders = orderStatusCounts.Pending || 0;
  const completedOrders = orderStatusCounts.Completed || 0;
  const processingOrders = orderStatusCounts.Processing || 0;
  const orderRevenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);

  const filteredOrders = orders.filter((order) => {
    const query = orderSearch.toLowerCase();
    return (
      order.customer_name.toLowerCase().includes(query) ||
      order.product_name.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.payment_status.toLowerCase().includes(query)
    );
  });

  const orderColumns = [
    ...(bulkSelectMode === "orders"
      ? [
          {
            title: (
              <input
                type="checkbox"
                checked={
                  selectedOrderIds.length > 0 &&
                  selectedOrderIds.length === filteredOrders.length
                }
                onChange={(e) => toggleAllOrders(e.target.checked)}
              />
            ),
            dataIndex: "checkbox",
            width: 50,
            render: (_, record) => (
              <input
                type="checkbox"
                checked={selectedOrderIds.includes(record.id || record.key)}
                onChange={() => toggleOrderSelection(record.id || record.key)}
              />
            ),
          },
        ]
      : []),
    {
      title: "Customer",
      dataIndex: "customer_name",
      width: 220,
    },
    {
      title: "Product",
      dataIndex: "product_name",
      width: 200,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 120,
      render: (quantity) => quantity || 0,
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      width: 140,
      render: (total_price) => `$${Number(total_price || 0).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (status) => {
        let color = "orange";
        if (status === "Completed") color = "green";
        if (status === "Cancelled") color = "red";
        if (status === "Processing" || status === "Pending") color = "gold";
        if (status === "New") color = "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Payment",
      dataIndex: "payment_status",
      width: 140,
      render: (payment_status) => {
        const color = payment_status === "Paid" ? "green" : "red";
        return <Tag color={color}>{payment_status}</Tag>;
      },
    },
    {
      title: "Action",
      width: 220,
      render: (_, record) => (
        <Space size="small" style={{ display: "flex" }}>
          <Button icon={<EditOutlined />} onClick={() => openOrderEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete order?"
            onConfirm={() => deleteOrder(record.id || record.key)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const chartTheme = {
    styleSheet: {
      background: "transparent",
      textColor: isDarkMode ? "#f8fafc" : "#0f172a",
    },
  };

  const dealValueConfig = {
    autoFit: true,
    data: dealValueData,
    xField: "customer",
    yField: "value",
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: true,
        rotate: -30,
        style: {
          fill: isDarkMode ? "#e2e8f0" : "#334155",
          fontSize: 12,
        },
      },
      line: {
        style: {
          stroke: isDarkMode ? "#334155" : "#d1d5db",
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v) => `$${v}`,
        style: {
          fill: isDarkMode ? "#e2e8f0" : "#334155",
        },
      },
      line: {
        style: {
          stroke: isDarkMode ? "#334155" : "#d1d5db",
        },
      },
    },
    meta: {
      value: {
        alias: "Deal Value",
      },
      customer: {
        alias: "Customer",
      },
    },
    tooltip: {
      showMarkers: false,
    },
    interactions: [{ type: "active-region" }],
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    height: 340,
    color: isDarkMode ? ["#38bdf8"] : ["#2563eb"],
    label: {
      style: {
        fill: isDarkMode ? "#0f172a" : "#ffffff",
      },
    },
    theme: chartTheme,
  };

  const statusConfig = {
    autoFit: true,
    data: statusData,
    angleField: "value",
    colorField: "type",
    color: ["#fadb14", "#52c41a", "#1890ff"],
    radius: 0.8,
    label: {
      type: "inner",
      offset: "-30%",
      content: ({ type, percentage }) => `${type}\n${percentage}`,
      style: {
        textAlign: "center",
        fill: isDarkMode ? "#f8fafc" : "#0f172a",
      },
    },
    legend: {
      position: "bottom",
    },
    interactions: [{ type: "element-active" }],
    height: 240,
    theme: chartTheme,
  };

  const orderStatusConfig = {
    autoFit: true,
    data: orderStatusData,
    angleField: "value",
    colorField: "type",
    radius: 0.75,
    label: {
      type: "spider",
      labelHeight: 28,
      content: ({ type, percentage }) => `${type}\n${percentage}`,
      style: {
        fill: isDarkMode ? "#f8fafc" : "#0f172a",
      },
    },
    legend: {
      position: "bottom",
    },
    tooltip: {
      showTitle: true,
    },
    interactions: [{ type: "element-active" }],
    height: 320,
    theme: chartTheme,
  };

  const bottomNavItems = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "customers", icon: <TeamOutlined />, label: "Customers" },
    { key: "employees", icon: <UserOutlined />, label: "Employees" },
    { key: "orders", icon: <ShoppingCartOutlined />, label: "Orders" },
    { key: "analytics", icon: <BarChartOutlined />, label: "Analytics" },
    { key: "cloud", icon: <GlobalOutlined />, label: "Cloud Network" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  ];

  const sectionTitles = {
    dashboard: "Dashboard",
    customers: "Customers",
    orders: "Orders & Deals",
    employees: "Employees",
    analytics: "Analytics",
    cloud: "Cloud Network",
    settings: "Settings",
  };

  const sectionDescriptions = {
    dashboard: "Live CRM insights, activity, and summary metrics.",
    customers: "Manage customer records, search, add, edit, and delete contacts.",
    employees: "Manage your employee roster, rankings, salary metrics, and staffing status.",
    orders: "Track orders, order status, revenue, and deal pipeline performance.",
    analytics: "Revenue and customer analytics for informed decisions.",
    cloud: "Cloud network overview and operational readiness.",
    settings: "Profile, theme preferences, and logout controls.",
  };

  const renderSectionContent = () => {
    const pageLoadingFallback = <div style={{ padding: "40px", textAlign: "center" }}>Loading page...</div>;

    switch (activeNav) {
      case "dashboard":
        return (
          <Suspense fallback={pageLoadingFallback}>
            <DashboardPage
              customers={customers}
              orders={orders}
              totalRevenue={totalRevenue}
              totalOrders={totalOrders}
              completedOrders={completedOrders}
              processingOrders={processingOrders}
              orderRevenue={orderRevenue}
              statusSummary={statusSummary}
              statusData={statusData}
              dealValueData={dealValueData}
              statusConfig={statusConfig}
              dealValueConfig={dealValueConfig}
              hasCustomerStatusData={hasCustomerStatusData}
              hasDealValueData={hasDealValueData}
              totalStatusCount={totalStatusCount}
            />
          </Suspense>
        );

      case "customers":
        return (
          <Suspense fallback={pageLoadingFallback}>
            <CustomersPage
              customers={customers}
              filteredCustomers={filteredCustomers}
              search={search}
              setSearch={setSearch}
              columns={columns}
              bulkSelectMode={bulkSelectMode}
              setBulkSelectMode={setBulkSelectMode}
              selectedCustomerIds={selectedCustomerIds}
              setSelectedCustomerIds={setSelectedCustomerIds}
              deleteCustomer={deleteCustomer}
              bulkDeleteCustomers={bulkDeleteCustomers}
              openEditModal={openEditModal}
              setOpen={setOpen}
            />
          </Suspense>
        );

      case "employees":
        return (
          <Suspense fallback={pageLoadingFallback}>
            <EmployeesPage
              employees={employees}
              filteredEmployees={filteredEmployees}
              employeeSearch={employeeSearch}
              setEmployeeSearch={setEmployeeSearch}
              employeeStatusFilter={employeeStatusFilter}
              setEmployeeStatusFilter={setEmployeeStatusFilter}
              employeeColumns={employeeColumns}
              bulkSelectMode={bulkSelectMode}
              setBulkSelectMode={setBulkSelectMode}
              selectedEmployeeIds={selectedEmployeeIds}
              setSelectedEmployeeIds={setSelectedEmployeeIds}
              deleteEmployee={deleteEmployee}
              bulkDeleteEmployees={bulkDeleteEmployees}
              openEmployeeEditModal={openEmployeeEditModal}
              setIsEmployeeModalOpen={setIsEmployeeModalOpen}
              employeeForm={employeeForm}
              totalEmployees={totalEmployees}
              activeEmployees={activeEmployees}
              averageSalary={averageSalary}
              highestSalary={highestSalary}
            />
          </Suspense>
        );

      case "orders":
        return (
          <Suspense fallback={pageLoadingFallback}>
            <OrdersPage
              orders={orders}
              filteredOrders={filteredOrders}
              orderSearch={orderSearch}
              setOrderSearch={setOrderSearch}
              orderColumns={orderColumns}
              bulkSelectMode={bulkSelectMode}
              setBulkSelectMode={setBulkSelectMode}
              selectedOrderIds={selectedOrderIds}
              setSelectedOrderIds={setSelectedOrderIds}
              deleteOrder={deleteOrder}
              bulkDeleteOrders={bulkDeleteOrders}
              openOrderEditModal={openOrderEditModal}
              setIsOrderModalOpen={setIsOrderModalOpen}
              orderForm={orderForm}
              totalOrders={totalOrders}
              completedOrders={completedOrders}
              pendingOrders={pendingOrders}
              orderRevenue={orderRevenue}
            />
          </Suspense>
        );

      case "analytics":
        return (
          <Suspense fallback={pageLoadingFallback}>
            <AnalyticsPage
              customers={customers}
              orders={orders}
              totalRevenue={totalRevenue}
              totalOrders={totalOrders}
              completedOrders={completedOrders}
              processingOrders={processingOrders}
              orderRevenue={orderRevenue}
              dealValueData={dealValueData}
              statusData={statusData}
              orderStatusData={orderStatusData}
              dealValueConfig={dealValueConfig}
              statusConfig={statusConfig}
              orderStatusConfig={orderStatusConfig}
              hasDealValueData={hasDealValueData}
              hasCustomerStatusData={hasCustomerStatusData}
              hasOrderStatusData={hasOrderStatusData}
              orderStatusSummary={orderStatusSummary}
            />
          </Suspense>
        );

      case "cloud":
        return (
          <Suspense fallback={pageLoadingFallback}>
            <CloudPage customers={customers} />
          </Suspense>
        );

      case "settings":
        return (
          <Suspense fallback={pageLoadingFallback}>
            <SettingsPage
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              handleLogout={handleLogout}
              themeIcon={themeIcon}
            />
          </Suspense>
        );

      default:
        return null;
    }
  };

  const analyticsSection = (
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
  );

  const databaseSection = (
    <>
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
    </>
  );

  const employeesSection = (
    <>
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
            setEditingEmployee(null);
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
    </>
  );

  const ordersSection = (
    <>
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
            setEditingOrder(null);
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
    </>
  );

  const overviewSection = (
    <>
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
    </>
  );

  const fullscreenTitles = {
    analytics: "Customer Analytics",
    customers: "Customer Database",
    employees: "Employee Roster",
    orders: "Order Pipeline",
    overview: "Cloud Network Overview",
  };

  const renderFullScreenContent = () => {
    switch (fullscreenCard) {
      case "analytics":
        return analyticsSection;
      case "customers":
        return (
          <>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 18 }}>
              <Text strong>Customers Fullscreen View</Text>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setBulkSelectMode(bulkSelectMode === "customers" ? null : "customers")}
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
            </Space>
            {databaseSection}
          </>
        );
      case "employees":
        return (
          <>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 18 }}>
              <Text strong>Employees Fullscreen View</Text>
            </Space>
            {employeesSection}
          </>
        );
      case "orders":
        return (
          <>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 18 }}>
              <Text strong>Orders Fullscreen View</Text>
            </Space>
            {ordersSection}
          </>
        );
      case "overview":
        return overviewSection;
      default:
        return null;
    }
  };

  const configProviderTheme = {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#2563eb",
      colorBgBase: isDarkMode ? "#0f172a" : "#eef4ff",
      colorBgContainer: isDarkMode ? "#111827" : "#ffffff",
      colorText: isDarkMode ? "#f8fafc" : "#0f172a",
      colorBorder: isDarkMode ? "#334155" : "#d1d5db",
      colorFillAlter: isDarkMode ? "#1e293b" : "#f8fafc",
      borderRadius: 18,
    },
  };

  const themeIcon = isDarkMode ? <SunOutlined /> : <MoonOutlined />;

  if (!isAuthenticated) {
    return (
      <ConfigProvider theme={configProviderTheme}>
        <div className="login-page">
          <Card className="login-card" variant="plain">
            <div className="login-header">
              <CloudOutlined className="login-icon" />
              <div>
                <Title level={3}>Cloud CRM Sign In</Title>
                <Text type="secondary">
                  Use demo credentials to access the CRM dashboard.
                </Text>
              </div>
            </div>

          <Form
            form={loginForm}
            layout="vertical"
            onFinish={handleLogin}
            className="login-form"
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Please enter your username" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="admin" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="admin123"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Log In
              </Button>
            </Form.Item>

            <Text type="secondary">
              Demo credentials: admin / admin123
            </Text>
          </Form>
        </Card>
      </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={configProviderTheme}>
      <Layout className="app-layout">
      <Sider
        width={260}
        className="sidebar"
        breakpoint="lg"
        collapsedWidth={0}
        collapsed={isSidebarCollapsed}
        onBreakpoint={(broken) => setIsSidebarCollapsed(broken)}
        trigger={null}
      >
        <div className="brand">
          <CloudOutlined className="brand-icon" />
          <div>
            <h2>Cloud CRM</h2>
            <p>Wholesale Company</p>
          </div>
        </div>

        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          selectedKeys={[activeNav]}
          onClick={({ key }) => setActiveNav(key)}
          items={[
            { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "customers", icon: <TeamOutlined />, label: "Customers" },
            { key: "employees", icon: <UserOutlined />, label: "Employees" },
            { key: "orders", icon: <ShoppingCartOutlined />, label: "Orders" },
            { key: "analytics", icon: <BarChartOutlined />, label: "Analytics" },
            { key: "cloud", icon: <GlobalOutlined />, label: "Cloud Network" },
            { key: "settings", icon: <SettingOutlined />, label: "Settings" },
          ]}
        />

        <div className="cloud-status">
          <Text>Cloud Status</Text>
          <h3>Online</h3>
          <p>VPC • VPN • DNS Ready</p>
        </div>
      </Sider>

      <Layout className="main-layout">
        <Header className="header">
          <div>
            <Title level={3}>Customer Relationship Management</Title>
            <Text type="secondary">
              Cloud based CRM system for clothing wholesale business
            </Text>
          </div>

          <Space wrap>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              Add Customer
            </Button>
            <Button
              type="default"
              size="large"
              icon={themeIcon}
              onClick={toggleTheme}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button type="default" size="large" onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>

        <Content className="content">
          <div className="section-heading">
            <Title level={3}>{sectionTitles[activeNav]}</Title>
            <Text type="secondary">{sectionDescriptions[activeNav]}</Text>
          </div>
          {renderSectionContent()}

          <Modal
            title={fullscreenTitles[fullscreenCard]}
            open={!!fullscreenCard}
            onCancel={closeFullScreen}
            footer={null}
            width="100vw"
            style={{ top: 0, padding: 0 }}
            styles={{ body: { minHeight: "100vh", padding: 24, overflow: "auto" } }}
          >
            <Card variant="plain">{renderFullScreenContent()}</Card>
          </Modal>
        </Content>
      </Layout>

      <div className="bottom-navbar" role="navigation" aria-label="Bottom navigation">
        <div className="bottom-navbar-inner">
          {bottomNavItems.map((item) => (
            <div
              key={item.key}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveNav(item.key);
              }}
              className={activeNav === item.key ? "bottom-navbar-item active" : "bottom-navbar-item"}
              onClick={() => setActiveNav(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title="Add New Customer"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="90vw"
        style={{ maxWidth: 520 }}
        styles={{ body: { padding: 24 } }}
      >
        <Form layout="vertical" form={form} onFinish={addCustomer}>
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company Type"
            rules={[{ required: true }]}
          >
            <Input placeholder="Retail store, distributor..." />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="Active">
            <Select
              options={[
                { value: "Active", label: "Active" },
                { value: "VIP", label: "VIP" },
                { value: "Pending", label: "Pending" },
              ]}
            />
          </Form.Item>

          <Form.Item name="value" label="Deal Value" rules={[{ required: true }]}>
            <Input placeholder="12000" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save Customer
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Edit Customer"
        open={isEditModalOpen}
        onCancel={closeEditModal}
        footer={null}
        width="90vw"
        style={{ maxWidth: 520 }}
        styles={{ body: { padding: 24 } }}
      >
        <Form layout="vertical" form={editForm} onFinish={updateCustomer}>
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company Type"
            rules={[{ required: true }]}
          >
            <Input placeholder="Retail store, distributor..." />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select
              options={[
                { value: "Active", label: "Active" },
                { value: "VIP", label: "VIP" },
                { value: "Pending", label: "Pending" },
              ]}
            />
          </Form.Item>

          <Form.Item name="value" label="Deal Value" rules={[{ required: true }]}
          >
            <Input placeholder="12000" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Update Customer
          </Button>
        </Form>
      </Modal>

      <Modal
        title={editingOrder ? "Edit Order" : "Add Order"}
        open={isOrderModalOpen}
        onCancel={closeOrderModal}
        footer={null}
        width="90vw"
        style={{ maxWidth: 520 }}
        styles={{ body: { padding: 24 } }}
      >
        <Form layout="vertical" form={orderForm} onFinish={editingOrder ? updateOrder : addOrder}>
          <Form.Item
            name="customer_name"
            label="Customer Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          <Form.Item
            name="product_name"
            label="Product Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter quantity" />
          </Form.Item>

          <Form.Item
            name="total_price"
            label="Total Price"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter total order value" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="Pending">
            <Select
              options={[
                { value: "Pending", label: "Pending" },
                { value: "Completed", label: "Completed" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
            />
          </Form.Item>

          <Form.Item name="payment_status" label="Payment Status" initialValue="Unpaid">
            <Select
              options={[
                { value: "Paid", label: "Paid" },
                { value: "Unpaid", label: "Unpaid" },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            {editingOrder ? "Update Order" : "Save Order"}
          </Button>
        </Form>
      </Modal>

      <Modal
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        open={isEmployeeModalOpen}
        onCancel={closeEmployeeModal}
        footer={null}
        width="90vw"
        style={{ maxWidth: 520 }}
        styles={{ body: { padding: 24 } }}
      >
        <Form
          layout="vertical"
          form={employeeForm}
          onFinish={editingEmployee ? updateEmployee : addEmployee}
        >
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter position" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter department" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="salary"
            label="Salary"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter salary" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="Active">
            <Select
              options={[
                { value: "Active", label: "Active" },
                { value: "Onboarding", label: "Onboarding" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            {editingEmployee ? "Update Employee" : "Save Employee"}
          </Button>
        </Form>
      </Modal>
    </Layout>
    </ConfigProvider>
  );
}

export default App;