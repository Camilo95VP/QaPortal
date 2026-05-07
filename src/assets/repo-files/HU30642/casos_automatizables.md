### Resumen de casos
| Categoría | Cantidad |
|---|---:|
| Happy Path | 7 |
| Full Error | 5 |
| Casos Borde | 4 |

### Precondiciones
| # | Precondición |
|---|---|
| 1 | Usuario administrador del comercio autenticado en Portal Kuara |
| 2 | Pantalla de gestión de usuarios disponible con listado de usuarios del comercio |
| 3 | Existen usuarios con roles cajero, consulta y administrador registrados en el sistema |
| 4 | Servicio de autenticación y gestión de sesiones activo |
| 5 | Base de datos de usuarios accesible para validaciones |

### Supuestos
- El botón de estado funciona como un toggle (bloquear/desbloquear) visible en cada fila del listado de usuarios.
- El estado del usuario se persiste en base de datos con un campo que indica si está bloqueado o activo.
- La terminación de sesión activa se realiza de forma inmediata al momento del bloqueo.

---

### Happy Path

Escenario-001: Bloquear usuario cajero exitosamente
Escenario: Un administrador bloquea a un usuario con rol cajero desde el listado de usuarios

Dado que el administrador del comercio está en la pantalla de gestión de usuarios
Y existe un usuario con rol "cajero" en estado activo
Cuando hace clic en el botón de estado del usuario cajero
Entonces el estado del usuario cambia a "bloqueado"
Y se valida en base de datos que el campo de estado del usuario cajero es "bloqueado"

Escenario-002: Bloquear usuario de consulta exitosamente
Escenario: Un administrador bloquea a un usuario con rol consulta desde el listado de usuarios

Dado que el administrador del comercio está en la pantalla de gestión de usuarios
Y existe un usuario con rol "consulta" en estado activo
Cuando hace clic en el botón de estado del usuario de consulta
Entonces el estado del usuario cambia a "bloqueado"
Y se valida en base de datos que el campo de estado del usuario de consulta es "bloqueado"

Escenario-003: Bloquear otro usuario administrador exitosamente
Escenario: Un administrador bloquea a otro usuario con rol administrador

Dado que el administrador del comercio está en la pantalla de gestión de usuarios
Y existe otro usuario con rol "administrador" en estado activo
Cuando hace clic en el botón de estado del otro usuario administrador
Entonces el estado del usuario administrador objetivo cambia a "bloqueado"
Y se valida en base de datos que el campo de estado del usuario administrador es "bloqueado"

Escenario-004: Desbloquear usuario exitosamente
Escenario: Un administrador desbloquea a un usuario previamente bloqueado

Dado que el administrador del comercio está en la pantalla de gestión de usuarios
Y existe un usuario en estado "bloqueado"
Cuando hace clic en el botón de estado del usuario bloqueado
Entonces el estado del usuario cambia a "activo"
Y se valida en base de datos que el campo de estado del usuario es "activo"

Escenario-005: Usuario desbloqueado puede iniciar sesión nuevamente
Escenario: Verificar que un usuario desbloqueado recupera el acceso al portal

Dado que un usuario fue bloqueado previamente
Y el administrador desbloquea al usuario desde la pantalla de gestión de usuarios
Cuando el usuario desbloqueado intenta iniciar sesión en Portal Kuara con credenciales válidas
Entonces el inicio de sesión es exitoso
Y el usuario accede al portal correctamente

Escenario-006: Eliminar usuario bloqueado exitosamente
Escenario: Verificar que un usuario bloqueado puede ser eliminado del sistema

Dado que el administrador del comercio está en la pantalla de gestión de usuarios
Y existe un usuario en estado "bloqueado"
Cuando el administrador realiza la acción de eliminar al usuario bloqueado
Entonces el usuario es eliminado del sistema
Y se valida en base de datos que el registro del usuario ya no existe

Escenario-007: Sesión activa se termina al bloquear usuario
Escenario: Al bloquear un usuario con sesión activa, la sesión se cierra automáticamente

Dado que existe un usuario con sesión activa en Portal Kuara
Y el administrador del comercio está en la pantalla de gestión de usuarios
Cuando el administrador hace clic en el botón de estado para bloquear al usuario con sesión activa
Entonces el estado del usuario cambia a "bloqueado"
Y la sesión activa del usuario se termina automáticamente
Y se valida en base de datos que la sesión del usuario fue invalidada

---

### Full Error

Escenario-008: Usuario bloqueado intenta iniciar sesión
Escenario: Un usuario bloqueado intenta acceder al portal y recibe mensaje de error

Dado que un usuario del comercio se encuentra en estado "bloqueado"
Cuando el usuario intenta iniciar sesión en Portal Kuara con sus credenciales
Entonces se muestra el mensaje de error: "Usuario bloqueado"
Y no se permite el acceso al portal

Escenario-009: Usuario bloqueado intenta iniciar sesión con credenciales correctas
Escenario: Verificar que incluso con credenciales correctas el acceso es denegado por bloqueo

Dado que un usuario del comercio se encuentra en estado "bloqueado"
Y las credenciales del usuario son válidas
Cuando el usuario intenta iniciar sesión en Portal Kuara
Entonces se muestra el mensaje de error: "Usuario bloqueado"
Y el sistema no genera token de sesión para el usuario

Escenario-010: Verificar que el usuario bloqueado no genera sesión en base de datos
Escenario: Validar a nivel de BD que no se crea registro de sesión para usuarios bloqueados

Dado que un usuario del comercio se encuentra en estado "bloqueado"
Cuando el usuario intenta iniciar sesión en Portal Kuara
Entonces se muestra el mensaje de error: "Usuario bloqueado"
Y se valida en base de datos que no se creó un registro de sesión para ese usuario

Escenario-011: Bloquear usuario y verificar que no puede realizar operaciones
Escenario: Después de bloquear un usuario con sesión activa, se impide continuar operando

Dado que existe un usuario con sesión activa realizando operaciones en Portal Kuara
Cuando el administrador bloquea al usuario desde la pantalla de gestión de usuarios
Entonces la sesión del usuario se cierra automáticamente
Y cualquier operación en curso del usuario es interrumpida
Y el usuario es redirigido a la pantalla de inicio de sesión

Escenario-012: Intentar acceso a rutas protegidas con usuario bloqueado
Escenario: Verificar que un usuario bloqueado no puede acceder directamente a rutas del portal

Dado que un usuario del comercio se encuentra en estado "bloqueado"
Cuando intenta acceder directamente a una ruta protegida del portal mediante URL
Entonces el sistema redirige al usuario a la pantalla de inicio de sesión
Y se muestra el mensaje de error: "Usuario bloqueado"

---

### Casos Borde

Escenario-013: Bloquear y desbloquear usuario en secuencia rápida
Escenario: Verificar la consistencia del estado al alternar bloqueo y desbloqueo rápidamente

Dado que el administrador del comercio está en la pantalla de gestión de usuarios
Y existe un usuario en estado activo
Cuando el administrador hace clic en el botón de estado para bloquear al usuario
Y inmediatamente después hace clic nuevamente para desbloquear al usuario
Entonces el estado final del usuario es "activo"
Y se valida en base de datos que el estado del usuario es consistente con la última acción

Escenario-014: Bloquear usuario que ya se encuentra bloqueado
Escenario: Verificar el comportamiento del botón de estado cuando el usuario ya está bloqueado

Dado que el administrador del comercio está en la pantalla de gestión de usuarios
Y existe un usuario en estado "bloqueado"
Cuando el administrador visualiza el botón de estado del usuario bloqueado
Entonces el botón refleja el estado "bloqueado"
Y la única acción disponible es desbloquear al usuario

Escenario-015: Administrador bloquea a otro administrador y el bloqueado tenía sesión activa
Escenario: Un administrador bloquea a otro administrador que tiene sesión activa en el portal

Dado que existen dos usuarios con rol "administrador" en el comercio
Y el segundo administrador tiene una sesión activa en Portal Kuara
Cuando el primer administrador bloquea al segundo administrador desde la pantalla de gestión de usuarios
Entonces el estado del segundo administrador cambia a "bloqueado"
Y la sesión activa del segundo administrador se termina automáticamente
Y se valida en base de datos que el segundo administrador está bloqueado y sin sesión activa

Escenario-016: Verificar persistencia del bloqueo después de reiniciar el sistema
Escenario: Un usuario bloqueado sigue bloqueado tras un reinicio del servicio

Dado que un usuario fue bloqueado por el administrador del comercio
Cuando el servicio del portal se reinicia
Y el usuario intenta iniciar sesión
Entonces se muestra el mensaje de error: "Usuario bloqueado"
Y se valida en base de datos que el estado del usuario sigue siendo "bloqueado"
