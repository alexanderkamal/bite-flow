
export const TOKENS = {
    // Services
    AuthService: Symbol.for("AuthService"),
    UserService: Symbol.for("UserService"),
    RestaurantService: Symbol.for("RestaurantService"),
    RestaurantBranchService: Symbol.for("RestaurantBranchService"),
    MemberService: Symbol.for("MemberService"),
    ProductService: Symbol.for("ProductService"),
    CustomerAddressService: Symbol.for("CustomerAddressService"),
    PermissionCacheService: Symbol.for("PermissionCacheService"),

    // Controllers
    AuthController: Symbol.for("AuthController"),
    UserController: Symbol.for("UserController"),
    RestaurantController: Symbol.for("RestaurantController"),
    RestaurantBranchController: Symbol.for("RestaurantBranchController"),
    MemberController: Symbol.for("MemberController"),
    ProductController: Symbol.for("ProductController"),
    CustomerAddressController: Symbol.for("CustomerAddressController"),

    // Lib/infra/
    Logger: Symbol.for("Logger"),
    CacheProvider: Symbol.for("CacheProvider"),
    EmailProvider: Symbol.for("EmailProvider"),
}