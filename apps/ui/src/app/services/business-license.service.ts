import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ItemResponse } from '../models';
import { BusinessLicenseFormData } from '../components/departments/businesses/business-forms/forms/business-license/business-license-form.state';

export type BusinessLicenseApplication = BusinessLicenseFormData & {
  id: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

@Injectable({
  providedIn: 'root',
})
export class BusinessLicenseService {
  readonly http = inject(HttpClient);
  readonly apiUrl = '/api';

  /**
   * Submit a new business license application
   */
  submitApplication(
    applicationData: BusinessLicenseFormData
  ): Observable<ItemResponse<BusinessLicenseApplication>> {
    return this.http.post<ItemResponse<BusinessLicenseApplication>>(
      `${this.apiUrl}/business-licenses`,
      applicationData
    );
  }

  /**
   * Get presigned URL for uploading supporting documents to S3
   */
  getUploadUrl(
    fileName: string,
    fileType: string
  ): Observable<{ url: string; key: string; success: boolean }> {
    return this.http.get<{ url: string; key: string; success: boolean }>(
      `${this.apiUrl}/business-licenses/upload-url`,
      {
        params: { fileName, fileType },
      }
    );
  }

  /**
   * Upload file to S3 using presigned URL
   */
  uploadFileToS3(url: string, file: File): Observable<any> {
    return this.http.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  }

  /**
   * Get business license application by ID
   */
  getApplication(id: string): Observable<ItemResponse<BusinessLicenseApplication>> {
    return this.http.get<ItemResponse<BusinessLicenseApplication>>(
      `${this.apiUrl}/business-licenses/${id}`
    );
  }

  /**
   * Get all business license applications (admin only)
   */
  getApplications(): Observable<{ items: BusinessLicenseApplication[]; success: boolean }> {
    return this.http.get<{ items: BusinessLicenseApplication[]; success: boolean }>(
      `${this.apiUrl}/business-licenses`
    );
  }
}
