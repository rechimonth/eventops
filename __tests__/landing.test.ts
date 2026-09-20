import { escapeHtml, landingHtml } from '../src/invites/landing';

const base = {
  couple: 'A & B', dateISO: '2026-12-12T14:00:00Z', venue: 'Salón', mapsUrl: 'https://maps.google.com/?q=x',
  dressCode: 'Formal', cbu: '123', alias: 'BODA.2026', rsvpEndpoint: 'https://api.eventops.app/rsvp', slug: 'abc12345',
};

test('escapa HTML de terceros', () => {
  expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  const html = landingHtml({ ...base, couple: '<img src=x onerror=y>' });
  expect(html).not.toContain('<img src=x');
  expect(html).toContain('&lt;img src=x');
});

test('bloquea javascript: en URLs y exige ISO', () => {
  const html = landingHtml({ ...base, mapsUrl: 'javascript:alert(1)' });
  expect(html).not.toContain('javascript:');
  expect(() => landingHtml({ ...base, dateISO: '");alert(1);//' })).toThrow(RangeError);
});
