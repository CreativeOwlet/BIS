// User Models
export interface BaseUser {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface StaffUser extends BaseUser {
  role: 'admin' | 'staff';
  barangayId: string;
  permissions: string[];
}

export interface ResidentUser extends BaseUser {
  residentId?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
}

// Resident Models
export interface Resident {
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

// Document Request Models
export interface DocumentRequest {
  id: string;
  residentId: string;
  residentName: string;
  documentType: 'barangay_clearance' | 'certificate_of_residency' | 'certificate_of_indigency';
  purpose: string;
  status: 'pending' | 'approved' | 'ready_for_pickup' | 'rejected' | 'completed' | 'needs_revision';
  requestDate: Date;
  approvedDate?: Date;
  readyDate?: Date;
  completedDate?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  remarks?: string;
  revisionReason?: string;
  // Optional URL of an uploaded ID/image to validate identity for the request
  attachmentUrl?: string;
}

// Announcement Models
export interface Announcement {
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

// Report Models
export interface ResidentReport {
  totalResidents: number;
  totalMale: number;
  totalFemale: number;
  totalOther: number;
  lastUpdated: Date;
}

export interface DocumentReport {
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
