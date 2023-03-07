---
sidebar_position: 1
---

# Configuración del entorno de desarrollo

```jsx title="Iniciar Proyecto"
 npm init
```


** CREAR .GITIGNORE ** en la raiz `./` sitio donde crear un gitignore predeterminado según el proyecto [https://www.toptal.com/developers/gitignore](https://www.toptal.com/developers/gitignore).

** INSTALAR DEPENDENCIAS **

```jsx title="Dependencias Iniciales Del Proyecto"
npm i nodemon eslint eslint-config-prettier eslint-plugin-prettier prettier –d
npm i cors
npm i express
npm i dotenv
npm i //helmet seguridad de encabezados etc
npm i joi //validador de datos más potente para JavaScript.
npm i pg
npm i pg-hstore///controlador de db
npm i prettier
npm i sequelize
```

** EJEMPLO SCRIPTS EN package.json **

```jsx title="./package.json"
"scripts": {
    "start": "nodemon index.js",
    "migrations:generate": "sequelize-cli migration:generate --name",
    "migrations:run": "sequelize-cli db:migrate",
    "migrations:revert": "sequelize-cli db:migrate:undo",
    "migrations:delete": "sequelize-cli db:migrate:undo:all",
    "test": "echo \"Error: no test specified\" && exit 1"
  },

```

** CONFIGURAR .eslintrc **

```jsx title="./.eslintrc"
{
    "parserOptions":{
        "ecmaVersion":2018
    },
    "extends":["eslint:recommended","prettier"],
    "env": {
        "es6":true,
        "node":true,
        "jest":true
    },
    "rules": {
        "no-console":"warn"
    }
}
```

** CREAR VARIABLES DE AMBIENTE .ENV **
```jsx title="./.env-example"
PORT=8080
DB_USER='FREDY'
DB_PASSWORD='admin_123'
DB_HOST='localhost'
DB_NAME='db_name'
DB_PORT='5432'
API_KEY=123
JWT_SECRET=01sssssc1fb61dDDDS63a53478
EMAIL='MIEMAIL@gmail.com'
PASS_EMAIL='PASSWORDEMAIL'
#####amazon
AWS_BUCKET_NAME=storage_videos_cortos
AWS_BUCKET_REGION=us-east-1
AWS_PUBLIC_KEY=AKIA4QGABRU6Jssss
AWS_SECRET_KEY=sssssssssss0d39DjdRPlBtx3sTVAsssssssssssssr91E

```
** CREAR CONFIG **
```jsx title="./config/config.js"
require("dotenv").config(); ///DOTENV

///OBJ CONFIG
const config = {
  env: process.env.NODE_ENV || "dev",
  Host: process.env.HOST,
  version: process.env.VERSION,
  port: process.env.PORT || 3100,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
  API_KEY: process.env.API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL: process.env.EMAIL,
  PASS_EMAIL: process.env.PASS_EMAIL,
};

module.exports = { config };

```



## CREACION DOCKER COMPOSE 
```jsx title="COMANDOS BASICOS A TENER EN CUENTA"
- `docker-compose ps` → `para ver contenedores activos`
- `Docker inspect ‘i45566id_sin_comillas’` → `para inspeccionar un contenedor por id`
- `docker-compose up -d phpmyadmin` → `iniciar phpmyadmin `
- `docker stop “namesincomillas”` → `detener contendor` 
```

** DOCKER COMPOSE **
```jsx title="EJEMPLO DOCKER COMPOSE MYSQL POSTGRES PGADMIN PHPMYADMIN"
version: '3.8'
services:
  base_de_postgres:
    image: postgres:14.1-alpine
    restart: always
    environment:
      - POSTGRES_DB=db_videos
      - POSTGRES_USER=john
      - POSTGRES_PASSWORD=admin123
    ports:
      - '5432:5432'
    volumes: 
      - ./postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@mail.com
      - PGADMIN_DEFAULT_PASSWORD=root
    ports: 
      - '555:80'

  mysql:
    image: mysql:5
    environment:
      - MYSQL_DATABASE=my_store
      - MYSQL_USER=root
      - MYSQL_ROOT_PASSWORD=admin123
      - MYSQL_PORT=3306
    ports: 
      - '3306:3306'
    
    volumes: 
      - ./mysql_data:/var/lib/mysql

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    environment:
      - MYSQL_ROOT_PASSWORD=admin123
      - PMA_HOST=mysql
      - PMA_PORT=3306
    ports:  
      - '444:80'
```


**crear servidor HTTP **
```jsx title="./index.js"
const express = require("express");
const routerApi = require("./routes");
const cors = require("cors");
var bodyParser = require("body-parser");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");
const express = require("express");
const routerApi = require("./routes");///RUTAS API
const cors = require("cors");
var bodyParser = require("body-parser");
const helmet = require("helmet");
const { config } = require("./config/config"); //variables de entorno
/* ////midlewares ----------- usar después de definir el routing */
const {
  logErrors,
  errorHandler,
  boomErrorHandler,
  ormErrorHandler,
} = require("./middlewares/error.handler");

/////express
const app = express();
const port = `${config.port}`; ////port

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

/////middlewares
app.use(express.json());
app.use(helmet());//seguridad en los encabezados etc
/////ejemplo de cors con lista
/*const whitelist=['http://localhost:3000'];
const options = {
  origin:(origin,callback) => {
    if(whitelist.includes(origin)){
      callback(null,true);
    }else{
      callback(new Error('no pemitido'))
    }
  }
}
 */
app.use(cors());//cors permitiendo todo

routerApi(app); //RUTAS API ./routes


/////midlewares
app.use(logErrors); //captuta el error y sigue
app.use(ormErrorHandler); ///captura error de tipo orm y lo envía y sigue///
app.use(boomErrorHandler); ///si encuetra un errorboom o envía y sigue///
app.use(errorHandler); //si encuentra un error finaliza

///SERVIDOR
app.listen(port, () => {
  console.log("server listening on port", port);
});

```






- `src/pages/index.js` → `localhost:3000/`
- `src/pages/foo.md` → `localhost:3000/foo`
- `src/pages/foo/bar.js` → `localhost:3000/foo/bar`

## Create your first React Page

Create a file at `src/pages/my-react-page.js`:

```jsx title="src/pages/my-react-page.js"
import React from 'react';
import Layout from '@theme/Layout';

export default function MyReactPage() {
  return (
    <Layout>
      <h1>My React page</h1>
      <p>This is a React page</p>
    </Layout>
  );
}
```

A new page is now available at [https://www.toptal.com/developers/gitignore](https://www.toptal.com/developers/gitignore).

## Create your first Markdown Page

Create a file at `src/pages/my-markdown-page.md`:

```mdx title="src/pages/my-markdown-page.md"
# My Markdown page

This is a Markdown page
```

A new page is now available at [http://localhost:3000/my-markdown-page](http://localhost:3000/my-markdown-page).
