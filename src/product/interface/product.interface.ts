
export class IProduct {
    id: string;
    name: string;
    description: string;
    price: any;
    images: string[];
    depo: string;
    category: string;
    cart?: string[];
    brand?: string;
    rating?: number;
    numReviews?: number;
    numInStock?: number;
    colors: string[];
    sizes: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
