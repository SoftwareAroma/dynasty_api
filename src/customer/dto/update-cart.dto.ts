import {CreateCartDto} from "./create-cart.dto";
import {PartialType} from "@nestjs/swagger";


export class UpdateCartDto extends PartialType(CreateCartDto) {}
