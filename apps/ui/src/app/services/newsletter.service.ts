import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ItemsResponse, Newsletter } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  readonly http = inject(HttpClient);
  readonly apiUrl = '/api';

  /**
   * Get list of all newsletters
   */
  getNewsletters(): Observable<ItemsResponse<Newsletter>> {
    return this.http.get<ItemsResponse<Newsletter>>(`${this.apiUrl}/newsletters`);
  }

  /**
   * Get presigned URL for newsletter file access from S3
   */
  getPresignedUrl(s3Key: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/newsletters/presigned-url`, {
      params: { key: s3Key },
    });
  }
}
