/*
 * D2JS
 * Copyright (C) SatisKia. All rights reserved.
 */
(function( window, undefined ){
var document = window.document;
function _GLDrawPrimitive( p, index, tex_index, mat , trans, sort, x, y, z ){
	this._p = p;
	this._index = index;
	this._tex_index = tex_index;
	this._mat = mat;
	this._trans = (trans >= 0.0) ? trans : p.transparency();
	this._distance = 0.0;
	if( sort ){
		var dx = x - _glu.positionX();
		var dy = y - _glu.positionY();
		var dz = z - _glu.positionZ();
		this._distance = _glu.distance( dx, dy, dz );
	}
}
_GLDrawPrimitive.prototype = {
	draw : function( glt , alpha ){
		switch( this._p.type() ){
		case 0:
			this._p.setTransparency( this._trans );
			this._p.draw( glt, this._index, this._tex_index, alpha );
			break;
		case 1:
			this._p.setTransparency( this._trans );
			this._p.draw( glt, this._tex_index, alpha );
			break;
		}
	}
};
function _GLDraw( proj_mat , sprite_view_flag ){
	this._proj_mat = proj_mat;
	this._sprite_view_flag = (sprite_view_flag == undefined) ? true : sprite_view_flag;
	this._draw = new Array();
}
_GLDraw.prototype = {
	clear : function(){
		for( var i = this._draw.length - 1; i >= 0; i-- ){
			if( this._draw[i] != null ){
				this._draw[i] = null;
			}
		}
		this._draw.length = 0;
	},
	add : function( p, index, tex_index, mat , trans ){
		if( (p.type() == 0) && (index < 0) ){
			for( var i = p.stripNum() - 1; i >= 0; i-- ){
				this._draw[this._draw.length] = new _GLDrawPrimitive( p, i, tex_index, mat, trans, false );
			}
		} else {
			this._draw[this._draw.length] = new _GLDrawPrimitive( p, index, tex_index, mat, trans, false );
		}
	},
	addSprite : function( p, tex_index, x, y, z, trans ){
		var index = this._draw.length;
		this._draw[index] = new _GLDrawPrimitive( p, -1, tex_index, _glu.spriteMatrix( x, y, z, this._sprite_view_flag ), trans, true, x, y, z );
		return this._draw[index]._distance;
	},
	addSpriteScale : function( p, tex_index, x, y, z, scale_x, scale_y, scale_z, trans ){
		var index = this._draw.length;
		_glu.spriteMatrix( x, y, z, this._sprite_view_flag );
		_glu.scale( scale_x, scale_y, scale_z );
		this._draw[index] = new _GLDrawPrimitive( p, -1, tex_index, _glu.glMatrix(), trans, true, x, y, z );
		return this._draw[index]._distance;
	},
	draw : function( glt ){
		var i, j;
		var distance;
		var tmp;
		var count = this._draw.length;
		var draw = new Array();
		var k = 0;
		for( i = 0; i < count; i++ ){
			if( this._draw[i]._distance == 0.0 ){
				this._draw[i]._distance = -1.0;
				draw[k++] = this._draw[i];
			}
		}
		for( ; k < count; k++ ){
			distance = 0.0;
			j = 0;
			for( i = 0; i < count; i++ ){
				if( this._draw[i]._distance >= distance ){
					distance = this._draw[i]._distance;
					j = i;
				}
			}
			this._draw[j]._distance = -1.0;
			draw[k] = this._draw[j];
		}
		for( i = 0; i < count; i++ ){
			tmp = draw[i];
			glDrawUseProgram( _gl, tmp._p, tmp._index );
			glDrawSetProjectionMatrix( _gl, this._proj_mat, tmp._p, tmp._index );
			glDrawSetModelViewMatrix( _gl, tmp._mat, tmp._p, tmp._index );
			tmp.draw( glt, false );
		}
		for( i = 0; i < count; i++ ){
			tmp = draw[i];
			glDrawUseProgram( _gl, tmp._p, tmp._index );
			glDrawSetProjectionMatrix( _gl, this._proj_mat, tmp._p, tmp._index );
			glDrawSetModelViewMatrix( _gl, tmp._mat, tmp._p, tmp._index );
			tmp.draw( glt, true );
		}
		for( i = 0; i < count; i++ ){
			draw[i] = null;
		}
		draw = null;
	}
};
function canUseWebGL(){
	var canvas = document.createElement( "canvas" );
	var context = canvas.getContext( "webgl" );
	return (context != null);
}
function canUseWebGLDepthTexture( context ){
	if( context == undefined ){
		var canvas = document.createElement( "canvas" );
		context = canvas.getContext( "webgl" );
	}
	return (context.getExtension( "WEBGL_depth_texture" ) != null);
}
function canUseWebGLTextureFloat( context ){
	if( context == undefined ){
		var canvas = document.createElement( "canvas" );
		context = canvas.getContext( "webgl" );
	}
	return (context.getExtension( "OES_texture_float" ) != null);
}
var _gl;
var _glu;
var _3d = null;
function setCurrent3D( id, id2D, stencil, antialias ){
	if( id2D == undefined ){
		id2D = "";
	}
	if( typeof stencil == "object" && stencil != null ){
		antialias = !!stencil.antialias;
		stencil = !!stencil.stencil;
	} else {
		if( stencil == undefined ){
			stencil = false;
		}
		if( antialias == undefined ){
			antialias = false;
		}
	}
	removeMouseEvent();
	var _canvas = setCanvas( document.getElementById( id ) );
	if( antialias ){
		if( stencil ){
			_gl = _canvas.getContext( "webgl", { antialias: true, stencil: true } );
		} else {
			_gl = _canvas.getContext( "webgl", { antialias: true } );
		}
	} else {
		if( stencil ){
			_gl = _canvas.getContext( "webgl", { stencil: true } );
		} else {
			_gl = _canvas.getContext( "webgl" );
		}
	}
	initLock();
	if( id2D.length > 0 ){
		_3d = _canvas;
		_canvas = setCanvas( document.getElementById( id2D ) );
		var _context = setContext( _canvas.getContext( "2d" ) );
		_canvas.width = _3d.width;
		_canvas.height = _3d.height;
		_context.textAlign = "left";
		_context.textBaseline = "bottom";
		setGraphics( new _Graphics() );
	}
	addMouseEvent();
	_glu = new _GLUtility();
	if( init3D( _gl, _glu ) ){
		if( _3d != null ){
			init2D( getGraphics() );
		}
		setRepaintFunc( repaint3D );
	} else {
		killTimer();
	}
}
var repaint3D = function(){
	if( _3d != null ){
		getCurrentContext().clearRect( 0, 0, getWidth(), getHeight() );
		getCurrentContext().save();
		clear2D( getGraphics() );
	}
	paint3D( _gl, _glu );
	if( _3d != null ){
		paint2D( getGraphics() );
		getCurrentContext().restore();
	}
};
function getCurrent3D(){
	return (_3d == null) ? getCurrent() : _3d;
}
function getCurrentContext3D(){
	return _gl;
}
function setCanvas3DSize( _width, _height ){
	getCurrent3D().width = _width;
	getCurrent3D().height = _height;
}
function _loadShader( type, source, errorFunc ){
	var shader = _gl.createShader( type );
	_gl.shaderSource( shader, source );
	_gl.compileShader( shader );
	if( !_gl.getShaderParameter( shader, _gl.COMPILE_STATUS ) ){
		if( errorFunc != undefined ){
			errorFunc( 0, _gl.getShaderInfoLog( shader ) );
		}
		_gl.deleteShader( shader );
		return null;
	}
	return shader;
}
function createShaderProgram( vsSource, fsSource, errorFunc ){
	var vertexShader = _loadShader( _gl.VERTEX_SHADER, vsSource, errorFunc );
	var fragmentShader = _loadShader( _gl.FRAGMENT_SHADER, fsSource, errorFunc );
	var shaderProgram = _gl.createProgram();
	_gl.attachShader( shaderProgram, vertexShader );
	_gl.attachShader( shaderProgram, fragmentShader );
	_gl.linkProgram( shaderProgram );
	if( !_gl.getProgramParameter( shaderProgram, _gl.LINK_STATUS ) ){
		if( errorFunc != undefined ){
			errorFunc( 1, _gl.getProgramInfoLog( shaderProgram ) );
		}
		return null;
	}
	return shaderProgram;
}
function _GLModel( id, depth, lighting ){
	this._glp = new _GLPrimitive();
	this._glp.setType( 0 );
	this._glp.setDepth( depth );
	this._id = id;
	this._lighting = lighting;
	this._material_num = 0;
	this._material_texture = null;
	this._material_diffuse = null;
	this._material_ambient = null;
	this._material_emission = null;
	this._material_specular = null;
	this._material_shininess = null;
	this._object_num = 0;
	this._coord = null;
	this._normal = null;
	this._color = null;
	this._map = null;
	this._radius = 0.0;
	this._strip_num = 0;
	this._strip_material = null;
	this._strip_coord = null;
	this._strip_normal = null;
	this._strip_color = null;
	this._strip_map = null;
	this._strip_len = null;
	this._strip = null;
	this._strip_type = 2;
	this._strip_tx = null;
	this._strip_ty = null;
	this._strip_tz = null;
	this._strip_or = null;
	this._strip_ox = null;
	this._strip_oy = null;
	this._strip_oz = null;
	this._texture_env_mode_flag = false;
	this._texture_env_mode = 0;
	this._position_buffer = _gl.createBuffer();
	this._normal_buffer = _gl.createBuffer();
	this._color_buffer = _gl.createBuffer();
	this._texture_coord_buffer = _gl.createBuffer();
	this._strip_buffer = _gl.createBuffer();
}
_GLModel.prototype = {
	type : function(){
		return this._glp.type();
	},
	depth : function(){
		return this._glp.depth();
	},
	setTransparency : function( trans ){
		this._glp.setTransparency( trans );
	},
	transparency : function(){
		return this._glp.transparency();
	},
	id : function(){
		return this._id;
	},
	lighting : function(){
		return this._lighting;
	},
	setMaterial : function( num, texture , diffuse , ambient , emission , specular , shininess ){
		this._material_num = num;
		this._material_texture = texture;
		this._material_diffuse = diffuse;
		this._material_ambient = ambient;
		this._material_emission = emission;
		this._material_specular = specular;
		this._material_shininess = shininess;
	},
	setObject : function( num, coord , normal , color , map , radius ){
		this._object_num = num;
		this._coord = coord;
		this._normal = normal;
		this._color = color;
		this._map = map;
		this._radius = radius;
	},
	setStrip : function( num, material , coord , normal , color , map , len , strip , strip_type ){
		if( strip_type == undefined ){
			strip_type = 2;
		}
		this._strip_num = num;
		this._strip_material = material;
		this._strip_coord = coord;
		this._strip_normal = normal;
		this._strip_color = color;
		this._strip_map = map;
		this._strip_len = len;
		this._strip = strip;
		this._strip_type = strip_type;
	},
	setStripTranslate : function( tx, ty, tz ){
		this._strip_tx = tx;
		this._strip_ty = ty;
		this._strip_tz = tz;
	},
	setStripRotate : function( or, ox, oy, oz ){
		this._strip_or = or;
		this._strip_ox = ox;
		this._strip_oy = oy;
		this._strip_oz = oz;
	},
	setTextureEnvMode : function( mode ){
		this._texture_env_mode_flag = true;
		this._texture_env_mode = mode;
	},
	colorNum : function(){
		if( this._color == null ){
			return 0;
		}
		return this._color.length;
	},
	setColor : function( index, r, g, b, a ){
		for( var i = 0; i < this._color[index].length / 4; i++ ){
			this._color[index][i * 4 ] = r;
			this._color[index][i * 4 + 1] = g;
			this._color[index][i * 4 + 2] = b;
			this._color[index][i * 4 + 3] = a;
		}
	},
	stripNum : function(){
		return this._strip_num;
	},
	stripTranslate : function( index ){
		_glu.translate( this._strip_tx[index], this._strip_ty[index], this._strip_tz[index] );
	},
	stripRotate : function( index ){
		var r = this._strip_or[index];
		var x = this._strip_ox[index];
		var y = this._strip_oy[index];
		var z = this._strip_oz[index];
		if(
			((x == 1.0) && (y == 0.0) && (z == 0.0)) ||
			((x == 0.0) && (y == 1.0) && (z == 0.0)) ||
			((x == 0.0) && (y == 0.0) && (z == 1.0))
		){
			_glu.rotate( r, x, y, z );
		} else {
			switch( r ){
			case 0:
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				break;
			case 1:
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				break;
			case 2:
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				break;
			case 3:
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				break;
			case 4:
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				break;
			case 5:
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				break;
			}
		}
	},
	textureIndex : function( index ){
		if( this._strip_material[index] < 0 ){
			return -1;
		}
		return this._material_texture[this._strip_material[index]];
	},
	textureAlpha : function( glt , index, tex_index ){
		var alpha = false;
		var depth = this.depth();
		if( tex_index < 0 ){
			tex_index = this.textureIndex( index );
		}
		if( tex_index >= 0 ){
			glt.use( tex_index );
			glt.setTransparency( tex_index, this.transparency() );
			alpha = glt.alpha( tex_index );
			if( depth ){
				depth = glt.depth( tex_index );
			}
		}
		return (alpha && !depth);
	},
	draw : function( glt , index, tex_index, alpha ){
		var alpha2 = this.textureAlpha( glt, index, tex_index );
		if( this.transparency() != 1.0 ){
			alpha2 = true;
		}
		if( alpha2 != alpha ){
			return;
		}
		if( this._strip_coord[index] >= 0 ){
			_gl.bindBuffer( _gl.ARRAY_BUFFER, this._position_buffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( this._coord[this._strip_coord[index]] ), _gl.STATIC_DRAW );
			glModelBindPositionBuffer( _gl, this._id, this._lighting );
			_gl.bindBuffer( _gl.ARRAY_BUFFER, null );
		}
		if( (this._normal != null) && (this._strip_normal[index] >= 0) ){
			_gl.bindBuffer( _gl.ARRAY_BUFFER, this._normal_buffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( this._normal[this._strip_normal[index]] ), _gl.STATIC_DRAW );
			glModelBindNormalBuffer( _gl, this._id, this._lighting );
			_gl.bindBuffer( _gl.ARRAY_BUFFER, null );
		}
		if( (this._color != null) && (this._strip_color[index] >= 0) ){
			var color;
			var trans = this.transparency();
			if( trans != 1.0 ){
				var tmp = this._color[this._strip_color[index]];
				color = new Array( tmp.length );
				for( var i = 0; i < tmp.length; i += 4 ){
					color[i ] = tmp[i ];
					color[i + 1] = tmp[i + 1];
					color[i + 2] = tmp[i + 2];
					color[i + 3] = tmp[i + 3] * trans;
				}
			} else {
				color = this._color[this._strip_color[index]];
			}
			_gl.bindBuffer( _gl.ARRAY_BUFFER, this._color_buffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( color ), _gl.STATIC_DRAW );
			glModelBindColorBuffer( _gl, this._id, this._lighting );
			_gl.bindBuffer( _gl.ARRAY_BUFFER, null );
		}
		if( tex_index < 0 ){
			tex_index = this.textureIndex( index );
		}
		if( !glModelSetTexture( _gl, glt, index, tex_index, this._id, this._lighting ) ){
			if( (this._map != null) && (this._strip_map[index] >= 0) && (tex_index >= 0) ){
				_gl.activeTexture( glModelActiveTexture( _gl, this._id ) );
				glt.bindTexture( _gl.TEXTURE_2D, glt.id( tex_index ) );
				_gl.bindBuffer( _gl.ARRAY_BUFFER, this._texture_coord_buffer );
				_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( this._map[this._strip_map[index]] ), _gl.STATIC_DRAW );
				glModelBindTextureCoordBuffer( _gl, this._id, this._lighting );
				_gl.bindBuffer( _gl.ARRAY_BUFFER, null );
			}
		}
		var material_diffuse = null;
		var material_ambient = null;
		var material_emission = null;
		var material_specular = null;
		var material_shininess = null;
		if( (this._material_diffuse != null) && (this._strip_material[index] >= 0) ){
			material_diffuse = new Array( 4 );
			material_diffuse[0] = this._material_diffuse[this._strip_material[index] * 4 ];
			material_diffuse[1] = this._material_diffuse[this._strip_material[index] * 4 + 1];
			material_diffuse[2] = this._material_diffuse[this._strip_material[index] * 4 + 2];
			material_diffuse[3] = this._material_diffuse[this._strip_material[index] * 4 + 3];
		}
		if( (this._material_ambient != null) && (this._strip_material[index] >= 0) ){
			material_ambient = new Array( 4 );
			material_ambient[0] = this._material_ambient[this._strip_material[index] * 4 ];
			material_ambient[1] = this._material_ambient[this._strip_material[index] * 4 + 1];
			material_ambient[2] = this._material_ambient[this._strip_material[index] * 4 + 2];
			material_ambient[3] = this._material_ambient[this._strip_material[index] * 4 + 3];
		}
		if( (this._material_emission != null) && (this._strip_material[index] >= 0) ){
			material_emission = new Array( 4 );
			material_emission[0] = this._material_emission[this._strip_material[index] * 4 ];
			material_emission[1] = this._material_emission[this._strip_material[index] * 4 + 1];
			material_emission[2] = this._material_emission[this._strip_material[index] * 4 + 2];
			material_emission[3] = this._material_emission[this._strip_material[index] * 4 + 3];
		}
		if( (this._material_specular != null) && (this._strip_material[index] >= 0) ){
			material_specular = new Array( 4 );
			material_specular[0] = this._material_specular[this._strip_material[index] * 4 ];
			material_specular[1] = this._material_specular[this._strip_material[index] * 4 + 1];
			material_specular[2] = this._material_specular[this._strip_material[index] * 4 + 2];
			material_specular[3] = this._material_specular[this._strip_material[index] * 4 + 3];
		}
		if( (this._material_shininess != null) && (this._strip_material[index] >= 0) ){
			material_shininess = this._material_shininess[this._strip_material[index]];
		}
		if( alpha2 ){
			_gl.disable( _gl.CULL_FACE );
			_gl.enable( _gl.BLEND );
			_gl.depthMask( false );
		}
		if( glModelBeginDraw( _gl, glt, index, tex_index, this._id, this._lighting, material_diffuse, material_ambient, material_emission, material_specular, material_shininess ) ){
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, this._strip_buffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this._strip[index] ), _gl.STATIC_DRAW );
			var count = _gl.getBufferParameter( _gl.ELEMENT_ARRAY_BUFFER, _gl.BUFFER_SIZE ) / 2 ;
			if( this._strip_type == 0 ){
				_gl.drawElements( _gl.LINE_STRIP, count, _gl.UNSIGNED_SHORT, 0 );
			} else if( this._strip_type == 1 ){
				_gl.drawElements( _gl.LINES, count, _gl.UNSIGNED_SHORT, 0 );
			} else if( this._strip_type == 2 ){
				_gl.drawElements( _gl.TRIANGLE_STRIP, count, _gl.UNSIGNED_SHORT, 0 );
			}
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, null );
			glModelEndDraw( _gl, glt, index, tex_index, this._id, this._lighting );
		}
		if( alpha2 ){
			_gl.enable( _gl.CULL_FACE );
			_gl.disable( _gl.BLEND );
			_gl.depthMask( true );
		}
	},
	radius : function(){
		return this._radius;
	},
	rotate : function( r, x, y, z ){
		_glu.setIdentity();
		if(
			((x == 1.0) && (y == 0.0) && (z == 0.0)) ||
			((x == 0.0) && (y == 1.0) && (z == 0.0)) ||
			((x == 0.0) && (y == 0.0) && (z == 1.0))
		){
			_glu.rotate( r, x, y, z );
		} else {
			switch( r ){
			case 0:
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				break;
			case 1:
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				break;
			case 2:
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				break;
			case 3:
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				break;
			case 4:
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				break;
			case 5:
				_glu.rotate( x, 1.0, 0.0, 0.0 );
				_glu.rotate( y, 0.0, 1.0, 0.0 );
				_glu.rotate( z, 0.0, 0.0, 1.0 );
				break;
			}
		}
		var i, j;
		var num;
		var count;
		num = this._coord.length;
		for ( j = 0; j < num; j++ ) {
			count = this._coord[j].length;
			for ( i = 0; i < count; i += 3 ) {
				_glu.transVector(this._coord[j][i], this._coord[j][i + 1], this._coord[j][i + 2]);
				this._coord[j][i ] = _glu.transX();
				this._coord[j][i + 1] = _glu.transY();
				this._coord[j][i + 2] = _glu.transZ();
			}
		}
		num = this._normal.length;
		for ( j = 0; j < num; j++ ) {
			count = this._normal[j].length;
			for ( i = 0; i < count; i += 3 ) {
				_glu.transVector(this._normal[j][i], this._normal[j][i + 1], this._normal[j][i + 2]);
				this._normal[j][i ] = _glu.transX();
				this._normal[j][i + 1] = _glu.transY();
				this._normal[j][i + 2] = _glu.transZ();
			}
		}
	}
};
function _GLModelData( data ){
	this._data = data;
	this._cur = 0;
}
_GLModelData.prototype = {
	get : function(){
		if( typeof this._data == "string" ){
			var tmp = "";
			var chr;
			while( (chr = this._data.charAt( this._cur++ )) != "," ){
				tmp += chr;
				if( this._cur >= this._data.length ){
					break;
				}
			}
			if( tmp.length > 0 ){
				if( tmp.charAt( 0 ) == "." ){
					return Number( "0" + tmp );
				} else if( tmp.charAt( 0 ) == "-" ){
					if( (tmp.length > 1) && (tmp.charAt( 1 ) == ".") ){
						return Number( "-0" + tmp.substring( 1 ) );
					}
				}
				return Number( tmp );
			}
			return 0;
		}
		return this._data[this._cur++];
	}
};
function createGLModel( _data, scale, id, depth, lighting, strip_type ){
	var data;
	if( _data instanceof _GLModelData ){
		data = _data;
	} else {
		data = new _GLModelData( _data );
	}
	var model = new _GLModel( id, depth, lighting );
	var i, j, k;
	var coord_count;
	var normal_count;
	var color_count;
	var map_count;
	var texture_num = data.get();
	var texture_index = new Array(texture_num);
	var material_dif = new Array(texture_num * 4);
	var material_amb = new Array(texture_num * 4);
	var material_emi = new Array(texture_num * 4);
	var material_spc = new Array(texture_num * 4);
	var material_power = new Array(texture_num);
	var material_val;
	for ( i = 0; i < texture_num; i++ ) {
		texture_index[i] = data.get();
		material_val = data.get();
		if ( material_val < 0.0 ) {
			material_dif[i * 4 ] = data.get();
			material_dif[i * 4 + 1] = data.get();
			material_dif[i * 4 + 2] = data.get();
		} else {
			material_dif[i * 4 ] = material_val;
			material_dif[i * 4 + 1] = material_dif[i * 4];
			material_dif[i * 4 + 2] = material_dif[i * 4];
		}
		material_dif[i * 4 + 3] = 1.0;
		material_val = data.get();
		if ( material_val < 0.0 ) {
			material_amb[i * 4 ] = data.get();
			material_amb[i * 4 + 1] = data.get();
			material_amb[i * 4 + 2] = data.get();
		} else {
			material_amb[i * 4 ] = material_val;
			material_amb[i * 4 + 1] = material_amb[i * 4];
			material_amb[i * 4 + 2] = material_amb[i * 4];
		}
		material_amb[i * 4 + 3] = 1.0;
		material_val = data.get();
		if ( material_val < 0.0 ) {
			material_emi[i * 4 ] = data.get();
			material_emi[i * 4 + 1] = data.get();
			material_emi[i * 4 + 2] = data.get();
		} else {
			material_emi[i * 4 ] = material_val;
			material_emi[i * 4 + 1] = material_emi[i * 4];
			material_emi[i * 4 + 2] = material_emi[i * 4];
		}
		material_emi[i * 4 + 3] = 1.0;
		material_val = data.get();
		if ( material_val < 0.0 ) {
			material_spc[i * 4 ] = data.get();
			material_spc[i * 4 + 1] = data.get();
			material_spc[i * 4 + 2] = data.get();
		} else {
			material_spc[i * 4 ] = material_val;
			material_spc[i * 4 + 1] = material_spc[i * 4];
			material_spc[i * 4 + 2] = material_spc[i * 4];
		}
		material_spc[i * 4 + 3] = 1.0;
		material_power[i] = data.get() * 128.0 / 100.0;
	}
	model.setMaterial(texture_num, texture_index, material_dif, material_amb, material_emi, material_spc, material_power);
	var group_tx = data.get() * scale;
	var group_ty = data.get() * scale;
	var group_tz = data.get() * scale;
	var group_or = data.get();
	var group_ox = data.get();
	var group_oy = data.get();
	var group_oz = data.get();
	_glu.setIdentity();
	_glu.translate(group_tx, group_ty, group_tz);
	if (
		((group_ox == 1.0) && (group_oy == 0.0) && (group_oz == 0.0)) ||
		((group_ox == 0.0) && (group_oy == 1.0) && (group_oz == 0.0)) ||
		((group_ox == 0.0) && (group_oy == 0.0) && (group_oz == 1.0))
	) {
		_glu.rotate(group_or, group_ox, group_oy, group_oz);
	} else {
		switch ( group_or ) {
		case 0:
			_glu.rotate(group_oz, 0.0, 0.0, 1.0);
			_glu.rotate(group_oy, 0.0, 1.0, 0.0);
			_glu.rotate(group_ox, 1.0, 0.0, 0.0);
			break;
		case 1:
			_glu.rotate(group_oy, 0.0, 1.0, 0.0);
			_glu.rotate(group_oz, 0.0, 0.0, 1.0);
			_glu.rotate(group_ox, 1.0, 0.0, 0.0);
			break;
		case 2:
			_glu.rotate(group_oz, 0.0, 0.0, 1.0);
			_glu.rotate(group_ox, 1.0, 0.0, 0.0);
			_glu.rotate(group_oy, 0.0, 1.0, 0.0);
			break;
		case 3:
			_glu.rotate(group_ox, 1.0, 0.0, 0.0);
			_glu.rotate(group_oz, 0.0, 0.0, 1.0);
			_glu.rotate(group_oy, 0.0, 1.0, 0.0);
			break;
		case 4:
			_glu.rotate(group_oy, 0.0, 1.0, 0.0);
			_glu.rotate(group_ox, 1.0, 0.0, 0.0);
			_glu.rotate(group_oz, 0.0, 0.0, 1.0);
			break;
		case 5:
			_glu.rotate(group_ox, 1.0, 0.0, 0.0);
			_glu.rotate(group_oy, 0.0, 1.0, 0.0);
			_glu.rotate(group_oz, 0.0, 0.0, 1.0);
			break;
		}
	}
	var x, y, z;
	var tx, ty, tz, r;
	var radius = 0.0;
	var coord_num = data.get();
	coord_count = null;
	var coord = null;
	if ( coord_num > 0 ) {
		coord_count = new Array(coord_num);
		coord = new Array(coord_num);
		for ( j = 0; j < coord_num; j++ ) {
			coord_count[j] = data.get();
			if ( coord_count[j] <= 0 ) {
				coord[j] = null;
			} else {
				coord[j] = new Array(coord_count[j] * 3);
				for ( i = 0; i < coord_count[j]; i++ ) {
					x = data.get() * scale;
					y = data.get() * scale;
					z = data.get() * scale;
					_glu.transVector(x, y, z);
					tx = _glu.transX();
					ty = _glu.transY();
					tz = _glu.transZ();
					r = tx * tx + ty * ty + tz * tz;
					if ( r > radius ) {
						radius = r;
					}
					coord[j][i * 3 ] = tx;
					coord[j][i * 3 + 1] = ty;
					coord[j][i * 3 + 2] = tz;
				}
			}
		}
	}
	radius = Math.sqrt(radius);
	var num = data.get();
	normal_count = null;
	var normal = null;
	if ( num > 0 ) {
		normal_count = new Array(coord_num);
		normal = new Array(coord_num);
		for ( j = 0; j < coord_num; j++ ) {
			normal_count[j] = data.get();
			if ( normal_count[j] <= 0 ) {
				normal[j] = null;
			} else {
				normal[j] = new Array(normal_count[j] * 3);
				for ( i = 0; i < normal_count[j]; i++ ) {
					x = data.get();
					y = data.get();
					z = data.get();
					_glu.transVector(x, y, z);
					normal[j][i * 3 ] = _glu.transX();
					normal[j][i * 3 + 1] = _glu.transY();
					normal[j][i * 3 + 2] = _glu.transZ();
				}
			}
		}
	}
	num = data.get();
	color_count = null;
	var color = null;
	if ( num > 0 ) {
		color_count = new Array(coord_num);
		color = new Array(coord_num);
		for ( j = 0; j < coord_num; j++ ) {
			color_count[j] = data.get();
			if ( color_count[j] <= 0 ) {
				color[j] = null;
			} else {
				color[j] = new Array(color_count[j] * 4);
				for ( i = 0; i < color_count[j]; i++ ) {
					color[j][i * 4 ] = data.get();
					color[j][i * 4 + 1] = data.get();
					color[j][i * 4 + 2] = data.get();
					color[j][i * 4 + 3] = 1.0;
				}
			}
		}
	}
	num = data.get();
	map_count = null;
	var map = null;
	if ( num > 0 ) {
		map_count = new Array(coord_num);
		map = new Array(coord_num);
		for ( j = 0; j < coord_num; j++ ) {
			map_count[j] = data.get();
			if ( map_count[j] <= 0 ) {
				map[j] = null;
			} else {
				map[j] = new Array(map_count[j] * 2);
				for ( i = 0; i < map_count[j]; i++ ) {
					map[j][i * 2 ] = data.get();
					map[j][i * 2 + 1] = data.get();
				}
			}
		}
	}
	model.setObject(coord_num, coord, normal, color, map, radius);
	var strip_num = data.get();
	var strip_tx = new Array(strip_num);
	var strip_ty = new Array(strip_num);
	var strip_tz = new Array(strip_num);
	var strip_or = new Array(strip_num);
	var strip_ox = new Array(strip_num);
	var strip_oy = new Array(strip_num);
	var strip_oz = new Array(strip_num);
	var strip_texture = new Array(strip_num);
	var strip_coord = new Array(strip_num);
	var strip_normal = new Array(strip_num);
	var strip_color = new Array(strip_num);
	var strip_map = new Array(strip_num);
	var strip_len = new Array(strip_num);
	var strip = new Array(strip_num);
	for ( j = 0; j < strip_num; j++ ) {
		strip_tx[j] = data.get() * scale;
		strip_ty[j] = data.get() * scale;
		strip_tz[j] = data.get() * scale;
		strip_or[j] = data.get();
		strip_ox[j] = data.get();
		strip_oy[j] = data.get();
		strip_oz[j] = data.get();
		strip_texture[j] = data.get();
		strip_coord[j] = data.get();
		strip_normal[j] = data.get();
		strip_color[j] = data.get();
		strip_map[j] = data.get();
		strip_len[j] = data.get();
		strip[j] = new Array(strip_len[j]);
		for ( k = 0; k < strip_len[j]; k++ ) {
			strip[j][k] = data.get();
		}
	}
	model.setStrip(strip_num, strip_texture, strip_coord, strip_normal, strip_color, strip_map, strip_len, strip, strip_type);
	model.setStripTranslate( strip_tx, strip_ty, strip_tz );
	model.setStripRotate( strip_or, strip_ox, strip_oy, strip_oz );
	return model;
}
function _GLPrimitive(){
	this._type = 0;
	this._depth = false;
	this._trans = 1.0;
}
_GLPrimitive.prototype = {
	setType : function( type ){
		this._type = type;
	},
	setDepth : function( depth ){
		this._depth = depth;
	},
	setTransparency : function( trans ){
		this._trans = trans;
	},
	type : function(){
		return this._type;
	},
	depth : function(){
		return this._depth;
	},
	transparency : function(){
		return this._trans;
	}
};
function _GLShader( vsSource, fsSource, useVars ){
	if( typeof glShaderError != 'undefined' ){
		this._program = createShaderProgram( vsSource, fsSource, glShaderError );
	} else {
		this._program = createShaderProgram( vsSource, fsSource );
	}
	if( (useVars != undefined) && (useVars == true) ){
		var i, j;
		var tmp, tmp2, tmp3, tmp4, tmp5;
		var type;
		var top, end;
		var name;
		this.vars = [];
		for( j = 0; j < 2; j++ ){
			tmp = "" + ((j == 0) ? vsSource : fsSource);
			for( i = 0; i < 2; i++ ){
				type = ((i == 0) ? "attribute" : "uniform");
				while( true ){
					if( (top = tmp.indexOf( type )) >= 0 ){
						tmp2 = tmp.substring( top );
						if( (end = tmp2.indexOf( ";" )) >= 0 ){
							name = "";
							tmp3 = tmp2.substring( 0, end );
							tmp4 = tmp3.split( "\t" );
							if( tmp4.length > 0 ){
								tmp5 = tmp4[tmp4.length - 1].split( " " );
								if( tmp5.length > 0 ){
									name = tmp5[tmp5.length - 1];
								} else {
									name = tmp4[tmp4.length - 1];
								}
							} else {
								tmp4 = tmp3.split( " " );
								if( tmp4.length > 0 ){
									name = tmp4[tmp4.length - 1];
								}
							}
							if( name.length > 0 ){
								if( i == 0 ){
									this.vars[name] = _gl.getAttribLocation( this._program, name );
								} else {
									this.vars[name] = _gl.getUniformLocation( this._program, name );
								}
							}
							if( end + 1 >= tmp.length ){
								break;
							}
							tmp = tmp.substring( end + 1 );
						} else {
							break;
						}
					} else {
						break;
					}
				}
			}
		}
	}
}
_GLShader.prototype = {
	attrib : function( name ){
		if( this.vars != undefined ){
			return this.vars[name];
		}
		return _gl.getAttribLocation( this._program, name );
	},
	uniform : function( name ){
		if( this.vars != undefined ){
			return this.vars[name];
		}
		return _gl.getUniformLocation( this._program, name );
	},
	use : function(){
		_gl.useProgram( this._program );
	}
};
_GLShader.bindPositionBuffer = function( attrib ){
	_gl.vertexAttribPointer( attrib, 3, _gl.FLOAT, false, 0, 0 );
	_gl.enableVertexAttribArray( attrib );
};
_GLShader.bindNormalBuffer = function( attrib ){
	_gl.vertexAttribPointer( attrib, 3, _gl.FLOAT, false, 0, 0 );
	_gl.enableVertexAttribArray( attrib );
};
_GLShader.bindColorBuffer = function( attrib ){
	_gl.vertexAttribPointer( attrib, 4, _gl.FLOAT, false, 0, 0 );
	_gl.enableVertexAttribArray( attrib );
};
_GLShader.bindTextureCoordBuffer = function( attrib ){
	_gl.vertexAttribPointer( attrib, 2, _gl.FLOAT, false, 0, 0 );
	_gl.enableVertexAttribArray( attrib );
};
_GLShader.setIndexBuffer = function( buffer, indices ){
	_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffer );
	_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), _gl.STATIC_DRAW );
	_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, null);
};
_GLShader.setArrayBuffer = function( buffer, data ){
	_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
	_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( data ), _gl.STATIC_DRAW );
	_gl.bindBuffer( _gl.ARRAY_BUFFER, null );
};
_GLShader.bindArrayBuffer = function( attrib, buffer, param1, param2 ){
	var stride = (param2 == undefined) ? param1 : param2;
	_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
	if( param2 != undefined ){
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( param1 ), _gl.STATIC_DRAW );
	}
	_gl.vertexAttribPointer( attrib, stride, _gl.FLOAT, false, 0, 0 );
	_gl.enableVertexAttribArray( attrib );
	_gl.bindBuffer( _gl.ARRAY_BUFFER, null );
};
function _GLSprite( id, depth ){
	this._glp = new _GLPrimitive();
	this._glp.setType( 1 );
	this._glp.setDepth( depth );
	this._id = id;
	this._coord = new Array( 12 );
	this._map = new Array( 8 );
	this._uv = new Array( 8 );
	this._uv_f = true;
	this._coord_buffer = _gl.createBuffer();
	this._uv_buffer = _gl.createBuffer();
	this._coord[0] = -1.0; this._coord[ 1] = -1.0; this._coord[ 2] = 0.0;
	this._coord[3] = 1.0; this._coord[ 4] = -1.0; this._coord[ 5] = 0.0;
	this._coord[6] = -1.0; this._coord[ 7] = 1.0; this._coord[ 8] = 0.0;
	this._coord[9] = 1.0; this._coord[10] = 1.0; this._coord[11] = 0.0;
	this._uv[0] = 0.0; this._uv[1] = 1.0;
	this._uv[2] = 1.0; this._uv[3] = 1.0;
	this._uv[4] = 0.0; this._uv[5] = 0.0;
	this._uv[6] = 1.0; this._uv[7] = 0.0;
}
_GLSprite.prototype = {
	type : function(){
		return this._glp.type();
	},
	depth : function(){
		return this._glp.depth();
	},
	setTransparency : function( trans ){
		this._glp.setTransparency( trans );
	},
	transparency : function(){
		return this._glp.transparency();
	},
	id : function(){
		return this._id;
	},
	setCoord : function( coord ){
		for( var i = 0; i < 12; i++ ){
			this._coord[i] = coord[i];
		}
	},
	setMap : function( map, uv ){
		if( uv == undefined ){
			uv = false;
		}
		this._uv_f = uv;
		if( this._uv_f ){
			for( var i = 0; i < 8; i++ ){
				this._uv[i] = map[i];
			}
		} else {
			for( var i = 0; i < 8; i++ ){
				this._map[i] = map[i];
			}
		}
	},
	textureAlpha : function( glt , tex_index ){
		var alpha = false;
		var depth = this.depth();
		if( tex_index >= 0 ){
			glt.use( tex_index );
			glt.setTransparency( tex_index, this.transparency() );
			alpha = glt.alpha( tex_index );
		}
		return (alpha && !depth);
	},
	draw : function( glt , tex_index, alpha ){
		var alpha2 = this.textureAlpha( glt, tex_index );
		if( this.transparency() != 1.0 ){
			alpha2 = true;
		}
		if( alpha2 != alpha ){
			return;
		}
		_gl.bindBuffer( _gl.ARRAY_BUFFER, this._coord_buffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( this._coord ), _gl.STATIC_DRAW );
		glSpriteBindPositionBuffer( _gl, this._id );
		_gl.bindBuffer( _gl.ARRAY_BUFFER, null );
		if( !this._uv_f ){
			var width = glt.width( tex_index );
			var height = glt.height( tex_index );
			for( var i = 0; i < 4; i++ ){
				this._uv[i * 2 ] = this._map[i * 2 ] / width;
				this._uv[i * 2 + 1] = this._map[i * 2 + 1] / height;
			}
		}
		_gl.bindBuffer( _gl.ARRAY_BUFFER, this._uv_buffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( this._uv ), _gl.STATIC_DRAW );
		glSpriteBindTextureCoordBuffer( _gl, this._id );
		_gl.bindBuffer( _gl.ARRAY_BUFFER, null );
		if( !glSpriteSetTexture( _gl, glt, tex_index, this._id ) ){
			if( tex_index >= 0 ){
				_gl.activeTexture( glSpriteActiveTexture( _gl, this._id ) );
				glt.bindTexture( _gl.TEXTURE_2D, glt.id( tex_index ) );
			}
		}
		if( alpha2 ){
			_gl.disable( _gl.CULL_FACE );
			_gl.enable( _gl.BLEND );
			_gl.depthMask( false );
		}
		_gl.drawArrays( _gl.TRIANGLE_STRIP, 0, 4 );
		if( alpha2 ){
			_gl.enable( _gl.CULL_FACE );
			_gl.disable( _gl.BLEND );
			_gl.depthMask( true );
		}
	}
};
function _GLStereo( x, y, width, height ){
	this._x = x;
	this._y = y;
	this._width = width;
	this._height = height;
	this._proj_mat = null;
	this._view_mat = null;
	this._angle = 0.0;
	this._left = true;
	this._position_x = 0.0;
	this._position_y = 0.0;
	this._position_z = 0.0;
	this._look_x = 0.0;
	this._look_y = 0.0;
	this._look_z = 0.0;
	this._up_x = 0.0;
	this._up_y = 1.0;
	this._up_z = 0.0;
}
_GLStereo.prototype = {
	setProjectionMatrix : function( mat ){
		_glu.set( _glu.utMatrix( mat ) );
		_glu.scale( 2.0, 1.0, 1.0 );
		this._proj_mat = _glu.glMatrix();
		glStereoSetProjectionMatrix( _gl, this._proj_mat );
	},
	projectionMatrix : function(){
		return this._proj_mat;
	},
	setViewMatrix : function( mat, angle ){
		this._view_mat = mat;
		this._angle = angle;
		this._position_x = _glu.positionX();
		this._position_y = _glu.positionY();
		this._position_z = _glu.positionZ();
		this._look_x = _glu.lookX();
		this._look_y = _glu.lookY();
		this._look_z = _glu.lookZ();
		this._up_x = _glu.upX();
		this._up_y = _glu.upY();
		this._up_z = _glu.upZ();
	},
	clear : function( mask ){
		_gl.enable( _gl.SCISSOR_TEST );
		if( this._left ){
			_gl.scissor( this._x, this._y, this._width / 2, this._height );
		} else {
			_gl.scissor( this._x + this._width / 2, this._y, this._width / 2, this._height );
		}
		_gl.clear( mask );
		_gl.disable( _gl.SCISSOR_TEST );
	},
	viewport : function( x, y, width, height ){
		if( x == undefined ){
			x = this._x;
		}
		if( y == undefined ){
			y = this._y;
		}
		if( width == undefined ){
			width = this._width;
		}
		if( height == undefined ){
			height = this._height;
		}
		if( this._left ){
			_glu.viewport( x, y, width / 2, height );
		} else {
			_glu.viewport( x + width / 2, y, width / 2, height );
		}
	},
	_setMatrix : function( angle ){
		var a = _glu.deg2rad( angle );
		var c = Math.cos( a );
		var s = Math.sin( a );
		var dx = this._position_x - this._look_x;
		var dz = this._position_z - this._look_z;
		var x = this._look_x + dx * c - dz * s;
		var y = this._position_y;
		var z = this._look_z + dx * s + dz * c;
		_glu.lookAt( x, y, z, this._look_x, this._look_y, this._look_z, this._up_x, this._up_y, this._up_z );
		glStereoSetViewMatrix( _gl, _glu.glMatrix() );
		_glu.setViewMatrix();
		_glu.setIdentity();
		_glu.multiply( _glu.viewMatrix() );
		_glu.translate( x, y, z );
		_glu.transpose();
		_glu.setLookMatrix();
	},
	draw : function(){
		if( this._view_mat != null ){
			this._setMatrix( -this._angle );
		}
		this._left = true;
		glStereoDraw( _gl, _glu, this._left );
		if( this._view_mat != null ){
			this._setMatrix( this._angle );
		}
		this._left = false;
		glStereoDraw( _gl, _glu, this._left );
	},
	getGraphics : function( originFlag ){
		var width = this._width / 2;
		var g = getGraphics();
		if( originFlag != undefined ){
			if( this._left ){
				g.setOrigin( 0, 0 );
				g.setClip( 0, 0, width, this._height );
			} else {
				if( originFlag ){
					g.setOrigin( width, 0 );
					g.setClip( 0, 0, width, this._height );
				} else {
					g.setOrigin( 0, 0 );
					g.setClip( width, 0, width, this._height );
				}
			}
		} else {
			g.setOrigin( 0, 0 );
			if( this._left ){
				g.setClip( 0, 0, width, this._height );
			} else {
				g.setClip( width, 0, width, this._height );
			}
		}
		return g;
	},
	draw2D : function( g ){
		var width = this._width / 2;
		g.setOrigin( 0, 0 );
		g.setClip( 0, 0, width, this._height );
		glStereoDraw2D( g, width );
		g.setOrigin( width, 0 );
		g.setClip( 0, 0, width, this._height );
		glStereoDraw2D( g, width );
		g.setOrigin( 0, 0 );
	}
};
function _GLTexture( img_array, gen_num ){
	var i;
	this._img_array = img_array;
	this._num = img_array.length;
	this._gen_num = gen_num;
	this._id = new Array( this._gen_num );
	_glu.genTextures( this._gen_num, this._id );
	this._gen = true;
	this._use_id = new Array( this._gen_num );
	for( i = 0; i < this._gen_num; i++ ){
		this._use_id[i] = false;
	}
	this._index2id = new Array( this._num );
	this._width = new Array( this._num );
	this._height = new Array( this._num );
	this._image_data = new Array( this._num );
	this._t_rgba = new Array( this._num );
	this._t_a = new Array( this._num );
	this._t_trans = new Array( this._num );
	this._t_alpha = new Array( this._num );
	this._tx = new Array( this._num );
	this._ty = new Array( this._num );
	this._apply_tx = new Array( this._num );
	this._apply_ty = new Array( this._num );
	for( i = 0; i < this._num; i++ ){
		this._index2id[i] = -1;
		this._image_data[i] = null;
		this._t_rgba[i] = null;
		this._t_a[i] = null;
		this._tx[i] = 0.0;
		this._ty[i] = 0.0;
		this._apply_tx[i] = 0;
		this._apply_ty[i] = 0;
	}
}
_GLTexture.prototype = {
	_SHIFTL : function( a ){
		return a * 0x1000000;
	},
	_SHIFTR : function( a ){
		return _DIV( a, 0x1000000 );
	},
	bindTexture : function( target, texture ){
		_glu.bindTexture( target, texture );
	},
	dispose : function(){
		for( var i = 0; i < this._num; i++ ){
			this.unuse( i );
		}
		if( this._gen ){
			_glu.deleteTextures( this._gen_num, this._id );
			this._gen = false;
		}
	},
	imageDataFromImage : function( image ){
		var canvas = document.createElement( "canvas" );
		var context = canvas.getContext( "2d" );
		canvas.width = image.width;
		canvas.height = image.height;
		context.drawImage( image, 0, 0 );
		return context.getImageData( 0, 0, canvas.width, canvas.height );
	},
	imageDataFromPixels : function( pixels, width, height ){
		var canvas = document.createElement( "canvas" );
		var context = canvas.getContext( "2d" );
		canvas.width = width;
		canvas.height = height;
		var imageData = context.getImageData( 0, 0, canvas.width, canvas.height );
		var data = imageData.data;
		var x, y, yy, x4, y4;
		var tmp;
		for( y = 0; y < height; y++ ){
			yy = y * width;
			y4 = yy * 4;
			for( x = 0; x < width; x++ ){
				x4 = x * 4;
				tmp = pixels[yy + x];
				data[y4 + x4 ] = this._SHIFTR(tmp) & 0xff;
				data[y4 + x4 + 1] = (tmp >> 16) & 0xff;
				data[y4 + x4 + 2] = (tmp >> 8) & 0xff;
				data[y4 + x4 + 3] = tmp & 0xff;
			}
		}
		return imageData;
	},
	getTextureSize : function( size ){
		var tmp = 1;
		while( true ){
			if( tmp >= size ){
				break;
			}
			tmp *= 2;
		}
		return tmp;
	},
	_setTexParameter : function( index ){
		var magFilter = glTextureFilter( _gl, index );
		var minFilter = magFilter;
		if( typeof glTextureMinFilter != 'undefined' ){
			minFilter = glTextureMinFilter( _gl, index );
			if(
				(minFilter == _gl.NEAREST_MIPMAP_NEAREST) ||
				(minFilter == _gl.LINEAR_MIPMAP_NEAREST ) ||
				(minFilter == _gl.NEAREST_MIPMAP_LINEAR ) ||
				(minFilter == _gl.LINEAR_MIPMAP_LINEAR )
			){
				_gl.generateMipmap( _gl.TEXTURE_2D );
			}
		}
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, magFilter );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, minFilter );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, glTextureWrap( _gl, index ) );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, glTextureWrap( _gl, index ) );
		if( typeof glTextureMaxAnisotropy != 'undefined' ){
			var extAnisotropic = _gl.getExtension( "EXT_texture_filter_anisotropic" );
			if( extAnisotropic ){
				var maxAnisotropy = _gl.getParameter( extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT );
				var level = Math.min( glTextureMaxAnisotropy( index ), maxAnisotropy );
				if( level >= 1.0 ){
					_gl.texParameterf( _gl.TEXTURE_2D, extAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, level );
				}
			}
		}
	},
	use : function( index, use_trans ){
		if( this._index2id[index] >= 0 ){
			return;
		}
		if( use_trans == undefined ){
			use_trans = false;
		}
		var i;
		this._index2id[index] = 0;
		for( i = 0; i < this._gen_num; i++ ){
			if( !this._use_id[i] ){
				this._use_id[i] = true;
				this._index2id[index] = i;
				break;
			}
		}
		this._image_data[index] = this.imageDataFromImage( this._img_array[index] );
		this._width [index] = this._image_data[index].width;
		this._height[index] = this._image_data[index].height;
		if( use_trans ){
			var len = this._width[index] * this._height[index];
			this._t_rgba[index] = new Array( len );
			this._t_a[index] = new Array( len );
			var data = this._image_data[index].data;
			for( i = 0; i < len; i++ ){
				this._t_rgba[index][i] = this._SHIFTL(data[i * 4]) + (data[i * 4 + 1] << 16) + (data[i * 4 + 2] << 8) + data[i * 4 + 3];
				this._t_a[index][i] = data[i * 4 + 3];
			}
		}
		this._t_trans[index] = 1.0;
		this._t_alpha[index] = glTextureAlphaFlag( index );
		_glu.bindTexture( this._id[this._index2id[index]] );
		_gl.pixelStorei( _gl.UNPACK_ALIGNMENT, 1 );
		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, glTextureFlipY( index ) );
		_glu.texImage2D( this._image_data[index] );
		this._setTexParameter( index );
	},
	unuse : function( index ){
		if( this._index2id[index] >= 0 ){
			this._use_id[this._index2id[index]] = false;
			this._image_data[index] = null;
			this._t_rgba[index] = null;
			this._t_a[index] = null;
			this._index2id[index] = -1;
		}
	},
	unuseAll : function(){
		for( var i = 0; i < this._num; i++ ){
			this.unuse( i );
		}
		_glu.deleteTextures( this._gen_num, this._id );
		_glu.genTextures( this._gen_num, this._id );
	},
	update : function( index, pixels, length ){
		if( this._index2id[index] >= 0 ){
			var len = this._width[index] * this._height[index];
			if( length == len ){
				this._image_data[index] = this.imageDataFromPixels( pixels, this._width[index], this._height[index] );
				if( (this._t_rgba[index] != null) && (this._t_a[index] != null) ){
					_System.arraycopy( pixels, 0, this._t_rgba[index], 0, len );
					for( var i = 0; i < len; i++ ){
						this._t_a[index][i] = this._t_rgba[index][i] & 0xff;
					}
				}
				this._t_trans[index] = 1.0;
				this._t_alpha[index] = glTextureAlphaFlag( index );
				_gl.pixelStorei( _gl.UNPACK_ALIGNMENT, 1 );
				_glu.bindTexture( this._id[this._index2id[index]] );
				_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, glTextureFlipY( index ) );
				_glu.texImage2D( this._image_data[index] );
				this._setTexParameter( index );
			}
		}
	},
	setTransparency : function( index, trans ){
		if( (this._t_rgba[index] == null) || (this._t_a[index] == null) ){
			return;
		}
		this.use( index );
		if( trans == this._t_trans[index] ){
			return;
		}
		this._t_trans[index] = trans;
		var len = this._width[index] * this._height[index];
		var r, g, b, a;
		for( var i = 0; i < len; i++ ){
			r = this._SHIFTR(this._t_rgba[index][i]) & 0xff;
			g = (this._t_rgba[index][i] >> 16) & 0xff;
			b = (this._t_rgba[index][i] >> 8) & 0xff;
			a = _INT( this._t_a[index][i] * this._t_trans[index] );
			this._t_rgba[index][i] = this._SHIFTL(r) + (g << 16) + (b << 8) + a;
		}
		this._image_data[index] = this.imageDataFromPixels( this._t_rgba[index], this._width[index], this._height[index] );
		this._t_alpha[index] = (this._t_trans[index] == 1.0) ? glTextureAlphaFlag( index ) : true;
		_gl.pixelStorei( _gl.UNPACK_ALIGNMENT, 1 );
		_glu.bindTexture( this._id[this._index2id[index]] );
		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, glTextureFlipY( index ) );
		_glu.texImage2D( this._image_data[index] );
		this._setTexParameter( index );
	},
	translate : function( index, x, y ){
		this.use( index );
		var width = this._width [index];
		var height = this._height[index];
		this._tx[index] = x * width;
		this._ty[index] = y * height;
		var dx = this._apply_tx[index] - _INT( this._tx[index] );
		var dy = this._apply_ty[index] - _INT( this._ty[index] );
		var repeat = (glTextureWrap( _gl, index ) == _gl.REPEAT);
		var i, j, k;
		if( dx != 0 ){
			this._apply_tx[index] = _INT( this._tx[index] );
			if( (this._t_rgba[index] != null) && (this._t_a[index] != null) ){
				var tmp = new Array( 2 );
				tmp[0] = new Array( width );
				tmp[1] = new Array( width );
				var data = new Array( 2 );
				data[0] = this._t_rgba[index];
				data[1] = this._t_a[index];
				var pos;
				for( i = 0; i < height; i++ ){
					pos = i * width;
					for( j = 0; j < width; j++ ){
						k = j - dx;
						if( !repeat ){
							if( (k < 0) || (k >= width) ){
								tmp[0][j] = 0;
								tmp[1][j] = 0;
							} else {
								tmp[0][j] = data[0][pos + k];
								tmp[1][j] = data[1][pos + k];
							}
						} else {
							while( k < 0 ){
								k += width;
							}
							while( k >= width ){
								k -= width;
							}
							tmp[0][j] = data[0][pos + k];
							tmp[1][j] = data[1][pos + k];
						}
					}
					_System.arraycopy( tmp[0], 0, data[0], pos, width );
					_System.arraycopy( tmp[1], 0, data[1], pos, width );
				}
			} else {
				var tmp = new Array( width * 4 );
				var data = this._image_data[index].data;
				var pos;
				for( i = 0; i < height; i++ ){
					pos = i * width;
					for( j = 0; j < width; j++ ){
						k = j - dx;
						if( !repeat ){
							if( (k < 0) || (k >= width) ){
								tmp[j * 4 ] = 0;
								tmp[j * 4 + 1] = 0;
								tmp[j * 4 + 2] = 0;
								tmp[j * 4 + 3] = 0;
							} else {
								tmp[j * 4 ] = data[(pos + k) * 4 ];
								tmp[j * 4 + 1] = data[(pos + k) * 4 + 1];
								tmp[j * 4 + 2] = data[(pos + k) * 4 + 2];
								tmp[j * 4 + 3] = data[(pos + k) * 4 + 3];
							}
						} else {
							while( k < 0 ){
								k += width;
							}
							while( k >= width ){
								k -= width;
							}
							tmp[j * 4 ] = data[(pos + k) * 4 ];
							tmp[j * 4 + 1] = data[(pos + k) * 4 + 1];
							tmp[j * 4 + 2] = data[(pos + k) * 4 + 2];
							tmp[j * 4 + 3] = data[(pos + k) * 4 + 3];
						}
					}
					_System.arraycopy( tmp, 0, data, pos * 4, width * 4 );
				}
			}
		}
		if( dy != 0 ){
			this._apply_ty[index] = _INT( this._ty[index] );
			if( (this._t_rgba[index] != null) && (this._t_a[index] != null) ){
				var tmp = new Array( 2 );
				tmp[0] = new Array( height );
				tmp[1] = new Array( height );
				for( i = 0; i < height; i++ ){
					tmp[0][i] = new Array( width );
					tmp[1][i] = new Array( width );
				}
				var data = new Array( 2 );
				data[0] = this._t_rgba[index];
				data[1] = this._t_a[index];
				for( i = 0; i < height; i++ ){
					k = i - dy;
					if( !repeat ){
						if( (k < 0) || (k >= width) ){
							for( j = 0; j < width; j++ ){
								tmp[0][i][j] = 0;
								tmp[1][i][j] = 0;
							}
						} else {
							_System.arraycopy( data[0], k * width, tmp[0][i], 0, width );
							_System.arraycopy( data[1], k * width, tmp[1][i], 0, width );
						}
					} else {
						while( k < 0 ){
							k += height;
						}
						while( k >= height ){
							k -= height;
						}
						_System.arraycopy( data[0], k * width, tmp[0][i], 0, width );
						_System.arraycopy( data[1], k * width, tmp[1][i], 0, width );
					}
				}
				for( i = 0; i < height; i++ ){
					_System.arraycopy( tmp[0][i], 0, data[0], i * width, width );
					_System.arraycopy( tmp[1][i], 0, data[1], i * width, width );
				}
			} else {
				var tmp = new Array( height );
				for( i = 0; i < height; i++ ){
					tmp[i] = new Array( width * 4 );
				}
				var data = this._image_data[index].data;
				for( i = 0; i < height; i++ ){
					k = i - dy;
					if( !repeat ){
						if( (k < 0) || (k >= width) ){
							for( j = 0; j < width; j++ ){
								tmp[i][j * 4 ] = 0;
								tmp[i][j * 4 + 1] = 0;
								tmp[i][j * 4 + 2] = 0;
								tmp[i][j * 4 + 3] = 0;
							}
						} else {
							_System.arraycopy( data, k * width * 4, tmp[i], 0, width * 4 );
						}
					} else {
						while( k < 0 ){
							k += height;
						}
						while( k >= height ){
							k -= height;
						}
						_System.arraycopy( data, k * width * 4, tmp[i], 0, width * 4 );
					}
				}
				for( i = 0; i < height; i++ ){
					_System.arraycopy( tmp[i], 0, data, i * width * 4, width * 4 );
				}
			}
		}
		if( (dx != 0) || (dy != 0) ){
			if( this._t_rgba[index] != null ){
				this._image_data[index] = this.imageDataFromPixels( this._t_rgba[index], width, height );
			}
			_gl.pixelStorei( _gl.UNPACK_ALIGNMENT, 1 );
			_glu.bindTexture( this._id[this._index2id[index]] );
			_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, glTextureFlipY( index ) );
			_glu.texImage2D( this._image_data[index] );
			this._setTexParameter( index );
		}
	},
	id : function( index ){
		return this._id[this._index2id[index]];
	},
	width : function( index ){
		return this._width[index];
	},
	height : function( index ){
		return this._height[index];
	},
	alpha : function( index ){
		return this._t_alpha[index];
	},
	depth : function( index ){
		return glTextureDepthFlag( index );
	}
};
function _GLTriangle( model , index ){
	var i, j;
	this._num = 0;
	_glu.beginGetTriangle();
	while( _glu.getTriangle( model, index, false ) ){
		this._num++;
	}
	this._coord_x = null;
	this._coord_y = null;
	this._coord_z = null;
	this._normal_x = null;
	this._normal_y = null;
	this._normal_z = null;
	this._center_x = null;
	this._center_y = null;
	this._center_z = null;
	if( this._num > 0 ){
		this._coord_x = new Array( this._num );
		this._coord_y = new Array( this._num );
		this._coord_z = new Array( this._num );
		for( i = 0; i < this._num; i++ ){
			this._coord_x[i] = new Array( 3 );
			this._coord_y[i] = new Array( 3 );
			this._coord_z[i] = new Array( 3 );
		}
		this._normal_x = new Array( this._num );
		this._normal_y = new Array( this._num );
		this._normal_z = new Array( this._num );
		this._center_x = new Array( this._num );
		this._center_y = new Array( this._num );
		this._center_z = new Array( this._num );
		j = 0;
		_glu.beginGetTriangle();
		while( _glu.getTriangle( model, index, false ) ){
			for( i = 0; i < 3; i++ ){
				this._coord_x[j][i] = _glu.coordX( i );
				this._coord_y[j][i] = _glu.coordY( i );
				this._coord_z[j][i] = _glu.coordZ( i );
			}
			_glu.getTriangleNormal( model, index, false );
			this._normal_x[j] = _glu.normalX();
			this._normal_y[j] = _glu.normalY();
			this._normal_z[j] = _glu.normalZ();
			this._center_x[j] = _glu.centerX();
			this._center_y[j] = _glu.centerY();
			this._center_z[j] = _glu.centerZ();
			j++;
		}
	}
}
_GLTriangle.prototype = {
	num : function(){
		return this._num;
	},
	coord_x : function( i ){
		return this._coord_x[i];
	},
	coord_y : function( i ){
		return this._coord_y[i];
	},
	coord_z : function( i ){
		return this._coord_z[i];
	},
	normal_x : function( i ){
		return this._normal_x[i];
	},
	normal_y : function( i ){
		return this._normal_y[i];
	},
	normal_z : function( i ){
		return this._normal_z[i];
	},
	center_x : function( i ){
		return this._center_x[i];
	},
	center_y : function( i ){
		return this._center_y[i];
	},
	center_z : function( i ){
		return this._center_z[i];
	},
	check : function( i, x_min, x_max, y_min, y_max, z_min, z_max ){
		if(
			(this._center_x[i] >= x_min) && (this._center_x[i] <= x_max) &&
			(this._center_y[i] >= y_min) && (this._center_y[i] <= y_max) &&
			(this._center_z[i] >= z_min) && (this._center_z[i] <= z_max)
		){
			return true;
		}
		return false;
	},
	hitCheck : function( px, py, pz, qx, qy, qz, r ){
		var i;
		for( i = 0; i < this._num; i++ ){
			if(
				(this._center_x[i] >= px - r) && (this._center_x[i] <= px + r) &&
				(this._center_y[i] >= py - r) && (this._center_y[i] <= py + r) &&
				(this._center_z[i] >= pz - r) && (this._center_z[i] <= pz + r)
			){
				if( _glu.hitCheck( px, py, pz, qx, qy, qz, this._coord_x[i], this._coord_y[i], this._coord_z[i] ) ){
					return i;
				}
			}
		}
		return -1;
	}
};
function _GLUtilitySave(){
	this.util_mat = new Array( 16 );
	this.look_mat = new Array( 16 );
	this.view_mat = new Array( 16 );
}
_GLUtilitySave.prototype = {
	push : function( glu ){
		for( var i = 0; i < 16; i++ ){
			this.util_mat[i] = glu.util_mat[i];
			this.look_mat[i] = glu.look_mat[i];
			this.view_mat[i] = glu.view_mat[i];
		}
	},
	pop : function( glu ){
		for( var i = 0; i < 16; i++ ){
			glu.util_mat[i] = this.util_mat[i];
			glu.look_mat[i] = this.look_mat[i];
			glu.view_mat[i] = this.view_mat[i];
		}
	},
};
function _GLUtility(){
	this.save = new Array();
	this.save_num = 0;
	this.util_mat = new Array( 16 );
	this.tmp_mat = new Array( 16 );
	this._rotate = new Array( 16 );
	this._rotate[ 3] = 0.0;
	this._rotate[ 7] = 0.0;
	this._rotate[11] = 0.0;
	this._rotate[12] = 0.0;
	this._rotate[13] = 0.0;
	this._rotate[14] = 0.0;
	this._rotate[15] = 1.0;
	this._scale = new Array( 16 );
	this._scale[ 0] = 1.0; this._scale[ 1] = 0.0; this._scale[ 2] = 0.0; this._scale[ 3] = 0.0;
	this._scale[ 4] = 0.0; this._scale[ 5] = 1.0; this._scale[ 6] = 0.0; this._scale[ 7] = 0.0;
	this._scale[ 8] = 0.0; this._scale[ 9] = 0.0; this._scale[10] = 1.0; this._scale[11] = 0.0;
	this._scale[12] = 0.0; this._scale[13] = 0.0; this._scale[14] = 0.0; this._scale[15] = 1.0;
	this._translate = new Array( 16 );
	this._translate[ 0] = 1.0; this._translate[ 1] = 0.0; this._translate[ 2] = 0.0; this._translate[ 3] = 0.0;
	this._translate[ 4] = 0.0; this._translate[ 5] = 1.0; this._translate[ 6] = 0.0; this._translate[ 7] = 0.0;
	this._translate[ 8] = 0.0; this._translate[ 9] = 0.0; this._translate[10] = 1.0; this._translate[11] = 0.0;
	this._translate[12] = 0.0; this._translate[13] = 0.0; this._translate[14] = 0.0; this._translate[15] = 1.0;
	this.trans_x = 0.0;
	this.trans_y = 0.0;
	this.trans_z = 0.0;
	this.cross_x = 0.0;
	this.cross_y = 0.0;
	this.cross_z = 0.0;
	this.normalize_x = 0.0;
	this.normalize_y = 0.0;
	this.normalize_z = 0.0;
	this.reflect_x = 0.0;
	this.reflect_y = 0.0;
	this.reflect_z = 0.0;
	this.seek_len = 0;
	this.seek_vertex = new Array( 3 );
	this.coord_x = new Array( 3 );
	this.coord_y = new Array( 3 );
	this.coord_z = new Array( 3 );
	this.normal_x = 0.0;
	this.normal_y = 0.0;
	this.normal_z = 0.0;
	this.center_x = 0.0;
	this.center_y = 0.0;
	this.center_z = 0.0;
	this.hit_x = 0.0;
	this.hit_y = 0.0;
	this.hit_z = 0.0;
	this.position_x = 0.0;
	this.position_y = 0.0;
	this.position_z = 0.0;
	this.look_x = 0.0;
	this.look_y = 0.0;
	this.look_z = 0.0;
	this.up_x = 0.0;
	this.up_y = 1.0;
	this.up_z = 0.0;
	this.look_side = new Array( 3 );
	this.look_mat = new Array( 16 );
	this.view_mat = new Array( 16 );
	this.proj_mat = new Array( 16 );
	this.viewport_mat = new Array( 4 );
	this.project_in = new Array( 4 );
	this.project_out = new Array( 4 );
	this.project_x = 0.0;
	this.project_y = 0.0;
	this.project_z = 0.0;
}
_GLUtility.prototype = {
	genTextures : function( n, textures ){
		for( var i = 0; i < n; i++ ){
			textures[i] = _gl.createTexture();
		}
	},
	deleteTextures : function( n, textures ){
		for( var i = 0; i < n; i++ ){
			_gl.deleteTexture( textures[i] );
		}
	},
	bindTexture : function( target, texture ){
		if( texture == undefined ){
			texture = target;
			target = _gl.TEXTURE_2D;
		}
		_gl.bindTexture( target, texture );
	},
	texImage2D : function( target, image ){
		if( image == undefined ){
			image = target;
			target = _gl.TEXTURE_2D;
		}
		var level = 0;
		var internalformat = _gl.RGBA;
		var format = _gl.RGBA;
		var type = _gl.UNSIGNED_BYTE;
		_gl.texImage2D( target, level, internalformat, format, type, image );
	},
	deg2rad : function( angle ){
		return (angle * 3.14159265358979323846264) / 180.0;
	},
	rad2deg : function( angle ){
		return (angle * 180.0) / 3.14159265358979323846264;
	},
	glMatrix : function(){
		var _matrix = new Float32Array( 16 );
		var i, j, k;
		for( j = 0; j < 4; j++ ){
			k = j * 4;
			for( i = 0; i < 4; i++ ){
				_matrix[k + i] = this.util_mat[i * 4 + j];
			}
		}
		return _matrix;
	},
	utMatrix : function( matrix ){
		var _matrix = new Array( 16 );
		var i, j, k;
		for( j = 0; j < 4; j++ ){
			k = j * 4;
			for( i = 0; i < 4; i++ ){
				_matrix[k + i] = matrix[i * 4 + j];
			}
		}
		return _matrix;
	},
	push : function(){
		if( this.save[this.save_num] == undefined ){
			this.save[this.save_num] = new _GLUtilitySave();
		}
		this.save[this.save_num].push( this );
		this.save_num++;
	},
	pop : function(){
		if( this.save_num > 0 ){
			this.save_num--;
			this.save[this.save_num].pop( this );
		}
	},
	invert : function(){
		var det;
		this.tmp_mat[ 0] = this.util_mat[5] * this.util_mat[10] * this.util_mat[15] - this.util_mat[5] * this.util_mat[11] * this.util_mat[14] - this.util_mat[9] * this.util_mat[6] * this.util_mat[15] + this.util_mat[9] * this.util_mat[7] * this.util_mat[14] + this.util_mat[13] * this.util_mat[6] * this.util_mat[11] - this.util_mat[13] * this.util_mat[7] * this.util_mat[10];
		this.tmp_mat[ 4] = -this.util_mat[4] * this.util_mat[10] * this.util_mat[15] + this.util_mat[4] * this.util_mat[11] * this.util_mat[14] + this.util_mat[8] * this.util_mat[6] * this.util_mat[15] - this.util_mat[8] * this.util_mat[7] * this.util_mat[14] - this.util_mat[12] * this.util_mat[6] * this.util_mat[11] + this.util_mat[12] * this.util_mat[7] * this.util_mat[10];
		this.tmp_mat[ 8] = this.util_mat[4] * this.util_mat[ 9] * this.util_mat[15] - this.util_mat[4] * this.util_mat[11] * this.util_mat[13] - this.util_mat[8] * this.util_mat[5] * this.util_mat[15] + this.util_mat[8] * this.util_mat[7] * this.util_mat[13] + this.util_mat[12] * this.util_mat[5] * this.util_mat[11] - this.util_mat[12] * this.util_mat[7] * this.util_mat[ 9];
		this.tmp_mat[12] = -this.util_mat[4] * this.util_mat[ 9] * this.util_mat[14] + this.util_mat[4] * this.util_mat[10] * this.util_mat[13] + this.util_mat[8] * this.util_mat[5] * this.util_mat[14] - this.util_mat[8] * this.util_mat[6] * this.util_mat[13] - this.util_mat[12] * this.util_mat[5] * this.util_mat[10] + this.util_mat[12] * this.util_mat[6] * this.util_mat[ 9];
		this.tmp_mat[ 1] = -this.util_mat[1] * this.util_mat[10] * this.util_mat[15] + this.util_mat[1] * this.util_mat[11] * this.util_mat[14] + this.util_mat[9] * this.util_mat[2] * this.util_mat[15] - this.util_mat[9] * this.util_mat[3] * this.util_mat[14] - this.util_mat[13] * this.util_mat[2] * this.util_mat[11] + this.util_mat[13] * this.util_mat[3] * this.util_mat[10];
		this.tmp_mat[ 5] = this.util_mat[0] * this.util_mat[10] * this.util_mat[15] - this.util_mat[0] * this.util_mat[11] * this.util_mat[14] - this.util_mat[8] * this.util_mat[2] * this.util_mat[15] + this.util_mat[8] * this.util_mat[3] * this.util_mat[14] + this.util_mat[12] * this.util_mat[2] * this.util_mat[11] - this.util_mat[12] * this.util_mat[3] * this.util_mat[10];
		this.tmp_mat[ 9] = -this.util_mat[0] * this.util_mat[ 9] * this.util_mat[15] + this.util_mat[0] * this.util_mat[11] * this.util_mat[13] + this.util_mat[8] * this.util_mat[1] * this.util_mat[15] - this.util_mat[8] * this.util_mat[3] * this.util_mat[13] - this.util_mat[12] * this.util_mat[1] * this.util_mat[11] + this.util_mat[12] * this.util_mat[3] * this.util_mat[ 9];
		this.tmp_mat[13] = this.util_mat[0] * this.util_mat[ 9] * this.util_mat[14] - this.util_mat[0] * this.util_mat[10] * this.util_mat[13] - this.util_mat[8] * this.util_mat[1] * this.util_mat[14] + this.util_mat[8] * this.util_mat[2] * this.util_mat[13] + this.util_mat[12] * this.util_mat[1] * this.util_mat[10] - this.util_mat[12] * this.util_mat[2] * this.util_mat[ 9];
		this.tmp_mat[ 2] = this.util_mat[1] * this.util_mat[ 6] * this.util_mat[15] - this.util_mat[1] * this.util_mat[ 7] * this.util_mat[14] - this.util_mat[5] * this.util_mat[2] * this.util_mat[15] + this.util_mat[5] * this.util_mat[3] * this.util_mat[14] + this.util_mat[13] * this.util_mat[2] * this.util_mat[ 7] - this.util_mat[13] * this.util_mat[3] * this.util_mat[ 6];
		this.tmp_mat[ 6] = -this.util_mat[0] * this.util_mat[ 6] * this.util_mat[15] + this.util_mat[0] * this.util_mat[ 7] * this.util_mat[14] + this.util_mat[4] * this.util_mat[2] * this.util_mat[15] - this.util_mat[4] * this.util_mat[3] * this.util_mat[14] - this.util_mat[12] * this.util_mat[2] * this.util_mat[ 7] + this.util_mat[12] * this.util_mat[3] * this.util_mat[ 6];
		this.tmp_mat[10] = this.util_mat[0] * this.util_mat[ 5] * this.util_mat[15] - this.util_mat[0] * this.util_mat[ 7] * this.util_mat[13] - this.util_mat[4] * this.util_mat[1] * this.util_mat[15] + this.util_mat[4] * this.util_mat[3] * this.util_mat[13] + this.util_mat[12] * this.util_mat[1] * this.util_mat[ 7] - this.util_mat[12] * this.util_mat[3] * this.util_mat[ 5];
		this.tmp_mat[14] = -this.util_mat[0] * this.util_mat[ 5] * this.util_mat[14] + this.util_mat[0] * this.util_mat[ 6] * this.util_mat[13] + this.util_mat[4] * this.util_mat[1] * this.util_mat[14] - this.util_mat[4] * this.util_mat[2] * this.util_mat[13] - this.util_mat[12] * this.util_mat[1] * this.util_mat[ 6] + this.util_mat[12] * this.util_mat[2] * this.util_mat[ 5];
		this.tmp_mat[ 3] = -this.util_mat[1] * this.util_mat[ 6] * this.util_mat[11] + this.util_mat[1] * this.util_mat[ 7] * this.util_mat[10] + this.util_mat[5] * this.util_mat[2] * this.util_mat[11] - this.util_mat[5] * this.util_mat[3] * this.util_mat[10] - this.util_mat[ 9] * this.util_mat[2] * this.util_mat[ 7] + this.util_mat[ 9] * this.util_mat[3] * this.util_mat[ 6];
		this.tmp_mat[ 7] = this.util_mat[0] * this.util_mat[ 6] * this.util_mat[11] - this.util_mat[0] * this.util_mat[ 7] * this.util_mat[10] - this.util_mat[4] * this.util_mat[2] * this.util_mat[11] + this.util_mat[4] * this.util_mat[3] * this.util_mat[10] + this.util_mat[ 8] * this.util_mat[2] * this.util_mat[ 7] - this.util_mat[ 8] * this.util_mat[3] * this.util_mat[ 6];
		this.tmp_mat[11] = -this.util_mat[0] * this.util_mat[ 5] * this.util_mat[11] + this.util_mat[0] * this.util_mat[ 7] * this.util_mat[ 9] + this.util_mat[4] * this.util_mat[1] * this.util_mat[11] - this.util_mat[4] * this.util_mat[3] * this.util_mat[ 9] - this.util_mat[ 8] * this.util_mat[1] * this.util_mat[ 7] + this.util_mat[ 8] * this.util_mat[3] * this.util_mat[ 5];
		this.tmp_mat[15] = this.util_mat[0] * this.util_mat[ 5] * this.util_mat[10] - this.util_mat[0] * this.util_mat[ 6] * this.util_mat[ 9] - this.util_mat[4] * this.util_mat[1] * this.util_mat[10] + this.util_mat[4] * this.util_mat[2] * this.util_mat[ 9] + this.util_mat[ 8] * this.util_mat[1] * this.util_mat[ 6] - this.util_mat[ 8] * this.util_mat[2] * this.util_mat[ 5];
		det = this.util_mat[0] * this.tmp_mat[0] + this.util_mat[1] * this.tmp_mat[4] + this.util_mat[2] * this.tmp_mat[8] + this.util_mat[3] * this.tmp_mat[12];
		if( det == 0.0 ){
			return false;
		}
		det = 1.0 / det;
		for( var i = 0; i < 16; i++ ){
			this.util_mat[i] = this.tmp_mat[i] * det;
		}
		return true;
	},
	multiply : function( matrix ){
		var i, j, k;
		for( j = 0; j < 4; j++ ){
			k = j * 4;
			for( i = 0; i < 4; i++ ){
				this.tmp_mat[k + i] =
					this.util_mat[k ] * matrix[ i] +
					this.util_mat[k + 1] * matrix[ 4 + i] +
					this.util_mat[k + 2] * matrix[ 8 + i] +
					this.util_mat[k + 3] * matrix[12 + i];
			}
		}
		this.set( this.tmp_mat );
	},
	rotate : function( angle, x, y, z ){
		var d = Math.sqrt( x * x + y * y + z * z );
		if( d != 0.0 ){
			x /= d;
			y /= d;
			z /= d;
		}
		var a = this.deg2rad( angle );
		var c = Math.cos( a );
		var s = Math.sin( a );
		var c2 = 1.0 - c;
		this._rotate[ 0] = x * x * c2 + c;
		this._rotate[ 1] = x * y * c2 - z * s;
		this._rotate[ 2] = x * z * c2 + y * s;
		this._rotate[ 4] = y * x * c2 + z * s;
		this._rotate[ 5] = y * y * c2 + c;
		this._rotate[ 6] = y * z * c2 - x * s;
		this._rotate[ 8] = x * z * c2 - y * s;
		this._rotate[ 9] = y * z * c2 + x * s;
		this._rotate[10] = z * z * c2 + c;
		this.multiply( this._rotate );
	},
	scale : function( x, y, z ){
		this._scale[ 0] = x;
		this._scale[ 5] = y;
		this._scale[10] = z;
		this.multiply( this._scale );
	},
	get : function(){
		var _matrix = new Array( 16 );
		for( var i = 0; i < 16; i++ ){
			_matrix[i] = this.util_mat[i];
		}
		return _matrix;
	},
	set : function( matrix ){
		for( var i = 0; i < 16; i++ ){
			this.util_mat[i] = matrix[i];
		}
	},
	setVal : function( index, value ){
		this.util_mat[index] = value;
	},
	setIdentity : function(){
		this.util_mat[ 0] = 1.0; this.util_mat[ 1] = 0.0; this.util_mat[ 2] = 0.0; this.util_mat[ 3] = 0.0;
		this.util_mat[ 4] = 0.0; this.util_mat[ 5] = 1.0; this.util_mat[ 6] = 0.0; this.util_mat[ 7] = 0.0;
		this.util_mat[ 8] = 0.0; this.util_mat[ 9] = 0.0; this.util_mat[10] = 1.0; this.util_mat[11] = 0.0;
		this.util_mat[12] = 0.0; this.util_mat[13] = 0.0; this.util_mat[14] = 0.0; this.util_mat[15] = 1.0;
	},
	translate : function( x, y, z ){
		this._translate[ 3] = x;
		this._translate[ 7] = y;
		this._translate[11] = z;
		this.multiply( this._translate );
	},
	transpose : function(){
		var i, j, k;
		for( j = 0; j < 4; j++ ){
			k = j * 4;
			for( i = 0; i < 4; i++ ){
				this.tmp_mat[k + i] = this.util_mat[i * 4 + j];
			}
		}
		this.set( this.tmp_mat );
	},
	transVector : function( x, y, z ){
		this.trans_x = this.util_mat[0] * x + this.util_mat[1] * y + this.util_mat[ 2] * z + this.util_mat[ 3] * 1.0;
		this.trans_y = this.util_mat[4] * x + this.util_mat[5] * y + this.util_mat[ 6] * z + this.util_mat[ 7] * 1.0;
		this.trans_z = this.util_mat[8] * x + this.util_mat[9] * y + this.util_mat[10] * z + this.util_mat[11] * 1.0;
	},
	cross : function( x1, y1, z1, x2, y2, z2 ){
		this.cross_x = y1 * z2 - z1 * y2;
		this.cross_y = z1 * x2 - x1 * z2;
		this.cross_z = x1 * y2 - y1 * x2;
	},
	dot : function( x1, y1, z1, x2, y2, z2 ){
		return x1 * x2 + y1 * y2 + z1 * z2;
	},
	distance : function( x, y, z ){
		return Math.sqrt( x * x + y * y + z * z );
	},
	normalize : function( x, y, z ){
		var d = Math.sqrt( x * x + y * y + z * z );
		if( d != 0.0 ){
			this.normalize_x = x / d;
			this.normalize_y = y / d;
			this.normalize_z = z / d;
		} else {
			this.normalize_x = 0.0;
			this.normalize_y = 0.0;
			this.normalize_z = 0.0;
		}
	},
	reflect : function( vx, vy, vz, nx, ny, nz ){
		var s = this.dot( -vx, -vy, -vz, nx, ny, nz );
		var px = nx * s;
		var py = ny * s;
		var pz = nz * s;
		this.reflect_x = vx + px + px;
		this.reflect_y = vy + py + py;
		this.reflect_z = vz + pz + pz;
	},
	beginGetTriangle : function(){
		this.seek_len = 2;
	},
	getTriangle : function( model , index, trans ){
		var ret = false;
		while( this.seek_len < model._strip_len[index] ){
			for( var i = 0; i < 3; i++ ){
				this.seek_vertex[i] = model._strip[index][this.seek_len - i];
			}
			this.seek_len++;
			if( (this.seek_vertex[0] != this.seek_vertex[1]) && (this.seek_vertex[0] != this.seek_vertex[2]) && (this.seek_vertex[1] != this.seek_vertex[2]) ){
				ret = true;
				break;
			}
		}
		if( ret ){
			this.getTriangleCoord( model, index, trans );
			this.center_x = (this.coord_x[0] + this.coord_x[1] + this.coord_x[2]) / 3.0;
			this.center_y = (this.coord_y[0] + this.coord_y[1] + this.coord_y[2]) / 3.0;
			this.center_z = (this.coord_z[0] + this.coord_z[1] + this.coord_z[2]) / 3.0;
		}
		return ret;
	},
	getTriangleCoord : function( model , index, trans ){
		var i;
		for( i = 0; i < 3; i++ ){
			this.coord_x[i] = model._coord[model._strip_coord[index]][this.seek_vertex[i] * 3 ];
			this.coord_y[i] = model._coord[model._strip_coord[index]][this.seek_vertex[i] * 3 + 1];
			this.coord_z[i] = model._coord[model._strip_coord[index]][this.seek_vertex[i] * 3 + 2];
		}
		if( trans ){
			for( i = 0; i < 3; i++ ){
				this.transVector( this.coord_x[i], this.coord_y[i], this.coord_z[i] );
				this.coord_x[i] = this.trans_x;
				this.coord_y[i] = this.trans_y;
				this.coord_z[i] = this.trans_z;
			}
		}
	},
	getTriangleNormal : function( model , index, trans ){
		if( model._strip_normal[index] >= 0 ){
			var x = 0.0;
			var y = 0.0;
			var z = 0.0;
			for( var i = 0; i < 3; i++ ){
				x += model._normal[model._strip_normal[index]][this.seek_vertex[i] * 3 ];
				y += model._normal[model._strip_normal[index]][this.seek_vertex[i] * 3 + 1];
				z += model._normal[model._strip_normal[index]][this.seek_vertex[i] * 3 + 2];
			}
			if( trans ){
				this.transVector( x, y, z );
				x = this.trans_x;
				y = this.trans_y;
				z = this.trans_z;
			}
			this.cross(
				this.coord_x[1] - this.coord_x[0],
				this.coord_y[1] - this.coord_y[0],
				this.coord_z[1] - this.coord_z[0],
				this.coord_x[2] - this.coord_x[0],
				this.coord_y[2] - this.coord_y[0],
				this.coord_z[2] - this.coord_z[0]
				);
			this.cross_x = Math.abs( this.cross_x );
			this.cross_y = Math.abs( this.cross_y );
			this.cross_z = Math.abs( this.cross_z );
			if( (this.cross_x < 1.0) || (this.cross_y < 1.0) || (this.cross_z < 1.0) ){
				x = (x < 0.0) ? -this.cross_x : this.cross_x;
				y = (y < 0.0) ? -this.cross_y : this.cross_y;
				z = (z < 0.0) ? -this.cross_z : this.cross_z;
			}
			this.normalize( x, y, z );
			this.normal_x = this.normalize_x;
			this.normal_y = this.normalize_y;
			this.normal_z = this.normalize_z;
		}
	},
	checkTriangle : function( x_min, x_max, y_min, y_max, z_min, z_max ){
		if(
			(this.center_x >= x_min) && (this.center_x <= x_max) &&
			(this.center_y >= y_min) && (this.center_y <= y_max) &&
			(this.center_z >= z_min) && (this.center_z <= z_max)
		){
			return true;
		}
		return false;
	},
	hitCheck : function( px, py, pz, qx, qy, qz, cx, cy, cz ){
		this.cross(
			cx[1] - cx[0],
			cy[1] - cy[0],
			cz[1] - cz[0],
			cx[2] - cx[0],
			cy[2] - cy[0],
			cz[2] - cz[0]
			);
		var nx = this.cross_x;
		var ny = this.cross_y;
		var nz = this.cross_z;
		var ux = qx - px;
		var uy = qy - py;
		var uz = qz - pz;
		var top = nx * (cx[0] - px) + ny * (cy[0] - py) + nz * (cz[0] - pz);
		var bottom = this.dot( nx, ny, nz, ux, uy, uz );
		if( bottom == 0.0 ){
			return false;
		}
		var t = top / bottom;
		if( (t < 0.0) || (t > 1.0) ){
			return false;
		}
		this.hit_x = px + t * ux;
		this.hit_y = py + t * uy;
		this.hit_z = pz + t * uz;
		for( var i = 0; i < 3; i++ ){
			this.cross(
				cx[(i == 2) ? 0 : i + 1] - cx[i],
				cy[(i == 2) ? 0 : i + 1] - cy[i],
				cz[(i == 2) ? 0 : i + 1] - cz[i],
				this.hit_x - cx[i],
				this.hit_y - cy[i],
				this.hit_z - cz[i]
				);
			if( ((this.cross_x * nx) < -1.0) || ((this.cross_y * ny) < -1.0) || ((this.cross_z * nz) < -1.0) ){
				return false;
			}
		}
		return true;
	},
	lookAt : function( position_x, position_y, position_z, look_x, look_y, look_z, up_x, up_y, up_z ){
		var d;
		this.position_x = position_x;
		this.position_y = position_y;
		this.position_z = position_z;
		this.look_x = look_x;
		this.look_y = look_y;
		this.look_z = look_z;
		this.up_x = up_x;
		this.up_y = up_y;
		this.up_z = up_z;
		look_x -= this.position_x;
		look_y -= this.position_y;
		look_z -= this.position_z;
		d = Math.sqrt( look_x * look_x + look_y * look_y + look_z * look_z );
		if( d != 0.0 ){
			look_x /= d;
			look_y /= d;
			look_z /= d;
		}
		this.look_side[0] = look_y * up_z - look_z * up_y;
		this.look_side[1] = look_z * up_x - look_x * up_z;
		this.look_side[2] = look_x * up_y - look_y * up_x;
		d = Math.sqrt( this.look_side[0] * this.look_side[0] + this.look_side[1] * this.look_side[1] + this.look_side[2] * this.look_side[2] );
		if( d != 0.0 ){
			this.look_side[0] /= d;
			this.look_side[1] /= d;
			this.look_side[2] /= d;
		}
		up_x = this.look_side[1] * look_z - this.look_side[2] * look_y;
		up_y = this.look_side[2] * look_x - this.look_side[0] * look_z;
		up_z = this.look_side[0] * look_y - this.look_side[1] * look_x;
		this.look_mat[ 0] = this.look_side[0]; this.look_mat[ 1] = up_x; this.look_mat[ 2] = -look_x; this.look_mat[ 3] = 0.0;
		this.look_mat[ 4] = this.look_side[1]; this.look_mat[ 5] = up_y; this.look_mat[ 6] = -look_y; this.look_mat[ 7] = 0.0;
		this.look_mat[ 8] = this.look_side[2]; this.look_mat[ 9] = up_z; this.look_mat[10] = -look_z; this.look_mat[11] = 0.0;
		this.look_mat[12] = 0.0 ; this.look_mat[13] = 0.0 ; this.look_mat[14] = 0.0 ; this.look_mat[15] = 1.0;
		var i, j, k;
		for( j = 0; j < 4; j++ ){
			k = j * 4;
			for( i = 0; i < 4; i++ ){
				this.view_mat[k + i] = this.look_mat[i * 4 + j];
			}
		}
		this.set( this.view_mat );
		this.translate( -this.position_x, -this.position_y, -this.position_z );
		for( i = 0; i < 16; i++ ){
			this.view_mat[i] = this.util_mat[i];
		}
	},
	viewMatrix : function(){
		var _matrix = new Array( 16 );
		for( var i = 0; i < 16; i++ ){
			_matrix[i] = this.view_mat[i];
		}
		return _matrix;
	},
	lookMatrix : function(){
		var _matrix = new Array( 16 );
		for( var i = 0; i < 16; i++ ){
			_matrix[i] = this.look_mat[i];
		}
		return _matrix;
	},
	setViewMatrix : function( matrix ){
		if( (matrix == null) || (matrix == undefined) ){
			matrix = this.util_mat;
		}
		for( var i = 0; i < 16; i++ ){
			this.view_mat[i] = matrix[i];
		}
	},
	setLookMatrix : function( matrix ){
		if( (matrix == null) || (matrix == undefined) ){
			matrix = this.util_mat;
		}
		for( var i = 0; i < 16; i++ ){
			this.look_mat[i] = matrix[i];
		}
	},
	spriteMatrix : function( x, y, z, view_flag ){
		if( view_flag == undefined ){
			view_flag = true;
		}
		if( view_flag ){
			this.set( this.view_mat );
		} else {
			this.setIdentity();
		}
		this.translate( x, y, z );
		this.multiply( this.look_mat );
		return this.glMatrix();
	},
	frustum : function( l, r, b, t, n, f ){
		this.proj_mat[ 0] = (2.0 * n) / (r - l);
		this.proj_mat[ 1] = 0.0;
		this.proj_mat[ 2] = (r + l) / (r - l);
		this.proj_mat[ 3] = 0.0;
		this.proj_mat[ 4] = 0.0;
		this.proj_mat[ 5] = (2.0 * n) / (t - b);
		this.proj_mat[ 6] = (t + b) / (t - b);
		this.proj_mat[ 7] = 0.0;
		this.proj_mat[ 8] = 0.0;
		this.proj_mat[ 9] = 0.0;
		this.proj_mat[10] = -(f + n) / (f - n);
		this.proj_mat[11] = -(2.0 * f * n) / (f - n);
		this.proj_mat[12] = 0.0;
		this.proj_mat[13] = 0.0;
		this.proj_mat[14] = -1.0;
		this.proj_mat[15] = 0.0;
		this.multiply( this.proj_mat );
		for( var i = 0; i < 16; i++ ){
			this.proj_mat[i] = this.util_mat[i];
		}
	},
	ortho : function( l, r, b, t, n, f ){
		this.proj_mat[ 0] = 2.0 / (r - l);
		this.proj_mat[ 1] = 0.0;
		this.proj_mat[ 2] = 0.0;
		this.proj_mat[ 3] = -(r + l) / (r - l);
		this.proj_mat[ 4] = 0.0;
		this.proj_mat[ 5] = 2.0 / (t - b);
		this.proj_mat[ 6] = 0.0;
		this.proj_mat[ 7] = -(t + b) / (t - b);
		this.proj_mat[ 8] = 0.0;
		this.proj_mat[ 9] = 0.0;
		this.proj_mat[10] = -2.0 / (f - n);
		this.proj_mat[11] = -(f + n) / (f - n);
		this.proj_mat[12] = 0.0;
		this.proj_mat[13] = 0.0;
		this.proj_mat[14] = 0.0;
		this.proj_mat[15] = 1.0;
		this.multiply( this.proj_mat );
		for( var i = 0; i < 16; i++ ){
			this.proj_mat[i] = this.util_mat[i];
		}
	},
	perspective : function( fovy, a, n, f ){
		var F = 1.0 / Math.tan(((fovy * Math.PI) / 180.0) / 2.0);
		this.proj_mat[ 0] = F / a;
		this.proj_mat[ 1] = 0.0;
		this.proj_mat[ 2] = 0.0;
		this.proj_mat[ 3] = 0.0;
		this.proj_mat[ 4] = 0.0;
		this.proj_mat[ 5] = F;
		this.proj_mat[ 6] = 0.0;
		this.proj_mat[ 7] = 0.0;
		this.proj_mat[ 8] = 0.0;
		this.proj_mat[ 9] = 0.0;
		this.proj_mat[10] = (f + n) / (n - f);
		this.proj_mat[11] = (2.0 * f * n) / (n - f);
		this.proj_mat[12] = 0.0;
		this.proj_mat[13] = 0.0;
		this.proj_mat[14] = -1.0;
		this.proj_mat[15] = 0.0;
		this.multiply( this.proj_mat );
		for( var i = 0; i < 16; i++ ){
			this.proj_mat[i] = this.util_mat[i];
		}
	},
	setProjMatrix : function( matrix ){
		for( var i = 0; i < 16; i++ ){
			this.proj_mat[i] = matrix[i];
		}
	},
	viewport : function( x, y, width, height ){
		_gl.viewport( x, y, width, height );
		this.viewport_mat[0] = x;
		this.viewport_mat[1] = y;
		this.viewport_mat[2] = width;
		this.viewport_mat[3] = height;
	},
	project : function( obj_x, obj_y, obj_z, mv_mat, p_mat ){
		if( (mv_mat == null) || (mv_mat == undefined) ){
			mv_mat = this.view_mat;
		}
		if( (p_mat == null) || (p_mat == undefined) ){
			p_mat = this.proj_mat;
		}
		this.project_in[0] = obj_x * mv_mat[ 0] + obj_y * mv_mat[ 1] + obj_z * mv_mat[ 2] + mv_mat[ 3];
		this.project_in[1] = obj_x * mv_mat[ 4] + obj_y * mv_mat[ 5] + obj_z * mv_mat[ 6] + mv_mat[ 7];
		this.project_in[2] = obj_x * mv_mat[ 8] + obj_y * mv_mat[ 9] + obj_z * mv_mat[10] + mv_mat[11];
		this.project_in[3] = obj_x * mv_mat[12] + obj_y * mv_mat[13] + obj_z * mv_mat[14] + mv_mat[15];
		this.project_out[0] = this.project_in[0] * p_mat[ 0] + this.project_in[1] * p_mat[ 1] + this.project_in[2] * p_mat[ 2] + this.project_in[3] * p_mat[ 3];
		this.project_out[1] = this.project_in[0] * p_mat[ 4] + this.project_in[1] * p_mat[ 5] + this.project_in[2] * p_mat[ 6] + this.project_in[3] * p_mat[ 7];
		this.project_out[2] = this.project_in[0] * p_mat[ 8] + this.project_in[1] * p_mat[ 9] + this.project_in[2] * p_mat[10] + this.project_in[3] * p_mat[11];
		this.project_out[3] = this.project_in[0] * p_mat[12] + this.project_in[1] * p_mat[13] + this.project_in[2] * p_mat[14] + this.project_in[3] * p_mat[15];
		if( this.project_out[3] == 0.0 ){
			return false;
		}
		this.project_x = ((this.project_out[0] / this.project_out[3] + 1.0) / 2.0) * this.viewport_mat[2] + this.viewport_mat[0];
		this.project_y = ((this.project_out[1] / this.project_out[3] + 1.0) / 2.0) * this.viewport_mat[3] + this.viewport_mat[1];
		this.project_z = (this.project_out[2] / this.project_out[3] + 1.0) / 2.0;
		return true;
	},
	unProject : function( win_x, win_y, win_z, mv_mat, p_mat ){
		if( (mv_mat == null) || (mv_mat == undefined) ){
			mv_mat = this.view_mat;
		}
		if( (p_mat == null) || (p_mat == undefined) ){
			p_mat = this.proj_mat;
		}
		this.set( p_mat );
		this.multiply( mv_mat );
		this.invert();
		this.project_in[0] = (win_x - this.viewport_mat[0]) * 2.0 / this.viewport_mat[2] - 1.0;
		this.project_in[1] = (win_y - this.viewport_mat[1]) * 2.0 / this.viewport_mat[3] - 1.0;
		this.project_in[2] = win_z * 2.0 - 1.0;
		this.project_out[0] = this.project_in[0] * this.util_mat[ 0] + this.project_in[1] * this.util_mat[ 1] + this.project_in[2] * this.util_mat[ 2] + this.util_mat[ 3];
		this.project_out[1] = this.project_in[0] * this.util_mat[ 4] + this.project_in[1] * this.util_mat[ 5] + this.project_in[2] * this.util_mat[ 6] + this.util_mat[ 7];
		this.project_out[2] = this.project_in[0] * this.util_mat[ 8] + this.project_in[1] * this.util_mat[ 9] + this.project_in[2] * this.util_mat[10] + this.util_mat[11];
		this.project_out[3] = this.project_in[0] * this.util_mat[12] + this.project_in[1] * this.util_mat[13] + this.project_in[2] * this.util_mat[14] + this.util_mat[15];
		if( this.project_out[3] == 0.0 ){
			return false;
		}
		this.project_x = this.project_out[0] / this.project_out[3];
		this.project_y = this.project_out[1] / this.project_out[3];
		this.project_z = this.project_out[2] / this.project_out[3];
		return true;
	},
	transX : function(){
		return this.trans_x;
	},
	transY : function(){
		return this.trans_y;
	},
	transZ : function(){
		return this.trans_z;
	},
	crossX : function(){
		return this.cross_x;
	},
	crossY : function(){
		return this.cross_y;
	},
	crossZ : function(){
		return this.cross_z;
	},
	normalizeX : function(){
		return this.normalize_x;
	},
	normalizeY : function(){
		return this.normalize_y;
	},
	normalizeZ : function(){
		return this.normalize_z;
	},
	reflectX : function(){
		return this.reflect_x;
	},
	reflectY : function(){
		return this.reflect_y;
	},
	reflectZ : function(){
		return this.reflect_z;
	},
	coordX : function( i ){
		return this.coord_x[i];
	},
	coordY : function( i ){
		return this.coord_y[i];
	},
	coordZ : function( i ){
		return this.coord_z[i];
	},
	normalX : function(){
		return this.normal_x;
	},
	normalY : function(){
		return this.normal_y;
	},
	normalZ : function(){
		return this.normal_z;
	},
	centerX : function(){
		return this.center_x;
	},
	centerY : function(){
		return this.center_y;
	},
	centerZ : function(){
		return this.center_z;
	},
	hitX : function(){
		return this.hit_x;
	},
	hitY : function(){
		return this.hit_y;
	},
	hitZ : function(){
		return this.hit_z;
	},
	positionX : function(){
		return this.position_x;
	},
	positionY : function(){
		return this.position_y;
	},
	positionZ : function(){
		return this.position_z;
	},
	lookX : function(){
		return this.look_x;
	},
	lookY : function(){
		return this.look_y;
	},
	lookZ : function(){
		return this.look_z;
	},
	upX : function(){
		return this.up_x;
	},
	upY : function(){
		return this.up_y;
	},
	upZ : function(){
		return this.up_z;
	},
	projectX : function(){
		return this.project_x;
	},
	projectY : function(){
		return this.project_y;
	},
	projectZ : function(){
		return this.project_z;
	}
};
window._GLDrawPrimitive = _GLDrawPrimitive;
window._GLDraw = _GLDraw;
window.canUseWebGL = canUseWebGL;
window.canUseWebGLDepthTexture = canUseWebGLDepthTexture;
window.canUseWebGLTextureFloat = canUseWebGLTextureFloat;
window.setCurrent3D = setCurrent3D;
window.getCurrent3D = getCurrent3D;
window.getCurrentContext3D = getCurrentContext3D;
window.setCanvas3DSize = setCanvas3DSize;
window.createShaderProgram = createShaderProgram;
window._GLModel = _GLModel;
window._GLModelData = _GLModelData;
window.createGLModel = createGLModel;
window._GLPrimitive = _GLPrimitive;
window._GLShader = _GLShader;
window._GLSprite = _GLSprite;
window._GLStereo = _GLStereo;
window._GLTexture = _GLTexture;
window._GLTriangle = _GLTriangle;
window._GLUtilitySave = _GLUtilitySave;
window._GLUtility = _GLUtility;
window._GLPRIMITIVE_TYPE_MODEL = 0;
window._GLPRIMITIVE_TYPE_SPRITE = 1;
window._GLROTATE_ORDER_XYZ = 0;
window._GLROTATE_ORDER_XZY = 1;
window._GLROTATE_ORDER_YXZ = 2;
window._GLROTATE_ORDER_YZX = 3;
window._GLROTATE_ORDER_ZXY = 4;
window._GLROTATE_ORDER_ZYX = 5;
window._GLSTRIP_TYPE_LINE_STRIP = 0;
window._GLSTRIP_TYPE_LINES = 1;
window._GLSTRIP_TYPE_TRIANGLE_STRIP = 2;
window._GLSHADER_ERROR_COMPILE = 0;
window._GLSHADER_ERROR_LINK = 1;
})( window );
