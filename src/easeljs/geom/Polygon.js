/**
 * @module EaselJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
    "use strict";

    /**
     * @author Adrien Brault <adrien.brault@gmail.com>
     */

    /**
     * @class Polygon
     * @constructor
     * @param points* {Array<Point>|Array<Number>|Point...|Number...} This can be an array of Points that form the polygon,
     *      a flat array of numbers that will be interpreted as [x,y, x,y, ...], or the arguments passed can be
     *      all the points of the polygon e.g. `new createjs.Polygon(new createjs.Point(), new createjs.Point(), ...)`, or the
     *      arguments passed can be flat x,y values e.g. `new createjs.Polygon(x,y, x,y, x,y, ...)` where `x` and `y` are
     *      Numbers.
     */
    var Polygon = function(points)
    {
        //if points isn't an array, use arguments as the array
        if(!(points instanceof Array))
            points = Array.prototype.slice.call(arguments);

        //if this is a flat array of numbers, convert it to points
        if(typeof points[0] === 'number') {
            var p = [];
            for(var i = 0, il = points.length; i < il; i+=2) {
                p.push(
                    new createjs.Point(points[i], points[i + 1])
                );
            }

            points = p;
        }

    	this.points = points;
    }
    var p = Polygon.prototype;

    /**
     * Creates a clone of this polygon
     *
     * @method clone
     * @return {Polygon} a copy of the polygon
     */
    p.clone = function()
    {
    	var points = [];
    	for (var i=0; i<this.points.length; i++) {
    		points.push(this.points[i].clone());
    	}

    	return new Polygon(points);
    }

    /**
     * Checks if the x, and y coords passed to this function are contained within this polygon
     *
     * @method contains
     * @param x {Number or Point} The X coord of the point to test (or Point instance)
     * @param y {Number} The Y coord of the point to test
     * @return {Boolean} if the x/y coords are within this polygon
     */
    p.contains = function(x, y)
    {
      if (x.hasOwnProperty("x")) {
        //x is a Point
        y = x.y;
        x = x.x;
      }

      var inside = false;

        // use some raycasting to test hits
        // https://github.com/substack/point-in-polygon/blob/master/index.js
    	var p = this.points;
        for(var i = 0, len = p.length, j = p.length - 1; i < len; j = i++) {
    		var pi = p[i], pj = p[j];
            var xi = pi.x, yi = pi.y,
                xj = pj.x, yj = pj.y,
                intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if(intersect) inside = !inside;
        }

        return inside;
    }

    // constructor
    p.constructor = Polygon;

    createjs.Polygon = Polygon;
}());
