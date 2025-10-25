# DHCAR - Digitizing Health Centre Appointments and Records

A comprehensive MEAN stack web application for managing health centre appointments and medical records.

## 🏥 Features

### Admin Module
- Manage doctors, patients, and appointments
- User management with role-based access
- System-wide analytics and reporting
- Appointment scheduling and management

### Doctor Module
- View and manage appointments
- Update patient medical records
- Add diagnoses and prescriptions
- Access patient history

### Patient Module
- Register and login to the system
- Book appointments with doctors
- View medical history and prescriptions
- Access appointment history

## 🛠️ Tech Stack

- **Frontend**: Angular 17+ with Bootstrap 5
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Bootstrap 5 + Font Awesome icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DHCAR
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/dhcar
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
PORT=5000
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 6. Run the Application

#### Development Mode
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the server
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/doctor/patient),
  phone: String,
  address: String,
  specialization: String, // for doctors
  licenseNumber: String, // for doctors
  dateOfBirth: Date,
  gender: String,
  isActive: Boolean
}
```

### Appointments Collection
```javascript
{
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: User),
  date: Date,
  time: String,
  status: String (scheduled/completed/cancelled/no-show),
  reason: String,
  notes: String,
  duration: Number // in minutes
}
```

### Records Collection
```javascript
{
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: User),
  appointmentId: ObjectId (ref: Appointment),
  diagnosis: String,
  symptoms: [String],
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  vitalSigns: {
    bloodPressure: { systolic: Number, diastolic: Number },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number
  },
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    date: Date
  }],
  notes: String,
  followUpDate: Date,
  isActive: Boolean
}
```

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, Doctor, Patient)
- Protected routes with guards
- Password hashing with bcrypt

## 📱 Responsive Design

- Mobile-first approach
- Bootstrap 5 responsive grid
- Touch-friendly interface
- Cross-browser compatibility

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/status` - Update user status (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Appointments
- `GET /api/appointments` - Get appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Records
- `GET /api/records` - Get medical records
- `GET /api/records/:id` - Get record by ID
- `POST /api/records` - Create medical record
- `PUT /api/records/:id` - Update medical record
- `DELETE /api/records/:id` - Delete medical record

## 🎯 Key Features

### Form Validation
- Client-side validation with Angular reactive forms
- Server-side validation with express-validator
- Real-time error feedback

### Search & Filter
- Search appointments by date, doctor, or patient
- Filter users by role and status
- Advanced filtering options

### Security
- Password hashing with bcrypt
- JWT token expiration
- Input sanitization
- CORS configuration

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect to GitHub repository
4. Enable automatic deploys

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dhcar
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with basic CRUD operations
- **v1.1.0** - Added role-based access control
- **v1.2.0** - Enhanced UI with Bootstrap 5
- **v1.3.0** - Added medical records management
- **v1.4.0** - Improved responsive design

---

**DHCAR** - Digitizing Health Centre Appointments and Records
Built with ❤️ using the MEAN stack
