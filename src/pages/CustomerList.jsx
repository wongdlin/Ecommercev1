import { useState, useEffect } from "react";
import Pagination from "../components/pagination";
import axios from "axios";

export default function CustomerList() {
  const [customer, setCustomer] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastCustomer = currentPage * itemsPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - itemsPerPage;
  const currentItems = customer.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPage = Math.ceil(customer.length / itemsPerPage);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const res = await axios.get("http://localhost:8081/admin/customerlist");
      setCustomer(res.data);
    } catch (err) {
      console.error("Failed to fetch customer", err);
    }
  };

  const deleteCustomer = async(id)=>{
    try{
        await axios.delete(`http://localhost:8081/admin/customerlist/${id}`)
        setCustomer(customer.filter((customer) => customer.id !== id))
    }catch(err){
        console.log("Failed to delete customer", err)
    }
  }

  return (
    <div>
      <h2>Customer List</h2>
      <table className="adminTable">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{[customer.street, customer.city, customer.state, customer.postcode, customer.country].join(',')}</td>
              <td>
                <button className="inactive-button" onClick={() => deleteCustomer(customer.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
      currentPage = {currentPage}
      totalPages={totalPage}
      onPageChange={setCurrentPage}/>
    </div>
  );
}
