/*
* Point
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * @module EaselJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
	"use strict";

/**
 * Represents a point on a 2 dimensional x / y coordinate system.
 *
 * <h4>Example</h4>
 * 
 *      var point = new createjs.Point(0, 100);
 * 
 * @class Point
 * @param {Number} [x=0] X position.
 * @param {Number} [y=0] Y position.
 * @constructor
 **/
var Point = function(x, y) {
  this.initialize(x, y);
};
var p = Point.prototype;

// public properties:

	/**
	 * X position.
	 * @property x
	 * @type Number
	 **/
	p.x = 0;

	/**
	 * Y position.
	 * @property y
	 * @type Number
	 **/
	p.y = 0;

// constructor:
	/** 
	 * Initialization method. Can also be used to reinitialize the instance.
	 * @method initialize
	 * @param {Number} [x=0] X position.
	 * @param {Number} [y=0] Y position.
	 * @return {Point} This instance. Useful for chaining method calls.
	*/
	p.initialize = function(x, y) {
		this.x = (x == null ? 0 : x);
		this.y = (y == null ? 0 : y);
		return this;
	};
	
// public methods:
	/**
	 * Copies all properties from the specified point to this point.
	 * @method copy
	 * @param {Point} point The point to copy properties from.
	 * @return {Point} This point. Useful for chaining method calls.
	*/
	p.copy = function(point) {
		return this.initialize(point.x, point.y);
	};
	
	/**
	 * Returns a clone of the Point instance.
	 * @method clone
	 * @return {Point} a clone of the Point instance.
	 **/
	p.clone = function() {
		return new Point(this.x, this.y);
	};

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Point (x="+this.x+" y="+this.y+")]";
	};

	/**
	 * Returns the dot product between this point and another one.
	 * @method dotProd 
	 * @param other {Point} The point to form a dot product with
	 * @return The dot product between the two points.
	 */
	p.dotProd = function(other)
	{
		return this.x * other.x + this.y * other.y;
	};

	/**
	 * Returns the length (or magnitude) of this point.
	 * @method length
	 * @return The length of this point.
	 */
	p.length = function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	/**
	 * Returns the squared length (or magnitude) of this point. This is faster than length().
	 * @method lengthSq
	 * @return The length squared of this point.
	 */
	p.lengthSq = function()
	{
		return this.x * this.x + this.y * this.y;
	};

	/**
	 * Reduces the point to a length of 1.
	 * @method normalize
	 */
	p.normalize = function()
	{
		var oneOverLen = 1 / this.length();
		this.x *= oneOverLen;
		this.y *= oneOverLen;
	};

	/**
	 * Subtracts the x and y values of a point from this point.
	 * @method subtract 
	 * @param other {Point} The point to subtract from this one
	 */
	p.subtract = function(other)
	{
		this.x -= other.x;
		this.y -= other.y;
	};

	/**
	 * Adds the x and y values of a point to this point.
	 * @method add 
	 * @param other {Point} The point to add to this one
	 */
	p.add = function(other)
	{
		this.x += other.x;
		this.y += other.y;
	};

	/**
	 * Truncate the length of the point to a maximum.
	 * @method truncate 
	 * @param maxLength {Number} The maximum length to allow in this point.
	 */
	p.truncate = function(maxLength)
	{
		var l = this.length();
		if(l > maxLength)
		{
			var maxOverLen = maxLength / l;
			this.x *= maxOverLen;
			this.y *= maxOverLen;	
		}
	};

	/**
	 * Multiplies the x and y values of this point by a value.
	 * @method scaleBy 
	 * @param value {Number} The value to scale by.
	 */
	p.scaleBy = function(value)
	{
		this.x *= value;
		this.y *= value;
	};

	/**
	 * Calculates the distance between this and another point.
	 * @method distance 
	 * @param other {Point} The point to calculate the distance to.
	 * @return {Number} The distance.
	 */
	p.distance = function(other)
	{
		var xDiff = this.x - other.x;
		var yDiff = this.y - other.y;
		return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
	};

	/**
	 * Calculates the squared distance between this and another point.
	 * @method distanceSq 
	 * @param other {Point} The point to calculate the distance to.
	 * @return {Number} The distance squared.
	 */
	p.distanceSq = function(other)
	{
		var xDiff = this.x - other.x;
		var yDiff = this.y - other.y;
		return xDiff * xDiff + yDiff * yDiff;
	};
	
createjs.Point = Point;
}());
