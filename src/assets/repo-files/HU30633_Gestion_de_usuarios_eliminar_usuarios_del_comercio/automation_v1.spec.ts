import { test, expect, APIRequestContext } from '@playwright/test'

test.describe('HU30633 - Gestión de usuarios - eliminar usuarios del comercio - Portal Kuara', () => {

  test('CP-001: Eliminar otro administrador', async ({ page, request }) => {
    // Gherkin:
    // Dado que Administrador A está autenticado y Administrador B aparece en el listado
    // Cuando Administrador A pulsa "Eliminar" sobre Administrador B y confirma
    // Entonces Se realiza la eliminación lógica, credenciales inhabilitadas, historial preservado y sesión terminada si estaba activa

    // Acciones UI (selectores recomendados):
    // - Login como Admin A (usar fixtures o API para crear sesión)
    // - Navegar a /admin/users
    // - Localizar fila: locator(`[data-testid="user-row-${'{userB.id}'}"]`)
    // - Click en `[data-testid="btn-delete-${'{userB.id}'}"]`
    // - Ver modal `[data-testid="confirm-delete-modal"]` con texto esperado
    // - Click en botón confirm `data-testid="confirm-delete-btn"`

    // Ejemplo (simplificado):
    await page.goto('/admin/users')
    await page.waitForSelector('[data-testid="user-row-userB@example.com"]')
    await page.click('[data-testid="btn-delete-userB@example.com"]')
    await expect(page.locator('[data-testid="confirm-delete-modal"]')).toHaveText(/Estás seguro que deseas eliminar este usuario/)
    await page.click('[data-testid="confirm-delete-btn"]')

    // Validaciones UI
    await expect(page.locator('[data-testid="user-row-userB@example.com"]')).toHaveCount(0)

    // Validaciones backend/DB (usar API/admin endpoints o helpers)
    // Ejemplo usando request para consultar el estado del usuario en la API
    const res = await request.get(`/api/admin/users/userB@example.com`)
    expect(res.status()).toBe(200)
    const user = await res.json()
    expect(user.status).toBe('deleted')
    // Verificar existencia de auditoría
    const audit = await request.get(`/api/admin/users/userB@example.com/audit`) 
    expect(audit.status()).toBe(200)
    const auditEntries = await audit.json()
    expect(auditEntries.length).toBeGreaterThan(0)
  })

  test('CP-002: Confirmación - Cancelar redirige a gestión', async ({ page }) => {
    // Gherkin:
    // Dado que Administrador A está en la pantalla de gestión de usuarios
    // Cuando pulsa eliminar y luego pulsa "Cancelar"
    // Entonces Se cierra modal y la vista queda en la pantalla de gestión de usuarios

    await page.goto('/admin/users')
    await page.waitForSelector('[data-testid="user-row-userB@example.com"]')
    await page.click('[data-testid="btn-delete-userB@example.com"]')
    await expect(page.locator('[data-testid="confirm-delete-modal"]')).toBeVisible()
    await page.click('[data-testid="cancel-delete-btn"]')
    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.locator('[data-testid="confirm-delete-modal"]')).toHaveCount(0)
  })

  test('CP-003: Intento de login por usuario eliminado muestra "Credenciales incorrectas"', async ({ page, request }) => {
    // Gherkin:
    // Dado que Usuario B fue eliminado lógicamente
    // Cuando intenta iniciar sesión con sus credenciales
    // Entonces El sistema responde con "Credenciales incorrectas"

    // Intento de login UI
    await page.goto('/login')
    await page.fill('input[name="username"]', 'userB@example.com')
    await page.fill('input[name="password"]', 'P@ssw0rd')
    await page.click('button[type="submit"]')

    await expect(page.locator('.login-error')).toHaveText('Credenciales incorrectas')

    // Alternativa: validar a nivel API
    const res = await request.post('/api/auth/login', { data: { username: 'userB@example.com', password: 'P@ssw0rd' } })
    // Debe devolver 401 o equivalente y mensaje genérico
    expect([401, 400]).toContain(res.status())
    const body = await res.json()
    expect(body.message).toBe('Credenciales incorrectas')
  })

  test('CP-004: El administrador autenticado no aparece en su propio listado', async ({ page }) => {
    // Gherkin:
    // Dado que Administrador A está autenticado
    // Cuando abre la pantalla de gestión de usuarios
    // Entonces Su propio usuario no aparece en la lista

    await page.goto('/admin/users')
    // Supongamos que el sistema expone el correo del admin autenticado en un header o fixture
    const adminEmail = 'adminA@example.com'
    await expect(page.locator(`[data-testid="user-row-${adminEmail}"]`)).toHaveCount(0)
  })

})
