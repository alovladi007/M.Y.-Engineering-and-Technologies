// i18n implementation with dropdown in navigation bar
(function() {
    'use strict';
    
    const translations = {
        en: {
            // Navigation
            'nav.product': 'Product',
            'nav.features': 'Features',
            'nav.pricing': 'Pricing',
            'nav.security': 'Security',
            'nav.api': 'API',
            'nav.demo': 'Demo',
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
            'features.docket.title': 'Intelligent Docket Management',
            'features.docket.description': 'Never miss a deadline with automated tracking, reminders, and statutory calculations.',
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
            'footer.copyright': '© 2024 LUMA IP. All rights reserved. Patent pending.'
        },
        
        fr: {
            // Navigation
            'nav.product': 'Produit',
            'nav.features': 'Fonctionnalités',
            'nav.pricing': 'Tarifs',
            'nav.security': 'Sécurité',
            'nav.api': 'API',
            'nav.demo': 'Démo',
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
            'features.docket.title': 'Gestion Intelligente des Dossiers',
            'features.docket.description': 'Ne manquez jamais une échéance avec le suivi automatisé, les rappels et les calculs statutaires.',
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
            'footer.productOverview': 'Aperçu du Produit',
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
            'footer.copyright': '© 2024 LUMA IP. Tous droits réservés. Brevet en instance.'
        },
        
        es: {
            // Navigation
            'nav.product': 'Producto',
            'nav.features': 'Características',
            'nav.pricing': 'Precios',
            'nav.security': 'Seguridad',
            'nav.api': 'API',
            'nav.demo': 'Demo',
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
            'features.docket.title': 'Gestión Inteligente de Expedientes',
            'features.docket.description': 'Nunca pierda una fecha límite con seguimiento automatizado, recordatorios y cálculos estatutarios.',
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
            'footer.productOverview': 'Descripción del Producto',
            'footer.company': 'Empresa',
            'footer.features': 'Características',
            'footer.pricing': 'Precios',
            'footer.security': 'Seguridad',
            'footer.api': 'API',
            'footer.about': 'Acerca de Nosotros',
            'footer.blog': 'Blog',
            'footer.careers': 'Carreras',
            'footer.contact': 'Contacto',
            'footer.legal': 'Legal',
            'footer.privacy': 'Política de Privacidad',
            'footer.terms': 'Términos de Servicio',
            'footer.cookiePolicy': 'Política de Cookies',
            'footer.compliance': 'Cumplimiento',
            'footer.copyright': '© 2024 LUMA IP. Todos los derechos reservados. Patente pendiente.'
        },
        
        zh: {
            // Navigation
            'nav.product': '产品',
            'nav.features': '功能',
            'nav.pricing': '价格',
            'nav.security': '安全',
            'nav.api': 'API',
            'nav.demo': '演示',
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
            'features.docket.title': '智能案卷管理',
            'features.docket.description': '通过自动跟踪、提醒和法定计算，永不错过截止日期。',
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
            'footer.productOverview': '产品概述',
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
            'footer.copyright': '© 2024 LUMA IP. 保留所有权利。专利待审。'
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
