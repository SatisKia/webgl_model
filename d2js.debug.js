/*
 * D2JS
 * Copyright (C) SatisKia. All rights reserved.
 */
(function( window, undefined ){
var document = window.document;
var location = window.location;
var navigator = window.navigator;
window._USE_AUDIOEX = false;
window._USE_DRAWSTRINGEX = false;
window._USE_EXCANVAS = false;
window._USE_KEY = false;
window._USE_MOUSE = false;
window._USE_TOUCH = false;
window._USE_LAYOUTMOUSE = false;
window._USE_LAYOUTTOUCH = false;
window._USE_REQUESTANIMATIONFRAME = false;
window._USE_SKIPFRAME = false;
window._MAX_FRAMECOUNT = -1;
function canUseCanvas(){
	return (!!document.createElement( "canvas" ).getContext);
}
var _kill_timer = false;
var _start_time;
var _end_time;
var _sleep_time;
var _over_time = 0;
var _frame_count = 1;
var _canvas = null;
var _context;
var _lock;
var _g;
var _key = 0;
var _key_array;
var _use_layout = false;
var _layout = new Array();
var _mouse_x;
var _mouse_y;
var _touch_start = false;
var _touch_x = new Array();
var _touch_y = new Array();
var _touch_x0;
var _touch_y0;
var _color;
var _font_size;
var _font_family;
var _stringex = new Array();
var _stringex_num;
var _text;
var _text_style = "visibility:hidden;position:absolute;left:0;top:0";
function d2js_onload(){
	_key_array = new Array();
	_key_array[ 0] = 8;
	_key_array[ 1] = 9;
	_key_array[ 2] = 13;
	_key_array[ 3] = 16;
	_key_array[ 4] = 17;
	_key_array[ 5] = 32;
	_key_array[ 6] = 37;
	_key_array[ 7] = 38;
	_key_array[ 8] = 39;
	_key_array[ 9] = 40;
	_key_array[10] = 48;
	_key_array[11] = 49;
	_key_array[12] = 50;
	_key_array[13] = 51;
	_key_array[14] = 52;
	_key_array[15] = 53;
	_key_array[16] = 54;
	_key_array[17] = 55;
	_key_array[18] = 56;
	_key_array[19] = 57;
	_key_array[20] = 67;
	_key_array[21] = 88;
	_key_array[22] = 90;
	init();
	if( _USE_EXCANVAS || canUseCanvas() ){
		if( _USE_LAYOUTMOUSE ){
			_use_layout = true;
			_USE_MOUSE = true;
		}
		if( _USE_LAYOUTTOUCH ){
			_use_layout = true;
			_USE_TOUCH = true;
		}
		if( _USE_KEY ){
			_addEventListener( document, "keydown", _onKeyDown );
			_addEventListener( document, "keyup", _onKeyUp );
		}
		if( _USE_TOUCH ){
			_addEventListener( document, "touchstart", _onTouchStart );
			_addEventListener( document, "touchmove", _onTouchMove );
			_addEventListener( document, "touchend", _onTouchEnd );
		}
		_text = document.createElement( "span" );
		_text.style.cssText = _text_style;
		document.body.appendChild( _text );
		if( start() ){
			setTimer();
		}
	} else {
		error();
	}
}
function d2js_onorientationchange(){
	processEvent( 13, window.orientation );
}
function d2js_onresize(){
	processEvent( 14, 0 );
}
function setTimer(){
	_kill_timer = false;
	_loop();
}
function killTimer(){
	_kill_timer = true;
}
var repaint = function(){
	if( _USE_DRAWSTRINGEX ){
		_stringex_num = 0;
	}
	_context.clearRect( 0, 0, getWidth(), getHeight() );
	_context.save();
	paint( _g );
	_context.restore();
	if( _USE_DRAWSTRINGEX ){
		for( var i = _stringex_num; i < _stringex.length; i++ ){
			_stringex[i].innerHTML = "";
		}
	}
};
function setRepaintFunc( func ){
	repaint = func;
}
function _getSleepTime(){
	if( _USE_SKIPFRAME ){
		_sleep_time = frameTime() * _frame_count - (_over_time + (_end_time - _start_time));
	} else {
		_sleep_time = frameTime() - (_end_time - _start_time);
	}
	if( _sleep_time < 0 ){
		_over_time = 0 - _sleep_time;
		_sleep_time = 0;
		if( _USE_SKIPFRAME ){
			_frame_count++;
			if( (_MAX_FRAMECOUNT >= 0) && (_frame_count > _MAX_FRAMECOUNT) ){
				resetFrameCount();
			}
		}
	} else {
		resetFrameCount();
	}
	if( _sleep_time > frameTime() ){
		_sleep_time = frameTime();
	}
}
function frameCount(){
	return _frame_count;
}
function resetFrameCount(){
	_over_time = 0;
	_frame_count = 1;
}
function _sleep(){
	while( (_end_time > _start_time) && ((_end_time - _start_time) < frameTime()) ){
		_end_time = currentTimeMillis();
	}
}
function _loop(){
	if( _kill_timer ){
		_kill_timer = false;
		return;
	}
	_start_time = currentTimeMillis();
	repaint();
	_end_time = currentTimeMillis();
	if( _USE_REQUESTANIMATIONFRAME ){
		if( !!window.requestAnimationFrame ){
			_sleep();
			window.requestAnimationFrame( _loop );
		} else if( !!window.webkitRequestAnimationFrame ){
			_sleep();
			window.webkitRequestAnimationFrame( _loop );
		} else if( !!window.mozRequestAnimationFrame ){
			_sleep();
			window.mozRequestAnimationFrame( _loop );
		} else if( !!window.oRequestAnimationFrame ){
			_sleep();
			window.oRequestAnimationFrame( _loop );
		} else if( !!window.msRequestAnimationFrame ){
			_sleep();
			window.msRequestAnimationFrame( _loop );
		} else {
			_getSleepTime();
			window.setTimeout( _loop, _sleep_time );
		}
	} else {
		_getSleepTime();
		window.setTimeout( _loop, _sleep_time );
	}
}
function _addEventListener( target, event, func ){
	if( !!target.addEventListener ){
		target.addEventListener( event, func, false );
	} else if( !!target.attachEvent ){
		target.attachEvent( "on" + event, func );
	} else {
		target["on" + event] = func;
	}
}
function _removeEventListener( target, event, func ){
	if( !!target.removeEventListener ){
		target.removeEventListener( event, func, false );
	} else if( !!target.detachEvent ){
		target.detachEvent( "on" + event, func );
	} else {
		target["on" + event] = null;
	}
}
function removeMouseEvent(){
	if( _USE_MOUSE && (_canvas != null) ){
		_removeEventListener( _canvas, "mousedown", _onMouseDown );
		_removeEventListener( _canvas, "mousemove", _onMouseMove );
		_removeEventListener( _canvas, "mouseout", _onMouseOut );
		_removeEventListener( _canvas, "mouseover", _onMouseOver );
		_removeEventListener( _canvas, "mouseup", _onMouseUp );
	}
}
function addMouseEvent(){
	if( _USE_MOUSE ){
		_addEventListener( _canvas, "mousedown", _onMouseDown );
		_addEventListener( _canvas, "mousemove", _onMouseMove );
		_addEventListener( _canvas, "mouseout", _onMouseOut );
		_addEventListener( _canvas, "mouseover", _onMouseOver );
		_addEventListener( _canvas, "mouseup", _onMouseUp );
	}
}
function setCurrent( id ){
	_canvas = document.getElementById( id );
	_context = _canvas.getContext( "2d" );
	initLock();
	_context.textAlign = "left";
	_context.textBaseline = "bottom";
	_g = new _Graphics();
	addMouseEvent();
}
function setGraphics( g ){
	_g = g;
}
function getCurrent(){
	return _canvas;
}
function getCurrentContext(){
	return _context;
}
function getGraphics(){
	return _g;
}
function setCanvas( canvas ){
	_canvas = canvas;
	return _canvas;
}
function setContext( context ){
	_context = context;
	return _context;
}
function initLock(){
	_lock = false;
}
function setCanvasSize( _width, _height ){
	_canvas.width = _width;
	_canvas.height = _height;
	_context.textAlign = "left";
	_context.textBaseline = "bottom";
}
function getWidth(){
	return parseInt( _canvas.width );
}
function getHeight(){
	return parseInt( _canvas.height );
}
function _getLeft( e ){
	var left = 0;
	while( e ){
		left += e.offsetLeft;
		e = e.offsetParent;
	}
	return left;
}
function _getTop( e ){
	var top = 0;
	while( e ){
		top += e.offsetTop;
		e = e.offsetParent;
	}
	return top;
}
function getBrowserWidth(){
	if( (!!document.documentElement) && (document.documentElement.clientWidth > 0) ){
		return document.documentElement.clientWidth;
	} else if( !!document.body ){
		return document.body.clientWidth;
	} else if( !!window.innerWidth ){
		return window.innerWidth;
	}
	return 0;
}
function getBrowserHeight(){
	if( (!!document.documentElement) && (document.documentElement.clientHeight > 0) ){
		return document.documentElement.clientHeight;
	} else if( !!document.body ){
		return document.body.clientHeight;
	} else if( !!window.innerHeight ){
		return window.innerHeight;
	}
	return 0;
}
function getOrientation(){
	return window.orientation;
}
function readParameter( text, key ){
	var ret = "";
	var start = text.indexOf( "?" + key + "=" );
	if( start < 0 ){
		start = text.indexOf( "&" + key + "=" );
	}
	if( start >= 0 ){
		start += key.length + 2;
		var end = text.indexOf( "&", start );
		if( end < 0 ){
			end = text.length;
		}
		ret = text.substring( start, end );
	}
	return decodeURIComponent( ret );
}
function readParameters( text ){
	var params = text.split( "&" );
	var key = new Array();
	for( var i = 0; i < params.length; i++ ){
		var param = params[i].split( "=" );
		key[param[0]] = decodeURIComponent( param[1] );
	}
	return key;
}
function getParameter( key ){
	return readParameter( location.href, key );
}
function getResImage( id ){
	return document.getElementById( id );
}
function getResString( id ){
	var str = document.getElementById( id ).innerHTML;
	str = str.replace( new RegExp( "&lt;", "igm" ), "<" );
	str = str.replace( new RegExp( "&gt;", "igm" ), ">" );
	return str;
}
function currentTimeMillis(){
	return (new Date()).getTime();
}
function setKeyArray( array ){
	var len = array.length;
	_key_array = new Array();
	for( var i = 0; i < len; i++ ){
		_key_array[i] = array[i];
	}
}
function keyBit( key ){
	var len = _key_array.length;
	for( var i = 0; i < len; i++ ){
		if( _key_array[i] == key ){
			return (1 << i);
		}
	}
	return 0;
}
function _onKeyDown( e ){
	var k = keyBit( e.keyCode );
	if( (_key & k) == 0 ){
		_key += k;
	}
	processEvent( 4, e.keyCode );
}
function _onKeyUp( e ){
	var k = keyBit( e.keyCode );
	if( (_key & k) != 0 ){
		_key -= k;
	}
	processEvent( 5, e.keyCode );
}
function getKeypadState(){
	return _key;
}
function __MainLayout( x, y, width, height, id ){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.id = id;
	this.shape = null;
	this.coords = null;
}
function clearLayout(){
	_layout = new Array();
}
function addLayout( x, y, w, h, id ){
	_layout[_layout.length] = new __MainLayout( x, y, w, h, id );
}
function addLayoutArea( x, y, width, height, id, shape, coords ){
	addLayout( x, y, width, height, id );
	if( !!_context.isPointInPath ){
		_layout[_layout.length - 1].shape = shape;
		var tmp = coords.split( "," );
		_layout[_layout.length - 1].coords = new Array( tmp.length );
		for( var i = 0; i < tmp.length; i++ ){
			_layout[_layout.length - 1].coords[i] = parseInt( tmp[i] );
		}
	}
}
function getLayout( id ){
	if( _layout.length > 0 ){
		for( var i = 0; i < _layout.length; i++ ){
			if( _layout[i].id == id ){
				return _layout[i];
			}
		}
	}
	return null;
}
function checkLayout( x, y ){
	if( _layout.length > 0 ){
		for( var i = 0; i < _layout.length; i++ ){
			if( _layout[i].shape == null ){
				if(
					(x >= _layout[i].x) &&
					(x < _layout[i].x + _layout[i].width) &&
					(y >= _layout[i].y) &&
					(y < _layout[i].y + _layout[i].height)
				){
					return _layout[i].id;
				}
			} else {
				_context.beginPath();
				if( _layout[i].shape == "circle" ){
					_context.arc(
						_layout[i].x + _layout[i].coords[0],
						_layout[i].y + _layout[i].coords[1],
						_layout[i].coords[2],
						0.0, Math.PI * 2.0, false
						);
				} else if( _layout[i].shape == "poly" ){
					_context.moveTo(
						_layout[i].x + _layout[i].coords[0],
						_layout[i].y + _layout[i].coords[1]
						);
					for( var j = 2; j < _layout[i].coords.length - 1; j += 2 ){
						_context.lineTo(
							_layout[i].x + _layout[i].coords[j],
							_layout[i].y + _layout[i].coords[j + 1]
							);
					}
					_context.closePath();
				} else if( _layout[i].shape == "rect" ){
					_context.moveTo( _layout[i].x + _layout[i].coords[0], _layout[i].y + _layout[i].coords[1] );
					_context.lineTo( _layout[i].x + _layout[i].coords[2], _layout[i].y + _layout[i].coords[1] );
					_context.lineTo( _layout[i].x + _layout[i].coords[2], _layout[i].y + _layout[i].coords[3] );
					_context.lineTo( _layout[i].x + _layout[i].coords[0], _layout[i].y + _layout[i].coords[3] );
					_context.closePath();
				}
				if( _context.isPointInPath( x, y ) ){
					return _layout[i].id;
				}
			}
		}
	}
	return -1;
}
function getLayoutState(){
	var ret = 0;
	var id;
	for( var i = 0; i < _touch_x.length; i++ ){
		id = checkLayout( _touch_x[i], _touch_y[i] );
		if( id >= 0 ){
			ret |= (1 << id);
		}
	}
	return ret;
}
function layoutBit( id ){
	return (1 << id);
}
function _getMouse( e ){
	_mouse_x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - _getLeft( _canvas );
	_mouse_y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - _getTop( _canvas );
}
function _onMouseDown( e ){
	_getMouse( e );
	if( _use_layout ){
		if( _layout.length > 0 ){
			var p = checkLayout( _mouse_x, _mouse_y );
			if( p >= 0 ){
				processEvent( 6, p );
				return;
			}
		}
	}
	processEvent( 8, 0 );
}
function _onMouseMove( e ){
	_getMouse( e );
	processEvent( 9, 0 );
}
function _onMouseOut( e ){
	_getMouse( e );
	processEvent( 10, 0 );
}
function _onMouseOver( e ){
	_getMouse( e );
	processEvent( 11, 0 );
}
function _onMouseUp( e ){
	_getMouse( e );
	if( _use_layout ){
		if( _layout.length > 0 ){
			var p = checkLayout( _mouse_x, _mouse_y );
			if( p >= 0 ){
				processEvent( 7, p );
				return;
			}
		}
	}
	processEvent( 12, 0 );
}
function getMouseX(){
	return _mouse_x;
}
function getMouseY(){
	return _mouse_y;
}
function _getTouch( e ){
	_touch_x = new Array();
	_touch_y = new Array();
	for( var i = 0; i < e.touches.length; i++ ){
		_touch_x[i] = e.touches[i].pageX - _getLeft( _canvas );
		_touch_y[i] = e.touches[i].pageY - _getTop( _canvas );
	}
}
function _onTouchStart( e ){
	_getTouch( e );
	_touch_x0 = _touch_x[0];
	_touch_y0 = _touch_y[0];
	if( (_touch_x0 >= 0) && (_touch_x0 < getWidth()) && (_touch_y0 >= 0) && (_touch_y0 < getHeight()) ){
		_touch_start = true;
		if( _use_layout ){
			if( _layout.length > 0 ){
				var p = checkLayout( _touch_x0, _touch_y0 );
				if( p >= 0 ){
					processEvent( 6, p );
					e.preventDefault();
					return;
				}
			}
		}
		processEvent( 15, 0 );
		e.preventDefault();
	}
}
function _onTouchMove( e ){
	if( _touch_start ){
		_getTouch( e );
		_touch_x0 = _touch_x[0];
		_touch_y0 = _touch_y[0];
		processEvent( 16, 0 );
		e.preventDefault();
	}
}
function _onTouchEnd( e ){
	if( _touch_start ){
		_touch_start = false;
		_getTouch( e );
		if( _use_layout ){
			if( _layout.length > 0 ){
				var p = checkLayout( _touch_x0, _touch_y0 );
				if( p >= 0 ){
					processEvent( 7, p );
					e.preventDefault();
					return;
				}
			}
		}
		processEvent( 17, 0 );
		e.preventDefault();
	}
}
function touchNum(){
	return _touch_x.length;
}
function getTouchX( index ){
	return ((index < _touch_x.length) ? _touch_x[index] : _touch_x0);
}
function getTouchY( index ){
	return ((index < _touch_y.length) ? _touch_y[index] : _touch_y0);
}
function launch( url ){
	location.replace( url );
}
function setFont( size, family ){
	_font_size = size;
	if( Array.isArray( family ) ){
		_font_family = family.map( function( f ){
			return (f.indexOf( " " ) >= 0) ? "'" + f + "'" : f;
		} ).join( ", " );
	} else {
		_font_family = (family.indexOf( " " ) >= 0) ? "'" + family + "'" : family;
	}
	_text.style.cssText = _text_style + ";font:" + _font_size + "px " + _font_family;
}
function stringWidth( str ){
	_text.innerHTML = "'";
	var tmp = _text.offsetWidth;
	str = str.replace( new RegExp( "<", "igm" ), "&lt;" );
	str = str.replace( new RegExp( ">", "igm" ), "&gt;" );
	_text.innerHTML = "'" + str + "'";
	return _text.offsetWidth - tmp * 2;
}
function fontHeight(){
	return _font_size;
}
function _drawStringEx( str, x, y ){
	if( _lock ){
		return;
	}
	if( _stringex_num >= _stringex.length ){
		_stringex[_stringex_num] = document.createElement( "span" );
		_stringex[_stringex_num].style.cssText = "position:absolute";
		document.body.appendChild( _stringex[_stringex_num] );
		if( _USE_MOUSE ){
			_addEventListener( _stringex[_stringex_num], "mousedown", _onMouseDown );
			_addEventListener( _stringex[_stringex_num], "mousemove", _onMouseMove );
			_addEventListener( _stringex[_stringex_num], "mouseup", _onMouseUp );
		}
	}
	_stringex[_stringex_num].style.cssText = "position:absolute;left:" + (_getLeft( _canvas ) + x) + "px;top:" + (_getTop( _canvas ) + y - _font_size) + "px;color:" + _color + ";font:" + _font_size + "px " + _font_family;
	str = str.replace( new RegExp( "<", "igm" ), "&lt;" );
	str = str.replace( new RegExp( ">", "igm" ), "&gt;" );
	_stringex[_stringex_num].innerHTML = str;
	_stringex_num++;
}
function canUseAudio(){
	return (!!document.createElement( "audio" ).canPlayType);
}
function canPlayType( type ){
	var audio = document.createElement( "audio" );
	if( !!audio.canPlayType ){
		return (audio.canPlayType( type ).replace( new RegExp( "no" ), "" ) != "");
	}
	return false;
}
function __Audio(){
	this.element = null;
	this.state = 0;
	this.volume = 100;
	this.id = currentTimeMillis();
}
function __AudioEx(){
	this.element = null;
	this.src = null;
	this.tag = null;
}
function _useAudioEx(){
	if( _USE_AUDIOEX ){
		if( !canUseAudio() ){
			return true;
		}
	}
	return false;
}
function loadAudio( src ){
	if( _useAudioEx() ){
		return loadAudioEx( src );
	}
	try {
		var audio = new __Audio();
		audio.element = new Audio( "" );
		audio.element.autoplay = false;
		audio.element.src = src;
		audio.element.load();
		return audio;
	} catch( e ){}
	return null;
}
function loadAudioEx( src ){
	var audio = new __AudioEx();
	audio.src = src;
	return audio;
}
function loadAndPlayAudio( src, loop ){
	if( _useAudioEx() ){
		return loadAndPlayAudioEx( src, loop, audioExElement() );
	}
	try {
		var audio = new __Audio();
		audio.element = new Audio( "" );
		audio.element.autoplay = false;
		audio.element.src = src;
		audio.element.loop = loop;
		audio.element.play();
		audio.state = 1;
		return audio;
	} catch( e ){}
	return null;
}
function loadAndPlayAudioEx( src, loop, tag ){
	var audio = loadAudioEx( src );
	playAudioEx( audio, loop, tag );
	return audio;
}
function isLoaded( audio ){
	if( _useAudioEx() ){
		return true;
	}
	if( audio != null ){
		try {
			if( audio.element.readyState >= 4 ){
				return true;
			}
		} catch( e ){}
	}
	return false;
}
function stopAudio( audio ){
	if( _useAudioEx() ){
		stopAudioEx( audio );
		return;
	}
	if( (audio != null) && (audio.state != 0) ){
		try {
			if( audio.state == 2 ){
				audio.element.currentTime = 0;
			} else if( (audio.state == 1) && !audio.element.ended ){
				audio.element.pause();
				audio.element.currentTime = 0;
			}
		} catch( e ){}
		audio.state = 0;
	}
}
function stopAudioEx( audio ){
	if( (audio != null) && (audio.element != null) ){
		audio.element.setAttribute( "src", "" );
		document.body.removeChild( audio.element );
		audio.element = null;
	}
}
function reloadAudio( audio ){
	stopAudio( audio );
	if( _useAudioEx() ){
		return;
	}
	if( audio != null ){
		try {
			audio.element.load();
		} catch( e ){}
	}
}
function playAudio( audio, loop ){
	if( _useAudioEx() ){
		playAudioEx( audio, loop, audioExElement() );
		return;
	}
	if( audio != null ){
		if( audio.state == 1 ){
			try {
				if( !audio.element.ended ){
					audio.element.pause();
					audio.element.currentTime = 0;
				}
			} catch( e ){}
		}
		try {
			audio.element.loop = loop;
			audio.element.play();
			audio.state = 1;
		} catch( e ){}
	}
}
function playAudioEx( audio, loop, tag ){
	if( audio != null ){
		if( audio.element != null ){
			audio.element.setAttribute( "src", "" );
			document.body.removeChild( audio.element );
		}
		audio.tag = tag;
		audio.element = document.createElement( audio.tag );
		audio.element.setAttribute( "src", audio.src );
		if( audio.tag == "audio" ){
			audio.element.setAttribute( "autoplay", "true" );
			if( loop ){
				audio.element.setAttribute( "loop", "true" );
			}
		} else if( audio.tag == "bgsound" ){
			if( loop ){
				audio.element.setAttribute( "loop", "infinite" );
			}
		} else if( audio.tag == "embed" ){
			audio.element.setAttribute( "autostart", "true" );
			audio.element.setAttribute( "hidden", "false" );
			audio.element.setAttribute( "width", "1" );
			audio.element.setAttribute( "height", "1" );
			if( loop ){
				audio.element.setAttribute( "loop", "true" );
				audio.element.setAttribute( "repeat", "true" );
			}
		}
		document.body.appendChild( audio.element );
	}
}
function isPlaying( audio ){
	if( _useAudioEx() ){
		return isPlayingEx( audio );
	}
	if( (audio != null) && (audio.state == 1) ){
		try {
			return !audio.element.ended;
		} catch( e ){}
		return true;
	}
	return false;
}
function isPlayingEx( audio ){
	if( (audio != null) && (audio.element != null) ){
		if( audio.tag == "audio" ){
			try {
				return !audio.element.ended;
			} catch( e ){}
		}
		return true;
	}
	return false;
}
function pauseAudio( audio ){
	if( _useAudioEx() ){
		return;
	}
	if( (audio != null) && (audio.state == 1) ){
		try {
			if( !audio.element.ended ){
				audio.element.pause();
				audio.state = 2;
			}
		} catch( e ){}
	}
}
function restartAudio( audio ){
	if( _useAudioEx() ){
		return;
	}
	if( (audio != null) && (audio.state == 2) ){
		try {
			audio.element.play();
			audio.state = 1;
		} catch( e ){}
	}
}
function setVolume( audio, volume ){
	if( _useAudioEx() ){
		return;
	}
	if( audio != null ){
		audio.volume = volume;
		try {
			audio.element.volume = audio.volume / 100.0;
		} catch( e ){}
	}
}
function getVolume( audio ){
	if( _useAudioEx() ){
		return 0;
	}
	if( audio != null ){
		return audio.volume;
	}
	return 0;
}
function getCurrentTime( audio ){
	if( _useAudioEx() ){
		return 0;
	}
	if( audio != null ){
		try {
			return Math.floor( audio.element.currentTime * 1000.0 );
		} catch( e ){}
	}
	return 0;
}
function _loopAudioSprite( audio, id, startTime, duration ){
	if( (audio != null) && (audio.id == id) && (audio.state == 1) ){
		playAudioSprite( audio, startTime, duration, true );
	}
}
function _pauseAudioSprite( audio, id ){
	if( (audio != null) && (audio.id == id) && (audio.state == 1) ){
		pauseAudio( audio );
	}
}
function loadAndPlayAudioSprite( src, startTime, duration, loop ){
	try {
		var audio = new __Audio();
		audio.element = new Audio( "" );
		audio.element.autoplay = false;
		audio.element.src = src;
		playAudioSprite( audio, startTime, duration, loop );
		return audio;
	} catch( e ){}
	return null;
}
function playAudioSprite( audio, startTime, duration, loop ){
	if( audio != null ){
		try {
			var id = currentTimeMillis();
			audio.id = id;
			var currentTime = startTime / 1000.0;
			var setCurrentTime = false;
			if( audio.state != 0 ){
				try {
					if( audio.state == 2 ){
						audio.element.currentTime = currentTime;
						setCurrentTime = true;
					} else if( (audio.state == 1) && !audio.element.ended ){
						audio.element.pause();
						audio.element.currentTime = currentTime;
						setCurrentTime = true;
					}
				} catch( e ){}
			}
			audio.element.loop = false;
			audio.element.play();
			audio.state = 1;
			if( !setCurrentTime ){
				try {
					audio.element.currentTime = currentTime;
				} catch( e ){}
			}
			if( loop ){
				setTimeout( function( a, b, c, d ){ _loopAudioSprite( a, b, c, d ); }, duration, audio, id, startTime, duration );
			} else {
				setTimeout( function( a, b ){ _pauseAudioSprite( a, b ); }, duration, audio, id );
			}
		} catch( e ){}
	}
}
function buttonElement( button ){
	return button.e;
}
function buttonX( button ){
	return button.x;
}
function buttonY( button ){
	return button.y;
}
function buttonWidth( button ){
	return button.width;
}
function buttonHeight( button ){
	return button.height;
}
function setButtonSrc( button, _src ){
	button.e.src = _src;
}
function updateButtonPos( button ){
	button.e.style.cssText = "position:absolute;left:" + (_getLeft( button.p ) + button.x) + "px;top:" + (_getTop( button.p ) + button.y) + "px;width:" + button.width + "px;height:" + button.height + "px";
}
function setButtonX( button, _x ){
	button.x = _x;
	updateButtonPos( button );
}
function setButtonY( button, _y ){
	button.y = _y;
	updateButtonPos( button );
}
function setButtonPos( button, _x, _y ){
	button.x = _x;
	button.y = _y;
	updateButtonPos( button );
}
function setButtonWidth( button, _width ){
	button.width = _width;
	updateButtonPos( button );
}
function setButtonHeight( button, _height ){
	button.height = _height;
	updateButtonPos( button );
}
function setButtonSize( button, _width, _height ){
	button.width = _width;
	button.height = _height;
	updateButtonPos( button );
}
function setButtonPosSize( button, _x, _y, _width, _height ){
	button.x = _x;
	button.y = _y;
	button.width = _width;
	button.height = _height;
	updateButtonPos( button );
}
function setButtonArea( button, _shape, _coords ){
	if( button.a != null ){
		button.a.setAttribute( "shape", _shape );
		button.a.setAttribute( "coords", _coords );
	}
}
function __Button( parent, element, create, x, y, width, height ){
	this.p = parent;
	this.e = element;
	this.c = create;
	this.m = null;
	this.a = null;
	setButtonPosSize( this, x, y, width, height );
}
function _addButtonEvent( button, area ){
	button.onButtonDown = function( e ){
		processEvent( 0, button.e );
	};
	button.onButtonOut = function( e ){
		processEvent( 1, button.e );
	};
	button.onButtonOver = function( e ){
		processEvent( 2, button.e );
	};
	button.onButtonUp = function( e ){
		processEvent( 3, button.e );
	};
	var target = area ? button.a : button.e;
	if( _USE_MOUSE ){
		_addEventListener( target, "mousedown", button.onButtonDown );
		_addEventListener( target, "mouseout", button.onButtonOut );
		_addEventListener( target, "mouseover", button.onButtonOver );
		_addEventListener( target, "mouseup", button.onButtonUp );
	}
	if( _USE_TOUCH ){
		_addEventListener( target, "touchstart", button.onButtonDown );
		_addEventListener( target, "touchmove", button.onButtonOver );
		_addEventListener( target, "touchend", button.onButtonUp );
	}
}
function createButton( parent, src, x, y, width, height ){
	var button = new __Button( parent, document.createElement( "img" ), true, x, y, width, height );
	setButtonSrc( button, src );
	document.body.appendChild( button.e );
	_addButtonEvent( button, false );
	return button;
}
function createButtonArea( parent, src, x, y, width, height, areaName, shape, coords ){
	var button = new __Button( parent, document.createElement( "img" ), true, x, y, width, height );
	setButtonSrc( button, src );
	button.e.setAttribute( "usemap", "#" + areaName );
	button.e.setAttribute( "border", "0" );
	document.body.appendChild( button.e );
	button.m = document.createElement( "map" );
	button.m.setAttribute( "name", areaName );
	document.body.appendChild( button.m );
	button.a = document.createElement( "area" );
	setButtonArea( button, shape, coords );
	button.m.appendChild( button.a );
	_addButtonEvent( button, true );
	return button;
}
function attachButton( parent, id, x, y, width, height ){
	var button = new __Button( parent, document.getElementById( id ), false, x, y, width, height );
	_addButtonEvent( button, false );
	return button;
}
function attachButtonArea( parent, id, x, y, width, height, areaId ){
	var button = new __Button( parent, document.getElementById( id ), false, x, y, width, height );
	button.a = document.getElementById( areaId );
	_addButtonEvent( button, true );
	return button;
}
function removeButton( button ){
	if( button.c ){
		var target = (button.a != null) ? button.a : button.e;
		if( _USE_MOUSE ){
			_removeEventListener( target, "mousedown", button.onButtonDown );
			_removeEventListener( target, "mouseout", button.onButtonOut );
			_removeEventListener( target, "mouseover", button.onButtonOver );
			_removeEventListener( target, "mouseup", button.onButtonUp );
		}
		if( _USE_TOUCH ){
			_removeEventListener( target, "touchstart", button.onButtonDown );
			_removeEventListener( target, "touchmove", button.onButtonOver );
			_removeEventListener( target, "touchend", button.onButtonUp );
		}
		document.body.removeChild( button.e );
	}
}
function _Graphics(){
	this.x = 0;
	this.y = 0;
	this.f = 0;
}
_Graphics.prototype = {
	canUseClip : function(){
		return (!!_context.clip);
	},
	canUseText : function(){
		return (!!_context.fillText);
	},
	getColorOfRGB : function( r, g, b ){
		return "rgb(" + r + "," + g + "," + b + ")";
	},
	getColorOfRGBA : function( r, g, b, a ){
		return "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
	},
	setStrokeWidth : function( width ){
		_context.lineWidth = width;
	},
	setColor : function( color ){
		_color = color;
		_context.fillStyle = _color;
		_context.strokeStyle = _color;
	},
	setAlpha : function( a ){
		_context.globalAlpha = a / 255.0;
	},
	setROP : function( mode ){
		_context.globalCompositeOperation = mode;
	},
	setFont : function( size, family ){
		setFont( size, family );
		_context.font = "" + _font_size + "px " + _font_family;
	},
	stringWidth : function( str ){
		return stringWidth( str );
	},
	fontHeight : function(){
		return fontHeight();
	},
	clearClip : function(){
		_context.restore();
		_context.save();
	},
	setOrigin : function( x, y ){
		this.x = x;
		this.y = y;
	},
	setClip : function( x, y, width, height ){
		x += this.x;
		y += this.y;
		if( !!_context.clip ){
			_context.restore();
			_context.save();
			_context.beginPath();
			_context.moveTo( x, y );
			_context.lineTo( x + width, y );
			_context.lineTo( x + width, y + height );
			_context.lineTo( x, y + height );
			_context.closePath();
			_context.clip();
		}
	},
	drawLine : function( x1, y1, x2, y2 ){
		x1 += this.x;
		y1 += this.y;
		x2 += this.x;
		y2 += this.y;
		_context.beginPath();
		_context.moveTo( x1 + 0.5, y1 + 0.5 );
		_context.lineTo( x2 + 0.5, y2 + 0.5 );
		_context.stroke();
		_context.closePath();
	},
	drawRect : function( x, y, width, height ){
		x += this.x;
		y += this.y;
		_context.strokeRect( x + 0.5, y + 0.5, width, height );
	},
	fillRect : function( x, y, width, height ){
		x += this.x;
		y += this.y;
		_context.fillRect( x, y, width, height );
	},
	drawCircle : function( cx, cy, r ){
		cx += this.x;
		cy += this.y;
		_context.beginPath();
		_context.arc( cx, cy, r, 0.0, Math.PI * 2.0, false );
		_context.stroke();
	},
	drawString : function( str, x, y ){
		x += this.x;
		y += this.y;
		if( !!_context.fillText ){
			_context.fillText( str, x, y );
		} else {
			if( _USE_DRAWSTRINGEX ){
				_drawStringEx( str, x, y );
			}
		}
	},
	setFlipMode : function( flip ){
		this.f = flip;
	},
	drawScaledImage : function( image, dx, dy, width, height, sx, sy, swidth, sheight ){
		dx += this.x;
		dy += this.y;
		if( this.f == 0 ){
			try {
				_context.drawImage( image, sx, sy, swidth, sheight, dx, dy, width, height );
			} catch( e ){}
		} else {
			_context.save();
			_context.setTransform( 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 );
			switch( this.f ){
			case 1:
				_context.translate( dx + width, dy );
				_context.scale( -1.0, 1.0 );
				break;
			case 2:
				_context.translate( dx, dy + height );
				_context.scale( 1.0, -1.0 );
				break;
			case 3:
				_context.translate( dx + width, dy + height );
				_context.scale( -1.0, -1.0 );
				break;
			}
			try {
				_context.drawImage( image, sx, sy, swidth, sheight, 0, 0, width, height );
			} catch( e ){}
			_context.restore();
		}
	},
	drawImage : function( image, x, y ){
		this.drawScaledImage( image, x, y, image.width, image.height, 0, 0, image.width, image.height );
	},
	drawTransImage : function( image, dx, dy, sx, sy, width, height, cx, cy, r360, z128x, z128y ){
		dx += this.x;
		dy += this.y;
		_context.save();
		_context.setTransform( 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 );
		_context.translate( dx, dy );
		_context.rotate( (Math.PI * r360) / 180 );
		_context.scale( z128x / 128, z128y / 128 );
		_context.translate( -cx, -cy );
		try {
			_context.drawImage( image, sx, sy, width, height, 0, 0, width, height );
		} catch( e ){}
		_context.restore();
	}
};
function _ScalableGraphics(){
	this.x = 0;
	this.y = 0;
	this.f = 0;
	this.s = 1.0;
}
_ScalableGraphics.prototype = {
	canUseClip : function(){
		return (!!_context.clip);
	},
	canUseText : function(){
		return (!!_context.fillText);
	},
	setScale : function( scale ){
		this.s = scale;
	},
	scale : function(){
		return this.s;
	},
	getColorOfRGB : function( r, g, b ){
		return "rgb(" + r + "," + g + "," + b + ")";
	},
	getColorOfRGBA : function( r, g, b, a ){
		return "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
	},
	setStrokeWidth : function( width ){
		_context.lineWidth = width * this.s;
	},
	setColor : function( color ){
		_color = color;
		_context.fillStyle = _color;
		_context.strokeStyle = _color;
	},
	setAlpha : function( a ){
		_context.globalAlpha = a / 255.0;
	},
	setROP : function( mode ){
		_context.globalCompositeOperation = mode;
	},
	setFont : function( size, family ){
		setFont( Math.floor( size * this.s ), family );
		_context.font = "" + _font_size + "px " + _font_family;
	},
	stringWidth : function( str ){
		return ((this.s == 0.0) ? 0 : stringWidth( str ) / this.s);
	},
	fontHeight : function(){
		return ((this.s == 0.0) ? 0 : fontHeight() / this.s);
	},
	clearClip : function(){
		_context.restore();
		_context.save();
	},
	setOrigin : function( x, y ){
		this.x = x;
		this.y = y;
	},
	setClip : function( x, y, width, height ){
		x += this.x;
		y += this.y;
		if( !!_context.clip ){
			_context.restore();
			_context.save();
			_context.beginPath();
			_context.moveTo( x * this.s, y * this.s );
			_context.lineTo( (x * this.s) + (width * this.s), y * this.s );
			_context.lineTo( (x * this.s) + (width * this.s), (y * this.s) + (height * this.s) );
			_context.lineTo( x * this.s, (y * this.s) + (height * this.s) );
			_context.closePath();
			_context.clip();
		}
	},
	drawLine : function( x1, y1, x2, y2 ){
		x1 += this.x;
		y1 += this.y;
		x2 += this.x;
		y2 += this.y;
		_context.beginPath();
		_context.moveTo( (x1 + 0.5) * this.s, (y1 + 0.5) * this.s );
		_context.lineTo( (x2 + 0.5) * this.s, (y2 + 0.5) * this.s );
		_context.stroke();
		_context.closePath();
	},
	drawRect : function( x, y, width, height ){
		x += this.x;
		y += this.y;
		_context.strokeRect( (x + 0.5) * this.s, (y + 0.5) * this.s, width * this.s, height * this.s );
	},
	fillRect : function( x, y, width, height ){
		x += this.x;
		y += this.y;
		_context.fillRect( x * this.s, y * this.s, width * this.s, height * this.s );
	},
	drawCircle : function( cx, cy, r ){
		cx += this.x;
		cy += this.y;
		_context.beginPath();
		_context.arc( cx * this.s, cy * this.s, r * this.s, 0.0, Math.PI * 2.0, false );
		_context.stroke();
	},
	drawString : function( str, x, y ){
		x += this.x;
		y += this.y;
		if( !!_context.fillText ){
			_context.fillText( str, x * this.s, y * this.s );
		} else {
			if( _USE_DRAWSTRINGEX ){
				_drawStringEx( str, x * this.s, y * this.s );
			}
		}
	},
	setFlipMode : function( flip ){
		this.f = flip;
	},
	drawScaledImage : function( image, dx, dy, width, height, sx, sy, swidth, sheight ){
		dx += this.x;
		dy += this.y;
		if( this.f == 0 ){
			try {
				_context.drawImage( image, sx, sy, swidth, sheight, dx * this.s, dy * this.s, width * this.s, height * this.s );
			} catch( e ){}
		} else {
			_context.save();
			_context.setTransform( 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 );
			switch( this.f ){
			case 1:
				_context.translate( (dx + width) * this.s, dy * this.s );
				_context.scale( -this.s, this.s );
				break;
			case 2:
				_context.translate( dx * this.s, (dy + height) * this.s );
				_context.scale( this.s, -this.s );
				break;
			case 3:
				_context.translate( (dx + width) * this.s, (dy + height) * this.s );
				_context.scale( -this.s, -this.s );
				break;
			}
			try {
				_context.drawImage( image, sx, sy, swidth, sheight, 0, 0, width, height );
			} catch( e ){}
			_context.restore();
		}
	},
	drawImage : function( image, x, y ){
		this.drawScaledImage( image, x, y, image.width, image.height, 0, 0, image.width, image.height );
	},
	drawTransImage : function( image, dx, dy, sx, sy, width, height, cx, cy, r360, z128x, z128y ){
		dx += this.x;
		dy += this.y;
		_context.save();
		_context.setTransform( 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 );
		_context.translate( dx * this.s, dy * this.s );
		_context.rotate( (Math.PI * r360) / 180 );
		_context.scale( (z128x * this.s) / 128, (z128y * this.s) / 128 );
		_context.translate( -cx, -cy );
		try {
			_context.drawImage( image, sx, sy, width, height, 0, 0, width, height );
		} catch( e ){}
		_context.restore();
	}
};
var _image_load = 0;
function loadImage( src ){
	_image_load++;
	var image = new Image();
	image.onload = function(){
			_image_load--;
	};
	image.src = src;
	return image;
}
function isImageBusy(){
	return (_image_load > 0);
}
function _Image( width, height ){
	this.image = new Image();
	this.canvas = document.createElement( "canvas" );
	this.context = this.canvas.getContext( "2d" );
	this.canvas.width = width;
	this.canvas.height = height;
	this.context.textAlign = "left";
	this.context.textBaseline = "bottom";
}
_Image.prototype = {
	lock : function(){
		this.sav_canvas = _canvas;
		this.sav_context = _context;
		this.sav_lock = _lock;
		_canvas = this.canvas;
		_context = this.context;
		_lock = true;
		_context.clearRect( 0, 0, _canvas.width, _canvas.height );
		_context.save();
	},
	unlock : function(){
		_context.restore();
		_canvas = this.sav_canvas;
		_context = this.sav_context;
		_lock = this.sav_lock;
		this.image.src = this.canvas.toDataURL();
	},
	getWidth : function(){
		return this.canvas.width;
	},
	getHeight : function(){
		return this.canvas.height;
	},
	getImage : function(){
		return this.image;
	}
};
function _Layout( src ){
	this.s = src;
	this.o = new Array();
	this.id = -1;
}
_Layout.prototype = {
	clear : function(){
		for( var i = 0; i < this.o.length; i++ ){
			removeButton( this.o[i] );
		}
		this.o = new Array();
	},
	add : function( x, y, width, height, id ){
		this.o[this.o.length] = createButton( _canvas, this.s, x, y, width, height );
		this.o[this.o.length - 1].id = id;
	},
	addArea : function( x, y, width, height, id, areaName, shape, coords ){
		this.o[this.o.length] = createButton( _canvas, this.s, x, y, width, height, areaName, shape, coords );
		this.o[this.o.length - 1].id = id;
	},
	get : function( id ){
		for( var i = 0; i < this.o.length; i++ ){
			if( this.o[i].id == id ){
				return this.o[i];
			}
		}
		return null;
	},
	check : function(){
		return this.id;
	},
	handleEvent : function( type, param ){
		var i;
		switch( type ){
		case 0:
			for( i = 0; i < this.o.length; i++ ){
				if( param == buttonElement( this.o[i] ) ){
					processEvent( 6, this.o[i].id );
					break;
				}
			}
			break;
		case 1:
			for( i = 0; i < this.o.length; i++ ){
				if( param == buttonElement( this.o[i] ) ){
					this.id = -1;
					break;
				}
			}
			break;
		case 2:
			for( i = 0; i < this.o.length; i++ ){
				if( param == buttonElement( this.o[i] ) ){
					this.id = this.o[i].id;
					break;
				}
			}
			break;
		case 3:
			for( i = 0; i < this.o.length; i++ ){
				if( param == buttonElement( this.o[i] ) ){
					processEvent( 7, this.o[i].id );
					break;
				}
			}
			break;
		case 14:
			for( i = 0; i < this.o.length; i++ ){
				updateButtonPos( this.o[i] );
			}
			break;
		}
	}
};
var _Math = {
	int : function( x ){
		if( x < 0 ){
			return Math.ceil( x );
		}
		return Math.floor( x );
	},
	div : function( a, b ){
		if( a < 0 ){
			return Math.ceil( a / b );
		}
		return Math.floor( a / b );
	},
	mod : function( a, b ){
		if( a < 0 ){
			a = -a;
			return -(a - Math.floor( a / b ) * b);
		}
		return a - Math.floor( a / b ) * b;
	}
};
function _INT( x ){
	return _Math.int( x );
}
function _DIV( a, b ){
	return _Math.div( a, b );
}
function _MOD( a, b ){
	return _Math.mod( a, b );
}
function _Random(){
}
_Random.prototype = {
	next : function( n ){
		if( Math.random() < 0.5 ){
			return -Math.floor( Math.random() * n );
		}
		return Math.floor( Math.random() * n );
	},
	nextInt : function(){
		if( Math.random() < 0.5 ){
			return -Math.floor( Math.random() * 0x80000000 );
		}
		return Math.floor( Math.random() * 0x80000000 );
	}
};
var _System = {
	arraycopy : function( src, src_pos, dst, dst_pos, length ){
		for( var i = 0; i < length; i++ ){
			dst[dst_pos + i] = src[src_pos + i];
		}
	}
};
function _Vector( len ){
	this.o = new Array( len );
	this.n = 0;
}
_Vector.prototype = {
	size : function(){
		return this.n;
	},
	isEmpty : function(){
		return (this.n == 0);
	},
	elementAt : function( index ){
		return this.o[index];
	},
	firstElement : function(){
		return this.o[0];
	},
	lastElement : function(){
		return this.o[this.n - 1];
	},
	setElementAt : function( obj, index ){
		if( (index >= 0) && (index < this.n) ){
			this.o[index] = obj;
		}
	},
	removeElementAt : function( index ){
		if( (index >= 0) && (index < this.n) ){
			this.o[index] = null;
			for( var i = index; i < this.n - 1; i++ ){
				this.o[i] = this.o[i + 1];
			}
			this.n--;
		}
	},
	insertElementAt : function( obj, index ){
		if( (index >= 0) && (index < this.n) ){
			for( var i = this.n - 1; i >= index; i-- ){
				this.o[i + 1] = this.o[i];
			}
			this.o[index] = obj;
			this.n++;
		}
	},
	addElement : function( obj ){
		this.o[this.n] = obj;
		this.n++;
	},
	removeAllElements : function(){
		for( var i = 0; i < this.n; i++ ){
			this.o[i] = null;
		}
		this.n = 0;
	}
};
function canUseCookie(){
	return navigator.cookieEnabled;
}
var _cookie_expires = "Tue, 01 Jan 2030 00:00:00 GMT";
function setExpiresDate( date ){
	_cookie_expires = (new Date( currentTimeMillis() + date * 86400000 )).toGMTString();
}
function _getCookieArray(){
	return document.cookie.split( ";" );
}
function _getCookieParam( cookie ){
	var param = cookie.split( "=" );
	param[0] = param[0].replace( new RegExp( "^\\s+" ), "" );
	return param;
}
function cookieNum(){
	if( document.cookie.length == 0 ){
		return 0;
	}
	return _getCookieArray().length;
}
function getCookieKey( index ){
	if( document.cookie.length == 0 ){
		return "";
	}
	var cookie = _getCookieArray();
	if( index >= cookie.length ){
		return "";
	}
	var param = _getCookieParam( cookie[index] );
	return param[0];
}
function getCookie( key, defValue ){
	var cookie = _getCookieArray();
	for( var i = 0; i < cookie.length; i++ ){
		var param = _getCookieParam( cookie[i] );
		if( param[0] == key ){
			return unescape( param[1] );
		}
	}
	return defValue;
}
function setCookie( key, value ){
	if( value == null ){
		value = "";
	}
	var expires = _cookie_expires;
	if( value.length == 0 ){
		var date = new Date();
		date.setTime( 0 );
		expires = date.toGMTString();
	}
	document.cookie = key + "=" + escape( value ) + "; expires=" + expires;
}
function clearCookie( prefix ){
	var cookie = _getCookieArray();
	for( var i = cookie.length - 1; i >= 0; i-- ){
		var param = _getCookieParam( cookie[i] );
		if( (prefix == undefined) || (param[0].indexOf( prefix ) == 0) ){
			setCookie( param[0], "" );
		}
	}
}
var _cookie_val;
var _cookie_s;
var _cookie_str;
function beginCookieRead( key ){
	_cookie_val = getCookie( key, "" );
	_cookie_s = 0;
}
function cookieRead(){
	if( _cookie_s >= _cookie_val.length ){
		_cookie_str = "";
	} else {
		var e = _cookie_val.indexOf( "&", _cookie_s );
		if( e < 0 ){
			e = _cookie_val.length;
		}
		_cookie_str = _cookie_val.substring( _cookie_s, e );
		_cookie_s = e + 1;
	}
	return unescape( _cookie_str );
}
function endCookieRead(){
	_cookie_val = "";
	_cookie_str = "";
}
function beginCookieWrite(){
	_cookie_val = "";
}
function cookieWrite( str ){
	if( _cookie_val.length > 0 ){
		_cookie_val += "&";
	}
	_cookie_val += escape( str );
}
function endCookieWrite( key ){
	setCookie( key, _cookie_val );
	_cookie_val = "";
}
function _HttpRequestHeader( header, value ){
	this._header = header;
	this._value = value;
}
_HttpRequestHeader.prototype = {
	set : function( request ){
		_httpSetRequestHeader( request, this._header, this._value );
	}
};
var _http_header;
function httpInitHeader(){
	_http_header = new Array();
}
function httpAddHeader( header, value ){
	_http_header[_http_header.length] = new _HttpRequestHeader( header, value );
}
function httpHeader(){
	return _http_header;
}
function _httpOpen( method, url ){
	var request = null;
	if( !!XMLHttpRequest ){
		request = new XMLHttpRequest();
	} else if( !!ActiveXObject ){
		try {
			request = new ActiveXObject( "Msxml2.XMLHTTP.6.0" );
		} catch( e ){
			try {
				request = new ActiveXObject( "Msxml2.XMLHTTP.3.0" );
			} catch( e ){
				try {
					request = new ActiveXObject( "Msxml2.XMLHTTP" );
				} catch( e ){
					try {
						request = new ActiveXObject( "Microsoft.XMLHTTP" );
					} catch( e ){}
				}
			}
		}
	}
	if( request != null ){
		request.open( method, url, true );
		request.onreadystatechange = function(){
			if( request.readyState == 4 ){
				if( request.status == 200 ){
					onHttpResponse( request, request.responseText );
				} else {
					onHttpError( request, request.status );
				}
			}
		};
	}
	return request;
}
function _httpSetRequestHeader( request, header, value ){
	request.setRequestHeader( header, value );
	onHttpSetRequestHeader( header, value );
}
function httpGet( url, header ){
	var request = _httpOpen( "GET", url );
	if( request != null ){
		_httpSetRequestHeader( request, "If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT" );
		if( header != undefined ){
			for( var i = 0; i < header.length; i++ ){
				header[i].set( request );
			}
		}
		request.send( null );
	}
	return request;
}
function httpPost( url, data, type, header ){
	var request = _httpOpen( "POST", url );
	if( request != null ){
		_httpSetRequestHeader( request, "If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT" );
		_httpSetRequestHeader( request, "Content-Type", type );
		if( header != undefined ){
			for( var i = 0; i < header.length; i++ ){
				header[i].set( request );
			}
		}
		request.send( data );
	}
	return request;
}
function _NativeRequest(){
	this.e = document.createElement( "iframe" );
	this.e.setAttribute( "width", 0 );
	this.e.setAttribute( "height", 0 );
	this.e.setAttribute( "style", "position:absolute;left:0;top:0" );
	this.e.setAttribute( "scrolling", "no" );
	this.e.setAttribute( "frameborder", "no" );
	this.e.setAttribute( "src", "about:blank" );
	document.body.appendChild( this.e );
	this.s = "";
}
_NativeRequest.prototype = {
	setScheme : function( scheme ){
		this.s = scheme;
	},
	send : function( url ){
		if( this.s.length > 0 ){
			this.e.src = this.s + "://" + url;
		} else {
			this.e.src = url;
		}
	}
};
function _Preference( useStorage ){
	this.s = (useStorage && canUseStorage());
	this.c = canUseCookie();
}
_Preference.prototype = {
	num : function(){
		if( this.s ){
			return storageNum();
		} else if( this.c ){
			return cookieNum();
		}
		return 0;
	},
	getKey : function( index ){
		if( this.s ){
			return getStorageKey( index );
		} else if( this.c ){
			return getCookieKey( index );
		}
		return null;
	},
	get : function( key, defValue ){
		if( this.s ){
			return getStorage( key, defValue );
		} else if( this.c ){
			return getCookie( key, defValue );
		}
		return defValue;
	},
	set : function( key, value ){
		if( this.s ){
			setStorage( key, value );
		} else if( this.c ){
			setCookie( key, value );
		}
	},
	clear : function( prefix ){
		if( this.s ){
			clearStorage( prefix );
		} else if( this.c ){
			clearCookie( prefix );
		}
	},
	beginRead : function( key ){
		if( this.s ){
			beginStorageRead( key );
		} else if( this.c ){
			beginCookieRead( key );
		}
	},
	read : function(){
		if( this.s ){
			return storageRead();
		} else if( this.c ){
			return cookieRead();
		}
		return "";
	},
	endRead : function(){
		if( this.s ){
			endStorageRead();
		} else if( this.c ){
			endCookieRead();
		}
	},
	beginWrite : function(){
		if( this.s ){
			beginStorageWrite();
		} else if( this.c ){
			beginCookieWrite();
		}
	},
	write : function( str ){
		if( this.s ){
			storageWrite( str );
		} else if( this.c ){
			cookieWrite( str );
		}
	},
	endWrite : function( key ){
		if( this.s ){
			endStorageWrite( key );
		} else if( this.c ){
			endCookieWrite( key );
		}
	}
};
function canUseStorage(){
	try {
		return window.localStorage != null;
	} catch( e ){}
	return false;
}
function storageNum(){
	return window.localStorage.length;
}
function getStorageKey( index ){
	if( index >= storageNum() ){
		return "";
	}
	return window.localStorage.key( index );
}
function getStorage( key, defValue ){
	var value = window.localStorage.getItem( key );
	return (value == null) ? defValue : value;
}
function setStorage( key, value ){
	if( (value != null) && (value.length > 0) ){
		window.localStorage.setItem( key, value );
	} else {
		window.localStorage.removeItem( key );
	}
}
function clearStorage( prefix ){
	if( prefix == undefined ){
		window.localStorage.clear();
	} else {
		var num = storageNum();
		var key;
		for( var i = num - 1; i >= 0; i-- ){
			key = getStorageKey( i );
			if( (prefix == undefined) || (key.indexOf( prefix ) == 0) ){
				setStorage( key, null );
			}
		}
	}
}
var _storage_val;
var _storage_s;
var _storage_str;
function beginStorageRead( key ){
	_storage_val = getStorage( key, "" );
	_storage_s = 0;
}
function storageRead(){
	if( _storage_s >= _storage_val.length ){
		_storage_str = "";
	} else {
		var e = _storage_val.indexOf( "&", _storage_s );
		if( e < 0 ){
			e = _storage_val.length;
		}
		_storage_str = _storage_val.substring( _storage_s, e );
		_storage_s = e + 1;
	}
	return unescape( _storage_str );
}
function endStorageRead(){
	_storage_val = "";
	_storage_str = "";
}
function beginStorageWrite(){
	_storage_val = "";
}
function storageWrite( str ){
	if( _storage_val.length > 0 ){
		_storage_val += "&";
	}
	_storage_val += escape( str );
}
function endStorageWrite( key ){
	setStorage( key, _storage_val );
	_storage_val = "";
}
window.canUseCanvas = canUseCanvas;
window.d2js_onload = d2js_onload;
window.d2js_onorientationchange = d2js_onorientationchange;
window.d2js_onresize = d2js_onresize;
window.setTimer = setTimer;
window.killTimer = killTimer;
window.setRepaintFunc = setRepaintFunc;
window.frameCount = frameCount;
window.resetFrameCount = resetFrameCount;
window.removeMouseEvent = removeMouseEvent;
window.addMouseEvent = addMouseEvent;
window.setCurrent = setCurrent;
window.setGraphics = setGraphics;
window.getCurrent = getCurrent;
window.getCurrentContext = getCurrentContext;
window.getGraphics = getGraphics;
window.setCanvas = setCanvas;
window.setContext = setContext;
window.initLock = initLock;
window.setCanvasSize = setCanvasSize;
window.getWidth = getWidth;
window.getHeight = getHeight;
window.getBrowserWidth = getBrowserWidth;
window.getBrowserHeight = getBrowserHeight;
window.getOrientation = getOrientation;
window.readParameter = readParameter;
window.readParameters = readParameters;
window.getParameter = getParameter;
window.getResImage = getResImage;
window.getResString = getResString;
window.currentTimeMillis = currentTimeMillis;
window.setKeyArray = setKeyArray;
window.keyBit = keyBit;
window.getKeypadState = getKeypadState;
window.clearLayout = clearLayout;
window.addLayout = addLayout;
window.addLayoutArea = addLayoutArea;
window.getLayout = getLayout;
window.checkLayout = checkLayout;
window.getLayoutState = getLayoutState;
window.layoutBit = layoutBit;
window.getMouseX = getMouseX;
window.getMouseY = getMouseY;
window.touchNum = touchNum;
window.getTouchX = getTouchX;
window.getTouchY = getTouchY;
window.launch = launch;
window.setFont = setFont;
window.stringWidth = stringWidth;
window.fontHeight = fontHeight;
window.canUseAudio = canUseAudio;
window.canPlayType = canPlayType;
window.loadAudio = loadAudio;
window.loadAudioEx = loadAudioEx;
window.loadAndPlayAudio = loadAndPlayAudio;
window.loadAndPlayAudioEx = loadAndPlayAudioEx;
window.isLoaded = isLoaded;
window.stopAudio = stopAudio;
window.stopAudioEx = stopAudioEx;
window.reloadAudio = reloadAudio;
window.playAudio = playAudio;
window.playAudioEx = playAudioEx;
window.isPlaying = isPlaying;
window.isPlayingEx = isPlayingEx;
window.pauseAudio = pauseAudio;
window.restartAudio = restartAudio;
window.setVolume = setVolume;
window.getVolume = getVolume;
window.getCurrentTime = getCurrentTime;
window.loadAndPlayAudioSprite = loadAndPlayAudioSprite;
window.playAudioSprite = playAudioSprite;
window.buttonElement = buttonElement;
window.buttonX = buttonX;
window.buttonY = buttonY;
window.buttonWidth = buttonWidth;
window.buttonHeight = buttonHeight;
window.setButtonSrc = setButtonSrc;
window.updateButtonPos = updateButtonPos;
window.setButtonX = setButtonX;
window.setButtonY = setButtonY;
window.setButtonPos = setButtonPos;
window.setButtonWidth = setButtonWidth;
window.setButtonHeight = setButtonHeight;
window.setButtonSize = setButtonSize;
window.setButtonPosSize = setButtonPosSize;
window.setButtonArea = setButtonArea;
window.createButton = createButton;
window.createButtonArea = createButtonArea;
window.attachButton = attachButton;
window.attachButtonArea = attachButtonArea;
window.removeButton = removeButton;
window._Graphics = _Graphics;
window._ScalableGraphics = _ScalableGraphics;
window.loadImage = loadImage;
window.isImageBusy = isImageBusy;
window._Image = _Image;
window._Layout = _Layout;
window._Math = _Math;
window._INT = _INT;
window._DIV = _DIV;
window._MOD = _MOD;
window._Random = _Random;
window._System = _System;
window._Vector = _Vector;
window.canUseCookie = canUseCookie;
window.setExpiresDate = setExpiresDate;
window.cookieNum = cookieNum;
window.getCookieKey = getCookieKey;
window.getCookie = getCookie;
window.setCookie = setCookie;
window.clearCookie = clearCookie;
window.beginCookieRead = beginCookieRead;
window.cookieRead = cookieRead;
window.endCookieRead = endCookieRead;
window.beginCookieWrite = beginCookieWrite;
window.cookieWrite = cookieWrite;
window.endCookieWrite = endCookieWrite;
window._HttpRequestHeader = _HttpRequestHeader;
window.httpInitHeader = httpInitHeader;
window.httpAddHeader = httpAddHeader;
window.httpHeader = httpHeader;
window.httpGet = httpGet;
window.httpPost = httpPost;
window._NativeRequest = _NativeRequest;
window._Preference = _Preference;
window.canUseStorage = canUseStorage;
window.storageNum = storageNum;
window.getStorageKey = getStorageKey;
window.getStorage = getStorage;
window.setStorage = setStorage;
window.clearStorage = clearStorage;
window.beginStorageRead = beginStorageRead;
window.storageRead = storageRead;
window.endStorageRead = endStorageRead;
window.beginStorageWrite = beginStorageWrite;
window.storageWrite = storageWrite;
window.endStorageWrite = endStorageWrite;
window._KEY_BACKSPACE = 8;
window._KEY_TAB = 9;
window._KEY_ENTER = 13;
window._KEY_SELECT = window._KEY_ENTER;
window._KEY_SHIFT = 16;
window._KEY_CTRL = 17;
window._KEY_SPACE = 32;
window._KEY_LEFT = 37;
window._KEY_UP = 38;
window._KEY_RIGHT = 39;
window._KEY_DOWN = 40;
window._KEY_0 = 48;
window._KEY_1 = 49;
window._KEY_2 = 50;
window._KEY_3 = 51;
window._KEY_4 = 52;
window._KEY_5 = 53;
window._KEY_6 = 54;
window._KEY_7 = 55;
window._KEY_8 = 56;
window._KEY_9 = 57;
window._KEY_A = 65;
window._KEY_B = 66;
window._KEY_C = 67;
window._KEY_D = 68;
window._KEY_E = 69;
window._KEY_F = 70;
window._KEY_G = 71;
window._KEY_H = 72;
window._KEY_I = 73;
window._KEY_J = 74;
window._KEY_K = 75;
window._KEY_L = 76;
window._KEY_M = 77;
window._KEY_N = 78;
window._KEY_O = 79;
window._KEY_P = 80;
window._KEY_Q = 81;
window._KEY_R = 82;
window._KEY_S = 83;
window._KEY_T = 84;
window._KEY_U = 85;
window._KEY_V = 86;
window._KEY_W = 87;
window._KEY_X = 88;
window._KEY_Y = 89;
window._KEY_Z = 90;
window._ROP_COPY = "source-over";
window._ROP_ADD = "lighter";
window._FLIP_NONE = 0;
window._FLIP_HORIZONTAL = 1;
window._FLIP_VERTICAL = 2;
window._FLIP_ROTATE = 3;
window._BUTTON_DOWN_EVENT = 0;
window._BUTTON_OUT_EVENT = 1;
window._BUTTON_OVER_EVENT = 2;
window._BUTTON_UP_EVENT = 3;
window._KEY_PRESSED_EVENT = 4;
window._KEY_RELEASED_EVENT = 5;
window._LAYOUT_DOWN_EVENT = 6;
window._LAYOUT_UP_EVENT = 7;
window._MOUSE_DOWN_EVENT = 8;
window._MOUSE_MOVE_EVENT = 9;
window._MOUSE_OUT_EVENT = 10;
window._MOUSE_OVER_EVENT = 11;
window._MOUSE_UP_EVENT = 12;
window._ORIENTATIONCHANGE_EVENT = 13;
window._RESIZE_EVENT = 14;
window._TOUCH_START_EVENT = 15;
window._TOUCH_MOVE_EVENT = 16;
window._TOUCH_END_EVENT = 17;
})( window );
