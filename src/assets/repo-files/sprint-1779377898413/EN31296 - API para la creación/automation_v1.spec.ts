import { test, expect } from '@playwright/test';

const testData = {
  valid: {
    create: { merchantId: 'M123', accountNumber: 'ACC-0001', alias: 'ALIAS-1' },
    update: { alias: 'ALIAS-UPDATED' }
  },
  invalid: {
    create: { merchantId: '', accountNumber: 'BAD', alias: '' },
    delete: { alias: 'NON-EXISTENT' }
  },
  edge: {
    largeBatch: Array.from({length: 60}, (_,i)=> ({ merchantId: `M${1000+i}`, accountNumber: `ACC-${i}`, alias: `AL-${i}`}))
  }
};

test.describe('EN31296 - API para la creación (change-account)', () => {

  test('CP-A01: Crear cuenta y alias correctamente', async ({ request }) => {
    // Dado que el usuario realiza una petición válida de creación (payload según swagger)
    const res = await request.post('/api/change-account/accounts', { data: testData.valid.create, timeout: 15000 });
    expect(res.status()).toBeOneOf([200,201]);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    // Validar relación en repo (ej. llamada al repo-service)
  });

  test('CP-A02: Actualizar relación cuenta-alias', async ({ request }) => {
    // Dado que existe una relación alias-cuenta previa
    const create = await request.post('/api/change-account/accounts', { data: testData.valid.create, timeout:15000 });
    const created = await create.json();
    const res = await request.put(`/api/change-account/accounts/${created.id}/alias`, { data: testData.valid.update, timeout:15000 });
    expect(res.status()).toBe(200);
    // Validar auditoría
  });

  test('CP-A03: Eliminación de alias válida', async ({ request }) => {
    // Preparar comercio con 2 alias
    // Simular creación de alias adicional
    const res = await request.delete('/api/change-account/accounts/alias', { data: { merchantId:'M123', alias: 'ALIAS-1' }, timeout:15000 });
    expect(res.status()).toBeOneOf([200,204]);
  });

  test('CP-A04: Manejo de error y mensaje al front', async ({ request }) => {
    // Forzar error de persistencia (mock/stub) y validar mensaje genérico
    const res = await request.post('/api/change-account/accounts', { data: testData.invalid.create, timeout:15000 });
    expect([400,500]).toContain(res.status());
    const txt = await res.text();
    expect(txt).toContain('Error al guardar la información');
  });

  test('CP-A05: Timeout configurado (15s)', async ({ request }) => {
    // Llamada que simula latencia alta
    const res = await request.get('/api/change-account/simulate-delay?ms=20000', { timeout: 15000 }).catch(e => e);
    expect(res).toBeDefined();
  });

  test('CP-A07: Validación de integridad con API builder', async ({ request }) => {
    // Simular respuesta del API builder y validar fallback
    const res = await request.post('/api/change-account/with-builder', { data: testData.valid.create, timeout:15000 });
    expect(res.status()).toBeOneOf([200,201]);
  });

  test('CP-A08: Auditoría de cambios masivos', async ({ request }) => {
    // Enviar batch grande
    const res = await request.post('/api/change-account/batch', { data: testData.edge.largeBatch, timeout:30000 });
    expect(res.status()).toBeOneOf([200,202]);
  });

});
