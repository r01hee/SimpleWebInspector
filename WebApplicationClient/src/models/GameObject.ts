import Vector3 from './Vector3'

export default class GameObject {
    public instanceId: number
    public name: string
    public hasParent: boolean
    public parentInstanceId: number
    public childInstanceIds: number[]
    public position: Vector3
    public localPosition: Vector3
    public rotation: Vector3
    public localRotation: Vector3
    public localScale: Vector3

    constructor(gameObject: Partial<GameObject>){
        Object.assign(this, gameObject)
    }
}
