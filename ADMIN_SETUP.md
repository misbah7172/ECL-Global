# Admin Access Instructions

## Admin User Credentials

The admin user has been successfully created in the database with the following credentials:

- **Email:** `admin@mentor.com`
- **Password:** `admin123`
- **Role:** `admin`

## How to Access the Admin Panel

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5000/login
   ```

3. **Login with the admin credentials:**
   - Email: `admin@mentor.com`
   - Password: `admin123`

4. **Access the admin panel:**
   - After successful login, you can access the admin panel at: `http://localhost:5000/admin`
   - Or use the navigation menu to go to admin sections

## Admin Panel Features

The admin panel includes the following features:

### 📊 Dashboard
- Overview statistics and metrics
- Recent activities and analytics
- System health monitoring

### 📚 Course Management
- Create, edit, and delete courses
- Manage course categories and pricing
- View course enrollments and statistics

### 👨‍🏫 Instructor Management
- Add and manage instructors
- Assign instructors to courses
- View instructor performance metrics

### 🎯 Leads Management
- View and manage student leads
- Track lead conversion rates
- Export lead data

### 👥 Student Management
- View all registered students
- Manage student enrollments
- Track student progress

### 📅 Events Management
- Create and manage events
- View event registrations
- Send event notifications

### 🧪 Mock Tests
- Create and manage mock tests
- View test results and analytics
- Generate performance reports

## Security Notes

- The admin password is currently set to a default value (`admin123`)
- **Important:** Change the admin password after first login for security
- The password is encrypted using bcrypt with a salt factor of 10
- JWT tokens are used for authentication with 24-hour expiration

## Database Scripts

Additional scripts have been created for admin management:

- `scripts/create-admin.js` - Creates the admin user
- `scripts/verify-admin.js` - Verifies the admin user exists and can authenticate

To run these scripts:
```bash
node scripts/create-admin.js
node scripts/verify-admin.js
```

## Troubleshooting

If you encounter any issues:

1. **Database Connection Issues:**
   - Ensure your `.env` file has the correct `DATABASE_URL`
   - Make sure your database is running and accessible

2. **Authentication Issues:**
   - Clear browser local storage and cookies
   - Verify the admin user exists by running `node scripts/verify-admin.js`

3. **Port Issues:**
   - The application runs on port 5000 by default
   - If the port is in use, stop other processes or change the port in the configuration

## Next Steps

1. Login with the admin credentials
2. Explore the admin panel features
3. Change the default admin password
4. Create additional admin users if needed
5. Configure any additional settings as required

Happy administrating! 🎉
