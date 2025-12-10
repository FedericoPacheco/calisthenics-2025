export interface KeyValueStorePort {
    get(key: string): string | null
    set(key: string, value: any): void
    delete(key: string): void
}