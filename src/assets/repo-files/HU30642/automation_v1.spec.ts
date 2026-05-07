import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('HU30642 - Gestión de usuarios - Bloquear o desbloquear usuarios del comercio - Portal Kuara', () => {

  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    // Precondición: Usuario administrador autenticado en Portal Kuara
    await page.goto('/login');
    await page.getByLabel('Usuario').fill('admin_comercio');
    await page.getByLabel('Contraseña').fill('password_segura');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.waitForURL('**/gestion-usuarios');
  });

  test.afterEach(async () => {
    await context.close();
  });

  // ===================== HAPPY PATH =====================

  // Escenario-001: Bloquear usuario cajero exitosamente
  test('Escenario-001: Bloquear usuario cajero exitosamente', async () => {
    // Dado que el administrador del comercio está en la pantalla de gestión de usuarios
    await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

    // Y existe un usuario con rol "cajero" en estado activo
    const filaCajero = page.locator('[data-testid="user-row"]').filter({ hasText: 'cajero' }).filter({ hasText: 'activo' }).first();
    await expect(filaCajero).toBeVisible();

    // Cuando hace clic en el botón de estado del usuario cajero
    await filaCajero.getByRole('button', { name: /estado/i }).click();

    // Entonces el estado del usuario cambia a "bloqueado"
    await expect(filaCajero.locator('[data-testid="user-status"]')).toHaveText(/bloqueado/i);
  });

  // Escenario-002: Bloquear usuario de consulta exitosamente
  test('Escenario-002: Bloquear usuario de consulta exitosamente', async () => {
    // Dado que el administrador del comercio está en la pantalla de gestión de usuarios
    await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

    // Y existe un usuario con rol "consulta" en estado activo
    const filaConsulta = page.locator('[data-testid="user-row"]').filter({ hasText: 'consulta' }).filter({ hasText: 'activo' }).first();
    await expect(filaConsulta).toBeVisible();

    // Cuando hace clic en el botón de estado del usuario de consulta
    await filaConsulta.getByRole('button', { name: /estado/i }).click();

    // Entonces el estado del usuario cambia a "bloqueado"
    await expect(filaConsulta.locator('[data-testid="user-status"]')).toHaveText(/bloqueado/i);
  });

  // Escenario-003: Bloquear otro usuario administrador exitosamente
  test('Escenario-003: Bloquear otro usuario administrador exitosamente', async () => {
    // Dado que el administrador del comercio está en la pantalla de gestión de usuarios
    await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

    // Y existe otro usuario con rol "administrador" en estado activo
    const filaAdmin = page.locator('[data-testid="user-row"]').filter({ hasText: 'administrador' }).filter({ hasText: 'activo' }).first();
    await expect(filaAdmin).toBeVisible();

    // Cuando hace clic en el botón de estado del otro usuario administrador
    await filaAdmin.getByRole('button', { name: /estado/i }).click();

    // Entonces el estado del usuario administrador objetivo cambia a "bloqueado"
    await expect(filaAdmin.locator('[data-testid="user-status"]')).toHaveText(/bloqueado/i);
  });

  // Escenario-004: Desbloquear usuario exitosamente
  test('Escenario-004: Desbloquear usuario exitosamente', async () => {
    // Dado que el administrador del comercio está en la pantalla de gestión de usuarios
    await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

    // Y existe un usuario en estado "bloqueado"
    const filaBloqueado = page.locator('[data-testid="user-row"]').filter({ hasText: 'bloqueado' }).first();
    await expect(filaBloqueado).toBeVisible();

    // Cuando hace clic en el botón de estado del usuario bloqueado
    await filaBloqueado.getByRole('button', { name: /estado/i }).click();

    // Entonces el estado del usuario cambia a "activo"
    await expect(filaBloqueado.locator('[data-testid="user-status"]')).toHaveText(/activo/i);
  });

  // Escenario-005: Usuario desbloqueado puede iniciar sesión nuevamente
  test('Escenario-005: Usuario desbloqueado puede iniciar sesión nuevamente', async () => {
    // Dado que un usuario fue bloqueado previamente
    const filaBloqueado = page.locator('[data-testid="user-row"]').filter({ hasText: 'bloqueado' }).first();
    await expect(filaBloqueado).toBeVisible();
    const nombreUsuario = await filaBloqueado.locator('[data-testid="user-email"]').textContent();

    // Y el administrador desbloquea al usuario desde la pantalla de gestión de usuarios
    await filaBloqueado.getByRole('button', { name: /estado/i }).click();
    await expect(filaBloqueado.locator('[data-testid="user-status"]')).toHaveText(/activo/i);

    // Cuando el usuario desbloqueado intenta iniciar sesión en Portal Kuara con credenciales válidas
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto('/login');
    await newPage.getByLabel('Usuario').fill(nombreUsuario!);
    await newPage.getByLabel('Contraseña').fill('password_usuario');
    await newPage.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Entonces el inicio de sesión es exitoso
    await expect(newPage).toHaveURL(/.*portal.*/i);

    // Y el usuario accede al portal correctamente
    await expect(newPage.getByRole('heading', { name: /portal/i })).toBeVisible();
    await newContext.close();
  });

  // Escenario-006: Eliminar usuario bloqueado exitosamente
  test('Escenario-006: Eliminar usuario bloqueado exitosamente', async () => {
    // Dado que el administrador del comercio está en la pantalla de gestión de usuarios
    await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

    // Y existe un usuario en estado "bloqueado"
    const filaBloqueado = page.locator('[data-testid="user-row"]').filter({ hasText: 'bloqueado' }).first();
    await expect(filaBloqueado).toBeVisible();
    const nombreUsuario = await filaBloqueado.locator('[data-testid="user-name"]').textContent();

    // Cuando el administrador realiza la acción de eliminar al usuario bloqueado
    await filaBloqueado.getByRole('button', { name: /eliminar/i }).click();
    // Confirmar eliminación si hay modal
    const modalConfirmacion = page.getByRole('dialog');
    if (await modalConfirmacion.isVisible()) {
      await modalConfirmacion.getByRole('button', { name: /confirmar|aceptar|sí/i }).click();
    }

    // Entonces el usuario es eliminado del sistema
    await expect(page.locator('[data-testid="user-row"]').filter({ hasText: nombreUsuario! })).toHaveCount(0);
  });

  // Escenario-007: Sesión activa se termina al bloquear usuario
  test('Escenario-007: Sesión activa se termina al bloquear usuario', async () => {
    // Dado que existe un usuario con sesión activa en Portal Kuara
    const userContext = await page.context().browser()!.newContext();
    const userPage = await userContext.newPage();
    await userPage.goto('/login');
    await userPage.getByLabel('Usuario').fill('usuario_cajero');
    await userPage.getByLabel('Contraseña').fill('password_cajero');
    await userPage.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(userPage).toHaveURL(/.*portal.*/i);

    // Y el administrador del comercio está en la pantalla de gestión de usuarios
    await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

    // Cuando el administrador hace clic en el botón de estado para bloquear al usuario con sesión activa
    const filaUsuario = page.locator('[data-testid="user-row"]').filter({ hasText: 'usuario_cajero' }).first();
    await filaUsuario.getByRole('button', { name: /estado/i }).click();

    // Entonces el estado del usuario cambia a "bloqueado"
    await expect(filaUsuario.locator('[data-testid="user-status"]')).toHaveText(/bloqueado/i);

    // Y la sesión activa del usuario se termina automáticamente
    await userPage.reload();
    await expect(userPage).toHaveURL(/.*login.*/i);

    await userContext.close();
  });

  // ===================== FULL ERROR =====================

  // Escenario-008: Usuario bloqueado intenta iniciar sesión
  test('Escenario-008: Usuario bloqueado intenta iniciar sesión', async () => {
    // Dado que un usuario del comercio se encuentra en estado "bloqueado"
    // (Precondición: usuario previamente bloqueado por el administrador)

    // Cuando el usuario intenta iniciar sesión en Portal Kuara con sus credenciales
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto('/login');
    await newPage.getByLabel('Usuario').fill('usuario_bloqueado');
    await newPage.getByLabel('Contraseña').fill('password_usuario');
    await newPage.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Entonces se muestra el mensaje de error: "Usuario bloqueado"
    await expect(newPage.getByText('Usuario bloqueado')).toBeVisible();

    // Y no se permite el acceso al portal
    await expect(newPage).toHaveURL(/.*login.*/i);

    await newContext.close();
  });

  // Escenario-009: Usuario bloqueado intenta iniciar sesión con credenciales correctas
  test('Escenario-009: Usuario bloqueado intenta iniciar sesión con credenciales correctas', async () => {
    // Dado que un usuario del comercio se encuentra en estado "bloqueado"
    // Y las credenciales del usuario son válidas

    // Cuando el usuario intenta iniciar sesión en Portal Kuara
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto('/login');
    await newPage.getByLabel('Usuario').fill('usuario_bloqueado_creds_validas');
    await newPage.getByLabel('Contraseña').fill('password_correcto');
    await newPage.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Entonces se muestra el mensaje de error: "Usuario bloqueado"
    await expect(newPage.getByText('Usuario bloqueado')).toBeVisible();

    // Y el sistema no genera token de sesión para el usuario
    const cookies = await newContext.cookies();
    const sessionToken = cookies.find(c => c.name === 'session_token' || c.name === 'access_token');
    expect(sessionToken).toBeUndefined();

    await newContext.close();
  });

  // Escenario-010: Verificar que el usuario bloqueado no genera sesión en base de datos
  test('Escenario-010: Verificar que el usuario bloqueado no genera sesión en BD', async () => {
    // Dado que un usuario del comercio se encuentra en estado "bloqueado"

    // Cuando el usuario intenta iniciar sesión en Portal Kuara
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto('/login');
    await newPage.getByLabel('Usuario').fill('usuario_bloqueado');
    await newPage.getByLabel('Contraseña').fill('password_usuario');
    await newPage.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Entonces se muestra el mensaje de error: "Usuario bloqueado"
    await expect(newPage.getByText('Usuario bloqueado')).toBeVisible();

    // Y se valida en base de datos que no se creó un registro de sesión para ese usuario
    // NOTA: Validación de BD requiere endpoint de API o acceso directo a la base de datos
    // Se sugiere validar mediante API interna: GET /api/sessions?user=usuario_bloqueado
    const response = await newPage.request.get('/api/sessions?user=usuario_bloqueado');
    const sessions = await response.json();
    expect(sessions.length).toBe(0);

    await newContext.close();
  });

  // Escenario-011: Bloquear usuario y verificar que no puede realizar operaciones
  test('Escenario-011: Bloquear usuario y verificar que no puede realizar operaciones', async () => {
    // Dado que existe un usuario con sesión activa realizando operaciones en Portal Kuara
    const userContext = await page.context().browser()!.newContext();
    const userPage = await userContext.newPage();
    await userPage.goto('/login');
    await userPage.getByLabel('Usuario').fill('usuario_operando');
    await userPage.getByLabel('Contraseña').fill('password_usuario');
    await userPage.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(userPage).toHaveURL(/.*portal.*/i);

    // Cuando el administrador bloquea al usuario desde la pantalla de gestión de usuarios
    const filaUsuario = page.locator('[data-testid="user-row"]').filter({ hasText: 'usuario_operando' }).first();
    await filaUsuario.getByRole('button', { name: /estado/i }).click();

    // Entonces la sesión del usuario se cierra automáticamente
    await userPage.reload();

    // Y el usuario es redirigido a la pantalla de inicio de sesión
    await expect(userPage).toHaveURL(/.*login.*/i);

    await userContext.close();
  });

  // Escenario-012: Intentar acceso a rutas protegidas con usuario bloqueado
  test('Escenario-012: Intentar acceso a rutas protegidas con usuario bloqueado', async () => {
    // Dado que un usuario del comercio se encuentra en estado "bloqueado"

    // Cuando intenta acceder directamente a una ruta protegida del portal mediante URL
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto('/portal/dashboard');

    // Entonces el sistema redirige al usuario a la pantalla de inicio de sesión
    await expect(newPage).toHaveURL(/.*login.*/i);

    // Y se muestra el mensaje de error: "Usuario bloqueado"
    await expect(newPage.getByText('Usuario bloqueado')).toBeVisible();

    await newContext.close();
  });

  // ===================== CASOS BORDE =====================

  // Escenario-013: Bloquear y desbloquear usuario en secuencia rápida
  test('Escenario-013: Bloquear y desbloquear usuario en secuencia rápida', async () => {
    // Dado que el administrador del comercio está en la pantalla de gestión de usuarios
    await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

    // Y existe un usuario en estado activo
    const filaUsuario = page.locator('[data-testid="user-row"]').filter({ hasText: 'activo' }).first();
    await expect(filaUsuario).toBeVisible();

    // Cuando el administrador hace clic en el botón de estado para bloquear al usuario
    await filaUsuario.getByRole('button', { name: /estado/i }).click();
    await expect(filaUsuario.locator('[data-testid="user-status"]')).toHaveText(/bloqueado/i);

    // Y inmediatamente después hace clic nuevamente para desbloquear al usuario
    await filaUsuario.getByRole('button', { name: /estado/i }).click();

    // Entonces el estado final del usuario es "activo"
    await expect(filaUsuario.locator('[data-testid="user-status"]')).toHaveText(/activo/i);
  });

  // Escenario-014: Bloquear usuario que ya se encuentra bloqueado
  test('Escenario-014: Bloquear usuario que ya se encuentra bloqueado', async () => {
    // Dado que el administrador del comercio está en la pantalla de gestión de usuarios
    await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

    // Y existe un usuario en estado "bloqueado"
    const filaBloqueado = page.locator('[data-testid="user-row"]').filter({ hasText: 'bloqueado' }).first();
    await expect(filaBloqueado).toBeVisible();

    // Cuando el administrador visualiza el botón de estado del usuario bloqueado
    const botonEstado = filaBloqueado.getByRole('button', { name: /estado/i });

    // Entonces el botón refleja el estado "bloqueado"
    await expect(filaBloqueado.locator('[data-testid="user-status"]')).toHaveText(/bloqueado/i);

    // Y la única acción disponible es desbloquear al usuario
    await expect(botonEstado).toBeVisible();
    await botonEstado.click();
    await expect(filaBloqueado.locator('[data-testid="user-status"]')).toHaveText(/activo/i);
  });

  // Escenario-015: Administrador bloquea a otro administrador con sesión activa
  test('Escenario-015: Administrador bloquea a otro administrador con sesión activa', async () => {
    // Dado que existen dos usuarios con rol "administrador" en el comercio
    // Y el segundo administrador tiene una sesión activa en Portal Kuara
    const admin2Context = await page.context().browser()!.newContext();
    const admin2Page = await admin2Context.newPage();
    await admin2Page.goto('/login');
    await admin2Page.getByLabel('Usuario').fill('admin_comercio_2');
    await admin2Page.getByLabel('Contraseña').fill('password_admin2');
    await admin2Page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(admin2Page).toHaveURL(/.*portal.*/i);

    // Cuando el primer administrador bloquea al segundo administrador desde la pantalla de gestión de usuarios
    const filaAdmin2 = page.locator('[data-testid="user-row"]').filter({ hasText: 'admin_comercio_2' }).first();
    await filaAdmin2.getByRole('button', { name: /estado/i }).click();

    // Entonces el estado del segundo administrador cambia a "bloqueado"
    await expect(filaAdmin2.locator('[data-testid="user-status"]')).toHaveText(/bloqueado/i);

    // Y la sesión activa del segundo administrador se termina automáticamente
    await admin2Page.reload();
    await expect(admin2Page).toHaveURL(/.*login.*/i);

    await admin2Context.close();
  });

  // Escenario-016: Verificar persistencia del bloqueo después de reiniciar el sistema
  test('Escenario-016: Verificar persistencia del bloqueo después de reiniciar', async () => {
    // Dado que un usuario fue bloqueado por el administrador del comercio
    const filaUsuario = page.locator('[data-testid="user-row"]').filter({ hasText: 'activo' }).first();
    await filaUsuario.getByRole('button', { name: /estado/i }).click();
    await expect(filaUsuario.locator('[data-testid="user-status"]')).toHaveText(/bloqueado/i);
    const nombreUsuario = await filaUsuario.locator('[data-testid="user-email"]').textContent();

    // Cuando el servicio del portal se reinicia (simulado con recarga completa)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Y el usuario intenta iniciar sesión
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto('/login');
    await newPage.getByLabel('Usuario').fill(nombreUsuario!);
    await newPage.getByLabel('Contraseña').fill('password_usuario');
    await newPage.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Entonces se muestra el mensaje de error: "Usuario bloqueado"
    await expect(newPage.getByText('Usuario bloqueado')).toBeVisible();

    await newContext.close();
  });
});
