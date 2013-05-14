enchant();
function rand(num){ return Math.random() * num };
function range(a,b) { return a + rand(b-a); }
function irange(a,b) { return Math.floor(a + rand(b-a) ); }

var scrw = 640;
var scrh = 480;

var game;

// イベントキュー
function Queue() { this.__a = new Array();}
Queue.prototype.enqueue = function(o) { this.__a.push(o); }
Queue.prototype.dequeue = function() {
	if( this.__a.length > 0 ) { 	return this.__a.shift(); }
	return null;
}
Queue.prototype.peek = function(ind) { return this.__a[ind]; }
Queue.prototype.size = function() { 	return this.__a.length; } 


var queue = new Queue();


function DelayedEvent( name, fire_at ) {
    var e = {}
    e.name = name;
    e.fire_at = fire_at;
    return e;
}

function checkGetCrystal( x, y ) {
    for(var i=0;i<game.n_crystals;i++){
        var c = game.crystals[i];
        if( c && c.x >= x - c.hitsize && c.x <= x + c.hitsize &&
            c.y >= y - c.hitsize && c.y <= y + c.hitsize ) {
            game.crystals[i] = null;
            c.parentNode.removeChild(c);
            game.score += c.bonus;
            c.playBonusSound();
            $("#score").text("SCORE: " + game.score );
            break;
        }
    }
}



window.onload = function() {
    game = new Game(scrw, scrh);

    game.preload('chara1.png', 'map0.png', "enchant_pics.png");
    game.preload("get1.wav", "get2.wav" );

    
    game.setFPS = function(fps) {
        game.fps = fps;
        game.dt = 1.0 / fps; // TODO: 実測せよ
    }
    game.setMinDelay = function(d) {        game.delay_min = d;  }
    game.setMinDelay(0);
    game.setSpikeDelay = function(d) {        game.delay_spike = d; }
    game.setSpikeDelay(0);
    game.setGhost = function(flg) {  game.show_ghost = flg; }
    game.setGhost(true);
    game.setLocalHit = function(flg) { game.local_hit = flg; }
    game.setLocalHit(false);
    game.setFPS(60);

    game.gravity = 50;
    game.accum_time = 0;
    game.rootScene.backgroundColor = '#888';

    game.score = 0;

    game.spike_at = 0;
    
    var Bear = enchant.Class.create(enchant.Sprite, {
        initialize: function(x, y) {
            enchant.Sprite.call(this, 32, 32);
            this.x = x;
            this.y = y;
            this.image = game.assets['chara1.png'];
            this.frame = 5;
            game.rootScene.addChild(this);
        }
    });


    var Treasure = enchant.Class.create(enchant.Sprite, {
        initialize: function(x, y) {
            enchant.Sprite.call(this, 16, 16);
            this.x = x;
            this.y = y;
            this.image = game.assets['map0.png'];
            this.frame = 0;
            game.rootScene.addChild(this);
        }
    });

    var PC = enchant.Class.create( Bear, {
        initialize: function(x,y) {
            Bear.call(this,x,y);
            this.vx = 0;
            this.setVX = function(vx) { this.vx = vx; }
            this.addEventListener('enterframe', function() {
                this.x += this.vx * game.dt;
                if( this.x < 0 ) this.x = 0;
                if( this.x > scrw-32 ) this.x = scrw-32;
            });
        }
    });

    var Ghost = enchant.Class.create( PC, {
        initialize: function(x,y) {
            PC.call(this,x,y);
            this.opacity = 0.2;

            this.addEventListener('enterframe', function() {
                checkGetCrystal( this.x, this.y );
            });
        }
    });
    

    
    game.n_crystals = 200;
    game.crystals = new Array(game.n_crystals);
    var Crystal  = enchant.Class.create( enchant.Sprite, {
        initialize: function() {
            enchant.Sprite.call(this,16,16);            
            this.vy = range(-100,-5);
            this.y = rand(scrh/2,scrh);
            this.vx = range(40,200);                            
            if( (irange(0,100) % 2) == 0 ) { // right
                this.x = scrw;
                this.vx *= -1;
            } else { // left
                this.x = 0;
            }

            this.image = game.assets["enchant_pics.png"];
            this.frame = irange(64,66+1);

            this.bonus = 1;
            this.hitsize = 16;
            if( irange(0,100)%5==0) {
                this.scale(2,2);
                this.bonus *= 20;
                this.hitsize = 32;
            }
            this.playBonusSound = function() {
                if( this.bonus == 1 ) {
                    game.assets['get1.wav'].play();
                } else {
                    game.assets['get2.wav'].play();
                }
            }
            this.addEventListener( 'enterframe', function() {
                this.x += this.vx * game.dt;
                this.y += this.vy * game.dt;
                this.vy += game.gravity * game.dt;
                if( this.y > scrh ) {
                    for(var i=0;i<game.n_crystals;i++){
                        if( game.crystals[i] == this ) {
                            game.crystals[i] = null;
                            break;
                        }
                    }
                    this.parentNode.removeChild(this);
                }
            });
            for(var i=0;i< game.n_crystals; i++ ) {
                if( game.crystals[i] == null ){
                    game.crystals[i] = this;
                    break;
                }
            }
            game.rootScene.addChild(this);            
        }
        
    });

    game.sync = function() {
        game.ghost.x = game.pc.x;

    }
    game.onload = function() {
        game.pc = new PC( scrw/2, scrh-64 );
        game.ghost = new Ghost( scrw/2, scrh-64 );
        game.last_crystal = 0;
        game.rootScene.addEventListener('enterframe', function() {
            game.accum_time += game.dt;
            
            var k = game.input.up;
            if(game.accum_time > game.last_crystal + 0.2 ){
                game.last_crystal = game.accum_time;
                new Crystal();
            }

            
            var delay = game.delay_min;
            if( game.accum_time > game.spike_at ) {
                delay += game.delay_spike;
                game.spike_at = game.accum_time + range(0.5,3);
            }

            var base_vx = 200;
            if( game.input.right ) {
                queue.enqueue( DelayedEvent( "right", game.accum_time + delay ) );
                game.pc.setVX(base_vx);
            } else if( game.input.left) {
                queue.enqueue( DelayedEvent( "left", game.accum_time + delay ) );
                game.pc.setVX(-base_vx);                
            } else {
                if( game.pc.vx != 0 ) {
                    queue.enqueue( DelayedEvent( "stop", game.accum_time + delay ) );
                    game.pc.setVX(0);
                }
            }


            // イベント消化
            var top = queue.peek(0);
            if( top != null && game.accum_time >= top.fire_at ) {
                queue.dequeue();
                if(top.name == "right") {
                    game.ghost.setVX(base_vx);                    
                } else if( top.name == "left" ) {
                    game.ghost.setVX(-base_vx);
                } else if( top.name == "stop" ) {
                    game.ghost.setVX(0);
                }
            }

            if( game.show_ghost ) {
                game.ghost.opacity = 0.2;
            } else {
                game.ghost.opacity = 0;
            }

            // ローカルヒット
            if( game.local_hit ) {
                checkGetCrystal( game.pc.x, game.pc.y );
            }

            
        });
    };

    game.start();
};

