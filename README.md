# Simple Web Inspector

Simple Web Inspector is the inspector via web, that is possible to edit transform of GameObject such as position, rotation, scale.

![demo](https://raw.githubusercontent.com/wiki/r01hee/SimpleWebInspector/images/demo.gif)

## Installation via UPM
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

## Usage

1. Select **Window > SimpleWebInspector > Download WebPage StreamingAssets** in Unity menu bar, then SWInspector-StreamingAssets.zip is located in StreamingAssets/ folder
2. Attach SimpleWebInspector script to any GameObject
3. Run your application
4. Access to **http://`IP or host of the device running your application`:8080** with Web Browser (by default, 8080 port used).

## Building Web Application Client assets

Run below commands in `WebApplicationClient~ ` directory.

```console
yarn install
yarn run deploy
```

And then, `WebApplicationClient~/SWInspector-StreamingAssets.zip` is created.

## License

[MIT license](LICENSE)
