import {useMutation} from "react-query"

import axios from "axios"

import {Candidate, Vote} from "../shared/models"

import useInvalidateVotes from "./useInvalidateVotes"

export default function useUpdateVote({
  onSuccess,
  ...params
}: {
  category?: string
  onSuccess: () => void
  subcategory?: string
  timeframe?: string
  userId?: string
}) {
  const onSettled = useInvalidateVotes(params)

  return useMutation({
    mutationFn: ({ballot, id}: {ballot: Candidate[]; id: string}) =>
      axios.put<Vote>(`/api/vote/${id}`, {
        ballot,
      }),
    mutationKey: ["vote", {type: "update"}],
    onSettled,
    onSuccess,
  })
}
