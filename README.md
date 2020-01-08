# Data Pack Bundler
Bundler is a tool to bundle Minecraft data packs. It takes files from GitHub and combines them. Tags are merged correctly.
This happens completely client-side, meaning you can simply provide a link with the reference to your GitHub repository and path.

### Usage
The tool supports two parameters: `modules` and optionally `name`.
* `modules` is a list of data pack sources joined with three dots (`...`). A data pack source has the following format: `{github username}/{repository}/{path to data pack}`
* `name` is the filename of the download. If `name` is not defined, the last folder name of the first module is used.

### Examples
```
https://misode.github.io/bundler/?modules=MinecraftPhi/MinecraftPhi-modules/phi.modifyinv/src/datapack...MinecraftPhi/MinecraftPhi-modules/phi.core/src/datapack
```
```
https://misode.github.io/bundler/?modules=Gamemode4Dev/GM4_Datapacks/gm4_dangerous_dungeons...Gamemode4Dev/GM4_Datapacks/gm4_orbis...Gamemode4Dev/GM4_Datapacks/base&name=gm4_dangerous_dungeons_1.15
```
