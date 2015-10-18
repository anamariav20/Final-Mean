#MEAN CRUD
Putting it all together

+ Mongoose
+ Express / NodeJS
+ AngularJS
 

##Modularizing the MEAN stack's CRUD

Now that the full stack is in place, we need two MVC structures:

+ Server-Side
   + NodeJS/Express (Controller and Routes)
   + Mongoose/MongoDB (Model)
+ Client-Side
   + AngularJS (Controller, Service, Routing)

We'll keep the same directory structure that we've been using.

#Starting with the Express Components
We'll create an *Article* module and all supporting code to CRUD.

Steps:

+ Create Mongoose Model
+ Create Express Controller
+ Express routing to create RESTful API (HTTP endpoints)

##Mongoose Model for article

```JavaScript
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    creator: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Article', ArticleSchema);
```

Now register this new *Article* model so we can use it in our Express controller.

Add the code below to `config/mongoose.js`:

```JavaScript
var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function() {
  var db = mongoose.connect(config.db);

  require('../app/models/user.server.model');
  require('../app/models/article.server.model');

  return db;
};
```

##Create the Express Controller
Create a new controller called `articles.server.controller.js` in `app/controllers`.

Start with this code:

```JavaScript
var mongoose = require('mongoose'),
    Article = mongoose.model('Article');
```
###Implementing Express Controller Methods

---

####Error Handling

First, create an error-handling method for the controller.

```JavaScript
var getErrorMessage = function(err) {
  if (err.errors) {
    for (var errName in err.errors) {
      if (err.errors[errName].message) return err.errors[errName].message;
    }
  } else {
    return 'Unknown server error';
  }
};
```

#### CREATE

```JavaScript
exports.create = function(req, res) {
  var article = new Article(req.body);
  article.creator = req.user;

  article.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};
```

####LIST/READ
```JavaScript
exports.list = function(req, res) {
  Article.find().sort('-created').populate('creator', 'firstName   lastName fullName').exec(function(err, articles) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};
```

####READ

In order to read a specific article, we'll create a method which accepts the id of the article:

```JavaScript
exports.articleByID = function(req, res, next, id) {
  Article.findById(id).populate('creator', 'firstName lastName fullName').exec(function(err, article) {
    if (err) return next(err);
    if (!article) return next(new Error('Failed to load article ' + id));

    req.article = article;
    next();
  });
};
```

Notice the function/method signature: all of the middleware is passed along (req, res, next, and id).
The Mongoose `populate()` method is called to initialize an object.

Given the **chained** nature of Express middleware, the actual read method will be 
very simple:

```JavaScript
exports.read = function(req, res) {
  res.json(req.article);
};
```

####UPDATE
Update will also assume that we've already called the articleByID middleware.

```JavaScript
exports.update = function(req, res) {
  var article = req.article;

  article.title = req.body.title;
  article.content = req.body.content;

  article.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};
```

####DELETE

```JavaScript
exports.delete = function(req, res) {
  var article = req.article;

  article.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};
```

##Authentication Middleware

---

###Check If User Logged In/Authenticated

We can check to see if the user is logged by adding this method to 
`app/controllers/users.server.controller.js`:

```JavaScript
exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({
      message: 'User is not logged in'
    });
  }

  next();
};
```

####Implementing Authorization Middleware

We want to ensure that a user is logged in for the following operations:

+ `create()`
+ `delete()`

We can implement this by calling on a new method, `hasAuthorization()`, before
we do most CRUD operations.  We create this method and append it to 
`app/controllers/articles.server.controller.js:`:

```JavaScript
exports.hasAuthorization = function(req, res, next) {
    if (req.article.creator.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};
```

##Exposing a RESTful API with Express Routes

---

###Reviewing REST

REST provides a predictable pattern by which we describe and publish a web-based API:

+ A URL per model: http://localhost:8080/articles
+ JSON passed in the request body
+ Use of standard HTTP methods/verbs for CRUD (and/or other things too)
   + **GET** - Read
   + **POST** - Create
   + **PUT** - Update
   + **DELETE** - Delete

So, our URLS may look like these examples:

+ **GET** http://localhost:3000/articles: This will return a list of articles
+ **POST** http://localhost:3000/articles : This will create and return a new article
+ **GET** http://localhost:3000/articles/:articleId: This will return a single existing article
+ **PUT** http://localhost:3000/articles/:articleId: This will update and return a single existing article
+ **DELETE** http://localhost:3000/articles/:articleId: This will delete and return a single article

We have already created controller methods for these.

####Routes

Now, we'll implement the routes that fulfill our RESTful API.  We create a new
file, `articles.server.routes.js`, in the `app/routes` folder.

```JavaScript
var users = require('../../app/controllers/users.server.controller'),
    articles = require('../../app/controllers/articles.server.controller');

module.exports = function(app) {
  app.route('/api/articles')
     .get(articles.list)
     .post(users.requiresLogin, articles.create);
  
  app.route('/api/articles/:articleId')
     .get(articles.read)
     .put(users.requiresLogin, articles.hasAuthorization, articles.update)
     .delete(users.requiresLogin, articles.hasAuthorization, articles.delete);

  app.param('articleId', articles.articleByID);
};
```

Notice the order in which route-handling methods are sent to each HTTP verb - they 
will be called in this order (hence the *next()* middleware directive).

####Configure Express Application
```JavaScript
var config = require('./config'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    flash = require('connect-flash'),
    passport = require('passport');

module.exports = function() {
  var app = express();

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else if (process.env.NODE_ENV === 'production') {
    app.use(compress());
  }

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret
  }));

  app.set('views', './app/views');
  app.set('view engine', 'ejs');

  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  require('../app/routes/index.server.routes.js')(app);
  require('../app/routes/users.server.routes.js')(app);	
  require('../app/routes/articles.server.routes.js')(app);

  app.use(express.static('./public'));

  return app;
};
```

That's it, this is what you would do for every major entity that you'd like for
your NodeJS/Express/Mongoose application to do.

This is it, your articles RESTful API is ready!

#Over to the Client: AngularJS

---

##Using ngResource

Much as is the case with NodeJS and Express, AngularJS provides the `nqResource` module to 
simplify communication between your AngularJS client and your HTTP Service-Endpoint backend.

That is, while NodeJS has the `http` module, Express was created to extend and simplify the 
built-in functionality.  So too does AngularJS have `nqResource` to augment/supplement the
AngularJS `$http` service module.

We use `nqResource` to easily communicate with RESTful APIs.

###Installing nqResource

We use bower:

```JavaScript
{
  "name": "MEAN",
  "version": "0.0.8",
  "dependencies": {
    "angular": "~1.2",
    "angular-route": "~1.2",	
    "angular-resource": "~1.2"
  }
}
```

Then, issue this command:

```JavaScript
bower update
```

This should create a new folder called `angular-resource` in the `public/lib` directory.

In order to use this new feature, we update our application's main page (`app/views/index.ejs`):

```HTML
<!DOCTYPE html>
<html xmlns:ng="http://angularjs.org">
<head>
  <title><%= title %></title>
</head>
<body>
  <% if (user) { %>
    <a href="/signout">Sign out</a>
  <% } else { %>
    <a href="/signup">Signup</a>
    <a href="/signin">Signin</a>
  <% } %>
  <section ng-view></section>
  
  <script type="text/javascript">
    window.user = <%- user || 'null' %>;
  </script>
    
  <script type="text/javascript" src="/lib/angular/angular.js"></script>
  <script type="text/javascript" src="/lib/angular-route/angular-route.js"></script>
  <script type="text/javascript" src="/lib/angular-resource/angular-resource.js"></script>


  <script type="text/javascript" src="/example/example.client.module.js"></script>
  <script type="text/javascript" src="/example/controllers/example.client.controller.js"></script>
  <script type="text/javascript" src="/example/config/example.client.routes.js"></script>

  <script type="text/javascript" src="/users/users.client.module.js"></script>
  <script type="text/javascript" src="/users/services/authentication.client.service.js"></script>

  <script type="text/javascript" src="/application.js"></script>
</body>
</html>
```

We also change our AngularJS main application module:

```JavaScript
var mainApplicationModuleName = 'mean';

var mainApplicationModule = angular.module(mainApplicationModuleName, ['ngResource', 'ngRoute', 'users', 'example']);

mainApplicationModule.config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);

if (window.location.hash === '#_=_') window.location.hash = '#!';

angular.element(document).ready(function() {
  angular.bootstrap(document, [mainApplicationModuleName]);
});
```

##Using the $resource Service
What `ngResource` gives us is a new **Factory** method that can be injected into an AngularJS
entity.

We call the `$resource` factory method to object a `$resource` object. The `$resource` method
wants four arguments:

+ **Url**: This is a parameterized base URL with parameters prefixed by a colon such as `/users/:userId`
+ **ParamDefaults**: These are the default values for the URL parameters, which can include hardcoded values or a string prefixed with `@` so the parameter value is extracted from the data object
+ **Actions**: These are objects representing custom methods you can use to extend the default set of resource actions
+ **Options**: These are objects representing custom options to extend the default behavior of `$resourceProvider`

The returned `ngResource` object will have the following standard restful methods:

+ **get()**: This method uses a GET HTTP method and expects a JSON object response
+ **save()**: This method uses a POST HTTP method and expects a JSON object response
+ **query()**: This method uses a GET HTTP method and expects a JSON array response
+ **remove()**: This method uses a DELETE HTTP method and expects a JSON object response
+ **delete()**: This method uses a DELETE HTTP method and expects a JSON object response

Each of these methods work in roughly the same manner:

+ Use the `$http` service to connect to a specific
   + HTTP Method
   + URL
   + Parameters
+ Return an empty reference object to be populated once the data is returned from the server
+ Provides a means of sending a callback and to execute taht when the reference object is populated.

These operations would look something like this:

```JavaScript
var Users = $resource('/users/:userId', {
  userId: '@id'
});

var user = Users.get({
  userId: 123
}, function() {
  user.abc = true;
  user.$save();
});
```

#Implementing the Client-Side (AngularJS) MVC Module
Now that we have the server-side taken care of, we can focus on bringing MVC to
the client.

We will create an AngularJS service that will connect with our NodeJS/Express 
CRUD service.

##Creating the Basic Structure

Go to the `public` folder and create a new sub-folder aclled `articles`.  In this new
folder also create new file called `articles.client.model.js`.  In this file we 
insert the following code:

```JavaScript
angular.module('articles', []);
```

We also need to add this module as a dependency in our main application module. 
Add the following code to `public/application.js`:

```JavaScript
var mainApplicationModuleName = 'mean';

var mainApplicationModule = angular.module(mainApplicationModuleName, ['ngResource', 'ngRoute', 'users', 'example', 'articles']);

mainApplicationModule.config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);

if (window.location.hash === '#_=_') window.location.hash = '#!';
angular.element(document).ready(function() {
  angular.bootstrap(document, [mainApplicationModuleName]);
});
```

##Creating our AngularJS module service
We'll use a single AngularJS Service to communicate with our API endpoints using the 
`$resource` factory method.

Go to the `public\articles` folder and create a new subfolder called `services`.
In this folder, create the `articles.client.service.js` file:

```JavaScript
angular.module('articles').factory('Articles', ['$resource', function($resource) {
  return $resource('api/articles/:articleId', {
    articleId: '@_id'
  }, {
    update: {
      method: 'PUT'
    }
  });
}]);
```

##Setup the AngularJS module controller
In order to create a successful AngularJS app, we embed most of our logic into an
AngularJS controller.  The controller will provide all methods necessary to perform
CRUD operations on an `Article` via our new `Article` service.

In order to get going, create a new directory called `controllers` in the `public/articles` folder.
In this folder, create a new file called `articles.client.controller.js`:

```JavaScript
angular.module('articles').controller('ArticlesController', ['$scope', '$routeParams', '$location', 'Authentication', 'Articles',
  function($scope, $routeParams, $location, Authentication, Articles) {
    $scope.authentication = Authentication;
  }
]);
```

Take note that the `ArticlesController` is using four injected services:

+ **$routeParams**: This is provided with the ngRoute module and holds references to route parameters of the AngularJS routes you'll define next
+ **$location**: This allows you to control the navigation of your application
+ **Authentication**: You created this service in the previous chapter and it provides you with the authenticated user information
+ **Articles**: You created this service in the previous section and it provides you with a set of methods to communicate with RESTful endpoints
+ 

Also notice that we bind to the `$scope` object, which we use to communicate between views and controllers.

###CREATE

We include a `create()` method for our controller in the `public/articles/controllers/articles.client.controller.js` file:

```JavaScript
$scope.create = function() {
  var article = new Articles({
    title: this.title,
    content: this.content
  });

  article.$save(function(response) {
    $location.path('articles/' + response._id);
  }, function(errorResponse) {
    $scope.error = errorResponse.data.message;
  });
};
```

###READ/LIST (findOne() and find())
We need to read all and a single document in the MongoDB/Mongoose collection.

The following code is appended to `public/articles/controllers/articles.client.controller.js`:

```JavaScript
$scope.find = function() {
  $scope.articles = Articles.query();
};

$scope.findOne = function() {
  $scope.article = Articles.get({
    articleId: $routeParams.articleId
  });
};
```

###UPDATE

We use `$scope.article` and the `Articles` serivce to communicate with the 
HTTP endpoint for an UPDATE.  Make these changes to `public/articles/controllers/articles.client.controller.js`:

```JavaScript
$scope.update = function() {
  $scope.article.$update(function() {
    $location.path('articles/' + $scope.article._id);
  }, function(errorResponse) {
    $scope.error = errorResponse.data.message;
  });
};
```

###DELETE
We use `$scope.article` and the `Articles` serivce to communicate with the 
HTTP endpoint for a DELETE.  Make these changes to `public/articles/controllers/articles.client.controller.js`:

```JavaScript
$scope.delete = function(article) {
  if (article) {
    article.$remove(function() {
      for (var i in $scope.articles) {
        if ($scope.articles[i] === article) {
          $scope.articles.splice(i, 1);
        }
      }
    });
  } else {
    $scope.article.$remove(function() {
      $location.path('articles');
    });
  }
};
```

#Implementing our AngularJS Views

We won't do much CRUD if we don't have AngularJS views.  Remember, we will have a minimal number
of server-side templated views with an AngularJS approach.

In order to create views for our CRUD, go ahead and create a new `views` subdirectory
under our `public/articles` folder.

##The create-article View

Go to the `public/articles/views` folder and create `create-article.client.view.html`:

```HTML
<section data-ng-controller="ArticlesController">
<h1>New Article</h1>
  <form data-ng-submit="create()" novalidate>
    <div>
      <label for="title">Title</label>
      <div>
        <input type="text" data-ng-model="title" id="title" placeholder="Title" required>
      </div>
    </div>
    <div>
      <label for="content">Content</label>
      <div>
        <textarea data-ng-model="content" id="content" cols="30" rows="10" placeholder="Content"></textarea>
      </div>
    </div>
    <div>
      <input type="submit">
    </div>
    <div data-ng-show="error">
      <strong data-ng-bind="error"></strong>
    </div>
  </form>
</section>
```

*NOTE*: Remember that we'll insert this content into an area of our main server-side 
page called `index.ejs`.

##The view-article View

To create the view, go to the `public/articles/views` folder and create a new file named `view-article.client.view.html`:

```HTML
<section data-ng-controller="ArticlesController" data-ng-init="findOne()">
  <h1 data-ng-bind="article.title"></h1>
  <div data-ng-show="authentication.user._id == article.creator._id">
    <a href="/#!/articles/{{article._id}}/edit">edit</a>
    <a href="#" data-ng-click="delete();">delete</a>
  </div>
  <small>
    <em>Posted on</em>
    <em data-ng-bind="article.created | date:'mediumDate'"></em>
    <em>by</em>
    <em data-ng-bind="article.creator.fullName"></em>
  </small>
  <p data-ng-bind="article.content"></p>
</section>
```

##The edit-article View

To create the view go to the `public/articles/views` folder and create a new file named `edit-article.client.view.html`:

```HTML
<section data-ng-controller="ArticlesController" data-ng-init="findOne()">
  <h1>Edit Article</h1>
  <form data-ng-submit="update()" novalidate>
    <div>
      <label for="title">Title</label>
      <div>
        <input type="text" data-ng-model="article.title" id="title" placeholder="Title" required>
      </div>
    </div>
    <div>
      <label for="content">Content</label>
      <div>
        <textarea data-ng-model="article.content" id="content" cols="30" rows="10" placeholder="Content"></textarea>
      </div>
    </div>
    <div>
      <input type="submit" value="Update">
    </div>
    <div data-ng-show="error">
      <strong data-ng-bind="error"></strong>
    </div>
  </form>
</section>
```

##The list-articles view

To create this view, go to the `public/articles/views` folder and create a new file named `list-articles.client.view.html`:

```HTML
<section data-ng-controller="ArticlesController" data-ng-init="find()">
  <h1>Articles</h1>
  <ul>
    <li data-ng-repeat="article in articles">
      <a data-ng-href="#!/articles/{{article._id}}" data-ng-bind="article.title"></a>
      <br>
      <small data-ng-bind="article.created | date:'medium'"></small>
      <small>/</small>
      <small data-ng-bind="article.creator.fullName"></small>
      <p data-ng-bind="article.content"></p>
    </li>
  </ul>
 <div data-ng-hide="!articles || articles.length">
    No articles yet, why don't you <a href="/#!/articles/create">create one</a>?
  </div>
</section>
```

#Defining the AngularJS module routes

Go to the `public/articles` folder and create a new `config` folder. In your `config` 
folder, create a new file named `articles.client.routes.js` that contains the following code:

```JavaScript
angular.module('articles').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/articles', {
      templateUrl: 'articles/views/list-articles.client.view.html'
    }).
    when('/articles/create', {
      templateUrl: 'articles/views/create-article.client.view.html'
    }).
    when('/articles/:articleId', {
      templateUrl: 'articles/views/view-article.client.view.html'
    }).
    when('/articles/:articleId/edit', {
      templateUrl: 'articles/views/edit-article.client.view.html'
    });
  }
]);
```

#Finalizing the Implementation

We've made a lot of new files and subdirectories for our client application.  We'll need
to make changes to our `index.ejs` file in `app/views`:

```HTML
<!DOCTYPE html>
<html xmlns:ng="http://angularjs.org">
<head>
  <title><%= title %></title>
</head>
<body>
  <section ng-view></section>
    
  <script type="text/javascript">
    window.user = <%- user || 'null' %>;
  </script>
  
  <script type="text/javascript" src="/lib/angular/angular.js"></script>
  <script type="text/javascript" src="/lib/angular-route/angular-route.js"></script>
  <script type="text/javascript" src="/lib/angular-resource/angular-resource.js"></script>
  <script type="text/javascript" src="/articles/articles.client.module.js"></script>
  <script type="text/javascript" src="/articles/controllers/articles.client.controller.js"></script>
  <script type="text/javascript" src="/articles/services/articles.client.service.js"></script>
  <script type="text/javascript" src="/articles/config/articles.client.routes.js"></script>

  <script type="text/javascript" src="/example/example.client.module.js"></script>
  <script type="text/javascript" src="/example/controllers/example.client.controller.js"></script>
  <script type="text/javascript" src="/example/config/example.client.routes.js"></script>

  <script type="text/javascript" src="/users/users.client.module.js"></script>
  <script type="text/javascript" src="/users/services/authentication.client.service.js"></script>

  <!--Bootstrap AngularJS Application-->
  <script type="text/javascript" src="/application.js"></script>
</body>
</html>
```

Notice that we provide an `ng-view` directive into which each of our AngularJS views will render.
Also notice that the authentication links were removed from the EJS template.

We will add the authentication links back in the home view of the `example` module.
To do so, go to the `public/example/views/example.client.view.html` file and change it as follows:

```HTML
<section ng-controller="ExampleController">
  <div data-ng-show="!authentication.user">
    <a href="/signup">Signup</a>
    <a href="/signin">Signin</a>
  </div>
  <div data-ng-show="authentication.user">
    <h1>Hello <span data-ng-bind="authentication.user.fullName"></span></h1>
    <a href="/signout">Signout</a>
    <ul>
      <li><a href="/#!/articles">List Articles</a></li>
      <li><a href="/#!/articles/create">Create Article</a></li>
    </ul>
  </div>
</section>
```

Notice how the example view now shows the authentication links when the user is 
not authenticated and your articles module links once the user is signed in. 
To make this work, you will also need to make a slight change in your `ExampleController`. 
Go to the `public/example/controllers/example.client.controller.js` file and change 
the way you use your Authentication service:

```JavaScript
angular.module('example').controller('ExampleController', ['$scope', 'Authentication',
  function($scope, Authentication) {
    $scope.authentication = Authentication;
  }
]);
```