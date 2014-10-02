/**
 * @module EaselJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
    "use strict";

    /**
     * @author Chad Engler <chad@pantherdev.com>
     */

    /**
     * The Circle object can be used to specify a hit area for displayobjects
     *
     * @class Circle
     * @constructor
     * @param x {Number} The X coord of the center of this circle
     * @param y {Number} The Y coord of the center of this circle
     * @param radius {Number} The radius of the circle
     */
    var Circle = function(x, y, radius)
    {
        /**
         * @property x
         * @type Number
         * @default 0
         */
        this.x = x || 0;

        /**
         * @property y
         * @type Number
         * @default 0
         */
        this.y = y || 0;

        /**
         * @property radius
         * @type Number
         * @default 0
         */
        this.radius = radius || 0;
    }

    var p = Circle.prototype;

    /**
     * Creates a clone of this Circle instance
     *
     * @method clone
     * @return {Circle} a copy of the circle
     */
    p.clone = function()
    {
        return new Circle(this.x, this.y, this.radius);
    }

    /**
     * Checks if the x, and y coords passed to this function are contained within this circle
     *
     * @method contains
     * @param x {Number or Point} The X coord of the point to test (or Point instance)
     * @param y {Number} The Y coord of the point to test
     * @return {Boolean} if the x/y coords are within this circle
     */
    p.contains = function(x, y)
    {
        if(this.radius <= 0)
            return false;

        if (x.hasOwnProperty("x")) {
          //x is a Point
          y = x.y;
          x = x.x;
        }

        var dx = (this.x - x),
            dy = (this.y - y),
            r2 = this.radius * this.radius;

        dx *= dx;
        dy *= dy;

        return (dx + dy <= r2);
    }

    // constructor
    p.constructor = Circle;

    createjs.Circle = Circle;
}());
