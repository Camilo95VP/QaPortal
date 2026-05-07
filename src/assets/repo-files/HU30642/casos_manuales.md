### Resumen de casos
| Categoría | Cantidad |
|---|---:|
| Happy Path | 3 |
| Full Error | 0 |
| Casos Borde | 0 |

### Precondiciones
| # | Precondición |
|---|---|
| 1 | Usuario administrador del comercio autenticado en Portal Kuara |
| 2 | Pantalla de gestión de usuarios disponible con listado de usuarios |
| 3 | Dispositivos físicos disponibles para pruebas responsive (móvil, tablet, desktop) |

---

### Happy Path

CP-M01: Bloquear usuario cajero desde la gestión de usuarios

Dado que el usuario administrador está autenticado en el Portal Kuara
Y existe un usuario cajero en estado activo en la lista de usuarios
Cuando hace clic en el botón de estado del usuario cajero
Entonces el estado del usuario cajero cambia a bloqueado
Y el botón de estado refleja visualmente el estado bloqueado
Y el cambio queda registrado en la base de datos

---

CP-M02: Bloquear usuario de consulta desde la gestión de usuarios

Dado que el usuario administrador está autenticado
Y existe un usuario de consulta en estado activo
Cuando hace clic en el botón de estado del usuario de consulta
Entonces el estado cambia a bloqueado
Y el botón refleja visualmente el estado bloqueado

---

CP-M03: Bloquear otro usuario administrador desde la gestión de usuarios

Dado que el usuario administrador está autenticado
Y existe otro usuario con rol administrador en estado activo
Cuando bloquea al usuario administrador objetivo
Entonces el estado del usuario objetivo cambia a bloqueado
Y el botón de estado refleja visualmente el bloqueo

---

CP-M04: Desbloquear usuario previamente bloqueado y restaurar acceso

Dado que el usuario administrador está autenticado
Y existe un usuario en estado bloqueado
Cuando hace clic en el botón de estado para desbloquearlo
Entonces el estado del usuario cambia a activo
Y el usuario desbloqueado puede iniciar sesión nuevamente

---

CP-M07: Eliminación de usuario bloqueado permitida

Dado que el usuario administrador está autenticado
Y existe un usuario en estado bloqueado
Cuando el administrador elimina el usuario bloqueado y confirma
Entonces el usuario eliminado ya no aparece en la lista de usuarios

---

### Full Error / Negativos

CP-M05: Mensaje "Usuario bloqueado" al intentar iniciar sesión

Dado que existe un usuario en estado bloqueado
Cuando el usuario bloqueado intenta iniciar sesión con credenciales válidas
Entonces el sistema no permite el ingreso
Y se muestra el mensaje "Usuario bloqueado"

---

CP-M06: Terminación automática de sesión activa al bloquear al usuario

Dado que el usuario administrador está autenticado
Y existe un usuario con una sesión activa
Cuando el administrador bloquea a ese usuario desde la gestión de usuarios
Entonces la sesión activa del usuario se termina automáticamente
Y el usuario es redirigido a la pantalla de inicio de sesión

---

CP-M08: Usuario cajero no puede bloquear a otros usuarios

Dado que un usuario cajero está autenticado
Cuando accede a la pantalla de gestión de usuarios
Entonces la opción de bloqueo/desbloqueo no está disponible o no puede ejecutarla

---

CP-M09: Usuario de consulta no puede bloquear a otros usuarios

Dado que un usuario de consulta está autenticado
Cuando accede a la pantalla de gestión de usuarios
Entonces la opción de bloqueo/desbloqueo no está disponible o no puede ejecutarla

---

CP-M10: Usuario bloqueado no puede iniciar sesión aunque sus credenciales sean válidas

Dado que existe un usuario en estado bloqueado con credenciales válidas
Cuando intenta iniciar sesión
Entonces el sistema rechaza el acceso
Y se muestra el mensaje "Usuario bloqueado"

---

CP-M11: El bloqueo del usuario persiste tras múltiples intentos de inicio de sesión

Dado que existe un usuario en estado bloqueado
Cuando realiza tres intentos consecutivos de inicio de sesión con credenciales correctas
Entonces todos los intentos son rechazados
Y el mensaje "Usuario bloqueado" se muestra en cada intento

---

### Casos Borde

CP-M12: Pantalla de gestión de usuarios responsive en dispositivo móvil

Dado que el administrador accede desde un dispositivo móvil
Cuando navega a la gestión de usuarios
Entonces la pantalla y los botones son visibles e interaccionables en móvil

---

CP-M13: Pantalla de gestión de usuarios responsive en tablet

Dado que el administrador accede desde una tablet
Cuando navega a la gestión de usuarios
Entonces la pantalla y los botones son visibles e interaccionables en tablet

---

CP-M14: Pantalla de gestión de usuarios responsive en desktop

Dado que el administrador accede desde desktop
Cuando navega a la gestión de usuarios
Entonces la pantalla y los botones son visibles e interaccionables en desktop

---

CP-M15: El botón de estado refleja visualmente el estado actual de cada usuario

Dado que existen usuarios en estado activo y bloqueado
Cuando el administrador visualiza la lista de usuarios
Entonces cada botón de estado muestra claramente si el usuario está activo o bloqueado

