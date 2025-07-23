import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../App";

const API = "http://localhost:8000";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const fetchCart = () => {
    fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setCart);
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const removeFromCart = (product_id) => {
    setLoading(true);
    fetch(`${API}/cart/remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id }),
    })
      .then(() => fetchCart())
      .finally(() => setLoading(false));
  };

  const updateQuantity = (product_id, quantity) => {
    setLoading(true);
    fetch(`${API}/cart/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id, quantity }),
    })
      .then(() => fetchCart())
      .finally(() => setLoading(false));
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div>
      <h2>Cart</h2>
      {loading && <div>Updating...</div>}
      <ul>
        {cart.map((item, i) => (
          <li key={i}>
            {item.product.name} x
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={e => updateQuantity(item.product.id, +e.target.value)}
              style={{ width: 40, margin: "0 8px" }}
              disabled={loading}
            />
            (${item.product.price * item.quantity})
            <button onClick={() => removeFromCart(item.product.id)} disabled={loading} style={{ marginLeft: 8 }}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <h3>Total: ${total}</h3>
    </div>
  );
}

export default CartPage; 