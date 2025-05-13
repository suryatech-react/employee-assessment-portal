import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomBarChart = ({ data, xKey, yKey, height = 300, colors = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b'], barSize = 30 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey={xKey} 
          tick={{ fill: '#6b7280' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#6b7280' }}
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{
            borderRadius: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: 'none'
          }}
          formatter={(value) => [value, 'Score']}
          labelFormatter={(label) => `Category: ${label}`}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: 20
          }}
        />
        <Bar 
          dataKey={yKey} 
          fill={colors[0]}
          radius={[4, 4, 0, 0]}
          name="Score"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;