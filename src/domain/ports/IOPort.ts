export interface IOPort {
    read(reference?: string, minRows?: number, minCols?: number): any | any[][];
    write(data: any | any[] | any[][], reference?: string): void;

    moveReference(rowDisplacement: number, colDisplacement: number): void;
    resizeReference(newRowsCount: number, newColsCount: number): void;
}