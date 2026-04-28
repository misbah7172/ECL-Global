# ECL Global - Educational Consultancy Platform

ECL Global is a comprehensive educational consultancy platform designed to help students achieve their academic goals through expert guidance, courses, and study abroad services.

## Features

-  **Course Management**: Browse and enroll in various educational courses
-  **Study Abroad Services**: Comprehensive guidance for international education
-  **Mock Tests**: Practice tests for exam preparation
-  **Events**: Educational events and webinars
-  **Branch Locations**: Multiple office locations
-  **Payment Integration**: Stripe payment processing
-  **User Authentication**: Secure login and registration

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Wouter (routing)
- **Backend**: Node.js, Express 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT & bcrypt
- **Payment**: Stripe
- **Deployment**: Render

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ECL Global
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Random 32+ character string
   - `JWT_SECRET`: Random string for JWT signing
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (optional)
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (optional)

4. **Run database migrations**
   ```bash
   npm run db:migrate
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:5000

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and auth
│   │   └── styles/      # CSS files
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Migration files
├── shared/              # Shared TypeScript types
└── build.sh             # Render build script
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma Client

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (default: 5000) | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |

## Database Schema

The application uses PostgreSQL with the following main models:
- Users (students, instructors, admins)
- Courses & Lectures
- Categories
- Enrollments
- Mock Tests & Attempts
- Events & Registrations
- Study Abroad Services & Inquiries
- Branches

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin)

### Enrollments
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Enroll in course

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/event-registrations` - Register for event

### Health Check
- `GET /api/health` - Health check endpoint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@eclglobal.com or visit our website.

## Acknowledgments

- React team for the amazing framework
- Prisma for the excellent ORM
- Tailwind CSS for the utility-first CSS framework
- Render for hosting platform
