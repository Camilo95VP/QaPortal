import { test, expect } from '@playwright/test';

/*
Feature: Crear usuarios del comercio
  Scenario: Crear usuario válido y publicar credenciales (CP-001)
    Given el administrador está en la pantalla de creación de usuarios
    When ingresa Nombre y apellido = "Ana Torres"
    And ingresa Correo electrónico = "ana.torres@example.com"
    And selecciona Rol = "Cajero"
    And selecciona al menos un Alias
    And hace clic en Guardar
    Then se muestra modal de confirmación
    When confirma Guardar
    Then se crea el usuario y se publica en la cola de credenciales

  Scenario: Validaciones de nombre (CP-002, CP-003)
  Scenario: Validación de correo (CP-004)
  Scenario: Detección de correo duplicado (CP-007)
  Scenario: Manejo de falla en cola de credenciales (CP-008)
*/

test.describe('HU30628 - Crear usuarios', () => {
  test('CP-001: Happy Path - crear usuario y publicar credenciales', async ({ page }) => {
    await page.goto('/');
    // Navegar a pantalla de creación (ajustar ruta real)
    await page.click('a[href="/user-management/create"]');
    await expect(page).toHaveURL(/user-management\/create/);

    // Rellenar campos (selectores sugeridos)
    await page.fill('input[name="fullName"]', 'Ana Torres');
    await page.fill('input[name="email"]', 'ana.torres@example.com');
    await page.selectOption('select[name="role"]', 'cajero');
    // Añadir alias (ejemplo de selector)
    await page.click('button:has-text("Agregar alias")');
    await page.fill('input[name="aliasInput"]', 'alias1');
    await page.press('input[name="aliasInput"]', 'Enter');

    // Guardar y confirmar
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=¿Estás seguro que deseas guardar este usuario?')).toBeVisible();
    await page.click('button:has-text("Guardar"):visible');

    // Verificaciones básicas post-creación
    await expect(page.locator('text=Ana Torres')).toBeVisible();
    await expect(page.locator('text=ana.torres@example.com')).toBeVisible();
    await expect(page.locator('text=Cajero')).toBeVisible();
  });

  test('CP-004: Validación de correo formato inválido muestra mensaje', async ({ page }) => {
    await page.goto('/user-management/create');
    await page.fill('input[name="email"]', 'correo-invalido');
    await page.blur('input[name="email"]');
    await expect(page.locator('text=Formato de correo electrónico invalido')).toBeVisible();
    await expect(page.locator('button:has-text("Guardar")')).toBeDisabled();
  });

  test('CP-007: Detección de correo duplicado (backend 409)', async ({ page }) => {
    await page.goto('/user-management/create');
    await page.fill('input[name="fullName"]', 'Usuario Duplicado');
    await page.fill('input[name="email"]', 'duplicado@example.com');
    await page.selectOption('select[name="role"]', 'consulta');
    await page.click('button:has-text("Guardar")');
    await page.click('button:has-text("Guardar"):visible');
    // Simular respuesta 409 depende de entorno; aquí verificamos mensaje UI
    await expect(page.locator('text=Correo ya registrado')).toBeVisible();
  });

  test('CP-008: Falla en la publicación a la cola - mostrar reintento', async ({ page }) => {
    await page.goto('/user-management/create');
    await page.fill('input[name="fullName"]', 'Usuario ColaError');
    await page.fill('input[name="email"]', 'cola.error@example.com');
    await page.selectOption('select[name="role"]', 'cajero');
    await page.click('button:has-text("Guardar")');
    await page.click('button:has-text("Guardar"):visible');
    // Verificar que la UI muestra error de publish y opción reintentar
    await expect(page.locator('text=Error al publicar en la cola de credenciales')).toBeVisible();
    await expect(page.locator('button:has-text("Reintentar")')).toBeVisible();
  });
});
