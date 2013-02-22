var inherits = require('inherits');
var events = require('events');
var _ = require('underscore');

module.exports = function (game, opts) {
  return new Highlighter(game, opts);
};

function Highlighter(game, opts) {
  this.opts = opts || {};
  this.game = game;
  this.prevVoxelIdx = 0;
  this.cameraPosition = new this.game.THREE.Vector3();
  this.cameraVector = new this.game.THREE.Vector3();
  var size = this.game.cubeSize;
  var geometry = this.opts.geometry || new this.game.THREE.CubeGeometry(size + 0.01, size + 0.01, size + 0.01);
  var material = this.opts.material || new this.game.THREE.MeshBasicMaterial({
    color: new this.game.THREE.Color(0x000000),
    wireframe: true,
    wireframeLinewidth: this.opts.wireframeLinewidth || 3
  });
  this.cube = new this.game.THREE.Mesh(geometry, material);
  this.highlightActive = false;
  this.game.on('tick', _.throttle(this.highlight.bind(this), this.opts.frequency || 100));
}

inherits(Highlighter, events.EventEmitter);

Highlighter.prototype.highlight = function () {
  var self = this;
  var removeHighlight = function () {
    self.game.scene.remove(self.cube);
    self.emit('remove', self.cube, self.prevVoxelIdx);
    self.highlightActive = false;
  };
  var getCameraPosition = function () { // only for legacy voxel-engine 0.3.6 support
    self.cameraPosition.multiplyScalar(0);
    self.game.camera.matrixWorld.multiplyVector3(self.cameraPosition);
    return self.cameraPosition;
  };
  var getCameraVector = function () { // only for legacy voxel-engine 0.3.6 support
    self.cameraVector.multiplyScalar(0);
    self.cameraVector.z = -1;
    self.game.camera.matrixWorld.multiplyVector3(self.cameraVector);
    self.cameraVector.subSelf(self.cameraPosition).normalize();
    return self.cameraVector;
  };
  var camPos = (this.game.cameraPosition && this.game.cameraPosition()) || getCameraPosition();
  var camVec = (this.game.cameraVector && this.game.cameraVector()) || getCameraVector();
  var hit = this.game.raycast(camPos, camVec, this.opts.distance || 500);
  if (!hit) {
    if (this.highlightActive) removeHighlight();
    return;
  }
  var voxelVector = this.game.voxels.voxelVector(hit);
  var voxelIdx = this.game.voxels.voxelIndex(voxelVector);
  if (this.highlightActive) {
    if (this.prevVoxelIdx === voxelIdx) return; // no change
    removeHighlight();
  }
  this.prevVoxelIdx = voxelIdx;
  var chunk = this.game.voxels.chunkAtPosition(hit);
  var pos = this.game.voxels.getBounds(chunk[0], chunk[1], chunk[2])[0];
  var size = this.game.cubeSize;
  pos[0] = pos[0] * size;
  pos[1] = pos[1] * size;
  pos[2] = pos[2] * size;
  pos[0] += voxelVector.x * size;
  pos[1] += voxelVector.y * size;
  pos[2] += voxelVector.z * size;
  this.cube.position.set(pos[0] + size / 2, pos[1] + size / 2, pos[2] + size / 2);
  this.game.scene.add(this.cube);
  this.highlightActive = true;
  this.emit('highlight', pos, this.cube, voxelIdx);
}
