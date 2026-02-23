'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Building2, 
  FileText, 
  Globe, 
  Shield, 
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState<'fr' | 'en'>('fr')
  const [selectedCountry, setSelectedCountry] = useState<string>('CM')

  const content = {
    fr: {
      hero: {
        title: "GovTech Intelligence Suite",
        subtitle: "Plateforme de Gouvernance pour les Nations Africaines",
        description: "Transformez la gouvernance de votre nation avec une solution complète, optimisée et adaptée aux réalités africaines.",
        cta: "Demander une Démonstration",
        ctaSecondary: "En Savoir Plus"
      },
      countries: {
        title: "Pays Disponibles",
        subtitle: "Sélectionnez votre pays pour voir le dashboard personnalisé",
        cameroon: {
          title: "Cameroun",
          description: "Infrastructure, Agriculture, Éducation, Santé",
          gdp: "$1,660",
          population: "27.9M",
          hdi: "0.765"
        },
        rdc: {
          title: "République Démocratique du Congo",
          description: "Ressources naturelles, Agriculture, Énergie",
          gdp: "$640",
          population: "95.9M",
          hdi: "0.578"
        },
        gabon: {
          title: "Gabon",
          description: "Pétrole, Mines, Écologie",
          gdp: "$2,100",
          population: "2.2M",
          hdi: "0.798"
        },
        congo: {
          title: "Congo Brazzaville",
          description: "Pétrole, Forêts, Agriculture",
          gdp: "$1,520",
          population: "5.5M",
          hdi: "0.569"
        },
      },
      cta: {
        title: "Prêt à Transformer la Gouvernance ?",
        description: "Rejoignez les nations africaines qui modernisent leur gouvernance avec notre plateforme IA.",
        button: "Commencer Maintenant"
      }
    },
    en: {
      hero: {
        title: "GovTech Intelligence Suite",
        subtitle: "AI Governance Platform for African Nations",
        description: "Transform your nation's governance with a complete, optimized solution tailored to African realities.",
        cta: "Request Demo",
        ctaSecondary: "Learn More"
      },
      countries: {
        title: "Available Countries",
        subtitle: "Select your country to see personalized dashboard",
        cameroon: {
          title: "Cameroon",
          description: "Infrastructure, Agriculture, Education, Healthcare",
          gdp: "$1,660",
          population: "27.9M",
          hdi: "0.765"
        },
        rdc: {
          title: "Democratic Republic of Congo",
          description: "Natural Resources, Agriculture, Energy",
          gdp: "$640",
          population: "95.9M",
          hdi: "0.578"
        },
        gabon: {
          title: "Gabon",
          description: "Oil, Mining, Ecology",
          gdp: "$2,100",
          population: "2.2M",
          hdi: "0.798"
        },
        congo: {
          title: "Republic of Congo",
          description: "Oil, Forests, Agriculture",
          gdp: "$1,520",
          population: "5.5M",
          hdi: "0.569"
        },
      },
      cta: {
        title: "Ready to Transform Governance?",
        description: "Join African nations modernizing their governance with our AI platform.",
        button: "Get Started"
      }
    }
  }

  const t = content[currentLang]

  const countryFlags: Record<string, string> = {
    cameroon: '🇨🇲',
    rdc: '🇨🇩',
    gabon: '🇬🇦',
    congo: '🇨🇬',
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              <span className="text-xl font-bold tracking-tight">
                GovTech AI
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                {currentLang === 'fr' ? 'Fonctionnalités' : 'Features'}
              </a>
              <a href="#countries" className="text-sm font-medium hover:text-primary transition-colors">
                {currentLang === 'fr' ? 'Pays' : 'Countries'}
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLang(currentLang === 'fr' ? 'en' : 'fr')}
              >
                {currentLang === 'fr' ? 'EN' : 'FR'}
              </Button>
              <Button size="sm">
                {currentLang === 'fr' ? 'Connexion' : 'Login'}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-4">
              <a href="#features" className="block text-sm font-medium hover:text-primary transition-colors">
                {currentLang === 'fr' ? 'Fonctionnalités' : 'Features'}
              </a>
              <a href="#countries" className="block text-sm font-medium hover:text-primary transition-colors">
                {currentLang === 'fr' ? 'Pays' : 'Countries'}
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLang(currentLang === 'fr' ? 'en' : 'fr')}
              >
                {currentLang === 'fr' ? 'EN' : 'FR'}
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              {currentLang === 'fr' ? 'Puissance IA pour la Gouvernance' : 'AI Power for Governance'}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {t.hero.title}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.hero.subtitle}
            </p>
            
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              {t.hero.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8">
                {t.hero.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                {t.hero.ctaSecondary}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section id="countries" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Globe className="w-12 h-12 text-black mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.countries.title}
            </h2>
            <p className="text-lg text-gray-600">
              {t.countries.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {Object.entries(t.countries).filter(([key]) => !['title', 'subtitle'].includes(key)).map(([code, entry]: [string, any]) => (
              <Card key={code} className="text-center hover:shadow-lg transition-shadow cursor-pointer border-2 border-black hover:bg-black hover:text-white hover:border-black transition-all">
                <CardHeader>
                  <div className="text-4xl mb-2">{countryFlags[code] || '🌍'}</div>
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {entry.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">PIB</span>
                    <span className="font-bold">{entry.gdp}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Population</span>
                    <span className="font-bold">{entry.population}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">HDI</span>
                    <span className="font-bold">{entry.hdi}</span>
                  </div>
                  <Button 
                    onClick={() => setSelectedCountry(code.toUpperCase())}
                    className="w-full"
                    variant={selectedCountry === code.toUpperCase() ? "default" : "outline"}
                  >
                    {selectedCountry === code.toUpperCase() ? 'Sélectionné' : 'Sélectionner'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <FileText className="w-12 h-12 text-black mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {currentLang === 'fr' ? 'Tableau de Bord Intelligent' : 'Intelligent Dashboard'}
            </h2>
            <p className="text-lg text-gray-600">
              {currentLang === 'fr' 
                ? 'Une vue complète de la gouvernance de votre nation' 
                : 'A complete view of your nation\'s governance'}
            </p>
          </div>

          <Card className="max-w-6xl mx-auto overflow-hidden">
            <CardHeader className="bg-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-black" />
                  <CardTitle className="text-lg text-black">
                    {currentLang === 'fr' ? 'Dashboard Présidentiel' : 'Presidential Dashboard'}
                  </CardTitle>
                </div>
                <Badge variant="default" className="bg-black text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">
                    {currentLang === 'fr' ? 'Aperçu' : 'Overview'}
                  </TabsTrigger>
                  <TabsTrigger value="projects">
                    {currentLang === 'fr' ? 'Projets' : 'Projects'}
                  </TabsTrigger>
                  <TabsTrigger value="budget">
                    {currentLang === 'fr' ? 'Budget' : 'Budget'}
                  </TabsTrigger>
                  <TabsTrigger value="reports">
                    {currentLang === 'fr' ? 'Rapports' : 'Reports'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription className="text-gray-600">
                          {currentLang === 'fr' ? 'Projets Actifs' : 'Active Projects'}
                        </CardDescription>
                        <CardTitle className="text-2xl">127</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-green-600 text-sm">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          +12% {currentLang === 'fr' ? 'ce mois' : 'this month'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription className="text-gray-600">
                          {currentLang === 'fr' ? 'Budget Utilisé' : 'Budget Utilized'}
                        </CardDescription>
                        <CardTitle className="text-2xl">68%</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-black h-2 rounded-full" style={{ width: '68%' }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription className="text-gray-600">
                          {currentLang === 'fr' ? 'Alertes Actives' : 'Active Alerts'}
                        </CardDescription>
                        <CardTitle className="text-2xl">3</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-orange-600 text-sm">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {currentLang === 'fr' ? 'Action requise' : 'Action required'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="projects">
                  <div className="space-y-3">
                    {[
                      { 
                        name: { 
                          fr: "Infrastructure Routière Nationale", 
                          en: "National Road Infrastructure" 
                        }, 
                        progress: 75, 
                        status: { 
                          fr: "En cours", 
                          en: "In Progress" 
                        }
                      },
                      { 
                        name: { 
                          fr: "Digitalisation des Services Publics", 
                          en: "Digitalization of Public Services" 
                        }, 
                        progress: 45, 
                        status: { 
                          fr: "En cours", 
                          en: "In Progress" 
                        }
                      },
                      { 
                        name: { 
                          fr: "Programme Éducation 2025", 
                          en: "Education Program 2025" 
                        }, 
                        progress: 90, 
                        status: { 
                          fr: "Presque terminé", 
                          en: "Almost Complete" 
                        }
                      }
                    ].map((project: any, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{project.name[currentLang]}</span>
                          <span className="text-gray-600">{project.status[currentLang]}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-black h-2 rounded-full transition-all" 
                            style={{ width: `${project.progress}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="budget">
                  <div className="space-y-4">
                    {[
                      { 
                        category: { 
                          fr: "Infrastructure", 
                          en: "Infrastructure" 
                        }, 
                        allocated: 450000000, 
                        spent: 320000000 
                      },
                      { 
                        category: { 
                          fr: "Santé", 
                          en: "Healthcare" 
                        }, 
                        allocated: 280000000, 
                        spent: 195000000 
                      },
                      { 
                        category: { 
                          fr: "Éducation", 
                          en: "Education" 
                        }, 
                        allocated: 220000, 
                        spent: 180000 
                      }
                    ].map((item: any, i) => (
                      <Card key={i}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{item.category[currentLang]}</span>
                            <span className="text-sm text-gray-600">
                              {new Intl.NumberFormat(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact'
                              }).format(item.spent)} / {new Intl.NumberFormat(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact'
                              }).format(item.allocated)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-black h-2 rounded-full" 
                              style={{ width: `${(item.spent / item.allocated * 100).toFixed(0)}%` }} 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reports">
                  <div className="space-y-3">
                    {[
                      { 
                        title: { 
                          fr: "Rapport Trimestriel Q4 2024", 
                          en: "Q4 2024 Quarterly Report" 
                        }, 
                        date: "2024-12-31", 
                        type: "Stratégique" 
                      },
                      { 
                        title: { 
                          fr: "Analyse Budgétaire Annuelle", 
                          en: "Annual Budget Analysis" 
                        }, 
                        date: "2024-12-15", 
                        type: "Budget" 
                      },
                      { 
                        title: { 
                          fr: "État des Projets Prioritaires", 
                          en: "Priority Projects Status" 
                        }, 
                        date: "2024-12-10", 
                        type: "Projet" 
                      }
                    ].map((report: any, i) => (
                      <Card key={i} className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{report.title[currentLang]}</p>
                          <p className="text-sm text-gray-600">{report.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.type}</Badge>
                          <Button size="sm" variant="ghost">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.cta.title}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t.cta.description}
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8">
            {t.cta.button}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-black" />
                <span className="font-bold text-black">GovTech AI</span>
              </div>
              <p className="text-sm text-gray-600">
                {currentLang === 'fr' 
                  ? 'La solution de gouvernance AI pour les nations africaines.'
                  : 'AI governance solution for African nations.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-black">
                {currentLang === 'fr' ? 'Produit' : 'Product'}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>{currentLang === 'fr' ? 'Fonctionnalités' : 'Features'}</li>
                <li>{currentLang === 'fr' ? 'Tarification' : 'Pricing'}</li>
                <li>{currentLang === 'fr' ? 'Sécurité' : 'Security'}</li>
                <li>{currentLang === 'fr' ? 'API' : 'API'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-black">
                {currentLang === 'fr' ? 'Entreprise' : 'Company'}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>{currentLang === 'fr' ? 'À propos' : 'About'}</li>
                <li>{currentLang === 'fr' ? 'Carrières' : 'Careers'}</li>
                <li>{currentLang === 'fr' ? 'Contact' : 'Contact'}</li>
                <li>{currentLang === 'fr' ? 'Presse' : 'Press'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-black">
                {currentLang === 'fr' ? 'Légal' : 'Legal'}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>{currentLang === 'fr' ? 'Confidentialité' : 'Privacy'}</li>
                <li>{currentLang === 'fr' ? 'Conditions' : 'Terms'}</li>
                <li>{currentLang === 'fr' ? 'Sécurité' : 'Security'}</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>© 2024 GovTech AI. {currentLang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
