# Cuentas, accesos y puntos

Cómo entra cada persona al sitio, qué puede hacer y dónde está el código. El sitio sigue abierto para cualquiera sin cuenta: las cuentas son una capa encima para escuelas, docentes y alumnos.

## Tipos de cuenta

| Quién | Cómo entra | Qué puede hacer | Dónde |
| --- | --- | --- | --- |
| Administración (`admin`) | Correo y contraseña | Todo: aprobar escuelas, panel de datos, sistema, cuentas, bitácora, ajustes y respaldos | `/admin` |
| Solo ver datos (`viewer`) | Correo y contraseña | Ver el panel de datos y la lista de escuelas. No cambia nada | `/admin` |
| Escuela (`school`) | Correo y contraseña | Corregir sus datos, dar de alta docentes y ver sus grupos | `/escuelas` |
| Docente | Enlace de un solo uso que le da su escuela | Crear grupos, asignar tareas, ver el avance y atender a sus alumnos | `/docente` |
| Alumno | Código del grupo y su nombre, o su código personal | Hacer actividades, ver sus tareas y puntos, armar su cimarrón | Todo el sitio |
| Visitante | Sin cuenta | Usar todo el sitio, sin puntos | Todo el sitio |

Los roles de las cuentas con correo están en la columna `role` de la tabla `users`. Docentes y alumnos no tienen correo ni contraseña.

## El sitio no manda correos

Se decidió con el profe que el sitio no maneje correo. El correo de una cuenta solo sirve para entrar. No hay confirmación de correo ni avisos por correo. Todo lo que antes iría por correo (invitaciones, contraseña nueva) es un enlace que se copia y se manda por WhatsApp.

## Cómo entra cada quien

### Primera cuenta de administración

1. Se abre `/configurar`.
2. Se escribe la clave de instalación, un nombre, un correo y una contraseña.
3. La página muestra los códigos de recuperación y no deja seguir hasta guardarlos.

Solo funciona mientras no exista ninguna cuenta de administración. En el repositorio solo está la huella SHA-256 de la clave, en `backend/config/instalacion.php`. Para cambiar la clave se cambia esa huella.

Al crear esta cuenta se guarda la dirección desde la que se configuró el sitio como "dirección pública". Con ella se arman los enlaces que da el sitio. Se cambia en `/admin`, pestaña Ajustes.

### Más cuentas del equipo

1. En `/admin`, pestaña Cuentas, se escribe nombre y correo y se elige "Solo ver datos" o "Administración completa".
2. El panel da un enlace de invitación (dura 7 días) para mandarlo por WhatsApp.
3. La persona abre el enlace en `/invitacion`, pone su contraseña y guarda sus códigos de recuperación.

En la misma pestaña se cambia el tipo de cuenta, se quita el acceso o se da un enlace para contraseña nueva. Siempre queda al menos una cuenta de administración y nadie se puede quitar el acceso a sí mismo.

### Escuelas

1. La escuela entra a `/escuelas/registro`.
2. Busca su escuela en el catálogo de la SEP (autocompletado por nombre, CCT o colonia) o la llena a mano.
3. Pone el nombre del responsable, su correo y una contraseña, y acepta el aviso de privacidad.
4. Guarda sus códigos de recuperación. No puede seguir hasta descargarlos, imprimirlos o copiarlos y marcar que los guardó.
5. Queda "En revisión". Puede entrar a su cuenta pero no dar de alta docentes.
6. La administración la aprueba o la rechaza con un motivo en `/admin`. Si la rechazan, corrige sus datos y vuelve a revisión.

Estados de una escuela: `pending` (en revisión), `approved` (aprobada), `rejected` (rechazada) y `suspended` (suspendida). Mientras está suspendida, sus docentes y alumnos no pueden entrar. No se borra nada.

### Docentes

1. La escuela aprobada escribe el nombre del docente en su cuenta.
2. El sitio da un enlace `/docente/acceso/...` que sirve una vez y dura 14 días.
3. Al abrirlo, el navegador del docente guarda la cookie `cc_docente` y ya queda dentro.

Si el docente cambia de equipo o pierde el acceso, su escuela le genera otro enlace. Si la escuela tampoco puede, la administración lo hace desde el detalle de la escuela. Al dar de baja a un docente se cierran sus sesiones en todos sus equipos.

### Alumnos

1. El docente crea un grupo y recibe un código de 6 números, un enlace `/unirse/123456` y un QR.
2. El alumno abre el enlace o escribe el código, ve "Vas a entrar a 4° B con Laura Pérez" y escribe su nombre.
3. Su navegador guarda la cookie `cc_alumno` y la próxima vez entra sin escribir nada.

Si cambia de equipo o borra su navegador, usa su código personal (por ejemplo `LMX-482`) en `/regresar`. El docente lo ve en su panel y puede imprimir tarjetas con el código y un QR.

En equipos compartidos el sitio pregunta "¿Eres Ana?" una vez por visita. "No soy yo" cierra la sesión en ese equipo.

Nombres: de 2 a 30 letras, espacios y punto. No se aceptan nombres repetidos en el mismo grupo ("Ana M." sí). Hay una lista corta de palabras no permitidas.

## Cómo funcionan las sesiones

**Administración, solo lectura y escuelas.** Sesión de Laravel guardada en PostgreSQL, con cookie y protección CSRF (cookie `XSRF-TOKEN` que el frontend manda en el encabezado `X-XSRF-TOKEN`). En producción la sesión siempre va en la base, sin importar lo que diga el compose, para que una actualización no saque a nadie.

**Docentes y alumnos.** Cookie propia de 400 días (`cc_docente` y `cc_alumno`), `HttpOnly` y `SameSite=Lax`. El valor es un token al azar de 32 bytes y en la tabla `device_sessions` solo se guarda su huella. Se renueva sola una vez al día mientras se use. Un alumno puede tener 3 equipos con sesión y un docente 5. Al pasar el límite se cierra la sesión más vieja. En las peticiones que cambian algo se revisa que vengan del mismo sitio.

## Recuperar el acceso

| Quién | Qué hace |
| --- | --- |
| Escuela o cuenta del equipo | En "Olvidé mi contraseña" (`/escuelas/olvide`) pone su correo, uno de sus códigos de recuperación y la contraseña nueva |
| Escuela que perdió contraseña y códigos | La administración, en el detalle de la escuela, le da un enlace para contraseña nueva (dura 24 horas) o le genera códigos nuevos |
| Cuenta del equipo que perdió todo | Otra cuenta de administración le da un enlace para contraseña nueva en la pestaña Cuentas |
| Docente | Su escuela le genera otro enlace |
| Alumno | Su docente le da su código personal o le genera uno nuevo |

**Códigos de recuperación.** Cada cuenta con correo recibe 10 códigos al crearse, como `5UKJ-73SA`. Cada código sirve una vez. Solo se muestran al crearse y en la base solo queda su huella (tabla `recovery_codes`). Desde su cuenta, la persona ve cuántos le quedan y genera códigos nuevos con su contraseña actual. Al generar códigos nuevos, los anteriores dejan de servir.

## Límites contra abusos

- Entrar con correo y contraseña: 8 intentos fallidos por correo e IP, luego espera 15 minutos.
- Códigos de recuperación: 6 intentos fallidos por correo e IP, luego espera 15 minutos.
- Código personal de alumno: 30 intentos fallidos por IP cada 15 minutos.
- Clave de instalación: 5 intentos por IP cada 10 minutos.
- Por IP, los límites generales son altos porque un salón entero sale a internet con la misma IP de la escuela: 600 por minuto en las rutas públicas, 300 en las de cuentas y 1,200 en las de alumnos y docentes. Están en `backend/app/Providers/AppServiceProvider.php`.

## Panel de administración

Pestañas de `/admin` para la administración:

- **Escuelas.** Revisar, aprobar, rechazar y ver el detalle de cada escuela: docentes, grupos, enlace nuevo para un docente, enlace de contraseña o códigos nuevos para la escuela, cambiar su correo y suspenderla. Abajo está el catálogo de escuelas de la SEP con el botón para cargarlo desde datos.gob.mx.
- **Panel de datos.** Escuelas, docentes, grupos, alumnos, alumnos activos de la semana, por municipio, colonias con más registros, por nivel, públicas y privadas, últimas 8 semanas, mapa y tabla descargable en CSV. Nunca muestra nombres de alumnos.
- **Sistema.** Estado de la base, respaldos, dirección pública y catálogo. Limpieza a mano y cierre de ciclo escolar.
- **Cuentas.** Invitar, cambiar tipo y quitar acceso.
- **Bitácora.** Quién hizo qué y cuándo (tabla `audit_logs`).
- **Ajustes.** Dirección pública.
- **Respaldos.** Descargar la base en el momento y las copias diarias si existen.

Las cuentas de solo lectura ven únicamente Panel de datos y Escuelas, sin botones para cambiar nada.

## Puntos y actividades

- El catálogo está en `backend/config/activities.php` y se copia a la base al arrancar la API (`php artisan actividades:sincronizar`).
- Lecturas y consejos suman al contestar bien su pregunta. La respuesta correcta solo la conoce el servidor.
- Los juegos propios avisan al terminar con `frontend/public/juegos/cuenca-puntos.js`, que nginx agrega a las páginas de `/juegos/`. El servidor pide que antes se haya registrado el inicio y que haya pasado un tiempo mínimo.
- Los juegos de otros sitios suman al regresar: el servidor revisa el tiempo fuera y hace una pregunta.
- Cada actividad suma una sola vez por alumno (índice único en `completions`).

## Mi cimarrón y Cimacoins

El avatar (`/mi-cimarron`) es el mismo para visitantes y alumnos. Lo que cambia es dónde se guarda:

- **Visitante**: cartera de Cimacoins y avatar en su navegador.
- **Alumno con sesión**: en su cuenta (`students.wallet` y `students.avatar`). El servidor valida cada premio, cada compra y que el avatar solo lleve piezas suyas. Lo conserva al cambiar de equipo con su código personal.
- **Puntos y Cimacoins**: los puntos nunca se gastan y son los que ve el docente. Cada punto le da también 5 Cimacoins al alumno. Saldo = 80 + puntos × 5 + premios − lo gastado.
- La cartera que tenía como visitante no se pasa a su cuenta al entrar a un grupo.

Rutas (`/api/yo/cimarron` y `/api/yo/cimacoins/...`), reglas y cómo agregar piezas en [avatar-cimarron.md](avatar-cimarron.md).

## Dónde está el código

| Qué | Archivo |
| --- | --- |
| Rutas de la API | `backend/routes/api.php` |
| Entrar, salir, primera cuenta, códigos de recuperación | `backend/app/Http/Controllers/AuthController.php` |
| Registro y datos de la escuela | `backend/app/Http/Controllers/SchoolController.php` |
| Docentes de la escuela y enlaces de acceso | `backend/app/Http/Controllers/SchoolTeachersController.php` |
| Panel del docente | `backend/app/Http/Controllers/TeacherController.php` y `AssignmentController.php` |
| Alumnos: entrar, regresar, `/api/yo` | `backend/app/Http/Controllers/StudentController.php` |
| Cuentas del equipo e invitaciones | `backend/app/Http/Controllers/StaffController.php` |
| Aprobar escuelas, ajustes y respaldos | `backend/app/Http/Controllers/AdminController.php` |
| Detalle de escuela para la administración | `backend/app/Http/Controllers/SchoolAdminController.php` |
| Sistema y bitácora | `backend/app/Http/Controllers/SystemAdminController.php` |
| Permisos por rol | `backend/app/Http/Middleware/EnsureRole.php` |
| Cookies de docentes y alumnos | `backend/app/Support/DeviceAuth.php` y `backend/app/Http/Middleware/DeviceSession.php` |
| Códigos de recuperación | `backend/app/Support/RecoveryCodes.php` |
| Borrado de nombres por privacidad | `backend/app/Support/Privacy.php` |
| Mi cimarrón del alumno: avatar, premios y compras | `backend/app/Http/Controllers/CimarronController.php` y `backend/app/Support/Cimacoins.php` |
| Pantallas de cuentas | `frontend/src/views/` (`Schools.vue`, `SchoolRegister.vue`, `AccountLinks.vue`, `Setup.vue`, `Admin.vue`, `Teacher.vue`, `Join.vue`) |
| Mi cimarrón y Cimacoins en el sitio | `frontend/src/views/Avatar.vue` y `frontend/src/composables/useCimacoins.js` |
| Pruebas | `backend/tests/Feature/` y `frontend/tests/` |

## Privacidad

- Del alumno solo se guarda el nombre que escribe, su grupo, sus actividades, su cimarrón y sus Cimacoins (lo que gastó, los premios que recibió y sus cosméticos). Sin correo, fotos ni IP.
- 60 días después de archivar un grupo se borran los nombres y códigos de sus alumnos. Las actividades quedan sin nombre para las cifras.
- El docente puede borrar a un alumno y se borra todo lo suyo.
- El aviso completo está en `/privacidad`.
