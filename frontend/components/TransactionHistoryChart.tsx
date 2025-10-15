import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Transaction {
  'Transaction ID': string;
  'Account ID': string;
  Amount: string;
  Category: string;
  Date: string;
  Description: string;
}

interface TransactionHistoryChartProps {
  transactions: Transaction[];
  chartType?: 'line' | 'bar' | 'pie';
  onChartTypeChange?: (type: 'line' | 'bar' | 'pie') => void;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
];

export const TransactionHistoryChart: React.FC<TransactionHistoryChartProps> = ({
  transactions,
  chartType = 'line',
  onChartTypeChange
}) => {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Process transactions for chart display
    const processedData = transactions.map(tx => {
      // Extract numeric amount (remove $ and convert to number)
      const amountStr = tx.Amount.replace('$', '').replace(',', '');
      const amount = parseFloat(amountStr);
      
      return {
        ...tx,
        amountNumeric: amount,
        date: new Date(tx.Date),
        monthYear: new Date(tx.Date).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        })
      };
    });

    // Sort by date
    processedData.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Group by day for line/bar charts
    if (chartType === 'line' || chartType === 'bar') {
      const dailyData = processedData.reduce((acc, tx) => {
        const dateKey = tx.Date; // Use the original date string as key
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            day: new Date(tx.Date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            income: 0,
            expenses: 0,
            net: 0,
            count: 0
          };
        }
        
        if (tx.amountNumeric > 0) {
          acc[dateKey].income += tx.amountNumeric;
        } else {
          acc[dateKey].expenses += Math.abs(tx.amountNumeric);
        }
        
        acc[dateKey].net += tx.amountNumeric;
        acc[dateKey].count += 1;
        
        return acc;
      }, {} as Record<string, any>);

      // Convert to array and sort by date
      const sortedDailyData = Object.values(dailyData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return sortedDailyData;
    }

    // Group by category for pie chart
    if (chartType === 'pie') {
      const categoryData = processedData.reduce((acc, tx) => {
        const category = tx.Category;
        if (!acc[category]) {
          acc[category] = { name: category, value: 0, count: 0 };
        }
        acc[category].value += Math.abs(tx.amountNumeric);
        acc[category].count += 1;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(categoryData);
    }

    return processedData;
  }, [transactions, chartType]);

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-cymbal-text-secondary">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No transaction data available</p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Net"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2">
          {['line', 'bar', 'pie'].map((type) => (
            <button
              key={type}
              onClick={() => onChartTypeChange?.(type as 'line' | 'bar' | 'pie')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                chartType === type
                  ? 'bg-cymbal-accent text-cymbal-deep-dark'
                  : 'bg-slate-800 text-cymbal-text-secondary hover:bg-slate-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {renderChart()}
      
      {/* Color Legend */}
      {chartData.length > 0 && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-cymbal-border">
          <h4 className="text-sm font-medium text-cymbal-text-primary mb-2">Color Legend</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {chartType === 'line' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-cymbal-text-secondary">Income (Money In)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-cymbal-text-secondary">Expenses (Money Out)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-cymbal-text-secondary">Net Cash Flow</span>
                </div>
              </>
            )}
            {chartType === 'bar' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-cymbal-text-secondary">Income</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-cymbal-text-secondary">Expenses</span>
                </div>
              </>
            )}
            {chartType === 'pie' && (
              <div className="col-span-2">
                <p className="text-cymbal-text-secondary mb-2">Each color represents a different spending category</p>
                <div className="flex flex-wrap gap-2">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-cymbal-text-secondary">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {chartData.length > 0 && (
        <div className="mt-4 text-xs text-cymbal-text-secondary">
          <p>Total Transactions: {transactions.length}</p>
          <p>Date Range: {new Date(chartData[0].date).toLocaleDateString()} - {new Date(chartData[chartData.length - 1].date).toLocaleDateString()}</p>
          <p>Chart shows daily aggregated data</p>
        </div>
      )}
    </div>
  );
};
