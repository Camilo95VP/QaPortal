# HU30628 - Crear Usuarios del Comercio — Casos Automatizables (Gherkin)

Resumen de casos:
| Categoría      | Cantidad |
| -------------- | -------- |
| Happy Path     | 1        |
| Full Error     | 4        |
| Casos Borde    | 4        |

Precondiciones:
- Administrador autenticado en Portal Kuara.
- Servicio de usuarios y cola de credenciales disponibles.
- UI responsive y accesible.

### Happy Path

CP-001: Crear usuario válido y publicar credenciales
Escenario: Crear usuario cajero con alias y publicar en la cola de credenciales
Dado que el administrador está en la pantalla de creación de usuarios
Cuando ingresa "Nombre y apellido" = "Ana Torres"
Y ingresa "Correo electrónico" = "ana.torres@example.com"
Y selecciona "Rol" = "Cajero"
Y selecciona al menos un "Alias"
Y hace clic en "Guardar"
Entonces se muestra el modal con el mensaje "¿Estás seguro que deseas guardar este usuario?"
Cuando confirma en el modal con "Guardar"
Entonces el sistema crea el usuario, envía la publicación a la cola de generación de credenciales
Y muestra mensaje de éxito y redirige a la pantalla de gestión de usuarios con la ficha actualizada

### Full Error (Validaciones y fallos)

CP-002: Nombre inválido — primer carácter espacio
Escenario: El primer carácter del nombre no puede ser espacio
Dado que el administrador abre el formulario de creación
Cuando ingresa " Nombre" en "Nombre y apellido"
Y pierde el foco del campo
Entonces se muestra el mensaje de error "El primer carácter no puede ser un espacio"
Y el botón "Guardar" permanece deshabilitado

CP-003: Nombre con caracteres especiales o tildes (caracteres no permitidos)
Escenario: Omisión de caracteres especiales en tiempo real
Dado el administrador escribe en "Nombre y apellido"
Cuando digita caracteres especiales o tildes
Entonces el sistema los omite y no los deja aparecer en el campo

CP-004: Correo con formato inválido
Escenario: Validación de correo con Enabler 27971
Dado el administrador ingresa un correo con formato inválido
Cuando pierde el foco del campo correo
Entonces se muestra el mensaje "Formato de correo electrónico invalido"
Y el botón "Guardar" permanece deshabilitado

CP-005: Campo rol o alias vacío
Escenario: Campos obligatorios vacíos
Dado que uno de los campos "Rol" o "Alias" está vacío
Cuando el administrador intenta habilitar "Guardar"
Entonces el botón se mantiene deshabilitado

### Casos Borde

CP-006: Nombre con longitud máxima y mínima
Escenario: Validar límites de longitud (1..255)
Dado que ingresa un nombre de 255 caracteres
Cuando pierde el foco
Entonces no se muestra error y el campo es válido
Y si ingresa 0 caracteres (vacío) se muestra error de obligatorio

CP-007: Intento de crear usuario con correo ya registrado
Escenario: Detección de duplicado en backend
Dado que el correo ya existe en la BD
Cuando el administrador confirma creación
Entonces el backend retorna 409 y la UI muestra "Correo ya registrado"

CP-008: Fallo en publicación de cola de credenciales
Escenario: Creación exitosa pero falla la publicación en la cola
Dado que la creación de usuario es exitosa pero la cola no responde
Cuando se intenta publicar en la cola
Entonces la UI muestra un error transaccional y sugiere reintento
Y se registra auditoría del intento fallido

CP-009: Intento de doble envío
Escenario: Evitar doble clic en Guardar
Dado que el administrador hace clic en "Guardar" repetidamente
Cuando la petición está en curso
Entonces el botón "Guardar" queda deshabilitado hasta respuesta

Notas de integración:
- Validar en BD la creación del usuario y la entrada en la cola de credenciales (identificador de correlación).
- Registrar auditoría con: usuario actor, timestamp, datos previos (si aplica), resultado.