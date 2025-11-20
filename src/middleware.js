export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/",
        "/pipeline/:path*",
        "/rfq/:path*",
        "/po/:path*",
        "/inventory/:path*",
        "/fulfillment/:path*",
        "/invoicing/:path*",
        "/contacts/:path*",
        "/hr/:path*",
        "/reports/:path*",
        "/settings/:path*",
        "/api/customers/:path*",
        "/api/invoices/:path*",
        "/api/stats/:path*"
    ],
};
