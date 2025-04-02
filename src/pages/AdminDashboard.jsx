import { useState, useEffect } from "react";
import axios from "axios";
import Rechart from "../components/rechart";

export default function AdminDashboard() {
  const [sales, setSales] = useState({
    totalSalesYear: 0,
    totalSalesMonth: 0,
    totalSalesDay: 0,
    salesByMonth: [],
  });

  useEffect(() => {
    axios
      .get("http://localhost:8081/admin/sales-summary")
      .then((res) => setSales(res.data))
      .catch((err) => console.error("Error fetching sales summary:", err));
  }, []);

  const monthlySales = sales.salesByMonth.map((monthly) => {
    return { name: monthly.totalSalesMonth, sales: monthly.totalSales };
  });

  return (
    <>
      <div className="dashboard">
        <div className="dashboard-container">
          <h3>Yearly Sales</h3>
          <p>${sales.totalSalesYear.toFixed(2)}</p>
        </div>
        <div className="dashboard-container">
          <h3>Monthly Sales</h3>
          <p>${sales.totalSalesMonth.toFixed(2)}</p>
        </div>
        <div className="dashboard-container">
          <h3>Daily Sales</h3>
          <p>${sales.totalSalesDay.toFixed(2)}</p>
        </div>
      </div>
      <div className="chart-container">
        <Rechart data={monthlySales} />
      </div>
    </>
  );
}
