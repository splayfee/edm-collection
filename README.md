edm-collection 
=======

Collection class for use with Angular.  Wraps an array or an object graph and creates an associated hash map. Ensures the hash map and the array stay in sync. Fully compatible with Array and can be substituted wherever Array is used.

##Installation

You may install the application through bower. Be sure to target a specific version in order to ensure long term compatibility.

##Dependencies
**edm-collection** depends on **Lodash** for some operations.

##Usage

**WARNING** - When using Collection, you can read from the collection using bracket notation ( i.e. ``var item = items[32]``) but **you should never** assign values using bracket notation ( i.e., ``items[32] = {id:1}``).  Direct assignments are not hashed and indexed properly therefore always use the built in functions to get data into the collection (*appendTop*, *appendBottom*, *push*, *unshift*, and *splice*).

When creating a collection the constructor accepts the following optional arguments:

1. Data - Array/Object - the first argument may be an array or an object.  If an array is given **Collection** will created an associated object hash based on the array.  Similarly if an object hash is given, **Collection** will create an associated array.
2. ID Name -  String - The name of the id or key used in the object hash.  Defaults to **id**.
 
##Examples
```javascript
    var myHash = {
      '12': {siteId:'12', name: 'site1'},
      '34': {siteId:'34', name:'site2'}
      };

    var myArray = [{siteId:'56', name:'site3'}, {siteId:'78', name:'site4'}];

    var c2 = new Collection(myHash, 'siteId');
    var c3 = new Collection(myArray, 'siteId');

    // Will create a new Collection
    var c4 = c2.slice(0,1);

    console.log(c4 instanceof Collection); // true
    console.log(c4 instanceof Array); // true
    console.log(Array.isArray(c4)); //true

    var foundItem = c2.findById('34');
    console.log('found: ', foundItem);
    
```
**IMPORTANT** - All methods found on **Array** that return new a new **Array** are available on Collection but will return a **Collection** instance rather than an **Array** instance.  This is the desired behavior.

##Additional Methods

The following methods are available in addition to all standard Array methods:

1. **Collection.prototype.findById** - Finds an object in the array by unique identifier. **Arguments** - id of type String.
2.  **Collection.prototype.indexOfId** - Finds the index associated with the id provided. **Arguments** - id of type String.
3.  **Collection.prototype.delete** - Deletes the object with the associated id. **Arguments** - id of type String.
4.  **Collection.prototype.replace** - Finds an existing item matching id and replace it. **Arguments** - item of type Object.
5.  **Collection.prototype.update** - Updates an existing item in the collection with the values of a new item. **Arguments** - item of type Object.
6.  **Collection.prototype.updateRange** - Updates one or more existing items in the collection with the values of a new item. **Arguments** - item of type Object, start of type Number defaults to 0, length of type Number defaults to Collection length. Use when you need to push more than 10,000 records to avoid a stack error.
7.  **Collection.prototype.appendTop** - Similar to push, adds one or more elements to the beginning of a collection and returns the new length of the collection. Use when you need to add more than 10,000 items to avoid a stack error. **Arguments** - items of type Array.
8.  **Collection.prototype.appendBottom** - Adds one or more elements to the end of a collection and returns the new length of the collection. Use when you need to add more than 10,000 items to avoid a stack error. **Arguments** - items of type Array.
