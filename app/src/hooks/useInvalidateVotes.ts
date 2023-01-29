import {useQueryClient} from "react-query"

export default function useInvalidateVotes({
  category,
  subcategory,
  timeframe,
  userId,
}: {
  category?: string
  subcategory?: string
  timeframe?: string
  userId?: string
}) {
  const queryClient = useQueryClient()

  return () =>
    queryClient.invalidateQueries({
      predicate: ({queryKey}) => {
        if (queryKey[0] !== "vote") {
          return false
        }
        const params = queryKey[1]
        if (typeof params !== "object" || params === null) {
          return true
        }
        if (
          ("creatorId" in params && params.creatorId !== userId) ||
          ("omitCreatorId" in params && params.omitCreatorId === userId) ||
          ("category" in params && params.category !== category) ||
          ("subcategory" in params && params.subcategory !== subcategory) ||
          ("timeframe" in params && params.timeframe !== timeframe)
        ) {
          return false
        }
        return true
      },
    })
}
