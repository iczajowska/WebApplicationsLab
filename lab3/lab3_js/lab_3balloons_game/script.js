var gameArea = document.getElementById('gameArea');
// highscore json blob: https://jsonblob.com/_WSTAW_SWOJ_HASH_JSON"

// resztę zaimplementuj sam :-)


//boardstyle
var styleBoard = getComputedStyle(gameArea);
var boardWidth = parseFloat(styleBoard.width);
var boardHeight = parseFloat(styleBoard.height);
var boardPadding = parseFloat(styleBoard.paddingLeft);

//player name
var name = "";

//statistics
var points = 0;
var balloonId = 0;
var hitBalloon = 0;
var totalShoot = 0;
var accurancy = 0.00;

//points
var pointsPerBalloon = 40;
var pointsForMissingTarget = -10; 

//time, game rounds
var balloonTime = 2000; //time to click balloon
var increaseSpeed = 100;
var startTime;
var gameRounds = 30;

//sound files
var popSoundFile = './sounds/balloon-pop.mp3';//new Audio('./sounds/balloon-pop.mp3');
var missSoundFile = './sounds/shoot-bow.mp3';// new Audio('./sounds/shoot-bow.mp3');

//create yellow circle around the cursor
createCursorCircle();
var c1 = document.getElementById("c1");

var highscoresHeader = document.getElementById("highcoresHeader");
var highscoresTable = document.getElementById("highscores");
var playAgainBtn = document.getElementById("playAgainBtn");

promptMe();

function promptMe(){
    do{
        name = prompt("Please provide name");
    }while(name === ""); 

    
    document.getElementById("nickBox").innerHTML = name;
    startGame();
}

//---------------------START/END GAME-------------------------------------
function startGame(){

    gameArea.onmousedown = function(){
        playMissSound();
        cursorCircle();
        setTimeout(cursorToCrosshair,200);

        totalShoot += 1;
        points += pointsForMissingTarget;
        console.log("missed");
        updateStats();
    };

    gameArea.onmousemove = function(e){
        c1.style.left = e.pageX - 20;
        c1.style.top = e.pageY - 20;
    };

    cursorToCrosshair();
    createBalloon();   
}

function endGame(){
    defaultCursor();
    console.log("END GAME");
    gameArea.onmousedown = "default";
    gameArea.onmousemove = "default";
    alert("END OF THE GAME\nYour Score: "+points);

    showResults();    

    playAgainBtn.onclick = function(){
        resetStats();
        hideResults();
        
        startGame();
    };
}
//----------------------------RESULTS--------------------------------------
function loadData() {
    return fetch(`http://localhost:3000/players`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(`Http error: ${response.status}`);
                    }
                });
}
function addDataToTableRow(type,arg1, arg2, arg3, arg4, arg5){
    var tr = document.createElement("tr");
    var td1 = document.createElement(type);
    var td2 =  document.createElement(type);
    var td3 = document.createElement(type);
    var td4 = document.createElement(type);
    var td5 = document.createElement(type);

    td1.innerHTML = arg1;
    td2.innerHTML = arg2;
    td3.innerHTML = arg3;
    td4.innerHTML = arg4;
    td5.innerHTML = arg5;

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    highscoresTable.appendChild(tr);
}

function showResults(){
    highscoresHeader.style.visibility = "visible";
    playAgainBtn.style.visibility = "visible";

    addDataToTableRow("th","LP","Name","Points", "Accurancy","Date");
    
    //fetch data form database
    loadData().then(response => {
        console.log(response);

        //create new player object and add it to database
        var maxId = response.reduce(function(prev, current) {
            if (+current.id > +prev.id) {
                return current;
            } else {
                return prev;
            }
        }).id;

        var playerResults = {
            id: maxId+1,
            name: name,
            points: points,
            accurrancy: parseFloat(accurancy.toFixed(2)),
            datetime: (new Date()).toJSON() 
        };

        //PUT new record to database
        fetch('http://localhost:3000/players', {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(playerResults)
        }).then(res=>res.json())
        .then(res => console.log(res));
        
        response.push(playerResults);

        //Sort players by score
        response.sort(function (a,b){
            var x = a["points"];
            var y = b["points"];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });

        //display first 7 results in table
        var counter = 1;
        for(var {name: n, points: p , accurrancy: a, datetime: d } of response.slice(0, 7)){
            addDataToTableRow("td", counter,n, p, a, new Date(d));
            counter += 1;
        }
    });
}

function hideResults(){
    highscoresHeader.style.visibility = "hidden";
    playAgainBtn.style.visibility = "hidden";

    highscoresTable.innerHTML = "";
}

//---------------------------BALLOON CREATE-----------------------------------------
function createBalloon(){
    balloonId += 1;

    //end game after 30 balloons
    if(balloonId === gameRounds+1){
        endGame();
        return;
    }

    //create new element
    var newBalloon = document.createElement('div');
    
    //set class and id of the element
    newBalloon.setAttribute('id', `b${balloonId}`);
    newBalloon.setAttribute('class', 'balloon');

    //generate random color and radius
    var radius = Math.floor(Math.random()*50)+15;
    var randomColor = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
    console.log("created balloon:", `b${balloonId}`,"; radius: ", radius,'; color: '+randomColor);

    //generate position of the balloon
    xTranslate = Math.floor(Math.random()*(boardWidth - 2*boardPadding - 2*radius)) - ( boardWidth/2 - boardPadding );
    yTranslate =  Math.floor(Math.random()*(boardHeight - 2*boardPadding - 2*radius));

    //set style of new balloon
    newBalloon.style.cssText += `color: transparent; background-color: ${randomColor}; width: ${radius*2}; height:  ${radius*2}; transform: translateY(${yTranslate}px) translateX(${xTranslate}px);`;

    //Add on mouse down function to play sound, to change background and to remove ballon
    newBalloon.onmousedown = function(e){
        playPopSound();//popSound.play();
        cursorCircle();
        
        gameArea.style.backgroundColor = "red";
        setTimeout(function(){
            gameArea.style.backgroundColor = "white";
        },100);
        if(balloonId != gameRounds){
            setTimeout(cursorToCrosshair,200);
        }
        removeBalloon(`b${balloonId}`, true);
        e.stopPropagation();
    };
    
    //Add new ballon to parent
    gameArea.insertBefore(newBalloon, gameArea.firstChild);


    //start counting time from balloon appearance
    startTimer();
    
    //update statistics
    updateStats();

    //set timeout to remove balloon
    var bID =  `b${balloonId}`;
    setTimeout(removeBalloon, balloonTime, bID,false); 
    
    //change speed of the game
    if(balloonTime>800){
        balloonTime -= increaseSpeed;
    }
    
}

//---------------------------BALLOON REMOVE-----------------------------------------

function removeBalloon(ballID, clicked){ //remove after 2 second if not clicked or onclick

    //check if balloon is still existing
    if(`b${balloonId}` == ballID){
        //remove balloon      
        balloon = document.getElementById(`${ballID}`);
        balloon.parentNode.removeChild(balloon);
        console.log("removed", ballID);

        if(clicked){ //if balloon was clicked update stats
            hitBalloon += 1;
            totalShoot += 1;

            //count time of clicking the balloon 
            var time = new Date().getTime() - startTime ;
            //scale points 
            currentScore =Math.floor((1.0-time/balloonTime)*pointsPerBalloon);
            console.log("Popped after:", time,"miliseconds; score:",currentScore );
            
            //update total points
            points += currentScore;
            
            //update statistics
            updateStats();
        }
        //create new balloon
        createBalloon();
    } else{
        console.log("was already popped:", ballID);
    }
}

//-----------------------STATISTICS DISPLAY--------------------------------------

function updateStats(){
    document.getElementById("pointsBox").innerHTML = points;
    document.getElementById("roundBox").innerHTML = balloonId;
    document.getElementById("hitBox").innerHTML = hitBalloon;
    document.getElementById("shootsFiredBox").innerHTML = totalShoot;
    if(totalShoot != 0){
        accurancy = hitBalloon/totalShoot * 100.0;
    }
    document.getElementById("accuracyBox").innerHTML = accurancy.toFixed(2);
}

function resetStats(){
    points = 0;
    balloonId = 0;
    hitBalloon = 0;
    totalShoot = 0;
    accurancy = 0.0;
    updateStats();
}
//---------------------TIMER FUNCTIONS--------------------------------------------

function startTimer(){
    startTime = new Date().getTime();
}


//---------------------SOUND FUNCTIONS--------------------------------------------
function playPopSound(){
    var popSound = new Audio(popSoundFile);
    popSound.play();
}

function playMissSound(){
    var missSound = new Audio(missSoundFile);
    missSound.play();
}

//---------------------CURSOR FUNCTIONS--------------------------------------------
function createCursorCircle(){
    var newCursor = document.createElement("div");
    newCursor.style ="pointer-events: none;  width: 40px; height: 40px; border-radius: 50%; background-color: transparent; opacity: 0.5; position: absolute; left: 0; top: 0;";
    newCursor.setAttribute("id", "c1");
    gameArea.appendChild(newCursor);
}

function cursorToCrosshair(){
    gameArea.style.cursor = "crosshair";
    c1.style.backgroundColor = "transparent";
}

function defaultCursor(){
    gameArea.style.cursor = "default";
    c1.style.backgroundColor = "transparent";
}

function cursorCircle(){
    c1.style.backgroundColor = "yellow";
}
