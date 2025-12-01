import { StoreLayout } from '@/components/layout';
import {Collapsible, Skeleton } from '@/components/ui';

export const LoadingProfile = () =>{

    return(
        <div>
        <StoreLayout showSearch={false}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-20 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>

          {/* Informações Pessoais Skeleton */}
          <Collapsible title="Informações Pessoais" defaultOpen={true}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </Collapsible>

          {/* Endereços Skeleton */}
          <Collapsible title="Endereços">
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </Collapsible>

          {/* Pedidos Skeleton */}
          <Collapsible title="Pedidos">
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </Collapsible>
        </div>
      </StoreLayout>
        </div>
    )
}