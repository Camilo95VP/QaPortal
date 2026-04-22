### Resumen de casos
| Categoría | Cantidad |
|---|---:|
| Happy Path | 4 |
| Full Error | 0 |
| Casos Borde | 0 |

### Precondiciones
- Usuario administrador autenticado en Portal Kuara.
- Pantalla de gestión de usuarios (HU30627) disponible.
- Servicio de creación de usuarios y cola de credenciales accesibles.


### Happy Path

CP-M01: Ingreso de caracteres especiales y tilde durante escritura
Escenario: El campo Nombre y apellido omite caracteres especiales en tiempo real

Dado que el administrador escribe caracteres especiales (p. ej. @#$%ñáé)
Cuando se detecta cada carácter especial mientras se escribe
Entonces esos caracteres son omitidos y no aparecen en el campo

CP-M02: Boton de guardar deshabilitado mientras carga la creacion del usuario
Escenario: El boton guardar deshabilitado porsterior al darle clcik en guardar

Dado que el administrador de comercios está en la pantalla de creación de usuarios
Y llena todos los campos obligatorios correctamente
Y le da click al boton guardar de la pantalla de creacion de usaurios
Cuando se muestra el modal para confirmar nuevamente
Y en el modal de confirmacion da click en el boton Guardar 
Entonces el boton Guardar se deshabilita mientras se procesa la solicitud

CP-M03: Crear usuario cajero con datos válidos con validacion en la cola credentials-queue
Escenario: Crear un usuario con rol "cajero" y un alias seleccionado

Dado que el administrador de comercios está en la pantalla de creación de usuarios
Cuando ingresa un Nombre y apellido válido (entre 1 y 255 caracteres, sin caracteres especiales, primer carácter distinto de espacio)
Y ingresa un Correo electrónico con formato válido
Y selecciona Rol = cajero
Y selecciona al menos un Alias
Y hace clic en Guardar
Entonces se crea el usuario cajero
Y se valida la publicacion del evento en la cola credentials-queue

CP-M04: Crear usuario consulta con datos válidos con validacion en la cola credentials-queue
Escenario: Crear un usuario con rol "consulta" y varios alias seleccionados

Dado que el administrador de comercios está en la pantalla de creación de usuarios
Cuando ingresa un Nombre y apellido válido (entre 1 y 255 caracteres, sin caracteres especiales, primer carácter distinto de espacio)
Y ingresa un Correo electrónico con formato válido
Y selecciona Rol = consulta
Y selecciona al menos un Alias
Y hace clic en Guardar
Entonces se crea el usuario consulta
Y se valida la publicacion del evento en la cola credentials-queue
