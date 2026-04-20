# HU30629 - Eliminar Usuarios del Comercio — Casos Automatizables (Gherkin)

Resumen de casos:
| Categoría      | Cantidad |
| -------------- | -------- |
| Happy Path     | 1        |
| Full Error     | 4        |
| Casos Borde    | 4        |

Precondiciones:
- Administrador autenticado en Portal Kuara.
- Pantalla de gestión de usuarios accesible (User Story 30627).
- Servicio de sesión y API de usuarios disponibles.

### Happy Path

CP-001: Eliminación lógica de usuario por administrador
Escenario: Administrador elimina a otro administrador
Dado que el administrador A está autenticado en la pantalla de gestión de usuarios
Y existe el usuario B en la lista (no es la misma cuenta que A)
Cuando A hace clic en "Eliminar" sobre el usuario B
Entonces se muestra el modal con el mensaje "Estás seguro que deseas eliminar este usuario"
Cuando A confirma con "Eliminar"
Entonces el sistema marca a B como eliminado (eliminación lógica)
Y las credenciales de B quedan inhabilitadas inmediatamente
Y el historial de acciones de B se mantiene intacto y accesible para auditoría
Y si B tenía sesión activa, esta se finaliza en ese instante

### Full Error

CP-002: Intento de eliminarse a sí mismo no permitido
Escenario: El administrador no aparece en su propio listado para eliminarse
Dado que el administrador inicia sesión
Cuando visualiza la lista de usuarios
Entonces su propio usuario no debe mostrar opción "Eliminar"

CP-003: Error al deshabilitar credenciales (fallo de servicio)
Escenario: Eliminación lógica pero falla la inhabilitación de credenciales
Dado que la API de sesiones retorna error al invalidar credenciales
Cuando se confirma la eliminación
Entonces el sistema marca la eliminación lógica pero muestra notificación de error "Error al inhabilitar credenciales"
Y se registra auditoría con el resultado parcial

CP-004: Sesión activa del usuario eliminado se termina automáticamente
Escenario: Usuario B con sesión activa es eliminado
Dado que B tiene sesión activa
Cuando el administrador elimina a B
Entonces la sesión de B se invalida y B no puede acceder — al intentar login obtendrá "Credenciales incorrectas"

CP-005: Permiso insuficiente al intentar eliminar
Escenario: Usuario sin permiso intenta eliminar a otro
Dado que el actor no tiene rol con permiso de eliminación
Cuando intenta ejecutar la acción de eliminar
Entonces la UI/API responden 403 y se muestra "Permiso denegado"

### Casos Borde

CP-006: Eliminar usuario con historial extenso
Escenario: Verificar que el historial completo permanezca accesible y sin truncamiento tras la eliminación lógica
Dado que B tiene registros históricos voluminosos
Cuando B es eliminado
Entonces el historial sigue accesible y no se pierde información

CP-007: Eliminación con dependencias (referencias en otras entidades)
Escenario: Usuario referenciado por transacciones
Dado que existen referencias a B en otras entidades
Cuando se elimina a B
Entonces las referencias siguen apuntando a histórico y no se rompen (soft delete)

CP-008: Eliminación simultánea por dos administradores
Escenario: Race condition al eliminar el mismo usuario
Dado que dos administradores inician la acción de eliminar sobre B casi simultáneamente
Cuando ambas solicitudes llegan al backend
Entonces una se ejecuta y la otra recibe resultado idempotente (200 OK con estado ya eliminado)

Notas de integración:
- Registrar auditoría: actor, objetivo, timestamp, motivo, resultado.
- Garantizar que la validación de login verifique estado `activo=true` y devuelva "Credenciales incorrectas" si está eliminado.
- Si la sesión de B existía, llamar al servicio de sesión para invalidarla inmediatamente.
