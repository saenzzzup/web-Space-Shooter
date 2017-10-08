function openDoor(field) {
            var y = $(field).find(".thumb");
            var x = y.attr("class");
            if (y.hasClass("thumbOpened")) {
                y.removeClass("thumbOpened");
            }
            else {
                $(".thumb").removeClass("thumbOpened");
                y.addClass("thumbOpened");
                $("#welcome").fadeTo(2000,0,function(){$(this).remove();});
            }
        }

function replayGame(field){
    location.reload();    
    }

function Player(node){

    this.node = node;
    this.grace = false;
    this.replay = 3; 
    this.respawnTime = -1;
    
    // This function damage the ship and return true if this cause the ship to die 
    this.damage = function(){
        if(!this.grace){
                return true;
        }
        return false;
    };
    
    // this try to respawn the ship after a death and return true if the game is over
    this.respawn = function(){
        this.replay--;
        if(this.replay<=0){
            return true;
        }
        
        this.grace  = true;
        
        this.respawnTime = (new Date()).getTime();
        $(this.node).fadeTo(0, 0.5); 
        return false;
    };
    
    this.update = function(){
        if((this.respawnTime > 0) && (((new Date()).getTime()-this.respawnTime) > 3000)){
            this.grace = false;
            $(this.node).fadeTo(500, 1); 
            this.respawnTime = -1;
        }
    }
    
    return true;
}

function Enemy(node){
    this.speedx = 0;
    this.speedy = 5;
    this.live = 2;
    this.node = $(node);
    
    // deals with damage endured by an enemy
    this.damage = function(){
        $(this.node).fadeTo(0, 0.5); 
        this.live--;
        if(this.live <= 0)
            return true;
        return false;
    };
    
    // updates the position of the enemy
    this.update = function(playerNode){
        this.updateX(playerNode);
        this.updateY(playerNode);
    };  
    this.updateX = function(playerNode){
        var newpos = parseInt(this.node.css("top"))+this.speedx;
        this.node.x(this.speedx, true);
    };
    this.updateY= function(playerNode){
        this.node.y(this.speedy, true);
    };
}

function Coin(node){
    this.speedx = 0;
    this.speedy = 5;
    this.node = $(node);
    
    // updates the position of the enemy
    this.update = function(playerNode){
        this.updateX(playerNode);
        this.updateY(playerNode);
    };  
    this.updateX = function(playerNode){
        var newpos = parseInt(this.node.css("top"))+this.speedx;
        this.node.x(this.speedx, true);
    };
    this.updateY= function(playerNode){
        this.node.y(this.speedy, true);
    };
}

// JUEGO 


var PLAYGROUND_HEIGHT = 480;
var PLAYGROUND_WIDTH = 320;
var REFRESH_RATE = 15;
var MISSILE_SPEED = 10;
var livesPlayer = '<img src="img/spaceShip.png" width="20px">';
var playerAnimation = new Array();
var missile = new Array();
var missileCounter = 0;
var enemies = new Array();
var coinAnimation = new Array();
var barAnimation = new Array();

var score = 0;

$(function(){

    $('#instructions').hide();

    playerAnimation["idle"] =   new $.gameQuery.Animation({imageURL: "img/spaceShip.png"});
    enemies["idle"] =   new $.gameQuery.Animation({imageURL: "img/Alien.png"});
    coinAnimation["idle"] =   new $.gameQuery.Animation({imageURL: "img/Coin.png"});
    missile["bullet"] = new $.gameQuery.Animation({imageURL: "img/Bala.png"});
    barAnimation["idle"] =   new $.gameQuery.Animation({imageURL: "img/Bar.png"});

    $("#playground").playground({height: PLAYGROUND_HEIGHT, 
        width: PLAYGROUND_WIDTH, 
        keyTracker: true});

    $.playground().addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
        .addGroup("player", {posx: PLAYGROUND_WIDTH/2, 
                         posy: PLAYGROUND_HEIGHT-100, 
                         width: 80, 
                         height: 80})
        .addSprite("playerBody",{animation: playerAnimation["idle"], 
                         posx: 0, 
                         posy: 0, 
                         width: 80, 
                         height: 80});


   $("#player")[0].player = new Player($("#player"));


    $("#welcome").click(function(){
        $("#welcomeScreen").delay(1500).fadeTo(1000,0,function(){
                $('#instructions').show().delay(3500).fadeTo(1000,0);
                $(this).remove();
                $.playground().startGame(function(){
                $('#playground').css('cursor', 'none');
            });
        });
    });

    $("#playground").mousemove(function(event) {
        var position = $("#playground").position();
            $("#player")[0].player.update();
            $("#player").x(event.pageX-position.left-50);
            $("#player").y(event.pageY-position.top-60);
    });
    document.getElementById('playground').ontouchmove = function (e) {
        var position = $("#playground").position();
            $("#player")[0].player.update();
            $("#player").x(e.touches[0].clientX-position.left-50);
            $("#player").y(e.touches[0].clientY-position.top-60);
            e.preventDefault()
        
    };

    $.playground().registerCallback(function(){
        $(".enemy").each(function(){
            this.enemy.update($("#player"));
            var posy = $(this).y();
            if(posy > 800){
                $(this).remove();
                return;
            }
            //Test for collisions
            var collidedActor = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
            if(collidedActor.length > 0){
                $("#playground").css("background-color", "red");
                if($("#player")[0].player.respawn()){
                    $("#lives div").replaceWith('<div></div>');
                    $("#playground").css("background-color", "red").fadeTo(2000,0,function(){
                        $.playground().pauseGame()
                        $(this).replaceWith('<div id="SODVI"><H1>GAME OVER</H1><a href="http://www.sodvi.com"><img class="logo" src="img/logo_1.png" alt="SODVI"></a><a href="http://www.facebook.com/sodvi" target="_blank"><img class="social" src="img/Facebook.png" alt="/sodvi"></a><a href="http://www.twitter.com/sodvi" target="_blank"><img class="social" src="img/Twitter.png" alt="@sodvi"></a><br><img class="replay" src="img/Replay.png" onclick="replayGame(this)"><div class="author">By: Ricardo Sáenz</div></div>');
                    });
                }
                switch($("#player")[0].player.replay){
                case (1):
                    $("#lives div").replaceWith('<div>'+ livesPlayer + '</div>');
                break;
                case (2):
                    $("#lives div").replaceWith('<div>'+ livesPlayer + livesPlayer + '</div>');
                break;
                default:
                break;
                }
                $(this).remove();
                setTimeout(function() {
                    $('#playground').css("background-color", "black");
                }, 300);
            }
        });

        $(".playerMissiles").each(function(){
            var posy = $(this).y();
            if(posy < 0){
                $(this).remove();
                return;
            }
            $(this).y(-MISSILE_SPEED, true);

            var collided = $(this).collision(".enemy,."+$.gQ.groupCssClass);
            if(collided.length > 0){
                //An enemy has been hit!
                collided.each(function(){
                    if($(this)[0].enemy.damage()){
                        score += 50;
                        $("#score div").replaceWith('<div>00'+score+'</div>');
                        $(this).remove();
                        $(this).removeClass("enemy");
                    }
                });
                $(this).removeClass("playerMissiles");
                $(this).remove();
            }
        });

        $(".coin").each(function(){
            this.coin.update($("#player"));
            var posy = $(this).y();
            if(posy > 800){
                $(this).remove();
                return;
            }
            //Test for collisions
            var collidedActor = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
            if(collidedActor.length > 0){
                score += 20;
                $("#score div").replaceWith('<div>00'+score+'</div>');
                $(this).remove();
                $(this).removeClass("coin");
            }
        });

        if (score > 2500) {
            $("#playground").fadeTo(2000,0,function(){
                $.playground().pauseGame()
                $(this).replaceWith('<div id="SODVI"><H1>YOU WON <br>Thanks for playing</H1><a href="http://www.sodvi.com"><img class="logo" src="img/logo_1.png" alt="SODVI"></a><a href="http://www.facebook.com/sodvi" target="_blank"><img class="social" src="img/Facebook.png" alt="/sodvi"></a><a href="http://www.twitter.com/sodvi" target="_blank"><img class="social" src="img/Twitter.png" alt="@sodvi"></a><br><img class="replay" src="img/Replay.png" onclick="replayGame(this)"></div><div class="author">By: Ricardo Sáenz</div>');
            });
        }

    }, REFRESH_RATE);

    //This function manage the creation of the enemies
    $.playground().registerCallback(function(){
        var name = "enemy1_"+Math.ceil(Math.random()*1000);
        $("#actors").addSprite(name, {animation: enemies["idle"], posx: Math.floor((Math.random() * PLAYGROUND_WIDTH-80) + 50), posy: -100,width: 60, height: 50});
        $("#"+name).addClass("enemy");
        $("#"+name)[0].enemy = new Enemy($("#"+name));
        
    }, 1000); //once per seconds is enough for this 

    //This function manage the creation of the coins
    $.playground().registerCallback(function(){
        var name = "coin1_"+Math.ceil(Math.random()*1000);
        $("#actors").addSprite(name, {animation: coinAnimation["idle"], posx: Math.floor((Math.random() * PLAYGROUND_WIDTH-80) + 50), posy: -100,width: 50, height: 50});
        $("#"+name).addClass("coin");
        $("#"+name)[0].coin = new Coin($("#"+name));
        
    }, 2000); //once per seconds is enough for this 

    //This function manage the creation of the Bullets
    $.playground().registerCallback(function(){
        var playerposx = $("#player").x();
        var playerposy = $("#player").y();
        missileCounter = (missileCounter + 1) % 100000;
        var name = "playerMissle_"+missileCounter;
        $("#actors").addSprite(name,{animation: missile["bullet"], posx: playerposx + 40, posy: playerposy -10, width: 20  ,height: 20});
        $("#"+name).addClass("playerMissiles")
    }, 400);

});








