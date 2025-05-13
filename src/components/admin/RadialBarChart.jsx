import React from 'react';
import { RadialBarChart, RadialBar, Cell, ResponsiveContainer, PolarAngleAxis, Tooltip, Legend } from 'recharts';

const CustomRadialBarChart = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart
        innerRadius="10%"
        outerRadius="90%"
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
          fill="#8884d8"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </RadialBar>
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Completion']}
          contentStyle={{
            borderRadius: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        />
        <Legend 
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default CustomRadialBarChart;