import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from "@angular/router";

export class ReuseStrategy implements RouteReuseStrategy {
    private storedRoutes: { [ key: string ]: DetachedRouteHandle } = { };

    private cacheableRoutes: string[] = ['add-batch']; //Method for future cache implementation

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.data?.['reuse'] || false;
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
        if (handle) {
            this.storedRoutes[route.routeConfig?.path || ''] = handle;
        }
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!this.storedRoutes[route.routeConfig?.path || ''];
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return this.storedRoutes[route.routeConfig?.path || ''] || null;
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }
}
