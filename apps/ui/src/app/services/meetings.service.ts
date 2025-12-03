import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ItemsResponse, ItemResponse, Meeting, MeetingType } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MeetingsService {
  readonly http = inject(HttpClient);
  readonly apiUrl = '/api';

  /**
   * Get list of all meetings (upcoming and past)
   */
  getMeetings(meetingType?: MeetingType): Observable<ItemsResponse<Meeting>> {
    let params = new HttpParams();
    if (meetingType) {
      params = params.set('meetingType', meetingType);
    }
    return this.http.get<ItemsResponse<Meeting>>(`${this.apiUrl}/meetings`, {
      params,
    });
  }

  /**
   * Get upcoming meetings only
   */
  getUpcomingMeetings(
    meetingType?: MeetingType
  ): Observable<ItemsResponse<Meeting>> {
    let params = new HttpParams().set('status', 'upcoming');
    if (meetingType) {
      params = params.set('meetingType', meetingType);
    }
    return this.http.get<ItemsResponse<Meeting>>(`${this.apiUrl}/meetings`, {
      params,
    });
  }

  /**
   * Get single meeting by ID
   */
  getMeeting(id: string): Observable<ItemResponse<Meeting>> {
    return this.http.get<ItemResponse<Meeting>>(
      `${this.apiUrl}/meetings/${id}`
    );
  }

  /**
   * Create a new meeting
   */
  createMeeting(meeting: Meeting): Observable<ItemResponse<Meeting>> {
    return this.http.post<ItemResponse<Meeting>>(
      `${this.apiUrl}/meetings`,
      meeting
    );
  }

  /**
   * Update an existing meeting
   */
  updateMeeting(
    id: string,
    meeting: Partial<Meeting>
  ): Observable<ItemResponse<Meeting>> {
    return this.http.put<ItemResponse<Meeting>>(
      `${this.apiUrl}/meetings/${id}`,
      meeting
    );
  }

  /**
   * Delete a meeting
   */
  deleteMeeting(id: string): Observable<ItemResponse<string>> {
    return this.http.delete<ItemResponse<string>>(
      `${this.apiUrl}/meetings/${id}`
    );
  }

  /**
   * Get presigned URL for meeting file download from S3
   */
  getPresignedUrl(s3Key: string): Observable<{ url: string; success: boolean }> {
    return this.http.get<{ url: string; success: boolean }>(
      `${this.apiUrl}/meetings/download-url`,
      {
        params: { key: s3Key },
      }
    );
  }

  /**
   * Get presigned URL for uploading a meeting file to S3
   */
  getUploadUrl(
    fileName: string,
    fileType: string
  ): Observable<{ url: string; key: string; success: boolean }> {
    return this.http.post<{ url: string; key: string; success: boolean }>(
      `${this.apiUrl}/meetings/upload-url`,
      { fileName, fileType }
    );
  }
}
