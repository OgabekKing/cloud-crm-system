from pydantic import BaseModel


class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str
    company: str
    status: str
    value: int


class CustomerCreate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    customer_name: str
    product_name: str
    quantity: int
    total_price: int
    status: str
    payment_status: str


class OrderCreate(OrderBase):
    pass


class Order(OrderBase):
    id: int

    class Config:
        from_attributes = True


class EmployeeBase(BaseModel):
    full_name: str
    position: str
    department: str
    email: str
    phone: str
    salary: int
    status: str


class EmployeeCreate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: int

    class Config:
        from_attributes = True