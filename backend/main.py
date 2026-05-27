from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers.customers import router as customer_router
from routers.orders import router as order_router
from routers.employees import router as employee_router
from sqlalchemy.orm import Session
from database import SessionLocal
import random
import faker
from sqlalchemy.exc import SQLAlchemyError

models.Base.metadata.create_all(bind=engine)


# Seed demo data if empty
def seed_demo_data():
    db = SessionLocal()
    try:
        # Seed customers up to 50
        current_customer_count = db.query(models.Customer).count()
        if current_customer_count < 50:
            fake = faker.Faker()
            companies = [
                "BlueThread Distributors",
                "UrbanStitch Wholesale",
                "FabricFlow Traders",
                "ModaLine Suppliers",
                "NextWear Garments",
                "StyleHub Textiles",
                "TrendCrafters Ltd",
                "PrimeCloth Merchants",
                "WearHouse Collective",
                "ThreadWorks Exports",
            ]

            statuses = ["VIP", "Active", "Pending"]

            customers_to_add = 50 - current_customer_count
            for _ in range(customers_to_add):
                cust = models.Customer(
                    name=fake.name(),
                    email=fake.email(),
                    phone=fake.phone_number(),
                    company=random.choice(companies),
                    status=random.choice(statuses),
                    value=random.randint(1000, 50000),
                )
                db.add(cust)

        # Seed employees if empty
        if db.query(models.Employee).count() == 0:
            fake = faker.Faker()
            roles = [
                "Sales Manager",
                "CRM Specialist",
                "Warehouse Coordinator",
                "Accountant",
                "Marketing Specialist",
                "Customer Support",
                "Operations Manager",
            ]
            depts = ["Sales", "Operations", "Finance", "Marketing", "Support"]
            salaries = [85000, 72000, 68000, 60000, 54000, 48000, 43000, 39000, 35000, 30000]

            for i in range(10):
                emp = models.Employee(
                    full_name=fake.name(),
                    position=random.choice(roles),
                    department=random.choice(depts),
                    email=fake.email(),
                    phone=fake.phone_number(),
                    salary=salaries[i % len(salaries)],
                    status=random.choice(["Active", "Onboarding", "Inactive"]),
                )
                db.add(emp)

        # Seed orders up to 50 without deleting existing records
        current_order_count = db.query(models.Order).count()
        if current_order_count < 50:
            fake = faker.Faker()
            products = [
                "T-Shirts",
                "Hoodies",
                "Jackets",
                "Jeans",
                "Dresses",
                "Sneakers",
                "Shirts",
                "Coats",
            ]
            statuses = ["New", "Processing", "Completed", "Cancelled"]
            payment_statuses = ["Paid", "Unpaid"]
            customer_names = [customer.name for customer in db.query(models.Customer).all()]
            if not customer_names:
                customer_names = ["Retail Client"]

            orders_to_add = 50 - current_order_count
            for _ in range(orders_to_add):
                product = random.choice(products)
                quantity = random.randint(1, 8)
                unit_price = random.randint(20, 250)
                total_price = quantity * unit_price

                order = models.Order(
                    customer_name=random.choice(customer_names),
                    product_name=product,
                    quantity=quantity,
                    total_price=total_price,
                    status=random.choice(statuses),
                    payment_status=random.choice(payment_statuses),
                )
                db.add(order)

        db.commit()

    except SQLAlchemyError:
        db.rollback()
    finally:
        db.close()


seed_demo_data()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customer_router)
app.include_router(order_router)
app.include_router(employee_router)


@app.get("/")
def root():
    return {"message": "Cloud CRM API is running"}