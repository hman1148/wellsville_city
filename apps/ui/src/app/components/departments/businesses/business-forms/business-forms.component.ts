import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { signalState } from "@ngrx/signals";

import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { TagModule } from "primeng/tag";

import { initialBusinessFormsComponentState, BusinessForm } from "./business-forms.state";

@Component({
    selector: 'app-business-forms',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, DividerModule, TagModule],
    styleUrl: './business-forms.component.scss',
    templateUrl: './business-forms.component.html',
})
export class BussinessFormsComponent {
    readonly state = signalState(initialBusinessFormsComponentState());
    readonly router = inject(Router);

    onFillOutForm(form: BusinessForm): void {
        // Navigate to the electronic form based on form ID
        const routeMap: Record<string, string> = {
            'business-application': '/departments/businesses/forms/business-license',
            'group-home-license': '/departments/businesses/forms/group-home-license',
            'project-review': '/departments/businesses/forms/project-review',
        };

        const route = routeMap[form.id];
        if (route) {
            this.router.navigate([route]);
        }
    }

    onViewPdf(form: BusinessForm): void {
        window.open(form.pdfUrl, '_blank');
    }

    onDownloadPdf(form: BusinessForm): void {
        const link = document.createElement('a');
        link.href = form.pdfUrl;
        link.download = form.fileName;
        link.click();
    }

    getCategoryLabel(category: string): string {
        const labels: Record<string, string> = {
            'license': 'License',
            'application': 'Application',
            'project-review': 'Project Review',
        };
        return labels[category] || category;
    }

    getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            'license': 'success',
            'application': 'info',
            'project-review': 'warn',
        };
        return severities[category] || 'secondary';
    }
}