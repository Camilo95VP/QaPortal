# HU30630 - Editar Usuarios del Comercio — Casos Automatizables (Gherkin)

## Características comunes
- Precondición: Usuario administrador autenticado en el Portal de Kuara.
- Ambientes: UI web responsive (desktop), backend disponible para persistencia y auditoría.

## Escenario: Happy Path — Editar usuario y guardar
Feature: Edición de usuario
  Scenario: Administrador edita nombre, correo, rol y alias, confirma y guarda
    Given el administrador está en la pantalla de gestión de usuarios
    And selecciona el usuario con identificador <USER_ID>
    When hace clic en "Editar"
    And modifica "Nombre y apellido" a "Juan Pérez"
    And modifica "Correo electrónico" a "juan.perez@example.com"
    And cambia "Rol" de "Cajero" a "Consulta"
    And añade un alias "alias_nuevo"
    And hace clic en "Guardar"
    Then se muestra el modal de confirmación con el mensaje "¿Estás seguro que deseas guardar este usuario?"
    When confirma en el modal con "Guardar"
    Then el sistema persiste los cambios y muestra la ficha del usuario actualizada
    And se registra una entrada de auditoría para el cambio de rol y los cambios de datos

## Escenario: Validaciones — Campos requeridos / Formato
Feature: Validaciones de edición
  Scenario Outline: Validaciones en correo y campos obligatorios
    Given el administrador abre el modal de edición
    When deja "Nombre y apellido" en "<nombre>"
    And deja "Correo electrónico" en "<correo>"
    And selecciona rol "<rol>"
    Then el botón "Guardar" está <estado>

    Examples:
      | nombre       | correo                 | rol     | estado         |
      | (vacío)      | juan@example.com       | Cajero  | deshabilitado  |
      | Juan Pérez   | (vacío)                | Cajero  | deshabilitado  |
      | Juan Pérez   | correo-invalid         | Cajero  | deshabilitado  |
      | Juan Pérez   | juan.perez@example.com | (vacío) | deshabilitado  |

## Escenario: Guardado concurrente / idempotencia
Feature: Guardado seguro
  Scenario: Evitar doble envío
    Given el administrador modifica datos válidos
    When hace clic en "Guardar" y la petición está en curso
    Then el botón "Guardar" queda deshabilitado hasta completar la petición
    And al completarse la petición, el sistema muestra confirmación y actualiza la pantalla

## Escenario: Cambio de rol — auditoría e historial
Feature: Cambio de rol
  Scenario: Cambiar rol y preservar historial
    Given el usuario tiene historial de acciones previas
    When el administrador cambia el rol del usuario
    Then el sistema actualiza el rol activo
    And registra un evento de auditoría con: usuario, rol anterior, rol nuevo, timestamp
    And el historial previo se mantiene intacto y accesible

## Casos borde
- Intentar eliminar el último alias cuando el sistema requiere al menos un alias → verificar mensaje de error y bloqueo.
- Rol inválido enviado por API → mostrar mensaje de error técnico traducido a usuario.
- Intentar editar mientras backend no disponible → mostrar error de red y permitir reintento.
