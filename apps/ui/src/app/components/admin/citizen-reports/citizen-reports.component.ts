// import { Component, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// // PrimeNG Modules
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { CardModule } from 'primeng/card';
// import { TagModule } from 'primeng/tag';
// import { DropdownModule } from 'primeng/dropdown';
// import { DialogModule } from 'primeng/dialog';
// import { InputTextareaModule } from 'primeng/inputtextarea';
// import { ToastModule } from 'primeng/toast';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { BadgeModule } from 'primeng/badge';
// import { ChartModule } from 'primeng/chart';
// import { GalleriaModule } from 'primeng/galleria';
// import { TabViewModule } from 'primeng/tabview';
// import { TooltipModule } from 'primeng/tooltip';
// import { MessageService } from 'primeng/api';

// import { ReportsStore } from '../../../stores/reports/reports.store';
// import {
//   CitizenReport,
//   ReportStatus,
//   IssueType,
//   ISSUE_TYPE_LABELS,
//   STATUS_LABELS,
// } from '../../../models';

// @Component({
//   selector: 'app-citizen-reports',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     TableModule,
//     ButtonModule,
//     CardModule,
//     TagModule,
//     DropdownModule,
//     DialogModule,
//     InputTextareaModule,
//     ToastModule,
//     ProgressSpinnerModule,
//     BadgeModule,
//     ChartModule,
//     GalleriaModule,
//     TabViewModule,
//     TooltipModule,
//   ],
//   providers: [MessageService],
//   templateUrl: './citizen-reports.component.html',
//   styleUrl: './citizen-reports.component.scss',
// })
// export class CitizenReportsComponent implements OnInit {
//   private readonly store = inject(ReportsStore);
//   private readonly messageService = inject(MessageService);

//   // Store signals
//   reports = this.store.reports;
//   filteredReports = this.store.filteredReports;
//   selectedReport = this.store.selectedReport;
//   stats = this.store.stats;
//   loading = this.store.loading;
//   error = this.store.error;

//   // Local state
//   displayDetailDialog = signal(false);
//   displayStatusDialog = signal(false);
//   statusNotes = signal('');
//   selectedStatus = signal<ReportStatus | null>(null);
//   activeTabIndex = signal(0);

//   // Dropdown options
//   statusOptions = [
//     { label: 'All Statuses', value: null },
//     { label: 'New', value: 'new' },
//     { label: 'In Progress', value: 'in_progress' },
//     { label: 'Resolved', value: 'resolved' },
//   ];

//   issueTypeOptions = [
//     { label: 'All Types', value: null },
//     ...Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => ({
//       label,
//       value,
//     })),
//   ];

//   // Chart data computed from stats
//   statusChartData = computed(() => {
//     const statsData = this.stats();
//     if (!statsData) return null;

//     return {
//       labels: ['New', 'In Progress', 'Resolved'],
//       datasets: [
//         {
//           data: [
//             statsData.byStatus.new,
//             statsData.byStatus.in_process,
//             statsData.byStatus.resolved,
//           ],
//           backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
//           hoverBackgroundColor: ['#DC2626', '#D97706', '#059669'],
//         },
//       ],
//     };
//   });

//   issueTypeChartData = computed(() => {
//     const statsData = this.stats();
//     if (!statsData) return null;

//     const labels = Object.keys(statsData.byIssueType).map(
//       (key) => ISSUE_TYPE_LABELS[key as IssueType] || key
//     );
//     const data = Object.values(statsData.byIssueType);

//     return {
//       labels,
//       datasets: [
//         {
//           label: 'Reports by Type',
//           data,
//           backgroundColor: [
//             '#3B82F6',
//             '#8B5CF6',
//             '#EC4899',
//             '#F97316',
//             '#14B8A6',
//             '#6366F1',
//             '#84CC16',
//             '#78716C',
//           ],
//         },
//       ],
//     };
//   });

//   chartOptions = {
//     plugins: {
//       legend: {
//         position: 'bottom',
//       },
//     },
//     responsive: true,
//     maintainAspectRatio: false,
//   };

//   ngOnInit(): void {
//     this.store.loadReports();
//     this.store.loadStats();
//   }

//   // View report details
//   viewReport(report: CitizenReport): void {
//     this.store.loadReport(report.reportId);
//     this.displayDetailDialog.set(true);
//   }

//   // Close detail dialog
//   closeDetailDialog(): void {
//     this.displayDetailDialog.set(false);
//     this.store.clearSelectedReport();
//   }

//   // Open status update dialog
//   openStatusDialog(report: CitizenReport): void {
//     this.store.loadReport(report.reportId);
//     this.selectedStatus.set(report.status);
//     this.statusNotes.set('');
//     this.displayStatusDialog.set(true);
//   }

//   // Update report status
//   updateStatus(): void {
//     const report = this.selectedReport();
//     const status = this.selectedStatus();

//     if (!report || !status) return;

//     this.store.updateStatus({
//       reportId: report.reportId,
//       status,
//       notes: this.statusNotes() || undefined,
//     });

//     this.displayStatusDialog.set(false);
//     this.messageService.add({
//       severity: 'success',
//       summary: 'Status Updated',
//       detail: `Report status changed to ${STATUS_LABELS[status]}`,
//     });
//   }

//   // Filter by status
//   onStatusFilterChange(status: ReportStatus | null): void {
//     this.store.setFilter({ status });
//     this.store.loadReports(status ? { status } : undefined);
//   }

//   // Filter by issue type
//   onIssueTypeFilterChange(issueType: string | null): void {
//     this.store.setFilter({ issueType });
//     this.store.loadReports(issueType ? { issueType } : undefined);
//   }

//   // Get severity for status tag
//   getStatusSeverity(status: ReportStatus): 'danger' | 'warn' | 'success' {
//     switch (status) {
//       case 'new':
//         return 'danger';
//       case 'in_progress':
//         return 'warn';
//       case 'resolved':
//         return 'success';
//     }
//   }

//   // Get label for status
//   getStatusLabel(status: ReportStatus): string {
//     return STATUS_LABELS[status];
//   }

//   // Get label for issue type
//   getIssueTypeLabel(issueType: IssueType): string {
//     return ISSUE_TYPE_LABELS[issueType] || issueType;
//   }

//   // Format date
//   formatDate(dateString: string): string {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   }

//   // Refresh data
//   refresh(): void {
//     this.store.loadReports();
//     this.store.loadStats();
//   }

//   // Tab change handler
//   onTabChange(index: number): void {
//     this.activeTabIndex.set(index);
//     const statusMap: (ReportStatus | null)[] = [null, 'new', 'in_progress', 'resolved'];
//     this.onStatusFilterChange(statusMap[index]);
//   }
// }
