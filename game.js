"use strict";

// CONSTRUCTOR
// --------------------------------------------
function Minesweeper(row, col, mine_count){
  this.row = row;
  this.col = col;
  this.mine_count = mine_count;
  this.board = [];
  this.visited = [];
};

// FUNCTION: BUILD BOARD
// --------------------------------------------
function build_board(){
  var row = this.row;
  var col = this.col;
  var board = this.board;

  // for loops to build board
  for(var i=0; i<row; i++){
    let row = [];
    for(var j=0; j<col; j++){
        row.push('?');
    }
    board.push(row);
  }

  // choose mine coords
  this.set_mine_coords();
}
Minesweeper.prototype.build_board = build_board;


// FUNCTION: choose random coordinates for bomb
// --------------------------------------------
function set_mine_coords(){
    for(var i=0; i<this.mine_count; i++){   // mine_count loop
      // generate random coordinate
      let row = Math.random()*this.row;
      let col = Math.random()*this.col;

      row = Math.ceil(row-1);
      col = Math.ceil(col-1);

      this.board[row][col] = "M";   // update board with mine coords
    }
}Minesweeper.prototype.set_mine_coords = set_mine_coords;

// FUNCTION: DRAW BOARD TO HTML
// --------------------------------------------
function draw_board(){
  $('#root').empty();     // empty root container
  var row_count = 0;      // count rows (for html id)

  // OUTER FOR
  this.board.forEach(function(row){
    // CREATE ROW HTML & APPEND TO ROOT
    var html = `<div class="row" id="row-${row_count}"></div>`;
    $('#root').append(html);  // append row
    let col_count = 0;        // count cols (for html id)

    // INNER FOR
    row.forEach(function(cell){
      switch (cell) {
        // MINE
        case "M":
          var square = $(`<div id="col-${col_count}" class="square"><button class='mine-btn'>?</button></div>`);
          $(`#row-${row_count}`).append(square);
          break;

        // MINE WITH FLAG
        case "Mf":
          var square = $(`<div id="col-${col_count}" class="square"><button class='mine-btn'><img src='img/flag.png'/></button></div>`);
          $(`#row-${row_count}`).append(square);
          break;
        default:
          var color;
          if(cell == '1') color = '#D48A6A';
          else if(cell == '2') color = '#AA5B39';
          else if(cell == '3') color = '#803515';
          else if(cell == '4') color = '#581B01';
          else if(cell == '5') color = '#6D1238';
          else if(cell == '6') color = '#6D1238';
          else if(cell == '') color = '#FFDCCD';

          var square = $(`<div id="col-${col_count}" class="square"><button style='background-color: ${color}'>${cell}</button></div>`);
          $(`#row-${row_count}`).append(square);
          break;
        }


        col_count++;
    });

    row_count++;
  });
}
Minesweeper.prototype.draw_board = draw_board;

// -------------------------------------
// * * FUNCTION: count neighboring mines * *
// --------------------------------------------
function count_mines(row, col){
  var start = [row-1, col-1];
  var count = 0;

  for(var i=start[0]; i<start[0]+3; i++){
    for(var j=start[1]; j<start[1]+3; j++){
      if(this.coord_is_valid(i,j) && (this.board[i][j] == "M" || this.board[i][j] == "Mf")) count++;
    }
  }
  // NO NEIGHBORS -- RECURSIVE CALL
  if(count==0){
    // Open this cell
    this.board[row][col] = '';

    // FOR EACH NEIGHBOR, CALL THE FUNCTION
    for(var i=start[0]; i<start[0]+3; i++){
      for(var j=start[1]; j<start[1]+3; j++){
        if(this.coord_is_valid(i,j) && this.visited[i][j] != 1){
          this.visited[i][j] = 1;     // mark as visited
          this.count_mines(i,j);      // <- Recursive call
        }
      }
    }
  }
  // HAS AT LEAST 1 NEIGHBOR
  else{
    this.board[row][col] = count;   // update board with count
    this.draw_board();              // redraw board
  }

}Minesweeper.prototype.count_mines = count_mines;


// HELPER FUNCTION CHECKS IF A COORDINATE IS VALID (WITHIN BOUNDS)
function coord_is_valid(i,j){
  if(i<0 || i > this.row-1) return false;
  if(j<0 || j>this.col-1) return false;
  return true;
}Minesweeper.prototype.coord_is_valid = coord_is_valid;

//HELPER FUNCTION: INITIALIZE VISITED ARRAY
function start_visited(){
  var arr = [];
  for(var i=0; i<this.row; i++){
    var arr2 = [];
    for(var j= 0; j<this.col; j++){
      arr2.push(0);
    }
    arr.push(arr2);
  }
  this.visited = arr;
}Minesweeper.prototype.start_visited = start_visited;

// ==== END MINESWEEPER PROTOTYPE FUNCTIONS === //
// ============================================ //

//            *     *     *

// ============================================ //
// ==== BEGIN HELPER FUNCTIONS =============== //


// SET UP CLICK HANDLERS
// --------------------------------------------
function click_handlers(){
  $('#root').undelegate('.square > button', 'click');

  // CELL BUTTON CLICK HANDLER
  // --------------------------------------------
  $('#root').on('click', '.square > button', function(event){

    // Get parent div (square)
    var col_id = $(this).parent().attr('id');
    var row_id = $(this).closest('.row').attr('id');

    // Get coordinates
    col_id = col_id.split('-')[1];
    row_id = row_id.split('-')[1];

    if($(this).attr('class')=='mine-btn'){
      $(this).empty();
      $('.mine-btn').html("<img src='img/mine.png'/>")
      var audio = document.getElementById("audio");
      audio.play();
      setTimeout(function() {
        alert('You lose!');
      }, 1000);
    }else{
      game.count_mines(row_id, col_id);
    }
  });

  // FLAG TOGGLER CLICK HANDLER -----------------------------------------------
  $('#flag-btn').on('click', function(event){
    if(flag_set == 0){
      $(this).css('background-color', 'yellow');
      // change click handlers
      $('#root').undelegate('.square > button', 'click');
      $('#root').on('click', '.square > button', function(event){

        // Get coordinates
        var col_id = $(this).parent().attr('id');
        var row_id = $(this).closest('.row').attr('id');
        col_id = col_id.split('-')[1];
        row_id = row_id.split('-')[1];

        game.board[row_id][col_id] = 'Mf';

        $(this).empty();
        $(this).html("<img src='img/flag.png'/>");
      });
      flag_set = 1;
    }else{
      $(this).css('background-color', 'grey');
      // change click handlers
      $('#root').undelegate('.square > button', 'click');
      click_handlers();
      flag_set = 0;
    }
  });

  // GRID SIZE SUBMIT BUTTON CLICK HANDLER
  // --------------------------------------------
  $('#submit-btn').on('click', function(){
    var x = parseInt($(this).siblings('#x').val());
    var y = parseInt($(this).siblings('#y').val());

    if(typeof x != 'number' || typeof y != 'number'){
      alert('Submit a valid number');
    }

    // calculate mine count
    var mine_count = Math.floor(x*y/5);

    start_game(x, y, mine_count);
  });
}

// ==== END MINESWEEPER HELPER FUNCTIONS === //
// ============================================ //

//            *     *     *

// GLOBAL FUNCTIONS/VARS
// --------------------------------------------
var game;
var flag_set = 0;   // Flag button pressed flag

function start_game(x=16, y=21, m=67){
  //Minesweeper class
  game = new Minesweeper(x, y, m);
  game.build_board();
  game.draw_board();
  game.start_visited();
  click_handlers();
}

// ON PAGE LOAD, START GAME
// --------------------------------------------
$(document).ready(function(){
  $('body').append("<audio id='audio' src='sounds/bomb.mp3'></audio>");
  start_game();
});
