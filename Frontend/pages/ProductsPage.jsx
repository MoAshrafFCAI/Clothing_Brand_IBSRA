import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/products`).then(res => res.json()).then(setProducts);
  }, []);

  const addToCart = (product_id) => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch(`${API}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id, quantity: 1 }),
    }).then(() => alert("Added to cart!"));
  };

  return (
    <div>
      <h2>Products</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {products.map(p => (
          <div key={p.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10, width: 200 }}>
            <img src={p.image} alt={p.name} style={{ width: "100%" }} />
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p>${p.price}</p>
            <button onClick={() => addToCart(p.id)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage; 