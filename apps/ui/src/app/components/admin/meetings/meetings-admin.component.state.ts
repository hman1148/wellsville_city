import { FormControl, FormGroup, Validators } from "@angular/forms";

export type MeetingDialogMode = 'create' | 'edit';

export type MeetingType = 'city-council' | 'planning-zoning';

export type MeetingStatus = 'upcoming' | 'past' | 'cancelled';

export type FileCategory =
    | 'agenda'
    | 'minutes'
    | 'discussion'
    | 'attachment'
    | 'other';

export type LabeledValue<T> = {
    label: string;
    value: T;
};

export type MeetingTypeOption = LabeledValue<MeetingType>;
export type MeetingStatusOption = LabeledValue<MeetingStatus>;
export type FileCategoryOption = LabeledValue<FileCategory>;

export type MeetingsAdminComponentState = {
    displayDialog: boolean;
    dialogMode: MeetingDialogMode;
    isSubmitting: boolean;
    selectedMeetingId: string | null;
    meetingForm: FormGroup;
    meetingTypes: MeetingTypeOption[];
    meetingStatuses: MeetingStatusOption[];
    fileCategories: FileCategoryOption[];
};


export const initialMeetingAdminComponentState = (): MeetingsAdminComponentState => ({
    displayDialog: false,
    dialogMode: 'create',
    isSubmitting: false,
    selectedMeetingId: null,

    meetingForm: new FormGroup({
        title: new FormControl('', Validators.required),
        date: new FormControl('', Validators.required),
        status: new FormControl('upcoming', Validators.required),
        type: new FormControl('city-council', Validators.required)
    }),

    meetingTypes: [
        { label: 'City Council', value: 'city-council' },
        { label: 'Planning & Zoning', value: 'planning-zoning' },
    ],

    meetingStatuses: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
        { label: 'Cancelled', value: 'cancelled' },
    ],

    fileCategories: [
        { label: 'Agenda', value: 'agenda' },
        { label: 'Minutes', value: 'minutes' },
        { label: 'Discussion Topics', value: 'discussion' },
        { label: 'Attachment', value: 'attachment' },
        { label: 'Other', value: 'other' },
    ]
});
