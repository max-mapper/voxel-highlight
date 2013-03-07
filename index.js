var inherits = require('inherits')
var events = require('events')
var _ = require('underscore')

module.exports = Highlighter

function Highlighter(game, opts) {
  if (!(this instanceof Highlighter)) return new Highlighter(game, opts)
  this.game = game
  opts = opts || {}
  this.currVoxelPos // undefined when no voxel selected for highlight
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
    if (this.currVoxelPos) { // remove existing highlight
      this.game.scene.remove(this.mesh)
      this.emit('remove', this.currVoxelPos)
      this.currVoxelPos = undefined // can't use 0 since there could be a voxel there
    }
    return // no highlight, done with common case
  }
  var newVoxelPos = this.game.blockPosition(hit.position)
  if (this.currVoxelPos && newVoxelPos[0] === this.currVoxelPos[0] && newVoxelPos[1] === this.currVoxelPos[1] && newVoxelPos[2] === this.currVoxelPos[2]) {
    return // voxel already highlighted, done with common case
  }
  this.mesh.position.set(newVoxelPos[0] + 0.5, newVoxelPos[1] + 0.5, newVoxelPos[2] + 0.5)

  if (this.currVoxelPos) {
    this.emit('remove', this.currVoxelPos) // moved highlight
  }
  else {
    this.game.scene.add(this.mesh) // fresh highlight
  }
  this.emit('highlight', newVoxelPos)
  this.currVoxelPos = newVoxelPos
}