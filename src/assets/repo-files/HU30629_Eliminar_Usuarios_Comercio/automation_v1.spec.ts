import { test, expect } from '@playwright/test';

/*
Feature: Eliminar usuarios del comercio
  Scenario: Administrador elimina a otro usuario y se mantiene historial (CP-001)
    Given el administrador está en la pantalla de gestión de usuarios
    When selecciona a un usuario distinto a sí mismo y hace clic en "Eliminar"
    Then se muestra el modal "Estás seguro que deseas eliminar este usuario"
    When confirma con "Eliminar"
    Then el usuario queda marcado como eliminado, credenciales inhabilitadas y su sesión terminada
*/

test.describe('HU30629 - Eliminar usuarios', () => {
  test('CP-001: Happy Path - eliminar usuario distinto al actor', async ({ page }) => {
    await page.goto('/user-management');
    // Seleccionar usuario distinto al actor (selector ficticio)
    await page.click('data-test-user-row="user-456"');
    await page.click('button:has-text("Eliminar")');
    await expect(page.locator('text=Estás seguro que deseas eliminar este usuario')).toBeVisible();
    await page.click('button:has-text("Eliminar"):visible');

    // Verificar que la fila desaparece o se marca como eliminado
    await expect(page.locator('data-test-user-row="user-456"')).not.toBeVisible();
    // Verificar mensaje de éxito
    await expect(page.locator('text=Usuario eliminado correctamente')).toBeVisible();
  });

  test('CP-002: No permitir eliminarse a sí mismo', async ({ page }) => {
    await page.goto('/user-management');
    // Verificar que el propio actor no muestra botón eliminar
    await expect(page.locator('data-test-user-row="user-me" button:has-text("Eliminar")')).not.toBeVisible();
  });

  test('CP-004: Sesión activa termina y login futuro falla con Credenciales incorrectas', async ({ page }) => {
    // Simulación: intentar login con usuario eliminado (depende del entorno de pruebas)
    await page.goto('/login');
    await page.fill('input[name="username"]', 'usuario.eliminado');
    await page.fill('input[name="password"]', 'password');
    await page.click('button:has-text("Ingresar")');
    await expect(page.locator('text=Credenciales incorrectas')).toBeVisible();
  });
});
