import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartProps {
  data: any[]
  type?: 'line' | 'area' | 'bar'
  dataKey: string
  name?: string
  color?: string
}

const Chart = ({ data, type = 'line', dataKey, name, color = '#00f0ff' }: ChartProps) => {
  const chartConfig = {
    line: (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00f0ff20" />
        <XAxis dataKey="name" stroke="#00f0ff" />
        <YAxis stroke="#00f0ff" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0a0a0f',
            border: '1px solid #00f0ff',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} name={name} />
      </LineChart>
    ),
    area: (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00f0ff20" />
        <XAxis dataKey="name" stroke="#00f0ff" />
        <YAxis stroke="#00f0ff" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0a0a0f',
            border: '1px solid #00f0ff',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.3} name={name} />
      </AreaChart>
    ),
    bar: (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00f0ff20" />
        <XAxis dataKey="name" stroke="#00f0ff" />
        <YAxis stroke="#00f0ff" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0a0a0f',
            border: '1px solid #00f0ff',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey={dataKey} fill={color} name={name} />
      </BarChart>
    ),
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      {chartConfig[type]}
    </ResponsiveContainer>
  )
}

export default Chart

