import {useMutation} from "react-query"

import axios from "axios"

import {Vote, VoteWIP} from "../shared/models"

import useInvalidateVotes from "./useInvalidateVotes"

export default function useAddVote({
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
    mutationFn: ({vote}: {vote: VoteWIP}) =>
      axios.post<Vote>("/api/vote", vote),
    mutationKey: ["vote", {type: "add"}],
    onSettled,
    onSuccess,
  })
}
