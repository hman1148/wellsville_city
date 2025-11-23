import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CitizenReport,
  ReportsListResponse,
  ReportStats,
  ReportStatus,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CitizenReportsService {
  readonly http = inject(HttpClient);
  readonly apiUrl = '/api'; // Will be configured via environment

  /**
   * Get list of reports with optional filtering
   */
  getReports(options?: {
    status?: ReportStatus;
    issueType?: string;
    limit?: number;
    cursor?: string;
  }): Observable<ReportsListResponse> {
    let params = new HttpParams();

    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.issueType) {
      params = params.set('issueType', options.issueType);
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }
    if (options?.cursor) {
      params = params.set('cursor', options.cursor);
    }

    return this.http.get<ReportsListResponse>(`${this.apiUrl}/reports`, { params });
  }

  /**
   * Get a single report by ID
   */
  getReport(reportId: string): Observable<CitizenReport> {
    return this.http
      .get<{ report: CitizenReport }>(`${this.apiUrl}/reports/${reportId}`)
      .pipe(map((response) => response.report));
  }

  /**
   * Update report status
   */
  updateReportStatus(
    reportId: string,
    status: ReportStatus,
    notes?: string
  ): Observable<CitizenReport> {
    return this.http
      .patch<{ report: CitizenReport }>(`${this.apiUrl}/reports/${reportId}/status`, {
        status,
        notes,
      })
      .pipe(map((response) => response.report));
  }

  /**
   * Get dashboard statistics
   */
  getStats(): Observable<ReportStats> {
    return this.http
      .get<{ stats: ReportStats }>(`${this.apiUrl}/stats`)
      .pipe(map((response) => response.stats));
  }

  /**
   * Get presigned URL for photo access
   */
  getPresignedUrl(key: string, operation: 'get' | 'put' = 'get'): Observable<string> {
    const params = new HttpParams()
      .set('key', key)
      .set('operation', operation);

    return this.http
      .get<{ url: string }>(`${this.apiUrl}/presigned-url`, { params })
      .pipe(map((response) => response.url));
  }
}
