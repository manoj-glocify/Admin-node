# Admin Node Template

A modular admin template built with Node.js, Express, TypeScript, and PostgreSQL. This template provides a solid foundation for building admin dashboards with common features like authentication, authorization, and user management.

## Features

- User Authentication
  - Email/Password login
  - Social login (Google)
  - JWT-based authentication
  - Password hashing with bcrypt

- Role-Based Access Control
  - Module-based permissions
  - Role management
  - Permission checking middleware

- User Management
  - User registration
  - Profile management
  - Password change

- API Documentation
  - Swagger/OpenAPI documentation
  - Available at `/api-docs`

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication module
│   ├── roles/        # Role management module
│   └── profile/      # User profile module
├── middleware/        # Custom middleware
├── utils/            # Utility functions
├── prisma/           # Database schema and migrations
└── index.ts          # Application entry point
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd admin-node
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up PostgreSQL:
   ```bash
   # Create a new database
   createdb admin_template
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE admin_template;
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Update the environment variables in `.env`:
   - Set your database connection string
   - Configure JWT secrets
   - Set up Google OAuth credentials
   - Customize application settings

6. Run database migrations:
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run migrate
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Configuration

The application can be customized through environment variables:

### Application Settings
- `APP_NAME`: Your application name
- `APP_VERSION`: Application version
- `APP_DESCRIPTION`: Application description
- `APP_LOGO_URL`: URL to your application logo
- `APP_FAVICON_URL`: URL to your favicon
- `APP_PRIMARY_COLOR`: Primary color for UI
- `APP_SECONDARY_COLOR`: Secondary color for UI

### Server Settings
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `API_PREFIX`: API route prefix
- `API_VERSION`: API version
- `CORS_ORIGIN`: Allowed CORS origins

### Database Settings
- `DATABASE_URL`: PostgreSQL connection string

### Authentication Settings
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration

### OAuth Settings
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL

### Feature Flags
- `ENABLE_GOOGLE_LOGIN`: Enable/disable Google login
- `ENABLE_REGISTRATION`: Enable/disable user registration
- `ENABLE_PASSWORD_RESET`: Enable/disable password reset

## Database Management

### Prisma Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run migrate

# Run migrations in production
npm run migrate:prod

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout user

### Roles
- `POST /api/roles` - Create a new role
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/change-password` - Change password

## Adding New Modules

To add a new module:

1. Create a new directory in `src/modules/`
2. Create the following structure:
   ```
   module-name/
   ├── controllers/
   ├── models/
   ├── routes/
   └── index.ts
   ```
3. Add the module's routes to `src/index.ts`
4. Update the roles and permissions accordingly
5. Add any new database models to `prisma/schema.prisma`
6. Run migrations: `npm run migrate`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT