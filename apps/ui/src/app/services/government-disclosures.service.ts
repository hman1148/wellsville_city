import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ItemsResponse, ItemResponse, GovernmentDisclosure } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GovernmentDisclosuresService {
  readonly http = inject(HttpClient);
  readonly apiUrl = '/api';

  /**
   * Get list of all government disclosure documents
   */
  getDisclosures(): Observable<ItemsResponse<GovernmentDisclosure>> {
    return this.http.get<ItemsResponse<GovernmentDisclosure>>(
      `${this.apiUrl}/government-disclosures`
    );
  }

  /**
   * Get disclosure documents filtered by category
   */
  getDisclosuresByCategory(
    category: string
  ): Observable<ItemsResponse<GovernmentDisclosure>> {
    return this.http.get<ItemsResponse<GovernmentDisclosure>>(
      `${this.apiUrl}/government-disclosures`,
      {
        params: { category },
      }
    );
  }

  /**
   * Get disclosure documents filtered by year
   */
  getDisclosuresByYear(
    year: number
  ): Observable<ItemsResponse<GovernmentDisclosure>> {
    return this.http.get<ItemsResponse<GovernmentDisclosure>>(
      `${this.apiUrl}/government-disclosures`,
      {
        params: { year: year.toString() },
      }
    );
  }

  /**
   * Get a single disclosure document by ID
   */
  getDisclosure(id: string): Observable<ItemResponse<GovernmentDisclosure>> {
    return this.http.get<ItemResponse<GovernmentDisclosure>>(
      `${this.apiUrl}/government-disclosures/${id}`
    );
  }

  /**
   * Upload a new disclosure document (admin only)
   */
  uploadDisclosure(
    disclosure: Partial<GovernmentDisclosure>
  ): Observable<ItemResponse<GovernmentDisclosure>> {
    return this.http.post<ItemResponse<GovernmentDisclosure>>(
      `${this.apiUrl}/government-disclosures`,
      disclosure
    );
  }

  /**
   * Get presigned URL for file upload to S3 (admin only)
   */
  getUploadPresignedUrl(
    fileName: string,
    fileType: string
  ): Observable<{ url: string; key: string }> {
    return this.http.post<{ url: string; key: string }>(
      `${this.apiUrl}/government-disclosures/upload-url`,
      {
        fileName,
        fileType,
      }
    );
  }

  /**
   * Get presigned URL for file download from S3
   */
  getDownloadPresignedUrl(s3Key: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(
      `${this.apiUrl}/government-disclosures/download-url`,
      {
        params: { key: s3Key },
      }
    );
  }

  /**
   * Delete a disclosure document (admin only)
   */
  deleteDisclosure(id: string): Observable<ItemResponse<string>> {
    return this.http.delete<ItemResponse<string>>(
      `${this.apiUrl}/government-disclosures/${id}`
    );
  }
}
