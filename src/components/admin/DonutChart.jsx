import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CustomDonutChart = ({ data, colors, height = 300, innerRadius = '70%', outerRadius = '90%' }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value}`, 'Count']}
          contentStyle={{
            borderRadius: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ paddingTop: 20 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomDonutChart;