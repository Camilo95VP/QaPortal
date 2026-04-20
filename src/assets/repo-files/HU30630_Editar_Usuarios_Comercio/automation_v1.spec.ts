import { test, expect } from '@playwright/test';

// HU30630 - Editar Usuarios del Comercio
// Gherkin (Happy Path) como comentarios:
/*
Feature: Edición de usuario
  Scenario: Administrador edita nombre, correo, rol y alias, confirma y guarda
    Given el administrador está en la pantalla de gestión de usuarios
    When hace clic en "Editar"
    And modifica "Nombre y apellido" a "Juan Pérez"
    And modifica "Correo electrónico" a "juan.perez@example.com"
    And cambia "Rol" de "Cajero" a "Consulta"
    And añade un alias "alias_nuevo"
    And hace clic en "Guardar"
    Then se muestra el modal de confirmación
    When confirma en el modal con "Guardar"
    Then el sistema persiste los cambios y muestra la ficha del usuario actualizada
*/

test.describe('HU30630 - Editar usuario', () => {
  test('Happy Path - editar y guardar', async ({ page }) => {
    // Ajusta las rutas/selectores según la app real
    await page.goto('/');

    // Given: navegar a gestión de usuarios
    await page.click('a[href="/user-management"]');
    await expect(page).toHaveURL(/user-management/);

    // Seleccionar usuario (ejemplo selector)
    await page.click('data-test-user-row="user-123"');
    await page.click('button:has-text("Editar")');

    // Rellenar campos
    await page.fill('input[name="fullName"]', 'Juan Pérez');
    await page.fill('input[name="email"]', 'juan.perez@example.com');
    await page.selectOption('select[name="role"]', 'consulta');
    await page.fill('input[name="aliasInput"]', 'alias_nuevo');
    await page.click('button:has-text("Agregar alias")');

    // Guardar (abrirá modal de confirmación)
    await page.click('button:has-text("Guardar")');

    // Confirmar en modal
    await expect(page.locator('text=¿Estás seguro que deseas guardar este usuario?')).toBeVisible();
    await page.click('button:has-text("Guardar"):visible');

    // Verificar resultado: datos actualizados y auditoría creada (basic check)
    await expect(page.locator('text=Juan Pérez')).toBeVisible();
    await expect(page.locator('text=juan.perez@example.com')).toBeVisible();
    await expect(page.locator('text=Consulta')).toBeVisible();
  });
});
