# Simple Web Inspector

Simple Web Inspector is a helper tool for the application created by Unity.

Via Web Browser without Unity Editer,
possible to edit GameObject's Transform such as Position, Rotattion, Scale.

![demo](https://raw.githubusercontent.com/wiki/r01hee/SimpleWebInspector/images/demo.gif)

## Setup

1. Change **Configuration > Scripting Runtime Version** to **.NET 4.x Equivalent** in PlayerSettings.

2. Extract dev.r01.simplewebinspector-vX.X.X.zip , and then copy all contents in Assets/ directory to your projects Assets/ directory

3. Attach SimpleWebInspector/SimpleWebInspector.cs to any of the GameObject.

## Usage

Run your application, and access to **http://`IP or host of the device running your application`:8080** with Web Browser (by default, 8080 port used).

## Building

Run below commands in "WebApplicationClient" directory.

```console
yarn install
yarn run build
```

Then, Assets/StreamingAssets/SWInspector.zip is created.

## License

[MIT license](LICENSE)
