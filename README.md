# Simple Web Inspector

Simple Web Inspector is the inspector via web, that is possible to edit transform of GameObject such as position, rotation, scale even if runtime of built application.

![demo](https://raw.githubusercontent.com/wiki/r01hee/SimpleWebInspector/images/demo.gif)

## License

[MIT license](LICENSE)

## For User
### Installation via UPM
Add `https://github.com/r01hee/SimpleWebInspector.git` to Package Manager  
or Append to `Packages/manifest.json` as following
```json
{
  // ...
  "dependencies": {
    "dev.r01.simplewebinspector": "https://github.com/r01hee/SimpleWebInspector.git",
    // ...
  }
  // ...
}
```

### Usage

1. Select **Window > SimpleWebInspector > Download WebPage StreamingAssets** in Unity menu bar, then SWInspector-StreamingAssets.zip is located in StreamingAssets/ folder  
![download-webpage-streamingassets](https://raw.githubusercontent.com/wiki/r01hee/SimpleWebInspector/images/dl-streamingassets.gif)
2. Attach SimpleWebInspector script to any GameObject
3. Run your application
4. Access to **http://`IP or host of the device running your application`:8080** with Web Browser (by default, 8080 port used).

## For Developer
### Web API Reference
#### Endpoints
| Method | URL format | Description |
| ------ | ---------- | ----------- |
| GET    | /api/v1/gameObjects/list | Returns a list of all `GameObjects` in current Scene. |
| GET    | /api/v1/gameObjects/{instanceId} | Returns a `GameObject` specified with **instanceId** . |
| POST   | /api/v1/gameObjects | Create new GameObject in accordance with `NewGameObject` parameter. |
| PUT    | /api/v1/gameObjects/transforms | Modify transforms of GameObject in accordance with `Transforms` parameter. |
| DELETE | /api/v1/gameObjects/{instanceId} | Destroy a GameObject specified with **instanceId** . |

#### JSON params
##### GameObjects
| Field | Type | Description |
| ----- | ---- | ----------- |
| objects | `GameObject` | a list of `GameObject`. |
 
##### GameObject
| Field | Type | Description |
| ----- | ---- | ----------- |
| name | string | Name of the GameObject. |
| instanceId | number | ID of the GameObject. |
| hasParent | boolean | If this value is true, the GameObject has parent GameObject. If false, the GameObject has no parent. |
| parentInstanceId | number | **instanceID** of parent `GameObject`. This value is available only if **hasParent** is true. |
| childInstanceIds | number array | **instanceID**s of children `GameObject`. If the GameObject has no child, this value is empty array. |
| active | boolean | If this value is true, the GameObject is actived. If false, the GameObject is not actived. |
| position | `Vector3` | Position of the GameObject. |
| localPosition | `Vector3` | LocalPosition of the GameObject. |
| rotation | `Vector3` | Rotation of the GameObject as Euler angles. |
| localRotation | `Vector3` | LocalRotation of the GameObject as Euler angles. |
| localScale | `Vector3` | LocalScale of the GameObject. |

##### NewGameObject
| Field | Type | Description |
| ----- | ---- | ----------- |
| name | string | Name of new GameObject. |
| prefabPath | string | Specify path of a prefab in Resources if wishing to instantiate from the prefab. If specified this value, don't specify **primitiveType**. |
| primitiveType | string | Specify [PremitiveType](https://docs.unity3d.com/ja/2019.4/ScriptReference/PrimitiveType.html) name such as **"Sphere"**, **"Cube"** if wishing to create primitive object. If specified this value, don't specify **prefabPath**. |
| hasParent | boolean | If this value is true, **parentInstanceId** is treated as in available. If false, new GameObject has no parent. |
| parentInstanceId | number | Parent's instanceId of new GameObject. In case of **hasParent** is false, or not found GameObject that has this instanceId in current Scene, ignored this value. |
| instantiateInWorldSpace | boolean | When you assign a parent Object, pass true to position the new object directly in world space. Pass false to set the Object’s position relative to its new parent. |

##### Transforms
| Field | Type | Description |
| ----- | ---- | ----------- |
| transforms | `Transform` array | a list of `Transform`. |

##### Transform
| Field | Type | Description |
| ----- | ---- | ----------- |
| instanceId | number | instanceId of `GameObject`. |
| name | string | Transform element type. Specify the following: **"position"** **"localposition"** **"rotaion"** **"localrotation"** **"localscale"** |
| coordinate | string | Coordinate type. Specify the following: **"x"** **"y"** **"z"** 
| value | number | Value applying to transform. |

##### Vector3
| Field | Type | Description |
| ----- | ---- | ----------- |
| x | number | X component of the vector. |
| y | number | Y component of the vector. |
| z | number | A component of the vector. |

### Building Web Application Client assets

Run below commands in `WebApplicationClient~ ` directory.

```console
yarn install
yarn run deploy
```

And then, `WebApplicationClient~/SWInspector-StreamingAssets.zip` is created.