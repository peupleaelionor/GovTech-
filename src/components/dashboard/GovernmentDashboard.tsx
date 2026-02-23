'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Building2, 
  FileText, 
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

interface Project {
  id: string
  name: string
  code: string
  status: string
  priority: string
  progress: number
  budget: number
  spent: number
  ministry: { name: string; code: string }
  manager?: { name: string }
}

interface KPI {
  id: string
  name: string
  code: string
  target: number
  current: number
  unit: string
  trend: string
  category: string
}

interface DashboardStats {
  overview: {
    totalProjects: number
    budgetUtilization: number
    activeAlerts: number
    totalBudget: number
    totalSpent: number
    ministriesCount: number
  }
  projectsByStatus: Record<string, number>
  recentProjects: Project[]
  kpis: KPI[]
}

const statusColors = {
  PLANNED: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
  ON_HOLD: 'bg-orange-500',
  CANCELLED: 'bg-red-500',
  DELAYED: 'bg-purple-500'
}

const priorityColors = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500'
}

const statusLabels = {
  PLANNED: 'Planifié',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  ON_HOLD: 'En pause',
  CANCELLED: 'Annulé',
  DELAYED: 'Retardé'
}

const priorityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Haute',
  CRITICAL: 'Critique'
}

export function GovernmentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground mb-4">{error || 'Impossible de charger les données'}</p>
            <Button onClick={fetchDashboardStats}>Réessayer</Button>
            <Button variant="outline" className="ml-2" onClick={() => window.location.href = '/api/seed'}>
              Initialiser les données
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Projets Actifs
            </CardDescription>
            <CardTitle className="text-2xl">{stats.overview.totalProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              En cours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget Utilisé
            </CardDescription>
            <CardTitle className="text-2xl">{stats.overview.budgetUtilization}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${stats.overview.budgetUtilization}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alertes Actives
            </CardDescription>
            <CardTitle className="text-2xl">{stats.overview.activeAlerts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center text-sm ${stats.overview.activeAlerts > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {stats.overview.activeAlerts > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Action requise
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Tout est OK
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Ministères
            </CardDescription>
            <CardTitle className="text-2xl">{stats.overview.ministriesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-blue-600 text-sm">
              <Building2 className="w-4 h-4 mr-1" />
              Connectés
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Dashboard Gouvernemental</CardTitle>
              <CardDescription>
                Vue d'ensemble de la gouvernance nationale
              </CardDescription>
            </div>
            <Badge variant="default">
              <CheckCircle className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="projects">Projets</TabsTrigger>
              <TabsTrigger value="kpis">KPIs</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              {/* Projects by Status */}
              <div>
                <h3 className="font-semibold mb-3">Projets par Statut</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(stats.projectsByStatus).map(([status, count]) => (
                    <Card key={status} className="text-center">
                      <CardContent className="pt-4">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${statusColors[status as keyof typeof statusColors]}`} />
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {statusLabels[status as keyof typeof statusLabels]}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Budget Overview */}
              <div>
                <h3 className="font-semibold mb-3">Aperçu Budgétaire</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Budget Total Alloué</CardDescription>
                      <CardTitle className="text-3xl">
                        {formatCurrency(stats.overview.totalBudget)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Budget Dépensé</CardDescription>
                      <CardTitle className="text-3xl text-primary">
                        {formatCurrency(stats.overview.totalSpent)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4 mt-6">
              {stats.recentProjects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{project.name}</h4>
                          <Badge variant="outline" className="text-xs">{project.code}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.ministry.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${statusColors[project.status as keyof typeof statusColors]} text-white`}>
                          {statusLabels[project.status as keyof typeof statusLabels]}
                        </Badge>
                        <Badge className={`${priorityColors[project.priority as keyof typeof priorityColors]} text-white`}>
                          {priorityLabels[project.priority as keyof typeof priorityLabels]}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progression</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${project.progress}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Budget: {formatCurrency(project.budget)}</span>
                        <span>Dépensé: {formatCurrency(project.spent)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="kpis" className="space-y-4 mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {stats.kpis.map((kpi) => (
                  <Card key={kpi.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold">{kpi.name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{kpi.code} • {kpi.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(kpi.trend)}
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-3xl font-bold">
                            {kpi.current} <span className="text-lg text-muted-foreground">{kpi.unit}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Objectif: {kpi.target} {kpi.unit}
                          </p>
                        </div>
                        <Badge variant={kpi.current >= kpi.target ? "default" : "secondary"}>
                          {kpi.current >= kpi.target ? 'Atteint' : 'En cours'}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${kpi.current >= kpi.target ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Résumé Budgétaire Global</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Budget Alloué</div>
                        <div className="text-2xl font-bold">{formatCurrency(stats.overview.totalBudget)}</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Budget Dépensé</div>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(stats.overview.totalSpent)}</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Taux d'Exécution</div>
                        <div className="text-2xl font-bold">{stats.overview.budgetUtilization}%</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Utilisation Globale du Budget</span>
                        <span className="font-medium">{stats.overview.budgetUtilization}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all" 
                          style={{ width: `${stats.overview.budgetUtilization}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget par Projet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.recentProjects.map((project) => {
                    const utilization = (project.spent / project.budget) * 100
                    return (
                      <div key={project.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{project.name}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-orange-500' : 'bg-primary'}`}
                            style={{ width: `${utilization}%` }} 
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FileText className="w-5 h-5" />
              <span>Générer Rapport</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Building2 className="w-5 h-5" />
              <span>Nouveau Projet</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Target className="w-5 h-5" />
              <span>Ajouter KPI</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span>Gérer Utilisateurs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
