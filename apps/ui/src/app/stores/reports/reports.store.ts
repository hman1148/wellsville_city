import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { MessageService } from 'primeng/api';
import { CitizenReportsService } from '../../services/citizen-reports.service';
import {
  CitizenReport,
  ReportStats,
  ReportStatus,
} from '../../models';

interface ReportsState {
  reports: CitizenReport[];
  selectedReport: CitizenReport | null;
  stats: ReportStats | null;
  loading: boolean;
  error: string | null;
  cursor: string | null;
  hasMore: boolean;
  filter: {
    status: ReportStatus | null;
    issueType: string | null;
  };
  newReportsCount: number;
}

const initialState: ReportsState = {
  reports: [],
  selectedReport: null,
  stats: null,
  loading: false,
  error: null,
  cursor: null,
  hasMore: false,
  filter: {
    status: null,
    issueType: null,
  },
  newReportsCount: 0,
};

export const ReportsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((state) => ({
    newReports: computed(() =>
      state.reports().filter((r) => r.status === 'new')
    ),
    inProgressReports: computed(() =>
      state.reports().filter((r) => r.status === 'in_progress')
    ),
    resolvedReports: computed(() =>
      state.reports().filter((r) => r.status === 'resolved')
    ),
    filteredReports: computed(() => {
      const reports = state.reports();
      const filter = state.filter();

      return reports.filter((report) => {
        if (filter.status && report.status !== filter.status) {
          return false;
        }
        if (filter.issueType && report.issueType !== filter.issueType) {
          return false;
        }
        return true;
      });
    }),
    hasNewReports: computed(() => state.newReportsCount() > 0),
  })),

  withMethods((store, reportsService = inject(CitizenReportsService), messageService = inject(MessageService)) => ({
    // Load reports
    loadReports: rxMethod<{ status?: ReportStatus; issueType?: string } | void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((options) =>
          reportsService.getReports(options || {}).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  reports: response.reports,
                  cursor: response.pagination.cursor,
                  hasMore: response.pagination.hasMore,
                  loading: false,
                  newReportsCount: response.reports.filter(
                    (r) => r.status === 'new'
                  ).length,
                });
              },
              error: (error: Error) => {
                patchState(store, {
                  error: error.message,
                  loading: false,
                });
                messageService.add({
                  severity: 'error',
                  summary: 'Failed to Load Reports',
                  detail: 'Unable to retrieve citizen reports. Please try again later.',
                  life: 5000,
                });
              },
            })
          )
        )
      )
    ),

    // Load more reports (pagination)
    loadMoreReports: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => {
          const cursor = store.cursor();
          const filter = store.filter();
          return reportsService
            .getReports({
              cursor: cursor || undefined,
              status: filter.status || undefined,
              issueType: filter.issueType || undefined,
            })
            .pipe(
              tapResponse({
                next: (response) => {
                  patchState(store, {
                    reports: [...store.reports(), ...response.reports],
                    cursor: response.pagination.cursor,
                    hasMore: response.pagination.hasMore,
                    loading: false,
                  });
                },
                error: (error: Error) => {
                  patchState(store, {
                    error: error.message,
                    loading: false,
                  });
                  messageService.add({
                    severity: 'error',
                    summary: 'Failed to Load More Reports',
                    detail: 'Unable to retrieve additional reports. Please try again.',
                    life: 5000,
                  });
                },
              })
            );
        })
      )
    ),

    // Load single report
    loadReport: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((reportId) =>
          reportsService.getReport(reportId).pipe(
            tapResponse({
              next: (report) => {
                patchState(store, {
                  selectedReport: report,
                  loading: false,
                });
              },
              error: (error: Error) => {
                patchState(store, {
                  error: error.message,
                  loading: false,
                });
                messageService.add({
                  severity: 'error',
                  summary: 'Failed to Load Report',
                  detail: 'Unable to retrieve the selected report. Please try again.',
                  life: 5000,
                });
              },
            })
          )
        )
      )
    ),

    // Update report status
    updateStatus: rxMethod<{
      reportId: string;
      status: ReportStatus;
      notes?: string;
    }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ reportId, status, notes }) =>
          reportsService.updateReportStatus(reportId, status, notes).pipe(
            tapResponse({
              next: (updatedReport) => {
                const reports = store.reports().map((r) =>
                  r.reportId === reportId ? updatedReport : r
                );
                patchState(store, {
                  reports,
                  selectedReport:
                    store.selectedReport()?.reportId === reportId
                      ? updatedReport
                      : store.selectedReport(),
                  loading: false,
                  newReportsCount: reports.filter((r) => r.status === 'new')
                    .length,
                });
                messageService.add({
                  severity: 'success',
                  summary: 'Report Updated',
                  detail: `Report status successfully changed to ${status.replace('_', ' ')}.`,
                  life: 3000,
                });
              },
              error: (error: Error) => {
                patchState(store, {
                  error: error.message,
                  loading: false,
                });
                messageService.add({
                  severity: 'error',
                  summary: 'Failed to Update Report',
                  detail: 'Unable to update report status. Please try again.',
                  life: 5000,
                });
              },
            })
          )
        )
      )
    ),

    // Load stats
    loadStats: rxMethod<void>(
      pipe(
        switchMap(() =>
          reportsService.getStats().pipe(
            tapResponse({
              next: (stats) => {
                patchState(store, { stats });
              },
              error: (error: Error) => {
                console.error('Failed to load stats:', error);
                messageService.add({
                  severity: 'error',
                  summary: 'Failed to Load Statistics',
                  detail: 'Unable to retrieve report statistics.',
                  life: 5000,
                });
              },
            })
          )
        )
      )
    ),

    // Set filter
    setFilter(filter: { status?: ReportStatus | null; issueType?: string | null }) {
      patchState(store, {
        filter: {
          status: filter.status ?? store.filter().status,
          issueType: filter.issueType ?? store.filter().issueType,
        },
      });
    },

    // Clear filter
    clearFilter() {
      patchState(store, {
        filter: { status: null, issueType: null },
      });
    },

    // Clear selected report
    clearSelectedReport() {
      patchState(store, { selectedReport: null });
    },

    // Clear error
    clearError() {
      patchState(store, { error: null });
    },
  }))
);
