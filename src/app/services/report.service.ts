import { Injectable } from '@angular/core';
import { 
  collection, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore';
import { db } from '../../environments/environment';
import { ResidentReport, DocumentReport } from '../models';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private residentsCollection = collection(db, 'residents');
  private requestsCollection = collection(db, 'document_requests');

  constructor() {}

  // Generate resident report
  generateResidentReport(): Observable<ResidentReport> {
    return from(getDocs(this.residentsCollection)).pipe(
      map(snapshot => {
        const residents = snapshot.docs.map(doc => doc.data());
        const totalResidents = residents.length;
        const totalMale = residents.filter((r: any) => r.gender === 'male').length;
        const totalFemale = residents.filter((r: any) => r.gender === 'female').length;
        const totalOther = residents.filter((r: any) => r.gender === 'other').length;

        return {
          totalResidents,
          totalMale,
          totalFemale,
          totalOther,
          lastUpdated: new Date()
        } as ResidentReport;
      })
    );
  }

  // Generate document report
  generateDocumentReport(): Observable<DocumentReport> {
    return from(getDocs(this.requestsCollection)).pipe(
      map(snapshot => {
        const requests = snapshot.docs.map(doc => doc.data() as any);
        
        return {
          totalDocumentsIssued: requests.filter(r => r.status === 'approved').length,
          barangayClearance: requests.filter(r => r.documentType === 'barangay_clearance').length,
          certificateOfResidency: requests.filter(r => r.documentType === 'certificate_of_residency').length,
          certificateOfIndigency: requests.filter(r => r.documentType === 'certificate_of_indigency').length,
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          approvedRequests: requests.filter(r => r.status === 'approved').length,
          readyForPickup: requests.filter(r => r.status === 'ready_for_pickup').length,
          rejectedRequests: requests.filter(r => r.status === 'rejected').length,
          lastUpdated: new Date()
        } as DocumentReport;
      })
    );
  }

  // Get resident statistics
  getResidentStatistics(): Observable<ResidentReport> {
    return this.generateResidentReport();
  }

  // Get document statistics
  getDocumentStatistics(): Observable<DocumentReport> {
    return this.generateDocumentReport();
  }
}
