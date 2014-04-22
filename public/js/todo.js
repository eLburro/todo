$(function() {

    /********************************* 
    *  TodoItem Model
    *********************************/
    window.TodoItem = Backbone.Model.extend({
        idAttribute: "_id",
        // default attributes for an item.
        defaults: function() {
            return {
                done: false,
                prio: 3,
                list: 1
            };
        },
        // toggle the done state of this item.
        toggle: function() {
            this.save({done: !this.get("done")});
        }
    });


    /********************************* 
    *  TodoItem Collection
    *  
    *  Instead of the local storage it directes to the MongoDB API
    *  /api/todos which is defined in the app.js file for persistance
    *********************************/
    window.TodoList = Backbone.Collection.extend({
        model: TodoItem,
        // store under /api/todos
        url: '/api/todos',
        
        // count all items of a list
        countList: function(list) {
            return this.filter(function(todo) {
                return (todo.get('list') === list);
            });
        },
        
        // counts all finished items of a list
        done: function(list) {
            return this.filter(function(todo) {
                return (todo.get('done') && todo.get('list') == list);
            });
        },
        
        // counts all unfinished items of a list
        remaining: function(list) {
            return (this.countList(list).length - this.done(list).length);
        },
        
        // sort the items by priority
        comparator: function(todo) {
            return todo.get('prio');
        }
    });

    // create an instance of the collection
    window.ListTodos = new TodoList;


    /********************************* 
    *  TodoItem View
    *  
    *  Represents a todo item in the DOM as 'li' tag
    *********************************/
    window.TodoView = Backbone.View.extend({
        tagName: "li",
        template: _.template($('#item-template').html()),
        
        events: {
            "click .check": "toggleDone",
            "dblclick div.todo-title": "edit",
            "dblclick div.todo-description": "edit",
            "dblclick div.todo-author": "edit",
            "keypress .todo-input": "updateOnEnter",
            "change .prio": "close",
            "change .list": "close"
        },
        
        // listen to the model events and rerender 
        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },
        
        // render the contents inside a jade template
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.setText();
            return this;
        },
        
        // set the content of an item
        setText: function() {
            var title = this.model.get('title');
            var description = this.model.get('description');
            var author = this.model.get('author');
            var prio = this.model.get('prio');
            var list = this.model.get('list');
            
            this.$('.todo-title').text(title);
            this.$('.todo-description').text(description);
            this.$('.todo-author').text(author);
            this.$('.todo-prio').text(prio);
            this.$('.todo-list-right').text(list);
            
            this.inputTitle = this.$('.todo-input.title');
            this.inputDescription = this.$('.todo-input.description');
            this.inputAuthor = this.$('.todo-input.author');
            this.inputPrio = this.$('.todo-input.prio');
            this.inputList = this.$('.todo-input.list');
            
            this.inputTitle.val(title);
            this.inputDescription.val(description);
            this.inputAuthor.val(author);
            this.inputPrio.val(prio);
            this.inputList.val(list);
        },
        
        // toggle the done state of the model
        toggleDone: function() {
            this.model.toggle();
        },
        
        // display the editing input fields and hide the normal display
        edit: function(e) {
            var currentField = $(e.currentTarget);
            $(".editing").removeClass("editing");
            currentField.closest("li").addClass("editing");
            this.inputTitle.focus();
        },
        
        // close the editing view and saves the modified content
        close: function() {
            this.model.save({title: this.inputTitle.val(), 
                description: this.inputDescription.val(),
                author: this.inputAuthor.val(),
                prio: this.inputPrio.val(),
                list: this.inputList.val()});
            $(this.el).removeClass("editing");
        },
        
        // call close after enter is pressed inside editing input field
        updateOnEnter: function(e) {
            if (e.keyCode == 13)
                this.close();
        },
        
        // remove view from the DOM
        remove: function() {
            $(this.el).remove();
        }
    });


    /********************************* 
    *  Application View
    *  
    *  Represents the application view and handles all the collection events. 
    *********************************/
    window.AppView = Backbone.View.extend({
        el: $(".container"),
        statsTemplate: _.template($('#stats-template').html()),
        
        events: {
            "click .new-todo": "createNewItem",
            "click .todo-clear a": "clearCompleted"
        },

        initialize: function() {  
            this.input = this.$(".create-todo");
            
            // bind events to the collection to get and set from the MongoDB
            ListTodos.bind('add', this.addOne, this);
            ListTodos.bind('reset', this.addAll, this);
            ListTodos.bind('all', this.render, this);
            ListTodos.bind('change', this.addAll, this);
            ListTodos.fetch();
        },
        
        // update the statistics
        render: function() {
            var listArrayClasses = ['.todoapp', '.inprogressapp', '.doneapp'];
            
            for (var i = 1; i <= 3; i++) {
                this.$(listArrayClasses[i-1] + ' .todo-stats').html(this.statsTemplate({
                    total: ListTodos.countList(i).length,
                    done: ListTodos.done(i).length,
                    remaining: ListTodos.remaining(i),
                    list: i
                }));
            }
        },
        
        // append an item element to the view
        addOne: function(todo) {
            var view = new TodoView({model: todo});
            
            // move the item to the correct list
             switch (String(todo.get('list'))) {
                case '1': this.$(".todoapp .todo-list").append(view.render().el); break;
                case '2': this.$(".inprogressapp .todo-list").append(view.render().el); break;
                case '3': this.$(".doneapp .todo-list").append(view.render().el); break;
            }    
        },
        
        // add all items at once
        addAll: function() {
            // ListTodos.models.each(this.addOne);
            var that = this;
            
            //otherwise old stories are in the wrong list
            $(".todoapp .todo-list").empty();
            $(".inprogressapp .todo-list").empty();
            $(".doneapp .todo-list").empty();
            
            _.each(ListTodos.models, function(todo) {
                that.addOne(todo);
            })
        },
        
        // create a new item and persist it to the MongoDB
        createNewItem: function(e) {
            var container = this.input;
            var title = container.find(".title").val();
            var description = container.find(".description").val();
            var prio = container.find(".prio").val();
            var author = container.find(".author").val();
            var list = container.find(".list").val();

            if (!title || !description || !author)
                return;
            
            ListTodos.create({title: title, description: description, prio: prio, author: author, list: list});

            // reset the create item inputs
            container.find(".title").val('');
            container.find(".description").val('');
            container.find(".prio").val('3');
            container.find(".author").val('');
            container.find(".list").val('1');
        },
        
        // clear all items and destroy the model
        clearCompleted: function(e) {
            var list = e.currentTarget.attributes[1].value;
            _.each(ListTodos.done(list), function(todo) {
                todo.destroy();
            });
            return false;
        }
    });
    

    // instance of the application view
    window.App = new AppView;
});