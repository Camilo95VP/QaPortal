### Resumen de casos
| Categoría | Cantidad |
|---|---:|
| Happy Path | 12 |
| Full Error | 0 |
| Casos Borde | 0 |

### Precondiciones
- Pantallas de las sigueintes HU disponubles para redirección: User Story 30627, User Story 29893


### Happy Path


CP-01: Validar visualización en resolución de escritorio (Desktop)
Escenario: Verifica que la pantalla de configuración del comercio se visualice correctamente en una resolución de escritorio.
Dado que el usuario accede a la pantalla de configuración del comercio
Cuando visualiza la pantalla en una resolución de escritorio (ej. 1920x1080)
Entonces todos los elementos de la pantalla, incluyendo los botones, se muestran correctamente distribuidos, sin solaparse ni cortarse.


CP-02: Validar adaptación a resolución de tablet
Escenario: Verifica que la pantalla de configuración del comercio se adapte correctamente a una resolución de tablet.
Dado que el usuario accede a la pantalla de configuración del comercio
Cuando visualiza la pantalla en una resolución de tablet (ej. 768x1024)
Entonces los elementos de la pantalla se reorganizan para el formato del dispositivo, y se muestran de forma clara y accesible.


CP-03: Validar adaptación a resolución de dispositivo móvil
Escenario: Verifica que la pantalla de configuración del comercio se adapte correctamente a una resolución de dispositivo móvil.
Dado que el usuario accede a la pantalla de configuración del comercio
Cuando visualiza la pantalla en una resolución de dispositivo móvil (ej. 375x667)
Entonces los elementos se apilan verticalmente o se adaptan al espacio reducido, garantizando que todo el contenido sea legible y los botones sean fáciles de presionar.


CP-04: Validar la visibilidad y texto de todos los botones
Escenario: Verifica que todos los botones requeridos sean visibles en la pantalla y muestren el texto correcto.
Dado que el usuario se encuentra en la pantalla de configuración del comercio
Cuando observa la interfaz de la pantalla
Entonces los botones "Perfil de usuario", "Perfil del comercio", "Gestión de usuarios", "Cambiar contraseña" y "Reenvío de credenciales" son visibles y muestran el texto correcto.



CP-05: Validar diseño del botón "Perfil de usuario" según Figma
Escenario: Verifica que el diseño del botón "Perfil de usuario" coincida con las especificaciones de Figma.
Dado que el usuario se encuentra en la pantalla de configuración del comercio
Cuando inspecciona visualmente el botón "Perfil de usuario"
Entonces su diseño, color, tipografía e iconografía coinciden con las especificaciones del diseño en Figma.

CP-06: Validar diseño del botón "Perfil del comercio" según Figma
Escenario: Verifica que el diseño del botón "Perfil del comercio" coincida con las especificaciones de Figma.
Dado que el usuario se encuentra en la pantalla de configuración del comercio
Cuando inspecciona visualmente el botón "Perfil del comercio"
Entonces su diseño, color, tipografía e iconografía coinciden con las especificaciones del diseño en Figma.


CP-07: Validar diseño del botón "Gestión de usuarios" según Figma
Escenario: Verifica que el diseño del botón "Gestión de usuarios" coincida con las especificaciones de Figma.
Dado que el usuario se encuentra en la pantalla de configuración del comercio
Cuando inspecciona visualmente el botón "Gestión de usuarios"
Entonces su diseño, color, tipografía e iconografía coinciden con las especificaciones del diseño en Figma.


CP-08: Validar diseño del botón "Cambiar contraseña" según Figma
Escenario: Verifica que el diseño del botón "Cambiar contraseña" coincida con las especificaciones de Figma.
Dado que el usuario se encuentra en la pantalla de configuración del comercio
Cuando inspecciona visualmente el botón "Cambiar contraseña"
Entonces su diseño, color, tipografía e iconografía coinciden con las especificaciones del diseño en Figma.


CP-09: Validar diseño del botón "Reenvío de credenciales" según Figma
Escenario: Verifica que el diseño del botón "Reenvío de credenciales" coincida con las especificaciones de Figma.
Dado que el usuario se encuentra en la pantalla de configuración del comercio
Cuando inspecciona visualmente el botón "Reenvío de credenciales"
Entonces su diseño, color, tipografía e iconografía coinciden con las especificaciones del diseño en Figma.


CP-10: Validar la redirección del botón "Perfil del comercio"
Escenario: Verifica que al hacer clic en el botón "Perfil del comercio", el sistema redirija al usuario a la pantalla de detalle de información del comercio.
Dado que el usuario está en la pantalla de configuración del comercio
Cuando hace clic en el botón "Perfil del comercio"
Entonces es redirigido correctamente a la pantalla de detalle de información del comercio (correspondiente a la User Story 29893).

CP-11: Validar la redirección del botón "Gestión de usuarios"
Escenario: Verifica que al hacer clic en el botón "Gestión de usuarios", el sistema redirija al usuario a la pantalla de gestión de usuarios.
Dado que el usuario está en la pantalla de configuración del comercio
Cuando hace clic en el botón "Gestión de usuarios"
Entonces es redirigido correctamente a la pantalla de gestión de usuarios (correspondiente a la User Story 30627).


CP-12: Verificar que los botones sin funcionalidad definida no ejecutan ninguna acción
Escenario: Confirma que los botones cuya funcionalidad está fuera de alcance no producen ninguna acción de navegación o cambio visible al ser presionados.
Dado que el usuario está en la pantalla de configuración del comercio
Cuando hace clic en el botón "Perfil de usuario"
Entonces no ocurre ninguna acción de navegación o cambio visible en la pantalla.
Y cuando hace clic en el botón "Cambiar contraseña"
Entonces no ocurre ninguna acción de navegación o cambio visible en la pantalla.
Y cuando hace clic en el botón "Reenvío de credenciales"
Entonces no ocurre ninguna acción de navegación o cambio visible en la pantalla.

