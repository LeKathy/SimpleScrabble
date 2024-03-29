/*
FILE NAME: add-content.js
ASSIGNMENT: SIMPLIFIED SCRABBLE GAME
Kathy Le, UMass Lowell Computer Science, Kathy_Le@student.uml.edu, khle@cs.uml.edu
Copyright (c) 2021 by Kathy Le. All rights reserved. May be freely copied or excerpted    
for educational purposes with credit to the author. 
     
PROJECT DESCRIPTION:  The goal of this program project assignment is to further
familiarize with HTML, CSS, JavaScript, JSON. We are to recreate the iconic game 
of one-line Scrabble.
PROGRAM FILE GOAL: This file will dictate the behavior of the website and how to execute and make the buttons function
*/

$(function() {
    var tilePool = [];
    var currentRack = [];
    var tilesOnBoard = [];
    var remainingTiles;
    var missingHandTiles;
    var currentTileID = 0
    var doubleWordFlag = false;
    var currentScore = 0;
    var totalScore = 0;

    $.get("https://lekathy.github.io/SimpleScrabble/pieces.json") //This is to get the tile pieces and apply to the game
    .done(function(response) {
        tileJSON = response.pieces;
        initializeGame();
      });

    $("#innerRack").droppable({ //This allows the tiles to be dropped into the tiles at the exact placement
       tolerance: "fit"
     })

    $("#tileBoard div").droppable({//This is to allow drag and drop
       tolerance: "pointer",
       drop: handleDropEvent,
       out: handleTileRemoved
     })

     function initializeGame(){//Start the game or restart a new game
        fillTilePool();
        initializeRackTiles();
        addTilesToRack(true);
      }

      function fillTilePool(){ //Push in required tiles from the 27 tiles selection
        for(i = 0; i < 27; i++){
          var currentTile = tileJSON[i];
          for(k = 0; k < currentTile.amount; k++){
            tilePool.push(currentTile);
          }
        }
      }

      function initializeRackTiles(){ //starting tile amount and checking the tile amount on rack
        remainingTiles = (tilePool.length < 7) ? tilePool.length : 7; 
        if(remainingTiles == 0){ 
          alert("There are no tiles remaining. Play again!");
          return;
        }
        for(i = 0; i < remainingTiles; i++){
          var rand = Math.trunc(Math.random() * tilePool.length); 
           currentRack.push(tilePool[rand]); 
           tilePool.splice(rand, 1); 
        }
        $("#tiles_remaining").text("Tiles Remaining: " + tilePool.length) //lets player know the amount of tiles
      }

      function calculateScore(){//Calculates the value of tiles and adds accordingly
        if(doubleWordFlag){ 
           doubleWordFlag = false;
        }
        var $totalscore = $("#total_score");
        var newScore = parseInt($totalscore.attr("currentscore")) + currentScore;
        $totalscore.attr("currentscore", newScore); 
        $totalscore.text("Total Score: " + newScore );
      }
 
      function reverToRack(event, ui){//If the tiles are not placed correctly, they can drop the file
          $(this).data("ui-draggable").originalPosition = {
                top : 0,
                left : 0
            };
            return !event;
      }
 
     function removePoints($letterTile, $boardTile){//when removing tiles, remove the score, and update scoreboard
        var $currScore = $("#score");
        if($boardTile.attr("class") == "doubleWord ui-droppable ui-droppable-active"){
            if(doubleWordFlag == true){
              currentScore /= 2;
            }
            doubleWordFlag = false;
            currentScore -= ($letterTile.attr("points") * $boardTile.attr("multiplier"));
            $currScore.text("Current Word Score: " + "+" + currentScore);
        }
        else{ 
            var letterScore =  $letterTile.attr("points") * $boardTile.attr("multiplier");
            if(doubleWordFlag){
                currentScore -= letterScore * 2;
                $currScore.text("Current Word Score: " + "+" + currentScore);
            }else{
                currentScore -= letterScore;
                $currScore.text("Current Word Score: " + "+"  + currentScore);
            }
          }
          console.log("test", doubleWordFlag);
      }
 
      function addPoints($letterTile, $boardTile){//add the points accordingly
          var $currScore = $("#score");
          if($boardTile.attr("class") == "doubleWord ui-droppable"){
            if(doubleWordFlag == false){
              currentScore *= 2;
            }
            doubleWordFlag = true;//multiply for the double word worth
            currentScore += ($letterTile.attr("points") * $boardTile.attr("multiplier")) * 2;
            $currScore.text("Current Word Score: " + "+" + currentScore);
          }
          else{
            var letterScore =  $letterTile.attr("points") * $boardTile.attr("multiplier");//multiply for the double letter worth
            if(doubleWordFlag){
                currentScore += letterScore * 2;
                $currScore.text("Current Word Score: " + "+" + currentScore);
              }
            else{
                currentScore += letterScore;//add and update the score
                $currScore.text("Current Word Score: " + "+" + currentScore);
            }
          }
      }
      
      function handleTileRemoved(event, ui){//This is to remove the tiles with drag and drog
        var $this = $(this);
        var draggableId = ui.draggable.attr("id");
        var droppableId = $(this).attr("id");
        var $currScore = $("#score");
        console.log(tilesOnBoard);
        if(tilesOnBoard.includes(ui.draggable.attr("id"))){
          var boardIndex = tilesOnBoard.indexOf(ui.draggable.attr('id'));
          tilesOnBoard.splice(boardIndex,1);
          console.log(tilesOnBoard + "inside tileRemoved");
          $(this).attr("used",0);
          $(this).attr("letter", -1);
          removePoints(ui.draggable, $(this));
          updateWord();
        }
      }
 
      function handleDropEvent(event, ui) {//to recognize the drop and what to do
          var $this = $(this);
          var draggableId = ui.draggable.attr("id");
          var draggableLetter = ui.draggable.attr("letter");
          var currentword = "";
          var droppableId = $(this).attr("id");
          var $currScore = $("#score");
          console.log('Dropped letter ' + draggableLetter + ' with ID: ' + draggableId + ' onto ' + droppableId);
 
          if(!tilesOnBoard.includes(ui.draggable.attr("id"))){ 
              if($(this).attr("used") == 1){ 
                  ui.draggable.draggable('option','revert', reverToRack);
                  ui.draggable.animate(ui.draggable.data().origPosition= {
                     top : 0,
                     left : 0
                  },"slow");
              return;
            }
            if(ui.draggable.attr("letter") == "Blank"){
              createBlankTileDialog(ui.draggable, $(this));
            }else{
              $(this).attr("letter", draggableLetter);
            }
            tilesOnBoard.push(ui.draggable.attr("id"));
            $(this).attr("used", 1);
            addPoints(ui.draggable, $(this));
 
          }
          updateWord();//update the word created label
 
          ui.draggable.position({
            my: "center",
            at: "center",
            of: $this,
            using: function(pos) {
              $(this).animate(pos, 200, "linear");
            }
          });
      } 
 
     
      function updateWord(){//recognize the word the player made and store it for user to see
        var currentWord = " ";
        $("#tileBoard div").each(function(index,$el){
          if($el.getAttribute("letter") != -1){
            currentWord += $el.getAttribute("letter");
          }
        });
        $("#current_word").text("Current Word: " + currentWord);
      }
 
      
      function fillRackForNextHand(){//when rack is less than 7, add the missing value of tiles
        remainingTiles = (tilePool.length < 7) ? tilePool.length : 7; 
        if(remainingTiles == 0){ 
          alert("There are no tiles remaining. Play again?");
          return;
        }
        if(currentRack.length < 7){  
            missingHandTiles = 7 - currentRack.length;
            console.log("missing" + missingHandTiles);
            for(i = 0; i < missingHandTiles; i++){
              var rand = Math.trunc(Math.random() * tilePool.length); 
               currentRack.push(tilePool[rand]); 
               tilePool.splice(rand, 1); 
            }
            $("#tiles_remaining").text("Tiles Remaining: " + tilePool.length) 
            addTilesToRack(false);
        }
      }
 
      function addTilesToRack(resetFlag){//when the game needs 7 tiles, they will push in 7 tiles
         if(resetFlag){
           for(i = 0; i < currentRack.length; i++){
             var newTileImage = document.createElement("img");
             newTileImage.setAttribute('src', "images/Scrabble_Tiles/Scrabble_Tile_" + currentRack[i].letter + ".jpg");
             newTileImage.setAttribute('points' , currentRack[i].value); 
             newTileImage.setAttribute('id', "tile" + currentTileID++);
             newTileImage.setAttribute("index", i);
             newTileImage.setAttribute("letter", currentRack[i].letter);
             newTileImage.classList.add("ui-widget-content");
             $("#innerRack").append(newTileImage);
           }
         }
         else {
           for(i = currentRack.length - missingHandTiles; i < 7; i++){
             var newTileImage = document.createElement("img");
             newTileImage.setAttribute('src', "images/Scrabble_Tiles/Scrabble_Tile_" + currentRack[i].letter + ".jpg");
             newTileImage.setAttribute('points' , currentRack[i].value); // assign points to the image
             newTileImage.setAttribute('id', "tile" + currentTileID++);
             newTileImage.setAttribute("index", i);
             newTileImage.setAttribute("letter", currentRack[i].letter);
             newTileImage.classList.add("ui-widget-content");
             $("#innerRack").append(newTileImage);
           }
         }
 
        $("#innerRack img").draggable({
           revert: reverToRack,
           snap: ".ui-droppable",
           refreshPositions: true,
           snapTolerance: "3",
           snapMode: "both",
           stack: ".ui-draggable",
           stop: function(){
                  $(this).draggable('option','revert', reverToRack);
                 }
          }).css({
            width: "75px",
            height: "75px",
            marginBottom: "20px"
          }).droppable({  
             greedy: true,
             tolerance: 'pointer',
             drop: function(event,ui){
                       ui.draggable.animate(ui.draggable.data().origPosition= { top : 0, left : 0 },"slow");
                       var message = document.getElementById("snackbar");
                       message.className = "show";
                      setTimeout(function(){ message.className = message.className.replace("show", ""); }, 4000);
                   }
          });
      } 

      function createBlankTileDialog(blankTile, boardTile){
         var tileDialog = $('<div></div>');
         tileDialog.attr('id', 'tileDialog');
         tileDialog.attr('title', 'Click on a letter.')
         tileJSON.forEach(element => {
           if(element.letter != 'Blank'){
             var tileInDialog = document.createElement("img");
             tileInDialog.setAttribute('src', "images/Scrabble_Tiles/Scrabble_Tile_" + element.letter + ".jpg");
             tileInDialog.setAttribute('letter', element.letter);
             tileInDialog.classList.add("blankTileLetters");
             tileInDialog.onclick = function() {
               blankTile.attr("letter", tileInDialog.getAttribute("letter"));
               blankTile.attr('src', tileInDialog.getAttribute("src"));
               tileDialog.dialog("close");
               boardTile.attr('letter', tileInDialog.getAttribute("letter"));
               updateWord();
            };
          } 
         tileDialog.append(tileInDialog);
       });
       tileDialog.dialog({
              classes: {"ui-dialog":"no-close"},
              modal: true,
              draggable: false,
              resizable: false
       });
      }
 

      $("#next_word").click(function() {
        tilesOnBoard.forEach(element => {
          console.log(element);
          $("#" + element).remove(); 
          currentRack.splice(element.index, 1); 
        });
        
        $("#tileBoard div").each(function(index,$el){
          $el.setAttribute("letter", -1);
        });
        tilesOnBoard = []; 
        fillRackForNextHand();
        calculateScore(); 
        currentScore = 0; 
        $("#score").text("Current Word Score: " + currentScore); 
        $("#current_word").text("Current Word: ");
        $("#tileBoard div").attr("used", 0);  
     })
 
        $("#reset_tile").click(function() {
        currentRack = [];
        tilesOnBoard = []; //reset board
        totalScore = 0;
        currentScore = 0
        $("#tileBoard div").each(function(index,$el){
          $el.setAttribute("letter", -1);
        });
        $("#innerRack img").remove();
        initializeRackTiles();
        addTilesToRack(true);
     })
 
     $("#new_game").click(function() {
       currentRack = [];
       tilesOnBoard = []; //reset board
       tilePool = [];
       totalScore = 0;
       currentScore = 0
       $("#tileBoard div").each(function(index,$el){
         $el.setAttribute("letter", -1);
       });
       $("#score").text("Current Word Score: " + currentScore);
       $("#total_score").text("Total Score: " + totalScore);
       $("#total_score").attr("currentscore", 0);
       $("#innerRack img").remove();
       $("#tileBoard div").attr("used", 0);  
       $("#current_word").text("Current Word: ");
       initializeGame();
       console.log(currentRack);
    })
 
    //Refill tile pool back to 100 if the user wants to cheat and play forever
    $("#refill_pool").click(function() {
      tilePool = [];
      fillTilePool();
      $("#tiles_remaining").text("Tiles Remaining: " + tilePool.length) //update remaining tile html
      console.log(currentRack);
   })
 
 });
