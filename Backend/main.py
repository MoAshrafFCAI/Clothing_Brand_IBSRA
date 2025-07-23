from fastapi import FastAPI, HTTPException, Depends, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import os

from .models import User, Product, CartItem
from .database import SessionLocal
from .schemas import UserCreate, UserOut, ProductCreate, ProductOut, CartItemOut
from .security.token import create_access_token, get_current_user
from .security.password import get_password_hash, verify_password

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#Auth endpoints
@app.post("/signup", response_model=dict)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == user.username) | (User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    db_user = User(username=user.username, email=user.email, hashed_password=get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully"}

@app.post("/token", response_model=dict)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token({"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

#Product endpoints
@app.get("/products", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@app.post("/products", response_model=dict)
def add_product(
    product: ProductCreate,
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Only admin can add products")
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return {"message": "Product added", "product": db_product.__dict__}

#Cart endpoints
@app.post("/cart/add", response_model=dict)
def add_to_cart(
    item: CartItemOut,
    user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.user_id == user.id, CartItem.product_id == item.product.id).first()
    if cart_item:
        cart_item.quantity += item.quantity
    else:
        cart_item = CartItem(user_id=user.id, product_id=item.product.id, quantity=item.quantity)
        db.add(cart_item)
    db.commit()
    return {"message": "Added to cart"}

@app.delete("/cart/remove", response_model=dict)
def remove_from_cart(product_id: int = Body(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.user_id == user.id, CartItem.product_id == product_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    db.delete(cart_item)
    db.commit()
    return {"message": "Removed from cart"}

@app.patch("/cart/update", response_model=dict)
def update_cart_item(product_id: int = Body(...), quantity: int = Body(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.user_id == user.id, CartItem.product_id == product_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    if quantity < 1:
        db.delete(cart_item)
    else:
        cart_item.quantity = quantity
    db.commit()
    return {"message": "Cart updated"}

@app.get("/cart", response_model=List[CartItemOut])
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    return [{"product": i.product, "quantity": i.quantity} for i in items]

@app.post("/order", response_model=dict)
def place_order(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    for item in items:
        if item.product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {item.product.name}")
        item.product.quantity -= item.quantity
        db.delete(item)
    db.commit()
    return {"message": "Order placed successfully"}

