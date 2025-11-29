import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CityCouncilComponent } from './city-council.component';
import { CityCouncilStore } from '../../../stores/city-council/city-council.store';
import { CouncilMember } from '../../../models';

describe('CityCouncilComponent', () => {
  let component: CityCouncilComponent;
  let fixture: ComponentFixture<CityCouncilComponent>;
  let mockRouter: Partial<Router>;
  let store: InstanceType<typeof CityCouncilStore>;

  const mockCouncilMember: CouncilMember = {
    id: 'test-member',
    name: 'Test Member',
    role: 'Mayor',
    photoPath: '/test.jpg',
    email: 'test@wellsvillecity.com',
    phone: '(435)555-0100',
    termExpires: 'December 31, 2027',
    assignments: ['Test Assignment'],
    foundersDayDuties: ['Test Duty'],
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [CityCouncilComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        CityCouncilStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CityCouncilComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CityCouncilStore);
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject Router', () => {
      expect(component.router).toBeTruthy();
    });

    it('should inject CityCouncilStore', () => {
      expect(component.cityCouncilStore).toBeTruthy();
    });
  });

  describe('Store Integration', () => {
    it('should have access to council members from store', () => {
      expect(store.councilMembers).toBeTruthy();
      expect(store.councilMembers().length).toBe(5);
    });

    it('should have Bob Lindley as Mayor', () => {
      const members = store.councilMembers();
      const mayor = members.find((m) => m.role === 'Mayor');
      expect(mayor).toBeTruthy();
      expect(mayor?.name).toBe('Bob Lindley');
    });

    it('should have correct email for Kaylene Ames', () => {
      const members = store.councilMembers();
      const member = members.find((m) => m.name === 'Kaylene Ames');
      expect(member?.email).toBe('kames@wellsvillecity.com');
    });

    it('should have correct phone for Carl Leatham', () => {
      const members = store.councilMembers();
      const member = members.find((m) => m.name === 'Carl Leatham');
      expect(member?.phone).toBe('(435)757-7268');
    });

    it('should initialize with no selected member', () => {
      expect(store.selectedMember()).toBeNull();
    });
  });

  describe('onContactMember()', () => {
    it('should select member in store', () => {
      component.onContactMember(mockCouncilMember);
      expect(store.selectedMember()).toBe(mockCouncilMember);
    });

    it('should navigate to contact page', () => {
      component.onContactMember(mockCouncilMember);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/government/city-council/contact',
      ]);
    });

    it('should call selectMember before navigation', () => {
      const callOrder: string[] = [];

      jest.spyOn(store, 'selectMember').mockImplementation((member: CouncilMember) => {
        callOrder.push('selectMember');
      });

      (mockRouter.navigate as jest.Mock).mockImplementation(() => {
        callOrder.push('navigate');
        return Promise.resolve(true);
      });

      component.onContactMember(mockCouncilMember);

      expect(callOrder).toEqual(['selectMember', 'navigate']);
    });
  });

  describe('Edge Cases - Member Selection', () => {
    it('should handle member with null values gracefully', () => {
      const memberWithNulls: CouncilMember = {
        ...mockCouncilMember,
        phone: '',
        photoPath: '',
      };

      expect(() => component.onContactMember(memberWithNulls)).not.toThrow();
      expect(store.selectedMember()).toBe(memberWithNulls);
    });

    it('should handle member with special characters in name', () => {
      const memberWithSpecialChars: CouncilMember = {
        ...mockCouncilMember,
        name: "John O'Connor-Smith III",
      };

      component.onContactMember(memberWithSpecialChars);
      expect(store.selectedMember()).toBe(memberWithSpecialChars);
    });

    it('should handle member with very long bio', () => {
      const longAssignments = Array(100).fill('Assignment');
      const memberWithLongData: CouncilMember = {
        ...mockCouncilMember,
        assignments: longAssignments,
      };

      expect(() => component.onContactMember(memberWithLongData)).not.toThrow();
    });

    it('should handle member with empty email', () => {
      const memberWithNoEmail: CouncilMember = {
        ...mockCouncilMember,
        email: '',
      };

      component.onContactMember(memberWithNoEmail);
      expect(store.selectedMember()).toBe(memberWithNoEmail);
    });
  });

  describe('Edge Cases - Multiple Clicks', () => {
    it('should handle rapid consecutive clicks', () => {
      component.onContactMember(mockCouncilMember);
      component.onContactMember(mockCouncilMember);
      component.onContactMember(mockCouncilMember);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
    });

    it('should handle different members in rapid succession', () => {
      const member2: CouncilMember = {
        ...mockCouncilMember,
        id: '2',
        name: 'Jane Smith',
      };
      const member3: CouncilMember = {
        ...mockCouncilMember,
        id: '3',
        name: 'Bob Johnson',
      };

      component.onContactMember(mockCouncilMember);
      expect(store.selectedMember()).toBe(mockCouncilMember);

      component.onContactMember(member2);
      expect(store.selectedMember()).toBe(member2);

      component.onContactMember(member3);
      expect(store.selectedMember()).toBe(member3);
    });
  });

  describe('Edge Cases - Navigation Failures', () => {
    it('should handle navigation rejection', () => {
      (mockRouter.navigate as jest.Mock).mockResolvedValue(false);

      component.onContactMember(mockCouncilMember);

      expect(store.selectedMember()).toBe(mockCouncilMember);
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should handle navigation error', () => {
      (mockRouter.navigate as jest.Mock).mockRejectedValue('Navigation failed');

      component.onContactMember(mockCouncilMember);

      expect(store.selectedMember()).toBe(mockCouncilMember);
    });
  });

  describe('Edge Cases - Invalid Data', () => {
    it('should handle member with undefined id', () => {
      const memberWithUndefinedId = {
        ...mockCouncilMember,
        id: undefined,
      } as any;

      expect(() => component.onContactMember(memberWithUndefinedId)).not.toThrow();
    });

    it('should handle member with malformed email', () => {
      const memberWithBadEmail: CouncilMember = {
        ...mockCouncilMember,
        email: 'not-an-email',
      };

      component.onContactMember(memberWithBadEmail);
      expect(store.selectedMember()).toBe(memberWithBadEmail);
    });

    it('should handle member with malformed phone', () => {
      const memberWithBadPhone: CouncilMember = {
        ...mockCouncilMember,
        phone: 'abc-def-ghij',
      };

      component.onContactMember(memberWithBadPhone);
      expect(store.selectedMember()).toBe(memberWithBadPhone);
    });
  });

  describe('Integration - Store State', () => {
    it('should work when store is in loading state', () => {
      component.onContactMember(mockCouncilMember);

      expect(store.selectedMember()).toBe(mockCouncilMember);
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should work when store has a different member selected', () => {
      const firstMember = store.councilMembers()[0];
      store.selectMember(firstMember);
      expect(store.selectedMember()).toBe(firstMember);

      const differentMember: CouncilMember = {
        ...mockCouncilMember,
        id: '999',
        name: 'Different Person',
      };
      component.onContactMember(differentMember);

      expect(store.selectedMember()).toBe(differentMember);
    });
  });

  describe('Security - Input Validation', () => {
    it('should not execute code in member name', () => {
      const maliciousMember: CouncilMember = {
        ...mockCouncilMember,
        name: '<script>alert("XSS")</script>',
      };

      expect(() => component.onContactMember(maliciousMember)).not.toThrow();
      expect(store.selectedMember()).toBe(maliciousMember);
    });

    it('should handle SQL injection attempt in member data', () => {
      const sqlInjectionMember: CouncilMember = {
        ...mockCouncilMember,
        name: "'; DROP TABLE council_members; --",
      };

      expect(() => component.onContactMember(sqlInjectionMember)).not.toThrow();
    });

    it('should handle member with extremely long email', () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const memberWithLongEmail: CouncilMember = {
        ...mockCouncilMember,
        email: longEmail,
      };

      expect(() => component.onContactMember(memberWithLongEmail)).not.toThrow();
    });
  });

  describe('Store Data Integrity', () => {
    it('should have 5 council members in store', () => {
      expect(store.councilMembers().length).toBe(5);
    });

    it('should not have duplicate member names', () => {
      const members = store.councilMembers();
      const names = members.map((m) => m.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    it('should not have duplicate member emails', () => {
      const members = store.councilMembers();
      const emails = members.map((m) => m.email);
      const uniqueEmails = new Set(emails);
      expect(emails.length).toBe(uniqueEmails.size);
    });

    it('should have valid email format for all members', () => {
      const members = store.councilMembers();
      members.forEach((member) => {
        expect(member.email).toContain('@');
        expect(member.email).toContain('.');
      });
    });

    it('should have phone numbers for all members', () => {
      const members = store.councilMembers();
      members.forEach((member) => {
        expect(member.phone).toBeTruthy();
        expect(member.phone.length).toBeGreaterThan(0);
      });
    });

    it('should have role for all members', () => {
      const members = store.councilMembers();
      members.forEach((member) => {
        expect(member.role).toBeTruthy();
      });
    });

    it('should have all members with correct photo paths', () => {
      const members = store.councilMembers();
      members.forEach((member) => {
        expect(member.photoPath).toContain('/Government/');
        expect(member.photoPath).toContain('.jpg');
      });
    });

    it('should have all members with assignments', () => {
      const members = store.councilMembers();
      members.forEach((member) => {
        expect(member.assignments.length).toBeGreaterThan(0);
      });
    });

    it('should have all members with Founders Day duties', () => {
      const members = store.councilMembers();
      members.forEach((member) => {
        expect(member.foundersDayDuties.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Store Methods', () => {
    it('should clear selected member', () => {
      component.onContactMember(mockCouncilMember);
      expect(store.selectedMember()).toBe(mockCouncilMember);

      store.clearSelectedMember();
      expect(store.selectedMember()).toBeNull();
    });

    it('should reset store to initial state', () => {
      component.onContactMember(mockCouncilMember);
      expect(store.selectedMember()).toBe(mockCouncilMember);

      store.resetStore();
      expect(store.selectedMember()).toBeNull();
      expect(store.councilMembers().length).toBe(5);
    });
  });
});