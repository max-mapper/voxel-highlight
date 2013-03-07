# voxel-highlight

highlight or manipulate with the voxel that the player is currently looking at

```
npm install voxel-highlight
```

or just add to the package.json file of your voxel-engine project

## example

```javascript
var highlight = require('voxel-highlight')
var highlighter = highlight(game)
highlighter.on('highlight', function (voxelPosArray) {
  console.log('highlighted voxel: ' + voxelPosArray)
})
```
or using as constructor:
```javascript
var Highlight = require('voxel-highlight')
var highlighter = new Highlight(game)
```

### highlight(gameInstance, optionalOptions)

options can be:

```javascript
{
  frequency: how often in milliseconds to highlight, default is 100
  distance: how far in game distance things should be highlighted, default is 10
  geometry: threejs geometry to use for the highlight, default is a cubegeometry
  material: material to use with the geometry, default is a wireframe
  wireframeLinewidth: if using default material wireframe, default is 3
  wireframeOpacity: if using default material wireframe, default is 0.5
  color: highlight cube color, default is 0x000000
}
```

### highlighter.on('highlight', voxelPosArray) {})

gets called when highlighter highlights something

### highlighter.on('remove', function(voxelPosArray) {})

gets called when highlighter unhighlights something

# Get the demo running on your machine

look at [voxel-hello-world](http://github.com/maxogden/voxel-hello-world) for demo usage

## license

BSD
