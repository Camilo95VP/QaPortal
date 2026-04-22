### Resumen de casos
| Categoría | Cantidad |
|---|---:|
| Happy Path | 2 |
| Full Error | 5 |
| Casos Borde | 3 |

### Precondiciones
- Usuario administrador autenticado en Portal Kuara.
- Pantalla de gestión de usuarios (HU30627) disponible.
- Servicio de creación de usuarios y cola de credenciales accesibles.

### Happy Path

CP-001: Crear usuario cajero con datos válidos
Escenario: Crear un usuario con rol "cajero" y un alias seleccionado

Dado que el administrador de comercios está en la pantalla de creación de usuarios
Cuando ingresa un Nombre y apellido válido (entre 1 y 255 caracteres, sin caracteres especiales, primer carácter distinto de espacio)
Y ingresa un Correo electrónico con formato válido
Y selecciona Rol = cajero
Y selecciona al menos un Alias
Y hace clic en Guardar
Entonces se muestra modal de confirmación con mensaje: ¿Estás seguro que deseas guardar este usuario?
Y al confirmar, se muestra un modal indicando "Usuario creado con exito"
Y se valida en base de datos el usuario creado

CP-002: Crear usuario consulta con datos válidos
Escenario: Crear un usuario con rol "consulta" y varios alias seleccionados

Dado que el administrador de comercios está en la pantalla de creación de usuarios
Cuando ingresa un Nombre y apellido válido (entre 1 y 255 caracteres, sin caracteres especiales, primer carácter distinto de espacio)
Y ingresa un Correo electrónico con formato válido
Y selecciona Rol = consulta
Y selecciona varios Alias
Y hace clic en Guardar
Entonces se muestra modal de confirmación con mensaje: ¿Estás seguro que deseas guardar este usuario?
Y al confirmar, se muestra un modal indicando "Usuario creado con exito"
Y se valida en base de datos el usuario creado

### Full Error

CP-003: Nombre vacío al perder foco
Escenario: El campo Nombre y apellido queda vacío y pierde foco

Dado que el administrador de comercios está en la pantalla de creación de usuarios
Cuando el campo de Nombre y apellido se deja vacio
Y el campo pierde el foco(click afuera)
Entonces se muestra el mensaje de error: 0/255 caracteres

CP-004: Primer carácter espacio en blanco
Escenario: Ingresar un espacio como primer carácter

Dado que el administrador intenta ingresar un Nombre que comienza con espacio
Cuando escribe un espacio como primer carácter
Entonces la aplicación no permite el espacio inicial y muestra el mensaje: El primer carácter no puede ser un espacio en blanco

CP-005: Correo con formato inválido
Escenario: Ingresar correo inválido

Dado que el administrador de comercios está en la pantalla de creación de usuarios 
Cuando ingresa un correo con formato inválido
Entonces se muestra el mensaje de error: Formato de correo electrónico invalido

CP-006: Boton Guardar deshabilitado si faltan campos obligatorios
Escenario: Intentar habilitar Boton Guardar sin completar todos campos los obligatorios

Dado que falta información en alguno de los campos: Nombre y apellido, Correo electrónico, Rol o Alias
Cuando se comprueba el estado del botón Guardar
Entonces el botón permanece deshabilitado

CP-007: Boton Cancelar redirige a pantalla de Gestion de usuarios
Escenario: Validar que el boton cancelar redireccione a la pantalla de Gestion de usuarios

Dado que el administrador de comercios está en la pantalla de creación de usuarios
Cuando da click en el boton cancelar 
Entonces se redirecciona a la pantalla de Gestion de usuarios

### Casos Borde

CP-008: Validación de longitudes mínimas y máximas
Escenario: Nombre con 1 caracter

Dado que el administrador ingresa un Nombre con exactamente 1 carácter
Cuando pierde el foco
Entonces se acepta y no muestra error

CP-009: Validación de longitudes mínimas y máximas
Escenario: Nombre con 255 caracteres

Dado que el administrador ingresa un Nombre con exactamente 255 caracteres
Cuando pierde el foco
Entonces se acepta y no muestra error

CP-010: Validación de longitudes mínimas y máximas
Escenario: Nombre con mas de 255 caracteres 

Dado que el administrador ingresa un Nombre con exactamente 255 caracteres
Cuando pierde el foco
Entonces se muestra mensaje de error 255/255 caracteres
