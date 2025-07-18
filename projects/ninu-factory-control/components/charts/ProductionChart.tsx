import React from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'

export interface ChartData {
  name: string
  value: number
  efficiency?: number
  quality?: number
  production?: number
  target?: number
  fill?: string
}

interface ProductionChartProps {
  data: ChartData[]
  type: 'line' | 'bar' | 'area' | 'pie'
  title: string
  height?: number
  showGrid?: boolean
  colors?: string[]
  valueKey?: string
  format?: (value: any) => string
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function ProductionChart({ 
  data, 
  type, 
  title, 
  height = 300, 
  showGrid = true,
  colors = COLORS,
  valueKey = 'value',
  format
}: ProductionChartProps) {
  const formatValue = (value: any) => {
    if (format) return format(value)
    if (typeof value === 'number') {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`
      }
      return value.toString()
    }
    return value
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value)}
              {entry.name === 'efficiency' || entry.name === 'quality' ? '%' : ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={valueKey} 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
            {data[0]?.efficiency !== undefined && (
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke={colors[1]} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: colors[1], strokeWidth: 2, r: 3 }}
              />
            )}
            {data[0]?.target !== undefined && (
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={colors[2]} 
                strokeWidth={1}
                strokeDasharray="10 5"
                dot={false}
              />
            )}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={valueKey} 
              stroke={colors[0]} 
              fill={colors[0]}
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {data[0]?.efficiency !== undefined && (
              <Area 
                type="monotone" 
                dataKey="efficiency" 
                stroke={colors[1]} 
                fill={colors[1]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            )}
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={valueKey} 
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            />
            {data[0]?.efficiency !== undefined && (
              <Bar 
                dataKey="efficiency" 
                fill={colors[1]}
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={valueKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        )

      default:
        return <div>Tipo de gráfico no soportado</div>
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

// Preset chart configurations for common use cases
export const ProductionCharts = {
  EfficiencyTrend: ({ data }: { data: ChartData[] }) => (
    <ProductionChart
      data={data}
      type="line"
      title="Tendencia de Eficiencia"
      valueKey="efficiency"
      format={(value) => `${value}%`}
      colors={['#10b981', '#f59e0b']}
    />
  ),

  ProductionVolume: ({ data }: { data: ChartData[] }) => (
    <ProductionChart
      data={data}
      type="bar"
      title="Volumen de Producción"
      valueKey="production"
      format={(value) => `${value} unidades`}
      colors={['#3b82f6']}
    />
  ),

  QualityMetrics: ({ data }: { data: ChartData[] }) => (
    <ProductionChart
      data={data}
      type="area"
      title="Métricas de Calidad"
      valueKey="quality"
      format={(value) => `${value}%`}
      colors={['#ef4444', '#10b981']}
    />
  ),

  ResourceUtilization: ({ data }: { data: ChartData[] }) => (
    <ProductionChart
      data={data}
      type="pie"
      title="Utilización de Recursos"
      valueKey="value"
      height={250}
    />
  ),

  ProductionOverview: ({ data }: { data: ChartData[] }) => (
    <ProductionChart
      data={data}
      type="line"
      title="Resumen de Producción"
      valueKey="production"
      colors={['#3b82f6', '#10b981', '#f59e0b']}
      height={350}
    />
  )
}