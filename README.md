# Supply Chain ERP System

A comprehensive Supply Chain ERP system built with Next.js 15 and vanilla CSS, featuring 10 fully functional modules for managing the complete supply chain lifecycle.

![Supply Chain ERP](https://img.shields.io/badge/Next.js-15.1.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)
![CSS](https://img.shields.io/badge/CSS-Vanilla-1572B6?style=for-the-badge&logo=css3)

## 🚀 Features

### Core Modules

- **📊 Dashboard** - Real-time overview with metrics, quick actions, and activity timeline
- **🎯 Sales Pipeline** - Kanban board for managing deals from lead to close
- **📝 RFQ Management** - Create and manage Request for Quotations with supplier selection
- **🛒 Purchase Orders** - Track POs and monitor supplier performance
- **📦 Inventory** - Stock management with low-stock alerts and incoming shipments
- **🚚 Order Fulfillment** - Shipping and delivery tracking
- **💰 Invoicing** - Invoice generation and payment tracking
- **👥 Contacts** - Customer and supplier database management
- **📈 Reports** - Business analytics and insights
- **⚙️ Settings** - System configuration and preferences

### Design Highlights

- **Premium Dark Theme** with HSL-based color palette
- **Smooth Animations** with micro-interactions
- **Fully Responsive** layouts for all screen sizes
- **Custom UI Components** - No external UI libraries
- **Inter Font** from Google Fonts
- **Gradient Accents** and glassmorphism effects

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd antigravity
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/
│   ├── page.js                    # Dashboard
│   ├── pipeline/                  # Sales Pipeline
│   ├── rfq/                       # RFQ Management
│   ├── po/                        # Purchase Orders
│   ├── inventory/                 # Inventory
│   ├── fulfillment/               # Order Fulfillment
│   ├── invoicing/                 # Invoicing
│   ├── contacts/                  # Contacts
│   ├── reports/                   # Reports
│   ├── settings/                  # Settings
│   ├── layout.js                  # Root layout
│   └── globals.css                # Design system
└── components/
    ├── ui/                        # Reusable UI components
    │   ├── Button.js
    │   ├── Card.js
    │   ├── Input.js
    │   ├── Badge.js
    │   └── Table.js
    └── layout/                    # Layout components
        ├── Sidebar.js
        ├── Header.js
        └── MainLayout.js
```

## 🎨 Design System

### Color Palette
- **Primary**: `hsl(210, 100%, 60%)` - Vibrant blue
- **Secondary**: `hsl(280, 70%, 60%)` - Purple
- **Accent**: `hsl(160, 70%, 50%)` - Teal
- **Background**: `hsl(220, 18%, 8-16%)` - Deep blue-gray

### Components
- **Button** - 6 variants (Primary, Secondary, Outline, Ghost, Danger, Success)
- **Card** - With optional title, subtitle, and hover effects
- **Input** - With label, validation, and error states
- **Badge** - 6 color variants for status indicators
- **Table** - Configurable columns with custom cell rendering

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 📊 Module Details

### Dashboard
- Overview cards with key metrics
- Quick action buttons
- Animated activity timeline with pulsing dots

### Sales Pipeline
- 4-column Kanban board (Leads → Quotes → Negotiations → Won)
- Click-to-move deals between stages
- Filter by priority and search functionality

### RFQ Management
- Dynamic form with add/remove items
- Multi-supplier selection
- Active RFQs table with status tracking

### Purchase Orders
- Tabbed interface (PO List & Supplier Performance)
- Statistics dashboard
- Supplier rating and on-time delivery tracking

### Inventory
- Stock level monitoring with automatic alerts
- Incoming shipments tracking
- Location-based organization

## 🚀 Future Enhancements

- [ ] Backend API integration (REST/GraphQL)
- [ ] User authentication and authorization
- [ ] Real-time notifications
- [ ] Drag-and-drop for Kanban board
- [ ] Chart libraries for analytics
- [ ] PDF generation for invoices
- [ ] Email notifications
- [ ] Dark/light theme toggle
- [ ] Advanced filtering and sorting
- [ ] Bulk operations

## 🛡️ Technical Stack

- **Framework**: Next.js 15.1.3 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Vanilla CSS with CSS Modules
- **Font**: Inter (Google Fonts)
- **Icons**: Unicode emojis

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Development

Built with ❤️ using modern web technologies and best practices.

### Key Features
- ✅ Zero external UI dependencies
- ✅ Premium custom design system
- ✅ Fully responsive layouts
- ✅ Smooth animations and transitions
- ✅ Mock data for demonstration
- ✅ Ready for backend integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository.

---

**Note**: This application currently uses mock data for demonstration purposes. Connect to your backend API to use real data.
