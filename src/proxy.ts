import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard') || 
                        req.nextUrl.pathname.startsWith('/inventory') ||
                        req.nextUrl.pathname.startsWith('/scanner') ||
                        req.nextUrl.pathname.startsWith('/warranties') ||
                        req.nextUrl.pathname.startsWith('/sales') ||
                        req.nextUrl.pathname.startsWith('/receipts');
  
  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
  
  if (req.nextUrl.pathname === '/login' && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
