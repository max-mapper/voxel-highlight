var createGame = require('voxel-engine');
var texturePath = require('painterly-textures')(__dirname);
var highlighter = require('./');

var container = document.querySelector('#container');

var game = createGame({
  startingPosition: [0, 1000, 0],
  texturePath: texturePath
});

game.controls.pitchObject.rotation.x = -1.5; // look down
game.appendTo(container);
game.currentMaterial = 1;

var highlight = highlighter(game, {
  distance: 100,
  wireframeLinewidth: 10,
});

highlight.on('highlight', function(position, mesh, vidx) {
  console.log('highlighted: ' + vidx);
});

highlight.on('remove', function(mesh, vidx) {
  console.log('# UN-highlighted ' + vidx);
});

game.on('mousedown', function (pos) {
  if (game.erase) game.setBlock(pos, 0);
  else game.createBlock(pos, game.currentMaterial);
});

container.addEventListener('click', function() {
  game.requestPointerLock(container);
});

game.erase = true;
window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'X'.charCodeAt(0)) {
    game.erase = !game.erase;
  }
});

function ctrlToggle (ev) { game.erase = !ev.ctrlKey }
window.addEventListener('keyup', ctrlToggle);
window.addEventListener('keydown', ctrlToggle);
