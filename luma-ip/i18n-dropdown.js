// i18n implementation with dropdown in navigation bar
(function() {
    'use strict';
    
    const translations = {
        en: {
            // Navigation
            'nav.product': 'Product',
            'nav.features': 'Features',
            'nav.howItWorks': 'How It Works',
            'nav.demo': 'Demo',
            'nav.pricing': 'Pricing',
            'nav.security': 'Security',
            'nav.api': 'API',
            'nav.signIn': 'Sign In',
            'nav.getStarted': 'Get Started',
            
            // Hero
            'hero.title': 'Legal Utility for Machine Assisted IP Analysis',
            'hero.subtitle': 'Transform your patent filing process with advanced AI. Generate complete patent applications in minutes, not months. Powered by state-of-the-art language models.',
            'hero.watchDemo': 'Watch Demo',
            'hero.startFiling': 'Start Filing',
            
            // Stats
            'stats.patentsFiled': 'Patents Filed',
            'stats.grantRate': 'Grant Rate',
            'stats.timeSaved': 'Time Saved',
            'stats.lawFirms': 'Law Firms',
            
            // Features
            'features.title': 'Everything You Need for Patent Filing',
            'features.subtitle': 'A complete platform that handles the entire patent lifecycle',
            'features.aiDrafting.title': 'AI-Powered Drafting',
            'features.aiDrafting.description': 'Generate patent claims and specifications using GPT-4 trained on millions of patents',
            'features.usptoForms.title': 'USPTO Form Generation',
            'features.usptoForms.description': 'Automatically create ADS, IDS, and other USPTO forms with validated data',
            'features.priorArt.title': 'Prior Art Search',
            'features.priorArt.description': 'Vector-based semantic search through global patent databases',
            'features.docket.title': 'Docket Management',
            'features.docket.description': 'Never miss a deadline with automated tracking and reminders',
            'features.teamCollab.title': 'Team Collaboration',
            'features.teamCollab.description': 'Work together with role-based access control and real-time updates',
            'features.enterpriseSec.title': 'Enterprise Security',
            'features.enterpriseSec.description': 'Bank-level encryption, SOC 2 compliance, and audit trails',
            
            // Workflow
            'workflow.title': 'Simple 5-Step Process',
            'workflow.subtitle': 'From idea to filed patent in record time',
            'workflow.step1.title': 'Describe Your Invention',
            'workflow.step1.description': 'Input your invention details and technical specifications',
            'workflow.step2.title': 'AI Generation',
            'workflow.step2.description': 'Our LLM generates claims, specifications, and drawings',
            'workflow.step3.title': 'Prior Art Analysis',
            'workflow.step3.description': 'Automatic search and patentability scoring',
            'workflow.step4.title': 'Review & Edit',
            'workflow.step4.description': 'Refine the generated documents with AI assistance',
            'workflow.step5.title': 'File with USPTO',
            'workflow.step5.description': 'Submit directly or export for traditional filing',
            
            // Demo
            'demo.title': 'See LUMA IP in Action',
            'demo.subtitle': 'Experience the power of AI-driven patent filing',
            'demo.tabs.dashboard': 'Dashboard',
            'demo.tabs.filing': 'New Filing',
            'demo.tabs.portfolio': 'Portfolio',
            'demo.tabs.priorArt': 'Prior Art',
            'demo.dashboard.title': 'Patent Portfolio Dashboard',
            'demo.dashboard.activePatents': 'Active Patents',
            'demo.dashboard.pending': 'Pending',
            'demo.dashboard.deadlines': 'Deadlines',
            'demo.dashboard.portfolioValue': 'Portfolio Value',
            'demo.dashboard.recentActivity': 'Recent Activity',
            
            // CTA
            'cta.title': 'Ready to Revolutionize Your Patent Practice?',
            'cta.subtitle': 'Join thousands of patent professionals using LUMA IP',
            'cta.startTrial': 'Start Free Trial',
            'cta.scheduleDemo': 'Schedule Demo',
            
            // Footer
            'footer.tagline': 'Legal Utility for Machine Assisted IP Analysis',
            'footer.product': 'Product',
            'footer.productOverview': 'Product Overview',
            'footer.company': 'Company',
            'footer.features': 'Features',
            'footer.pricing': 'Pricing',
            'footer.security': 'Security',
            'footer.api': 'API',
            'footer.about': 'About',
            'footer.blog': 'Blog',
            'footer.careers': 'Careers',
            'footer.contact': 'Contact',
            'footer.legal': 'Legal',
            'footer.privacy': 'Privacy Policy',
            'footer.terms': 'Terms of Service',
            'footer.cookiePolicy': 'Cookie Policy',
            'footer.compliance': 'Compliance',
            'footer.copyright': '© 2024 LUMA IP. All rights reserved. Patent pending.',
            
            // Product Page
            'product.hero.title': 'The Complete Patent Platform',
            'product.hero.description': 'LUMA IP combines cutting-edge AI with legal expertise to streamline every aspect of patent filing, from initial drafting to final prosecution.',
            'product.platform.title': 'End-to-End Patent Management',
            'product.platform.description': 'Our platform handles every stage of the patent lifecycle, from invention disclosure to granted patent maintenance.',
            'product.platform.feature1.title': 'AI-Powered Drafting',
            'product.platform.feature1.description': 'Generate complete patent applications in minutes',
            'product.platform.feature2.title': 'Smart Prior Art Search',
            'product.platform.feature2.description': 'AI-powered semantic search across global databases',
            'product.platform.feature3.title': 'Automated Workflows',
            'product.platform.feature3.description': 'Streamline filing with intelligent automation',
            'product.components.title': 'Key Components',
            'product.components.ai.title': 'AI Engine',
            'product.components.ai.description': 'Advanced language models trained on millions of patents for accurate claim generation',
            'product.components.database.title': 'Patent Database',
            'product.components.database.description': 'Access to global patent databases with real-time updates and comprehensive coverage',
            'product.components.compliance.title': 'Compliance Tools',
            'product.components.compliance.description': 'Built-in compliance checks and USPTO form generation with validation',
            
            // Security Page
            'security.hero.title': 'Security First, Always',
            'security.hero.description': 'Your intellectual property is protected by enterprise-grade security, compliance certifications, and industry best practices.',
            'security.features.title': 'Security Features',
            'security.encryption.title': 'End-to-End Encryption',
            'security.encryption.description': 'All data is encrypted at rest with AES-256 and in transit with TLS 1.3',
            'security.access.title': 'Access Control',
            'security.access.description': 'Role-based access control with multi-factor authentication and SSO support',
            'security.audit.title': 'Audit Logging',
            'security.audit.description': 'Complete audit trail of all actions with tamper-proof logging',
            'security.infrastructure.title': 'Secure Infrastructure',
            'security.infrastructure.description': 'Hosted on SOC 2 compliant infrastructure with 99.99% uptime SLA',
            'security.threat.title': 'Threat Protection',
            'security.threat.description': 'Real-time threat detection with DDoS protection and WAF',
            'security.backup.title': 'Data Backup',
            'security.backup.description': 'Automated daily backups with point-in-time recovery',
            'security.compliance.title': 'Compliance & Certifications',
            'security.soc2': 'Certified compliant',
            'security.iso': 'Certified',
            'security.gdpr': 'Compliant',
            'security.ccpa': 'Compliant',
            
            // API Page
            'api.hero.title': 'Developer API',
            'api.hero.description': 'Integrate LUMA IP\'s patent automation capabilities into your applications with our RESTful API.',
            'api.endpoints.title': 'API Endpoints',
            
            // About Page
            'about.hero.title': 'About LUMA IP',
            'about.hero.description': 'We\'re on a mission to democratize patent filing and make intellectual property protection accessible to all innovators.',
            'about.mission.title': 'Our Mission',
            'about.mission.text': 'LUMA IP was founded with the belief that protecting innovation shouldn\'t be complicated or expensive. We combine cutting-edge AI technology with legal expertise to streamline the patent process.',
            
            // Contact Page
            'contact.hero.title': 'Get in Touch',
            'contact.hero.description': 'We\'re here to help with your patent needs',
            'contact.name': 'Name',
            'contact.email': 'Email',
            'contact.subject': 'Subject',
            'contact.message': 'Message',
            'contact.send': 'Send Message',
            
            // Enhanced Contact Page
            'contact.hero.description': 'We\'re here to help with your patent needs. Reach out to our expert team for personalized assistance.',
            'contact.sales.title': 'Sales Inquiries',
            'contact.sales.subtitle': 'Talk to our sales team',
            'contact.sales.button': 'Schedule Demo',
            'contact.support.title': 'Technical Support',
            'contact.support.subtitle': '24/7 customer support',
            'contact.support.button': 'Open Ticket',
            'contact.partnership.title': 'Partnerships',
            'contact.partnership.subtitle': 'Become a partner',
            'contact.partnership.button': 'Partner With Us',
            'contact.form.title': 'Send Us a Message',
            'contact.form.description': 'Fill out the form below and our team will get back to you within 24 hours.',
            'contact.form.firstName': 'First Name',
            'contact.form.lastName': 'Last Name',
            'contact.form.email': 'Email Address',
            'contact.form.phone': 'Phone Number',
            'contact.form.company': 'Company Name',
            'contact.form.subject': 'Subject',
            'contact.form.subjectOptions.general': 'General Inquiry',
            'contact.form.subjectOptions.demo': 'Request a Demo',
            'contact.form.subjectOptions.support': 'Technical Support',
            'contact.form.subjectOptions.pricing': 'Pricing Information',
            'contact.form.subjectOptions.partnership': 'Partnership Opportunity',
            'contact.form.subjectOptions.other': 'Other',
            'contact.form.message': 'Message',
            'contact.form.consent': 'I agree to the processing of my personal data according to the Privacy Policy',
            'contact.form.submit': 'Send Message',
            'contact.offices.title': 'Office Locations',
            'contact.offices.hq.title': 'Headquarters',
            'contact.offices.hq.hours': 'Mon-Fri: 9:00 AM - 6:00 PM PST',
            'contact.offices.europe.title': 'Europe Office',
            'contact.offices.europe.hours': 'Mon-Fri: 9:00 AM - 6:00 PM GMT',
            'contact.offices.asia.title': 'Asia Pacific Office',
            'contact.offices.asia.hours': 'Mon-Fri: 9:00 AM - 6:00 PM SGT',
            'contact.quickLinks.title': 'Quick Links',
            'contact.quickLinks.documentation': 'Documentation',
            'contact.quickLinks.faq': 'FAQ & Help Center',
            'contact.quickLinks.chat': 'Live Chat Support',
            'contact.quickLinks.schedule': 'Schedule a Call',
            'contact.social.title': 'Follow Us',
            'contact.social.description': 'Stay updated with the latest news and updates',
            'contact.map.title': 'Find Us on the Map',
            'contact.map.placeholder': 'Interactive map would be displayed here',
            'contact.faq.title': 'Frequently Asked Questions',
            'contact.faq.q1': 'What are your business hours?',
            'contact.faq.a1': 'Our support team is available 24/7. Office hours vary by location - see our office locations above for specific times.',
            'contact.faq.q2': 'How quickly can I expect a response?',
            'contact.faq.a2': 'We typically respond to all inquiries within 24 hours. Priority support customers receive responses within 2 hours.',
            'contact.faq.q3': 'Do you offer on-site consultations?',
            'contact.faq.a3': 'Yes, we offer on-site consultations for Enterprise customers. Contact our sales team to schedule a visit.',
            
            // Features Page Extended (Missing translations)
            'features.hero.title': 'Powerful Features for Patent Professionals',
            'features.hero.description': 'Everything you need to draft, file, and manage patents efficiently with AI-powered assistance.',
            'features.core.title': 'Core Features',
            'features.ai.title': 'AI-Powered Patent Drafting',
            'features.ai.description': 'Generate complete patent applications with claims, specifications, and drawings using advanced AI trained on millions of patents.',
            'features.ai.point1': 'Automatic claim generation from invention disclosure',
            'features.ai.point2': 'Technical specification writing',
            'features.ai.point3': 'Drawing descriptions and annotations',
            'features.ai.point4': 'Multiple claim strategies and variations',
            'features.search.title': 'Advanced Prior Art Search',
            'features.search.description': 'Comprehensive semantic search across global patent databases with AI-powered relevance scoring.',
            'features.search.point1': 'Semantic similarity search',
            'features.search.point2': 'CPC classification analysis',
            'features.search.point3': 'Citation network visualization',
            'features.search.point4': 'Automated invalidity analysis',
            'features.docket.title': 'Intelligent Docket Management',
            'features.docket.description': 'Never miss a deadline with automated tracking, reminders, and statutory calculations.',
            'features.docket.point1': 'Automatic deadline calculation',
            'features.docket.point2': 'Multi-jurisdiction support',
            'features.docket.point3': 'Team task assignment',
            'features.docket.point4': 'Calendar integration',
            'features.additional.title': 'Additional Features',
            'features.forms.title': 'USPTO Form Generation',
            'features.forms.description': 'Automatically generate and validate all USPTO forms with pre-filled data.',
            'features.collaboration.title': 'Team Collaboration',
            'features.collaboration.description': 'Real-time collaboration with role-based permissions and version control.',
            'features.analytics.title': 'Portfolio Analytics',
            'features.analytics.description': 'Comprehensive analytics and reporting for your entire patent portfolio.',
            'features.fees.title': 'Fee Calculator',
            'features.fees.description': 'Accurate fee estimation for all entity types with excess claim calculations.',
            'features.translation.title': 'Multi-Language Support',
            'features.translation.description': 'File patents in multiple languages with professional translation services.',
            'features.integrations.title': 'Integrations',
            'features.integrations.description': 'Connect with existing IP management systems and legal software.'
        },
        
        fr: {
            // Navigation
            'nav.product': 'Produit',
            'nav.features': 'Fonctionnalités',
            'nav.howItWorks': 'Comment ça Marche',
            'nav.demo': 'Démo',
            'nav.pricing': 'Tarifs',
            'nav.security': 'Sécurité',
            'nav.api': 'API',
            'nav.signIn': 'Se Connecter',
            'nav.getStarted': 'Commencer',
            
            // Hero
            'hero.title': 'Utilité Juridique pour l\'Analyse de PI Assistée par Machine',
            'hero.subtitle': 'Transformez votre processus de dépôt de brevet avec l\'IA avancée. Générez des demandes de brevet complètes en quelques minutes, pas en mois. Alimenté par des modèles de langage de pointe.',
            'hero.watchDemo': 'Voir la Démo',
            'hero.startFiling': 'Commencer le Dépôt',
            
            // Stats
            'stats.patentsFiled': 'Brevets Déposés',
            'stats.grantRate': 'Taux d\'Acceptation',
            'stats.timeSaved': 'Temps Économisé',
            'stats.lawFirms': 'Cabinets d\'Avocats',
            
            // Features
            'features.title': 'Tout ce dont Vous Avez Besoin pour le Dépôt de Brevets',
            'features.subtitle': 'Une plateforme complète qui gère tout le cycle de vie du brevet',
            'features.aiDrafting.title': 'Rédaction par IA',
            'features.aiDrafting.description': 'Générez des revendications et spécifications de brevets en utilisant GPT-4 formé sur des millions de brevets',
            'features.usptoForms.title': 'Génération de Formulaires USPTO',
            'features.usptoForms.description': 'Créez automatiquement des formulaires ADS, IDS et autres USPTO avec des données validées',
            'features.priorArt.title': 'Recherche d\'Art Antérieur',
            'features.priorArt.description': 'Recherche sémantique basée sur des vecteurs dans les bases de données mondiales de brevets',
            'features.docket.title': 'Gestion des Dossiers',
            'features.docket.description': 'Ne manquez jamais une échéance avec le suivi et les rappels automatisés',
            'features.teamCollab.title': 'Collaboration d\'Équipe',
            'features.teamCollab.description': 'Travaillez ensemble avec un contrôle d\'accès basé sur les rôles et des mises à jour en temps réel',
            'features.enterpriseSec.title': 'Sécurité d\'Entreprise',
            'features.enterpriseSec.description': 'Chiffrement de niveau bancaire, conformité SOC 2 et pistes d\'audit',
            
            // Workflow
            'workflow.title': 'Processus Simple en 5 Étapes',
            'workflow.subtitle': 'De l\'idée au brevet déposé en un temps record',
            'workflow.step1.title': 'Décrivez Votre Invention',
            'workflow.step1.description': 'Saisissez les détails de votre invention et les spécifications techniques',
            'workflow.step2.title': 'Génération par IA',
            'workflow.step2.description': 'Notre LLM génère des revendications, des spécifications et des dessins',
            'workflow.step3.title': 'Analyse de l\'Art Antérieur',
            'workflow.step3.description': 'Recherche automatique et notation de brevetabilité',
            'workflow.step4.title': 'Réviser et Éditer',
            'workflow.step4.description': 'Affinez les documents générés avec l\'assistance de l\'IA',
            'workflow.step5.title': 'Déposer auprès de l\'USPTO',
            'workflow.step5.description': 'Soumettez directement ou exportez pour un dépôt traditionnel',
            
            // Demo
            'demo.title': 'Voir LUMA IP en Action',
            'demo.subtitle': 'Découvrez la puissance du dépôt de brevet piloté par l\'IA',
            'demo.tabs.dashboard': 'Tableau de Bord',
            'demo.tabs.filing': 'Nouveau Dépôt',
            'demo.tabs.portfolio': 'Portefeuille',
            'demo.tabs.priorArt': 'Art Antérieur',
            'demo.dashboard.title': 'Tableau de Bord du Portefeuille de Brevets',
            'demo.dashboard.activePatents': 'Brevets Actifs',
            'demo.dashboard.pending': 'En Attente',
            'demo.dashboard.deadlines': 'Échéances',
            'demo.dashboard.portfolioValue': 'Valeur du Portefeuille',
            'demo.dashboard.recentActivity': 'Activité Récente',
            
            // CTA
            'cta.title': 'Prêt à Révolutionner Votre Pratique de Brevets?',
            'cta.subtitle': 'Rejoignez des milliers de professionnels du brevet utilisant LUMA IP',
            'cta.startTrial': 'Commencer l\'Essai Gratuit',
            'cta.scheduleDemo': 'Planifier une Démo',
            
            // Footer
            'footer.tagline': 'Utilité Juridique pour l\'Analyse de PI Assistée par Machine',
            'footer.product': 'Produit',
            'footer.company': 'Entreprise',
            'footer.features': 'Fonctionnalités',
            'footer.pricing': 'Tarifs',
            'footer.security': 'Sécurité',
            'footer.api': 'API',
            'footer.about': 'À Propos',
            'footer.blog': 'Blog',
            'footer.careers': 'Carrières',
            'footer.contact': 'Contact',
            'footer.legal': 'Juridique',
            'footer.privacy': 'Politique de Confidentialité',
            'footer.terms': 'Conditions d\'Utilisation',
            'footer.cookiePolicy': 'Politique de Cookies',
            'footer.compliance': 'Conformité',
            'footer.copyright': '© 2024 LUMA IP. Tous droits réservés. Brevet en instance.',
            
            // Product Page
            'product.hero.title': 'La Plateforme de Brevets Complète',
            'product.hero.description': 'LUMA IP combine l\'IA de pointe avec l\'expertise juridique pour rationaliser tous les aspects du dépôt de brevets, de la rédaction initiale à la poursuite finale.',
            'product.platform.title': 'Gestion de Brevets de Bout en Bout',
            'product.platform.description': 'Notre plateforme gère chaque étape du cycle de vie du brevet, de la divulgation de l\'invention à la maintenance du brevet accordé.',
            'product.platform.feature1.title': 'Rédaction Alimentée par l\'IA',
            'product.platform.feature1.description': 'Générez des demandes de brevet complètes en quelques minutes',
            'product.platform.feature2.title': 'Recherche Intelligente d\'Art Antérieur',
            'product.platform.feature2.description': 'Recherche sémantique alimentée par l\'IA dans les bases de données mondiales',
            'product.platform.feature3.title': 'Flux de Travail Automatisés',
            'product.platform.feature3.description': 'Rationalisez le dépôt avec une automatisation intelligente',
            'product.components.title': 'Composants Clés',
            'product.components.ai.title': 'Moteur d\'IA',
            'product.components.ai.description': 'Modèles de langage avancés formés sur des millions de brevets pour une génération précise de revendications',
            'product.components.database.title': 'Base de Données de Brevets',
            'product.components.database.description': 'Accès aux bases de données mondiales de brevets avec mises à jour en temps réel et couverture complète',
            'product.components.compliance.title': 'Outils de Conformité',
            'product.components.compliance.description': 'Vérifications de conformité intégrées et génération de formulaires USPTO avec validation',
            
            // Security Page
            'security.hero.title': 'La Sécurité d\'Abord, Toujours',
            'security.hero.description': 'Votre propriété intellectuelle est protégée par une sécurité de niveau entreprise, des certifications de conformité et les meilleures pratiques de l\'industrie.',
            'security.features.title': 'Fonctionnalités de Sécurité',
            'security.encryption.title': 'Chiffrement de Bout en Bout',
            'security.encryption.description': 'Toutes les données sont chiffrées au repos avec AES-256 et en transit avec TLS 1.3',
            'security.access.title': 'Contrôle d\'Accès',
            'security.access.description': 'Contrôle d\'accès basé sur les rôles avec authentification multifacteur et support SSO',
            'security.audit.title': 'Journalisation d\'Audit',
            'security.audit.description': 'Piste d\'audit complète de toutes les actions avec journalisation inviolable',
            'security.infrastructure.title': 'Infrastructure Sécurisée',
            'security.infrastructure.description': 'Hébergé sur une infrastructure conforme SOC 2 avec SLA de disponibilité de 99,99%',
            'security.threat.title': 'Protection contre les Menaces',
            'security.threat.description': 'Détection des menaces en temps réel avec protection DDoS et WAF',
            'security.backup.title': 'Sauvegarde des Données',
            'security.backup.description': 'Sauvegardes quotidiennes automatisées avec récupération à un point dans le temps',
            'security.compliance.title': 'Conformité et Certifications',
            'security.soc2': 'Certifié conforme',
            'security.iso': 'Certifié',
            'security.gdpr': 'Conforme',
            'security.ccpa': 'Conforme',
            
            // API Page
            'api.hero.title': 'API pour Développeurs',
            'api.hero.description': 'Intégrez les capacités d\'automatisation de brevets de LUMA IP dans vos applications avec notre API RESTful.',
            'api.endpoints.title': 'Points de Terminaison API',
            
            // Features Page - French
            'features.hero.title': 'Fonctionnalités Puissantes pour les Professionnels des Brevets',
            'features.hero.description': 'Tout ce dont vous avez besoin pour rédiger, déposer et gérer des brevets efficacement avec l\'assistance de l\'IA.',
            'features.core.title': 'Fonctionnalités Principales',
            'features.ai.title': 'Rédaction de Brevets Alimentée par l\'IA',
            'features.ai.description': 'Générez des demandes de brevet complètes avec revendications, spécifications et dessins en utilisant une IA avancée formée sur des millions de brevets.',
            'features.ai.point1': 'Génération automatique de revendications à partir de la divulgation de l\'invention',
            'features.ai.point2': 'Rédaction de spécifications techniques',
            'features.ai.point3': 'Descriptions et annotations de dessins',
            'features.ai.point4': 'Stratégies et variations de revendications multiples',
            'features.search.title': 'Recherche Avancée d\'Art Antérieur',
            'features.search.description': 'Recherche sémantique complète dans les bases de données mondiales de brevets avec notation de pertinence alimentée par l\'IA.',
            'features.search.point1': 'Recherche de similarité sémantique',
            'features.search.point2': 'Analyse de classification CPC',
            'features.search.point3': 'Visualisation du réseau de citations',
            'features.search.point4': 'Analyse d\'invalidité automatisée',
            'features.docket.title': 'Gestion Intelligente des Dossiers',
            'features.docket.description': 'Ne manquez jamais une échéance avec le suivi automatisé, les rappels et les calculs statutaires.',
            'features.docket.point1': 'Calcul automatique des échéances',
            'features.docket.point2': 'Support multi-juridictionnel',
            'features.docket.point3': 'Attribution de tâches d\'équipe',
            'features.docket.point4': 'Intégration de calendrier',
            'features.additional.title': 'Fonctionnalités Supplémentaires',
            'features.forms.title': 'Génération de Formulaires USPTO',
            'features.forms.description': 'Générez et validez automatiquement tous les formulaires USPTO avec des données pré-remplies.',
            'features.collaboration.title': 'Collaboration d\'Équipe',
            'features.collaboration.description': 'Collaboration en temps réel avec permissions basées sur les rôles et contrôle de version.',
            'features.analytics.title': 'Analyse de Portefeuille',
            'features.analytics.description': 'Analyses et rapports complets pour l\'ensemble de votre portefeuille de brevets.',
            'features.fees.title': 'Calculateur de Frais',
            'features.fees.description': 'Estimation précise des frais pour tous les types d\'entités avec calculs de revendications excédentaires.',
            'features.translation.title': 'Support Multi-Langues',
            'features.translation.description': 'Déposez des brevets dans plusieurs langues avec des services de traduction professionnels.',
            'features.integrations.title': 'Intégrations',
            'features.integrations.description': 'Connectez-vous aux systèmes de gestion de PI et aux logiciels juridiques existants.',
            
            // Pricing Page - French
            'pricing.hero.title': 'Tarification Simple et Transparente',
            'pricing.hero.description': 'Choisissez le plan qui correspond à vos besoins. Évoluez à tout moment.',
            'pricing.monthly': 'Mensuel',
            'pricing.annual': 'Annuel (Économisez 20%)',
            'pricing.getStarted': 'Commencer',
            'pricing.startTrial': 'Commencer l\'Essai Gratuit',
            'pricing.contactSales': 'Contacter les Ventes',
            'pricing.mostPopular': 'LE PLUS POPULAIRE',
            'pricing.starter.title': 'Débutant',
            'pricing.starter.description': 'Parfait pour les praticiens individuels',
            'pricing.starter.period': '/mois',
            'pricing.starter.feature1': 'Jusqu\'à 5 dépôts de brevets/mois',
            'pricing.starter.feature2': 'Assistance de rédaction IA de base',
            'pricing.starter.feature3': 'Recherche d\'art antérieur (100 requêtes/mois)',
            'pricing.starter.feature4': 'Support par email',
            'pricing.starter.feature5': 'Génération de formulaires USPTO',
            'pricing.professional.title': 'Professionnel',
            'pricing.professional.description': 'Pour les pratiques de brevets en croissance',
            'pricing.professional.period': '/mois',
            'pricing.professional.feature1': 'Dépôts de brevets illimités',
            'pricing.professional.feature2': 'IA avancée avec formation personnalisée',
            'pricing.professional.feature3': 'Recherches d\'art antérieur illimitées',
            'pricing.professional.feature4': 'Support prioritaire',
            'pricing.professional.feature5': 'Collaboration d\'équipe (jusqu\'à 10 utilisateurs)',
            'pricing.professional.feature6': 'Accès API',
            'pricing.professional.feature7': 'Analyse de portefeuille',
            'pricing.enterprise.title': 'Entreprise',
            'pricing.enterprise.description': 'Pour les grandes organisations',
            'pricing.enterprise.custom': 'Personnalisé',
            'pricing.enterprise.feature1': 'Tout dans Professionnel',
            'pricing.enterprise.feature2': 'Utilisateurs illimités',
            'pricing.enterprise.feature3': 'Formation de modèle IA personnalisée',
            'pricing.enterprise.feature4': 'Gestionnaire de compte dédié',
            'pricing.enterprise.feature5': 'Option de déploiement sur site',
            'pricing.enterprise.feature6': 'Garantie SLA',
            'pricing.enterprise.feature7': 'Intégrations personnalisées',
            'pricing.faq.title': 'Questions Fréquemment Posées',
            'pricing.faq.q1': 'Puis-je changer de plan à tout moment?',
            'pricing.faq.a1': 'Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements prennent effet au prochain cycle de facturation.',
            'pricing.faq.q2': 'Y a-t-il un essai gratuit?',
            'pricing.faq.a2': 'Oui, nous offrons un essai gratuit de 14 jours pour le plan Professionnel avec accès complet à toutes les fonctionnalités.',
            'pricing.faq.q3': 'Quels modes de paiement acceptez-vous?',
            'pricing.faq.a3': 'Nous acceptons toutes les principales cartes de crédit, les virements ACH et les virements bancaires pour les plans Entreprise.',
            
            // About Page - French
            'about.hero.title': 'À Propos de LUMA IP',
            'about.hero.description': 'Nous avons pour mission de démocratiser le dépôt de brevets et de rendre la protection de la propriété intellectuelle accessible à tous les innovateurs.',
            'about.mission.title': 'Notre Mission',
            'about.mission.text': 'LUMA IP a été fondée avec la conviction que la protection de l\'innovation ne devrait pas être compliquée ou coûteuse. Nous combinons une technologie d\'IA de pointe avec une expertise juridique pour rationaliser le processus de brevet.',
            
            // Contact Page - French
            'contact.hero.title': 'Contactez-Nous',
            'contact.hero.description': 'Nous sommes là pour vous aider avec vos besoins en brevets',
            'contact.name': 'Nom',
            'contact.email': 'Email',
            'contact.subject': 'Sujet',
            'contact.message': 'Message',
            'contact.send': 'Envoyer le Message',
            
            // Enhanced Contact Page - French
            'contact.hero.description': 'Nous sommes là pour vous aider avec vos besoins en brevets. Contactez notre équipe d\'experts pour une assistance personnalisée.',
            'contact.sales.title': 'Demandes Commerciales',
            'contact.sales.subtitle': 'Parlez à notre équipe commerciale',
            'contact.sales.button': 'Planifier une Démo',
            'contact.support.title': 'Support Technique',
            'contact.support.subtitle': 'Support client 24/7',
            'contact.support.button': 'Ouvrir un Ticket',
            'contact.partnership.title': 'Partenariats',
            'contact.partnership.subtitle': 'Devenez partenaire',
            'contact.partnership.button': 'Devenir Partenaire',
            'contact.form.title': 'Envoyez-nous un Message',
            'contact.form.description': 'Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les 24 heures.',
            'contact.form.firstName': 'Prénom',
            'contact.form.lastName': 'Nom',
            'contact.form.email': 'Adresse Email',
            'contact.form.phone': 'Numéro de Téléphone',
            'contact.form.company': 'Nom de l\'Entreprise',
            'contact.form.subject': 'Sujet',
            'contact.form.subjectOptions.general': 'Demande Générale',
            'contact.form.subjectOptions.demo': 'Demander une Démo',
            'contact.form.subjectOptions.support': 'Support Technique',
            'contact.form.subjectOptions.pricing': 'Informations Tarifaires',
            'contact.form.subjectOptions.partnership': 'Opportunité de Partenariat',
            'contact.form.subjectOptions.other': 'Autre',
            'contact.form.message': 'Message',
            'contact.form.consent': 'J\'accepte le traitement de mes données personnelles conformément à la Politique de Confidentialité',
            'contact.form.submit': 'Envoyer le Message',
            'contact.offices.title': 'Nos Bureaux',
            'contact.offices.hq.title': 'Siège Social',
            'contact.offices.hq.hours': 'Lun-Ven: 9h00 - 18h00 PST',
            'contact.offices.europe.title': 'Bureau Europe',
            'contact.offices.europe.hours': 'Lun-Ven: 9h00 - 18h00 GMT',
            'contact.offices.asia.title': 'Bureau Asie-Pacifique',
            'contact.offices.asia.hours': 'Lun-Ven: 9h00 - 18h00 SGT',
            'contact.quickLinks.title': 'Liens Rapides',
            'contact.quickLinks.documentation': 'Documentation',
            'contact.quickLinks.faq': 'FAQ et Centre d\'Aide',
            'contact.quickLinks.chat': 'Support par Chat en Direct',
            'contact.quickLinks.schedule': 'Planifier un Appel',
            'contact.social.title': 'Suivez-nous',
            'contact.social.description': 'Restez informé des dernières nouvelles et mises à jour',
            'contact.map.title': 'Trouvez-nous sur la Carte',
            'contact.map.placeholder': 'La carte interactive s\'afficherait ici',
            'contact.faq.title': 'Questions Fréquemment Posées',
            'contact.faq.q1': 'Quelles sont vos heures d\'ouverture?',
            'contact.faq.a1': 'Notre équipe de support est disponible 24/7. Les heures de bureau varient selon l\'emplacement - voir nos bureaux ci-dessus pour les horaires spécifiques.',
            'contact.faq.q2': 'Dans quel délai puis-je attendre une réponse?',
            'contact.faq.a2': 'Nous répondons généralement à toutes les demandes dans les 24 heures. Les clients avec support prioritaire reçoivent des réponses dans les 2 heures.',
            'contact.faq.q3': 'Offrez-vous des consultations sur site?',
            'contact.faq.a3': 'Oui, nous offrons des consultations sur site pour les clients Enterprise. Contactez notre équipe commerciale pour planifier une visite.',
            
            // Blog Page - French
            'blog.hero.title': 'Blog LUMA IP',
            'blog.hero.description': 'Perspectives sur le droit des brevets, la technologie IA et l\'innovation',
            'blog.category.ai': 'Technologie IA',
            'blog.post1.title': 'L\'Avenir de l\'IA dans la Rédaction de Brevets',
            'blog.post1.excerpt': 'Explorer comment l\'intelligence artificielle révolutionne le processus de demande de brevet...',
            'blog.readMore': 'Lire Plus →',
            
            // Careers Page - French
            'careers.hero.title': 'Rejoignez Notre Équipe',
            'careers.hero.description': 'Aidez-nous à révolutionner l\'industrie des brevets avec l\'IA',
            'careers.openings.title': 'Postes Ouverts',
            'careers.job1.title': 'Ingénieur IA Senior',
            'careers.job1.location': 'Télétravail / San Francisco, CA',
            'careers.job1.description': 'Construire et optimiser des modèles d\'IA pour l\'analyse et la génération de brevets',
            'careers.apply': 'Postuler',
            
            // Privacy Policy - French
            'privacy.title': 'Politique de Confidentialité',
            'privacy.intro': 'Dernière mise à jour : Janvier 2024',
            'privacy.section1.title': 'Informations que Nous Collectons',
            'privacy.section1.text': 'Nous collectons les informations que vous nous fournissez directement, comme lorsque vous créez un compte, soumettez une demande de brevet ou nous contactez pour obtenir de l\'aide.',
            'privacy.section2.title': 'Comment Nous Utilisons Vos Informations',
            'privacy.section2.text': 'Nous utilisons les informations que nous collectons pour fournir, maintenir et améliorer nos services, traiter les transactions et communiquer avec vous.',
            'privacy.section3.title': 'Sécurité des Données',
            'privacy.section3.text': 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l\'accès non autorisé, l\'altération, la divulgation ou la destruction.',
            
            // Terms of Service - French
            'terms.title': 'Conditions d\'Utilisation',
            'terms.intro': 'Dernière mise à jour : Janvier 2024',
            'terms.section1.title': 'Acceptation des Conditions',
            'terms.section1.text': 'En accédant et en utilisant les services LUMA IP, vous acceptez d\'être lié par ces Conditions d\'Utilisation.',
            'terms.section2.title': 'Utilisation des Services',
            'terms.section2.text': 'Vous ne pouvez utiliser nos services que dans la mesure permise par la loi et conformément à ces Conditions.',
            
            // Cookie Policy - French
            'cookie.title': 'Politique de Cookies',
            'cookie.intro': 'Dernière mise à jour : Janvier 2024',
            'cookie.section1.title': 'Que Sont les Cookies',
            'cookie.section1.text': 'Les cookies sont de petits fichiers texte qui sont placés sur votre appareil lorsque vous visitez notre site Web.',
            'cookie.section2.title': 'Comment Nous Utilisons les Cookies',
            'cookie.section2.text': 'Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic du site et personnaliser le contenu.',
            
            // Compliance - French
            'compliance.title': 'Conformité',
            'compliance.certifications.title': 'Nos Certifications',
            'compliance.soc2.description': 'Audit annuel de sécurité, disponibilité et confidentialité',
            'compliance.iso.description': 'Certification du système de gestion de la sécurité de l\'information',
            'compliance.gdpr.description': 'Conformité totale avec les réglementations européennes sur la protection des données'
        },
        
        es: {
            // Navigation
            'nav.product': 'Producto',
            'nav.features': 'Características',
            'nav.howItWorks': 'Cómo Funciona',
            'nav.demo': 'Demo',
            'nav.pricing': 'Precios',
            'nav.security': 'Seguridad',
            'nav.api': 'API',
            'nav.signIn': 'Iniciar Sesión',
            'nav.getStarted': 'Comenzar',
            
            // Hero
            'hero.title': 'Utilidad Legal para Análisis de PI Asistido por Máquina',
            'hero.subtitle': 'Transforme su proceso de solicitud de patentes con IA avanzada. Genere solicitudes de patentes completas en minutos, no meses. Impulsado por modelos de lenguaje de última generación.',
            'hero.watchDemo': 'Ver Demo',
            'hero.startFiling': 'Comenzar Solicitud',
            
            // Stats
            'stats.patentsFiled': 'Patentes Presentadas',
            'stats.grantRate': 'Tasa de Concesión',
            'stats.timeSaved': 'Tiempo Ahorrado',
            'stats.lawFirms': 'Firmas de Abogados',
            
            // Features
            'features.title': 'Todo lo que Necesita para Presentar Patentes',
            'features.subtitle': 'Una plataforma completa que maneja todo el ciclo de vida de la patente',
            'features.aiDrafting.title': 'Redacción con IA',
            'features.aiDrafting.description': 'Genere reivindicaciones y especificaciones de patentes usando GPT-4 entrenado en millones de patentes',
            'features.usptoForms.title': 'Generación de Formularios USPTO',
            'features.usptoForms.description': 'Cree automáticamente ADS, IDS y otros formularios USPTO con datos validados',
            'features.priorArt.title': 'Búsqueda de Arte Previo',
            'features.priorArt.description': 'Búsqueda semántica basada en vectores a través de bases de datos globales de patentes',
            'features.docket.title': 'Gestión de Expedientes',
            'features.docket.description': 'Nunca pierda una fecha límite con seguimiento y recordatorios automatizados',
            'features.teamCollab.title': 'Colaboración en Equipo',
            'features.teamCollab.description': 'Trabajen juntos con control de acceso basado en roles y actualizaciones en tiempo real',
            'features.enterpriseSec.title': 'Seguridad Empresarial',
            'features.enterpriseSec.description': 'Cifrado de nivel bancario, cumplimiento SOC 2 y registros de auditoría',
            
            // Workflow
            'workflow.title': 'Proceso Simple de 5 Pasos',
            'workflow.subtitle': 'De la idea a la patente presentada en tiempo récord',
            'workflow.step1.title': 'Describa Su Invención',
            'workflow.step1.description': 'Ingrese los detalles de su invención y especificaciones técnicas',
            'workflow.step2.title': 'Generación con IA',
            'workflow.step2.description': 'Nuestro LLM genera reivindicaciones, especificaciones y dibujos',
            'workflow.step3.title': 'Análisis de Arte Previo',
            'workflow.step3.description': 'Búsqueda automática y puntuación de patentabilidad',
            'workflow.step4.title': 'Revisar y Editar',
            'workflow.step4.description': 'Perfeccione los documentos generados con asistencia de IA',
            'workflow.step5.title': 'Presentar ante USPTO',
            'workflow.step5.description': 'Envíe directamente o exporte para presentación tradicional',
            
            // Demo
            'demo.title': 'Vea LUMA IP en Acción',
            'demo.subtitle': 'Experimente el poder de la presentación de patentes impulsada por IA',
            'demo.tabs.dashboard': 'Panel',
            'demo.tabs.filing': 'Nueva Solicitud',
            'demo.tabs.portfolio': 'Portafolio',
            'demo.tabs.priorArt': 'Arte Previo',
            'demo.dashboard.title': 'Panel de Portafolio de Patentes',
            'demo.dashboard.activePatents': 'Patentes Activas',
            'demo.dashboard.pending': 'Pendientes',
            'demo.dashboard.deadlines': 'Fechas Límite',
            'demo.dashboard.portfolioValue': 'Valor del Portafolio',
            'demo.dashboard.recentActivity': 'Actividad Reciente',
            
            // CTA
            'cta.title': '¿Listo para Revolucionar su Práctica de Patentes?',
            'cta.subtitle': 'Únase a miles de profesionales de patentes que usan LUMA IP',
            'cta.startTrial': 'Iniciar Prueba Gratuita',
            'cta.scheduleDemo': 'Programar Demo',
            
            // Footer
            'footer.tagline': 'Utilidad Legal para Análisis de PI Asistido por Máquina',
            'footer.product': 'Producto',
            'footer.company': 'Empresa',
            'footer.features': 'Características',
            'footer.pricing': 'Precios',
            'footer.security': 'Seguridad',
            'footer.api': 'API',
            'footer.about': 'Acerca de Nosotros',
            'footer.blog': 'Blog',
            'footer.careers': 'Carreras',
            'footer.legal': 'Legal',
            'footer.privacy': 'Política de Privacidad',
            'footer.terms': 'Términos de Servicio',
            'footer.cookiePolicy': 'Política de Cookies',
            'footer.compliance': 'Cumplimiento',
            'footer.copyright': '© 2024 LUMA IP. Todos los derechos reservados. Patente pendiente.',
            
            // Product Page
            'product.hero.title': 'La Plataforma Completa de Patentes',
            'product.hero.description': 'LUMA IP combina IA de vanguardia con experiencia legal para optimizar todos los aspectos de la presentación de patentes, desde el borrador inicial hasta la prosecución final.',
            'product.platform.title': 'Gestión de Patentes de Extremo a Extremo',
            'product.platform.description': 'Nuestra plataforma maneja cada etapa del ciclo de vida de la patente, desde la divulgación de la invención hasta el mantenimiento de la patente otorgada.',
            'product.platform.feature1.title': 'Redacción Impulsada por IA',
            'product.platform.feature1.description': 'Genere solicitudes de patentes completas en minutos',
            'product.platform.feature2.title': 'Búsqueda Inteligente de Arte Previo',
            'product.platform.feature2.description': 'Búsqueda semántica impulsada por IA en bases de datos globales',
            'product.platform.feature3.title': 'Flujos de Trabajo Automatizados',
            'product.platform.feature3.description': 'Optimice la presentación con automatización inteligente',
            'product.components.title': 'Componentes Clave',
            'product.components.ai.title': 'Motor de IA',
            'product.components.ai.description': 'Modelos de lenguaje avanzados entrenados en millones de patentes para generación precisa de reivindicaciones',
            'product.components.database.title': 'Base de Datos de Patentes',
            'product.components.database.description': 'Acceso a bases de datos de patentes globales con actualizaciones en tiempo real y cobertura integral',
            'product.components.compliance.title': 'Herramientas de Cumplimiento',
            'product.components.compliance.description': 'Verificaciones de cumplimiento integradas y generación de formularios USPTO con validación',
            
            // Security Page
            'security.hero.title': 'Seguridad Primero, Siempre',
            'security.hero.description': 'Su propiedad intelectual está protegida por seguridad de nivel empresarial, certificaciones de cumplimiento y mejores prácticas de la industria.',
            'security.features.title': 'Características de Seguridad',
            'security.encryption.title': 'Cifrado de Extremo a Extremo',
            'security.encryption.description': 'Todos los datos están cifrados en reposo con AES-256 y en tránsito con TLS 1.3',
            'security.access.title': 'Control de Acceso',
            'security.access.description': 'Control de acceso basado en roles con autenticación multifactor y soporte SSO',
            'security.audit.title': 'Registro de Auditoría',
            'security.audit.description': 'Rastro de auditoría completo de todas las acciones con registro a prueba de manipulaciones',
            'security.infrastructure.title': 'Infraestructura Segura',
            'security.infrastructure.description': 'Alojado en infraestructura compatible con SOC 2 con SLA de tiempo de actividad del 99.99%',
            'security.threat.title': 'Protección contra Amenazas',
            'security.threat.description': 'Detección de amenazas en tiempo real con protección DDoS y WAF',
            'security.backup.title': 'Respaldo de Datos',
            'security.backup.description': 'Respaldos diarios automatizados con recuperación punto en el tiempo',
            'security.compliance.title': 'Cumplimiento y Certificaciones',
            'security.soc2': 'Certificado conforme',
            'security.iso': 'Certificado',
            'security.gdpr': 'Conforme',
            'security.ccpa': 'Conforme',
            
            // API Page
            'api.hero.title': 'API para Desarrolladores',
            'api.hero.description': 'Integre las capacidades de automatización de patentes de LUMA IP en sus aplicaciones con nuestra API RESTful.',
            'api.endpoints.title': 'Endpoints de API',
            
            // Features Page - Spanish
            'features.hero.title': 'Características Potentes para Profesionales de Patentes',
            'features.hero.description': 'Todo lo que necesita para redactar, presentar y gestionar patentes de manera eficiente con asistencia de IA.',
            'features.core.title': 'Características Principales',
            'features.ai.title': 'Redacción de Patentes Impulsada por IA',
            'features.ai.description': 'Genere solicitudes de patentes completas con reivindicaciones, especificaciones y dibujos utilizando IA avanzada entrenada en millones de patentes.',
            'features.ai.point1': 'Generación automática de reivindicaciones a partir de la divulgación de invención',
            'features.ai.point2': 'Redacción de especificaciones técnicas',
            'features.ai.point3': 'Descripciones y anotaciones de dibujos',
            'features.ai.point4': 'Múltiples estrategias y variaciones de reivindicaciones',
            'features.search.title': 'Búsqueda Avanzada de Arte Previo',
            'features.search.description': 'Búsqueda semántica integral en bases de datos de patentes globales con puntuación de relevancia impulsada por IA.',
            'features.search.point1': 'Búsqueda de similitud semántica',
            'features.search.point2': 'Análisis de clasificación CPC',
            'features.search.point3': 'Visualización de red de citas',
            'features.search.point4': 'Análisis de invalidez automatizado',
            'features.docket.title': 'Gestión Inteligente de Expedientes',
            'features.docket.description': 'Nunca pierda una fecha límite con seguimiento automatizado, recordatorios y cálculos estatutarios.',
            'features.docket.point1': 'Cálculo automático de plazos',
            'features.docket.point2': 'Soporte multi-jurisdiccional',
            'features.docket.point3': 'Asignación de tareas del equipo',
            'features.docket.point4': 'Integración de calendario',
            'features.additional.title': 'Características Adicionales',
            'features.forms.title': 'Generación de Formularios USPTO',
            'features.forms.description': 'Genere y valide automáticamente todos los formularios USPTO con datos prellenados.',
            'features.collaboration.title': 'Colaboración en Equipo',
            'features.collaboration.description': 'Colaboración en tiempo real con permisos basados en roles y control de versiones.',
            'features.analytics.title': 'Análisis de Cartera',
            'features.analytics.description': 'Análisis e informes completos para toda su cartera de patentes.',
            'features.fees.title': 'Calculadora de Tarifas',
            'features.fees.description': 'Estimación precisa de tarifas para todos los tipos de entidades con cálculos de reivindicaciones excedentes.',
            'features.translation.title': 'Soporte Multi-Idioma',
            'features.translation.description': 'Presente patentes en múltiples idiomas con servicios de traducción profesional.',
            'features.integrations.title': 'Integraciones',
            'features.integrations.description': 'Conéctese con sistemas de gestión de PI y software legal existentes.',
            
            // Pricing Page - Spanish
            'pricing.hero.title': 'Precios Simples y Transparentes',
            'pricing.hero.description': 'Elija el plan que se adapte a sus necesidades. Escale hacia arriba o hacia abajo en cualquier momento.',
            'pricing.monthly': 'Mensual',
            'pricing.annual': 'Anual (Ahorre 20%)',
            'pricing.getStarted': 'Comenzar',
            'pricing.startTrial': 'Iniciar Prueba Gratuita',
            'pricing.contactSales': 'Contactar Ventas',
            'pricing.mostPopular': 'MÁS POPULAR',
            'pricing.starter.title': 'Inicial',
            'pricing.starter.description': 'Perfecto para profesionales individuales',
            'pricing.starter.period': '/mes',
            'pricing.starter.feature1': 'Hasta 5 presentaciones de patentes/mes',
            'pricing.starter.feature2': 'Asistencia básica de redacción con IA',
            'pricing.starter.feature3': 'Búsqueda de arte previo (100 consultas/mes)',
            'pricing.starter.feature4': 'Soporte por correo electrónico',
            'pricing.starter.feature5': 'Generación de formularios USPTO',
            'pricing.professional.title': 'Profesional',
            'pricing.professional.description': 'Para prácticas de patentes en crecimiento',
            'pricing.professional.period': '/mes',
            'pricing.professional.feature1': 'Presentaciones de patentes ilimitadas',
            'pricing.professional.feature2': 'IA avanzada con entrenamiento personalizado',
            'pricing.professional.feature3': 'Búsquedas de arte previo ilimitadas',
            'pricing.professional.feature4': 'Soporte prioritario',
            'pricing.professional.feature5': 'Colaboración en equipo (hasta 10 usuarios)',
            'pricing.professional.feature6': 'Acceso a API',
            'pricing.professional.feature7': 'Análisis de cartera',
            'pricing.enterprise.title': 'Empresa',
            'pricing.enterprise.description': 'Para grandes organizaciones',
            'pricing.enterprise.custom': 'Personalizado',
            'pricing.enterprise.feature1': 'Todo en Profesional',
            'pricing.enterprise.feature2': 'Usuarios ilimitados',
            'pricing.enterprise.feature3': 'Entrenamiento de modelo de IA personalizado',
            'pricing.enterprise.feature4': 'Gerente de cuenta dedicado',
            'pricing.enterprise.feature5': 'Opción de implementación local',
            'pricing.enterprise.feature6': 'Garantía de SLA',
            'pricing.enterprise.feature7': 'Integraciones personalizadas',
            'pricing.faq.title': 'Preguntas Frecuentes',
            'pricing.faq.q1': '¿Puedo cambiar de plan en cualquier momento?',
            'pricing.faq.a1': 'Sí, puede actualizar o degradar su plan en cualquier momento. Los cambios entran en vigencia en el próximo ciclo de facturación.',
            'pricing.faq.q2': '¿Hay una prueba gratuita?',
            'pricing.faq.a2': 'Sí, ofrecemos una prueba gratuita de 14 días para el plan Profesional con acceso completo a todas las funciones.',
            'pricing.faq.q3': '¿Qué métodos de pago aceptan?',
            'pricing.faq.a3': 'Aceptamos todas las principales tarjetas de crédito, transferencias ACH y transferencias bancarias para planes Enterprise.',
            
            // About Page - Spanish
            'about.hero.title': 'Acerca de LUMA IP',
            'about.hero.description': 'Estamos en una misión para democratizar la presentación de patentes y hacer que la protección de la propiedad intelectual sea accesible para todos los innovadores.',
            'about.mission.title': 'Nuestra Misión',
            'about.mission.text': 'LUMA IP fue fundada con la creencia de que proteger la innovación no debería ser complicado o costoso. Combinamos tecnología de IA de vanguardia con experiencia legal para optimizar el proceso de patentes.',
            
            // Contact Page - Spanish
            'contact.hero.title': 'Póngase en Contacto',
            'contact.hero.description': 'Estamos aquí para ayudar con sus necesidades de patentes',
            'contact.name': 'Nombre',
            'contact.email': 'Correo Electrónico',
            'contact.subject': 'Asunto',
            'contact.message': 'Mensaje',
            'contact.send': 'Enviar Mensaje',
            
            // Enhanced Contact Page - Spanish
            'contact.hero.description': 'Estamos aquí para ayudar con sus necesidades de patentes. Póngase en contacto con nuestro equipo de expertos para asistencia personalizada.',
            'contact.sales.title': 'Consultas de Ventas',
            'contact.sales.subtitle': 'Hable con nuestro equipo de ventas',
            'contact.sales.button': 'Programar Demo',
            'contact.support.title': 'Soporte Técnico',
            'contact.support.subtitle': 'Soporte al cliente 24/7',
            'contact.support.button': 'Abrir Ticket',
            'contact.partnership.title': 'Asociaciones',
            'contact.partnership.subtitle': 'Conviértase en socio',
            'contact.partnership.button': 'Asóciese con Nosotros',
            'contact.form.title': 'Envíenos un Mensaje',
            'contact.form.description': 'Complete el formulario a continuación y nuestro equipo le responderá dentro de 24 horas.',
            'contact.form.firstName': 'Nombre',
            'contact.form.lastName': 'Apellido',
            'contact.form.email': 'Dirección de Correo Electrónico',
            'contact.form.phone': 'Número de Teléfono',
            'contact.form.company': 'Nombre de la Empresa',
            'contact.form.subject': 'Asunto',
            'contact.form.subjectOptions.general': 'Consulta General',
            'contact.form.subjectOptions.demo': 'Solicitar una Demo',
            'contact.form.subjectOptions.support': 'Soporte Técnico',
            'contact.form.subjectOptions.pricing': 'Información de Precios',
            'contact.form.subjectOptions.partnership': 'Oportunidad de Asociación',
            'contact.form.subjectOptions.other': 'Otro',
            'contact.form.message': 'Mensaje',
            'contact.form.consent': 'Acepto el procesamiento de mis datos personales de acuerdo con la Política de Privacidad',
            'contact.form.submit': 'Enviar Mensaje',
            'contact.offices.title': 'Ubicaciones de Oficinas',
            'contact.offices.hq.title': 'Sede Central',
            'contact.offices.hq.hours': 'Lun-Vie: 9:00 AM - 6:00 PM PST',
            'contact.offices.europe.title': 'Oficina Europa',
            'contact.offices.europe.hours': 'Lun-Vie: 9:00 AM - 6:00 PM GMT',
            'contact.offices.asia.title': 'Oficina Asia Pacífico',
            'contact.offices.asia.hours': 'Lun-Vie: 9:00 AM - 6:00 PM SGT',
            'contact.quickLinks.title': 'Enlaces Rápidos',
            'contact.quickLinks.documentation': 'Documentación',
            'contact.quickLinks.faq': 'Preguntas Frecuentes y Centro de Ayuda',
            'contact.quickLinks.chat': 'Soporte por Chat en Vivo',
            'contact.quickLinks.schedule': 'Programar una Llamada',
            'contact.social.title': 'Síguenos',
            'contact.social.description': 'Manténgase actualizado con las últimas noticias y actualizaciones',
            'contact.map.title': 'Encuéntrenos en el Mapa',
            'contact.map.placeholder': 'El mapa interactivo se mostraría aquí',
            'contact.faq.title': 'Preguntas Frecuentes',
            'contact.faq.q1': '¿Cuáles son sus horarios de atención?',
            'contact.faq.a1': 'Nuestro equipo de soporte está disponible 24/7. Los horarios de oficina varían según la ubicación - vea nuestras oficinas arriba para horarios específicos.',
            'contact.faq.q2': '¿Qué tan rápido puedo esperar una respuesta?',
            'contact.faq.a2': 'Normalmente respondemos a todas las consultas dentro de 24 horas. Los clientes con soporte prioritario reciben respuestas dentro de 2 horas.',
            'contact.faq.q3': '¿Ofrecen consultas en sitio?',
            'contact.faq.a3': 'Sí, ofrecemos consultas en sitio para clientes Enterprise. Contacte a nuestro equipo de ventas para programar una visita.',
            
            // Blog Page - Spanish
            'blog.hero.title': 'Blog de LUMA IP',
            'blog.hero.description': 'Perspectivas sobre derecho de patentes, tecnología de IA e innovación',
            'blog.category.ai': 'Tecnología de IA',
            'blog.post1.title': 'El Futuro de la IA en la Redacción de Patentes',
            'blog.post1.excerpt': 'Explorando cómo la inteligencia artificial está revolucionando el proceso de solicitud de patentes...',
            'blog.readMore': 'Leer Más →',
            
            // Careers Page - Spanish
            'careers.hero.title': 'Únase a Nuestro Equipo',
            'careers.hero.description': 'Ayúdenos a revolucionar la industria de patentes con IA',
            'careers.openings.title': 'Posiciones Abiertas',
            'careers.job1.title': 'Ingeniero de IA Senior',
            'careers.job1.location': 'Remoto / San Francisco, CA',
            'careers.job1.description': 'Construir y optimizar modelos de IA para análisis y generación de patentes',
            'careers.apply': 'Aplicar',
            
            // Privacy Policy - Spanish
            'privacy.title': 'Política de Privacidad',
            'privacy.intro': 'Última actualización: Enero 2024',
            'privacy.section1.title': 'Información que Recopilamos',
            'privacy.section1.text': 'Recopilamos información que nos proporciona directamente, como cuando crea una cuenta, envía una solicitud de patente o nos contacta para obtener soporte.',
            'privacy.section2.title': 'Cómo Usamos Su Información',
            'privacy.section2.text': 'Usamos la información que recopilamos para proporcionar, mantener y mejorar nuestros servicios, procesar transacciones y comunicarnos con usted.',
            'privacy.section3.title': 'Seguridad de Datos',
            'privacy.section3.text': 'Implementamos medidas técnicas y organizativas apropiadas para proteger su información personal contra el acceso no autorizado, alteración, divulgación o destrucción.',
            
            // Terms of Service - Spanish
            'terms.title': 'Términos de Servicio',
            'terms.intro': 'Última actualización: Enero 2024',
            'terms.section1.title': 'Aceptación de Términos',
            'terms.section1.text': 'Al acceder y usar los servicios de LUMA IP, acepta estar sujeto a estos Términos de Servicio.',
            'terms.section2.title': 'Uso de Servicios',
            'terms.section2.text': 'Puede usar nuestros servicios solo según lo permitido por la ley y de acuerdo con estos Términos.',
            
            // Cookie Policy - Spanish
            'cookie.title': 'Política de Cookies',
            'cookie.intro': 'Última actualización: Enero 2024',
            'cookie.section1.title': 'Qué Son las Cookies',
            'cookie.section1.text': 'Las cookies son pequeños archivos de texto que se colocan en su dispositivo cuando visita nuestro sitio web.',
            'cookie.section2.title': 'Cómo Usamos las Cookies',
            'cookie.section2.text': 'Usamos cookies para mejorar su experiencia, analizar el tráfico del sitio y personalizar el contenido.',
            
            // Compliance - Spanish
            'compliance.title': 'Cumplimiento',
            'compliance.certifications.title': 'Nuestras Certificaciones',
            'compliance.soc2.description': 'Auditoría anual de seguridad, disponibilidad y confidencialidad',
            'compliance.iso.description': 'Certificación del sistema de gestión de seguridad de la información',
            'compliance.gdpr.description': 'Cumplimiento total con las regulaciones de protección de datos de la UE'
        },
        
        zh: {
            // Navigation
            'nav.product': '产品',
            'nav.features': '功能',
            'nav.howItWorks': '工作原理',
            'nav.demo': '演示',
            'nav.pricing': '价格',
            'nav.security': '安全',
            'nav.api': 'API',
            'nav.signIn': '登录',
            'nav.getStarted': '开始使用',
            
            // Hero
            'hero.title': '机器辅助知识产权分析法律工具',
            'hero.subtitle': '使用先进的人工智能转变您的专利申请流程。在几分钟内生成完整的专利申请，而不是几个月。由最先进的语言模型提供支持。',
            'hero.watchDemo': '观看演示',
            'hero.startFiling': '开始申请',
            
            // Stats
            'stats.patentsFiled': '已申请专利',
            'stats.grantRate': '授权率',
            'stats.timeSaved': '节省时间',
            'stats.lawFirms': '律师事务所',
            
            // Features
            'features.title': '专利申请所需的一切',
            'features.subtitle': '处理整个专利生命周期的完整平台',
            'features.aiDrafting.title': 'AI 驱动起草',
            'features.aiDrafting.description': '使用在数百万专利上训练的 GPT-4 生成专利权利要求和说明书',
            'features.usptoForms.title': 'USPTO 表格生成',
            'features.usptoForms.description': '使用经过验证的数据自动创建 ADS、IDS 和其他 USPTO 表格',
            'features.priorArt.title': '现有技术搜索',
            'features.priorArt.description': '通过全球专利数据库进行基于向量的语义搜索',
            'features.docket.title': '案卷管理',
            'features.docket.description': '通过自动跟踪和提醒，永不错过截止日期',
            'features.teamCollab.title': '团队协作',
            'features.teamCollab.description': '通过基于角色的访问控制和实时更新一起工作',
            'features.enterpriseSec.title': '企业级安全',
            'features.enterpriseSec.description': '银行级加密、SOC 2 合规性和审计跟踪',
            
            // Workflow
            'workflow.title': '简单的5步流程',
            'workflow.subtitle': '从创意到专利申请的时间创纪录',
            'workflow.step1.title': '描述您的发明',
            'workflow.step1.description': '输入您的发明细节和技术规格',
            'workflow.step2.title': 'AI 生成',
            'workflow.step2.description': '我们的 LLM 生成权利要求、说明书和图纸',
            'workflow.step3.title': '现有技术分析',
            'workflow.step3.description': '自动搜索和可专利性评分',
            'workflow.step4.title': '审查和编辑',
            'workflow.step4.description': '在 AI 协助下完善生成的文档',
            'workflow.step5.title': '向 USPTO 提交',
            'workflow.step5.description': '直接提交或导出用于传统申请',
            
            // Demo
            'demo.title': '查看 LUMA IP 实际操作',
            'demo.subtitle': '体验人工智能驱动的专利申请的力量',
            'demo.tabs.dashboard': '仪表板',
            'demo.tabs.filing': '新申请',
            'demo.tabs.portfolio': '投资组合',
            'demo.tabs.priorArt': '现有技术',
            'demo.dashboard.title': '专利组合仪表板',
            'demo.dashboard.activePatents': '有效专利',
            'demo.dashboard.pending': '待处理',
            'demo.dashboard.deadlines': '截止日期',
            'demo.dashboard.portfolioValue': '投资组合价值',
            'demo.dashboard.recentActivity': '最近活动',
            
            // CTA
            'cta.title': '准备好彻底改变您的专利实践了吗？',
            'cta.subtitle': '加入数千名使用 LUMA IP 的专利专业人士',
            'cta.startTrial': '开始免费试用',
            'cta.scheduleDemo': '预约演示',
            
            // Footer
            'footer.tagline': '机器辅助知识产权分析法律工具',
            'footer.product': '产品',
            'footer.company': '公司',
            'footer.features': '功能',
            'footer.pricing': '价格',
            'footer.security': '安全',
            'footer.api': 'API',
            'footer.about': '关于我们',
            'footer.blog': '博客',
            'footer.careers': '职业',
            'footer.legal': '法律',
            'footer.privacy': '隐私政策',
            'footer.terms': '服务条款',
            'footer.cookiePolicy': 'Cookie 政策',
            'footer.compliance': '合规性',
            'footer.copyright': '© 2024 LUMA IP. 保留所有权利。专利待审。',
            
            // Product Page
            'product.hero.title': '完整的专利平台',
            'product.hero.description': 'LUMA IP 将尖端人工智能与法律专业知识相结合，简化专利申请的各个方面，从初始起草到最终审查。',
            'product.platform.title': '端到端专利管理',
            'product.platform.description': '我们的平台处理专利生命周期的每个阶段，从发明披露到授权专利维护。',
            'product.platform.feature1.title': 'AI驱动的起草',
            'product.platform.feature1.description': '在几分钟内生成完整的专利申请',
            'product.platform.feature2.title': '智能现有技术搜索',
            'product.platform.feature2.description': '在全球数据库中进行AI驱动的语义搜索',
            'product.platform.feature3.title': '自动化工作流程',
            'product.platform.feature3.description': '通过智能自动化简化申请流程',
            'product.components.title': '关键组件',
            'product.components.ai.title': 'AI引擎',
            'product.components.ai.description': '在数百万专利上训练的高级语言模型，用于准确生成权利要求',
            'product.components.database.title': '专利数据库',
            'product.components.database.description': '访问全球专利数据库，实时更新和全面覆盖',
            'product.components.compliance.title': '合规工具',
            'product.components.compliance.description': '内置合规检查和USPTO表格生成与验证',
            
            // Security Page
            'security.hero.title': '安全至上，始终如一',
            'security.hero.description': '您的知识产权受到企业级安全、合规认证和行业最佳实践的保护。',
            'security.features.title': '安全功能',
            'security.encryption.title': '端到端加密',
            'security.encryption.description': '所有数据在静态时使用AES-256加密，在传输时使用TLS 1.3',
            'security.access.title': '访问控制',
            'security.access.description': '基于角色的访问控制，支持多因素身份验证和SSO',
            'security.audit.title': '审计日志',
            'security.audit.description': '所有操作的完整审计跟踪，具有防篡改日志记录',
            'security.infrastructure.title': '安全基础设施',
            'security.infrastructure.description': '托管在符合SOC 2的基础设施上，正常运行时间SLA为99.99%',
            'security.threat.title': '威胁防护',
            'security.threat.description': '实时威胁检测，具有DDoS保护和WAF',
            'security.backup.title': '数据备份',
            'security.backup.description': '自动每日备份，具有时间点恢复',
            'security.compliance.title': '合规与认证',
            'security.soc2': '认证合规',
            'security.iso': '已认证',
            'security.gdpr': '合规',
            'security.ccpa': '合规',
            
            // API Page
            'api.hero.title': '开发者API',
            'api.hero.description': '使用我们的RESTful API将LUMA IP的专利自动化功能集成到您的应用程序中。',
            'api.endpoints.title': 'API端点',
            
            // Features Page - Chinese
            'features.hero.title': '专利专业人士的强大功能',
            'features.hero.description': '您需要的一切，通过AI辅助高效地起草、申请和管理专利。',
            'features.core.title': '核心功能',
            'features.ai.title': 'AI驱动的专利起草',
            'features.ai.description': '使用在数百万专利上训练的高级AI生成包含权利要求、说明书和附图的完整专利申请。',
            'features.ai.point1': '从发明披露自动生成权利要求',
            'features.ai.point2': '技术规格撰写',
            'features.ai.point3': '附图描述和注释',
            'features.ai.point4': '多种权利要求策略和变体',
            'features.search.title': '高级现有技术搜索',
            'features.search.description': '在全球专利数据库中进行全面的语义搜索，具有AI驱动的相关性评分。',
            'features.search.point1': '语义相似性搜索',
            'features.search.point2': 'CPC分类分析',
            'features.search.point3': '引用网络可视化',
            'features.search.point4': '自动无效性分析',
            'features.docket.title': '智能案卷管理',
            'features.docket.description': '通过自动跟踪、提醒和法定计算，永不错过截止日期。',
            'features.docket.point1': '自动截止日期计算',
            'features.docket.point2': '多司法管辖区支持',
            'features.docket.point3': '团队任务分配',
            'features.docket.point4': '日历集成',
            'features.additional.title': '附加功能',
            'features.forms.title': 'USPTO表格生成',
            'features.forms.description': '自动生成和验证所有USPTO表格，并预填充数据。',
            'features.collaboration.title': '团队协作',
            'features.collaboration.description': '实时协作，具有基于角色的权限和版本控制。',
            'features.analytics.title': '组合分析',
            'features.analytics.description': '为您的整个专利组合提供全面的分析和报告。',
            'features.fees.title': '费用计算器',
            'features.fees.description': '为所有实体类型提供准确的费用估算，包括超额权利要求计算。',
            'features.translation.title': '多语言支持',
            'features.translation.description': '使用专业翻译服务以多种语言申请专利。',
            'features.integrations.title': '集成',
            'features.integrations.description': '与现有的知识产权管理系统和法律软件连接。',
            
            // Pricing Page - Chinese
            'pricing.hero.title': '简单透明的定价',
            'pricing.hero.description': '选择适合您需求的计划。随时升级或降级。',
            'pricing.monthly': '月付',
            'pricing.annual': '年付（节省20%）',
            'pricing.getStarted': '开始使用',
            'pricing.startTrial': '开始免费试用',
            'pricing.contactSales': '联系销售',
            'pricing.mostPopular': '最受欢迎',
            'pricing.starter.title': '入门版',
            'pricing.starter.description': '适合个人从业者',
            'pricing.starter.period': '/月',
            'pricing.starter.feature1': '每月最多5个专利申请',
            'pricing.starter.feature2': '基础AI起草协助',
            'pricing.starter.feature3': '现有技术搜索（100次查询/月）',
            'pricing.starter.feature4': '电子邮件支持',
            'pricing.starter.feature5': 'USPTO表格生成',
            'pricing.professional.title': '专业版',
            'pricing.professional.description': '适合成长中的专利业务',
            'pricing.professional.period': '/月',
            'pricing.professional.feature1': '无限专利申请',
            'pricing.professional.feature2': '带自定义训练的高级AI',
            'pricing.professional.feature3': '无限现有技术搜索',
            'pricing.professional.feature4': '优先支持',
            'pricing.professional.feature5': '团队协作（最多10个用户）',
            'pricing.professional.feature6': 'API访问',
            'pricing.professional.feature7': '组合分析',
            'pricing.enterprise.title': '企业版',
            'pricing.enterprise.description': '适合大型组织',
            'pricing.enterprise.custom': '定制',
            'pricing.enterprise.feature1': '专业版的所有功能',
            'pricing.enterprise.feature2': '无限用户',
            'pricing.enterprise.feature3': '自定义AI模型训练',
            'pricing.enterprise.feature4': '专属客户经理',
            'pricing.enterprise.feature5': '本地部署选项',
            'pricing.enterprise.feature6': 'SLA保证',
            'pricing.enterprise.feature7': '自定义集成',
            'pricing.faq.title': '常见问题',
            'pricing.faq.q1': '我可以随时更改计划吗？',
            'pricing.faq.a1': '是的，您可以随时升级或降级您的计划。更改将在下一个计费周期生效。',
            'pricing.faq.q2': '有免费试用吗？',
            'pricing.faq.a2': '是的，我们为专业版计划提供14天的免费试用，可以完全访问所有功能。',
            'pricing.faq.q3': '你们接受哪些付款方式？',
            'pricing.faq.a3': '我们接受所有主要信用卡、ACH转账，企业计划还接受电汇。',
            
            // About Page - Chinese
            'about.hero.title': '关于 LUMA IP',
            'about.hero.description': '我们的使命是使专利申请民主化，让所有创新者都能获得知识产权保护。',
            'about.mission.title': '我们的使命',
            'about.mission.text': 'LUMA IP 的成立基于这样的信念：保护创新不应该复杂或昂贵。我们将尖端的人工智能技术与法律专业知识相结合，简化专利流程。',
            
            // Contact Page - Chinese
            'contact.hero.title': '联系我们',
            'contact.hero.description': '我们在这里帮助您满足专利需求',
            'contact.name': '姓名',
            'contact.email': '电子邮件',
            'contact.subject': '主题',
            'contact.message': '消息',
            'contact.send': '发送消息',
            
            // Enhanced Contact Page - Chinese
            'contact.hero.description': '我们在这里帮助您满足专利需求。联系我们的专家团队获得个性化协助。',
            'contact.sales.title': '销售咨询',
            'contact.sales.subtitle': '与我们的销售团队交谈',
            'contact.sales.button': '安排演示',
            'contact.support.title': '技术支持',
            'contact.support.subtitle': '24/7客户支持',
            'contact.support.button': '开启工单',
            'contact.partnership.title': '合作伙伴',
            'contact.partnership.subtitle': '成为合作伙伴',
            'contact.partnership.button': '与我们合作',
            'contact.form.title': '给我们留言',
            'contact.form.description': '填写下面的表格，我们的团队将在24小时内回复您。',
            'contact.form.firstName': '名',
            'contact.form.lastName': '姓',
            'contact.form.email': '电子邮件地址',
            'contact.form.phone': '电话号码',
            'contact.form.company': '公司名称',
            'contact.form.subject': '主题',
            'contact.form.subjectOptions.general': '一般咨询',
            'contact.form.subjectOptions.demo': '请求演示',
            'contact.form.subjectOptions.support': '技术支持',
            'contact.form.subjectOptions.pricing': '价格信息',
            'contact.form.subjectOptions.partnership': '合作机会',
            'contact.form.subjectOptions.other': '其他',
            'contact.form.message': '消息',
            'contact.form.consent': '我同意根据隐私政策处理我的个人数据',
            'contact.form.submit': '发送消息',
            'contact.offices.title': '办公地点',
            'contact.offices.hq.title': '总部',
            'contact.offices.hq.hours': '周一至周五：上午9:00 - 下午6:00 PST',
            'contact.offices.europe.title': '欧洲办事处',
            'contact.offices.europe.hours': '周一至周五：上午9:00 - 下午6:00 GMT',
            'contact.offices.asia.title': '亚太办事处',
            'contact.offices.asia.hours': '周一至周五：上午9:00 - 下午6:00 SGT',
            'contact.quickLinks.title': '快速链接',
            'contact.quickLinks.documentation': '文档',
            'contact.quickLinks.faq': '常见问题和帮助中心',
            'contact.quickLinks.chat': '实时聊天支持',
            'contact.quickLinks.schedule': '安排通话',
            'contact.social.title': '关注我们',
            'contact.social.description': '及时了解最新消息和更新',
            'contact.map.title': '在地图上找到我们',
            'contact.map.placeholder': '交互式地图将显示在这里',
            'contact.faq.title': '常见问题',
            'contact.faq.q1': '你们的营业时间是什么时候？',
            'contact.faq.a1': '我们的支持团队全天候可用。办公时间因地点而异 - 请参阅上面的办公室了解具体时间。',
            'contact.faq.q2': '我多快能收到回复？',
            'contact.faq.a2': '我们通常在24小时内回复所有询问。优先支持客户在2小时内收到回复。',
            'contact.faq.q3': '你们提供现场咨询吗？',
            'contact.faq.a3': '是的，我们为企业客户提供现场咨询。联系我们的销售团队安排访问。',
            
            // Blog Page - Chinese
            'blog.hero.title': 'LUMA IP 博客',
            'blog.hero.description': '关于专利法、人工智能技术和创新的见解',
            'blog.category.ai': '人工智能技术',
            'blog.post1.title': '人工智能在专利起草中的未来',
            'blog.post1.excerpt': '探索人工智能如何革新专利申请流程...',
            'blog.readMore': '阅读更多 →',
            
            // Careers Page - Chinese
            'careers.hero.title': '加入我们的团队',
            'careers.hero.description': '帮助我们用人工智能革新专利行业',
            'careers.openings.title': '开放职位',
            'careers.job1.title': '高级人工智能工程师',
            'careers.job1.location': '远程 / 旧金山，加州',
            'careers.job1.description': '构建和优化用于专利分析和生成的人工智能模型',
            'careers.apply': '申请',
            
            // Privacy Policy - Chinese
            'privacy.title': '隐私政策',
            'privacy.intro': '最后更新：2024年1月',
            'privacy.section1.title': '我们收集的信息',
            'privacy.section1.text': '我们收集您直接提供给我们的信息，例如当您创建帐户、提交专利申请或联系我们寻求支持时。',
            'privacy.section2.title': '我们如何使用您的信息',
            'privacy.section2.text': '我们使用收集的信息来提供、维护和改进我们的服务，处理交易并与您沟通。',
            'privacy.section3.title': '数据安全',
            'privacy.section3.text': '我们实施适当的技术和组织措施，以保护您的个人信息免受未经授权的访问、更改、披露或破坏。',
            
            // Terms of Service - Chinese
            'terms.title': '服务条款',
            'terms.intro': '最后更新：2024年1月',
            'terms.section1.title': '接受条款',
            'terms.section1.text': '通过访问和使用 LUMA IP 服务，您同意受这些服务条款的约束。',
            'terms.section2.title': '服务使用',
            'terms.section2.text': '您只能在法律允许的范围内并根据这些条款使用我们的服务。',
            
            // Cookie Policy - Chinese
            'cookie.title': 'Cookie 政策',
            'cookie.intro': '最后更新：2024年1月',
            'cookie.section1.title': '什么是 Cookie',
            'cookie.section1.text': 'Cookie 是当您访问我们的网站时放置在您设备上的小文本文件。',
            'cookie.section2.title': '我们如何使用 Cookie',
            'cookie.section2.text': '我们使用 Cookie 来改善您的体验，分析网站流量并个性化内容。',
            
            // Compliance - Chinese
            'compliance.title': '合规性',
            'compliance.certifications.title': '我们的认证',
            'compliance.soc2.description': '安全性、可用性和机密性的年度审计',
            'compliance.iso.description': '信息安全管理系统认证',
            'compliance.gdpr.description': '完全符合欧盟数据保护法规'
        }
    };
    
    const languages = {
        en: { name: 'English', flag: '🇺🇸' },
        es: { name: 'Español', flag: '🇪🇸' },
        fr: { name: 'Français', flag: '🇫🇷' },
        zh: { name: '中文', flag: '🇨🇳' }
    };
    
    let currentLang = 'en';
    
    // Function to translate a single element
    function translateElement(element) {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        
        const translation = translations[currentLang][key];
        if (!translation) {
            console.warn('Missing translation for key:', key);
            return;
        }
        
        // Handle different element types
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    }
    
    // Function to translate all elements on the page
    function translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(translateElement);
        document.documentElement.lang = currentLang;
    }
    
    // Function to change language
    function changeLanguage(lang) {
        if (!translations[lang]) {
            console.error('Language not supported:', lang);
            return;
        }
        
        currentLang = lang;
        localStorage.setItem('language', lang);
        translatePage();
        updateDropdownDisplay();
    }
    
    // Update dropdown display
    function updateDropdownDisplay() {
        const dropdownButton = document.getElementById('language-dropdown-button');
        if (dropdownButton) {
            const lang = languages[currentLang];
            dropdownButton.innerHTML = `
                <span style="font-size: 20px; margin-right: 6px;">${lang.flag}</span>
                <span class="hidden sm:inline">${lang.name}</span>
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            `;
        }
    }
    
    // Create language dropdown in navigation
    function createLanguageDropdown() {
        // Wait a bit to ensure the DOM is ready
        setTimeout(() => {
            // Find the navigation bar buttons container
            const navButtons = document.querySelector('nav .flex.items-center.space-x-4');
            
            if (!navButtons) {
                console.error('Navigation buttons container not found');
                return;
            }
            
            // Create dropdown container
            const dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'relative';
            dropdownContainer.innerHTML = `
                <button 
                    id="language-dropdown-button"
                    onclick="toggleLanguageDropdown()"
                    class="flex items-center px-3 py-2 text-gray-700 hover:text-purple-700 font-medium transition"
                    style="min-width: 120px;"
                >
                    <span style="font-size: 20px; margin-right: 6px;">${languages[currentLang].flag}</span>
                    <span class="hidden sm:inline">${languages[currentLang].name}</span>
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                
                <div 
                    id="language-dropdown-menu"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden z-50"
                >
                    ${Object.entries(languages).map(([code, lang]) => `
                        <button
                            onclick="changeLanguage('${code}'); toggleLanguageDropdown();"
                            class="w-full flex items-center px-4 py-3 hover:bg-purple-50 transition ${code === currentLang ? 'bg-purple-50' : ''}"
                            style="text-align: left;"
                        >
                            <span style="font-size: 20px; margin-right: 10px;">${lang.flag}</span>
                            <span class="text-gray-700 font-medium">${lang.name}</span>
                            ${code === currentLang ? '<svg class="w-4 h-4 ml-auto text-purple-700" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' : ''}
                        </button>
                    `).join('')}
                </div>
            `;
            
            // Insert before the first button in the nav
            navButtons.insertBefore(dropdownContainer, navButtons.firstChild);
            
            // Add styles for the dropdown
            const style = document.createElement('style');
            style.textContent = `
                #language-dropdown-menu button:first-child {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                }
                #language-dropdown-menu button:last-child {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                #language-dropdown-button:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
                }
            `;
            document.head.appendChild(style);
        }, 100);
    }
    
    // Toggle dropdown visibility
    window.toggleLanguageDropdown = function() {
        const menu = document.getElementById('language-dropdown-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('language-dropdown-menu');
        const button = document.getElementById('language-dropdown-button');
        
        if (dropdown && button && !button.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Initialize
    function init() {
        // Get saved language or detect browser language
        const savedLang = localStorage.getItem('language');
        const browserLang = navigator.language.substring(0, 2);
        
        if (savedLang && translations[savedLang]) {
            currentLang = savedLang;
        } else if (translations[browserLang]) {
            currentLang = browserLang;
        }
        
        // Translate page
        translatePage();
        
        // Create language dropdown
        createLanguageDropdown();
        
        console.log('i18n initialized with language:', currentLang);
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        setTimeout(init, 100); // Small delay to ensure all elements are rendered
    }
    
    // Make changeLanguage function globally available
    window.changeLanguage = changeLanguage;
    
})();