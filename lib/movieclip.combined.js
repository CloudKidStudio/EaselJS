/*
* MovieClip
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
 * The MovieClip class associates a TweenJS Timeline with an EaselJS {{#crossLink "Container"}}{{/crossLink}}. It allows
 * you to create objects which encapsulate timeline animations, state changes, and synched actions. Due to the
 * complexities inherent in correctly setting up a MovieClip, it is largely intended for tool output and is not included
 * in the main EaselJS library.
 *
 * Currently MovieClip only works properly if it is tick based (as opposed to time based) though some concessions have
 * been made to support time-based timelines in the future.
 *
 * <h4>Example</h4>
 * This example animates two shapes back and forth. The grey shape starts on the left, but we jump to a mid-point in
 * the animation using {{#crossLink "MovieClip/gotoAndPlay"}}{{/crossLink}}.
 *
 *      var stage = new createjs.Stage("canvas");
 *      createjs.Ticker.addEventListener("tick", stage);
 *
 *      var mc = new createjs.MovieClip(null, 0, true, {start:20});
 *      stage.addChild(mc);
 *
 *      var child1 = new createjs.Shape(
 *          new createjs.Graphics().beginFill("#999999")
 *              .drawCircle(30,30,30));
 *      var child2 = new createjs.Shape(
 *          new createjs.Graphics().beginFill("#5a9cfb")
 *              .drawCircle(30,30,30));
 *
 *      mc.timeline.addTween(
 *          createjs.Tween.get(child1)
 *              .to({x:0}).to({x:60}, 50).to({x:0}, 50));
 *      mc.timeline.addTween(
 *          createjs.Tween.get(child2)
 *              .to({x:60}).to({x:0}, 50).to({x:60}, 50));
 *
 *      mc.gotoAndPlay("start");
 *
 * It is recommended to use <code>tween.to()</code> to animate and set properties (use no duration to have it set
 * immediately), and the <code>tween.wait()</code> method to create delays between animations. Note that using the
 * <code>tween.set()</code> method to affect properties will likely not provide the desired result.
 *
 * @class MovieClip
 * @main MovieClip
 * @extends Container
 * @constructor
 * @param {String} [mode=independent] Initial value for the mode property. One of MovieClip.INDEPENDENT,
 * MovieClip.SINGLE_FRAME, or MovieClip.SYNCHED. The default is MovieClip.INDEPENDENT.
 * @param {Number} [startPosition=0] Initial value for the startPosition property.
 * @param {Boolean} [loop=true] Initial value for the loop property. The default is true.
 * @param {Object} [labels=null] A hash of labels to pass to the timeline instance associated with this MovieClip.
 * Labels only need to be passed if they need to be used.
 **/
var MovieClip = function(mode, startPosition, loop, labels) {
  this.initialize(mode, startPosition, loop, labels);
};
var p = MovieClip.prototype = new createjs.Container();

	/**
	 * The MovieClip will advance independently of its parent, even if its parent is paused.
	 * This is the default mode.
	 * @property INDEPENDENT
	 * @static
	 * @type String
	 * @default "independent"
	 * @readonly
	 **/
	MovieClip.INDEPENDENT = "independent";

	/**
	 * The MovieClip will only display a single frame (as determined by the startPosition property).
	 * @property SINGLE_FRAME
	 * @static
	 * @type String
	 * @default "single"
	 * @readonly
	 **/
	MovieClip.SINGLE_FRAME = "single";

	/**
	 * The MovieClip will be advanced only when its parent advances and will be synched to the position of
	 * the parent MovieClip.
	 * @property SYNCHED
	 * @static
	 * @type String
	 * @default "synched"
	 * @readonly
	 **/
	MovieClip.SYNCHED = "synched";

// public properties:

	/**
	 * Controls how this MovieClip advances its time. Must be one of 0 (INDEPENDENT), 1 (SINGLE_FRAME), or 2 (SYNCHED).
	 * See each constant for a description of the behaviour.
	 * @property mode
	 * @type String
	 * @default null
	 **/
	p.mode;

	/**
	 * Specifies what the first frame to play in this movieclip, or the only frame to display if mode is SINGLE_FRAME.
	 * @property startPosition
	 * @type Number
	 * @default 0
	 */
	p.startPosition = 0;

	/**
	 * Indicates whether this MovieClip should loop when it reaches the end of its timeline.
	 * @property loop
	 * @type Boolean
	 * @default true
	 */
	p.loop = true;

	/**
	 * The current frame of the movieclip.
	 * @property currentFrame
	 * @type Number
	 * @default 0
	 * @readonly
	 */
	p.currentFrame = 0;

	/**
	 * The TweenJS Timeline that is associated with this MovieClip. This is created automatically when the MovieClip
	 * instance is initialized. Animations are created by adding <a href="http://tweenjs.com">TweenJS</a> Tween
	 * instances to the timeline.
	 *
	 * <h4>Example</h4>
	 *
	 *      var tween = createjs.Tween.get(target).to({x:0}).to({x:100}, 30);
	 *      var mc = new createjs.MovieClip();
	 *      mc.timeline.addTween(tween);
	 *
	 * Elements can be added and removed from the timeline by toggling an "_off" property
	 * using the <code>tweenInstance.to()</code> method. Note that using <code>Tween.set</code> is not recommended to
	 * create MovieClip animations. The following example will toggle the target off on frame 0, and then back on for
	 * frame 1. You can use the "visible" property to achieve the same effect.
	 *
	 *      var tween = createjs.Tween.get(target).to({_off:false})
	 *          .wait(1).to({_off:true})
	 *          .wait(1).to({_off:false});
	 *
	 * @property timeline
	 * @type Timeline
	 * @default null
	 */
	p.timeline = null;

	/**
	 * If true, the MovieClip's position will not advance when ticked.
	 * @property paused
	 * @type Boolean
	 * @default false
	 */
	p.paused = false;

	/**
	 * If true, actions in this MovieClip's tweens will be run when the playhead advances.
	 * @property actionsEnabled
	 * @type Boolean
	 * @default true
	 */
	p.actionsEnabled = true;

	/**
	 * If true, the MovieClip will automatically be reset to its first frame whenever the timeline adds
	 * it back onto the display list. This only applies to MovieClip instances with mode=INDEPENDENT.
	 * <br><br>
	 * For example, if you had a character animation with a "body" child MovieClip instance
	 * with different costumes on each frame, you could set body.autoReset = false, so that
	 * you can manually change the frame it is on, without worrying that it will be reset
	 * automatically.
	 * @property autoReset
	 * @type Boolean
	 * @default true
	 */
	p.autoReset = true;
	
	/**
	 * If true, the MovieClip will advance its timeline during ticks. If false then it must be externally advanced.
	 * @property advanceDuringTicks
	 * @type Boolean
	 * @default true
	 */
	p.advanceDuringTicks = true;

	/**
	 * An array of bounds for each frame in the MovieClip. This is mainly intended for tool output.
	 * @property frameBounds
	 * @type Array
	 * @default null
	 */
	p.frameBounds = null;

	/**
	 * By default MovieClip instances advance one frame per tick. Specifying a framerate for the MovieClip
	 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	 * framerate.
	 *
	 * For example, if a MovieClip with a framerate of 10 is placed on a Stage being updated at 40fps, then the MovieClip will
	 * advance roughly one frame every 4 ticks. This will not be exact, because the time between each tick will
	 * vary slightly between frames.
	 *
	 * This feature is dependent on the tick event object (or an object with an appropriate "delta" property) being
	 * passed into {{#crossLink "Stage/update"}}{{/crossLink}}.
	 * @property framerate
	 * @type {Number}
	 * @default 0
	 **/
	Object.defineProperty(p, 'framerate', {
	    get: function() {
	        return this._framerate;
	    },
	    set: function(value) {
	    	if(value > 0)
	    	{
				this._framerate = value;
				this._duration = value ? this.timeline.duration / value : 0;
			}
			else
				this._framerate = this._duration = 0;
	    }
	});

	/**
	 * When the MovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * @property elapsedTime
	 * @type Number
	 * @default 0
	 * @public
	 */
	Object.defineProperty(p, 'elapsedTime', {
	    get: function() {
	        return this._t;
	    },
	    set: function(value) {
			this._t = value;
	    }
	});
	
// private properties:	
	
	/**
	 * This is the MovieClip's target animation rate - the rate at which the animation was created. When it is non-zero,
	 * the animation is considered framerate independent. This property is deprecated in favor of framerate.
	 * @property _animFrameRate
	 * @type Number
	 * @default 0
	 * @private
	 * @deprecated
	 */
	Object.defineProperty(p, '_animFrameRate', {
	    get: function() {
	        return this._framerate;
	    },
	    set: function(value) {
			this._framerate = value;
	    }
	});

	/**
	 * By default MovieClip instances advance one frame per tick. Specifying a framerate for the MovieClip
	 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	 * framerate.
	 * 
	 * @property _framerate
	 * @type {Number}
	 * @default 0
	 **/
	p._framerate = 0;
	
	/**
	 * When the MovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * This is deprecated in favor of _t, which has had its functionality changed to match _elapsed time.
	 * @property _elapsedTime
	 * @type Number
	 * @default 0
	 * @private
	 * @deprecated
	 */
	Object.defineProperty(p, '_elapsedTime', {
	    get: function() {
	        return this._t;
	    },
	    set: function(value) {
			this._t = value;
	    }
	});
	
	/**
	 * When the MovieClip is framerate independent, this is the total time in seconds for the animation.
	 * @property _duration
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._duration = 0;

	/**
	 * @property _synchOffset
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._synchOffset = 0;

	/**
	 * @property _prevPos
	 * @type Number
	 * @default -1
	 * @private
	 */
	p._prevPos = -1; // TODO: evaluate using a ._reset Boolean prop instead of -1.

	/**
	 * @property _prevPosition
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._prevPosition = 0;

	/**
	 * When the MovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * @property _t
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._t = 0;

	/**
	 * List of display objects that are actively being managed by the MovieClip.
	 * @property _managed
	 * @type Object
	 * @private
	 */
	p._managed;

// constructor:

	/**
	 * @property DisplayObject_initialize
	 * @type Function
    * @private
	 **/
	p.Container_initialize = p.initialize;

	/** 
	 * Initialization method called by the constructor.
	 * @method initialize
	 * @param {String} [mode=independent] Initial value for the mode property. One of MovieClip.INDEPENDENT,
	 * MovieClip.SINGLE_FRAME, or MovieClip.SYNCHED. The default is MovieClip.INDEPENDENT.
	 * @param {Number} [startPosition=0] Initial value for the startPosition property.
	 * @param {Boolean} [loop=true] Initial value for the loop property. The default is true.
	 * @param {Object} [labels=null] A hash of labels to pass to the timeline instance associated with this MovieClip.
	 * Labels only need to be passed if they need to be used.
	 * @protected
	 **/
	p.initialize = function(mode, startPosition, loop, labels) {
		this.mode = mode||MovieClip.INDEPENDENT;
		this.startPosition = startPosition || 0;
		this.loop = loop;
		var props = {paused:true, position:startPosition, useTicks:true};
		this.Container_initialize();
		this.timeline = new createjs.Timeline(null, labels, props);
		this._managed = {};
	};
	
// public methods:
	/**
	 * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
	 * This does not account for whether it would be visible within the boundaries of the stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		// children are placed in draw, so we can't determine if we have content.
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0);
	};

	/**
	 * @property Container_draw
	 * @type Function
	 * @private
	 **/
	p.Container_draw = p.draw;

	/**
	 * Draws the display object into the specified context ignoring its visible, alpha, shadow, and transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache.
	 * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
	 * into itself).
	 **/
	p.draw = function(ctx, ignoreCache) {
		// draw to cache first:
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this._updateTimeline();
		this.Container_draw(ctx, ignoreCache);
		return true;
	};
	
	/**
	 * Enables framerate independence for this MovieClip. Only works if mode is "indpendent". This is deprecated in favor of the fps setter.
	 * @method enableFramerateIndependence
	 * @param {Number} fps The rate at which the animation should animate at. Use 0 to disable framerate independence.
	 * @deprecated
	 */
	p.enableFramerateIndependence = function(fps)
	{
		if(!this.mode == MovieClip.INDEPENDENT)//only allowed for independent movieclips
			return;
		
		this.framerate = fps;
	}
	
	/**
	 * Gets the animation framerate for this MovieClip. This is deprecated in favor of the framerate property.
	 * @method getAnimFrameRate
	 * @deprecated
	 */
	p.getAnimFrameRate = function()
	{
		return this.framerate;
	}
	
	/**
	 * Sets paused to false.
	 * @method play
	 **/
	p.play = function() {
		this.paused = false;
	};
	
	/**
	 * Sets paused to true.
	 * @method stop
	 **/
	p.stop = function() {
		this.paused = true;
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to false.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 **/
	p.gotoAndPlay = function(positionOrLabel) {
		this.paused = false;
		this._goto(positionOrLabel);
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to true.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 **/
	p.gotoAndStop = function(positionOrLabel) {
		this.paused = true;
		this._goto(positionOrLabel);
	};
	
	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in ms to advance by. Only applicable if framerate is set.
	 * @method advance
	*/
	p.advance = function(time) {
		// TODO: should we worry at all about clips who change their own modes via frame scripts?
		var independent = MovieClip.INDEPENDENT;
		if (this.mode != independent) { return; }
		
		var o=this, fps = o._framerate;
		if(!fps)
		{
			while (fps == null && (o = o.parent)) {
				if (o.mode == independent) { fps = o._framerate; }
			}
			this.framerate = fps;
		}
		
		//CloudKid code
		if(!this.paused)
		{
			if(fps > 0)
			{
				if(this.advanceDuringTicks)
					this._t += time * 0.001;//milliseconds -> seconds
				if(this._t > this._duration)
					this._t = this.timeline.loop ? this._t - this._duration : this._duration;
				this._prevPosition = Math.floor(this._t * this._framerate);
				if(this._prevPosition > this.timeline.duration)
					this._prevPosition = this.timeline.duration;
			}
			else if(this.advanceDuringTicks)
				this._prevPosition = (this._prevPos < 0) ? 0 : this._prevPosition+1;
			this._updateTimeline();
		}
		//end CloudKid code
		
		/* old code from CreateJS
		var t = (fps != null && fps != -1 && time != null) ? time/(1000/fps) + this._t : 1;
		var frames = t|0;
		this._t = t-frames;
		
		while (frames--) {
			if (!this.paused) {
				this._prevPosition = (this._prevPos < 0) ? 0 : this._prevPosition+1;
				this._updateTimeline();
			}
		}
		*/
	};
	
	/**
	 * Returns a sorted list of the labels defined on this MovieClip. Shortcut to TweenJS: Timeline.getLabels();
	 * @method getLabels
	 * @return {Array[Object]} A sorted array of objects with label and position (aka frame) properties.
	 **/
	p.getLabels = function() {
		return this.timeline.getLabels();
	};
	
	/**
	 * Returns the name of the label on or immediately before the current frame. See TweenJS: Timeline.getCurrentLabel()
	 * for more information.
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label.
	 **/
	p.getCurrentLabel = function() {
		this._updateTimeline();
		return this.timeline.getCurrentLabel();
	};
	
	/**
	 * MovieClip instances cannot be cloned.
	 * @method clone
	 **/
	p.clone = function() {
		// TODO: add support for this? Need to clone the Timeline & retarget tweens - pretty complex.
		throw("MovieClip cannot be cloned.")
	};
	
	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[MovieClip (name="+  this.name +")]";
	};

// private methods:

	/**
	 * @property Container__tick
	 * @type Function
	 * @protected
	 **/
	p.Container__tick = p._tick;

	/**
	 * @method _tick
	 * @param {Object} props Properties to copy to the DisplayObject {{#crossLink "DisplayObject/tick"}}{{/crossLink}} event object.
	 * function.
	 * @protected
	 **/
	p._tick = function(props) {
		this.advance(props&&props.delta);
		this.Container__tick(props);
	};
	
	/**
	 * @method _goto
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 * @protected
	 **/
	p._goto = function(positionOrLabel) {
		var pos = this.timeline.resolve(positionOrLabel);
		if (pos == null) { return; }
		// prevent _updateTimeline from overwriting the new position because of a reset:
		if (this._prevPos == -1) { this._prevPos = NaN; }
		this._prevPosition = pos;
		if(this._framerate > 0)
			this._t = pos / this._framerate;
		else
			this._t = 0;
		this._updateTimeline();
	};
	
	/**
	 * @method _reset
	 * @private
	 **/
	p._reset = function() {
		this._prevPos = -1;
		this._t = 0;
		this.currentFrame = 0;
	};
	
	/**
	 * @method _updateTimeline
	 * @protected
	 **/
	p._updateTimeline = function() {
		var tl = this.timeline;
		var synched = this.mode != MovieClip.INDEPENDENT;
		tl.loop = (this.loop==null) ? true : this.loop;

		// update timeline position, ignoring actions if this is a graphic.
		if (synched) {
			tl.setPosition(this.startPosition + (this.mode==MovieClip.SINGLE_FRAME?0:this._synchOffset), createjs.Tween.NONE);
		} else {
			tl.setPosition(this._prevPos < 0 ? 0 : this._prevPosition, this.actionsEnabled ? null : createjs.Tween.NONE);
		}

		this._prevPosition = tl._prevPosition;
		if (this._prevPos == tl._prevPos) { return; }
		this.currentFrame = this._prevPos = tl._prevPos;

		for (var n in this._managed) { this._managed[n] = 1; }

		var tweens = tl._tweens;
		for (var i=0, l=tweens.length; i<l; i++) {
			var tween = tweens[i];
			var target = tween._target;
			if (target == this || tween.passive) { continue; } // TODO: this assumes actions tween has this as the target. Valid?
			var offset = tween._stepPosition;

			if (target instanceof createjs.DisplayObject) {
				// motion tween.
				this._addManagedChild(target, offset);
			} else {
				// state tween.
				this._setState(target.state, offset);
			}
		}

		var kids = this.children;
		for (i=kids.length-1; i>=0; i--) {
			var id = kids[i].id;
			if (this._managed[id] == 1) {
				this.removeChildAt(i);
				delete(this._managed[id]);
			}
		}
	};

	/**
	 * @method _setState
	 * @param {Array} state
	 * @param {Number} offset
	 * @protected
	 **/
	p._setState = function(state, offset) {
		if (!state) { return; }
		for (var i=state.length-1;i>=0;i--) {
			var o = state[i];
			var target = o.t;
			var props = o.p;
			for (var n in props) { target[n] = props[n]; }
			this._addManagedChild(target, offset);
		}
	};

	/**
	 * Adds a child to the timeline, and sets it up as a managed child.
	 * @method _addManagedChild
	 * @param {MovieClip} child The child MovieClip to manage
	 * @param {Number} offset
	 * @private
	 **/
	p._addManagedChild = function(child, offset) {
		if (child._off) { return; }
		this.addChildAt(child,0);

		if (child instanceof MovieClip) {
			child._synchOffset = offset;
			// TODO: this does not precisely match Flash. Flash loses track of the clip if it is renamed or removed from the timeline, which causes it to reset.
			if (child.mode == MovieClip.INDEPENDENT && child.autoReset && !this._managed[child.id]) { child._reset(); }
		}
		this._managed[child.id] = 2;
	};
	
	/**
	 * @method Container__getBounds
	 * @param {Matrix2D} matrix
	 * @param {Boolean} ignoreTransform
	 * @return {Rectangle}
	 * @protected
	 **/
	p.Container__getBounds = p._getBounds;
	
	/**
	 * @method _getBounds
	 * @param {Matrix2D} matrix
	 * @param {Boolean} ignoreTransform
	 * @return {Rectangle}
	 * @protected
	 **/
	p._getBounds = function(matrix, ignoreTransform) {
		var bounds = this.DisplayObject_getBounds();
		if (!bounds) {
			this._updateTimeline();
			if (this.frameBounds) { bounds = this._rectangle.copy(this.frameBounds[this.currentFrame]); }
		}
		if (bounds) { return this._transformBounds(bounds, matrix, ignoreTransform); }
		return this.Container__getBounds(matrix, ignoreTransform);
	};

createjs.MovieClip = MovieClip;



	/**
	 * This plugin works with <a href="http://tweenjs.com" target="_blank">TweenJS</a> to prevent the startPosition
	 * property from tweening.
	 * @private
	 * @class MovieClipPlugin
	 * @constructor
	 **/
	var MovieClipPlugin = function() {
	  throw("MovieClipPlugin cannot be instantiated.")
	};
	
	/**
	 * @method priority
	 * @private
	 **/
	MovieClipPlugin.priority = 100; // very high priority, should run first

	/**
	 * @method install
	 * @private
	 **/
	MovieClipPlugin.install = function() {
		createjs.Tween.installPlugin(MovieClipPlugin, ["startPosition"]);
	};
	
	/**
	 * @method init
	 * @param {Tween} tween
	 * @param {String} prop
	 * @param {String|Number|Boolean} value
	 * @private
	 **/
	MovieClipPlugin.init = function(tween, prop, value) {
		return value;
	};
	
	/**
	 * @method step
	 * @private
	 **/
	MovieClipPlugin.step = function() {
		// unused.
	};

	/**
	 * @method tween
	 * @param {Tween} tween
	 * @param {String} prop
	 * @param {String | Number | Boolean} value
	 * @param {Array} startValues
	 * @param {Array} endValues
	 * @param {Number} ratio
	 * @param {Object} wait
	 * @param {Object} end
	 * @return {*}
	 */
	MovieClipPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		if (!(tween.target instanceof MovieClip)) { return value; }
		return (ratio == 1 ? endValues[prop] : startValues[prop]);
	};

	MovieClipPlugin.install();

}());
/**
*  @module EaselJS
*/
// namespace:
this.createjs = this.createjs||{};

(function(undefined) {

	"use strict";

	/**
	*  A class similar to createjs.MovieClip, but made to play animations from a createjs.TextureAtlas.
	*  The CreateJS Sprite class requires a spritesheet with equal sized and spaced frames. By using createjs.TextureAtlas,
	*  you can use a much smaller spritesheet, sprites on screen with fewer extra transparent pixels, and use the same
	*  API as MovieClip.
	*
	*  @class BitmapMovieClip
	*  @extends createjs.Container
	*  @constructor
	*  @param {TextureAtlas} atlas=null The texture atlas to pull frames from.
	*  @param {Object} data=null Initialization data
	*   @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the current framerate.
	*   @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in playing animations.
	*   @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	*   @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	*   @param {String} [data.frames.name] The name to use for the frame sequence. This should include a "#" to be replaced with the image number.
	*   @param {int} [data.frames.min] The first frame number in the frame sequence.
	*   @param {int} [data.frames.max] The last frame number in the frame sequence.
	*   @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames, e.g. myAnim0001 has 4 digits.
	*   @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4 means the art was increased
	*          in size to 140% before exporting and should be scaled back down before drawing to the screen.
	*
	*  Format for data:
	*	{
	*		fps:30,
	*		labels:
	*		{
	*			animStart:0,
	*			animStart_loop:15
	*		},
	*		origin:{ x: 20, y:30 },
	*		frames:
	*		[
	*			{
	*				name:"myAnim#",
	*				min:1,
	*				max:20,
	*				digits:4
	*			}
	*		],
	*		scale:1
	*	}
	*
	* The object describes a 30 fps animation that is 20 frames long, and was originally myAnim0001.png->myAnim0020.png,
	* with frame labels on the first and 16th frame. 'digits' is optional, and defaults to 4.
	*/
	var BitmapMovieClip = function(atlas, data)
	{
		createjs.Container.call(this);
		this.mouseChildren = false;//mouse events should reference this, not the child bitmap
		this._bitmap = new createjs.Bitmap();
		this.addChild(this._bitmap);
		if(atlas && data)
			this.init(atlas, data);
	};

	var p = BitmapMovieClip.prototype = new createjs.Container();
	var s = createjs.Container.prototype;

	//==== Public properties =====

	/**
	 * Indicates whether this BitmapMovieClip should loop when it reaches the end of its timeline.
	 * @property loop
	 * @type Boolean
	 * @default true
	 */
	p.loop = true;

	/**
	 * The current frame of the movieclip.
	 * @property currentFrame
	 * @type Number
	 * @default 0
	 * @readonly
	 */
	p.currentFrame = 0;

	/**
	 * If true, the BitmapMovieClip's position will not advance when ticked.
	 * @property paused
	 * @type Boolean
	 * @default false
	 */
	p.paused = false;

	/**
	 * If true, the BitmapMovieClip will advance its timeline during ticks. 
	 * If false then it must be externally advanced by setting elapsedTime.
	 * @property advanceDuringTicks
	 * @type Boolean
	 * @default true
	 */
	p.advanceDuringTicks = true;

	/**
	 * By default BitmapMovieClip instances advance one frame per tick. Specifying a framerate for the BitmapMovieClip
	 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	 * framerate.
	 *
	 * For example, if a BitmapMovieClip with a framerate of 10 is placed on a Stage being updated at 40fps, then the BitmapMovieClip will
	 * advance roughly one frame every 4 ticks. This will not be exact, because the time between each tick will
	 * vary slightly between frames.
	 *
	 * This feature is dependent on the tick event object (or an object with an appropriate "delta" property) being
	 * passed into {{#crossLink "Stage/update"}}{{/crossLink}}.
	 * @property framerate
	 * @type {Number}
	 * @default 0
	 **/
	Object.defineProperty(p, 'framerate', {
		get: function() {
			return this._framerate;
		},
		set: function(value) {
			if(value > 0)
			{
				this._framerate = value;
				this._duration = value ? this._frames.length / value : 0;
			}
			else
				this._framerate = this._duration = 0;
		}
	});

	/**
	 * When the BitmapMovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * @property elapsedTime
	 * @type Number
	 * @default 0
	 * @public
	 */
	Object.defineProperty(p, 'elapsedTime', {
		get: function() {
			return this._t;
		},
		set: function(value) {
			this._t = value;
		}
	});

	//==== Private properties =====

	/**
	 * By default BitmapMovieClip instances advance one frame per tick. Specifying a framerate for the BitmapMovieClip
	 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	 * framerate.
	 * 
	 * @property _framerate
	 * @type {Number}
	 * @default 0
	 * @private
	 **/
	p._framerate = 0;

	/**
	 * When the BitmapMovieClip is framerate independent, this is the total time in seconds for the animation.
	 * @property _duration
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._duration = 0;

	/**
	 * When the BitmapMovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * @property _t
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._t = 0;

	/**
	 * @property _prevPosition
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._prevPosition = 0;

	/**
	 * The Bitmap used to render the current frame of the animation.
	 * @property _bitmap
	 * @type createjs.Bitmap
	 * @private
	 */
	p._bitmap = 0;

	/**
	 * An array of frame labels.
	 * @property _labels
	 * @type Array
	 * @private
	 */
	p._labels = 0;

	/**
	 * An array of textures.
	 * @property _frames
	 * @type Array
	 * @private
	 */
	p._frames = null;

	/**
	 * The current texture.
	 * @property _currentTexture
	 * @type createjs.TextureAtlas.Texture
	 * @private
	 */
	p._currentTexture = null;

	/**
	 * The origin point of the BitmapMovieClip.
	 * @property _origin
	 * @type createjs.Point
	 * @private
	 */
	p._origin = null;

	/**
	 * A scale to apply to the images in the BitmapMovieClip
	 * to restore normal size (if spritesheet was exported at a smaller or larger size).
	 * @property _scale
	 * @type Number
	 * @private
	 */
	p._scale = 1;

	//==== Public Methods =====

	/**
	 * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
	 * This does not account for whether it would be visible within the boundaries of the stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		// children are placed in draw, so we can't determine if we have content.
		return !!(this.visible && this.alpha > 0 && this.scaleX !== 0 && this.scaleY !== 0);
	};

	/**
	 * Draws the display object into the specified context ignoring its visible, alpha, shadow, and transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache.
	 * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
	 * into itself).
	 **/
	p.draw = function(ctx, ignoreCache) {
		// draw to cache first:
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this._updateTimeline();
		s.draw.call(this, ctx, ignoreCache);//Container's call
		return true;
	};

	/**
	 * Sets paused to false.
	 * @method play
	 **/
	p.play = function() {
		this.paused = false;
	};
	
	/**
	 * Sets paused to true.
	 * @method stop
	 **/
	p.stop = function() {
		this.paused = true;
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to false.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 **/
	p.gotoAndPlay = function(positionOrLabel) {
		this.paused = false;
		this._goto(positionOrLabel);
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to true.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 **/
	p.gotoAndStop = function(positionOrLabel) {
		this.paused = true;
		this._goto(positionOrLabel);
	};

	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in ms to advance by. Only applicable if framerate is set.
	 * @method advance
	*/
	p.advance = function(time) {
		if(!this.paused)
		{
			if(this._framerate > 0)
			{
				if(this.advanceDuringTicks)
					this._t += time * 0.001;//milliseconds -> seconds
				if(this._t > this._duration)
					this._t = this.loop ? this._t - this._duration : this._duration;
				this._prevPosition = Math.floor(this._t * this._framerate);
				if(this._prevPosition >= this._frames.length)
					this._prevPosition = this._frames.length - 1;
			}
			else if(this.advanceDuringTicks)
				this._prevPosition = this._prevPosition + 1;
			this._updateTimeline();
		}
	};
	
	/**
	 * Returns a sorted list of the labels defined on this BitmapMovieClip. Shortcut to TweenJS: Timeline.getLabels();
	 * @method getLabels
	 * @return {Array[Object]} A sorted array of objects with label and position (aka frame) properties.
	 **/
	p.getLabels = function() {
		return this._labels;
	};
	
	/**
	 * Returns the name of the label on or immediately before the current frame. See TweenJS: Timeline.getCurrentLabel()
	 * for more information.
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label.
	 **/
	p.getCurrentLabel = function() {
		var labels = this._labels;
		var current = null;
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			if(labels[i].position <= this.currentFrame)
				current = labels[i].label;
			else
				break;
		}
		return current;
	};

	/**
	 *  Returns the name of the label on or immediately before the current frame. See TweenJS: Timeline.getCurrentLabel()
	 *  for more information.
	 *  @method init
	 *  @param {TextureAtlas} atlas The texture atlas to pull frames from.
	 *  @param {Object} data Initialization data
	 *  @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the current framerate.
	 *  @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in playing animations.
	 *  @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	 *  @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	 *  @param {String} [data.frames.name] The name to use for the frame sequence. This should include a "#" to be replaced with the image number.
	 *  @param {int} [data.frames.min] The first frame number in the frame sequence.
	 *  @param {int} [data.frames.max] The last frame number in the frame sequence.
	 *  @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames, e.g. myAnim0001 has 4 digits.
	 *  @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4 means the art was increased
	 *          in size to 140% before exporting and should be scaled back down before drawing to the screen.
	 *
	 *  Format for data:
	 *	{
	 *		fps:30,
	 *		labels:
	 *		{
	 *			animStart:0,
	 *			animStart_loop:15
	 *		},
	 *		origin:{ x: 20, y:30 },
	 *		frames:
	 *		[
	 *			{
	 *				name:"myAnim#",
	 *				min:1,
	 *				max:20,
	 *				digits:4
	 *			}
	 *		],
	 *  	scale: 1
	 *	}
	 *
	 * The object describes a 30 fps animation that is 20 frames long, and was originally myAnim0001.png->myAnim0020.png,
	 * with frame labels on the first and 16th frame. 'digits' is optional, and defaults to 4.
	 **/
	p.init = function(atlas, data)
	{
		//collect the frame labels
		var labels = this._labels = [];
		if(data.labels)
		{
			for(var name in data.labels)
			{
				labels.push({label:name, position: data.labels[name]});
			}
			labels.sort(labelSorter);
		}
		//collect the frames
		this._frames = [];
		for(var i = 0; i < data.frames.length; ++i)
		{
			var frameSet = data.frames[i];
			atlas.getFrames(frameSet.name, frameSet.min, frameSet.max, frameSet.digits, this._frames);
		}
		//set up the framerate
		if(data.fps)
			this.framerate = data.fps;
		else if(this._framerate)
			this.framerate = this._framerate;
		if(data.scale && data.scale > 0)
			this._scale = 1 / data.scale;
		else
			this._scale = 1;
		this._bitmap.scaleX = this._bitmap.scaleY = this._scale;
		if(data.origin)
			this._origin = new createjs.Point(data.origin.x * this._scale, data.origin.y * this._scale);
		else
			this._origin = new createjs.Point();
	};

	function labelSorter(a, b)
	{
		return a.position - b.position;
	}

	/**
	*	Copies the labels, textures, origin, and framerate from another BitmapMovieClip.
	*	The labels and textures are copied by reference, instead of a deep copy.
	*	@method copyFrom
	*	@param {BitmapMovieClip} other The movieclip to copy data from.
	*/
	p.copyFrom = function(other)
	{
		this._frames = other._frames;
		this._labels = other._labels;
		this._origin = other._origin;
		this._framerate = other._framerate;
		this._duration = other._duration;
		this._scale = other._scale;
		this._bitmap.scaleX = this._bitmap.scaleY = this._scale;
	};

	/**
	*	Destroys the BitmapMovieClip, removing all children and nulling all reference variables.
	*	@method destroy
	*/
	p.destroy = function()
	{
		this.removeAllChildren();
		this._bitmap = null;
		this._frames = null;
		this._origin = null;
		this._currentTexture = null;
	};

	//===== Private Methods =====

	/**
	 * @method _tick
	 * @param {Object} props Properties to copy to the DisplayObject {{#crossLink "DisplayObject/tick"}}{{/crossLink}} event object.
	 * function.
	 * @protected
	 **/
	p._tick = function(props) {
		this.advance(props&&props.delta);
		s._tick.call(this, props);
	};
	
	/**
	 * @method _goto
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 * @protected
	 **/
	p._goto = function(positionOrLabel) {
		var pos = null;
		if(typeof positionOrLabel == "string")
		{
			var labels = this._labels;
			for(var i = 0, len = labels.length; i < len; ++i)
			{
				if(labels[i].label == positionOrLabel)
				{
					pos = labels[i].position;
					break;
				}
			}
		}
		else
			pos = positionOrLabel;
		if (pos === null) { return; }
		this._prevPosition = pos;
		if(this._framerate > 0)
			this._t = pos / this._framerate;
		else
			this._t = 0;
		this._updateTimeline();
	};

	/**
	 * @method _updateTimeline
	 * @protected
	 **/
	p._updateTimeline = function() {
		if(this._prevPosition < 0)
			this._prevPosition = 0;
		else if(this._prevPosition >= this._frames.length)
			this._prevPosition = this._frames.length - 1;
		this.currentFrame = this._prevPosition;
		if(this._currentTexture != this._frames[this.currentFrame])
		{
			var tex = this._currentTexture = this._frames[this.currentFrame];
			this._bitmap.image = tex.image;
			this._bitmap.sourceRect = tex.frame;
			this._bitmap.x = -this._origin.x + tex.offset.x * this._bitmap.scaleX;
			this._bitmap.y = -this._origin.y + tex.offset.y * this._bitmap.scaleY;
		}
	};
	
	/**
	 * @method _reset
	 * @private
	 **/
	p._reset = function() {
		this._prevPosition = 0;
		this._t = 0;
		this.currentFrame = 0;
	};

	createjs.BitmapMovieClip = BitmapMovieClip;
}());this.createjs = this.createjs || {};

(function() {
	"use strict";

	/**
	 * Static class holding library specific information such as the version and buildDate of
	 * the library.
	 **/
	var s = createjs.MovieClip = createjs.MovieClip || {};

	/**
	 * The version string for this release.
	 * @property version
	 * @for MovieClip
	 * @type String
	 * @static
	 **/
	s.version = /*version*/"0.7.3"; // injected by build process

	/**
	 * The build date for this release in UTC format.
	 * @property buildDate
	 * @for MovieClip
	 * @type String
	 * @static
	 **/
	s.buildDate = /*date*/"Fri, 15 Aug 2014 15:32:34 GMT"; // injected by build process

})();