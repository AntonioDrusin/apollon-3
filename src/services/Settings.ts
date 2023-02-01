export class Settings {
    public setProp(name: string, data: Object): void {
        localStorage.setItem(name, JSON.stringify(data));
    }
    public getProp<T>(name: string): T | null {
        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
    }
}