import GameObject from './GameObject'

export default class GameObjectItem extends GameObject {
    public expanded: boolean

    constructor(gameObject: GameObject) {
        super(gameObject);
        this.expanded = false;
    }

    public AssignTransform(gameObject: GameObject): void
    {
        Object.assign(this, {
            localPosition: gameObject.localPosition,
            localRotation: gameObject.localRotation,
            localScale: gameObject.localScale,
            position: gameObject.position,
            rotation: gameObject.rotation,
        })
    }

    public MakeMerged(gameObject: GameObject): GameObjectItem
    {
        const merged = new GameObjectItem(gameObject);
        merged.expanded = this.expanded;

        return merged;
    }
}