import { Injectable } from "@nestjs/common";
import { JwtService as NestJwt } from "@nestjs/jwt";
import { JwtPayload } from "./jwt.payload";

@Injectable()
export class JwtService {
  constructor(private jwt: NestJwt) {}

  sign(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }
}