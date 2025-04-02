import { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "../components/pagination";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPage = Math.ceil(orders.length / itemsPerPage);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8081/admin/orders");

      // Format the date before setting state
      const formattedOrders = res.data.map((order) => ({
        ...order,
        created_at: new Date(order.created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      }));
      setOrders(formattedOrders);
      console.log(formattedOrders[0])
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8081/admin/orders/${id}`, {
        status: newStatus,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/admin/orders/${id}`);
      setOrders(orders.filter((order) => order.orderId !== id));
    } catch (err) {
      console.error("Failed to delete order", err);
    }
  };

  return (
    <div>
      <h2>Order List</h2>
      <table className="adminTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total Price</th>
            <th>Address</th>
            <th>Status</th>
            <th>Order Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.customerName}</td>
              <td>
                {JSON.parse(order.items).map((item, index) => (
                  <div key={index}>
                    {item.productName} (x{item.quantity})
                  </div>
                ))}
              </td>
              <td>RM{order.total_price}</td>
              <td>{[order.street, order.city, order.state, order.postcode, order.country].join(',')}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(order.orderId, e.target.value)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="canceled">Canceled</option>
                </select>
              </td>
              <td>{order.created_at}</td>
              <td>
                <button
                  className="inactive-button"
                  onClick={() => deleteOrder(order.orderId)}
                >
                  Delete
                </button>
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
