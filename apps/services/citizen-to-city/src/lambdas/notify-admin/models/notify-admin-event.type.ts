import { NotificationType } from './notification-type.type';

export type NotifyAdminEvent = {
  reportId: string;
  createdAt: string;
  notificationType: NotificationType;
  userPoolId?: string;
  senderEmail?: string;
};
