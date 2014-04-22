#eL burro's Scrum Board

You will find the example scrum board on [heroku](http://enigmatic-everglades-9286.herokuapp.com/)


This Scrum Board uses different technology stacks:

Server
=========
* [Node.js](http://nodejs.org/)
* [Express](http://expressjs.com/)

Node js and express js were used to build the main web application framework. 
Additional modules were installed with node's package manager [npm](https://www.npmjs.org/).

MVC
=========
* [Backbone](http://backbonejs.org/)
* [Underscore](http://underscorejs.org/)

Backbone was used in first place to create collections, models and views.
Underscore was helping backbone with utility methods for collections or templating.

Templates
==========
* [Jade](http://jade-lang.com/)

Jade was used for creating template files for the HTML.

Persistance
==========
* [Mongoose](http://mongoosejs.com/)
* [MongoDB](http://www.mongodb.org/)

To save the todo items of the scrum board persistance an open source document based storage was used.
With the help of mongoose could the node application easily acces the database over the REST API.
You find the API of this scrum board available under [/api/todos](http://enigmatic-everglades-9286.herokuapp.com/api/todos).

Testing
==========
* [QUnit](https://qunitjs.com/)
 
The QUnit testing framework provides differend tools to test your web application. 
The tests will can be accessed over [/test](http://enigmatic-everglades-9286.herokuapp.com/test).





