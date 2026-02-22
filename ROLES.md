# Permisos por rol de membresía

Este documento resume la matriz de permisos basada en el rol de membresía del usuario dentro de una organización (o workspace). Los roles contemplados son: **Owner**, **Admin**, **Member** y **Viewer**.

> Nota: Los permisos listados reflejan lo último acordado para el sistema, y pueden ajustarse si se incorporan reglas adicionales (por ejemplo: permisos por recurso, herencia por carpeta, o políticas específicas por tipo de documento).

---

## Roles

- **Owner**: dueño de la organización / workspace. Control total.
- **Admin**: administra y opera casi todo, con restricciones puntuales.
- **Member**: usuario estándar que trabaja en recursos (crear/editar/compartir).
- **Viewer**: usuario de solo lectura con capacidades mínimas.

---

## Matriz de permisos

| Acción / Permiso                         | Owner | Admin | Member | Viewer |
|------------------------------------------|:-----:|:-----:|:------:|:------:|
| Ver recursos (documentos/carpetas)       |  ✅   |  ✅   |   ✅   |   ✅   |
| Editar recursos                          |  ✅   |  ✅   |   ✅   |   ❌   |
| Compartir recursos                       |  ✅   |  ✅   |   ✅   |   ❌   |
| Administrar miembros (invitar/remover)   |  ✅   |  ❌   |   ❌   |   ❌   |
| Crear documentos                         |  ✅   |  ✅   |   ✅   |   ❌   |
| Crear carpetas                           |  ✅   |  ✅   |   ✅   |   ❌   |
| Borrar recursos                          |  ✅   |  ❌  |   ❌** |   ❌   |

---

## Reglas y consideraciones

### Owner
- Tiene **control total** sobre recursos y membresías.

### Admin
- Puede hacer prácticamente todo lo operativo.
- No puede borrar recursos.

### Member
- Puede colaborar activamente (crear/editar/compartir).
- **No administra miembros**.
- **No borra recursos de otros** (y en general no tiene permisos de borrado global).

### Viewer
- Acceso enfocado en **lectura**.
- No puede **subir documentos ni compartir**
- No puede editar ni crear ni administrar.

---
