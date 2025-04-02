import { useState } from "react";
import axios from "axios";

function AdminAddProduct() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    image: null,
    is_active: 0,
  });

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("image", formData.image);
    formDataToSend.append("is_active", formData.is_active);

    try {
      const res = await axios.post(
        "http://localhost:8081/add-product",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Product upload successfully");
    } catch (err) {
      console.error("Error uploading product:", err);
      alert("Product upload failed!");
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name:</label>
          <input
            type="text"
            name="title"
            placeholder="Enter product name"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            name="price"
            placeholder="Enter price"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            placeholder="Enter stock"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>
            Active Product?
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active === 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.checked ? 1 : 0,
                })
              }
            />
          </label>
        </div>

        <div className="form-group">
          <label>Product Image:</label>
          <input type="file" name="image" onChange={handleChange} required />
        </div>

        <button className="active-button" type="submit">
          Upload Product
        </button>
      </form>
    </div>
  );
}

export default AdminAddProduct;
