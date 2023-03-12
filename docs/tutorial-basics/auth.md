---
sidebar_position: 6
---

#Autenticar Usuarios Con Node.Js 
## ALGUNOS TIPOS DE AUTENTICACION DESDE EL CLIENTE

*
Cookies o local storage
enviar token en el header(accesspoint por key)
refresh token cada cierto tiempo
permisos
expiración
*

---
creación de Middleware de verificación por keys
---
```jsx title="./middlewares/auth.handler.js"
const boom = require("@hapi/boom");
const { config } = require("../config/config");////variable de entorno 
/////funcion de verificacion de headerkey
function checkApiKey(req, res, next) {
  const apiKey = req.headers["api"];///req
  if (apiKey === config.API_KEY) { /////si api HEADER_key === a el API_KEY
    next();
  } else {
    next(boom.unauthorized());
  }
}
module.exports = { checkApiKey }; 
```

```jsx title="protegiendo alguna ruta"
const { checkApiKey } = require("./middlewares/auth.handler");
app.get("/api/keyheader", checkApiKey, /////PROTEGIENDO RUTA
(req, res) => {
  res.send("soy una ruta protegida por KEY ");
});

```


---
Hashing de contraseñas con bcryptjs 
---
```jsx title="instalacion con npm"
npm i bcrypt 
```

*uso creando un usuario *
```jsx title="./services/user.services.js"
///SERVICE USER
const bcrypt =require("bcrypt"); /// IMPORT HASH PASSWORD
async create(data) {
    const hash = await bcrypt.hash(data.password, 10); //////encriptar password
    const newUser = await models.User.create({
      ...data,
      password: hash,
    }); ////LLAMA A EL models.User de sequelice y crea user
delete newUser.dataValues.password;///ELIMINAR CAMPO PASSWORD (IMPORTANTE NO RETORNAN PASSWORD)

return newUser;
 }

```

---
Excluir password de modelo user anidado
---
```jsx title="./services/profile.services.js"
async find() {
    const rta = await models.Profile.findAll({      
      include: [
        {
          as:"user",
          model:User,
          attributes: {
            exclude: ['password'] // Removing password from User response data
          }
        }
      ],
    });
    ///ELIMINAR CAMPO PASSWORD
    return rta;
  }
```


---
Implementando login con Passport.js
---
```jsx title="instalacion con npm"
npm i passport-local
npm i jsonwebtoken
npm i passport
npm i passport-jwt
```


---
crear carpetas y archivos
---
```jsx title="./middlewares/auth.handler.js"
IMAGEN
```

---
creación de estategias 
---
*en el archivo index  llamamos las estrategias*
```jsx title="./utils/auth/index.js"
///en el archivo index  llamamos las estrategias
const passport = require("passport"); ////LIBRERIA PASSSPORT
const LocalStrategy = require("./stategies/local.strategy"); ////ESTRATEGIA LOCAL
///const LocalStrategy = require("./stategies/"name".strategy");////ESTRATEGIA twiter facebook google, etc
const JwtStrategy = require("./stategies/jwt.strategy"); ////ESTRATEGIA BEARER TOEKN

passport.use(LocalStrategy);
passport.use(JwtStrategy);

```


---
creación jwt.strategy.js
---
```jsx title="./utils/auth/strategies/jwt.strategy.js"
const { Strategy, ExtractJwt } = require("passport-jwt");
const { config } = require("../../../config/config");
/////opciones para extraer tpken
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ////jwt
  secretOrKey: config.JWT_SECRET, ///secret
};
////crear estrategia y recibir payload y jwt
const JwtStrategy = new Strategy(options, (payload, done) => {
  return done(null, payload);
});
module.exports = JwtStrategy;

```

---
creaciion de local.strategy.js
---
```jsx title="./utils/auth/strategies/local.strategy.js"
const { Strategy } = require("passport-local"); ///paquete passport
const UserService = require("./../../../services/auth.services"); ////servicio de usuario
/////instanciamos el userservice
const service = new UserService();///SERVICE
/////estrategia local
const LocalStrategy = new Strategy(
  {
    usernameField: "email", ////renombrar clave del objeto
    passwordField: "password",
  },

  async (email, password, done) => {
    try {
      const user = await service.getUser(email, password); ///servicio de verificar
      done(null, user); ////si las validaciones salen correctas
    } catch (error) {
      done(error, false);
    }
  }
);
module.exports = LocalStrategy;

```


---
creación servicios auth.services.js 
*servicios de (
-verificacion de usuario y password,
-creacion de token de singin expira en 59m,
- verificacion de email y creacion de token de recovery expira en 15m,
-envio de email, 
-cambio de password con token validado)*
---

```jsx title="./services/auth.services.js"
const boom = require("@hapi/boom");
const bcrypt = require("bcrypt");
const { config } = require("./../config/config.js");
const nodemailer = require("nodemailer");

const UserService = require("./user.service");
const service = new UserService();
const jwt = require("jsonwebtoken");

class AuthService {
  //////VERIFICAR USER
  async getUser(email, password) {
    const user = await service.findByEmail(email); ///servicio de verificar
    if (!user) {
      ////si no existe user error
      throw boom.unauthorized();
    }
    /////comparar user.password
    const isMatch = await bcrypt.compare(password, user.password);
    /////SI NO COINCIDE
    if (!isMatch) {
      throw boom.unauthorized();
    }
    delete user.dataValues.password; /////eliminar password del objeto json
    return await this.singToken(user);
  }

  //////SING
  singToken(user) {
    const payload = {
      ///PAYLOAD
      sub: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: "59m" }); ///payload y SECRETO
    return { user, token }; ///retorna usuario y token  */
  }

///////REFRESH TOKEN(EN DESARROLLO)

////////send recovery password token-password
async sendRecovery(email) {
    const user = await service.findByEmail(email); ///////buscar el email
    if (!user) {
        console.log("no encotro email")
      ////si no existe el email manda error
      throw (boom.unauthorized(), false);
    }
    const payload = { sub: user.id };
    const token = jwt.sign(payload, config.JWT_SECRET,{expiresIn:'15min'});
    const link = `htttp://mifrontend/recovery?token=${token}`;
    await service.update(user.id ,{recoveryToken:token});//////INSERTA,ACTUALIZAR TOKEN
    
    //////mensaje
    const mail = {
      from: config.EMAIL, // sender address
      to: `${user.email}`, // list of receivers
      subject: `RECUPERAR PASSWORD HELLO ✔ ${user.email}`, // Subject line
      html: `<b>INGRESA A ESTE LINK =>${link}</b>`, // html body
    };
    const rta = await this.sendMail(mail);/////servicio de enviar email
    return rta;
  }

  ///////CHANGE PASSWORD 
async changePassword(token,newPassword) {
    try {
        const payload=jwt.verify(token,config.JWT_SECRET)//verificar
        const user=await service.findId(payload.sub);//encontrar user x id
        if(user.recoveryToken!==token){///si el token es diferente al de la db
            throw boom.unauthorized();
        }
        /////hash the password
        const hash= await bcrypt.hash(newPassword,10)
        await service.update(user.id ,{recoveryToken:null, password:hash});//////token null and ACTUALIZAR PASSWORD
        return {message:'password changed'}
    } catch (error) {
        throw boom.unauthorized();
    }

}

 async sendMail(infoEmail) {
    ////trasporte
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        //port: 587,
        secure: true, // true for 465, false for other ports//////SECURE
        port: 465, 
        auth: {
          user: config.EMAIL,
          pass: config.PASS_EMAIL,
        },
      }); ///fin creacion trasporter
      ////envio
      await transporter.sendMail(infoEmail);
      return { message: 'email enviado correctamente' };
    }
  
}

module.exports = AuthService;

```


---
agregar las estrategia al el index
---
```jsx title="./index.js"
app.use(cors());
require("./utils/auth"); /////estrategy local etc
routerApi(app);
```

---
crear ruta auth routes para login, recovery etc
---
```jsx title="./routes/index.js"
const authRouter = require("./auth.router");
//////funcion router v1
function routerApi(app) {
  /////funcion de rutas
  const router = express.Router();
  app.use(`/api/${config.version}`, router);
  router.use("/auth", authRouter); ///////////////////////router AUTH
  router.use("/user", User);
  router.use("/Profile", Profile);
  router.use("/video", video);

  ////EXAMPLE VERSION2
  /* const router2 = express.Router();
  app.use('/api2/v2', router);
  router.use('/products2', productsRouter); */
}

```
---
creación de rutas auth.router.js(LOGIN)
---
```jsx title="./routes/auth.router.js"
const express = require("express");
const passport = require("passport");

const AuthService = require("./../services/auth.services");
const services = new AuthService();////SERVICIO

//////crear router
const router = express.Router();

///////login users
router.post(
  "/login",
  passport.authenticate("local", { session: false }), ////passport
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      res.json(await services.getUser(email, password)); ///servicio retorna usuario y token  */
    } catch (error) {
      next(error);
    }
  }
);

//////RECOVERY PASSWORD EMAIL 
router.post("/recovery", async (req, res) => {
  try {
    const { email } = req.body; ////email body
    const rta = await services.sendRecovery(email); ///servicio envia emailtoken  */
    res.json(rta);
  } catch (error) {
    res.status(401).json({ message: "error" });
  }
});

///////CHANGE PASSWORD
router.post(
  "/change-password",
  //////validar token
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body; ////token_valido y nueva password
      const rta = await services.changePassword(token, newPassword); /////servicio para cambiar la password
      res.json(rta);
    } catch (error) {
      res.status(401).json({ message: "error" });
    }
  }
);

module.exports = router;


```


---
(midlewares)-Protejer rutas 
---
```jsx title="./middlewares/auth.handler.js"
const boom = require("@hapi/boom");
const { config } = require("../config/config"); ////variable de entorno
/////EJEMPLO AUTH POR KEY funcion de verificacion de headerkey 
function checkApiKey(req, res, next) {
  const apiKey = req.headers["api"]; ///req
  if (apiKey === config.API_KEY) {
    next();
  } else {
    next(boom.unauthorized());
  }
}
/////closure-funcion de verificacion de tipo de ROL
function checkRole(...roles) {
  return (req, res, next) => {
    const user = req.user;
    /////IF rol user==[array roles]
    if (roles.includes(user.role)) {
      next();
    } else {
      next(boom.unauthorized());
    }
  };
}
module.exports = { checkApiKey, checkRole };
```

---
Ejemplo Proteccio de una ruta y Control de roles 
---
```jsx title="./routes/profile.router.js"
/////all user
router.get(
  "/",
  passport.authenticate("jwt", { session: false }), ////passport
  checkRole('admin','seller'),////check rol
  async (req, res, next) => {
    try {
      const users = await services.find(); //SERVICES
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);
```




# Congratulations!

You have just learned the **basics of Docusaurus** and made some changes to the **initial template**.

Docusaurus has **much more to offer**!

Have **5 more minutes**? Take a look at **[versioning](../tutorial-extras/manage-docs-versions.md)** and **[i18n](../tutorial-extras/translate-your-site.md)**.

