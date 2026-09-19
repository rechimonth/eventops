import { device, element, by, waitFor } from 'detox';

// E2E: flujo de permisos de contactos Android (READ_CONTACTS).
describe('Contactos Android', () => {
  it('pide permiso y lista invitados', async () => {
    await device.launchApp({ permissions: { contacts: 'YES' } });
    await waitFor(element(by.text('Invitados'))).toBeVisible().withTimeout(5000);
  });
});
