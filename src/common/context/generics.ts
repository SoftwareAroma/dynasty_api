/* 
    -------------------------------------------------------------------------------------------------------------------
    A custom generic class used as a response object for all requests that returns some sort of Http Response to the
    client
    -------------------------------------------------------------------------------------------------------------------
*/

export class CustomApiResponse<T> {
    private data: T;
    private success: boolean;

    constructor(value: T, success: boolean) {
        this.success = success;
        this.data = value;
    }

    public getData(): { data: T, success: boolean } {
        return {
            data: this.data,
            success: this.success
        };
    }

    public setData(value: T, success: boolean): void {
        this.success = success;
        this.data = value;
    }
}