---
sidebar_position: 3
---

# Implementar Sequelize

---

## Ejemplo Persistencia de datos con postgres y sequelize en Node.js

```jsx title="comandos para la instalacion"
npm install --save-dev sequelize-cli////INSTALAR CLI(PARA GENERAR MIGRACIONES ETC )

////Instalar driver según la db que quiera usar
npm install --save sequelize
# One of the following:
$ npm install --save pg pg-hstore # Postgres
$ npm install --save mysql2
$ npm install --save mariadb
$ npm install --save sqlite3
$ npm install --save tedious # Microsoft SQL Server
$ npm install --save oracledb # Oracle Database
```

_configuración de Sequelize ORM_

```jsx title="./.sequelizerc"
////configuracion de migracion
module.exports = {
  config: './db/config.js',
  'models-path': './db/models/',
  'migrations-path': './db/migrations/',
  'seeders-path': './db/seenders/',
};
```

---

## En config.js va la conexión

_./db/config.js _

```jsx title="./db/config.js "
const {config} = require('../config/config'); ////CARIABLES DE ENTORNO

const USER = encodeURIComponent(config.dbUser); ////ENCODEAR USER
const PASSWORD = encodeURIComponent(config.dbPassword); ////ENCODEAR PASSWORD
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
module.exports = {
  development: {
    url: URI,
    dialect: 'postgres', ////SGDB
  },
  production: {
    url: URI,
    dialect: 'postgres',
  },
};
```

---

## RECOMENDACION:Al migrar a en producción, es mejor crear una sola migración inicial, es mejor un esquema inicial por que si no podría dar errores (al migrar, ya que los modelos deben ser fijos ).las migraciones Ejemplo para añadir una nueva columna hacerlo directamente en la nueva migración

---

## ejemplo modelo en Sequelize (schemas iniciales )

_ejemplo User.model.js_

```jsx title="./db/models/User.model.js"
const {Model, Sequelize, DataTypes} = require('sequelize');
const USER_TABLE = 'users'; //tabla
const UserSchema = {
  ////squema
  id: {
    allowNull: false, //////permitir null
    autoIncrement: true, ///searial o autoincrementable
    primaryKey: true, ///llave primaria
    type: DataTypes.INTEGER, ////tipo de dato
  },
  email: {
    allowNull: false, //////permitir null
    type: DataTypes.STRING, ////tipo de dato
    unique: true, /////campo unico
  },
  password: {
    allowNull: true, //////permitir null
    type: DataTypes.STRING, ////tipo de dato
  },
  role: {
    allowNull: true, //////permitir null
    type: DataTypes.STRING, ////tipo de dato
  },
  createdAt: {
    allowNull: false, //////permitir null
    type: DataTypes.DATE, ////tipo de dato
    field: 'create_at', ///nombre de la columna
    defaultValue: Sequelize.NOW,
  },
};

//////DEFINIR CLASE exten CON EL MODELO (para usar metodos find...etc)
class User extends Model {
  static associated() {
    ////models ASOCIACIONES (RELACIONES Y LLAVES ETC)
  }
  static config(sequelize) {
    return {
      sequelize, ////conexion sequleize
      tableName: USER_TABLE, ///nombre tabla
      modelName: 'User', //nombremodelo
      timestamps: false,
    };
  }
}

module.exports = {USER_TABLE, UserSchema, User};
```

---

## INDEX.JS ACA VAN TODOS LOS MODELOS

```jsx title="./db/models/User.model.js"
const {User, UserSchema} = require('./user.model'); //importar el arivo de modelos
const {VideosSchema, Video} = require('./video.model');

function setupModels(sequelize) {
  User.init(UserSchema, User.config(sequelize)); ///traemos el squema y el user config de la clase
  Video.init(VideosSchema, Video.config(sequelize));
}
module.exports = setupModels;
```

---

## listar,crear, actualizar y eliminar en sequelize

```jsx title="metodos a usar en services"
créate(), finAll(), findByPk(id), update(changes, id), destroy(id);
```

---

## CREACION DE UN SERVICIO –./SERVICES con sequelice

_ejemplo con servicio user.services _

```jsx title="./services/user.service.js"
const boom = require('@hapi/boom'); ////ERRORES BOOM
const {models} = require('./../libs/sequelize'); ///MODEL SEQUELIZE

class UserService {
  ////CLASE
  constructor() {} ///CONSTRUCTOR
  ////crear
  async create(data) {
    const newUser = await models.User.create(data); ////LLAMA A EL models.User
    return newUser;
  }
  ///listar todo
  async find() {
    const rta = await models.User.findAll();
    return rta;
  }
  ////encontrar por id
  async findId(id) {
    const user = await models.User.findByPk(id);
    if (!user) {
      throw boom.notFound('USUARIO NO EXISTE');
    }
    return user;
  }
  ////actualizar por id
  async update(id, changes) {
    const user = await this.findId(id);
    if (!user) {
      throw boom.notFound('USUARIO NO EXISTE');
    }
    const rta = await user.update(changes);
    return rta;
  }
  ////eliminar por id
  async delete(id) {
    const user = await this.findId(id);
    if (!user) {
      throw boom.notFound('USUARIO NO EXISTE');
    }
    await user.destroy(id);
    return {id};
  }
}

module.exports = UserService; ////ExPORTA CLASE
```

---

## Migraciones en Sequelize

_ejemplo migracion_

```jsx title="script configurados en package.json "
"scripts": {
    "start": "nodemon index.js",
     "migrations:generate":"sequelize-cli migration:generate --name",
     "migrations:run":"sequelize-cli db:migrate",
     "migrations:revert":"sequelize-cli db:migrate:undo",
     "migrations:delete":"sequelize-cli db:migrate:undo:all",
     "test": "echo \"Error: no test specified\" && exit 1"
  },
```

```jsx title="comando a ejecutar en la terminal"
migrations:generate “nombremigracionsincomillas”
```

---

## agregando columna

```jsx title="ejemplo de migracion agregando columna"
'use strict';
const {USER_TABLE} = require('../models/user.model');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(USER_TABLE, 'recovery_token', {
      field: 'recovery_token',
      allowNull: true, //////permitir null
      type: Sequelize.DataTypes.STRING, ////tipo de dato
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(USER_TABLE, 'recovery_token');
  },
};
/////ejecutar npm migrations:run (para correr la migracion)
```

---

## agregando tabla

```jsx title="codigo archivo de migracion para una tabla"
'use strict';
///traemos los modelos
const {UserSchema, USER_TABLE} = require('../models/user.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  ///creando tabla
  async up(queryInterface) {
    await queryInterface.createTable(USER_TABLE, UserSchema); ///replazar
    /* * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },
  ///eliminado tabla
  async down(queryInterface) {
    await queryInterface.dropTable(USER_TABLE, UserSchema);
  },
};
```

_ejemplo migracion inicial_

```jsx title="./db/models/User.model.js"
'use strict';

/** @type {import('sequelize-cli').Migration} */

const {USER_TABLE} = require('../models/user.model');
const {PROFILE_TABLE} = require('../models/profile.model');
const {VIDEO_TABLE} = require('../models/video.model');

module.exports = {
  /////
  up: async (queryInterface, Sequelize) => {
    ////USER
    await queryInterface.createTable(USER_TABLE, {
      ////squema
      id: {
        allowNull: false, //////permitir null
        autoIncrement: true, ///searial o autoincrementable
        primaryKey: true, ///llave primaria
        type: Sequelize.DataTypes.INTEGER, ////tipo de dato
      },
      email: {
        allowNull: false, //////permitir null
        type: Sequelize.DataTypes.STRING, ////tipo de dato
        unique: true, /////campo unico
      },
      password: {
        allowNull: true, //////permitir null
        type: Sequelize.DataTypes.STRING, ////tipo de dato
      },
      role: {
        allowNull: true, //////permitir null
        type: Sequelize.DataTypes.STRING, ////tipo de dato
      },
      createdAt: {
        allowNull: false, //////permitir null
        type: Sequelize.DataTypes.DATE, ////tipo de dato
        field: 'create_at', ///nombre de la columna
        defaultValue: Sequelize.NOW,
      },
    });

    ////PROFILE
    await queryInterface.createTable(PROFILE_TABLE, {
      /////schema
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      phone: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      photo: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      ubicacion: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      idioma: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      createAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        field: 'create_at',
        defaultValue: Sequelize.NOW,
      },
      userId: {
        ///foranea
        //////relacion con user
        field: 'user_id',
        allowNull: false,
        type: Sequelize.DataTypes.INTEGER,
        unique: true,
        references: {
          model: USER_TABLE,
          key: 'id', //primary
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });

    ////TABLE_VIDEO
    await queryInterface.createTable(VIDEO_TABLE, {
      ///SCHEMA
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      videoUrl: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      categoria: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        field: 'create_at',
        defaultValue: Sequelize.NOW,
      },
      userId: {
        ///foranea
        //////relacion con user
        field: 'user_id',
        allowNull: true,
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: USER_TABLE,
          key: 'id', //primary
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('profile');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('video');
  },
};
```

<!-- ------------------------------------RELACIONES UNO A UNO--------------- -->

---

## Relaciones uno a uno

```jsx title="./db/models/profile.model.js"
const {Model, Sequelize, DataTypes} = require('sequelize');
const {USER_TABLE} = require('./user.model'); //// tabla de usuario

const PROFILE_TABLE = 'profile'; ////nombre tabla
const ProfileSchema = {
  /////aqui va el codigo del schema
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  phone: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  userId: {
    ///foranea
    //////relacion con user
    field: 'user_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    unique: true,
    references: {
      model: USER_TABLE,
      key: 'id', //primary
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

////DEFINIR CLASE DEL MODELO
class Profile extends Model {
  static associate(models) {
    ///asociacion
    this.belongsTo(models.User, {as: 'user'}); /////RELACION con user
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: PROFILE_TABLE,
      modelName: 'Profile',
      timestamps: false,
    };
  }
}
module.exports = {PROFILE_TABLE, ProfileSchema, Profile};
```

```jsx title="./db/models/user.model.js"
//////DEFINIR CLASE exten CON EL MODELO (para usar metodos find...etc)
class User extends Model {
  static associate(models) {
    ////models
    this.hasOne(models.Profile, {
      ////acceder a la  tabla foranea profile
      as: 'profile', ///nombre con el q la vamos a acceder
      foreignKey: 'userId', ///campo de la realacion (llave foranea de profile)
    });
  }
  static config(sequelize) {
    return {
      sequelize, ////conexion sequleize
      tableName: USER_TABLE, ///nombre tabla
      modelName: 'User', //nombremodelo
      timestamps: false,
    };
  }
}

module.exports = {USER_TABLE, UserSchema, User};
```

---
## ejemplo servicio (accediendo a profile desde user)
```jsx title="./services/user.services.js"
async find() {
    const rta = await models.User.findAll({
      include: ["profile"],/////profile
    });
    return rta;
  }
/////EJEMPLO 1
async create(data) {
    const newUser = await models.User.create(data.user);////creaun usuario

    const newProfile = await models.Profile.create({////crea un perfil
      ...data,
      userId: newUser.id,
    }); ////LLAMA A EL models.Profile
    return newProfile;
}

//////EJEMPLO 2
  async create(data) {
    const newProfile = await models.Profile.create(data, {
      ////crea un perfil
      include: ["user"],
    });
  }
////  Ejemplo body POST json
{
  "name":"nilraem",
  "phone":"3045720744",
  "photo":"aaaaaaaaaaa" ,
  "ubicacion":"sss",
  "idioma":"sss" ,
  "user":{
    "email":"nialrema@gmail.com",
    "password":"1234578"
  }
}

```

---
## Relaciones uno a muchos  belongsTo - hasMany
*Ejemplo un usuario puede tener varios videos ,pero un video solo puede tener un usuario*

```jsx title="./db/models/video.model.js"
////Video
const { Model, Sequelize, DataTypes } = require("sequelize"); ///libreria
const { USER_TABLE } = require("./user.model");

const VIDEO_TABLE = "videos"; ///tabla
const VideosSchema = {
  ///SCHEMA
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  videoUrl: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  categoria: {
    allowNull: false,
    type: DataTypes.STRING,
  }
  userId: {
    ///foranea
    //////relacion con user
    field: "user_id",
    allowNull:true,
    type: DataTypes.INTEGER,
    references: {
      model: USER_TABLE,
      key: "id", //primary
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
};

/////////////////////////CLASE Q EXTIENDE EL MODEL
class Video extends Model {
  static associate(models) {
    ////associaciones model
    this.belongsTo(models.User, { as: "user" });
  }
  static config(sequelize) {
    return {
      sequelize, ///conexion
      tableName: VIDEO_TABLE, //name table
      modelName: "Video", ///model name
      timestamps: false, ///columna de marca de tiempo
    };
  }
}
```

```jsx title="./db/models/user.model.js"
////users
//////DEFINIR CLASE exten CON EL MODELO (para usar metodos find...etc)
class User extends Model {
  static associate(models) {
    ////models relacion uno a uno
    this.hasOne(models.Profile, {////acceder a la  tabla foranea profile 
      as: "profile", ///nombre con el q la vamos a acceder
      foreignKey: "userId", ///campo de la realacion (llave foranea de profile)
    });
    ////models relacion uno a muchos
    this.hasMany(models.Video, {////acceder a la  tabla foranea profile
      as: "videos", ///nombre con el q la vamos a acceder
      foreignKey: "userId", ///campo de la realacion (llave foranea de profile)
    });
  }
  static config(sequelize) {
    return {
      sequelize, ////conexion sequleize
      tableName: USER_TABLE, ///nombre tabla
      modelName: "User", //nombremodelo
      timestamps: false,
    };
  }
}
```


---

## Uso desde servicios relación uno a muchos
*Ejemplo de json (nos trae losvideos relacionados con un usuario)*

```jsx title="./services/user.services.js"
 async findId(id) {
    const user = await models.User.findByPk(id, {
      include: ["videos"],
    });
    if (!user) {
      throw boom.notFound("USUARIO NO EXISTE");
    }
    ///ELIMINAR CAMPO PASSWORD
    return user;
  }
```

---
## Relaciones muchos a muchos 
*una order tiene muchos productos y un producto puede tener muchas ordenes
Crear una nueva tabla join table /Ejemplo con tabla order y product  (belongsToMany)

en la jointable (orderProduct) se crea la unión de (orderId),(productId)
EJEMPLO DE UN CAMPO VIRTUAL (recorre los ítems y los multiplica por la cantidad)
*

```jsx title="./db/models/order-product-ternaria.js"
const { Model, DataTypes, Sequelize } = require('sequelize');

////////TABLA CUSTOMER
const {ORDER_TABLE} =require('../models/order.model');
const {PRODUCT_TABLE} =require('../models/products.model');



////SCHEMA ORDER
const ORDER_PRODUCT_TABLE =('orders_products');
const OrderProductSchema = {/////estructura de la tabla
    id:{
        allowNull:false,
        autoIncrement:true,
        primaryKey:true,
        type:DataTypes.INTEGER
    },
    amount:{
        allowNull:false,
        type:DataTypes.INTEGER
    },
    createdAt:{
        allowNull:false,
        type:DataTypes.DATE,
        field:'created_at',
        defaultValue:Sequelize.NOW,
    }, 
     orderId:{
        field:'order_id',
        type:DataTypes.INTEGER,
        unique:true,
        references:{
            model:ORDER_TABLE,
            key:'id',
        },
        onUpdate:'CASCADE',
        onDelete:'SET NULL'
},productId:{
    field:'product_id',
    type:DataTypes.INTEGER,
    unique:true,
    references:{
        model:PRODUCT_TABLE,
        key:'id',
    },
    onUpdate:'CASCADE',
    onDelete:'SET NULL'
}
}
////////////asociates
class OrderProduct extends Model {
    static associate(models){
       /////asoiaciones
    }
    static config(sequelize){
        return {
            sequelize,
            tableName:ORDER_PRODUCT_TABLE,
            modelName:'OrderProduct',
            timestamps:false
        }
    }
}

module.exports ={OrderProduct,OrderProductSchema,ORDER_PRODUCT_TABLE};

```
---

## order
```jsx title="./db/models/order.model.js"
const { Model, DataTypes, Sequelize } = require('sequelize');
////////TABLA CUSTOMER
const { CUSTOMER_TABLE } = require('../models/customer.model');

////SCHEMA ORDER
const ORDER_TABLE = 'orders';
const OrderSchema = {
  /////estructura de la tabla
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  customerId: {
    field: 'customer_id',
    type: DataTypes.INTEGER,
    references: {
      model: CUSTOMER_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
  //////CAMPO VIRTUAL
  total: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.items && this.items.length > 0) {
        return this.items.reduce((total, item) => {
          return total + (item.price * item.OrderProduct.amount);
        }, 0);
      }
      return 0;
    }
  }
};

////////////asociates
class Order extends Model {
  static associate(models) {
    this.belongsTo(models.Customer, {
      //////hasmany muchos productos pertenecen a una category
      as: 'customer',
    }); /////lave foranea
    this.belongsToMany(models.Product, {
      /////tabla de join de order y product
      as: 'items',
      through: models.OrderProduct,
      foreignKey: 'orderId',
      otherKey: 'productId',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: ORDER_TABLE,
      modelName: 'Order',
      timestamps: false,
    };
  }
}

module.exports = { Order, OrderSchema, ORDER_TABLE };


```


## PAGINACION
*http://localhost:8080/api/V1/video/?offset=0&limit=5
ejemplo de paginación 
{
  "next": "http://localhost:8080/api/v1/video/?offset=5&limit=5",//siguiente enlace
  "previous": "http://localhost:8080/api//V1/video/?offset=5&limit=5",enlace 
  "rta": {
    "count": 9, ////numero total de objetos
    "rows": [
      {
        "id": 1,
        "name": "name  video1526",
        "videoUrl": "https://aquileshibaesa",
        "categoria": "memes-dragonball",
        "createdAt": "2023-01-30T10:11:11.000Z",
        "userId": null,
        "user": null
      },}
 
*
```jsx title="./services/user.services.js"
  async find(query) {
    const { limit, offset, title } = query; ////query limit y offset
    const options = {
      ////incluir el ususario del video
      include: ["user"],
      where: {},
    };
//////LIMIT
    if (limit && offset) {
      options.limit = limit;
      options.offset = offset;
    }    
    var previous = null; /////enlace de previous
    var next = `${config.Host}${config.version}/video/?offset=${
      parseInt(limit) + parseInt(offset)
    }&limit=${limit}`;
    ////previous
    if (limit > 0 && offset > 0) {
      ////si el limit es mayor cero
      var off = parseInt(offset) - parseInt(limit);
      var lim = parseInt(limit) + parseInt(offset) - parseInt(limit);
      if (off < 0) {
        off = 0;
      }
      previous = `${config.Host}${config.version}/video/?offset=${off}&limit=${
        limit < offset ? limit : lim
      }`;
    }
   ////FILTRANDO POR TITLE BUSCAR WHERE LIKE %% //////buscar title
    if (title) {
      options.where.name = { [Op.like]: `%${title}%` };
    }
      
    const rta = await models.Video.findAndCountAll(options); ////encontrar y contar
    return {
      ////retorna enlace de next y de previous
      next: `${parseInt(limit) + parseInt(offset) >= rta.count ? null : next}`,
      previous,
      rta,
    };
  }

```


