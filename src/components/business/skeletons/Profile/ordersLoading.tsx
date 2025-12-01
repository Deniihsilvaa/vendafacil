import { Skeleton } from '@/components/ui';

export const OrdersLoading = () =>{

    return(
        <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-40" />
                  </div>
        </div>
    )
}