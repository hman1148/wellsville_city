import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

import { MeetingsStore } from '../../../stores';
import { Meeting, MeetingFile } from '../../../models';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DividerModule,
    ButtonModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.scss',
})
export class MeetingsComponent implements OnInit {
  readonly meetingsStore = inject(MeetingsStore);

  ngOnInit(): void {
    this.meetingsStore.resolveMeetings();
  }

  get upcomingMeetings() {
    return this.meetingsStore.upcomingMeetings();
  }

  get allMeetings() {
    return this.meetingsStore.meetings();
  }

  get isLoading() {
    return this.meetingsStore.isLoading();
  }

  onDownloadFile(file: MeetingFile): void {
    // Open the S3 URL in a new tab to trigger download
    window.open(file.s3Url, '_blank');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = minutes || '00';
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minute} ${period}`;
    } catch {
      return timeString;
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${kb.toFixed(0)} KB`;
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      agenda: 'Agenda',
      minutes: 'Minutes',
      discussion: 'Discussion Topics',
      attachment: 'Attachment',
      other: 'Document',
    };
    return labels[category] || category;
  }

  getCategorySeverity(
    category: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<
      string,
      'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
    > = {
      agenda: 'info',
      minutes: 'success',
      discussion: 'warn',
      attachment: 'secondary',
      other: 'secondary',
    };
    return severities[category] || 'secondary';
  }

  getFilesByCategory(files: MeetingFile[]): Map<string, MeetingFile[]> {
    const grouped = new Map<string, MeetingFile[]>();
    files.forEach((file) => {
      const category = file.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)?.push(file);
    });
    return grouped;
  }

  getMeetingStatus(meeting: Meeting): string {
    const meetingDate = new Date(meeting.meetingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    meetingDate.setHours(0, 0, 0, 0);

    if (meeting.status === 'cancelled') return 'Cancelled';
    if (meetingDate.getTime() === today.getTime()) return 'Today';
    if (meetingDate > today) return 'Upcoming';
    return 'Past Meeting';
  }

  getStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (status === 'Today') return 'danger';
    if (status === 'Upcoming') return 'success';
    if (status === 'Cancelled') return 'warn';
    return 'secondary';
  }
}
