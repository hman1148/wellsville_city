export type CouncilMember = {
  id: string;
  name: string;
  role: string;
  photoPath: string;
  email: string;
  phone: string;
  termExpires: string;
  assignments: string[];
  foundersDayDuties: string[];
};

export const initialCouncilMember = (): CouncilMember => ({
  id: '',
  name: '',
  role: '',
  photoPath: '',
  email: '',
  phone: '',
  termExpires: '',
  assignments: [],
  foundersDayDuties: [],
});

export type CouncilContactForm = {
  councilMemberId: string;
  councilMemberName: string;
  councilMemberEmail: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  fromPhone: string;
  message: string;
};

export const initialCouncilContactForm = (): CouncilContactForm => ({
  councilMemberId: '',
  councilMemberName: '',
  councilMemberEmail: '',
  subject: '',
  fromName: '',
  fromEmail: '',
  fromPhone: '',
  message: '',
});
