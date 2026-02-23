/**
 * Internationalization (i18n) Configuration for African Countries
 * Support for multiple languages, currencies, date formats, etc.
 */

export type Language = 'fr' | 'en' | 'pt' | 'es' | 'sw' | 'ar'
export type CountryCode = 'CM' | 'CD' | 'GA' | 'CG' | 'CI' | 'SN' | 'NG' | 'KE' | 'ET' | 'ZA' | 'MA' | 'DZ' | 'EG'

export interface CountryConfig {
  code: CountryCode
  name: Record<Language, string>
  currency: string
  currencySymbol: string
  languages: Language[]
  defaultLanguage: Language
  dateFormat: string
  timeFormat: '12h' | '24h'
  firstDayOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
  phoneCode: string
  drivingSide: 'left' | 'right'
  metricSystem: boolean
  taxRate?: number
  regions: string[]
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  CM: {
    code: 'CM',
    name: {
      fr: 'Cameroun',
      en: 'Cameroon',
      pt: 'Camarões',
      es: 'Camerún',
      sw: 'Kameruni',
      ar: 'الكاميرون',
    },
    currency: 'XAF',
    currencySymbol: 'FCFA',
    languages: ['fr', 'en'],
    defaultLanguage: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    phoneCode: '+237',
    drivingSide: 'right',
    metricSystem: true,
    regions: ['Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'],
  },
  CD: {
    code: 'CD',
    name: {
      fr: 'République Démocratique du Congo',
      en: 'Democratic Republic of the Congo',
      pt: 'República Democrática do Congo',
      es: 'República Democrática del Congo',
      sw: 'Jamhuri ya Kidemokrasia ya Kongo',
      ar: 'جمهورية الكونغو الديمقراطية',
    },
    currency: 'CDF',
    currencySymbol: 'FC',
    languages: ['fr', 'en', 'sw'],
    defaultLanguage: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    phoneCode: '+243',
    drivingSide: 'right',
    metricSystem: true,
    regions: ['Bandundu', 'Bas-Congo', 'Équateur', 'Kasaï-Occidental', 'Kasaï-Oriental', 'Kinshasa', 'Maniema', 'Nord-Kivu', 'Orientale', 'Sud-Kivu'],
  },
  GA: {
    code: 'GA',
    name: {
      fr: 'Gabon',
      en: 'Gabon',
      pt: 'Gabão',
      es: 'Gabón',
      sw: 'Gaboni',
      ar: 'الغابون',
    },
    currency: 'XAF',
    currencySymbol: 'FCFA',
    languages: ['fr'],
    defaultLanguage: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    phoneCode: '+241',
    drivingSide: 'right',
    metricSystem: true,
    regions: ['Estuaire', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié', 'Nyanga', 'Ogooué-Ivindo', 'Ogooué-Lolo', 'Ogooué-Maritime', 'Woleu-Ntem'],
  },
  CG: {
    code: 'CG',
    name: {
      fr: 'République du Congo',
      en: 'Republic of the Congo',
      pt: 'República do Congo',
      es: 'República del Congo',
      sw: 'Jamhuri ya Kongo',
      ar: 'جمهورية الكونغو',
    },
    currency: 'XAF',
    currencySymbol: 'FCFA',
    languages: ['fr', 'en'],
    defaultLanguage: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    phoneCode: '+242',
    drivingSide: 'right',
    metricSystem: true,
    regions: ['Bouenza', 'Brazzaville', 'Cuvette', 'Kouilou', 'Likouala', 'Niari', 'Plateaux', 'Pointe-Noire', 'Pool', 'Sangha'],
  },
  CI: {
    code: 'CI',
    name: {
      fr: "Côte d'Ivoire",
      en: "Ivory Coast",
      pt: 'Costa do Marfim',
      es: 'Costa de Marfil',
      sw: 'Cote d\'Ivoire',
      ar: 'ساحل العاج',
    },
    currency: 'XOF',
    currencySymbol: 'CFA',
    languages: ['fr'],
    defaultLanguage: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    phoneCode: '+225',
    drivingSide: 'right',
    metricSystem: true,
    regions: ['Abidjan', 'Bas-Sassandra', 'Comoé', 'Denguélé', 'Gôh-Djiboua', 'Lacs', 'Lagunes', 'Montagnes', 'Sassandra-Marahoué', 'Savanes', 'Vallée du Bandama', 'Worodougou', 'Zanzan'],
  },
  SN: {
    code: 'SN',
    name: {
      fr: 'Sénégal',
      en: 'Senegal',
      pt: 'Senegal',
      es: 'Senegal',
      sw: 'Senegal',
      ar: 'السنغال',
    },
    currency: 'XOF',
    currencySymbol: 'CFA',
    languages: ['fr'],
    defaultLanguage: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    phoneCode: '+221',
    drivingSide: 'right',
    metricSystem: true,
    regions: ['Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'],
  },
  NG: {
    code: 'NG',
    name: {
      fr: 'Nigeria',
      en: 'Nigeria',
      pt: 'Nigéria',
      es: 'Nigeria',
      sw: 'Nigeria',
      ar: 'نيجيريا',
    },
    currency: 'NGN',
    currencySymbol: '₦',
    languages: ['en'],
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    phoneCode: '+234',
    drivingSide: 'right',
    metricSystem: false, // Nigeria uses both
    regions: ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'],
    taxRate: 0.075,
  },
  KE: {
    code: 'KE',
    name: {
      fr: 'Kenya',
      en: 'Kenya',
      pt: 'Quénia',
      es: 'Kenia',
      sw: 'Kenya',
      ar: 'كينيا',
    },
    currency: 'KES',
    currencySymbol: 'KSh',
    languages: ['en', 'sw'],
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    phoneCode: '+254',
    drivingSide: 'left',
    metricSystem: true,
    regions: ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Tana River', 'Taita-Taveta', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'],
    taxRate: 0.16,
  },
  ZA: {
    code: 'ZA',
    name: {
      fr: 'Afrique du Sud',
      en: 'South Africa',
      pt: 'África do Sul',
      es: 'Sudáfrica',
      sw: 'Afrika Kusini',
      ar: 'جنوب أفريقيا',
    },
    currency: 'ZAR',
    currencySymbol: 'R',
    languages: ['en'],
    defaultLanguage: 'en',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '12h',
    firstDayOfWeek: 0,
    phoneCode: '+27',
    drivingSide: 'left',
    metricSystem: true,
    regions: ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'],
    taxRate: 0.15,
  },
  MA: {
    code: 'MA',
    name: {
      fr: 'Maroc',
      en: 'Morocco',
      pt: 'Marrocos',
      es: 'Marruecos',
      sw: 'Moroko',
      ar: 'المغرب',
    },
    currency: 'MAD',
    currencySymbol: 'DH',
    languages: ['ar', 'fr'],
    defaultLanguage: 'ar',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 6, // Saturday
    phoneCode: '+212',
    drivingSide: 'right',
    metricSystem: true,
    regions: ['Casablanca-Settat', 'Drâa-Tafilalet', 'Fès-Meknès', 'Guelmim-Oued Noun', 'Laâyoune-Sakia El Hamra', 'Marrakech-Safi', 'Oriental', 'Rabat-Salé-Kénitra', 'Souss-Massa', 'Tanger-Tétouan-Al Hoceïma'],
    taxRate: 0.20,
  },
  EG: {
    code: 'EG',
    name: {
      fr: 'Égypte',
      en: 'Egypt',
      pt: 'Egito',
      es: 'Egipto',
      sw: 'Misri',
      ar: 'مصر',
    },
    currency: 'EGP',
    currencySymbol: 'E£',
    languages: ['ar'],
    defaultLanguage: 'ar',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 6, // Saturday
    phoneCode: '+20',
    drivingSide: 'right',
    metricSystem: true,
    regions: ['Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia', 'Damietta', 'Fayoum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh', 'Luxor', 'Matruh', 'Minya', 'Monufia', 'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag', 'South Sinai', 'Suez'],
    taxRate: 0.14,
  },
}

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.create': 'Créer',
    'common.update': 'Mettre à jour',
    'common.loading': 'Chargement...',
    'common.success': 'Succès',
    'common.error': 'Erreur',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.all': 'Tous',
    'common.none': 'Aucun',
    
    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.overview': 'Aperçu',
    'dashboard.projects': 'Projets',
    'dashboard.budget': 'Budget',
    'dashboard.reports': 'Rapports',
    'dashboard.analytics': 'Analytiques',
    
    // Projects
    'project.title': 'Projets',
    'project.name': 'Nom du projet',
    'project.code': 'Code',
    'project.status': 'Statut',
    'project.priority': 'Priorité',
    'project.budget': 'Budget',
    'project.progress': 'Progression',
    'project.startDate': 'Date de début',
    'project.endDate': 'Date de fin',
    'project.ministry': 'Ministère',
    'project.manager': 'Gestionnaire',
    
    // Status
    'status.planned': 'Planifié',
    'status.inProgress': 'En cours',
    'status.completed': 'Terminé',
    'status.onHold': 'En pause',
    'status.cancelled': 'Annulé',
    'status.delayed': 'Retardé',
    'status.pendingApproval': 'En attente d\'approbation',
    
    // Priority
    'priority.low': 'Faible',
    'priority.medium': 'Moyenne',
    'priority.high': 'Haute',
    'priority.critical': 'Critique',
    
    // Budget
    'budget.allocated': 'Alloué',
    'budget.spent': 'Dépensé',
    'budget.remaining': 'Restant',
    'budget.utilization': 'Utilisation',
    
    // Reports
    'report.title': 'Rapports',
    'report.type': 'Type',
    'report.status': 'Statut',
    'report.author': 'Auteur',
    'report.approved': 'Approuvé',
    'report.rejected': 'Rejeté',
    'report.pending': 'En attente',
    'report.published': 'Publié',
    
    // Notifications
    'notification.title': 'Notifications',
    'notification.markAllRead': 'Tout marquer comme lu',
    'notification.noNew': 'Aucune nouvelle notification',
    
    // User
    'user.title': 'Utilisateurs',
    'user.name': 'Nom',
    'user.email': 'Email',
    'user.role': 'Rôle',
    'user.ministry': 'Ministère',
    'user.position': 'Poste',
    'user.active': 'Actif',
    
    // Roles
    'role.superAdmin': 'Super Administrateur',
    'role.president': 'Président',
    'role.primeMinister': 'Premier Ministre',
    'role.minister': 'Ministre',
    'role.director': 'Directeur',
    'role.manager': 'Gestionnaire',
    'role.analyst': 'Analyste',
    'role.viewer': 'Lecteur',
    'role.admin': 'Administrateur',
  },
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.all': 'All',
    'common.none': 'None',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.projects': 'Projects',
    'dashboard.budget': 'Budget',
    'dashboard.reports': 'Reports',
    'dashboard.analytics': 'Analytics',
    
    // Projects
    'project.title': 'Projects',
    'project.name': 'Project Name',
    'project.code': 'Code',
    'project.status': 'Status',
    'project.priority': 'Priority',
    'project.budget': 'Budget',
    'project.progress': 'Progress',
    'project.startDate': 'Start Date',
    'project.endDate': 'End Date',
    'project.ministry': 'Ministry',
    'project.manager': 'Manager',
    
    // Status
    'status.planned': 'Planned',
    'status.inProgress': 'In Progress',
    'status.completed': 'Completed',
    'status.onHold': 'On Hold',
    'status.cancelled': 'Cancelled',
    'status.delayed': 'Delayed',
    'status.pendingApproval': 'Pending Approval',
    
    // Priority
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.critical': 'Critical',
    
    // Budget
    'budget.allocated': 'Allocated',
    'budget.spent': 'Spent',
    'budget.remaining': 'Remaining',
    'budget.utilization': 'Utilization',
    
    // Reports
    'report.title': 'Reports',
    'report.type': 'Type',
    'report.status': 'Status',
    'report.author': 'Author',
    'report.approved': 'Approved',
    'report.rejected': 'Rejected',
    'report.pending': 'Pending',
    'report.published': 'Published',
    
    // Notifications
    'notification.title': 'Notifications',
    'notification.markAllRead': 'Mark all as read',
    'notification.noNew': 'No new notifications',
    
    // User
    'user.title': 'Users',
    'user.name': 'Name',
    'user.email': 'Email',
    'user.role': 'Role',
    'user.ministry': 'Ministry',
    'user.position': 'Position',
    'user.active': 'Active',
    
    // Roles
    'role.superAdmin': 'Super Administrator',
    'role.president': 'President',
    'role.primeMinister': 'Prime Minister',
    'role.minister': 'Minister',
    'role.director': 'Director',
    'role.manager': 'Manager',
    'role.analyst': 'Analyst',
    'role.viewer': 'Viewer',
    'role.admin': 'Administrator',
  },
  pt: {
    // Portuguese translations for Lusophone Africa
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.create': 'Criar',
    'common.update': 'Atualizar',
    'common.loading': 'Carregando...',
    'common.success': 'Sucesso',
    'common.error': 'Erro',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.all': 'Todos',
    'common.none': 'Nenhum',
    
    'dashboard.title': 'Painel',
    'dashboard.overview': 'Visão Geral',
    'dashboard.projects': 'Projetos',
    'dashboard.budget': 'Orçamento',
    'dashboard.reports': 'Relatórios',
    'dashboard.analytics': 'Análises',
    
    'project.title': 'Projetos',
    'project.name': 'Nome do Projeto',
    'project.code': 'Código',
    'project.status': 'Status',
    'project.priority': 'Prioridade',
    'project.budget': 'Orçamento',
    'project.progress': 'Progresso',
    'project.startDate': 'Data de Início',
    'project.endDate': 'Data de Término',
    'project.ministry': 'Ministério',
    'project.manager': 'Gerente',
    
    'status.planned': 'Planejado',
    'status.inProgress': 'Em Andamento',
    'status.completed': 'Concluído',
    'status.onHold': 'Em Pausa',
    'status.cancelled': 'Cancelado',
    'status.delayed': 'Atrasado',
    'status.pendingApproval': 'Aguardando Aprovação',
    
    'priority.low': 'Baixa',
    'priority.medium': 'Média',
    'priority.high': 'Alta',
    'priority.critical': 'Crítica',
    
    'budget.allocated': 'Alocado',
    'budget.spent': 'Gasto',
    'budget.remaining': 'Restante',
    'budget.utilization': 'Utilização',
  },
  sw: {
    // Swahili translations for East Africa
    'common.save': 'Hifadhi',
    'common.cancel': 'Ghairi',
    'common.delete': 'Futa',
    'common.edit': 'Hariri',
    'common.view': 'Ona',
    'common.search': 'Tafuta',
    'common.filter': 'Chuja',
    'common.export': 'Hamisha',
    'common.import': 'Leta',
    'common.create': 'Unda',
    'common.update': 'Sasisha',
    'common.loading': 'Inapakia...',
    'common.success': 'Mafanikio',
    'common.error': 'Kosa',
    'common.yes': 'Ndiyo',
    'common.no': 'Hapana',
    'common.all': 'Yote',
    'common.none': 'Hakuna',
    
    'dashboard.title': 'Dashibodi',
    'dashboard.overview': 'Muhtasari',
    'dashboard.projects': 'Miradi',
    'dashboard.budget': 'Bajeti',
    'dashboard.reports': 'Ripoti',
    'dashboard.analytics': 'Uchambuzi',
    
    'project.title': 'Miradi',
    'project.name': 'Jina la Mradi',
    'project.code': 'Kodi',
    'project.status': 'Hali',
    'project.priority': 'Kipaumbele',
    'project.budget': 'Bajeti',
    'project.progress': 'Maendeleo',
    'project.startDate': 'Tarehe ya Kuanza',
    'project.endDate': 'Tarehe ya Mwisho',
    'project.ministry': 'Wizara',
    'project.manager': 'Meneja',
    
    'status.planned': 'Ilipangwa',
    'status.inProgress': 'Inaendelea',
    'status.completed': 'Imekamilika',
    'status.onHold': 'Imesitishwa',
    'status.cancelled': 'Imefutwa',
    'status.delayed': 'Imecheleweshwa',
    'status.pendingApproval': 'Inasubiri Idhini',
    
    'priority.low': 'Ya chini',
    'priority.medium': 'Ya kati',
    'priority.high': 'Ya juu',
    'priority.critical': 'Ya muhimu',
    
    'budget.allocated': 'Iligawekwa',
    'budget.spent': 'Imetumika',
    'budget.remaining': 'Ilisalia',
    'budget.utilization': 'Matumizi',
  },
  es: {
    // Spanish translations for Spanish-speaking Africa
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.create': 'Crear',
    'common.update': 'Actualizar',
    'common.loading': 'Cargando...',
    'common.success': 'Éxito',
    'common.error': 'Error',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.all': 'Todos',
    'common.none': 'Ninguno',
    
    'dashboard.title': 'Panel',
    'dashboard.overview': 'Resumen',
    'dashboard.projects': 'Proyectos',
    'dashboard.budget': 'Presupuesto',
    'dashboard.reports': 'Informes',
    'dashboard.analytics': 'Analíticas',
    
    'project.title': 'Proyectos',
    'project.name': 'Nombre del Proyecto',
    'project.code': 'Código',
    'project.status': 'Estado',
    'project.priority': 'Prioridad',
    'project.budget': 'Presupuesto',
    'project.progress': 'Progreso',
    'project.startDate': 'Fecha de Inicio',
    'project.endDate': 'Fecha de Fin',
    'project.ministry': 'Ministerio',
    'project.manager': 'Gerente',
    
    'status.planned': 'Planificado',
    'status.inProgress': 'En Progreso',
    'status.completed': 'Completado',
    'status.onHold': 'En Espera',
    'status.cancelled': 'Cancelado',
    'status.delayed': 'Retrasado',
    'status.pendingApproval': 'Pendiente de Aprobación',
    
    'priority.low': 'Baja',
    'priority.medium': 'Media',
    'priority.high': 'Alta',
    'priority.critical': 'Crítica',
    
    'budget.allocated': 'Asignado',
    'budget.spent': 'Gastado',
    'budget.remaining': 'Restante',
    'budget.utilization': 'Utilización',
  },
  ar: {
    // Arabic translations for North Africa
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.create': 'إنشاء',
    'common.update': 'تحديث',
    'common.loading': 'جاري التحميل...',
    'common.success': 'نجح',
    'common.error': 'خطأ',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.all': 'الكل',
    'common.none': 'لا شيء',
    
    'dashboard.title': 'لوحة التحكم',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.projects': 'المشاريع',
    'dashboard.budget': 'الميزانية',
    'dashboard.reports': 'التقارير',
    'dashboard.analytics': 'التحليلات',
    
    'project.title': 'المشاريع',
    'project.name': 'اسم المشروع',
    'project.code': 'الرمز',
    'project.status': 'الحالة',
    'project.priority': 'الأولوية',
    'project.budget': 'الميزانية',
    'project.progress': 'التقدم',
    'project.startDate': 'تاريخ البدء',
    'project.endDate': 'تاريخ الانتهاء',
    'project.ministry': 'الوزارة',
    'project.manager': 'المدير',
    
    'status.planned': 'مخطط',
    'status.inProgress': 'قيد التنفيذ',
    'status.completed': 'مكتمل',
    'status.onHold': 'معلق',
    'status.cancelled': 'ملغي',
    'status.delayed': 'متأخر',
    'status.pendingApproval': 'في انتظار الموافقة',
    
    'priority.low': 'منخفضة',
    'priority.medium': 'متوسطة',
    'priority.high': 'عالية',
    'priority.critical': 'حرجة',
    
    'budget.allocated': 'مخصص',
    'budget.spent': 'منفق',
    'budget.remaining': 'متبقي',
    'budget.utilization': 'الاستخدام',
  },
}

/**
 * Get country configuration by code
 */
export function getCountryConfig(code: CountryCode): CountryConfig {
  return COUNTRIES[code] || COUNTRIES.CM
}

/**
 * Get translation by language and key
 */
export function translate(language: Language, key: string): string {
  return TRANSLATIONS[language]?.[key] || key
}

/**
 * Format currency for country
 */
export function formatCurrency(amount: number, country: CountryCode): string {
  const config = getCountryConfig(country)
  
  return new Intl.NumberFormat(getLocaleForLanguage(config.defaultLanguage), {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format number for country
 */
export function formatNumber(amount: number, country: CountryCode): string {
  const config = getCountryConfig(country)
  
  return new Intl.NumberFormat(getLocaleForLanguage(config.defaultLanguage)).format(amount)
}

/**
 * Format date for country
 */
export function formatDate(date: Date | string, country: CountryCode): string {
  const config = getCountryConfig(country)
  
  return new Intl.DateTimeFormat(getLocaleForLanguage(config.defaultLanguage), {
    dateStyle: 'medium',
  }).format(new Date(date))
}

/**
 * Get locale for language
 */
function getLocaleForLanguage(language: Language): string {
  const locales: Record<Language, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    pt: 'pt-BR',
    es: 'es-ES',
    sw: 'sw-KE',
    ar: 'ar-EG',
  }
  return locales[language] || 'en-US'
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): Language[] {
  return ['fr', 'en', 'pt', 'es', 'sw', 'ar']
}

/**
 * Get supported countries
 */
export function getSupportedCountries(): CountryCode[] {
  return ['CM', 'CD', 'GA', 'CG', 'CI', 'SN', 'NG', 'KE', 'ET', 'ZA', 'MA', 'DZ', 'EG']
}
