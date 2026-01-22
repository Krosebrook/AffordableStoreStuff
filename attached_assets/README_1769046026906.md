# FlashFusion v2.1 - Universal AI Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](CHANGELOG.md)
[![React](https://img.shields.io/badge/react-18.2-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-6.1-purple.svg)](https://vitejs.dev)

FlashFusion is a comprehensive Universal AI Platform designed to streamline content creation, project management, and AI-powered automation workflows. Built with modern web technologies, it provides an integrated suite of tools for teams and individuals to leverage AI capabilities across multiple domains.

## 🚀 Features

### Core Platform
- **🎯 Dashboard**: Centralized command center with real-time analytics
- **📊 Analytics**: Comprehensive usage metrics and insights
- **💳 Billing**: Credit-based system with usage tracking
- **👥 Collaboration**: Real-time team collaboration tools

### AI-Powered Tools
- **🤖 Agent Orchestration**: Coordinate multiple AI agents
- **⚡ Universal Generator**: Multi-purpose content generation
- **🛠️ Feature Generator**: Automated feature development
- **📋 PRD Generator**: AI-powered Product Requirements Document creation
- **🎨 BrandKit Generator**: Brand identity creation tools
- **📝 Content Creator**: Rich text editing and media management

### Business Tools
- **🛒 E-commerce Suite**: Product catalog and order management
- **📅 Content Scheduling**: Automated content calendar
- **🎯 WSJF Prioritization**: Backlog management and prioritization
- **📁 Projects**: Multi-project organization and tracking

### Extensibility
- **🏪 Agent Marketplace**: Browse and install AI agents
- **🔌 Plugins System**: Extend platform functionality
- **🔧 Custom Integrations**: Third-party API support

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Base44 account and API credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Krosebrook/flashfusionv2.1.git
   cd flashfusionv2.1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Base44 credentials
   ```

   Required environment variables:
   ```env
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_SERVER_URL=https://api.base44.com
   VITE_BASE44_TOKEN=your_token
   VITE_BASE44_FUNCTIONS_VERSION=prod
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:5173
   ```

## 📚 Documentation

Comprehensive documentation is available:

- **[Project Overview](PROJECT_OVERVIEW.md)** - High-level project description
- **[Architecture](ARCHITECTURE.md)** - Technical architecture and design
- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Setup and development workflow
- **[API Documentation](API_DOCUMENTATION.md)** - API integration guide
- **[Component Guide](COMPONENT_GUIDE.md)** - Component library and usage
- **[PRD Generator Guide](docs/PRD_GENERATOR_GUIDE.md)** - Product Requirements Document generation
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Security](SECURITY.md)** - Security best practices
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[Roadmap](ROADMAP.md)** - Future features and releases
- **[Changelog](CHANGELOG.md)** - Version history

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - UI framework
- **Vite 6.1** - Build tool and dev server
- **React Router v6** - Client-side routing
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### State Management
- **React Query (TanStack Query)** - Server state management
- **React Context** - Global state management

### Backend Integration
- **Base44 SDK v0.8.3** - Backend platform integration
- **Axios** - HTTP client

### Development Tools
- **ESLint 9.19** - Code linting
- **TypeScript 5.8** - Type checking (via JSConfig)
- **PostCSS** - CSS processing

### Additional Libraries
- **React Hook Form + Zod** - Form handling and validation
- **date-fns** - Date manipulation
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering
- **Three.js** - 3D graphics

## 📁 Project Structure

```
flashfusionv2.1/
├── src/
│   ├── api/              # API integration layer
│   ├── assets/           # Static assets
│   ├── components/       # React components
│   │   ├── agents/       # Agent components
│   │   ├── analytics/    # Analytics components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── ui/           # Base UI components
│   │   └── ...           # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   └── main.jsx          # Application entry
├── docs/                 # Additional documentation
├── public/               # Public static files
├── .env.example          # Environment variables template
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── vite.config.js        # Vite configuration
└── README.md             # This file
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run typecheck
```

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Run linter and type checking
4. Test your changes
5. Submit a pull request

See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for detailed instructions.

## 🚢 Deployment

FlashFusion can be deployed to various platforms:

- **Replit** (Mobile App) - See [REPLIT_DEPLOYMENT.md](REPLIT_DEPLOYMENT.md)
- **Vercel** (Recommended for web)
- **Netlify**
- **AWS S3 + CloudFront**
- **Docker**
- **Traditional web servers**

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### 📱 Replit Mobile Deployment

Deploy FlashFusion as a mobile-optimized web app on Replit:

```bash
# Quick Start
1. Import from GitHub: https://github.com/Krosebrook/flashfusionv2.1
2. Configure Replit Secrets (Base44 credentials)
3. Click "Run" button
4. Access via Replit mobile app or browser
```

**Mobile Optimization:**
- ✅ Responsive design (Tailwind CSS)
- ✅ Dynamic port support
- ✅ Touch-friendly UI (Radix UI)
- ✅ Code splitting (~500KB gzipped)

See [REPLIT_DEPLOYMENT.md](REPLIT_DEPLOYMENT.md) for complete guide and [MOBILE_OPTIMIZATION_AUDIT.md](MOBILE_OPTIMIZATION_AUDIT.md) for mobile readiness assessment.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security issues, please see our [Security Policy](SECURITY.md).

To report a vulnerability, email: security@company.com

## 👥 Team

**Maintained by**: Krosebrook Team

## 📞 Support

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: [GitHub Issues](https://github.com/Krosebrook/flashfusionv2.1/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/flashfusionv2.1/discussions)
- **Email**: support@company.com

## 🌟 Acknowledgments

Built with:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Base44](https://base44.com)
- [Radix UI](https://radix-ui.com)
- [TailwindCSS](https://tailwindcss.com)

## 📈 Project Stats

- **Version**: 2.1.0
- **Status**: Active Development
- **Lines of Code**: ~4,700+
- **Components**: 125+ files
- **Features**: 16 integrated modules

---

**Made with ❤️ by the FlashFusion Team**
