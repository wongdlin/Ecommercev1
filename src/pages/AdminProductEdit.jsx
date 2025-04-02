import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function AdminProductEdit() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  // State for form fields
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    stock: "",
    is_active: 0,
    image: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/admin/productslist/${productId}`
      );
      setFormData(res.data);
      setImagePreview(`http://localhost:5173/${res.data.image}`); // Adjust if needed
    } catch (err) {
      console.error("Failed to fetch product", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    try {
      await axios.put(
        `http://localhost:8081/admin/productslist/${productId}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Product updated successfully!");
    } catch (err) {
      console.error("Failed to update product", err);
    }
  };

  return (
    <div className="form-container">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Product Name:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
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
              checked={formData.is_active}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="form-group">
          <label>Current Image:</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Product Preview"
              className="image-preview"
            />
          )}
        </div>

        <div className="form-group">
          <label>Upload New Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>

        <button className="active-button" type="submit">
          Update Product
        </button>
      </form>
    </div>
  );
}
