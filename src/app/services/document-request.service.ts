import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  doc, 
  query, 
  where,
  orderBy,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../../environments/environment';
import { DocumentRequest } from '../models';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentRequestService {
  private requestsCollection = collection(db, 'document_requests');

  constructor() {}

  // Create document request
  createRequest(request: Omit<DocumentRequest, 'id'>): Observable<DocumentReference> {
    return from(addDoc(this.requestsCollection, request));
  }

  // Update request status
  updateRequestStatus(id: string, status: DocumentRequest['status'], remarks?: string): Observable<void> {
    const updateData: any = { status, approvedDate: new Date() };
    if (remarks) updateData.remarks = remarks;
    return from(updateDoc(doc(db, 'document_requests', id), updateData));
  }

  // Approve request
  approveRequest(id: string, approvedBy: string): Observable<void> {
    return from(updateDoc(doc(db, 'document_requests', id), {
      status: 'approved',
      approvedDate: new Date(),
      approvedBy
    }));
  }

  // Reject request
  rejectRequest(id: string, rejectionReason: string): Observable<void> {
    return from(updateDoc(doc(db, 'document_requests', id), {
      status: 'rejected',
      rejectionReason
    }));
  }

  // Mark as ready for pickup
  markReadyForPickup(id: string): Observable<void> {
    return from(updateDoc(doc(db, 'document_requests', id), {
      status: 'ready_for_pickup',
      readyDate: new Date()
    }));
  }

  // Mark as completed (picked up)
  markCompleted(id: string): Observable<void> {
    return from(updateDoc(doc(db, 'document_requests', id), {
      status: 'completed',
      completedDate: new Date()
    }));
  }

  // Mark as needs revision
  markNeedsRevision(id: string, revisionReason: string): Observable<void> {
    return from(updateDoc(doc(db, 'document_requests', id), {
      status: 'needs_revision',
      revisionReason
    }));
  }

  // Get request by ID
  getRequestById(id: string): Observable<DocumentRequest | null> {
    return from(getDoc(doc(db, 'document_requests', id)).then(docSnapshot => {
      if (docSnapshot.exists()) {
        const data: any = docSnapshot.data();
        // Normalize Firestore Timestamps to JS Date
        const normalize = (val: any) => (val && typeof val.toDate === 'function') ? val.toDate() : (val ? new Date(val) : undefined);
        return {
          id: docSnapshot.id,
          residentId: data.residentId,
          residentName: data.residentName,
          documentType: data.documentType,
          purpose: data.purpose,
          status: data.status,
          requestDate: normalize(data.requestDate),
          approvedDate: normalize(data.approvedDate),
          readyDate: normalize(data.readyDate),
          completedDate: normalize(data.completedDate),
          approvedBy: data.approvedBy,
          rejectionReason: data.rejectionReason,
          revisionReason: data.revisionReason,
          remarks: data.remarks
        } as DocumentRequest;
      }
      return null;
    }));
  }

  // Get all requests
  getAllRequests(): Observable<DocumentRequest[]> {
    return from(getDocs(this.requestsCollection).then(snapshot => 
      snapshot.docs.map(doc => {
        const data: any = doc.data();
        const normalize = (val: any) => (val && typeof val.toDate === 'function') ? val.toDate() : (val ? new Date(val) : undefined);
        return {
          id: doc.id,
          residentId: data.residentId,
          residentName: data.residentName,
          documentType: data.documentType,
          purpose: data.purpose,
          status: data.status,
          requestDate: normalize(data.requestDate),
          approvedDate: normalize(data.approvedDate),
          readyDate: normalize(data.readyDate),
          completedDate: normalize(data.completedDate),
          approvedBy: data.approvedBy,
          rejectionReason: data.rejectionReason,
          revisionReason: data.revisionReason,
          remarks: data.remarks,
          attachmentUrl: data.attachmentUrl
        } as DocumentRequest;
      })
    ));
  }

  // Get requests by resident ID
  getRequestsByResidentId(residentId: string): Observable<DocumentRequest[]> {
    return from(getDocs(query(
      this.requestsCollection,
      where('residentId', '==', residentId)
    )).then(snapshot => 
      snapshot.docs.map(doc => {
        const data: any = doc.data();
        const normalize = (val: any) => (val && typeof val.toDate === 'function') ? val.toDate() : (val ? new Date(val) : undefined);
        return {
          id: doc.id,
          residentId: data.residentId,
          residentName: data.residentName,
          documentType: data.documentType,
          purpose: data.purpose,
          status: data.status,
         requestDate: normalize(data.requestDate),
          approvedDate: normalize(data.approvedDate),
          readyDate: normalize(data.readyDate),
          completedDate: normalize(data.completedDate),
          approvedBy: data.approvedBy,
          rejectionReason: data.rejectionReason,
          revisionReason: data.revisionReason,
         remarks: data.remarks,
         attachmentUrl: data.attachmentUrl
        } as DocumentRequest;
      })
    ));
  }

  // Get requests by status
  getRequestsByStatus(status: DocumentRequest['status']): Observable<DocumentRequest[]> {
    return from(getDocs(query(
      this.requestsCollection,
      where('status', '==', status)
    )).then(snapshot => 
      snapshot.docs.map(doc => {
        const data: any = doc.data();
        const normalize = (val: any) => (val && typeof val.toDate === 'function') ? val.toDate() : (val ? new Date(val) : undefined);
        return {
          id: doc.id,
          residentId: data.residentId,
          residentName: data.residentName,
          documentType: data.documentType,
          purpose: data.purpose,
          status: data.status,
         requestDate: normalize(data.requestDate),
          approvedDate: normalize(data.approvedDate),
          readyDate: normalize(data.readyDate),
          completedDate: normalize(data.completedDate),
          approvedBy: data.approvedBy,
          rejectionReason: data.rejectionReason,
          revisionReason: data.revisionReason,
         remarks: data.remarks,
         attachmentUrl: data.attachmentUrl
        } as DocumentRequest;
      })
    ));
  }

  // Get pending requests
  getPendingRequests(): Observable<DocumentRequest[]> {
    return this.getRequestsByStatus('pending');
  }

  // Get approved requests
  getApprovedRequests(): Observable<DocumentRequest[]> {
    return this.getRequestsByStatus('approved');
  }

  // Delete request
  deleteRequest(id: string): Observable<void> {
    return from(deleteDoc(doc(db, 'document_requests', id)));
  }
}
