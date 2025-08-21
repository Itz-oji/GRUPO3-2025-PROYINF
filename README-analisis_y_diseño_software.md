# GRUPO6-2025-PROYINF
## Integrantes Grupo 6: <br>
* Diego Espinoza Jara 202273576-7 <br>
* Benjamin Barria Pinuer 202273644-5 <br>
* Natalie Delgado Mora 202273501-5 <br>
* Ignacio Cubillos 202230523-1 <br>
#### -Link video cliente: [Video de Aula](https://aula.usm.cl/pluginfile.php/6994529/mod_resource/content/1/video1943571039.mp4) <br>
#### -Link video prototipo: https://youtu.be/djWuBrxHVjQ
# [📘 Wiki Oficial](https://github.com/Itz-oji/GRUPO6-2025-PROYINF/wiki)


---
## Requerimientos
El programa esta siendo probado y ejecutado en el simbolo del sistema correspondiente a Windows 10 pro
- El programa esta escrito con python 3.12.6
- Para el Back-end se utilizó Node.js
- Para el Front-end se utilizó React
- Para la base de datos se usó PostgreSQL
---
## Uso
Para correr el programa es necesario tener instalado [Docker compose](https://docs.docker.com/compose/install/), [PostgreSQL](https://www.postgresql.org/download/), React y [Node.js](https://nodejs.org/es/)

En caso de tener instalados los programas mencionados, es necesario abrir la app de "Docker Desktop"

Luego posicionar la terminar en la raiz del proyecto con
```
cd ruta/del/proyecto/mi-proyecto-node-docker
```
Finalmente ejecutar los siguientes comandos
```
npm install axios
docker-compose down --volumes
docker-compose up --build
```

y buscar en el navegador el siguiente [enlace](http://localhost:5173/)


## Cuentas:  
Para el acceso de los usuarios, se estableció que todos los correos institucionales con dominio @sansano.usm.cl serán reconocidos automáticamente como alumnos. En el caso de los profesores, solo podrán acceder como tal aquellos usuarios autorizados previamente en el sistema.

A continuación, se presenta una tabla con los datos de acceso para cada tipo de usuario, donde creamos un correo para que puedan probar el acceso como profesor y ver las funcionalidades de este rol.

Aclaración: Esto es un ejemplo para demostrar que el sistema puede diferenciar los distintos correos y permitir el acceso únicamente a usuarios específicos, que en este caso son los pertenecientes al dominio sansano.

| Nombre | Contraseña | Rol |
|----------|----------|----------|
| prbprfsr@gmail.com   | B12345678!  | Profesor | 
| ..@sansano.usm.cl   | Sin contraseña  | Alumno | 


