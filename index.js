var inherits = require('inherits')
var events = require('events')
var _ = require('underscore')

module.exports = Highlighter

function Highlighter(game, opts) {
  if (!(this instanceof Highlighter)) return new Highlighter(game, opts)
  this.game = game
  opts = opts || {}
  this.currVoxelIdx // undefined when no voxel selected for highlight
  var geometry = opts.geometry || new game.THREE.CubeGeometry(1, 1, 1)
  var material = opts.material || new game.THREE.MeshBasicMaterial({
    color: opts.color || 0x000000,
    wireframe: true,
    wireframeLinewidth: opts.wireframeLinewidth || 3,
    transparent: true,
    opacity: opts.wireframeOpacity || 0.5
  })
  this.mesh = new game.THREE.Mesh(geometry, material)
  this.distance = opts.distance || 10
  game.on('tick', _.throttle(this.highlight.bind(this), opts.frequency || 100))
}

inherits(Highlighter, events.EventEmitter)

Highlighter.prototype.highlight = function () {
  var cp = this.game.cameraPosition()
  var cv = this.game.cameraVector()
  var hit = this.game.raycastVoxels(cp, cv, this.distance)
  if (!hit) {
    if (this.currVoxelIdx) { // remove existing highlight
      this.game.scene.remove(this.mesh)
      this.emit('remove', this.mesh, this.currVoxelIdx)
      this.currVoxelIdx = undefined // can't use 0 since there could be a voxel there
    }
    return // no highlight, done with common case
  }
  hit.position[0] = Math.floor(hit.position[0]) + 0.5
  hit.position[1] = Math.floor(hit.position[1]) + 0.5
  hit.position[2] = Math.floor(hit.position[2]) + 0.5
  
  var newVoxelIdx = hit.position.join("|")
  if (newVoxelIdx === this.currVoxelIdx) {
    return // voxel already highlighted, done with common case
  }
  this.mesh.position.set(hit.position[0], hit.position[1], hit.position[2])

  if (this.currVoxelIdx) {
    this.emit('remove', this.mesh, this.currVoxelIdx) // moved highlight
  }
  else {
    this.game.scene.add(this.mesh) // fresh highlight
  }
  this.emit('highlight', this.mesh, newVoxelIdx)
  this.currVoxelIdx = newVoxelIdx
}