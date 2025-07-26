# Invoice Generator & Payment Tracker

A comprehensive full-stack web application designed to simplify invoice generation and payment tracking. This application offers a user-friendly interface for businesses to manage clients, create professional invoices, and track payment statuses efficiently.

## 🚀 Features

- **Professional Invoicing**
  - Create, edit, and manage invoices with a professional template
  - Customize invoice templates with your branding
  - Generate PDF versions of invoices
  - Send invoices directly to clients via email

- **Client Management**
  - Store and manage client information
  - Track client payment history
  - View client-specific invoice history

- **Payment Tracking**
  - Real-time payment status updates
  - Automated payment reminders
  - Multiple payment method support
  - Payment history and receipts

- **Dashboard & Analytics**
  - Financial overview with key metrics
  - Revenue and expense tracking
  - Visual reports and charts
  - Tax calculations and reporting

- **User Experience**
  - Intuitive and responsive interface
  - Role-based access control
  - Dark/Light mode support
  - Keyboard shortcuts for power users

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 18 with Hooks
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Material-UI v5 with custom theme
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Data Visualization**: Chart.js with react-chartjs-2
- **Form Handling**: React Hook Form with Yup validation
- **PDF Generation**: jsPDF with autoTable
- **Testing**: Jest, React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Joi
- **Testing**: Jest, Supertest
- **Logging**: Winston
- **Security**: Helmet, CORS, rate limiting

### DevOps
- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Cloud Hosting**: Vercel (Frontend), Render (Backend)
- **Database**: MongoDB Atlas
- **Monitoring**: Sentry

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9.x or yarn 1.22.x
- MongoDB 6.0 or higher (local or MongoDB Atlas)
- Git
- Docker and Docker Compose (for containerized development)

### Recommended Development Tools

- VS Code with ESLint and Prettier extensions
- MongoDB Compass (for database management)
- Postman or Insomnia (for API testing)
- Chrome DevTools (for frontend debugging)
- Docker Desktop (for container management)

### Quick Start (Using Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/invoice-generator-payment-tracker.git
   cd invoice-generator-payment-tracker
   ```

2. Run the initialization script (Windows):
   ```powershell
   .\scripts\init-dev.ps1
   ```
   
   Or on Linux/macOS:
   ```bash
   chmod +x scripts/*.sh
   ./scripts/init-dev.sh
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB UI: http://localhost:8081

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/invoice-generator-payment-tracker.git
cd invoice-generator-payment-tracker
```

### 2. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb://localhost:27017/invoice_app
   
   # JWT
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   
   # Email (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-email-password
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Invoice App
   ```

4. Start the development server:
   ```bash
   # Development mode with hot-reload
   npm run dev
   
   # Production mode
   npm start
   ```

### 3. Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   This will open the application in your default browser at `http://localhost:3000`

### 4. Database Setup

1. **Option 1: Local MongoDB**
   - Install MongoDB Community Edition
   - Make sure MongoDB service is running
   - The default connection string is `mongodb://localhost:27017/invoice_app`

2. **Option 2: MongoDB Atlas**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string and update the `MONGO_URI` in the server's `.env` file

### 5. Seeding the Database (Optional)

To populate the database with sample data:

```bash
cd server
npm run seed
```

## 🚀 Deployment

The application is configured for easy deployment to various platforms:

### Frontend Deployment (Vercel)

1. Push your code to a GitHub repository
2. Import the project in [Vercel](https://vercel.com/)
3. Set the environment variables in the Vercel dashboard
4. Deploy!

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com/)
2. Connect your GitHub repository
3. Set the following environment variables:
   - `NODE_ENV=production`
   - `PORT=10000` (or your preferred port)
   - `MONGO_URI=your_production_mongodb_uri`
   - Other required environment variables
4. Deploy!

## 🧪 Testing

### Running Tests

You can run tests using the provided scripts:

```bash
# Run all tests with coverage
./scripts/test-all.sh

# Run tests for a specific component
cd server && npm test
cd ../client && npm test

# Run tests in watch mode
npm test -- --watch

# Generate test coverage report
npm test -- --coverage
```

### Test Coverage

- Server: 85%+
- Client: 80%+
- Integration: 75%+

## 🛠 Development Scripts

The project includes several utility scripts in the `scripts/` directory:

- `init-dev.sh` - Initialize the development environment
- `test-all.sh` - Run all tests with coverage
- `format-code.sh` - Format code using Prettier and ESLint
- `deploy.sh` - Deploy to various platforms (Vercel, Netlify, Docker)
- `generate-ssl.sh` - Generate SSL certificates for local development

### Code Formatting

To maintain consistent code style, run:

```bash
# Format all code
./scripts/format-code.sh
```

## 🚀 Deployment

The application can be deployed to various platforms:

### 1. Vercel (Recommended)

1. First, get your Vercel access token:
   - Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
   - Click "Create Token" and give it a name (e.g., "GitHub Actions")
   - Copy the generated token

2. Add the token to GitHub Secrets:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name it `VERCEL_TOKEN` and paste your Vercel token
   - Click "Add secret"

3. Deploy to Vercel:
   ```bash
   # Deploy frontend and backend to Vercel
   ./scripts/deploy.sh --env=production --platform=vercel
   ```

   Or let GitHub Actions handle the deployment on push to main branch (automatically configured in CI/CD workflow)

### 2. Netlify (Frontend Only)

```bash
# Deploy frontend to Netlify
./scripts/deploy.sh --env=production --platform=netlify --no-backend
```

### 3. Docker

```bash
# Build and push Docker images
./scripts/deploy.sh --env=production --platform=docker

# Run locally with Docker Compose
docker-compose up -d
```

### 4. Manual Deployment

1. **Backend**:
   ```bash
   cd server
   npm install
   npm run build
   npm start
   ```

2. **Frontend**:
   ```bash
   cd client
   npm install
   npm run build
   npm start
   ```

## 🔒 Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Rate limiting and request validation
- Helmet for securing HTTP headers
- CSRF protection
- Input sanitization
- Regular security audits with `npm audit`

## 📱 Screenshots

<div align="center">
  <img src="/screenshots/dashboard.png" alt="Dashboard" width="30%" />
  <img src="/screenshots/invoices.png" alt="Invoices" width="30%" />
  <img src="/screenshots/create-invoice.png" alt="Create Invoice" width="30%" />
  <img src="/screenshots/client-list.png" alt="Client List" width="30%" />
  <img src="/screenshots/invoice-preview.png" alt="Invoice Preview" width="30%" />
  <img src="/screenshots/settings.png" alt="Settings" width="30%" />
</div>

## 🎥 Video Demonstration

[![Watch the demo video](https://img.youtube.com/vi/your-video-id/maxresdefault.jpg)](https://www.youtube.com/watch?v=your-video-id)

## 🌐 Live Demo

Check out the live demo at: [https://invoice-generator-payment-tracker.vercel.app](https://invoice-generator-payment-tracker.vercel.app)

**Demo Credentials:**
- Email: demo@example.com
- Password: demo123

## 👥 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate.

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Vercel](https://vercel.com/)
- [Render](https://render.com/)

## 📬 Contact

Project Link: [https://github.com/your-username/invoice-generator-payment-tracker](https://github.com/your-username/invoice-generator-payment-tracker)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

## 📝 Todo

- [ ] Add more test coverage
- [ ] Implement multi-currency support
- [ ] Add more invoice templates
- [ ] Mobile app development
- [ ] Multi-language support
