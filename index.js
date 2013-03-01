var inherits = require('inherits')
var events = require('events')
var _ = require('underscore')

module.exports = Highlighter

function Highlighter(game, opts) {
  if (!(this instanceof Highlighter)) return new Highlighter(game, opts)
  this.game = game
  this.opts = opts || {}
  this.currVoxelIdx // undefined when no voxel selected for highlight
  var geometry = this.opts.geometry || new game.THREE.CubeGeometry(1, 1, 1)
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
  // cheap raycast "lite":
  var stepDistance = 0.1
  var distanceChecked = 0
  var maxDistance = this.opts.distance || 10
  this.stepPosition.copy(this.game.cameraPosition())
  this.stepSegment.copy(this.game.cameraVector()).multiplyScalar(stepDistance)
  while (distanceChecked < maxDistance && !hit) {
    distanceChecked += stepDistance
    this.stepPosition.addSelf(this.stepSegment)
    if (this.game.voxels.voxelAtPosition(this.stepPosition)) {
      var hit = this.stepPosition
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
  // update position of highlight mesh if changed
  hit.set(Math.floor(hit.x) + 0.5, Math.floor(hit.y) + 0.5, Math.floor(hit.z) + 0.5)
  var newVoxelIdx = JSON.stringify(hit)
  if (newVoxelIdx === this.currVoxelIdx) {
    return // voxel already highlighted, done with common case
  }
  this.mesh.position.copy(hit)

  if (this.currVoxelIdx) {
    this.emit('remove', this.mesh, this.currVoxelIdx) // moved highlight
  }
  else {
    this.game.scene.add(this.mesh) // fresh highlight
  }
  this.emit('highlight', this.mesh, newVoxelIdx)
  this.currVoxelIdx = newVoxelIdx
}