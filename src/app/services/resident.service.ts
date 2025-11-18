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
import { Resident } from '../models';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResidentService {
  private residentsCollection = collection(db, 'residents');

  constructor() {}

  // Add new resident
  addResident(resident: Omit<Resident, 'id'>): Observable<DocumentReference> {
    return from(addDoc(this.residentsCollection, resident));
  }

  // Update resident
  updateResident(id: string, resident: Partial<Resident>): Observable<void> {
    return from(updateDoc(doc(db, 'residents', id), resident));
  }

  // Delete resident
  deleteResident(id: string): Observable<void> {
    return from(deleteDoc(doc(db, 'residents', id)));
  }

  // Get all residents
  getAllResidents(): Observable<Resident[]> {
    return from(getDocs(this.residentsCollection).then(snapshot => 
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Resident))
    ));
  }

  // Get resident by ID
  getResidentById(id: string): Observable<Resident | null> {
    return from(getDoc(doc(db, 'residents', id)).then(docSnapshot => {
      if (docSnapshot.exists()) {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data()
        } as Resident;
      }
      return null;
    }));
  }

  // Search residents by name
  searchResidents(name: string): Observable<Resident[]> {
    return from(getDocs(this.residentsCollection).then(snapshot => 
      snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Resident))
        .filter(resident => resident.name.toLowerCase().includes(name.toLowerCase()))
    ));
  }

  // Get residents by barangay
  getResidentsByBarangay(barangay: string): Observable<Resident[]> {
    return from(getDocs(query(
      this.residentsCollection,
      where('barangay', '==', barangay)
    )).then(snapshot => 
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Resident))
    ));
  }
}
