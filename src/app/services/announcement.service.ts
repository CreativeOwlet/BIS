import { Injectable } from '@angular/core';
import { 
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
import { Announcement } from '../models';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private announcementsCollection = collection(db, 'announcements');

  constructor() {}

  // Create announcement
  createAnnouncement(announcement: Omit<Announcement, 'id'>): Observable<DocumentReference> {
    return from(addDoc(this.announcementsCollection, announcement));
  }

  // Update announcement
  updateAnnouncement(id: string, announcement: Partial<Announcement>): Observable<void> {
    return from(updateDoc(doc(db, 'announcements', id), announcement));
  }

  // Delete announcement
  deleteAnnouncement(id: string): Observable<void> {
    return from(deleteDoc(doc(db, 'announcements', id)));
  }

  // Get all announcements
  getAllAnnouncements(): Observable<Announcement[]> {
    return from(getDocs(query(this.announcementsCollection, orderBy('createdAt', 'desc'))).then(snapshot => 
      snapshot.docs.map(d => this.mapDocToAnnouncement(d.id, d.data()))
    ));
  }

  // Get active announcements
  getActiveAnnouncements(): Observable<Announcement[]> {
    // Try a server-side query ordering by createdAt. If that fails (indexes, missing fields),
    // fall back to fetching all and filtering client-side so the resident view still works.
    return from((async () => {
      try {
        const snapshot = await getDocs(query(
          this.announcementsCollection,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        ));
        return snapshot.docs.map(d => this.mapDocToAnnouncement(d.id, d.data()));
      } catch (err) {
        // Fallback: get all docs and filter client-side
        const snapshot = await getDocs(this.announcementsCollection);
        return snapshot.docs
          .map(d => this.mapDocToAnnouncement(d.id, d.data()))
          .filter(a => a.isActive)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    })());
  }

  // Normalize Firestore document data into Announcement with JS Dates and defaults
  private mapDocToAnnouncement(id: string, data: any): Announcement {
    const createdAt = data?.createdAt && typeof data.createdAt.toDate === 'function'
      ? data.createdAt.toDate()
      : (data?.createdAt ? new Date(data.createdAt) : new Date());

    const updatedAt = data?.updatedAt && typeof data.updatedAt.toDate === 'function'
      ? data.updatedAt.toDate()
      : (data?.updatedAt ? new Date(data.updatedAt) : createdAt);

    return {
      id,
      title: data?.title || 'Untitled Announcement',
      content: data?.content || '',
      category: data?.category || 'other',
      createdBy: data?.createdBy || 'unknown',
      createdAt,
      updatedAt,
      isActive: typeof data?.isActive === 'boolean' ? data.isActive : true,
      attachmentUrl: data?.attachmentUrl || undefined
    } as Announcement;
  }

  // Get announcement by ID
  getAnnouncementById(id: string): Observable<Announcement | null> {
    return from(getDoc(doc(db, 'announcements', id)).then(docSnapshot => {
      if (docSnapshot.exists()) {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data()
        } as Announcement;
      }
      return null;
    }));
  }

  // Get announcements by category
  getAnnouncementsByCategory(category: string): Observable<Announcement[]> {
    return from(getDocs(query(
      this.announcementsCollection,
      where('category', '==', category)
    )).then(snapshot => 
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Announcement))
    ));
  }
}
