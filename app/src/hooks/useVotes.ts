import {useQuery} from "react-query"

import axios from "axios"

import {Vote} from "../shared/models"

export default function useVotes(params: object) {
  /* filter falsy values out of the key */
  const voteQueryKey = Object.entries(params).reduce(
    (queryObj, [key, value]) =>
      value ? {...queryObj, [key]: value} : queryObj,
    {},
  )

  return useQuery({
    queryFn: () => fetchVotes(params),
    queryKey: ["vote", voteQueryKey],
  })
}

async function fetchVotes(params: object) {
  if (Object.values(params).filter(Boolean).length === 0) {
    return
  }

  const {data} = await axios.get<{canLoadMore?: boolean; votes: Vote[]}>(
    "/api/vote",
    {params},
  )
  return data
}
