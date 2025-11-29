import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Announcement } from '../../models';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with no selected announcement', () => {
      expect(component.selectedAnnouncement()).toBeNull();
    });

    it('should initialize with dialog closed', () => {
      expect(component.displayAnnouncementDialog()).toBe(false);
    });

    it('should have carousel slides', () => {
      expect(component.carouselSlides().length).toBeGreaterThan(0);
    });

    it('should have announcements', () => {
      expect(component.announcements().length).toBeGreaterThan(0);
    });

    it('should have quick links', () => {
      expect(component.quickLinks().length).toBeGreaterThan(0);
    });
  });

  describe('Carousel Slides', () => {
    it('should have 6 carousel slides', () => {
      expect(component.carouselSlides().length).toBe(6);
    });

    it('should have unique slide IDs', () => {
      const ids = component.carouselSlides().map((slide) => slide.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have image URLs for all slides', () => {
      component.carouselSlides().forEach((slide) => {
        expect(slide.imageUrl).toBeTruthy();
        expect(slide.imageUrl.length).toBeGreaterThan(0);
      });
    });

    it('should have titles for all slides', () => {
      component.carouselSlides().forEach((slide) => {
        expect(slide.title).toBeTruthy();
        expect(slide.title.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptions for all slides', () => {
      component.carouselSlides().forEach((slide) => {
        expect(slide.description).toBeTruthy();
        expect(slide.description.length).toBeGreaterThan(0);
      });
    });

    it('should have alt text for all slides', () => {
      component.carouselSlides().forEach((slide) => {
        expect(slide.altText).toBeTruthy();
        expect(slide.altText.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Announcements', () => {
    it('should have 4 announcements', () => {
      expect(component.announcements().length).toBe(4);
    });

    it('should have unique announcement IDs', () => {
      const ids = component.announcements().map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have titles for all announcements', () => {
      component.announcements().forEach((announcement) => {
        expect(announcement.title).toBeTruthy();
        expect(announcement.title.length).toBeGreaterThan(0);
      });
    });

    it('should have content for all announcements', () => {
      component.announcements().forEach((announcement) => {
        expect(announcement.content).toBeTruthy();
        expect(announcement.content.length).toBeGreaterThan(0);
      });
    });

    it('should have dates for all announcements', () => {
      component.announcements().forEach((announcement) => {
        expect(announcement.date).toBeTruthy();
      });
    });

    it('should have valid priorities for all announcements', () => {
      component.announcements().forEach((announcement) => {
        expect(['high', 'medium', 'low']).toContain(announcement.priority);
      });
    });
  });

  describe('Quick Links', () => {
    it('should have 4 quick links', () => {
      expect(component.quickLinks().length).toBe(4);
    });

    it('should have icons for all links', () => {
      component.quickLinks().forEach((link) => {
        expect(link.icon).toBeTruthy();
        expect(link.icon).toContain('pi-');
      });
    });

    it('should have labels for all links', () => {
      component.quickLinks().forEach((link) => {
        expect(link.label).toBeTruthy();
        expect(link.label.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptions for all links', () => {
      component.quickLinks().forEach((link) => {
        expect(link.description).toBeTruthy();
        expect(link.description.length).toBeGreaterThan(0);
      });
    });

    it('should have routes for all links', () => {
      component.quickLinks().forEach((link) => {
        expect(link.route).toBeTruthy();
        expect(link.route.startsWith('/')).toBe(true);
      });
    });

    it('should have severity for all links', () => {
      component.quickLinks().forEach((link) => {
        expect(link.severity).toBeTruthy();
      });
    });
  });

  describe('getPrioritySeverity()', () => {
    it('should return danger for high priority', () => {
      expect(component.getPrioritySeverity('high')).toBe('danger');
    });

    it('should return warn for medium priority', () => {
      expect(component.getPrioritySeverity('medium')).toBe('warn');
    });

    it('should return info for low priority', () => {
      expect(component.getPrioritySeverity('low')).toBe('info');
    });

    it('should return info for unknown priority', () => {
      expect(component.getPrioritySeverity('unknown')).toBe('info');
    });

    it('should return info for empty string', () => {
      expect(component.getPrioritySeverity('')).toBe('info');
    });
  });

  describe('viewAnnouncement()', () => {
    let mockAnnouncement: Announcement;

    beforeEach(() => {
      mockAnnouncement = component.announcements()[0];
    });

    it('should set selected announcement', () => {
      component.viewAnnouncement(mockAnnouncement);
      expect(component.selectedAnnouncement()).toBe(mockAnnouncement);
    });

    it('should display announcement dialog', () => {
      component.viewAnnouncement(mockAnnouncement);
      expect(component.displayAnnouncementDialog()).toBe(true);
    });

    it('should handle viewing same announcement twice', () => {
      component.viewAnnouncement(mockAnnouncement);
      component.viewAnnouncement(mockAnnouncement);

      expect(component.selectedAnnouncement()).toBe(mockAnnouncement);
      expect(component.displayAnnouncementDialog()).toBe(true);
    });

    it('should handle switching between announcements', () => {
      const announcement2 = component.announcements()[1];

      component.viewAnnouncement(mockAnnouncement);
      expect(component.selectedAnnouncement()).toBe(mockAnnouncement);

      component.viewAnnouncement(announcement2);
      expect(component.selectedAnnouncement()).toBe(announcement2);
    });
  });

  describe('closeAnnouncementDialog()', () => {
    it('should hide announcement dialog', () => {
      const mockAnnouncement = component.announcements()[0];
      component.viewAnnouncement(mockAnnouncement);

      component.closeAnnouncementDialog();

      expect(component.displayAnnouncementDialog()).toBe(false);
    });

    it('should clear selected announcement', () => {
      const mockAnnouncement = component.announcements()[0];
      component.viewAnnouncement(mockAnnouncement);

      component.closeAnnouncementDialog();

      expect(component.selectedAnnouncement()).toBeNull();
    });

    it('should handle closing when no announcement selected', () => {
      expect(() => component.closeAnnouncementDialog()).not.toThrow();
      expect(component.displayAnnouncementDialog()).toBe(false);
    });

    it('should handle multiple close calls', () => {
      component.closeAnnouncementDialog();
      component.closeAnnouncementDialog();

      expect(component.displayAnnouncementDialog()).toBe(false);
      expect(component.selectedAnnouncement()).toBeNull();
    });
  });

  describe('Edge Cases - Announcement Data', () => {
    it('should handle announcement with empty content gracefully', () => {
      const emptyAnnouncement: Announcement = {
        id: '999',
        title: 'Test',
        content: '',
        date: new Date().toISOString(),
        priority: 'low',
      };

      expect(() => component.viewAnnouncement(emptyAnnouncement)).not.toThrow();
    });

    it('should handle announcement with very long content', () => {
      const longContent = 'A'.repeat(10000);
      const longAnnouncement: Announcement = {
        id: '999',
        title: 'Test',
        content: longContent,
        date: new Date().toISOString(),
        priority: 'low',
      };

      expect(() => component.viewAnnouncement(longAnnouncement)).not.toThrow();
    });

    it('should handle announcement with special characters in title', () => {
      const specialAnnouncement: Announcement = {
        id: '999',
        title: 'Test & Special <Characters>',
        content: 'Test content',
        date: new Date().toISOString(),
        priority: 'low',
      };

      component.viewAnnouncement(specialAnnouncement);
      expect(component.selectedAnnouncement()).toBe(specialAnnouncement);
    });

    it('should handle announcement with invalid date format', () => {
      const invalidDateAnnouncement: Announcement = {
        id: '999',
        title: 'Test',
        content: 'Test content',
        date: 'not-a-date',
        priority: 'low',
      };

      expect(() => component.viewAnnouncement(invalidDateAnnouncement)).not.toThrow();
    });
  });

  describe('Edge Cases - Carousel Data', () => {
    it('should have valid image URLs', () => {
      component.carouselSlides().forEach((slide) => {
        expect(slide.imageUrl.startsWith('/')).toBe(true);
      });
    });

    it('should have no duplicate image URLs', () => {
      const urls = component.carouselSlides().map((s) => s.imageUrl);
      const uniqueUrls = new Set(urls);
      expect(urls.length).toBe(uniqueUrls.size);
    });

    it('should have no empty alt text', () => {
      component.carouselSlides().forEach((slide) => {
        expect(slide.altText.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases - Quick Links', () => {
    it('should have valid route paths', () => {
      component.quickLinks().forEach((link) => {
        expect(link.route.startsWith('/')).toBe(true);
      });
    });

    it('should have PrimeNG icons', () => {
      component.quickLinks().forEach((link) => {
        expect(link.icon.startsWith('pi ')).toBe(true);
      });
    });

    it('should have valid severity values', () => {
      const validSeverities = ['success', 'info', 'warn', 'danger', 'secondary', 'contrast'];
      component.quickLinks().forEach((link) => {
        expect(validSeverities).toContain(link.severity);
      });
    });
  });

  describe('Security - XSS Prevention', () => {
    it('should handle announcement with script tags', () => {
      const maliciousAnnouncement: Announcement = {
        id: '999',
        title: '<script>alert("XSS")</script>',
        content: '<script>alert("XSS")</script>',
        date: new Date().toISOString(),
        priority: 'low',
      };

      expect(() => component.viewAnnouncement(maliciousAnnouncement)).not.toThrow();
    });

    it('should handle announcement with SQL injection attempt', () => {
      const sqlInjectionAnnouncement: Announcement = {
        id: "'; DROP TABLE announcements; --",
        title: 'Test',
        content: "'; DELETE FROM users; --",
        date: new Date().toISOString(),
        priority: 'low',
      };

      expect(() => component.viewAnnouncement(sqlInjectionAnnouncement)).not.toThrow();
    });
  });

  describe('Edge Cases - Priority Handling', () => {
    it('should handle null priority', () => {
      const result = component.getPrioritySeverity(null as any);
      expect(result).toBe('info');
    });

    it('should handle undefined priority', () => {
      const result = component.getPrioritySeverity(undefined as any);
      expect(result).toBe('info');
    });

    it('should handle mixed case priority', () => {
      const result = component.getPrioritySeverity('HIGH' as any);
      expect(result).toBe('info'); // Should default since it doesn't match 'high'
    });
  });

  describe('Announcement Dialog State Management', () => {
    it('should properly cycle through open and close states', () => {
      const announcement = component.announcements()[0];

      // Open
      component.viewAnnouncement(announcement);
      expect(component.displayAnnouncementDialog()).toBe(true);
      expect(component.selectedAnnouncement()).toBe(announcement);

      // Close
      component.closeAnnouncementDialog();
      expect(component.displayAnnouncementDialog()).toBe(false);
      expect(component.selectedAnnouncement()).toBeNull();

      // Reopen
      component.viewAnnouncement(announcement);
      expect(component.displayAnnouncementDialog()).toBe(true);
      expect(component.selectedAnnouncement()).toBe(announcement);
    });

    it('should handle rapid open/close cycles', () => {
      const announcement = component.announcements()[0];

      for (let i = 0; i < 10; i++) {
        component.viewAnnouncement(announcement);
        component.closeAnnouncementDialog();
      }

      expect(component.displayAnnouncementDialog()).toBe(false);
      expect(component.selectedAnnouncement()).toBeNull();
    });
  });
});