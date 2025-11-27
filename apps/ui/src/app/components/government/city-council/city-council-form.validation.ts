import { create, enforce, test } from 'vest';
import { CouncilContactForm } from '../../../models';

export const cityCouncilFormSuite = create(
  'cityCouncilFormSuite',
  (data: Partial<CouncilContactForm>) => {
    test('subject', 'Subject is required', () => {
      enforce(data.subject).isNotBlank();
    });

    test('fromName', 'Name is required', () => {
      enforce(data.fromName).isNotBlank();
    });

    test('fromEmail', 'Email is required', () => {
      enforce(data.fromEmail).isNotBlank();
    });

    test('fromEmail', 'Please enter a valid email', () => {
      enforce(data.fromEmail).isEmail();
    });

    test('fromPhone', 'Phone is required', () => {
      enforce(data.fromPhone).isNotBlank();
    });

    test('message', 'Message is required', () => {
      enforce(data.message).isNotBlank();
    });
  }
);
