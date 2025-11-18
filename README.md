# Barangay Information System (BIS)

A comprehensive web application for managing barangay resident records, document requests, and announcements. Built with Angular, TypeScript, and Firebase.

## Features

### For Barangay Staff
- **Resident Management**: Add, edit, and manage resident records
- **Document Request Processing**: Review, approve, reject, and track document requests
- **Announcement Board**: Post and manage announcements for residents
- **Reports & Analytics**: Generate statistics on residents and document requests
- **Dashboard**: Overview of key metrics and pending tasks

### For Residents
- **Account Management**: Create and manage resident account
- **Document Request**: Request barangay documents online
- **Request Tracking**: Track the status of submitted requests
- **View Announcements**: Stay updated with barangay announcements
- **Dashboard**: Quick access to recent requests and actions

## Tech Stack

- **Frontend**: Angular 17+ (Standalone Components)
- **Language**: TypeScript
- **Styling**: CSS3
- **Backend**: Firebase (Auth, Firestore, Storage)

## Installation

```bash
npm install
```

## Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`

## Building

```bash
npm run build
```

## Usage

### For Staff
- Sign up/login as staff
- Navigate to `/staff/dashboard`
- Manage residents and document requests

### For Residents
- Sign up/login as resident
- Navigate to `/resident/dashboard`
- Request documents and track status

## Firebase Configuration

Update `src/environments/environment.ts` with your Firebase credentials.

## Project Highlights

✅ Complete Resident Management System
✅ Document Request Processing Workflow
✅ Real-time Status Updates
✅ Analytics & Reports
✅ Responsive Design
✅ Role-Based Access Control

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
