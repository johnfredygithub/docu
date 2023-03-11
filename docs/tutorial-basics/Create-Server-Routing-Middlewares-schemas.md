---
sidebar_position: 2
---

# CREATE-SERVER-ROUTING-MIDDLEWARES

---
crear servidor HTTP 
---

```jsx title="./index.js"
const express = require("express");
const routerApi = require("./routes"); ///RUTAS API
const cors = require("cors");
var bodyParser = require("body-parser");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");
const { uploadFile } = require("./s3");
const { checkApiKey } = require("./middlewares/auth.handler");

const { config } = require("./config/config");

//const {checkApiKey}=require('./middleware/auth.handler');

/* ////midlewares ---------------- usar despues de definir el routing */
const {
  logErrors,
  boomErrorHandler,
  errorHandler,
  ormErrorHandler,
} = require("./middlewares/error.handler");

/////espress
const app = express();
const port = `${config.port}`; ////port

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

/////middleware
app.use(express.json());
app.use(helmet());

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
app.use(cors());
//require("./utils/auth"); ///// AUTH estrategy local etc
routerApi(app);

app.get("/api/keyheader", checkApiKey, (req, res) => {
  res.send(" EJEMPLO RUTA PROTEGIDA POR KEY");
});

/////midlewares
app.use(logErrors);
app.use(ormErrorHandler); ///si encutra un errorboom finaliza///
app.use(boomErrorHandler); ///si encutra un errorboom finaliza///
app.use(errorHandler);

///server
app.listen(port, () => {
  console.log("server UP on port", port);
});
```


---
Creación de /middlewares
---
*MANEJO DE ERRORES*

```jsx title="./middlewares/error.handler.js"
const { ValidationError } = require("sequelize");///ORM
const boom = require("@hapi/boom");///LIBRERIA DE ERRORES

/////log error si encuentra un error se ejecuta y sigue funcion (next)
function logErrors(err, req, res, next) {
  next(err);
}

/////si es un error de tipo boom, se ejecuta si no continua
function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err; ////data de error
    res.status(output.statusCode).json(output.payload);
  }
  next(err);
}

//////si exite error(DE TYPO ORM) se ejecuta y next(err)
function ormErrorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.status(409).json({
      statusCode: 409,
      message: err.message,
      /* errors: err.errors, */
    });
  }next(err);

}

//////se ejcuta y no next
function errorHandler(err, req, res, next) {
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
}

module.exports = { logErrors, errorHandler, boomErrorHandler,ormErrorHandler };
```

*MIDDLEWARE VALIDADOR DE ESTRUCTURA*
```jsx title="./middlewares/schema.validator.handler.js" 
const boom = require("@hapi/boom");
////valida la estructura de los datos
function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property];
    const { error } = schema.validate(data,{abortEarly:false});
    if (error) {
      next(boom.badRequest(error));
    }
    next();
  };
}
module.exports = validatorHandler;
```


---
creamos la estructura de los datos
---
*ejemplo schema de user*
```jsx title="./schemas/user.schema.js" 
const Joi = require("joi"); ////paquete de validación del esquema de objetos
const id = Joi.number().integer().min(1); ///campo y tipo de dato
const email = Joi.string().email(); 
const password = Joi.string().alphanum().min(3);
const role = Joi.string().min(3);
//////OBJETOS y campos requeridos o no requeridos
const createUserSchema = Joi.object({
  email: email.required(),
  password: password.required(),
  role: role.required(),
});
const updateUserSchema = Joi.object({
  email: email,
  password: password,
  role: role,
});
const getUserSchema = Joi.object({
  id: id.required(),
});
module.exports = { createUserSchema, updateUserSchema, getUserSchema };
```

---
creacion de Routing con Express.js
---
*INDEX*
![](https://pandao.github.io/editor.md/examples/images/4.jpg)

```jsx title="./routes/index.js" 
const express = require("express");
//////rutas
const authRouter = require("./auth.router");
const profileUser = require("./user.router");
const video = require("./video.router");
//////funcion router v1
function routerApi(app) {
  /////funcion de rutas
  const router = express.Router();
  app.use("/api/v1", router);
  router.use('/auth', authRouter);
  router.use('/user', profileUser);
  router.use('/video', video);
 ////EXAMPLE VERSION2
 /* const router2 = express.Router();
  app.use('/api2/v2', router);
  router.use('/products2', productsRouter); */
}

module.exports = routerApi;
```

*ejemplo router user*
``` jsx title="./routes/router.user"
const express = require("express");
////SERVICIOS
const UserService = require("../services/user.service");
////schema validator
const validatorHandler = require("../middlewares/schema.validator.handler");
///schemas estructura de datos
const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
} = require("../schemas/user.schema");

////ROUTER EXPRESS
const router = express.Router();

/////SERVICIOS CLASE 
const services = new UserService();

/////all user
router.get(
  "/",
  //passport
  async (req, res, next) => {
    try {
      const users = await services.find();//SERVICES
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

///user:id params
router.get(
  "/:id",
  validatorHandler(getUserSchema, "params"),///validador de schema
  //passport
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const users = await services.findId(id);//SERVICES
      res.status(201).json({users});
    } catch (error) {
      next(error);
    }
  }
);
///POST
router.post(
  "/",
  validatorHandler(createUserSchema, "body"),
  //passport
  async (req, res, next) => {
    try {
      const body = req.body;
      const newUser = await services.create(body);//SERVICES
      res.status(201).json({
        message: "create",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }
);
////PUT
router.put(
  "/:id",
  validatorHandler(getUserSchema, "params"),
  validatorHandler(updateUserSchema, "body"),
  //passport
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updateUser = await services.update(id, body);//SERVICES
      res.status(201).json({
        message: "usuario actualizado",
        data: updateUser,
      });
    } catch (error) {
      next(error);
    }
  }
);
///DELETE
router.delete(
  "/:id",
  //passport
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await services.delete(id);//SERVICES
      res.status(201).json({ message: "user eliminado", data: user });
    } catch (error) {
      res.status(500).json({ message: "error contacte al admin" });
    }
  }
);

module.exports = router;

```


--------------------------------------------------------------

It is also possible to create your sidebar explicitly in `sidebars.js`:

```js title="sidebars.js"
module.exports = {
  tutorialSidebar: [
    'intro',
    // highlight-next-line
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
};
```
