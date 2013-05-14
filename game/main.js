enchant();
function rand(num){ return Math.floor(Math.random() * num) };
function range(a,b) { return a + rand(b-a); }

var scrw = 640;
var scrh = 480;

var game;

// イベントキュー
var evqueue = new Array(1000);  // FIFOでいくらでも積める。時刻が来ていたら発行される

//function Queue( )

window.onload = function() {
    game = new Game(scrw, scrh);
    game.enemy_speed = 1;
    game.preload('chara1.png', 'map0.png', "enchant_pics.png");
    game.preload("get1.wav", "get2.wav" );
    
    game.setFPS = function(fps) {
        game.fps = fps;
        game.dt = 1.0 / fps; // TODO: 実測せよ
    }
    
    game.setFPS(60);

    game.gravity = 50;
    game.accum_time = 0;
    game.rootScene.backgroundColor = '#ddd';

    game.score = 0;
    
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

    var Enemy = enchant.Class.create(Bear, {
        initialize: function(x, y) {
            Bear.call(this, x, y);
            this.addEventListener('enterframe', function() {
                this.x += game.enemy_speed;
                this.frame = [0, 1, 0, 2][Math.floor(this.age/5) % 4] + 5;
            });
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
                for(var i=0;i<game.n_crystals;i++){
                    var c = game.crystals[i];
                    if( c && c.x >= this.x - c.hitsize && c.x <= this.x + c.hitsize &&
                        c.y >= this.y - c.hitsize && c.y <= this.y + c.hitsize ) {
                        game.crystals[i] = null;
                        c.parentNode.removeChild(c);
                        game.score += c.bonus;
                        c.playBonusSound();
                        $("#score").text("SCORE: " + game.score );
                        break;
                    }

                }


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
            if( (rand(100) % 2) == 0 ) { // right
                this.x = scrw;
                this.vx *= -1;
            } else { // left
                this.x = 0;
            }

            this.image = game.assets["enchant_pics.png"];
            this.frame = range(64,66+1);

            this.bonus = 1;
            this.hitsize = 16;
            if( rand(100)%5==0) {
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

    game.onload = function() {
        game.pc = new PC( scrw/2, scrh-64 );
        game.last_crystal = 0;
        game.rootScene.addEventListener('enterframe', function() {
            game.accum_time += game.dt;
            
            var k = game.input.up;
            if(game.accum_time > game.last_crystal + 0.2 ){
                game.last_crystal = game.accum_time;
                new Crystal();
            }

//            console.log( "rl:", game.input.right, game.input.left );
            if( game.input.right ) {
                game.pc.setVX(200);
            } else if( game.input.left) {
                game.pc.setVX(-200);
            } else {
                game.pc.setVX(0);
            }
        });
    };

    game.start();
};

