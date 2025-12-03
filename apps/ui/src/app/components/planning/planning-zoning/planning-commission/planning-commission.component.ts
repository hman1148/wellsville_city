import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import {
  PlanningCommissionInfo,
  PlanningCommissioner,
  initialPlanningCommissionInfo,
} from '../../../../models';

@Component({
  selector: 'app-planning-commission',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule],
  templateUrl: './planning-commission.component.html',
  styleUrl: './planning-commission.component.scss',
})
export class PlanningCommissionComponent {
  commissionInfo = signal<PlanningCommissionInfo>(
    this.getCommissionInfo()
  );

  private getCommissionInfo(): PlanningCommissionInfo {
    return {
      meetingSchedule: '2nd and 4th Wednesday',
      meetingLocation: 'City Offices',
      meetingTime: '6:00 pm',
      adaNotice:
        'In accordance with the Americans with Disabilities Act, the City will make reasonable accommodations to participate in the meeting. Request for assistance can be made by contacting the City Recorder at least 48 hours in advance of the meeting to be held.',
      purpose:
        'The Wellsville City Planning Commission is a five member citizen board appointed by the Mayor with the advice and consent of the City Council. The Planning Commission makes a variety of decisions on diverse items of importance to the City and its residents.',
      description:
        "The Planning Commission provides analysis and recommendations to the City Council on all matters dealing with the present and future development of the City, in accordance with the goals and policies of the City's General Plan. This includes reviewing, approving, or recommending to the City Council requests for general plan amendments, zone changes, subdivisions, and text amendments.",
      responsibilities: [
        'General plan amendments',
        'Zone changes',
        'Subdivisions',
        'Text amendments',
      ],
      commissioners: [
        {
          name: 'Chris Clark',
          position: 'Chairperson',
          termExpires: 'January 2022',
        },
        {
          name: 'Jeff Bailey',
          position: 'Commissioner',
          termExpires: 'January 2023',
        },
        {
          name: 'Clair Cooper',
          position: 'Commissioner',
          termExpires: 'January 2024',
        },
        {
          name: 'Chad Lindley',
          position: 'Commissioner',
          termExpires: 'January 2023',
        },
        {
          name: 'Ed Rigby',
          position: 'Commissioner',
          termExpires: 'January 2023',
        },
        {
          name: 'Cody Schenk',
          position: 'Commissioner',
          termExpires: 'January',
        },
      ],
      cityCouncilRep: {
        name: 'Carl Leatham',
        position: 'City Council Representative',
        termExpires: '',
        phone: '(435)757-7268',
      },
    };
  }
}
