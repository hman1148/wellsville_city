import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ItemsResponse, Meeting } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MeetingsService {
  readonly http = inject(HttpClient);
  readonly apiUrl = '/api';

  /**
   * Get list of all meetings (upcoming and past)
   */
  getMeetings(): Observable<ItemsResponse<Meeting>> {
    return this.http.get<ItemsResponse<Meeting>>(`${this.apiUrl}/meetings`);
  }

  /**
   * Get upcoming meetings only
   */
  getUpcomingMeetings(): Observable<ItemsResponse<Meeting>> {
    return this.http.get<ItemsResponse<Meeting>>(
      `${this.apiUrl}/meetings?status=upcoming`
    );
  }

  /**
   * Get presigned URL for meeting file download from S3
   */
  getPresignedUrl(s3Key: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(
      `${this.apiUrl}/meetings/presigned-url`,
      {
        params: { key: s3Key },
      }
    );
  }
}
