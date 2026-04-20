# HU30633 - Gestión de usuarios - eliminar usuarios del comercio

Resumen de casos por categoría:

| Categoría | Cantidad |
|---|---:|
| Happy Path | 2 |
| Full Error | 1 |
| Casos Borde | 1 |

Tabla de precondiciones:

| Precondición | Detalle |
|---|---|
| Rol administrador válido | Usuario A con permisos de administrador y sesión activa |
| Usuario objetivo | Usuario B (administrador) existente en el comercio |
| Conectividad | API/BD accesible para validar estado y auditoría |
| Interfaz | Pantalla de gestión de usuarios desplegada y responsive |

### Happy Path

CP-001: Eliminar otro administrador
Escenario: Administrador A elimina al Administrador B exitosamente

Dado que Administrador A está autenticado en la pantalla de gestión de usuarios y Administrador B aparece en el listado
Cuando Administrador A pulsa el botón "Eliminar" sobre Administrador B y confirma en el modal con el mensaje "Estás seguro que deseas eliminar este usuario"
Entonces Se realiza la eliminación lógica del usuario B
Y Las credenciales de acceso del usuario B quedan inhabilitadas inmediatamente
Y El historial de acciones asociadas a B se mantiene en la base de datos
Y Si la sesión de B estaba activa en el momento, esa sesión queda terminada automáticamente

CP-002: Confirmación - Cancelar redirige a gestión (UX funcional)
Escenario: Administrador abre modal de eliminación y cancela

Dado que Administrador A está en la pantalla de gestión de usuarios
Cuando Administrador A pulsa "Eliminar" y en el modal pulsa "Cancelar"
Entonces La aplicación cierra el modal y redirecciona / retorna a la pantalla de gestión de usuarios (User Story 30627)

### Full Error

CP-003: Intento de login por usuario eliminado
Escenario: Usuario eliminado intenta autenticarse

Dado que Usuario B fue eliminado lógicamente y sus credenciales inhabilitadas
Cuando Usuario B intenta iniciar sesión con credenciales previas
Entonces El sistema rechaza el login mostrando el mensaje genérico "Credenciales incorrectas"
Y No se revela información adicional sobre el estado de la cuenta

### Casos Borde

CP-004: El usuario administrador actual no aparece en el listado
Escenario: El administrador autenticado no debe verse en su propio listado

Dado que Administrador A está autenticado en la pantalla de gestión de usuarios
Cuando la lista de usuarios es la mostrada al administrador
Entonces El registro correspondiente a Administrador A no aparece en la lista (no es posible eliminarse a sí mismo)

---

Notas de implementación/validación técnica:
- Incluir validaciones de BD para comprobar que `user.status = 'deleted'` (o flag equivalente) y que las tablas de auditoría mantienen registros previos.
- Validar la terminación de sesión activa mediante verificación de tokens/sesiones en el store de sesiones.
- Mensaje exacto de rechazo de login: "Credenciales incorrectas".
- Selectores recomendados: atributos `data-testid` en filas de usuario (`data-testid="user-row-{id}"`), botones `data-testid="btn-delete-{id}"`, modal `data-testid="confirm-delete-modal"`.
