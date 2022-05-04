import * as request from "superagent"

import TransformsElement from "../models/TransformElement"

const subpath = "";
const version = "v1";

const urls = {
    gameObjectsList: "gameObjects/list",
    gameObjectsTransforms: "gameObjects/transforms",
};

type CallbackHandler = (err: any, res: request.Response) => void;

export function getGameObjectsList(callback: CallbackHandler)
{
    const url = [subpath, 'api', version, urls.gameObjectsList].join('/');

    request.get(url).end(callback)
}

export function putGameObjectTransforms(transfroms: TransformsElement[], callback: CallbackHandler)
{
    const url = [subpath, 'api', version, urls.gameObjectsTransforms].join('/');

    request.put(url).send({transforms: transfroms}).end(callback)
}