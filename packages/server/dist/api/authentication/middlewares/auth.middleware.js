"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const middleware_jwt_1 = require("@marblejs/middleware-jwt");
const operators_1 = require("rxjs/operators");
const config_1 = require("../../../config");
const never_nullable_1 = require("../../../utils/never-nullable");
const throw_if_not_admin_1 = require("../../user/helpers/throw-if-not-admin");
const user_dao_1 = require("../../user/model/user.dao");
const jwtConfig = { secret: config_1.Config.jwt.secret };
const verifyPayload$ = (payload) => user_dao_1.UserDao.findById(payload._id).pipe(operators_1.flatMap(never_nullable_1.neverNullable), operators_1.flatMap(throw_if_not_admin_1.throwIfNotAdmin));
exports.authorize$ = middleware_jwt_1.authorize$(jwtConfig, verifyPayload$);
