var inherits = require('inherits')
var events = require('events')
var _ = require('underscore')

module.exports = Highlighter

function Highlighter(game, opts) {
  if (!(this instanceof Highlighter)) {
    console.log("constructor called without new keyword")
    return new Highlighter(game, opts)
  }
  this.game = game
  this.opts = opts || {}
  this.currVoxelIdx // undefined when no voxel selected for highlight
  this.cubeSize = game.cubeSize // + 0.01
  var geometry = this.opts.geometry || new game.THREE.CubeGeometry(this.cubeSize, this.cubeSize, this.cubeSize)
  var material = this.opts.material || new game.THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    wireframeLinewidth: this.opts.wireframeLinewidth || 3,
    transparent: true,
    opacity: this.opts.wireframeOpacity || 0.5
  })
  this.mesh = new game.THREE.Mesh(geometry, material)
  this.stepSegment = new game.THREE.Vector3();
  this.stepPosition = new game.THREE.Vector3();

  game.on('tick', _.throttle(this.highlight.bind(this), this.opts.frequency || 100))
}

inherits(Highlighter, events.EventEmitter)

Highlighter.prototype.highlight = function () {
  var hit
  var stepDistance = 0.1
  var distanceChecked = 0
  var maxDistance = this.opts.distance || 10

  this.stepPosition.copy(this.game.cameraPosition())
  this.stepSegment.copy(this.game.cameraVector()).multiplyScalar(stepDistance)

  while (distanceChecked < maxDistance && !hit) {
    distanceChecked += stepDistance
    this.stepPosition.addSelf(this.stepSegment)
    if (this.game.voxels.voxelAtPosition(this.stepPosition)) {
      hit = this.stepPosition
    }
  }
  if (!hit) {
    if (this.currVoxelIdx) { // remove existing highlight
      this.game.scene.remove(this.mesh)
      this.emit('remove', this.mesh, this.currVoxelIdx)
      this.currVoxelIdx = undefined // can't use 0 since there could be a voxel there
    }
    return // no highlight, done with common case
  }
  // select a voxel to highlight
  var voxelVector = this.game.voxels.voxelVector(hit)
  var newVoxelIdx = this.game.voxels.voxelIndex(voxelVector)
  if (newVoxelIdx === this.currVoxelIdx) {
    return // voxel already highlighted, done with common case
  }
  // update position of highlight mesh
  var chunk = this.game.voxels.chunkAtPosition(hit)
  var pos = this.game.voxels.getBounds(chunk[0], chunk[1], chunk[2])[0]
  pos[0] = pos[0] * this.cubeSize
  pos[1] = pos[1] * this.cubeSize
  pos[2] = pos[2] * this.cubeSize
  pos[0] += voxelVector.x * this.cubeSize
  pos[1] += voxelVector.y * this.cubeSize
  pos[2] += voxelVector.z * this.cubeSize
  this.mesh.position.set(pos[0] + this.cubeSize / 2, pos[1] + this.cubeSize / 2, pos[2] + this.cubeSize / 2)

  if (this.currVoxelIdx) {
    this.emit('remove', this.mesh, this.currVoxelIdx) // moved highlight
  }
  else {
    this.game.scene.add(this.mesh) // fresh highlight
  }
  this.emit('highlight', this.mesh, newVoxelIdx)
  this.currVoxelIdx = newVoxelIdx
}