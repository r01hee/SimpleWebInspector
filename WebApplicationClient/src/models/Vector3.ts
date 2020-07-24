export default class Vector3 {
    public static toIndex(name: string) {
        return Vector3.NAMES.indexOf(name)
    }

    public static toName(index: number) {
        return Vector3.NAMES[index]
    }

    private static readonly NAMES: string[] = ["x", "y", "z"] 

    public x!: number
    public y!: number
    public z!: number
}
