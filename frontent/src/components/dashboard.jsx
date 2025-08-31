
import { useState, useEffect } from 'react';
import axios from 'axios';

import {PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer}
 from 'recharts';

// const stageData = [
//   { name: 'Lead', value: 300 },
//   { name: 'Prospect', value: 200 },
//   { name: 'Convert', value: 100 },
//   { name: 'Closed Won', value: 150 },
//   { name: 'Closed Lost', value: 70 },
// ];

// const monthData = [
//   { month: 'Jan', deals: 20 },
//   { month: 'Feb', deals: 25 },
//   { month: 'Mar', deals: 18 },
//   { month: 'Apr', deals: 30 },
//   { month: 'May', deals: 22 },
//   { month: 'Jun', deals: 27 },
//   { month: 'Jul', deals: 35 },
//   { month: 'Aug', deals: 40 },
// ];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57'];


const DashBoard = () => {
   const [deals, setDeals] = useState([]); // Initialize deals as an empty array
  const [newStageData, setNewStageData] = useState([]);
  const [newMonthData, setNewMonthData] = useState([]);

    const fetchAllDelasCustomers = async () => {

    try{
      const res = await axios.get(`http://localhost:8000/api/get/deals-contacts`);
    
      const stages = ['Lead', 'Prospect', 'Convert', 'Closed Won', 'Closed Lost'];
      const stageCounts = stages.map(stage => {
        const count = res.data.filter(deal => deal.stage.toLowerCase() === stage.toLowerCase()).length; 
        return { name: stage, value: count };
      });
      setNewStageData(stageCounts);

        

      const monthCounts = [];
      res.data.forEach(deal => {
        const month = new Date(deal.date).toLocaleString('default', { month: 'short' });
        const existingMonth = monthCounts.find(item => item.month === month);
        if (existingMonth) {
          existingMonth.deals += 1; 
        } else {
          monthCounts.push({ month, deals: 1 });
        }
      });
      setNewMonthData(monthCounts);
  
    }catch(err){
      console.log(err)
    }
  }

  useEffect(() => {
    fetchAllDelasCustomers()
  },[])
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      {/* Deals by Stage (Pie Chart) */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Deals by Stage</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={newStageData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {newStageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Deals by Month (Bar Chart) */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Deals by Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={newMonthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="deals" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashBoard;
