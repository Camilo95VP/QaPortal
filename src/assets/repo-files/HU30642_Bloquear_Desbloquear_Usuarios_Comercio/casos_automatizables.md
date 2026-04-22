# HU30642 - Gestión de usuarios - Bloquear o Desbloquear Usuarios del Comercio - Portal Kuara
## Casos de Prueba Automatizables

## Resumen de Casos por Categoría

| Categoría   | Cantidad |
|-------------|----------|
| Happy Path  | 7        |
| Full Error  | 3        |
| Casos Borde | 3        |
| **Total**   | **13**   |

## Tabla de Precondiciones

| # | Precondición |
|---|-------------|
| 1 | El usuario que ejecuta la acción debe tener perfil de **Administrador del comercio** |
| 2 | Debe existir al menos un usuario de tipo cajero, consulta y/o administrador registrado en el comercio |
| 3 | El administrador debe estar autenticado en el Portal Kuara |
| 4 | La pantalla de gestión de usuarios debe estar disponible y cargada correctamente |
| 5 | Se tiene acceso a la base de datos para validaciones de integración |

---

## Happy Path

### CP-001: Bloquear usuario cajero exitosamente

**Escenario:** El administrador bloquea a un usuario con rol cajero desde la pantalla de gestión de usuarios

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y existe un usuario cajero con estado activo
Cuando el administrador hace clic en el botón de estado del usuario cajero para bloquearlo
Entonces el estado del usuario cajero cambia a "Bloqueado"
Y el sistema confirma visualmente el cambio de estado en la lista de usuarios
Y el usuario cajero queda sin acceso al Portal Kuara

---

### CP-002: Bloquear usuario de consulta exitosamente

**Escenario:** El administrador bloquea a un usuario con rol de consulta desde la pantalla de gestión de usuarios

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y existe un usuario de consulta con estado activo
Cuando el administrador hace clic en el botón de estado del usuario de consulta para bloquearlo
Entonces el estado del usuario de consulta cambia a "Bloqueado"
Y el sistema confirma visualmente el cambio de estado en la lista de usuarios
Y el usuario de consulta queda sin acceso al Portal Kuara

---

### CP-003: Bloquear usuario administrador exitosamente

**Escenario:** Un administrador bloquea a otro usuario con rol administrador desde la pantalla de gestión de usuarios

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y existe otro usuario administrador con estado activo
Cuando el administrador hace clic en el botón de estado del usuario administrador para bloquearlo
Entonces el estado del usuario administrador bloqueado cambia a "Bloqueado"
Y el sistema confirma visualmente el cambio de estado
Y el usuario administrador bloqueado queda sin acceso al Portal Kuara

---

### CP-004: Desbloquear usuario previamente bloqueado

**Escenario:** El administrador reactiva el acceso de un usuario que se encontraba bloqueado

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y existe un usuario con estado "Bloqueado"
Cuando el administrador hace clic en el botón de estado del usuario bloqueado para desbloquearlo
Entonces el estado del usuario cambia a "Activo"
Y el sistema confirma visualmente el cambio de estado
Y el usuario puede volver a iniciar sesión en el Portal Kuara

---

### CP-005: Acceso denegado al usuario bloqueado con mensaje correcto

**Escenario:** Un usuario bloqueado intenta iniciar sesión y el sistema muestra el mensaje correspondiente

Dado que existe un usuario con estado "Bloqueado" en el sistema
Cuando el usuario bloqueado intenta iniciar sesión en el Portal Kuara con sus credenciales válidas
Entonces el sistema no permite el ingreso
Y muestra el mensaje "Usuario bloqueado"

---

### CP-006: Cierre automático de sesión activa al bloquear usuario

**Escenario:** El sistema termina la sesión del usuario en tiempo real cuando el administrador lo bloquea mientras tiene sesión activa

Dado que un usuario tiene una sesión activa en el Portal Kuara
Y el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Cuando el administrador hace clic en el botón de estado del usuario activo para bloquearlo
Entonces la sesión activa del usuario bloqueado se termina automáticamente
Y si el usuario intenta realizar una acción en el portal es redirigido a la pantalla de inicio de sesión
Y el sistema muestra el mensaje "Usuario bloqueado" al intentar ingresar nuevamente

---

### CP-007: Usuario bloqueado puede ser eliminado

**Escenario:** El administrador puede eliminar un usuario que se encuentra en estado bloqueado

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y existe un usuario con estado "Bloqueado"
Cuando el administrador selecciona la opción de eliminar al usuario bloqueado
Entonces el sistema permite completar la eliminación del usuario
Y el usuario eliminado ya no aparece en la lista de usuarios del comercio

---

## Full Error

### CP-008: Mensaje exacto al intentar iniciar sesión con usuario bloqueado

**Escenario:** Validar que el mensaje de error mostrado al usuario bloqueado corresponde exactamente al definido por el sistema

Dado que existe un usuario con estado "Bloqueado" en el sistema
Cuando el usuario bloqueado ingresa sus credenciales válidas en la pantalla de inicio de sesión del Portal Kuara
Y hace clic en el botón de ingresar
Entonces el sistema no permite el acceso
Y muestra exactamente el mensaje "Usuario bloqueado"
Y el usuario permanece en la pantalla de inicio de sesión

---

### CP-009: Verificar registro de estado bloqueado en base de datos

**Escenario:** Confirmar que el estado del usuario se actualiza correctamente en la base de datos tras la acción de bloqueo

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y existe un usuario con estado activo
Cuando el administrador hace clic en el botón de estado para bloquear al usuario
Entonces en la base de datos el registro del usuario refleja el estado "BLOQUEADO"
Y la fecha y hora del bloqueo quedan registradas en el campo correspondiente
Y el campo de estado del usuario en la base de datos corresponde al valor bloqueado

---

### CP-010: Verificar invalidación de sesión en base de datos al bloquear usuario activo

**Escenario:** Confirmar que el token o sesión activa del usuario se invalida en base de datos al ser bloqueado

Dado que un usuario tiene una sesión activa registrada en la base de datos del Portal Kuara
Cuando el administrador bloquea al usuario desde la pantalla de gestión de usuarios
Entonces la sesión del usuario queda invalidada en la base de datos
Y el token de sesión activo del usuario es eliminado o marcado como inválido

---

## Casos Borde

### CP-011: Administrador intenta bloquear su propia cuenta

**Escenario:** Validar el comportamiento del sistema cuando un administrador intenta bloquear su propio usuario

> **Supuesto:** Se asume que el sistema debe restringir o alertar al administrador al intentar bloquearse a sí mismo para evitar dejar el comercio sin administrador activo.

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y su propio usuario aparece en la lista de usuarios
Cuando el administrador hace clic en el botón de estado de su propia cuenta para bloquearse
Entonces el sistema muestra un mensaje de advertencia o restricción
Y la cuenta del administrador que realiza la acción no queda bloqueada

---

### CP-012: Acción de bloqueo sobre usuario ya bloqueado

**Escenario:** Validar el comportamiento del sistema al intentar bloquear un usuario que ya se encuentra bloqueado

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y existe un usuario con estado "Bloqueado"
Cuando el administrador intenta hacer clic en el botón de estado del usuario ya bloqueado
Entonces el sistema no genera un error inesperado
Y el estado del usuario se mantiene como "Bloqueado"
Y no se generan registros duplicados de bloqueo en la base de datos

---

### CP-013: Acción de desbloqueo sobre usuario ya activo

**Escenario:** Validar el comportamiento del sistema al intentar desbloquear un usuario que ya se encuentra activo

Dado que el administrador se encuentra en la pantalla de gestión de usuarios del comercio
Y existe un usuario con estado "Activo"
Cuando el administrador intenta hacer clic en el botón de estado del usuario activo para desbloquearlo sin que haya sido bloqueado previamente
Entonces el sistema no genera un error inesperado
Y el estado del usuario se mantiene como "Activo"
