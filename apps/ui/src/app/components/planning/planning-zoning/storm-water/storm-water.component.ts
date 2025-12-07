import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signalState, patchState } from '@ngrx/signals';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { initialStormWaterState } from './storm-water.component.state';

@Component({
  selector: 'app-storm-water',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule],
  templateUrl: './storm-water.component.html',
  styleUrl: './storm-water.component.scss',
})
export class StormWaterComponent {
  readonly state = signalState(initialStormWaterState());

  readonly managementPlanPdfUrl = '/Storm-Use/3-Wellsville_2021_SWMP.pdf';
  readonly waterImageUrl = '/Storm-Use/water.png';

  readonly habitSections = [
    {
      title: 'In Your Kitchen',
      habits: [
        'Install a faucet aerator.',
        'Use cloth napkins and dishtowels instead of paper.',
        'Make sure your dishwasher is full before running it.',
        'Store food items in reusable containers.',
      ],
    },
    {
      title: 'In Your Bathroom',
      habits: [
        'Rub-a-dub-dub more quickly. Take shorter showers.',
        'Install low-flow showerheads.',
        'Use less water when brushing those pearly whites.',
        'Turn off the faucet when brushing teeth.',
        'Make your showers do double duty. Hang clothes in the bathroom while showering to steam wrinkles out.',
        'Install a toilet dam to reduce the amount of water you flush away.',
      ],
    },
    {
      title: 'In Your Laundry Room',
      habits: [
        'Make your purchasing dollars count. When shopping for a washer and dryer, buy an energy-efficient, low water model.',
        "Clean your clothes dryer's lint trap after every load.",
        'Give your dryer a vacation by hanging your clothes to dry.',
        'Use phosphate-free detergent.',
        'Turn down your water heater to 130 degrees Fahrenheit, especially during the summer.',
      ],
    },
    {
      title: 'At the Grocery Store',
      habits: [
        'Consolidate shopping outings and cut down on trips to pick up one forgotten item.',
        'Buy grocery items in bulk.',
        'Buy items with less packaging.',
        'Tote your goods in style. Use canvas bags to carry your groceries.',
        'Look for less toxic alternatives to household cleaning products.',
      ],
    },
    {
      title: 'All Around the House',
      habits: [
        'Turn off lights and televisions when not in use.',
        'Turn your thermostat up when you are out during the day.',
        'Replace incandescent light bulbs with high energy-efficient fluorescent bulbs.',
        "Don't let energy go out the window (or door). Make sure your rooms are well insulated and doors to the outside are not left standing open.",
      ],
    },
    {
      title: 'In Your Yard',
      habits: [
        'Water your lawn in the early morning or in the evening.',
        'Xeriscape and use water-saving native plants.',
        'Compost fruit and vegetable scraps.',
        'Use pesticides and all household chemicals only when absolutely needed. Follow instructions.',
        'Dispose of all chemicals and oils properly. Most automotive part stores have free used oil recycling. The Logan City Landfill takes household hazardous waste i.e. paints, cleaning solutions, solvents, for FREE.',
        'When raking leaves and mowing lawns, avoid placing debris in the gutter, swales, or on grates. This will prevent the clogging of the storm water system, and possible flooding on your property. It will also prevent those items from reaching natural water bodies, which may cause further pollution.',
      ],
    },
  ];

  onViewManagementPlan(): void {
    window.open(this.managementPlanPdfUrl, '_blank');
  }

  onDownloadManagementPlan(): void {
    const link = document.createElement('a');
    link.href = this.managementPlanPdfUrl;
    link.download = 'Wellsville_Storm_Water_Management_Plan.pdf';
    link.click();
  }

  onToggleSection(section: string): void {
    const currentSection = this.state.activeSection();
    patchState(this.state, {
      activeSection: currentSection === section ? null : section,
    });
  }
}
