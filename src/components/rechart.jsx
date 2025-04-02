import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Rechart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={data}>
        {/* <CartesianGrid stroke="#ccc" strokeDasharray="5 5" /> */}
        <XAxis dataKey="name" />
        <YAxis dataKey="sales" />
        <Tooltip />
        <Legend />
        <Bar type="monotone" dataKey="sales" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Rechart;
