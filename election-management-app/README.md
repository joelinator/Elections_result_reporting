# Election Management System

A comprehensive React-based election data management and reporting platform built with Next.js.

## 🚀 Features

- **Authentication & Authorization**: Role-based access control with JWT tokens
- **Department Management**: Complete overview of electoral departments
- **Results Tracking**: Real-time election results and data visualization
- **Participation Monitoring**: Voter participation tracking and analysis
- **Document Management**: PV (Procès-Verbal) upload and management
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Icons**: Lucide React
- **Development**: ESLint, PostCSS

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd election-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Demo Credentials

Use these credentials to test the application:

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full system access

### Department Manager
- **Username**: `jmballa`
- **Password**: `password123`
- **Access**: Wouri department management

### Data Entry Operator
- **Username**: `mngono`
- **Password**: `password123`
- **Access**: Mfoundi department data entry

## 📱 Main Features

### Dashboard
- Overview of election statistics
- Data collection progress tracking
- Quick action buttons for common tasks
- Real-time status updates

### Department Management
- List all electoral departments
- Filter by region and status
- View detailed participation data
- Navigate to specific department details

### Results Management
- View election results by department
- Real-time vote counting
- Results validation and approval
- Export capabilities

### User Roles & Permissions
- **System Administrator**: Complete system access
- **Department Supervisor**: Department-level management
- **Data Entry Operator**: Limited data entry access
- **Observer**: Read-only access

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── departments/       # Department management
├── components/            # Reusable React components
│   └── Layout/           # Layout components
├── services/             # API services and utilities
├── types/                # TypeScript type definitions
└── contexts/             # React contexts (Auth, etc.)
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification

### Departments
- `GET /api/departments` - List all departments
- `GET /api/departments/[id]` - Get specific department
- `GET /api/departments/[id]/participation` - Department participation data

### Results
- `GET /api/results` - Get election results
- `POST /api/results` - Create new results
- `PUT /api/results/[id]` - Update results

## 🧪 Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Operations
```bash
# Push schema changes
npm run db:push

# Seed database with test data
npm run db:seed

# Open database studio
npm run db:studio
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-super-secure-jwt-secret"
NEXT_PUBLIC_API_URL="https://your-domain.com/api"
NODE_ENV="production"
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.