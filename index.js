var inherits = require('inherits')
var events = require('events')
var _ = require('underscore')

module.exports = Highlighter

function Highlighter(game, opts) {
  if (!(this instanceof Highlighter)) return new Highlighter(game, opts)
  this.game = game
  opts = opts || {}
  var geometry = opts.geometry || new game.THREE.CubeGeometry(1, 1, 1)
  var material = opts.material || new game.THREE.MeshBasicMaterial({
    color: opts.color || 0x000000,
    wireframe: true,
    wireframeLinewidth: opts.wireframeLinewidth || 3,
    transparent: true,
    opacity: opts.wireframeOpacity || 0.5
  })
  this.mesh = new game.THREE.Mesh(geometry, material)
  this.meshAdj = new game.THREE.Mesh(geometry, material)
  this.distance = opts.distance || 10
  game.on('tick', _.throttle(this.highlight.bind(this), opts.frequency || 100))
  this.currVoxelPos // undefined when no voxel selected for highlight
  this.currVoxelAdj // undefined when no adjacent voxel selected for highlight
}

inherits(Highlighter, events.EventEmitter)

Highlighter.prototype.highlight = function () {

  var cp = this.game.cameraPosition()
  var cv = this.game.cameraVector()
  var hit = this.game.raycastVoxels(cp, cv, this.distance)

  var removeHighlight = function (self) { // remove highlight if any
    if (self) { // remove existing highlight
      self.game.scene.remove(self.mesh)
      self.emit('remove', self.currVoxelPos)
      self.currVoxelPos = undefined
    }
  }

  var removeAdjacent = function (self) { // remove adjacent highlight if any
    if (self.currVoxelAdj) {
      self.game.scene.remove(self.meshAdj)
      self.emit('remove-adjacent', self.currVoxelAdj)
      self.currVoxelAdj = undefined
    }
  }

  if (!hit) {
    removeHighlight(this)
    removeAdjacent(this)
    return
  }

  // highlight hit block
  var newVoxelPos = this.game.blockPosition(hit.position)
  if (!this.currVoxelPos || newVoxelPos[0] !== this.currVoxelPos[0] || newVoxelPos[1] !== this.currVoxelPos[1] || newVoxelPos[2] !== this.currVoxelPos[2]) { // none or moved

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

  // highlight block adjacent to hit (block placement preview) if enabled
  if (!game.controls.state.alt && !game.controls.state.firealt) { // control key
    removeAdjacent(this)
    return
  }
  var newVoxelAdj = this.game.blockPosition(hit.adjacent)
  if (!this.currVoxelAdj || newVoxelAdj[0] !== this.currVoxelAdj[0] || newVoxelAdj[1] !== this.currVoxelAdj[1] || newVoxelAdj[2] !== this.currVoxelAdj[2]) { // no highlight or it moved

    // raycast bug: adjacent above sometimes skips a block
    if (newVoxelAdj[1] - newVoxelPos[1] > 1) {
      console.log("adjacent highlight is elevated")
      newVoxelAdj[1]--
    }

    this.meshAdj.position.set(newVoxelAdj[0] + 0.5, newVoxelAdj[1] + 0.5, newVoxelAdj[2] + 0.5)

    if (this.currVoxelAdj) {
      this.emit('remove-adjacent', this.currVoxelAdj) // moved adjacent highlight
    }
    else {
      this.game.scene.add(this.meshAdj) // fresh highlight
    }
    this.emit('highlight-adjacent', newVoxelAdj)
    this.currVoxelAdj = newVoxelAdj
  }
}