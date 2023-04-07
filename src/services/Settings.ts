export class Settings {
    public setProp(name: string, data: Object | null): void {
        localStorage.setItem(name, data ? JSON.stringify(data) : "");

    }
    public getProp<T>(name: string): T | undefined {
        const item = localStorage.getItem(name);
        try {
            return item && item !== "" ? JSON.parse(item) : null;
        }
        catch (e) {
            return undefined;
        }
    }
}