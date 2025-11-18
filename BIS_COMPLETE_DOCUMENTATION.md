# BIS Project Complete Documentation

## Project Overview

The **Barangay Information System (BIS)** is a full-stack web application built with Angular, TypeScript, and Firebase. It provides a complete solution for managing barangay residents, document requests, announcements, and generating reports.

## System Architecture

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | Angular 17+ |
| Language | TypeScript |
| Styling | CSS3 |
| State Management | RxJS Observables |
| Backend | Firebase |
| Authentication | Firebase Authentication |
| Database | Firestore |
| Storage | Firebase Cloud Storage |
| Build Tool | Vite |
| Package Manager | npm |

## Project Structure

```
BIS-TEST/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/                    # User authentication
│   │   │   ├── signup/                   # Account creation
│   │   │   ├── dashboard/                # Role selection dashboard
│   │   │   ├── staff/                    # Staff portal
│   │   │   │   ├── dashboard/            # Staff dashboard with metrics
│   │   │   │   ├── residents/            # Resident management
│   │   │   │   ├── requests/             # Document request processing
│   │   │   │   ├── announcements/        # Announcement management
│   │   │   │   ├── reports/              # Statistics & analytics
│   │   │   │   └── staff.routes.ts
│   │   │   └── resident/                 # Resident portal
│   │   │       ├── dashboard/            # Resident home
│   │   │       ├── request-document/     # Document request form
│   │   │       ├── my-requests/          # Request tracking
│   │   │       ├── announcements/        # Announcement viewer
│   │   │       └── resident.routes.ts
│   │   ├── models/
│   │   │   └── index.ts                  # Data models & interfaces
│   │   ├── services/
│   │   │   ├── auth.service.ts           # Authentication logic
│   │   │   ├── resident.service.ts       # Resident CRUD operations
│   │   │   ├── document-request.service.ts # Request management
│   │   │   ├── announcement.service.ts   # Announcement management
│   │   │   ├── report.service.ts         # Report generation
│   │   │   └── index.ts                  # Service exports
│   │   ├── app.ts                        # Root component
│   │   ├── app.routes.ts                 # Main routing
│   │   └── app.config.ts                 # App configuration
│   ├── environments/
│   │   └── environment.ts                # Firebase configuration
│   ├── index.html                        # Entry point
│   └── main.ts                           # Bootstrap
├── angular.json                          # Angular CLI config
├── package.json                          # Dependencies
└── README.md                             # Project README
```

## Data Models

### User Models

```typescript
// Base User
interface BaseUser {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Staff User
interface StaffUser extends BaseUser {
  role: 'admin' | 'staff';
  barangayId: string;
  permissions: string[];
}

// Resident User
interface ResidentUser extends BaseUser {
  residentId?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
}
```

### Resident Model

```typescript
interface Resident {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  barangay: string;
  phone: string;
  email: string;
  civilStatus: 'single' | 'married' | 'widowed' | 'divorced';
  occupation?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Document Request Model

```typescript
interface DocumentRequest {
  id: string;
  residentId: string;
  residentName: string;
  documentType: 'barangay_clearance' | 'certificate_of_residency' | 'certificate_of_indigency';
  purpose: string;
  status: 'pending' | 'approved' | 'ready_for_pickup' | 'rejected';
  requestDate: Date;
  approvedDate?: Date;
  readyDate?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  remarks?: string;
}
```

### Announcement Model

```typescript
interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'event' | 'alert' | 'update' | 'other';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  attachmentUrl?: string;
}
```

### Report Models

```typescript
interface ResidentReport {
  totalResidents: number;
  totalMale: number;
  totalFemale: number;
  totalOther: number;
  lastUpdated: Date;
}

interface DocumentReport {
  totalDocumentsIssued: number;
  barangayClearance: number;
  certificateOfResidency: number;
  certificateOfIndigency: number;
  pendingRequests: number;
  approvedRequests: number;
  readyForPickup: number;
  rejectedRequests: number;
  lastUpdated: Date;
}
```

## Services Overview

### AuthService
Handles user authentication and session management.

**Methods:**
- `signUpResident()` - Register new resident
- `signUpStaff()` - Register new staff
- `login()` - User login
- `logout()` - User logout
- `getCurrentUser()` - Get current authenticated user
- `getToken()` - Get Firebase ID token

### ResidentService
CRUD operations for resident records.

**Methods:**
- `addResident()` - Create new resident
- `updateResident()` - Edit resident info
- `deleteResident()` - Remove resident
- `getAllResidents()` - Get all residents
- `getResidentById()` - Get specific resident
- `searchResidents()` - Search by name
- `getResidentsByBarangay()` - Filter by location

### DocumentRequestService
Manage document requests workflow.

**Methods:**
- `createRequest()` - Submit new request
- `updateRequestStatus()` - Change request status
- `approveRequest()` - Approve a request
- `rejectRequest()` - Reject a request
- `markReadyForPickup()` - Mark as ready
- `getRequestsByResidentId()` - Get resident's requests
- `getRequestsByStatus()` - Filter by status
- `getPendingRequests()` - Get pending requests
- `getApprovedRequests()` - Get approved requests

### AnnouncementService
Manage barangay announcements.

**Methods:**
- `createAnnouncement()` - Post new announcement
- `updateAnnouncement()` - Edit announcement
- `deleteAnnouncement()` - Remove announcement
- `getAllAnnouncements()` - Get all announcements
- `getActiveAnnouncements()` - Get active only
- `getAnnouncementsByCategory()` - Filter by category

### ReportService
Generate system statistics and reports.

**Methods:**
- `generateResidentReport()` - Resident statistics
- `generateDocumentReport()` - Request statistics
- `getResidentStatistics()` - Get resident stats
- `getDocumentStatistics()` - Get request stats

## Firestore Database Schema

### Collections

#### residents
```
residents/
├── {residentId}
│   ├── name: string
│   ├── dateOfBirth: timestamp
│   ├── gender: string
│   ├── address: string
│   ├── barangay: string
│   ├── phone: string
│   ├── email: string
│   ├── civilStatus: string
│   ├── occupation: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── createdBy: string
```

#### document_requests
```
document_requests/
├── {requestId}
│   ├── residentId: string
│   ├── residentName: string
│   ├── documentType: string
│   ├── purpose: string
│   ├── status: string
│   ├── requestDate: timestamp
│   ├── approvedDate: timestamp
│   ├── readyDate: timestamp
│   ├── approvedBy: string
│   ├── rejectionReason: string
│   └── remarks: string
```

#### announcements
```
announcements/
├── {announcementId}
│   ├── title: string
│   ├── content: string
│   ├── category: string
│   ├── createdBy: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   ├── isActive: boolean
│   └── attachmentUrl: string
```

## User Workflows

### Staff Workflow

1. **Login/Signup** → Staff Dashboard
2. **Manage Residents**
   - View all residents
   - Add new resident
   - Edit resident info
   - Delete resident
   - Search residents

3. **Process Requests**
   - View pending requests
   - Review request details
   - Approve request
   - Mark as ready for pickup
   - Reject request with reason

4. **Post Announcements**
   - Create announcement
   - Select category (event/alert/update)
   - Activate/deactivate
   - Delete announcement

5. **View Reports**
   - Resident statistics
   - Document request metrics
   - Completion rates
   - Type breakdown

### Resident Workflow

1. **Login/Signup** → Resident Dashboard
2. **Request Document**
   - Select document type
   - Provide purpose
   - Submit request
   
3. **Track Request**
   - View all requests
   - Filter by status
   - Check detailed status
   - View approval date
   
4. **View Announcements**
   - See active announcements
   - Filter by category
   - Read full content
   - View attachments

## Key Features

### Authentication
- ✅ Email/Password authentication via Firebase
- ✅ Role-based login (Staff/Resident)
- ✅ Session management
- ✅ Protected routes

### Resident Management
- ✅ Complete CRUD operations
- ✅ Personal information storage
- ✅ Search functionality
- ✅ Edit capability

### Document Request System
- ✅ Three document types
- ✅ Request workflow (pending → approved → ready → pickup)
- ✅ Rejection with reasons
- ✅ Status tracking
- ✅ Staff remarks

### Announcement Board
- ✅ Post announcements
- ✅ Categorized (event/alert/update)
- ✅ Active/inactive toggle
- ✅ Resident viewing
- ✅ Attachment support

### Reports & Analytics
- ✅ Resident demographics
- ✅ Document request statistics
- ✅ Request status breakdown
- ✅ Completion metrics
- ✅ Real-time updates

### UI/UX
- ✅ Responsive design
- ✅ Material design principles
- ✅ Gradient color scheme
- ✅ Smooth animations
- ✅ Mobile-optimized
- ✅ Accessible components

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- Modern web browser
- Firebase project

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd BIS-TEST
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Go to Firebase Console
   - Create project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy credentials
   - Update `src/environments/environment.ts`

4. **Start development server**
   ```bash
   npm start
   ```

5. **Access application**
   - Open http://localhost:4200
   - Create test account
   - Test features

### Build for Production

```bash
npm run build
```

Output: `dist/bis/`

## Security Considerations

1. **Authentication**
   - Firebase Authentication handles user credentials
   - Password reset capability
   - Session persistence

2. **Authorization**
   - Role-based access control
   - Staff can only modify data
   - Residents can only view own data

3. **Data Protection**
   - Firestore security rules (to be configured)
   - HTTPS only in production
   - No sensitive data in client code

4. **Best Practices**
   - Never commit Firebase keys to repo
   - Use environment variables
   - Implement proper error handling
   - Validate user input

## Performance Optimization

1. **Lazy Loading**
   - Staff/resident routes lazy-loaded
   - Component-based code splitting
   - Reduced initial bundle size

2. **Caching**
   - Firebase local caching
   - Browser caching
   - Service worker support (future)

3. **Bundle Optimization**
   - Angular's production mode
   - Tree shaking
   - Minification

## Testing Recommendations

### Unit Tests
- Service logic testing
- Component functionality
- Data model validation

### E2E Tests
- User workflows
- Authentication flow
- CRUD operations

### Manual Testing
- Browser compatibility
- Mobile responsiveness
- Error scenarios

## Future Enhancements

- [ ] Email notifications
- [ ] PDF export for documents
- [ ] SMS notifications
- [ ] Advanced filtering
- [ ] Bulk data import
- [ ] Document templates
- [ ] Activity logging
- [ ] Two-factor authentication
- [ ] Mobile app (React Native/Flutter)
- [ ] Offline support
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics dashboard
- [ ] QR code integration
- [ ] Biometric authentication

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4200
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Firebase Connection Issues
- Verify Firebase credentials in environment.ts
- Check internet connection
- Verify Firestore rules allow access
- Check browser console for errors

### Build Errors
```bash
# Clean node_modules
rm -r node_modules
npm install

# Clear Angular cache
ng cache clean
```

## Support & Documentation

- Angular Docs: https://angular.dev
- Firebase Docs: https://firebase.google.com/docs
- TypeScript: https://www.typescriptlang.org

## License

This project is part of the Barangay Information System initiative.

---

**Version**: 1.0.0  
**Last Updated**: November 17, 2025  
**Developed with Angular 17+**
