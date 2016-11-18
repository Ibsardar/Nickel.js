/* 
    NAME:   "Nickel.js"
    AUTH:   Ibrahim Sardar
    DESC:   simpleGame.js wrapper
    NOTE:   include this AFTER simpleGame.js in your HTML file
    
    ATTN:   PLEASE FIX. Do not use prototypes since simpleGame.js
            doesn't use them and it will get confusing real fast!
*/

/*
    ************************************************************
    The following function is used to inherit objects that use
    prototypes.
    ************************************************************
*/

// NOT USED
function inherit_proto( child, parent ) {
    var parent_copy = Object.create( parent.prototype );
    parent_copy.constructor = child;
    child.prototype = parent_copy;
}

/*
    ************************************************************
    The following function is used to check if a certain sprite 
    has been clicked.
    ************************************************************
*/

//NOT USED   *MARKED FOR DELETION
function clicked( sprite, scene ){
    mx = scene.getMouseX();
    my = scene.getMouseY();
    sLeft   = sprite.x - (sprite.width  / 2);
    sRight  = sprite.x + (sprite.width  / 2);
    sTop    = sprite.y - (sprite.height / 2);
    sBottom = sprite.y + (sprite.height / 2);
    hit = false;

    if (mx > sLeft){
        if (mx < sRight){
            if (my > sTop){
                if (my < sBottom){
                    if (scene.touchable){
                        //if touchable, hit
                        hit = true;  
                        } else {
                        //if normal, check for clicked
                        if (scene.getMouseClicked()){
                            hit = true;
                        }
                    }
                }
            }
        }
    }
    return hit;
}

/*
    ************************************************************
    Nickel.js essential objects:
    
    Note - inheritance is PSEUDO from now on...
    ************************************************************
*/

  ////////////////////////////////////////////
 ///   NICKEL   /////////////////////////////
////////////////////////////////////////////
var Nickel = {
    
    // static variables
    DNE     : 0,
    STOPPED : 1,
    MOVING  : 2,
    DEAD    : 3
    
}

  ////////////////////////////////////////////
 ///   TILE   ///////////////////////////////
////////////////////////////////////////////
// 
// Desc       :   used by Grid. Useful to use for pathfinding
//
// - - - - - - - - - - - - - - - - - - - - - -
//
// Peculiar Inputs: 
//   pic      :   tile graphic file name (must be square)
//
// - - - - - - - - - - - - - - - - - - - - - - 
//
// Properites:
//   xm       :   x position in a 2D map array
//   ym       :   y position in a 2D map array
//   info     :   short description of tile's features (string)
//   visited  :   tracking variable
//   occupied :   tracking variable (usually obstructed by unit)
//   blocked  :   tracking variable (usually obstructed by structure)
//   parent   :   tracking variable
//
//////////////////////////////////////////////
function Tile( scene,pic,wt,ht,x,y,xm,ym,info ) {
    
    //vars (private)
    var xm   = xm;
    var ym   = ym;
    var info = info;
    //tracking vars (private)
    var visited  = false;
    var occupied = false;
    var blocked  = false;
    var parent   = null;
    var occ_team = "";   //team of occupier/blocker, ""=none
    //costs
    var g = 9999999;
    var h = 0;
    var f = 0;
    //debug
    var file = pic;

    //init
    mySprite = new Sprite( scene, pic, wt, ht );
    mySprite.setBoundAction( CONTINUE );
    mySprite.setSpeed( 0 );
    
    // (public)
    mySprite.index = -1;  //index of some array (for efficiency)
    
    //set costs
    mySprite.set_costs = function ( g_cost, h_cost ) {
        g = g_cost;
        h = h_cost;
        f = g + h;
    }
    
    //get g cost
    mySprite.get_g = function () { 
        return g;
    }
    
    //get h cost
    mySprite.get_h = function () {
        return h;
    }
    
    //get f cost
    mySprite.get_f = function () {
        return f;
    }
    
    //return topleft position
    mySprite.get_topleft = function () {
        var l = mySprite.x - mySprite.width/2;
        var t = mySprite.y - mySprite.height/2;
        return [l,t];
    }
    
    //set topleft position
    mySprite.set_topleft = function( l, t ) {
        var cx = l + mySprite.width/2;
        var cy = t + mySprite.height/2;
        mySprite.setPosition( cx,cy );
    }
    
    //init pos
    mySprite.set_topleft( x,y );
    
    //init visibility
    if (pic == "nothing.png"){
        mySprite.hide();
    }
    
    //return position on map
    mySprite.pos = function() {
        return [xm,ym];
    }
    
    //set tile as blocked, unoccupied
    mySprite.block = function() {
        blocked = true;
        occupied = false;
        //debug
        file = this.image.src;
        this.setImage("debug_blo.png");
    }
    
    //set a tile as occupied, unblocked
    mySprite.occupy = function() {
        blocked = false;
        occupied = true;
        //debug
        file = this.image.src;
        this.setImage("debug_occ.png");
    }
    
    //set a tile as unoccupied, unblocked, teamless
    mySprite.free = function() {
        blocked = false;
        occupied = false;
        occ_team = "";
        //debug
        this.setImage(file);
    }
    
    //set a tile as visited
    mySprite.visit = function() {
        visited = true;
    }
    
    //set a tile as not visited
    mySprite.unvisit = function() {
        visited = false;
    }
    
    //set parent
    mySprite.set_parent = function( tile ) {
        parent = tile;
    }
    
    //resets all tracking and cost variables
    mySprite.clear_all = function() {
        this.clear_trackers();
        this.clear_costs();
    }
    
    //resets all cost variables
    mySprite.clear_costs = function() {
        g = 9999999;
        h = 0;
        f = 0;
    }
    
    //resets all tracking variables
    mySprite.clear_trackers = function() {
        visited  = false;
        occupied = false;
        blocked  = false;
        parent   = null;
        occ_team = "";
        //debug
        this.setImage(file);
    }
    
    //returns current x pos on map
    mySprite.get_xpos = function() {
        return xm;
    }
    
    //returns current y pos on map
    mySprite.get_ypos = function() {
        return ym;
    }
    
    //returns parent
    mySprite.get_parent = function() {
        return parent;
    }
    
    //returns true if blocked
    mySprite.is_blocked = function() {
        return blocked;
    }
    
    //returns true if occupied
    mySprite.is_occupied = function() {
        return occupied;
    }
    
    //returns true if visited
    mySprite.is_visited = function() {
        return visited;
    }
    
    //sets occupier's/blocker's team value to this tile
    mySprite.set_team = function(t) {
        occ_team = t;
    }
    
    //returns team value of occupier/blocker of this tile
    mySprite.get_team = function() {
        return occ_team;
    }
    
    //return
    return mySprite;
    
}

  ////////////////////////////////////////////
 ///   GRID   ///////////////////////////////
////////////////////////////////////////////
//
// Inherits     :   SimpleGame.Scene
// Desc         :   main game object that manages/controls everything on it
//
// - - - - - - - - - - - - - - - - - - - - - - 
//
// Peculiar Inputs:
//   map_matrix :   2D array of grid-codes that correspond to 'tile_dict'
//   tile_dict  :   same as below
//   bg_dim     :   associative list of width and height of 'bg_image'
//   can_x      :   x position of canvas on form
//   can_y      :   y position of canvas on form
//
// - - - - - - - - - - - - - - - - - - - - - - 
//
// Properties:
//   bg_clr     :   background color
//   bg_img     :   background image
//   map        :   2D array of tiles (inits as a 1D array along x-axis)
//   matrix     :   2D array of grid-codes that correspond to 'tile_dict'
//   tile_dict  :   associative list of tile graphic links, each paired with an ID
//   tile_w     :   pixel width of tile
//   tile_h     :   pixel height of tile
//   tiles_w    :   tile width of map
//   tiles_h    :   tile height of map
//   elements   :   list of all sprites managed by grid (ui, units, structures, etc)
//
//////////////////////////////////////////////
function Grid( bg_color, bg_image, map_matrix, tile_dict,
               can_x, can_y, tile_w, tile_h, tiles_w, tiles_h,
               cam_w, cam_h, bg_dim ) {
    
    
    // Behaves like inheritance, but we are actually
    // just adding functionality on to the scene object
    myScene = new Scene();
    
    //init vars
    var map = [];
    var tile_dict = tile_dict;
    var bg_clr = bg_color;
    var tile_w = tile_w;
    var tile_h = tile_h;
    var tiles_w = tiles_w;
    var tiles_h = tiles_h;
    var visited_tiles = [];
    var elements = [];
    myScene.selected_units = [];   //public
    
    //pre-defined vars
    var scroll_speed = 16; //for map scrolling
    var gap = 100; //for boundaries
    var bounds = []; //map scrolling bounds
    
    //event handling stuff
    var mouse_upped = 0;
    
    //was mouse pressed down and let go?
    //left=1, middle=2, right=3
    myScene.mouse_up = function( sprite ) {
        mx = myScene.getMouseX();
        my = myScene.getMouseY();
        sLeft   = sprite.x - (sprite.width  / 2);
        sRight  = sprite.x + (sprite.width  / 2);
        sTop    = sprite.y - (sprite.height / 2);
        sBottom = sprite.y + (sprite.height / 2);
        hit = false;

        if (mx > sLeft){
            if (mx < sRight){
                if (my > sTop){
                    if (my < sBottom){
                        if (myScene.touchable){
                            //if touchable, left-click
                            hit = 1;
                        } else {
                            // hit = which mouse button clicked
                            hit = mouse_upped;
                        }
                    }
                }
            }
        }
        return hit;
    }
    
    //
    // define functions below
    //
    
    //creates the map
    myScene.create_map = function ( matrix ) {
        for(x=0;x<tiles_w;x++){
            var sub_map = [];
            map.push( sub_map );
            for(y=0;y<tiles_h;y++){
                var x_map = x;
                var y_map = y;
                var x_pxl = x * tile_w;
                var y_pxl = y * tile_h;
                var code = matrix[x][y];
                var pic_link = tile_dict[ code ];
                var new_tile = new Tile( myScene, pic_link,
                                         tile_w, tile_h,
                                         x_pxl, y_pxl,
                                         x_map, y_map, "none" );
                sub_map.push( new_tile );
            }
        }
    }
    
    //init funcs
    myScene.setSizePos( cam_w, cam_h, can_x, can_y );
    myScene.setBG( bg_color );
    myScene.create_map( map_matrix );
    //background image init
    bg_img = new Sprite( myScene, bg_image, bg_dim[0], bg_dim[1] );
    bg_img.setBoundAction( CONTINUE );
    bg_img.setSpeed( 0 );
    
    //add an element to be managed by grid
    myScene.add_element = function ( obj ) {
        elements.push(obj);
    }
    
    //update tiles, BG image
    myScene.update_map = function () {
        //background
        bg_img.update();
        //tiles
        for (x in map){
            for (y in map[x]){
                map[x][y].update();
            }
        }
    }
    
    //update all elements (ELEMENT MUST HAVE: 'update_master' function)
    myScene.update_elements = function () {
        //elements
        for (i in elements) {
            elements[i].update_master();
        }
    }
    
    //event handler
    myScene.update_events = function () {
        //if mouse was pressed and let go
        document.onmouseup = function( event ) {
            mouse_upped = event.button+1;
            //log it
            if (mouse_upped==1){console.log("left mouse up!");}
            else if(mouse_upped==2){console.log("middle mouse up!");}
            else if(mouse_upped==3){console.log("right mouse up!");}
            else{console.log("<unkown> mouse up!");}
        }
        //if canvas was right clicked, ignore context menu
        myScene.canvas.oncontextmenu = function( event ) {
            return false;
        }
    }
    
    //resets variables as needed to properly enter the next frame
    myScene.prepare_for_next = function(){
        mouse_upped = 0;
    }
    
    //update
    myScene.update = function () {
        myScene.update_events();
        myScene.update_map();
        myScene.update_elements();
        myScene.prepare_for_next();
    }
    
    //set top-left pixel position of bg-img
    myScene.set_topleft = function( l, t ) {
        cx = l + bg_img.width/2;
        cy = t + bg_img.height/2;
        bg_img.setPosition( cx,cy );
    }
    
    myScene.set_top = function( y ) {
        //offset
        var dify = y - (bg_img.y-bg_img.height/2); //*down is positive diff
        //bg
        bg_img.y += dify;
        //tiles
        for (i in map){
            for (j in map[i]){
                map[i][j].y += dify;
            }
        }
        //elements
        for (e in elements){
            elements[e].y += dify;
        }
    }
    
    myScene.set_bottom = function( y ) {
        //offset
        var dify = y - (bg_img.y+bg_img.height/2); //*down is positive diff
        //bg
        bg_img.y += dify;
        //tiles
        for (i in map){
            for (j in map[i]){
                map[i][j].y += dify;
            }
        }
        //elements
        for (e in elements){
            elements[e].y += dify;
        }
    }
    
    myScene.set_left = function( x ) {
        //offset
        var difx = x - (bg_img.x-bg_img.width/2); //*right is positive diff
        //bg
        bg_img.x += difx;
        //tiles
        for (i in map){
            for (j in map[i]){
                map[i][j].x += difx;
            }
        }
        //elements
        for (e in elements){
            elements[e].x += difx;
        }
    }
    
    myScene.set_right = function( x ) {
        //offset
        var difx = x - (bg_img.x+bg_img.width/2); //*right is positive diff
        //bg
        bg_img.x += difx;
        //tiles
        for (i in map){
            for (j in map[i]){
                map[i][j].x += difx;
            }
        }
        //elements
        for (e in elements){
            elements[e].x += difx;
        }
    }
    
    //return topleft position
    myScene.get_topleft = function () {
        var l = bg_img.x - bg_img.width/2;
        var t = bg_img.y - bg_img.height/2;
        return [l,t];
    }
    
    //init BG image position to 0,0
    myScene.set_topleft( 0,0 );
    //pre-define bounds
    var bounds = [
        0,                  // 0 - outer top
        myScene.width,      // 1 - outer right
        myScene.height,     // 2 - outer bottom
        0,                  // 3 - outer left
        gap,                // 4 - inner top
        myScene.width-gap,  // 5 - inner right
        myScene.height-gap, // 6 - inner bottom
        gap,                // 7 - inner left
    ]
    
    //moves the map and everything in it
    //towards a specific direction
    myScene.move_towards = function( deg, speed ) {
        
        //background
        bg_img.setMoveAngle( deg );
        bg_img.setSpeed( speed );
        //tiles
        for (x in map){
            for (y in map[x]){
                map[x][y].setMoveAngle( deg );
                map[x][y].setSpeed( speed );
            }
        }
        //elements
        for (e in elements){
            elements[e].setMoveAngle( deg );
            elements[e].setSpeed( speed );
        }
        
    }
    
    //check events
    myScene.interract = function() {
        
        //gather any useful numbers
        var mx = myScene.getMouseX();
        var my = myScene.getMouseY();
        var cx = myScene.width/2;
        var cy = myScene.height/2;
        //[x0, y0] = myScene.get_topleft(); //top left of bg
        //[x1, y1] = [ bg_img.x+bg_img.width/2, bg_img.y+bg_img.height/2 ]; //bottom right
        
        var l = bg_img.x-bg_img.width/2;  //left
        var t = bg_img.y-bg_img.height/2; //top
        var r = bg_img.x+bg_img.width/2;  //right
        var b = bg_img.y+bg_img.height/2; //bottom
        
        //get angle from center of canvas and move the
        //BG opposite of that direction with speed 15
        //or reverse if edge hit (+tiles & elements)
        var cdx = mx - cx;
        var cdy = my - cy;
        var rad = Math.atan2( cdy, cdx );
        var deg = rad * 180 / Math.PI;
        var deg = deg + 90;
        
        
        //if mouse x,y is within the boundary of the canvas
        //and a rectangle <gap> pixels into the canvas
        if (
           !(mx>bounds[7] &&
             mx<bounds[5] &&
             my>bounds[4] &&
             my<bounds[6])
           &&
            (mx>bounds[3] &&
             mx<bounds[1] &&
             my>bounds[0] &&
             my<bounds[2])
           ) {
            
            //MOVE
            myScene.move_towards( deg, -scroll_speed );
        
        } else {
            
            //STOP
            myScene.move_towards( 0, 0 );
            
        }//end check bounds for mouse-map scroll
        
        //if map is scrolling too far,
        //set position at edge
        //left
        if ( l>bounds[7] ) {
            myScene.set_left( bounds[7] );
        }

        //right
        if ( r<bounds[5] ) {
            myScene.set_right( bounds[5] );
        }

        //top
        if ( t>bounds[4] ) {
            myScene.set_top( bounds[4] );
        }

        //bottom
        if ( b<bounds[6] ) {
            myScene.set_bottom( bounds[6] );
        }
        
    }//end func
    
    //for debugging
    myScene.print = function () {
        var mapxpos = bg_img.x-bg_img.width/2;
        var mapypos = bg_img.y-bg_img.height/2;
        console.log( "image file: " + bg_img.image.src );
        console.log( "bg color: " + bg_clr );
        console.log( "camera/canvas size: w) " + myScene.width + " h) " + myScene.height);
        console.log( "camera/canvas position: x) " + myScene.left + " y) " + myScene.top);
        console.log( "grid tiles: w) " + tiles_w + " y) " + tiles_h );
        console.log( "map position on canvas: " + mapxpos + ", " + mapypos );
    }
    
    //get tile via its position
    myScene.get_tile = function( pos ) {
        
        return map[pos[0]][pos[1]];
        
    }
    
    //visit tile and store in list
    myScene.visit = function( tile ) {
        
        tile.visit();
        visited_tiles.push( tile );
        
    }
    
    //sets all visited tiles to not visited
    myScene.unvisit_all = function() {
        
        for(i in visited_tiles){
            visited_tiles[i].unvisit();
        }
        visited_tiles = [];
        
    }
    
    //resets all tile's variables' to do with pathfinding
    myScene.rejuvinate_all = function() {
        
        console.log("rejuvinating...");
        
        for(i in map){
            for(j in map[i]){
                map[i][j].clear_costs();
                map[i][j].set_parent( null );
            }
        }
        
        console.log("grid rejuvnated");
        
    }
    
    //checks if any tile has a parent
    myScene.parents_exist = function() {
        for (t in map) {
            for (s in map[t]) {
                if (map[t][s].get_parent() != null) {
                    return true;
                }
            }
        }
        return false;
    }
    
    //gets distance between 2 tiles
    myScene.get_distance = function( a,b ) {
        var dx = a.get_xpos()-b.get_xpos();
        var dy = a.get_ypos()-b.get_ypos();
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    //get list of adjacent tiles (brute force)
    myScene.get_adj_tiles = function( tile, incl_diag=true) {
        
        var x = tile.get_xpos();
        var y = tile.get_ypos();
        var incld = incl_diag;
        var adjs = [];
        
        //CONCLUSION:  xm,ym values are CORRECTLY set!
        /*console.log("G_gat_UT :: ");
        console.log(map);
        console.log("    Tiles in map: " + tiles_w + ", " + tiles_h);
        console.log("    Cur tile: " + tile + " @ " + x + ", " + y);*/
        
        
        //        /!\        \\
        //|\    WARNING    /|\\
        //|||||||||||||||||||\\
        //||| BRUTE FORCE |||\\
        //|||||||||||||||||||\\
        //|/     below     \|\\
        //        \!/        \\
        
        
        //brute force if statement
        // W edge
        if ( x == 0 ) {
            
            // E tile
            adjs.push( map[x+1][y] );
            
            // NW corner
            if ( y == 0 ) {
                
                adjs.push( map[x][y+1] );
                if (incld) {
                    adjs.push( map[x+1][y+1] );
                }
            
            // SW corner
            } else if ( y == tiles_h-1 ) {
                
                adjs.push( map[x][y-1] );
                if (incld) {
                    adjs.push( map[x+1][y-1] );
                }
               
            // W edge
            } else {
                
                adjs.push( map[x][y-1] );
                adjs.push( map[x][y+1] );
                if (incld) {
                    adjs.push( map[x+1][y-1] );
                    adjs.push( map[x+1][y+1] );
                }

            }
        // E edge
        } else if ( x == tiles_w-1 ) {
            
            // W tile
            adjs.push( map[x-1][y] );
            
            // NE corner
            if ( y == 0 ) {
                
                adjs.push( map[x][y+1] );
                if (incld) {
                    adjs.push( map[x-1][y+1] );
                }
            
            // SE corner
            } else if ( y == tiles_h-1 ) {
                
                adjs.push( map[x][y-1] );
                if (incld) {
                    adjs.push( map[x-1][y-1] );
                }
               
            // E edge
            } else {
                
                adjs.push( map[x][y+1] );
                adjs.push( map[x][y-1] );
                if (incld) {
                    adjs.push( map[x-1][y+1] );
                    adjs.push( map[x-1][y-1] );
                }
                
            }
        
        // between E,W edges
        } else {
            
            // E, W tiles
            adjs.push( map[x+1][y] );
            adjs.push( map[x-1][y] );
            
            // N edge
            if ( y == 0 ) {
                
                adjs.push( map[x][y+1] );
                if (incld) {
                    adjs.push( map[x-1][y+1] );
                    adjs.push( map[x+1][y+1] );
                }
            
            // S edge
            } else if ( y == tiles_h-1 ) {
                
                adjs.push( map[x][y-1] );
                if (incld) {
                    adjs.push( map[x-1][y-1] );
                    adjs.push( map[x+1][y-1] );
                }
               
            // between all edges
            } else {
                
                adjs.push( map[x][y+1] );
                adjs.push( map[x][y-1] );
                if (incld) {
                    adjs.push( map[x+1][y+1] );
                    adjs.push( map[x+1][y-1] );
                    adjs.push( map[x-1][y+1] );
                    adjs.push( map[x-1][y-1] );
                }
                
            }
            
        }//end BRUTAL if statement
        
        return adjs;    
        
    }//end func
    
    //get PSEUDO nearest tile (actually just gives a random, available adjacent tile)
    myScene.get_nearest_tile = function( tile,
                                         incl_diag=true,
                                         incl_block=true,
                                         incl_occup=true ) {
        //rename
        var incld = incl_diag;
        var inclb = incl_block;
        var inclo = incl_occup;
        
        //vars
        var Q        = new Queue();
        var adjs     = [];
        var start    = tile;
        var nearest  = null;
        var to_check = [];
        var cur_cost = 99999999;
        
        //functions
        var get_adjs = function( t ) {
            return myScene.get_adj_tiles( t,incld );
        }
        var is_valid = function( t ) {
            if(t.is_blocked()){
                if(inclb){return true;}
            }else{
                if(t.is_occupied()){
                    if(inclo){return true;}
                }else{return true;}
            }
            return false;
        }
        
        //init
        myScene.unvisit_all();
        console.log("Is (1,1) visited?: " + myScene.get_tile([1,1]).is_visited());
        myScene.visit(start);
        Q.in( start );
        
        //get nearest tile
        while(!Q.is_empty()){
            while(!Q.is_empty()){
                to_check.push(Q.out());
            }
            for(o in to_check){
                adjs = get_adjs(to_check[o]);
                for(a in adjs){
                    if(!adjs[a].is_visited()){
                        if(is_valid(adjs[a])){
                            var d = myScene.get_distance(adjs[a],start);
                            if(cur_cost > d){
                                cur_cost = d;
                                nearest = adjs[a];
                            }
                        }
                        myScene.visit(adjs[a]);
                        Q.in(adjs[a]);
                    }
                }
            }
            if(nearest != null){
                return nearest;
            }
            to_check = [];
        }
        return nearest;
        
    }//end func
    
    //return object
    return myScene;
    
}

  ////////////////////////////////////////////
 ///   UNIT   ///////////////////////////////
////////////////////////////////////////////
function Unit( scene, data, s_data, tile ) {
    
    //init
    mySprite = new Sprite( scene,data[0],data[1],data[2] );
    mySprite.setBoundAction( CONTINUE );
    mySprite.setSpeed( 0 );
    
    //public sprite of mySprite
    mySprite.selector = new Sprite( scene,s_data[0],s_data[1],s_data[2] );
    mySprite.selector.setBoundAction( CONTINUE );
    mySprite.selector.setSpeed( 0 );
    
    //vars
    // - selection
    var selected = false;
    mySprite.select_index = -1; //negative value means not in selected list (public)
    // - pathfinding
    mySprite.curr = tile;
    mySprite.dest = /*scene.get_tile([5,6]);//*/null;
    mySprite.path = [];//[scene.get_tile([5,5]),scene.get_tile([5,7]),scene.get_tile([8,4]),scene.get_tile([1,5]),scene.get_tile([5,9]),scene.get_tile([4,4])];
    // - state
    mySprite.state = Nickel.STOPPED;
    mySprite.team  = "player";
    // - movement
    mySprite.n_dx = 0;
    mySprite.n_dy = 0;
    mySprite.max_rot = 5;
    mySprite.energy = 5;
    mySprite.rot = mySprite.getImgAngle() + 90;
    mySprite.dir = mySprite.getMoveAngle();
    mySprite.turned = false;
    
    //places self at a tile's center
    mySprite.place_at_tile = function( tile ) {
        mySprite.setPosition(tile.x,tile.y);
        mySprite.x = tile.x;
        mySprite.y = tile.y;
        tile.occupy();
        tile.set_team( this.team );
    }
    
    //if unit is larger than 1 tile  **  INCOMPLETE
    mySprite.place_at_tiles = function( tiles ) {
        //...
    }
    
    //init position
    mySprite.place_at_tile( mySprite.curr );
    
    //
    //  Movement
    //
    
    mySprite.turn_to = function ( elem ) {
        // * Changes dir and orientation to turn
        //   towards the target sprite.
        
        //vars
        var incline, turn;
        var ang;
        var dx, dy;
        
        //determine shortest turn angle
        //incline = this.angleTo(tile);
        dx = this.x - elem.x;
        dy = this.y - elem.y;
        incline = Math.atan2(dy, dx) * 180 / Math.PI;
        incline += 90;
        //degrees are offset
        turn = incline - this.rot;
        
        if (turn > 180) {
            turn = 360 - turn;
            turn = -1  * turn;
        } else
        if (turn < -180) {
            turn = 360 + turn;
        }
        
        //restrict from turning immediately, add to move angle
        ang = this.rot;
        
        if (Math.abs(turn) > this.max_rot) {
            this.turned = false;
            if (turn>0){ ang+=this.max_rot; }
            else
            if (turn<0){ ang-=this.max_rot; }
        } else
        if (Math.abs(turn) < this.max_rot) {
            ang += turn;
            this.turned = true;
        } else {
            this.turned = true;
        }
        
        //set rotation and direction seperately
        this.rot = ang;
        this.dir = ang+90;
        
    }
    
    mySprite.move = function ( vec ) {
        this.n_dx = vec[0];
        this.n_dy = vec[1];
    }
    
    mySprite.stop = function () {
        this.n_dx = 0;
        this.n_dy = 0;
    }
    
    mySprite.set_turn_rate = function (rate) {
        this.max_rot = rate;
    }
    
    mySprite.get_vec = function () {
        
        var rads = this.dir * Math.PI / 180;
        var vec = [];
        
        vec[0] = Math.cos(rads) * this.energy;
        vec[1] = Math.sin(rads) * this.energy;
        
        return vec;
    }
    
    //
    //  Selection
    //
    
    mySprite.select = function(){
        var len = mySprite.scene.selected_units.push(this);
        this.select_index = len-1;
        this.selector.show();
        selected = true;
    }
    
    mySprite.unselect = function(){
        var sels = mySprite.scene.selected_units;
        
        //Decrement all unit's select-indices in sels starting
        //from the unit after the clicked unit
        for(u=this.select_index+1; u<sels.length; u++){
            sels[ u ].select_index -= 1;
        }
        
        sels.splice(this.select_index,1);
        this.select_index = -1;
        this.selector.hide();
        selected = false;
    }
    
    mySprite.is_selected = function(){
        return selected;
    }
    
    //events
    mySprite.events = function(){
        
        var click = mySprite.scene.mouse_up( this );
        
        //select if clicked
        if (click==1){
            
            console.log("unit clicked! : selection");
            
            if (!selected){
                this.select();
            } else {
                this.unselect();
            }
            
        } else if (click==3){
            
            console.log("unit clicked! : action");
            
            ///////////////////////////////////////////////////////////// HERE!
            
        }
        
        //debug - find_path for all units if spacebar hit
        document.body.onkeyup = function(e){
            if(e.keyCode == 32){
                scene.get_tile([3,0]).block();
                scene.get_tile([0,3]).block();
                scene.get_tile([4,1]).block();
                scene.get_tile([5,3]).block();
                scene.get_tile([3,2]).block();
                scene.get_tile([4,5]).block();
                scene.get_tile([5,5]).block();
                scene.get_tile([6,5]).block();
                scene.get_tile([7,5]).block();
                //mySprite.dest = scene.get_tile([5,6]);
                //mySprite.find_path( mySprite.a_star );
                //mySprite.dest = null;
            }
        }
        
    }
    
    //
    //  Pathfinding
    //
    
    // check if this has center in another sprite
    mySprite.center_in = function( elem ){
        var t = 0; //offset
        if (this.x >= elem.x - this.energy-t){
            if (this.x <= elem.x + this.energy+t){
                if (this.y >= elem.y - this.energy-t){
                    if (this.y <= elem.y + this.energy+t){
                        return true;
                    }//end if below top
                }//end if above bottom
            }//end if before right
        }//end if past left
        return false;
    }
    
    // update path using custom function/algorithm
    mySprite.find_path = function( algorithm ) {
    
        //disregard if no path to be found
        if (this.dest == null){
            console.log("fip -> no destination");
            return;
        }
        
        //error and disregard if no current tile
        if (this.curr == null){
            console.log("Problem Found: Unit at "+this.x+","+this.y+
                        " has no current tile. Path could not be found.");
            return;
        }
        
        //update and disregard if path complete
        if ( this.curr.get_xpos() == this.dest.get_xpos() ) {
            if ( this.curr.get_ypos() == this.dest.get_ypos() ) {
                this.dest = null;
                console.log("fip -> path complete! @ "+this.curr.pos());
                return;
            }
        }
        
        //recalculate new destination if unavailable
        if ( this.dest.is_blocked() || this.dest.is_occupied() ){
            console.log("fip -> dest unavailable");
            this.dest = this.scene.get_nearest_tile(this.dest,true,false,false);
            console.log("fip -> new destination calculated: " + this.dest.pos());
        }
        
        //console.log("fip -> A* is about to be called...");
        console.log("fip -> @params -> start : " + this.curr.pos() );
        console.log("               -> end   : " + this.dest.pos() );
    
        //for clearity
        start_tile = this.curr;
        end_tile   = this.dest;
    
        // Actions of "algorithm" function:
        // - update current unit's path list
        // - path list format:
        //   - [ next, next of next, ... end ]
        algorithm( start_tile,end_tile );
    
    }//END find path
    
    // check if any tile in list is blocked or occupied
    mySprite.is_clear = function( ts ) {
        var dbg = [];
        for(t in ts){
            if (ts[t].is_occupied() || ts[t].is_blocked()){
                //return false;
                dbg.push(ts[t].pos());
            }
        }
        //debug
        console.log("Checking if clear: " + dbg);
        return true;
    }
    
    // move to next tile in path list
    mySprite.follow_path = function() {
        
        //////////////////////////////////////////      FIX   !!!
        //console.log("* FOLLOW PATH *");
        /*
        //init
        var next = this.path[1];
        
        if (this.state == Nickel.DEAD || this.state == Nickel.DNE){
            return;
        }
        
        if (this.state == Nickel.STOPPED) {
            //do nothing unless next is valid
            if (next != null) {
                //if not turned to tile, turn
                if (!this.turned) {
                    this.turn_to(next);
                }
            }
        }
        */
        /*
        //skip if DNE
        if (this.state == Nickel.DNE){
            return;
        }
        
        //skip if DEAD
        else if (this.state == Nickel.DEAD){
            return;
        }
        
        //check if we have to move if STOPPED
        else if (this.state == Nickel.STOPPED){
            //if destination exists
            if (this.dest != null){
                //if path exists
                if (next != null){
                    //if path is clear
                    if (this.is_clear(this.path)) {
                        //if turned to next tile
                        if (this.turned) {
                            //leave current tile
                            this.curr.free();
                            //occupy next tile
                            this.curr = this.path.shift();
                            this.curr.occupy();
                            this.curr.set_team(this.team);
                            //start moving
                            this.move( this.get_vec() );
                            this.state = Nickel.MOVING;
                        } else {
                            //turn to next tile
                            this.turn_to(next);
                        }
                    } else {
                        console.log("fp -> recalculating path...");
                        //recalculate path
                        this.find_path( this.a_star );
                    }
                }
            }
        }
        
        //check if we have to stop if MOVING
        else if (this.state == Nickel.MOVING){
            // ** 'dest' is not null **
            // ** 'next' may be null **
            //if destination reached
            if (this.curr.get_xpos() == this.dest.get_xpos()){
                if (this.curr.get_ypos() == this.dest.get_ypos()){
                    //stop going to destination
                    this.dest = null;
                    this.stop();
                    this.state = Nickel.STOPPED;
                }
            }
            //if current tile's center reached
            if (this.center_in(this.curr)) {
                //snap to tile
                this.x = next.x;
                this.y = next.y;
                //stop
                this.stop();
                this.state = Nickel.STOPPED;
            }
            //if path does not exist (should not happen)
            if (next==null) {
                //stop
                this.stop();
                this.state = Nickel.STOPPED;
            }
        }
        */
        
        // if dead or non-existent: disregard
        if (this.state == Nickel.DEAD || this.state == Nickel.DNE){
            //console.log(" -> dead / dne <:> " + Nickel.DEAD + " / " + Nickel.DNE);
            return;
        }
    
        // if path empty:
        // - if moving: stop
        else if (this.path.length == 0){
            //console.log("find_path has been called...");
            // *** this.find_path( this.a_star );
            //console.log(" -> no path");
            if (this.state == Nickel.MOVING){
                //console.log(" -> stopping");
                this.stop();
                this.state = Nickel.STOPPED;
            }
        }
        
        // if path.len more than 0:
        // - if stopped: move
        //   - move if not reached
        else if (this.path.length > 0){
            //console.log(" -> is path");
            this.state = Nickel.STOPPED;
            this.turn_to( this.path[0] );
            
            if (this.turned) {
                if(this.curr!=null){
                    this.curr.free();
                    this.curr = null;
                }
                this.state = Nickel.MOVING
                
                if (this.center_in( this.path[0] )) {
                    
                    //snap to tile
                    this.x = this.path[0].x;
                    this.y = this.path[0].y;
                    // recalculate if current tile is occupied/blocked
                    if (this.path[0].is_occupied() || this.path[0].is_occupied()) {
                        this.dest = this.scene.get_nearest_tile(this.path[0],true,false,false);
                        this.find_path( this.a_star );
                    } else {
                        //console.log(" -> tile reached");
                        //set
                        this.curr = this.path.shift();
                        this.curr.occupy();
                        this.curr.set_team( this.team );
                    }
                    //stop
                    this.state = Nickel.STOPPED;
                    this.stop();
                    
                } else {
                    //console.log(" -> going to tile");
                    this.move( this.get_vec() );
                }
                
            }//end if turn complete
            
        }// end if (is path)
        
        
        //should not get here
        else {
            console.log("fp -> follow_path has crashed.");
        }
    
    }
    
    // checks if a tile exists in a list of tiles
    // complexity:  O(n)
    mySprite.tile_in = function ( list, t ) {
        for (var i in list) {
            if (list[i].get_xpos() == t.get_xpos())
                if (list[i].get_ypos() == t.get_ypos())
                    return true;
        }
        return false;
    }
    
    // recursively creates a path
    mySprite.create_path = function ( t ) {
        if (t==null){
            console.log("cp -> ERROR: null input");
            return;
        }
        // ~~debug
        tmp = [];
        for(i in this.path){if(this.path[i]!=null){ tmp.push( this.path[i].pos() ); } }
        console.log(JSON.stringify(tmp));
        // --
        this.path.unshift( t );
        // ~~debug
        if (t.get_parent()!=null){console.log("par -> "+t.get_parent().pos()); }
        else{console.log("par -> null");}
        // --
        var par = t.get_parent();
        if (par == null) {
            return;
        } else {
            this.create_path( par );
        }
    }
    
    //the typical A* Pathfinding Algorithm
    // note: algorithm is dynamic
    mySprite.a_star = function( a,b ) {
        
        console.log("");
        console.log("A* : BEGIN");
        
        //to developers: REFINE this condition please!
        //ABORT if dest is blocked/occupied
        if (b.is_blocked() || b.is_occupied()) {
            console.log("A* -> destination unavailable");
            return;
        }
        
        //vars
        var open=[];
        var close=[];
        var adjs=[];
        var par=[];
        var curr;
        var end;
        var S;
        var Q;
        var h, g;
        var iters; // error handle
        
        //init
        myScene.rejuvinate_all();
        curr = a;
        end = b;
        open.push( a );
        g = 0;
        h = mySprite.scene.get_distance( a, end );
        curr.set_costs( g, h );
        iters = 0;
        /*
        // RETRY with a different approach
        while( open.length != 0 ) {
            
            console.log("o.len: "+open.length);
            
            // get open node with lowest F
            var tmp_cost = 99999999;
            for (var x in open) {
                if (open[x].get_f() < tmp_cost) {
                    curr = open[x];
                    tmp_cost = open[x].get_f();
                }
            }
            
            //close
            open.splice( curr.index, 1 );
            curr.index = close.length;
            close.push( curr );
            
            //if done, make path
            var p0 = curr.pos();
            var p1 = end.pos();
            if (p0[0]==p1[0] && p0[1]==p1[1]) {
                mySprite.create_path( curr );
                console.log(" path >> " + JSON.stringify(this.path));
                return;
            }
            
            //get adjacents
            adjs = mySprite.scene.get_adj_tiles( curr, true );
            
            //loop thru adjs
            for (i in adjs) {
                
                //simplify
                var node = adjs[i];
                
                //ignore if invalid
                if ( node.is_blocked()  ||
                     node.is_occupied() ||
                     mySprite.tile_in(close, node)
                   ) {
                    continue;
                }
                
                // G (total)
                g = curr.get_g() + mySprite.scene.get_distance( curr,node );
                
                // H (euclidean)
                h = mySprite.scene.get_distance( node,end );
                
                //is open?
                if (mySprite.tile_in( open,node )) {
                    
                    //smaller G from curr?
                    if ( g < node.get_g() ) {
                        
                        // update discovered node
                        node.set_parent( curr );
                        node.set_costs( g,h );
                        
                    }
                    
                } else {
                    
                    // discover new node
                    node.index = open.length;
                    open.push( node );
                    
                }
                
            }

        }//end while loop
        
        *//**/
        //loop until path is found
        while ( true ) {
            
            //avoid a possible crash
            console.log("iter #"+iters);
            iters++;
            if (iters > 100){
                console.log("A* -> ERROR: ASTAR HAS TIMED-OUT");
                this.path = [];
                break;
            }
        
            //get lowest F cost tile
            var tmp_cost = 9999999;
            for (var x in open) {

                if (open[x].get_f() < tmp_cost) {
                    curr = open[x];
                    tmp_cost = open[x].get_f();
                    //console.log("A* -> new tile found @ "+curr.pos()+" with cost of "+tmp_cost);
                } else {
                    //console.log("A* -> tile @ "+open[x].pos()+" ignored, cost of "+open[x].get_f());
                }
            }

            // close current tile (shift all the other tiles)
            // *** open.splice( curr.index, 1 );
            for(ii in open){
                if (open[ii].get_xpos() == curr.get_xpos())
                    if (open[ii].get_ypos() == curr.get_ypos())
                        open.splice( ii, 1 );
            }
            close.push( curr );
            //console.log("A* -> tile @ "+curr.pos()+" unopened and closed")
            
            //check if current is end tile
            if (curr.get_xpos() == end.get_xpos())
                if (curr.get_ypos() == end.get_ypos()){
                    //console.log("A* -> end tile reached");
                    break;
                }
            
            //Don't need curr
            // for the rest of
            // this iteration.
            //curr = null;
            
            //loop through closed tiles
            for (var y in close) {
                
                //loop through adjacent tiles
                //  - include diagonals
                //  - exclude blocked
                //  - exclude occupied
                //  - exclude closed
                adjs = mySprite.scene.get_adj_tiles( close[y], true );
                    
                //console.log("A* -> chk adjs");
                
                for (var yy in adjs) {
                    
                    if ( !adjs[yy].is_blocked()  &&
                         !adjs[yy].is_occupied() &&
                         !mySprite.tile_in(close, adjs[yy])
                       ) {
                    
                        //prepare costs
                        g = close[y].get_g() + mySprite.scene.get_distance( close[y], adjs[yy] );
                        h = mySprite.scene.get_distance( end, adjs[yy] );
                        
                        //if old > new, set
                        if (adjs[yy].get_g() > g) {
                            
                            //set costs
                            adjs[yy].set_costs( g, h );

                            //set parent
                            adjs[yy].set_parent( close[y] );
                            
                        }
                        
                        //if (adjs[yy].get_parent()!=null)
                            //console.log("A* -> tile @ "+adjs[yy].pos()+" was set with parent "+adjs[yy].get_parent().pos());
                        //else
                            //console.log("A* -> tile @ "+adjs[yy].pos()+" was set with parent null");

                        //open the tile if not opened yet
                        if ( !mySprite.tile_in(open, adjs[yy]) ) {
                            open.push( adjs[yy] );
                            //console.log("A* -> new frontier @ "+adjs[yy].pos()+" with index of "+adjs[yy].index);
                        }
                        
                    }// else ignore
                    
                }// end thru adjacent tiles
                
            }// end thru closed tiles
            
        }// path found
        
        //set path
        mySprite.create_path( curr );
        if(curr!=null){
        console.log("Emulated start,end: "+curr.pos()+" : "+end.pos());
        } else { console.log("current is null"); }
        console.log("Input start,end: "+a.pos()+" : "+b.pos());
        
        console.log("A* : FINISH");
        console.log("");
        
    }//END A* Star Pathfinding Algorithm
    
    //
    //  Update
    //
    
    mySprite.update_master = function() {
        
        this.events();
        this.follow_path();
        this.setImgAngle( this.rot-90 );
        this.update();
        if (selected) {
            this.selector.update();
            this.selector.setPosition( this.x,this.y );
        }
        this.x += this.n_dx;
        this.y += this.n_dy;
        
    }
    
    /*/debug
    if (mySprite.dest != null) {
        mySprite.find_path( mySprite.a_star );
        
        if (this.dest != null && this.curr != null){
            console.log("A* AFTERMATH : Actual start,end: "+this.curr.pos()+" : "+this.dest.pos());
        } else if (this.curr != null) {
            console.log("A* AFTERMATH : Actual start,end: "+this.curr.pos()+" : null");
        } else {
            console.log("A* AFTERMATH : Actual start,end: null : null");
        }
    }//end debug*/
    
    return mySprite;
    
}

  ////////////////////////////////////////////
 ///   PROJECTILE   /////////////////////////
////////////////////////////////////////////
function Projectile() {}

  ////////////////////////////////////////////
 ///   GROUP   //////////////////////////////  **// MAY NOT NEED THIS
////////////////////////////////////////////
function Group() {}

  ////////////////////////////////////////////
 ///   MENU   ///////////////////////////////
////////////////////////////////////////////
function Menu( scene,pic,w,h,is_events ) {
    
    //vars
    var eventful = is_events;
    
    //init
    mySprite = new Sprite( scene,pic,w,h );
    mySprite.setBoundAction( CONTINUE );
    mySprite.setSpeed( 0 );
    
    //set topleft of menu
    mySprite.set_topleft = function( l, t ) {
        var cx = l + mySprite.width/2;
        var cy = t + mySprite.height/2;
        mySprite.setPosition( cx,cy );
    }
    
    //return topleft position
    mySprite.get_topleft = function () {
        var l = mySprite.x - mySprite.width/2;
        var t = mySprite.y - mySprite.height/2;
        return [l,t];
    }
    
    //events meant to be overwritten
    mySprite.events = function() {
        //...
    }
    
    //check events
    mySprite.interract = function() {
        
        //if menu item has events
        if (eventful) {
            this.events();
        }
        
    }
    
    //master update function
    mySprite.update_master = function() {
        this.update();
        this.interract();
    }
    
    mySprite.print = function(){
        console.log( "x,y pos: " + myScene.get_topleft() );
    }
    
    //return
    return mySprite;
    
}

/*
    ************************************************************
    Nickel.js non essential objects:
    ************************************************************
*/

  ////////////////////////////////////////////
 /////   QUEUE   ////////////////////////////
////////////////////////////////////////////
function Queue() {
    
    this.list = [];
    
    this.in = function( obj ) {
        this.list.push(obj);
    }
    
    this.next = function() {
        return this.list[this.list.length-1];
    }
    
    this.out = function() {
        return this.list.shift();
    }
    
    this.is_empty = function() {
        return !this.list.length;
    }
    
    this.clear = function(){
        this.list = [];
    }
    
}

  ////////////////////////////////////////////
 /////   HEAP   /////////////////////////////  **// TO BE USED FOR OPTIMIZATION
////////////////////////////////////////////
function Heap() {
    
    //...not implemented yet
    
}
