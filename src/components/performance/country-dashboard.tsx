'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Users,
  Building2,
  Zap,
  Activity
} from 'lucide-react'

const COLORS = {
  primary: '#000000',
  secondary: '#666666',
  accent: '#333333',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
}

interface CountryDashboardProps {
  countryCode: string
  countryName: string
}

export function CountryDashboard({ countryCode, countryName }: CountryDashboardProps) {
  // Mock data - in production, this would come from API
  const metrics = {
    totalBudget: 7500000000000,
    budgetUtilization: 78,
    activeProjects: 127,
    completedProjects: 45,
    totalInvestments: 2500000000,
    gdpGrowth: 5.2,
    inflationRate: 3.8,
    unemploymentRate: 6.5,
    population: 27900000,
  }

  const budgetData = [
    { name: 'Éducation', value: 12, efficiency: 72 },
    { name: 'Santé', value: 11, efficiency: 68 },
    { name: 'Infrastructure', value: 25, efficiency: 78 },
    { name: 'Défense', value: 13, efficiency: 65 },
    { name: 'Social', value: 15, efficiency: 70 },
    { name: 'Autres', value: 24, efficiency: 62 },
  ]

  const growthData = [
    { year: 2020, gdp: 3.5, investment: 400 },
    { year: 2021, gdp: 4.2, investment: 500 },
    { year: 2022, gdp: 4.8, investment: 600 },
    { year: 2023, gdp: 5.0, investment: 700 },
    { year: 2024, gdp: 5.2, investment: 800 },
  ]

  const sectorData = [
    { name: 'Agriculture', value: 15 },
    { name: 'Industrie', value: 35 },
    { name: 'Services', value: 45 },
    { name: 'Extraction', value: 5 },
  ]

  const sectorColors = ['#000000', '#333333', '#666666', '#999999']

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">{countryName}</h1>
        <p className="text-muted-foreground">Tableau de bord gouvernemental</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Total
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(metrics.totalBudget)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                {metrics.budgetUtilization > 70 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-warning" />
                )}
                <span className={metrics.budgetUtilization > 70 ? 'text-success' : 'text-warning'}>
                  {metrics.budgetUtilization}% exécuté
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Projets
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {metrics.activeProjects}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Actifs</span>
                <Badge variant="secondary">{metrics.completedProjects} terminés</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Croissance PIB
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {metrics.gdpGrowth}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-success" />
                <span className="text-success">+1.2% vs 2023</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Population
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {(metrics.population / 1000000).toFixed(1)}M
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-info" />
                <span className="text-info">+2.5% croissance annuelle</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Répartition Budgétaire</CardTitle>
              <CardDescription>Par secteur avec efficacité</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000', 
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="value" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Croissance Économique</CardTitle>
              <CardDescription>PIB et Investissements (Mds $)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#666666" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#666666" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000', 
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gdp" 
                    stroke="#000000" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGdp)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="investment" 
                    stroke="#666666" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInvestment)" 
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Tendance des Projets</CardTitle>
              <CardDescription>Évolution mensuelle</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={Array.from({ length: 12 }, (_, i) => ({
                  month: new Date(2024, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
                  projects: Math.floor(Math.random() * 20) + 80 + i * 2,
                  completed: Math.floor(Math.random() * 15) + 30 + i * 1.5
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000', 
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projects" 
                    stroke="#000000" 
                    strokeWidth={2}
                    dot={{ fill: '#000000' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#666666" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#666666' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Secteurs Économiques</CardTitle>
              <CardDescription>Contribution au PIB</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={sectorColors[index % sectorColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000', 
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Building2 className="w-5 h-5" />, label: 'Nouveau Projet' },
                { icon: <DollarSign className="w-5 h-5" />, label: 'Budget' },
                { icon: <Zap className="w-5 h-5" />, label: 'Optimisation' },
                { icon: <Activity className="w-5 h-5" />, label: 'Rapport' },
              ].map((action, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-primary">{action.icon}</div>
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
