# voxel-highlight

highlight or manipulate with the voxel that the player is currently looking at

```
npm install voxel-highlight
```

## example

```javascript
var highlight = require('voxel-highlight')
highlight(game)
```

### highlight(gameInstance, optionalOptions)

options can be:

```javascript
{
  frequency: how often in milliseconds to highlight, default is 100
  distance: how far in game distance things should be highlighted, default is 500
  geometry: threejs geometry to use for the highlight, default is a cubegeometry
  material: material to use with the geometry, default is a wireframe
  wireframeLinewidth: if using default wireframe, default is 3
  wireframeOpacity: if using default wireframe, default is 0.5
}
```

### highlight.on('highlight', function(position, mesh) {})

gets called when highlighter highlights something

### highlight.on('remove', function(mesh) {})

gets called when highlighter unhighlights something. mesh also has a `.position`

# Get the demo running on your machine

The first time you set up, you should install the required npm packages:

```
cd voxel-highlight
npm install
npm install browserify -g
```

Then run the start script (which you'll need to do every time you want to run the demo):

```
npm start
```

Then point your browser to [http://localhost:8080](http://localhost:8080) and have fun!

If you get stuck then look at the [readme for voxel-hello-world](http://github.com/maxogden/voxel-hello-world)

## license

BSD
