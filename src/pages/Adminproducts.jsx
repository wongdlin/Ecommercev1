import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/pagination";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const locationOrigin = window.location.origin;
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPage = Math.ceil(products.length / itemsPerPage);

  const handleClick = (id) => {
    navigate(`edit?id=${id}`);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8081/admin/productslist");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const SetProductsActive = async (id, active) => {
    try {
      await axios.put(`http://localhost:8081/admin/productslist/${id}`, {
        is_active: active,
      });
      fetchProducts();
    } catch (err) {
      console.log("Failed to update product status", err);
    }
  };

  return (
    <div>
      <h2>Products List</h2>
      <Link to="/admin/add-product">
        <button className="active-button">Add Product</button>
      </Link>

      <table className="adminTable">
        <thead>
          <tr>
            <td>Product ID</td>
            <td>Image</td>
            <td>Name</td>
            <td>Price</td>
            <td>Stock</td>
            <td>Active</td>
            <td>Edit</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((products) => (
            <tr key={products.id}>
              <td>{products.id}</td>
              <td>
                <img
                  src={`${locationOrigin}/${products.image.replace(
                    /^\/+/,
                    ""
                  )}`}
                  alt={products.title}
                />
              </td>
              <td>{products.title}</td>
              <td>{products.price}</td>
              <td>{products.stock}</td>
              <td className={products.is_active === 1 ? "active" : "inactive"}>
                {products.is_active === 1 ? "Active" : "Inactive"}
              </td>
              <td>
                <button onClick={() => handleClick(products.id)}>Edit</button>
              </td>
              <td>
                {products.is_active === 1 ? (
                  <button
                    value={0}
                    className="inactive-button"
                    onClick={() => SetProductsActive(products.id, 0)}
                  >
                    Inactive
                  </button>
                ) : (
                  <button
                    value={1}
                    className="active-button"
                    onClick={() => SetProductsActive(products.id, 1)}
                  >
                    Active
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
