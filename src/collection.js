'use strict';

/**
 * Allows the edm-collection to evaluate as an instance of Array.
 * @returns {Array}
 * @constructor
 */
function CollectionHelper() {
    var array = Object.create( Array.prototype );
    CollectionHelper.injectClassMethods( array );
    return array;
}

/**
 * Iterates through every Array prototype method and attaches each one to the Collection class.
 * @param {Array} array The array constructor function to enhance.
 * @returns {*}
 */
CollectionHelper.injectClassMethods = function ( array ) {

    var ignoredMethods = ['push', 'unshift', 'pop', 'concat', 'map', 'slice', 'splice'];
    for (var method in CollectionHelper.prototype) {
        if (CollectionHelper.prototype.hasOwnProperty( method ) && ignoredMethods.indexOf( method ) === -1) {
            array[method] = CollectionHelper.prototype[method];
        }
    }

    // Ensure isArray responds properly for both arrays and collections.
    var _previous = Array.isArray;
    Array.isArray = function ( obj ) {
        if (obj instanceof Collection) {
            return true;
        }
        return _previous( obj );
    };

    return ( array );
};

/**
 * A edm-collection provides fast searching by maintaining an associated hash table.
 * Collections have the full functionality of an array but can additionally lookup
 * items by an id via the hash table.
 * @param {*} [data] Optional data may be an array or a hash object.
 * @param {string} [idName] Optional id name, defaults to 'id'.
 * @constructor
 */
function Collection( data, idName ) {

    /**
     * Holds the hash table, should never be accessed directly.
     * @type {Object}
     * @private
     */
    this._hash = {};

    /**
     * Holds hash/array indices, should never be access directly.
     * @type {Object}
     * @private
     */
    this._indices = {};

    // The constructor is overloaded, you can send in an array or a hash object.
    if (typeof data === 'string') {
        this.idName = data;
    } else if (typeof idName === 'string') {
        this.idName = idName;
    } else {
        this.idName = 'id';
    }

    // Loads the array/hash into the edm-collection.
    if (Array.isArray( data )) {
        this.appendBottom( data );
    } else if (data instanceof Object) {
        var array = _.map( data );
        this.appendBottom( array );
    }

    this._updateIndices();
}
Collection.prototype = new CollectionHelper;


/**
 * Updates the hash/array table indices.
 * @param {number} [startIndex] The starting index used to update.
 * @param {number} [endIndex] The ending index used to update.
 * @private
 */
Collection.prototype._updateIndices = function ( startIndex, endIndex ) {
    if (!startIndex) {
        startIndex = 0;
    }
    if (!endIndex) {
        endIndex = this.length;
    }
    for (var counter = startIndex; counter < endIndex; counter++) {
        this._indices[this[counter][this.idName]] = counter;
    }
};

/**
 * Adds one or more elements to the end of a edm-collection and returns the new length of the edm-collection.
 * Use when you need to add more than 10,000 items to avoid a stack error.
 * @returns {Number}
 * @private
 */
Collection.prototype.appendBottom = function ( items ) {
    var pageSize = 10000;
    var lastPage = Math.floor( items.length / pageSize );
    for (var pageIndex = 0; pageIndex <= lastPage; pageIndex++) {
        var startIndex = pageIndex * pageSize;
        var endIndex = startIndex + pageSize;
        var slicedItems = items.slice( startIndex, endIndex );
        this.push.apply( this, slicedItems );
    }
};

/**
 * Adds one or more elements to the beginning of a edm-collection and returns the new length of the edm-collection.
 * Use when you need to add more than 10,000 items to avoid a stack error.
 * @returns {Number}
 * @private
 */
Collection.prototype.appendTop = function ( items ) {
    var pageSize = 10000;
    var lastPage = Math.floor( items.length / pageSize );
    for (var pageIndex = 0; pageIndex <= lastPage; pageIndex++) {
        var startIndex = pageIndex * pageSize;
        var endIndex = startIndex + pageSize;
        var slicedItems = items.slice( startIndex, endIndex );
        this.unshift.apply( this, slicedItems );
    }
};

/**
 * Adds one or more elements to the end of a edm-collection and returns the new length of the edm-collection.
 * @returns {Number}
 * @private
 */
Collection.prototype.push = function () {
    for (var counter = 0; counter < arguments.length; counter++) {
        if (arguments[counter].hasOwnProperty( this.idName )) {
            this._hash[arguments[counter][this.idName]] = arguments[counter];
        } else {
            throw new Error( 'Objects added to the edm-collection must include a key property called \'' + this.idName + '\'' );
        }
    }

    var oldLength = this.length;
    Array.prototype.push.apply( this, arguments );
    this._updateIndices( oldLength );
    return this.length;

};

/**
 * Adds one or more elements to the beginning of an edm-collection and returns the new length of the edm-collection.
 * @returns {Number}
 * @private
 */
Collection.prototype.unshift = function () {
    for (var counter = 0; counter < arguments.length; counter++) {
        if (arguments[counter].hasOwnProperty( this.idName )) {
            this._hash[arguments[counter][this.idName]] = arguments[counter];
        } else {
            throw new Error( 'Objects added to the edm-collection must include a key property called \'' + this.idName + '\'' );
        }
    }
    var length = Array.prototype.unshift.apply( this, arguments );
    this._updateIndices();
    return length;
};

/**
 * Removes the last element from an edm-collection and returns that element. This method changes the length of the edm-collection.
 * @returns {*}
 */
Collection.prototype.pop = function () {
    var item = Array.prototype.pop( this );
    delete this._hash[item[this.idName]];
    delete this._indices[item[this.idName]];
    return item;
};

/**
 * Removes the first element from a edm-collection and returns that element. This method changes the length of the edm-collection.
 * @returns {*}
 */
Collection.prototype.shift = function () {
    var item = Array.prototype.shift( this );
    delete this._hash[item[this.idName]];
    this._updateIndices();
    return item;
};

/**
 * Returns a new edm-collection comprised of the edm-collection on which it is called joined with the edm-collection(s) and/or value(s) provided as arguments.
 * @returns {Collection}
 */
Collection.prototype.concat = function () {
    var results = Array.prototype.concat.apply( this, arguments );
    return new Collection( results, this.idName );
};

/**
 * Creates a new edm-collection with the results of calling a provided function on every element in this edm-collection.
 * @returns {Collection}
 */
Collection.prototype.map = function () {
    var results = Array.prototype.map.apply( this, arguments );
    return new Collection( results, this.idName );
};

/**
 * Returns a shallow copy of a portion of a edm-collection into a new edm-collection object.
 * @returns {Collection}
 */
Collection.prototype.slice = function () {
    var results = Array.prototype.slice.apply( this, arguments );
    return new Collection( results, this.idName );
};

/**
 * Changes the content of a edm-collection by removing existing elements and/or adding new elements.
 */
Collection.prototype.splice = function () {
    Array.prototype.splice.apply( this, arguments );
    this._hash = {};
    for (var counter = 0; counter < this.length; counter++) {
        var key = this[counter][this.idName];
        this._hash[key] = this[counter];
        this._indices[key] = counter;
    }
};

/**
 * Finds an object in the edm-collection by unique identifier.
 * @param {string} id The unique identifier.
 * @returns {*}
 */
Collection.prototype.findById = function ( id ) {
    return this._hash[id];
};

/**
 * Finds the index associated with the id provided.
 * @param {string} id The unique identifier.
 * @returns {number}
 */
Collection.prototype.indexOfId = function ( id ) {
    if (this._indices[id] >= 0) {
        return this._indices[id];
    }
    return -1;
};

/**
 * Deletes the object with the associated id.
 * @param {string} id The unique identifier.
 * @returns {number}
 */
Collection.prototype.delete = function ( id ) {
    delete this._hash[id];
    var index = this.indexOfId( id );
    if (index >= 0) {
        this.splice( index, 1 );
    }
    return index;
};

/**
 * Finds an existing item matching id and replace it.
 * @param {Object} item The item that will replace existing.
 */
Collection.prototype.replace = function ( item ) {
    this._hash[item[this.idName]] = item;
    var index = this.indexOfId( item[this.idName] );
    if (index >= 0) {
        this[index] = item;
    }
};

/**
 * Updates an existing item in the edm-collection with the values of a new item.
 * @param {*} item The item that contains updates.
 */
Collection.prototype.update = function ( item ) {
    var oldItem = this._hash[item[this.idName]];
    var key;
    for (key in item) {
        if (item.hasOwnProperty( key )) {
            oldItem[key] = item[key];
        }
    }
};

/**
 * Updates one or more existing items in the edm-collection with the values of a new item.
 * @param {Object} item An object that contains one or more properties to merge into the existing items.
 * @param {number} [startIndex] The starting index. Defaults to 0.
 * @param {number} [endIndex] The number of items to be merged, starting from the index. Defaults to Collection length.
 */
Collection.prototype.updateRange = function ( item, startIndex, endIndex ) {

    if (!startIndex) {
        startIndex = 0;
    }
    if (!endIndex) {
        endIndex = this.length;
    }
    for (var counter = startIndex; counter < endIndex; counter++) {
        var oldItem = this[counter];
        var key;
        for (key in item) {
            if (item.hasOwnProperty( key )) {
                oldItem[key] = item[key];
            }
        }
    }

};
