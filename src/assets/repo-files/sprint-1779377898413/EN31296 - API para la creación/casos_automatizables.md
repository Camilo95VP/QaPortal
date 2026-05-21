### Resumen de casos
| Categoría | Cantidad |
|---|---:|
| Happy Path | 3 |
| Full Error | 3 |
| Casos Borde | 2 |

### Precondiciones
- Ambiente HTTP accesible al microservicio `change-account` (staging/test).
- Repositorio `bt-P2M-back-port` disponible y accesible para validaciones atómicas.
- Base de datos con esquema de relaciones (puede estar en test DB).
- Variables de entorno: `API_TIMEOUT=15000` (ms) para pruebas de time-out.
- Credenciales de auditoría con permisos de lectura/escritura.

---

### Happy Path

CP-A01: Crear cuenta y alias correctamente
Escenario: Creación exitosa de cuenta y alias

Dado que el usuario realiza una petición válida de creación (payload según swagger)
Cuando el servicio `change-account` procesa la petición y la persiste
Entonces el sistema debe responder 201 con el body esperado (id, relación alias-cuenta)
Y la relación alias-cuenta debe existir en la BD y en el repositorio `bt-P2M-back-port` de forma atómica

CP-A02: Actualizar relación cuenta-alias
Escenario: Edición exitosa de alias asociado a cuenta

Dado que existe una relación alias-cuenta previa
Cuando se envía una petición de actualización válida
Entonces el servicio debe responder 200 y la BD reflejar el nuevo alias
Y debe registrarse un registro de auditoría con cambio y usuario

CP-A03: Eliminación de alias válida
Escenario: Eliminación de alias que tiene >1 alias asociado al comercio

Dado que el comercio tiene al menos dos alias asociados
Cuando se solicita la eliminación de uno de los alias
Entonces la operación se aplica y la relación se elimina en BD y repo
Y se registra auditoría de la eliminación

---

### Full Error

CP-A04: Manejo de error y mensaje al front
Escenario: Error interno durante persistencia

Dado que ocurre un error de persistencia en la BD al crear una relación
Cuando el backend no puede completar la transacción
Entonces el front debe recibir un mensaje genérico: "Error al guardar la información"
Y la operación debe garantizar que no deje datos parciales (atomicidad)

CP-A05: Timeout configurado (15s)
Escenario: Backend excede el tiempo máximo de respuesta

Dado que el servicio tarda más de `API_TIMEOUT` (15000ms)
Cuando el request supera ese tiempo
Entonces el cliente debe recibir un error de timeout y un mensaje amigable
Y el proceso debe abortar sin persistir cambios incompletos

CP-A06: No eliminar alias único
Escenario: Intento de eliminar el único alias del comercio

Dado que el comercio tiene exactamente un alias
Cuando se solicita eliminar ese alias
Entonces la API debe rechazar la operación con 409 y mensaje lógico
Y no debe eliminarse la relación ni persistirse cambios

---

### Casos Borde

CP-A07: Validación de integridad con API builder
Escenario: Consumir API builder y fallback

Dado que el flujo requiere consumir el API builder externo
Cuando el API builder responde con error no crítico
Entonces el sistema debe aplicar fallback definido y garantizar consistencia

CP-A08: Auditoría de cambios masivos
Escenario: Actualización masiva de alias (batch)

Dado que se procesan N>50 cambios como lote
Cuando el proceso aplica cambios en batch
Entonces debe generarse entrada de auditoría resumida y por elemento
Y la operación debe ser reversible en caso de fallo


<!-- TRAZA: CA-01=CP-A01 | CA-02=CP-A01 | CA-03=CP-A01,CP-A04 | CA-04=CP-A01,CP-A02 | CA-05=CP-A02 | CA-06=CP-A02,CP-A03 | CA-07=CP-A07 | CA-08=CP-A04 | CA-09=CP-A04,CP-A05 | CA-10=CP-A07 | CA-11=CP-A05 | CA-12=CP-A05,CP-A08 | CA-13=CP-A04 | CA-14=CP-A01,CP-A02 | CA-15=CP-A03 | CA-16=CP-A06 -->
