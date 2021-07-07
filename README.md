# GB model tools README #

### What is this repository for? ###

GB model tools is a set of functions for working with the GB 3d model format. 
The main reason for having our own format is really about control! Most 3D formats are generally designed for 3D editor tools rather than to be used directly from a runtime 3D engine. They are overly large and come with too many ways of doing things (FBX!). Though its useful to get the various formats from designers, in the end they all need to be normalized for optimum efficiency during runtime. However

 For example even if you smash a bunch of FBX models into unity, by the time you publish and run the game, the models will have all been formatted to a specific internal format designed to be optimally loaded by the unity run time. 

GB format is just that, but for Odie. A 3D format designed to be passed super quickly by its runtime. Also it is  full typescript format making it easier to work with

It has two main parts to it. 

1. Node functions that let us convert common 3D formats to the GB format tools.
* FBX -> GB conversion
* GLTF -> GB conversion
* OBJ -> GB conversion

2. GB functions for optimizing a model or scene. They can be run in both the browser and node
    - merging models into a single giant model still letting them be rendered individually (This is what a GBPrimitiveFrag is)
    - flattening a model merges all models into a single mesh from a scene.
    - deduping models by removing geometry that exactly the same and using a single instance.

2. Compression and decompression of a GBObject. We use quantization and a pako compression to squish a GB model format down to a binary format. Both work on browser and node.


FBX are converted to Gltf using `fbx2gltf` an awesome lib created by facebook. We then convert the gltf to the gb format


### How do I get set up? ###

Install: `npm i @goodboydigital/gb-model-tools`
Develop: `npm start`
Build: `npm run prod`
Build Docs: `npm run docs`
Run Tests: `npm run test`

### Contribution guidelines ###

* Any new features added to this project should be accompanied by relevant tests to ensure the new feature is working correctly or the fixed bug is actually.. fixed!
* Tests are using `jest`

### Who do I talk to? ###

* Talk to mat groves - mat@goodboydigital.com if you get stuck working with this!