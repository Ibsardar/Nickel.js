/* 
    NAME:   "Nickel.js"
    AUTH:   Ibrahim Sardar
    DESC:   simpleGame.js wrapper
    NOTE:   include this AFTER simpleGame.js in your HTML file
    
    ATTN:   Does not use prototypes since simpleGame.js doesn't use them.
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
    Nickel.js essential objects:
    
    Note - inheritance is PSEUDO from now on...
    ************************************************************
*/

  ////////////////////////////////////////////
 ///   NICKEL   /////////////////////////////
////////////////////////////////////////////
var Nickel = {
    
    /* Static
     *  - states ( 6 different )
     *  - a transparent, 8x8 image
     */
    DNE       : 0,
    STOPPED   : 1,
    MOVING    : 2,
    DEAD      : 3,
    RECRUITED : 4,
    DEPLOYED  : 5,
    NOTHING   : "nothing.png",
    
    /* Dynamic
     *  - player's score
     *  - global id counter
     */
    SCORE     : 0,
    ID        : 1000000
    
}

  ////////////////////////////////////////////
 ///   TILE   ///////////////////////////////
////////////////////////////////////////////
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
    
    //increment and set ID
    mySprite.id = ++Nickel.ID;
    
    // (public)
    mySprite.index = -1;  //index (for efficiency)
    
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
function Grid( bg_color, bg_image, map_matrix, tile_dict,
               can_x, can_y, tile_w, tile_h, tiles_w, tiles_h,
               cam_w, cam_h, bg_dim ) {
    
    
    // Behaves like inheritance, but we are actually
    // just adding functionality on to the scene object
    myScene = new Scene();
    
    //increment and set ID
    myScene.id = ++Nickel.ID;
    //init vars
    var map = [];
    var tile_dict = tile_dict;
    var bg_clr = bg_color;
    var tile_w = tile_w;
    var tile_h = tile_h;
    var tiles_w = tiles_w;
    var tiles_h = tiles_h;
    var visited_tiles = [];
    var units = [];
    var projectiles = [];
    var elements = [];
    var groups = [];
    var resources = [0,0];
    myScene.selected_units = [];
    
    //vars
    var scroll_speed = 16; //for map scrolling
    var gap = 25; //for boundaries
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
    
    //add resources for a team
    myScene.add_resources = function( res, t ) {
        resources[t-1] += res;
    }
    
    //get resources from a team
    myScene.get_resources = function( t ) {
        return resources[t-1];
    }
    
    //add an element to be managed by grid
    myScene.add_element = function( obj ) {
        elements.push(obj);
    }
    
    //add a unit to be managed by grid
    myScene.add_unit = function( obj ) {
        units.push(obj);
    }

    //add a projectile to be managed by grid
    myScene.add_projectile = function( obj ) {
        projectiles.push(obj);
    }
    
    //add a group to be managed by grid
    myScene.add_group = function( obj ) {
        groups.push(obj);
    }
    
    //remove element by id
    myScene.remove_element = function( obj ) {
        for (var i in elements) {
            if (elements[i].id == obj.id) {
                elements.splice(i,1);
            }
        }
    }
    
    //remove unit by id
    myScene.remove_unit = function( obj ) {
        for (var i in units) {
            if (units[i].id == obj.id) {
                units.splice(i,1);
            }
        }
    }
    
    //remove projectile by id
    myScene.remove_projectile = function( obj ) {
        for (var i in projectiles) {
            if (projectiles[i].id == obj.id) {
                projectiles.splice(i,1);
            }
        }
    }
    
    //remove group by id
    myScene.remove_group = function( obj ) {
        for (var i in groups) {
            if (groups[i].id == obj.id) {
                groups.splice(i,1);
            }
        }
    }
    
    //returns list of elements
    myScene.get_elements = function() {
        return elements;
    }
    
    //returns list of units
    myScene.get_units = function() {
        return units;
    }
    
    //returns list of projectiles
    myScene.get_projectiles = function() {
        return projectiles;
    }
    
    //returns list of groups
    myScene.get_groups = function() {
        return groups;
    }
    
    //update tiles, BG image
    myScene.update_map = function() {
        //background
        bg_img.update();
        //tiles
        for (x in map) {
            for (y in map[x]) {
                map[x][y].update();
            }
        }
    }
    
    //update all elements (ELEMENT MUST HAVE: 'update_master' function)
    myScene.update_elements = function() {
        //elements
        for (i in elements) {
            elements[i].update_master();
        }
    }
    
    //update all units
    myScene.update_units = function() {
        //units
        for (i in units) {
            units[i].update_master();
        }
    }
    
    //update all projectiles
    myScene.update_projectiles = function() {
        //projectiles
        for (i in projectiles) {
            projectiles[i].update_master();
        }
    }
    
    //update all groups
    myScene.update_groups = function() {
        //groups
        for (i in groups) {
            groups[i].update_master();
        }
    }
    
    //event handler
    myScene.update_events = function() {
        //if mouse was pressed and let go
        document.onmouseup = function( event ) {
            mouse_upped = event.button+1;
            var mx = myScene.getMouseX();
            var my = myScene.getMouseY();
            //log it
            if (mouse_upped==1){
                console.log("left mouse up!");
                if (!event.ctrlKey) {
                    myScene.unselect_all();
                }
            }
            else if(mouse_upped==2){
                console.log("middle mouse up!");
            }
            else if(mouse_upped==3){
                 console.log("right mouse up!");
                
                var sprite = myScene.get_tile_at( mx,my );
                var selects = myScene.selected_units;
                for (u in selects) {
                    if (selects[u].curr != null) {
                        selects[u].dest = sprite;
                        selects[u].path = [];
                        selects[u].find_path( selects[u].a_star );
                    }
                }
                
            }
            else{
                console.log("<unkown> mouse up!");
            }
        }
        //if canvas was right clicked, ignore context menu
        myScene.canvas.oncontextmenu = function( event ) {
            return false;
        }
    }
    
    //resets variables as needed to properly enter the next frame
    myScene.prepare = function(){
        mouse_upped = 0;
    }
    
    //update
    myScene.update = function () {
        myScene.update_events();
        myScene.update_map();
        myScene.update_projectiles();
        myScene.update_units();
        myScene.update_elements();
        myScene.update_groups();
    }
    
    //gets width of tile
    myScene.get_tile_w = function() {
        return tile_w;
    }
    
    //gets height of tile
    myScene.get_tile_h = function() {
        return tile_h;
    }
    
    //gets the tile at the mouse position
    myScene.get_tile_at = function ( x,y ){
        for (i in map) {
            for (j in map[i]) {
                if ( myScene.point_collide( map[i][j],x,y ) ) {
                    return map[i][j];
                }
            }
        }
        return null;
    }
    
    //returns if a point is in a sprite
    myScene.point_collide = function ( spr, x, y ){
        
        //vars
        var l = spr.x-spr.width/2;  //left
        var t = spr.y-spr.height/2; //top
        var r = spr.x+spr.width/2;  //right
        var b = spr.y+spr.height/2; //bottom
        
        //check
        if ( x > l &&
             x < r &&
             y > t &&
             y < b ) {
            console.log("tile at " +spr.get_xpos()+ ", " +spr.get_ypos()+ " selected: action");
            return true;
        }
        return false;
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
        //units
        for (u in units){
            units[u].y += dify;
        }
        //projectiles
        for (p in projectiles){
            projectiles[p].y += dify;
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
        //units
        for (u in units){
            units[u].y += dify;
        }
        //projectiles
        for (p in projectiles){
            projectiles[p].y += dify;
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
        //units
        for (u in units){
            units[u].x += difx;
        }
        //projectiles
        for (p in projectiles){
            projectiles[p].x += difx;
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
        //units
        for (u in units){
            units[u].x += difx;
        }
        //projectiles
        for (p in projectiles){
            projectiles[p].x += difx;
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
        //units
        for (e in units){
            units[e].setMoveAngle( deg );
            units[e].setSpeed( speed );
        }
        //projectiles
        for (e in projectiles){
            projectiles[e].setMoveAngle( deg );
            projectiles[e].setSpeed( speed );
        }
        
    }
    
    //check events *** NEEDS FIXiNG
    myScene.interract = function() {
        
        //gather any useful numbers
        var mx = myScene.getMouseX();
        var my = myScene.getMouseY();
        var cx = myScene.width/2;
        var cy = myScene.height/2;
        
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
    
    //for debugging *** NEEDS AN UPDATE
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
    
    //unselects all units from grid
    myScene.unselect_all = function(){
        for(i in myScene.selected_units){
            myScene.selected_units[i].unselect2();
        }
        myScene.selected_units = [];
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
    
    //true if (x1,y1) coordinate is in the given radius (of center x0,y0)
    myScene.in_radius = function( x0,y0,r0, x1,y1 ) {
        
        var dx = x1-x0;
        var dy = y1-y0;
        var c = Math.sqrt((dx*dx) + (dy*dy));
        if (c > r0)
            return false;
        return true;
        
    }
    
    //get list of adjacent tiles (brute force)
    myScene.get_adj_tiles = function( tile, incl_diag=true) {
        
        var x = tile.get_xpos();
        var y = tile.get_ypos();
        var incld = incl_diag;
        var adjs = [];
        
        
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
    
    //get nearest tile
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
        
        //log
        console.log("getting nearest tile from "+start.pos());
        
        //init
        myScene.unvisit_all();
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
function Unit( scene, data, s_data, tile, t, hp=100 ) {
    
    //init label
    var lbl_health = new Text(scene,"","12px Courier New",
                              "white" );
    lbl_health.width = 80;
    
    //init
    mySprite = new Sprite( scene,data[0],data[1],data[2] );
    mySprite.setBoundAction( CONTINUE );
    mySprite.setSpeed( 0 );
    
    //increment and set ID
    mySprite.id = ++Nickel.ID;
    
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
    mySprite.dest = null;
    mySprite.path = [];
    // - state
    mySprite.state = Nickel.STOPPED;
    mySprite.group_state = Nickel.DNE;
    mySprite.team  = t;
    // - movement
    mySprite.n_dx = 0;
    mySprite.n_dy = 0;
    mySprite.max_rot = 8;
    mySprite.energy = 8;
    mySprite.rot = mySprite.getImgAngle() + 90;
    mySprite.dir = mySprite.getMoveAngle();
    mySprite.turned = false;
    // - combat
    mySprite.weapons = [];
    mySprite.health = hp;
    mySprite.armor = 1; //incoming damage multiplier
    // - other
    mySprite.point_worth = 0;
    
    
    
    // sets points this unit is worth
    mySprite.set_worth = function( pts ) {
        this.point_worth = pts;
    }
    
    // gets self's team
    mySprite.get_team = function () {
        
        return this.team;
        
    }
    
    // sets self's team
    mySprite.set_team = function ( t ) {
        
        this.team = t;
        
    }
    
    // gets self's state
    mySprite.get_state = function () {
        
        return this.state;
        
    }
    
    // sets self's state
    mySprite.set_state = function ( s ) {
        
        this.state = s;
        
    }
    
    // gets self's group state
    mySprite.get_group_state = function () {
        
        return this.group_state;
        
    }
    
    // sets self's group state
    mySprite.set_group_state = function ( s ) {
        
        this.group_state = s;
        
    }
    
    //places self at a tile's center
    mySprite.place_at_tile = function( tile ) {
        this.setPosition(tile.x,tile.y);
        this.x = tile.x;
        this.y = tile.y;
        tile.occupy();
        tile.set_team( this.team );
    }
    
    //if unit is larger than 1 tile
    // - places uniat center of all tiles
    // - tiles MUST be in order! (NW to SE, left to right)
    // - type: 1=occupy, 2=block, else=none
    mySprite.place_at_tiles = function( tiles, type=1 ) {
        
        //tmp vars
        var t = tiles;
        var cx = (t[t.length-1].x - t[0].x)/2 + t[0].x;
        var cy = (t[t.length-1].y - t[0].y)/2 + t[0].y;
        
        //block or occupy or just set the team
        for(i in t){
            if(type==1){ [i].occupy(); }
            if(type==2){ [i].block(); }
            t[i].set_team(this.team);
        }
        
        //place at center
        this.x = cx;
        this.y = cy;
    }
    
    //init position
    mySprite.place_at_tile( mySprite.curr );
    
    //
    //  Combat
    //
    
    // add weapon to self's weapon list 
    mySprite.add_weapon = function( data, movement, radius=10, spread=0, rate=1, life=10, dmg=0, amt=1, thru=false, chance=100, speed_spread=0) {
        
        alarm = new Timer();
        alarm.start();
        w = [ alarm,data,movement,radius,spread,rate,life,dmg,amt,thru,chance,speed_spread ];
        this.weapons.push( w );
        
    }
    
    // do any attacks if needed
    mySprite.update_combat = function() {
        
        // Weapon Params by index:
        //   ~~~~
        //    0: alarm
        //    1: DATA list (w,h,img)
        //    2: MOVEMENT list (spd,acc,max_rot)
        //    3: radius in tiles
        //    4: spread
        //    5: rate in sec
        //    6: life in sec
        //    7: dmg
        //    8: amt
        //    9: thru?
        //   10: chance to fire
        //   11: speed spread
        //   ~~~~
        
        // for each weapon
        for (var i in this.weapons) {
            
            // rename
            var w = this.weapons[i];

            // check if elapsed time >= rate
            if (w[0].getElapsedTime() >= w[5]) {
                
                // reset alarm
                w[0].reset();
                
                // find closest enemy in radius
                var span = (this.scene.get_tile_w() + this.scene.get_tile_h()) / 2;
                var radius_in_pixels = w[3] * span;
                var target = this.find( radius_in_pixels );
                
                // only start attacking if there are enemies
                if (target != null) {
                    
                    // amt new projectiles using data,movement,dmg,life,thru
                    for (var j=0;j<w[8];j++) {
                        
                        var r = Math.random()*100;
                        //console.log(r+"<===>"+w[10]);
                        if (r < w[10]) {
                            
                            var mv_new = [];
                            mv_new[0] = w[2][0];
                            mv_new[1] = w[2][1];
                            mv_new[2] = w[2][2];
                            
                            if (w[11]!=0) {
                                //get a random spead within the speed spread
                                var min = w[2][0] - w[11]/2;
                                var max = w[2][0] + w[11]/2;
                                mv_new[0] = Math.floor(Math.random() * (max - min + 1)) + min;
                            }

                            //  turn projectile to target
                            //  - if amt>1, then uniformly distribute angle to target:
                            //    -> spread 0-180 <=> accuracy 0-100
                            //    -> pick random angle within spread for each bullet
                            var p = new Projectile( this.scene,w[1],mv_new,this.team,w[6],w[7],w[9] );
                            p.setPosition( this.x,this.y );
                            p.turn_to( target, w[4], true );

                            //add projectile to update list
                            this.scene.add_projectile( p );
                        
                        }

                    }
                
                }
                
            }

        }
        
        // health label
        lbl_health.set_text(this.health);
        lbl_health.setPosition( this.x,this.y+(this.height/2) );
        
    }
    
    // returns: - closest unit within radius on another team
    //          - null if none found
    //          - enemy units have priority over structures
    mySprite.find = function( radius ) {
        
        // temp
        var tmp_u = null;
        var tmp_d = 9999999;
        
        // get unit list
        var units = this.scene.get_units();
        
        // loop thru all units
        for (var i in units) {
            
            // rename
            var u = units[i];

            // if unit on other team
            if (u.team != this.team) {

                // if unit in radius
                var d = this.distanceTo(u);
                if ( d < tmp_d && d <= radius ) {

                    // record
                    tmp_u = u;
                    tmp_d = d;
                    
                }

            }

        }
        
        // look for structure if no unit found
        if (tmp_u == null) {
            
            // get element list
            var elems = this.scene.get_elements();

            // loop thru all units
            for (var i in elems) {

                // rename
                var e = elems[i];

                // if unit on other team
                if (e.team != this.team) {

                    // if unit in radius
                    var d = this.distanceTo(e);
                    if ( tmp_d > d && d <= radius ) {

                        // record
                        tmp_u = e;
                        tmp_d = d;

                    }

                }

            }
            
        }
        
        // return nearest
        return tmp_u;
        
    }
    
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
    
    //if you are using this version,
    //   make sure to handle the Grid's
    //   selecetd unit list properly
    mySprite.unselect2 = function(){
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
            
            if (this.team == 1) {
                if (!selected){
                    this.select();
                } else {
                    this.unselect();
                }
            }
            
        } else if (click==3){
            
            console.log("unit clicked! : action");
            
        }
        
    }
    
    //
    //  Pathfinding
    //
    
    // makes a unit go to a certain tile
    mySprite.go_to = function( tile ) {
        
        if (this.curr != null) {
            
            this.dest = tile;
            this.path = [];
            this.find_path( this.a_star );
            
        }
        
    }
    
    // check if this has center in another sprite with offset t
    mySprite.center_in = function( elem, t=0 ){
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
                //console.log("fip -> path complete! @ "+this.curr.pos());
                return;
            }
        }
        
        //recalculate new destination if unavailable
        if ( this.dest.is_blocked() || this.dest.is_occupied() ){
            //console.log("fip -> dest unavailable");
            this.dest = this.scene.get_nearest_tile(this.dest,true,false,false);
            //console.log("fip -> new destination calculated: " + this.dest.pos());
        }
    
        //for clearity
        start_tile = this.curr;
        end_tile   = this.dest;
    
        // Actions of "algorithm" function:
        // - update current unit's path list
        // - path list format:
        //   - [ next, next of next, ... end ]
        algorithm( start_tile,end_tile,this );
    
    }
    
    // check if any tile in list is blocked or occupied
    mySprite.is_clear = function( list ) {
        var dbg = [];
        for(t in list){
            if (list[t].is_occupied() || list[t].is_blocked()){
                //return false;
                dbg.push(list[t].pos());
            }
        }
        if (dbg.length == 0) { return true; }
        return false;
    }
    
    // move to next tile in path list
    mySprite.follow_path = function() {
        
        //remove current tile from path
        if (this.path[0] == this.curr) {
            this.path.shift();
        }
        
        // if dead or non-existent: disregard
        if (this.state == Nickel.DEAD || this.state == Nickel.DNE){
            return;
        }
    
        // if path empty:
        // - if moving: stop
        else if (this.path.length == 0) {
            if (this.state == Nickel.MOVING){
                this.stop();
                this.state = Nickel.STOPPED;
            }
        }
        
        // if path.len more than 0:
        // - if stopped: move
        //   - move if not reached
        else if (this.path.length > 0){
            
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
                    if (this.path[0].is_blocked() || this.path[0].is_occupied()) {
                        if (this.center_in( this.path[0], this.path[0].width/2 )) {
                            var t = this.scene.get_nearest_tile(this.path[0],true,false,false);
                            this.path[0] = t;
                            if (this.path.length==1) {
                                this.dest = t;
                            }
                            if (t!=null) {
                                this.turned = false;
                            }
                        }
                    } else {
                        //set
                        this.curr = this.path.shift();
                        this.curr.occupy();
                        this.curr.set_team( this.team );
                    }
                    //stop
                    this.state = Nickel.STOPPED;
                    this.stop();
                    
                } else {
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
    mySprite.create_path = function ( t, u ) {
        if (t==null){
            console.log("cp -> ERROR: null input");
            return;
        }
        u.path.unshift( t );
        var par = t.get_parent();
        if (par == null) {
            return;
        } else {
            u.create_path( par, u );
        }
    }
    
    //the typical A* Pathfinding Algorithm
    // note: algorithm is dynamic
    // warning: EXTREMELY SUBOPTIMAL
    mySprite.a_star = function( a,b,u ) {
        
        //console.log("");
        //console.log("A* : BEGIN");
        
        //ABORT if dest is blocked/occupied
        if (b.is_blocked() || b.is_occupied()) {
            console.log("A* -> destination unavailable");
            return;
        }
        
        //vars
        var me=u;
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
        var exists; // track if closed list's adjacents exists
        
        //init
        myScene.rejuvinate_all();
        curr = a;
        end = b;
        open.push( a );
        g = 0;
        h = mySprite.scene.get_distance( a, end );
        curr.set_costs( g, h );
        iters = 0;
        exists = false;
        
        //loop until path is found
        while ( true ) {
            
            //counter
            iters++;
        
            //get lowest F cost tile
            var tmp_cost = 9999999;
            for (var x in open) {
                if (open[x].get_f() < tmp_cost) {
                    curr = open[x];
                    tmp_cost = open[x].get_f();
                }
            }

            // close current tile (shift all the other tiles)
            for(ii in open){
                if (open[ii].get_xpos() == curr.get_xpos())
                    if (open[ii].get_ypos() == curr.get_ypos())
                        open.splice( ii, 1 );
            }
            close.push( curr );
            
            //check if current is end tile
            if (curr.get_xpos() == end.get_xpos()){
                if (curr.get_ypos() == end.get_ypos()){
                    break;
                }
            }
            
            //check if too many iters
            if (iters > 200) {
                console.log("A* -> ERROR: ASTAR HAS TIMED-OUT");
                break;
            }
            
            //reset adjacent check
            exists = false;
            
            //loop through closed tiles
            for (var y in close) {
                
                //loop through adjacent tiles
                //  - include diagonals
                //  - exclude blocked
                //  - exclude occupied
                //  - exclude closed
                adjs = me.scene.get_adj_tiles( close[y], true );
                
                for (var yy in adjs) {
                    
                    if ( !adjs[yy].is_blocked()  &&
                         !adjs[yy].is_occupied() &&
                         !me.tile_in(close, adjs[yy])
                       ) {
                        
                        //indicate an adjacent exists
                        exists = true;
                    
                        //prepare costs
                        g = close[y].get_g() + me.scene.get_distance( close[y], adjs[yy] );
                        h = me.scene.get_distance( end, adjs[yy] );
                        
                        //if old > new, set
                        if (adjs[yy].get_g() > g) {
                            
                            //set costs
                            adjs[yy].set_costs( g, h );

                            //set parent
                            adjs[yy].set_parent( close[y] );
                            
                        }

                        //open the tile if not opened yet
                        if ( !me.tile_in(open, adjs[yy]) ) {
                            open.push( adjs[yy] );
                        }
                        
                    }// else ignore
                    
                }// end thru adjacent tiles
                
            }// end thru closed tiles
            
            //abort if no adjacent tiles
            if (!exists) {
                console.log("A* : ABORT");
                //console.log("");
                return;
            }
            
        }// path found
        
        //set path
        me.create_path( curr, me );
        
        //console.log("A* : FINISH");
        //console.log("");
        
    }//END A* Star Pathfinding Algorithm
    
    //
    //  "Destructor"
    //
    
    //removes references of self from everywhere
    mySprite.kill = function() {
        
        //remove from update list
        this.scene.remove_unit( this );
        
        //clear tile
        if (this.curr!=null)
            this.curr.clear_all();
        
    }
    
    //
    //  Update
    //
    
    mySprite.update_master = function() {
        
        this.events();
        this.update_combat();
        this.follow_path();
        this.setImgAngle( this.rot-90 );
        this.update();
        if (selected) {
            this.selector.update();
            this.selector.setPosition( this.x,this.y );
        }
        lbl_health.update_master();
        this.x += this.n_dx;
        this.y += this.n_dy;
        //check death condition
        if (this.health <= 0) {
            this.kill();
        }
        
    }
    
    return mySprite;
    
}

  ////////////////////////////////////////////
 ///   PROJECTILE   /////////////////////////
////////////////////////////////////////////
function Projectile( scene, data, movement=[4,0,0], t=0, life=10, dmg=0, thru=false ) {
    
    // - init
    mySprite = new Sprite( scene,data[0],data[1],data[2] );
    mySprite.setBoundAction( CONTINUE );
    // - movement
    mySprite.dir = mySprite.getMoveAngle();
    mySprite.rot = mySprite.getImgAngle() + 90;
    mySprite.max_rot = movement[2];
    mySprite.n_dx = 0;
    mySprite.n_dy = 0;
    mySprite.accel = movement[1];
    mySprite.energy = movement[0];
    mySprite.turned = false;
    // - other
    mySprite.team = t;
    mySprite.lifetime = life; //seconds
    mySprite.damage = dmg;
    mySprite.immortal = thru;
    mySprite.armor = 1; //incoming damage multiplier
    mySprite.timer = new Timer();
    mySprite.health = 1;
    mySprite.destructive = false;
    mySprite.point_worth = 0;
    
    // - start timer
    mySprite.timer.start();
    
    // - increment and set ID
    mySprite.id = ++Nickel.ID;
    
    // sets points this projectile is worth
    mySprite.set_worth = function( pts ) {
        this.point_worth = pts;
    }
    
    //takes in x,y displacement
    mySprite.move = function ( vec ) {
        this.n_dx = vec[0];
        this.n_dy = vec[1];
    }
    
    //stops displacing self
    mySprite.stop = function () {
        this.n_dx = 0;
        this.n_dy = 0;
    }

    // changes how fast self can turn
    mySprite.set_turn_rate = function (rate) {
        this.max_rot = rate;
    }

    // gets the current x,y displacement
    mySprite.get_vec = function () {

        var rads = this.dir * Math.PI / 180;
        var vec = [];

        vec[0] = Math.cos(rads) * this.energy;
        vec[1] = Math.sin(rads) * this.energy;

        return vec;
    }
    
    // turns to sprite instantly or gradually
    mySprite.turn_to = function( elem, spread, instant=true ) {
        
        //vars
        var incline, turn;
        var ang;
        var dx, dy;
        
        //determine shortest turn angle
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
        
        ang = this.rot;
        
        //if instant, turn the full turn, spread applies
        if (instant) {
            ang += turn;
            //get random angle within spread
            var min = ang - spread/2;
            var max = ang + spread/2;
            ang = Math.floor(Math.random() * (max - min + 1)) + min;
            //change control variables
            this.rot = ang;
            this.dir = ang+90;
            this.turned = true;
            return;
        }
        
        //restrict from turning immediately
        if (Math.abs(turn) > this.max_rot) {
            this.turned = false;
            if (turn>0){ ang+=this.max_rot; }
            else if (turn<0){
                ang-=this.max_rot;
            }
        } else if (Math.abs(turn) < this.max_rot) {
            ang += turn;
            this.turned = true;
        } else {
            this.turned = true;
        }
        
        //set rotation and direction seperately
        this.rot = ang;
        this.dir = ang+90;
        
    }
    
    // toggle if self will destroy other team's bullets
    mySprite.toggle_destruction = function() {
        if (this.destructive) {
            this.destructive = false;
        }else{
            this.destructive = true;
        }
    }
    
    // to be overriden by user for additional events
    mySprite.on_enemy_hit = function( spr ) {
        // 5pts default for hitting an enemy
        if (this.team == 1) {
            Nickel.SCORE += 5;

            // add specific pts, resources for killing an enemy
            if (spr.health <= 0) {
                Nickel.SCORE += spr.point_worth * 2;
                this.scene.add_resources( spr.point_worth, this.team );
            }
        }
    }
    
    // damage a sprite who has a health variable
    //   and a team other than self's
    mySprite.damage_sprite = function( spr ) {
        
        if ( spr.health != undefined ) {
            if ( spr.team != this.team ) {
                var dmg = Math.ceil( spr.armor * this.damage * 10 ) / 10;
                if (dmg<=0) { return; }
                spr.health = spr.health - dmg;
                spr.health = spr.health.toFixed(1);
                if (!this.immortal) {
                    this.kill();
                }
                this.on_enemy_hit( spr );
            }
        }
        
    }
    
    //events associated with projectiles
    mySprite.events = function() {
        
        var u = this.scene.get_units();
        var e = this.scene.get_elements();
        var p = this.scene.get_projectiles();
        
        // for each unit
        for (var i in u) {
            if ( this.collidesWith(u[i]) ){
                this.damage_sprite(u[i]);
            }
        }
        
        // for each element
        for (var i in e) {
            if ( this.collidesWith(e[i]) ){
                this.damage_sprite(e[i]);
            }
        }
        
        // for each projectile if self is destructive
        if (this.destructive) {
            for (var i in p) {
                if ( this.collidesWith(p[i]) ){
                    this.damage_sprite(p[i]);
                }
            }
        }
    }
    
    //removes references of self from everywhere
    mySprite.kill = function() {
        
        //remove from update list
        this.scene.remove_projectile( this );
        
    }
    
    // main update
    mySprite.update_master = function() {
        
        this.events();
        this.setImgAngle( this.rot-90 );
        this.update();
        this.energy += this.accel;
        this.move( this.get_vec() );
        this.x += this.n_dx;
        this.y += this.n_dy;
        this.lifetime
        // delete if lifetime's up or speed<=0 or no health
        var et = this.timer.getElapsedTime();
        if (this.energy <= 0 ||
            this.health <= 0 ||
            et >= this.lifetime) {
            this.kill();
        }
        
    }
    
    return mySprite;
    
}

  ////////////////////////////////////////////
 ///   GROUP   //////////////////////////////
////////////////////////////////////////////
function Group( scene, team=1, coords=[0,0], cap=1, max_wait=1, call_interval=1 ) {
    /*  This object is like a recruiting station.
     *  Major functions are recruit and deploy.
     *  Holds a waiting list and a squad list of sub-squads
     *  Has a hold & target position on map
     *  User can set wait list or squad size capacity.
     *  Checks & removes null(dead) units from group *** NOT YET IMPLEMENTED
     *  WARNING: May Cause Memory Leak After Some Time! (not verified)
     */
    
    //vars
    this.scene = scene;
    this.team = team;
    this.tile = scene.get_tile(coords);
    this.cap = cap; // deployment size
    this.interval = call_interval; // seconds before next recruitment
    this.max_wait = max_wait; // of waiting units
    this.targets = [];
    this.squads = [];   // 2d array
    this.waiting = new Queue();
    this.alarm = new Timer();
    
    //increment and set ID
    this.id = ++Nickel.ID;
    
    //begin timer
    this.alarm.start();
    
    //assigns this group to a tile
    this.set_tile = function( x,y ) {
        this.tile = this.scene.get_tile([x,y]);
    }
    
    //sets the maximum # of squad units
    this.set_squad_capacity = function( n ) {
        this.cap = n;
    }
    
    //sets the maximum # of waiting units
    this.set_wait_capacity = function( n ) {
        this.max_wait = n;
    }
    
    //adds a target
    this.add_target = function( t ) {
        this.targets.push(t);
    }
    
    //adds a target at a tile location
    this.add_target_at = function( x,y ) {
        this.targets.push( this.scene.get_tile([x,y]) );
    }
    
    //clears all targets
    this.clear_targets = function( t ) {
        this.targets = [];
    }
    
    //get a random target from targets
    this.get_target = function() {
        
        var max = this.targets.length;
        var rnd = Math.floor(Math.random() * (max - 1));
        return  this.targets[rnd];
        
    }
    
    //checks if a unit is ready for recruitment
    this.is_ready = function( unit ) {
        
        //check if same team
        if ( unit.get_team() != this.team ) {
            
            return false;
            
        }
        
        //check if not stopped
        if ( unit.get_state() != Nickel.STOPPED ) {
            
            return false;
            
        }
        
        //check if waiting
        if ( unit.get_group_state() == Nickel.RECRUITED ) {
            
            return false;
            
        }
        
        //check if in a squad
        if ( unit.get_group_state() == Nickel.DEPLOYED ) {
            
            return false;
            
        }
        
        //else, it must be ready
        return true;
        
    }
    
    //deploys 'cap' number of waiting units
    this.deploy = function() {
        
        //check queue
        if (this.waiting.count() >= this.cap ) {
            
            //make squad
            var squad = [];
            //deploy 'cap' number of waiting units
            for (var i=0;i<this.cap;i++) {
                
                //unit stops waiting
                var unit = this.waiting.out();
                //deploy unit
                unit.go_to( this.get_target() );
                //update group state
                unit.set_group_state( Nickel.DEPLOYED );
                //add unit squad
                squad.push( unit );
                
            }
            //add squad
            this.squads.push( squad );
            
        }
        
    }
    
    //periodically recruits an on-team unit who is not in a squad or is waiting
    this.recruit = function() {
        
        //check interval
        if (this.alarm.getTimeElapsed() >= this.interval) {
            
            //if there is room for more recruits
            if (this.waiting.count() < this.max_wait) {
            
                //get all units
                var units = this.scene.get_units();
                //recruit one unit
                for (var i in units) {

                    //check if unit ready
                    if ( this.is_ready(units[i]) ) {
                        
                        //recruit unit
                        units[i].go_to( this.tile );
                        //update group state
                        units[i].set_group_state( Nickel.RECRUITED );
                        //unit starts waiting
                        this.waiting.in( units[i] );
                        //reset time elapsed
                        this.alarm.reset();
                        //recruitment is complete
                        return;

                    }

                }
                
            }
            
        }
        
    }
    
    //main update
    this.update_master = function() {
        this.recruit();
        this.deploy();
    }

}

  ////////////////////////////////////////////
 ///   MENU   ///////////////////////////////
////////////////////////////////////////////
function Menu( scene,pic,w,h,is_events ) {
    
    //vars
    var eventful = is_events;
    var active = false;
    
    //init
    mySprite = new Sprite( scene,pic,w,h );
    mySprite.setBoundAction( CONTINUE );
    mySprite.setSpeed( 0 );
    
    //increment and set ID
    mySprite.id = ++Nickel.ID;
    
    //activate menu object
    mySprite.activate = function() {
        active = true;
    }
    
    //deactivate menu object
    mySprite.deactivate = function() {
        active = false;
    }
    
    //am I active?
    mySprite.is_active = function() {
        return active;
    }
    
    //set topleft of menu
    mySprite.set_topleft = function( l, t ) {
        var cx = l + this.width/2;
        var cy = t + this.height/2;
        this.setPosition( cx,cy );
    }
    
    //return topleft position
    mySprite.get_topleft = function () {
        var l = this.x - this.width/2;
        var t = this.y - this.height/2;
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
        console.log( "x,y pos: " + mySprite.get_topleft() );
    }
    
    //return
    return mySprite;
    
}

  ////////////////////////////////////////////
 ///   TEXT   ///////////////////////////////
////////////////////////////////////////////
function Text( scene,txt,fnt,clr ) {
    
    //init
    mySprite = new Sprite( scene,Nickel.NOTHING,8,8 );
    mySprite.setBoundAction( CONTINUE );
    mySprite.setSpeed( 0 );
    // - text props
    var font;
    var color;
    var text;
    var h_align = "center";
    var v_align = "middle";
    
    //increment and set ID
    mySprite.id = ++Nickel.ID;
    
    //sets the text (string,font,color)
    mySprite.set_text = function( str ) {
        text = str;
    }
    
    //sets the alignment relative to the horizontal text position
    mySprite.set_h_align = function( align ) {
        h_align = align;
    }
    
    //sets the alignment relative to the vertical text position
    mySprite.set_v_align = function( align ) {
        v_align = align;
    }
    
    //sets properties of text
    mySprite.set_properties = function( f,c ) {
        font = f;
        color = c;
    }
    
    // - init text
    mySprite.set_text(txt);
    mySprite.set_properties(fnt,clr);
    
    //draws the text
    mySprite.show_text = function() {
        this.context.font = font;
        this.context.fillStyle = color;
        this.context.textAlign = h_align;
        this.context.textBasline = v_align;
        this.context.fillText(text, this.x, this.y, this.width);
    }
    
    //main update
    mySprite.update_master = function() {
        this.update();
        if (this.visible) {
            this.show_text();
        }
    }
    
    //return text object
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
    
    this.count = function() {
        return this.list.length;
    }
    
    this.clear = function(){
        this.list = [];
    }
    
}

  ////////////////////////////////////////////
 /////   HEAP   /////////////////////////////
////////////////////////////////////////////
function Heap() {
    
    //...not implemented yet
    
}
