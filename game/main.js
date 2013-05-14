enchant();
function rand(num){ return Math.floor(Math.random() * num) };
function range(a,b) { return a + rand(b-a); }

var scrw = 640;
var scrh = 480;

var game;



window.onload = function() {
    game = new Game(scrw, scrh);
    game.enemy_speed = 1;
    game.preload('chara1.png', 'map0.png', "enchant_pics.png");

    game.setFPS = function(fps) {
        game.fps = fps;
        game.dt = 1.0 / fps; // TODO: 実測せよ
    }
    
    game.setFPS(60);

    game.gravity = 50;
    game.accum_time = 0;
    game.rootScene.backgroundColor = '#ddd';
        
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
            this.addEventListener('enterframe', function() {
                

            });
        }
    });
    var Crystal  = enchant.Class.create( enchant.Sprite, {
        initialize: function() {
            enchant.Sprite.call(this,16,16);            
            this.vy = range(-10,-5);
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
            if( rand(100)%5==0) {
                this.scale(2,2);
                this.bonus *= 4;
            }
            this.addEventListener( 'enterframe', function() {
                this.x += this.vx * game.dt;
                this.y += this.vy * game.dt;
                this.vy += game.gravity * game.dt;
            });
            game.rootScene.addChild(this);            
        }
        
    });

    game.onload = function() {
        var pc = new PC( scrw/2, scrh-64 );
        game.last_crystal = 0;
        game.rootScene.addEventListener('enterframe', function() {
            game.accum_time += game.dt;
            
            var k = game.input.up;
            if(game.accum_time > game.last_crystal + 0.1 ){
                game.last_crystal = game.accum_time;
                new Crystal();
            }

        });
    };

    game.start();
};


