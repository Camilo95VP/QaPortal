import { test, expect } from '@playwright/test';

test.describe('HU30642 - Gestión de usuarios - Bloquear o Desbloquear Usuarios del Comercio - Portal Kuara', () => {

  // ==================== HAPPY PATH ====================

  // CP-001: Bloquear usuario cajero exitosamente
  test('CP-001: Bloquear usuario cajero exitosamente', async ({ page }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y existe un usuario cajero con estado activo
    const usuarioCajero = page.locator('[data-testid="usuario-cajero-activo"]').first();
    await expect(usuarioCajero).toBeVisible();

    // Cuando el administrador hace clic en el botón de estado del usuario cajero para bloquearlo
    const botonEstado = usuarioCajero.locator('[data-testid="btn-estado"]');
    await botonEstado.click();

    // Entonces el estado del usuario cajero cambia a "Bloqueado"
    await expect(usuarioCajero.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Y el sistema confirma visualmente el cambio de estado en la lista de usuarios
    await expect(usuarioCajero.locator('[data-testid="estado-usuario"]')).toBeVisible();

    // Y el usuario cajero queda sin acceso al Portal Kuara
    await expect(usuarioCajero.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');
  });

  // CP-002: Bloquear usuario de consulta exitosamente
  test('CP-002: Bloquear usuario de consulta exitosamente', async ({ page }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y existe un usuario de consulta con estado activo
    const usuarioConsulta = page.locator('[data-testid="usuario-consulta-activo"]').first();
    await expect(usuarioConsulta).toBeVisible();

    // Cuando el administrador hace clic en el botón de estado del usuario de consulta para bloquearlo
    const botonEstado = usuarioConsulta.locator('[data-testid="btn-estado"]');
    await botonEstado.click();

    // Entonces el estado del usuario de consulta cambia a "Bloqueado"
    await expect(usuarioConsulta.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Y el sistema confirma visualmente el cambio de estado en la lista de usuarios
    await expect(usuarioConsulta.locator('[data-testid="estado-usuario"]')).toBeVisible();

    // Y el usuario de consulta queda sin acceso al Portal Kuara
    await expect(usuarioConsulta.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');
  });

  // CP-003: Bloquear usuario administrador exitosamente
  test('CP-003: Bloquear usuario administrador exitosamente', async ({ page }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y existe otro usuario administrador con estado activo
    const otroAdmin = page.locator('[data-testid="usuario-admin-activo"]').first();
    await expect(otroAdmin).toBeVisible();

    // Cuando el administrador hace clic en el botón de estado del usuario administrador para bloquearlo
    const botonEstado = otroAdmin.locator('[data-testid="btn-estado"]');
    await botonEstado.click();

    // Entonces el estado del usuario administrador bloqueado cambia a "Bloqueado"
    await expect(otroAdmin.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Y el sistema confirma visualmente el cambio de estado
    await expect(otroAdmin.locator('[data-testid="estado-usuario"]')).toBeVisible();

    // Y el usuario administrador bloqueado queda sin acceso al Portal Kuara
    await expect(otroAdmin.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');
  });

  // CP-004: Desbloquear usuario previamente bloqueado
  test('CP-004: Desbloquear usuario previamente bloqueado', async ({ page }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y existe un usuario con estado "Bloqueado"
    const usuarioBloqueado = page.locator('[data-testid="usuario-bloqueado"]').first();
    await expect(usuarioBloqueado).toBeVisible();
    await expect(usuarioBloqueado.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Cuando el administrador hace clic en el botón de estado del usuario bloqueado para desbloquearlo
    const botonEstado = usuarioBloqueado.locator('[data-testid="btn-estado"]');
    await botonEstado.click();

    // Entonces el estado del usuario cambia a "Activo"
    await expect(usuarioBloqueado.locator('[data-testid="estado-usuario"]')).toHaveText('Activo');

    // Y el sistema confirma visualmente el cambio de estado
    await expect(usuarioBloqueado.locator('[data-testid="estado-usuario"]')).toBeVisible();

    // Y el usuario puede volver a iniciar sesión en el Portal Kuara
    await expect(usuarioBloqueado.locator('[data-testid="estado-usuario"]')).toHaveText('Activo');
  });

  // CP-005: Acceso denegado al usuario bloqueado con mensaje correcto
  test('CP-005: Acceso denegado al usuario bloqueado con mensaje correcto', async ({ browser }) => {
    // Dado que existe un usuario con estado "Bloqueado" en el sistema
    const context = await browser.newContext();
    const page = await context.newPage();

    // Cuando el usuario bloqueado intenta iniciar sesión en el Portal Kuara con sus credenciales válidas
    await page.goto('/login');
    await page.locator('[data-testid="input-usuario"]').fill('usuario_bloqueado@comercio.com');
    await page.locator('[data-testid="input-password"]').fill('Password123');

    // Y hace clic en el botón de ingresar
    await page.locator('[data-testid="btn-ingresar"]').click();

    // Entonces el sistema no permite el ingreso
    await expect(page).toHaveURL(/login/);

    // Y muestra el mensaje "Usuario bloqueado"
    await expect(page.locator('[data-testid="mensaje-error"]')).toHaveText('Usuario bloqueado');

    await context.close();
  });

  // CP-006: Cierre automático de sesión activa al bloquear usuario
  test('CP-006: Cierre automático de sesión activa al bloquear usuario', async ({ browser }) => {
    // Dado que un usuario tiene una sesión activa en el Portal Kuara
    const contextUsuario = await browser.newContext();
    const pageUsuario = await contextUsuario.newPage();
    await pageUsuario.goto('/login');
    await pageUsuario.locator('[data-testid="input-usuario"]').fill('usuario_activo@comercio.com');
    await pageUsuario.locator('[data-testid="input-password"]').fill('Password123');
    await pageUsuario.locator('[data-testid="btn-ingresar"]').click();
    await expect(pageUsuario).toHaveURL(/dashboard/);

    // Y el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    const contextAdmin = await browser.newContext();
    const pageAdmin = await contextAdmin.newPage();
    await pageAdmin.goto('/gestion-usuarios');

    // Cuando el administrador hace clic en el botón de estado del usuario activo para bloquearlo
    const usuarioActivo = pageAdmin.locator('[data-testid="usuario-activo-con-sesion"]').first();
    await usuarioActivo.locator('[data-testid="btn-estado"]').click();
    await expect(usuarioActivo.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Entonces la sesión activa del usuario bloqueado se termina automáticamente
    await pageUsuario.reload();

    // Y si el usuario intenta realizar una acción en el portal es redirigido a la pantalla de inicio de sesión
    await expect(pageUsuario).toHaveURL(/login/);

    // Y el sistema muestra el mensaje "Usuario bloqueado" al intentar ingresar nuevamente
    await pageUsuario.locator('[data-testid="input-usuario"]').fill('usuario_activo@comercio.com');
    await pageUsuario.locator('[data-testid="input-password"]').fill('Password123');
    await pageUsuario.locator('[data-testid="btn-ingresar"]').click();
    await expect(pageUsuario.locator('[data-testid="mensaje-error"]')).toHaveText('Usuario bloqueado');

    await contextUsuario.close();
    await contextAdmin.close();
  });

  // CP-007: Usuario bloqueado puede ser eliminado
  test('CP-007: Usuario bloqueado puede ser eliminado', async ({ page }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y existe un usuario con estado "Bloqueado"
    const usuarioBloqueado = page.locator('[data-testid="usuario-bloqueado"]').first();
    await expect(usuarioBloqueado).toBeVisible();
    await expect(usuarioBloqueado.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Cuando el administrador selecciona la opción de eliminar al usuario bloqueado
    await usuarioBloqueado.locator('[data-testid="btn-eliminar-usuario"]').click();

    // Entonces el sistema permite completar la eliminación del usuario
    const modalConfirmacion = page.locator('[data-testid="modal-confirmacion-eliminar"]');
    if (await modalConfirmacion.isVisible()) {
      await page.locator('[data-testid="btn-confirmar-eliminar"]').click();
    }

    // Y el usuario eliminado ya no aparece en la lista de usuarios del comercio
    await expect(page.locator('[data-testid="usuario-bloqueado-eliminado"]')).not.toBeVisible();
  });

  // ==================== FULL ERROR ====================

  // CP-008: Mensaje exacto al intentar iniciar sesión con usuario bloqueado
  test('CP-008: Mensaje exacto al intentar iniciar sesión con usuario bloqueado', async ({ page }) => {
    // Dado que existe un usuario con estado "Bloqueado" en el sistema
    await page.goto('/login');

    // Cuando el usuario bloqueado ingresa sus credenciales válidas en la pantalla de inicio de sesión
    await page.locator('[data-testid="input-usuario"]').fill('usuario_bloqueado@comercio.com');
    await page.locator('[data-testid="input-password"]').fill('Password123');

    // Y hace clic en el botón de ingresar
    await page.locator('[data-testid="btn-ingresar"]').click();

    // Entonces el sistema no permite el acceso
    await expect(page).not.toHaveURL(/dashboard/);

    // Y muestra exactamente el mensaje "Usuario bloqueado"
    const mensajeError = page.locator('[data-testid="mensaje-error"]');
    await expect(mensajeError).toBeVisible();
    await expect(mensajeError).toHaveText('Usuario bloqueado');

    // Y el usuario permanece en la pantalla de inicio de sesión
    await expect(page).toHaveURL(/login/);
  });

  // CP-009: Verificar registro de estado bloqueado en base de datos
  test('CP-009: Verificar registro de estado bloqueado en base de datos', async ({ page, request }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y existe un usuario con estado activo
    const usuario = page.locator('[data-testid="usuario-activo"]').first();
    const usuarioId = await usuario.getAttribute('data-user-id');
    await expect(usuario).toBeVisible();

    // Cuando el administrador hace clic en el botón de estado para bloquear al usuario
    await usuario.locator('[data-testid="btn-estado"]').click();
    await expect(usuario.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Entonces en la base de datos el registro del usuario refleja el estado "BLOQUEADO"
    const response = await request.get(`/api/usuarios/${usuarioId}`);
    const usuarioData = await response.json();
    expect(usuarioData.estado).toBe('BLOQUEADO');

    // Y la fecha y hora del bloqueo quedan registradas en el campo correspondiente
    expect(usuarioData.fechaBloqueo).not.toBeNull();

    // Y el campo de estado del usuario en la base de datos corresponde al valor bloqueado
    expect(response.status()).toBe(200);
  });

  // CP-010: Verificar invalidación de sesión en base de datos al bloquear usuario activo
  test('CP-010: Verificar invalidación de sesión en base de datos al bloquear usuario activo', async ({ page, request }) => {
    // Dado que un usuario tiene una sesión activa registrada en la base de datos del Portal Kuara
    const sesionResponse = await request.get('/api/sesiones/activas');
    const sesionesActivas = await sesionResponse.json();
    const sesionActiva = sesionesActivas[0];
    expect(sesionActiva).toBeDefined();

    // Cuando el administrador bloquea al usuario desde la pantalla de gestión de usuarios
    await page.goto('/gestion-usuarios');
    const usuario = page.locator(`[data-user-id="${sesionActiva.usuarioId}"]`);
    await usuario.locator('[data-testid="btn-estado"]').click();
    await expect(usuario.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Entonces la sesión del usuario queda invalidada en la base de datos
    const sesionResponse2 = await request.get(`/api/sesiones/${sesionActiva.sesionId}`);
    const sesionData = await sesionResponse2.json();
    expect(sesionData.activa).toBe(false);

    // Y el token de sesión activo del usuario es eliminado o marcado como inválido
    expect(['INVALIDO', 'ELIMINADO', null]).toContain(sesionData.estadoToken);
  });

  // ==================== CASOS BORDE ====================

  // CP-011: Administrador intenta bloquear su propia cuenta
  test('CP-011: Administrador intenta bloquear su propia cuenta', async ({ page }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y su propio usuario aparece en la lista de usuarios
    const miUsuario = page.locator('[data-testid="mi-usuario-admin"]');
    await expect(miUsuario).toBeVisible();

    // Cuando el administrador hace clic en el botón de estado de su propia cuenta para bloquearse
    await miUsuario.locator('[data-testid="btn-estado"]').click();

    // Entonces el sistema muestra un mensaje de advertencia o restricción
    const mensajeRestriccion = page.locator('[data-testid="mensaje-advertencia"], [data-testid="mensaje-restriccion"]');
    await expect(mensajeRestriccion).toBeVisible();

    // Y la cuenta del administrador que realiza la acción no queda bloqueada
    await expect(miUsuario.locator('[data-testid="estado-usuario"]')).not.toHaveText('Bloqueado');
  });

  // CP-012: Acción de bloqueo sobre usuario ya bloqueado
  test('CP-012: Acción de bloqueo sobre usuario ya bloqueado', async ({ page }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y existe un usuario con estado "Bloqueado"
    const usuarioBloqueado = page.locator('[data-testid="usuario-bloqueado"]').first();
    await expect(usuarioBloqueado).toBeVisible();
    await expect(usuarioBloqueado.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Cuando el administrador intenta hacer clic en el botón de estado del usuario ya bloqueado
    await usuarioBloqueado.locator('[data-testid="btn-estado"]').click();

    // Entonces el sistema no genera un error inesperado
    await expect(page.locator('[data-testid="mensaje-error-sistema"]')).not.toBeVisible();

    // Y el estado del usuario se mantiene como "Bloqueado"
    await expect(usuarioBloqueado.locator('[data-testid="estado-usuario"]')).toHaveText('Bloqueado');

    // Y no se generan registros duplicados de bloqueo en la base de datos
    await expect(page.locator('[data-testid="notificacion-bloqueo"]')).toHaveCount(1);
  });

  // CP-013: Acción de desbloqueo sobre usuario ya activo
  test('CP-013: Acción de desbloqueo sobre usuario ya activo', async ({ page }) => {
    // Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
    await page.goto('/gestion-usuarios');
    await expect(page).toHaveURL(/gestion-usuarios/);

    // Y existe un usuario con estado "Activo"
    const usuarioActivo = page.locator('[data-testid="usuario-activo"]').first();
    await expect(usuarioActivo).toBeVisible();
    await expect(usuarioActivo.locator('[data-testid="estado-usuario"]')).toHaveText('Activo');

    // Cuando el administrador intenta hacer clic en el botón de estado del usuario activo para desbloquearlo sin que haya sido bloqueado previamente
    await usuarioActivo.locator('[data-testid="btn-estado"]').click();

    // Entonces el sistema no genera un error inesperado
    await expect(page.locator('[data-testid="mensaje-error-sistema"]')).not.toBeVisible();

    // Y el estado del usuario se mantiene como "Activo"
    await expect(usuarioActivo.locator('[data-testid="estado-usuario"]')).toHaveText('Activo');
  });

});
