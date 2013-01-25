var inherits = require('inherits')
var events = require('events')
var _ = require('underscore')

module.exports = function(game, opts) {
  return new Highlighter(game, opts)
}

function Highlighter(game, opts) {
  if (!opts) opts = {}
  this.opts = opts
  this.game = game
  this.game.on('tick', _.throttle(this.highlight.bind(this), this.opts.frequency || 100))
}

inherits(Highlighter, events.EventEmitter)

Highlighter.prototype.highlight = function() {
  if (this.highlight) {
    this.game.scene.remove(this.highlight)
    this.emit('remove', this.highlight)
  }
  var hit = this.game.raycast(this.opts.distance || 500)
  if (!hit) return
  var voxelVector = this.game.voxels.voxelVector(hit)
  var chunk = this.game.voxels.chunkAtPosition(hit)
  var pos = this.game.voxels.getBounds(chunk[0], chunk[1], chunk[2])[0]
  var size = game.cubeSize
  pos[0] = pos[0] * size
  pos[1] = pos[1] * size
  pos[2] = pos[2] * size
  pos[0] += voxelVector.x * size
  pos[1] += voxelVector.y * size
  pos[2] += voxelVector.z * size
  pos = new game.THREE.Vector3(pos[0] + size / 2, pos[1] + size / 2, pos[2] + size / 2)
  var geometry = this.opts.geometry || new game.THREE.CubeGeometry( size + 0.01, size + 0.01, size + 0.01 )
  var material = this.opts.material || new game.THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    wireframeLinewidth: this.opts.wireframeLinewidth || 3,
    transparent: true,
    opacity: this.opts.wireframeOpacity || 0.5
  })
  var cube = new game.THREE.Mesh(geometry, material)
  cube.position.copy(pos)
  this.highlight = cube
  this.game.scene.add(cube)
  this.emit('highlight', pos, cube)
}


